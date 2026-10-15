export type CanalRecordatorio = 'whatsapp' | 'email';
export type EstadoRecordatorio = 'pendiente' | 'enviado' | 'fallido';

export interface PlantillaRecordatorio {
  id: string;
  nombre: string;
  canal: CanalRecordatorio;
  asunto?: string; // Aplica para emails
  contenido: string; // Plantilla con variables dinámicas tipo {{nombre_paciente}}
  anticipacionHoras: number;
  activa: boolean;
}

export interface RecordatorioItem {
  id: string;
  citaId: string;
  pacienteNombre: string;
  pacienteTelefono: string;
  pacienteEmail: string;
  doctorNombre: string;
  tratamiento: string;
  fechaCita: string;
  horaCita: string;
  canal: CanalRecordatorio;
  mensajeGenerado: string;
  estado: EstadoRecordatorio;
  enviadoEn?: string;
  programadoPara: string;
}

export interface VariablesCita {
  nombre_paciente: string;
  doctor: string;
  tratamiento: string;
  fecha: string;
  hora: string;
  consultorio_telefono: string;
  consultorio_direccion?: string;
  enlace_portal: string;
  enlace_confirmar: string;
  enlace_reagendar: string;
  enlace_cancelar: string;
}

export interface DatosEnvioRecordatorio {
  citaId: string;
  pacienteNombre: string;
  pacienteTelefono: string;
  pacienteEmail: string;
  doctorNombre: string;
  tratamiento: string;
  fechaCita: string;
  horaCita: string;
  sillon?: string;
}

export interface ResultadoEnvioRecordatorio {
  exito: boolean;
  canal: CanalRecordatorio;
  metodo: 'resend' | 'mailto' | 'cloud_api' | 'wa.me';
  mensaje: string;
  urlAccion?: string;
  urlGmailWeb?: string;
  urlWhatsAppWeb?: string;
  urlApiWhatsApp?: string;
  mensajeTexto?: string;
  idEnvio?: string;
  erroresValidacion?: string[];
}

