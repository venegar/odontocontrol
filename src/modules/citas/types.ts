export type EstadoCita = 
  | 'solicitada' 
  | 'confirmada' 
  | 'en_atencion' 
  | 'completada' 
  | 'cancelada' 
  | 'rechazada';

export type ModoAprobacion = 'manual' | 'automatico';

export interface Cita {
  id: string;
  pacienteId: string;
  odontologoId: string;
  tratamientoId?: string;
  fecha: string; // formato YYYY-MM-DD
  horaInicio: string; // formato HH:mm
  horaFin: string;
  motivoConsulta: string;
  estado: EstadoCita;
  esReagendamiento?: boolean;
  citaOrigenId?: string;
  motivoRechazoCancelacion?: string;
  aprobadoPor?: string;
  aprobadoEn?: string;
  notas?: string;
  recordatorioEnviado: boolean;
  creadoEn: string;
}

export interface ConfiguracionConsultorio {
  id: string;
  nombreConsultorio: string;
  modoAprobacionCitas: ModoAprobacion;
  duracionCitaDefaultMinutos: number;
  diasAnticipacionMaximo: number;
  horasCancelacionMinima: number;
}
