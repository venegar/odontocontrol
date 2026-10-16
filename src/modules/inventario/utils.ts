/**
 * Utilidades y algoritmos de semaforización y FEFO para el inventario odontológico.
 * Consultorio Odontológico Virtual
 */

import { 
  ColorSemaforo, 
  ResultadoSemaforo, 
  UMBRAL_SEMAFORO_ROJO_DIAS, 
  UMBRAL_SEMAFORO_AMARILLO_DIAS, 
  LoteConInsumo 
} from './types';

/**
 * Normaliza una fecha a medianoche (00:00:00.000) en tiempo local
 * para realizar cálculos de diferencia de días exactos y sin desfasajes de horas.
 */
function normalizarFechaAMedianoche(fecha: string | Date): Date {
  if (typeof fecha === 'string') {
    // Si viene en formato YYYY-MM-DD
    const partes = fecha.split('T')[0].split('-');
    if (partes.length === 3) {
      const anio = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const dia = parseInt(partes[2], 10);
      return new Date(anio, mes, dia, 0, 0, 0, 0);
    }
    const d = new Date(fecha);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  }
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 0, 0, 0, 0);
}

/**
 * Función pura que calcula la semaforización de un lote según su fecha de vencimiento.
 *
 * Criterios de semaforización clínica:
 * - 🔴 Rojo: Vencido o con vencimiento en <= 30 días.
 * - 🟡 Amarillo: Vencimiento entre 31 y 90 días.
 * - 🟢 Verde: Vencimiento mayor a 90 días.
 *
 * @param fechaVencimiento Fecha de expiración del lote (string ISO o Date)
 * @param hoy Fecha de corte actual (por defecto la fecha y hora de la consulta)
 * @param umbrales Umbrales configurables (por defecto 30 y 90 días)
 */
export function calcularSemaforo(
  fechaVencimiento: string | Date,
  hoy: string | Date = new Date(),
  umbrales = {
    rojoDias: UMBRAL_SEMAFORO_ROJO_DIAS,
    amarilloDias: UMBRAL_SEMAFORO_AMARILLO_DIAS,
  }
): ResultadoSemaforo {
  const fVenc = normalizarFechaAMedianoche(fechaVencimiento);
  const fHoy = normalizarFechaAMedianoche(hoy);

  const diferenciaMs = fVenc.getTime() - fHoy.getTime();
  const diasRestantes = Math.round(diferenciaMs / (1000 * 60 * 60 * 24));
  const estaVencido = diasRestantes < 0;

  let color: ColorSemaforo;
  let etiqueta: string;
  let clasesBadge: string;
  let descripcion: string;

  if (estaVencido) {
    color = 'rojo';
    const diasVencido = Math.abs(diasRestantes);
    etiqueta = diasVencido === 0 ? 'Vence hoy' : `Vencido hace ${diasVencido} d`;
    clasesBadge = 'bg-rose-100 text-rose-800 border-rose-300 ring-rose-200';
    descripcion = 'Lote caducado. Debe ser retirado inmediatamente para disposición final o devolución.';
  } else if (diasRestantes <= umbrales.rojoDias) {
    color = 'rojo';
    etiqueta = diasRestantes === 0 ? 'Vence hoy' : `Vence en ${diasRestantes} d`;
    clasesBadge = 'bg-red-50 text-red-700 border-red-200 ring-red-100';
    descripcion = `Prioridad crítica (≤ ${umbrales.rojoDias} días). Usar inmediatamente por regla FEFO.`;
  } else if (diasRestantes <= umbrales.amarilloDias) {
    color = 'amarillo';
    etiqueta = `Vence en ${diasRestantes} d`;
    clasesBadge = 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100';
    descripcion = `Alerta preventiva (${umbrales.rojoDias + 1} a ${umbrales.amarilloDias} días). Monitorear rotación.`;
  } else {
    color = 'verde';
    etiqueta = `Vence en ${diasRestantes} d`;
    clasesBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100';
    descripcion = `Vigencia óptima (> ${umbrales.amarilloDias} días). Stock seguro.`;
  }

  return {
    color,
    diasRestantes,
    estaVencido,
    etiqueta,
    clasesBadge,
    descripcion,
  };
}

/**
 * Ordena un arreglo de lotes según la estrategia FEFO (First Expired, First Out):
 * Los lotes con fecha de vencimiento más próxima aparecen primero (ascendente).
 */
export function ordenarLotesPorFEFO<T extends { fecha_vencimiento: string }>(lotes: T[]): T[] {
  return [...lotes].sort((a, b) => {
    const fechaA = new Date(a.fecha_vencimiento).getTime();
    const fechaB = new Date(b.fecha_vencimiento).getTime();
    return fechaA - fechaB;
  });
}

/**
 * Aplica semaforización a un conjunto de lotes con insumos integrados.
 */
export function enriquecerLotesConSemaforo(
  lotes: LoteConInsumo[], 
  hoy: string | Date = new Date()
): LoteConInsumo[] {
  return lotes.map((lote) => ({
    ...lote,
    semaforo: calcularSemaforo(lote.fecha_vencimiento, hoy),
  }));
}

/**
 * Formatea una fecha ISO o YYYY-MM-DD a formato amigable en español (ej. "15 nov 2026").
 */
export function formatearFechaCorta(fechaStr: string): string {
  if (!fechaStr) return '-';
  try {
    const partes = fechaStr.split('T')[0].split('-');
    if (partes.length === 3) {
      const anio = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const dia = parseInt(partes[2], 10);
      const fecha = new Date(anio, mes, dia);
      return fecha.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    return new Date(fechaStr).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return fechaStr;
  }
}
