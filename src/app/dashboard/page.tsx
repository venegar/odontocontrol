'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Home, 
  BarChart2, 
  Send, 
  Calendar as CalendarIcon, 
  Grid, 
  Info, 
  LogOut, 
  Search, 
  Bell, 
  Sparkles, 
  Edit3, 
  Plus, 
  MoreHorizontal, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  User,
  Activity,
  ShieldCheck,
  Stethoscope,
  Smile,
  Pill,
  Coffee,
  Check
} from 'lucide-react';

export default function DashboardDarkMedCarePage() {
  const [diaSeleccionado, setDiaSeleccionado] = useState(13); // Martes 13
  const [periodoFiltro, setPeriodoFiltro] = useState('Hoy');

  // Agenda del día con viñetas de colores como en el diseño
  const agendaTimeline = [
    { hora: '08:30 am', color: 'bg-pink-500', titulo: 'Profilaxis Profunda con María Camila Pérez' },
    { hora: '10:00 am', color: 'bg-indigo-400', titulo: 'Restauración Estética con Roberto Morales' },
    { hora: '11:30 am', color: 'bg-emerald-400', titulo: 'Control de Ortodoncia con Jorge Ramírez' },
    { hora: '02:00 pm', color: 'bg-sky-400', titulo: 'Valoración y Odontograma con Elena Vargas' },
    { hora: '03:45 pm', color: 'bg-amber-400', titulo: 'Revisión y Ajuste con Andrés Gómez' },
    { hora: '05:00 pm', color: 'bg-purple-400', titulo: 'Consulta de Endodoncia con Claudia Silva' },
  ];

  return (
    <div className="min-h-screen bg-[#0e101c] text-white p-2 sm:p-5 flex items-center justify-center font-sans antialiased">
      {/* Contenedor Principal con Borde Suave Redondeado */}
      <div className="w-full max-w-[1520px] bg-[#141628] rounded-[36px] border border-[#232742] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[920px]">
        
        {/* ========================================================================= */}
        {/* 1. BARRA LATERAL AZUL ELÉCTRICO (DOCK DE NAVEGACIÓN) */}
        {/* ========================================================================= */}
        <aside className="w-full lg:w-24 bg-[#2b4bf2] flex lg:flex-col items-center justify-between py-6 px-4 shrink-0 shadow-lg">
          {/* Logo */}
          <Link href="/" className="text-center group" title="Ir al Inicio">
            <span className="block font-black text-xl tracking-tight leading-none text-white">Dent</span>
            <span className="block font-medium text-xs tracking-wider text-blue-200">care</span>
          </Link>

          {/* Menú de Iconos Centrales */}
          <nav className="flex lg:flex-col items-center gap-4 sm:gap-6 my-auto">
            {/* Dashboard / Home (Activo con fondo blanco redondeado) */}
            <Link 
              href="/dashboard" 
              className="w-12 h-12 rounded-2xl bg-white text-[#2b4bf2] flex items-center justify-center shadow-md transition-all hover:scale-105"
              title="Dashboard Clínico"
            >
              <Home className="w-5 h-5" />
            </Link>

            {/* Reportes y Estadísticas */}
            <Link 
              href="/dashboard/reportes" 
              className="w-12 h-12 rounded-2xl text-blue-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
              title="Reportes e Ingresos"
            >
              <BarChart2 className="w-5 h-5" />
            </Link>

            {/* Recordatorios WhatsApp (con badge de notificación naranja) */}
            <Link 
              href="/dashboard/recordatorios" 
              className="w-12 h-12 rounded-2xl text-blue-200 hover:text-white hover:bg-white/10 flex items-center justify-center relative transition-all"
              title="Recordatorios Automáticos"
            >
              <Send className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#f95738] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                1
              </span>
            </Link>

            {/* Agenda y Citas */}
            <Link 
              href="/dashboard/citas" 
              className="w-12 h-12 rounded-2xl text-blue-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
              title="Agenda y Citas"
            >
              <CalendarIcon className="w-5 h-5" />
            </Link>

            {/* Módulos y Pacientes */}
            <Link 
              href="/dashboard/pacientes" 
              className="w-12 h-12 rounded-2xl text-blue-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
              title="Fichas de Pacientes"
            >
              <Grid className="w-5 h-5" />
            </Link>

            {/* Historias Clínicas y Odontograma */}
            <Link 
              href="/dashboard/historias" 
              className="w-12 h-12 rounded-2xl text-blue-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
              title="Historias y Odontograma"
            >
              <Stethoscope className="w-5 h-5" />
            </Link>

            {/* Control de Permisos */}
            <Link 
              href="/dashboard/personal" 
              className="w-12 h-12 rounded-2xl text-blue-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
              title="Personal y Permisos"
            >
              <ShieldCheck className="w-5 h-5" />
            </Link>
          </nav>

          {/* Salir / Volver a la Web */}
          <Link 
            href="/" 
            className="w-12 h-12 rounded-2xl text-blue-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
            title="Volver a la Web Pública"
          >
            <LogOut className="w-5 h-5" />
          </Link>
        </aside>

        {/* ========================================================================= */}
        {/* 2. COLUMNA CENTRAL (BUSCADOR, HERO BANNER, MÉTRICAS Y GRÁFICAS) */}
        {/* ========================================================================= */}
        <section className="flex-1 p-5 sm:p-7 flex flex-col justify-between space-y-6 overflow-y-auto">
          
          {/* BARRA SUPERIOR DE BÚSQUEDA Y BOTONES */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Buscar citas, pacientes, procedimientos..."
                className="w-full bg-[#1c1f38] text-xs text-slate-200 placeholder-slate-400 pl-11 pr-4 py-3 rounded-2xl border border-[#2c3053]/50 focus:outline-none focus:border-[#2b4bf2] transition"
              />
            </div>

            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard/recordatorios"
                className="w-11 h-11 rounded-2xl bg-[#1c1f38] border border-[#2c3053]/50 text-slate-300 hover:text-white flex items-center justify-center transition relative"
                title="Notificaciones"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-blue-500 absolute top-3 right-3" />
              </Link>
              
              <Link
                href="/dashboard/reportes"
                className="w-11 h-11 rounded-2xl bg-[#1c1f38] border border-[#2c3053]/50 text-slate-300 hover:text-white flex items-center justify-center transition"
                title="Analítica Avanzada"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
              </Link>
            </div>
          </div>

          {/* BANNER HERO AZUL REY CON SALUDO Y PERSONAJE */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#2848ee] via-[#3355fb] to-[#3a5dff] p-6 sm:p-8 overflow-hidden shadow-xl min-h-[190px] flex items-center justify-between">
            {/* Elementos flotantes decorativos de odontología */}
            <div className="absolute top-4 left-44 w-7 h-7 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white/70">
              <Pill className="w-4 h-4" />
            </div>
            <div className="absolute bottom-5 left-80 w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white/70">
              <Smile className="w-4 h-4" />
            </div>
            <div className="absolute top-6 right-80 w-7 h-7 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white/70">
              <Coffee className="w-4 h-4" />
            </div>

            <div className="relative z-10 space-y-2 max-w-md">
              <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-semibold text-white/90">
                <Clock className="w-3.5 h-3.5" />
                <span>Oct 13, 2026 • 02:15 pm</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                ¡Buen día, Dr. Carlos Ruiz!
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 font-medium">
                ¡Que tengas una excelente jornada de atención en el consultorio!
              </p>
            </div>

            {/* Ilustración Médica Representativa en el Hero */}
            <div className="hidden md:flex items-end justify-center h-full self-end relative z-10 shrink-0">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <div className="w-36 h-36 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-inner">
                  <div className="w-28 h-28 rounded-full bg-[#1c1f38] flex flex-col items-center justify-center text-center p-2 border border-blue-300/40">
                    <Stethoscope className="w-10 h-10 text-blue-400 mb-1" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Odontólogo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FILA DE 3 TARJETAS DE TRABAJO (PRESENCIAL, TELEODONTOLOGÍA, LABORATORIO) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Tarjeta 1: Trabajo Presencial */}
            <div className="bg-[#1a1d35] rounded-3xl p-5 border border-[#282c4d]/60 relative shadow-sm hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
                <span className="font-bold tracking-wider uppercase text-[10px] text-slate-400">Atención en Clínica</span>
                <button className="text-slate-500 hover:text-white"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">27</span>
                <span className="text-xs text-slate-400 font-medium leading-tight">pacientes atendidos</span>
              </div>
              
              {/* Mini Gráfica Ondulada en Rojo/Rosa */}
              <div className="mt-3 flex items-center justify-between">
                <svg className="w-24 h-7 text-rose-500 stroke-current fill-none stroke-[2.5]" viewBox="0 0 100 30">
                  <path d="M0,15 Q25,28 50,15 T100,20" />
                </svg>
                <span className="text-[10px] font-semibold text-rose-400">-4% que el promedio</span>
              </div>
            </div>

            {/* Tarjeta 2: Consultas Online / Solicitudes */}
            <div className="bg-[#1a1d35] rounded-3xl p-5 border border-[#282c4d]/60 relative shadow-sm hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
                <span className="font-bold tracking-wider uppercase text-[10px] text-slate-400">Solicitudes Web</span>
                <button className="text-slate-500 hover:text-white"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">9</span>
                <span className="text-xs text-slate-400 font-medium leading-tight">solicitudes agendadas</span>
              </div>
              
              {/* Mini Gráfica Ondulada en Verde Esmeralda */}
              <div className="mt-3 flex items-center justify-between">
                <svg className="w-24 h-7 text-emerald-400 stroke-current fill-none stroke-[2.5]" viewBox="0 0 100 30">
                  <path d="M0,25 Q30,5 60,20 T100,8" />
                </svg>
                <span className="text-[10px] font-semibold text-emerald-400">+12% que el promedio</span>
              </div>
            </div>

            {/* Tarjeta 3: Laboratorio Dental y Prótesis */}
            <div className="bg-[#1a1d35] rounded-3xl p-5 border border-[#282c4d]/60 relative shadow-sm hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
                <span className="font-bold tracking-wider uppercase text-[10px] text-slate-400">Laboratorio Dental</span>
                <button className="text-slate-500 hover:text-white"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">19</span>
                <span className="text-xs text-slate-400 font-medium leading-tight">prótesis & modelos</span>
              </div>
              
              {/* Barra de progreso azul */}
              <div className="mt-4 flex items-center justify-between">
                <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-500 h-1.5 rounded-full w-[65%]" />
                </div>
                <span className="text-[10px] font-semibold text-blue-400">+5% en entrega</span>
              </div>
            </div>
          </div>

          {/* FILA INFERIOR: GRÁFICO CIRCULAR DE OCUPACIÓN Y PLANES DEL DÍA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Gráfico Donut de Ocupación de Agenda */}
            <div className="bg-[#1a1d35] rounded-3xl p-6 border border-[#282c4d]/60 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Ocupación de Agenda
                </h3>
                <span className="text-[11px] font-semibold bg-[#262947] text-blue-400 px-3 py-1 rounded-xl">
                  Hoy
                </span>
              </div>

              <div className="flex items-center justify-around py-2">
                {/* Anillo de Donut Gradiente */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Círculo base */}
                    <circle cx="50" cy="50" r="40" stroke="#252945" strokeWidth="10" fill="transparent" />
                    {/* Círculo de porcentaje degradado */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      stroke="url(#gradientDonut)" 
                      strokeWidth="10" 
                      fill="transparent" 
                      strokeDasharray="251.2" 
                      strokeDashoffset="12.5" 
                      strokeLinecap="round" 
                    />
                    <defs>
                      <linearGradient id="gradientDonut" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white leading-none">95%</span>
                    <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase mt-0.5">Ocupación</span>
                  </div>
                </div>

                {/* Leyenda de la Ocupación */}
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-xl font-bold text-white block">12</span>
                    <span className="text-slate-400 text-[11px]">Consultas clínicas</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-white block">4</span>
                    <span className="text-slate-400 text-[11px]">Profilaxis profundas</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-white block">2</span>
                    <span className="text-slate-400 text-[11px]">Cirugías y endodoncias</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progreso de Planes y Objetivos */}
            <div className="bg-[#1a1d35] rounded-3xl p-6 border border-[#282c4d]/60 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Objetivos Cumplidos
                </h3>
                <span className="text-[11px] font-semibold bg-[#262947] text-blue-400 px-3 py-1 rounded-xl">
                  Hoy
                </span>
              </div>

              <div className="space-y-4 my-auto">
                {/* Barra 1: Consultas */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Consultas Finalizadas</span>
                    <span className="text-slate-300">64%</span>
                  </div>
                  <div className="w-full bg-[#252945] rounded-full h-2 overflow-hidden">
                    <div className="bg-[#7c4dff] h-2 rounded-full w-[64%]" />
                  </div>
                </div>

                {/* Barra 2: Tratamientos */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Tratamientos en Curso</span>
                    <span className="text-slate-300">50%</span>
                  </div>
                  <div className="w-full bg-[#252945] rounded-full h-2 overflow-hidden">
                    <div className="bg-[#ff6e6c] h-2 rounded-full w-[50%]" />
                  </div>
                </div>

                {/* Barra 3: Citas Confirmadas */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Recordatorios WhatsApp Enviados</span>
                    <span className="text-slate-300">85%</span>
                  </div>
                  <div className="w-full bg-[#252945] rounded-full h-2 overflow-hidden">
                    <div className="bg-[#f06292] h-2 rounded-full w-[85%]" />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-center">
                <Link
                  href="/dashboard/citas"
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agendar nueva cita o plan</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. COLUMNA DERECHA (PERFIL DEL DOCTOR Y MINI CALENDARIO CON TIMELINE) */}
        {/* ========================================================================= */}
        <aside className="w-full lg:w-[380px] bg-[#141628] border-t lg:border-t-0 lg:border-l border-[#232742] p-5 sm:p-6 flex flex-col space-y-6 shrink-0">
          
          {/* TARJETA: MI PERFIL */}
          <div className="bg-[#1a1d35] rounded-3xl p-6 border border-[#282c4d]/60 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#282c4d]/40">
              <span className="text-[11px] font-bold tracking-wider uppercase text-blue-400">
                Mi Perfil
              </span>
              <button className="w-7 h-7 rounded-lg bg-[#2b4bf2] text-white flex items-center justify-center hover:bg-blue-600 transition">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Avatar y Datos del Doctor */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 shadow-md">
                <div className="w-full h-full rounded-full bg-[#1c1f38] flex items-center justify-center text-white font-black text-xl">
                  CR
                </div>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white leading-tight">
                  Dr. Carlos Ruiz
                </h3>
                <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase block mt-0.5">
                  Odontólogo General & Estética
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  📍 Bogotá, Colombia
                </span>
              </div>
            </div>

            {/* Fila de Datos Demográficos del Doctor */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#282c4d]/40 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Nacimiento</span>
                <span className="font-bold text-white text-xs mt-0.5 block">17.07.86</span>
              </div>
              <div className="border-x border-[#282c4d]/40">
                <span className="text-[10px] text-slate-400 block">Sangre</span>
                <span className="font-bold text-white text-xs mt-0.5 block">O(+) Rh+</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Horario</span>
                <span className="font-bold text-white text-xs mt-0.5 block">8am - 6pm</span>
              </div>
            </div>
          </div>

          {/* TARJETA: MI CALENDARIO SEMANAL Y TIMELINE DE CITAS */}
          <div className="bg-[#1a1d35] rounded-3xl p-6 border border-[#282c4d]/60 flex-1 flex flex-col justify-between space-y-5">
            <div>
              {/* Encabezado Calendario */}
              <div className="flex items-center justify-between pb-3 border-b border-[#282c4d]/40 mb-4">
                <span className="text-[11px] font-bold tracking-wider uppercase text-blue-400">
                  Mi Calendario
                </span>
                <button className="text-xs font-bold bg-[#262947] text-blue-300 px-3 py-1 rounded-xl hover:bg-slate-700 transition">
                  Octubre ▾
                </button>
              </div>

              {/* Tira Semanal de Días */}
              <div className="grid grid-cols-7 gap-1 text-center mb-6">
                {[
                  { diaNom: 'Dom', num: 11 },
                  { diaNom: 'Lun', num: 12 },
                  { diaNom: 'Mar', num: 13 },
                  { diaNom: 'Mié', num: 14 },
                  { diaNom: 'Jue', num: 15 },
                  { diaNom: 'Vie', num: 16 },
                  { diaNom: 'Sáb', num: 17 },
                ].map((item) => {
                  const esActivo = diaSeleccionado === item.num;
                  return (
                    <button
                      key={item.num}
                      type="button"
                      onClick={() => setDiaSeleccionado(item.num)}
                      className={`flex flex-col items-center py-2 rounded-2xl transition ${
                        esActivo
                          ? 'bg-[#2b4bf2] text-white shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-[10px] font-medium">{item.diaNom}</span>
                      <span className="text-xs font-bold mt-1">{item.num}</span>
                    </button>
                  );
                })}
              </div>

              {/* Encabezado del Día */}
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">
                <span>Octubre 13 (Hoy)</span>
                <button className="text-slate-500 hover:text-white"><MoreHorizontal className="w-4 h-4" /></button>
              </div>

              {/* Timeline de Citas con Viñetas de Colores */}
              <div className="space-y-3.5">
                {agendaTimeline.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs group">
                    <span className="text-slate-400 font-semibold w-16 shrink-0 mt-0.5">
                      {item.hora}
                    </span>
                    <div className="flex items-start gap-2.5 flex-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color} mt-1 shrink-0 ring-4 ring-[#1a1d35]`} />
                      <span className="text-slate-200 group-hover:text-white leading-snug">
                        {item.titulo}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón Inferior para ir a la Agenda Completa */}
            <div className="pt-4 border-t border-[#282c4d]/40">
              <Link
                href="/dashboard/citas"
                className="w-full py-2.5 rounded-2xl bg-[#262947] hover:bg-[#303459] text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <span>Abrir Agenda Completa</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
