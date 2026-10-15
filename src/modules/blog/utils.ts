/**
 * Utilidades puras para el módulo de Blog
 */

/**
 * Genera un slug limpio y amigable para SEO a partir de una cadena de texto.
 */
export function generarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
