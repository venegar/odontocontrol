'use client';

import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Phone, 
  Calendar, 
  CreditCard, 
  User, 
  HeartPulse, 
  MapPin 
} from 'lucide-react';
import { Paciente, TipoDocumento, TipoEps } from '../types';
import { registrarPacienteNuevoStorage } from '../storage';

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  alRegistrarExitoso: (paciente: Paciente) => void;
}

export default function ModalRegistroPacienteRapido({
  abierto,
  alCerrar,
  alRegistrarExitoso,
}: Props) {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>('CC');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('1995-01-01');
  const [eps, setEps] = useState<TipoEps>('Particular');
  const [alergiasTexto, setAlergiasTexto] = useState('');
  const [enfermedadesTexto, setEnfermedadesTexto] = useState('');
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  if (!abierto) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion(null);

    if (!nombres.trim() || !apellidos.trim()) {
      setErrorValidacion('Por favor ingresa los nombres y apellidos del paciente.');
      return;
    }

    if (!numeroDocumento.trim()) {
      setErrorValidacion('El número de documento de identidad es obligatorio.');
      return;
    }

    if (!telefono.trim()) {
      setErrorValidacion('El número de teléfono o celular es obligatorio para recordatorios.');
      return;
    }

    const alergias = alergiasTexto
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const enfermedades = enfermedadesTexto
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    const nuevo = registrarPacienteNuevoStorage({
      nombres,
      apellidos,
      tipoDocumento,
      numeroDocumento,
      telefono,
      fechaNacimiento,
      eps,
      alergias,
      enfermedadesPrevias: enfermedades,
    });

    alRegistrarExitoso(nuevo);
    alCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-dentist-50 text-dentist-600 rounded-xl">
              <UserPlus className="w-5 h-5 text-dentist-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">Registrar Paciente Nuevo</h3>
              <p className="text-xs text-slate-500">Alta rápida en consultorio para iniciar atención clínica</p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorValidacion && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorValidacion}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombres *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  placeholder="Ej. Carlos Eduardo"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-dentist-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Apellidos *
              </label>
              <input
                type="text"
                required
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Ej. Gómez Restrepo"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-dentist-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo Doc. *
              </label>
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value as TipoDocumento)}
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-dentist-500 font-semibold"
              >
                <option value="CC">Cédula (CC)</option>
                <option value="TI">Tarjeta Identidad (TI)</option>
                <option value="CE">Cédula Extranjería (CE)</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número de Documento *
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  placeholder="Ej. 1020304050"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-dentist-500 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono / Celular (WhatsApp) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. 312 456 7890"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-dentist-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                EPS
              </label>
              <select
                value={eps}
                onChange={(e) => setEps(e.target.value as TipoEps)}
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-dentist-500 font-semibold"
              >
                <option value="Particular">Particular</option>
                <option value="Ecopetrol">Ecopetrol</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fecha de Nacimiento
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-dentist-500"
              />
            </div>
          </div>

          {/* Antecedentes clínicos rápidos */}
          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-2.5">
            <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Alertas y Alergias Médicas (Separar por comas)
            </label>
            <input
              type="text"
              value={alergiasTexto}
              onChange={(e) => setAlergiasTexto(e.target.value)}
              placeholder="Ej. Alergia a Penicilina, Látex, Ibuprofeno..."
              className="w-full px-3 py-2 text-xs border border-amber-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={alCerrar}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-dentist-600 hover:bg-dentist-700 rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Registrar y Atender Ahora</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
