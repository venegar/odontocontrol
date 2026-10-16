'use client';

import React, { useState } from 'react';
import { 
  AlertOctagon, 
  RefreshCw, 
  FileEdit, 
  Calendar, 
  Trash2, 
  Building2, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Loader2, 
  ArrowRightLeft 
} from 'lucide-react';
import { InsumoVencido, DestinoInsumoVencido } from '../types';
import { formatearFechaCorta } from '../utils';
import { destinoVencidoSchema, DestinoVencidoFormData } from '../validations';
import { registrarDestinoInsumoVencido, procesarVencimientosDiarios } from '../actions';

interface Props {
  vencidos: InsumoVencido[];
  alActualizar: () => void;
}

export default function SeccionInsumosVencidos({ vencidos, alActualizar }: Props) {
  const [itemSeleccionado, setItemSeleccionado] = useState<InsumoVencido | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ejecutandoAuditoria, setEjecutandoAuditoria] = useState(false);
  const [mensajeAuditoria, setMensajeAuditoria] = useState<string | null>(null);

  // Estado del formulario de destino
  const [formDestino, setFormDestino] = useState<DestinoVencidoFormData>({
    destino: 'DEVOLUCION_PROVEEDOR',
    fecha_retiro: new Date().toISOString().split('T')[0],
    observaciones: '',
  });
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});
  const [guardandoDestino, setGuardandoDestino] = useState(false);

  const abrirModalDestino = (item: InsumoVencido) => {
    setItemSeleccionado(item);
    setFormDestino({
      destino: item.destino || 'DEVOLUCION_PROVEEDOR',
      fecha_retiro: item.fecha_retiro || new Date().toISOString().split('T')[0],
      observaciones: item.observaciones || '',
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const handleGuardarDestino = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemSeleccionado) return;

    const validacion = destinoVencidoSchema.safeParse(formDestino);
    if (!validacion.success) {
      const mapa: Record<string, string> = {};
      validacion.error.errors.forEach((err) => {
        if (err.path[0]) mapa[err.path[0] as string] = err.message;
      });
      setErroresForm(mapa);
      return;
    }

    setGuardandoDestino(true);
    try {
      const res = await registrarDestinoInsumoVencido(itemSeleccionado.id, validacion.data);
      if (res.exito) {
        setModalAbierto(false);
        alActualizar();
      }
    } finally {
      setGuardandoDestino(false);
    }
  };

  const handleEjecutarAuditoria = async () => {
    setEjecutandoAuditoria(true);
    setMensajeAuditoria(null);
    try {
      const resultado = await procesarVencimientosDiarios();
      setMensajeAuditoria(resultado.mensaje);
      alActualizar();
    } finally {
      setEjecutandoAuditoria(false);
    }
  };

  const formatearDestinoBadge = (destino: DestinoInsumoVencido | null) => {
    if (!destino) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Pendiente por clasificar
        </span>
      );
    }
    switch (destino) {
      case 'DEVOLUCION_PROVEEDOR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ArrowRightLeft className="w-3 h-3" />
            Devolución a Proveedor
          </span>
        );
      case 'DISPOSICION_FINAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Trash2 className="w-3 h-3" />
            Disposición Final (Residuos)
          </span>
        );
      case 'OTRO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Otro Destino
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra superior de control */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Historial y Disposición de Insumos Vencidos</h3>
            <p className="text-xs text-slate-500">
              Control de cuarentena y disposición final sin eliminación física de registros (Nunca se hace DELETE)
            </p>
          </div>
        </div>

        <button
          onClick={handleEjecutarAuditoria}
          disabled={ejecutandoAuditoria}
          className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition flex items-center justify-center gap-2 self-start sm:self-auto disabled:opacity-50"
          title="Ejecuta la verificación diaria de lotes que hayan superado la fecha de vencimiento"
        >
          {ejecutandoAuditoria ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>Ejecutar Auditoría de Vencimientos</span>
        </button>
      </div>

      {mensajeAuditoria && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{mensajeAuditoria}</span>
        </div>
      )}

      {/* Tabla de Insumos Vencidos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {vencidos.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldAlert className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700 text-sm">Sin insumos vencidos en cuarentena</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Todos los lotes del consultorio se encuentran activos o han completado su rotación de manera óptima.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Insumo y Laboratorio</th>
                  <th className="py-3 px-3">Lote</th>
                  <th className="py-3 px-3 text-center">Cant. Vencida</th>
                  <th className="py-3 px-3">Fecha Vencimiento</th>
                  <th className="py-3 px-3">Fecha Retiro</th>
                  <th className="py-3 px-4">Destino Formal</th>
                  <th className="py-3 px-4">Observaciones</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {vencidos.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{item.insumo_nombre}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Marca: {item.insumo_marca}</span>
                        {item.registro_invima && (
                          <span className="text-teal-700 font-mono text-[10px] bg-teal-50 px-1.5 py-0.5 rounded">
                            {item.registro_invima}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {item.numero_lote}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                        {item.cantidad} uds
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {formatearFechaCorta(item.fecha_vencimiento)}
                    </td>

                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {formatearFechaCorta(item.fecha_retiro)}
                    </td>

                    <td className="py-3 px-4">
                      {formatearDestinoBadge(item.destino)}
                    </td>

                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={item.observaciones || ''}>
                      {item.observaciones || <span className="italic text-slate-300">Sin notas</span>}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => abrirModalDestino(item)}
                        className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition inline-flex items-center gap-1"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>{item.destino ? 'Editar Destino' : 'Registrar Destino'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para Registrar / Actualizar Destino */}
      {modalAbierto && itemSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Registrar Destino de Insumo Vencido</h3>
                  <p className="text-xs text-slate-500">Trazabilidad sanitaria de disposición final</p>
                </div>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarDestino} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-800">{itemSeleccionado.insumo_nombre}</div>
                <div className="text-slate-600 flex justify-between">
                  <span>Lote: <strong className="font-mono">{itemSeleccionado.numero_lote}</strong></span>
                  <span>Cantidad: <strong className="text-rose-600">{itemSeleccionado.cantidad} unidades</strong></span>
                </div>
                <div className="text-slate-500">
                  Fecha de Vencimiento: {formatearFechaCorta(itemSeleccionado.fecha_vencimiento)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destino o Procedimiento de Disposición *
                </label>
                <select
                  value={formDestino.destino}
                  onChange={(e) => setFormDestino({ ...formDestino, destino: e.target.value as DestinoInsumoVencido })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="DEVOLUCION_PROVEEDOR">DEVOLUCION_PROVEEDOR (Devolución a proveedor por garantía o recambio)</option>
                  <option value="DISPOSICION_FINAL">DISPOSICION_FINAL (Entrega a gestor de residuos hospitalarios / incineración)</option>
                  <option value="OTRO">OTRO (Baja por daño, merma o cuarentena especial)</option>
                </select>
                {erroresForm.destino && <p className="text-xs text-rose-600 mt-1">{erroresForm.destino}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha Formal de Retiro *
                </label>
                <input
                  type="date"
                  value={formDestino.fecha_retiro}
                  onChange={(e) => setFormDestino({ ...formDestino, fecha_retiro: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {erroresForm.fecha_retiro && (
                  <p className="text-xs text-rose-600 mt-1">{erroresForm.fecha_retiro}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observaciones y Acta de Disposición
                </label>
                <textarea
                  rows={3}
                  value={formDestino.observaciones || ''}
                  onChange={(e) => setFormDestino({ ...formDestino, observaciones: e.target.value })}
                  placeholder="Detalles del manifiesto de entrega, número de acta de baja o asesor comercial receptor..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {erroresForm.observaciones && (
                  <p className="text-xs text-rose-600 mt-1">{erroresForm.observaciones}</p>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  disabled={guardandoDestino}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoDestino}
                  className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl shadow-sm transition flex items-center gap-2"
                >
                  {guardandoDestino ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Destino'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
