'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  PlusCircle, 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  AlertTriangle, 
  Calendar, 
  HeartPulse, 
  Pill, 
  ShieldAlert, 
  FileText, 
  X, 
  CheckCircle2, 
  Filter, 
  UserPlus, 
  ChevronRight,
  Eye,
  CalendarPlus,
  UploadCloud,
  Film,
  Trash2,
  Maximize2,
  Download,
  Sparkles,
  Plus,
  ZoomIn
} from 'lucide-react';
import { 
  Paciente, 
  TipoDocumento, 
  TipoEps, 
  TipoImagenDiagnostica, 
  ImagenDiagnostica 
} from '@/modules/pacientes/types';
import { PACIENTES_REGISTRADOS_BASE } from '@/modules/pacientes/datos';

const TIPOS_IMAGEN_DIAGNOSTICA: { id: TipoImagenDiagnostica; label: string; icon: string }[] = [
  { id: 'radiografia_panoramica', label: 'Radiografía Panorámica (Ortopantomografía)', icon: '🦷' },
  { id: 'radiografia_periapical', label: 'Radiografía Periapical', icon: '🔬' },
  { id: 'tomografia_cbct', label: 'Tomografía Computarizada 3D (CBCT)', icon: '🧬' },
  { id: 'fotografia_intraoral', label: 'Fotografía Intraoral', icon: '📸' },
  { id: 'fotografia_extraoral', label: 'Fotografía Extraoral / Facial', icon: '👤' },
  { id: 'cefalometria', label: 'Cefalometría / Teleradiografía', icon: '📐' },
  { id: 'otro', label: 'Otro Estudio Diagnóstico', icon: '📑' },
];

export default function GestionPacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>(PACIENTES_REGISTRADOS_BASE);
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroCondicion, setFiltroCondicion] = useState<'todos' | 'alergias' | 'enfermedades'>('todos');
  const [filtroEps, setFiltroEps] = useState<'todos' | 'Particular' | 'Ecopetrol'>('todos');
  
  // Modales y Visores
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);
  const [modalNuevoPaciente, setModalNuevoPaciente] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [visorImagen, setVisorImagen] = useState<ImagenDiagnostica | null>(null);

  // Estados de Imágenes Diagnósticas (Arrastrar y Soltar)
  const [imagenesNuevas, setImagenesNuevas] = useState<ImagenDiagnostica[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Formulario de Nuevo Paciente
  const [nuevoForm, setNuevoForm] = useState({
    tipoDocumento: 'CC' as TipoDocumento,
    numeroDocumento: '',
    eps: 'Particular' as TipoEps,
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    genero: 'Femenino' as 'Femenino' | 'Masculino' | 'Otro',
    ciudad: 'Bogotá',
    direccion: '',
    alergiasTexto: '',
    enfermedadesTexto: '',
    medicamentosTexto: '',
    grupoSanguineo: 'O+',
    contactoEmergenciaNombre: '',
    contactoEmergenciaTelefono: '',
    contactoEmergenciaParentesco: '',
    observaciones: '',
  });

  // Cálculo de edad aproximada
  const calcularEdad = (fechaNac: string) => {
    if (!fechaNac) return '-';
    const hoy = new Date();
    const cumple = new Date(fechaNac);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    const m = hoy.getMonth() - cumple.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
      edad--;
    }
    return edad;
  };

  // Filtrado de pacientes
  const pacientesFiltrados = pacientes.filter(p => {
    const texto = `${p.nombres} ${p.apellidos} ${p.numeroDocumento} ${p.telefono} ${p.email} ${p.eps || ''}`.toLowerCase();
    const coincideBusqueda = texto.includes(busqueda.toLowerCase());

    if (!coincideBusqueda) return false;

    if (filtroCondicion === 'alergias') {
      return p.alergias && p.alergias.length > 0;
    }
    if (filtroCondicion === 'enfermedades') {
      return p.enfermedadesPrevias && p.enfermedadesPrevias.length > 0;
    }

    if (filtroEps !== 'todos' && (p.eps || 'Particular') !== filtroEps) {
      return false;
    }

    return true;
  });

  // Funciones de Arrastrar y Soltar (Drag & Drop) de Imágenes Diagnósticas
  const formatearTamanoArchivo = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const inferirTipoImagen = (nombreArchivo: string): { tipo: TipoImagenDiagnostica; tipoLabel: string } => {
    const n = nombreArchivo.toLowerCase();
    if (n.includes('peria') || n.includes('apical')) {
      return { tipo: 'radiografia_periapical', tipoLabel: 'Radiografía Periapical' };
    }
    if (n.includes('tomo') || n.includes('cbct') || n.includes('3d') || n.includes('scan')) {
      return { tipo: 'tomografia_cbct', tipoLabel: 'Tomografía Computarizada 3D (CBCT)' };
    }
    if (n.includes('intra') || n.includes('diente') || n.includes('boca') || n.includes('oclus')) {
      return { tipo: 'fotografia_intraoral', tipoLabel: 'Fotografía Intraoral' };
    }
    if (n.includes('extra') || n.includes('rostro') || n.includes('facial') || n.includes('perfil')) {
      return { tipo: 'fotografia_extraoral', tipoLabel: 'Fotografía Extraoral / Facial' };
    }
    if (n.includes('cefa') || n.includes('tele') || n.includes('craneo')) {
      return { tipo: 'cefalometria', tipoLabel: 'Cefalometría / Teleradiografía' };
    }
    return { tipo: 'radiografia_panoramica', tipoLabel: 'Radiografía Panorámica (Ortopantomografía)' };
  };

  const procesarArchivosImagenes = (archivos: FileList | File[]) => {
    const lista = Array.from(archivos);
    lista.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = (e.target?.result as string) || '';
        const { tipo, tipoLabel } = inferirTipoImagen(file.name);
        const nuevaImg: ImagenDiagnostica = {
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          nombre: file.name,
          tipo,
          tipoLabel,
          url,
          tamano: formatearTamanoArchivo(file.size),
          fechaSubida: new Date().toISOString().split('T')[0],
          notas: '',
        };
        setImagenesNuevas(prev => [...prev, nuevaImg]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      procesarArchivosImagenes(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      procesarArchivosImagenes(e.target.files);
    }
  };

  const handleEliminarImagen = (idImg: string) => {
    setImagenesNuevas(prev => prev.filter(img => img.id !== idImg));
  };

  const handleCambiarTipoImagen = (idImg: string, nuevoTipo: TipoImagenDiagnostica) => {
    const encontrado = TIPOS_IMAGEN_DIAGNOSTICA.find(t => t.id === nuevoTipo);
    const label = encontrado ? encontrado.label : 'Estudio Diagnóstico';
    setImagenesNuevas(prev => prev.map(img => 
      img.id === idImg ? { ...img, tipo: nuevoTipo, tipoLabel: label } : img
    ));
  };

  const handleCambiarNotasImagen = (idImg: string, notas: string) => {
    setImagenesNuevas(prev => prev.map(img => 
      img.id === idImg ? { ...img, notas } : img
    ));
  };

  const handleCargarImagenesPrueba = () => {
    const fecha = new Date().toISOString().split('T')[0];
    const pruebas: ImagenDiagnostica[] = [
      {
        id: `img-demo-pano-${Date.now()}`,
        nombre: 'Ortopantomografia_Panoramica_Digital.jpg',
        tipo: 'radiografia_panoramica',
        tipoLabel: 'Radiografía Panorámica (Ortopantomografía)',
        url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80',
        tamano: '3.4 MB',
        fechaSubida: fecha,
        notas: 'Control general de arcadas y valoración de densidad ósea.',
      },
      {
        id: `img-demo-cbct-${Date.now()}`,
        nombre: 'Tomografia_CBCT_3D_Alta_Definicion.jpg',
        tipo: 'tomografia_cbct',
        tipoLabel: 'Tomografía Computarizada 3D (CBCT)',
        url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
        tamano: '8.2 MB',
        fechaSubida: fecha,
        notas: 'Estudio volumétrico tridimensional guiado para cirugía de precisión.',
      },
      {
        id: `img-demo-periapical-${Date.now()}`,
        nombre: 'Radiografia_Periapical_Sector_Molar.jpg',
        tipo: 'radiografia_periapical',
        tipoLabel: 'Radiografía Periapical',
        url: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=1200&q=80',
        tamano: '1.2 MB',
        fechaSubida: fecha,
        notas: 'Detalle de conductos radiculares pieza 36.',
      },
    ];
    setImagenesNuevas(prev => [...prev, ...pruebas]);
  };

  const handleAdjuntarImagenAPacienteSeleccionado = (archivos: FileList | File[]) => {
    if (!pacienteSeleccionado) return;
    const lista = Array.from(archivos);
    lista.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = (e.target?.result as string) || '';
        const { tipo, tipoLabel } = inferirTipoImagen(file.name);
        const nuevaImg: ImagenDiagnostica = {
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          nombre: file.name,
          tipo,
          tipoLabel,
          url,
          tamano: formatearTamanoArchivo(file.size),
          fechaSubida: new Date().toISOString().split('T')[0],
          notas: 'Adjuntado desde ficha clínica',
        };
        
        const actualizado: Paciente = {
          ...pacienteSeleccionado,
          imagenesDiagnosticas: [...(pacienteSeleccionado.imagenesDiagnosticas || []), nuevaImg]
        };
        setPacienteSeleccionado(actualizado);
        setPacientes(prev => prev.map(p => p.id === actualizado.id ? actualizado : p));
        setMensajeExito(`¡Imagen "${file.name}" adjuntada con éxito a la ficha del paciente!`);
        setTimeout(() => setMensajeExito(null), 4000);
      };
      reader.readAsDataURL(file);
    });
  };

  // Manejar creación de nuevo paciente
  const handleGuardarPaciente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoForm.nombres || !nuevoForm.apellidos || !nuevoForm.numeroDocumento) return;

    // Convertir textos separados por coma en arrays
    const parseLista = (txt: string) => 
      txt.split(',').map(s => s.trim()).filter(s => s.length > 0);

    const nuevo: Paciente = {
      id: `pac-${Date.now()}`,
      tipoDocumento: nuevoForm.tipoDocumento,
      numeroDocumento: nuevoForm.numeroDocumento,
      eps: nuevoForm.eps || 'Particular',
      nombres: nuevoForm.nombres,
      apellidos: nuevoForm.apellidos,
      email: nuevoForm.email,
      telefono: nuevoForm.telefono,
      fechaNacimiento: nuevoForm.fechaNacimiento,
      genero: nuevoForm.genero,
      ciudad: nuevoForm.ciudad,
      direccion: nuevoForm.direccion,
      alergias: parseLista(nuevoForm.alergiasTexto),
      enfermedadesPrevias: parseLista(nuevoForm.enfermedadesTexto),
      medicamentosActuales: parseLista(nuevoForm.medicamentosTexto),
      grupoSanguineo: nuevoForm.grupoSanguineo,
      contactoEmergenciaNombre: nuevoForm.contactoEmergenciaNombre,
      contactoEmergenciaTelefono: nuevoForm.contactoEmergenciaTelefono,
      contactoEmergenciaParentesco: nuevoForm.contactoEmergenciaParentesco,
      imagenesDiagnosticas: imagenesNuevas.length > 0 ? imagenesNuevas : undefined,
      observaciones: nuevoForm.observaciones,
      creadoEn: new Date().toISOString().split('T')[0],
    };

    setPacientes([nuevo, ...pacientes]);
    setModalNuevoPaciente(false);
    setMensajeExito(`¡Paciente ${nuevo.nombres} ${nuevo.apellidos} (${nuevo.eps}) registrado con éxito con ${imagenesNuevas.length} estudio(s) diagnósticos!`);
    setTimeout(() => setMensajeExito(null), 5000);

    // Reset formulario e imágenes
    setImagenesNuevas([]);
    setNuevoForm({
      tipoDocumento: 'CC',
      numeroDocumento: '',
      eps: 'Particular',
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      fechaNacimiento: '',
      genero: 'Femenino',
      ciudad: 'Bogotá',
      direccion: '',
      alergiasTexto: '',
      enfermedadesTexto: '',
      medicamentosTexto: '',
      grupoSanguineo: 'O+',
      contactoEmergenciaNombre: '',
      contactoEmergenciaTelefono: '',
      contactoEmergenciaParentesco: '',
      observaciones: '',
    });
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
                Gestión de Pacientes y Fichas Clínicas
              </h1>
              <p className="text-xs text-slate-500">Historial médico, antecedentes patológicos y datos demográficos</p>
            </div>
          </div>

          <button
            onClick={() => setModalNuevoPaciente(true)}
            className="inline-flex items-center gap-1.5 bg-dentist-600 hover:bg-dentist-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Paciente</span>
          </button>
        </div>
      </header>

      {/* Alerta de Éxito */}
      {mensajeExito && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{mensajeExito}</span>
            </div>
            <button onClick={() => setMensajeExito(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        
        {/* Métricas Rápidas de Pacientes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Total Pacientes Registrados</span>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{pacientes.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-dentist-50 text-dentist-600">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Con Alergias Médicas</span>
              <p className="text-2xl font-bold text-rose-600 mt-0.5">
                {pacientes.filter(p => p.alergias && p.alergias.length > 0).length}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Con Enfermedades Previas</span>
              <p className="text-2xl font-bold text-amber-600 mt-0.5">
                {pacientes.filter(p => p.enfermedadesPrevias && p.enfermedadesPrevias.length > 0).length}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nombre, documento o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-dentist-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filtroEps}
                onChange={(e) => setFiltroEps(e.target.value as any)}
                className="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-dentist-500 font-medium w-full sm:w-auto"
                title="Filtrar pacientes por EPS / Convenio"
              >
                <option value="todos">Todas las EPS</option>
                <option value="Particular">Particular</option>
                <option value="Ecopetrol">Ecopetrol</option>
              </select>
            </div>

            <select
              value={filtroCondicion}
              onChange={(e) => setFiltroCondicion(e.target.value as any)}
              className="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-dentist-500 w-full sm:w-auto"
            >
              <option value="todos">Todas las Condiciones</option>
              <option value="alergias">Solo con Alergias</option>
              <option value="enfermedades">Solo con Enfermedades</option>
            </select>
          </div>
        </div>

        {/* Tabla de Pacientes */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Paciente</th>
                  <th className="py-3.5 px-4">Documento & EPS</th>
                  <th className="py-3.5 px-4">Contacto Directo</th>
                  <th className="py-3.5 px-4">Edad / Género</th>
                  <th className="py-3.5 px-4">Alertas Clínicas (Alergias / Enfermedades)</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pacientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      No se encontraron pacientes que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  pacientesFiltrados.map((pac) => {
                    const tieneAlergias = pac.alergias && pac.alergias.length > 0;
                    const tieneEnfermedades = pac.enfermedadesPrevias && pac.enfermedadesPrevias.length > 0;

                    return (
                      <tr key={pac.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block text-sm">
                            {pac.nombres} {pac.apellidos}
                          </span>
                          <span className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {pac.ciudad}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <span className="font-semibold text-slate-800">{pac.tipoDocumento} {pac.numeroDocumento}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              pac.eps === 'Ecopetrol'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {pac.eps || 'Particular'}
                            </span>
                            <span className="text-[10px] text-slate-400">GS: {pac.grupoSanguineo || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <span className="font-medium text-slate-800 block flex items-center gap-1">
                            <Phone className="w-3 h-3 text-dentist-600" /> {pac.telefono}
                          </span>
                          <span className="text-slate-400 text-[11px]">{pac.email}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <span className="font-semibold text-slate-900">{calcularEdad(pac.fechaNacimiento)} años</span>
                          <span className="block text-[11px] text-slate-500">{pac.genero}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {tieneAlergias ? (
                              pac.alergias?.map((al, idx) => (
                                <span 
                                  key={idx}
                                  className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                >
                                  <ShieldAlert className="w-3 h-3 text-rose-600" />
                                  {al}
                                </span>
                              ))
                            ) : null}

                            {tieneEnfermedades ? (
                              pac.enfermedadesPrevias?.map((enf, idx) => (
                                <span 
                                  key={idx}
                                  className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                >
                                  <HeartPulse className="w-3 h-3 text-amber-600" />
                                  {enf}
                                </span>
                              ))
                            ) : null}

                            {!tieneAlergias && !tieneEnfermedades && (
                              <span className="text-slate-400 text-[11px] italic">Sin alertas reportadas</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => setPacienteSeleccionado(pac)}
                            className="inline-flex items-center gap-1 text-dentist-700 hover:text-dentist-900 font-semibold px-2.5 py-1 rounded-lg bg-dentist-50 hover:bg-dentist-100 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Ficha</span>
                          </button>
                          <Link
                            href="/dashboard/citas"
                            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-100 transition"
                            title="Agendar Cita para este paciente"
                          >
                            <CalendarPlus className="w-3.5 h-3.5 text-slate-500" />
                            <span>Cita</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ============================================================== */}
      {/* MODAL: FICHA COMPLETA DEL PACIENTE */}
      {/* ============================================================== */}
      {pacienteSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-scale-up">
            
            {/* Cabecera de la ficha */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-dentist-600 bg-dentist-50 px-2 py-0.5 rounded-md">
                    Ficha Odontológica Oficial
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                    pacienteSeleccionado.eps === 'Ecopetrol'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    EPS: {pacienteSeleccionado.eps || 'Particular'}
                  </span>
                </div>
                <h3 className="font-bold text-xl text-slate-900 mt-1">
                  {pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Identificación: <strong>{pacienteSeleccionado.tipoDocumento} {pacienteSeleccionado.numeroDocumento}</strong> • Registrado el {pacienteSeleccionado.creadoEn}
                </p>
              </div>
              <button 
                onClick={() => setPacienteSeleccionado(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* SECCIÓN 1: ANTECEDENTES MÉDICOS CRÍTICOS */}
            <div className="mt-5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                <span>Antecedentes Médicos Relevantes para Odontología</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Alergias */}
                <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
                  <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5 mb-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    Alergias a Medicamentos / Sustancias
                  </span>
                  {pacienteSeleccionado.alergias && pacienteSeleccionado.alergias.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {pacienteSeleccionado.alergias.map((a, i) => (
                        <span key={i} className="bg-white text-rose-800 text-xs font-semibold px-2 py-0.5 rounded border border-rose-200">
                          {a}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No reporta alergias conocidas.</p>
                  )}
                </div>

                {/* Enfermedades Sistémicas */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-amber-600" />
                    Enfermedades Previas / Sistémicas
                  </span>
                  {pacienteSeleccionado.enfermedadesPrevias && pacienteSeleccionado.enfermedadesPrevias.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {pacienteSeleccionado.enfermedadesPrevias.map((e, i) => (
                        <span key={i} className="bg-white text-amber-900 text-xs font-semibold px-2 py-0.5 rounded border border-amber-200">
                          {e}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No reporta antecedentes patológicos.</p>
                  )}
                </div>
              </div>

              {/* Medicamentos en uso y Grupo sanguíneo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5 text-dentist-600" />
                    Medicamentos que Consume Actualmente:
                  </span>
                  {pacienteSeleccionado.medicamentosActuales && pacienteSeleccionado.medicamentosActuales.length > 0 ? (
                    <p className="text-slate-800 font-medium">{pacienteSeleccionado.medicamentosActuales.join(', ')}</p>
                  ) : (
                    <p className="text-slate-400 italic">Ninguno reportado</p>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700 block mb-1">
                    Grupo Sanguíneo y Factor RH:
                  </span>
                  <p className="text-slate-900 font-bold text-sm">{pacienteSeleccionado.grupoSanguineo || 'No especificado'}</p>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: DATOS PERSONALES Y DEMOGRÁFICOS */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-dentist-600" />
                <span>Datos Personales y Contacto</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">EPS / Cobertura</span>
                  <span className={`font-bold ${pacienteSeleccionado.eps === 'Ecopetrol' ? 'text-emerald-700 font-extrabold' : 'text-slate-800'}`}>
                    {pacienteSeleccionado.eps || 'Particular'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Teléfono Principal</span>
                  <span className="font-semibold text-slate-800">{pacienteSeleccionado.telefono}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Correo Electrónico</span>
                  <span className="font-semibold text-slate-800">{pacienteSeleccionado.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Fecha de Nacimiento</span>
                  <span className="font-semibold text-slate-800">{pacienteSeleccionado.fechaNacimiento}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Ciudad y Dirección</span>
                  <span className="font-semibold text-slate-800">{pacienteSeleccionado.ciudad}, {pacienteSeleccionado.direccion || 'Sin dirección'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Contacto de Emergencia</span>
                  <span className="font-semibold text-slate-800">{pacienteSeleccionado.contactoEmergenciaNombre || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tel. Emergencia</span>
                  <span className="font-semibold text-slate-800">{pacienteSeleccionado.contactoEmergenciaTelefono || 'N/A'}</span>
                </div>
              </div>

              {pacienteSeleccionado.observaciones && (
                <div className="mt-3 p-3 bg-sky-50/60 rounded-xl border border-sky-100 text-xs">
                  <span className="font-bold text-sky-900 block mb-0.5">Observaciones Clínicas Especiales:</span>
                  <p className="text-slate-700">{pacienteSeleccionado.observaciones}</p>
                </div>
              )}
            </div>

            {/* SECCIÓN 3: ESTUDIOS RADIOLÓGICOS E IMÁGENES DIAGNÓSTICAS */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-dentist-600" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    Estudios Radiológicos e Imágenes Diagnósticas
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-dentist-100 text-dentist-800 border border-dentist-200">
                    {pacienteSeleccionado.imagenesDiagnosticas?.length || 0} disponibles
                  </span>
                </div>

                {/* Botón para adjuntar más imágenes a este paciente */}
                <div>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.dcm"
                    id={`input-adjuntar-detalle-${pacienteSeleccionado.id}`}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleAdjuntarImagenAPacienteSeleccionado(e.target.files);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor={`input-adjuntar-detalle-${pacienteSeleccionado.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-dentist-700 hover:text-dentist-900 bg-dentist-50 hover:bg-dentist-100 border border-dentist-200 px-3 py-1.5 rounded-xl cursor-pointer transition shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adjuntar Nuevo Estudio</span>
                  </label>
                </div>
              </div>

              {pacienteSeleccionado.imagenesDiagnosticas && pacienteSeleccionado.imagenesDiagnosticas.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {pacienteSeleccionado.imagenesDiagnosticas.map((img) => (
                    <div
                      key={img.id}
                      className="p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm flex gap-3 items-center group relative overflow-hidden"
                    >
                      {/* Miniatura con efecto negatoscopio */}
                      <div
                        onClick={() => setVisorImagen(img)}
                        className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-black overflow-hidden shrink-0 cursor-pointer border border-slate-700"
                        title="Clic para ampliar en Visor Radiológico de Alta Definición"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.nombre}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                          <ZoomIn className="w-5 h-5 text-dentist-400" />
                        </div>
                      </div>

                      {/* Detalles del estudio */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-dentist-500/20 text-dentist-300 border border-dentist-500/40 truncate">
                            {img.tipoLabel}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white truncate" title={img.nombre}>
                          {img.nombre}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {img.fechaSubida} • {img.tamano}
                        </p>
                        {img.notas && (
                          <p className="text-[11px] text-slate-300 italic truncate" title={img.notas}>
                            &quot;{img.notas}&quot;
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => setVisorImagen(img)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-dentist-400 hover:text-dentist-300 transition pt-0.5"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>Ver en Negatoscopio</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                  <Film className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                  <p className="font-semibold text-slate-700">Sin estudios diagnósticos adjuntos</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Puedes adjuntar radiografías periapicales, panorámicas o tomografías CBCT usando el botón superior.
                  </p>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Confidencialidad médica asegurada bajo la Ley de Protección de Datos en Salud.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPacienteSeleccionado(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cerrar
                </button>
                <Link
                  href="/dashboard/citas"
                  className="px-4 py-2 text-xs font-semibold bg-dentist-600 hover:bg-dentist-700 text-white rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Programar Cita</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: REGISTRAR NUEVO PACIENTE */}
      {/* ============================================================== */}
      {modalNuevoPaciente && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="font-bold text-base text-slate-900">Registrar Nuevo Paciente</h3>
                <p className="text-xs text-slate-500">Crea la ficha del paciente con sus antecedentes clínicos iniciales</p>
              </div>
              <button 
                onClick={() => setModalNuevoPaciente(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarPaciente} className="mt-4 space-y-4">
              
              {/* Sección 1: Datos Básicos */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  1. Datos de Identificación y Contacto
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo Documento *</label>
                    <select
                      value={nuevoForm.tipoDocumento}
                      onChange={e => setNuevoForm({ ...nuevoForm, tipoDocumento: e.target.value as TipoDocumento })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-1 focus:ring-dentist-500 font-medium bg-white"
                    >
                      <option value="CC">Cédula de Ciudadanía (CC)</option>
                      <option value="TI">Tarjeta de Identidad (TI)</option>
                      <option value="CE">Cédula de Extranjería (CE)</option>
                      <option value="Pasaporte">Pasaporte</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Número de Documento *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. 1020304050"
                      value={nuevoForm.numeroDocumento}
                      onChange={e => setNuevoForm({ ...nuevoForm, numeroDocumento: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-1 focus:ring-dentist-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      EPS / Cobertura *
                    </label>
                    <select
                      value={nuevoForm.eps}
                      onChange={e => setNuevoForm({ ...nuevoForm, eps: e.target.value as TipoEps })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-1 focus:ring-dentist-500 font-medium bg-white"
                    >
                      <option value="Particular">Particular</option>
                      <option value="Ecopetrol">Ecopetrol</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombres *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. María Camila"
                      value={nuevoForm.nombres}
                      onChange={e => setNuevoForm({ ...nuevoForm, nombres: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-1 focus:ring-dentist-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Apellidos *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Pérez Gómez"
                      value={nuevoForm.apellidos}
                      onChange={e => setNuevoForm({ ...nuevoForm, apellidos: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-1 focus:ring-dentist-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono Móvil *</label>
                    <input
                      type="text"
                      required
                      placeholder="+57 300 123 4567"
                      value={nuevoForm.telefono}
                      onChange={e => setNuevoForm({ ...nuevoForm, telefono: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-1 focus:ring-dentist-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={nuevoForm.email}
                      onChange={e => setNuevoForm({ ...nuevoForm, email: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-1 focus:ring-dentist-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha Nacimiento *</label>
                    <input
                      type="date"
                      required
                      value={nuevoForm.fechaNacimiento}
                      onChange={e => setNuevoForm({ ...nuevoForm, fechaNacimiento: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-1 focus:ring-dentist-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Antecedentes Médicos */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>2. Antecedentes Médicos Odontológicos</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Alergias a Medicamentos (separar por comas):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Penicilina, Látex, Ibuprofeno..."
                      value={nuevoForm.alergiasTexto}
                      onChange={e => setNuevoForm({ ...nuevoForm, alergiasTexto: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Enfermedades Previas / Sistémicas:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Hipertensión, Diabetes, Asma..."
                        value={nuevoForm.enfermedadesTexto}
                        onChange={e => setNuevoForm({ ...nuevoForm, enfermedadesTexto: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Medicamentos que toma actualmente:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Losartán, Aspirina, Insulina..."
                        value={nuevoForm.medicamentosTexto}
                        onChange={e => setNuevoForm({ ...nuevoForm, medicamentosTexto: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-1 focus:ring-dentist-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 3: Carga de Imágenes Diagnósticas (Arrastrar y Soltar) */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-dentist-800 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-dentist-600" />
                    <span>3. Imágenes Diagnósticas (Radiografías, Tomografías y Estudios)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleCargarImagenesPrueba}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition self-start sm:self-auto"
                    title="Cargar imágenes de muestra (Panorámica + CBCT 3D) para probar de inmediato"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>🧪 Cargar Imágenes de Prueba</span>
                  </button>
                </div>

                {/* Zona Drag & Drop */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                    isDragging 
                      ? 'border-dentist-600 bg-dentist-50/90 ring-4 ring-dentist-100 scale-[1.01]' 
                      : 'border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 hover:border-dentist-400'
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.dcm"
                    id="input-imagenes-diagnosticas"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="input-imagenes-diagnosticas"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-dentist-100 text-dentist-700 flex items-center justify-center shadow-xs">
                      <UploadCloud className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Arrastra y suelta aquí radiografías, tomografías CBCT o fotografías clínicas
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        o <span className="text-dentist-600 font-semibold underline">haz clic para examinar archivos</span> desde tu dispositivo
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-2 pt-1 text-[10px] text-slate-400">
                      <span className="px-2 py-0.5 bg-white rounded border border-slate-200">PNG, JPG, WEBP</span>
                      <span className="px-2 py-0.5 bg-white rounded border border-slate-200">DICOM / CBCT 3D</span>
                      <span className="px-2 py-0.5 bg-white rounded border border-slate-200">PDF Diagnósticos</span>
                    </div>
                  </label>
                </div>

                {/* Lista de Imágenes Cargadas */}
                {imagenesNuevas.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                      <span className="font-semibold text-dentist-700">
                        {imagenesNuevas.length} estudio(s) diagnósticos listos para adjuntar a la ficha:
                      </span>
                      <button
                        type="button"
                        onClick={() => setImagenesNuevas([])}
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-medium"
                      >
                        Limpiar todas
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-1">
                      {imagenesNuevas.map((img) => (
                        <div
                          key={img.id}
                          className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition flex gap-3 items-start"
                        >
                          {/* Miniatura con botón de previsualización */}
                          <div 
                            onClick={() => setVisorImagen(img)}
                            className="relative w-16 h-16 rounded-lg bg-slate-900 overflow-hidden shrink-0 cursor-pointer group border border-slate-200"
                            title="Clic para ver en el visor radiológico"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.url}
                              alt={img.nombre}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                              <Maximize2 className="w-4 h-4" />
                            </div>
                          </div>

                          {/* Datos y clasificación */}
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-1">
                              <p className="text-xs font-bold text-slate-900 truncate" title={img.nombre}>
                                {img.nombre}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleEliminarImagen(img.id)}
                                className="text-slate-400 hover:text-rose-600 p-0.5 shrink-0"
                                title="Eliminar esta imagen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                              <span className="font-semibold text-slate-700">{img.tamano}</span>
                              <span>•</span>
                              <span>{img.fechaSubida}</span>
                            </div>

                            {/* Selector de Tipo de Estudio */}
                            <select
                              value={img.tipo}
                              onChange={(e) => handleCambiarTipoImagen(img.id, e.target.value as TipoImagenDiagnostica)}
                              className="w-full text-[11px] py-1 px-2 rounded-lg border border-slate-300 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-dentist-500"
                            >
                              {TIPOS_IMAGEN_DIAGNOSTICA.map(t => (
                                <option key={t.id} value={t.id}>
                                  {t.icon} {t.label}
                                </option>
                              ))}
                            </select>

                            {/* Notas opcionales */}
                            <input
                              type="text"
                              placeholder="Notas clínicas (ej: Diente 46, prequirúrgico)..."
                              value={img.notas || ''}
                              onChange={(e) => handleCambiarNotasImagen(img.id, e.target.value)}
                              className="w-full text-[10px] py-1 px-2 rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-dentist-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sección 4: Contacto de Emergencia */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  4. Contacto de Emergencia
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      placeholder="Ej. Carlos Pérez"
                      value={nuevoForm.contactoEmergenciaNombre}
                      onChange={e => setNuevoForm({ ...nuevoForm, contactoEmergenciaNombre: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
                    <input
                      type="text"
                      placeholder="+57 311 000 0000"
                      value={nuevoForm.contactoEmergenciaTelefono}
                      onChange={e => setNuevoForm({ ...nuevoForm, contactoEmergenciaTelefono: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Parentesco</label>
                    <input
                      type="text"
                      placeholder="Ej. Padre / Esposo(a)"
                      value={nuevoForm.contactoEmergenciaParentesco}
                      onChange={e => setNuevoForm({ ...nuevoForm, contactoEmergenciaParentesco: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalNuevoPaciente(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-dentist-600 hover:bg-dentist-700 text-white rounded-xl shadow-sm transition"
                >
                  Guardar Ficha del Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ============================================================== */}
      {/* MODAL: VISOR RADIOLÓGICO / NEGATOSCOPIO DIGITAL DE PRECISIÓN */}
      {/* ============================================================== */}
      {visorImagen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-70 flex flex-col justify-between p-4 animate-fade-in">
          {/* Cabecera del visor */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-white max-w-7xl w-full mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-dentist-600/30 border border-dentist-500/50 flex items-center justify-center text-dentist-400">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-white">{visorImagen.nombre}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-dentist-500/20 text-dentist-300 border border-dentist-500/40">
                    {visorImagen.tipoLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Estudio del {visorImagen.fechaSubida} • Tamaño: {visorImagen.tamano}
                  {visorImagen.notas && ` • Observaciones: "${visorImagen.notas}"`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={visorImagen.url}
                target="_blank"
                rel="noopener noreferrer"
                download={visorImagen.nombre}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar / Abrir</span>
              </a>
              <button
                onClick={() => setVisorImagen(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                title="Cerrar visor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Área central con la imagen sobre fondo oscuro / negatoscopio */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden max-w-6xl w-full mx-auto">
            <div className="relative max-w-full max-h-[75vh] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={visorImagen.url}
                alt={visorImagen.nombre}
                className="max-w-full max-h-[75vh] object-contain mx-auto"
              />
            </div>
          </div>

          {/* Pie del visor */}
          <div className="max-w-7xl w-full mx-auto pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-dentist-400" />
              <span>Visor Diagnóstico Odontológico de Alta Fidelidad • Dra. Yasmín Blanco</span>
            </span>
            <button
              onClick={() => setVisorImagen(null)}
              className="px-4 py-1.5 bg-dentist-600 hover:bg-dentist-700 text-white rounded-xl text-xs font-semibold transition"
            >
              Cerrar Visor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
