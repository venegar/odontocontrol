export interface ArticuloBlog {
  id: string;
  slug: string;
  titulo: string;
  extracto: string;
  contenido: string;
  categoria: 'Higiene' | 'Ortodoncia' | 'Estética' | 'Salud General';
  autor: string;
  fechaPublicacion: string;
  imagenUrl?: string;
}
