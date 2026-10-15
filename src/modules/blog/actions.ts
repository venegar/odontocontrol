'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { 
  ArticuloBlog, 
  ArticuloBlogInput, 
  ResultadoAccionBlog,
  CategoriaBlog 
} from '@/modules/blog/types';

// ==============================================================================
// ESQUEMAS DE VALIDACIÓN ZOD (ESTRICTO - SIN 'any')
// ==============================================================================

const categoriasValidas: [CategoriaBlog, ...CategoriaBlog[]] = [
  'Higiene',
  'Ortodoncia',
  'Estética',
  'Salud General',
  'Implantes',
  'Prevención',
];

export const articuloBlogZodSchema = z.object({
  titulo: z
    .string({ required_error: 'El título del artículo es obligatorio' })
    .trim()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede superar los 200 caracteres'),
  slug: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  extracto: z
    .string({ required_error: 'El extracto o resumen es obligatorio' })
    .trim()
    .min(15, 'El extracto debe tener al menos 15 caracteres')
    .max(400, 'El extracto no puede superar los 400 caracteres'),
  contenido: z
    .string({ required_error: 'El contenido del artículo es obligatorio' })
    .trim()
    .min(30, 'El contenido debe tener al menos 30 caracteres para aportar valor clínico o educativo'),
  categoria: z.enum(categoriasValidas, {
    errorMap: () => ({ message: 'Selecciona una categoría clínica válida' }),
  }),
  autor: z
    .string({ required_error: 'El nombre del autor es obligatorio' })
    .trim()
    .min(3, 'El nombre del autor debe tener al menos 3 caracteres'),
  imagenUrl: z
    .string()
    .trim()
    .url('La URL de la imagen debe ser un enlace válido')
    .optional()
    .or(z.literal('')),
  publicado: z.boolean().default(true),
  destacado: z.boolean().default(false),
  tiempoLectura: z.string().trim().optional(),
});

// Artículos de respaldo si la base de datos se encuentra en fase de migración
const ARTICULOS_RESPALDO: ArticuloBlog[] = [
  {
    id: 'art-1',
    slug: 'como-cuidar-el-esmalte-dental',
    titulo: '5 consejos prácticos para cuidar y proteger el esmalte dental',
    extracto: 'El esmalte es la capa protectora externa de tus dientes. Descubre cómo mantenerlo fuerte frente al desgaste diario y los ácidos de las comidas.',
    contenido: 'El esmalte dental es la sustancia más dura del cuerpo humano, pero una vez que se desgasta, no puede regenerarse de forma natural. Para preservarlo adecuadamente: 1) Cepíllate con cerdas suaves para no generar abrasión mecánica. 2) Espera al menos 30 minutos tras ingerir cítricos o refrescos antes de cepillarte. 3) Usa pasta con flúor o hidroxiapatita para remineralizar. 4) Mantén una adecuada hidratación salival. 5) Consulta a tu odontólogo para férulas nocturnas si padeces bruxismo.',
    categoria: 'Higiene',
    autor: 'Dra. Yasmín Blanco',
    fechaPublicacion: '12 de Octubre, 2026',
    publicado: true,
    destacado: true,
    tiempoLectura: '4 min',
  },
  {
    id: 'art-2',
    slug: 'mitos-comunes-sobre-la-ortodoncia',
    titulo: 'Mitos y realidades sobre los tratamientos de ortodoncia invisible',
    extracto: '¿Duele ponerse alineadores transparentes? ¿A qué edad se recomienda? Respondemos las dudas más frecuentes sobre la alineación digital sin brackets metálicos.',
    contenido: 'La ortodoncia con alineadores invisibles ha revolucionado la estética y comodidad dental. A diferencia de los brackets tradicionales: no interfieren con la masticación ni provocan llagas por alambres desajustados. Los dientes se mueven mediante fuerzas controladas y microplanificadas digitalmente. Requieren un uso disciplinado de 22 horas al día para obtener los resultados estipulados en el estudio 3D.',
    categoria: 'Ortodoncia',
    autor: 'Dra. Laura Vega',
    fechaPublicacion: '5 de Octubre, 2026',
    publicado: true,
    destacado: false,
    tiempoLectura: '5 min',
  },
  {
    id: 'art-3',
    slug: 'importancia-de-la-limpieza-dental-periodica',
    titulo: '¿Por qué debes realizarte una profilaxis dental cada 6 meses?',
    extracto: 'Incluso con un cepillado riguroso, el sarro acumulado requiere atención profesional con ultrasonido para prevenir gingivitis y pérdida ósea.',
    contenido: 'El cálculo o sarro dental es placa bacteriana endurecida que no se retira con el cepillo común ni con hilo dental. La limpieza periódica con tecnología de ultrasonido y micropartículas Airflow elimina las colonias bacterianas subgingivales, previene el mal aliento (halitosis) y reduce a cero el riesgo de periodontitis severa.',
    categoria: 'Salud General',
    autor: 'Dra. Yasmín Blanco',
    fechaPublicacion: '28 de Septiembre, 2026',
    publicado: true,
    destacado: false,
    tiempoLectura: '3 min',
  },
  {
    id: 'art-4',
    slug: 'implantes-dentales-carga-inmediata',
    titulo: 'Implantes Dentales de Carga Inmediata: Sonríe con confianza en un solo día',
    extracto: 'Conoce la tecnología que permite colocar el implante y una corona provisional estética en una sola sesión clínica.',
    contenido: 'La técnica de carga inmediata es idónea para pacientes que desean recuperar su sonrisa sin esperar meses desdentados. Gracias a la tomografía computarizada 3D y la cirugía guiada por ordenador, el implante de titanio de alta biocompatibilidad se ancla firmemente en el hueso, permitiendo fijar una corona funcional desde el primer día.',
    categoria: 'Implantes',
    autor: 'Dra. Yasmín Blanco',
    fechaPublicacion: '15 de Septiembre, 2026',
    publicado: true,
    destacado: true,
    tiempoLectura: '6 min',
  },
];

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

/**
 * Mapea una fila de base de datos a la interfaz ArticuloBlog.
 */
interface FilaArticuloDB {
  id: string;
  slug: string;
  titulo: string;
  extracto: string;
  contenido: string;
  categoria: string;
  autor: string;
  autor_id: string | null;
  imagen_url: string | null;
  publicado: boolean;
  destacado: boolean;
  tiempo_lectura: string | null;
  creado_en: string;
  actualizado_en: string;
}

function mapearFilaABlog(fila: FilaArticuloDB): ArticuloBlog {
  const fechaObj = new Date(fila.creado_en);
  const fechaFormateada = !isNaN(fechaObj.getTime())
    ? fechaObj.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : fila.creado_en;

  return {
    id: fila.id,
    slug: fila.slug,
    titulo: fila.titulo,
    extracto: fila.extracto,
    contenido: fila.contenido,
    categoria: fila.categoria as CategoriaBlog,
    autor: fila.autor,
    autorId: fila.autor_id ?? undefined,
    fechaPublicacion: fechaFormateada,
    imagenUrl: fila.imagen_url ?? undefined,
    publicado: fila.publicado,
    destacado: fila.destacado,
    tiempoLectura: fila.tiempo_lectura ?? '5 min',
    creadoEn: fila.creado_en,
    actualizadoEn: fila.actualizado_en,
  };
}

// ==============================================================================
// SERVER ACTIONS
// ==============================================================================

/**
 * Obtiene la lista de artículos del blog desde Supabase.
 * Permite filtrar por solo publicados (para vista pública) o todos (para back end).
 */
export async function obtenerArticulosBlog(
  soloPublicados = false
): Promise<ResultadoAccionBlog<ArticuloBlog[]>> {
  try {
    let query = supabase
      .from('articulos_blog')
      .select('*')
      .order('creado_en', { ascending: false });

    if (soloPublicados) {
      query = query.eq('publicado', true);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Tabla articulos_blog aún no disponible en Supabase, usando respaldo:', error.message);
      const filtrados = soloPublicados 
        ? ARTICULOS_RESPALDO.filter(a => a.publicado)
        : ARTICULOS_RESPALDO;
      return {
        exito: true,
        mensaje: 'Artículos cargados en modo local/respaldo.',
        datos: filtrados,
      };
    }

    if (!data || data.length === 0) {
      const filtrados = soloPublicados 
        ? ARTICULOS_RESPALDO.filter(a => a.publicado)
        : ARTICULOS_RESPALDO;
      return {
        exito: true,
        mensaje: 'Artículos iniciales precargados.',
        datos: filtrados,
      };
    }

    const articulos = (data as unknown as FilaArticuloDB[]).map(mapearFilaABlog);
    return {
      exito: true,
      mensaje: `Se recuperaron ${articulos.length} artículos del blog.`,
      datos: articulos,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al obtener artículos';
    console.error('Error en obtenerArticulosBlog:', err);
    return {
      exito: true,
      mensaje: 'Artículos cargados en modo de respaldo.',
      datos: soloPublicados ? ARTICULOS_RESPALDO.filter(a => a.publicado) : ARTICULOS_RESPALDO,
      error: msg,
    };
  }
}

/**
 * Obtiene un artículo específico por su slug.
 */
export async function obtenerArticuloPorSlug(
  slug: string
): Promise<ResultadoAccionBlog<ArticuloBlog | null>> {
  try {
    const { data, error } = await supabase
      .from('articulos_blog')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      const encontrado = ARTICULOS_RESPALDO.find(a => a.slug === slug) ?? null;
      return {
        exito: Boolean(encontrado),
        mensaje: encontrado ? 'Artículo encontrado' : 'Artículo no encontrado',
        datos: encontrado,
      };
    }

    return {
      exito: true,
      mensaje: 'Artículo recuperado con éxito.',
      datos: mapearFilaABlog(data as unknown as FilaArticuloDB),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al consultar artículo';
    return {
      exito: false,
      mensaje: 'No fue posible encontrar el artículo.',
      datos: null,
      error: msg,
    };
  }
}

/**
 * Crea un nuevo artículo de blog en el back end.
 * Valida los datos con Zod y genera el slug automáticamente si no se suministra.
 */
export async function crearArticuloBlog(
  datos: ArticuloBlogInput
): Promise<ResultadoAccionBlog<ArticuloBlog>> {
  // 1. Validación Zod
  const validacion = articuloBlogZodSchema.safeParse(datos);

  if (!validacion.success) {
    const detalleError = validacion.error.errors
      .map(e => `${e.path.join('.')}: ${e.message}`)
      .join('; ');
    return {
      exito: false,
      mensaje: 'Los datos del artículo contienen errores.',
      error: detalleError,
    };
  }

  const datosValidados = validacion.data;
  const slugFinal = datosValidados.slug && datosValidados.slug.length > 2
    ? generarSlug(datosValidados.slug)
    : generarSlug(datosValidados.titulo);

  // Calcular tiempo de lectura si no fue provisto
  const palabras = datosValidados.contenido.trim().split(/\s+/).length;
  const minutosLectura = Math.max(1, Math.ceil(palabras / 180));
  const tiempoLecturaFinal = datosValidados.tiempoLectura || `${minutosLectura} min`;

  try {
    const payload = {
      slug: slugFinal,
      titulo: datosValidados.titulo,
      extracto: datosValidados.extracto,
      contenido: datosValidados.contenido,
      categoria: datosValidados.categoria,
      autor: datosValidados.autor,
      imagen_url: datosValidados.imagenUrl || null,
      publicado: datosValidados.publicado ?? true,
      destacado: datosValidados.destacado ?? false,
      tiempo_lectura: tiempoLecturaFinal,
    };

    const { data, error } = await supabase
      .from('articulos_blog')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('Error al insertar en articulos_blog de Supabase:', error);
      return {
        exito: false,
        mensaje: `Error en base de datos: ${error.message}`,
        error: error.message,
      };
    }

    const articuloCreado = mapearFilaABlog(data as unknown as FilaArticuloDB);

    // Revalidar rutas afectadas para reflejar el artículo en tiempo real
    revalidatePath('/blog');
    revalidatePath('/dashboard/blog');
    revalidatePath('/');

    return {
      exito: true,
      mensaje: 'Artículo publicado y registrado exitosamente en el blog.',
      datos: articuloCreado,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error inesperado al crear artículo';
    console.error('Excepción en crearArticuloBlog:', err);
    return {
      exito: false,
      mensaje: 'Ocurrió un error al guardar el artículo.',
      error: msg,
    };
  }
}

/**
 * Actualiza un artículo existente en el blog.
 */
export async function actualizarArticuloBlog(
  id: string,
  datos: Partial<ArticuloBlogInput>
): Promise<ResultadoAccionBlog<ArticuloBlog>> {
  if (!id || id.trim() === '') {
    return {
      exito: false,
      mensaje: 'El identificador del artículo es requerido.',
    };
  }

  try {
    const payloadUpdate: Record<string, unknown> = {
      actualizado_en: new Date().toISOString(),
    };

    if (datos.titulo !== undefined) payloadUpdate.titulo = datos.titulo.trim();
    if (datos.slug !== undefined) payloadUpdate.slug = generarSlug(datos.slug);
    if (datos.extracto !== undefined) payloadUpdate.extracto = datos.extracto.trim();
    if (datos.contenido !== undefined) {
      payloadUpdate.contenido = datos.contenido.trim();
      const palabras = datos.contenido.trim().split(/\s+/).length;
      payloadUpdate.tiempo_lectura = `${Math.max(1, Math.ceil(palabras / 180))} min`;
    }
    if (datos.categoria !== undefined) payloadUpdate.categoria = datos.categoria;
    if (datos.autor !== undefined) payloadUpdate.autor = datos.autor.trim();
    if (datos.imagenUrl !== undefined) payloadUpdate.imagen_url = datos.imagenUrl || null;
    if (datos.publicado !== undefined) payloadUpdate.publicado = datos.publicado;
    if (datos.destacado !== undefined) payloadUpdate.destacado = datos.destacado;
    if (datos.tiempoLectura !== undefined) payloadUpdate.tiempo_lectura = datos.tiempoLectura;

    const { data, error } = await supabase
      .from('articulos_blog')
      .update(payloadUpdate)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error al actualizar artículo en Supabase:', error);
      return {
        exito: false,
        mensaje: `No se pudo actualizar el artículo: ${error.message}`,
        error: error.message,
      };
    }

    const actualizado = mapearFilaABlog(data as unknown as FilaArticuloDB);

    revalidatePath('/blog');
    revalidatePath('/dashboard/blog');

    return {
      exito: true,
      mensaje: 'Artículo actualizado exitosamente.',
      datos: actualizado,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al actualizar artículo';
    return {
      exito: false,
      mensaje: 'Ocurrió un error al actualizar el artículo.',
      error: msg,
    };
  }
}

/**
 * Elimina un artículo del blog.
 */
export async function eliminarArticuloBlog(
  id: string
): Promise<ResultadoAccionBlog<boolean>> {
  if (!id) {
    return { exito: false, mensaje: 'ID de artículo requerido' };
  }

  try {
    const { error } = await supabase
      .from('articulos_blog')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar artículo de Supabase:', error);
      return {
        exito: false,
        mensaje: `Error al eliminar el artículo: ${error.message}`,
        error: error.message,
      };
    }

    revalidatePath('/blog');
    revalidatePath('/dashboard/blog');

    return {
      exito: true,
      mensaje: 'El artículo ha sido eliminado del blog correctamente.',
      datos: true,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error inesperado al eliminar';
    return {
      exito: false,
      mensaje: 'Fallo al eliminar el artículo.',
      error: msg,
    };
  }
}

/**
 * Alterna el estado de publicación (publicado / borrador) de un artículo.
 */
export async function togglePublicacionArticulo(
  id: string,
  nuevoEstado: boolean
): Promise<ResultadoAccionBlog<boolean>> {
  return actualizarArticuloBlog(id, { publicado: nuevoEstado })
    .then(res => ({
      exito: res.exito,
      mensaje: nuevoEstado ? 'Artículo publicado en la web.' : 'Artículo cambiado a borrador.',
      datos: res.exito,
      error: res.error,
    }));
}
