import { NextResponse } from 'next/server';
import { procesarVencimientosDiarios } from '@/modules/inventario/actions';

/**
 * Endpoint para ejecución automática diaria (Cron Job) del control de vencimientos.
 * Pasa a VENCIDO los lotes expirados (fecha_vencimiento < hoy) y traslada el stock a insumos_vencidos.
 * Nunca realiza DELETE.
 */
export async function GET() {
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
