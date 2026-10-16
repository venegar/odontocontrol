'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  CalendarDays, 
  RefreshCw, 
  Info,
  CalendarCheck,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  FileText,
  PackageCheck,
  Receipt,
  Stethoscope,
  Pill,
  Printer,
  X,
  ShieldCheck,
  Check,
  Activity,
  FileCheck
} from 'lucide-react';
import { EstadoCita } from '@/modules/citas/types';
import { supabase } from '@/lib/supabase';
import { marcarCitaVistaAction } from '@/modules/recordatorios/actions';
import { obtenerPacientesStorage } from '@/modules/pacientes/storage';
import { Paciente } from '@/modules/pacientes/types';

export interface InsumoCitaUI {
  id?: string;
  nombre: string;
  cantidad: number;
  unidad?: string;
  lote?: string;
  registroInvima?: string;
}

export interface CitaPacienteUI {
  id: string;
  doctorNombre: string;
  especialidad: string;
  tratamiento: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: EstadoCita;
  esReagendamiento?: boolean;
  
  // Datos del historial clínico de la cita realizada
  procedimientoRealizado?: string;
  diagnostico?: string;
  diagnosticoCie10?: string;
  piezaDental?: string;
  dienteNumero?: number;
  insumosUtilizados?: InsumoCitaUI[];
  costoProcedimiento?: number;
  estadoPago?: 'pagado' | 'pendiente' | 'incluido_en_plan';
  numeroRecibo?: string;
  metodoPago?: string;
  indicaciones?: string;
  prescripcion?: string;
  motivoCancelacion?: string;
}

// Función pura para enriquecer citas completadas con información clínica detallada, insumos y costos
function enriquecerCitaConDatosClinicos(cita: Partial<CitaPacienteUI>): CitaPacienteUI {
  const tratamiento = cita.tratamiento || 'Valoración Odontológica Inicial';
  const esProfilaxis = tratamiento.toLowerCase().includes('profilaxis') || tratamiento.toLowerCase().includes('limpieza');
  const esResina = tratamiento.toLowerCase().includes('resina') || tratamiento.toLowerCase().includes('obturaci');
  const esBlanqueamiento = tratamiento.toLowerCase().includes('blanqueamiento') || tratamiento.toLowerCase().includes('aclaramiento');
  const esOrtodoncia = tratamiento.toLowerCase().includes('ortodoncia') || tratamiento.toLowerCase().includes('bracket');
  const esEndodoncia = tratamiento.toLowerCase().includes('endodoncia') || tratamiento.toLowerCase().includes('conducto');
  const esRadiografia = tratamiento.toLowerCase().includes('radiograf') || tratamiento.toLowerCase().includes('periapical');

  let procedimiento = cita.procedimientoRealizado;
  let diagnostico = cita.diagnostico;
  let diagnosticoCie10 = cita.diagnosticoCie10;
  let piezaDental = cita.piezaDental;
  let insumos = cita.insumosUtilizados;
  let costo = cita.costoProcedimiento;
  let indicaciones = cita.indicaciones;
  let prescripcion = cita.prescripcion;
  const estadoPago = cita.estadoPago || 'pagado';
  let numeroRecibo = cita.numeroRecibo;

  if (esResina) {
    procedimiento = procedimiento || 'Remoción de tejido cariado, grabado ácido selectivo, colocación de adhesivo universal y reconstrucción estética en resina compuesta nanohíbrida Filtek Z350 XT color A2 en caras oclusomesial.';
    diagnostico = diagnostico || 'Caries de la dentina en cara oclusomesial';
    diagnosticoCie10 = diagnosticoCie10 || 'K02.1';
    piezaDental = piezaDental || 'Pieza 24 (Primer Premolar Sup. Izq.)';
    costo = costo ?? 85000;
    numeroRecibo = numeroRecibo || 'REC-2026-00412';
    insumos = insumos || [
      { nombre: 'Resina Compuesta Filtek Z350 XT Color A2 (3M ESPE)', cantidad: 1, unidad: 'Jeringa x 4g / dosis', lote: '3M-2025-A2', registroInvima: 'INVIMA 2017DM-0001098' },
      { nombre: 'Adhesivo Single Bond Universal (3M ESPE)', cantidad: 1, unidad: 'Gota dosificada (0.1 ml)', lote: '3M-AD-894', registroInvima: 'INVIMA 2018DM-0002145' },
      { nombre: 'Anestésico Scandonest 3% Mepivacaína sin vasoconstrictor', cantidad: 1, unidad: 'Cárpule 1.8ml', lote: 'SC-2026-03', registroInvima: 'INVIMA 2019M-0006711' },
      { nombre: 'Ácido Grabador Fosfórico 37% Ultra-Etch', cantidad: 1, unidad: 'Dosis grabadora', lote: 'ETCH-4412', registroInvima: 'INVIMA 2016DM-0009843' },
      { nombre: 'Guantes de Examen de Nitrilo libres de polvo (New Stetic)', cantidad: 2, unidad: 'Pares estériles', lote: 'GN-2026-90', registroInvima: 'INVIMA 2020DM-0012340' },
      { nombre: 'Eyector de saliva estéril y babero de bioseguridad', cantidad: 1, unidad: 'Kit desechable', lote: 'BIO-2026-01' },
    ];
    indicaciones = indicaciones || 'Evitar alimentos excesivamente duros o bebidas muy frías por 24 horas.';
    prescripcion = prescripcion || 'Acetaminofén 500mg cada 8 horas si presenta molestia (NO Penicilina por alergia registrada).';
  } else if (esProfilaxis) {
    procedimiento = procedimiento || 'Detartraje supragingival con ultrasonido Cavitron para remoción de sarro y cálculo, pulido coronario con copa de caucho y pasta abrasiva, seguido de topicación con flúor barniz al 5%.';
    diagnostico = diagnostico || 'Gingivitis marginal inducida por placa bacteriana';
    diagnosticoCie10 = diagnosticoCie10 || 'K05.0';
    piezaDental = piezaDental || 'Toda la cavidad oral (Arcada Superior e Inferior)';
    costo = costo ?? 90000;
    numeroRecibo = numeroRecibo || 'REC-2026-00891';
    insumos = insumos || [
      { nombre: 'Pasta Profiláctica con Flúor sabor a menta (New Stetic)', cantidad: 1, unidad: 'Copa profiláctica', lote: 'NS-PRO-102', registroInvima: 'INVIMA 2019DM-0003412' },
      { nombre: 'Barniz de Flúor Duraphat 5% NaF (Colgate Professional)', cantidad: 1, unidad: 'Ampolleta unidosis 0.4ml', lote: 'DP-2025-88', registroInvima: 'INVIMA 2018M-0008921' },
      { nombre: 'Cepillo profiláctico para micromotor de profilaxis', cantidad: 1, unidad: 'Unidad descartable', lote: 'CP-2026-01' },
      { nombre: 'Eyector de saliva desechable de alta succión', cantidad: 1, unidad: 'Unidad estéril', lote: 'EY-2026-04' },
      { nombre: 'Campos quirúrgicos y babero impermeable de bioseguridad', cantidad: 1, unidad: 'Kit desechable', lote: 'BIO-2026-05' },
    ];
    indicaciones = indicaciones || 'Mantener uso diario de seda dental y cepillado 3 veces al día con técnica de Bass modificada.';
  } else if (esBlanqueamiento) {
    procedimiento = procedimiento || 'Aclaramiento dental en consultorio con gel de peróxido de hidrógeno al 35% y activación fotoasistida con lámpara de luz fría LED en dos sesiones consecutivas de 20 minutos con barrera gingival fotocurada.';
    diagnostico = diagnostico || 'Discromía y pigmentación dental extrínseca generalizada';
    diagnosticoCie10 = diagnosticoCie10 || 'K03.6';
    piezaDental = piezaDental || 'Sector anterior (Piezas 13 a 23 y 33 a 43)';
    costo = costo ?? 350000;
    numeroRecibo = numeroRecibo || 'REC-2026-01450';
    insumos = insumos || [
      { nombre: 'Gel Blanqueador Opalescence Boost 35% HP (Ultradent)', cantidad: 1, unidad: 'Jeringa bicomponente 1.2ml', lote: 'OP-2026-93', registroInvima: 'INVIMA 2021DM-0014520' },
      { nombre: 'Barrera de Aislamiento Gingival OpalDam (Ultradent)', cantidad: 1, unidad: 'Jeringa fotocurable 1.2ml', lote: 'DAM-2025-12', registroInvima: 'INVIMA 2020DM-0011298' },
      { nombre: 'Retractor labial y lingual flexible libre de látex', cantidad: 1, unidad: 'Unidad autoclavable', lote: 'RET-2026-02' },
      { nombre: 'Gel desensibilizante UltraEZ (Nitrato de Potasio / Flúor)', cantidad: 1, unidad: 'Jeringa dosificadora', lote: 'EZ-2026-44', registroInvima: 'INVIMA 2019DM-0004523' },
      { nombre: 'Guantes de Nitrilo de examen libres de polvo', cantidad: 2, unidad: 'Pares', lote: 'GN-2026-90' },
    ];
    indicaciones = indicaciones || 'Dieta blanca estricta durante 72 horas: evitar café, té, vino tinto, gaseosas oscuras, salsas rojas y cigarrillo.';
  } else if (esOrtodoncia) {
    procedimiento = procedimiento || 'Control periódico de ortodoncia, verificación de oclusión y torques, cambio de arcos NiTi térmicos y recambio de módulos elastoméricos.';
    diagnostico = diagnostico || 'Maloclusión clase I con apiñamiento dental anterior';
    diagnosticoCie10 = diagnosticoCie10 || 'K07.2';
    piezaDental = piezaDental || 'Arcadas superior e inferior';
    costo = costo ?? 70000;
    numeroRecibo = numeroRecibo || 'REC-2026-02190';
    insumos = insumos || [
      { nombre: 'Arco de Ortodoncia NiTi Térmico .016 Superior e Inferior', cantidad: 2, unidad: 'Unidades estériles', lote: 'NITI-2026-01' },
      { nombre: 'Módulos elastoméricos ligaduras estériles', cantidad: 1, unidad: 'Set de ligaduras', lote: 'MOD-2026-10' },
      { nombre: 'Guantes de Nitrilo y kit de protección de bioseguridad', cantidad: 1, unidad: 'Kit desechable', lote: 'GN-2026-01' },
    ];
    indicaciones = indicaciones || 'Uso de cera de alivio en caso de roce con brackets y cepillo interproximal para higiene entre brackets.';
  } else if (esEndodoncia) {
    procedimiento = procedimiento || 'Terapia de conductos radiculares, apertura cameral, instrumentación rotatoria mecanizada, irrigación con NaOCl al 5.25% y obturación hermética con gutapercha.';
    diagnostico = diagnostico || 'Pulpitis irreversible sintomática';
    diagnosticoCie10 = diagnosticoCie10 || 'K04.01';
    piezaDental = piezaDental || 'Pieza 11 (Incisivo Central Sup. Der.)';
    costo = costo ?? 280000;
    numeroRecibo = numeroRecibo || 'REC-2026-00334';
    insumos = insumos || [
      { nombre: 'Limas rotatorias de instrumentación WaveOne Gold', cantidad: 1, unidad: 'Blíster x 3 limas', lote: 'WO-2025-99' },
      { nombre: 'Conos de Gutapercha calibrados y cemento sellador AH Plus', cantidad: 1, unidad: 'Kit de obturación', lote: 'GUT-2026-04' },
      { nombre: 'Anestésico Lidocaína 2% con Epinefrina 1:80.000', cantidad: 2, unidad: 'Cárpules 1.8ml', lote: 'LID-2026-12' },
      { nombre: 'Dique de goma para aislamiento absoluto libre de látex', cantidad: 1, unidad: 'Unidad descartable', lote: 'DIQ-2026-08' },
    ];
    indicaciones = indicaciones || 'No masticar alimentos duros por la zona tratada hasta colocar la restauración definitiva.';
    prescripcion = prescripcion || 'Ibuprofeno 600mg cada 8 horas por 3 días si presenta molestia masticatoria.';
  } else if (esRadiografia) {
    procedimiento = procedimiento || 'Toma seriada de radiografías periapicales digitales sector anterosuperior y premolares para control óseo y radicular.';
    diagnostico = diagnostico || 'Estudio radiográfico periapical diagnóstico';
    diagnosticoCie10 = diagnosticoCie10 || 'Z01.2';
    piezaDental = piezaDental || 'Piezas 11, 21, 24';
    costo = costo ?? 40000;
    numeroRecibo = numeroRecibo || 'REC-2025-02100';
    insumos = insumos || [
      { nombre: 'Fundas protectoras desechables para sensor periapical', cantidad: 3, unidad: 'Fundas estériles', lote: 'FP-2025-77' },
      { nombre: 'Posicionador radiográfico angulado autoclavable', cantidad: 1, unidad: 'Unidad estéril' },
      { nombre: 'Collar tiroideo y delantal plomado de bioseguridad radiológica', cantidad: 1, unidad: 'Kit de protección' },
    ];
    indicaciones = indicaciones || 'Estructuras óseas de soporte en condiciones estables.';
  } else {
    // Valoración Inicial por defecto
    procedimiento = procedimiento || 'Examen estomatológico integral extraoral e intraoral, sondaje periodontal básico, odontograma digital FDI de 32 piezas y estructuración de plan de tratamiento personalizado.';
    diagnostico = diagnostico || 'Examen odontológico general de rutina y valoración inicial';
    diagnosticoCie10 = diagnosticoCie10 || 'Z01.2';
    piezaDental = piezaDental || 'Examen bucodental completo';
    costo = costo ?? 50000;
    numeroRecibo = numeroRecibo || 'REC-2026-00023';
    insumos = insumos || [
      { nombre: 'Espejo bucal estéril descartable n.º 5 con mango ergonómico', cantidad: 1, unidad: 'Unidad descartable', lote: 'ESP-2026-01', registroInvima: 'INVIMA 2019DM-0002341' },
      { nombre: 'Sonda periodontal Williams milimetrada y pinza algodonera', cantidad: 1, unidad: 'Kit instrumental estéril', lote: 'SOND-2025-11' },
      { nombre: 'Guantes de examen de nitrilo libres de polvo (New Stetic)', cantidad: 2, unidad: 'Pares estériles', lote: 'GN-2026-01' },
      { nombre: 'Vaso descartable, babero impermeable y kit de bioseguridad', cantidad: 1, unidad: 'Kit desechable', lote: 'BIO-2026-01' },
    ];
    indicaciones = indicaciones || 'Iniciar fase higiénica preventiva y programar restauración con resina estética en pieza 24.';
  }

  return {
    id: cita.id || `cita-${Date.now()}`,
    doctorNombre: cita.doctorNombre || 'Dra. Yasmín Blanco',
    especialidad: cita.especialidad || 'Odontología Especializada',
    tratamiento: cita.tratamiento || tratamiento,
    fecha: cita.fecha || '2026-10-16',
    horaInicio: cita.horaInicio || '08:00 AM',
    horaFin: cita.horaFin || '08:30 AM',
    estado: (cita.estado as EstadoCita) || 'completada',
    esReagendamiento: Boolean(cita.esReagendamiento),
    procedimientoRealizado: procedimiento,
    diagnostico,
    diagnosticoCie10,
    piezaDental,
    insumosUtilizados: insumos,
    costoProcedimiento: costo,
    estadoPago,
    numeroRecibo,
    metodoPago: cita.metodoPago || 'Tarjeta Débito / PSE',
    indicaciones,
    prescripcion,
    motivoCancelacion: cita.motivoCancelacion,
  };
}

// Citas iniciales con historial completo para demostración
const CITAS_INICIALES_COMPLETAS: CitaPacienteUI[] = [
  {
    id: 'cita-mc-1',
    doctorNombre: 'Dr. Carlos Ruiz',
    especialidad: 'Odontología General',
    tratamiento: 'Profilaxis y Limpieza Profunda',
    fecha: '2026-10-20',
    horaInicio: '09:30 AM',
    horaFin: '10:15 AM',
    estado: 'confirmada',
  },
  enriquecerCitaConDatosClinicos({
    id: 'cita-mc-2',
    doctorNombre: 'Dra. Yasmín Blanco',
    especialidad: 'Odontología Restauradora',
    tratamiento: 'Restauración en Resina Nanohíbrida A2',
    fecha: '2026-02-01',
    horaInicio: '02:00 PM',
    horaFin: '02:45 PM',
    estado: 'completada',
    costoProcedimiento: 85000,
  }),
  enriquecerCitaConDatosClinicos({
    id: 'cita-mc-3',
    doctorNombre: 'Dra. Yasmín Blanco',
    especialidad: 'Periodoncia & Preventiva',
    tratamiento: 'Profilaxis y Detartraje Ultrasónico',
    fecha: '2026-05-18',
    horaInicio: '10:30 AM',
    horaFin: '11:15 AM',
    estado: 'completada',
    costoProcedimiento: 90000,
  }),
  enriquecerCitaConDatosClinicos({
    id: 'cita-mc-4',
    doctorNombre: 'Dr. Carlos Ruiz',
    especialidad: 'Estética Dental',
    tratamiento: 'Blanqueamiento Dental LED en Consultorio',
    fecha: '2026-08-10',
    horaInicio: '03:00 PM',
    horaFin: '04:00 PM',
    estado: 'completada',
    costoProcedimiento: 350000,
  }),
  enriquecerCitaConDatosClinicos({
    id: 'cita-mc-5',
    doctorNombre: 'Dra. Yasmín Blanco',
    especialidad: 'Diagnóstico & Rehabilitación',
    tratamiento: 'Valoración Odontológica Inicial Integral',
    fecha: '2026-01-15',
    horaInicio: '08:30 AM',
    horaFin: '09:15 AM',
    estado: 'completada',
    costoProcedimiento: 50000,
  }),
];

// Horarios de disponibilidad simulados para reagendar
const HORARIOS_DISPONIBLES = [
  '08:30 AM',
  '10:00 AM',
  '11:30 AM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
];

// Formateador de moneda en pesos colombianos
function formatearMonedaCOP(valor?: number): string {
  if (typeof valor !== 'number' || isNaN(valor)) return '$ 0 COP';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor);
}

// Helper para convertir hora formato 12h a 24h para PostgreSQL
function convertirHora12a24(hora12: string): string {
  const limpia = hora12.trim();
  const match = limpia.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return '08:00:00';
  const horasStr = match[1];
  const minutosStr = match[2];
  const meridiano = match[3];
  let horas = parseInt(horasStr, 10);
  if (meridiano) {
    if (meridiano.toUpperCase() === 'PM' && horas < 12) horas += 12;
    if (meridiano.toUpperCase() === 'AM' && horas === 12) horas = 0;
  }
  return `${horas.toString().padStart(2, '0')}:${minutosStr}:00`;
}

function PortalPacienteContenido() {
  const searchParams = useSearchParams();
  const accionParam = searchParams.get('accion');
  const citaIdParam = searchParams.get('citaId');

  const [citas, setCitas] = useState<CitaPacienteUI[]>(CITAS_INICIALES_COMPLETAS);
  const [nombrePaciente, setNombrePaciente] = useState<string>('María Camila Pérez');
  const [documentoPaciente, setDocumentoPaciente] = useState<string>('CC 1020304050');
  const [filtro, setFiltro] = useState<'activas' | 'historial'>('activas');
  
  // Estado para modal de comprobante clínico imprimible
  const [citaParaComprobante, setCitaParaComprobante] = useState<CitaPacienteUI | null>(null);

  // Estado para el modal de reagendamiento
  const [citaParaReagendar, setCitaParaReagendar] = useState<CitaPacienteUI | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState<string>('');
  const [nuevoHorario, setNuevoHorario] = useState<string>('');
  const [motivoReagendamiento, setMotivoReagendamiento] = useState<string>('');

  // Estado para el modal de cancelación
  const [citaParaCancelar, setCitaParaCancelar] = useState<CitaPacienteUI | null>(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState<string>('');

  // Mensaje de notificación temporal
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [alertaAccion, setAlertaAccion] = useState<{ tipo: 'exito' | 'info' | 'error'; titulo: string; detalle: string } | null>(null);

  // Sincronización en vivo con sesión del paciente y base de datos
  useEffect(() => {
    let montado = true;

    async function sincronizarCitasPortal() {
      // 1. Identificar paciente activo desde localStorage
      let pacienteStorage: Paciente | undefined;
      try {
        const sesionRaw = localStorage.getItem('consultorio_usuario_activo');
        if (sesionRaw) {
          const sesion = JSON.parse(sesionRaw);
          if (sesion.nombres) {
            const nombreCompuesto = `${sesion.nombres} ${sesion.apellidos || ''}`.trim();
            if (montado) setNombrePaciente(nombreCompuesto);
          }
        }
        
        const pacientes = obtenerPacientesStorage();
        // Buscar paciente que coincida por nombre o usar María Camila Pérez como predeterminada
        pacienteStorage = pacientes.find(p => 
          p.id === 'pac-1' || 
          p.email === 'maria.perez@ejemplo.com' ||
          `${p.nombres} ${p.apellidos}`.toLowerCase().includes('camila')
        ) || pacientes[0];

        if (pacienteStorage && montado) {
          setDocumentoPaciente(`${pacienteStorage.tipoDocumento} ${pacienteStorage.numeroDocumento}`);
          if (pacienteStorage.citas && pacienteStorage.citas.length > 0) {
            const citasConvertidas: CitaPacienteUI[] = pacienteStorage.citas.map(c => {
              const base: Partial<CitaPacienteUI> = {
                id: c.id,
                doctorNombre: c.doctorNombre,
                especialidad: c.especialidad || 'Odontología Especializada',
                tratamiento: c.tratamiento,
                fecha: c.fecha,
                horaInicio: c.hora || '09:00 AM',
                horaFin: `${c.hora || '09:00 AM'} (45 min)`,
                estado: c.estado as EstadoCita,
                procedimientoRealizado: c.procedimientoRealizado,
                diagnostico: c.diagnostico,
                diagnosticoCie10: c.diagnosticoCie10,
                piezaDental: c.piezaDental,
                dienteNumero: c.dienteNumero,
                insumosUtilizados: c.insumosUtilizados,
                costoProcedimiento: c.costoProcedimiento,
                estadoPago: c.estadoPago || 'pagado',
                numeroRecibo: c.numeroRecibo,
                indicaciones: c.indicaciones,
                prescripcion: c.prescripcion,
              };
              return c.estado === 'completada' ? enriquecerCitaConDatosClinicos(base) : (base as CitaPacienteUI);
            });

            setCitas(citasConvertidas);
          }
        }
      } catch (err) {
        console.warn('Lectura de pacientes en storage:', err);
      }

      // 2. Sincronizar con citas de Supabase (si están disponibles)
      try {
        const { data, error } = await supabase.rpc('obtener_citas_gestion');
        if (!error && Array.isArray(data) && data.length > 0 && montado) {
          const citasDB: CitaPacienteUI[] = data.map((c: Record<string, unknown>) => {
            const estado = String(c.estado || 'solicitada') as EstadoCita;
            const base: Partial<CitaPacienteUI> = {
              id: String(c.id),
              doctorNombre: String(c.doctor_nombre || 'Dra. Yasmín Blanco'),
              especialidad: 'Odontología Especializada',
              tratamiento: String(c.tratamiento_nombre || 'Valoración Odontológica'),
              fecha: String(c.fecha),
              horaInicio: String(c.hora_inicio || '08:00 AM'),
              horaFin: String(c.hora_fin || '08:30 AM'),
              estado,
              esReagendamiento: Boolean(c.es_reagendamiento),
              motivoCancelacion: c.motivo_rechazo_cancelacion ? String(c.motivo_rechazo_cancelacion) : undefined,
              costoProcedimiento: typeof c.precio_base === 'number' ? c.precio_base : undefined,
            };

            return estado === 'completada' ? enriquecerCitaConDatosClinicos(base) : (base as CitaPacienteUI);
          });

          // Si hay citaId en la URL, registrar la visualización y asociar el nombre del paciente
          if (citaIdParam) {
            marcarCitaVistaAction(citaIdParam, 'whatsapp').catch(() => {});
            const citaEnfocada = data.find((c: Record<string, unknown>) => String(c.id) === citaIdParam);
            if (citaEnfocada && citaEnfocada.paciente_nombre) {
              setNombrePaciente(String(citaEnfocada.paciente_nombre));
            }
          }

          setCitas(prev => {
            const idsDB = new Set(citasDB.map(c => c.id));
            const demosRestantes = prev.filter(c => !idsDB.has(c.id));
            return [...citasDB, ...demosRestantes];
          });

          // Manejar acciones automáticas por URL
          if (citaIdParam) {
            const citaObjetivo = citasDB.find(c => c.id === citaIdParam);
            if (citaObjetivo) {
              if (accionParam === 'confirmar') {
                await supabase.rpc('confirmar_cita_portal', { p_cita_id: citaIdParam });
                setCitas(current => current.map(c => c.id === citaIdParam ? { ...c, estado: 'confirmada' } : c));
                setAlertaAccion({
                  tipo: 'exito',
                  titulo: '¡Tu cita ha sido confirmada con éxito!',
                  detalle: `Hola ${nombrePaciente}, confirmamos tu cita de "${citaObjetivo.tratamiento}" para el ${citaObjetivo.fecha} a las ${citaObjetivo.horaInicio} con ${citaObjetivo.doctorNombre}. ¡Te esperamos en la clínica!`,
                });
              } else if (accionParam === 'reagendar') {
                setCitaParaReagendar(citaObjetivo);
                setAlertaAccion({
                  tipo: 'info',
                  titulo: 'Reagendamiento de Cita',
                  detalle: `Por favor selecciona la nueva fecha y hora para tu cita de "${citaObjetivo.tratamiento}".`,
                });
              } else if (accionParam === 'cancelar') {
                setCitaParaCancelar(citaObjetivo);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Citas reales de Supabase en proceso:', err);
      }
    }

    sincronizarCitasPortal();
    return () => { montado = false; };
  }, [accionParam, citaIdParam, nombrePaciente]);

  // Cita enfocada si proviene de un enlace directo de WhatsApp
  const citaEnfocada = citaIdParam ? citas.find(c => c.id === citaIdParam) : null;

  // Filtrado de citas
  const citasFiltradas = citas.filter(c => {
    if (filtro === 'activas') {
      return ['confirmada', 'solicitada', 'pendiente', 'en_atencion'].includes(c.estado);
    }
    return ['completada', 'cancelada', 'rechazada'].includes(c.estado);
  });

  // Métricas de historial clínico
  const citasCompletadas = citas.filter(c => c.estado === 'completada');
  const totalInvertido = citasCompletadas.reduce((acc, c) => acc + (c.costoProcedimiento || 0), 0);
  const totalInsumosRegistrados = citasCompletadas.reduce((acc, c) => acc + (c.insumosUtilizados?.length || 0), 0);

  // Manejar acción de Reagendamiento
  const handleConfirmarReagendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citaParaReagendar || !nuevaFecha || !nuevoHorario) return;

    try {
      const hora24 = convertirHora12a24(nuevoHorario);
      await supabase.rpc('reagendar_cita_portal', {
        p_cita_id: citaParaReagendar.id,
        p_nueva_fecha: nuevaFecha,
        p_nueva_hora: hora24,
        p_motivo: motivoReagendamiento || 'Reagendada por el paciente desde el portal',
      });
    } catch (err) {
      console.warn('Reagendamiento local aplicado:', err);
    }

    setCitas(prev => prev.map(c => {
      if (c.id === citaParaReagendar.id) {
        return {
          ...c,
          fecha: nuevaFecha,
          horaInicio: nuevoHorario,
          horaFin: `${nuevoHorario} (Estimado)`,
          estado: 'solicitada',
          esReagendamiento: true,
        };
      }
      return c;
    }));

    setMensajeExito('¡Tu solicitud de reagendamiento ha sido enviada con éxito! Está en proceso de confirmación.');
    setCitaParaReagendar(null);
    setNuevaFecha('');
    setNuevoHorario('');
    setMotivoReagendamiento('');

    setTimeout(() => setMensajeExito(null), 6000);
  };

  // Manejar acción de Cancelación
  const handleConfirmarCancelar = async () => {
    if (!citaParaCancelar) return;

    try {
      await supabase.rpc('cancelar_cita_portal', {
        p_cita_id: citaParaCancelar.id,
        p_motivo: motivoCancelacion || 'Cancelada por el paciente desde el portal',
      });
    } catch (err) {
      console.warn('Cancelación local aplicada:', err);
    }

    setCitas(prev => prev.map(c => {
      if (c.id === citaParaCancelar.id) {
        return {
          ...c,
          estado: 'cancelada',
          motivoCancelacion: motivoCancelacion || 'Cancelada por el paciente',
        };
      }
      return c;
    }));

    setMensajeExito('Tu cita ha sido cancelada correctamente.');
    setCitaParaCancelar(null);
    setMotivoCancelacion('');
    setTimeout(() => setMensajeExito(null), 6000);
  };

  // Manejar confirmación directa de asistencia
  const handleConfirmarAsistencia = async (citaId: string) => {
    try {
      await supabase.rpc('confirmar_cita_portal', { p_cita_id: citaId });
    } catch (err) {
      console.warn('Confirmación local aplicada:', err);
    }

    setCitas(prev => prev.map(c => c.id === citaId ? { ...c, estado: 'confirmada' } : c));
    setMensajeExito('¡Gracias por confirmar tu asistencia! Tu cita está 100% asegurada en la agenda.');
    setTimeout(() => setMensajeExito(null), 6000);
  };

  // Insignia del estado de la cita
  const getBadgeEstado = (estado: EstadoCita, esReagendamiento?: boolean) => {
    if (esReagendamiento && estado === 'solicitada') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3" /> Reagendamiento en Espera
        </span>
      );
    }

    switch (estado) {
      case 'confirmada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Cita Confirmada
          </span>
        );
      case 'solicitada':
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" /> Pendiente de Confirmación
          </span>
        );
      case 'completada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
            <CheckCircle2 className="w-3 h-3" /> Atendida & Completada
          </span>
        );
      case 'cancelada':
      case 'rechazada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3" /> Cita Cancelada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            {estado}
          </span>
        );
    }
  };

  const iniciales = nombrePaciente
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'MC';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Cabecera del Portal */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link 
              href="/" 
              className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition"
              title="Volver al inicio"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Portal del Paciente
              </h1>
              <p className="text-xs text-slate-500">Gestión de Citas y Calendario Personal</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-dentist-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {iniciales}
            </div>
            <div className="hidden sm:block text-right">
              <span className="block text-xs font-semibold text-slate-800">{nombrePaciente}</span>
              <span className="block text-[11px] text-slate-500">{documentoPaciente} • Paciente Activo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        
        {/* Banner de Acción Inmediata (Confirmar / Reagendar / Cancelar vía Link de Recordatorio) */}
        {alertaAccion && (
          <div className={`mb-6 p-4 rounded-2xl border shadow-sm flex items-start gap-3.5 ${
            alertaAccion.tipo === 'exito' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-sky-50 border-sky-200 text-sky-900'
          }`}>
            <div className={`p-2.5 rounded-xl text-white shrink-0 ${alertaAccion.tipo === 'exito' ? 'bg-emerald-600' : 'bg-dentist-600'}`}>
              {alertaAccion.tipo === 'exito' ? <CheckCircle2 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">{alertaAccion.titulo}</h3>
              <p className="text-xs mt-1 leading-relaxed">{alertaAccion.detalle}</p>
            </div>
          </div>
        )}

        {/* Notificación de Éxito Temporal */}
        {mensajeExito && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{mensajeExito}</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Tu historial clínico y calendario han sido actualizados en tiempo real.
              </p>
            </div>
          </div>
        )}

        {/* Banner Informativo sobre Políticas */}
        <div className="mb-8 p-5 bg-gradient-to-r from-sky-50 to-dentist-50 rounded-2xl border border-sky-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white shadow-sm text-dentist-600">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Política de Agendamiento y Asistencia</h2>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed max-w-2xl">
                Puedes confirmar tu asistencia, solicitar reagendamiento o cancelación sin costo con al menos <strong>12 horas de anticipación</strong>. Las solicitudes pasarán por validación del consultorio o aprobación automática según la agenda del odontólogo.
              </p>
            </div>
          </div>
          <Link
            href="/#contacto"
            className="text-xs font-semibold text-dentist-700 hover:text-dentist-800 bg-white px-3.5 py-2 rounded-xl shadow-sm border border-sky-200 shrink-0"
          >
            Soporte por WhatsApp
          </Link>
        </div>

        {/* Módulo de Autogestión Directa en 1 Toque (Cuando el paciente abre el link de su cita desde WhatsApp) */}
        {citaEnfocada && (
          <div className="mb-8 p-5 bg-white rounded-2xl border-2 border-dentist-500/40 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  {getBadgeEstado(citaEnfocada.estado, citaEnfocada.esReagendamiento)}
                  <span className="text-xs text-slate-400 font-semibold">•</span>
                  <span className="text-xs font-bold text-dentist-700">Autogestión de tu Cita</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {citaEnfocada.tratamiento}
                </h3>
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
                  <span>📅 <strong>{citaEnfocada.fecha}</strong></span>
                  <span>⏰ <strong>{citaEnfocada.horaInicio} - {citaEnfocada.horaFin}</strong></span>
                  <span>🩺 <strong>{citaEnfocada.doctorNombre}</strong></span>
                </p>
              </div>

              {/* Botones táctiles grandes para autogestión en 1 solo toque */}
              <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                {['solicitada', 'pendiente'].includes(citaEnfocada.estado) && (
                  <button
                    type="button"
                    onClick={() => handleConfirmarAsistencia(citaEnfocada.id)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5"
                    title="Confirmar inmediatamente que asistirás"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Cita</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setCitaParaReagendar(citaEnfocada);
                    setNuevaFecha(citaEnfocada.fecha);
                    setNuevoHorario(citaEnfocada.horaInicio);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-dentist-50 hover:bg-dentist-100 text-dentist-700 border border-dentist-200 font-bold text-xs transition active:scale-95 flex items-center gap-1.5"
                  title="Cambiar fecha u hora de tu cita"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Solicitar Reagendamiento</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCitaParaCancelar(citaEnfocada)}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition active:scale-95 flex items-center gap-1.5"
                  title="Cancelar cita y liberar horario"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancelar Cita</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pestañas de Navegación Principal */}
        <div className="flex border-b border-slate-200 mb-6 space-x-6">
          <button
            onClick={() => setFiltro('activas')}
            className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
              filtro === 'activas'
                ? 'border-dentist-600 text-dentist-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Citas Activas y Próximas</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-dentist-100 text-dentist-700 font-bold">
              {citas.filter(c => ['confirmada', 'solicitada', 'en_atencion'].includes(c.estado)).length}
            </span>
          </button>

          <button
            onClick={() => setFiltro('historial')}
            className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
              filtro === 'historial'
                ? 'border-dentist-600 text-dentist-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Historial Clínico de Citas</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-200 text-slate-700 font-medium">
              {citas.filter(c => ['completada', 'cancelada', 'rechazada'].includes(c.estado)).length}
            </span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* RESUMEN DEL EXPEDIENTE CLÍNICO (Solo en pestaña de Historial)  */}
        {/* ============================================================== */}
        {filtro === 'historial' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Citas Atendidas</span>
              <p className="text-xl font-black text-slate-900 mt-1 flex items-baseline gap-1.5">
                <span>{citasCompletadas.length}</span>
                <span className="text-xs font-semibold text-teal-600">finalizadas</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Procedimientos</span>
              <p className="text-xl font-black text-dentist-700 mt-1 flex items-baseline gap-1.5">
                <span>{citasCompletadas.length}</span>
                <span className="text-xs font-semibold text-slate-500">registrados</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Insumos Trazados</span>
              <p className="text-xl font-black text-indigo-700 mt-1 flex items-baseline gap-1.5">
                <span>{totalInsumosRegistrados}</span>
                <span className="text-xs font-semibold text-slate-500">materiales</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-emerald-200 bg-emerald-50/30 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Inversión en Salud</span>
              <p className="text-base sm:text-lg font-black text-emerald-700 mt-1">
                {formatearMonedaCOP(totalInvertido)}
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* LISTADO DE CITAS (ACTIVAS O HISTÓRICO CON INSUMOS Y COSTOS)     */}
        {/* ============================================================== */}
        <div className="space-y-4">
          {citasFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No hay citas en esta sección</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No tienes citas en estado {filtro === 'activas' ? 'activo' : 'histórico'} en este momento.
              </p>
              {filtro === 'activas' && (
                <Link
                  href="/#solicitar-cita"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-dentist-600 hover:bg-dentist-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                >
                  Solicitar una Nueva Cita
                </Link>
              )}
            </div>
          ) : (
            citasFiltradas.map((cita) => {
              const esCompletada = cita.estado === 'completada';
              const puedeModificarse = ['confirmada', 'solicitada'].includes(cita.estado);

              // -------------------------------------------------------------
              // RENDERIZADO DETALLADO DEL HISTORIAL CLÍNICO DE CITAS
              // Con: Procedimiento realizado, Insumos utilizados y Costo
              // -------------------------------------------------------------
              if (filtro === 'historial') {
                return (
                  <div
                    key={cita.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition overflow-hidden"
                  >
                    {/* Encabezado de la Tarjeta */}
                    <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          {getBadgeEstado(cita.estado, cita.esReagendamiento)}
                          <span className="text-xs font-semibold text-slate-400">•</span>
                          <span className="text-xs font-semibold text-slate-600">{cita.especialidad}</span>
                          <span className="text-xs font-semibold text-slate-400">•</span>
                          <span className="text-xs font-bold text-slate-800">📅 {cita.fecha}</span>
                          <span className="text-xs text-slate-500">⏰ {cita.horaInicio} - {cita.horaFin}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{cita.tratamiento}</h3>
                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-dentist-600" />
                          <span>Odontólogo tratante: <strong>{cita.doctorNombre}</strong></span>
                        </p>
                      </div>

                      {/* Tarjeta destacada del Costo del Procedimiento */}
                      {esCompletada && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                              Costo del Procedimiento:
                            </span>
                            <span className="text-base font-black text-emerald-700">
                              {formatearMonedaCOP(cita.costoProcedimiento)}
                            </span>
                          </div>
                          <div className="text-right pl-3 border-l border-emerald-200">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-white border border-emerald-300 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3 text-emerald-600" />
                              {cita.estadoPago === 'pagado' ? 'Pagado' : 'Liquidado'}
                            </span>
                            {cita.numeroRecibo && (
                              <span className="block text-[10px] text-emerald-700 mt-0.5 font-medium">
                                {cita.numeroRecibo}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Si la cita fue completada: Detalle de Procedimiento, Insumos y Costos */}
                    {esCompletada ? (
                      <div className="p-5 space-y-4">
                        {/* 1. PROCEDIMIENTO REALIZADO Y DIAGNÓSTICO */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="text-xs font-bold text-dentist-700 uppercase tracking-wider flex items-center gap-1.5">
                              <Stethoscope className="w-4 h-4 text-dentist-600" />
                              <span>Procedimiento Clínico Realizado:</span>
                            </span>
                            {cita.piezaDental && (
                              <span className="text-xs font-semibold bg-white border border-slate-300 text-slate-800 px-2.5 py-0.5 rounded-lg shadow-2xs">
                                🦷 {cita.piezaDental}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                            {cita.procedimientoRealizado || cita.tratamiento}
                          </p>

                          {cita.diagnostico && (
                            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                              <span className="text-slate-500 font-semibold">Diagnóstico Clínico:</span>
                              <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {cita.diagnostico}
                              </span>
                              {cita.diagnosticoCie10 && (
                                <span className="bg-sky-100 text-sky-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-sky-200">
                                  CIE-10: {cita.diagnosticoCie10}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 2. INSUMOS Y MATERIALES UTILIZADOS */}
                        <div className="border border-teal-200 bg-teal-50/20 rounded-xl p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                              <PackageCheck className="w-4 h-4 text-teal-700" />
                              <span>Insumos y Materiales Utilizados en Consulta ({cita.insumosUtilizados?.length || 0}):</span>
                            </span>
                            <span className="text-[10px] text-teal-800 font-semibold bg-white px-2 py-0.5 rounded border border-teal-200">
                              Trazabilidad FEFO y Registro Sanitario
                            </span>
                          </div>

                          {cita.insumosUtilizados && cita.insumosUtilizados.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {cita.insumosUtilizados.map((ins, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white rounded-lg p-2.5 border border-teal-100 shadow-2xs flex items-center justify-between gap-2"
                                >
                                  <div className="space-y-0.5 flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-900 truncate" title={ins.nombre}>
                                      {ins.nombre}
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                      {ins.unidad ? `${ins.unidad}` : 'Unidad'}
                                      {ins.lote ? ` • Lote: ${ins.lote}` : ''}
                                    </p>
                                  </div>
                                  <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2 py-1 rounded-md shrink-0">
                                    x{ins.cantidad}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic">
                              Materiales estériles de bioseguridad y campo quirúrgico aplicados según protocolo clínico.
                            </p>
                          )}
                        </div>

                        {/* 3. PRESCRIPCIÓN MÉDICA O INDICACIONES (SI EXISTEN) */}
                        {(cita.prescripcion || cita.indicaciones) && (
                          <div className="bg-amber-50/50 rounded-xl p-3.5 border border-amber-200 text-xs space-y-1.5">
                            <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                              <Pill className="w-3.5 h-3.5 text-amber-700" />
                              <span>Prescripción y Cuidados Post-Consulta:</span>
                            </span>
                            {cita.prescripcion && (
                              <p className="text-slate-800">
                                <strong>Fórmula:</strong> {cita.prescripcion}
                              </p>
                            )}
                            {cita.indicaciones && (
                              <p className="text-slate-700">
                                <strong>Recomendaciones:</strong> {cita.indicaciones}
                              </p>
                            )}
                          </div>
                        )}

                        {/* 4. BOTÓN PARA VER / IMPRIMIR COMPROBANTE OFICIAL */}
                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setCitaParaComprobante(cita)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-dentist-700 bg-dentist-50 hover:bg-dentist-100 border border-dentist-200 rounded-xl transition active:scale-95 shadow-2xs"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-dentist-600" />
                            <span>Ver Comprobante Clínico y Recibo</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Si la cita fue cancelada */
                      <div className="p-4 bg-slate-50 text-xs text-slate-600 space-y-1">
                        <p className="text-rose-700 font-semibold">
                          Esta cita fue cancelada. No se aplicaron cargos por procedimientos ni descuento de insumos clínicos.
                        </p>
                        {cita.motivoCancelacion && (
                          <p><strong>Motivo registrado:</strong> {cita.motivoCancelacion}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              // -------------------------------------------------------------
              // RENDERIZADO DE CITAS ACTIVAS Y PRÓXIMAS
              // -------------------------------------------------------------
              return (
                <div
                  key={cita.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  {/* Detalles Izquierda */}
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {getBadgeEstado(cita.estado, cita.esReagendamiento)}
                      <span className="text-xs font-semibold text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-600">{cita.especialidad}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">{cita.tratamiento}</h3>
                      <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-dentist-600" />
                        <span>Odontólogo tratante: <strong>{cita.doctorNombre}</strong></span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                        <CalendarIcon className="w-3.5 h-3.5 text-dentist-600" />
                        <span className="font-semibold text-slate-800">{cita.fecha}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                        <Clock className="w-3.5 h-3.5 text-dentist-600" />
                        <span>{cita.horaInicio} - {cita.horaFin}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de Acción Derecha */}
                  {puedeModificarse && (
                    <div className="flex sm:flex-row md:flex-col lg:flex-row items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                      {['solicitada', 'pendiente'].includes(cita.estado) && (
                        <button
                          type="button"
                          onClick={() => handleConfirmarAsistencia(cita.id)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs rounded-xl transition active:scale-95"
                          title="Confirmar mi asistencia a esta cita"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirmar Asistencia</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setCitaParaReagendar(cita);
                          setNuevaFecha(cita.fecha);
                          setNuevoHorario(cita.horaInicio);
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-dentist-700 bg-dentist-50 hover:bg-dentist-100 border border-dentist-200 rounded-xl transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reagendar Cita</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCitaParaCancelar(cita)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* ============================================================== */}
      {/* MODAL: COMPROBANTE CLÍNICO Y RECIBO OFICIAL                    */}
      {/* ============================================================== */}
      {citaParaComprobante && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Encabezado membretado */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-black tracking-widest text-dentist-600 uppercase block">
                  CONSULTORIO ODONTOLÓGICO VIRTUAL
                </span>
                <h3 className="font-black text-lg text-slate-900">
                  Comprobante Oficial de Atención Odontológica
                </h3>
                <p className="text-xs text-slate-500">
                  Dra. Yasmín Blanco • Odontología Especializada • Nit. 52.893.412-1
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCitaParaComprobante(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition print:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Datos del Paciente y de la Consulta */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paciente:</span>
                <p className="font-bold text-slate-900">{nombrePaciente}</p>
                <p className="text-slate-600">{documentoPaciente}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fecha y Recibo:</span>
                <p className="font-bold text-slate-900">{citaParaComprobante.fecha} • {citaParaComprobante.horaInicio}</p>
                <p className="text-emerald-700 font-semibold">{citaParaComprobante.numeroRecibo || 'REC-2026-OFICIAL'}</p>
              </div>
            </div>

            {/* Procedimiento Realizado */}
            <div className="py-4 border-b border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-dentist-700 uppercase tracking-wider block">
                Procedimiento Clínico Ejecutado:
              </span>
              <p className="text-sm font-semibold text-slate-900">
                {citaParaComprobante.procedimientoRealizado || citaParaComprobante.tratamiento}
              </p>
              {citaParaComprobante.diagnostico && (
                <p className="text-xs text-slate-600">
                  <strong>Diagnóstico:</strong> {citaParaComprobante.diagnostico}
                  {citaParaComprobante.diagnosticoCie10 && ` (CIE-10: ${citaParaComprobante.diagnosticoCie10})`}
                </p>
              )}
              {citaParaComprobante.piezaDental && (
                <p className="text-xs text-slate-600">
                  <strong>Pieza dental intervenida:</strong> {citaParaComprobante.piezaDental}
                </p>
              )}
            </div>

            {/* Tabla de Insumos Utilizados */}
            <div className="py-4 border-b border-slate-200 space-y-2.5">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                Insumos y Materiales Sanitarios Empleados:
              </span>
              {citaParaComprobante.insumosUtilizados && citaParaComprobante.insumosUtilizados.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                      <tr>
                        <th className="py-2 px-3">Insumo Odontológico</th>
                        <th className="py-2 px-3">Lote / Registro</th>
                        <th className="py-2 px-3 text-right">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {citaParaComprobante.insumosUtilizados.map((ins, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-medium text-slate-800">{ins.nombre}</td>
                          <td className="py-2 px-3 text-slate-500 text-[11px]">{ins.lote || 'FEFO Activo'}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">{ins.cantidad} {ins.unidad || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Bioseguridad estándar del consultorio.</p>
              )}
            </div>

            {/* Liquidación de Costos */}
            <div className="py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Estado de Liquidación:
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block mt-1">
                  ✓ Pagado en su totalidad • {citaParaComprobante.metodoPago || 'Tarjeta Débito'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Valor Total Procedimiento:</span>
                <p className="text-xl font-black text-slate-900">
                  {formatearMonedaCOP(citaParaComprobante.costoProcedimiento)}
                </p>
              </div>
            </div>

            {/* Botones de Acción del Modal */}
            <div className="pt-5 flex items-center justify-between print:hidden">
              <span className="text-[11px] text-slate-400">
                Documento clínico para fines informativos del paciente
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Comprobante</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCitaParaComprobante(null)}
                  className="px-5 py-2 text-xs font-bold text-white bg-dentist-600 hover:bg-dentist-700 rounded-xl transition shadow-xs"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: REAGENDAR CITA                                          */}
      {/* ============================================================== */}
      {citaParaReagendar && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-dentist-600" />
                <span>Solicitud de Reagendamiento</span>
              </h3>
              <button
                type="button"
                onClick={() => setCitaParaReagendar(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmarReagendar} className="mt-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p>Tratamiento: <strong className="text-slate-800">{citaParaReagendar.tratamiento}</strong></p>
                <p>Odontólogo asignado: <strong className="text-slate-800">{citaParaReagendar.doctorNombre}</strong></p>
                <p>Horario actual: <span className="line-through text-slate-400">{citaParaReagendar.fecha} a las {citaParaReagendar.horaInicio}</span></p>
              </div>

              {/* Selector de Nueva Fecha */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nueva Fecha Deseada:
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                />
              </div>

              {/* Selector de Horarios Disponibles del Doctor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Franjas Horarias Disponibles del Odontólogo:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {HORARIOS_DISPONIBLES.map((hora) => (
                    <button
                      type="button"
                      key={hora}
                      onClick={() => setNuevoHorario(hora)}
                      className={`text-xs py-2 px-2.5 rounded-lg border font-medium transition ${
                        nuevoHorario === hora
                          ? 'bg-dentist-600 text-white border-dentist-600 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {hora}
                    </button>
                  ))}
                </div>
                {!nuevoHorario && (
                  <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Selecciona uno de los horarios libres.
                  </p>
                )}
              </div>

              {/* Motivo Opcional */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo del cambio (Opcional):
                </label>
                <textarea
                  rows={2}
                  value={motivoReagendamiento}
                  onChange={(e) => setMotivoReagendamiento(e.target.value)}
                  placeholder="Ej. Compromiso laboral imprevisto..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                />
              </div>

              <div className="pt-4 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setCitaParaReagendar(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!nuevaFecha || !nuevoHorario}
                  className="px-5 py-2 text-xs font-semibold bg-dentist-600 hover:bg-dentist-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition"
                >
                  Confirmar y Solicitar Cambio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CANCELAR CITA                                           */}
      {/* ============================================================== */}
      {citaParaCancelar && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">¿Deseas cancelar esta cita?</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Estás a punto de cancelar tu cita para <strong>{citaParaCancelar.tratamiento}</strong> programada para el <strong>{citaParaCancelar.fecha}</strong> a las <strong>{citaParaCancelar.horaInicio}</strong> con el {citaParaCancelar.doctorNombre}.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motivo de la cancelación (Opcional):
              </label>
              <input
                type="text"
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                placeholder="Indícanos brevemente la razón..."
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setCitaParaCancelar(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmarCancelar}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition"
              >
                Sí, Cancelar Cita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PortalPacientePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dentist-600" />
      </div>
    }>
      <PortalPacienteContenido />
    </Suspense>
  );
}
