'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  HeartPulse, 
  ShieldAlert, 
  PlusCircle, 
  Calendar, 
  Pill, 
  CheckCircle2, 
  Clock, 
  Stethoscope, 
  Sparkles,
  ClipboardList
} from 'lucide-react';
import OdontogramaVisual from '@/modules/historias-clinicas/components/OdontogramaVisual';
import { DienteInfo, EstadoDiente, EvolucionClinica } from '@/modules/historias-clinicas/types';

// Dientes iniciales para demostración (32 piezas dentales permanentes)
const DIENTES_INICIALES: Record<number, DienteInfo> = {
  18: { numero: 18, nombre: 'Tercer Molar Superior Derecho', estado: 'ausente', notas: 'Exodoncia previa' },
  17: { numero: 17, nombre: 'Segundo Molar Superior Derecho', estado: 'sano' },
  16: { numero: 16, nombre: 'Primer Molar Superior Derecho', estado: 'obturado', notas: 'Resina Oclusal' },
  15: { numero: 15, nombre: 'Segundo Premolar Superior Derecho', estado: 'sano' },
  14: { numero: 14, nombre: 'Primer Premolar Superior Derecho', estado: 'sano' },
  13: { numero: 13, nombre: 'Canino Superior Derecho', estado: 'sano' },
  12: { numero: 12, nombre: 'Incisivo Lateral Superior Derecho', estado: 'sano' },
  11: { numero: 11, nombre: 'Incisivo Central Superior Derecho', estado: 'sano' },

  21: { numero: 21, nombre: 'Incisivo Central Superior Izquierdo', estado: 'sano' },
  22: { numero: 22, nombre: 'Incisivo Lateral Superior Izquierdo', estado: 'sano' },
  23: { numero: 23, nombre: 'Canino Superior Izquierdo', estado: 'sano' },
  24: { numero: 24, nombre: 'Primer Premolar Superior Izquierdo', estado: 'sano' },
  25: { numero: 25, nombre: 'Segundo Premolar Superior Izquierdo', estado: 'sano' },
  26: { numero: 26, nombre: 'Primer Molar Superior Izquierdo', estado: 'caries', notas: 'Caries en surco oclusal' },
  27: { numero: 27, nombre: 'Segundo Molar Superior Izquierdo', estado: 'sano' },
  28: { numero: 28, nombre: 'Tercer Molar Superior Izquierdo', estado: 'ausente' },

  48: { numero: 48, nombre: 'Tercer Molar Inferior Derecho', estado: 'ausente' },
  47: { numero: 47, nombre: 'Segundo Molar Inferior Derecho', estado: 'sano' },
  46: { numero: 46, nombre: 'Primer Molar Inferior Derecho', estado: 'endodoncia', notas: 'Tratamiento de conducto realizado' },
  45: { numero: 45, nombre: 'Segundo Premolar Inferior Derecho', estado: 'sano' },
  44: { numero: 44, nombre: 'Primer Premolar Inferior Derecho', estado: 'sano' },
  43: { numero: 43, nombre: 'Canino Inferior Derecho', estado: 'sano' },
  42: { numero: 42, nombre: 'Incisivo Lateral Inferior Derecho', estado: 'sano' },
  41: { numero: 41, nombre: 'Incisivo Central Inferior Derecho', estado: 'sano' },

  31: { numero: 31, nombre: 'Incisivo Central Inferior Izquierdo', estado: 'sano' },
  32: { numero: 32, nombre: 'Incisivo Lateral Inferior Izquierdo', estado: 'sano' },
  33: { numero: 33, nombre: 'Canino Inferior Izquierdo', estado: 'sano' },
  34: { numero: 34, nombre: 'Primer Premolar Inferior Izquierdo', estado: 'sano' },
  35: { numero: 35, nombre: 'Segundo Premolar Inferior Izquierdo', estado: 'sano' },
  36: { numero: 36, nombre: 'Primer Molar Inferior Izquierdo', estado: 'corona', notas: 'Corona libre de metal' },
  37: { numero: 37, nombre: 'Segundo Molar Inferior Izquierdo', estado: 'sano' },
  38: { numero: 38, nombre: 'Tercer Molar Inferior Izquierdo', estado: 'sano' },
};

// Historial inicial de evoluciones
const EVOLUCIONES_INICIALES: EvolucionClinica[] = [
  {
    id: 'evo-1',
    pacienteId: 'pac-1',
    pacienteNombre: 'María Camila Pérez Gómez',
    doctorNombre: 'Dr. Carlos Ruiz Morales',
    fecha: '2026-09-15',
    motivoConsulta: 'Dolor y sensibilidad al frío en cuadrante superior izquierdo.',
    diagnostico: 'Caries de esmalte y dentina en pieza 26.',
    procedimiento: 'Apertura cavitaria conservadora, eliminación de tejido cariado y colocación de resina fotocurada oclusal.',
    piezaDental: 'Pieza 26 (Primer Molar Sup. Izquierdo)',
    prescripcion: 'Ibuprofeno 400mg cada 8 horas por 2 días si presenta dolor leve.',
    indicaciones: 'Evitar alimentos muy duros las primeras 24 horas y mantener técnica de cepillado suave.',
  },
  {
    id: 'evo-2',
    pacienteId: 'pac-1',
    pacienteNombre: 'María Camila Pérez Gómez',
    doctorNombre: 'Dr. Carlos Ruiz Morales',
    fecha: '2026-06-10',
    motivoConsulta: 'Control y limpieza general anual.',
    diagnostico: 'Gingivitis marginal inducida por placa bacteriana.',
    procedimiento: 'Profilaxis ultrasónica completa, pulido con pasta profiláctica y topicación de flúor neutro.',
    piezaDental: 'Toda la arcada',
    prescripcion: 'Enjuague bucal con clorhexidina al 0.12% por 7 días.',
    indicaciones: 'Uso diario de hilo dental por las noches.',
  },
];

const PACIENTES_LISTA = [
  { id: 'pac-1', nombre: 'María Camila Pérez Gómez', doc: 'CC 1020304050', alergias: ['Penicilina', 'Látex'], patologias: ['Hipotensión'] },
  { id: 'pac-2', nombre: 'Andrés Felipe Gómez Salcedo', doc: 'CC 79845123', alergias: [], patologias: ['Hipertensión'] },
  { id: 'pac-3', nombre: 'Lucía Torres Mendoza', doc: 'CC 52431980', alergias: ['Aspirina / AINEs'], patologias: [] },
];

export default function HistoriasClinicasPage() {
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState('pac-1');
  const [pestaña, setPestaña] = useState<'odontograma' | 'nueva-evolucion' | 'historial'>('odontograma');
  const [dientes, setDientes] = useState<Record<number, DienteInfo>>(DIENTES_INICIALES);
  const [evoluciones, setEvoluciones] = useState<EvolucionClinica[]>(EVOLUCIONES_INICIALES);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Formulario de nueva evolución
  const [formEvolucion, setFormEvolucion] = useState({
    motivo: '',
    diagnostico: '',
    procedimiento: '',
    piezaDental: '26',
    prescripcion: '',
    indicaciones: '',
  });

  const pacienteActivo = PACIENTES_LISTA.find(p => p.id === pacienteSeleccionadoId) || PACIENTES_LISTA[0];

  // Actualizar una pieza en el odontograma
  const handleActualizarDiente = (numero: number, nuevoEstado: EstadoDiente, notas?: string) => {
    setDientes(prev => ({
      ...prev,
      [numero]: {
        ...prev[numero],
        estado: nuevoEstado,
        notas: notas || prev[numero]?.notas,
      },
    }));
    setMensajeExito(`Pieza ${numero} actualizada en el odontograma a: ${nuevoEstado.toUpperCase()}`);
    setTimeout(() => setMensajeExito(null), 4000);
  };

  // Guardar nueva nota de evolución clínica
  const handleGuardarEvolucion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEvolucion.motivo || !formEvolucion.procedimiento) return;

    const nueva: EvolucionClinica = {
      id: `evo-${Date.now()}`,
      pacienteId: pacienteActivo.id,
      pacienteNombre: pacienteActivo.nombre,
      doctorNombre: 'Dr. Carlos Ruiz Morales',
      fecha: new Date().toISOString().split('T')[0],
      motivoConsulta: formEvolucion.motivo,
      diagnostico: formEvolucion.diagnostico || 'Evaluación de rutina',
      procedimiento: formEvolucion.procedimiento,
      piezaDental: formEvolucion.piezaDental ? `Pieza ${formEvolucion.piezaDental}` : 'General',
      prescripcion: formEvolucion.prescripcion,
      indicaciones: formEvolucion.indicaciones,
    };

    setEvoluciones([nueva, ...evoluciones]);
    setPestaña('historial');
    setMensajeExito('Evolución clínica registrada exitosamente en el expediente médico.');
    setFormEvolucion({
      motivo: '',
      diagnostico: '',
      procedimiento: '',
      piezaDental: '26',
      prescripcion: '',
      indicaciones: '',
    });
    setTimeout(() => setMensajeExito(null), 5000);
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
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Historias Clínicas y Odontograma
              </h1>
              <p className="text-xs text-slate-500">Módulo clínico para registro de evoluciones y tratamientos</p>
            </div>
          </div>

          {/* Selector de Paciente */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 hidden sm:inline">Paciente Activo:</span>
            <select
              value={pacienteSeleccionadoId}
              onChange={(e) => setPacienteSeleccionadoId(e.target.value)}
              className="text-xs bg-slate-100 font-bold border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-dentist-500"
            >
              {PACIENTES_LISTA.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.doc})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Alerta de Notificación */}
      {mensajeExito && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{mensajeExito}</span>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Banner de Alerta Médica del Paciente */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-dentist-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
              {pacienteActivo.nombre.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">{pacienteActivo.nombre}</h2>
              <p className="text-xs text-slate-500">{pacienteActivo.doc}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {pacienteActivo.alergias.length > 0 ? (
              pacienteActivo.alergias.map((al, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  Alérgico a: {al}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Sin alergias reportadas</span>
            )}

            {pacienteActivo.patologias.length > 0 && (
              <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-semibold">
                <HeartPulse className="w-3.5 h-3.5 text-amber-600" />
                {pacienteActivo.patologias.join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Pestañas de Navegación del Módulo Clínico */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setPestaña('odontograma')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition ${
              pestaña === 'odontograma'
                ? 'bg-dentist-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Odontograma Visual (FDI)
          </button>
          <button
            onClick={() => setPestaña('nueva-evolucion')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 ${
              pestaña === 'nueva-evolucion'
                ? 'bg-dentist-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Evolución</span>
          </button>
          <button
            onClick={() => setPestaña('historial')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition ${
              pestaña === 'historial'
                ? 'bg-dentist-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Historial de Consultas ({evoluciones.length})
          </button>
        </div>

        {/* PESTAÑA 1: ODONTOGRAMA VISUAL */}
        {pestaña === 'odontograma' && (
          <OdontogramaVisual 
            dientes={dientes} 
            onActualizarDiente={handleActualizarDiente} 
          />
        )}

        {/* PESTAÑA 2: REGISTRAR NUEVA EVOLUCIÓN */}
        {pestaña === 'nueva-evolucion' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-3xl mx-auto">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 mb-6">
              <div className="p-2.5 rounded-xl bg-dentist-100 text-dentist-700">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Nueva Nota de Evolución Clínica</h3>
                <p className="text-xs text-slate-500">
                  Paciente: <strong className="text-slate-800">{pacienteActivo.nombre}</strong> • Odontólogo: Dr. Carlos Ruiz
                </p>
              </div>
            </div>

            <form onSubmit={handleGuardarEvolucion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Motivo de Consulta y Síntomas *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Paciente refiere dolor en molar superior..."
                    value={formEvolucion.motivo}
                    onChange={e => setFormEvolucion({ ...formEvolucion, motivo: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-dentist-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pieza Dental Intervenida
                  </label>
                  <select
                    value={formEvolucion.piezaDental}
                    onChange={e => setFormEvolucion({ ...formEvolucion, piezaDental: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-dentist-500"
                  >
                    <option value="">General (Toda la boca)</option>
                    {Object.keys(DIENTES_INICIALES).map(num => (
                      <option key={num} value={num}>Pieza #{num} - {DIENTES_INICIALES[Number(num)].nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diagnóstico Clínico *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Caries de segundo grado / Pulpitis reversible..."
                  value={formEvolucion.diagnostico}
                  onChange={e => setFormEvolucion({ ...formEvolucion, diagnostico: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-dentist-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Procedimiento Realizado Detallado *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe la técnica, materiales empleados, anestesia..."
                  value={formEvolucion.procedimiento}
                  onChange={e => setFormEvolucion({ ...formEvolucion, procedimiento: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-dentist-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5 text-dentist-600" />
                    Prescripción / Medicamentos Formulados:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Ibuprofeno 400mg cada 8 horas..."
                    value={formEvolucion.prescripcion}
                    onChange={e => setFormEvolucion({ ...formEvolucion, prescripcion: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-dentist-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Indicaciones Post-Operatorias:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. No consumir alimentos duros ni calientes..."
                    value={formEvolucion.indicaciones}
                    onChange={e => setFormEvolucion({ ...formEvolucion, indicaciones: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-dentist-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setPestaña('odontograma')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-semibold bg-dentist-600 hover:bg-dentist-700 text-white rounded-xl shadow-sm transition"
                >
                  Firmar y Guardar Evolución
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PESTAÑA 3: HISTORIAL DE EVOLUCIONES PREVIAS */}
        {pestaña === 'historial' && (
          <div className="space-y-4">
            {evoluciones.map((evo) => (
              <div 
                key={evo.id} 
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{evo.doctorNombre}</span>
                    <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-full">
                      {evo.piezaDental}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-dentist-600" /> {evo.fecha}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-500 block mb-0.5">Motivo de Consulta:</span>
                    <p className="text-slate-800">{evo.motivoConsulta}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block mb-0.5">Diagnóstico Clínico:</span>
                    <p className="text-slate-800 font-medium">{evo.diagnostico}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Procedimiento Realizado:</span>
                  <p className="text-slate-800 leading-relaxed">{evo.procedimiento}</p>
                </div>

                {(evo.prescripcion || evo.indicaciones) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                    {evo.prescripcion && (
                      <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl">
                        <span className="font-bold text-sky-900 block flex items-center gap-1 mb-0.5">
                          <Pill className="w-3.5 h-3.5 text-sky-600" /> Prescripción Médica:
                        </span>
                        <p className="text-sky-800">{evo.prescripcion}</p>
                      </div>
                    )}
                    {evo.indicaciones && (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                        <span className="font-bold text-emerald-900 block mb-0.5">Indicaciones:</span>
                        <p className="text-emerald-800">{evo.indicaciones}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
