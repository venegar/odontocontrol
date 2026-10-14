'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Home, 
  BarChart2, 
  Send, 
  Calendar as CalendarIcon, 
  Grid, 
  LogOut, 
  Search, 
  Bell, 
  Sparkles, 
  Clock, 
  User, 
  Activity, 
  ShieldCheck, 
  Stethoscope, 
  Smile, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ExternalLink, 
  Check, 
  MessageCircle, 
  Users, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  ChevronRight, 
  Plus, 
  Phone, 
  RefreshCw, 
  Building2, 
  Award, 
  ArrowUpRight, 
  AlertTriangle 
} from 'lucide-react';
import { generarEnlaceWhatsApp } from '@/modules/recordatorios/utils';

// ============================================================================
// TIPOS ESTRICTOS EN TYPESCRIPT
// ============================================================================

type RolDashboard = 'recepcionista' | 'odontologo' | 'admin';

interface PacienteDia {
  id: string;
  hora: string;
  nombre: string;
  telefono: string;
  tratamiento: string;
  doctor: string;
  sillon: string;
  estadoCita: 'completada' | 'en_espera' | 'por_atender' | 'en_atencion';
  notificacion: {
    estado: 'notificado' | 'pendiente';
    horaEnvio?: string;
  };
}

interface BitacoraEnvio {
  id: string;
  hora: string;
  pacienteNombre: string;
  telefono: string;
  tratamiento: string;
  doctor: string;
  canal: 'WhatsApp';
  estado: 'Entregado' | 'Enviado';
}

interface TiempoTratamiento {
  tratamiento: string;
  tiempoEstimadoMin: number;
  tiempoRealMin: number;
  diferenciaMin: number;
  casosHoy: number;
  estadoEficiencia: 'optimo' | 'demorado' | 'rapido';
}

interface CitaOdontologo {
  id: string;
  hora: string;
  paciente: string;
  edad: number;
  motivo: string;
  estado: 'completada' | 'en_atencion' | 'en_espera' | 'pendiente';
  historiaClinicaId: string;
  notasPrevias: string;
  alertaMedica?: string;
}

interface RendimientoDoctor {
  nombre: string;
  especialidad: string;
  citasAtendidas: number;
  satisfaccion: number;
  ingresosGenerados: string;
  tasaOcupacion: number;
}

// ============================================================================
// DATOS INICIALES DEMOSTRATIVOS
// ============================================================================

const PACIENTES_INICIALES: PacienteDia[] = [
  {
    id: 'pac-1',
    hora: '08:00 AM',
    nombre: 'Roberto Morales Varela',
    telefono: '+57 311 234 5678',
    tratamiento: 'Profilaxis y Limpieza Profunda',
    doctor: 'Dr. Carlos Ruiz',
    sillon: 'Sillón 1',
    estadoCita: 'completada',
    notificacion: {
      estado: 'notificado',
      horaEnvio: '07:15 AM',
    },
  },
  {
    id: 'pac-2',
    hora: '08:45 AM',
    nombre: 'Ana María Cárdenas',
    telefono: '+57 320 876 5432',
    tratamiento: 'Control de Ortodoncia',
    doctor: 'Dra. Laura Vega',
    sillon: 'Sillón 2',
    estadoCita: 'completada',
    notificacion: {
      estado: 'notificado',
      horaEnvio: '07:30 AM',
    },
  },
  {
    id: 'pac-3',
    hora: '09:30 AM',
    nombre: 'María Camila Pérez',
    telefono: '+57 310 987 6543',
    tratamiento: 'Profilaxis y Limpieza Profunda',
    doctor: 'Dr. Carlos Ruiz',
    sillon: 'Sillón 1',
    estadoCita: 'completada',
    notificacion: {
      estado: 'notificado',
      horaEnvio: '08:00 AM',
    },
  },
  {
    id: 'pac-4',
    hora: '10:15 AM',
    nombre: 'Jorge Andrés Ramírez',
    telefono: '+57 315 456 7890',
    tratamiento: 'Resina Fotocurada (1 superficie)',
    doctor: 'Dr. Carlos Ruiz',
    sillon: 'Sillón 1',
    estadoCita: 'en_atencion',
    notificacion: {
      estado: 'notificado',
      horaEnvio: '08:30 AM',
    },
  },
  {
    id: 'pac-5',
    hora: '11:00 AM',
    nombre: 'Valentina Restrepo Gil',
    telefono: '+57 318 654 3210',
    tratamiento: 'Blanqueamiento Dental LED',
    doctor: 'Dra. Laura Vega',
    sillon: 'Sillón 2',
    estadoCita: 'en_espera',
    notificacion: {
      estado: 'pendiente',
    },
  },
  {
    id: 'pac-6',
    hora: '11:45 AM',
    nombre: 'Carlos Eduardo Mendoza',
    telefono: '+57 300 789 1234',
    tratamiento: 'Endodoncia Unirradicular',
    doctor: 'Dr. Carlos Ruiz',
    sillon: 'Sillón 1',
    estadoCita: 'en_espera',
    notificacion: {
      estado: 'pendiente',
    },
  },
  {
    id: 'pac-7',
    hora: '02:00 PM',
    nombre: 'Lucía Fernández Suárez',
    telefono: '+57 312 901 2345',
    tratamiento: 'Control de Ortodoncia',
    doctor: 'Dra. Laura Vega',
    sillon: 'Sillón 2',
    estadoCita: 'por_atender',
    notificacion: {
      estado: 'notificado',
      horaEnvio: '09:00 AM',
    },
  },
  {
    id: 'pac-8',
    hora: '02:45 PM',
    nombre: 'David Alejandro Castro',
    telefono: '+57 317 345 6789',
    tratamiento: 'Resina Fotocurada (1 superficie)',
    doctor: 'Dr. Carlos Ruiz',
    sillon: 'Sillón 1',
    estadoCita: 'por_atender',
    notificacion: {
      estado: 'pendiente',
    },
  },
  {
    id: 'pac-9',
    hora: '03:30 PM',
    nombre: 'Sofía Isabel Martínez',
    telefono: '+57 319 876 5431',
    tratamiento: 'Profilaxis y Limpieza Profunda',
    doctor: 'Dr. Carlos Ruiz',
    sillon: 'Sillón 1',
    estadoCita: 'por_atender',
    notificacion: {
      estado: 'pendiente',
    },
  },
  {
    id: 'pac-10',
    hora: '04:15 PM',
    nombre: 'Gabriel Enrique Ospina',
    telefono: '+57 314 567 8901',
    tratamiento: 'Blanqueamiento Dental LED',
    doctor: 'Dra. Laura Vega',
    sillon: 'Sillón 2',
    estadoCita: 'por_atender',
    notificacion: {
      estado: 'notificado',
      horaEnvio: '09:15 AM',
    },
  },
];

const BITACORA_INICIAL: BitacoraEnvio[] = [
  {
    id: 'bit-1',
    hora: '09:15 AM',
    pacienteNombre: 'Gabriel Enrique Ospina',
    telefono: '+57 314 567 8901',
    tratamiento: 'Blanqueamiento Dental LED',
    doctor: 'Dra. Laura Vega',
    canal: 'WhatsApp',
    estado: 'Entregado',
  },
  {
    id: 'bit-2',
    hora: '09:00 AM',
    pacienteNombre: 'Lucía Fernández Suárez',
    telefono: '+57 312 901 2345',
    tratamiento: 'Control de Ortodoncia',
    doctor: 'Dra. Laura Vega',
    canal: 'WhatsApp',
    estado: 'Entregado',
  },
  {
    id: 'bit-3',
    hora: '08:30 AM',
    pacienteNombre: 'Jorge Andrés Ramírez',
    telefono: '+57 315 456 7890',
    tratamiento: 'Resina Fotocurada',
    doctor: 'Dr. Carlos Ruiz',
    canal: 'WhatsApp',
    estado: 'Entregado',
  },
  {
    id: 'bit-4',
    hora: '08:00 AM',
    pacienteNombre: 'María Camila Pérez',
    telefono: '+57 310 987 6543',
    tratamiento: 'Profilaxis Profunda',
    doctor: 'Dr. Carlos Ruiz',
    canal: 'WhatsApp',
    estado: 'Entregado',
  },
];

const METRICAS_TIEMPO_TRATAMIENTOS: TiempoTratamiento[] = [
  {
    tratamiento: 'Profilaxis',
    tiempoEstimadoMin: 45,
    tiempoRealMin: 42,
    diferenciaMin: -3,
    casosHoy: 3,
    estadoEficiencia: 'optimo',
  },
  {
    tratamiento: 'Ortodoncia',
    tiempoEstimadoMin: 30,
    tiempoRealMin: 28,
    diferenciaMin: -2,
    casosHoy: 2,
    estadoEficiencia: 'rapido',
  },
  {
    tratamiento: 'Resina',
    tiempoEstimadoMin: 40,
    tiempoRealMin: 45,
    diferenciaMin: 5,
    casosHoy: 2,
    estadoEficiencia: 'demorado',
  },
  {
    tratamiento: 'Blanqueamiento',
    tiempoEstimadoMin: 60,
    tiempoRealMin: 55,
    diferenciaMin: -5,
    casosHoy: 2,
    estadoEficiencia: 'optimo',
  },
  {
    tratamiento: 'Endodoncia',
    tiempoEstimadoMin: 90,
    tiempoRealMin: 92,
    diferenciaMin: 2,
    casosHoy: 1,
    estadoEficiencia: 'optimo',
  },
];

const CITAS_DOCTOR_RUIZ: CitaOdontologo[] = [
  {
    id: 'cd-1',
    hora: '08:00 AM',
    paciente: 'Roberto Morales Varela',
    edad: 34,
    motivo: 'Profilaxis Profunda y Remoción de Sarro',
    estado: 'completada',
    historiaClinicaId: 'HC-2026-089',
    notasPrevias: 'Paciente con ligera sensibilidad en cuadrante 1. Flúor aplicado.',
  },
  {
    id: 'cd-2',
    hora: '09:30 AM',
    paciente: 'María Camila Pérez',
    edad: 28,
    motivo: 'Profilaxis y control semestral',
    estado: 'completada',
    historiaClinicaId: 'HC-2026-104',
    notasPrevias: 'Encías sanas. Se sugiere valorar blanqueamiento en próxima sesión.',
  },
  {
    id: 'cd-3',
    hora: '10:15 AM',
    paciente: 'Jorge Andrés Ramírez',
    edad: 42,
    motivo: 'Resina Fotocurada en diente 2.4 oclusal',
    estado: 'en_atencion',
    historiaClinicaId: 'HC-2026-118',
    notasPrevias: 'Caries superficial detectada. Sin compromiso pulpar.',
    alertaMedica: 'Hipertensión controlada',
  },
  {
    id: 'cd-4',
    hora: '11:45 AM',
    paciente: 'Carlos Eduardo Mendoza',
    edad: 39,
    motivo: 'Endodoncia Unirradicular Diente 1.1',
    estado: 'en_espera',
    historiaClinicaId: 'HC-2026-065',
    notasPrevias: 'Traumatismo previo. Conductometría lista.',
    alertaMedica: 'Alergia a la Penicilina',
  },
  {
    id: 'cd-5',
    hora: '02:45 PM',
    paciente: 'David Alejandro Castro',
    edad: 25,
    motivo: 'Resina Fotocurada Clase I Diente 3.6',
    estado: 'pendiente',
    historiaClinicaId: 'HC-2026-133',
    notasPrevias: 'Primera sesión de restauración.',
  },
  {
    id: 'cd-6',
    hora: '03:30 PM',
    paciente: 'Sofía Isabel Martínez',
    edad: 31,
    motivo: 'Profilaxis y Detección de Placa',
    estado: 'pendiente',
    historiaClinicaId: 'HC-2026-140',
    notasPrevias: 'Mantenimiento preventivo.',
  },
];

const RENDIMIENTO_DOCTORES: RendimientoDoctor[] = [
  {
    nombre: 'Dra. Yasmín Blanco',
    especialidad: 'Directora Médica & Implantología/Estética',
    citasAtendidas: 68,
    satisfaccion: 99.4,
    ingresosGenerados: '$11,400,000 COP',
    tasaOcupacion: 95,
  },
  {
    nombre: 'Dr. Carlos Ruiz Morales',
    especialidad: 'Odontología General & Rehabilitación',
    citasAtendidas: 48,
    satisfaccion: 98.4,
    ingresosGenerados: '$6,950,000 COP',
    tasaOcupacion: 90,
  },
  {
    nombre: 'Dra. Laura Vega Pardo',
    especialidad: 'Ortodoncia & Ortopedia Maxilofacial',
    citasAtendidas: 42,
    satisfaccion: 99.1,
    ingresosGenerados: '$5,800,000 COP',
    tasaOcupacion: 86,
  },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function DashboardPrincipalPage() {
  const [rolActivo, setRolActivo] = useState<RolDashboard>('recepcionista');
  const [pacientes, setPacientes] = useState<PacienteDia[]>(PACIENTES_INICIALES);
  const [bitacora, setBitacora] = useState<BitacoraEnvio[]>(BITACORA_INICIAL);
  const [alertaExito, setAlertaExito] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  // Cálculos de métricas del día para Recepción
  const totalCitasHoy = pacientes.length;
  const citasCompletadas = pacientes.filter(p => p.estadoCita === 'completada').length;
  const citasEnEspera = pacientes.filter(p => p.estadoCita === 'en_espera').length;
  const citasPorAtender = pacientes.filter(p => p.estadoCita === 'por_atender').length;
  const citasEnAtencion = pacientes.filter(p => p.estadoCita === 'en_atencion').length;
  const totalPendientesAtencion = citasEnEspera + citasPorAtender + citasEnAtencion;
  const totalNotificados = pacientes.filter(p => p.notificacion.estado === 'notificado').length;
  const totalPendientesNotificacion = pacientes.filter(p => p.notificacion.estado === 'pendiente').length;

  // Filtrado de pacientes de recepción
  const pacientesFiltrados = pacientes.filter(p => {
    if (filtroEstado === 'todos') return true;
    if (filtroEstado === 'notificados') return p.notificacion.estado === 'notificado';
    if (filtroEstado === 'pendientes_notificacion') return p.notificacion.estado === 'pendiente';
    if (filtroEstado === 'en_espera') return p.estadoCita === 'en_espera';
    if (filtroEstado === 'completadas') return p.estadoCita === 'completada';
    return true;
  });

  // Función para enviar recordatorio de WhatsApp inmediato
  const handleEnviarRecordatorioWhatsApp = (paciente: PacienteDia) => {
    const horaActual = new Date().toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });

    const mensajeWhatsApp = `¡Hola ${paciente.nombre}! Te recordamos tu cita odontológica hoy a las ${paciente.hora} para "${paciente.tratamiento}" con el ${paciente.doctor} en la Clínica Dental Dra. Yasmín Blanco (Sillón: ${paciente.sillon}). Por favor confirmar tu asistencia respondiendo a este mensaje. ¡Te esperamos!`;

    // Generar enlace oficial funcional
    const urlEnlace = generarEnlaceWhatsApp(paciente.telefono, mensajeWhatsApp);

    // Abrir WhatsApp Web / App
    window.open(urlEnlace, '_blank');

    // Actualizar estado del paciente en vivo
    setPacientes(prev => prev.map(p => {
      if (p.id === paciente.id) {
        return {
          ...p,
          notificacion: {
            estado: 'notificado',
            horaEnvio: horaActual,
          },
        };
      }
      return p;
    }));

    // Registrar en la Bitácora en vivo
    const nuevoRegistro: BitacoraEnvio = {
      id: `bit-${Date.now()}`,
      hora: horaActual,
      pacienteNombre: paciente.nombre,
      telefono: paciente.telefono,
      tratamiento: paciente.tratamiento,
      doctor: paciente.doctor,
      canal: 'WhatsApp',
      estado: 'Enviado',
    };

    setBitacora(prev => [nuevoRegistro, ...prev]);

    // Mensaje de éxito
    setAlertaExito(`Recordatorio enviado con éxito por WhatsApp a ${paciente.nombre} (${paciente.telefono})`);
    setTimeout(() => {
      setAlertaExito(null);
    }, 5000);
  };

  // Función para enviar notificación a TODOS los pendientes
  const handleEnviarTodosLosPendientes = () => {
    const pendientes = pacientes.filter(p => p.notificacion.estado === 'pendiente');
    if (pendientes.length === 0) {
      setAlertaExito('No hay pacientes pendientes de notificación.');
      setTimeout(() => setAlertaExito(null), 4000);
      return;
    }

    const horaActual = new Date().toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });

    setPacientes(prev => prev.map(p => {
      if (p.notificacion.estado === 'pendiente') {
        return {
          ...p,
          notificacion: {
            estado: 'notificado',
            horaEnvio: horaActual,
          },
        };
      }
      return p;
    }));

    const nuevosRegistros: BitacoraEnvio[] = pendientes.map(p => ({
      id: `bit-${Date.now()}-${p.id}`,
      hora: horaActual,
      pacienteNombre: p.nombre,
      telefono: p.telefono,
      tratamiento: p.tratamiento,
      doctor: p.doctor,
      canal: 'WhatsApp',
      estado: 'Enviado',
    }));

    setBitacora(prev => [...nuevosRegistros, ...prev]);
    setAlertaExito(`¡Se despacharon ${pendientes.length} recordatorios masivos por WhatsApp exitosamente!`);
    setTimeout(() => setAlertaExito(null), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      
      {/* ===================================================================== */}
      {/* 1. BARRA SUPERIOR INSTITUCIONAL (HEADER LUMINOSO) */}
      {/* ===================================================================== */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo y Nombre */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="relative h-10 w-36 sm:w-44">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/logo-yasmin-blanco.png"
                  alt="Dra. Yasmín Blanco"
                  className="h-full w-full object-contain object-left"
                />
              </div>
            </Link>

            <span className="hidden md:inline-block h-6 w-px bg-slate-200 mx-2" />

            {/* BOTÓN PROMINENTE 1: VOLVER AL SITIO WEB EN BARRA SUPERIOR */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-dentist-600 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 transition-colors shadow-2xs"
              title="Volver a la Página Principal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Volver al Sitio Web</span>
            </Link>
          </div>

          {/* SELECTOR INTERACTIVO DE ROL (CENTRAL / DESTACADO) */}
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setRolActivo('recepcionista')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                rolActivo === 'recepcionista'
                  ? 'bg-white text-dentist-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📋</span>
              <span>Recepcionista (Atención y Agenda)</span>
              {totalPendientesNotificacion > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
                  {totalPendientesNotificacion}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setRolActivo('odontologo')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                rolActivo === 'odontologo'
                  ? 'bg-white text-dentist-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🩺</span>
              <span>Odontólogo (Dr. Carlos Ruiz)</span>
            </button>

            <button
              type="button"
              onClick={() => setRolActivo('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                rolActivo === 'admin'
                  ? 'bg-white text-dentist-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👑</span>
              <span>Directora Médica (Dra. Yasmín Blanco)</span>
            </button>
          </div>

          {/* Acciones de la derecha */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Clínica Activa</span>
            </div>

            <Link
              href="/dashboard/recordatorios"
              className="p-2 text-slate-500 hover:text-dentist-600 hover:bg-slate-100 rounded-xl transition relative"
              title="Notificaciones y Recordatorios"
            >
              <Bell className="w-4 h-4" />
              {totalPendientesNotificacion > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </Link>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Perfil Mini */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-dentist-100 text-dentist-700 font-bold text-xs flex items-center justify-center border border-dentist-200">
                {rolActivo === 'recepcionista' ? 'RC' : rolActivo === 'odontologo' ? 'CR' : 'YB'}
              </div>
              <div className="hidden xl:block text-left text-xs">
                <span className="block font-bold text-slate-900 leading-tight">
                  {rolActivo === 'recepcionista' && 'Marcela Sánchez'}
                  {rolActivo === 'odontologo' && 'Dr. Carlos Ruiz'}
                  {rolActivo === 'admin' && 'Dra. Yasmín Blanco'}
                </span>
                <span className="block text-[11px] text-slate-500 font-medium">
                  {rolActivo === 'recepcionista' && 'Recepción Clínica'}
                  {rolActivo === 'odontologo' && 'Odontólogo Titular'}
                  {rolActivo === 'admin' && 'Directora Médica'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SELECTOR DE ROL MÓVIL / PANTALLAS PEQUEÑAS */}
        <div className="lg:hidden flex items-center justify-around bg-slate-50 p-2 border-t border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setRolActivo('recepcionista')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 ${
              rolActivo === 'recepcionista'
                ? 'bg-dentist-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>📋</span> Recepción
          </button>
          <button
            type="button"
            onClick={() => setRolActivo('odontologo')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 ${
              rolActivo === 'odontologo'
                ? 'bg-dentist-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>🩺</span> Odontólogo
          </button>
          <button
            type="button"
            onClick={() => setRolActivo('admin')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 ${
              rolActivo === 'admin'
                ? 'bg-dentist-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>👑</span> Admin
          </button>
        </div>
      </header>

      {/* TOAST DE ALERTA O ÉXITO FLOTANTE */}
      {alertaExito && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm animate-in fade-in slide-in-from-top-1 sticky top-16 z-50">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{alertaExito}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. ESTRUCTURA PRINCIPAL: SIDEBAR + CONTENIDO DEL DASHBOARD */}
      {/* ===================================================================== */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col md:flex-row">
        
        {/* =================================================================== */}
        {/* SIDEBAR LATERAL LUMINOSO */}
        {/* =================================================================== */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            
            {/* BOTÓN PROMINENTE 2: VOLVER AL SITIO WEB EN EL SIDEBAR */}
            <div className="pt-1">
              <Link
                href="/"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-dentist-50 hover:bg-dentist-100 text-dentist-700 font-bold text-xs border border-dentist-200 transition shadow-2xs group"
              >
                <div className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Volver al Sitio Web</span>
                </div>
                <span className="text-[10px] text-dentist-500 font-medium">Inicio</span>
              </Link>
            </div>

            {/* Selector de Rol en Sidebar */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                Modo de Visualización
              </span>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setRolActivo('recepcionista')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                    rolActivo === 'recepcionista'
                      ? 'bg-slate-100 text-slate-900 font-bold border border-slate-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>📋</span> Recepcionista
                  </span>
                  {rolActivo === 'recepcionista' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-dentist-600" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRolActivo('odontologo')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                    rolActivo === 'odontologo'
                      ? 'bg-slate-100 text-slate-900 font-bold border border-slate-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>🩺</span> Dr. Carlos Ruiz
                  </span>
                  {rolActivo === 'odontologo' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-dentist-600" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRolActivo('admin')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                    rolActivo === 'admin'
                      ? 'bg-slate-100 text-slate-900 font-bold border border-slate-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>👑</span> Dra. Yasmín Blanco (Dirección)
                  </span>
                  {rolActivo === 'admin' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-dentist-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Enlaces de Navegación del Sistema */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                Módulos Clínicos
              </span>
              <nav className="space-y-1">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-dentist-600 text-white shadow-xs"
                >
                  <Home className="w-4 h-4" />
                  <span>Dashboard Central</span>
                </Link>

                <Link
                  href="/dashboard/citas"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span>Agenda y Citas</span>
                  </div>
                  <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-md font-semibold">
                    {totalCitasHoy}
                  </span>
                </Link>

                <Link
                  href="/dashboard/recordatorios"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Send className="w-4 h-4 text-slate-400" />
                    <span>Recordatorios WhatsApp</span>
                  </div>
                  {totalPendientesNotificacion > 0 && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {totalPendientesNotificacion}
                    </span>
                  )}
                </Link>

                <Link
                  href="/dashboard/pacientes"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <Grid className="w-4 h-4 text-slate-400" />
                  <span>Fichas de Pacientes</span>
                </Link>

                <Link
                  href="/dashboard/historias"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <Stethoscope className="w-4 h-4 text-slate-400" />
                  <span>Historias & Odontograma</span>
                </Link>

                <Link
                  href="/dashboard/personal"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>Personal y Permisos</span>
                </Link>

                <Link
                  href="/dashboard/reportes"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <BarChart2 className="w-4 h-4 text-slate-400" />
                  <span>Reportes e Ingresos</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Tarjeta de Usuario Activo en el Sidebar */}
          <div className="pt-4 mt-6 border-t border-slate-200">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-dentist-600 text-white font-bold text-xs flex items-center justify-center">
                  {rolActivo === 'recepcionista' ? 'RC' : rolActivo === 'odontologo' ? 'CR' : 'YB'}
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900 leading-tight">
                    {rolActivo === 'recepcionista' && 'Marcela Sánchez'}
                    {rolActivo === 'odontologo' && 'Dr. Carlos Ruiz'}
                    {rolActivo === 'admin' && 'Dra. Yasmín Blanco'}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-medium">
                    {rolActivo === 'recepcionista' && 'Turno Mañana/Tarde'}
                    {rolActivo === 'odontologo' && 'Sillón Principal 1'}
                    {rolActivo === 'admin' && 'Administración'}
                  </span>
                </div>
              </div>
              <Link href="/" title="Cerrar y salir a la web" className="text-slate-400 hover:text-slate-700 p-1">
                <LogOut className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </aside>

        {/* =================================================================== */}
        {/* ÁREA DE CONTENIDO PRINCIPAL SEGÚN EL ROL ACTIVO */}
        {/* =================================================================== */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          
          {/* ================================================================= */}
          {/* VISTA 1: RECEPCIONISTA (ÉNFASIS PRINCIPAL) */}
          {/* ================================================================= */}
          {rolActivo === 'recepcionista' && (
            <div className="space-y-6">
              
              {/* Banner de Bienvenida Recepción */}
              <div className="bg-gradient-to-r from-sky-600 via-dentist-600 to-sky-700 rounded-3xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold backdrop-blur-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Jornada en Vivo • {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-white">
                    Panel de Recepción y Control de Citas
                  </h1>
                  <p className="text-xs text-sky-100 max-w-xl">
                    Monitorea los pacientes del día, valida tiempos de atención y envía recordatorios inmediatos por WhatsApp.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleEnviarTodosLosPendientes}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-dentist-700 hover:bg-sky-50 font-bold text-xs shadow-sm transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Despachar Notificaciones Pendientes ({totalPendientesNotificacion})</span>
                  </button>
                  <Link
                    href="/dashboard/citas"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agendar Nueva Cita</span>
                  </Link>
                </div>
              </div>

              {/* 4 TARJETAS DE MÉTRICAS DEL DÍA DESTACADAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                
                {/* 1. Total Citas Hoy */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Citas Hoy</span>
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-dentist-600 flex items-center justify-center">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">{totalCitasHoy}</span>
                    <span className="text-xs text-slate-500 font-medium">programadas</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100">
                    <span>Sillón 1: 6 | Sillón 2: 4</span>
                    <span className="text-emerald-600 font-bold">100% cap.</span>
                  </div>
                </div>

                {/* 2. Citas Ya Realizadas / Completadas */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Citas Completadas</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-600">{citasCompletadas}</span>
                    <span className="text-xs text-slate-500 font-medium">atendidas con éxito</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100">
                    <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-1.5 rounded-full" 
                        style={{ width: `${Math.round((citasCompletadas / totalCitasHoy) * 100)}%` }} 
                      />
                    </div>
                    <span className="font-semibold text-slate-700">
                      {Math.round((citasCompletadas / totalCitasHoy) * 100)}% de la agenda
                    </span>
                  </div>
                </div>

                {/* 3. Citas Pendientes (En Espera + Por Llegar) */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Citas Pendientes</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-amber-600">{totalPendientesAtencion}</span>
                    <span className="text-xs text-slate-500 font-medium">por atender</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100">
                    <span className="text-amber-700 font-semibold">{citasEnEspera} en sala de espera</span>
                    <span className="text-slate-400">• {citasPorAtender} turno tarde</span>
                  </div>
                </div>

                {/* 4. Notificaciones WhatsApp Enviadas */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Notificaciones WhatsApp</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">{totalNotificados}</span>
                    <span className="text-xs text-slate-500 font-medium">de {totalCitasHoy} notificados</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] pt-3 border-t border-slate-100">
                    <span className="text-emerald-600 font-semibold">
                      {Math.round((totalNotificados / totalCitasHoy) * 100)}% confirmados
                    </span>
                    <span className="text-amber-700 font-bold">{totalPendientesNotificacion} pendientes</span>
                  </div>
                </div>
              </div>

              {/* SECCIÓN COMPARATIVA DE TIEMPOS PROMEDIO DE ATENCIÓN POR TRATAMIENTO */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-dentist-600" />
                      <span>Tiempos Promedio de Atención por Tratamiento Clínico</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Comparativa en tiempo real entre el tiempo programado vs el tiempo real medido en los sillones.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Tiempo Estimado
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-dentist-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-dentist-600" /> Tiempo Real
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {METRICAS_TIEMPO_TRATAMIENTOS.map((m) => {
                    const esAhorro = m.diferenciaMin <= 0;
                    return (
                      <div 
                        key={m.tratamiento} 
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-dentist-200 transition space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800">{m.tratamiento}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            esAhorro ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {esAhorro ? `${Math.abs(m.diferenciaMin)}m menos` : `+${m.diferenciaMin}m demora`}
                          </span>
                        </div>

                        {/* Comparación numérica */}
                        <div className="grid grid-cols-2 gap-1 text-center py-1">
                          <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <span className="block text-[10px] text-slate-400 font-medium">Estimado</span>
                            <span className="text-base font-black text-slate-600">{m.tiempoEstimadoMin}m</span>
                          </div>
                          <div className="bg-dentist-50 p-2 rounded-lg border border-dentist-200">
                            <span className="block text-[10px] text-dentist-600 font-semibold">Real Promedio</span>
                            <span className="text-base font-black text-dentist-700">{m.tiempoRealMin}m</span>
                          </div>
                        </div>

                        {/* Barra de progreso */}
                        <div className="space-y-1">
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                            <div 
                              className={`h-2 rounded-full ${esAhorro ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                              style={{ width: `${Math.min(100, Math.round((m.tiempoRealMin / m.tiempoEstimadoMin) * 100))}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>{m.casosHoy} citas hoy</span>
                            <span className={esAhorro ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                              {Math.round((m.tiempoRealMin / m.tiempoEstimadoMin) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECCIÓN: CONTROL Y ENVÍO DE NOTIFICACIONES DE CITAS (TABLA Y BITÁCORA) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. LISTA / TABLA DE PACIENTES DEL DÍA CON ACCIONES WHATSAPP (2 COLUMNAS) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
                  <div>
                    {/* Encabezado y Filtros */}
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <Send className="w-4 h-4 text-emerald-600" />
                          <span>Control y Envío de Recordatorios de Citas</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Envía recordatorios inmediatos por WhatsApp con mensaje precargado personalizado.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={filtroEstado}
                          onChange={(e) => setFiltroEstado(e.target.value)}
                          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-dentist-600"
                        >
                          <option value="todos">Todos los pacientes ({pacientes.length})</option>
                          <option value="pendientes_notificacion">Pendientes de WhatsApp ({totalPendientesNotificacion})</option>
                          <option value="notificados">Notificados ({totalNotificados})</option>
                          <option value="en_espera">En Sala de Espera ({citasEnEspera})</option>
                          <option value="completadas">Completadas ({citasCompletadas})</option>
                        </select>
                      </div>
                    </div>

                    {/* Tabla de Pacientes */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">Hora</th>
                            <th className="py-3 px-4">Paciente y Contacto</th>
                            <th className="py-3 px-4">Tratamiento & Sillón</th>
                            <th className="py-3 px-4">Estado Cita</th>
                            <th className="py-3 px-4">Estado WhatsApp</th>
                            <th className="py-3 px-4 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pacientesFiltrados.map((paciente) => {
                            const yaNotificado = paciente.notificacion.estado === 'notificado';
                            return (
                              <tr key={paciente.id} className="hover:bg-slate-50/80 transition-colors">
                                {/* Hora */}
                                <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900">
                                  {paciente.hora}
                                </td>

                                {/* Paciente */}
                                <td className="py-3 px-4">
                                  <div className="font-bold text-slate-900 leading-tight">
                                    {paciente.nombre}
                                  </div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span>{paciente.telefono}</span>
                                  </div>
                                </td>

                                {/* Tratamiento */}
                                <td className="py-3 px-4">
                                  <div className="font-medium text-slate-800 leading-tight">
                                    {paciente.tratamiento}
                                  </div>
                                  <div className="text-[11px] text-dentist-700 font-semibold mt-0.5">
                                    {paciente.doctor} • {paciente.sillon}
                                  </div>
                                </td>

                                {/* Estado Cita */}
                                <td className="py-3 px-4 whitespace-nowrap">
                                  {paciente.estadoCita === 'completada' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                      <Check className="w-3 h-3 text-slate-500" /> Atendida
                                    </span>
                                  )}
                                  {paciente.estadoCita === 'en_atencion' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" /> En Sillón
                                    </span>
                                  )}
                                  {paciente.estadoCita === 'en_espera' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                      <Clock className="w-3 h-3" /> En Sala
                                    </span>
                                  )}
                                  {paciente.estadoCita === 'por_atender' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                      Por llegar
                                    </span>
                                  )}
                                </td>

                                {/* Estado WhatsApp */}
                                <td className="py-3 px-4 whitespace-nowrap">
                                  {yaNotificado ? (
                                    <div className="inline-flex flex-col">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                        <CheckCircle2 className="w-3 h-3" /> Notificado
                                      </span>
                                      <span className="text-[10px] text-slate-500 mt-0.5 ml-1">
                                        {paciente.notificacion.horaEnvio}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                      <AlertTriangle className="w-3 h-3" /> Pendiente
                                    </span>
                                  )}
                                </td>

                                {/* Botón Acción */}
                                <td className="py-3 px-4 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => handleEnviarRecordatorioWhatsApp(paciente)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs ${
                                      yaNotificado
                                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                                    }`}
                                    title={`Abrir WhatsApp para ${paciente.nombre}`}
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>{yaNotificado ? 'Reenviar' : 'Enviar WhatsApp'}</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Mostrando {pacientesFiltrados.length} de {pacientes.length} pacientes citados hoy</span>
                    <Link href="/dashboard/citas" className="text-dentist-600 font-bold hover:underline">
                      Ver agenda completa en calendario →
                    </Link>
                  </div>
                </div>

                {/* 2. REGISTRO / BITÁCORA EN VIVO DE ENVÍOS HOY (1 COLUMNA) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Bitácora en Vivo de Notificaciones</span>
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Historial en tiempo real de recordatorios despachados hoy.
                        </p>
                      </div>
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl">
                        {bitacora.length} envíos
                      </span>
                    </div>

                    <div className="space-y-3 mt-4 max-h-[460px] overflow-y-auto pr-1">
                      {bitacora.map((item) => (
                        <div 
                          key={item.id} 
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-white transition space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900">{item.pacienteNombre}</span>
                            <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                              {item.hora}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600">
                            {item.tratamiento} • <span className="text-dentist-700 font-medium">{item.doctor}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-200/50">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {item.telefono}
                            </span>
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> WhatsApp {item.estado}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-center">
                    <Link
                      href="/dashboard/recordatorios"
                      className="text-xs font-bold text-dentist-600 hover:text-dentist-700 inline-flex items-center gap-1"
                    >
                      <span>Configurar plantillas de WhatsApp</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* VISTA 2: ODONTÓLOGO (DR. CARLOS RUIZ) */}
          {/* ================================================================= */}
          {rolActivo === 'odontologo' && (
            <div className="space-y-6">
              
              {/* Banner de Cabecera Odontólogo */}
              <div className="bg-gradient-to-r from-dentist-700 via-dentist-600 to-sky-700 rounded-3xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white text-dentist-700 font-black text-2xl flex items-center justify-center shadow-md">
                    CR
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold mb-1">
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Sillón Odontológico 1 • Turno Activo</span>
                    </div>
                    <h1 className="text-2xl font-black text-white">
                      Dr. Carlos Ruiz Morales
                    </h1>
                    <p className="text-xs text-sky-100">
                      Odontología General & Rehabilitación Estética • Registro: COL-OD-45920
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard/historias"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-dentist-700 hover:bg-sky-50 font-bold text-xs shadow-sm transition"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Abrir Odontograma FDI</span>
                  </Link>
                  <Link
                    href="/dashboard/pacientes"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Fichas Clínicas</span>
                  </Link>
                </div>
              </div>

              {/* Métricas del Dr. Carlos Ruiz */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Citas Asignadas Hoy
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">{CITAS_DOCTOR_RUIZ.length}</span>
                    <span className="text-xs text-slate-500 font-medium">pacientes</span>
                  </div>
                  <span className="text-[11px] text-dentist-600 font-semibold block mt-2">
                    8:00 AM - 4:30 PM
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    En Sala de Espera
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-amber-600">
                      {CITAS_DOCTOR_RUIZ.filter(c => c.estado === 'en_espera').length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">pacientes listos</span>
                  </div>
                  <span className="text-[11px] text-amber-700 font-bold block mt-2">
                    Próximo: Carlos Mendoza (Endodoncia)
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Pacientes Atendidos
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-600">
                      {CITAS_DOCTOR_RUIZ.filter(c => c.estado === 'completada').length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">completados</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold block mt-2">
                    Evoluciones registradas al día
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Tiempo Promedio / Cita
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-dentist-700">38</span>
                    <span className="text-xs text-slate-500 font-medium">minutos</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-2">
                    Ritmo de atención óptimo (+5m margen)
                  </span>
                </div>
              </div>

              {/* Paciente en Atención y Próximo Paciente */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Paciente Actual en Sillón 1 */}
                <div className="lg:col-span-1 bg-gradient-to-b from-white to-sky-50/40 rounded-2xl border-2 border-dentist-300 p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-dentist-100">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-dentist-100 text-dentist-800">
                        <span className="w-2 h-2 rounded-full bg-dentist-600 animate-ping" />
                        Paciente en Sillón (Actual)
                      </span>
                      <span className="text-xs font-black text-slate-800">10:15 AM</span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 leading-tight">
                          Jorge Andrés Ramírez
                        </h3>
                        <span className="text-xs text-slate-500 font-medium">
                          42 años • C.C. 79.845.123 • HC-2026-118
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                        <span className="font-bold text-slate-700 block">Procedimiento en curso:</span>
                        <p className="text-dentist-700 font-semibold">Resina Fotocurada en diente 2.4 oclusal</p>
                      </div>

                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                        <span className="font-bold text-amber-800 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Alerta Médica:
                        </span>
                        <p className="text-amber-900 mt-0.5">Hipertensión arterial controlada (Toma Losartán 50mg).</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Link
                      href="/dashboard/historias"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-dentist-600 hover:bg-dentist-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      <Activity className="w-4 h-4" />
                      <span>Registrar Hallazgo en Odontograma</span>
                    </Link>
                    <Link
                      href="/dashboard/pacientes"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Ver Historial de Atenciones</span>
                    </Link>
                  </div>
                </div>

                {/* Lista Completa del Sillón del Dr. Carlos Ruiz */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Agenda del Sillón 1 para Hoy
                      </h2>
                      <p className="text-xs text-slate-500">
                        Lista cronológica de pacientes asignados a tu cuidado.
                      </p>
                    </div>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
                      Dr. Carlos Ruiz
                    </span>
                  </div>

                  <div className="space-y-3">
                    {CITAS_DOCTOR_RUIZ.map((c) => (
                      <div 
                        key={c.id} 
                        className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          c.estado === 'en_atencion' 
                            ? 'bg-sky-50/70 border-dentist-300 shadow-2xs' 
                            : c.estado === 'en_espera'
                            ? 'bg-amber-50/50 border-amber-200'
                            : 'bg-slate-50/60 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-center font-bold text-xs w-16 shrink-0 pt-0.5">
                            <span className="text-slate-900 block">{c.hora}</span>
                            <span className="text-[10px] text-slate-500 font-medium">Sillón 1</span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900">{c.paciente}</h4>
                              <span className="text-xs text-slate-400">({c.edad} años)</span>
                              {c.alertaMedica && (
                                <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> {c.alertaMedica}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-700 font-medium">{c.motivo}</p>
                            <p className="text-[11px] text-slate-500 italic">{c.notasPrevias}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {c.estado === 'completada' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completada
                            </span>
                          )}
                          {c.estado === 'en_atencion' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-dentist-100 text-dentist-800 flex items-center gap-1">
                              <Activity className="w-3.5 h-3.5" /> En Sillón
                            </span>
                          )}
                          {c.estado === 'en_espera' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> En Sala
                            </span>
                          )}
                          {c.estado === 'pendiente' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
                              Por llegar
                            </span>
                          )}

                          <Link
                            href="/dashboard/historias"
                            className="p-1.5 text-slate-500 hover:text-dentist-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition"
                            title="Ver Historia y Odontograma"
                          >
                            <Activity className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* VISTA 3: ADMINISTRADORA (DRA. PATRICIA GÓMEZ) */}
          {/* ================================================================= */}
          {rolActivo === 'admin' && (
            <div className="space-y-6">
              
              {/* Banner de Dirección Administrativa */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-dentist-900 rounded-3xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 text-white font-black text-2xl flex items-center justify-center border border-white/20">
                    YB
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold mb-1">
                      <Award className="w-3.5 h-3.5 text-amber-300" />
                      <span>Dirección General de la Clínica</span>
                    </div>
                    <h1 className="text-2xl font-black text-white">
                      Dra. Yasmín Blanco
                    </h1>
                    <p className="text-xs text-slate-300">
                      Métricas Consolidadas de Facturación, Rendimiento y Capacidad Hospitalaria
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard/reportes"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dentist-600 hover:bg-dentist-700 text-white font-bold text-xs shadow-sm transition"
                  >
                    <BarChart2 className="w-4 h-4" />
                    <span>Reporte Financiero Completo</span>
                  </Link>
                  <Link
                    href="/dashboard/personal"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Gestión de Personal</span>
                  </Link>
                </div>
              </div>

              {/* 4 MÉTRICAS GLOBALES CLÍNICAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Ingresos del Mes */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Ingresos del Mes</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">$18,450,000</span>
                    <span className="text-xs text-slate-500 font-bold">COP</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-bold pt-3 border-t border-slate-100">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+14.2% vs mes anterior</span>
                  </div>
                </div>

                {/* 2. Ocupación de Sillones */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Ocupación de Sillones</span>
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-dentist-600 flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-dentist-700">88%</span>
                    <span className="text-xs text-slate-500 font-medium">promedio general</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100">
                    <span>Sillón 1: 92%</span>
                    <span>Sillón 2: 85%</span>
                    <span>Sillón 3: 78%</span>
                  </div>
                </div>

                {/* 3. Citas Totales del Mes */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Citas del Mes</span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">142</span>
                    <span className="text-xs text-slate-500 font-medium">consultas</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100">
                    <span className="text-emerald-600 font-bold">94.5% asistencia</span>
                    <span>5.5% cancelaciones</span>
                  </div>
                </div>

                {/* 4. Pacientes Nuevos */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Pacientes Nuevos</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-purple-700">+38</span>
                    <span className="text-xs text-slate-500 font-medium">este mes</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-purple-700 font-semibold pt-3 border-t border-slate-100">
                    <Smile className="w-3.5 h-3.5" />
                    <span>72% referidos por recomendación</span>
                  </div>
                </div>

              </div>

              {/* TABLA DE RENDIMIENTO DEL EQUIPO MÉDICO */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>Rendimiento del Equipo Médico y Especialistas</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Seguimiento mensual de productividad, satisfacción de pacientes y facturación por profesional.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/personal"
                    className="text-xs font-bold text-dentist-600 hover:text-dentist-700 inline-flex items-center gap-1"
                  >
                    <span>Administrar profesionales</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Doctor Especialista</th>
                        <th className="py-3 px-4">Especialidad Principal</th>
                        <th className="py-3 px-4 text-center">Citas Atendidas</th>
                        <th className="py-3 px-4 text-center">Satisfacción</th>
                        <th className="py-3 px-4 text-center">Ocupación Sillón</th>
                        <th className="py-3 px-4 text-right">Facturación Estimada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {RENDIMIENTO_DOCTORES.map((doc) => (
                        <tr key={doc.nombre} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-dentist-100 text-dentist-700 font-bold text-xs flex items-center justify-center">
                                {doc.nombre.slice(4, 6)}
                              </div>
                              <span>{doc.nombre}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{doc.especialidad}</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-800">
                            {doc.citasAtendidas}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs">
                              ⭐ {doc.satisfaccion}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-2">
                              <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-dentist-600 h-2 rounded-full" 
                                  style={{ width: `${doc.tasaOcupacion}%` }} 
                                />
                              </div>
                              <span className="font-bold text-slate-700 text-xs">{doc.tasaOcupacion}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                            {doc.ingresosGenerados}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MONITOREO DE SILLONES Y ALERTAS DE INSUMOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Monitoreo de Sillones */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-dentist-600" />
                      <span>Estado de Sillones Odontológicos en Vivo</span>
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      3 Sillones Activos
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl border border-blue-200 bg-sky-50/50 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">Sillón 1 (Dr. Carlos Ruiz)</span>
                        <span className="text-slate-600 text-[11px]">En Atención: Profilaxis profunda (25 min transcurridos)</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        Ocupado
                      </span>
                    </div>

                    <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/30 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">Sillón 2 (Dra. Laura Vega)</span>
                        <span className="text-slate-600 text-[11px]">En Atención: Ajuste de Brackets (15 min transcurridos)</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        Ocupado
                      </span>
                    </div>

                    <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">Sillón 3 (Dra. Sofía Ramírez)</span>
                        <span className="text-slate-600 text-[11px]">Esterilización y Desinfección completa lista</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Disponible
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alertas de Inventario Crítico */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Insumos y Stock Crítico</span>
                    </h3>
                    <span className="text-xs font-semibold text-slate-500">Farmacia Dental</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block">Anestésico Lidocaína al 2%</span>
                        <span className="text-slate-500 text-[11px]">Stock: 48 carpules restantes</span>
                      </div>
                      <span className="text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10px]">
                        Nivel Óptimo (92%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block">Resinas Fotocuradas A2 / A3</span>
                        <span className="text-slate-500 text-[11px]">Stock: 14 jeringas</span>
                      </div>
                      <span className="text-blue-700 font-bold bg-blue-100 px-2.5 py-0.5 rounded-full text-[10px]">
                        Normal (85%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                      <div>
                        <span className="font-bold text-amber-900 block">Brackets Cerámicos Estéticos</span>
                        <span className="text-amber-800 text-[11px]">Stock: 2 kits restantes (requiere pedido)</span>
                      </div>
                      <span className="text-amber-800 font-bold bg-amber-200 px-2.5 py-0.5 rounded-full text-[10px]">
                        Reposición Sugerida
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>
      </div>

    </div>
  );
}
