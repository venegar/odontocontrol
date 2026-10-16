'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  FlaskConical, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Layers, 
  TrendingDown, 
  Calendar, 
  User, 
  FileText 
} from 'lucide-react';
import { Insumo, LoteConInsumo } from '../types';
import { descontarInsumosProcedimientoFEFO } from '../actions';
import { formatearFechaCorta } from '../utils';
import InsigniaSemaforo from './InsigniaSemaforo';

interface Props {
  abierto: boolean;
  insumos: Insumo[];
  lotes: LoteConInsumo[];
  citaIdPredefinida?: string;
  pacienteNombrePredefinido?: string;
  procedimientoPredefinido?: string;
  alCerrar: () => void;
  alCompletar: () => void;
}

export default function ModalDescuentoProcedimiento({
  abierto,
  insumos,
  lotes,
  citaIdPredefinida,
  pacienteNombrePredefinido,
  procedimientoPredefinido,
  alCerrar,
  alCompletar,
}: Props) {
  const [insumoId, setInsumoId] = useState<string>(insumos[0]?.id || '');
  const [cantidad, setCantidad] = useState<number>(1);
  const [procedimiento, setProcedimiento] = useState<string>(
    procedimientoPredefinido || 'Restauración / Obturación Resina'
  );
  const [paciente, setPaciente] = useState<string>(pacienteNombrePredefinido || '');
  const [cargando, setCargando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [exitoEnvio, setExitoEnvio] = useState<{ mensaje: string; detalles?: string[] } | null>(null);

  // Filtrar lotes activos no vencidos para el insumo seleccionado ordenados por FEFO
  const hoyStr = new Date().toISOString().split('T')[0];
  const lotesActivosInsumo = useMemo(() => {
    return lotes
      .filter(
        (l) =>
          l.insumo_id === insumoId &&
          l.estado === 'ACTIVO' &&
          l.fecha_vencimiento >= hoyStr &&
          l.cantidad_disponible > 0
      )
      .sort((a, b) => new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime());
  }, [lotes, insumoId, hoyStr]);

  const stockTotalActivo = useMemo(() => {
    return lotesActivosInsumo.reduce((acc, l) => acc + l.cantidad_disponible, 0);
  }, [lotesActivosInsumo]);

  // Previsualización de los lotes que se afectarán por FEFO
  const previsionFEFO = useMemo(() => {
    if (cantidad <= 0 || stockTotalActivo < cantidad) return [];
    let remanente = cantidad;
    const resultado: Array<{ lote: LoteConInsumo; descontar: number }> = [];

    for (const lote of lotesActivosInsumo) {
      if (remanente <= 0) break;
      const tomar = Math.min(lote.cantidad_disponible, remanente);
      resultado.push({ lote, descontar: tomar });
      remanente -= tomar;
    }
    return resultado;
  }, [cantidad, stockTotalActivo, lotesActivosInsumo]);

  if (!abierto) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorEnvio(null);
    setExitoEnvio(null);

    if (!insumoId) {
      setErrorEnvio('Seleccione un insumo del catálogo.');
      return;
    }

    if (cantidad <= 0) {
      setErrorEnvio('La cantidad a descontar debe ser mayor a 0.');
      return;
    }

    if (cantidad > stockTotalActivo) {
      setErrorEnvio(`Stock insuficiente: se requieren ${cantidad} uds y solo hay ${stockTotalActivo} uds disponibles en lotes activos.`);
      return;
    }

    setCargando(true);
    try {
      const res = await descontarInsumosProcedimientoFEFO([
        {
          insumo_id: insumoId,
          cantidad,
          procedimiento_id: procedimiento,
          cita_id: citaIdPredefinida,
        },
      ]);

      if (res.exito) {
        setExitoEnvio({ mensaje: res.mensaje, detalles: res.detalles });
        setTimeout(() => {
          alCompletar();
          alCerrar();
        }, 1500);
      } else {
        setErrorEnvio(res.mensaje);
      }
    } catch {
      setErrorEnvio('Ocurrió un error inesperado al procesar el descuento transaccional.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Descontar Insumos por Procedimiento</h3>
              <p className="text-xs text-slate-500">Asignación automática y trazabilidad por algoritmo FEFO</p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificaciones */}
        {errorEnvio && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorEnvio}</span>
          </div>
        )}

        {exitoEnvio && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{exitoEnvio.mensaje}</span>
            </div>
            {exitoEnvio.detalles && (
              <ul className="pl-6 list-disc space-y-0.5 text-[11px] text-emerald-700">
                {exitoEnvio.detalles.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Insumo Utilizado *
            </label>
            <select
              value={insumoId}
              onChange={(e) => setInsumoId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {insumos.map((ins) => (
                <option key={ins.id} value={ins.id}>
                  {ins.nombre} ({ins.marca}) - {ins.presentacion_comercial}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cantidad a Usar *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">unidades</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stock Total Activo
              </label>
              <div className={`px-3 py-2 text-sm rounded-xl border flex items-center justify-between font-semibold ${
                stockTotalActivo === 0
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : stockTotalActivo < cantidad
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                <span>{stockTotalActivo} uds disponibles</span>
                {stockTotalActivo >= cantidad ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Procedimiento Clínico
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={procedimiento}
                  onChange={(e) => setProcedimiento(e.target.value)}
                  placeholder="Ej. Limpieza, Resina, Cirugía"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Paciente (Opcional)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={paciente}
                  onChange={(e) => setPaciente(e.target.value)}
                  placeholder="Nombre del paciente"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Caja explicativa de asignación FEFO */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-teal-600" />
                Asignación FEFO (Próximo a Vencer Primero)
              </span>
              <span className="text-slate-400 font-normal lowercase">{lotesActivosInsumo.length} lotes aptos</span>
            </div>

            {previsionFEFO.length === 0 ? (
              <p className="text-xs text-rose-600 italic">
                {stockTotalActivo === 0 
                  ? 'No hay lotes activos con existencia para este insumo.' 
                  : 'La cantidad solicitada supera las existencias disponibles.'}
              </p>
            ) : (
              <div className="space-y-1.5">
                {previsionFEFO.map(({ lote, descontar }) => (
                  <div
                    key={lote.id}
                    className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-slate-800">
                        Lote: {lote.numero_lote}
                      </div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                        <span>Vence: {formatearFechaCorta(lote.fecha_vencimiento)}</span>
                        <span>Stock lote: {lote.cantidad_disponible}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <InsigniaSemaforo semaforo={lote.semaforo} />
                      <div className="px-2 py-1 bg-teal-50 border border-teal-200 text-teal-800 font-bold rounded-md">
                        - {descontar} uds
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={alCerrar}
              disabled={cargando}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando || cantidad > stockTotalActivo || cantidad <= 0}
              className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-sm transition flex items-center gap-2"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Descontando por FEFO...
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4" />
                  Confirmar Descuento FEFO
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
