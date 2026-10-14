-- ==============================================================================
-- MIGRACIÓN: GESTIÓN DE CITAS Y RECORDATORIOS EN TIEMPO REAL
-- Consultorio Odontológico Dra. Yasmín Blanco (OdontoControl)
-- ==============================================================================

-- 1. FUNCIÓN PARA OBTENER TODAS LAS CITAS CON DATOS DEL PACIENTE PARA DASHBOARD Y RECORDATORIOS
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

-- 2. FUNCIÓN PARA CONFIRMAR CITA DESDE RECORDATORIO / PORTAL
CREATE OR REPLACE FUNCTION public.confirmar_cita_portal(p_cita_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.citas
  SET estado = 'confirmada',
      actualizado_en = timezone('utc'::text, now())
  WHERE id = p_cita_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('exito', false, 'mensaje', 'Cita no encontrada');
  END IF;

  RETURN jsonb_build_object(
    'exito', true,
    'cita_id', p_cita_id,
    'estado', 'confirmada',
    'mensaje', 'Tu cita ha sido confirmada con éxito. ¡Te esperamos!'
  );
END;
$$;

-- 3. FUNCIÓN PARA CANCELAR CITA DESDE RECORDATORIO / PORTAL
CREATE OR REPLACE FUNCTION public.cancelar_cita_portal(
  p_cita_id uuid,
  p_motivo text DEFAULT 'Cancelada por el paciente desde el recordatorio'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.citas
  SET estado = 'cancelada',
      motivo_rechazo_cancelacion = coalesce(nullif(trim(p_motivo), ''), 'Cancelada por el paciente'),
      actualizado_en = timezone('utc'::text, now())
  WHERE id = p_cita_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('exito', false, 'mensaje', 'Cita no encontrada');
  END IF;

  RETURN jsonb_build_object(
    'exito', true,
    'cita_id', p_cita_id,
    'estado', 'cancelada',
    'mensaje', 'La cita ha sido cancelada correctamente.'
  );
END;
$$;

-- 4. FUNCIÓN PARA REAGENDAR CITA DESDE RECORDATORIO / PORTAL
CREATE OR REPLACE FUNCTION public.reagendar_cita_portal(
  p_cita_id uuid,
  p_nueva_fecha date,
  p_nueva_hora time,
  p_motivo text DEFAULT 'Reagendamiento solicitado por el paciente'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.citas
  SET fecha = p_nueva_fecha,
      hora_inicio = p_nueva_hora,
      hora_fin = p_nueva_hora + interval '30 minutes',
      estado = 'solicitada',
      es_reagendamiento = true,
      motivo = coalesce(nullif(trim(p_motivo), ''), 'Reagendamiento solicitado por el paciente'),
      actualizado_en = timezone('utc'::text, now())
  WHERE id = p_cita_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('exito', false, 'mensaje', 'Cita no encontrada');
  END IF;

  RETURN jsonb_build_object(
    'exito', true,
    'cita_id', p_cita_id,
    'estado', 'solicitada',
    'mensaje', 'Tu solicitud de reagendamiento ha sido enviada con éxito. Será revisada por el consultorio.'
  );
END;
$$;

-- 5. CONCESIÓN DE PERMISOS
GRANT EXECUTE ON FUNCTION public.obtener_citas_gestion TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.confirmar_cita_portal TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.cancelar_cita_portal TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reagendar_cita_portal TO anon, authenticated, service_role;
