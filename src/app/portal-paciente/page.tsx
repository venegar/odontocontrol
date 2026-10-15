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
  Sparkles
} from 'lucide-react';
import { EstadoCita } from '@/modules/citas/types';
import { supabase } from '@/lib/supabase';
import { marcarCitaVistaAction } from '@/modules/recordatorios/actions';

interface CitaPacienteUI {
  id: string;
  doctorNombre: string;
  especialidad: string;
  tratamiento: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: EstadoCita;
  esReagendamiento?: boolean;
}

// Datos de demostración de citas del paciente
const CITAS_INICIALES: CitaPacienteUI[] = [
  {
    id: 'cita-1',
    doctorNombre: 'Dr. Carlos Ruiz',
    especialidad: 'Odontología General',
    tratamiento: 'Profilaxis y Limpieza Profunda',
    fecha: '2026-10-20',
    horaInicio: '09:30 AM',
    horaFin: '10:15 AM',
    estado: 'confirmada',
  },
  {
    id: 'cita-2',
    doctorNombre: 'Dra. Laura Vega',
    especialidad: 'Ortodoncia',
    tratamiento: 'Control Periódico de Ortodoncia',
    fecha: '2026-11-05',
    horaInicio: '03:00 PM',
    horaFin: '03:30 PM',
    estado: 'solicitada',
  },
  {
    id: 'cita-3',
    doctorNombre: 'Dr. Carlos Ruiz',
    especialidad: 'Estética Dental',
    tratamiento: 'Valoración para Blanqueamiento',
    fecha: '2026-09-15',
    horaInicio: '11:00 AM',
    horaFin: '11:45 AM',
    estado: 'completada',
  },
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

  const [citas, setCitas] = useState<CitaPacienteUI[]>(CITAS_INICIALES);
  const [nombrePaciente, setNombrePaciente] = useState<string>('María Camila Pérez');
  const [filtro, setFiltro] = useState<'activas' | 'historial'>('activas');
  
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

  // Sincronización en vivo con Supabase y procesamiento de la acción en URL
  useEffect(() => {
    let montado = true;
    async function sincronizarCitasPortal() {
      try {
        const { data, error } = await supabase.rpc('obtener_citas_gestion');
        if (!error && Array.isArray(data) && data.length > 0 && montado) {
          const citasDB: CitaPacienteUI[] = data.map((c: any) => ({
            id: c.id,
            doctorNombre: c.doctor_nombre || 'Dra. Yasmín Blanco',
            especialidad: 'Odontología Especializada',
            tratamiento: c.tratamiento_nombre || 'Valoración Odontológica',
            fecha: c.fecha,
            horaInicio: c.hora_inicio || '08:00 AM',
            horaFin: c.hora_fin || '08:30 AM',
            estado: c.estado as EstadoCita,
            esReagendamiento: Boolean(c.es_reagendamiento),
          }));

          // Si hay citaId en la URL, registrar la visualización y asociar el nombre del paciente
          if (citaIdParam) {
            marcarCitaVistaAction(citaIdParam, 'whatsapp').catch(() => {});
            const citaEnfocada = data.find((c: any) => c.id === citaIdParam);
            if (citaEnfocada && citaEnfocada.paciente_nombre) {
              setNombrePaciente(citaEnfocada.paciente_nombre);
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

  // Filtrado de citas
  const citasFiltradas = citas.filter(c => {
    if (filtro === 'activas') {
      return ['confirmada', 'solicitada', 'en_atencion'].includes(c.estado);
    }
    return ['completada', 'cancelada', 'rechazada'].includes(c.estado);
  });

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
        };
      }
      return c;
    }));

    setMensajeExito('Tu cita ha sido cancelada correctamente. El espacio ha quedado liberado.');
    setCitaParaCancelar(null);
    setMotivoCancelacion('');

    setTimeout(() => setMensajeExito(null), 6000);
  };

  const getBadgeEstado = (estado: EstadoCita, esReagendamiento?: boolean) => {
    switch (estado) {
      case 'confirmada':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Cita Confirmada
          </span>
        );
      case 'solicitada':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {esReagendamiento ? 'Reagendamiento en Aprobación' : 'Pendiente de Aprobación'}
          </span>
        );
      case 'completada':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
            Atendida con Éxito
          </span>
        );
      case 'cancelada':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Cancelada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            {estado}
          </span>
        );
    }
  };

  // Iniciales para el avatar
  const iniciales = nombrePaciente
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'PA';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
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
              <span className="block text-[11px] text-slate-500">Paciente Activo</span>
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
                Te notificaremos cuando el consultorio actualice el estado de tu cita.
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

        {/* Pestañas de Navegación */}
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

        {/* Lista de Citas */}
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
              const puedeModificarse = ['confirmada', 'solicitada'].includes(cita.estado);

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
      {/* MODAL: REAGENDAR CITA */}
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
      {/* MODAL: CANCELAR CITA */}
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
        <div className="flex items-center space-x-2 text-dentist-600 font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Cargando portal del paciente...</span>
        </div>
      </div>
    }>
      <PortalPacienteContenido />
    </Suspense>
  );
}
