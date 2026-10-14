-- ==============================================================================
-- MIGRACIÓN: SOLICITUD PÚBLICA DE CITAS Y GESTIÓN CON RLS
-- Consultorio Odontológico Virtual (DentisCare)
-- ==============================================================================

-- 1. ADAPTACIONES EN ESQUEMA PARA AGENDAMIENTO PÚBLICO
-- ------------------------------------------------------------------------------
-- Se flexibiliza fecha_nacimiento para permitir solicitudes de nuevos pacientes
-- que aún no han diligenciado su ficha clínica completa.
ALTER TABLE public.pacientes 
  ALTER COLUMN fecha_nacimiento DROP NOT NULL;

ALTER TABLE public.pacientes 
  ALTER COLUMN fecha_nacimiento SET DEFAULT '2000-01-01'::date;

-- Para citas en estado 'solicitada' desde la web pública, el odontólogo puede
-- estar pendiente de asignación definitiva por la recepción.
ALTER TABLE public.citas 
  ALTER COLUMN odontologo_id DROP NOT NULL;

-- 2. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
-- Permitir que tanto anónimos (anon) como autenticados puedan insertar citas
-- SI Y SOLO SI el estado es estrictamente 'solicitada'.
DROP POLICY IF EXISTS "Permitir solicitud de citas publicas" ON public.citas;
CREATE POLICY "Permitir solicitud de citas publicas"
  ON public.citas FOR INSERT
  TO anon, authenticated
  WITH CHECK (estado = 'solicitada');

-- Garantizar lectura pública del catálogo de tratamientos para el formulario web
DROP POLICY IF EXISTS "Catalogo tratamientos visible publicamente" ON public.tratamientos_catalogo;
CREATE POLICY "Catalogo tratamientos visible publicamente"
  ON public.tratamientos_catalogo FOR SELECT
  TO anon, authenticated
  USING (activo = true);

-- 3. FUNCIÓN RPC SECURITY DEFINER: SOLICITAR CITA PÚBLICA
-- ------------------------------------------------------------------------------
-- Esta función corre con privilegios elevados controlados para:
-- a) Buscar o registrar al paciente por su número de documento sin exponer datos
--    de otros pacientes al rol anónimo (mantiene privacidad médica estricta).
-- b) Enlazar el tratamiento seleccionado según el catálogo activo.
-- c) Crear la cita en estado 'solicitada' para revisión del equipo clínico.
CREATE OR REPLACE FUNCTION public.solicitar_cita_publica(
  p_nombres text,
  p_apellidos text,
  p_tipo_documento text,
  p_numero_documento text,
  p_telefono text,
  p_email text DEFAULT NULL,
  p_fecha date DEFAULT NULL,
  p_hora_inicio time DEFAULT NULL,
  p_motivo text DEFAULT 'Solicitud de valoración odontológica',
  p_tratamiento_nombre text DEFAULT NULL,
  p_especialista_nombre text DEFAULT NULL,
  p_fecha_nacimiento date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_tipo_doc tipo_documento;
  v_paciente_id uuid;
  v_tratamiento_id uuid := NULL;
  v_duracion_minutos integer := 30;
  v_odontologo_id uuid := NULL;
  v_hora_fin time;
  v_cita_id uuid;
  v_tipo_limpio text;
  v_motivo_completo text;
  v_notas text;
BEGIN
  -- Validaciones básicas de integridad
  IF p_nombres IS NULL OR trim(p_nombres) = '' THEN
    RAISE EXCEPTION 'El nombre del paciente es obligatorio';
  END IF;

  IF p_apellidos IS NULL OR trim(p_apellidos) = '' THEN
    RAISE EXCEPTION 'Los apellidos del paciente son obligatorios';
  END IF;

  IF p_numero_documento IS NULL OR trim(p_numero_documento) = '' THEN
    RAISE EXCEPTION 'El número de documento de identidad es obligatorio';
  END IF;

  IF p_telefono IS NULL OR trim(p_telefono) = '' THEN
    RAISE EXCEPTION 'El número telefónico o WhatsApp es obligatorio';
  END IF;

  IF p_fecha IS NULL THEN
    RAISE EXCEPTION 'La fecha de la cita es obligatoria';
  END IF;

  IF p_hora_inicio IS NULL THEN
    RAISE EXCEPTION 'La hora de inicio de la cita es obligatoria';
  END IF;

  -- Normalización del tipo de documento según enum 'tipo_documento'
  v_tipo_limpio := upper(trim(COALESCE(p_tipo_documento, 'CC')));
  IF v_tipo_limpio IN ('CC', 'TI', 'CE', 'PASAPORTE', 'OTRO') THEN
    v_tipo_doc := v_tipo_limpio::tipo_documento;
  ELSE
    v_tipo_doc := 'CC'::tipo_documento;
  END IF;

  -- 1. Buscar si el paciente ya se encuentra registrado por su documento
  SELECT id INTO v_paciente_id
  FROM public.pacientes
  WHERE numero_documento = trim(p_numero_documento)
  LIMIT 1;

  IF v_paciente_id IS NOT NULL THEN
    -- Actualizar datos de contacto recientes
    UPDATE public.pacientes
    SET nombres = trim(p_nombres),
        apellidos = trim(p_apellidos),
        telefono = trim(p_telefono),
        email = COALESCE(NULLIF(trim(p_email), ''), email),
        tipo_documento = v_tipo_doc,
        actualizado_en = timezone('utc'::text, now())
    WHERE id = v_paciente_id;
  ELSE
    -- Registrar nuevo paciente
    INSERT INTO public.pacientes (
      tipo_documento,
      numero_documento,
      nombres,
      apellidos,
      telefono,
      email,
      fecha_nacimiento
    ) VALUES (
      v_tipo_doc,
      trim(p_numero_documento),
      trim(p_nombres),
      trim(p_apellidos),
      trim(p_telefono),
      NULLIF(trim(p_email), ''),
      COALESCE(p_fecha_nacimiento, '2000-01-01'::date)
    )
    RETURNING id INTO v_paciente_id;
  END IF;

  -- 2. Resolver Tratamiento desde el catálogo
  IF p_tratamiento_nombre IS NOT NULL AND trim(p_tratamiento_nombre) <> '' THEN
    SELECT id, duracion_estimada_minutos
    INTO v_tratamiento_id, v_duracion_minutos
    FROM public.tratamientos_catalogo
    WHERE activo = true
      AND (
        lower(nombre) = lower(trim(p_tratamiento_nombre))
        OR nombre ILIKE '%' || trim(p_tratamiento_nombre) || '%'
      )
    ORDER BY (lower(nombre) = lower(trim(p_tratamiento_nombre))) DESC
    LIMIT 1;
  END IF;

  IF v_duracion_minutos IS NULL OR v_duracion_minutos <= 0 THEN
    v_duracion_minutos := 30;
  END IF;

  -- Cálculo de hora_fin con base en la duración estimada del tratamiento
  v_hora_fin := p_hora_inicio + (v_duracion_minutos || ' minutes')::interval;

  -- 3. Resolver Odontólogo si el paciente eligió preferencia
  IF p_especialista_nombre IS NOT NULL 
     AND trim(p_especialista_nombre) <> '' 
     AND p_especialista_nombre NOT ILIKE '%Cualquier%' THEN
    SELECT id INTO v_odontologo_id
    FROM public.perfiles
    WHERE activo = true
      AND rol IN ('odontologo', 'admin')
      AND (
        p_especialista_nombre ILIKE '%' || nombres || '%'
        OR p_especialista_nombre ILIKE '%' || apellidos || '%'
      )
    LIMIT 1;
  END IF;

  -- Si no se encontró específico, intentar vincular al primer odontólogo activo disponible
  IF v_odontologo_id IS NULL THEN
    SELECT id INTO v_odontologo_id
    FROM public.perfiles
    WHERE activo = true AND rol = 'odontologo'
    ORDER BY creado_en ASC
    LIMIT 1;
  END IF;

  -- 4. Preparación de notas y motivo
  v_motivo_completo := COALESCE(NULLIF(trim(p_motivo), ''), 'Solicitud de valoración general desde sitio web');
  v_notas := 'Solicitud web pública.';
  IF p_especialista_nombre IS NOT NULL AND trim(p_especialista_nombre) <> '' THEN
    v_notas := v_notas || ' Especialista de preferencia: ' || trim(p_especialista_nombre) || '.';
  END IF;
  IF p_tratamiento_nombre IS NOT NULL AND trim(p_tratamiento_nombre) <> '' THEN
    v_notas := v_notas || ' Tratamiento solicitado: ' || trim(p_tratamiento_nombre) || '.';
  END IF;

  -- 5. Crear la cita con estado OBLIGATORIO 'solicitada'
  INSERT INTO public.citas (
    paciente_id,
    odontologo_id,
    tratamiento_id,
    fecha,
    hora_inicio,
    hora_fin,
    motivo,
    estado,
    notas
  ) VALUES (
    v_paciente_id,
    v_odontologo_id,
    v_tratamiento_id,
    p_fecha,
    p_hora_inicio,
    v_hora_fin,
    v_motivo_completo,
    'solicitada',
    v_notas
  )
  RETURNING id INTO v_cita_id;

  -- 6. Respuesta estructurada
  RETURN jsonb_build_object(
    'exito', true,
    'cita_id', v_cita_id,
    'paciente_id', v_paciente_id,
    'estado', 'solicitada',
    'fecha', p_fecha,
    'hora_inicio', to_char(p_hora_inicio, 'HH24:MI'),
    'hora_fin', to_char(v_hora_fin, 'HH24:MI'),
    'mensaje', 'Solicitud de cita radicada correctamente en estado solicitada'
  );
END;
$$;

-- 4. FUNCIONES DE GESTIÓN PARA RECEPCIÓN Y ODONTÓLOGOS
-- ------------------------------------------------------------------------------
-- Función para que recepción o doctor aprueben una cita
CREATE OR REPLACE FUNCTION public.aprobar_cita_solicitada(
  p_cita_id uuid,
  p_aprobado_por uuid DEFAULT NULL,
  p_odontologo_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_cita record;
BEGIN
  SELECT * INTO v_cita FROM public.citas WHERE id = p_cita_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('exito', false, 'mensaje', 'Cita no encontrada');
  END IF;

  UPDATE public.citas
  SET estado = 'confirmada',
      aprobado_por = COALESCE(p_aprobado_por, auth.uid()),
      aprobado_en = timezone('utc'::text, now()),
      odontologo_id = COALESCE(p_odontologo_id, odontologo_id),
      actualizado_en = timezone('utc'::text, now())
  WHERE id = p_cita_id;

  RETURN jsonb_build_object(
    'exito', true,
    'cita_id', p_cita_id,
    'estado', 'confirmada',
    'mensaje', 'La cita fue aprobada y confirmada con éxito'
  );
END;
$$;

-- Función para rechazar o cancelar una solicitud con motivo
CREATE OR REPLACE FUNCTION public.rechazar_cita_solicitada(
  p_cita_id uuid,
  p_motivo text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_motivo IS NULL OR trim(p_motivo) = '' THEN
    RAISE EXCEPTION 'Debe especificarse el motivo del rechazo';
  END IF;

  UPDATE public.citas
  SET estado = 'rechazada',
      motivo_rechazo_cancelacion = trim(p_motivo),
      actualizado_en = timezone('utc'::text, now())
  WHERE id = p_cita_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('exito', false, 'mensaje', 'Cita no encontrada');
  END IF;

  RETURN jsonb_build_object(
    'exito', true,
    'cita_id', p_cita_id,
    'estado', 'rechazada',
    'mensaje', 'La solicitud de cita ha sido rechazada'
  );
END;
$$;

-- 5. CONCESIÓN DE PRIVILEGIOS DE EJECUCIÓN
-- ------------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.solicitar_cita_publica TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.aprobar_cita_solicitada TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rechazar_cita_solicitada TO authenticated, service_role;
GRANT SELECT ON public.tratamientos_catalogo TO anon, authenticated;
