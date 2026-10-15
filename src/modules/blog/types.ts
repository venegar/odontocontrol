export type CategoriaBlog = 
  | 'Higiene' 
  | 'Ortodoncia' 
  | 'Estética' 
  | 'Salud General' 
  | 'Implantes' 
  | 'Prevención';

export interface ArticuloBlog {
  id: string;
  slug: string;
  titulo: string;
  extracto: string;
  contenido: string;
  categoria: CategoriaBlog;
  autor: string;
  autorId?: string;
  fechaPublicacion: string;
  imagenUrl?: string;
  publicado: boolean;
  destacado?: boolean;
  tiempoLectura?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface ArticuloBlogInput {
  slug?: string;
  titulo: string;
  extracto: string;
  contenido: string;
  categoria: CategoriaBlog;
  autor: string;
  imagenUrl?: string;
  publicado?: boolean;
  destacado?: boolean;
  tiempoLectura?: string;
}

export interface ResultadoAccionBlog<T = unknown> {
  exito: boolean;
  mensaje: string;
  datos?: T;
  error?: string;
}
