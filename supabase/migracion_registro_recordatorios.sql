-- ==============================================================================
-- MIGRACIÓN: REGISTRO Y SEGUIMIENTO DE RECORDATORIOS NOTIFICADOS
-- Consultorio Odontológico Dra. Yasmín Blanco (OdontoControl)
-- ==============================================================================

-- 1. Asegurar tabla de recordatorios si no existe
CREATE TABLE IF NOT EXISTS public.recordatorios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cita_id uuid NOT NULL REFERENCES public.citas(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('whatsapp', 'email', 'sms')),
  destinatario text NOT NULL,
  mensaje text NOT NULL,
  programado_para timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'enviado', 'fallido')),
  enviado_en timestamptz,
  error_detalle text,
  creado_en timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en recordatorios
ALTER TABLE public.recordatorios ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción de recordatorios enviados por la clínica
DROP POLICY IF EXISTS "Permitir insercion de recordatorios" ON public.recordatorios;
CREATE POLICY "Permitir insercion de recordatorios" ON public.recordatorios
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Política para lectura de recordatorios
DROP POLICY IF EXISTS "Permitir lectura de recordatorios" ON public.recordatorios;
CREATE POLICY "Permitir lectura de recordatorios" ON public.recordatorios
  FOR SELECT TO anon, authenticated
  USING (true);

-- 2. FUNCIÓN RPC PARA REGISTRAR RECORDATORIO Y ACTUALIZAR CITA
CREATE OR REPLACE FUNCTION public.registrar_notificacion_cita(
  p_cita_id uuid,
  p_tipo text,
  p_destinatario text,
  p_mensaje text,
  p_estado text DEFAULT 'enviado',
  p_error text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_rec_id uuid;
BEGIN
  -- Insertar registro del recordatorio
  INSERT INTO public.recordatorios (
    cita_id,
    tipo,
    destinatario,
    mensaje,
    programado_para,
    estado,
    enviado_en,
    error_detalle
  ) VALUES (
    p_cita_id,
    p_tipo,
    p_destinatario,
    p_mensaje,
    timezone('utc'::text, now()),
    p_estado,
    CASE WHEN p_estado = 'enviado' THEN timezone('utc'::text, now()) ELSE NULL END,
    p_error
  ) RETURNING id INTO v_rec_id;

  -- Actualizar fecha de actualización de la cita
  UPDATE public.citas
  SET actualizado_en = timezone('utc'::text, now())
  WHERE id = p_cita_id;

  RETURN jsonb_build_object(
    'exito', true,
    'recordatorio_id', v_rec_id,
    'cita_id', p_cita_id,
    'mensaje', 'Recordatorio registrado con éxito'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'exito', false,
    'error', SQLERRM
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.registrar_notificacion_cita TO anon, authenticated, service_role;
