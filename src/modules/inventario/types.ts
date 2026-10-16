/**
 * Tipos y definiciones del módulo de Inventario Odontológico
 * Consultorio Odontológico Virtual
 * Tipado estricto sin uso de 'any'.
 */

export type EstadoLote = 'ACTIVO' | 'VENCIDO' | 'AGOTADO';

export type DestinoInsumoVencido = 'DEVOLUCION_PROVEEDOR' | 'DISPOSICION_FINAL' | 'OTRO';

export type ColorSemaforo = 'rojo' | 'amarillo' | 'verde';

/**
 * Umbrales de semaforización en días (configurables en el módulo)
 * - 🔴 Rojo: vencido o <= 30 días
 * - 🟡 Amarillo: 31 a 90 días
 * - 🟢 Verde: > 90 días
 */
export const UMBRAL_SEMAFORO_ROJO_DIAS = 30;
export const UMBRAL_SEMAFORO_AMARILLO_DIAS = 90;

export interface Insumo {
  id: string;
  nombre: string;
  marca: string;
  presentacion_comercial: string;
  registro_invima: string;
  creado_en?: string;
  actualizado_en?: string;
}

export interface LoteInsumo {
  id: string;
  insumo_id: string;
  numero_lote: string;
  cantidad_disponible: number;
  fecha_ingreso: string;
  fecha_vencimiento: string;
  estado: EstadoLote;
  creado_en?: string;
  actualizado_en?: string;
}

export interface LoteConInsumo extends LoteInsumo {
  insumo: Insumo;
  semaforo?: ResultadoSemaforo;
}

export interface InsumoVencido {
  id: string;
  lote_id: string;
  cantidad: number;
  fecha_vencimiento: string;
  fecha_retiro: string;
  destino: DestinoInsumoVencido | null;
  observaciones?: string | null;
  registrado_por?: string | null;
  creado_en?: string;
  // Campos desnormalizados para visualización ágil
  insumo_nombre?: string;
  insumo_marca?: string;
  numero_lote?: string;
  registro_invima?: string;
}

export interface ConsumoProcedimiento {
  id: string;
  procedimiento_id?: string | null;
  cita_id?: string | null;
  historia_id?: string | null;
  lote_id: string;
  cantidad: number;
  fecha: string;
  registrado_por?: string | null;
  creado_en?: string;
  // Campos adicionales para trazabilidad
  insumo_nombre?: string;
  numero_lote?: string;
  paciente_nombre?: string;
}

export interface ResultadoSemaforo {
  color: ColorSemaforo;
  diasRestantes: number;
  estaVencido: boolean;
  etiqueta: string;
  clasesBadge: string;
  descripcion: string;
}

export interface ItemDescuentoFEFO {
  insumo_id: string;
  cantidad: number;
  procedimiento_id?: string;
  cita_id?: string;
  historia_id?: string;
  registrado_por?: string;
}

export interface FiltrosInventario {
  busqueda?: string;
  colorSemaforo?: ColorSemaforo | 'todos';
  estado?: EstadoLote | 'todos';
  fechaVencimientoDesde?: string;
  fechaVencimientoHasta?: string;
}
