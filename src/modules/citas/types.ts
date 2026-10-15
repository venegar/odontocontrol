export type EstadoCita = 
  | 'solicitada' 
  | 'pendiente'
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

export interface SolicitudCitaInput {
  nombres: string;
  apellidos: string;
  tipoDocumento: 'CC' | 'TI' | 'CE' | 'PASAPORTE' | 'Pasaporte' | 'OTRO';
  numeroDocumento: string;
  telefono: string;
  email?: string;
  tratamiento: string;
  especialista?: string;
  fechaDeseada: string;
  jornada?: 'mañana' | 'tarde';
  horaSugerida: string;
  motivo?: string;
}

export interface CitaHoy {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  pacienteDocumento: string;
  pacienteTelefono: string;
  tratamientoNombre: string;
  doctorNombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  estado: EstadoCita;
  esReagendamiento: boolean;
  motivoRechazoCancelacion?: string;
  notas?: string;
}

export interface ResultadoAccionCita<T = unknown> {
  exito: boolean;
  mensaje: string;
  datos?: T;
  error?: string;
}

