export type NivelPatrocinio = 'premium' | 'oro' | 'aliado_tecnologico';

export interface Patrocinador {
  id: string;
  nombre: string;
  logoUrl: string; // URL pública, SVG o Data URL base64
  sitioWeb?: string;
  categoria: string;
  descripcionCorta: string;
  descripcionDetallada?: string;
  beneficiosPacientes?: string[];
  nivelPatrocinio: NivelPatrocinio;
  activo: boolean;
  fechaCreacion?: string;
  creadoPor?: string;
}

export interface FormularioPatrocinadorInput {
  nombre: string;
  logoUrl: string;
  sitioWeb?: string;
  categoria: string;
  descripcionCorta: string;
  descripcionDetallada?: string;
  beneficiosPacientes?: string[];
  nivelPatrocinio: NivelPatrocinio;
  activo: boolean;
}
