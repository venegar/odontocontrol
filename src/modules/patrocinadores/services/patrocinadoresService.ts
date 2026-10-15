import { Patrocinador, FormularioPatrocinadorInput } from '../types';

// Marcas de referencia internacional en odontología avanzada con logos SVG vectoriales limpios
export const PATROCINADORES_INICIALES: Patrocinador[] = [
  {
    id: 'pat-1',
    nombre: 'Straumann Group',
    logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" fill="none"><rect width="240" height="70" rx="12" fill="%230F2A38"/><path d="M30 46V24h7l10 13V24h6v22h-7L36 33v13h-6z" fill="%23FFFFFF"/><circle cx="68" cy="35" r="7" fill="%23148B8B"/><text x="86" y="42" font-family="Arial, sans-serif" font-weight="900" font-size="20" fill="%23FFFFFF">straumann</text><text x="86" y="52" font-family="Arial, sans-serif" font-weight="600" font-size="9" fill="%2366B2B2" letter-spacing="1">GROUP • IMPLANTS</text></svg>',
    sitioWeb: 'https://www.straumann.com',
    categoria: 'Implantes & Regeneración Tisular',
    descripcionCorta: 'Líder suizo en implantología de titanio Roxolid® y superficies SLActive® con osteointegración acelerada.',
    descripcionDetallada: 'Straumann es el estándar de oro en bioingeniería dental. Provee los implantes de mayor biocompatibilidad del mercado mundial, permitiendo tiempos de cicatrización reducidos a la mitad y máxima preservación de hueso alveolar.',
    beneficiosPacientes: [
      'Garantía biológica de por vida en implantes de titanio y zirconio',
      'Cicatrización ósea acelerada en solo 3 a 4 semanas',
      'Compatibilidad comprobada en pacientes diabéticos y fumadores',
      'Diseño anatómico sin dolor ni pérdida ósea marginal'
    ],
    nivelPatrocinio: 'premium',
    activo: true,
    fechaCreacion: '15 de Octubre, 2026',
    creadoPor: 'Dra. Yasmín Blanco (Directora Médica)'
  },
  {
    id: 'pat-2',
    nombre: 'Invisalign® Align Tech',
    logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" fill="none"><rect width="240" height="70" rx="12" fill="%231B2A32"/><path d="M32 25l12 10-12 10" stroke="%23148B8B" stroke-width="4" stroke-linecap="round"/><path d="M48 25l12 10-12 10" stroke="%2366B2B2" stroke-width="4" stroke-linecap="round"/><text x="75" y="40" font-family="Arial, sans-serif" font-weight="900" font-size="21" fill="%23FFFFFF">invisalign</text><text x="76" y="52" font-family="Arial, sans-serif" font-weight="700" font-size="8.5" fill="%2366B2B2" letter-spacing="1.5">CLINICAL PARTNER</text></svg>',
    sitioWeb: 'https://www.invisalign.com',
    categoria: 'Ortodoncia Invisible & Escáner 3D',
    descripcionCorta: 'Alineadores transparentes con tecnología SmartTrack® y planificación virtual de sonrisa ClinCheck®.',
    descripcionDetallada: 'Como clínica certificada Invisalign Diamond Provider, la Dra. Yasmín Blanco planifica cada movimiento dental con escáner intraoral iTero Element 5D sin pastas incómodas y con visualización 3D inmediata del resultado final antes de iniciar.',
    beneficiosPacientes: [
      'Sin brackets metálicos ni heridas en encías o labios',
      'Removibles para comer cómodamente y mantener higiene perfecta',
      'Simulación 3D del resultado exacto antes de colocarlos',
      'Citas de control más rápidas y espaciadas cada 6-8 semanas'
    ],
    nivelPatrocinio: 'premium',
    activo: true,
    fechaCreacion: '15 de Octubre, 2026',
    creadoPor: 'Dra. Yasmín Blanco (Directora Médica)'
  },
  {
    id: 'pat-3',
    nombre: '3M Oral Care',
    logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" fill="none"><rect width="240" height="70" rx="12" fill="%23222831"/><path d="M30 46V24h18c4 0 7 2 7 5s-2 5-5 5c4 0 7 2 7 6s-3 6-8 6H30zm6-14h10c2 0 3-1 3-2s-1-2-3-2H36v4zm0 9h11c2 0 4-1 4-2.5s-2-2.5-4-2.5H36v5z" fill="%23D32F2F"/><path d="M60 46V24h8l6 14 6-14h8v22h-6V32l-6 13h-4l-6-13v14h-6z" fill="%23D32F2F"/><text x="100" y="38" font-family="Arial, sans-serif" font-weight="900" font-size="19" fill="%23FFFFFF">Oral Care</text><text x="100" y="50" font-family="Arial, sans-serif" font-weight="600" font-size="8.5" fill="%23A5B1B8" letter-spacing="1">BIOMATERIALS & RESINS</text></svg>',
    sitioWeb: 'https://www.3m.com/oralcare',
    categoria: 'Biomateriales & Nanotecnología Estética',
    descripcionCorta: 'Resinas nanohíbridas Filtek™ Supreme y adhesivos de máxima fuerza de unión para restauraciones invisibles.',
    descripcionDetallada: 'Las resinas compuestas de 3M poseen nanopartículas cerámicas que mimetizan el brillo natural, fluorescencia y translucidez del esmalte dental biológico, ofreciendo restauraciones imperceptibles y resistentes a fracturas.',
    beneficiosPacientes: [
      'Estética idéntica al diente natural con pulido de larga duración',
      'Alta resistencia a la masticación en molares y premolares',
      'Sin sensibilidad postoperatoria gracias a adhesivos hidrófilos',
      'Excelente retención de brillo que previene manchas de café o té'
    ],
    nivelPatrocinio: 'oro',
    activo: true,
    fechaCreacion: '15 de Octubre, 2026',
    creadoPor: 'Dra. Yasmín Blanco (Directora Médica)'
  },
  {
    id: 'pat-4',
    nombre: 'Dentsply Sirona',
    logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" fill="none"><rect width="240" height="70" rx="12" fill="%231E293B"/><circle cx="45" cy="35" r="14" fill="%23148B8B"/><path d="M45 27v16M37 35h16" stroke="%23FFFFFF" stroke-width="3" stroke-linecap="round"/><text x="70" y="38" font-family="Arial, sans-serif" font-weight="900" font-size="18" fill="%23FFFFFF">Dentsply</text><text x="154" y="38" font-family="Arial, sans-serif" font-weight="400" font-size="18" fill="%2366B2B2">Sirona</text><text x="70" y="50" font-family="Arial, sans-serif" font-weight="600" font-size="8.5" fill="%2394A3B8" letter-spacing="1">DIGITAL DENTISTRY CAD/CAM</text></svg>',
    sitioWeb: 'https://www.dentsplysirona.com',
    categoria: 'Sistemas CAD/CAM & Radiología 3D',
    descripcionCorta: 'Tecnología digital CEREC® para coronas y carillas cerámicas en una sola sesión clínica.',
    descripcionDetallada: 'Dentsply Sirona suministra los centros de fresado de alta precisión y tomografía Cone Beam de baja radiación de nuestro consultorio, posibilitando confeccionar restauraciones cerámicas de disilicato de litio en el mismo día.',
    beneficiosPacientes: [
      'Coronas definitivas confeccionadas en menos de 2 horas',
      'Tomografía volumétrica 3D con reducción del 80% en radiación',
      'Ajuste milimétrico guiado por computadora sin mordidas incómodas',
      'Materiales cerámicos de biocompatibilidad absoluta'
    ],
    nivelPatrocinio: 'aliado_tecnologico',
    activo: true,
    fechaCreacion: '15 de Octubre, 2026',
    creadoPor: 'Dra. Yasmín Blanco (Directora Médica)'
  },
  {
    id: 'pat-5',
    nombre: 'Geistlich Biomaterials',
    logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" fill="none"><rect width="240" height="70" rx="12" fill="%23132E35"/><path d="M30 45V25h8c5 0 8 3 8 7 0 3-2 5-5 6l6 7h-7l-5-6h-2v6h-3zm3-10h5c3 0 4-1 4-3s-1-3-4-3h-5v6z" fill="%2366B2B2"/><text x="60" y="38" font-family="Arial, sans-serif" font-weight="900" font-size="19" fill="%23FFFFFF">Geistlich</text><text x="60" y="50" font-family="Arial, sans-serif" font-weight="600" font-size="8.5" fill="%2387D3D3" letter-spacing="1">BIO-OSS® & BIO-GIDE®</text></svg>',
    sitioWeb: 'https://www.geistlich-biomaterials.com',
    categoria: 'Regeneración Ósea & Membranas de Colágeno',
    descripcionCorta: 'Biomateriales suizos Bio-Oss® para injertos óseos y preservación alveolar en cirugías e implantes.',
    descripcionDetallada: 'Geistlich es la firma de referencia en medicina regenerativa dental. Sus matrices óseas naturales Bio-Oss y membranas reabsorbibles Bio-Gide permiten reconstruir hueso donde antes era imposible colocar un implante.',
    beneficiosPacientes: [
      'Preservación de volumen facial y encías tras extracciones',
      'Reabsorción natural guiada sin necesidad de segunda cirugía',
      'Más de 30 años de ensayos clínicos demostrados en humanos',
      'Alta tasa de éxito en cirugías complejas de seno maxilar'
    ],
    nivelPatrocinio: 'oro',
    activo: true,
    fechaCreacion: '15 de Octubre, 2026',
    creadoPor: 'Dra. Yasmín Blanco (Directora Médica)'
  },
  {
    id: 'pat-6',
    nombre: 'Nobel Biocare',
    logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" fill="none"><rect width="240" height="70" rx="12" fill="%231E2022"/><circle cx="45" cy="35" r="13" stroke="%23E28743" stroke-width="3"/><path d="M45 28v14M38 35h14" stroke="%23E28743" stroke-width="2.5"/><text x="70" y="38" font-family="Arial, sans-serif" font-weight="900" font-size="18" fill="%23FFFFFF">Nobel Biocare</text><text x="70" y="50" font-family="Arial, sans-serif" font-weight="600" font-size="8.5" fill="%23E28743" letter-spacing="1">ALL-ON-4® TREATMENT</text></svg>',
    sitioWeb: 'https://www.nobelbiocare.com',
    categoria: 'Rehabilitación Oral Fija Completa',
    descripcionCorta: 'Pioneros del concepto All-on-4® para reposición total de dentadura fija en un solo día.',
    descripcionDetallada: 'Nobel Biocare desarrolló el protocolo All-on-4 para pacientes desdentados totales, posibilitando fijar una dentadura estética completa con solo 4 implantes angulados sin necesidad de largos injertos óseos.',
    beneficiosPacientes: [
      'Dientes fijos colocados el mismo día de la cirugía',
      'Solución definitiva para pacientes que no desean dentaduras postizas móviles',
      'Ahorro significativo frente a cirugías múltiples con injerto',
      'Recuperación inmediata de la masticación y la sonrisa natural'
    ],
    nivelPatrocinio: 'premium',
    activo: true,
    fechaCreacion: '15 de Octubre, 2026',
    creadoPor: 'Dra. Yasmín Blanco (Directora Médica)'
  }
];

const STORAGE_KEY_PATROCINADORES = 'dentiscare_patrocinadores_v1';

/**
 * Obtiene la lista de marcas patrocinadoras almacenadas o las iniciales.
 */
export function obtenerPatrocinadores(): Patrocinador[] {
  if (typeof window === 'undefined') {
    return PATROCINADORES_INICIALES;
  }

  try {
    const dataGuardada = localStorage.getItem(STORAGE_KEY_PATROCINADORES);
    if (dataGuardada) {
      const parsed = JSON.parse(dataGuardada);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error al recuperar patrocinadores:', error);
  }

  return PATROCINADORES_INICIALES;
}

/**
 * Guarda o añade un nuevo patrocinador en el sistema validando permisos de rol.
 */
export function agregarPatrocinador(
  input: FormularioPatrocinadorInput,
  rolUsuario: string,
  nombreUsuario: string
): { exito: boolean; mensaje: string; datos?: Patrocinador[] } {
  if (rolUsuario !== 'admin') {
    return {
      exito: false,
      mensaje: `Acceso restringido: El rol "${rolUsuario}" no tiene permisos para agregar marcas patrocinadoras. Solo la Dirección Médica o Administrador General pueden realizar esta acción.`
    };
  }

  if (!input.nombre.trim()) {
    return { exito: false, mensaje: 'El nombre de la marca patrocinadora es obligatorio.' };
  }

  if (!input.logoUrl) {
    return { exito: false, mensaje: 'Debes proporcionar o cargar el logotipo de la marca.' };
  }

  const fechaActual = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const nuevoPatrocinador: Patrocinador = {
    id: `pat-${Date.now()}`,
    nombre: input.nombre.trim(),
    logoUrl: input.logoUrl,
    sitioWeb: input.sitioWeb?.trim() || undefined,
    categoria: input.categoria.trim() || 'Equipamiento & Material Odontológico',
    descripcionCorta: input.descripcionCorta.trim(),
    descripcionDetallada: input.descripcionDetallada?.trim() || undefined,
    beneficiosPacientes: input.beneficiosPacientes && input.beneficiosPacientes.length > 0 
      ? input.beneficiosPacientes 
      : ['Tecnología certificada internacionalmente', 'Máxima seguridad y biocompatibilidad'],
    nivelPatrocinio: input.nivelPatrocinio,
    activo: input.activo !== undefined ? input.activo : true,
    fechaCreacion: fechaActual,
    creadoPor: nombreUsuario
  };

  const listaActual = obtenerPatrocinadores();
  const listaActualizada = [nuevoPatrocinador, ...listaActual];

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_PATROCINADORES, JSON.stringify(listaActualizada));
      window.dispatchEvent(new Event('patrocinadores_actualizados'));
    } catch (error) {
      console.error('Error al guardar patrocinador:', error);
      return { exito: false, mensaje: 'No fue posible guardar la marca patrocinadora en el almacenamiento local.' };
    }
  }

  return {
    exito: true,
    mensaje: `¡La marca patrocinadora "${nuevoPatrocinador.nombre}" se agregó exitosamente!`,
    datos: listaActualizada
  };
}

/**
 * Actualiza los datos de un patrocinador existente.
 */
export function actualizarPatrocinador(
  id: string,
  datosNuevos: Partial<Patrocinador>,
  rolUsuario: string
): { exito: boolean; mensaje: string; datos?: Patrocinador[] } {
  if (rolUsuario !== 'admin') {
    return {
      exito: false,
      mensaje: `Acceso restringido: El rol "${rolUsuario}" no puede editar la información de marcas patrocinadoras.`
    };
  }

  const listaActual = obtenerPatrocinadores();
  const index = listaActual.findIndex(p => p.id === id);

  if (index === -1) {
    return { exito: false, mensaje: 'No se encontró la marca patrocinadora especificada.' };
  }

  listaActual[index] = {
    ...listaActual[index],
    ...datosNuevos
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_PATROCINADORES, JSON.stringify(listaActual));
      window.dispatchEvent(new Event('patrocinadores_actualizados'));
    } catch (error) {
      console.error('Error al actualizar patrocinador:', error);
      return { exito: false, mensaje: 'Error al persistir la actualización de la marca.' };
    }
  }

  return {
    exito: true,
    mensaje: `¡La información de "${listaActual[index].nombre}" se actualizó correctamente!`,
    datos: listaActual
  };
}

/**
 * Conmuta el estado de visibilidad (Activo / Inactivo) de una marca patrocinadora.
 */
export function toggleEstadoPatrocinador(
  id: string,
  rolUsuario: string
): { exito: boolean; mensaje: string; datos?: Patrocinador[] } {
  if (rolUsuario !== 'admin') {
    return {
      exito: false,
      mensaje: 'Acceso restringido: Solo la Dirección Médica puede activar o pausar la visibilidad de patrocinadores.'
    };
  }

  const listaActual = obtenerPatrocinadores();
  const index = listaActual.findIndex(p => p.id === id);

  if (index === -1) {
    return { exito: false, mensaje: 'Marca no encontrada.' };
  }

  const nuevoEstado = !listaActual[index].activo;
  listaActual[index].activo = nuevoEstado;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_PATROCINADORES, JSON.stringify(listaActual));
      window.dispatchEvent(new Event('patrocinadores_actualizados'));
    } catch (error) {
      console.error('Error al conmutar visibilidad:', error);
      return { exito: false, mensaje: 'Error al guardar el nuevo estado.' };
    }
  }

  return {
    exito: true,
    mensaje: `La marca "${listaActual[index].nombre}" ahora está ${nuevoEstado ? 'visible' : 'oculta'} en el banner público.`,
    datos: listaActual
  };
}

/**
 * Elimina un patrocinador de la base de datos.
 */
export function eliminarPatrocinador(
  id: string,
  rolUsuario: string
): { exito: boolean; mensaje: string; datos?: Patrocinador[] } {
  if (rolUsuario !== 'admin') {
    return {
      exito: false,
      mensaje: 'Acceso restringido: Solo la Dirección Médica puede eliminar marcas patrocinadoras.'
    };
  }

  const listaActual = obtenerPatrocinadores();
  const filtrada = listaActual.filter(p => p.id !== id);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_PATROCINADORES, JSON.stringify(filtrada));
      window.dispatchEvent(new Event('patrocinadores_actualizados'));
    } catch (error) {
      console.error('Error al eliminar patrocinador:', error);
      return { exito: false, mensaje: 'Error al guardar los cambios tras la eliminación.' };
    }
  }

  return {
    exito: true,
    mensaje: 'La marca patrocinadora fue eliminada del sistema.',
    datos: filtrada
  };
}
