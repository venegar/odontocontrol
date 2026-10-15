'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowLeft, 
  X, 
  Save, 
  Clock, 
  Tag, 
  User, 
  FileText, 
  Check, 
  AlertTriangle,
  Image as ImageIcon,
  Loader2,
  Share2
} from 'lucide-react';
import { 
  ArticuloBlog, 
  ArticuloBlogInput, 
  CategoriaBlog 
} from '@/modules/blog/types';
import { 
  obtenerArticulosBlog, 
  crearArticuloBlog, 
  actualizarArticuloBlog, 
  eliminarArticuloBlog, 
  togglePublicacionArticulo
} from '@/modules/blog/actions';
import { generarSlug } from '@/modules/blog/utils';

const CATEGORIAS_BLOG: CategoriaBlog[] = [
  'Higiene',
  'Ortodoncia',
  'Estética',
  'Salud General',
  'Implantes',
  'Prevención',
];

const AUTORES_SUGERIDOS = [
  'Dra. Yasmín Blanco (Directora Médica & Cirugía/Estética)',
  'Dra. Laura Vega (Ortodoncia y Ortopedia Maxilofacial)',
  'Dr. Carlos Ruiz (Odontología General y Rehabilitación)',
  'Equipo Clínico DentisCare',
];

const IMAGENES_SUGERIDAS = [
  {
    nombre: 'Profilaxis & Dientes Sanos',
    url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
  },
  {
    nombre: 'Alineadores & Ortodoncia',
    url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
  },
  {
    nombre: 'Diseño de Sonrisa & Estética',
    url: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80',
  },
  {
    nombre: 'Implantes & Cirugía 3D',
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
  },
];

export default function BlogBackEndPage() {
  const [rolActivo, setRolActivo] = useState<'admin' | 'odontologo' | 'recepcionista'>('admin');
  const [articulos, setArticulos] = useState<ArticuloBlog[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'publicados' | 'borradores'>('todos');
  
  // Alertas
  const [alerta, setAlerta] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);

  // Estados de Modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalModo, setModalModo] = useState<'crear' | 'editar'>('crear');
  const [articuloEditandoId, setArticuloEditandoId] = useState<string | null>(null);
  const [articuloPreview, setArticuloPreview] = useState<ArticuloBlog | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Formulario
  const [formulario, setFormulario] = useState<ArticuloBlogInput>({
    titulo: '',
    slug: '',
    extracto: '',
    contenido: '',
    categoria: 'Higiene',
    autor: AUTORES_SUGERIDOS[0],
    imagenUrl: IMAGENES_SUGERIDAS[0].url,
    publicado: true,
    destacado: false,
    tiempoLectura: '4 min',
  });

  const mostrarMensaje = (tipo: 'exito' | 'error', mensaje: string) => {
    setAlerta({ tipo, mensaje });
    setTimeout(() => setAlerta(null), 5000);
  };

  // Cargar artículos desde Supabase
  const cargarArticulos = async () => {
    setCargando(true);
    try {
      const resp = await obtenerArticulosBlog(false);
      if (resp.datos) {
        setArticulos(resp.datos);
      }
    } catch (err) {
      console.error('Error cargando artículos:', err);
      mostrarMensaje('error', 'No se pudieron recuperar los artículos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarArticulos();
  }, []);

  // Abrir modal de creación
  const handleAbrirCrear = () => {
    if (rolActivo === 'recepcionista') {
      mostrarMensaje('error', 'El rol de recepcionista solo cuenta con permisos de lectura para el blog. Alterna a Odontólogo o Admin.');
      return;
    }
    setModalModo('crear');
    setArticuloEditandoId(null);
    setFormulario({
      titulo: '',
      slug: '',
      extracto: '',
      contenido: '',
      categoria: 'Higiene',
      autor: AUTORES_SUGERIDOS[0],
      imagenUrl: IMAGENES_SUGERIDAS[0].url,
      publicado: true,
      destacado: false,
      tiempoLectura: '4 min',
    });
    setModalAbierto(true);
  };

  // Abrir modal de edición
  const handleAbrirEditar = (art: ArticuloBlog) => {
    if (rolActivo === 'recepcionista') {
      mostrarMensaje('error', 'Se requiere rol clínico u odontológico para editar artículos del blog.');
      return;
    }
    setModalModo('editar');
    setArticuloEditandoId(art.id);
    setFormulario({
      titulo: art.titulo,
      slug: art.slug,
      extracto: art.extracto,
      contenido: art.contenido,
      categoria: art.categoria,
      autor: art.autor,
      imagenUrl: art.imagenUrl || '',
      publicado: art.publicado,
      destacado: art.destacado || false,
      tiempoLectura: art.tiempoLectura || '4 min',
    });
    setModalAbierto(true);
  };

  // Cambio dinámico de título -> autogeneración de slug
  const handleTituloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoTitulo = e.target.value;
    setFormulario(prev => ({
      ...prev,
      titulo: nuevoTitulo,
      // Si el slug estaba vacío o coincidía con el slug automático del título previo, actualizarlo
      slug: modalModo === 'crear' ? generarSlug(nuevoTitulo) : prev.slug,
    }));
  };

  // Guardar formulario
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      if (modalModo === 'crear') {
        const resp = await crearArticuloBlog(formulario);
        if (resp.exito && resp.datos) {
          mostrarMensaje('exito', '¡Artículo publicado y registrado exitosamente en el blog!');
          setModalAbierto(false);
          await cargarArticulos();
        } else {
          mostrarMensaje('error', resp.error || resp.mensaje || 'Error al guardar el artículo.');
        }
      } else if (modalModo === 'editar' && articuloEditandoId) {
        const resp = await actualizarArticuloBlog(articuloEditandoId, formulario);
        if (resp.exito && resp.datos) {
          mostrarMensaje('exito', 'Artículo actualizado con éxito.');
          setModalAbierto(false);
          await cargarArticulos();
        } else {
          mostrarMensaje('error', resp.error || resp.mensaje || 'Error al actualizar el artículo.');
        }
      }
    } catch (err) {
      console.error('Error al guardar:', err);
      mostrarMensaje('error', 'Ocurrió un error inesperado al procesar la solicitud.');
    } finally {
      setGuardando(false);
    }
  };

  // Alternar publicación rápida
  const handleTogglePublicado = async (art: ArticuloBlog) => {
    if (rolActivo === 'recepcionista') {
      mostrarMensaje('error', 'No tienes permisos para modificar el estado de publicación.');
      return;
    }
    const nuevoEstado = !art.publicado;
    
    // Actualización optimista local
    setArticulos(prev => prev.map(a => a.id === art.id ? { ...a, publicado: nuevoEstado } : a));

    try {
      const resp = await togglePublicacionArticulo(art.id, nuevoEstado);
      if (resp.exito) {
        mostrarMensaje('exito', nuevoEstado ? 'Artículo visible públicamente en la web.' : 'Artículo cambiado a estado borrador.');
      } else {
        await cargarArticulos();
        mostrarMensaje('error', resp.mensaje);
      }
    } catch (err) {
      await cargarArticulos();
      mostrarMensaje('error', 'Error al cambiar estado.');
    }
  };

  // Eliminar artículo
  const handleEliminar = async (art: ArticuloBlog) => {
    if (rolActivo !== 'admin') {
      mostrarMensaje('error', 'Solo la Dirección Médica (Admin) tiene permisos para eliminar artículos.');
      return;
    }

    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el artículo "${art.titulo}"?`);
    if (!confirmar) return;

    // Actualización optimista
    setArticulos(prev => prev.filter(a => a.id !== art.id));

    try {
      const resp = await eliminarArticuloBlog(art.id);
      if (resp.exito) {
        mostrarMensaje('exito', 'El artículo ha sido eliminado del blog.');
      } else {
        await cargarArticulos();
        mostrarMensaje('error', resp.mensaje);
      }
    } catch (err) {
      await cargarArticulos();
      mostrarMensaje('error', 'Error al intentar eliminar el artículo.');
    }
  };

  // Filtrado
  const articulosFiltrados = articulos.filter(a => {
    const coincideTexto = busqueda.trim() === '' || 
      a.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.extracto.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.autor.toLowerCase().includes(busqueda.toLowerCase());

    const coincideCategoria = filtroCategoria === 'todas' || a.categoria === filtroCategoria;

    const coincideEstado = filtroEstado === 'todos' || 
      (filtroEstado === 'publicados' && a.publicado) ||
      (filtroEstado === 'borradores' && !a.publicado);

    return coincideTexto && coincideCategoria && coincideEstado;
  });

  // Métricas
  const totalArticulos = articulos.length;
  const totalPublicados = articulos.filter(a => a.publicado).length;
  const totalBorradores = articulos.filter(a => !a.publicado).length;
  const totalDestacados = articulos.filter(a => a.destacado).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      
      {/* Barra superior de navegación y roles */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-dentist-700 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-dentist-50 text-dentist-700">
                <BookOpen className="w-4 h-4" />
              </span>
              <div>
                <h1 className="text-sm font-bold text-slate-900 leading-tight">
                  Back End de Blog & Educación Odontológica
                </h1>
                <p className="text-[11px] text-slate-500">
                  Panel de redacción, publicación y gestión de artículos clínicos
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Selector de rol clínico */}
            <div className="flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 font-medium">Rol:</span>
              <select
                value={rolActivo}
                onChange={(e) => setRolActivo(e.target.value as 'admin' | 'odontologo' | 'recepcionista')}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="admin">Dra. Yasmín (Admin)</option>
                <option value="odontologo">Odontólogo Especialista</option>
                <option value="recepcionista">Recepción (Solo Lectura)</option>
              </select>
            </div>

            <Link
              href="/blog"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-dentist-700 bg-dentist-50 hover:bg-dentist-100 border border-dentist-200 rounded-xl transition"
            >
              <span>Ver Blog Web</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleAbrirCrear}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-dentist-600 hover:bg-dentist-700 rounded-xl shadow-sm hover:shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Artículo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Banner de alerta */}
      {alerta && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-scale-up ${
            alerta.tipo === 'exito' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {alerta.tipo === 'exito' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{alerta.mensaje}</span>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Artículos</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalArticulos}</h3>
            </div>
            <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Publicados en Web</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">{totalPublicados}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Eye className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Borradores</p>
              <h3 className="text-2xl font-black text-amber-700 mt-1">{totalBorradores}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <EyeOff className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Destacados</p>
              <h3 className="text-2xl font-black text-indigo-700 mt-1">{totalDestacados}</h3>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por título, autor o resumen..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-dentist-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Filtro categoría */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dentist-500"
              >
                <option value="todas">Todas las categorías ({totalArticulos})</option>
                {CATEGORIAS_BLOG.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Filtro estado */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as 'todos' | 'publicados' | 'borradores')}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dentist-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="publicados">Solo Publicados</option>
                <option value="borradores">Solo Borradores</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listado de Artículos */}
        {cargando ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <Loader2 className="w-8 h-8 text-dentist-600 animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Cargando catálogo de artículos del blog...</p>
          </div>
        ) : articulosFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No se encontraron artículos</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No hay publicaciones que coincidan con los criterios de búsqueda o filtros seleccionados.
            </p>
            <button
              onClick={handleAbrirCrear}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-dentist-600 hover:bg-dentist-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Redactar primer artículo</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articulosFiltrados.map((art) => (
              <div
                key={art.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Imagen de portada si existe */}
                  {art.imagenUrl ? (
                    <div className="h-44 w-full relative bg-slate-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={art.imagenUrl}
                        alt={art.titulo}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/50">
                          {art.categoria}
                        </span>
                        {art.destacado && (
                          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-2.5 h-2.5" />
                            Destacado
                          </span>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${
                          art.publicado 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-slate-700 text-white'
                        }`}>
                          {art.publicado ? 'Publicado' : 'Borrador'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 pb-0 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-dentist-50 text-dentist-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-dentist-200">
                          {art.categoria}
                        </span>
                        {art.destacado && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Destacado
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        art.publicado 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {art.publicado ? 'Publicado' : 'Borrador'}
                      </span>
                    </div>
                  )}

                  {/* Cuerpo */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {art.tiempoLectura || '4 min'}
                      </span>
                      <span>•</span>
                      <span>{art.fechaPublicacion}</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2 hover:text-dentist-600 transition">
                      {art.titulo}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {art.extracto}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-500 truncate max-w-[180px]">
                        ✍️ {art.autor}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        /{art.slug}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones de gestión */}
                <div className="bg-slate-50/80 p-3 px-5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setArticuloPreview(art)}
                      title="Previsualizar artículo"
                      className="p-1.5 rounded-lg text-slate-600 hover:text-dentist-700 hover:bg-slate-200/70 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleTogglePublicado(art)}
                      title={art.publicado ? 'Despublicar (Mover a borrador)' : 'Publicar en la web'}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                        art.publicado
                          ? 'text-amber-700 hover:bg-amber-100'
                          : 'text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {art.publicado ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Pausar</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Publicar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAbrirEditar(art)}
                      title="Editar contenido"
                      className="p-1.5 rounded-lg text-slate-600 hover:text-dentist-700 hover:bg-slate-200/70 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleEliminar(art)}
                      title="Eliminar artículo"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL: CREAR / EDITAR ARTÍCULO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full my-8 overflow-hidden animate-scale-up">
            
            {/* Cabecera del modal */}
            <div className="bg-gradient-to-r from-dentist-700 to-sky-700 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-200" />
                <div>
                  <h3 className="font-bold text-sm">
                    {modalModo === 'crear' ? 'Redactar Nuevo Artículo del Blog' : 'Editar Artículo Educativo'}
                  </h3>
                  <p className="text-[11px] text-sky-100">
                    Ingresa el contenido que se mostrará a los pacientes en el portal web
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleGuardar} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Título */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título del Artículo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 5 claves para evitar la sensibilidad dental al consumir bebidas frías"
                  value={formulario.titulo}
                  onChange={handleTituloChange}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500 font-medium"
                />
              </div>

              {/* Slug y Categoría */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Slug / URL Amigable (SEO) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="evitar-sensibilidad-dental"
                    value={formulario.slug}
                    onChange={(e) => setFormulario({ ...formulario, slug: generarSlug(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500 font-mono text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoría Clínica *
                  </label>
                  <select
                    value={formulario.categoria}
                    onChange={(e) => setFormulario({ ...formulario, categoria: e.target.value as CategoriaBlog })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500 font-medium"
                  >
                    {CATEGORIAS_BLOG.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Autor y Tiempo de Lectura */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Autor Odontológico *
                  </label>
                  <input
                    type="text"
                    required
                    list="lista-autores"
                    placeholder="Dra. Yasmín Blanco"
                    value={formulario.autor}
                    onChange={(e) => setFormulario({ ...formulario, autor: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                  />
                  <datalist id="lista-autores">
                    {AUTORES_SUGERIDOS.map((aut, idx) => (
                      <option key={idx} value={aut} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tiempo de Lectura Estimado
                  </label>
                  <input
                    type="text"
                    placeholder="4 min"
                    value={formulario.tiempoLectura}
                    onChange={(e) => setFormulario({ ...formulario, tiempoLectura: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                  />
                </div>
              </div>

              {/* Imagen de Portada */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL de Imagen de Portada (Opcional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formulario.imagenUrl || ''}
                    onChange={(e) => setFormulario({ ...formulario, imagenUrl: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                  />
                </div>
                {/* Sugerencias de imágenes odontológicas */}
                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-slate-400 font-medium">Plantillas de alta resolución:</span>
                  {IMAGENES_SUGERIDAS.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormulario({ ...formulario, imagenUrl: img.url })}
                      className="text-[10px] bg-slate-100 hover:bg-dentist-50 text-slate-700 hover:text-dentist-700 px-2 py-0.5 rounded-md border border-slate-200 transition"
                    >
                      {img.nombre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extracto / Resumen */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Extracto / Resumen Corto *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Escribe una breve introducción o gancho (15-300 caracteres) que se mostrará en la tarjeta del blog..."
                  value={formulario.extracto}
                  onChange={(e) => setFormulario({ ...formulario, extracto: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                />
              </div>

              {/* Contenido Completo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cuerpo Completo del Artículo *
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Redacta el desarrollo completo del artículo, consejos numerados, recomendaciones preventivas, cuidados postoperatorios, etc..."
                  value={formulario.contenido}
                  onChange={(e) => setFormulario({ ...formulario, contenido: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500 font-sans leading-relaxed"
                />
              </div>

              {/* Opciones de Publicación */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formulario.publicado}
                      onChange={(e) => setFormulario({ ...formulario, publicado: e.target.checked })}
                      className="w-4 h-4 rounded text-dentist-600 focus:ring-dentist-500 border-slate-300"
                    />
                    <span>Publicar inmediatamente en la web</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formulario.destacado}
                      onChange={(e) => setFormulario({ ...formulario, destacado: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300"
                    />
                    <span>Marcar como destacado</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setModalAbierto(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-dentist-600 hover:bg-dentist-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition"
                  >
                    {guardando ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>{modalModo === 'crear' ? 'Publicar Artículo' : 'Guardar Cambios'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW DEL ARTÍCULO */}
      {articuloPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-dentist-50 text-dentist-700 text-xs font-bold px-3 py-1 rounded-full">
                  {articuloPreview.categoria}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {articuloPreview.tiempoLectura || '4 min'}
                </span>
              </div>
              <button
                onClick={() => setArticuloPreview(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-4 max-h-[75vh] overflow-y-auto">
              {articuloPreview.imagenUrl && (
                <div className="h-56 w-full rounded-2xl overflow-hidden bg-slate-100 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={articuloPreview.imagenUrl}
                    alt={articuloPreview.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {articuloPreview.titulo}
              </h2>

              <p className="text-xs text-slate-500 font-medium pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Por: <strong className="text-slate-700">{articuloPreview.autor}</strong></span>
                <span>{articuloPreview.fechaPublicacion}</span>
              </p>

              <div className="p-4 bg-dentist-50/50 rounded-2xl border border-dentist-100 text-xs text-dentist-900 font-medium italic leading-relaxed">
                {articuloPreview.extracto}
              </div>

              <div className="text-xs text-slate-700 leading-relaxed space-y-3 whitespace-pre-line pt-2">
                {articuloPreview.contenido}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                slug: /{articuloPreview.slug}
              </span>
              <button
                onClick={() => setArticuloPreview(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition"
              >
                Cerrar Previsualización
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
