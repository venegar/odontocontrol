import { DienteInfo, EvolucionClinica } from '@/modules/historias-clinicas/types';

export type TipoDocumento = 'CC' | 'TI' | 'CE' | 'Pasaporte';
export type TipoEps = 'Particular' | 'Ecopetrol';

export type TipoImagenDiagnostica = 
  | 'radiografia_panoramica'
  | 'radiografia_periapical'
  | 'tomografia_cbct'
  | 'fotografia_intraoral'
  | 'fotografia_extraoral'
  | 'cefalometria'
  | 'otro';

export interface ImagenDiagnostica {
  id: string;
  nombre: string;
  tipo: TipoImagenDiagnostica;
  tipoLabel: string;
  url: string; // Base64 o URL directa
  tamano: string;
  fechaSubida: string;
  notas?: string;
}

export interface CitaHistorialPaciente {
  id: string;
  fecha: string;
  hora: string;
  doctorNombre: string;
  tratamiento: string;
  estado: 'completada' | 'confirmada' | 'pendiente' | 'cancelada' | 'en_atencion';
  notas?: string;
}

export interface Paciente {
  id: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  email?: string;
  telefono: string;
  fechaNacimiento: string;
  fotoUrl?: string;
  genero?: 'Femenino' | 'Masculino' | 'Otro';
  ciudad?: string;
  direccion?: string;
  eps?: TipoEps;
  
  // Antecedentes médicos críticos para odontología
  alergias?: string[];
  enfermedadesPrevias?: string[];
  medicamentosActuales?: string[];
  grupoSanguineo?: string;
  
  // Contacto de emergencia
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
  contactoEmergenciaParentesco?: string;
  
  // Imágenes diagnósticas y estudios radiológicos
  imagenesDiagnosticas?: ImagenDiagnostica[];

  // Citas registradas en el consultorio
  citas?: CitaHistorialPaciente[];

  // Procedimientos clínicos realizados y evolución
  evoluciones?: EvolucionClinica[];

  // Odontograma interactivo (32 piezas dentales permanentes FDI)
  odontograma?: Record<number, DienteInfo>;
  
  observaciones?: string;
  creadoEn: string;
}
