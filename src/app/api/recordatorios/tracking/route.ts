import { NextRequest, NextResponse } from 'next/server';
import { marcarCitaVistaAction } from '@/modules/recordatorios/actions';

// GIF transparente 1x1 de 43 bytes para tracking de píxel en correos electrónicos
const GIF_TRANSPARENTE_1X1 = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

/**
 * Route Handler para rastreo de apertura y lectura de recordatorios (WhatsApp y Correo Electrónico).
 * 
 * Funcionalidad:
 * 1. Canal Email (Píxel transparente):
 *    Cuando el cliente de correo carga la imagen, registra la lectura y retorna el GIF 1x1 sin caché.
 * 2. Canal WhatsApp o Clics de Enlace:
 *    Registra la visualización y redirige de inmediato al Portal del Paciente con los parámetros correspondientes.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const citaId = searchParams.get('citaId');
  const canal = searchParams.get('canal') || 'whatsapp';
  const accion = searchParams.get('accion');

  // Registrar la lectura en Supabase si se proporciona un ID de cita
  if (citaId && citaId.trim() !== '') {
    try {
      await marcarCitaVistaAction(
        citaId, 
        canal === 'email' ? 'email' : 'whatsapp'
      );
    } catch (err) {
      console.warn('Error registrando lectura de recordatorio en tracking endpoint:', err);
    }
  }

  // Caso 1: Píxel de apertura de correo electrónico (solicitud de imagen pura sin acción de redirección)
  if (canal === 'email' && !accion) {
    return new NextResponse(GIF_TRANSPARENTE_1X1, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Content-Length': GIF_TRANSPARENTE_1X1.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }

  // Caso 2: Clic desde WhatsApp o botón de correo -> Redirigir al Portal del Paciente
  const origin = request.nextUrl.origin || 'https://odontocontrol-ashen.vercel.app';
  const paramsDestino = new URLSearchParams();
  if (citaId) paramsDestino.set('citaId', citaId);
  if (accion) paramsDestino.set('accion', accion);
  paramsDestino.set('visto', 'ok');

  const urlDestino = `${origin}/portal-paciente?${paramsDestino.toString()}`;
  return NextResponse.redirect(urlDestino, 307);
}
