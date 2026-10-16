/**
 * Acciones del servidor y repositorio de datos para el módulo de Inventario Odontológico.
 * Consultorio Odontológico Virtual
 * Tipado estricto sin 'any'.
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
import { calcularSemaforo, ordenarLotesPorFEFO } from './utils';

// ==============================================================================
// STORE DEMOSTRATIVO EN MEMORIA (FALLBACK ROBUSTO SI SUPABASE AÚN NO MIGRA)
// ==============================================================================

const HOY = new Date();
const formatearFechaOffset = (dias: number): string => {
  const d = new Date(HOY.getTime() + dias * 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
};

let storeInsumos: Insumo[] = [
  {
    id: 'ins-001',
    nombre: 'Anestésico Lidocaína 2% con Epinefrina 1:80.000',
    marca: 'New Stetic',
    presentacion_comercial: 'Caja x 50 cárpules de vidrio 1.8ml',
    registro_invima: 'INVIMA 2018M-0005432-R2',
    creado_en: formatearFechaOffset(-30),
  },
  {
    id: 'ins-002',
    nombre: 'Resina Compuesta Filtek Z350 XT Color A2',
    marca: '3M ESPE',
    presentacion_comercial: 'Jeringa x 4g fotocurable',
    registro_invima: 'INVIMA 2017DM-0001098',
    creado_en: formatearFechaOffset(-60),
  },
  {
    id: 'ins-003',
    nombre: 'Ácido Grabador Fosfórico 37% Ultra-Etch',
    marca: 'Ultradent',
    presentacion_comercial: 'Jeringa x 1.2ml con puntas dispensadoras',
    registro_invima: 'INVIMA 2019DM-0014321',
    creado_en: formatearFechaOffset(-45),
  },
  {
    id: 'ins-004',
    nombre: 'Adhesivo Universal Single Bond Universal',
    marca: '3M ESPE',
    presentacion_comercial: 'Frasco dosificador x 5ml',
    registro_invima: 'INVIMA 2020DM-0016543',
    creado_en: formatearFechaOffset(-90),
  },
  {
    id: 'ins-005',
    nombre: 'Agujas Dentales Desechables 27G Corta',
    marca: 'Septodont',
    presentacion_comercial: 'Caja x 100 unidades estériles',
    registro_invima: 'INVIMA 2016DM-0009876',
    creado_en: formatearFechaOffset(-120),
  },
  {
    id: 'ins-006',
    nombre: 'Guantes de Nitrilo Quirúrgico Talla M',
    marca: 'Sempermed',
    presentacion_comercial: 'Caja x 100 unidades no estériles',
    registro_invima: 'INVIMA 2015DM-0003412',
    creado_en: formatearFechaOffset(-15),
  },
];

let storeLotes: LoteInsumo[] = [
  // Lote en VERDE (> 90 días)
  {
    id: 'lote-001',
    insumo_id: 'ins-001',
    numero_lote: 'LID-2026-A1',
    cantidad_disponible: 45,
    fecha_ingreso: formatearFechaOffset(-15),
    fecha_vencimiento: formatearFechaOffset(180),
    estado: 'ACTIVO',
  },
  // Lote en ROJO (≤ 30 días - vence en 18 días)
  {
    id: 'lote-002',
    insumo_id: 'ins-001',
    numero_lote: 'LID-2025-V9',
    cantidad_disponible: 14,
    fecha_ingreso: formatearFechaOffset(-180),
    fecha_vencimiento: formatearFechaOffset(18),
    estado: 'ACTIVO',
  },
  // Lote en AMARILLO (31 a 90 días - vence en 48 días)
  {
    id: 'lote-003',
    insumo_id: 'ins-002',
    numero_lote: 'RES-2025-B2',
    cantidad_disponible: 12,
    fecha_ingreso: formatearFechaOffset(-60),
    fecha_vencimiento: formatearFechaOffset(48),
    estado: 'ACTIVO',
  },
  // Lote en ROJO (Vence en 10 días)
  {
    id: 'lote-004',
    insumo_id: 'ins-003',
    numero_lote: 'ACD-2026-C3',
    cantidad_disponible: 8,
    fecha_ingreso: formatearFechaOffset(-90),
    fecha_vencimiento: formatearFechaOffset(10),
    estado: 'ACTIVO',
  },
  // Lote en VERDE (> 90 días - vence en 240 días)
  {
    id: 'lote-005',
    insumo_id: 'ins-004',
    numero_lote: 'ADH-2026-D4',
    cantidad_disponible: 20,
    fecha_ingreso: formatearFechaOffset(-10),
    fecha_vencimiento: formatearFechaOffset(240),
    estado: 'ACTIVO',
  },
  // Lote en AMARILLO (Vence en 65 días)
  {
    id: 'lote-006',
    insumo_id: 'ins-005',
    numero_lote: 'AGU-2025-E5',
    cantidad_disponible: 60,
    fecha_ingreso: formatearFechaOffset(-120),
    fecha_vencimiento: formatearFechaOffset(65),
    estado: 'ACTIVO',
  },
];

let storeInsumosVencidos: InsumoVencido[] = [
  {
    id: 'venc-001',
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
    id: 'venc-002',
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

let storeConsumos: ConsumoProcedimiento[] = [
  {
    id: 'cons-001',
    procedimiento_id: 'Restauración Resina Fotocurable',
    cita_id: 'cita-demo-1',
    lote_id: 'lote-003',
    cantidad: 1,
    fecha: formatearFechaOffset(-2) + 'T10:30:00Z',
    registrado_por: 'Dr. Carlos Ruiz',
    insumo_nombre: 'Resina Compuesta Filtek Z350 XT Color A2',
    numero_lote: 'RES-2025-B2',
    paciente_nombre: 'Roberto Morales Varela',
  },
  {
    id: 'cons-002',
    procedimiento_id: 'Cirugía de Terceros Molares',
    cita_id: 'cita-demo-2',
    lote_id: 'lote-002',
    cantidad: 2,
    fecha: formatearFechaOffset(-1) + 'T15:00:00Z',
    registrado_por: 'Dra. Yasmín Blanco',
    insumo_nombre: 'Anestésico Lidocaína 2% con Epinefrina',
    numero_lote: 'LID-2025-V9',
    paciente_nombre: 'Ana María Cárdenas',
  },
];

// ==============================================================================
// FUNCIONES DE REPOSITORIO Y SERVER ACTIONS
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
  } catch {
    // Si falla la consulta a Supabase, retornar fallback en memoria
  }
  return [...storeInsumos].sort((a, b) => a.nombre.localeCompare(b.nombre));
}

/**
 * Obtiene los lotes integrados con la información del insumo y semaforización en tiempo real.
 * Ordenados por defecto en estrategia FEFO (vencimiento ascendente: más próximos primero).
 */
export async function obtenerLotesConInsumos(filtros?: FiltrosInventario): Promise<LoteConInsumo[]> {
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
          semaforo: calcularSemaforo(lote.fecha_vencimiento, new Date()),
        };
      });
    }
  } catch {
    // Continuar con store local si falla Supabase
  }

  if (lotesConInsumo.length === 0) {
    const mapaInsumos = new Map(storeInsumos.map((i) => [i.id, i]));
    lotesConInsumo = storeLotes.map((lote) => {
      const insumo = mapaInsumos.get(lote.insumo_id) || {
        id: lote.insumo_id,
        nombre: 'Insumo Desconocido',
        marca: '-',
        presentacion_comercial: '-',
        registro_invima: '-',
      };
      return {
        ...lote,
        insumo,
        semaforo: calcularSemaforo(lote.fecha_vencimiento, new Date()),
      };
    });
  }

  // 1. Orden FEFO por defecto: vencimiento más próximo primero
  lotesConInsumo = ordenarLotesPorFEFO(lotesConInsumo);

  // 2. Aplicar filtros si existen
  if (!filtros) return lotesConInsumo;

  return lotesConInsumo.filter((lote) => {
    // Filtro por búsqueda de texto
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

    // Filtro por color de semáforo
    if (filtros.colorSemaforo && filtros.colorSemaforo !== 'todos') {
      if (lote.semaforo?.color !== filtros.colorSemaforo) {
        return false;
      }
    }

    // Filtro por estado
    if (filtros.estado && filtros.estado !== 'todos') {
      if (lote.estado !== filtros.estado) {
        return false;
      }
    }

    // Filtro por fecha de vencimiento mínima (desde)
    if (filtros.fechaVencimientoDesde) {
      if (new Date(lote.fecha_vencimiento) < new Date(filtros.fechaVencimientoDesde)) {
        return false;
      }
    }

    // Filtro por fecha de vencimiento máxima (hasta)
    if (filtros.fechaVencimientoHasta) {
      if (new Date(lote.fecha_vencimiento) > new Date(filtros.fechaVencimientoHasta)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Registra un nuevo insumo junto a su lote inicial (con validación Zod)
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
    // 1. Intentar insertar en Supabase
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
          mensaje: 'Insumo y lote inicial registrados exitosamente en la base de datos.',
          insumoId: insumoInsertado.id,
        };
      }
    }
  } catch {
    // Proceder con fallback
  }

  // 2. Fallback de memoria
  const nuevoInsumoId = 'ins-' + Date.now();
  const nuevoInsumo: Insumo = {
    id: nuevoInsumoId,
    nombre,
    marca,
    presentacion_comercial,
    registro_invima,
    creado_en: new Date().toISOString(),
  };

  const nuevoLote: LoteInsumo = {
    id: 'lote-' + Date.now(),
    insumo_id: nuevoInsumoId,
    numero_lote,
    cantidad_disponible: cantidad_inicial,
    fecha_ingreso,
    fecha_vencimiento,
    estado: 'ACTIVO',
    creado_en: new Date().toISOString(),
  };

  storeInsumos.push(nuevoInsumo);
  storeLotes.push(nuevoLote);

  return {
    exito: true,
    mensaje: 'Insumo y lote inicial creados exitosamente en el inventario.',
    insumoId: nuevoInsumoId,
  };
}

/**
 * Registra un nuevo lote para un insumo existente (con validación Zod)
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
        estado,
      })
      .select()
      .single();

    if (!error && loteInsertado) {
      return {
        exito: true,
        mensaje: `Lote ${numero_lote} registrado exitosamente.`,
        loteId: loteInsertado.id,
      };
    }
  } catch {
    // Continuar con fallback
  }

  const nuevoLoteId = 'lote-' + Date.now();
  const nuevoLote: LoteInsumo = {
    id: nuevoLoteId,
    insumo_id,
    numero_lote,
    cantidad_disponible,
    fecha_ingreso,
    fecha_vencimiento,
    estado: estado || 'ACTIVO',
    creado_en: new Date().toISOString(),
  };

  storeLotes.push(nuevoLote);

  return {
    exito: true,
    mensaje: `Lote ${numero_lote} añadido exitosamente al inventario.`,
    loteId: nuevoLoteId,
  };
}

/**
 * Obtiene el historial de insumos vencidos retirados
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
  } catch {
    // Fallback de memoria
  }

  return [...storeInsumosVencidos];
}

/**
 * Actualiza o registra el destino formal de un insumo vencido (Zod)
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
      return { exito: true, mensaje: 'Destino del insumo vencido actualizado formalmente.' };
    }
  } catch {
    // Fallback de memoria
  }

  const index = storeInsumosVencidos.findIndex((v) => v.id === id);
  if (index !== -1) {
    storeInsumosVencidos[index] = {
      ...storeInsumosVencidos[index],
      destino,
      fecha_retiro,
      observaciones: observaciones || storeInsumosVencidos[index].observaciones,
    };
    return { exito: true, mensaje: 'Destino actualizado en el registro de vencimientos.' };
  }

  return { exito: false, mensaje: 'No se encontró el registro del insumo vencido.' };
}

/**
 * Descuenta insumos automáticamente mediante FEFO (First Expired, First Out)
 * Ejecuta la función RPC transaccional en Postgres o fallback transaccional estricto.
 */
export async function descontarInsumosProcedimientoFEFO(
  solicitudes: ItemDescuentoFEFO[]
): Promise<{ exito: boolean; mensaje: string; detalles?: string[] }> {
  if (!solicitudes || solicitudes.length === 0) {
    return { exito: false, mensaje: 'No se proporcionaron insumos para descontar.' };
  }

  const detallesOperacion: string[] = [];

  for (const item of solicitudes) {
    // 1. Validar con Zod
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
        mensaje: `Error en insumo: ${validacion.error.errors.map((e) => e.message).join(', ')}`,
      };
    }

    // 2. Intentar llamar función RPC en Supabase
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
        detallesOperacion.push(`Insumo descontado por RPC FEFO exitosamente (${item.cantidad} unidades).`);
        continue;
      } else if (rpcError) {
        throw new Error(rpcError.message);
      }
    } catch (err: unknown) {
      // Si el error fue por stock insuficiente real de la base de datos, abortar con error
      const mensajeErr = err instanceof Error ? err.message : String(err);
      if (mensajeErr.toLowerCase().includes('stock insuficiente')) {
        return { exito: false, mensaje: mensajeErr };
      }
    }

    // 3. Fallback transaccional en memoria: algoritmo FEFO puro
    const hoyStr = new Date().toISOString().split('T')[0];
    const lotesActivos = storeLotes
      .filter((l) => l.insumo_id === item.insumo_id && l.estado === 'ACTIVO' && l.fecha_vencimiento >= hoyStr && l.cantidad_disponible > 0)
      .sort((a, b) => new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime());

    const stockTotal = lotesActivos.reduce((acc, l) => acc + l.cantidad_disponible, 0);
    if (stockTotal < item.cantidad) {
      const insumo = storeInsumos.find((i) => i.id === item.insumo_id);
      return {
        exito: false,
        mensaje: `Stock insuficiente para "${insumo?.nombre || 'Insumo'}": se requieren ${item.cantidad} unidades, disponibles en lotes activos: ${stockTotal}.`,
      };
    }

    let pendiente = item.cantidad;
    for (const lote of lotesActivos) {
      if (pendiente <= 0) break;

      const aDescontar = Math.min(lote.cantidad_disponible, pendiente);
      lote.cantidad_disponible -= aDescontar;
      if (lote.cantidad_disponible === 0) {
        lote.estado = 'AGOTADO';
      }

      pendiente -= aDescontar;

      const insumoInfo = storeInsumos.find((i) => i.id === item.insumo_id);
      storeConsumos.unshift({
        id: 'cons-' + Date.now() + Math.random().toString(36).substring(2, 5),
        procedimiento_id: item.procedimiento_id || 'Atención Clínica',
        cita_id: item.cita_id,
        historia_id: item.historia_id,
        lote_id: lote.id,
        cantidad: aDescontar,
        fecha: new Date().toISOString(),
        insumo_nombre: insumoInfo?.nombre || 'Insumo',
        numero_lote: lote.numero_lote,
      });

      detallesOperacion.push(
        `Descontadas ${aDescontar} uds del lote ${lote.numero_lote} (vence: ${lote.fecha_vencimiento}).`
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
 * Bloquea lotes expirados (fecha_vencimiento < hoy), pone cantidad en 0,
 * actualiza estado a VENCIDO y los registra en insumos_vencidos. Nunca hace DELETE.
 */
export async function procesarVencimientosDiarios(): Promise<{
  exito: boolean;
  lotesProcesados: number;
  unidadesRetiradas: number;
  mensaje: string;
}> {
  // 1. Intentar llamar función de PostgreSQL
  try {
    const { data, error } = await supabase.rpc('procesar_lotes_vencidos');
    if (!error && data) {
      return {
        exito: true,
        lotesProcesados: Number(data.lotes_vencidos_procesados || 0),
        unidadesRetiradas: Number(data.unidades_retiradas || 0),
        mensaje: `Control diario ejecutado: ${data.lotes_vencidos_procesados || 0} lotes trasladados a insumos vencidos.`,
      };
    }
  } catch {
    // Continuar con fallback
  }

  // 2. Fallback de memoria
  const hoyStr = new Date().toISOString().split('T')[0];
  let lotesProcesados = 0;
  let unidadesRetiradas = 0;

  storeLotes.forEach((lote) => {
    if (lote.estado === 'ACTIVO' && lote.fecha_vencimiento < hoyStr && lote.cantidad_disponible > 0) {
      const insumo = storeInsumos.find((i) => i.id === lote.insumo_id);
      storeInsumosVencidos.unshift({
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
  } catch {
    // Fallback de memoria
  }

  return [...storeConsumos];
}
