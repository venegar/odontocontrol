'use client';

import React, { useEffect, useState } from 'react';
import { X, Stethoscope, AlertTriangle, RefreshCw } from 'lucide-react';
import { Paciente } from '@/modules/pacientes/types';
import { EvolucionClinica, EstadoDiente } from '../types';
import FormularioRegistroDiagnosticoCita from './FormularioRegistroDiagnosticoCita';

interface ModalRegistroEvolucionCitaProps {
  abierto: boolean;
  alCerrar: () => void;
  paciente: Paciente;
  pacientesDisponibles?: Paciente[];
  citaIdInicial?: string;
  onCambiarPaciente?: (pacienteId: string) => void;
  onGuardarExito: (evolucion: EvolucionClinica, nuevoEstadoDiente?: EstadoDiente, dienteNumero?: number) => void;
}

// Error Boundary local para el formulario modal
class ModalFormErrorBoundary extends React.Component<
  { children: React.ReactNode; alCerrar: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; alCerrar: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error dentro de ModalRegistroEvolucionCita:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">
            No se pudo cargar el formulario de evolución clínica
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {this.state.error?.message || 'Ocurrió un error inesperado al renderizar el formulario.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-dentist-600 hover:bg-dentist-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reintentar</span>
            </button>
            <button
              type="button"
              onClick={this.props.alCerrar}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ModalRegistroEvolucionCita({
  abierto,
  alCerrar,
  paciente,
  pacientesDisponibles,
  citaIdInicial,
  onCambiarPaciente,
  onGuardarExito,
}: ModalRegistroEvolucionCitaProps) {
  // Manejo de tecla Escape para cerrar el modal
  useEffect(() => {
    if (!abierto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        alCerrar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [abierto, alCerrar]);

  if (!abierto) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        // Cerrar si se hace clic fuera del diálogo principal
        if (e.target === e.currentTarget) {
          alCerrar();
        }
      }}
    >
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* CABECERA SUPERIOR DEL MODAL */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-dentist-600 text-white rounded-2xl shadow-xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                Registrar Evolución de Cita y Diagnóstico
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Diligenciamiento de notas clínicas, odontograma, insumos utilizados y receta médica
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={alCerrar}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
            title="Cerrar formulario (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CUERPO DEL FORMULARIO CON SCROLL SUAVE */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 bg-slate-50/30">
          <ModalFormErrorBoundary alCerrar={alCerrar}>
            <FormularioRegistroDiagnosticoCita
              paciente={paciente}
              pacientesDisponibles={pacientesDisponibles}
              citaIdInicial={citaIdInicial}
              onCambiarPaciente={onCambiarPaciente}
              onGuardarExito={(evolucion, nuevoEstadoDiente, dienteNumero) => {
                onGuardarExito(evolucion, nuevoEstadoDiente, dienteNumero);
                alCerrar();
              }}
              onCancelar={alCerrar}
            />
          </ModalFormErrorBoundary>
        </div>

      </div>
    </div>
  );
}
