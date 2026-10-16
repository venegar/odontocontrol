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
  hora?: string;
  citaId?: string;
  motivoConsulta: string;
  diagnostico: string;
  diagnosticoCie10?: string;
  procedimiento: string;
  piezaDental?: string;
  dienteNumero?: number;
  nuevoEstadoDiente?: EstadoDiente;
  anestesia?: string;
  prescripcion?: string;
  indicaciones?: string;
  estado?: 'completado' | 'en_evolucion' | 'control_pendiente';
  imagenesAdjuntas?: {
    id: string;
    nombre: string;
    url: string;
    tipo?: string;
    tamano?: string;
  }[];
  tipoConsulta?: 'valoracion_inicial' | 'evolucion_cita' | 'control_postoperatorio' | 'urgencia';
  procedimientosRealizados?: string[];
  numeroCita?: number;
  proximoControl?: string;
}

export const CATALOGO_PROCEDIMIENTOS_CITA: string[] = [
  'Profilaxis y Detartraje Ultrasónico',
  'Apertura Cavitaria y Remoción de Caries',
  'Aislamiento Absoluto del Campo Operatorio',
  'Restauración en Resina Fotocurada (1 Superficie)',
  'Restauración en Resina Fotocurada (2 o más Superficies)',
  'Tallado y Preparación de Muñón Protésico',
  'Toma de Impresión Definitiva con Silicona',
  'Confección y Cementación de Corona Provisional',
  'Prueba de Estructura / Casquete (Zirconio/Metal)',
  'Cementación Definitiva de Corona / Incrustación',
  'Apertura Cameral y Biopulpectomía (Endodoncia)',
  'Instrumentación Rotatoria y Desinfección de Conductos',
  'Obturación de Conductos con Gutapercha',
  'Raspaje y Alisado Radicular Subgingival',
  'Exodoncia Dental Simple',
  'Exodoncia Quirúrgica de Resto Radicular',
  'Ajuste Oclusal y Control de Contactos Prematuros',
  'Topicación de Flúor Barniz / Remineralización',
  'Retiro de Sutura y Control Post-Operatorio'
];

export interface DiagnosticoFrecuente {
  codigoCie10: string;
  nombre: string;
  categoria: string;
  procedimientoSugerido?: string;
  estadoDienteSugerido?: EstadoDiente;
}

export const DIAGNOSTICOS_ODONTOLOGICOS_FRECUENTES: DiagnosticoFrecuente[] = [
  {
    codigoCie10: 'K02.1',
    nombre: 'Caries de la dentina',
    categoria: 'Cariología',
    procedimientoSugerido: 'Apertura cavitaria, remoción de tejido cariado, grabado ácido, adhesivo y resina nanohíbrida fotocurada.',
    estadoDienteSugerido: 'obturado',
  },
  {
    codigoCie10: 'K02.0',
    nombre: 'Caries limitada al esmalte',
    categoria: 'Cariología',
    procedimientoSugerido: 'Remineralización tópica con barniz de flúor / Sellante de fosas y fisuras.',
    estadoDienteSugerido: 'obturado',
  },
  {
    codigoCie10: 'K04.0',
    nombre: 'Pulpitis reversible',
    categoria: 'Endodoncia',
    procedimientoSugerido: 'Protección pulpar indirecta con hidróxido de calcio y restauración definitiva.',
    estadoDienteSugerido: 'obturado',
  },
  {
    codigoCie10: 'K04.01',
    nombre: 'Pulpitis irreversible aguda',
    categoria: 'Endodoncia',
    procedimientoSugerido: 'Terapia de conductos radiculares (Endodoncia), instrumentación rotatoria y obturación hermética.',
    estadoDienteSugerido: 'endodoncia',
  },
  {
    codigoCie10: 'K04.1',
    nombre: 'Necrosis pulpar con periodontitis apical',
    categoria: 'Endodoncia',
    procedimientoSugerido: 'Desinfección biomecánica endodóntica, medicación con hidróxido de calcio y obturación.',
    estadoDienteSugerido: 'endodoncia',
  },
  {
    codigoCie10: 'K05.0',
    nombre: 'Gingivitis marginal inducida por placa',
    categoria: 'Periodoncia',
    procedimientoSugerido: 'Detartraje supragingival con ultrasonido Cavitron, profilaxis profesional con pasta abrasiva y flúor.',
    estadoDienteSugerido: 'sano',
  },
  {
    codigoCie10: 'K05.3',
    nombre: 'Periodontitis crónica',
    categoria: 'Periodoncia',
    procedimientoSugerido: 'Raspaje y alisado radicular a campo cerrado por cuadrante, irrigación con clorhexidina 0.12%.',
    estadoDienteSugerido: 'sano',
  },
  {
    codigoCie10: 'S02.5',
    nombre: 'Fractura coronal dental sin compromiso pulpar',
    categoria: 'Rehabilitación',
    procedimientoSugerido: 'Reconstrucción coronal con resina de alta estética o preparación para corona individual.',
    estadoDienteSugerido: 'corona',
  },
  {
    codigoCie10: 'K08.1',
    nombre: 'Pérdida de diente (Edentulismo parcial)',
    categoria: 'Cirugía / Implantes',
    procedimientoSugerido: 'Evaluación quirúrgica y estudio tomográfico para rehabilitación con implante o prótesis fija.',
    estadoDienteSugerido: 'ausente',
  },
  {
    codigoCie10: 'Z01.2',
    nombre: 'Examen odontológico y control periódico',
    categoria: 'Preventiva',
    procedimientoSugerido: 'Examen clínico integral estomatológico, odontograma diagnóstico y plan de prevención.',
    estadoDienteSugerido: 'sano',
  },
];


export const ESTADOS_DIENTE_CONFIG: Record<EstadoDiente, { etiqueta: string; colorBg: string; colorTexto: string; colorBorde: string; icono: string }> = {
  sano: { etiqueta: 'Sano', colorBg: 'bg-white', colorTexto: 'text-slate-700', colorBorde: 'border-slate-300', icono: '⚪' },
  caries: { etiqueta: 'Caries Activa', colorBg: 'bg-rose-500', colorTexto: 'text-white', colorBorde: 'border-rose-600', icono: '🔴' },
  obturado: { etiqueta: 'Resina / Obturado', colorBg: 'bg-sky-500', colorTexto: 'text-white', colorBorde: 'border-sky-600', icono: '🔵' },
  corona: { etiqueta: 'Corona / Prótesis', colorBg: 'bg-amber-400', colorTexto: 'text-slate-900', colorBorde: 'border-amber-500', icono: '🟡' },
  endodoncia: { etiqueta: 'Trat. Conducto', colorBg: 'bg-purple-600', colorTexto: 'text-white', colorBorde: 'border-purple-700', icono: '🟣' },
  ausente: { etiqueta: 'Ausente / Extraído', colorBg: 'bg-slate-300', colorTexto: 'text-slate-600', colorBorde: 'border-slate-400', icono: '❌' },
};

export const NOMBRES_PIEZAS_FDI: Record<number, string> = {
  // Cuadrante 1: Superior Derecho
  18: 'Tercer Molar Sup. Der.',
  17: 'Segundo Molar Sup. Der.',
  16: 'Primer Molar Sup. Der.',
  15: 'Segundo Premolar Sup. Der.',
  14: 'Primer Premolar Sup. Der.',
  13: 'Canino Sup. Der.',
  12: 'Incisivo Lateral Sup. Der.',
  11: 'Incisivo Central Sup. Der.',

  // Cuadrante 2: Superior Izquierdo
  21: 'Incisivo Central Sup. Izq.',
  22: 'Incisivo Lateral Sup. Izq.',
  23: 'Canino Sup. Izq.',
  24: 'Primer Premolar Sup. Izq.',
  25: 'Segundo Premolar Sup. Izq.',
  26: 'Primer Molar Sup. Izq.',
  27: 'Segundo Molar Sup. Izq.',
  28: 'Tercer Molar Sup. Izq.',

  // Cuadrante 3: Inferior Izquierdo
  31: 'Incisivo Central Inf. Izq.',
  32: 'Incisivo Lateral Inf. Izq.',
  33: 'Canino Inf. Izq.',
  34: 'Primer Premolar Inf. Izq.',
  35: 'Segundo Premolar Inf. Izq.',
  36: 'Primer Molar Inf. Izq.',
  37: 'Segundo Molar Inf. Izq.',
  38: 'Tercer Molar Inf. Izq.',

  // Cuadrante 4: Inferior Derecho
  48: 'Tercer Molar Inf. Der.',
  47: 'Segundo Molar Inf. Der.',
  46: 'Primer Molar Inf. Der.',
  45: 'Segundo Premolar Inf. Der.',
  44: 'Primer Premolar Inf. Der.',
  43: 'Canino Inf. Der.',
  42: 'Incisivo Lateral Inf. Der.',
  41: 'Incisivo Central Inf. Der.',
};

export function crearOdontogramaInicial(
  personalizaciones?: Record<number, { estado: EstadoDiente; notas?: string }>
): Record<number, DienteInfo> {
  const resultado: Record<number, DienteInfo> = {};
  const numeros = [
    18, 17, 16, 15, 14, 13, 12, 11,
    21, 22, 23, 24, 25, 26, 27, 28,
    48, 47, 46, 45, 44, 43, 42, 41,
    31, 32, 33, 34, 35, 36, 37, 38
  ];

  for (const num of numeros) {
    const custom = personalizaciones ? personalizaciones[num] : undefined;
    resultado[num] = {
      numero: num,
      nombre: NOMBRES_PIEZAS_FDI[num] || `Pieza ${num}`,
      estado: custom?.estado || 'sano',
      notas: custom?.notas || undefined,
    };
  }

  return resultado;
}
