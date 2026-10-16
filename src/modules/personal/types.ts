export type RolUsuario = 'superadmin' | 'admin' | 'odontologo' | 'recepcionista' | 'paciente';

export type PermisoCodigo = 
  | 'citas.ver'
  | 'citas.aprobar'
  | 'citas.crear'
  | 'citas.cancelar'
  | 'pacientes.ver'
  | 'pacientes.crear'
  | 'pacientes.editar'
  | 'historias.ver'
  | 'historias.crear'
  | 'personal.ver'
  | 'personal.gestionar'
  | 'personal.eliminar'
  | 'tratamientos.gestionar'
  | 'recordatorios.gestionar'
  | 'configuracion.editar';

export interface PermisoInfo {
  codigo: PermisoCodigo;
  nombre: string;
  modulo: 'Citas' | 'Pacientes' | 'Historias Clínicas' | 'Personal' | 'Configuración' | 'Tratamientos';
  descripcion: string;
}

export const CATALOGO_PERMISOS: PermisoInfo[] = [
  { codigo: 'citas.ver', nombre: 'Ver Agenda de Citas', modulo: 'Citas', descripcion: 'Visualizar el calendario de citas de todos los doctores.' },
  { codigo: 'citas.aprobar', nombre: 'Aprobar y Reagendar Citas', modulo: 'Citas', descripcion: 'Aceptar solicitudes de citas y autorizar cambios de horario.' },
  { codigo: 'citas.crear', nombre: 'Agendar Citas Directas', modulo: 'Citas', descripcion: 'Crear citas directamente sin pasar por solicitud.' },
  { codigo: 'citas.cancelar', nombre: 'Cancelar Citas', modulo: 'Citas', descripcion: 'Cancelar citas agendadas notificando al paciente.' },
  
  { codigo: 'pacientes.ver', nombre: 'Consultar Fichas de Pacientes', modulo: 'Pacientes', descripcion: 'Ver datos personales e historial de citas.' },
  { codigo: 'pacientes.crear', nombre: 'Registrar Nuevos Pacientes', modulo: 'Pacientes', descripcion: 'Dar de alta nuevos pacientes en el sistema.' },
  { codigo: 'pacientes.editar', nombre: 'Editar Datos de Pacientes', modulo: 'Pacientes', descripcion: 'Modificar teléfonos, correos y antecedentes médicos.' },

  { codigo: 'historias.ver', nombre: 'Ver Historias Clínicas', modulo: 'Historias Clínicas', descripcion: 'Acceso a diagnósticos médicos, evoluciones y radiografías.' },
  { codigo: 'historias.crear', nombre: 'Registrar Evolución Médica', modulo: 'Historias Clínicas', descripcion: 'Agregar notas de evolución clínica y odontogramas.' },

  { codigo: 'personal.ver', nombre: 'Ver Lista del Personal', modulo: 'Personal', descripcion: 'Ver la lista de doctores y personal auxiliar.' },
  { codigo: 'personal.gestionar', nombre: 'Gestionar Permisos del Personal', modulo: 'Personal', descripcion: 'Crear usuarios internos y asignar permisos individuales.' },
  { codigo: 'personal.eliminar', nombre: 'Eliminar y Desvincular Colaboradores', modulo: 'Personal', descripcion: 'Permiso exclusivo de administrador para dar de baja o desvincular usuarios del consultorio.' },

  { codigo: 'tratamientos.gestionar', nombre: 'Administrar Catálogo de Tratamientos', modulo: 'Tratamientos', descripcion: 'Modificar tarifas, duración y lista de servicios.' },
  { codigo: 'configuracion.editar', nombre: 'Ajustes Generales del Consultorio', modulo: 'Configuración', descripcion: 'Cambiar modo de aprobación (Manual / Automático) y horarios.' }
];

export interface PerfilPersonal {
  id: string;
  nombres: string;
  apellidos: string;
  rol: RolUsuario;
  telefono?: string;
  especialidad?: string;
  registroProfesional?: string;
  fotoUrl?: string;
  activo: boolean;
  permisos: PermisoCodigo[];
}
