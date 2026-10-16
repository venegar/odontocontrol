// ==============================================================================
// TIPOS ESTRICTOS EN TYPESCRIPT - MÓDULO DE VALORACIÓN & PRESUPUESTOS
// Consultorio Odontológico Dra. Yasmín Blanco
// ==============================================================================

import { DienteInfo } from '@/modules/historias-clinicas/types';

export type EstadoPresupuesto = 'borrador' | 'aprobado' | 'en_tratamiento' | 'completado' | 'cancelado';

export interface ItemPresupuesto {
  id: string;
  piezaDental?: number | string; // ej: 15, "15", "General"
  tratamiento: string;           // ej: "PROVISIONAL A NIVEL DE ORGANO DENTARIO 15"
  categoria?: string;            // ej: "Prostodoncia", "Operatoria", "Endodoncia"
  valorUnidad: number;          // Valor unitario en pesos COP
  cantidad: number;             // Cantidad
  valorTotal: number;           // valorUnidad * cantidad
  notas?: string;
}

export interface Presupuesto {
  id: string;
  codigo: string;               // ej: "PTO-2026-001"
  pacienteId: string;
  pacienteNombre: string;
  pacienteDocumento: string;
  pacienteEdad?: number;
  pacienteTelefono?: string;
  pacienteEps?: string;
  
  // Datos del Especialista
  doctorNombre: string;         // "Dra. Yasmín Blanco Escorcia"
  doctorNit: string;            // "NIT. 45.498.143-6"
  doctorEspecialidad: string;   // "ESPECIALISTA EN PROSTODONCIA OCLUSION Y ATM"
  doctorInstitucion: string;    // "Colegio universitario colombiano"
  
  fecha: string;                // YYYY-MM-DD
  items: ItemPresupuesto[];
  subtotal: number;
  descuento?: number;
  total: number;
  
  estado: EstadoPresupuesto;
  observaciones?: string;
  
  // Instantánea opcional del odontograma al momento de la valoración
  odontogramaSnapshot?: Record<number, DienteInfo>;
  creadoEn: string;
}

export interface ProcedimientoCatalogo {
  id: string;
  nombre: string;
  categoria: 'Prostodoncia & Oclusión' | 'Operatoria & Estética' | 'Endodoncia' | 'Periodoncia' | 'Cirugía Oral' | 'Ortodoncia' | 'Diagnóstico';
  precioSugerido: number;
  aplicaAOrganoDentario: boolean;
  formatoPlantilla?: string; // ej: "{procedimiento} A NIVEL DE ORGANO DENTARIO {diente}"
}
