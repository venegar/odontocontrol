'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  Filter, 
  RefreshCw, 
  Phone, 
  CalendarCheck, 
  Check, 
  X, 
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  CalendarRange,
  MessageCircle,
  Send,
  Copy,
  ExternalLink,
  Eye,
  AlertTriangle,
  Loader2,
  Search,
  UserCheck,
  UserPlus,
  ChevronDown
} from 'lucide-react';
import { EstadoCita, ModoAprobacion } from '@/modules/citas/types';
import { Paciente, TipoEps } from '@/modules/pacientes/types';
import { PACIENTES_REGISTRADOS_BASE } from '@/modules/pacientes/datos';
import { 
  aprobarCita, 
  rechazarCita, 
  obtenerCitasHoy,
  agendarCitaRecepcionAction,
  cancelarCitaAction,
  reagendarCitaRecepcionAction,
  confirmarCitaRecepcionAction
} from '@/modules/citas/actions';
import { 
  formatearFechaEspanol, 
  generarEnlaceWhatsApp, 
  generarMensajeReagendamiento, 
  generarMensajeCancelacion,
  normalizarTelefonoWhatsApp
} from '@/modules/recordatorios/utils';
import { obtenerDatosConsultorio } from '@/modules/configuracion/consultorioService';
import { supabase } from '@/lib/supabase';

interface CitaGestionUI {
  id: string;
  pacienteNombre: string;
  pacienteDocumento: string;
  pacienteTelefono: string;
  doctorNombre: string;
  tratamiento: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: EstadoCita;
  esReagendamiento?: boolean;
  motivoSolicitud?: string;
  motivoRechazoCancelacion?: string;
}

// Citas iniciales de demostración (incluyendo citas para el 20 de octubre)
const CITAS_INICIALES: CitaGestionUI[] = [
  {
    id: 'cita-sol-1',
    pacienteNombre: 'María Camila Pérez',
    pacienteDocumento: '1020304050',
    pacienteTelefono: '+57 310 987 6543',
    doctorNombre: 'Dr. Carlos Ruiz',
    tratamiento: 'Profilaxis y Limpieza Profunda',
    fecha: '2026-10-20',
    horaInicio: '09:30 AM',
    horaFin: '10:15 AM',
    estado: 'confirmada',
    esReagendamiento: false,
  },
  {
    id: 'cita-sol-2',
    pacienteNombre: 'Andrés Felipe Gómez',
    pacienteDocumento: '79845123',
    pacienteTelefono: '+57 320 123 4567',
    doctorNombre: 'Dra. Laura Vega',
    tratamiento: 'Control de Ortodoncia',
    fecha: '2026-10-21',
    horaInicio: '02:00 PM',
    horaFin: '02:30 PM',
    estado: 'solicitada',
    esReagendamiento: false,
    motivoSolicitud: 'Nueva cita: Dolor leve en bracket inferior izquierdo.',
  },
  {
    id: 'cita-conf-1',
    pacienteNombre: 'Lucía Torres Mendoza',
    pacienteDocumento: '52431980',
    pacienteTelefono: '+57 301 555 7890',
    doctorNombre: 'Dr. Carlos Ruiz',
    tratamiento: 'Resina Fotocurada (1 superficie)',
    fecha: '2026-10-14',
    horaInicio: '10:00 AM',
    horaFin: '10:45 AM',
    estado: 'confirmada',
  },
  {
    id: 'cita-conf-2',
    pacienteNombre: 'Jorge Ramírez Díaz',
    pacienteDocumento: '80123456',
    pacienteTelefono: '+57 315 444 1122',
    doctorNombre: 'Dra. Laura Vega',
    tratamiento: 'Valoración Odontológica Inicial',
    fecha: '2026-10-14',
    horaInicio: '11:30 AM',
    horaFin: '12:00 PM',
    estado: 'confirmada',
  },
  {
    id: 'cita-conf-20-oct',
    pacienteNombre: 'David Alejandro Castro',
    pacienteDocumento: '75892341',
    pacienteTelefono: '+57 317 345 6789',
    doctorNombre: 'Dr. Carlos Ruiz',
    tratamiento: 'Blanqueamiento Dental LED',
    fecha: '2026-10-20',
    horaInicio: '03:00 PM',
    horaFin: '04:00 PM',
    estado: 'pendiente',
  },
  {
    id: 'cita-jairo-20-oct',
    pacienteNombre: 'Jairo Escobar Cárcamo',
    pacienteDocumento: '12345678',
    pacienteTelefono: '+57 323 453 9574',
    doctorNombre: 'Dra. Yasmín Blanco',
    tratamiento: 'Diseño de Sonrisa & Carillas',
    fecha: '2026-10-20',
    horaInicio: '11:00 AM',
    horaFin: '11:45 AM',
    estado: 'pendiente',
    esReagendamiento: false,
  },
];

const ODONTOLOGOS = ['Dr. Carlos Ruiz', 'Dra. Laura Vega'];
const TRATAMIENTOS = [
  'Valoración Odontológica Inicial',
  'Profilaxis y Limpieza Profunda',
  'Resina Fotocurada (1 superficie)',
  'Blanqueamiento Dental LED',
  'Control de Ortodoncia',
  'Endodoncia Unirradicular',
];

export default function GestionCitasPage() {
  const [citas, setCitas] = useState<CitaGestionUI[]>(CITAS_INICIALES);
  const [pestaña, setPestaña] = useState<'pendientes' | 'agenda' | 'todas'>('pendientes');
  const [modoAprobacion, setModoAprobacion] = useState<ModoAprobacion>('manual');
  const [filtroDoctor, setFiltroDoctor] = useState<string>('todos');
  const [mensajeAlerta, setMensajeAlerta] = useState<string | null>(null);

  // Carga inicial y sincronización con Supabase (Cargar citas en tiempo real como la de Pedro Pérez)
  React.useEffect(() => {
    let montado = true;
    async function sincronizarCitasDB() {
      try {
        // 1. Intentar obtener todas las citas reales desde Supabase RPC
        const { data: rpcCitas, error: rpcError } = await supabase.rpc('obtener_citas_gestion');
        if (!rpcError && Array.isArray(rpcCitas) && rpcCitas.length > 0 && montado) {
          const citasDB: CitaGestionUI[] = rpcCitas.map((c: any) => ({
            id: c.id,
            pacienteNombre: c.paciente_nombre,
            pacienteDocumento: c.paciente_documento,
            pacienteTelefono: c.paciente_telefono,
            doctorNombre: c.doctor_nombre,
            tratamiento: c.tratamiento_nombre,
            fecha: c.fecha,
            horaInicio: c.hora_inicio,
            horaFin: c.hora_fin,
            estado: c.estado,
            esReagendamiento: c.es_reagendamiento,
            motivoSolicitud: c.motivo,
            motivoRechazoCancelacion: c.motivo_rechazo_cancelacion,
          }));

          setCitas(prev => {
            const idsDB = new Set(citasDB.map(d => d.id));
            const prevNoDuplicadas = prev.filter(p => !idsDB.has(p.id));
            return [...citasDB, ...prevNoDuplicadas];
          });
          return;
        }

        // 2. Si el RPC aún no está creado, fallback a obtenerCitasHoy
        const respuesta = await obtenerCitasHoy();
        if (respuesta.exito && respuesta.datos && respuesta.datos.length > 0 && montado) {
          const citasDB: CitaGestionUI[] = respuesta.datos.map(c => ({
            id: c.id,
            pacienteNombre: c.pacienteNombre,
            pacienteDocumento: c.pacienteDocumento,
            pacienteTelefono: c.pacienteTelefono,
            doctorNombre: c.doctorNombre,
            tratamiento: c.tratamientoNombre,
            fecha: c.fecha,
            horaInicio: c.horaInicio,
            horaFin: c.horaFin,
            estado: c.estado,
            esReagendamiento: c.esReagendamiento,
            motivoSolicitud: c.motivo,
            motivoRechazoCancelacion: c.motivoRechazoCancelacion,
          }));

          setCitas(prev => {
            const idsDB = new Set(citasDB.map(d => d.id));
            const prevNoDuplicadas = prev.filter(p => !idsDB.has(p.id));
            return [...citasDB, ...prevNoDuplicadas];
          });
        }

        // 3. Sincronizar pacientes registrados de Supabase
        const { data: dbPacientes } = await supabase.from('pacientes').select('*');
        if (dbPacientes && Array.isArray(dbPacientes) && dbPacientes.length > 0 && montado) {
          const pacientesMapeados: Paciente[] = dbPacientes.map((p: any) => ({
            id: p.id,
            tipoDocumento: p.tipo_documento || 'CC',
            numeroDocumento: p.numero_documento || '',
            nombres: p.nombres || '',
            apellidos: p.apellidos || '',
            eps: (p.eps as TipoEps) || 'Particular',
            email: p.email || '',
            telefono: p.telefono || '',
            fechaNacimiento: p.fecha_nacimiento || '',
            genero: p.genero || 'Otro',
            ciudad: p.ciudad || 'Bogotá',
            direccion: p.direccion || '',
            alergias: Array.isArray(p.alergias) ? p.alergias : [],
            enfermedadesPrevias: Array.isArray(p.enfermedades_previas) ? p.enfermedades_previas : [],
            medicamentosActuales: Array.isArray(p.medicamentos_actuales) ? p.medicamentos_actuales : [],
            grupoSanguineo: p.grupo_sanguineo || 'O+',
            creadoEn: p.creado_en || new Date().toISOString(),
          }));

          setListaPacientes(prev => {
            const docsExistentes = new Set(prev.map(item => item.numeroDocumento.trim()));
            const nuevos = pacientesMapeados.filter(item => item.numeroDocumento && !docsExistentes.has(item.numeroDocumento.trim()));
            return [...prev, ...nuevos];
          });
        }
      } catch (err) {
        console.warn('Sincronización con Supabase diferida:', err);
      }
    }
    sincronizarCitasDB();
    return () => {
      montado = false;
    };
  }, []);

  // Estados de Modales
  const [modalNuevaCitaAbierto, setModalNuevaCitaAbierto] = useState(false);
  const [citaParaReagendar, setCitaParaReagendar] = useState<CitaGestionUI | null>(null);
  const [citaParaCancelar, setCitaParaCancelar] = useState<CitaGestionUI | null>(null);
  const [citaParaRechazar, setCitaParaRechazar] = useState<CitaGestionUI | null>(null);
  const [guardandoNuevaCita, setGuardandoNuevaCita] = useState(false);
  const [errorModalCita, setErrorModalCita] = useState<string | null>(null);

  // Estados para Selección de Paciente (Registrado vs Nuevo)
  const [listaPacientes, setListaPacientes] = useState<Paciente[]>(PACIENTES_REGISTRADOS_BASE);
  const [modoPacienteCita, setModoPacienteCita] = useState<'registrado' | 'nuevo'>('registrado');
  const [busquedaPaciente, setBusquedaPaciente] = useState<string>('');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);
  const [mostrarSugerencias, setMostrarSugerencias] = useState<boolean>(false);
  const [epsNuevoPaciente, setEpsNuevoPaciente] = useState<TipoEps>('Particular');

  // Estados para la Vista Calendario de la Agenda Confirmada
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('2026-10-20');
  const [mesVisualizado, setMesVisualizado] = useState<Date>(new Date(2026, 9, 1)); // Octubre 2026 (mes 9 en JS = Octubre)
  const [vistaAgenda, setVistaAgenda] = useState<'calendario' | 'tabla'>('calendario');

  // Modal para envío de WhatsApp de reagendamiento / cancelación
  const [modalWhatsApp, setModalWhatsApp] = useState<{
    pacienteNombre: string;
    telefono: string;
    urlWaMe: string;
    urlWhatsAppWeb: string;
    mensaje: string;
    tipoAccion: 'reagendamiento' | 'cancelacion' | 'recordatorio';
  } | null>(null);
  const [copiadoExito, setCopiadoExito] = useState(false);

  // Formulario Nueva Cita Directa
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: '',
    documento: '',
    telefono: '',
    doctor: ODONTOLOGOS[0],
    tratamiento: TRATAMIENTOS[0],
    fecha: '2026-10-20',
    hora: '09:00 AM',
    notas: '',
  });

  // Formulario Reagendar
  const [formReagendar, setFormReagendar] = useState({
    fecha: '',
    hora: '10:00 AM',
  });

  // Motivo de rechazo o cancelación
  const [motivoTexto, setMotivoTexto] = useState('');

  // Contador de pendientes
  const totalPendientes = citas.filter(c => c.estado === 'solicitada').length;

  // Filtrado de citas según pestaña y doctor
  const citasFiltradas = citas.filter(c => {
    const coincideDoctor = filtroDoctor === 'todos' || c.doctorNombre === filtroDoctor;
    if (!coincideDoctor) return false;

    if (pestaña === 'pendientes') return c.estado === 'solicitada';
    if (pestaña === 'agenda') return ['confirmada', 'pendiente', 'solicitada', 'en_atencion'].includes(c.estado);
    return true; // 'todas'
  });

  // Cálculos y cuadrícula del calendario
  const anio = mesVisualizado.getFullYear();
  const mes = mesVisualizado.getMonth();
  const nombreMes = mesVisualizado.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

  const handleMesAnterior = () => {
    setMesVisualizado(new Date(anio, mes - 1, 1));
  };

  const handleMesSiguiente = () => {
    setMesVisualizado(new Date(anio, mes + 1, 1));
  };

  const handleIrAHoy = () => {
    const hoy = new Date();
    setMesVisualizado(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
    const a = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, '0');
    const d = String(hoy.getDate()).padStart(2, '0');
    setFechaSeleccionada(`${a}-${m}-${d}`);
  };

  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const diaSemanaInicio = (new Date(anio, mes, 1).getDay() + 6) % 7;
  const diasMesAnterior = new Date(anio, mes, 0).getDate();

  const celdasDias: Array<{
    dia: number;
    fechaStr: string;
    esMesActual: boolean;
    citas: CitaGestionUI[];
  }> = [];

  for (let i = diaSemanaInicio - 1; i >= 0; i--) {
    const diaPrevio = diasMesAnterior - i;
    const mesPrev = mes === 0 ? 11 : mes - 1;
    const anioPrev = mes === 0 ? anio - 1 : anio;
    const fechaStr = `${anioPrev}-${String(mesPrev + 1).padStart(2, '0')}-${String(diaPrevio).padStart(2, '0')}`;
    celdasDias.push({
      dia: diaPrevio,
      fechaStr,
      esMesActual: false,
      citas: citas.filter(c => c.fecha === fechaStr && ['confirmada', 'pendiente', 'solicitada', 'en_atencion'].includes(c.estado)),
    });
  }

  for (let d = 1; d <= diasEnMes; d++) {
    const fechaStr = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    celdasDias.push({
      dia: d,
      fechaStr,
      esMesActual: true,
      citas: citas.filter(c => c.fecha === fechaStr && ['confirmada', 'pendiente', 'solicitada', 'en_atencion'].includes(c.estado)),
    });
  }

  const totalCeldas = Math.ceil(celdasDias.length / 7) * 7;
  const diasFaltantes = totalCeldas - celdasDias.length;
  for (let d = 1; d <= diasFaltantes; d++) {
    const mesNext = mes === 11 ? 0 : mes + 1;
    const anioNext = mes === 11 ? anio + 1 : anio;
    const fechaStr = `${anioNext}-${String(mesNext + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    celdasDias.push({
      dia: d,
      fechaStr,
      esMesActual: false,
      citas: citas.filter(c => c.fecha === fechaStr && ['confirmada', 'pendiente', 'solicitada', 'en_atencion'].includes(c.estado)),
    });
  }

  // Citas del día seleccionado en el calendario
  const citasDelDiaSeleccionado = citas.filter(c => {
    const coincideFecha = c.fecha === fechaSeleccionada;
    const coincideEstado = ['confirmada', 'pendiente', 'solicitada', 'en_atencion'].includes(c.estado);
    const coincideDoctor = filtroDoctor === 'todos' || c.doctorNombre === filtroDoctor;
    return coincideFecha && coincideEstado && coincideDoctor;
  });

  // CONFIRMAR CITA DESDE RECEPCIÓN (Cambia el estado de 'pendiente' a 'confirmada')
  const handleConfirmarCitaRecepcion = async (id: string) => {
    setCitas(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, estado: 'confirmada', esReagendamiento: false };
      }
      return c;
    }));
    setMensajeAlerta('¡Cita confirmada con éxito en la agenda del consultorio!');
    setTimeout(() => setMensajeAlerta(null), 5000);

    try {
      await confirmarCitaRecepcionAction(id);
    } catch (err) {
      console.warn('Confirmación en Supabase procesada:', err);
    }
  };

  // 1. APROBAR SOLICITUD
  const handleAprobarSolicitud = async (id: string) => {
    setCitas(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, estado: 'confirmada', esReagendamiento: false };
      }
      return c;
    }));
    setMensajeAlerta('¡Solicitud de cita aprobada y confirmada en la agenda!');
    setTimeout(() => setMensajeAlerta(null), 5000);

    try {
      await aprobarCita(id);
    } catch (err) {
      console.warn('Actualización en Supabase procesada:', err);
    }
  };

  // 2. RECHAZAR SOLICITUD
  const handleConfirmarRechazo = async () => {
    if (!citaParaRechazar) return;
    const idCita = citaParaRechazar.id;
    const motivoFinal = motivoTexto || 'Horario no disponible en consultorio';

    setCitas(prev => prev.map(c => {
      if (c.id === idCita) {
        return { 
          ...c, 
          estado: 'rechazada', 
          motivoRechazoCancelacion: motivoFinal
        };
      }
      return c;
    }));
    setMensajeAlerta('La solicitud ha sido rechazada y retirada de la agenda activa.');
    setCitaParaRechazar(null);
    setMotivoTexto('');
    setTimeout(() => setMensajeAlerta(null), 5000);

    try {
      await rechazarCita(idCita, motivoFinal);
    } catch (err) {
      console.warn('Rechazo en Supabase procesado:', err);
    }
  };

  // 3. CANCELAR CITA EXISTENTE CON NOTIFICACIÓN AL PACIENTE
  const handleConfirmarCancelacion = async () => {
    if (!citaParaCancelar) return;
    const citaActual = citaParaCancelar;
    const idCita = citaActual.id;
    const motivoFinal = motivoTexto || 'Cancelada por recepción';

    setCitas(prev => prev.map(c => {
      if (c.id === idCita) {
        return { 
          ...c, 
          estado: 'cancelada', 
          motivoRechazoCancelacion: motivoFinal 
        };
      }
      return c;
    }));

    try {
      await cancelarCitaAction(idCita, motivoFinal);
    } catch (err) {
      console.warn('Cancelación en Supabase procesada:', err);
    }

    // Generar mensaje oficial de WhatsApp de cancelación
    const datosConsultorio = obtenerDatosConsultorio();
    const mensajeWA = generarMensajeCancelacion({
      pacienteNombre: citaActual.pacienteNombre,
      tratamiento: citaActual.tratamiento,
      fecha: citaActual.fecha,
      motivo: motivoFinal,
      clinicaNombre: datosConsultorio.nombreConsultorio,
      clinicaTelefono: datosConsultorio.telefonoPrincipal,
    });

    const telNormalizado = normalizarTelefonoWhatsApp(citaActual.pacienteTelefono);
    const urlWaMe = generarEnlaceWhatsApp(telNormalizado, mensajeWA);
    const textoCodificado = encodeURIComponent(mensajeWA);
    const urlWhatsAppWeb = `https://web.whatsapp.com/send?phone=${telNormalizado}&text=${textoCodificado}`;

    setCitaParaCancelar(null);
    setMotivoTexto('');
    setMensajeAlerta('Cita cancelada con éxito. Se ha preparado el mensaje de WhatsApp para notificar al paciente.');
    setTimeout(() => setMensajeAlerta(null), 6000);

    // Abrir modal de despacho para que recepción envíe la notificación
    setModalWhatsApp({
      pacienteNombre: citaActual.pacienteNombre,
      telefono: citaActual.pacienteTelefono,
      urlWaMe,
      urlWhatsAppWeb,
      mensaje: mensajeWA,
      tipoAccion: 'cancelacion',
    });
  };

  // 4. REAGENDAR CITA CON NOTIFICACIÓN AL PACIENTE
  const handleConfirmarReagendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citaParaReagendar || !formReagendar.fecha) return;
    const citaActual = citaParaReagendar;
    const nuevaFecha = formReagendar.fecha;
    const nuevaHora = formReagendar.hora;

    setCitas(prev => prev.map(c => {
      if (c.id === citaActual.id) {
        return {
          ...c,
          fecha: nuevaFecha,
          horaInicio: nuevaHora,
          horaFin: `${nuevaHora} (Estimado)`,
          estado: 'confirmada',
        };
      }
      return c;
    }));

    try {
      await reagendarCitaRecepcionAction(citaActual.id, nuevaFecha, nuevaHora);
    } catch (err) {
      console.warn('Reagendamiento en base de datos:', err);
    }

    // Generar mensaje oficial de WhatsApp de reprogramación
    const datosConsultorio = obtenerDatosConsultorio();
    const mensajeWA = generarMensajeReagendamiento({
      pacienteNombre: citaActual.pacienteNombre,
      tratamiento: citaActual.tratamiento,
      doctorNombre: citaActual.doctorNombre,
      nuevaFecha,
      nuevaHora,
      clinicaNombre: datosConsultorio.nombreConsultorio,
      clinicaTelefono: datosConsultorio.telefonoPrincipal,
      citaId: citaActual.id,
    });

    const telNormalizado = normalizarTelefonoWhatsApp(citaActual.pacienteTelefono);
    const urlWaMe = generarEnlaceWhatsApp(telNormalizado, mensajeWA);
    const textoCodificado = encodeURIComponent(mensajeWA);
    const urlWhatsAppWeb = `https://web.whatsapp.com/send?phone=${telNormalizado}&text=${textoCodificado}`;

    setFechaSeleccionada(nuevaFecha);
    setCitaParaReagendar(null);
    setMensajeAlerta(`¡Cita reagendada para el ${formatearFechaEspanol(nuevaFecha)} a las ${nuevaHora}! Mensaje preparado para el paciente.`);
    setTimeout(() => setMensajeAlerta(null), 6000);

    // Abrir modal de despacho
    setModalWhatsApp({
      pacienteNombre: citaActual.pacienteNombre,
      telefono: citaActual.pacienteTelefono,
      urlWaMe,
      urlWhatsAppWeb,
      mensaje: mensajeWA,
      tipoAccion: 'reagendamiento',
    });
  };

  // Pacientes sugeridos en autocompletado para agendamiento directo
  const sugerenciasPacientes = React.useMemo(() => {
    const q = busquedaPaciente.trim().toLowerCase();
    if (!q) return listaPacientes.slice(0, 8);
    return listaPacientes.filter(p => {
      const nombreCompleto = `${p.nombres} ${p.apellidos}`.toLowerCase();
      const doc = (p.numeroDocumento || '').toLowerCase();
      const tel = (p.telefono || '').replace(/\s+/g, '');
      const qSinEspacios = q.replace(/\s+/g, '');
      return (
        nombreCompleto.includes(q) ||
        doc.includes(q) ||
        tel.includes(qSinEspacios)
      );
    }).slice(0, 8);
  }, [listaPacientes, busquedaPaciente]);

  // Manejar selección de un paciente de la lista o autocompletado
  const handleSeleccionarPaciente = (p: Paciente) => {
    setPacienteSeleccionado(p);
    const nombreCompleto = `${p.nombres} ${p.apellidos}`.trim();
    setNuevoPaciente(prev => ({
      ...prev,
      nombre: nombreCompleto,
      documento: p.numeroDocumento,
      telefono: p.telefono,
      notas: p.eps ? `EPS: ${p.eps}` : prev.notas,
    }));
    setBusquedaPaciente(nombreCompleto);
    setMostrarSugerencias(false);
    setErrorModalCita(null);
  };

  // Limpiar selección de paciente
  const handleLimpiarPaciente = () => {
    setPacienteSeleccionado(null);
    setBusquedaPaciente('');
    setNuevoPaciente(prev => ({
      ...prev,
      nombre: '',
      documento: '',
      telefono: '',
      notas: '',
    }));
  };

  // 5. CREAR NUEVA CITA DIRECTA CON GUARDADO EN SUPABASE
  const handleCrearCitaDirecta = async (e: React.FormEvent) => {
    e.preventDefault();

    if (modoPacienteCita === 'registrado' && !nuevoPaciente.nombre) {
      setErrorModalCita('Por favor selecciona un paciente registrado o búscalo en la lista.');
      return;
    }

    if (!nuevoPaciente.nombre || !nuevoPaciente.fecha || !nuevoPaciente.telefono) {
      setErrorModalCita('Por favor completa los campos obligatorios: nombre, teléfono y fecha.');
      return;
    }

    setGuardandoNuevaCita(true);
    setErrorModalCita(null);

    const notasConEps = modoPacienteCita === 'nuevo' && epsNuevoPaciente
      ? `EPS: ${epsNuevoPaciente}${nuevoPaciente.notas ? ` • ${nuevoPaciente.notas}` : ''}`
      : nuevoPaciente.notas;

    const res = await agendarCitaRecepcionAction({
      nombre: nuevoPaciente.nombre,
      documento: nuevoPaciente.documento,
      telefono: nuevoPaciente.telefono,
      doctor: nuevoPaciente.doctor,
      tratamiento: nuevoPaciente.tratamiento,
      fecha: nuevoPaciente.fecha,
      hora: nuevoPaciente.hora,
      notas: notasConEps,
    });

    setGuardandoNuevaCita(false);

    if (!res.exito || !res.datos) {
      setErrorModalCita(res.mensaje || 'Error al guardar la cita en la base de datos.');
      return;
    }

    const nuevaCita: CitaGestionUI = {
      id: res.datos.id,
      pacienteNombre: res.datos.pacienteNombre,
      pacienteDocumento: res.datos.pacienteDocumento,
      pacienteTelefono: res.datos.pacienteTelefono,
      doctorNombre: res.datos.doctorNombre,
      tratamiento: res.datos.tratamiento,
      fecha: res.datos.fecha,
      horaInicio: res.datos.horaInicio,
      horaFin: res.datos.horaFin,
      estado: res.datos.estado,
    };

    // Si fue un paciente nuevo, agregarlo a la lista de pacientes registrados en memoria
    if (modoPacienteCita === 'nuevo') {
      const partes = nuevoPaciente.nombre.trim().split(/\s+/);
      const nuevoReg: Paciente = {
        id: `pac-${Date.now()}`,
        tipoDocumento: 'CC',
        numeroDocumento: nuevoPaciente.documento || `DOC-${Date.now().toString().slice(-6)}`,
        nombres: partes[0] || 'Paciente',
        apellidos: partes.slice(1).join(' ') || 'Registrado',
        eps: epsNuevoPaciente,
        email: '',
        telefono: nuevoPaciente.telefono,
        fechaNacimiento: '1990-01-01',
        genero: 'Otro',
        ciudad: 'Bogotá',
        direccion: '',
        alergias: [],
        enfermedadesPrevias: [],
        medicamentosActuales: [],
        grupoSanguineo: 'O+',
        creadoEn: new Date().toISOString().split('T')[0],
      };
      setListaPacientes(prev => [nuevoReg, ...prev]);
    }

    setCitas(prev => [nuevaCita, ...prev]);
    setMensajeAlerta(`¡Cita agendada con éxito para ${res.datos.pacienteNombre}! Guardada en la base de datos.`);
    setModalNuevaCitaAbierto(false);
    handleLimpiarPaciente();
    setNuevoPaciente({
      nombre: '',
      documento: '',
      telefono: '',
      doctor: ODONTOLOGOS[0],
      tratamiento: TRATAMIENTOS[0],
      fecha: '',
      hora: '09:00 AM',
      notas: '',
    });
    setTimeout(() => setMensajeAlerta(null), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Barra Superior */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link 
              href="/dashboard" 
              className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition"
              title="Volver al panel"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Gestión de Citas y Aprobaciones
              </h1>
              <p className="text-xs text-slate-500">Módulo para Recepción y Odontólogos</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Selector de Modo de Aprobación */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl text-xs">
              <span className="text-slate-600 font-medium pl-1">Aprobación:</span>
              <button
                onClick={() => setModoAprobacion('manual')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  modoAprobacion === 'manual'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => setModoAprobacion('automatico')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  modoAprobacion === 'automatico'
                    ? 'bg-dentist-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Automática
              </button>
            </div>

            <button
              onClick={() => setModalNuevaCitaAbierto(true)}
              className="inline-flex items-center gap-1.5 bg-dentist-600 hover:bg-dentist-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Agendar Cita</span>
            </button>
          </div>
        </div>
      </header>

      {/* Alerta de Éxito */}
      {mensajeAlerta && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-medium shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{mensajeAlerta}</span>
            </div>
            <button onClick={() => setMensajeAlerta(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Barra de Filtros y Pestañas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPestaña('pendientes')}
              className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
                pestaña === 'pendientes'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Solicitudes por Aprobar</span>
              {totalPendientes > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  pestaña === 'pendientes' ? 'bg-white text-amber-600' : 'bg-amber-100 text-amber-800'
                }`}>
                  {totalPendientes}
                </span>
              )}
            </button>

            <button
              onClick={() => setPestaña('agenda')}
              className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition ${
                pestaña === 'agenda'
                  ? 'bg-dentist-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Agenda Confirmada
            </button>

            <button
              onClick={() => setPestaña('todas')}
              className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition ${
                pestaña === 'todas'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Historial General
            </button>
          </div>

          {/* Filtro por Doctor */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filtroDoctor}
              onChange={(e) => setFiltroDoctor(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-dentist-500"
            >
              <option value="todos">Todos los Odontólogos</option>
              {ODONTOLOGOS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* TAB 1: BANDEJA DE SOLICITUDES PENDIENTES */}
        {pestaña === 'pendientes' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Bandeja de Entrada de Solicitudes</h2>
                <p className="text-xs text-slate-500">
                  Citas y reagendamientos pedidos por pacientes en espera de confirmación.
                </p>
              </div>
              <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                Modo actual: <strong>{modoAprobacion === 'manual' ? 'Revisión Manual' : 'Aprobación Automática Activa'}</strong>
              </span>
            </div>

            {citasFiltradas.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
                <h3 className="font-bold text-slate-800 text-base">¡Bandeja al día!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No hay solicitudes de citas ni reagendamientos pendientes por revisar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {citasFiltradas.map((sol) => (
                  <div 
                    key={sol.id} 
                    className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 mb-1">
                            {sol.esReagendamiento ? 'Solicitud de Reagendamiento' : 'Nueva Solicitud de Cita'}
                          </span>
                          <h3 className="font-bold text-slate-900 text-base">{sol.pacienteNombre}</h3>
                          <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>Doc: {sol.pacienteDocumento}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-700 font-medium">
                              <Phone className="w-3 h-3 text-dentist-600" /> {sol.pacienteTelefono}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Detalles del tratamiento solicitado */}
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs space-y-1.5 mb-4">
                        <p className="text-slate-800 font-medium">
                          <strong>Tratamiento:</strong> {sol.tratamiento}
                        </p>
                        <p className="text-slate-800">
                          <strong>Odontólogo:</strong> {sol.doctorNombre}
                        </p>
                        <div className="flex items-center gap-4 pt-1 border-t border-slate-200 text-slate-700">
                          <span className="flex items-center gap-1 font-semibold text-dentist-700">
                            <CalendarIcon className="w-3.5 h-3.5" /> {sol.fecha}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-dentist-700">
                            <Clock className="w-3.5 h-3.5" /> {sol.horaInicio}
                          </span>
                        </div>
                        {sol.motivoSolicitud && (
                          <p className="text-[11px] text-slate-500 italic pt-1">
                            &quot;{sol.motivoSolicitud}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Acciones de la Recepcionista */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setCitaParaReagendar(sol);
                          setFormReagendar({ fecha: sol.fecha, hora: sol.horaInicio });
                        }}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition"
                      >
                        Cambiar Horario
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setCitaParaRechazar(sol);
                            setMotivoTexto('');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Rechazar</span>
                        </button>
                        <button
                          onClick={() => handleAprobarSolicitud(sol.id)}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aprobar Cita</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: AGENDA CONFIRMADA CON VISTA TIPO CALENDARIO Y TABLA */}
        {/* ============================================================== */}
        {pestaña === 'agenda' && (
          <div className="space-y-4">
            {/* Barra de Herramientas de la Agenda */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-dentist-600" />
                  <span>Agenda y Calendario de Citas</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualiza las citas médicas por día. El estado se confirma automáticamente cuando el paciente confirma por WhatsApp o manualmente por recepción.
                </p>
              </div>

              {/* Conmutador de Modo de Vista */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
                <button
                  type="button"
                  onClick={() => setVistaAgenda('calendario')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                    vistaAgenda === 'calendario'
                      ? 'bg-white text-dentist-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5 text-dentist-600" />
                  <span>Vista Calendario</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVistaAgenda('tabla')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                    vistaAgenda === 'tabla'
                      ? 'bg-white text-dentist-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CalendarRange className="w-3.5 h-3.5 text-slate-600" />
                  <span>Vista Lista / Tabla</span>
                </button>
              </div>
            </div>

            {/* VISTA 1: CALENDARIO INTERACTIVO POR DÍA */}
            {vistaAgenda === 'calendario' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* Cuadrícula del Calendario Mensual (Columna Izquierda 7 cols) */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  {/* Encabezado del Mes con Controles */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-dentist-50 text-dentist-700">
                        <CalendarIcon className="w-4 h-4" />
                      </span>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 capitalize">
                          {nombreMes}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Haz clic en cualquier día para ver sus citas programadas
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleIrAHoy}
                        className="px-2.5 py-1 text-xs font-bold text-dentist-700 bg-dentist-50 hover:bg-dentist-100 rounded-lg transition border border-dentist-200"
                        title="Ir a la fecha actual"
                      >
                        Hoy
                      </button>
                      <button
                        type="button"
                        onClick={handleMesAnterior}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                        title="Mes anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleMesSiguiente}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                        title="Mes siguiente"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Nombres de los Días de la Semana */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>Lun</span>
                    <span>Mar</span>
                    <span>Mié</span>
                    <span>Jue</span>
                    <span>Vie</span>
                    <span className="text-amber-600">Sáb</span>
                    <span className="text-rose-500">Dom</span>
                  </div>

                  {/* Celdas de los Días del Calendario */}
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {celdasDias.map((celda, idx) => {
                      const esSeleccionado = celda.fechaStr === fechaSeleccionada;
                      const tieneCitas = celda.citas.length > 0;
                      const hoyStr = new Date().toISOString().split('T')[0];
                      const esHoy = celda.fechaStr === hoyStr;

                      return (
                        <button
                          key={`${celda.fechaStr}-${idx}`}
                          type="button"
                          onClick={() => setFechaSeleccionada(celda.fechaStr)}
                          className={`min-h-[64px] sm:min-h-[74px] p-1.5 rounded-xl text-left flex flex-col justify-between transition-all relative border ${
                            esSeleccionado
                              ? 'bg-dentist-600 text-white font-bold border-dentist-700 shadow-md ring-2 ring-dentist-300 scale-[1.02] z-10'
                              : esHoy
                              ? 'bg-amber-50/70 border-amber-300 text-slate-900 hover:bg-amber-100/50'
                              : celda.esMesActual
                              ? 'bg-slate-50/60 border-slate-200 text-slate-800 hover:bg-slate-100/80 hover:border-slate-300'
                              : 'bg-slate-50/20 border-slate-100 text-slate-400 opacity-60 hover:opacity-100'
                          }`}
                        >
                          {/* Número del día e indicador 'Hoy' */}
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-xs sm:text-sm font-bold ${
                              esSeleccionado ? 'text-white' : 'text-slate-800'
                            }`}>
                              {celda.dia}
                            </span>
                            {esHoy && (
                              <span className={`text-[9px] font-extrabold uppercase px-1 rounded ${
                                esSeleccionado ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-900'
                              }`}>
                                Hoy
                              </span>
                            )}
                          </div>

                          {/* Indicador de citas del día */}
                          {tieneCitas ? (
                            <div className="w-full mt-1">
                              <span className={`inline-flex items-center gap-1 w-full truncate text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                                esSeleccionado
                                  ? 'bg-white/20 text-white'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  esSeleccionado ? 'bg-white' : 'bg-emerald-600'
                                }`} />
                                <span className="truncate">{celda.citas.length} {celda.citas.length === 1 ? 'cita' : 'citas'}</span>
                              </span>
                            </div>
                          ) : (
                            <span className="block h-4" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Leyenda de Ayuda */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span>Día con citas confirmadas</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-dentist-600" />
                        <span>Día seleccionado</span>
                      </span>
                    </div>
                    <span>Día activo: <strong>{fechaSeleccionada}</strong></span>
                  </div>
                </div>

                {/* Panel de Citas del Día Seleccionado (Columna Derecha 5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  
                  {/* Encabezado del Día */}
                  <div className="border-b border-slate-100 pb-3 flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-dentist-100 text-dentist-800">
                          Día Seleccionado
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          {citasDelDiaSeleccionado.length} {citasDelDiaSeleccionado.length === 1 ? 'Cita' : 'Citas'}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-1 capitalize">
                        {formatearFechaEspanol(fechaSeleccionada) || fechaSeleccionada}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setNuevoPaciente(prev => ({ ...prev, fecha: fechaSeleccionada }));
                        setModalNuevaCitaAbierto(true);
                      }}
                      className="px-2.5 py-1.5 text-xs font-bold text-dentist-700 bg-dentist-50 hover:bg-dentist-100 rounded-xl transition border border-dentist-200 flex items-center gap-1"
                      title="Agendar cita para este día"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Agendar</span>
                    </button>
                  </div>

                  {/* Listado de Citas del Día Seleccionado */}
                  {citasDelDiaSeleccionado.length === 0 ? (
                    <div className="py-12 px-4 text-center rounded-2xl bg-slate-50/70 border border-slate-200/80">
                      <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <h4 className="font-bold text-sm text-slate-700">Sin citas para este día</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                        No hay citas confirmadas para el {formatearFechaEspanol(fechaSeleccionada)}. Puedes agendar una cita directamente.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setNuevoPaciente(prev => ({ ...prev, fecha: fechaSeleccionada }));
                          setModalNuevaCitaAbierto(true);
                        }}
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-dentist-600 hover:bg-dentist-700 text-white rounded-xl shadow-xs transition"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Agendar Cita en este Día</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                      {citasDelDiaSeleccionado.map((cita) => (
                        <div
                          key={cita.id}
                          className="bg-slate-50/80 hover:bg-slate-100/80 rounded-2xl p-4 border border-slate-200 transition space-y-3"
                        >
                          {/* Hora y Estado Dinámico */}
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-black text-dentist-800 bg-dentist-100/70 border border-dentist-200 px-2.5 py-1 rounded-lg">
                              <Clock className="w-3.5 h-3.5 text-dentist-600" />
                              <span>{cita.horaInicio}</span>
                              {cita.horaFin && <span className="font-medium text-dentist-600">- {cita.horaFin}</span>}
                            </span>

                            {cita.estado === 'confirmada' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Confirmada
                              </span>
                            )}
                            {['pendiente', 'solicitada'].includes(cita.estado) && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Pendiente de Confirmación
                              </span>
                            )}
                            {cita.estado === 'cancelada' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                Cancelada
                              </span>
                            )}
                            {cita.estado === 'completada' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                <Check className="w-3 h-3 text-blue-600" />
                                Atendida
                              </span>
                            )}
                          </div>

                          {/* Datos del Paciente */}
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 leading-tight">
                              {cita.pacienteNombre}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                              <span>Doc: {cita.pacienteDocumento}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                                <Phone className="w-3 h-3 text-dentist-600" />
                                {cita.pacienteTelefono}
                              </span>
                            </div>
                          </div>

                          {/* Tratamiento y Doctor */}
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs space-y-0.5">
                            <p className="font-semibold text-slate-900 truncate">{cita.tratamiento}</p>
                            <p className="text-[11px] text-dentist-700 font-medium">{cita.doctorNombre}</p>
                          </div>

                          {/* Botones de Acción de Recepción con Notificación */}
                          <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-1.5 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Botón para que recepción confirme citas en estado pendiente */}
                              {['pendiente', 'solicitada'].includes(cita.estado) && (
                                <button
                                  type="button"
                                  onClick={() => handleConfirmarCitaRecepcion(cita.id)}
                                  className="px-2.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs rounded-lg transition active:scale-95 flex items-center gap-1"
                                  title="Cambiar estado de pendiente a confirmada"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Confirmar Cita</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setCitaParaReagendar(cita);
                                  setFormReagendar({ fecha: cita.fecha, hora: cita.horaInicio });
                                }}
                                className="px-2.5 py-1.5 text-xs font-bold text-dentist-700 bg-dentist-50 hover:bg-dentist-100 border border-dentist-200 rounded-lg transition active:scale-95"
                                title="Reagendar esta cita y avisar al paciente"
                              >
                                Reagendar
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setCitaParaCancelar(cita);
                                  setMotivoTexto('');
                                }}
                                className="px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition active:scale-95"
                                title="Cancelar esta cita y avisar al paciente"
                              >
                                Cancelar
                              </button>

                              {cita.estado === 'confirmada' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCitas(prev => prev.map(item => item.id === cita.id ? { ...item, estado: 'completada' } : item));
                                    setMensajeAlerta(`Cita de ${cita.pacienteNombre} marcada como atendida.`);
                                    setTimeout(() => setMensajeAlerta(null), 4000);
                                  }}
                                  className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                                  title="Finalizar cita"
                                >
                                  Finalizar
                                </button>
                              )}
                            </div>

                            {/* Botón directo de WhatsApp para el paciente */}
                            <a
                              href={generarEnlaceWhatsApp(
                                normalizarTelefonoWhatsApp(cita.pacienteTelefono),
                                `Hola ${cita.pacienteNombre} 👋 Te saludamos desde OdontoControl respecto a tu cita de ${cita.tratamiento} para el ${formatearFechaEspanol(cita.fecha)} a las ${cita.horaInicio}. Estado: ${cita.estado === 'confirmada' ? 'Confirmada' : 'Pendiente de confirmación'}. Puedes autogestionar tu cita aquí: https://odontocontrol-ashen.vercel.app/portal-paciente?citaId=${encodeURIComponent(cita.id)}`
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                              title="Abrir chat de WhatsApp con el paciente"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VISTA 2: LISTA / TABLA TRADICIONAL DE CITAS CONFIRMADAS */}
            {vistaAgenda === 'tabla' && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Paciente</th>
                        <th className="py-3.5 px-4">Tratamiento</th>
                        <th className="py-3.5 px-4">Odontólogo</th>
                        <th className="py-3.5 px-4">Fecha y Hora</th>
                        <th className="py-3.5 px-4">Estado</th>
                        <th className="py-3.5 px-4 text-right">Acciones de Recepción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {citasFiltradas.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400">
                            No se encontraron citas confirmadas con los filtros seleccionados.
                          </td>
                        </tr>
                      ) : (
                        citasFiltradas.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-900 block">{c.pacienteNombre}</span>
                              <span className="text-slate-400 text-[11px]">{c.pacienteTelefono}</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 font-medium">
                              {c.tratamiento}
                            </td>
                            <td className="py-3.5 px-4 text-slate-700">
                              {c.doctorNombre}
                            </td>
                            <td className="py-3.5 px-4 text-slate-700">
                              <span className="font-semibold block text-slate-900">{c.fecha}</span>
                              <span className="text-slate-500 text-[11px]">{c.horaInicio}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              {c.estado === 'confirmada' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Confirmada
                                </span>
                              )}
                              {['pendiente', 'solicitada'].includes(c.estado) && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  Pendiente
                                </span>
                              )}
                              {c.estado === 'cancelada' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  Cancelada
                                </span>
                              )}
                              {c.estado === 'completada' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                                  Atendida
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-2">
                              {['pendiente', 'solicitada'].includes(c.estado) && (
                                <button
                                  onClick={() => handleConfirmarCitaRecepcion(c.id)}
                                  className="text-emerald-700 hover:text-emerald-900 font-bold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition"
                                  title="Confirmar cita en la agenda"
                                >
                                  Confirmar
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setCitaParaReagendar(c);
                                  setFormReagendar({ fecha: c.fecha, hora: c.horaInicio });
                                }}
                                className="text-dentist-600 hover:text-dentist-800 font-semibold px-2 py-1 rounded hover:bg-dentist-50 transition"
                              >
                                Reagendar
                              </button>
                              <button
                                onClick={() => {
                                  setCitaParaCancelar(c);
                                  setMotivoTexto('');
                                }}
                                className="text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 rounded hover:bg-rose-50 transition"
                              >
                                Cancelar
                              </button>
                              {c.estado === 'confirmada' && (
                                <button
                                  onClick={() => {
                                    setCitas(prev => prev.map(item => item.id === c.id ? { ...item, estado: 'completada' } : item));
                                    setMensajeAlerta('Cita marcada como completada/atendida.');
                                    setTimeout(() => setMensajeAlerta(null), 4000);
                                  }}
                                  className="text-emerald-700 hover:text-emerald-900 font-semibold px-2 py-1 rounded hover:bg-emerald-50 transition"
                                >
                                  Finalizar
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: HISTORIAL GENERAL DE TODAS LAS CITAS */}
        {/* ============================================================== */}
        {pestaña === 'todas' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Paciente</th>
                    <th className="py-3.5 px-4">Tratamiento</th>
                    <th className="py-3.5 px-4">Odontólogo</th>
                    <th className="py-3.5 px-4">Fecha y Hora</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-right">Acciones de Recepción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {citasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No se encontraron registros de citas.
                      </td>
                    </tr>
                  ) : (
                    citasFiltradas.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-900 block">{c.pacienteNombre}</span>
                          <span className="text-slate-400 text-[11px]">{c.pacienteTelefono}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {c.tratamiento}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {c.doctorNombre}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <span className="font-semibold block text-slate-900">{c.fecha}</span>
                          <span className="text-slate-500 text-[11px]">{c.horaInicio}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            c.estado === 'confirmada' ? 'bg-emerald-100 text-emerald-800' :
                            ['pendiente', 'solicitada'].includes(c.estado) ? 'bg-amber-100 text-amber-800' :
                            c.estado === 'cancelada' ? 'bg-rose-100 text-rose-800' :
                            c.estado === 'rechazada' ? 'bg-slate-100 text-slate-700' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {c.estado === 'confirmada' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {['pendiente', 'solicitada'].includes(c.estado) && <Clock className="w-3 h-3 text-amber-600" />}
                            {c.estado === 'cancelada' && <XCircle className="w-3 h-3 text-rose-600" />}
                            {['pendiente', 'solicitada'].includes(c.estado) ? 'Pendiente' : c.estado}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {['pendiente', 'solicitada'].includes(c.estado) && (
                            <button
                              onClick={() => handleConfirmarCitaRecepcion(c.id)}
                              className="text-emerald-700 hover:text-emerald-900 font-bold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition"
                              title="Confirmar cita en la agenda"
                            >
                              Confirmar
                            </button>
                          )}
                          {['confirmada', 'pendiente', 'solicitada'].includes(c.estado) && (
                            <>
                              <button
                                onClick={() => {
                                  setCitaParaReagendar(c);
                                  setFormReagendar({ fecha: c.fecha, hora: c.horaInicio });
                                }}
                                className="text-dentist-600 hover:text-dentist-800 font-semibold px-2 py-1 rounded hover:bg-dentist-50 transition"
                              >
                                Reagendar
                              </button>
                              <button
                                onClick={() => {
                                  setCitaParaCancelar(c);
                                  setMotivoTexto('');
                                }}
                                className="text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 rounded hover:bg-rose-50 transition"
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                          {c.estado === 'confirmada' && (
                            <button
                              onClick={() => {
                                setCitas(prev => prev.map(item => item.id === c.id ? { ...item, estado: 'completada' } : item));
                                setMensajeAlerta('Cita marcada como completada/atendida.');
                                setTimeout(() => setMensajeAlerta(null), 4000);
                              }}
                              className="text-emerald-700 hover:text-emerald-900 font-semibold px-2 py-1 rounded hover:bg-emerald-50 transition"
                            >
                              Finalizar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL: AGENDAR NUEVA CITA DIRECTA (RECEPCIÓN) */}
      {/* ============================================================== */}
      {modalNuevaCitaAbierto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-up my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b shrink-0">
              <div>
                <h3 className="font-bold text-base text-slate-900">Agendar Nueva Cita Directa</h3>
                <p className="text-xs text-slate-500">Acción directa de recepción para agendar citas en consultorio</p>
              </div>
              <button 
                onClick={() => {
                  setModalNuevaCitaAbierto(false);
                  handleLimpiarPaciente();
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearCitaDirecta} className="mt-4 space-y-4 overflow-y-auto pr-1">
              {/* Selector de Modo: Paciente Registrado vs Paciente Nuevo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">¿Para quién es la cita?</label>
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setModoPacienteCita('registrado');
                      setErrorModalCita(null);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition ${
                      modoPacienteCita === 'registrado'
                        ? 'bg-white text-dentist-700 shadow-sm border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-dentist-600" />
                    <span>Paciente Ya Registrado</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModoPacienteCita('nuevo');
                      handleLimpiarPaciente();
                      setErrorModalCita(null);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition ${
                      modoPacienteCita === 'nuevo'
                        ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus className="w-4 h-4 text-emerald-600" />
                    <span>Paciente Nuevo</span>
                  </button>
                </div>
              </div>

              {/* SECCIÓN SEGÚN MODO SELECCIONADO */}
              {modoPacienteCita === 'registrado' ? (
                <div className="space-y-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
                  {pacienteSeleccionado ? (
                    /* Tarjeta de Paciente Seleccionado */
                    <div className="p-3 bg-emerald-50/90 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                          {pacienteSeleccionado.nombres[0]}{pacienteSeleccionado.apellidos[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}
                            </h4>
                            {pacienteSeleccionado.eps && (
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                                pacienteSeleccionado.eps === 'Ecopetrol'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : 'bg-blue-100 text-blue-900 border border-blue-200'
                              }`}>
                                EPS: {pacienteSeleccionado.eps}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 flex items-center gap-2 mt-0.5 flex-wrap">
                            <span>Doc: {pacienteSeleccionado.numeroDocumento}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <Phone className="w-3 h-3 text-dentist-600" />
                              {pacienteSeleccionado.telefono}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleLimpiarPaciente}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 px-2.5 py-1 rounded-lg hover:bg-white transition border border-rose-200 bg-white shrink-0 shadow-2xs"
                      >
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    /* Buscador con Autocompletado y Selector Dropdown */
                    <div className="space-y-2.5">
                      <div className="relative">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Buscar y autocompletar paciente *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Escribe nombre, cédula o teléfono..."
                            value={busquedaPaciente}
                            onChange={e => {
                              setBusquedaPaciente(e.target.value);
                              setMostrarSugerencias(true);
                            }}
                            onFocus={() => setMostrarSugerencias(true)}
                            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500 bg-white"
                          />
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* Dropdown de sugerencias de autocompletado */}
                        {mostrarSugerencias && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-fade-in">
                            {sugerenciasPacientes.length === 0 ? (
                              <div className="p-3 text-xs text-slate-500 text-center">
                                No se encontraron pacientes registrados con ese criterio.
                              </div>
                            ) : (
                              sugerenciasPacientes.map(p => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => handleSeleccionarPaciente(p)}
                                  className="w-full text-left p-2.5 hover:bg-dentist-50 transition flex items-center justify-between gap-2 text-xs"
                                >
                                  <div>
                                    <p className="font-bold text-slate-900">
                                      {p.nombres} {p.apellidos}
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                      Doc: {p.numeroDocumento} • Tel: {p.telefono}
                                    </p>
                                  </div>
                                  {p.eps && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                      p.eps === 'Ecopetrol'
                                        ? 'bg-amber-100 text-amber-900'
                                        : 'bg-blue-100 text-blue-900'
                                    }`}>
                                      {p.eps}
                                    </span>
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      {/* Selector dropdown tradicional alternativo */}
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">
                          O selecciona directamente del listado:
                        </label>
                        <select
                          value={pacienteSeleccionado?.id || ''}
                          onChange={e => {
                            const encontrado = listaPacientes.find(item => item.id === e.target.value);
                            if (encontrado) handleSeleccionarPaciente(encontrado);
                          }}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500 bg-white"
                        >
                          <option value="">-- Seleccionar paciente ({listaPacientes.length} disponibles) --</option>
                          {listaPacientes.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.nombres} {p.apellidos} (Doc: {p.numeroDocumento} - {p.eps || 'Particular'})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* FORMULARIO DE PACIENTE NUEVO */
                <div className="space-y-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo del Paciente *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Roberto Gómez Bolaños"
                      value={nuevoPaciente.nombre}
                      onChange={e => setNuevoPaciente({ ...nuevoPaciente, nombre: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Número de Documento</label>
                      <input
                        type="text"
                        placeholder="Ej. 1020304050"
                        value={nuevoPaciente.documento}
                        onChange={e => setNuevoPaciente({ ...nuevoPaciente, documento: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">EPS *</label>
                      <select
                        value={epsNuevoPaciente}
                        onChange={e => setEpsNuevoPaciente(e.target.value as TipoEps)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500 bg-white font-medium"
                      >
                        <option value="Particular">Particular</option>
                        <option value="Ecopetrol">Ecopetrol</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono Móvil (WhatsApp) *</label>
                    <input
                      type="text"
                      required
                      placeholder="+57 300 123 4567"
                      value={nuevoPaciente.telefono}
                      onChange={e => setNuevoPaciente({ ...nuevoPaciente, telefono: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500 bg-white"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    ℹ️ Este paciente quedará registrado automáticamente en el consultorio.
                  </p>
                </div>
              )}

              {/* CAMPOS DE LA CITA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Odontólogo *</label>
                  <select
                    value={nuevoPaciente.doctor}
                    onChange={e => setNuevoPaciente({ ...nuevoPaciente, doctor: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500 bg-white"
                  >
                    {ODONTOLOGOS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tratamiento *</label>
                  <select
                    value={nuevoPaciente.tratamiento}
                    onChange={e => setNuevoPaciente({ ...nuevoPaciente, tratamiento: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500 bg-white"
                  >
                    {TRATAMIENTOS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={nuevoPaciente.fecha}
                    onChange={e => setNuevoPaciente({ ...nuevoPaciente, fecha: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hora *</label>
                  <input
                    type="time"
                    required
                    value={nuevoPaciente.hora.replace(' AM', '').replace(' PM', '')}
                    onChange={e => setNuevoPaciente({ ...nuevoPaciente, hora: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notas u Observaciones (Opcional)</label>
                <input
                  type="text"
                  placeholder="Motivo de consulta o indicaciones para el odontólogo..."
                  value={nuevoPaciente.notas}
                  onChange={e => setNuevoPaciente({ ...nuevoPaciente, notas: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500 bg-white"
                />
              </div>

              {errorModalCita && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorModalCita}</span>
                </div>
              )}

              <div className="pt-3 border-t flex justify-end space-x-2 shrink-0">
                <button
                  type="button"
                  disabled={guardandoNuevaCita}
                  onClick={() => {
                    setModalNuevaCitaAbierto(false);
                    handleLimpiarPaciente();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoNuevaCita}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-dentist-600 hover:bg-dentist-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition"
                >
                  {guardandoNuevaCita ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando en Base de Datos...</span>
                    </>
                  ) : (
                    <span>Agendar y Confirmar en Agenda</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: REAGENDAR CITA (RECEPCIÓN O DOCTOR) */}
      {/* ============================================================== */}
      {citaParaReagendar && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <h3 className="font-bold text-base text-slate-900 mb-1">Reagendar Cita</h3>
            <p className="text-xs text-slate-500 mb-4">
              Paciente: <strong>{citaParaReagendar.pacienteNombre}</strong> ({citaParaReagendar.doctorNombre})
            </p>

            <form onSubmit={handleConfirmarReagendar} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nueva Fecha</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formReagendar.fecha}
                  onChange={e => setFormReagendar({ ...formReagendar, fecha: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nueva Hora</label>
                <select
                  value={formReagendar.hora}
                  onChange={e => setFormReagendar({ ...formReagendar, hora: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                >
                  <option value="08:30 AM">08:30 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:30 PM">03:30 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                </select>
              </div>

              <div className="pt-4 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCitaParaReagendar(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-dentist-600 hover:bg-dentist-700 text-white rounded-xl shadow-sm transition"
                >
                  Guardar Nuevo Horario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: RECHAZAR SOLICITUD */}
      {/* ============================================================== */}
      {citaParaRechazar && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <h3 className="font-bold text-base text-slate-900 mb-1">Rechazar Solicitud de Cita</h3>
            <p className="text-xs text-slate-500 mb-4">
              Indica al paciente la razón por la cual no es posible atender esta solicitud.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Motivo del Rechazo</label>
                <input
                  type="text"
                  placeholder="Ej. El especialista no tiene cupo en esa fecha..."
                  value={motivoTexto}
                  onChange={e => setMotivoTexto(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-4 border-t flex justify-end space-x-2">
                <button
                  onClick={() => setCitaParaRechazar(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Volver
                </button>
                <button
                  onClick={handleConfirmarRechazo}
                  className="px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CANCELAR CITA EXISTENTE */}
      {/* ============================================================== */}
      {citaParaCancelar && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">¿Cancelar esta cita agendada?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Se liberará el cupo de la agenda de <strong>{citaParaCancelar.doctorNombre}</strong> para el paciente <strong>{citaParaCancelar.pacienteNombre}</strong>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Motivo (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. Paciente llamó para avisar inasistencia..."
                  value={motivoTexto}
                  onChange={e => setMotivoTexto(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-4 border-t flex justify-end space-x-2">
                <button
                  onClick={() => setCitaParaCancelar(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Volver
                </button>
                <button
                  onClick={handleConfirmarCancelacion}
                  className="px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition"
                >
                  Sí, Cancelar Cita
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: NOTIFICACIÓN DE WHATSAPP (REAGENDAMIENTO O CANCELACIÓN) */}
      {/* ============================================================== */}
      {modalWhatsApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Notificar al Paciente por WhatsApp
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {modalWhatsApp.tipoAccion === 'reagendamiento' ? 'Reprogramación de cita médica' : 'Cancelación de cita médica'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalWhatsApp(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Destinatario:</span>
                  <span className="text-slate-900 font-bold">{modalWhatsApp.pacienteNombre} ({modalWhatsApp.telefono})</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Mensaje listo para enviar con un clic
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mensaje generado automáticamente:
                </label>
                <div className="relative">
                  <pre className="text-xs bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 text-slate-800 whitespace-pre-wrap font-sans max-h-48 overflow-y-auto leading-relaxed">
                    {modalWhatsApp.mensaje}
                  </pre>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(modalWhatsApp.mensaje);
                      setCopiadoExito(true);
                      setTimeout(() => setCopiadoExito(false), 2500);
                    }}
                    className="absolute top-2 right-2 text-xs bg-white/90 hover:bg-white text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1 flex items-center gap-1 shadow-sm transition"
                  >
                    {copiadoExito ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <a
                  href={modalWhatsApp.urlWhatsAppWeb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Abrir WhatsApp Web</span>
                </a>
                <a
                  href={modalWhatsApp.urlWaMe}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-semibold text-xs transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir App (wa.me)</span>
                </a>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setModalWhatsApp(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
