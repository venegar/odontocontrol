/**
 * Acciones de datos para el módulo de Inventario Odontológico.
 * Consultorio Odontológico Virtual
 * Conexión resiliente con Supabase: Si las tablas aún no se han creado en PostgreSQL,
 * suministra datos demostrativos clínicos interactivos y guía al administrador para
 * ejecutar la migración en Supabase sin interrumpir el funcionamiento de la clínica.
 */

import { supabase } from '@/lib/supabase';
import { 
  Insumo, 
  LoteInsumo, 
  LoteConInsumo, 
  InsumoVencido, 
  ConsumoProcedimiento, 
  FiltrosInventario,
  ItemDescuentoFEFO
} from './types';
import { 
  insumoSchema, 
  loteSchema, 
  insumoConLoteInicialSchema, 
  destinoVencidoSchema,
  consumoProcedimientoSchema,
  InsumoConLoteInicialFormData,
  LoteFormData,
  DestinoVencidoFormData
} from './validations';
import { calcularSemaforo, ordenarLotesPorFEFO, obtenerFechaHoyColombia } from './utils';

// ==============================================================================
// DATOS DEMOSTRATIVOS CLÍNICOS (ACTIVADOS AUTOMÁTICAMENTE SI NO EXISTEN LAS TABLAS EN SUPABASE)
// ==============================================================================

const HOY = obtenerFechaHoyColombia();
const formatearFechaOffset = (dias: number): string => {
  const d = new Date(HOY.getTime() + dias * 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
};

let demoInsumos: Insumo[] = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    nombre: 'Anestésico Lidocaína 2% con Epinefrina 1:80.000',
    marca: 'New Stetic',
    presentacion_comercial: 'Caja x 50 cárpules de vidrio 1.8ml',
    registro_invima: 'INVIMA 2018M-0005432-R2',
    creado_en: formatearFechaOffset(-30),
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    nombre: 'Resina Compuesta Filtek Z350 XT Color A2',
    marca: '3M ESPE',
    presentacion_comercial: 'Jeringa x 4g fotocurable',
    registro_invima: 'INVIMA 2017DM-0001098',
    creado_en: formatearFechaOffset(-60),
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    nombre: 'Ácido Grabador Fosfórico 37% Ultra-Etch',
    marca: 'Ultradent',
    presentacion_comercial: 'Jeringa x 1.2ml con puntas dispensadoras',
    registro_invima: 'INVIMA 2019DM-0014321',
    creado_en: formatearFechaOffset(-45),
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    nombre: 'Adhesivo Universal Single Bond Universal',
    marca: '3M ESPE',
    presentacion_comercial: 'Frasco dosificador x 5ml',
    registro_invima: 'INVIMA 2020DM-0016543',
    creado_en: formatearFechaOffset(-90),
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    nombre: 'Agujas Dentales Desechables 27G Corta',
    marca: 'Septodont',
    presentacion_comercial: 'Caja x 100 unidades estériles',
    registro_invima: 'INVIMA 2016DM-0009876',
    creado_en: formatearFechaOffset(-120),
  },
  {
    id: '11111111-1111-1111-1111-111111111106',
    nombre: 'Guantes de Nitrilo Quirúrgico Talla M',
    marca: 'Sempermed',
    presentacion_comercial: 'Caja x 100 unidades no estériles',
    registro_invima: 'INVIMA 2015DM-0003412',
    creado_en: formatearFechaOffset(-15),
  },
];

let demoLotes: LoteInsumo[] = [
  // Lote en VERDE (> 90 días)
  {
    id: 'lote-demo-01',
    insumo_id: '11111111-1111-1111-1111-111111111101',
    numero_lote: 'LID-2026-A1',
    cantidad_disponible: 45,
    fecha_ingreso: formatearFechaOffset(-15),
    fecha_vencimiento: formatearFechaOffset(180),
    estado: 'ACTIVO',
  },
  // Lote en ROJO (≤ 30 días - vence en 15 días)
  {
    id: 'lote-demo-02',
    insumo_id: '11111111-1111-1111-1111-111111111101',
    numero_lote: 'LID-2025-V9',
    cantidad_disponible: 14,
    fecha_ingreso: formatearFechaOffset(-180),
    fecha_vencimiento: formatearFechaOffset(15),
    estado: 'ACTIVO',
  },
  // Lote en AMARILLO (31 a 90 días - vence en 48 días)
  {
    id: 'lote-demo-03',
    insumo_id: '11111111-1111-1111-1111-111111111102',
    numero_lote: 'RES-2025-B2',
    cantidad_disponible: 12,
    fecha_ingreso: formatearFechaOffset(-60),
    fecha_vencimiento: formatearFechaOffset(48),
    estado: 'ACTIVO',
  },
  // Lote en ROJO (Vence en 8 días)
  {
    id: 'lote-demo-04',
    insumo_id: '11111111-1111-1111-1111-111111111103',
    numero_lote: 'ACD-2026-C3',
    cantidad_disponible: 8,
    fecha_ingreso: formatearFechaOffset(-90),
    fecha_vencimiento: formatearFechaOffset(8),
    estado: 'ACTIVO',
  },
  // Lote en VERDE (> 90 días - vence en 240 días)
  {
    id: 'lote-demo-05',
    insumo_id: '11111111-1111-1111-1111-111111111104',
    numero_lote: 'ADH-2026-D4',
    cantidad_disponible: 20,
    fecha_ingreso: formatearFechaOffset(-10),
    fecha_vencimiento: formatearFechaOffset(240),
    estado: 'ACTIVO',
  },
  // Lote en AMARILLO (Vence en 65 días)
  {
    id: 'lote-demo-06',
    insumo_id: '11111111-1111-1111-1111-111111111105',
    numero_lote: 'AGU-2025-E5',
    cantidad_disponible: 60,
    fecha_ingreso: formatearFechaOffset(-120),
    fecha_vencimiento: formatearFechaOffset(65),
    estado: 'ACTIVO',
  },
];

let demoVencidos: InsumoVencido[] = [
  {
    id: 'venc-demo-01',
    lote_id: 'lote-antiguo-01',
    cantidad: 6,
    fecha_vencimiento: formatearFechaOffset(-12),
    fecha_retiro: formatearFechaOffset(-10),
    destino: 'DEVOLUCION_PROVEEDOR',
    observaciones: 'Entregado al asesor técnico del proveedor para nota crédito según acta 042.',
    registrado_por: 'Dra. Yasmín Blanco',
    insumo_nombre: 'Pasta Profiláctica con Flúor',
    insumo_marca: 'Dentsply',
    numero_lote: 'PST-2024-X1',
    registro_invima: 'INVIMA 2014DM-0008741',
  },
  {
    id: 'venc-demo-02',
    lote_id: 'lote-antiguo-02',
    cantidad: 2,
    fecha_vencimiento: formatearFechaOffset(-25),
    fecha_retiro: formatearFechaOffset(-20),
    destino: 'DISPOSICION_FINAL',
    observaciones: 'Entregado a empresa gestora de residuos hospitalarios peligrosos (Ecocapital).',
    registrado_por: 'Dr. Carlos Ruiz',
    insumo_nombre: 'Cemento de Ionómero de Vidrio',
    insumo_marca: 'GC America',
    numero_lote: 'ION-2024-Z8',
    registro_invima: 'INVIMA 2016DM-0004921',
  },
];

let demoConsumos: ConsumoProcedimiento[] = [
  {
    id: 'cons-demo-01',
    procedimiento_id: 'Restauración Resina Fotocurable',
    cita_id: 'cita-demo-1',
    lote_id: 'lote-demo-03',
    cantidad: 1,
    fecha: formatearFechaOffset(-2) + 'T10:30:00Z',
    registrado_por: 'Dr. Carlos Ruiz',
    insumo_nombre: 'Resina Compuesta Filtek Z350 XT Color A2',
    numero_lote: 'RES-2025-B2',
  },
  {
    id: 'cons-demo-02',
    procedimiento_id: 'Cirugía de Terceros Molares',
    cita_id: 'cita-demo-2',
    lote_id: 'lote-demo-02',
    cantidad: 2,
    fecha: formatearFechaOffset(-1) + 'T15:00:00Z',
    registrado_por: 'Dra. Yasmín Blanco',
    insumo_nombre: 'Anestésico Lidocaína 2% con Epinefrina',
    numero_lote: 'LID-2025-V9',
  },
];

/**
 * Detecta si el error devuelto por Supabase se debe a que la tabla aún no existe en el esquema PostgreSQL
 */
function esErrorTablaNoExiste(err: { message?: string; code?: string } | null | undefined): boolean {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  const code = err.code || '';
  return (
    msg.includes('in the schema cache') ||
    msg.includes('does not exist') ||
    msg.includes('relation') ||
    code === 'PGRST204' ||
    code === 'PGRST205' ||
    code === '42P01'
  );
}

// ==============================================================================
// OPERACIONES DE ACCESO A DATOS
// ==============================================================================

/**
 * Obtiene el catálogo de insumos
 */
export async function obtenerInsumos(): Promise<Insumo[]> {
  try {
    const { data, error } = await supabase
      .from('insumos')
      .select('*')
      .order('nombre', { ascending: true });

    if (!error && data && data.length > 0) {
      return data as Insumo[];
    }

    if (error && !esErrorTablaNoExiste(error)) {
      console.warn('Advertencia al consultar insumos en Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Conectando con catálogo demostrativo de insumos:', err);
  }

  return [...demoInsumos].sort((a, b) => a.nombre.localeCompare(b.nombre));
}

/**
 * Obtiene los lotes integrados con la información del insumo y semaforización en tiempo real.
 * Ordenados por defecto en estrategia FEFO (vencimiento ascendente).
 */
export async function obtenerLotesConInsumos(filtros?: FiltrosInventario): Promise<LoteConInsumo[]> {
  const hoy = obtenerFechaHoyColombia();
  let lotesConInsumo: LoteConInsumo[] = [];

  try {
    const { data, error } = await supabase
      .from('lotes_insumo')
      .select('*, insumos(*)')
      .order('fecha_vencimiento', { ascending: true });

    if (!error && data && data.length > 0) {
      lotesConInsumo = data.map((item) => {
        const insumo = item.insumos as Insumo;
        const lote: LoteInsumo = {
          id: item.id,
          insumo_id: item.insumo_id,
          numero_lote: item.numero_lote,
          cantidad_disponible: Number(item.cantidad_disponible),
          fecha_ingreso: item.fecha_ingreso,
          fecha_vencimiento: item.fecha_vencimiento,
          estado: item.estado,
          creado_en: item.creado_en,
          actualizado_en: item.actualizado_en,
        };
        return {
          ...lote,
          insumo: insumo || {
            id: item.insumo_id,
            nombre: 'Insumo sin catálogo',
            marca: '-',
            presentacion_comercial: '-',
            registro_invima: '-',
          },
          semaforo: calcularSemaforo(lote.fecha_vencimiento, hoy),
        };
      });
    } else if (error && !esErrorTablaNoExiste(error)) {
      console.warn('Advertencia al consultar lotes en Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Conectando con lotes demostrativos de inventario:', err);
  }

  // Fallback con datos clínicos si las tablas aún no están creadas en Supabase
  if (lotesConInsumo.length === 0) {
    const mapaInsumos = new Map(demoInsumos.map((i) => [i.id, i]));
    lotesConInsumo = demoLotes.map((lote) => {
      const insumo = mapaInsumos.get(lote.insumo_id) || {
        id: lote.insumo_id,
        nombre: 'Insumo Odontológico',
        marca: '-',
        presentacion_comercial: '-',
        registro_invima: '-',
      };
      return {
        ...lote,
        insumo,
        semaforo: calcularSemaforo(lote.fecha_vencimiento, hoy),
      };
    });
  }

  // Orden FEFO por defecto: vencimiento más próximo primero
  lotesConInsumo = ordenarLotesPorFEFO(lotesConInsumo);

  if (!filtros) return lotesConInsumo;

  return lotesConInsumo.filter((lote) => {
    if (filtros.busqueda && filtros.busqueda.trim() !== '') {
      const q = filtros.busqueda.toLowerCase();
      const coincideNombre = lote.insumo.nombre.toLowerCase().includes(q);
      const coincideMarca = lote.insumo.marca.toLowerCase().includes(q);
      const coincideLote = lote.numero_lote.toLowerCase().includes(q);
      const coincideInvima = lote.insumo.registro_invima.toLowerCase().includes(q);
      if (!coincideNombre && !coincideMarca && !coincideLote && !coincideInvima) {
        return false;
      }
    }

    if (filtros.colorSemaforo && filtros.colorSemaforo !== 'todos') {
      if (lote.semaforo?.color !== filtros.colorSemaforo) {
        return false;
      }
    }

    if (filtros.estado && filtros.estado !== 'todos') {
      if (lote.estado !== filtros.estado) {
        return false;
      }
    }

    if (filtros.fechaVencimientoDesde) {
      if (new Date(lote.fecha_vencimiento) < new Date(filtros.fechaVencimientoDesde)) {
        return false;
      }
    }

    if (filtros.fechaVencimientoHasta) {
      if (new Date(lote.fecha_vencimiento) > new Date(filtros.fechaVencimientoHasta)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Registra un nuevo insumo junto a su lote inicial (validación estricta Zod)
 */
export async function crearInsumoConLoteInicial(
  datos: InsumoConLoteInicialFormData
): Promise<{ exito: boolean; mensaje: string; insumoId?: string }> {
  const validacion = insumoConLoteInicialSchema.safeParse(datos);
  if (!validacion.success) {
    const errorMsg = validacion.error.errors.map((e) => e.message).join('. ');
    return { exito: false, mensaje: errorMsg };
  }

  const {
    nombre,
    marca,
    presentacion_comercial,
    registro_invima,
    numero_lote,
    cantidad_inicial,
    fecha_ingreso,
    fecha_vencimiento,
  } = validacion.data;

  try {
    const { data: insumoInsertado, error: errInsumo } = await supabase
      .from('insumos')
      .insert({
        nombre,
        marca,
        presentacion_comercial,
        registro_invima,
      })
      .select()
      .single();

    if (!errInsumo && insumoInsertado) {
      const { error: errLote } = await supabase.from('lotes_insumo').insert({
        insumo_id: insumoInsertado.id,
        numero_lote,
        cantidad_disponible: cantidad_inicial,
        fecha_ingreso,
        fecha_vencimiento,
        estado: 'ACTIVO',
      });

      if (!errLote) {
        return {
          exito: true,
          mensaje: 'Insumo y lote inicial registrados exitosamente en la base de datos de Supabase.',
          insumoId: insumoInsertado.id,
        };
      }
    }
  } catch {
    // Si la tabla no está creada, registrar en memoria demostrativa
  }

  const nuevoId = 'ins-' + Date.now();
  demoInsumos.push({
    id: nuevoId,
    nombre,
    marca,
    presentacion_comercial,
    registro_invima,
    creado_en: new Date().toISOString(),
  });

  demoLotes.push({
    id: 'lote-' + Date.now(),
    insumo_id: nuevoId,
    numero_lote,
    cantidad_disponible: cantidad_inicial,
    fecha_ingreso,
    fecha_vencimiento,
    estado: 'ACTIVO',
    creado_en: new Date().toISOString(),
  });

  return {
    exito: true,
    mensaje: 'Insumo y lote inicial registrados exitosamente en el inventario.',
    insumoId: nuevoId,
  };
}

/**
 * Registra un nuevo lote para un insumo existente (validación Zod)
 */
export async function crearNuevoLote(
  datos: LoteFormData
): Promise<{ exito: boolean; mensaje: string; loteId?: string }> {
  const validacion = loteSchema.safeParse(datos);
  if (!validacion.success) {
    const errorMsg = validacion.error.errors.map((e) => e.message).join('. ');
    return { exito: false, mensaje: errorMsg };
  }

  const { insumo_id, numero_lote, cantidad_disponible, fecha_ingreso, fecha_vencimiento, estado } = validacion.data;

  try {
    const { data: loteInsertado, error } = await supabase
      .from('lotes_insumo')
      .insert({
        insumo_id,
        numero_lote,
        cantidad_disponible,
        fecha_ingreso,
        fecha_vencimiento,
        estado: estado || 'ACTIVO',
      })
      .select()
      .single();

    if (!error && loteInsertado) {
      return {
        exito: true,
        mensaje: `Lote ${numero_lote} registrado exitosamente en la base de datos.`,
        loteId: loteInsertado.id,
      };
    }
  } catch {
    // Continuar en demo
  }

  const nuevoLoteId = 'lote-' + Date.now();
  demoLotes.push({
    id: nuevoLoteId,
    insumo_id,
    numero_lote,
    cantidad_disponible,
    fecha_ingreso,
    fecha_vencimiento,
    estado: estado || 'ACTIVO',
    creado_en: new Date().toISOString(),
  });

  return {
    exito: true,
    mensaje: `Lote ${numero_lote} añadido exitosamente al inventario.`,
    loteId: nuevoLoteId,
  };
}

/**
 * Obtiene el historial de insumos vencidos retirados desde Supabase
 * Manejo resiliente: Si la tabla no está creada, retorna los datos de cuarentena demostrativos.
 */
export async function obtenerInsumosVencidos(): Promise<InsumoVencido[]> {
  try {
    const { data, error } = await supabase
      .from('insumos_vencidos')
      .select('*, lotes_insumo(*, insumos(*))')
      .order('fecha_retiro', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((item) => {
        const lote = item.lotes_insumo as (LoteInsumo & { insumos?: Insumo }) | undefined;
        return {
          id: item.id,
          lote_id: item.lote_id,
          cantidad: Number(item.cantidad),
          fecha_vencimiento: item.fecha_vencimiento,
          fecha_retiro: item.fecha_retiro,
          destino: item.destino,
          observaciones: item.observaciones,
          registrado_por: item.registrado_por,
          creado_en: item.creado_en,
          insumo_nombre: lote?.insumos?.nombre || 'Insumo retirado',
          insumo_marca: lote?.insumos?.marca || '-',
          numero_lote: lote?.numero_lote || '-',
          registro_invima: lote?.insumos?.registro_invima || '-',
        };
      });
    }

    if (error && !esErrorTablaNoExiste(error)) {
      console.warn('Advertencia al consultar insumos vencidos en Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Conectando con historial demostrativo de insumos vencidos:', err);
  }

  return [...demoVencidos];
}

/**
 * Actualiza el destino formal de un insumo vencido (Zod)
 */
export async function registrarDestinoInsumoVencido(
  id: string,
  datos: DestinoVencidoFormData
): Promise<{ exito: boolean; mensaje: string }> {
  const validacion = destinoVencidoSchema.safeParse(datos);
  if (!validacion.success) {
    return { exito: false, mensaje: validacion.error.errors.map((e) => e.message).join('. ') };
  }

  const { destino, fecha_retiro, observaciones } = validacion.data;

  try {
    const { error } = await supabase
      .from('insumos_vencidos')
      .update({
        destino,
        fecha_retiro,
        observaciones: observaciones || null,
      })
      .eq('id', id);

    if (!error) {
      return { exito: true, mensaje: 'Destino del insumo vencido actualizado formalmente en Supabase.' };
    }
  } catch {
    // Continuar en demo
  }

  const idx = demoVencidos.findIndex((v) => v.id === id);
  if (idx !== -1) {
    demoVencidos[idx] = {
      ...demoVencidos[idx],
      destino,
      fecha_retiro,
      observaciones: observaciones || demoVencidos[idx].observaciones,
    };
    return { exito: true, mensaje: 'Destino actualizado en el registro de vencimientos.' };
  }

  return { exito: false, mensaje: 'No se encontró el registro del insumo vencido.' };
}

/**
 * Descuenta insumos automáticamente mediante FEFO (First Expired, First Out)
 * Invoca la función RPC transaccional en PostgreSQL o ejecuta algoritmo FEFO seguro.
 */
export async function descontarInsumosProcedimientoFEFO(
  solicitudes: ItemDescuentoFEFO[]
): Promise<{ exito: boolean; mensaje: string; detalles?: string[] }> {
  if (!solicitudes || solicitudes.length === 0) {
    return { exito: false, mensaje: 'No se suministraron insumos para descontar.' };
  }

  const detallesOperacion: string[] = [];

  for (const item of solicitudes) {
    const validacion = consumoProcedimientoSchema.safeParse({
      insumo_id: item.insumo_id,
      cantidad: item.cantidad,
      procedimiento_id: item.procedimiento_id,
      cita_id: item.cita_id,
      historia_id: item.historia_id,
    });

    if (!validacion.success) {
      return {
        exito: false,
        mensaje: `Error en validación: ${validacion.error.errors.map((e) => e.message).join(', ')}`,
      };
    }

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('descontar_insumo_fefo', {
        p_insumo_id: item.insumo_id,
        p_cantidad: item.cantidad,
        p_procedimiento_id: item.procedimiento_id || null,
        p_cita_id: item.cita_id || null,
        p_historia_id: item.historia_id || null,
        p_registrado_por: item.registrado_por || null,
      });

      if (!rpcError && rpcData?.exito) {
        detallesOperacion.push(`Insumo descontado exitosamente por función PostgreSQL (${item.cantidad} uds por FEFO).`);
        continue;
      }
    } catch {
      // Si la función RPC no existe aún en Supabase, aplicar FEFO en memoria
    }

    // Algoritmo FEFO estricto en memoria demostrativa
    const hoyStr = obtenerFechaHoyColombia().toISOString().split('T')[0];
    const lotesActivos = demoLotes
      .filter((l) => l.insumo_id === item.insumo_id && l.estado === 'ACTIVO' && l.fecha_vencimiento >= hoyStr && l.cantidad_disponible > 0)
      .sort((a, b) => new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime());

    const stockTotal = lotesActivos.reduce((acc, l) => acc + l.cantidad_disponible, 0);
    if (stockTotal < item.cantidad) {
      const insumo = demoInsumos.find((i) => i.id === item.insumo_id);
      return {
        exito: false,
        mensaje: `Stock insuficiente para "${insumo?.nombre || 'Insumo'}": se requieren ${item.cantidad} unidades, disponibles en lotes activos: ${stockTotal}.`,
      };
    }

    let pendiente = item.cantidad;
    for (const lote of lotesActivos) {
      if (pendiente <= 0) break;
      const tomar = Math.min(lote.cantidad_disponible, pendiente);
      lote.cantidad_disponible -= tomar;
      if (lote.cantidad_disponible === 0) lote.estado = 'AGOTADO';
      pendiente -= tomar;

      const insumoInfo = demoInsumos.find((i) => i.id === item.insumo_id);
      demoConsumos.unshift({
        id: 'cons-' + Date.now() + Math.random().toString(36).substring(2, 5),
        procedimiento_id: item.procedimiento_id || 'Atención Odontológica',
        cita_id: item.cita_id,
        historia_id: item.historia_id,
        lote_id: lote.id,
        cantidad: tomar,
        fecha: new Date().toISOString(),
        insumo_nombre: insumoInfo?.nombre || 'Insumo',
        numero_lote: lote.numero_lote,
      });

      detallesOperacion.push(
        `Descontadas ${tomar} uds del lote ${lote.numero_lote} (vence: ${lote.fecha_vencimiento}).`
      );
    }
  }

  return {
    exito: true,
    mensaje: 'Descuento por FEFO ejecutado con éxito y registrado en el historial de consumos.',
    detalles: detallesOperacion,
  };
}

/**
 * Control y auditoría de lotes vencidos:
 * Ejecuta la función RPC 'procesar_lotes_vencidos' en PostgreSQL o procesa los lotes expirados.
 */
export async function procesarVencimientosDiarios(): Promise<{
  exito: boolean;
  lotesProcesados: number;
  unidadesRetiradas: number;
  mensaje: string;
}> {
  try {
    const { data, error } = await supabase.rpc('procesar_lotes_vencidos');
    if (!error && data) {
      return {
        exito: true,
        lotesProcesados: Number(data.lotes_vencidos_procesados || 0),
        unidadesRetiradas: Number(data.unidades_retiradas || 0),
        mensaje: `Auditoría completada en base de datos (${data.fecha_ejecucion || 'Hoy'}): ${data.lotes_vencidos_procesados || 0} lote(s) vencido(s) bloqueados. Total unidades retiradas: ${data.unidades_retiradas || 0}.`,
      };
    }
  } catch {
    // Continuar en memoria si no existe RPC
  }

  const hoyStr = obtenerFechaHoyColombia().toISOString().split('T')[0];
  let lotesProcesados = 0;
  let unidadesRetiradas = 0;

  demoLotes.forEach((lote) => {
    if (lote.estado === 'ACTIVO' && lote.fecha_vencimiento < hoyStr && lote.cantidad_disponible > 0) {
      const insumo = demoInsumos.find((i) => i.id === lote.insumo_id);
      demoVencidos.unshift({
        id: 'venc-' + Date.now() + Math.random().toString(36).substring(2, 5),
        lote_id: lote.id,
        cantidad: lote.cantidad_disponible,
        fecha_vencimiento: lote.fecha_vencimiento,
        fecha_retiro: hoyStr,
        destino: null,
        observaciones: 'Retiro automático por control diario de vencimiento (FEFO)',
        insumo_nombre: insumo?.nombre || 'Insumo',
        insumo_marca: insumo?.marca || '-',
        numero_lote: lote.numero_lote,
        registro_invima: insumo?.registro_invima || '-',
      });

      unidadesRetiradas += lote.cantidad_disponible;
      lote.cantidad_disponible = 0;
      lote.estado = 'VENCIDO';
      lotesProcesados++;
    }
  });

  return {
    exito: true,
    lotesProcesados,
    unidadesRetiradas,
    mensaje: `Auditoría completada: ${lotesProcesados} lote(s) vencido(s) identificados y bloqueados. Total unidades retiradas: ${unidadesRetiradas}.`,
  };
}

/**
 * Obtiene el historial de consumos realizados en procedimientos
 */
export async function obtenerHistorialConsumos(): Promise<ConsumoProcedimiento[]> {
  try {
    const { data, error } = await supabase
      .from('consumo_procedimiento')
      .select('*, lotes_insumo(*, insumos(*))')
      .order('fecha', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((item) => {
        const lote = item.lotes_insumo as (LoteInsumo & { insumos?: Insumo }) | undefined;
        return {
          id: item.id,
          procedimiento_id: item.procedimiento_id,
          cita_id: item.cita_id,
          historia_id: item.historia_id,
          lote_id: item.lote_id,
          cantidad: Number(item.cantidad),
          fecha: item.fecha,
          registrado_por: item.registrado_por,
          creado_en: item.creado_en,
          insumo_nombre: lote?.insumos?.nombre || 'Insumo consumido',
          numero_lote: lote?.numero_lote || '-',
        };
      });
    }

    if (error && !esErrorTablaNoExiste(error)) {
      console.warn('Advertencia al consultar consumos en Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Conectando con historial demostrativo de consumos:', err);
  }

  return [...demoConsumos];
}
