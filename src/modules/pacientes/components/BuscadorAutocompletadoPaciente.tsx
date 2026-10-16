'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  User, 
  X, 
  UserPlus, 
  Check, 
  ChevronDown, 
  CreditCard,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { Paciente } from '../types';

interface BuscadorAutocompletadoPacienteProps {
  pacientes: Paciente[];
  pacienteSeleccionadoId?: string;
  onSeleccionarPaciente: (paciente: Paciente) => void;
  onCrearNuevoPaciente?: () => void;
  placeholder?: string;
  className?: string;
}

export default function BuscadorAutocompletadoPaciente({
  pacientes,
  pacienteSeleccionadoId,
  onSeleccionarPaciente,
  onCrearNuevoPaciente,
  placeholder = 'Buscar paciente por nombre o documento...',
  className = '',
}: BuscadorAutocompletadoPacienteProps) {
  const [terminoBusqueda, setTerminoBusqueda] = useState<string>('');
  const [desplegableAbierto, setDesplegableAbierto] = useState<boolean>(false);
  const [indiceFoco, setIndiceFoco] = useState<number>(-1);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pacientes seguros y normalizados
  const pacientesSeguros = Array.isArray(pacientes)
    ? pacientes.filter((p): p is Paciente => Boolean(p) && typeof p === 'object' && Boolean(p.id))
    : [];

  // Paciente actualmente seleccionado
  const pacienteActivo = pacientesSeguros.find((p) => p.id === pacienteSeleccionadoId);

  // Filtrado de pacientes en tiempo real
  const pacientesFiltrados = pacientesSeguros.filter((p) => {
    if (!terminoBusqueda.trim()) return true;
    const q = terminoBusqueda.toLowerCase().trim();
    const nombreCompleto = `${p.nombres || ''} ${p.apellidos || ''}`.toLowerCase();
    const documento = String(p.numeroDocumento || '').toLowerCase();
    const telefono = String(p.telefono || '').toLowerCase();
    const eps = String(p.eps || '').toLowerCase();

    return (
      nombreCompleto.includes(q) ||
      documento.includes(q) ||
      telefono.includes(q) ||
      eps.includes(q)
    );
  });

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickFuera = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setDesplegableAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  // Manejador de teclado para autocompletado rápido
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!desplegableAbierto) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setDesplegableAbierto(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndiceFoco((prev) => (prev < pacientesFiltrados.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndiceFoco((prev) => (prev > 0 ? prev - 1 : pacientesFiltrados.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (indiceFoco >= 0 && indiceFoco < pacientesFiltrados.length) {
        seleccionarPaciente(pacientesFiltrados[indiceFoco]);
      } else if (pacientesFiltrados.length > 0) {
        seleccionarPaciente(pacientesFiltrados[0]);
      }
    } else if (e.key === 'Escape') {
      setDesplegableAbierto(false);
    }
  };

  const seleccionarPaciente = (paciente: Paciente) => {
    onSeleccionarPaciente(paciente);
    setTerminoBusqueda('');
    setDesplegableAbierto(false);
    setIndiceFoco(-1);
  };

  return (
    <div ref={contenedorRef} className={`relative flex items-center gap-2 ${className}`}>
      {/* Campo de búsqueda con autocompletado */}
      <div className="relative flex-1 min-w-[260px] sm:min-w-[320px]">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          
          <input
            ref={inputRef}
            type="text"
            value={terminoBusqueda}
            onChange={(e) => {
              setTerminoBusqueda(e.target.value);
              setDesplegableAbierto(true);
              setIndiceFoco(0);
            }}
            onFocus={() => setDesplegableAbierto(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              pacienteActivo 
                ? `${pacienteActivo.nombres || ''} ${pacienteActivo.apellidos || ''} (${pacienteActivo.tipoDocumento || 'CC'} ${pacienteActivo.numeroDocumento || ''})`.trim()
                : placeholder
            }
            className={`w-full text-xs font-semibold pl-9 pr-16 py-2.5 rounded-xl border transition shadow-2xs focus:outline-none focus:ring-2 focus:ring-dentist-500 ${
              pacienteActivo && !terminoBusqueda
                ? 'bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-800 placeholder:font-bold'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />

          <div className="absolute right-2 flex items-center gap-1">
            {terminoBusqueda ? (
              <button
                type="button"
                onClick={() => {
                  setTerminoBusqueda('');
                  inputRef.current?.focus();
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setDesplegableAbierto(!desplegableAbierto)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              title="Ver lista de pacientes registrados"
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${desplegableAbierto ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Desplegable de Sugerencias y Autocompletado */}
        {desplegableAbierto && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 max-h-80 flex flex-col">
            <div className="p-2 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between text-[11px] text-slate-500 font-semibold px-3">
              <span>Pacientes encontrados ({pacientesFiltrados.length})</span>
              <span className="text-[10px] text-slate-400">Usa flechas y Enter</span>
            </div>

            <div className="overflow-y-auto divide-y divide-slate-100 py-1">
              {pacientesFiltrados.length > 0 ? (
                pacientesFiltrados.map((p, idx) => {
                  const esSeleccionado = p.id === pacienteSeleccionadoId;
                  const esFoco = idx === indiceFoco;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => seleccionarPaciente(p)}
                      onMouseEnter={() => setIndiceFoco(idx)}
                      className={`w-full text-left px-3.5 py-2.5 transition flex items-center justify-between gap-3 ${
                        esFoco 
                          ? 'bg-dentist-50 text-dentist-900' 
                          : esSeleccionado 
                          ? 'bg-slate-50' 
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                          esSeleccionado 
                            ? 'bg-dentist-600 text-white' 
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {(p.nombres || 'P').charAt(0)}{(p.apellidos || '').charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <span className={`block text-xs leading-tight truncate ${esSeleccionado ? 'font-bold text-dentist-800' : 'font-semibold text-slate-900'}`}>
                            {p.nombres || 'Paciente'} {p.apellidos || ''}
                          </span>
                          <span className="block text-[11px] text-slate-500 font-medium truncate mt-0.5">
                            {p.tipoDocumento || 'CC'} {p.numeroDocumento || ''} • {p.eps || 'Particular'} • {p.telefono || 'Sin tel'}
                          </span>
                        </div>
                      </div>

                      {esSeleccionado && (
                        <div className="flex items-center gap-1 text-dentist-600 font-bold text-xs shrink-0 bg-dentist-100/60 px-2 py-0.5 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Activo</span>
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center space-y-2">
                  <p className="text-xs text-slate-500">
                    No se encontró ningún paciente que coincida con <strong className="text-slate-800">&quot;{terminoBusqueda}&quot;</strong>.
                  </p>
                  {onCrearNuevoPaciente && (
                    <button
                      type="button"
                      onClick={() => {
                        setDesplegableAbierto(false);
                        onCrearNuevoPaciente();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dentist-600 text-white text-xs font-bold hover:bg-dentist-700 transition shadow-xs active:scale-95"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Dar de alta a este paciente nuevo</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Pie del desplegable con opción de registrar */}
            {onCrearNuevoPaciente && pacientesFiltrados.length > 0 && (
              <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => {
                    setDesplegableAbierto(false);
                    onCrearNuevoPaciente();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-dentist-700 hover:bg-dentist-100/70 transition"
                >
                  <UserPlus className="w-3.5 h-3.5 text-dentist-600" />
                  <span>+ Dar de alta a un paciente nuevo que no esté en la lista</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botón directo de Nuevo Paciente */}
      {onCrearNuevoPaciente && (
        <button
          type="button"
          onClick={onCrearNuevoPaciente}
          className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold px-3 py-2.5 rounded-xl transition shadow-2xs whitespace-nowrap active:scale-95 shrink-0"
          title="Registrar paciente nuevo"
        >
          <UserPlus className="w-3.5 h-3.5 text-dentist-600" />
          <span>+ Nuevo Paciente</span>
        </button>
      )}
    </div>
  );
}
