export interface DatosConsultorio {
  nombreConsultorio: string;
  nombre?: string; // Alias de compatibilidad total con vistas y recordatorios
  directoraMedica: string;
  registroProfesional: string;
  direccion: string;
  ciudad: string;
  telefonoPrincipal: string;
  telefonoUrgencias: string;
  emailContacto: string;
  horarioSemana: string;
  horarioSabado: string;
  modoAprobacion: 'manual' | 'automatico';
  mensajeWhatsAppDefault: string;
  ultimaActualizacionPor?: string;
  ultimaActualizacionFecha?: string;
}

export const DATOS_CONSULTORIO_DEFAULT: DatosConsultorio = {
  nombreConsultorio: 'Clínica Dental Dra. Yasmín Blanco',
  nombre: 'Clínica Dental Dra. Yasmín Blanco',
  directoraMedica: 'Dra. Yasmín Blanco',
  registroProfesional: 'Colegiado Nº 28004921 • Máster en Cirugía Bucal',
  direccion: 'Paseo de la Castellana 142, Planta 2ª',
  ciudad: 'Madrid',
  telefonoPrincipal: '+34 912 345 678',
  telefonoUrgencias: '+34 654 321 987',
  emailContacto: 'contacto@yasminblanco.com',
  horarioSemana: 'Lunes a Viernes: 09:00 - 20:00 h',
  horarioSabado: 'Sábados: 10:00 - 14:00 h (Citas previas)',
  modoAprobacion: 'manual',
  mensajeWhatsAppDefault: '¡Hola {{nombre}}! Te recordamos tu cita odontológica hoy a las {{hora}} con la {{doctor}} en la {{consultorio}}. Por favor confirma tu asistencia.',
  ultimaActualizacionPor: 'Dra. Yasmín Blanco (Directora Médica)',
  ultimaActualizacionFecha: '14 de Octubre, 2026',
};

const STORAGE_KEY = 'dentiscare_datos_consultorio';

/**
 * Obtiene los datos del consultorio almacenados o los valores por defecto.
 */
export function obtenerDatosConsultorio(): DatosConsultorio {
  if (typeof window === 'undefined') {
    return DATOS_CONSULTORIO_DEFAULT;
  }

  try {
    const dataGuardada = localStorage.getItem(STORAGE_KEY);
    if (dataGuardada) {
      const parsed = JSON.parse(dataGuardada);
      const nombreFinal = parsed.nombreConsultorio || parsed.nombre || DATOS_CONSULTORIO_DEFAULT.nombreConsultorio;
      return { 
        ...DATOS_CONSULTORIO_DEFAULT, 
        ...parsed,
        nombreConsultorio: nombreFinal,
        nombre: nombreFinal,
      };
    }
  } catch (error) {
    console.error('Error al recuperar datos del consultorio:', error);
  }

  return DATOS_CONSULTORIO_DEFAULT;
}

/**
 * Guarda los datos del consultorio validando el rol del usuario que ejecuta la acción.
 * Solo el rol 'admin' (Dirección Médica) tiene permisos de edición.
 */
export function guardarDatosConsultorio(
  nuevosDatos: DatosConsultorio,
  rolUsuario: string,
  nombreUsuario: string
): { exito: boolean; mensaje: string; datos?: DatosConsultorio } {
  // Validación estricta de permisos según rol
  if (rolUsuario !== 'admin') {
    return {
      exito: false,
      mensaje: `Acceso restringido: El rol "${rolUsuario}" no tiene autorización para modificar la información del consultorio. Solo la Dirección Médica o Administrador General pueden realizar esta acción.`,
    };
  }

  const fechaActual = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const nombreFinal = nuevosDatos.nombreConsultorio || nuevosDatos.nombre || DATOS_CONSULTORIO_DEFAULT.nombreConsultorio;
  const datosActualizados: DatosConsultorio = {
    ...nuevosDatos,
    nombreConsultorio: nombreFinal,
    nombre: nombreFinal,
    ultimaActualizacionPor: nombreUsuario,
    ultimaActualizacionFecha: fechaActual,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(datosActualizados));
      // Disparar evento para que otras ventanas o componentes reaccionen
      window.dispatchEvent(new Event('consultorio_actualizado'));
    } catch (error) {
      console.error('Error al guardar datos del consultorio:', error);
      return {
        exito: false,
        mensaje: 'No fue posible guardar los cambios en el almacenamiento local.',
      };
    }
  }

  return {
    exito: true,
    mensaje: '¡Los datos del consultorio han sido actualizados exitosamente!',
    datos: datosActualizados,
  };
}
