// ==============================================================================
// GESTIÓN Y PERSISTENCIA DE PACIENTES, CITAS, ODONTOGRAMA Y EVOLUCIONES
// Consultorio Odontológico Virtual - Dra. Yasmín Blanco
// ==============================================================================

import { Paciente, ImagenDiagnostica } from './types';
import { PACIENTES_REGISTRADOS_BASE } from './datos';
import { EvolucionClinica, EstadoDiente, DienteInfo, NOMBRES_PIEZAS_FDI, crearOdontogramaInicial } from '@/modules/historias-clinicas/types';

const CLAVE_STORAGE = 'consultorio_pacientes_v1';
export const EVENTO_PACIENTES_ACTUALIZADOS = 'consultorio:pacientes-actualizados';

/**
 * Obtiene la lista actual de pacientes desde localStorage si está disponible,
 * o inicializa con los pacientes de referencia de la clínica.
 */
export function obtenerPacientesStorage(): Paciente[] {
  if (typeof window === 'undefined') {
    return PACIENTES_REGISTRADOS_BASE;
  }

  try {
    const raw = localStorage.getItem(CLAVE_STORAGE);
    if (!raw) {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(PACIENTES_REGISTRADOS_BASE));
      return PACIENTES_REGISTRADOS_BASE;
    }
    const parsed: Paciente[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(PACIENTES_REGISTRADOS_BASE));
      return PACIENTES_REGISTRADOS_BASE;
    }
    return parsed;
  } catch {
    return PACIENTES_REGISTRADOS_BASE;
  }
}

/**
 * Guarda la lista de pacientes en localStorage y emite el evento de sincronización.
 */
export function guardarPacientesStorage(pacientes: Paciente[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(pacientes));
    window.dispatchEvent(new CustomEvent(EVENTO_PACIENTES_ACTUALIZADOS, { detail: pacientes }));
  } catch (error) {
    console.error('Error al guardar pacientes en storage:', error);
  }
}

/**
 * Busca un paciente por su identificador.
 */
export function obtenerPacientePorIdStorage(pacienteId: string): Paciente | undefined {
  const lista = obtenerPacientesStorage();
  return lista.find((p) => p.id === pacienteId);
}

export interface RegistrarDiagnosticoParams {
  pacienteId: string;
  evolucion: EvolucionClinica;
  actualizacionOdontograma?: {
    dienteNumero: number;
    nuevoEstado: EstadoDiente;
    notas?: string;
  };
  citaId?: string;
  imagenesAdjuntas?: ImagenDiagnostica[];
}

/**
 * Registra la información diagnóstica y evolución producto de una cita odontológica,
 * actualizando el odontograma del paciente, el historial de consultas y el estado de la cita.
 */
export function registrarDiagnosticoCitaStorage(params: RegistrarDiagnosticoParams): {
  exito: boolean;
  pacienteActualizado?: Paciente;
} {
  const lista = obtenerPacientesStorage();
  const index = lista.findIndex((p) => p.id === params.pacienteId);

  if (index === -1) {
    return { exito: false };
  }

  const pacienteActual = { ...lista[index] };
  const evolucionesPrevias = pacienteActual.evoluciones ? [...pacienteActual.evoluciones] : [];

  // 1. Agregar la nueva nota diagnóstica y de evolución al inicio
  const nuevasEvoluciones = [params.evolucion, ...evolucionesPrevias];
  pacienteActual.evoluciones = nuevasEvoluciones;

  // 2. Si se especificó actualización de Odontograma, actualizar la pieza en el mapa FDI
  if (params.actualizacionOdontograma && params.actualizacionOdontograma.dienteNumero > 0) {
    const { dienteNumero, nuevoEstado, notas } = params.actualizacionOdontograma;
    const odontogramaPrevio = pacienteActual.odontograma ? { ...pacienteActual.odontograma } : {};
    
    const infoDiente: DienteInfo = {
      numero: dienteNumero,
      nombre: NOMBRES_PIEZAS_FDI[dienteNumero] || `Pieza ${dienteNumero}`,
      estado: nuevoEstado,
      notas: notas || odontogramaPrevio[dienteNumero]?.notas,
    };

    odontogramaPrevio[dienteNumero] = infoDiente;
    pacienteActual.odontograma = odontogramaPrevio;
  }

  // 3. Si la consulta proviene de una cita agendada, marcarla como completada/atendida y guardar detalles
  if (params.citaId && pacienteActual.citas) {
    pacienteActual.citas = pacienteActual.citas.map((c) => {
      if (c.id === params.citaId) {
        return {
          ...c,
          estado: 'completada',
          procedimientoRealizado: params.evolucion.procedimiento,
          diagnostico: params.evolucion.diagnostico,
          diagnosticoCie10: params.evolucion.diagnosticoCie10,
          piezaDental: params.evolucion.piezaDental,
          dienteNumero: params.evolucion.dienteNumero,
          insumosUtilizados: params.evolucion.insumosUtilizados,
          costoProcedimiento: params.evolucion.costoProcedimiento,
          estadoPago: params.evolucion.estadoPago || 'pagado',
          indicaciones: params.evolucion.indicaciones,
          prescripcion: params.evolucion.prescripcion,
          notas: c.notas 
            ? `${c.notas} • Atendida: ${params.evolucion.diagnostico}`
            : `Atendida: ${params.evolucion.diagnostico}`,
        };
      }
      return c;
    });
  }

  // 4. Si se adjuntaron imágenes diagnósticas / radiografías de la cita, guardarlas en el paciente
  if (params.imagenesAdjuntas && params.imagenesAdjuntas.length > 0) {
    const imagenesPrevias = pacienteActual.imagenesDiagnosticas ? [...pacienteActual.imagenesDiagnosticas] : [];
    pacienteActual.imagenesDiagnosticas = [...params.imagenesAdjuntas, ...imagenesPrevias];
  }

  // Guardar en la lista y persistir
  lista[index] = pacienteActual;
  guardarPacientesStorage(lista);

  return {
    exito: true,
    pacienteActualizado: pacienteActual,
  };
}

/**
 * Actualiza de forma individual una pieza dental en el odontograma del paciente.
 */
export function actualizarDienteOdontogramaStorage(
  pacienteId: string,
  dienteNumero: number,
  nuevoEstado: EstadoDiente,
  notas?: string
): Paciente | undefined {
  const lista = obtenerPacientesStorage();
  const index = lista.findIndex((p) => p.id === pacienteId);

  if (index === -1) return undefined;

  const pacienteActual = { ...lista[index] };
  const odontogramaPrevio = pacienteActual.odontograma ? { ...pacienteActual.odontograma } : {};

  odontogramaPrevio[dienteNumero] = {
    numero: dienteNumero,
    nombre: NOMBRES_PIEZAS_FDI[dienteNumero] || `Pieza ${dienteNumero}`,
    estado: nuevoEstado,
    notas: notas || odontogramaPrevio[dienteNumero]?.notas,
  };

  pacienteActual.odontograma = odontogramaPrevio;
  lista[index] = pacienteActual;
  guardarPacientesStorage(lista);

  return pacienteActual;
}

/**
 * Registra de manera inmediata un paciente nuevo en el consultorio
 * y lo deja disponible para ser atendido.
 */
export function registrarPacienteNuevoStorage(datos: {
  nombres: string;
  apellidos: string;
  tipoDocumento?: 'CC' | 'TI' | 'CE' | 'Pasaporte';
  numeroDocumento: string;
  telefono: string;
  fechaNacimiento?: string;
  email?: string;
  ciudad?: string;
  direccion?: string;
  eps?: 'Particular' | 'Ecopetrol';
  genero?: 'Femenino' | 'Masculino' | 'Otro';
  alergias?: string[];
  enfermedadesPrevias?: string[];
  medicamentosActuales?: string[];
}): Paciente {
  const lista = obtenerPacientesStorage();
  
  const nuevoPaciente: Paciente = {
    id: `pac-${Date.now()}`,
    tipoDocumento: datos.tipoDocumento || 'CC',
    numeroDocumento: datos.numeroDocumento.trim(),
    nombres: datos.nombres.trim(),
    apellidos: datos.apellidos.trim(),
    email: datos.email?.trim() || undefined,
    telefono: datos.telefono.trim(),
    fechaNacimiento: datos.fechaNacimiento || '1995-01-01',
    ciudad: datos.ciudad || 'Bogotá',
    direccion: datos.direccion || '',
    eps: datos.eps || 'Particular',
    genero: datos.genero || 'Otro',
    alergias: datos.alergias || [],
    enfermedadesPrevias: datos.enfermedadesPrevias || [],
    medicamentosActuales: datos.medicamentosActuales || [],
    grupoSanguineo: 'O+',
    odontograma: crearOdontogramaInicial(),
    evoluciones: [],
    citas: [],
    imagenesDiagnosticas: [],
  };

  const listaActualizada = [nuevoPaciente, ...lista];
  guardarPacientesStorage(listaActualizada);

  return nuevoPaciente;
}
