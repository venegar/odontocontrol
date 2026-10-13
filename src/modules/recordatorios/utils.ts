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
