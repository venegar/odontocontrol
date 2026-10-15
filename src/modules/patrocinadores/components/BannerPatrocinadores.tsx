'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  X, 
  Building2, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Patrocinador } from '../types';
import { obtenerPatrocinadores } from '../services/patrocinadoresService';

export default function BannerPatrocinadores() {
  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([]);
  const [patrocinadorSeleccionado, setPatrocinadorSeleccionado] = useState<Patrocinador | null>(null);

  useEffect(() => {
    // Carga inicial
    const cargar = () => {
      const lista = obtenerPatrocinadores();
      // Filtrar solo las marcas activas
      setPatrocinadores(lista.filter(p => p.activo));
    };

    cargar();

    const handleActualizacion = () => {
      cargar();
    };

    window.addEventListener('patrocinadores_actualizados', handleActualizacion);
    return () => window.removeEventListener('patrocinadores_actualizados', handleActualizacion);
  }, []);

  if (patrocinadores.length === 0) {
    return null;
  }

  return (
    <section className="relative py-12 sm:py-16 bg-surface-container-low/70 border-y border-outline-variant/30 overflow-hidden">
      {/* Luz ambiental sutil */}
      <div className="absolute inset-0 bg-gradient-to-r from-secondary-fixed/10 via-transparent to-secondary-fixed/10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Encabezado del Banner */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/50 border border-outline-variant/40 text-primary text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Alianzas Médicas & Tecnología Certificada</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Marcas y Patrocinadores de Nuestra Clínica
          </h2>
          
          <p className="text-xs sm:text-sm text-on-surface-variant mt-2 max-w-2xl mx-auto leading-relaxed">
            Trabajamos en alianza directa con los fabricantes odontológicos líderes en Suiza, Estados Unidos y Alemania para garantizar materiales de biocompatibilidad total y tecnología digital 3D.
          </p>
        </div>

        {/* Grid de Logos y Marcas Patrocinadoras */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 items-stretch">
          {patrocinadores.map((marca) => {
            const esPremium = marca.nivelPatrocinio === 'premium';
            
            return (
              <div
                key={marca.id}
                onClick={() => setPatrocinadorSeleccionado(marca)}
                className={`group relative bg-surface-container-lowest hover:bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-300 flex flex-col items-center justify-between text-center cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-1 ${
                  esPremium 
                    ? 'border-primary/40 ring-1 ring-primary/20' 
                    : 'border-outline-variant/40 hover:border-primary/50'
                }`}
                title={`Ver información y alianza con ${marca.nombre}`}
              >
                {/* Badge flotante de Nivel */}
                <div className="w-full flex justify-end mb-2">
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    esPremium 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {esPremium ? 'Partner Premium' : marca.nivelPatrocinio === 'oro' ? 'Aliado Oro' : 'Tech Partner'}
                  </span>
                </div>

                {/* Contenedor del Logotipo */}
                <div className="w-full h-16 sm:h-20 flex items-center justify-center p-1.5 my-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={marca.logoUrl}
                    alt={`Logotipo oficial de ${marca.nombre}`}
                    className="max-h-full max-w-full object-contain filter group-hover:scale-105 transition-transform duration-300 rounded-lg"
                  />
                </div>

                {/* Información Básica */}
                <div className="mt-3 w-full">
                  <h3 className="font-bold text-xs sm:text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                    {marca.nombre}
                  </h3>
                  <p className="text-[10px] text-on-surface-variant font-medium line-clamp-1 mt-0.5">
                    {marca.categoria}
                  </p>
                </div>

                {/* CTA sutil de interacción */}
                <div className="mt-3 pt-2 border-t border-outline-variant/20 w-full flex items-center justify-center gap-1 text-[10px] font-bold text-primary group-hover:underline">
                  <span>Conocer alianza</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Franja de Garantía Médica Institucional */}
        <div className="mt-10 pt-6 border-t border-outline-variant/30 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-semibold text-on-surface-variant">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Materiales 100% Homologados por Invima / CE / FDA</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Garantía Biológica Escrita de por Vida</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            <span>Clínica Certificada de Referencia Internacional</span>
          </div>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* MODAL DETALLADO DE INFORMACIÓN DEL PATROCINADOR / MARCA */}
      {/* ===================================================================== */}
      {patrocinadorSeleccionado && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setPatrocinadorSeleccionado(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón Cerrar */}
            <button
              type="button"
              onClick={() => setPatrocinadorSeleccionado(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabecera del Modal con Logo de la Marca */}
            <div className="flex items-center gap-4 pr-8">
              <div className="w-20 h-16 sm:w-24 sm:h-20 bg-slate-50 border border-slate-200 rounded-2xl p-2 flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={patrocinadorSeleccionado.logoUrl}
                  alt={patrocinadorSeleccionado.nombre}
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              </div>

              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-1">
                  <Award className="w-3 h-3" />
                  <span>{patrocinadorSeleccionado.nivelPatrocinio.toUpperCase()} PARTNER</span>
                </span>
                <h3 className="text-xl font-black text-slate-900 leading-tight">
                  {patrocinadorSeleccionado.nombre}
                </h3>
                <p className="text-xs font-semibold text-dentist-700 mt-0.5">
                  {patrocinadorSeleccionado.categoria}
                </p>
              </div>
            </div>

            {/* Descripción y Propósito Clínico */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Alianza Médica con Dra. Yasmín Blanco
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                {patrocinadorSeleccionado.descripcionDetallada || patrocinadorSeleccionado.descripcionCorta}
              </p>
            </div>

            {/* Beneficios directos para el paciente */}
            {patrocinadorSeleccionado.beneficiosPacientes && patrocinadorSeleccionado.beneficiosPacientes.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Beneficios para tu Tratamiento Dental:</span>
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {patrocinadorSeleccionado.beneficiosPacientes.map((beneficio, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{beneficio}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer del Modal: Acciones y Enlaces */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              {patrocinadorSeleccionado.sitioWeb ? (
                <a
                  href={patrocinadorSeleccionado.sitioWeb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-primary bg-slate-50 hover:bg-slate-100 text-xs font-bold transition"
                >
                  <span>Visitar sitio oficial</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-[11px] text-slate-400 italic">Marca certificada en uso clínico</span>
              )}

              <button
                type="button"
                onClick={() => setPatrocinadorSeleccionado(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary hover:bg-secondary text-on-primary text-xs font-bold transition shadow-sm"
              >
                Cerrar Información
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
