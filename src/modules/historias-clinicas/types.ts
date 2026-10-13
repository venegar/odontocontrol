export type EstadoDiente = 
  | 'sano' 
  | 'caries' 
  | 'obturado' 
  | 'corona' 
  | 'endodoncia' 
  | 'ausente';

export interface DienteInfo {
  numero: number;
  nombre: string;
  estado: EstadoDiente;
  notas?: string;
}

export interface EvolucionClinica {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  doctorNombre: string;
  fecha: string;
  motivoConsulta: string;
  diagnostico: string;
  procedimiento: string;
  piezaDental?: string;
  prescripcion?: string;
  indicaciones?: string;
}

export const ESTADOS_DIENTE_CONFIG: Record<EstadoDiente, { etiqueta: string; colorBg: string; colorTexto: string; colorBorde: string }> = {
  sano: { etiqueta: 'Sano', colorBg: 'bg-white', colorTexto: 'text-slate-700', colorBorde: 'border-slate-300' },
  caries: { etiqueta: 'Caries Activa', colorBg: 'bg-rose-500', colorTexto: 'text-white', colorBorde: 'border-rose-600' },
  obturado: { etiqueta: 'Resina / Obturado', colorBg: 'bg-sky-500', colorTexto: 'text-white', colorBorde: 'border-sky-600' },
  corona: { etiqueta: 'Corona / Prótesis', colorBg: 'bg-amber-400', colorTexto: 'text-slate-900', colorBorde: 'border-amber-500' },
  endodoncia: { etiqueta: 'Trat. Conducto', colorBg: 'bg-purple-600', colorTexto: 'text-white', colorBorde: 'border-purple-700' },
  ausente: { etiqueta: 'Ausente / Extraído', colorBg: 'bg-slate-300', colorTexto: 'text-slate-600', colorBorde: 'border-slate-400' },
};
