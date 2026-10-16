'use client';

import React, { useState } from 'react';
import { 
  EstadoDiente, 
  DienteInfo, 
  ESTADOS_DIENTE_CONFIG 
} from '../types';
import { Sparkles, Info, Check, X } from 'lucide-react';

interface OdontogramaProps {
  dientes: Record<number, DienteInfo>;
  onActualizarDiente: (numero: number, nuevoEstado: EstadoDiente, notas?: string) => void;
}

export default function OdontogramaVisual({ dientes, onActualizarDiente }: OdontogramaProps) {
  const [dienteSeleccionado, setDienteSeleccionado] = useState<number | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [estadoTemp, setEstadoTemp] = useState<EstadoDiente>('sano');
  const [notasTemp, setNotasTemp] = useState<string>('');

  // Cuadrantes del sistema FDI (Adulto)
  const cuadrante1 = [18, 17, 16, 15, 14, 13, 12, 11]; // Sup. Derecho
  const cuadrante2 = [21, 22, 23, 24, 25, 26, 27, 28]; // Sup. Izquierdo
  const cuadrante4 = [48, 47, 46, 45, 44, 43, 42, 41]; // Inf. Derecho
  const cuadrante3 = [31, 32, 33, 34, 35, 36, 37, 38]; // Inf. Izquierdo

  const handleSeleccionarDiente = (num: number) => {
    const diente = dientes[num];
    setDienteSeleccionado(num);
    setEstadoTemp(diente?.estado || 'sano');
    setNotasTemp(diente?.notas || '');
    setModalAbierto(true);
  };

  const handleGuardarCambios = (e: React.FormEvent) => {
    e.preventDefault();
    if (dienteSeleccionado !== null) {
      onActualizarDiente(dienteSeleccionado, estadoTemp, notasTemp);
      setModalAbierto(false);
    }
  };

  // Renderizar un diente individual
  const renderDiente = (num: number) => {
    const diente = dientes[num] || { numero: num, estado: 'sano', nombre: `Pieza ${num}` };
    const config = ESTADOS_DIENTE_CONFIG[diente.estado];

    return (
      <button
        type="button"
        key={num}
        onClick={() => handleSeleccionarDiente(num)}
        className="group flex flex-col items-center p-1.5 rounded-xl hover:bg-slate-100 transition-all focus:outline-none"
        title={`Pieza ${num}: ${config.etiqueta} ${diente.notas ? `(${diente.notas})` : ''}`}
      >
        <span className="text-[11px] font-bold text-slate-700 mb-1 group-hover:text-dentist-600">
          {num}
        </span>
        
        {/* Gráfico representativo del diente (Corona dental con caras) */}
        <div className={`w-8 h-8 rounded-lg border-2 shadow-2xs flex items-center justify-center relative transition-transform group-hover:scale-105 ${config.colorBg} ${config.colorBorde}`}>
          {diente.estado === 'ausente' ? (
            <X className="w-5 h-5 text-slate-600" />
          ) : (
            <div className="w-3.5 h-3.5 rounded-sm border border-black/10 bg-black/5" />
          )}
        </div>

        {/* Indicador de estado */}
        <span className="text-[9px] mt-1 font-semibold text-slate-500 truncate max-w-[42px] text-center">
          {config.etiqueta.split(' ')[0]}
        </span>
      </button>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      
      {/* Encabezado y Leyenda de Colores */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <span>Odontograma Dental Interactivo</span>
            <span className="text-xs bg-dentist-50 text-dentist-700 px-2 py-0.5 rounded-md border border-dentist-200 font-semibold">
              Sistema FDI
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Haz clic sobre cualquier pieza dental para cambiar su condición clínica o registrar intervenciones.
          </p>
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {Object.entries(ESTADOS_DIENTE_CONFIG).map(([key, conf]) => (
            <div key={key} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px]">
              <span className={`w-2.5 h-2.5 rounded-full ${conf.colorBg} border ${conf.colorBorde}`} />
              <span className="text-slate-700 font-medium">{conf.etiqueta}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ARCADA SUPERIOR (MAXILAR) */}
      <div className="mb-8">
        <div className="text-center mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-0.5 rounded-full">
            Arcada Superior (Maxilar)
          </span>
        </div>

        <div className="flex justify-center items-center gap-4 sm:gap-8 overflow-x-auto pb-2">
          {/* Cuadrante 1: Derecho */}
          <div className="flex gap-1 border-r-2 border-slate-300 pr-3 sm:pr-6">
            {cuadrante1.map(renderDiente)}
          </div>
          {/* Cuadrante 2: Izquierdo */}
          <div className="flex gap-1 pl-1">
            {cuadrante2.map(renderDiente)}
          </div>
        </div>
      </div>

      {/* LÍNEA MEDIA DIVISORIA */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dashed border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-[10px] text-slate-400 font-semibold uppercase">
            Plano Oclusal Medio
          </span>
        </div>
      </div>

      {/* ARCADA INFERIOR (MANDÍBULA) */}
      <div className="mt-6">
        <div className="flex justify-center items-center gap-4 sm:gap-8 overflow-x-auto pb-2">
          {/* Cuadrante 4: Derecho */}
          <div className="flex gap-1 border-r-2 border-slate-300 pr-3 sm:pr-6">
            {cuadrante4.map(renderDiente)}
          </div>
          {/* Cuadrante 3: Izquierdo */}
          <div className="flex gap-1 pl-1">
            {cuadrante3.map(renderDiente)}
          </div>
        </div>

        <div className="text-center mt-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-0.5 rounded-full">
            Arcada Inferior (Mandíbula)
          </span>
        </div>
      </div>

      {/* MODAL PARA ACTUALIZAR DIENTE SELECCIONADO */}
      {modalAbierto && dienteSeleccionado !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h4 className="font-bold text-base text-slate-900">
                  Condición Clínica: Pieza {dienteSeleccionado}
                </h4>
                <p className="text-xs text-slate-500">
                  {dientes[dienteSeleccionado]?.nombre || `Diente permanente #${dienteSeleccionado}`}
                </p>
              </div>
              <button 
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarCambios} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Selecciona el Estado Odontológico:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(ESTADOS_DIENTE_CONFIG) as EstadoDiente[]).map((estadoKey) => {
                    const conf = ESTADOS_DIENTE_CONFIG[estadoKey];
                    const esSeleccionado = estadoTemp === estadoKey;

                    return (
                      <button
                        type="button"
                        key={estadoKey}
                        onClick={() => setEstadoTemp(estadoKey)}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition ${
                          esSeleccionado 
                            ? 'bg-dentist-50 border-dentist-600 text-dentist-800 shadow-2xs' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${conf.colorBg} border ${conf.colorBorde}`} />
                        <span>{conf.etiqueta}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detalles / Superficies Intervenidas (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej. Cara Oclusal, Resina compuesta en Mesial..."
                  value={notasTemp}
                  onChange={(e) => setNotasTemp(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-dentist-500"
                />
              </div>

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-dentist-600 hover:bg-dentist-700 text-white rounded-xl shadow-sm transition"
                >
                  Actualizar Pieza
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
