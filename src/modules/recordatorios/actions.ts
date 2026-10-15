'use server';

import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { 
  DatosEnvioRecordatorio, 
  ResultadoEnvioRecordatorio 
} from './types';
import { 
  recordatorioEmailSchema, 
  recordatorioWhatsAppSchema 
} from './validations';
import { 
  formatearFechaEspanol, 
  generarEnlaceWhatsApp, 
  generarEnlaceEmail, 
  generarEnlacesAccionCita,
  normalizarTelefonoWhatsApp
} from './utils';
import { generarPlantillaEmailHtml } from './plantillaEmail';
import { DATOS_CONSULTORIO_DEFAULT } from '@/modules/configuracion/consultorioService';

/**
 * Validador auxiliar de UUID estándar de PostgreSQL.
 */
function esUuidValido(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Registra el evento de notificación en Supabase (tabla public.recordatorios y tabla public.citas).
 */
async function registrarEnvioEnSupabase(
  citaId: string,
  tipo: 'whatsapp' | 'email',
  destinatario: string,
  mensaje: string,
  estado: 'enviado' | 'fallido' | 'pendiente',
  errorDetalle?: string
): Promise<void> {
  try {
    const esUuid = esUuidValido(citaId);

    // Si la cita tiene un UUID real de base de datos, guardar en public.recordatorios
    if (esUuid) {
      await supabase.from('recordatorios').insert({
        cita_id: citaId,
        tipo,
        destinatario,
        mensaje,
        programado_para: new Date().toISOString(),
        estado,
        enviado_en: estado === 'enviado' ? new Date().toISOString() : null,
        error_detalle: errorDetalle || null,
      });

      // Actualizar timestamp en la tabla citas para reflejar la última gestión
      await supabase.from('citas').update({
        actualizado_en: new Date().toISOString(),
      }).eq('id', citaId);
    }
  } catch (err) {
    // No interrumpir el flujo si la tabla aún no tiene RLS permisivo para anónimos
    console.warn('Registro de recordatorio en Supabase:', err);
  }
}

/**
 * SERVER ACTION: Enviar Recordatorio por Correo Electrónico
 * 1. Valida los datos con Zod.
 * 2. Si existe RESEND_API_KEY, realiza el envío real desde el servidor.
 * 3. Si no existe o falla el servicio, activa el respaldo inteligente mailto:.
 * 4. Actualiza el estado en Supabase.
 */
export async function enviarRecordatorioEmailAction(
  datos: DatosEnvioRecordatorio
): Promise<ResultadoEnvioRecordatorio> {
  // 1. Validación estricta con Zod
  const validacion = recordatorioEmailSchema.safeParse(datos);
  if (!validacion.success) {
    const errores = validacion.error.errors.map((e) => e.message);
    return {
      exito: false,
      canal: 'email',
      metodo: 'resend',
      mensaje: `Validación fallida: ${errores.join(', ')}`,
      erroresValidacion: errores,
    };
  }

  const datosValidos = validacion.data;
  const clinicaNombre = DATOS_CONSULTORIO_DEFAULT.nombreConsultorio;
  const clinicaDireccion = DATOS_CONSULTORIO_DEFAULT.direccion;
  const clinicaTelefono = DATOS_CONSULTORIO_DEFAULT.telefonoPrincipal;

  // Generar contenido del correo (HTML corporativo y texto plano)
  const plantilla = generarPlantillaEmailHtml({
    pacienteNombre: datosValidos.pacienteNombre,
    doctorNombre: datosValidos.doctorNombre,
    tratamiento: datosValidos.tratamiento,
    fechaCita: datosValidos.fechaCita,
    horaCita: datosValidos.horaCita,
    citaId: datosValidos.citaId,
    clinicaNombre,
    clinicaDireccion,
    clinicaTelefono,
  });

  const apiKeyResend = process.env.RESEND_API_KEY;

  // 2. Intentar envío con Resend si la API Key está configurada
  if (apiKeyResend && apiKeyResend.trim() !== '') {
    try {
      const resend = new Resend(apiKeyResend);
      const remitente = process.env.RESEND_FROM_EMAIL || 'OdontoControl <onboarding@resend.dev>';

      const resultado = await resend.emails.send({
        from: remitente,
        to: [datosValidos.pacienteEmail],
        subject: plantilla.asunto,
        html: plantilla.html,
        text: plantilla.textoPlano,
      });

      if (resultado.error) {
        throw new Error(resultado.error.message || 'Error desconocido al despachar con Resend');
      }

      // 3. Registrar éxito en Supabase
      await registrarEnvioEnSupabase(
        datosValidos.citaId,
        'email',
        datosValidos.pacienteEmail,
        plantilla.textoPlano,
        'enviado'
      );

      return {
        exito: true,
        canal: 'email',
        metodo: 'resend',
        idEnvio: resultado.data?.id,
        mensaje: `Correo enviado exitosamente a ${datosValidos.pacienteEmail} a través de Resend.`,
      };
    } catch (err: unknown) {
      const mensajeError = err instanceof Error ? err.message : 'Error al conectar con Resend';
      console.warn('Fallo en Resend, activando respaldo mailto:', mensajeError);

      // Registrar intento con error en Supabase
      await registrarEnvioEnSupabase(
        datosValidos.citaId,
        'email',
        datosValidos.pacienteEmail,
        plantilla.textoPlano,
        'fallido',
        mensajeError
      );

      // Respaldo inmediato: generar mailto y enlace web de Gmail
      const mailtoUrl = generarEnlaceEmail(
        datosValidos.pacienteEmail,
        plantilla.asunto,
        plantilla.textoPlano
      );
      const urlGmailWeb = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(datosValidos.pacienteEmail)}&su=${encodeURIComponent(plantilla.asunto)}&body=${encodeURIComponent(plantilla.textoPlano)}`;

      return {
        exito: true,
        canal: 'email',
        metodo: 'mailto',
        urlAccion: mailtoUrl,
        urlGmailWeb,
        mensaje: `Resend en modo prueba requiere dominio propio. Se abrió la redacción en Gmail Web / correo para ${datosValidos.pacienteEmail}.`,
      };
    }
  }

  // 4. Si no hay API Key de Resend, usar respaldo mailto directo y Gmail Web
  const mailtoUrl = generarEnlaceEmail(
    datosValidos.pacienteEmail,
    plantilla.asunto,
    plantilla.textoPlano
  );
  const urlGmailWeb = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(datosValidos.pacienteEmail)}&su=${encodeURIComponent(plantilla.asunto)}&body=${encodeURIComponent(plantilla.textoPlano)}`;

  await registrarEnvioEnSupabase(
    datosValidos.citaId,
    'email',
    datosValidos.pacienteEmail,
    plantilla.textoPlano,
    'enviado'
  );

  return {
    exito: true,
    canal: 'email',
    metodo: 'mailto',
    urlAccion: mailtoUrl,
    urlGmailWeb,
    mensaje: `Abriendo cliente de correo electrónico para ${datosValidos.pacienteEmail}.`,
  };
}

/**
 * SERVER ACTION: Enviar / Generar Recordatorio por WhatsApp
 * 1. Valida los datos con Zod (teléfono móvil colombiano obligatorio).
 * 2. Si existe WhatsApp Cloud API configurada en entorno, realiza el despacho directo.
 * 3. En caso contrario, genera el enlace inteligente wa.me oficial con los 3 enlaces de autogestión.
 * 4. Actualiza el estado en Supabase.
 */
export async function enviarRecordatorioWhatsAppAction(
  datos: DatosEnvioRecordatorio
): Promise<ResultadoEnvioRecordatorio> {
  // 1. Validación estricta con Zod
  const validacion = recordatorioWhatsAppSchema.safeParse(datos);
  if (!validacion.success) {
    const errores = validacion.error.errors.map((e) => e.message);
    return {
      exito: false,
      canal: 'whatsapp',
      metodo: 'wa.me',
      mensaje: `Validación fallida: ${errores.join(', ')}`,
      erroresValidacion: errores,
    };
  }

  const datosValidos = validacion.data;
  const telNormalizado = normalizarTelefonoWhatsApp(datosValidos.pacienteTelefono);
  const clinicaNombre = DATOS_CONSULTORIO_DEFAULT.nombreConsultorio;
  const clinicaDireccion = DATOS_CONSULTORIO_DEFAULT.direccion;
  const clinicaTelefono = DATOS_CONSULTORIO_DEFAULT.telefonoPrincipal;

  const enlaces = generarEnlacesAccionCita(datosValidos.citaId);
  const fechaLegible = formatearFechaEspanol(datosValidos.fechaCita);

  const mensajeWhatsApp = [
    `¡Hola ${datosValidos.pacienteNombre}! 👋`,
    `Te recordamos tu cita odontológica para *${fechaLegible} a las ${datosValidos.horaCita}* en *${clinicaNombre}*.`,
    '',
    `• Especialista: ${datosValidos.doctorNombre}`,
    `• Tratamiento: ${datosValidos.tratamiento}`,
    `• Sede: ${clinicaDireccion}`,
    '',
    '👉 *Opciones de autogestión en 1 clic:*',
    `✅ Confirmar Asistencia: ${enlaces.confirmar}`,
    `🔄 Solicitar Reagendamiento: ${enlaces.reagendar}`,
    `❌ Cancelar Cita: ${enlaces.cancelar}`,
    '',
    `Si tienes dudas, contáctanos al ${clinicaTelefono}. ¡Te esperamos!`,
  ].join('\n');

  // 2. Estructura preparada para WhatsApp Cloud API oficial de Meta si se configuran variables
  const cloudToken = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (cloudToken && phoneId) {
    try {
      const respuestaMeta = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cloudToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: telNormalizado,
          type: 'text',
          text: { preview_url: true, body: mensajeWhatsApp },
        }),
      });

      const dataMeta = await respuestaMeta.json();
      if (!respuestaMeta.ok) {
        throw new Error(dataMeta?.error?.message || 'Error en WhatsApp Cloud API');
      }

      await registrarEnvioEnSupabase(
        datosValidos.citaId,
        'whatsapp',
        telNormalizado,
        mensajeWhatsApp,
        'enviado'
      );

      return {
        exito: true,
        canal: 'whatsapp',
        metodo: 'cloud_api',
        idEnvio: dataMeta?.messages?.[0]?.id,
        mensaje: `Recordatorio enviado automáticamente por WhatsApp Cloud API al +${telNormalizado}.`,
      };
    } catch (err: unknown) {
      console.warn('Fallo en WhatsApp Cloud API, fallback a wa.me:', err);
    }
  }

  // 3. Método universal wa.me y web.whatsapp.com
  const urlWhatsApp = generarEnlaceWhatsApp(telNormalizado, mensajeWhatsApp);
  const textoCodificado = encodeURIComponent(mensajeWhatsApp);
  const urlWhatsAppWeb = `https://web.whatsapp.com/send?phone=${telNormalizado}&text=${textoCodificado}`;
  const urlApiWhatsApp = `https://api.whatsapp.com/send?phone=${telNormalizado}&text=${textoCodificado}`;

  // Registrar envío en Supabase
  await registrarEnvioEnSupabase(
    datosValidos.citaId,
    'whatsapp',
    telNormalizado,
    mensajeWhatsApp,
    'enviado'
  );

  return {
    exito: true,
    canal: 'whatsapp',
    metodo: 'wa.me',
    urlAccion: urlWhatsApp,
    urlWhatsAppWeb,
    urlApiWhatsApp,
    mensajeTexto: mensajeWhatsApp,
    mensaje: `Enlace de WhatsApp generado y registrado para +${telNormalizado}.`,
  };
}
