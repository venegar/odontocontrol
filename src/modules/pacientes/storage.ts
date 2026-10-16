// ==============================================================================
// GESTIÓN Y PERSISTENCIA DE PACIENTES, CITAS, ODONTOGRAMA Y EVOLUCIONES
// Consultorio Odontológico Virtual - Dra. Yasmín Blanco
// ==============================================================================

import { Paciente, ImagenDiagnostica } from './types';
import { PACIENTES_REGISTRADOS_BASE } from './datos';
import { EvolucionClinica, EstadoDiente, DienteInfo, NOMBRES_PIEZAS_FDI, crearOdontogramaInicial } from '@/modules/historias-clinicas/types';

const CLAVE_STORAGE = 'consultorio_pacientes_v2';
const CLAVE_STORAGE_LEGACY = 'consultorio_pacientes_v1';
export const EVENTO_PACIENTES_ACTUALIZADOS = 'consultorio:pacientes-actualizados';

/**
 * Sanitiza una evolución clínica asegurando que todas sus propiedades de texto y arrays existan.
 */
function sanitizarEvolucion(e: Partial<EvolucionClinica>): EvolucionClinica {
  if (!e || typeof e !== 'object') {
    return {
      id: `evo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      pacienteId: '',
      pacienteNombre: '',
      fecha: new Date().toISOString().split('T')[0],
      hora: '10:00 AM',
      doctorNombre: 'Dra. Yasmín Blanco',
      doctorRol: 'Odontóloga Especialista',
      tipoConsulta: 'evolucion_cita',
      motivoConsulta: '',
      diagnostico: 'Atención odontológica programada',
      procedimiento: 'Procedimiento clínico registrado',
      procedimientosRealizados: [],
      imagenesAdjuntas: [],
    };
  }

  return {
    id: String(e.id || `evo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`),
    pacienteId: String(e.pacienteId || ''),
    pacienteNombre: String(e.pacienteNombre || ''),
    fecha: String(e.fecha || new Date().toISOString().split('T')[0]),
    hora: e.hora ? String(e.hora) : '10:00 AM',
    doctorNombre: String(e.doctorNombre || 'Dra. Yasmín Blanco'),
    doctorRol: e.doctorRol ? String(e.doctorRol) : 'Odontóloga Especialista',
    tipoConsulta: e.tipoConsulta || 'evolucion_cita',
    motivoConsulta: String(e.motivoConsulta || ''),
    diagnostico: String(e.diagnostico || 'Atención odontológica programada'),
    diagnosticoCie10: e.diagnosticoCie10 ? String(e.diagnosticoCie10) : undefined,
    piezaDental: e.piezaDental ? String(e.piezaDental) : undefined,
    dienteNumero: typeof e.dienteNumero === 'number' ? e.dienteNumero : undefined,
    nuevoEstadoDiente: e.nuevoEstadoDiente,
    procedimiento: String(e.procedimiento || 'Procedimiento clínico registrado'),
    procedimientosRealizados: Array.isArray(e.procedimientosRealizados) ? e.procedimientosRealizados.filter(Boolean).map(String) : [],
    anestesia: e.anestesia ? String(e.anestesia) : undefined,
    indicaciones: e.indicaciones ? String(e.indicaciones) : undefined,
    prescripcion: e.prescripcion ? String(e.prescripcion) : undefined,
    proximoControl: e.proximoControl ? String(e.proximoControl) : undefined,
    insumosUtilizados: Array.isArray(e.insumosUtilizados) ? e.insumosUtilizados : undefined,
    costoProcedimiento: typeof e.costoProcedimiento === 'number' ? e.costoProcedimiento : undefined,
    estadoPago: e.estadoPago,
    imagenesAdjuntas: Array.isArray(e.imagenesAdjuntas) ? e.imagenesAdjuntas.filter(Boolean) : [],
  };
}

/**
 * Sanitiza un paciente asegurando integridad en todos sus arrays, cadenas y odontograma.
 */
export function sanitizarPaciente(p: Partial<Paciente>): Paciente {
  if (!p || typeof p !== 'object') {
    return {
      id: `pac-${Date.now()}`,
      tipoDocumento: 'CC',
      numeroDocumento: '00000000',
      nombres: 'Paciente',
      apellidos: '',
      telefono: 'Sin teléfono',
      fechaNacimiento: '1995-01-01',
      ciudad: 'Bogotá',
      direccion: '',
      eps: 'Particular',
      genero: 'Otro',
      alergias: [],
      enfermedadesPrevias: [],
      medicamentosActuales: [],
      grupoSanguineo: 'O+',
      odontograma: crearOdontogramaInicial(),
      evoluciones: [],
      citas: [],
      imagenesDiagnosticas: [],
    };
  }

  let odontogramaSeguro: Record<number, DienteInfo>;
  if (p.odontograma && typeof p.odontograma === 'object') {
    odontogramaSeguro = { ...p.odontograma };
    for (const [key, diente] of Object.entries(odontogramaSeguro)) {
      const num = parseInt(key, 10);
      if (!diente || typeof diente !== 'object') {
        odontogramaSeguro[num] = {
          numero: num,
          nombre: NOMBRES_PIEZAS_FDI[num] || `Pieza ${num}`,
          estado: 'sano',
        };
      }
    }
  } else {
    odontogramaSeguro = crearOdontogramaInicial();
  }

  return {
    id: String(p.id || `pac-${Date.now()}`),
    tipoDocumento: (p.tipoDocumento === 'TI' || p.tipoDocumento === 'CE' || p.tipoDocumento === 'Pasaporte') ? p.tipoDocumento : 'CC',
    numeroDocumento: String(p.numeroDocumento || '00000000'),
    nombres: String(p.nombres || 'Paciente'),
    apellidos: String(p.apellidos || ''),
    email: p.email ? String(p.email) : undefined,
    telefono: String(p.telefono || 'Sin teléfono'),
    fechaNacimiento: String(p.fechaNacimiento || '1995-01-01'),
    ciudad: String(p.ciudad || 'Bogotá'),
    direccion: String(p.direccion || ''),
    eps: p.eps === 'Ecopetrol' ? 'Ecopetrol' : 'Particular',
    genero: (p.genero === 'Femenino' || p.genero === 'Masculino') ? p.genero : 'Otro',
    alergias: Array.isArray(p.alergias) ? p.alergias.filter(Boolean).map(String) : [],
    enfermedadesPrevias: Array.isArray(p.enfermedadesPrevias) ? p.enfermedadesPrevias.filter(Boolean).map(String) : [],
    medicamentosActuales: Array.isArray(p.medicamentosActuales) ? p.medicamentosActuales.filter(Boolean).map(String) : [],
    grupoSanguineo: p.grupoSanguineo ? String(p.grupoSanguineo) : 'O+',
    odontograma: odontogramaSeguro,
    evoluciones: Array.isArray(p.evoluciones) 
      ? p.evoluciones.filter((x): x is EvolucionClinica => Boolean(x) && typeof x === 'object').map(sanitizarEvolucion) 
      : [],
    citas: Array.isArray(p.citas) ? p.citas.filter(Boolean) : [],
    imagenesDiagnosticas: Array.isArray(p.imagenesDiagnosticas) ? p.imagenesDiagnosticas.filter(Boolean) : [],
  };
}

let cachePacientesMemoria: Paciente[] | null = null;

function safeLocalStorageGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Modo incógnito o cookies restringidas
  }
  return null;
}

function safeLocalStorageSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Modo incógnito o cookies restringidas
  }
}

function safeLocalStorageRemove(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Modo incógnito o cookies restringidas
  }
}

/**
 * Obtiene la lista actual de pacientes desde localStorage si está disponible,
 * o inicializa con los pacientes de referencia de la clínica con soporte total de modo incógnito.
 */
export function obtenerPacientesStorage(): Paciente[] {
  if (typeof window === 'undefined') {
    return PACIENTES_REGISTRADOS_BASE.map(sanitizarPaciente);
  }

  try {
    const raw = safeLocalStorageGet(CLAVE_STORAGE);

    // Si no existe v2, intentar migrar desde v1 si existe y es válido
    if (!raw) {
      const rawLegacy = safeLocalStorageGet(CLAVE_STORAGE_LEGACY);
      if (rawLegacy) {
        try {
          const parsedLegacy = JSON.parse(rawLegacy);
          if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
            const migradas = parsedLegacy
              .filter((p): p is Partial<Paciente> => Boolean(p) && typeof p === 'object' && Boolean(p.id))
              .map(sanitizarPaciente);
            if (migradas.length > 0) {
              safeLocalStorageSet(CLAVE_STORAGE, JSON.stringify(migradas));
              safeLocalStorageRemove(CLAVE_STORAGE_LEGACY);
              cachePacientesMemoria = migradas;
              return migradas;
            }
          }
        } catch {
          // Descartar legacy si contiene datos dañados
        }
        safeLocalStorageRemove(CLAVE_STORAGE_LEGACY);
      }

      if (cachePacientesMemoria && cachePacientesMemoria.length > 0) {
        return cachePacientesMemoria;
      }

      const baseSanitizada = PACIENTES_REGISTRADOS_BASE.map(sanitizarPaciente);
      safeLocalStorageSet(CLAVE_STORAGE, JSON.stringify(baseSanitizada));
      cachePacientesMemoria = baseSanitizada;
      return baseSanitizada;
    }

    const parsed: Partial<Paciente>[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      if (cachePacientesMemoria && cachePacientesMemoria.length > 0) {
        return cachePacientesMemoria;
      }
      const baseSanitizada = PACIENTES_REGISTRADOS_BASE.map(sanitizarPaciente);
      safeLocalStorageSet(CLAVE_STORAGE, JSON.stringify(baseSanitizada));
      cachePacientesMemoria = baseSanitizada;
      return baseSanitizada;
    }

    const sanitizados = parsed
      .filter((p): p is Partial<Paciente> => Boolean(p) && typeof p === 'object' && Boolean(p.id))
      .map(sanitizarPaciente);

    if (sanitizados.length === 0) {
      if (cachePacientesMemoria && cachePacientesMemoria.length > 0) {
        return cachePacientesMemoria;
      }
      const baseSanitizada = PACIENTES_REGISTRADOS_BASE.map(sanitizarPaciente);
      safeLocalStorageSet(CLAVE_STORAGE, JSON.stringify(baseSanitizada));
      cachePacientesMemoria = baseSanitizada;
      return baseSanitizada;
    }

    safeLocalStorageSet(CLAVE_STORAGE, JSON.stringify(sanitizados));
    cachePacientesMemoria = sanitizados;
    return sanitizados;
  } catch (error) {
    console.warn('Auto-recuperando almacenamiento en memoria:', error);
    if (cachePacientesMemoria && cachePacientesMemoria.length > 0) {
      return cachePacientesMemoria;
    }
    const baseSanitizada = PACIENTES_REGISTRADOS_BASE.map(sanitizarPaciente);
    safeLocalStorageSet(CLAVE_STORAGE, JSON.stringify(baseSanitizada));
    safeLocalStorageRemove(CLAVE_STORAGE_LEGACY);
    cachePacientesMemoria = baseSanitizada;
    return baseSanitizada;
  }
}

/**
 * Guarda la lista de pacientes en memoria y localStorage resiliente, emitiendo el evento de sincronización.
 */
export function guardarPacientesStorage(pacientes: Paciente[]): void {
  const sanitizados = (Array.isArray(pacientes) ? pacientes : [])
    .filter((p): p is Paciente => Boolean(p) && typeof p === 'object' && Boolean(p.id))
    .map(sanitizarPaciente);

  cachePacientesMemoria = sanitizados;

  if (typeof window === 'undefined') return;

  try {
    safeLocalStorageSet(CLAVE_STORAGE, JSON.stringify(sanitizados));
    window.dispatchEvent(new CustomEvent(EVENTO_PACIENTES_ACTUALIZADOS, { detail: sanitizados }));
  } catch (error) {
    console.warn('Error al guardar pacientes en storage:', error);
  }
}

/**
 * Busca un paciente por su identificador.
 */
export function obtenerPacientePorIdStorage(pacienteId: string): Paciente | undefined {
  const lista = obtenerPacientesStorage();
  return lista.find((p) => p && p.id === pacienteId);
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
  const index = lista.findIndex((p) => p && p.id === params.pacienteId);

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
  const index = lista.findIndex((p) => p && p.id === pacienteId);

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
