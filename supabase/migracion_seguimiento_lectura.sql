-- ==============================================================================
-- MIGRACIÓN: SEGUIMIENTO DE LECTURA Y VISUALIZACIÓN DE RECORDATORIOS
-- Consultorio Odontológico Dra. Yasmín Blanco (OdontoControl)
-- ==============================================================================

-- 1. Agregar columnas a la tabla public.citas para rastrear envíos y lecturas
ALTER TABLE public.citas 
  ADD COLUMN IF NOT EXISTS recordatorio_enviado_en timestamptz,
  ADD COLUMN IF NOT EXISTS recordatorio_canal text,
  ADD COLUMN IF NOT EXISTS recordatorio_visto_en timestamptz,
  ADD COLUMN IF NOT EXISTS recordatorio_canal_visto text;

-- 2. Asegurar columnas en public.recordatorios
ALTER TABLE public.recordatorios
  ADD COLUMN IF NOT EXISTS visto_en timestamptz,
  ADD COLUMN IF NOT EXISTS canal_visto text;

-- 3. FUNCIÓN RPC SECURITY DEFINER PARA MARCAR RECORDATORIO COMO VISTO / LEÍDO
CREATE OR REPLACE FUNCTION public.marcar_cita_vista(
  p_cita_id uuid,
  p_canal text DEFAULT 'whatsapp'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ahora timestamptz := timezone('utc'::text, now());
BEGIN
  -- Actualizar tabla citas
  UPDATE public.citas
  SET 
    recordatorio_visto_en = coalesce(recordatorio_visto_en, v_ahora),
    recordatorio_canal_visto = coalesce(p_canal, recordatorio_canal_visto, 'whatsapp'),
    actualizado_en = v_ahora,
    notas = CASE 
      WHEN notas IS NULL THEN '[VISTO_' || upper(p_canal) || ': ' || to_char(v_ahora, 'YYYY-MM-DD HH24:MI:SS') || ' UTC]'
      WHEN notas NOT LIKE '%[VISTO_%' THEN notas || ' [VISTO_' || upper(p_canal) || ': ' || to_char(v_ahora, 'YYYY-MM-DD HH24:MI:SS') || ' UTC]'
      ELSE notas
    END
  WHERE id = p_cita_id;

  -- Actualizar último registro en public.recordatorios si existe
  UPDATE public.recordatorios
  SET 
    visto_en = coalesce(visto_en, v_ahora),
    canal_visto = coalesce(canal_visto, p_canal)
  WHERE cita_id = p_cita_id
    AND id = (
      SELECT id FROM public.recordatorios 
      WHERE cita_id = p_cita_id 
      ORDER BY creado_en DESC 
      LIMIT 1
    );

  RETURN jsonb_build_object(
    'exito', true,
    'cita_id', p_cita_id,
    'canal', p_canal,
    'visto_en', v_ahora,
    'mensaje', 'Recordatorio marcado como visto exitosamente'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'exito', false,
    'error', SQLERRM
  );
END;
$$;

-- 4. FUNCIÓN RPC SECURITY DEFINER PARA REGISTRAR ENVÍO DE RECORDATORIO
CREATE OR REPLACE FUNCTION public.registrar_envio_notificacion(
  p_cita_id uuid,
  p_canal text,
  p_destinatario text,
  p_mensaje text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ahora timestamptz := timezone('utc'::text, now());
  v_rec_id uuid;
BEGIN
  -- Actualizar estado en citas
  UPDATE public.citas
  SET 
    recordatorio_enviado_en = v_ahora,
    recordatorio_canal = p_canal,
    actualizado_en = v_ahora
  WHERE id = p_cita_id;

  -- Insertar en la tabla recordatorios
  INSERT INTO public.recordatorios (
    cita_id,
    tipo,
    destinatario,
    mensaje,
    programado_para,
    estado,
    enviado_en
  ) VALUES (
    p_cita_id,
    p_canal,
    p_destinatario,
    p_mensaje,
    v_ahora,
    'enviado',
    v_ahora
  ) RETURNING id INTO v_rec_id;

  RETURN jsonb_build_object(
    'exito', true,
    'cita_id', p_cita_id,
    'recordatorio_id', v_rec_id,
    'enviado_en', v_ahora
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'exito', false,
    'error', SQLERRM
  );
END;
$$;

-- 5. ACTUALIZAR FUNCIÓN obtener_citas_gestion PARA RETORNAR ESTADO DE RECORDATORIOS Y LECTURA
CREATE OR REPLACE FUNCTION public.obtener_citas_gestion()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_resultado jsonb;
BEGIN
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'id', c.id,
      'fecha', c.fecha,
      'hora_inicio', to_char(c.hora_inicio, 'HH12:MI AM'),
      'hora_fin', to_char(c.hora_fin, 'HH12:MI AM'),
      'estado', c.estado,
      'motivo', c.motivo,
      'es_reagendamiento', coalesce(c.es_reagendamiento, false),
      'motivo_rechazo_cancelacion', c.motivo_rechazo_cancelacion,
      'notas', c.notas,
      'recordatorio_enviado_en', c.recordatorio_enviado_en,
      'recordatorio_canal', c.recordatorio_canal,
      'recordatorio_visto_en', c.recordatorio_visto_en,
      'recordatorio_canal_visto', c.recordatorio_canal_visto,
      'paciente_id', p.id,
      'paciente_nombre', trim(p.nombres || ' ' || p.apellidos),
      'paciente_documento', p.numero_documento,
      'paciente_telefono', p.telefono,
      'paciente_email', coalesce(p.email, ''),
      'tratamiento_nombre', coalesce(t.nombre, 'Valoración Odontológica Inicial'),
      'doctor_nombre', coalesce(trim('Dr(a). ' || perf.nombres || ' ' || perf.apellidos), 'Dra. Yasmín Blanco')
    ) ORDER BY c.fecha ASC, c.hora_inicio ASC
  ), '[]'::jsonb)
  INTO v_resultado
  FROM public.citas c
  JOIN public.pacientes p ON p.id = c.paciente_id
  LEFT JOIN public.tratamientos_catalogo t ON t.id = c.tratamiento_id
  LEFT JOIN public.perfiles perf ON perf.id = c.odontologo_id;

  RETURN v_resultado;
END;
$$;

-- 6. PERMISOS DE EJECUCIÓN
GRANT EXECUTE ON FUNCTION public.marcar_cita_vista TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.registrar_envio_notificacion TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.obtener_citas_gestion TO anon, authenticated, service_role;
