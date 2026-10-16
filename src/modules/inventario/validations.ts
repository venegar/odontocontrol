/**
 * Esquemas de validación Zod para el módulo de inventario odontológico.
 * Tipado estricto sin 'any'.
 */

import { z } from 'zod';

/**
 * Esquema para crear o editar un insumo odontológico
 */
export const insumoSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre del insumo es obligatorio' })
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(120, 'El nombre no puede exceder 120 caracteres'),
  marca: z
    .string({ required_error: 'La marca del fabricante es obligatoria' })
    .trim()
    .min(2, 'La marca debe tener al menos 2 caracteres')
    .max(60, 'La marca no puede exceder 60 caracteres'),
  presentacion_comercial: z
    .string({ required_error: 'La presentación comercial es obligatoria' })
    .trim()
    .min(2, 'Ejemplo: Frasco x 100ml, Caja x 50 unidades, Jeringa 4g')
    .max(100, 'La presentación no puede exceder 100 caracteres'),
  registro_invima: z
    .string({ required_error: 'El registro INVIMA es obligatorio' })
    .trim()
    .min(5, 'Ingrese el registro sanitario INVIMA válido')
    .max(50, 'El registro INVIMA no puede exceder 50 caracteres'),
});

export type InsumoFormData = z.infer<typeof insumoSchema>;

/**
 * Esquema para registrar un lote de insumo
 */
export const loteSchema = z.object({
  insumo_id: z
    .string({ required_error: 'Debe seleccionar un insumo' })
    .min(1, 'El insumo es requerido'),
  numero_lote: z
    .string({ required_error: 'El número de lote es obligatorio' })
    .trim()
    .min(2, 'El número de lote debe tener al menos 2 caracteres')
    .max(40, 'El número de lote no puede exceder 40 caracteres'),
  cantidad_disponible: z
    .coerce
    .number({ invalid_type_error: 'La cantidad debe ser un número válido' })
    .min(0, 'La cantidad no puede ser negativa'),
  fecha_ingreso: z
    .string({ required_error: 'La fecha de ingreso es requerida' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (AAAA-MM-DD)'),
  fecha_vencimiento: z
    .string({ required_error: 'La fecha de vencimiento es requerida' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (AAAA-MM-DD)'),
  estado: z.enum(['ACTIVO', 'VENCIDO', 'AGOTADO']).default('ACTIVO'),
});

export type LoteFormData = z.infer<typeof loteSchema>;

/**
 * Esquema conjunto para crear un insumo junto con su lote inicial
 */
export const insumoConLoteInicialSchema = insumoSchema.extend({
  numero_lote: z
    .string({ required_error: 'El número de lote inicial es obligatorio' })
    .trim()
    .min(2, 'El número de lote debe tener al menos 2 caracteres'),
  cantidad_inicial: z
    .coerce
    .number({ invalid_type_error: 'La cantidad debe ser un número válido' })
    .positive('La cantidad inicial debe ser mayor a 0'),
  fecha_ingreso: z
    .string({ required_error: 'La fecha de ingreso es obligatoria' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (AAAA-MM-DD)'),
  fecha_vencimiento: z
    .string({ required_error: 'La fecha de vencimiento es obligatoria' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (AAAA-MM-DD)'),
});

export type InsumoConLoteInicialFormData = z.infer<typeof insumoConLoteInicialSchema>;

/**
 * Esquema para registrar el destino o disposición final de un insumo vencido
 */
export const destinoVencidoSchema = z.object({
  destino: z.enum(['DEVOLUCION_PROVEEDOR', 'DISPOSICION_FINAL', 'OTRO'], {
    required_error: 'Debe seleccionar el destino del insumo vencido',
  }),
  fecha_retiro: z
    .string({ required_error: 'La fecha de retiro es obligatoria' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (AAAA-MM-DD)'),
  observaciones: z
    .string()
    .trim()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export type DestinoVencidoFormData = z.infer<typeof destinoVencidoSchema>;

/**
 * Esquema para solicitar consumo y descuento por FEFO en un procedimiento
 */
export const consumoProcedimientoSchema = z.object({
  insumo_id: z
    .string({ required_error: 'Debe seleccionar un insumo' })
    .min(1, 'El insumo es obligatorio'),
  cantidad: z
    .coerce
    .number({ invalid_type_error: 'La cantidad debe ser un valor numérico' })
    .positive('La cantidad a consumir debe ser mayor a 0'),
  procedimiento_id: z.string().trim().optional().or(z.literal('')),
  cita_id: z.string().trim().optional().or(z.literal('')),
  historia_id: z.string().trim().optional().or(z.literal('')),
  paciente_nombre: z.string().trim().optional().or(z.literal('')),
});

export type ConsumoProcedimientoFormData = z.infer<typeof consumoProcedimientoSchema>;
