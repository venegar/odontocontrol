import { z } from 'zod';
import { normalizarTelefonoWhatsApp } from './utils';

/**
 * Expresión regular para validar formato celular colombiano (10 dígitos empezando por 3, o con prefijo 57).
 */
const CELULAR_COLOMBIA_REGEX = /^(?:57)?3\d{9}$/;

/**
 * Esquema base para los datos de una cita a notificar
 */
export const recordatorioBaseSchema = z.object({
  citaId: z
    .string({ required_error: 'El identificador de la cita es obligatorio' })
    .min(1, 'El identificador de la cita es requerido'),
  pacienteNombre: z
    .string({ required_error: 'El nombre del paciente es obligatorio' })
    .trim()
    .min(2, 'El nombre del paciente debe tener al menos 2 caracteres'),
  doctorNombre: z
    .string({ required_error: 'El nombre del profesional es obligatorio' })
    .trim()
    .min(2, 'El nombre del profesional debe tener al menos 2 caracteres'),
  tratamiento: z
    .string({ required_error: 'El tratamiento es obligatorio' })
    .trim()
    .min(2, 'El tratamiento debe ser especificado'),
  fechaCita: z
    .string({ required_error: 'La fecha de la cita es requerida' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (debe ser AAAA-MM-DD)'),
  horaCita: z
    .string({ required_error: 'La hora de la cita es requerida' })
    .trim()
    .min(1, 'La hora de la cita es obligatoria'),
  sillon: z.string().optional(),
});

/**
 * Esquema estricto para envíos a través de WhatsApp
 */
export const recordatorioWhatsAppSchema = recordatorioBaseSchema.extend({
  pacienteTelefono: z
    .string({ required_error: 'El número de teléfono móvil es obligatorio para WhatsApp' })
    .trim()
    .refine((val) => {
      const normalizado = normalizarTelefonoWhatsApp(val);
      return CELULAR_COLOMBIA_REGEX.test(normalizado);
    }, {
      message: 'El teléfono debe ser un celular válido de Colombia (10 dígitos iniciando en 3, ej: 301 549 9931)',
    }),
  pacienteEmail: z.string().trim().optional().or(z.literal('')),
});

/**
 * Esquema estricto para envíos a través de Correo Electrónico
 */
export const recordatorioEmailSchema = recordatorioBaseSchema.extend({
  pacienteEmail: z
    .string({ required_error: 'El correo electrónico es obligatorio para el envío' })
    .trim()
    .min(5, 'El correo electrónico es muy corto')
    .email('El formato del correo electrónico es inválido (ej: paciente@ejemplo.com)'),
  pacienteTelefono: z.string().trim().optional().or(z.literal('')),
});

export type RecordatorioWhatsAppInput = z.infer<typeof recordatorioWhatsAppSchema>;
export type RecordatorioEmailInput = z.infer<typeof recordatorioEmailSchema>;
