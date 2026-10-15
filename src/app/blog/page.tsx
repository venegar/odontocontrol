'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Tag, 
  X, 
  Sparkles, 
  User, 
  Share2, 
  Calendar,
  Loader2 
} from 'lucide-react';
import { ArticuloBlog, CategoriaBlog } from '@/modules/blog/types';
import { obtenerArticulosBlog } from '@/modules/blog/actions';

const CATEGORIAS_FILTRO: ('todas' | CategoriaBlog)[] = [
  'todas',
  'Higiene',
  'Ortodoncia',
  'Estética',
  'Salud General',
  'Implantes',
  'Prevención',
];

export default function BlogPublicoPage() {
  const [articulos, setArticulos] = useState<ArticuloBlog[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<'todas' | CategoriaBlog>('todas');
  const [articuloAbierto, setArticuloAbierto] = useState<ArticuloBlog | null>(null);

  useEffect(() => {
    async function cargar() {
      try {
        const resp = await obtenerArticulosBlog(true); // Solo publicados
        if (resp.datos) {
          setArticulos(resp.datos);
        }
      } catch (err) {
        console.error('Error cargando blog:', err);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const articulosFiltrados = articulos.filter((art) => {
    if (categoriaSeleccionada === 'todas') return true;
    return art.categoria === categoriaSeleccionada;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      {/* Cabecera */}
      <header className="bg-white border-b py-3 px-6 shadow-xs sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link 
            href="/" 
            className="text-xs sm:text-sm text-slate-600 hover:text-primary flex items-center gap-1 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a Inicio</span>
          </Link>
          
          <Link href="/" className="relative h-10 w-44">
            <Image
              src="/brand/logo-yasmin-blanco.png"
              alt="Dra. Yasmín Blanco"
              fill
              className="object-contain object-right"
            />
          </Link>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12">
        
        {/* Banner Informativo */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dentist-50 text-dentist-700 text-xs font-semibold mb-3 border border-dentist-200">
            <BookOpen className="h-4 w-4" />
            Educación y Consejos para tu Sonrisa
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Artículos y Consejos Dentales
          </h1>
          <p className="text-slate-600 mt-2.5 text-sm leading-relaxed">
            Aprende cómo mantener una higiene bucal impecable y conoce los últimos avances en odontología digital de la mano de nuestros especialistas.
          </p>

          {/* Filtros por Categoría */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {CATEGORIAS_FILTRO.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition ${
                  categoriaSeleccionada === cat
                    ? 'bg-dentist-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'todas' ? 'Todos los temas' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Listado de Artículos */}
        {cargando ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-dentist-600 animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Cargando publicaciones clínicas...</p>
          </div>
        ) : articulosFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No hay artículos en esta categoría</h3>
            <p className="text-xs text-slate-500 mt-1">
              Pronto publicaremos nuevo contenido odontológico sobre este tema.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articulosFiltrados.map((articulo) => (
              <article 
                key={articulo.id} 
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Imagen de portada si existe */}
                  {articulo.imagenUrl ? (
                    <div className="h-48 w-full relative bg-slate-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={articulo.imagenUrl}
                        alt={articulo.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="bg-white/95 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/40 shadow-xs">
                          {articulo.categoria}
                        </span>
                        {articulo.destacado && (
                          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-2.5 h-2.5" />
                            Destacado
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 pb-0 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 font-semibold text-xs bg-dentist-50 text-dentist-700 px-3 py-1 rounded-full border border-dentist-100">
                        <Tag className="h-3 w-3" />
                        {articulo.categoria}
                      </span>
                      {articulo.destacado && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Destacado
                        </span>
                      )}
                    </div>
                  )}

                  {/* Cuerpo */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2.5">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {articulo.tiempoLectura || '4 min de lectura'}
                      </span>
                      <span>•</span>
                      <span>{articulo.fechaPublicacion}</span>
                    </div>

                    <h2 
                      onClick={() => setArticuloAbierto(articulo)}
                      className="font-bold text-base sm:text-lg text-slate-900 leading-snug group-hover:text-dentist-600 transition-colors cursor-pointer"
                    >
                      {articulo.titulo}
                    </h2>
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                      {articulo.extracto}
                    </p>
                  </div>
                </div>

                {/* Pie de tarjeta */}
                <div className="p-6 pt-0 mt-2">
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium truncate max-w-[170px]">
                      {articulo.autor}
                    </span>
                    <button
                      onClick={() => setArticuloAbierto(articulo)}
                      className="text-dentist-600 font-bold hover:text-dentist-700 transition flex items-center gap-1"
                    >
                      <span>Leer artículo</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* MODAL PARA LEER EL ARTÍCULO COMPLETO */}
      {articuloAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-scale-up">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-dentist-50 text-dentist-700 text-xs font-bold px-3 py-1 rounded-full border border-dentist-200">
                  {articuloAbierto.categoria}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {articuloAbierto.tiempoLectura || '4 min'}
                </span>
              </div>
              <button
                onClick={() => setArticuloAbierto(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
              {articuloAbierto.imagenUrl && (
                <div className="h-64 w-full rounded-2xl overflow-hidden bg-slate-100 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={articuloAbierto.imagenUrl}
                    alt={articuloAbierto.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {articuloAbierto.titulo}
              </h1>

              <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-dentist-600" />
                  {articuloAbierto.autor}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {articuloAbierto.fechaPublicacion}
                </span>
              </div>

              {/* Extracto destacado */}
              <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 text-xs text-sky-900 font-medium italic leading-relaxed">
                {articuloAbierto.extracto}
              </div>

              {/* Contenido completo */}
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4 whitespace-pre-line pt-2 font-sans">
                {articuloAbierto.contenido}
              </div>

              {/* Llamado a la acción para agendar cita */}
              <div className="mt-8 p-5 bg-gradient-to-r from-dentist-700 to-sky-700 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm">¿Tienes dudas sobre este tratamiento?</h4>
                  <p className="text-xs text-sky-100 mt-0.5">Agenda una valoración odontológica personalizada con la Dra. Yasmín Blanco.</p>
                </div>
                <Link
                  href="/#agendar"
                  onClick={() => setArticuloAbierto(null)}
                  className="px-5 py-2.5 bg-white text-dentist-700 hover:bg-sky-50 font-bold text-xs rounded-xl shadow-sm transition shrink-0"
                >
                  Solicitar Cita
                </Link>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setArticuloAbierto(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pie de página */}
      <footer className="bg-white border-t py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Clínica Dental Dra. Yasmín Blanco. Artículos y recomendaciones con fines informativos y educativos.
      </footer>
    </div>
  );
}
