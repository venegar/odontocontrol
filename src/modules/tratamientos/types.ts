// ==============================================================================
// TIPOS ESTRICTOS EN TYPESCRIPT - MÓDULO DE TRATAMIENTOS ODONTOLÓGICOS
// Consultorio Odontológico Dra. Yasmín Blanco
// ==============================================================================

export type CategoriaTratamiento =
  | 'Prostodoncia & Oclusión'
  | 'Operatoria & Estética'
  | 'Endodoncia'
  | 'Periodoncia'
  | 'Cirugía Oral'
  | 'Ortodoncia'
  | 'Diagnóstico';

export const CATEGORIAS_TRATAMIENTOS: { id: CategoriaTratamiento; label: string; color: string }[] = [
  { id: 'Prostodoncia & Oclusión', label: 'Prostodoncia & Oclusión', color: 'indigo' },
  { id: 'Operatoria & Estética', label: 'Operatoria & Estética', color: 'cyan' },
  { id: 'Endodoncia', label: 'Endodoncia', color: 'purple' },
  { id: 'Periodoncia', label: 'Periodoncia', color: 'emerald' },
  { id: 'Cirugía Oral', label: 'Cirugía Oral & Implantes', color: 'rose' },
  { id: 'Ortodoncia', label: 'Ortodoncia', color: 'amber' },
  { id: 'Diagnóstico', label: 'Diagnóstico & Prevención', color: 'sky' },
];

export interface Tratamiento {
  id: string;
  nombre: string;
  categoria: CategoriaTratamiento;
  precioSugerido: number;
  duracionMinutos: number;
  descripcion?: string;
  aplicaAOrganoDentario: boolean;
  formatoPlantilla?: string; // ej: "{procedimiento} A NIVEL DE ORGANO DENTARIO {diente}"
  activo: boolean;
  fechaCreacion?: string;
  ultimaModificacion?: string;
}

export type TratamientoInput = Omit<Tratamiento, 'id' | 'fechaCreacion' | 'ultimaModificacion'>;
