import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { marcarCitaVistaAction } from '@/modules/recordatorios/actions';

interface RouteContext {
  params: Promise<{
    accion: string;
    citaId: string;
  }>;
}

/**
 * Route Handler para enlaces cortos directos de autogestión de citas desde WhatsApp.
 * URLs:
 * - /c/confirmar/[citaId] -> Confirma la cita en Supabase y abre el portal confirmada.
 * - /c/cancelar/[citaId]  -> Cancela la cita en Supabase y abre el portal con confirmación.
 * - /c/reagendar/[citaId] -> Abre el portal directamente en el modal de reagendamiento.
 * - /c/ver/[citaId]       -> Abre el portal con los detalles de la cita.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { accion, citaId } = await context.params;
  const origin = request.nextUrl.origin || 'https://odontocontrol-ashen.vercel.app';

  if (!citaId) {
    return NextResponse.redirect(`${origin}/portal-paciente`, 307);
  }

  // 1. Registrar lectura de WhatsApp
  try {
    await marcarCitaVistaAction(citaId, 'whatsapp');
  } catch (err) {
    console.warn('Error al marcar cita vista en shortlink:', err);
  }

  // 2. Ejecutar acción según la opción seleccionada por el paciente
  if (accion === 'confirmar') {
    try {
      await supabase.rpc('confirmar_cita_portal', { p_cita_id: citaId });
      await supabase.from('citas').update({
        estado: 'confirmada',
        aprobado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString(),
      }).eq('id', citaId);
    } catch (err) {
      console.warn('Error confirmando cita en shortlink:', err);
    }

    return NextResponse.redirect(`${origin}/portal-paciente?citaId=${encodeURIComponent(citaId)}&accion=confirmar&exito=true`, 307);
  }

  if (accion === 'cancelar') {
    try {
      await supabase.rpc('cancelar_cita_portal', { 
        p_cita_id: citaId,
        p_motivo: 'Cancelada por el paciente vía enlace de WhatsApp'
      });
      await supabase.from('citas').update({
        estado: 'cancelada',
        motivo_rechazo_cancelacion: 'Cancelada por el paciente vía WhatsApp',
        actualizado_en: new Date().toISOString(),
      }).eq('id', citaId);
    } catch (err) {
      console.warn('Error cancelando cita en shortlink:', err);
    }

    return NextResponse.redirect(`${origin}/portal-paciente?citaId=${encodeURIComponent(citaId)}&accion=cancelar&exito=true`, 307);
  }

  if (accion === 'reagendar') {
    return NextResponse.redirect(`${origin}/portal-paciente?citaId=${encodeURIComponent(citaId)}&accion=reagendar`, 307);
  }

  // Por defecto, ver detalles de la cita
  return NextResponse.redirect(`${origin}/portal-paciente?citaId=${encodeURIComponent(citaId)}`, 307);
}
