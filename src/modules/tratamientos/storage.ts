// ==============================================================================
// GESTOR DE ALMACENAMIENTO Y SINCRONIZACIÓN DE TRATAMIENTOS
// Consultorio Odontológico Dra. Yasmín Blanco
// ==============================================================================

import { Tratamiento, TratamientoInput } from './types';
import { TRATAMIENTOS_INICIALES } from './datos';

export const STORAGE_KEY_TRATAMIENTOS = 'consultorio_tratamientos_v2';
export const EVENTO_TRATAMIENTOS_ACTUALIZADOS = 'consultorio_tratamientos_actualizados';

/**
 * Obtiene la lista actual de tratamientos desde localStorage o los iniciales por defecto.
 */
export function obtenerTratamientos(): Tratamiento[] {
  if (typeof window === 'undefined') {
    return TRATAMIENTOS_INICIALES;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRATAMIENTOS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error al leer tratamientos desde localStorage:', error);
  }

  // Si no hay datos guardados, guardamos y devolvemos los iniciales
  try {
    localStorage.setItem(STORAGE_KEY_TRATAMIENTOS, JSON.stringify(TRATAMIENTOS_INICIALES));
  } catch (e) {
    // Silencioso en caso de error de cuota
  }

  return TRATAMIENTOS_INICIALES;
}

/**
 * Guarda la lista completa de tratamientos en localStorage y despacha el evento de actualización.
 */
export function guardarTratamientos(tratamientos: Tratamiento[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY_TRATAMIENTOS, JSON.stringify(tratamientos));
    window.dispatchEvent(new CustomEvent(EVENTO_TRATAMIENTOS_ACTUALIZADOS, { detail: tratamientos }));
  } catch (error) {
    console.error('Error al guardar tratamientos en localStorage:', error);
  }
}

/**
 * Agrega o actualiza un tratamiento individual.
 */
export function guardarTratamiento(
  datos: TratamientoInput & { id?: string }
): { exito: boolean; mensaje: string; tratamientos: Tratamiento[] } {
  const listaActual = obtenerTratamientos();
  const fechaHoy = new Date().toISOString().split('T')[0];

  let listaNueva: Tratamiento[];
  let mensaje: string;

  if (datos.id) {
    // Edición de tratamiento existente
    const index = listaActual.findIndex(t => t.id === datos.id);
    if (index === -1) {
      return {
        exito: false,
        mensaje: 'El tratamiento solicitado para edición no fue encontrado en el catálogo.',
        tratamientos: listaActual,
      };
    }

    const tratamientoActualizado: Tratamiento = {
      ...listaActual[index],
      ...datos,
      id: datos.id,
      ultimaModificacion: fechaHoy,
    };

    listaNueva = [...listaActual];
    listaNueva[index] = tratamientoActualizado;
    mensaje = `El tratamiento "${tratamientoActualizado.nombre}" ha sido actualizado correctamente.`;
  } else {
    // Creación de nuevo tratamiento
    const nuevoTratamiento: Tratamiento = {
      ...datos,
      id: `trat-${Date.now()}`,
      fechaCreacion: fechaHoy,
      ultimaModificacion: fechaHoy,
    };

    listaNueva = [nuevoTratamiento, ...listaActual];
    mensaje = `El nuevo tratamiento "${nuevoTratamiento.nombre}" se agregó exitosamente al catálogo.`;
  }

  guardarTratamientos(listaNueva);
  return {
    exito: true,
    mensaje,
    tratamientos: listaNueva,
  };
}

/**
 * Elimina un tratamiento del catálogo por su ID.
 */
export function eliminarTratamiento(id: string): { exito: boolean; mensaje: string; tratamientos: Tratamiento[] } {
  const listaActual = obtenerTratamientos();
  const tratamiento = listaActual.find(t => t.id === id);

  if (!tratamiento) {
    return {
      exito: false,
      mensaje: 'El tratamiento no fue encontrado para su eliminación.',
      tratamientos: listaActual,
    };
  }

  const listaNueva = listaActual.filter(t => t.id !== id);
  guardarTratamientos(listaNueva);

  return {
    exito: true,
    mensaje: `Se ha eliminado el tratamiento "${tratamiento.nombre}" del catálogo.`,
    tratamientos: listaNueva,
  };
}

/**
 * Restablece los tratamientos al catálogo base predeterminado.
 */
export function restablecerTratamientosDefault(): Tratamiento[] {
  guardarTratamientos(TRATAMIENTOS_INICIALES);
  return TRATAMIENTOS_INICIALES;
}
