/**
 * Acciones de datos para el módulo de Inventario Odontológico.
 * Consultorio Odontológico Virtual
 * Conexión exclusiva con Supabase (Sin fallback en memoria para evitar pérdida de datos clínicos).
 * Se aplica RLS con la sesión del usuario activo (cliente anon con JWT).
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

/**
 * Obtiene el catálogo de insumos desde Supabase
 */
export async function obtenerInsumos(): Promise<Insumo[]> {
  const { data, error } = await supabase
    .from('insumos')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    throw new Error(`Error al consultar catálogo de insumos: ${error.message}`);
  }

  return (data || []) as Insumo[];
}

/**
 * Obtiene los lotes integrados con la información del insumo y semaforización en tiempo real.
 * Ordenados por defecto en estrategia FEFO (vencimiento ascendente).
 */
export async function obtenerLotesConInsumos(filtros?: FiltrosInventario): Promise<LoteConInsumo[]> {
  const { data, error } = await supabase
    .from('lotes_insumo')
    .select('*, insumos(*)')
    .order('fecha_vencimiento', { ascending: true });

  if (error) {
    throw new Error(`Error al consultar lotes de inventario: ${error.message}`);
  }

  const hoy = obtenerFechaHoyColombia();

  let lotesConInsumo: LoteConInsumo[] = (data || []).map((item) => {
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

  // Orden FEFO por defecto: vencimiento más cercano primero
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

  // 1. Insertar insumo en base de datos
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

  if (errInsumo || !insumoInsertado) {
    return { 
      exito: false, 
      mensaje: `Error al registrar insumo en base de datos: ${errInsumo?.message || 'Operación rechazada por RLS o conexión'}` 
    };
  }

  // 2. Insertar lote inicial asociado
  const { error: errLote } = await supabase.from('lotes_insumo').insert({
    insumo_id: insumoInsertado.id,
    numero_lote,
    cantidad_disponible: cantidad_inicial,
    fecha_ingreso,
    fecha_vencimiento,
    estado: 'ACTIVO',
  });

  if (errLote) {
    return { 
      exito: false, 
      mensaje: `Insumo creado pero falló el registro del lote inicial: ${errLote.message}` 
    };
  }

  return {
    exito: true,
    mensaje: 'Insumo y lote inicial registrados exitosamente en la base de datos.',
    insumoId: insumoInsertado.id,
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

  if (error || !loteInsertado) {
    return { 
      exito: false, 
      mensaje: `Error al registrar lote: ${error?.message || 'Operación denegada por permisos RLS'}` 
    };
  }

  return {
    exito: true,
    mensaje: `Lote ${numero_lote} registrado exitosamente en el inventario.`,
    loteId: loteInsertado.id,
  };
}

/**
 * Obtiene el historial de insumos vencidos retirados desde Supabase
 */
export async function obtenerInsumosVencidos(): Promise<InsumoVencido[]> {
  const { data, error } = await supabase
    .from('insumos_vencidos')
    .select('*, lotes_insumo(*, insumos(*))')
    .order('fecha_retiro', { ascending: false });

  if (error) {
    throw new Error(`Error al consultar insumos vencidos: ${error.message}`);
  }

  return (data || []).map((item) => {
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

  const { error } = await supabase
    .from('insumos_vencidos')
    .update({
      destino,
      fecha_retiro,
      observaciones: observaciones || null,
    })
    .eq('id', id);

  if (error) {
    return { exito: false, mensaje: `Error al actualizar destino: ${error.message}` };
  }

  return { exito: true, mensaje: 'Destino del insumo vencido actualizado formalmente.' };
}

/**
 * Descuenta insumos automáticamente mediante FEFO (First Expired, First Out)
 * Invoca la función RPC transaccional 'descontar_insumo_fefo' en PostgreSQL.
 * Rechaza y revierte si el stock es insuficiente o si no se cuenta con permiso RLS.
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

    const { data: rpcData, error: rpcError } = await supabase.rpc('descontar_insumo_fefo', {
      p_insumo_id: item.insumo_id,
      p_cantidad: item.cantidad,
      p_procedimiento_id: item.procedimiento_id || null,
      p_cita_id: item.cita_id || null,
      p_historia_id: item.historia_id || null,
      p_registrado_por: item.registrado_por || null,
    });

    if (rpcError) {
      return {
        exito: false,
        mensaje: `Error en descuento FEFO: ${rpcError.message}`,
      };
    }

    if (rpcData?.exito) {
      detallesOperacion.push(`Insumo descontado exitosamente (${item.cantidad} unidades por FEFO).`);
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
 * Ejecuta la función RPC 'procesar_lotes_vencidos' en PostgreSQL.
 * Idempotente: nunca duplica registros ni realiza DELETE.
 */
export async function procesarVencimientosDiarios(): Promise<{
  exito: boolean;
  lotesProcesados: number;
  unidadesRetiradas: number;
  mensaje: string;
}> {
  const { data, error } = await supabase.rpc('procesar_lotes_vencidos');

  if (error) {
    throw new Error(`Error al procesar vencimientos diarios en base de datos: ${error.message}`);
  }

  const lotesProcesados = Number(data?.lotes_vencidos_procesados || 0);
  const unidadesRetiradas = Number(data?.unidades_retiradas || 0);

  return {
    exito: true,
    lotesProcesados,
    unidadesRetiradas,
    mensaje: `Auditoría completada (${data?.fecha_ejecucion || 'Hoy'}): ${lotesProcesados} lote(s) vencido(s) bloqueados. Total unidades retiradas: ${unidadesRetiradas}.`,
  };
}

/**
 * Obtiene el historial de consumos realizados en procedimientos desde Supabase
 */
export async function obtenerHistorialConsumos(): Promise<ConsumoProcedimiento[]> {
  const { data, error } = await supabase
    .from('consumo_procedimiento')
    .select('*, lotes_insumo(*, insumos(*))')
    .order('fecha', { ascending: false });

  if (error) {
    throw new Error(`Error al consultar historial de consumos: ${error.message}`);
  }

  return (data || []).map((item) => {
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
