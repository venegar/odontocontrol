-- ==============================================================================
-- MIGRACIÓN: ESTADOS DE CITA, CONFIRMACIÓN Y CANCELACIÓN EN VIVO
-- Consultorio Odontológico Dra. Yasmín Blanco (OdontoControl)
-- ==============================================================================

-- 1. SOPORTE DE ESTADO 'pendiente' EN EL ENUM DE CITAS
-- ------------------------------------------------------------------------------
-- Permite que las citas agendadas o solicitadas se mantengan como 'pendiente'
-- hasta que el paciente las confirme (vía WhatsApp o Portal) o la recepcionista
-- las confirme manualmente.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type typ
    JOIN pg_enum enu ON enu.enumtypid = typ.oid
    WHERE typ.typname = 'estado_cita' AND enu.enumlabel = 'pendiente'
  ) THEN
    ALTER TYPE estado_cita ADD VALUE 'pendiente';
  END IF;
END $$;

-- 2. FUNCIÓN RPC PARA CONFIRMAR CITA (PACIENTE O RECEPCIÓN)
-- ------------------------------------------------------------------------------
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

-- 3. FUNCIÓN RPC PARA CANCELAR CITA (PACIENTE DESDE WHATSAPP O PORTAL)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cancelar_cita_portal(
  p_cita_id uuid,
  p_motivo text DEFAULT 'Cancelada por el paciente vía autogestión WhatsApp'
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
