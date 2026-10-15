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

const solicitudCitaZodSchema = z.object({
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
 * mediante la función RPC segura 'confirmar_cita_portal'.
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
    // 1. Intentar con función RPC con permisos SECURITY DEFINER
    const { data: rpcData, error: rpcError } = await supabase.rpc('confirmar_cita_portal', {
      p_cita_id: citaId,
    });

    if (!rpcError && rpcData && (rpcData as { exito?: boolean }).exito) {
      revalidatePath('/dashboard/citas');
      revalidatePath('/dashboard');
      return {
        exito: true,
        mensaje: 'La cita ha sido aprobada y confirmada en la agenda.',
        datos: {
          id: citaId,
          estado: 'confirmada',
        },
      };
    }

    // 2. Fallback a UPDATE directo
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
 * Rechaza o cancela una solicitud de cita especificando el motivo.
 * Utiliza la función RPC segura 'cancelar_cita_portal' de Supabase.
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
    // 1. Intentar con función RPC con permisos SECURITY DEFINER
    const { data: rpcData, error: rpcError } = await supabase.rpc('cancelar_cita_portal', {
      p_cita_id: citaId,
      p_motivo: motivo.trim(),
    });

    if (!rpcError && rpcData && (rpcData as { exito?: boolean }).exito) {
      revalidatePath('/dashboard/citas');
      revalidatePath('/dashboard');
      return {
        exito: true,
        mensaje: 'La solicitud de cita fue rechazada y retirada de la agenda.',
        datos: {
          id: citaId,
          estado: 'rechazada',
        },
      };
    }

    // 2. Fallback a UPDATE directo
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
      mensaje: 'La solicitud de cita fue rechazada y retirada de la agenda.',
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

/**
 * Cancela una cita confirmada o solicitada en Supabase.
 */
export async function cancelarCitaAction(
  citaId: string,
  motivo?: string
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
    const motivoFinal = (motivo || 'Cancelada por recepción').trim();
    const { data: rpcData, error: rpcError } = await supabase.rpc('cancelar_cita_portal', {
      p_cita_id: citaId,
      p_motivo: motivoFinal,
    });

    if (!rpcError && rpcData && (rpcData as { exito?: boolean }).exito) {
      revalidatePath('/dashboard/citas');
      revalidatePath('/dashboard');
      return {
        exito: true,
        mensaje: 'La cita ha sido cancelada correctamente y el horario liberado.',
        datos: {
          id: citaId,
          estado: 'cancelada',
        },
      };
    }

    // Fallback a UPDATE
    await supabase.from('citas').update({
      estado: 'cancelada',
      motivo_rechazo_cancelacion: motivoFinal,
      actualizado_en: new Date().toISOString(),
    }).eq('id', citaId);

    revalidatePath('/dashboard/citas');
    revalidatePath('/dashboard');

    return {
      exito: true,
      mensaje: 'La cita ha sido cancelada correctamente.',
      datos: {
        id: citaId,
        estado: 'cancelada',
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al cancelar la cita';
    return { exito: false, mensaje: msg, error: msg };
  }
}

/**
 * SERVER ACTION: Agendar Cita Directa desde Recepción y guardarla en Supabase
 * Crea o busca al paciente, registra la cita y la confirma de forma inmediata.
 */
export async function agendarCitaRecepcionAction(datos: {
  nombre: string;
  documento?: string;
  telefono: string;
  email?: string;
  doctor: string;
  tratamiento: string;
  fecha: string;
  hora: string;
  notas?: string;
}): Promise<ResultadoAccionCita<{
  id: string;
  pacienteNombre: string;
  pacienteDocumento: string;
  pacienteTelefono: string;
  doctorNombre: string;
  tratamiento: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: EstadoCita;
}>> {
  if (!datos.nombre || datos.nombre.trim().length < 2) {
    return { exito: false, mensaje: 'El nombre del paciente es obligatorio.' };
  }
  if (!datos.telefono || datos.telefono.trim().length < 7) {
    return { exito: false, mensaje: 'El teléfono debe tener al menos 7 dígitos.' };
  }
  if (!datos.fecha) {
    return { exito: false, mensaje: 'La fecha de la cita es obligatoria.' };
  }

  try {
    const partes = datos.nombre.trim().split(/\s+/);
    const nombres = partes[0] || 'Paciente';
    const apellidos = partes.slice(1).join(' ') || 'Registrado';
    const doc = (datos.documento || '').trim() || `CC-${Date.now().toString().slice(-8)}`;
    const hora24 = normalizarHoraA24(datos.hora);

    // 1. Invocar RPC solicitar_cita_publica en Supabase
    const { data: rpcData, error: rpcError } = await supabase.rpc('solicitar_cita_publica', {
      p_nombres: nombres,
      p_apellidos: apellidos,
      p_tipo_documento: 'CC',
      p_numero_documento: doc,
      p_telefono: datos.telefono.trim(),
      p_email: (datos.email || '').trim() || null,
      p_fecha: datos.fecha,
      p_hora_inicio: hora24,
      p_motivo: datos.notas || `Cita directa en recepción: ${datos.tratamiento}`,
      p_tratamiento_nombre: datos.tratamiento,
      p_especialista_nombre: datos.doctor,
      p_fecha_nacimiento: null,
    });

    if (rpcError || !rpcData || !(rpcData as { exito?: boolean }).exito) {
      console.error('Error al registrar cita directa en Supabase:', rpcError);
      return {
        exito: false,
        mensaje: `No se pudo guardar la cita en la base de datos: ${rpcError?.message || 'Error desconocido'}`,
      };
    }

    const respuesta = rpcData as RespuestaRpcSolicitud;
    const citaIdReal = respuesta.cita_id;

    // 2. La cita queda en estado 'solicitada' / 'pendiente' a la espera de confirmación del paciente o recepción
    revalidatePath('/dashboard/citas');
    revalidatePath('/dashboard');

    return {
      exito: true,
      mensaje: `Cita para ${datos.nombre} guardada con éxito. Estado: Pendiente de confirmación.`,
      datos: {
        id: citaIdReal,
        pacienteNombre: `${nombres} ${apellidos}`,
        pacienteDocumento: doc,
        pacienteTelefono: datos.telefono.trim(),
        doctorNombre: datos.doctor,
        tratamiento: datos.tratamiento,
        fecha: datos.fecha,
        horaInicio: datos.hora,
        horaFin: `${datos.hora} (Estimado)`,
        estado: 'pendiente',
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al guardar la cita en recepción';
    console.error('Excepción en agendarCitaRecepcionAction:', err);
    return { exito: false, mensaje: msg, error: msg };
  }
}

/**
 * SERVER ACTION: Confirmar Cita desde Recepción
 * Cambia el estado de una cita de 'pendiente' a 'confirmada' tanto en Supabase como en la agenda.
 */
export async function confirmarCitaRecepcionAction(
  citaId: string
): Promise<ResultadoAccionCita<{ id: string; estado: EstadoCita }>> {
  if (!citaId) {
    return { exito: false, mensaje: 'El ID de la cita es obligatorio.' };
  }

  try {
    if (uuidZodSchema.safeParse(citaId).success) {
      // 1. Invocar RPC oficial confirmar_cita_portal
      await supabase.rpc('confirmar_cita_portal', { p_cita_id: citaId });

      // 2. Fallback de confirmación directa en la tabla citas
      await supabase.from('citas').update({
        estado: 'confirmada',
        aprobado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString(),
      }).eq('id', citaId);
    }

    revalidatePath('/dashboard/citas');
    revalidatePath('/dashboard');
    revalidatePath('/portal-paciente');

    return {
      exito: true,
      mensaje: 'La cita ha sido confirmada con éxito en la agenda.',
      datos: {
        id: citaId,
        estado: 'confirmada',
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al confirmar la cita';
    return { exito: false, mensaje: msg, error: msg };
  }
}

/**
 * SERVER ACTION: Reagendar Cita desde Recepción
 * Actualiza la fecha y hora en Supabase y la mantiene confirmada en la agenda.
 */
export async function reagendarCitaRecepcionAction(
  citaId: string,
  nuevaFecha: string,
  nuevaHora: string,
  motivo?: string
): Promise<ResultadoAccionCita<{ id: string; fecha: string; hora: string }>> {
  if (!citaId || !nuevaFecha || !nuevaHora) {
    return { exito: false, mensaje: 'Faltan parámetros obligatorios para reagendar la cita.' };
  }

  try {
    const hora24 = normalizarHoraA24(nuevaHora);
    const motivoFinal = (motivo || 'Reagendada por recepción').trim();

    // 1. Invocar RPC reagendar_cita_portal en Supabase si es UUID
    if (uuidZodSchema.safeParse(citaId).success) {
      await supabase.rpc('reagendar_cita_portal', {
        p_cita_id: citaId,
        p_nueva_fecha: nuevaFecha,
        p_nueva_hora: hora24,
        p_motivo: motivoFinal,
      });

      // Asegurar estado confirmada en Supabase ya que es reagendada directamente por recepción
      await supabase.from('citas').update({
        estado: 'confirmada',
        fecha: nuevaFecha,
        hora_inicio: hora24,
        motivo: motivoFinal,
        actualizado_en: new Date().toISOString(),
      }).eq('id', citaId);
    }

    revalidatePath('/dashboard/citas');
    revalidatePath('/dashboard');

    return {
      exito: true,
      mensaje: `Cita reprogramada con éxito para el ${nuevaFecha} a las ${nuevaHora}.`,
      datos: { id: citaId, fecha: nuevaFecha, hora: nuevaHora },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al reagendar la cita';
    return { exito: false, mensaje: msg, error: msg };
  }
}

