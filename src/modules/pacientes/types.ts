export type TipoDocumento = 'CC' | 'TI' | 'CE' | 'Pasaporte';

export interface Paciente {
  id: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  genero?: 'Femenino' | 'Masculino' | 'Otro';
  ciudad?: string;
  direccion?: string;
  
  // Antecedentes médicos críticos para odontología
  alergias?: string[];
  enfermedadesPrevias?: string[];
  medicamentosActuales?: string[];
  grupoSanguineo?: string;
  
  // Contacto de emergencia
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
  contactoEmergenciaParentesco?: string;
  
  observaciones?: string;
  creadoEn: string;
}
