'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  Users, 
  CalendarCheck, 
  Activity, 
  BarChart3, 
  PieChart, 
  Clock, 
  Download, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Award
} from 'lucide-react';

export default function ReportesEstadisticasPage() {
  const [periodo, setPeriodo] = useState<'mes' | 'trimestre' | 'ano'>('mes');
  const [mensajeExportar, setMensajeExportar] = useState<string | null>(null);

  // Datos financieros simulados para las barras de ingresos
  const DATOS_INGRESOS = [
    { mes: 'Mayo', proyectado: 14500000, real: 13800000 },
    { mes: 'Junio', proyectado: 16000000, real: 15400000 },
    { mes: 'Julio', proyectado: 15200000, real: 14900000 },
    { mes: 'Agosto', proyectado: 17800000, real: 17200000 },
    { mes: 'Septiembre', proyectado: 19000000, real: 18400000 },
    { mes: 'Octubre (Actual)', proyectado: 21500000, real: 19800000 },
  ];

  // Tratamientos más demandados
  const TRATAMIENTOS_TOP = [
    { nombre: 'Profilaxis y Limpieza Profunda', cantidad: 64, porcentaje: 35, ingresos: '$5.760.000', color: 'bg-dentist-500' },
    { nombre: 'Control de Ortodoncia', cantidad: 48, porcentaje: 26, ingresos: '$3.360.000', color: 'bg-indigo-500' },
    { nombre: 'Resina Fotocurada Estética', cantidad: 38, porcentaje: 20, ingresos: '$3.230.000', color: 'bg-sky-400' },
    { nombre: 'Blanqueamiento Dental LED', cantidad: 22, porcentaje: 12, ingresos: '$7.700.000', color: 'bg-emerald-500' },
    { nombre: 'Endodoncia Unirradicular', cantidad: 12, porcentaje: 7, ingresos: '$3.360.000', color: 'bg-purple-500' },
  ];

  // Rendimiento por Especialista
  const DOCTORES_METRICAS = [
    {
      nombre: 'Dr. Carlos Ruiz',
      especialidad: 'Odontología General y Estética',
      pacientesAtendidos: 78,
      horasSillon: 62,
      duracionPromedio: '42 min',
      tasaPuntualidad: '98%',
      ingresosGenerados: '$13.850.000',
    },
    {
      nombre: 'Dra. Laura Vega',
      especialidad: 'Ortodoncia y Ortopedia',
      pacientesAtendidos: 64,
      horasSillon: 38,
      duracionPromedio: '34 min',
      tasaPuntualidad: '96%',
      ingresosGenerados: '$9.550.000',
    },
  ];

  const handleExportar = () => {
    setMensajeExportar('Generando y descargando informe ejecutivo en formato PDF...');
    setTimeout(() => setMensajeExportar(null), 4000);
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
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Reportes Financieros y Estadísticas Clínicas
                </h1>
                <span className="text-[11px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                  Analítica Ejecutiva
                </span>
              </div>
              <p className="text-xs text-slate-500">Métricas de facturación, demanda de servicios y productividad</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Selector de Período */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setPeriodo('mes')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  periodo === 'mes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Este Mes
              </button>
              <button
                onClick={() => setPeriodo('trimestre')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  periodo === 'trimestre' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Trimestre
              </button>
              <button
                onClick={() => setPeriodo('ano')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  periodo === 'ano' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Año 2026
              </button>
            </div>

            <button
              onClick={handleExportar}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Informe</span>
            </button>
          </div>
        </div>
      </header>

      {/* Alerta de Notificación */}
      {mensajeExportar && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{mensajeExportar}</span>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* KPI CARDS FINANCIEROS Y OPERATIVOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ingresos Proyectados</span>
              <div className="p-2 rounded-xl bg-sky-50 text-dentist-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">$21.500.000</p>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.2% respecto al mes anterior</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ingresos Recaudados</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">$19.800.000</p>
            <div className="mt-2 text-[11px] text-slate-500 font-medium">
              <span>92.1% del total proyectado cobrado</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tasa de Asistencia</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">96.8%</p>
            <div className="mt-2 text-[11px] text-emerald-600 font-semibold">
              <span>Solo 3.2% cancelaciones o inasistencias</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ticket Promedio</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">$165.000</p>
            <div className="mt-2 text-[11px] text-slate-500 font-medium">
              <span>Por cada paciente atendido</span>
            </div>
          </div>
        </div>

        {/* SECCIÓN 1: GRÁFICA COMPARATIVA DE INGRESOS (PROYECTADO VS RECAUDADO) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-dentist-600" />
                <span>Evolución Mensual de Ingresos (Últimos 6 Meses)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparativa entre facturación proyectada según agenda y recaudación real.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-dentist-500" />
                <span className="text-slate-600 font-medium">Proyectado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-slate-600 font-medium">Recaudado Real</span>
              </div>
            </div>
          </div>

          {/* Gráfico de Barras con Tailwind */}
          <div className="space-y-4 pt-2">
            {DATOS_INGRESOS.map((item, index) => {
              const maximo = 23000000;
              const anchoProyectado = Math.round((item.proyectado / maximo) * 100);
              const anchoReal = Math.round((item.real / maximo) * 100);

              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 w-28">{item.mes}</span>
                    <div className="flex items-center gap-4 text-[11px]">
                      <span className="text-dentist-700 font-medium">Proy: ${(item.proyectado / 1000000).toFixed(1)}M</span>
                      <span className="text-emerald-700 font-bold">Real: ${(item.real / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {/* Barra Proyectado */}
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-dentist-500 h-2.5 rounded-full transition-all duration-700" 
                        style={{ width: `${anchoProyectado}%` }}
                      />
                    </div>
                    {/* Barra Real */}
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-700" 
                        style={{ width: `${anchoReal}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECCIÓN 2: TRATAMIENTOS MÁS DEMANDADOS Y ASISTENCIA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Columna Izquierda: Tratamientos más solicitados (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-dentist-600" />
                  <span>Tratamientos Más Solicitados</span>
                </h3>
                <p className="text-xs text-slate-500">Distribución de procedimientos realizados este mes</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">184 Procedimientos Totales</span>
            </div>

            <div className="space-y-4">
              {TRATAMIENTOS_TOP.map((trat, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{trat.nombre}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">{trat.cantidad} citas ({trat.porcentaje}%)</span>
                      <span className="font-bold text-slate-900">{trat.ingresos}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`${trat.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${trat.porcentaje * 2.5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Tasa de Asistencia y Efectividad de Recordatorios (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-base text-slate-900">Efectividad de Asistencia</h3>
                <p className="text-xs text-slate-500">Impacto directo del envío de recordatorios por WhatsApp</p>
              </div>

              {/* Anillo de asistencia */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-around mb-4">
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-emerald-600 block">96.8%</span>
                  <span className="text-xs font-semibold text-slate-600">Pacientes Asistieron</span>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-rose-500 block">3.2%</span>
                  <span className="text-xs font-semibold text-slate-600">Cancelaron / Ausentes</span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <span className="font-medium text-emerald-900">Confirmadas por WhatsApp:</span>
                  <span className="font-bold text-emerald-800">142 citas (89%)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50/60 border border-sky-100">
                  <span className="font-medium text-sky-900">Reagendadas con anticipación:</span>
                  <span className="font-bold text-sky-800">14 citas (9%)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
                  <span className="font-medium text-rose-900">Inasistencias sin previo aviso:</span>
                  <span className="font-bold text-rose-800">5 citas (2%)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 mt-4">
              La automatización de recordatorios ahorró aproximadamente <strong>18 horas de llamadas telefónicas</strong> a recepción este mes.
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: PRODUCTIVIDAD Y DURACIÓN POR ODONTÓLOGO */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-dentist-600" />
                <span>Rendimiento y Productividad del Personal Clínico</span>
              </h3>
              <p className="text-xs text-slate-500">Métricas de ocupación, puntualidad y facturación por doctor</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOCTORES_METRICAS.map((doc, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{doc.nombre}</h4>
                    <span className="text-xs text-slate-500">{doc.especialidad}</span>
                  </div>
                  <span className="text-xs font-bold bg-white text-dentist-700 px-2.5 py-1 rounded-xl border border-slate-200">
                    {doc.duracionPromedio} / consulta
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Atendidos</span>
                    <span className="font-bold text-slate-800 text-sm">{doc.pacientesAtendidos}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Horas Sillón</span>
                    <span className="font-bold text-slate-800 text-sm">{doc.horasSillon}h</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Puntualidad</span>
                    <span className="font-bold text-emerald-600 text-sm">{doc.tasaPuntualidad}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <span className="text-slate-500 font-medium">Ingresos generados:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{doc.ingresosGenerados}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
