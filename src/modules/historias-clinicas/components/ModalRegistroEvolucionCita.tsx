'use client';

import React from 'react';
import { X, Stethoscope, User, Calendar, AlertCircle } from 'lucide-react';
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
  onRegistrarNuevoPaciente?: () => void;
  onGuardarExito: (evolucion: EvolucionClinica, nuevoEstadoDiente?: EstadoDiente, dienteNumero?: number) => void;
}

export default function ModalRegistroEvolucionCita({
  abierto,
  alCerrar,
  paciente,
  pacientesDisponibles,
  citaIdInicial,
  onCambiarPaciente,
  onRegistrarNuevoPaciente,
  onGuardarExito,
}: ModalRegistroEvolucionCitaProps) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        
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
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition"
            title="Cerrar formulario (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CUERPO DEL FORMULARIO CON SCROLL SUAVE */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 bg-slate-50/30">
          <FormularioRegistroDiagnosticoCita
            paciente={paciente}
            pacientesDisponibles={pacientesDisponibles}
            citaIdInicial={citaIdInicial}
            onCambiarPaciente={onCambiarPaciente}
            onRegistrarNuevoPaciente={onRegistrarNuevoPaciente}
            onGuardarExito={(evolucion, nuevoEstadoDiente, dienteNumero) => {
              onGuardarExito(evolucion, nuevoEstadoDiente, dienteNumero);
              alCerrar();
            }}
            onCancelar={alCerrar}
          />
        </div>

      </div>
    </div>
  );
}
