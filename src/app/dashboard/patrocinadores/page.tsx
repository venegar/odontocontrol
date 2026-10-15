'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Lock, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowLeft, 
  X, 
  Save, 
  Award,
  Globe,
  Tag,
  FileText,
  Check
} from 'lucide-react';
import { 
  Patrocinador, 
  FormularioPatrocinadorInput, 
  NivelPatrocinio 
} from '@/modules/patrocinadores/types';
import { 
  obtenerPatrocinadores, 
  agregarPatrocinador, 
  actualizarPatrocinador, 
  toggleEstadoPatrocinador, 
  eliminarPatrocinador 
} from '@/modules/patrocinadores/services/patrocinadoresService';
import FotoPerfilDropzone from '@/components/ui/FotoPerfilDropzone';

const CATEGORIAS_SUGERIDAS = [
  'Implantes & Regeneración Tisular',
  'Ortodoncia Invisible & Escáner 3D',
  'Biomateriales & Nanotecnología Estética',
  'Sistemas CAD/CAM & Radiología 3D',
  'Regeneración Ósea & Membranas',
  'Rehabilitación Oral Fija Completa',
  'Blanqueamiento & Estética Dental',
  'Láser Quirúrgico & Instrumental',
  'Equipamiento de Bioseguridad Hospitalaria'
];

export default function PatrocinadoresDashboardPage() {
  const [rolActivo, setRolActivo] = useState<'admin' | 'odontologo' | 'recepcionista'>('admin');
  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  
  // Estado para alertas y notificaciones
  const [alerta, setAlerta] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);

  // Estados de modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalModo, setModalModo] = useState<'crear' | 'editar'>('crear');
  const [patrocinadorEditandoId, setPatrocinadorEditandoId] = useState<string | null>(null);
  const [patrocinadorPreview, setPatrocinadorPreview] = useState<Patrocinador | null>(null);

  // Estado del formulario
  const [formulario, setFormulario] = useState<FormularioPatrocinadorInput>({
    nombre: '',
    logoUrl: '',
    sitioWeb: '',
    categoria: CATEGORIAS_SUGERIDAS[0],
    descripcionCorta: '',
    descripcionDetallada: '',
    beneficiosPacientes: [
      'Materiales de alta durabilidad y biocompatibilidad certificada',
      'Protocolos guiados que reducen el tiempo en sillón y el dolor'
    ],
    nivelPatrocinio: 'premium',
    activo: true,
  });

  const [nuevoBeneficioTexto, setNuevoBeneficioTexto] = useState('');

  // Cargar datos
  const refrescarPatrocinadores = () => {
    setPatrocinadores(obtenerPatrocinadores());
  };

  useEffect(() => {
    refrescarPatrocinadores();

    const handleActualizacion = () => {
      refrescarPatrocinadores();
    };

    window.addEventListener('patrocinadores_actualizados', handleActualizacion);
    return () => window.removeEventListener('patrocinadores_actualizados', handleActualizacion);
  }, []);

  const mostrarMensaje = (tipo: 'exito' | 'error', mensaje: string) => {
    setAlerta({ tipo, mensaje });
    setTimeout(() => setAlerta(null), 5000);
  };

  // Abrir modal de nuevo patrocinador
  const handleAbrirCrear = () => {
    if (rolActivo !== 'admin') {
      mostrarMensaje('error', 'Solo la Dirección Médica (Admin) cuenta con permisos para registrar nuevos patrocinadores.');
      return;
    }

    setModalModo('crear');
    setPatrocinadorEditandoId(null);
    setFormulario({
      nombre: '',
      logoUrl: '',
      sitioWeb: '',
      categoria: CATEGORIAS_SUGERIDAS[0],
      descripcionCorta: '',
      descripcionDetallada: '',
      beneficiosPacientes: [
        'Materiales de alta durabilidad y biocompatibilidad certificada',
        'Protocolos guiados que reducen el tiempo en sillón y el dolor'
      ],
      nivelPatrocinio: 'premium',
      activo: true,
    });
    setModalAbierto(true);
  };

  // Abrir modal de edición
  const handleAbrirEditar = (item: Patrocinador) => {
    if (rolActivo !== 'admin') {
      mostrarMensaje('error', 'Solo la Dirección Médica (Admin) cuenta con permisos para modificar marcas patrocinadoras.');
      return;
    }

    setModalModo('editar');
    setPatrocinadorEditandoId(item.id);
    setFormulario({
      nombre: item.nombre,
      logoUrl: item.logoUrl,
      sitioWeb: item.sitioWeb || '',
      categoria: item.categoria,
      descripcionCorta: item.descripcionCorta,
      descripcionDetallada: item.descripcionDetallada || '',
      beneficiosPacientes: item.beneficiosPacientes || [],
      nivelPatrocinio: item.nivelPatrocinio,
      activo: item.activo,
    });
    setModalAbierto(true);
  };

  // Guardar formulario (Crear o Actualizar)
  const handleGuardarFormulario = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formulario.nombre.trim()) {
      mostrarMensaje('error', 'El nombre de la marca patrocinadora es obligatorio.');
      return;
    }

    if (!formulario.logoUrl) {
      mostrarMensaje('error', 'Debes cargar el logotipo de la marca (mediante drag & drop o selección de imagen).');
      return;
    }

    if (!formulario.descripcionCorta.trim()) {
      mostrarMensaje('error', 'Ingresa una descripción corta para mostrar en el banner.');
      return;
    }

    if (modalModo === 'crear') {
      const resultado = agregarPatrocinador(
        formulario,
        rolActivo,
        'Dra. Yasmín Blanco (Directora Médica)'
      );

      if (resultado.exito) {
        mostrarMensaje('exito', resultado.mensaje);
        setModalAbierto(false);
        refrescarPatrocinadores();
      } else {
        mostrarMensaje('error', resultado.mensaje);
      }
    } else if (modalModo === 'editar' && patrocinadorEditandoId) {
      const resultado = actualizarPatrocinador(
        patrocinadorEditandoId,
        formulario,
        rolActivo
      );

      if (resultado.exito) {
        mostrarMensaje('exito', resultado.mensaje);
        setModalAbierto(false);
        refrescarPatrocinadores();
      } else {
        mostrarMensaje('error', resultado.mensaje);
      }
    }
  };

  // Alternar estado activo / inactivo
  const handleToggleEstado = (id: string) => {
    const res = toggleEstadoPatrocinador(id, rolActivo);
    if (res.exito) {
      mostrarMensaje('exito', res.mensaje);
      refrescarPatrocinadores();
    } else {
      mostrarMensaje('error', res.mensaje);
    }
  };

  // Eliminar patrocinador
  const handleEliminar = (id: string, nombre: string) => {
    if (rolActivo !== 'admin') {
      mostrarMensaje('error', 'Acceso denegado: Se requiere rol de Directora Médica para eliminar patrocinadores.');
      return;
    }

    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente a "${nombre}" de las marcas patrocinadoras?`)) {
      const res = eliminarPatrocinador(id, rolActivo);
      if (res.exito) {
        mostrarMensaje('exito', res.mensaje);
        refrescarPatrocinadores();
      } else {
        mostrarMensaje('error', res.mensaje);
      }
    }
  };

  // Manejo de beneficios del paciente en el formulario
  const handleAgregarBeneficio = () => {
    if (nuevoBeneficioTexto.trim()) {
      setFormulario({
        ...formulario,
        beneficiosPacientes: [...(formulario.beneficiosPacientes || []), nuevoBeneficioTexto.trim()]
      });
      setNuevoBeneficioTexto('');
    }
  };

  const handleRemoverBeneficio = (index: number) => {
    const actualizados = (formulario.beneficiosPacientes || []).filter((_, i) => i !== index);
    setFormulario({ ...formulario, beneficiosPacientes: actualizados });
  };

  // Filtrado de patrocinadores
  const patrocinadoresFiltrados = patrocinadores.filter(p => {
    const coincideTexto = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          p.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
                          p.descripcionCorta.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = filtroCategoria === 'todas' || p.categoria === filtroCategoria;
    return coincideTexto && coincideCategoria;
  });

  // Estadísticas del módulo
  const totalMarcas = patrocinadores.length;
  const marcasActivas = patrocinadores.filter(p => p.activo).length;
  const marcasPremium = patrocinadores.filter(p => p.nivelPatrocinio === 'premium').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col">
      
      {/* ===================================================================== */}
      {/* 1. CABECERA INSTITUCIONAL CON VOLVER AL DASHBOARD */}
      {/* ===================================================================== */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <Link href="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="relative h-14 sm:h-16 w-48 sm:w-60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/logo-yasmin-blanco-transparente.png"
                  alt="Dra. Yasmín Blanco"
                  className="h-full w-full object-contain object-left mix-blend-multiply"
                />
              </div>
            </Link>

            <span className="hidden md:inline-block h-8 w-px bg-slate-200 mx-2" />

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-dentist-600 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Volver al Dashboard Central</span>
            </Link>
          </div>

          {/* Selector de Rol Demostrativo */}
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setRolActivo('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                rolActivo === 'admin'
                  ? 'bg-white text-dentist-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👑</span>
              <span>Directora Médica (Admin)</span>
            </button>

            <button
              type="button"
              onClick={() => setRolActivo('odontologo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                rolActivo === 'odontologo'
                  ? 'bg-white text-dentist-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🩺</span>
              <span>Odontólogo</span>
            </button>

            <button
              type="button"
              onClick={() => setRolActivo('recepcionista')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                rolActivo === 'recepcionista'
                  ? 'bg-white text-dentist-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📋</span>
              <span>Recepción</span>
            </button>
          </div>

          {/* Enlace rápido a la Landing Page para ver el banner */}
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-dentist-50 text-dentist-700 hover:bg-dentist-100 text-xs font-bold border border-dentist-200 transition shadow-2xs"
            title="Ver banner de patrocinadores en la página de inicio"
          >
            <span>Ver Banner en Sitio Web</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

        </div>
      </header>

      {/* Alerta flotante */}
      {alerta && (
        <div className={`px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm animate-in fade-in sticky top-20 z-40 ${
          alerta.tipo === 'exito' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          {alerta.tipo === 'exito' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{alerta.mensaje}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. CONTENIDO PRINCIPAL DEL MÓDULO */}
      {/* ===================================================================== */}
      <main className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
        
        {/* Banner Superior del Módulo */}
        <div className="bg-gradient-to-r from-dentist-800 via-dentist-700 to-sky-800 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Gestión de Marcas & Convenios Médicos Oficiales</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Patrocinadores y Alianzas Tecnológicas
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
              Configura los logos, información clínica y beneficios de las marcas patrocinadoras. Los cambios se sincronizan en tiempo real con el banner principal de la página web.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleAbrirCrear}
              disabled={rolActivo !== 'admin'}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-dentist-800 hover:bg-sky-50 font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nuevo Patrocinador</span>
            </button>
          </div>
        </div>

        {/* Aviso de Modo Solo Lectura si no es admin */}
        {rolActivo !== 'admin' && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Acceso protegido por rol ({rolActivo}):</span>
              <span>
                Estás visualizando el catálogo de marcas en <strong>Modo Solo Lectura</strong>. Únicamente la Directora Médica (Admin) puede crear, editar o eliminar patrocinadores oficiales. Usa el selector superior para alternar de perfil.
              </span>
            </div>
          </div>
        )}

        {/* Tarjetas de Métricas Clave */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Total Marcas
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{totalMarcas}</span>
              <span className="text-xs text-slate-500 font-semibold">patrocinadores</span>
            </div>
            <span className="text-[11px] text-dentist-600 font-semibold block mt-2">
              Proveedores clínicos avalados
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Visibles en Web
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600">{marcasActivas}</span>
              <span className="text-xs text-slate-500 font-semibold">activas en banner</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold block mt-2">
              Sincronización en vivo
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Partner Premium
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-600">{marcasPremium}</span>
              <span className="text-xs text-slate-500 font-semibold">alianzas doradas</span>
            </div>
            <span className="text-[11px] text-amber-700 font-semibold block mt-2">
              Mayor visibilidad en el banner
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Garantía Médica
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">100%</span>
              <span className="text-xs text-slate-500 font-semibold">homologados</span>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold block mt-2">
              Normas FDA / CE / Invima
            </span>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por marca, categoría o tecnología..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-dentist-500 bg-slate-50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filtrar:</span>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-dentist-500"
            >
              <option value="todas">Todas las categorías ({patrocinadores.length})</option>
              {Array.from(new Set(patrocinadores.map(p => p.categoria))).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Listado de Patrocinadores en Formato Grid de Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patrocinadoresFiltrados.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl border transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between p-6 space-y-4 ${
                item.activo ? 'border-slate-200' : 'border-slate-200/60 bg-slate-50/50 opacity-75'
              }`}
            >
              <div>
                {/* Cabecera de la Card: Logo + Badges */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="w-28 h-16 bg-slate-50 rounded-2xl border border-slate-200/80 p-2 flex items-center justify-center shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.logoUrl}
                      alt={item.nombre}
                      className="max-h-full max-w-full object-contain rounded-md"
                    />
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      item.nivelPatrocinio === 'premium'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : item.nivelPatrocinio === 'oro'
                        ? 'bg-sky-100 text-sky-800 border border-sky-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.nivelPatrocinio === 'premium' ? '★ Premium' : item.nivelPatrocinio === 'oro' ? '★ Oro' : 'Tecnológico'}
                    </span>

                    <button
                      type="button"
                      disabled={rolActivo !== 'admin'}
                      onClick={() => handleToggleEstado(item.id)}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition ${
                        item.activo
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      } disabled:cursor-not-allowed`}
                      title="Haz clic para activar o pausar visibilidad en la web"
                    >
                      {item.activo ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-500" />}
                      <span>{item.activo ? 'Visible en Web' : 'Oculto en Web'}</span>
                    </button>
                  </div>
                </div>

                {/* Info de la Marca */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-base text-slate-900">{item.nombre}</h3>
                    {item.sitioWeb && (
                      <a
                        href={item.sitioWeb}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-dentist-600 hover:text-dentist-800"
                        title="Visitar sitio web oficial"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <span className="inline-block text-[11px] font-semibold text-dentist-700 bg-dentist-50 px-2.5 py-0.5 rounded-lg border border-dentist-100">
                    {item.categoria}
                  </span>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {item.descripcionCorta}
                  </p>
                </div>

                {/* Beneficios Destacados */}
                {item.beneficiosPacientes && item.beneficiosPacientes.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Aporte Clínico al Paciente:
                    </span>
                    <div className="space-y-1">
                      {item.beneficiosPacientes.slice(0, 2).map((b, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setPatrocinadorPreview(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                  title="Ver ficha completa"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Ficha</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={rolActivo !== 'admin'}
                    onClick={() => handleAbrirEditar(item)}
                    className="p-2 rounded-xl text-slate-600 hover:text-dentist-700 hover:bg-dentist-50 border border-slate-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Editar patrocinador"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={rolActivo !== 'admin'}
                    onClick={() => handleEliminar(item.id, item.nombre)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Eliminar patrocinador"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {patrocinadoresFiltrados.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No se encontraron marcas patrocinadoras</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No hay resultados que coincidan con &ldquo;{busqueda}&rdquo;. Puedes ajustar la búsqueda o agregar una nueva marca.
            </p>
            {rolActivo === 'admin' && (
              <button
                type="button"
                onClick={handleAbrirCrear}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dentist-600 hover:bg-dentist-700 text-white font-bold text-xs shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Patrocinador</span>
              </button>
            )}
          </div>
        )}

      </main>

      {/* ===================================================================== */}
      {/* 3. MODAL DE CREACIÓN / EDICIÓN DE PATROCINADOR (CON DRAG AND DROP) */}
      {/* ===================================================================== */}
      {modalAbierto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setModalAbierto(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-dentist-50 text-dentist-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {modalModo === 'crear' ? 'Registrar Marca Patrocinadora' : 'Editar Información de la Marca'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Carga el logo y los detalles de la alianza para sincronizarlos en el banner web.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleGuardarFormulario} className="space-y-5">
              
              {/* Carga del Logotipo con DRAG AND DROP */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Logotipo Oficial de la Marca (Arrastrar y Soltar / Drag & Drop)
                </label>
                <FotoPerfilDropzone
                  valor={formulario.logoUrl}
                  onChange={(base64) => setFormulario({ ...formulario, logoUrl: base64 || '' })}
                  etiqueta="Logotipo de la Marca Patrocinadora"
                  descripcion="Arrastra y suelta aquí el logo en PNG, JPG o WebP (fondo transparente sugerido)"
                  ayuda="Resolución sugerida: 240x70 px o superior (Máx. 5MB)"
                  tamano="md"
                />
              </div>

              {/* Grid 2 columnas: Nombre y Categoría */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nombre de la Marca Patrocinadora *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Straumann Group, 3M Oral Care..."
                    value={formulario.nombre}
                    onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dentist-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Categoría / Especialidad *
                  </label>
                  <input
                    type="text"
                    required
                    list="lista-categorias-pat"
                    placeholder="Selecciona o escribe una categoría..."
                    value={formulario.categoria}
                    onChange={(e) => setFormulario({ ...formulario, categoria: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dentist-500"
                  />
                  <datalist id="lista-categorias-pat">
                    {CATEGORIAS_SUGERIDAS.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

              {/* Grid 2 columnas: Nivel de Patrocinio y Sitio Web */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nivel de Alianza / Patrocinio
                  </label>
                  <select
                    value={formulario.nivelPatrocinio}
                    onChange={(e) => setFormulario({ ...formulario, nivelPatrocinio: e.target.value as NivelPatrocinio })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dentist-500"
                  >
                    <option value="premium">★ Partner Premium (Máxima visibilidad)</option>
                    <option value="oro">★ Aliado Oro (Alta relevancia)</option>
                    <option value="aliado_tecnologico">Aliado Tecnológico & Instrumental</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Sitio Web Oficial (Opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.marca.com"
                    value={formulario.sitioWeb}
                    onChange={(e) => setFormulario({ ...formulario, sitioWeb: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dentist-500"
                  />
                </div>
              </div>

              {/* Descripción corta */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Descripción Corta (Visible en el Banner) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Implantes de titanio Roxolid® con osteointegración en 3 semanas."
                  value={formulario.descripcionCorta}
                  onChange={(e) => setFormulario({ ...formulario, descripcionCorta: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dentist-500"
                />
              </div>

              {/* Descripción detallada */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Información Técnica y Respaldo Clínico de la Alianza
                </label>
                <textarea
                  rows={3}
                  placeholder="Explica qué papel cumple esta marca en la consulta de la Dra. Yasmín Blanco, su calidad, certificaciones y tecnología provista..."
                  value={formulario.descripcionDetallada}
                  onChange={(e) => setFormulario({ ...formulario, descripcionDetallada: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dentist-500"
                />
              </div>

              {/* Beneficios directos para el paciente */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Beneficios para el Paciente (Puntos clave)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Ej. Garantía biológica de por vida..."
                    value={nuevoBeneficioTexto}
                    onChange={(e) => setNuevoBeneficioTexto(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-dentist-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAgregarBeneficio();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAgregarBeneficio}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Agregar
                  </button>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {(formulario.beneficiosPacientes || []).map((b, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="text-slate-700 line-clamp-1">{b}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoverBeneficio(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Switch de Visibilidad */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="block text-xs font-bold text-slate-800">Publicar en el Banner de Inicio</span>
                  <span className="block text-[11px] text-slate-500">Si está activo, los pacientes verán el logo inmediatamente debajo del Hero.</span>
                </div>
                <input
                  type="checkbox"
                  checked={formulario.activo}
                  onChange={(e) => setFormulario({ ...formulario, activo: e.target.checked })}
                  className="w-4 h-4 accent-dentist-600 rounded cursor-pointer"
                />
              </div>

              {/* Botones de acción del Modal */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dentist-600 hover:bg-dentist-700 text-white text-xs font-bold shadow-sm transition active:scale-[0.98]"
                >
                  <Save className="w-4 h-4" />
                  <span>{modalModo === 'crear' ? 'Guardar y Publicar Patrocinador' : 'Guardar Cambios de la Marca'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. MODAL DE PREVIEW / FICHA TÉCNICA CLÍNICA */}
      {/* ===================================================================== */}
      {patrocinadorPreview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setPatrocinadorPreview(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPatrocinadorPreview(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-24 h-16 bg-slate-50 rounded-2xl border border-slate-200 p-2 flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={patrocinadorPreview.logoUrl}
                  alt={patrocinadorPreview.nombre}
                  className="max-h-full max-w-full object-contain rounded-md"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-dentist-700 uppercase bg-dentist-50 px-2 py-0.5 rounded-md border border-dentist-100">
                  {patrocinadorPreview.categoria}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">{patrocinadorPreview.nombre}</h3>
                <span className="text-xs text-slate-500">
                  Nivel: <strong>{patrocinadorPreview.nivelPatrocinio.toUpperCase()}</strong>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <span className="font-bold block text-slate-900">Alianza con Consultorio Dra. Yasmín Blanco:</span>
              <p className="leading-relaxed">
                {patrocinadorPreview.descripcionDetallada || patrocinadorPreview.descripcionCorta}
              </p>
            </div>

            {patrocinadorPreview.beneficiosPacientes && patrocinadorPreview.beneficiosPacientes.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900">Beneficios para el Paciente:</span>
                <div className="space-y-1.5">
                  {patrocinadorPreview.beneficiosPacientes.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {patrocinadorPreview.sitioWeb ? (
                <a
                  href={patrocinadorPreview.sitioWeb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-dentist-600 hover:text-dentist-800"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Sitio Web Oficial</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-xs text-slate-400">Sin web externa</span>
              )}

              <button
                type="button"
                onClick={() => setPatrocinadorPreview(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
