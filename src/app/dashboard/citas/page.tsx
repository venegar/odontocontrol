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
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { EstadoCita, ModoAprobacion } from '@/modules/citas/types';
import { 
  aprobarCita, 
  rechazarCita, 
  obtenerCitasHoy,
  agendarCitaRecepcionAction,
  cancelarCitaAction
} from '@/modules/citas/actions';
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

// Citas iniciales de demostración
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
    estado: 'solicitada',
    esReagendamiento: true,
    motivoSolicitud: 'Reagendamiento: Cambio de horario por compromiso laboral.',
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

  // Formulario Nueva Cita Directa
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: '',
    documento: '',
    telefono: '',
    doctor: ODONTOLOGOS[0],
    tratamiento: TRATAMIENTOS[0],
    fecha: '',
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
    if (pestaña === 'agenda') return ['confirmada', 'en_atencion'].includes(c.estado);
    return true; // 'todas'
  });

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

  // 3. CANCELAR CITA EXISTENTE
  const handleConfirmarCancelacion = async () => {
    if (!citaParaCancelar) return;
    const idCita = citaParaCancelar.id;
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
    setMensajeAlerta('Cita cancelada con éxito. El horario ha quedado disponible en la agenda.');
    setCitaParaCancelar(null);
    setMotivoTexto('');
    setTimeout(() => setMensajeAlerta(null), 5000);

    try {
      await cancelarCitaAction(idCita, motivoFinal);
    } catch (err) {
      console.warn('Cancelación en Supabase procesada:', err);
    }
  };

  // 4. REAGENDAR CITA
  const handleConfirmarReagendar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citaParaReagendar || !formReagendar.fecha) return;
    setCitas(prev => prev.map(c => {
      if (c.id === citaParaReagendar.id) {
        return {
          ...c,
          fecha: formReagendar.fecha,
          horaInicio: formReagendar.hora,
          horaFin: `${formReagendar.hora} (Estimado)`,
          estado: 'confirmada', // Como lo hace recepción, queda confirmada de una vez
        };
      }
      return c;
    }));
    setMensajeAlerta('Cita reagendada exitosamente por recepción.');
    setCitaParaReagendar(null);
    setTimeout(() => setMensajeAlerta(null), 5000);
  };

  // 5. CREAR NUEVA CITA DIRECTA CON GUARDADO EN SUPABASE
  const handleCrearCitaDirecta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoPaciente.nombre || !nuevoPaciente.fecha || !nuevoPaciente.telefono) {
      setErrorModalCita('Por favor completa los campos obligatorios: nombre, teléfono y fecha.');
      return;
    }

    setGuardandoNuevaCita(true);
    setErrorModalCita(null);

    const res = await agendarCitaRecepcionAction({
      nombre: nuevoPaciente.nombre,
      documento: nuevoPaciente.documento,
      telefono: nuevoPaciente.telefono,
      doctor: nuevoPaciente.doctor,
      tratamiento: nuevoPaciente.tratamiento,
      fecha: nuevoPaciente.fecha,
      hora: nuevoPaciente.hora,
      notas: nuevoPaciente.notas,
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

    setCitas(prev => [nuevaCita, ...prev]);
    setMensajeAlerta('¡Nueva cita agendada y guardada con éxito en la base de datos!');
    setModalNuevaCitaAbierto(false);
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

        {/* TAB 2 & 3: TABLA DE AGENDA Y TODAS LAS CITAS */}
        {(pestaña === 'agenda' || pestaña === 'todas') && (
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
                        No se encontraron citas con los filtros seleccionados.
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
                            c.estado === 'solicitada' ? 'bg-amber-100 text-amber-800' :
                            c.estado === 'cancelada' ? 'bg-rose-100 text-rose-800' :
                            c.estado === 'rechazada' ? 'bg-slate-100 text-slate-700' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {c.estado === 'confirmada' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {c.estado === 'solicitada' && <Clock className="w-3 h-3 text-amber-600" />}
                            {c.estado === 'cancelada' && <XCircle className="w-3 h-3 text-rose-600" />}
                            {c.estado}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {['confirmada', 'solicitada'].includes(c.estado) && (
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="font-bold text-base text-slate-900">Agendar Nueva Cita Directa</h3>
                <p className="text-xs text-slate-500">Acción directa de recepción (queda confirmada automáticamente)</p>
              </div>
              <button 
                onClick={() => setModalNuevaCitaAbierto(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearCitaDirecta} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Paciente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Roberto Gómez"
                    value={nuevoPaciente.nombre}
                    onChange={e => setNuevoPaciente({ ...nuevoPaciente, nombre: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono Móvil *</label>
                  <input
                    type="text"
                    required
                    placeholder="+57 300 123 4567"
                    value={nuevoPaciente.telefono}
                    onChange={e => setNuevoPaciente({ ...nuevoPaciente, telefono: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Odontólogo *</label>
                  <select
                    value={nuevoPaciente.doctor}
                    onChange={e => setNuevoPaciente({ ...nuevoPaciente, doctor: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
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
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
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
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hora *</label>
                  <input
                    type="time"
                    required
                    value={nuevoPaciente.hora.replace(' AM', '').replace(' PM', '')}
                    onChange={e => setNuevoPaciente({ ...nuevoPaciente, hora: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                  />
                </div>
              </div>

              {errorModalCita && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorModalCita}</span>
                </div>
              )}

              <div className="pt-4 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  disabled={guardandoNuevaCita}
                  onClick={() => setModalNuevaCitaAbierto(false)}
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
    </div>
  );
}
