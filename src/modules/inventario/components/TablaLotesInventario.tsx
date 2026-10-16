'use client';

import React from 'react';
import { 
  LoteConInsumo, 
  ColorSemaforo, 
  EstadoLote 
} from '../types';
import { formatearFechaCorta } from '../utils';
import InsigniaSemaforo from './InsigniaSemaforo';
import { 
  Search, 
  Filter, 
  Calendar, 
  Plus, 
  FlaskConical, 
  Package, 
  AlertTriangle, 
  Layers, 
  ArrowUpDown, 
  RotateCcw 
} from 'lucide-react';

interface Props {
  lotes: LoteConInsumo[];
  busqueda: string;
  setBusqueda: (v: string) => void;
  filtroColor: ColorSemaforo | 'todos';
  setFiltroColor: (v: ColorSemaforo | 'todos') => void;
  filtroEstado: EstadoLote | 'todos';
  setFiltroEstado: (v: EstadoLote | 'todos') => void;
  fechaDesde: string;
  setFechaDesde: (v: string) => void;
  fechaHasta: string;
  setFechaHasta: (v: string) => void;
  alLimpiarFiltros: () => void;
  alAbrirNuevoLote: (insumoId?: string) => void;
  alAbrirDescuento: (insumoId?: string) => void;
}

export default function TablaLotesInventario({
  lotes,
  busqueda,
  setBusqueda,
  filtroColor,
  setFiltroColor,
  filtroEstado,
  setFiltroEstado,
  fechaDesde,
  setFechaDesde,
  fechaHasta,
  setFechaHasta,
  alLimpiarFiltros,
  alAbrirNuevoLote,
  alAbrirDescuento,
}: Props) {
  const formatearEstadoBadge = (estado: EstadoLote) => {
    switch (estado) {
      case 'ACTIVO':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ACTIVO
          </span>
        );
      case 'VENCIDO':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            VENCIDO
          </span>
        );
      case 'AGOTADO':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            AGOTADO
          </span>
        );
    }
  };

  const hayFiltrosActivos =
    busqueda !== '' ||
    filtroColor !== 'todos' ||
    filtroEstado !== 'todos' ||
    fechaDesde !== '' ||
    fechaHasta !== '';

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Buscador de texto */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por insumo, marca, lote o INVIMA..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>

          {/* Filtro por Semáforo */}
          <div className="md:col-span-3">
            <select
              value={filtroColor}
              onChange={(e) => setFiltroColor(e.target.value as ColorSemaforo | 'todos')}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="todos">Todos los semáforos</option>
              <option value="rojo">🔴 Rojo (≤ 30 días o Vencido)</option>
              <option value="amarillo">🟡 Amarillo (31 a 90 días)</option>
              <option value="verde">🟢 Verde (&gt; 90 días)</option>
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="md:col-span-2">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoLote | 'todos')}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="VENCIDO">VENCIDO</option>
              <option value="AGOTADO">AGOTADO</option>
            </select>
          </div>

          {/* Botón limpiar */}
          <div className="md:col-span-2 flex items-center justify-end">
            {hayFiltrosActivos && (
              <button
                onClick={alLimpiarFiltros}
                className="w-full px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer</span>
              </button>
            )}
          </div>
        </div>

        {/* Rango de fechas de vencimiento */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <span className="font-semibold flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            Rango de Vencimiento:
          </span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Desde:</span>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Hasta:</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="ml-auto text-[11px] text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-teal-600" />
            <span>Orden FEFO activo (vencimiento más cercano arriba)</span>
          </div>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {lotes.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700 text-sm">No se encontraron lotes</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              No hay insumos o lotes que coincidan con los criterios y filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Insumo Odontológico</th>
                  <th className="py-3 px-3">Marca / Fabricante</th>
                  <th className="py-3 px-3">Presentación</th>
                  <th className="py-3 px-3">Registro INVIMA</th>
                  <th className="py-3 px-3">Lote</th>
                  <th className="py-3 px-3 text-center">Stock</th>
                  <th className="py-3 px-3">F. Ingreso</th>
                  <th className="py-3 px-3">F. Vencimiento</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-3 text-center">Semáforo</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {lotes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    {/* Insumo */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{item.insumo.nombre}</div>
                    </td>

                    {/* Marca */}
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {item.insumo.marca}
                    </td>

                    {/* Presentación */}
                    <td className="py-3 px-3 text-slate-500">
                      {item.insumo.presentacion_comercial}
                    </td>

                    {/* INVIMA */}
                    <td className="py-3 px-3 font-mono text-[11px] text-teal-800">
                      <span className="bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                        {item.insumo.registro_invima}
                      </span>
                    </td>

                    {/* Lote */}
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {item.numero_lote}
                      </span>
                    </td>

                    {/* Stock disponible */}
                    <td className="py-3 px-3 text-center">
                      <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                        item.cantidad_disponible === 0
                          ? 'bg-slate-100 text-slate-400'
                          : item.cantidad_disponible <= 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {item.cantidad_disponible}
                      </span>
                    </td>

                    {/* Fecha de Ingreso */}
                    <td className="py-3 px-3 text-slate-500">
                      {formatearFechaCorta(item.fecha_ingreso)}
                    </td>

                    {/* Fecha de Vencimiento */}
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {formatearFechaCorta(item.fecha_vencimiento)}
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-3 text-center">
                      {formatearEstadoBadge(item.estado)}
                    </td>

                    {/* Semáforo */}
                    <td className="py-3 px-3 text-center">
                      <InsigniaSemaforo semaforo={item.semaforo} />
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => alAbrirNuevoLote(item.insumo_id)}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                          title="Añadir nuevo lote a este insumo"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => alAbrirDescuento(item.insumo_id)}
                          disabled={item.estado !== 'ACTIVO' || item.cantidad_disponible === 0}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition"
                          title="Descontar consumo por FEFO"
                        >
                          <FlaskConical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
