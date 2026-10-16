'use client';

import React, { useState } from 'react';
import { X, Plus, Package, Calendar, Hash, FileText, Building2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { insumoConLoteInicialSchema, InsumoConLoteInicialFormData } from '../validations';
import { crearInsumoConLoteInicial } from '../actions';

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  alGuardarExitoso: () => void;
}

export default function ModalFormularioInsumo({ abierto, alCerrar, alGuardarExitoso }: Props) {
  const hoyStr = new Date().toISOString().split('T')[0];
  const unAnioStr = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState<InsumoConLoteInicialFormData>({
    nombre: '',
    marca: '',
    presentacion_comercial: '',
    registro_invima: '',
    numero_lote: '',
    cantidad_inicial: 10,
    fecha_ingreso: hoyStr,
    fecha_vencimiento: unAnioStr,
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

    // Validación con Zod
    const validacion = insumoConLoteInicialSchema.safeParse(formData);
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
      const resultado = await crearInsumoConLoteInicial(validacion.data);
      if (resultado.exito) {
        setMensajeServidor({ tipo: 'exito', texto: resultado.mensaje });
        setTimeout(() => {
          alGuardarExitoso();
          alCerrar();
        }, 1200);
      } else {
        setMensajeServidor({ tipo: 'error', texto: resultado.mensaje });
      }
    } catch {
      setMensajeServidor({ tipo: 'error', texto: 'Ocurrió un error inesperado al guardar el insumo.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-dentist-50 text-dentist-600 rounded-xl">
              <Package className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Registrar Nuevo Insumo Odontológico</h3>
              <p className="text-xs text-slate-500">Alta de producto y lote inicial para control FEFO</p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensaje de respuesta */}
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              Datos del Catálogo e INVIMA
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre del Insumo / Medicamento *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Anestésico Mepivacaína 3% sin vasoconstrictor"
                className={`w-full px-3 py-2 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
                  errores.nombre ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {errores.nombre && <p className="text-xs text-rose-600 mt-1">{errores.nombre}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Marca o Laboratorio *
                </label>
                <input
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  placeholder="Ej. New Stetic, 3M, Septodont"
                  className={`w-full px-3 py-2 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
                    errores.marca ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
                {errores.marca && <p className="text-xs text-rose-600 mt-1">{errores.marca}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Presentación Comercial *
                </label>
                <input
                  type="text"
                  name="presentacion_comercial"
                  value={formData.presentacion_comercial}
                  onChange={handleChange}
                  placeholder="Ej. Caja x 50 cárpules, Jeringa 4g"
                  className={`w-full px-3 py-2 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
                    errores.presentacion_comercial ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
                {errores.presentacion_comercial && (
                  <p className="text-xs text-rose-600 mt-1">{errores.presentacion_comercial}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registro Sanitario INVIMA *
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  name="registro_invima"
                  value={formData.registro_invima}
                  onChange={handleChange}
                  placeholder="Ej. INVIMA 2021M-0019482"
                  className={`w-full pl-9 pr-3 py-2 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
                    errores.registro_invima ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
              </div>
              {errores.registro_invima && (
                <p className="text-xs text-rose-600 mt-1">{errores.registro_invima}</p>
              )}
            </div>
          </div>

          <div className="bg-teal-50/40 p-4 rounded-xl border border-teal-100 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-teal-600" />
              Lote Inicial y Vencimiento (Estrategia FEFO)
            </h4>

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
                  placeholder="Ej. LOT-2026-X12"
                  className={`w-full px-3 py-2 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
                    errores.numero_lote ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
                {errores.numero_lote && (
                  <p className="text-xs text-rose-600 mt-1">{errores.numero_lote}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cantidad Inicial *
                </label>
                <input
                  type="number"
                  name="cantidad_inicial"
                  min="1"
                  step="1"
                  value={formData.cantidad_inicial}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
                    errores.cantidad_inicial ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
                {errores.cantidad_inicial && (
                  <p className="text-xs text-rose-600 mt-1">{errores.cantidad_inicial}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de Ingreso *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    name="fecha_ingreso"
                    value={formData.fecha_ingreso}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de Vencimiento *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    name="fecha_vencimiento"
                    value={formData.fecha_vencimiento}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errores.fecha_vencimiento ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errores.fecha_vencimiento && (
                  <p className="text-xs text-rose-600 mt-1">{errores.fecha_vencimiento}</p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
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
                  Guardar Insumo y Lote
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
