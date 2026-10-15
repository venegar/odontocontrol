import { VariablesCita } from './types';

/**
 * Reemplaza las variables tipo {{variable}} dentro de una plantilla de texto.
 */
export function interpolarMensaje(plantilla: string, variables: VariablesCita): string {
  let resultado = plantilla;
  for (const [clave, valor] of Object.entries(variables)) {
    const patron = new RegExp(`{{${clave}}}`, 'g');
    resultado = resultado.replace(patron, valor);
  }
  return resultado;
}

/**
 * Limpia y normaliza el número de teléfono para la API de WhatsApp Web/App.
 * Si es un número colombiano de 10 dígitos (ej. 3101234567), le añade el prefijo 57.
 */
export function normalizarTelefonoWhatsApp(telefono: string): string {
  // Eliminar espacios, guiones, paréntesis y signos de más
  let limpio = telefono.replace(/[\s\-\(\)\+]/g, '');

  // Si tiene 10 dígitos y empieza por 3 (celular Colombia), agregar 57
  if (limpio.length === 10 && limpio.startsWith('3')) {
    limpio = `57${limpio}`;
  }

  return limpio;
}

/**
 * Genera el enlace directo funcional para abrir WhatsApp con el mensaje precargado.
 */
export function generarEnlaceWhatsApp(telefono: string, mensaje: string): string {
  const telNormalizado = normalizarTelefonoWhatsApp(telefono);
  const textoCodificado = encodeURIComponent(mensaje);
  return `https://wa.me/${telNormalizado}?text=${textoCodificado}`;
}

/**
 * Genera los enlaces oficiales con tracking automático para que el paciente
 * vea los detalles, confirme, reagende o cancele su cita.
 */
export function generarEnlacesAccionCita(
  citaId: string, 
  baseUrl = 'https://odontocontrol-ashen.vercel.app',
  canal: 'whatsapp' | 'email' = 'whatsapp'
) {
  const rutaTracking = `${baseUrl}/api/recordatorios/tracking`;
  const citaEncoded = encodeURIComponent(citaId);
  return {
    verCita: `${rutaTracking}?citaId=${citaEncoded}&canal=${canal}&accion=ver`,
    confirmar: `${rutaTracking}?citaId=${citaEncoded}&canal=${canal}&accion=confirmar`,
    reagendar: `${rutaTracking}?citaId=${citaEncoded}&canal=${canal}&accion=reagendar`,
    cancelar: `${rutaTracking}?citaId=${citaEncoded}&canal=${canal}&accion=cancelar`,
    portalDirecto: `${baseUrl}/portal-paciente?citaId=${citaEncoded}`,
  };
}

/**
 * Genera un enlace mailto para abrir el gestor de correo preconfigurado.
 */
export function generarEnlaceEmail(destinatario: string, asunto: string, cuerpo: string): string {
  const dest = encodeURIComponent(destinatario || '');
  const asu = encodeURIComponent(asunto || '');
  const cue = encodeURIComponent(cuerpo || '');
  return `mailto:${dest}?subject=${asu}&body=${cue}`;
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD según la zona horaria local.
 */
export function obtenerFechaHoy(): string {
  const d = new Date();
  const anio = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/**
 * Obtiene la fecha del día siguiente (mañana) en formato YYYY-MM-DD.
 */
export function obtenerFechaManana(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const anio = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/**
 * Formatea una fecha YYYY-MM-DD a texto legible en español (ej. "Jueves, 15 de octubre").
 */
export function formatearFechaEspanol(fechaStr: string): string {
  if (!fechaStr) return '';
  const partes = fechaStr.split('-');
  if (partes.length !== 3) return fechaStr;
  const fecha = new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
  return fecha.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

