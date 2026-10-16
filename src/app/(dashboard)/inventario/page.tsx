'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Layers, 
  AlertOctagon, 
  TrendingDown, 
  Plus, 
  FlaskConical, 
  ArrowLeft, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  Insumo, 
  LoteConInsumo, 
  InsumoVencido, 
  ConsumoProcedimiento, 
  ColorSemaforo, 
  EstadoLote 
} from '@/modules/inventario/types';
import { 
  obtenerInsumos, 
  obtenerLotesConInsumos, 
  obtenerInsumosVencidos, 
  obtenerHistorialConsumos 
} from '@/modules/inventario/actions';
import { formatearFechaCorta } from '@/modules/inventario/utils';
import TablaLotesInventario from '@/modules/inventario/components/TablaLotesInventario';
import SeccionInsumosVencidos from '@/modules/inventario/components/SeccionInsumosVencidos';
import ModalFormularioInsumo from '@/modules/inventario/components/ModalFormularioInsumo';
import ModalFormularioLote from '@/modules/inventario/components/ModalFormularioLote';
import ModalDescuentoProcedimiento from '@/modules/inventario/components/ModalDescuentoProcedimiento';

export default function ModuloInventarioPage() {
  const [pestanaActiva, setPestanaActiva] = useState<'lotes' | 'vencidos' | 'consumos'>('lotes');
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Datos
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [lotes, setLotes] = useState<LoteConInsumo[]>([]);
  const [vencidos, setVencidos] = useState<InsumoVencido[]>([]);
  const [consumos, setConsumos] = useState<ConsumoProcedimiento[]>([]);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroColor, setFiltroColor] = useState<ColorSemaforo | 'todos'>('todos');
  const [filtroEstado, setFiltroEstado] = useState<EstadoLote | 'todos'>('todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Modales
  const [modalInsumoAbierto, setModalInsumoAbierto] = useState(false);
  const [modalLoteAbierto, setModalLoteAbierto] = useState(false);
  const [insumoParaNuevoLote, setInsumoParaNuevoLote] = useState<string | undefined>();
  const [modalDescuentoAbierto, setModalDescuentoAbierto] = useState(false);
  const [insumoParaDescuento, setInsumoParaDescuento] = useState<string | undefined>();

  // Cargar datos exclusivamente desde Supabase
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const [listaInsumos, listaLotes, listaVencidos, listaConsumos] = await Promise.all([
        obtenerInsumos(),
        obtenerLotesConInsumos({
          busqueda,
          colorSemaforo: filtroColor,
          estado: filtroEstado,
          fechaVencimientoDesde: fechaDesde || undefined,
          fechaVencimientoHasta: fechaHasta || undefined,
        }),
        obtenerInsumosVencidos(),
        obtenerHistorialConsumos(),
      ]);

      setInsumos(listaInsumos);
      setLotes(listaLotes);
      setVencidos(listaVencidos);
      setConsumos(listaConsumos);
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : 'Error al conectar con la base de datos de inventario';
      setErrorCarga(mensaje);
    } finally {
      setCargando(false);
    }
  }, [busqueda, filtroColor, filtroEstado, fechaDesde, fechaHasta]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleLimpiarFiltros = () => {
    setBusqueda('');
    setFiltroColor('todos');
    setFiltroEstado('todos');
    setFechaDesde('');
    setFechaHasta('');
  };

  const handleAbrirNuevoLote = (insumoId?: string) => {
    setInsumoParaNuevoLote(insumoId);
    setModalLoteAbierto(true);
  };

  const handleAbrirDescuento = (insumoId?: string) => {
    setInsumoParaDescuento(insumoId);
    setModalDescuentoAbierto(true);
  };

  // KPIs de semaforización clínica
  const totalLotesActivos = lotes.filter((l) => l.estado === 'ACTIVO').length;
  const lotesRojos = lotes.filter((l) => l.estado === 'ACTIVO' && l.semaforo?.color === 'rojo').length;
  const lotesAmarillos = lotes.filter((l) => l.estado === 'ACTIVO' && l.semaforo?.color === 'amarillo').length;
  const lotesVerdes = lotes.filter((l) => l.estado === 'ACTIVO' && l.semaforo?.color === 'verde').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Barra de navegación superior */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition flex items-center gap-2"
              title="Volver al panel principal"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-semibold hidden sm:inline">Panel Principal</span>
            </Link>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Inventario Odontológico y FEFO
                </h1>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Semaforización clínica (30/90 días), zona horaria Colombia y trazabilidad
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => cargarDatos()}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-teal-600' : ''}`} />
            </button>
            <button
              onClick={() => handleAbrirDescuento()}
              className="px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <FlaskConical className="w-4 h-4" />
              <span className="hidden sm:inline">Descontar FEFO</span>
            </button>
            <button
              onClick={() => setModalInsumoAbierto(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Insumo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6 flex-1">
        {/* Banner de error visible si falla Supabase o RLS (Sin fallback en memoria) */}
        {errorCarga && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Error de conexión o permisos de inventario:</p>
              <p className="mt-0.5 text-rose-700">{errorCarga}</p>
              <p className="mt-1 text-[11px] text-rose-500">
                Verifique que su usuario tenga asignado el permiso individual &apos;inventario&apos; en la administración del consultorio.
              </p>
            </div>
          </div>
        )}

        {/* Tarjetas de Métricas KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Insumos Catálogo</p>
              <h3 className="text-xl font-black text-slate-800">{insumos.length}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Lotes Activos</p>
              <h3 className="text-xl font-black text-teal-700">{totalLotesActivos}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-sm flex items-center gap-3 bg-gradient-to-br from-rose-50/40 to-white">
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">🔴 ≤ 30 Días / Crítico</p>
              <h3 className="text-xl font-black text-rose-700">{lotesRojos}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-3 bg-gradient-to-br from-amber-50/40 to-white">
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">🟡 31 a 90 Días</p>
              <h3 className="text-xl font-black text-amber-700">{lotesAmarillos}</h3>
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm flex items-center gap-3 bg-gradient-to-br from-emerald-50/40 to-white">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">🟢 &gt; 90 Días / Óptimo</p>
              <h3 className="text-xl font-black text-emerald-700">{lotesVerdes}</h3>
            </div>
          </div>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
          <button
            onClick={() => setPestanaActiva('lotes')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-2 ${
              pestanaActiva === 'lotes'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Existencias y Lotes FEFO ({lotes.length})</span>
          </button>

          <button
            onClick={() => setPestanaActiva('vencidos')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-2 ${
              pestanaActiva === 'vencidos'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Insumos Vencidos ({vencidos.length})</span>
          </button>

          <button
            onClick={() => setPestanaActiva('consumos')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-2 ${
              pestanaActiva === 'consumos'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>Trazabilidad de Consumos ({consumos.length})</span>
          </button>
        </div>

        {/* Pestaña activa */}
        {pestanaActiva === 'lotes' && (
          <TablaLotesInventario
            lotes={lotes}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            filtroColor={filtroColor}
            setFiltroColor={setFiltroColor}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
            fechaDesde={fechaDesde}
            setFechaDesde={setFechaDesde}
            fechaHasta={fechaHasta}
            setFechaHasta={setFechaHasta}
            alLimpiarFiltros={handleLimpiarFiltros}
            alAbrirNuevoLote={handleAbrirNuevoLote}
            alAbrirDescuento={handleAbrirDescuento}
          />
        )}

        {pestanaActiva === 'vencidos' && (
          <SeccionInsumosVencidos vencidos={vencidos} alActualizar={cargarDatos} />
        )}

        {pestanaActiva === 'consumos' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Trazabilidad de Consumos por Procedimiento</h3>
                  <p className="text-xs text-slate-500">Registro histórico auditado de cada descuento por FEFO</p>
                </div>
              </div>
              <button
                onClick={() => handleAbrirDescuento()}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Registrar Consumo Clínico</span>
              </button>
            </div>

            {consumos.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No se han registrado consumos clínicos en el sistema.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <th className="py-3 px-4">Fecha y Hora</th>
                      <th className="py-3 px-4">Insumo Utilizado</th>
                      <th className="py-3 px-3">Lote FEFO</th>
                      <th className="py-3 px-3 text-center">Cantidad</th>
                      <th className="py-3 px-4">Procedimiento</th>
                      <th className="py-3 px-4">Responsable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {consumos.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {formatearFechaCorta(item.fecha)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {item.insumo_nombre}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                            {item.numero_lote}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                            {item.cantidad} uds
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.procedimiento_id || 'Atención Odontológica'}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {item.registrado_por || 'Personal de Turno'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modales */}
      <ModalFormularioInsumo
        abierto={modalInsumoAbierto}
        alCerrar={() => setModalInsumoAbierto(false)}
        alGuardarExitoso={cargarDatos}
      />

      <ModalFormularioLote
        abierto={modalLoteAbierto}
        insumos={insumos}
        insumoPreseleccionadoId={insumoParaNuevoLote}
        alCerrar={() => setModalLoteAbierto(false)}
        alGuardarExitoso={cargarDatos}
      />

      <ModalDescuentoProcedimiento
        abierto={modalDescuentoAbierto}
        insumos={insumos}
        lotes={lotes}
        alCerrar={() => setModalDescuentoAbierto(false)}
        alCompletar={cargarDatos}
      />
    </div>
  );
}
