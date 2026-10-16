// ==============================================================================
// CATÁLOGO DE PROCEDIMIENTOS Y DATOS BASE DE PRESUPUESTOS
// Consultorio Odontológico Dra. Yasmín Blanco
// Especialista en Prostodoncia Oclusión y ATM - NIT. 45.498.143-6
// ==============================================================================

import { ProcedimientoCatalogo, Presupuesto } from './types';

// Datos institucionales del membrete oficial
export const DATOS_ESPECIALISTA_DEFECTO = {
  nombre: 'YASMIN BLANCO ESCORCIA',
  nit: 'NIT. 45.498.143-6',
  especialidad: 'ESPECIALISTA EN PROSTODONCIA OCLUSION Y ATM',
  institucion: 'Colegio universitario colombiano',
  logoUrl: '/brand/logo-yasmin-blanco-transparente.png',
};

// Catálogo de procedimientos con precios en COP
export const CATALOGO_PROCEDIMIENTOS: ProcedimientoCatalogo[] = [
  // Prostodoncia & Oclusión (Especialidad principal de la Dra. Yasmín Blanco)
  {
    id: 'proc-provis-15',
    nombre: 'PROVISIONAL A NIVEL DE ORGANO DENTARIO',
    categoria: 'Prostodoncia & Oclusión',
    precioSugerido: 150000,
    aplicaAOrganoDentario: true,
    formatoPlantilla: 'PROVISIONAL A NIVEL DE ORGANO DENTARIO {diente}',
  },
  {
    id: 'proc-nucleo-15',
    nombre: 'NUCLEO A NIVEL DE ORGANO DENTARIO',
    categoria: 'Prostodoncia & Oclusión',
    precioSugerido: 400000,
    aplicaAOrganoDentario: true,
    formatoPlantilla: 'NUCLEO A NIVEL DE ORGANO DENTARIO {diente}',
  },
  {
    id: 'proc-corona-indiv',
    nombre: 'CORONA INDIVIDUAL A NIVEL DE ORGANO DENTARIO',
    categoria: 'Prostodoncia & Oclusión',
    precioSugerido: 1200000,
    aplicaAOrganoDentario: true,
    formatoPlantilla: 'CORONA INDIVIDUAL A NIVEL DE ORGANO DENTARIO {diente}',
  },
  {
    id: 'proc-corona-zirconio',
    nombre: 'CORONA TOTAL EN ZIRCONIO MONOLÍTICO',
    categoria: 'Prostodoncia & Oclusión',
    precioSugerido: 1400000,
    aplicaAOrganoDentario: true,
    formatoPlantilla: 'CORONA TOTAL EN ZIRCONIO A NIVEL DE ORGANO DENTARIO {diente}',
  },
  {
    id: 'proc-incrustacion',
    nombre: 'INCRUSTACIÓN ESTÉTICA (INLAY / ONLAY)',
    categoria: 'Prostodoncia & Oclusión',
    precioSugerido: 650000,
    aplicaAOrganoDentario: true,
    formatoPlantilla: 'INCRUSTACIÓN ESTÉTICA A NIVEL DE ORGANO DENTARIO {diente}',
  },
  {
    id: 'proc-placa-oclusal',
    nombre: 'PLACA NEUROMIORRELAJANTE OCLUSAL / DESPROGRAMADOR ATM',
    categoria: 'Prostodoncia & Oclusión',
    precioSugerido: 600000,
    aplicaAOrganoDentario: false,
    formatoPlantilla: 'PLACA NEUROMIORRELAJANTE OCLUSAL DIGITAL Y AJUSTE DE OCLUSIÓN',
  },
  {
    id: 'proc-protesis-total',
    nombre: 'PRÓTESIS TOTAL SUPERIOR O INFERIOR DE ALTA ESTÉTICA',
    categoria: 'Prostodoncia & Oclusión',
    precioSugerido: 1500000,
    aplicaAOrganoDentario: false,
    formatoPlantilla: 'PRÓTESIS TOTAL MUCOSOPORTADA DE ALTA DEFINICIÓN',
  },

  // Operatoria & Estética
  {
    id: 'proc-resina-simple',
    nombre: 'RESTAURACIÓN EN RESINA FOTOCURADA ESTÉTICA SIMPLE',
    categoria: 'Operatoria & Estética',
    precioSugerido: 160000,
    aplicaAOrganoDentario: true,
    formatoPlantilla: 'RESTAURACIÓN EN RESINA ESTÉTICA A NIVEL DE ORGANO DENTARIO {diente}',
  },
  {
    id: 'proc-resina-compuesta',
    nombre: 'RESTAURACIÓN EN RESINA FOTOCURADA COMPUESTA (2 O MÁS SUPERFICIES)',
    categoria: 'Operatoria & Estética',
    precioSugerido: 220000,
    aplicaAOrganoDentario: true,
    formatoPlantilla: 'RESTAURACIÓN EN RESINA MULTISUPERFICIE A NIVEL DE ORGANO DENTARIO {diente}',
  },
  {
    id: 'proc-blanqueamiento',
    nombre: 'BLANQUEAMIENTO DENTAL CLÍNICO FOTOACTIVADO',
    categoria: 'Operatoria & Estética',
    precioSugerido: 550000,
    aplicaAOrganoDentario: false,
    formatoPlantilla: 'SESIÓN DE BLANQUEAMIENTO DENTAL LÁSER EN CONSULTORIO',
  },
  {
    id: 'proc-carilla-estetica',
    nombre: 'CARILLA DENTAL DE PORCELANA / DISEÑO DE SONRISA',
    categoria: 'Operatoria & Estética',
    precioSugerido: 850000,
    aplicaAOrganoDentario: true,
    formatoPlantilla: 'CARILLA CERÁMICA ESTÉTICA A NIVEL DE ORGANO DENTARIO {diente}',
  },

  // Endodoncia
  {
    id: 'proc-endo-uniradicular',
    nombre: 'TRATAMIENTO DE CONDUCTO (ENDODONCIA UNIRRADICULAR)',
    categoria: 'Endodoncia',
    precioSugerido: 450000,
    aplicaAOrganoDentario: true,
    formatoPlantilla: 'ENDODONCIA UNIRRADICULAR A NIVEL DE ORGANO DENTARIO {diente}',
  },
  {
    id: 'proc-endo-biradicular',
    nombre: 'TRATAMIENTO DE CONDUCTO (ENDODONCIA BIRRADICULAR)',
    categoria: 'Endodoncia',
    precioSugerido: 580000,
    aplicaAOrganoDentario: true,
    formatoPlantilla: 'ENDODONCIA BIRRADICULAR A NIVEL DE ORGANO DENTARIO {diente}',
  },
  {
    id: 'proc-endo-multiradicular',
    nombre: 'TRATAMIENTO DE CONDUCTO (ENDODONCIA MULTIRRADICULAR)',
    categoria: 'Endodoncia',
    precioSugerido: 780000,
    aplicaAOrganoDentario: true,
    formatoPlantilla: 'ENDODONCIA MULTIRRADICULAR A NIVEL DE ORGANO DENTARIO {diente}',
  },

  // Periodoncia y Diagnóstico
  {
    id: 'proc-profilaxis',
    nombre: 'DETARTRAJE SUPRAGINGIVAL Y PROFILAXIS ULTRASÓNICA',
    categoria: 'Periodoncia',
    precioSugerido: 180000,
    aplicaAOrganoDentario: false,
    formatoPlantilla: 'DETARTRAJE Y PROFILAXIS DENTAL COMPLETA',
  },
  {
    id: 'proc-exodoncia-simple',
    nombre: 'EXODONCIA SIMPLE DE ÓRGANO DENTARIO',
    categoria: 'Cirugía Oral',
    precioSugerido: 180000,
    aplicaAOrganoDentario: true,
    formatoPlantilla: 'EXODONCIA SIMPLE A NIVEL DE ORGANO DENTARIO {diente}',
  },
  {
    id: 'proc-exodoncia-tercer-molar',
    nombre: 'CIRUGÍA DE TERCER MOLAR / CORDAL INCLUIDA',
    categoria: 'Cirugía Oral',
    precioSugerido: 480000,
    aplicaAOrganoDentario: true,
    formatoPlantilla: 'CIRUGÍA DE CORDAL A NIVEL DE ORGANO DENTARIO {diente}',
  },
  {
    id: 'proc-implante',
    nombre: 'IMPLANTE DENTAL EN TITANIO DE ALTA CONECTIVIDAD',
    categoria: 'Cirugía Oral',
    precioSugerido: 2500000,
    aplicaAOrganoDentario: true,
    formatoPlantilla: 'FASE QUIRÚRGICA DE IMPLANTE A NIVEL DE ORGANO DENTARIO {diente}',
  },
];

// Presupuestos de demostración (incluyendo el presupuesto exacto de Danilsa Martínez)
export const PRESUPUESTOS_BASE: Presupuesto[] = [
  {
    id: 'pto-danilsa-001',
    codigo: 'PTO-2026-001',
    pacienteId: 'pac-danilsa-martinez',
    pacienteNombre: 'DANILSA MARTINEZ',
    pacienteDocumento: '52893412',
    pacienteEdad: 38,
    pacienteTelefono: '+57 315 789 4321',
    pacienteEps: 'Particular',
    doctorNombre: DATOS_ESPECIALISTA_DEFECTO.nombre,
    doctorNit: DATOS_ESPECIALISTA_DEFECTO.nit,
    doctorEspecialidad: DATOS_ESPECIALISTA_DEFECTO.especialidad,
    doctorInstitucion: DATOS_ESPECIALISTA_DEFECTO.institucion,
    fecha: '2026-10-16',
    items: [
      {
        id: 'item-1',
        piezaDental: 15,
        tratamiento: 'PROVISIONAL A NIVEL DE ORGANO DENTARIO 15',
        categoria: 'Prostodoncia & Oclusión',
        valorUnidad: 150000,
        cantidad: 1,
        valorTotal: 150000,
      },
      {
        id: 'item-2',
        piezaDental: 15,
        tratamiento: 'NUCLEO A NIVEL DE ORGANO DENTARIO 15',
        categoria: 'Prostodoncia & Oclusión',
        valorUnidad: 400000,
        cantidad: 1,
        valorTotal: 400000,
      },
      {
        id: 'item-3',
        piezaDental: 15,
        tratamiento: 'CORONA INDIVIDUAL A NIVEL DE ORGANO DENTARIO 15',
        categoria: 'Prostodoncia & Oclusión',
        valorUnidad: 1200000,
        cantidad: 1,
        valorTotal: 1200000,
      },
    ],
    subtotal: 1750000,
    total: 1750000,
    estado: 'aprobado',
    observaciones: 'Tratamiento rehabilitador integral para pieza 15 posterior a endodoncia. Validez de la cotización: 30 días.',
    creadoEn: '2026-10-16',
  },
  {
    id: 'pto-jairo-002',
    codigo: 'PTO-2026-002',
    pacienteId: 'pac-jairo-escobar',
    pacienteNombre: 'Jairo Escobar Cárcamo',
    pacienteDocumento: '12345678',
    pacienteEdad: 41,
    pacienteTelefono: '+57 323 453 9574',
    pacienteEps: 'Particular',
    doctorNombre: DATOS_ESPECIALISTA_DEFECTO.nombre,
    doctorNit: DATOS_ESPECIALISTA_DEFECTO.nit,
    doctorEspecialidad: DATOS_ESPECIALISTA_DEFECTO.especialidad,
    doctorInstitucion: DATOS_ESPECIALISTA_DEFECTO.institucion,
    fecha: '2026-10-15',
    items: [
      {
        id: 'item-j1',
        piezaDental: 'General',
        tratamiento: 'DETARTRAJE SUPRAGINGIVAL Y PROFILAXIS ULTRASÓNICA',
        categoria: 'Periodoncia',
        valorUnidad: 180000,
        cantidad: 1,
        valorTotal: 180000,
      },
      {
        id: 'item-j2',
        piezaDental: 16,
        tratamiento: 'RESTAURACIÓN EN RESINA FOTOCURADA ESTÉTICA SIMPLE A NIVEL DE ORGANO DENTARIO 16',
        categoria: 'Operatoria & Estética',
        valorUnidad: 160000,
        cantidad: 1,
        valorTotal: 160000,
      },
    ],
    subtotal: 340000,
    total: 340000,
    estado: 'en_tratamiento',
    observaciones: 'Mantenimiento periodontal y cambio de amalgama por resina en molar superior derecho.',
    creadoEn: '2026-10-15',
  },
];

// Función utilitaria para formatear moneda en COP ($ 1.750.000)
export function formatearMonedaCOP(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

/**
 * Obtiene el catálogo de procedimientos odontológicos dinámicamente desde el almacenamiento local
 * si existen tratamientos editados por el consultorio, o el catálogo base por defecto.
 */
export function obtenerProcedimientosCatalogo(): ProcedimientoCatalogo[] {
  if (typeof window === 'undefined') {
    return CATALOGO_PROCEDIMIENTOS;
  }

  try {
    const raw = localStorage.getItem('consultorio_tratamientos_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((t: any) => t.activo).map((t: any) => ({
          id: t.id,
          nombre: t.nombre.toUpperCase(),
          categoria: t.categoria,
          precioSugerido: t.precioSugerido,
          aplicaAOrganoDentario: t.aplicaAOrganoDentario,
          formatoPlantilla: t.formatoPlantilla || (t.aplicaAOrganoDentario ? `${t.nombre.toUpperCase()} A NIVEL DE ORGANO DENTARIO {diente}` : t.nombre.toUpperCase()),
        }));
      }
    }
  } catch (e) {
    console.error('Error al obtener procedimientos dinámicos:', e);
  }

  return CATALOGO_PROCEDIMIENTOS;
}
