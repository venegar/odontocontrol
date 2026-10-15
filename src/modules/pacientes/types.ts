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
  
  observaciones?: string;
  creadoEn: string;
}
