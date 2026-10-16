import { NextRequest, NextResponse } from 'next/server';
import { procesarVencimientosDiarios } from '@/modules/inventario/actions';

/**
 * Endpoint protegido para ejecución automática diaria (Cron Job) del control de vencimientos.
 * Requiere la cabecera 'Authorization: Bearer <CRON_SECRET>' configurada en Vercel.
 * Zona horaria de referencia: America/Bogota (UTC-5).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Validación estricta del secreto del cron para prevenir ejecuciones no autorizadas
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'No autorizado: Cabecera Authorization Bearer inválida o ausente' },
      { status: 401 }
    );
  }

  try {
    const resultado = await procesarVencimientosDiarios();
    return NextResponse.json(
      {
        ejecutado: true,
        fecha: new Date().toISOString(),
        ...resultado,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido al procesar vencimientos';
    return NextResponse.json(
      {
        ejecutado: false,
        error: mensaje,
      },
      { status: 500 }
    );
  }
}
