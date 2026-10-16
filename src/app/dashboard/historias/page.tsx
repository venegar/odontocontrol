'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  ClipboardList,
  FileSpreadsheet,
  Printer,
  Camera,
  Eye,
  X,
  Search,
  Filter,
  ArrowUpDown,
  ListChecks,
  Check,
  ChevronDown,
  UserPlus
} from 'lucide-react';
import OdontogramaVisual from '@/modules/historias-clinicas/components/OdontogramaVisual';
import FormularioRegistroDiagnosticoCita from '@/modules/historias-clinicas/components/FormularioRegistroDiagnosticoCita';
import ModalRegistroPacienteRapido from '@/modules/pacientes/components/ModalRegistroPacienteRapido';
import BuscadorAutocompletadoPaciente from '@/modules/pacientes/components/BuscadorAutocompletadoPaciente';
import { 
  DienteInfo, 
  EstadoDiente, 
  EvolucionClinica, 
  crearOdontogramaInicial,
  ESTADOS_DIENTE_CONFIG,
  NOMBRES_PIEZAS_FDI 
} from '@/modules/historias-clinicas/types';
import { Paciente, ImagenDiagnostica } from '@/modules/pacientes/types';
import { 
  obtenerPacientesStorage, 
  actualizarDienteOdontogramaStorage,
  EVENTO_PACIENTES_ACTUALIZADOS 
} from '@/modules/pacientes/storage';

function HistoriasClinicasContenido() {
  const searchParams = useSearchParams();
  const pacienteIdQuery = searchParams.get('pacienteId');
  const citaIdQuery = searchParams.get('citaId');
  const accionQuery = searchParams.get('accion');

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState<string>('');
  const [pestaña, setPestaña] = useState<'odontograma' | 'nueva-evolucion' | 'historial'>('odontograma');
  const [modalNuevoPacienteAbierto, setModalNuevoPacienteAbierto] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  
  // Visor modal para radiografías e imágenes de consultas
  const [imagenModal, setImagenModal] = useState<{ url: string; titulo: string } | null>(null);

  // Estados de Filtro y Ordenamiento de las Evoluciones
  const [busquedaTexto, setBusquedaTexto] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'valoracion_inicial' | 'evolucion_cita' | 'control_postoperatorio' | 'urgencia'>('todos');
  const [filtroPieza, setFiltroPieza] = useState<string>('todas');
  const [ordenEvoluciones, setOrdenEvoluciones] = useState<'recientes' | 'antiguas'>('recientes'); // Dejar arriba las más recientes

  // Cargar pacientes desde el almacenamiento centralizado
  useEffect(() => {
    const lista = obtenerPacientesStorage();
    setPacientes(lista);

    // Seleccionar paciente inicial basado en URL query o primer paciente
    if (pacienteIdQuery && lista.some((p) => p.id === pacienteIdQuery)) {
      setPacienteSeleccionadoId(pacienteIdQuery);
    } else if (lista.length > 0) {
      setPacienteSeleccionadoId(lista[0].id);
    }

    // Si viene la acción de registrar diagnóstico/evolución, abrir la pestaña correspondiente
    if (accionQuery === 'registrar-diagnostico') {
      setPestaña('nueva-evolucion');
    }

    // Escuchar eventos de sincronización entre módulos
    const handleActualizacion = (e: Event) => {
      const customEvent = e as CustomEvent<Paciente[]>;
      if (customEvent.detail) {
        setPacientes(customEvent.detail);
      } else {
        setPacientes(obtenerPacientesStorage());
      }
    };

    window.addEventListener(EVENTO_PACIENTES_ACTUALIZADOS, handleActualizacion);
    return () => window.removeEventListener(EVENTO_PACIENTES_ACTUALIZADOS, handleActualizacion);
  }, [pacienteIdQuery, accionQuery]);

  // Paciente actualmente activo
  const pacienteActivo: Paciente | undefined = pacientes.find((p) => p.id === pacienteSeleccionadoId) || pacientes[0];

  // Odontograma del paciente activo
  const dientesActivos: Record<number, DienteInfo> = pacienteActivo?.odontograma || crearOdontogramaInicial();

  // Historial de evoluciones del paciente activo
  const evolucionesActivas: EvolucionClinica[] = pacienteActivo?.evoluciones || [];

  // Actualizar una pieza en el odontograma directamente
  const handleActualizarDiente = (numero: number, nuevoEstado: EstadoDiente, notas?: string) => {
    if (!pacienteActivo) return;

    const pacienteActualizado = actualizarDienteOdontogramaStorage(
      pacienteActivo.id,
      numero,
      nuevoEstado,
      notas
    );

    if (pacienteActualizado) {
      setPacientes((prev) => prev.map((p) => (p.id === pacienteActualizado.id ? pacienteActualizado : p)));
      setMensajeExito(`Pieza ${numero} actualizada en el odontograma a: ${nuevoEstado.toUpperCase()}`);
      setTimeout(() => setMensajeExito(null), 4000);
    }
  };

  // Callback cuando se guarda exitosamente una nueva evolución desde el formulario
  const handleDiagnosticoGuardado = (
    evolucion: EvolucionClinica,
    nuevoEstadoDiente?: EstadoDiente,
    dienteNumero?: number
  ) => {
    // Recargar pacientes
    const listaActualizada = obtenerPacientesStorage();
    setPacientes(listaActualizada);

    const detallePieza = dienteNumero && nuevoEstadoDiente
      ? ` Odontograma actualizado: Pieza ${dienteNumero} marcada como ${nuevoEstadoDiente.toUpperCase()}.`
      : '';

    setMensajeExito(`¡Evolución clínica registrada con éxito!${detallePieza}`);
    
    // Cambiar a la pestaña de historial para ver la evolución recién registrada arriba de todo
    setPestaña('historial');
    setTimeout(() => setMensajeExito(null), 6000);
  };

  // Convertir hora y fecha para ordenar cronológicamente
  const parseTimestamp = (fechaStr: string, horaStr?: string): number => {
    if (!fechaStr) return 0;
    let hora24 = '12:00:00';
    if (horaStr) {
      const match = horaStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = match[2];
        const ampm = match[3] ? match[3].toUpperCase() : null;
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        hora24 = `${h.toString().padStart(2, '0')}:${m}:00`;
      }
    }
    const d = new Date(`${fechaStr}T${hora24}`);
    return isNaN(d.getTime()) ? new Date(fechaStr).getTime() || 0 : d.getTime();
  };

  // Filtrado y Ordenamiento: dejando arriba las más recientes por defecto
  const evolucionesFiltradas = evolucionesActivas
    .filter((evo) => {
      // 1. Filtro por tipo de consulta
      if (filtroTipo !== 'todos') {
        const esValoracion =
          evo.tipoConsulta === 'valoracion_inicial' ||
          evo.motivoConsulta.toLowerCase().includes('valoración inicial') ||
          evo.motivoConsulta.toLowerCase().includes('valoracion inicial') ||
          evo.diagnostico.toLowerCase().includes('valoración');

        if (filtroTipo === 'valoracion_inicial' && !esValoracion) return false;
        if (
          filtroTipo === 'evolucion_cita' &&
          (esValoracion ||
            evo.tipoConsulta === 'control_postoperatorio' ||
            evo.tipoConsulta === 'urgencia')
        )
          return false;
        if (filtroTipo === 'control_postoperatorio' && evo.tipoConsulta !== 'control_postoperatorio') return false;
        if (filtroTipo === 'urgencia' && evo.tipoConsulta !== 'urgencia') return false;
      }

      // 2. Filtro por pieza dental
      if (filtroPieza !== 'todas') {
        if (filtroPieza === 'general') {
          if (evo.dienteNumero) return false;
        } else {
          if (String(evo.dienteNumero) !== filtroPieza && !evo.piezaDental?.includes(filtroPieza)) return false;
        }
      }

      // 3. Filtro por texto de búsqueda
      if (busquedaTexto.trim()) {
        const q = busquedaTexto.toLowerCase();
        const doc = evo.doctorNombre.toLowerCase();
        const diag = evo.diagnostico.toLowerCase();
        const proc = evo.procedimiento.toLowerCase();
        const mot = evo.motivoConsulta.toLowerCase();
        const pieza = evo.piezaDental ? evo.piezaDental.toLowerCase() : '';
        const procs = evo.procedimientosRealizados ? evo.procedimientosRealizados.join(' ').toLowerCase() : '';

        if (!doc.includes(q) && !diag.includes(q) && !proc.includes(q) && !mot.includes(q) && !pieza.includes(q) && !procs.includes(q)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const tA = parseTimestamp(a.fecha, a.hora);
      const tB = parseTimestamp(b.fecha, b.hora);
      return ordenEvoluciones === 'recientes' ? tB - tA : tA - tB;
    });

  if (!pacienteActivo) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-600">Cargando expediente clínico del paciente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* BARRA SUPERIOR INSTITUCIONAL */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-2xs">
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

          {/* Buscador Autocompletador y Selector de Paciente Activo */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block w-64 lg:w-72">
              <BuscadorAutocompletadoPaciente
                pacientes={pacientes}
                pacienteSeleccionadoId={pacienteSeleccionadoId}
                onSeleccionarPaciente={(p) => setPacienteSeleccionadoId(p.id)}
                onCrearNuevoPaciente={() => setModalNuevoPacienteAbierto(true)}
                placeholder="Autocompletar paciente..."
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-600 hidden lg:inline">O escoger:</span>
              <select
                value={pacienteSeleccionadoId}
                onChange={(e) => {
                  if (e.target.value === '__NUEVO__') {
                    setModalNuevoPacienteAbierto(true);
                  } else {
                    setPacienteSeleccionadoId(e.target.value);
                  }
                }}
                className="text-xs bg-slate-100 font-bold border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-dentist-500 max-w-[170px] sm:max-w-[220px] truncate"
              >
                <optgroup label="Pacientes Registrados">
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombres} {p.apellidos} ({p.tipoDocumento} {p.numeroDocumento})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Acciones">
                  <option value="__NUEVO__">+ Registrar Paciente Nuevo...</option>
                </optgroup>
              </select>
            </div>

            {/* BOTÓN PROMINENTE: REGISTRAR PACIENTE NUEVO */}
            <button
              type="button"
              onClick={() => setModalNuevoPacienteAbierto(true)}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold px-3 py-2 rounded-xl transition shadow-2xs whitespace-nowrap active:scale-95"
              title="Registrar un nuevo paciente para atención clínica"
            >
              <UserPlus className="w-4 h-4 text-dentist-600" />
              <span className="hidden sm:inline">+ Paciente Nuevo</span>
            </button>

            {/* BOTÓN PROMINENTE: AÑADIR NUEVA EVOLUCIÓN */}
            <button
              type="button"
              onClick={() => setPestaña('nueva-evolucion')}
              className="inline-flex items-center gap-1.5 bg-dentist-600 hover:bg-dentist-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs whitespace-nowrap active:scale-95"
              title="Añadir una nueva evolución de cita para este paciente"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Añadir Nueva Evolución</span>
            </button>

            <Link
              href="/dashboard/valoracion"
              className="hidden lg:inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs whitespace-nowrap"
              title="Realizar consulta inicial de valoración con odontograma y presupuesto oficial"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Valoración & Presupuesto</span>
            </Link>
          </div>
        </div>
      </header>

      {/* BANNER DE NOTIFICACIÓN DE ÉXITO */}
      {mensajeExito && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold shadow-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{mensajeExito}</span>
            </div>
            <button
              onClick={() => setMensajeExito(null)}
              className="text-emerald-700 hover:text-emerald-900 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* TARJETA RESUMEN DEL PACIENTE ACTIVO */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-dentist-600 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-xs">
              {pacienteActivo.nombres.substring(0, 1)}
              {pacienteActivo.apellidos.substring(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-sm sm:text-base text-slate-900">
                  {pacienteActivo.nombres} {pacienteActivo.apellidos}
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {pacienteActivo.tipoDocumento} {pacienteActivo.numeroDocumento}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                  pacienteActivo.eps === 'Ecopetrol'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}>
                  EPS: {pacienteActivo.eps || 'Particular'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tel: {pacienteActivo.telefono} • Ciudad: {pacienteActivo.ciudad || 'Bogotá'}
              </p>
            </div>
          </div>

          {/* Alertas médicas y antecedentes */}
          <div className="flex flex-wrap items-center gap-2">
            {pacienteActivo.alergias && pacienteActivo.alergias.length > 0 ? (
              pacienteActivo.alergias.map((al, i) => (
                <span 
                  key={i} 
                  className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1 rounded-lg text-xs font-bold"
                  title="Alergia confirmada en expediente"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  Alérgico a: {al}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Sin alergias reportadas</span>
            )}

            {pacienteActivo.enfermedadesPrevias && pacienteActivo.enfermedadesPrevias.length > 0 && (
              <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-semibold">
                <HeartPulse className="w-3.5 h-3.5 text-amber-600" />
                {pacienteActivo.enfermedadesPrevias.join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* PESTAÑAS DE NAVEGACIÓN */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setPestaña('odontograma')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              pestaña === 'odontograma'
                ? 'bg-dentist-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Odontograma Visual (FDI)</span>
          </button>

          <button
            onClick={() => setPestaña('nueva-evolucion')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              pestaña === 'nueva-evolucion'
                ? 'bg-dentist-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Nueva Evolución de Cita</span>
          </button>

          <button
            onClick={() => setPestaña('historial')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              pestaña === 'historial'
                ? 'bg-dentist-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Historial de Evoluciones & Consultas ({evolucionesActivas.length})</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* PESTAÑA 1: ODONTOGRAMA VISUAL (FDI) */}
        {/* ========================================================================= */}
        {pestaña === 'odontograma' && (
          <div className="space-y-4">
            {/* Render del Odontograma Interactivo FDI */}
            <OdontogramaVisual 
              dientes={dientesActivos} 
              onActualizarDiente={handleActualizarDiente} 
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* PESTAÑA 2: FORMULARIO PARA AÑADIR NUEVA EVOLUCIÓN DE CITA */}
        {/* ========================================================================= */}
        {pestaña === 'nueva-evolucion' && (
          <FormularioRegistroDiagnosticoCita
            paciente={pacienteActivo}
            pacientesDisponibles={pacientes}
            citaIdInicial={citaIdQuery || undefined}
            onCambiarPaciente={(nuevoId) => setPacienteSeleccionadoId(nuevoId)}
            onRegistrarNuevoPaciente={() => setModalNuevoPacienteAbierto(true)}
            onGuardarExito={handleDiagnosticoGuardado}
            onCancelar={() => setPestaña('historial')}
          />
        )}

        {/* ========================================================================= */}
        {/* PESTAÑA 3: HISTORIAL DE EVOLUCIONES CON FILTROS Y MÁS RECIENTES ARRIBA */}
        {/* ========================================================================= */}
        {pestaña === 'historial' && (
          <div className="space-y-4">
            
            {/* ENCABEZADO DEL EXPEDIENTE */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-dentist-600" />
                  <span>Expediente de Evoluciones Clínicas</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seguimiento de la evolución del paciente desde su valoración inicial y en cada cita asistida
                </p>
              </div>
            </div>

            {/* BARRA DE FILTROS Y ORDENAMIENTO (CON LAS MÁS RECIENTES ARRIBA) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                
                {/* 1. Buscador por texto */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar procedimiento, diagnóstico..."
                    value={busquedaTexto}
                    onChange={(e) => setBusquedaTexto(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-dentist-500"
                  />
                  {busquedaTexto && (
                    <button
                      onClick={() => setBusquedaTexto('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* 2. Filtro por Tipo de Consulta */}
                <div>
                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value as 'todos' | 'valoracion_inicial' | 'evolucion_cita' | 'control_postoperatorio' | 'urgencia')}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-dentist-500 font-medium"
                  >
                    <option value="todos">Todos los Tipos de Consulta</option>
                    <option value="valoracion_inicial">📋 Valoración Inicial</option>
                    <option value="evolucion_cita">🩺 Evoluciones de Citas</option>
                    <option value="control_postoperatorio">🩹 Controles Post-Operatorios</option>
                    <option value="urgencia">🚨 Atenciones de Urgencia</option>
                  </select>
                </div>

                {/* 3. Filtro por Pieza Dental */}
                <div>
                  <select
                    value={filtroPieza}
                    onChange={(e) => setFiltroPieza(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-dentist-500 font-medium"
                  >
                    <option value="todas">Todas las piezas dentales</option>
                    <option value="general">Procedimientos Generales</option>
                    {Object.keys(NOMBRES_PIEZAS_FDI).map((num) => (
                      <option key={num} value={num}>Pieza #{num} - {NOMBRES_PIEZAS_FDI[Number(num)]}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Selector de Orden: Dejar arriba las más recientes */}
                <div>
                  <select
                    value={ordenEvoluciones}
                    onChange={(e) => setOrdenEvoluciones(e.target.value as 'recientes' | 'antiguas')}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-dentist-500 font-bold text-slate-800"
                  >
                    <option value="recientes">🔽 Más recientes arriba (Predeterminado)</option>
                    <option value="antiguas">🔼 Más antiguas arriba (Progresión)</option>
                  </select>
                </div>
              </div>

              {/* Conteo de resultados */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span>
                  Mostrando <strong>{evolucionesFiltradas.length}</strong> de <strong>{evolucionesActivas.length}</strong> registros clínicos
                </span>
                {(busquedaTexto || filtroTipo !== 'todos' || filtroPieza !== 'todas') && (
                  <button
                    onClick={() => {
                      setBusquedaTexto('');
                      setFiltroTipo('todos');
                      setFiltroPieza('todas');
                    }}
                    className="text-dentist-600 hover:text-dentist-800 font-bold"
                  >
                    Restablecer filtros
                  </button>
                )}
              </div>
            </div>

            {/* LISTA DE EVOLUCIONES FILTRADAS Y ORDENADAS */}
            {evolucionesFiltradas.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-700">No se encontraron evoluciones</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {evolucionesActivas.length === 0
                    ? 'Este paciente aún no cuenta con notas de evolución o diagnósticos registrados.'
                    : 'Ningún registro coincide con los filtros de búsqueda aplicados.'}
                </p>
                <button
                  type="button"
                  onClick={() => setPestaña('nueva-evolucion')}
                  className="mt-4 px-4 py-2 bg-dentist-600 text-white rounded-xl text-xs font-bold hover:bg-dentist-700 shadow-xs"
                >
                  Registrar primera evolución
                </button>
              </div>
            ) : (
              evolucionesFiltradas.map((evo, index) => {
                const esValoracion = 
                  evo.tipoConsulta === 'valoracion_inicial' ||
                  evo.motivoConsulta.toLowerCase().includes('valoración inicial') ||
                  evo.motivoConsulta.toLowerCase().includes('valoracion inicial') ||
                  evo.diagnostico.toLowerCase().includes('valoración');

                const esControl = evo.tipoConsulta === 'control_postoperatorio';
                const esUrgencia = evo.tipoConsulta === 'urgencia';

                return (
                  <div 
                    key={evo.id} 
                    className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-sm transition space-y-4"
                  >
                    {/* Encabezado de la evolución */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        
                        {/* BADGE DE TIPO DE CONSULTA / EVOLUCIÓN */}
                        {esValoracion ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded-full">
                            <ClipboardList className="w-3.5 h-3.5 text-purple-700" />
                            <span>Valoración Inicial</span>
                          </span>
                        ) : esControl ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            <span>🩹 Control Post-Operatorio</span>
                          </span>
                        ) : esUrgencia ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-rose-100 text-rose-900 border border-rose-200 px-2.5 py-0.5 rounded-full">
                            <span>🚨 Atención de Urgencia</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-dentist-50 text-dentist-800 border border-dentist-200 px-2.5 py-0.5 rounded-full">
                            <Stethoscope className="w-3.5 h-3.5 text-dentist-600" />
                            <span>Evolución de Cita</span>
                          </span>
                        )}

                        <span className="font-bold text-sm text-slate-900">{evo.doctorNombre}</span>

                        {evo.piezaDental && (
                          <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md border border-slate-200">
                            {evo.piezaDental}
                          </span>
                        )}

                        {evo.nuevoEstadoDiente && (
                          <span className="text-xs bg-sky-50 text-sky-800 font-bold px-2 py-0.5 rounded-md border border-sky-200 flex items-center gap-1">
                            Odontograma: {evo.nuevoEstadoDiente.toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Fecha y Hora con indicador si es la más reciente */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        {ordenEvoluciones === 'recientes' && index === 0 && (
                          <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-300 animate-pulse">
                            Más Reciente
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-dentist-600" /> {evo.fecha}
                        </span>
                        {evo.hora && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> {evo.hora}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* PROCEDIMIENTOS REALIZADOS EN LA CITA (CHIPS DESTACADOS) */}
                    {evo.procedimientosRealizados && evo.procedimientosRealizados.length > 0 && (
                      <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                        <span className="text-[11px] font-bold text-emerald-950 block mb-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Procedimientos Realizados en esta Cita ({evo.procedimientosRealizados.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {evo.procedimientosRealizados.map((proc, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-[11px] bg-white text-emerald-900 font-semibold px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs"
                            >
                              <span>✓</span>
                              <span>{proc}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Motivo y Diagnóstico Clínico */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-semibold text-slate-500 block mb-0.5">Motivo de Consulta y Síntomas:</span>
                        <p className="text-slate-800">{evo.motivoConsulta}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500 block mb-0.5">Diagnóstico Odontológico:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-slate-900 font-bold">{evo.diagnostico}</p>
                          {evo.diagnosticoCie10 && (
                            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded-md border border-slate-200">
                              CIE-10: {evo.diagnosticoCie10}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Procedimiento Realizado y Anestesia */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1">
                      <span className="font-bold text-slate-700 block">Detalle Clínico del Procedimiento:</span>
                      <p className="text-slate-800 leading-relaxed font-sans">{evo.procedimiento}</p>
                      {evo.anestesia && (
                        <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 mt-1">
                          <strong>Técnica Anestésica:</strong> {evo.anestesia}
                        </p>
                      )}
                    </div>

                    {/* Radiografías o Imágenes Diagnósticas Adjuntas */}
                    {evo.imagenesAdjuntas && evo.imagenesAdjuntas.length > 0 && (
                      <div className="pt-1">
                        <span className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-dentist-600" />
                          Imágenes Diagnósticas y Radiografías Tomadas en la Cita ({evo.imagenesAdjuntas.length}):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {evo.imagenesAdjuntas.map((img) => (
                            <div 
                              key={img.id} 
                              onClick={() => setImagenModal({ url: img.url, titulo: img.nombre })}
                              className="group cursor-pointer rounded-xl border border-slate-200 overflow-hidden bg-slate-100 hover:shadow-xs transition relative"
                            >
                              <img
                                src={img.url}
                                alt={img.nombre}
                                className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="p-1.5 bg-white">
                                <p className="text-[10px] font-semibold text-slate-800 truncate">{img.nombre}</p>
                              </div>
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Eye className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prescripción e Indicaciones */}
                    {(evo.prescripcion || evo.indicaciones || evo.proximoControl) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                        {evo.prescripcion && (
                          <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl">
                            <span className="font-bold text-sky-900 block flex items-center gap-1 mb-0.5">
                              <Pill className="w-3.5 h-3.5 text-sky-600" /> Prescripción Médica:
                            </span>
                            <p className="text-sky-800 font-medium">{evo.prescripcion}</p>
                          </div>
                        )}
                        {evo.indicaciones && (
                          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                            <span className="font-bold text-emerald-900 block mb-0.5">Indicaciones Post-Operatorias:</span>
                            <p className="text-emerald-800">{evo.indicaciones}</p>
                          </div>
                        )}
                        {evo.proximoControl && (
                          <div className="md:col-span-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px] flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span><strong>Próximo Control:</strong> {evo.proximoControl}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Botón para imprimir nota de consulta */}
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition"
                        title="Imprimir esta evolución clínica"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir Nota</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* MODAL VISOR DE RADIOGRAFÍAS / IMÁGENES DIAGNÓSTICAS */}
      {imagenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h4 className="font-bold text-sm text-slate-900 truncate">{imagenModal.titulo}</h4>
              <button
                type="button"
                onClick={() => setImagenModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[75vh] overflow-auto">
              <img
                src={imagenModal.url}
                alt={imagenModal.titulo}
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setImagenModal(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-200 hover:bg-slate-300 rounded-xl"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Registro Rápido de Paciente Nuevo */}
      <ModalRegistroPacienteRapido
        abierto={modalNuevoPacienteAbierto}
        alCerrar={() => setModalNuevoPacienteAbierto(false)}
        alRegistrarExitoso={(nuevoPaciente) => {
          const listaActualizada = obtenerPacientesStorage();
          setPacientes(listaActualizada);
          setPacienteSeleccionadoId(nuevoPaciente.id);
          setPestaña('nueva-evolucion');
          setMensajeExito(`Paciente ${nuevoPaciente.nombres} ${nuevoPaciente.apellidos} registrado exitosamente. Listo para atención clínica.`);
          setTimeout(() => setMensajeExito(null), 5000);
        }}
      />
    </div>
  );
}

export default function HistoriasClinicasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <p className="text-xs font-semibold text-slate-500">Cargando Historias Clínicas y Odontograma...</p>
      </div>
    }>
      <HistoriasClinicasContenido />
    </Suspense>
  );
}
