'use client';

import React, { useState } from 'react';
import { X, Plus, Hash, Calendar, Layers, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Insumo, EstadoLote } from '../types';
import { loteSchema, LoteFormData } from '../validations';
import { crearNuevoLote } from '../actions';

interface Props {
  abierto: boolean;
  insumos: Insumo[];
  insumoPreseleccionadoId?: string;
  alCerrar: () => void;
  alGuardarExitoso: () => void;
}

export default function ModalFormularioLote({
  abierto,
  insumos,
  insumoPreseleccionadoId,
  alCerrar,
  alGuardarExitoso,
}: Props) {
  const hoyStr = new Date().toISOString().split('T')[0];
  const fechaDefaultVenc = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState<LoteFormData>({
    insumo_id: insumoPreseleccionadoId || (insumos[0]?.id || ''),
    numero_lote: '',
    cantidad_disponible: 10,
    fecha_ingreso: hoyStr,
    fecha_vencimiento: fechaDefaultVenc,
    estado: 'ACTIVO',
  });

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(false);
  const [mensajeServidor, setMensajeServidor] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  if (!abierto) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    }));
    if (errores[name]) {
      setErrores((prev) => {
        const nuevos = { ...prev };
        delete nuevos[name];
        return nuevos;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeServidor(null);

    const validacion = loteSchema.safeParse(formData);
    if (!validacion.success) {
      const mapaErrores: Record<string, string> = {};
      validacion.error.errors.forEach((err) => {
        if (err.path[0]) {
          mapaErrores[err.path[0] as string] = err.message;
        }
      });
      setErrores(mapaErrores);
      return;
    }

    setCargando(true);
    try {
      const resultado = await crearNuevoLote(validacion.data);
      if (resultado.exito) {
        setMensajeServidor({ tipo: 'exito', texto: resultado.mensaje });
        setTimeout(() => {
          alGuardarExitoso();
          alCerrar();
        }, 1100);
      } else {
        setMensajeServidor({ tipo: 'error', texto: resultado.mensaje });
      }
    } catch {
      setMensajeServidor({ tipo: 'error', texto: 'Error al registrar el lote.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Añadir Nuevo Lote</h3>
              <p className="text-xs text-slate-500">Reabastecimiento con control FEFO</p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {mensajeServidor && (
          <div className={`mx-6 mt-4 p-3 rounded-xl flex items-center gap-2 text-sm ${
            mensajeServidor.tipo === 'exito' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {mensajeServidor.tipo === 'exito' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{mensajeServidor.texto}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Seleccionar Insumo Odontológico *
            </label>
            <select
              name="insumo_id"
              value={formData.insumo_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errores.insumo_id ? 'border-rose-400' : 'border-slate-200'
              }`}
            >
              <option value="">-- Seleccionar producto --</option>
              {insumos.map((ins) => (
                <option key={ins.id} value={ins.id}>
                  {ins.nombre} ({ins.marca}) - {ins.presentacion_comercial}
                </option>
              ))}
            </select>
            {errores.insumo_id && <p className="text-xs text-rose-600 mt-1">{errores.insumo_id}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número de Lote *
              </label>
              <input
                type="text"
                name="numero_lote"
                value={formData.numero_lote}
                onChange={handleChange}
                placeholder="Ej. LOT-2026-X09"
                className={`w-full px-3 py-2 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errores.numero_lote ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {errores.numero_lote && <p className="text-xs text-rose-600 mt-1">{errores.numero_lote}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cantidad de Unidades *
              </label>
              <input
                type="number"
                name="cantidad_disponible"
                min="0"
                step="1"
                value={formData.cantidad_disponible}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errores.cantidad_disponible ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {errores.cantidad_disponible && (
                <p className="text-xs text-rose-600 mt-1">{errores.cantidad_disponible}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Ingreso *
              </label>
              <input
                type="date"
                name="fecha_ingreso"
                value={formData.fecha_ingreso}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Vencimiento *
              </label>
              <input
                type="date"
                name="fecha_vencimiento"
                value={formData.fecha_vencimiento}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errores.fecha_vencimiento ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {errores.fecha_vencimiento && (
                <p className="text-xs text-rose-600 mt-1">{errores.fecha_vencimiento}</p>
              )}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={alCerrar}
              disabled={cargando}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl shadow-sm transition flex items-center gap-2"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Agregar Lote
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
