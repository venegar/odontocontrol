'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { 
  EstadoCita, 
  SolicitudCitaInput, 
  CitaHoy, 
  ResultadoAccionCita 
} from '@/modules/citas/types';

// ==============================================================================
// ESQUEMAS DE VALIDACIÓN ZOD (ESTRICTO - SIN 'any')
// ==============================================================================

export const solicitudCitaZodSchema = z.object({
  nombres: z
    .string({ required_error: 'Los nombres son obligatorios' })
    .trim()
    .min(2, 'Los nombres deben contener al menos 2 caracteres'),
  apellidos: z
    .string({ required_error: 'Los apellidos son obligatorios' })
    .trim()
    .min(2, 'Los apellidos deben contener al menos 2 caracteres'),
  tipoDocumento: z
    .enum(['CC', 'TI', 'CE', 'PASAPORTE', 'Pasaporte', 'OTRO'], {
      errorMap: () => ({ message: 'Tipo de documento no válido' }),
    })
    .default('CC'),
  numeroDocumento: z
    .string({ required_error: 'El número de documento es obligatorio' })
    .trim()
    .min(4, 'El documento debe tener al menos 4 dígitos'),
  telefono: z
    .string({ required_error: 'El número de contacto es obligatorio' })
    .trim()
    .min(7, 'El teléfono debe tener al menos 7 dígitos'),
  email: z
    .string()
    .trim()
    .email('El formato del correo electrónico no es válido')
    .optional()
    .or(z.literal('')),
  tratamiento: z
    .string({ required_error: 'Debe seleccionar un tratamiento' })
    .trim()
    .min(2, 'Seleccione un tratamiento válido'),
  especialista: z.string().trim().optional(),
  fechaDeseada: z
    .string({ required_error: 'La fecha es obligatoria' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (debe ser YYYY-MM-DD)'),
  jornada: z.enum(['mañana', 'tarde']).optional(),
  horaSugerida: z
    .string({ required_error: 'La hora tentativa es obligatoria' })
    .trim()
    .min(1, 'Especifique una hora sugerida'),
  motivo: z.string().trim().optional(),
});

const rechazoCitaZodSchema = z.object({
  citaId: z.string().uuid('El identificador de la cita no es válido'),
  motivo: z
    .string({ required_error: 'El motivo de rechazo es obligatorio' })
    .trim()
    .min(4, 'El motivo de rechazo debe contener al menos 4 caracteres'),
});

const uuidZodSchema = z.string().uuid('Identificador no válido');

// ==============================================================================
// FUNCIONES AUXILIARES INTERNAS
// ==============================================================================

/**
 * Convierte un formato de hora de 12 horas (ej: "09:00 AM", "03:00 PM")
 * al formato estándar de 24 horas para PostgreSQL (ej: "09:00:00", "15:00:00").
 */
function normalizarHoraA24(horaStr: string): string {
  const limpia = horaStr.trim();
  const match = limpia.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) {
    return '09:00:00';
  }

  let horas = parseInt(match[1], 10);
  const minutos = match[2];
  const ampm = match[3] ? match[3].toUpperCase() : null;

  if (ampm === 'PM' && horas < 12) {
    horas += 12;
  } else if (ampm === 'AM' && horas === 12) {
    horas = 0;
  }

  const horasFormateadas = horas.toString().padStart(2, '0');
  return `${horasFormateadas}:${minutos}:00`;
}

// Interfaces internas para el mapeo tipado de Supabase
interface FilaPacienteDB {
  id: string;
  nombres: string;
  apellidos: string;
  numero_documento: string;
  telefono: string;
}

interface FilaTratamientoDB {
  id: string;
  nombre: string;
}

interface FilaPerfilDB {
  id: string;
  nombres: string;
  apellidos: string;
}

interface FilaCitaDB {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo: string;
  estado: EstadoCita;
  es_reagendamiento: boolean | null;
  motivo_rechazo_cancelacion: string | null;
  notas: string | null;
  pacientes: FilaPacienteDB | null;
  tratamientos_catalogo: FilaTratamientoDB | null;
  perfiles: FilaPerfilDB | null;
}

interface RespuestaRpcSolicitud {
  exito: boolean;
  cita_id: string;
  paciente_id: string;
  estado: EstadoCita;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  mensaje: string;
}

// ==============================================================================
// SERVER ACTIONS
// ==============================================================================

/**
 * Registra una solicitud de cita pública desde la landing page.
 * Utiliza validación Zod y delega la inserción a la función PostgreSQL
 * `solicitar_cita_publica` con directiva SECURITY DEFINER para preservar
 * la confidencialidad médica y la integridad del catálogo de pacientes.
 */
export async function crearSolicitudCitaPublica(
  datos: SolicitudCitaInput
): Promise<ResultadoAccionCita<{ citaId: string; estado: EstadoCita }>> {
  // 1. Validación estricta con Zod
  const parseResult = solicitudCitaZodSchema.safeParse(datos);

  if (!parseResult.success) {
    const errorMensaje = parseResult.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ');
    return {
      exito: false,
      mensaje: 'Los datos del formulario contienen inconsistencias.',
      error: errorMensaje,
    };
  }

  const dataValida = parseResult.data;
  const horaPostgres = normalizarHoraA24(dataValida.horaSugerida);
  const tipoDocNormalizado = dataValida.tipoDocumento.toUpperCase();

  try {
    // 2. Ejecutar la función RPC SECURITY DEFINER en Supabase
    const { data, error } = await supabase.rpc('solicitar_cita_publica', {
      p_nombres: dataValida.nombres,
      p_apellidos: dataValida.apellidos,
      p_tipo_documento: tipoDocNormalizado,
      p_numero_documento: dataValida.numeroDocumento,
      p_telefono: dataValida.telefono,
      p_email: dataValida.email || null,
      p_fecha: dataValida.fechaDeseada,
      p_hora_inicio: horaPostgres,
      p_motivo: dataValida.motivo || `Solicitud para ${dataValida.tratamiento}`,
      p_tratamiento_nombre: dataValida.tratamiento,
      p_especialista_nombre: dataValida.especialista || null,
      p_fecha_nacimiento: null,
    });

    if (error) {
      console.error('Error al invocar public.solicitar_cita_publica en Supabase:', error);

      // Si la función RPC no estuviese desplegada aún, proveer mensaje claro
      return {
        exito: false,
        mensaje: 'No fue posible registrar tu cita en este momento. Por favor contacta por WhatsApp.',
        error: error.message,
      };
    }

    const respuestaRpc = data as RespuestaRpcSolicitud;

    // 3. Revalidar vistas del panel administrativo
    revalidatePath('/dashboard/citas');
    revalidatePath('/dashboard');

    return {
      exito: true,
      mensaje: respuestaRpc?.mensaje || 'Tu solicitud de cita ha sido radicada correctamente.',
      datos: {
        citaId: respuestaRpc?.cita_id,
        estado: respuestaRpc?.estado || 'solicitada',
      },
    };
  } catch (err) {
    const mensajeError = err instanceof Error ? err.message : 'Error inesperado de comunicación con la base de datos';
    console.error('Excepción en crearSolicitudCitaPublica:', err);
    return {
      exito: false,
      mensaje: 'Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo en unos minutos.',
      error: mensajeError,
    };
  }
}

/**
 * Obtiene las citas del día actual (o de una fecha específica YYYY-MM-DD)
 * desde la tabla `citas`, asociando nombre del paciente, tratamiento y odontólogo.
 */
export async function obtenerCitasHoy(
  fechaFiltro?: string
): Promise<ResultadoAccionCita<CitaHoy[]>> {
  try {
    // Si no se suministra fecha, utilizar la fecha actual en formato local ISO (YYYY-MM-DD)
    const fechaActual = fechaFiltro || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('citas')
      .select(`
        id,
        fecha,
        hora_inicio,
        hora_fin,
        motivo,
        estado,
        es_reagendamiento,
        motivo_rechazo_cancelacion,
        notas,
        pacientes (
          id,
          nombres,
          apellidos,
          numero_documento,
          telefono
        ),
        tratamientos_catalogo (
          id,
          nombre
        ),
        perfiles (
          id,
          nombres,
          apellidos
        )
      `)
      .eq('fecha', fechaActual)
      .order('hora_inicio', { ascending: true });

    if (error) {
      console.error('Error al consultar citas del día en Supabase:', error);
      return {
        exito: false,
        mensaje: `Error al obtener citas: ${error.message}`,
        datos: [],
        error: error.message,
      };
    }

    const filas = (data ?? []) as unknown as FilaCitaDB[];

    const citasFormateadas: CitaHoy[] = filas.map((fila) => {
      const paciente = fila.pacientes;
      const tratamiento = fila.tratamientos_catalogo;
      const doctor = fila.perfiles;

      const pacienteNombre = paciente
        ? `${paciente.nombres} ${paciente.apellidos}`.trim()
        : 'Paciente no identificado';

      const doctorNombre = doctor
        ? `Dr(a). ${doctor.nombres} ${doctor.apellidos}`.trim()
        : 'Por asignar';

      return {
        id: fila.id,
        pacienteId: paciente?.id ?? '',
        pacienteNombre,
        pacienteDocumento: paciente?.numero_documento ?? 'Sin documento',
        pacienteTelefono: paciente?.telefono ?? 'Sin teléfono',
        tratamientoNombre: tratamiento?.nombre ?? 'Consulta odontológica',
        doctorNombre,
        fecha: fila.fecha,
        horaInicio: fila.hora_inicio ? fila.hora_inicio.slice(0, 5) : '08:00',
        horaFin: fila.hora_fin ? fila.hora_fin.slice(0, 5) : '08:30',
        motivo: fila.motivo ?? '',
        estado: fila.estado,
        esReagendamiento: Boolean(fila.es_reagendamiento),
        motivoRechazoCancelacion: fila.motivo_rechazo_cancelacion ?? undefined,
        notas: fila.notas ?? undefined,
      };
    });

    return {
      exito: true,
      mensaje: `Se recuperaron ${citasFormateadas.length} citas para ${fechaActual}.`,
      datos: citasFormateadas,
    };
  } catch (err) {
    const mensajeError = err instanceof Error ? err.message : 'Error inesperado al consultar citas';
    console.error('Excepción en obtenerCitasHoy:', err);
    return {
      exito: false,
      mensaje: 'Fallo al recuperar las citas de hoy.',
      datos: [],
      error: mensajeError,
    };
  }
}

/**
 * Aprueba una cita en estado 'solicitada', actualizándola a 'confirmada'
 * y registrando la marca de tiempo de aprobación.
 */
export async function aprobarCita(
  citaId: string,
  odontologoId?: string
): Promise<ResultadoAccionCita<{ id: string; estado: EstadoCita }>> {
  const parseId = uuidZodSchema.safeParse(citaId);
  if (!parseId.success) {
    return {
      exito: false,
      mensaje: 'El identificador de la cita no es un UUID válido.',
      error: parseId.error.message,
    };
  }

  try {
    const payloadUpdate: {
      estado: EstadoCita;
      aprobado_en: string;
      actualizado_en: string;
      odontologo_id?: string;
    } = {
      estado: 'confirmada',
      aprobado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    };

    if (odontologoId) {
      payloadUpdate.odontologo_id = odontologoId;
    }

    const { data, error } = await supabase
      .from('citas')
      .update(payloadUpdate)
      .eq('id', citaId)
      .select('id, estado')
      .single();

    if (error) {
      console.error('Error al aprobar cita en Supabase:', error);
      return {
        exito: false,
        mensaje: `No se pudo aprobar la cita: ${error.message}`,
        error: error.message,
      };
    }

    revalidatePath('/dashboard/citas');
    revalidatePath('/dashboard');

    return {
      exito: true,
      mensaje: 'La cita ha sido aprobada y confirmada en la agenda.',
      datos: {
        id: data.id,
        estado: data.estado as EstadoCita,
      },
    };
  } catch (err) {
    const mensajeError = err instanceof Error ? err.message : 'Error al aprobar la cita';
    console.error('Excepción en aprobarCita:', err);
    return {
      exito: false,
      mensaje: 'Ocurrió un error al aprobar la cita.',
      error: mensajeError,
    };
  }
}

/**
 * Rechaza una solicitud de cita especificando el motivo clínico o administrativo.
 */
export async function rechazarCita(
  citaId: string,
  motivo: string
): Promise<ResultadoAccionCita<{ id: string; estado: EstadoCita }>> {
  const parseResult = rechazoCitaZodSchema.safeParse({ citaId, motivo });
  if (!parseResult.success) {
    const errorMensaje = parseResult.error.errors.map((e) => e.message).join('; ');
    return {
      exito: false,
      mensaje: 'El motivo de rechazo es obligatorio.',
      error: errorMensaje,
    };
  }

  try {
    const { data, error } = await supabase
      .from('citas')
      .update({
        estado: 'rechazada' as EstadoCita,
        motivo_rechazo_cancelacion: motivo.trim(),
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', citaId)
      .select('id, estado')
      .single();

    if (error) {
      console.error('Error al rechazar cita en Supabase:', error);
      return {
        exito: false,
        mensaje: `No se pudo rechazar la cita: ${error.message}`,
        error: error.message,
      };
    }

    revalidatePath('/dashboard/citas');
    revalidatePath('/dashboard');

    return {
      exito: true,
      mensaje: 'La solicitud de cita fue rechazada.',
      datos: {
        id: data.id,
        estado: data.estado as EstadoCita,
      },
    };
  } catch (err) {
    const mensajeError = err instanceof Error ? err.message : 'Error al rechazar la cita';
    console.error('Excepción en rechazarCita:', err);
    return {
      exito: false,
      mensaje: 'Ocurrió un error al procesar el rechazo de la cita.',
      error: mensajeError,
    };
  }
}
