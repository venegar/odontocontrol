'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Printer, 
  Save, 
  CheckCircle2, 
  Phone, 
  Eye
} from 'lucide-react';

import OdontogramaVisual from '@/modules/historias-clinicas/components/OdontogramaVisual';
import { DienteInfo, EstadoDiente, crearOdontogramaInicial } from '@/modules/historias-clinicas/types';
import { Paciente } from '@/modules/pacientes/types';
import { PACIENTES_REGISTRADOS_BASE } from '@/modules/pacientes/datos';
import { 
  obtenerPacientesStorage, 
  guardarPacientesStorage, 
  registrarPacienteNuevoStorage, 
  EVENTO_PACIENTES_ACTUALIZADOS 
} from '@/modules/pacientes/storage';
import { Presupuesto, ItemPresupuesto, ProcedimientoCatalogo, EstadoPresupuesto } from '@/modules/presupuestos/types';
import BuscadorAutocompletadoPaciente from '@/modules/pacientes/components/BuscadorAutocompletadoPaciente';
import { 
  CATALOGO_PROCEDIMIENTOS, 
  DATOS_ESPECIALISTA_DEFECTO, 
  formatearMonedaCOP,
  obtenerProcedimientosCatalogo
} from '@/modules/presupuestos/datos';
import DocumentoPresupuestoMembretado from '@/modules/presupuestos/components/DocumentoPresupuestoMembretado';

export default function ValoracionInicialPresupuestoPage() {
  // Lista de pacientes disponibles
  const [pacientes, setPacientes] = useState<Paciente[]>(PACIENTES_REGISTRADOS_BASE);
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState<string>('pac-danilsa-martinez');

  // Modo nuevo paciente rápido
  const [modoNuevoPaciente, setModoNuevoPaciente] = useState<boolean>(false);
  const [formNuevoPaciente, setFormNuevoPaciente] = useState({
    nombres: '',
    apellidos: '',
    tipoDocumento: 'CC' as const,
    numeroDocumento: '',
    edad: 30,
    telefono: '',
    eps: 'Particular' as const,
  });

  // Paciente actualmente activo
  const pacienteActivo = pacientes.find(p => p.id === pacienteSeleccionadoId) || pacientes[0];

  // Especialista a cargo
  const [especialistaSeleccionado, setEspecialistaSeleccionado] = useState({
    nombre: DATOS_ESPECIALISTA_DEFECTO.nombre,
    nit: DATOS_ESPECIALISTA_DEFECTO.nit,
    especialidad: DATOS_ESPECIALISTA_DEFECTO.especialidad,
    institucion: DATOS_ESPECIALISTA_DEFECTO.institucion,
  });

  // Odontograma del paciente
  const [odontograma, setOdontograma] = useState<Record<number, DienteInfo>>(
    pacienteActivo.odontograma || crearOdontogramaInicial()
  );
  const [piezaSeleccionada, setPiezaSeleccionada] = useState<number | null>(15);

  // Ítems del Presupuesto
  const [itemsPresupuesto, setItemsPresupuesto] = useState<ItemPresupuesto[]>(() => {
    // Si el paciente tiene presupuestos previos, cargar el último o inicializar con el caso de Danilsa
    if (pacienteActivo.presupuestos && pacienteActivo.presupuestos.length > 0) {
      return [...pacienteActivo.presupuestos[0].items];
    }
    return [
      {
        id: 'item-1',
        piezaDental: 15,
        tratamiento: 'PROVISIONAL A NIVEL DE ORGANO DENTARIO 15',
        categoria: 'Prostodoncia & Oclusión',
        valorUnidad: 150000,
        cantidad: 1,
        valorTotal: 150000,
      },
      {
        id: 'item-2',
        piezaDental: 15,
        tratamiento: 'NUCLEO A NIVEL DE ORGANO DENTARIO 15',
        categoria: 'Prostodoncia & Oclusión',
        valorUnidad: 400000,
        cantidad: 1,
        valorTotal: 400000,
      },
      {
        id: 'item-3',
        piezaDental: 15,
        tratamiento: 'CORONA INDIVIDUAL A NIVEL DE ORGANO DENTARIO 15',
        categoria: 'Prostodoncia & Oclusión',
        valorUnidad: 1200000,
        cantidad: 1,
        valorTotal: 1200000,
      },
    ];
  });

  // Observaciones y estado del presupuesto
  const [observaciones, setObservaciones] = useState<string>(
    'Tratamiento rehabilitador integral para pieza 15 posterior a endodoncia. Validez de la cotización: 30 días.'
  );
  const [estadoPresupuesto, setEstadoPresupuesto] = useState<EstadoPresupuesto>('aprobado');

  // Modal de formato membretado oficial
  const [modalImprimirAbierto, setModalImprimirAbierto] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Catálogo dinámico de tratamientos sincronizado con Datos de la Clínica
  const [procedimientosCatalogo, setProcedimientosCatalogo] = useState<ProcedimientoCatalogo[]>(CATALOGO_PROCEDIMIENTOS);

  useEffect(() => {
    setProcedimientosCatalogo(obtenerProcedimientosCatalogo());
    const handleTratamientosSync = () => {
      setProcedimientosCatalogo(obtenerProcedimientosCatalogo());
    };
    window.addEventListener('consultorio_tratamientos_actualizados', handleTratamientosSync);
    return () => window.removeEventListener('consultorio_tratamientos_actualizados', handleTratamientosSync);
  }, []);

  // Cargar lista de pacientes desde el almacenamiento unificado
  useEffect(() => {
    const lista = obtenerPacientesStorage();
    if (lista.length > 0) {
      setPacientes(lista);
      let idInicial = pacienteSeleccionadoId;
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const queryId = params.get('pacienteId') || params.get('paciente');
        if (queryId && lista.some(p => p.id === queryId)) {
          idInicial = queryId;
        }
      }
      if (!lista.some(p => p.id === idInicial)) {
        idInicial = lista[0].id;
      }
      setPacienteSeleccionadoId(idInicial);
    }

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
  }, []);

  // Al cambiar el paciente activo, actualizar su odontograma y presupuesto
  useEffect(() => {
    if (pacienteActivo.odontograma) {
      setOdontograma(pacienteActivo.odontograma);
    }
    if (pacienteActivo.presupuestos && pacienteActivo.presupuestos.length > 0) {
      const p = pacienteActivo.presupuestos[0];
      setItemsPresupuesto([...p.items]);
      setObservaciones(p.observaciones || '');
      setEstadoPresupuesto(p.estado || 'aprobado');
    }
  }, [pacienteSeleccionadoId]);

  // Actualizar una pieza en el odontograma
  const handleActualizarDiente = (numero: number, nuevoEstado: EstadoDiente, notas?: string) => {
    setOdontograma(prev => ({
      ...prev,
      [numero]: {
        numero,
        nombre: prev[numero]?.nombre || `Pieza ${numero}`,
        estado: nuevoEstado,
        notas: notas || prev[numero]?.notas,
      },
    }));
    setPiezaSeleccionada(numero);
  };

  // Calcular el total
  const totalPresupuesto = itemsPresupuesto.reduce((acc, item) => acc + (item.valorTotal || 0), 0);

  // Agregar procedimiento del catálogo a la tabla
  const handleAgregarDelCatalogo = (proc: ProcedimientoCatalogo, pieza?: number) => {
    const dienteNum = pieza || piezaSeleccionada || 15;
    let textoTratamiento = proc.nombre;

    if (proc.aplicaAOrganoDentario) {
      textoTratamiento = proc.formatoPlantilla 
        ? proc.formatoPlantilla.replace('{diente}', dienteNum.toString())
        : `${proc.nombre} A NIVEL DE ORGANO DENTARIO ${dienteNum}`;
    }

    const nuevoItem: ItemPresupuesto = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      piezaDental: proc.aplicaAOrganoDentario ? dienteNum : 'General',
      tratamiento: textoTratamiento,
      categoria: proc.categoria,
      valorUnidad: proc.precioSugerido,
      cantidad: 1,
      valorTotal: proc.precioSugerido * 1,
    };

    setItemsPresupuesto(prev => [...prev, nuevoItem]);
    setMensajeExito(`Procedimiento agregado al presupuesto: ${textoTratamiento}`);
    setTimeout(() => setMensajeExito(null), 3500);
  };

  // Agregar una fila personalizada en blanco
  const handleAgregarFilaLibre = () => {
    const nuevoItem: ItemPresupuesto = {
      id: `item-${Date.now()}`,
      piezaDental: piezaSeleccionada || undefined,
      tratamiento: piezaSeleccionada ? `TRATAMIENTO A NIVEL DE ORGANO DENTARIO ${piezaSeleccionada}` : '',
      valorUnidad: 0,
      cantidad: 1,
      valorTotal: 0,
    };
    setItemsPresupuesto(prev => [...prev, nuevoItem]);
  };

  // Modificar una fila existente
  const handleActualizarItem = (id: string, campo: keyof ItemPresupuesto, valor: string | number) => {
    setItemsPresupuesto(prev => prev.map(item => {
      if (item.id === id) {
        const itemActualizado = { ...item, [campo]: valor };
        if (campo === 'valorUnidad' || campo === 'cantidad') {
          const valU = campo === 'valorUnidad' ? Number(valor) || 0 : item.valorUnidad;
          const cant = campo === 'cantidad' ? Number(valor) || 0 : item.cantidad;
          itemActualizado.valorTotal = valU * cant;
        }
        return itemActualizado;
      }
      return item;
    }));
  };

  // Eliminar una fila
  const handleEliminarItem = (id: string) => {
    setItemsPresupuesto(prev => prev.filter(item => item.id !== id));
  };

  // Guardar nuevo paciente rápido
  const handleGuardarNuevoPaciente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNuevoPaciente.nombres || !formNuevoPaciente.numeroDocumento) return;

    const nuevo = registrarPacienteNuevoStorage({
      nombres: formNuevoPaciente.nombres,
      apellidos: formNuevoPaciente.apellidos,
      tipoDocumento: formNuevoPaciente.tipoDocumento,
      numeroDocumento: formNuevoPaciente.numeroDocumento,
      telefono: formNuevoPaciente.telefono || '+57 300 000 0000',
      fechaNacimiento: new Date(new Date().getFullYear() - formNuevoPaciente.edad, 0, 1).toISOString().split('T')[0],
      eps: formNuevoPaciente.eps,
    });

    const lista = obtenerPacientesStorage();
    setPacientes(lista);
    setPacienteSeleccionadoId(nuevo.id);
    setModoNuevoPaciente(false);
    setMensajeExito(`Paciente ${nuevo.nombres} ${nuevo.apellidos} registrado para valoración.`);
    setTimeout(() => setMensajeExito(null), 4000);
  };

  // Guardar valoración y presupuesto en el expediente del paciente
  const handleGuardarPresupuesto = () => {
    const presupuestoFinal: Presupuesto = {
      id: `pto-${Date.now()}`,
      codigo: `PTO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      pacienteId: pacienteActivo.id,
      pacienteNombre: `${pacienteActivo.nombres} ${pacienteActivo.apellidos}`.toUpperCase(),
      pacienteDocumento: pacienteActivo.numeroDocumento,
      pacienteEdad: pacienteActivo.fechaNacimiento ? new Date().getFullYear() - new Date(pacienteActivo.fechaNacimiento).getFullYear() : undefined,
      pacienteTelefono: pacienteActivo.telefono,
      pacienteEps: pacienteActivo.eps,
      doctorNombre: especialistaSeleccionado.nombre,
      doctorNit: especialistaSeleccionado.nit,
      doctorEspecialidad: especialistaSeleccionado.especialidad,
      doctorInstitucion: especialistaSeleccionado.institucion,
      fecha: new Date().toISOString().split('T')[0],
      items: itemsPresupuesto,
      subtotal: totalPresupuesto,
      total: totalPresupuesto,
      estado: estadoPresupuesto,
      observaciones: observaciones,
      odontogramaSnapshot: odontograma,
      creadoEn: new Date().toISOString().split('T')[0],
    };

    // Actualizar el paciente en el listado y almacenamiento centralizado
    const pacientesActualizados = pacientes.map(p => {
      if (p.id === pacienteActivo.id) {
        return {
          ...p,
          odontograma: odontograma,
          presupuestos: [presupuestoFinal, ...(p.presupuestos || [])],
        };
      }
      return p;
    });

    setPacientes(pacientesActualizados);
    guardarPacientesStorage(pacientesActualizados);

    setMensajeExito(`¡Valoración y Presupuesto ${presupuestoFinal.codigo} guardados exitosamente!`);
    setTimeout(() => setMensajeExito(null), 5000);
  };

  // Construir objeto de presupuesto para vista previa membretada
  const presupuestoParaImprimir: Presupuesto = {
    id: 'pto-preview',
    codigo: 'PTO-2026-OFICIAL',
    pacienteId: pacienteActivo.id,
    pacienteNombre: `${pacienteActivo.nombres} ${pacienteActivo.apellidos}`.toUpperCase(),
    pacienteDocumento: pacienteActivo.numeroDocumento,
    pacienteEdad: pacienteActivo.fechaNacimiento ? new Date().getFullYear() - new Date(pacienteActivo.fechaNacimiento).getFullYear() : 38,
    pacienteTelefono: pacienteActivo.telefono,
    pacienteEps: pacienteActivo.eps,
    doctorNombre: especialistaSeleccionado.nombre,
    doctorNit: especialistaSeleccionado.nit,
    doctorEspecialidad: especialistaSeleccionado.especialidad,
    doctorInstitucion: especialistaSeleccionado.institucion,
    fecha: new Date().toISOString().split('T')[0],
    items: itemsPresupuesto,
    subtotal: totalPresupuesto,
    total: totalPresupuesto,
    estado: estadoPresupuesto,
    observaciones: observaciones,
    creadoEn: new Date().toISOString().split('T')[0],
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Barra Superior de Navegación */}
      <header className="bg-white border-b sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link 
              href="/dashboard" 
              className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition"
              title="Volver al panel"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Consulta Inicial de Valoración & Presupuesto
                </h1>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Formato Oficial
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Odontograma diagnóstico y emisión de presupuesto membretado institucional
              </p>
            </div>
          </div>

          {/* Botones de Acción Superior */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalImprimirAbierto(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-sm"
              title="Ver formato oficial membretado idéntico al impreso"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Ver / Imprimir Membrete</span>
            </button>

            <button
              onClick={handleGuardarPresupuesto}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-dentist-600 hover:bg-dentist-700 text-white text-xs font-bold transition shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Valoración</span>
            </button>
          </div>
        </div>
      </header>

      {/* Banner de Mensaje Exitoso */}
      {mensajeExito && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-4 print:hidden">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs font-semibold shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{mensajeExito}</span>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Fila 1: Selección del Paciente & Datos Clínicos */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
            <div>
              <span className="text-xs font-bold text-dentist-600 uppercase tracking-wider">Paso 1: Identificación del Paciente</span>
              <h2 className="text-base font-bold text-slate-900">Paciente en Consulta de Valoración Inicial</h2>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 w-full md:w-auto">
              {!modoNuevoPaciente ? (
                <>
                  {/* Buscador inteligente con autocompletado */}
                  <div className="w-full sm:w-80">
                    <BuscadorAutocompletadoPaciente
                      pacientes={pacientes}
                      pacienteSeleccionadoId={pacienteSeleccionadoId}
                      onSeleccionarPaciente={(p) => setPacienteSeleccionadoId(p.id)}
                      onCrearNuevoPaciente={() => setModoNuevoPaciente(true)}
                      placeholder="Escribe el nombre o documento para autocompletar..."
                    />
                  </div>

                  {/* Selector tradicional para escoger paciente */}
                  <div className="relative w-full sm:w-64">
                    <select
                      value={pacienteSeleccionadoId}
                      onChange={(e) => {
                        if (e.target.value === '__NUEVO__') {
                          setModoNuevoPaciente(true);
                        } else {
                          setPacienteSeleccionadoId(e.target.value);
                        }
                      }}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-dentist-500 truncate"
                      title="O escoge directamente de la lista de pacientes registrados"
                    >
                      <optgroup label="Pacientes Registrados">
                        {pacientes.map(p => (
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
                </>
              ) : (
                <button
                  onClick={() => setModoNuevoPaciente(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
                >
                  ← Volver a seleccionar o buscar paciente existente
                </button>
              )}
            </div>
          </div>

          {/* Formulario de Paciente Nuevo Rápido */}
          {modoNuevoPaciente ? (
            <form onSubmit={handleGuardarNuevoPaciente} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nombres *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Danilsa"
                  value={formNuevoPaciente.nombres}
                  onChange={(e) => setFormNuevoPaciente({ ...formNuevoPaciente, nombres: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Apellidos *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Martínez"
                  value={formNuevoPaciente.apellidos}
                  onChange={(e) => setFormNuevoPaciente({ ...formNuevoPaciente, apellidos: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Cédula / Documento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 52893412"
                  value={formNuevoPaciente.numeroDocumento}
                  onChange={(e) => setFormNuevoPaciente({ ...formNuevoPaciente, numeroDocumento: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Edad Aproximada</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={formNuevoPaciente.edad}
                  onChange={(e) => setFormNuevoPaciente({ ...formNuevoPaciente, edad: parseInt(e.target.value) || 30 })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Teléfono Móvil (WhatsApp)</label>
                <input
                  type="text"
                  placeholder="+57 315 789 4321"
                  value={formNuevoPaciente.telefono}
                  onChange={(e) => setFormNuevoPaciente({ ...formNuevoPaciente, telefono: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">EPS / Convenio</label>
                <select
                  value={formNuevoPaciente.eps}
                  onChange={(e) => setFormNuevoPaciente({ ...formNuevoPaciente, eps: e.target.value as 'Particular' | 'Ecopetrol' })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Particular">Particular</option>
                  <option value="Ecopetrol">Ecopetrol</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full bg-dentist-600 hover:bg-dentist-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-xs"
                >
                  Confirmar y Registrar Paciente
                </button>
              </div>
            </form>
          ) : (
            /* Tarjeta Resumen del Paciente Activo */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-slate-50/80 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-dentist-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                  {pacienteActivo.nombres.substring(0, 1)}
                  {pacienteActivo.apellidos.substring(0, 1)}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 uppercase">
                    {pacienteActivo.nombres} {pacienteActivo.apellidos}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    {pacienteActivo.tipoDocumento}: {pacienteActivo.numeroDocumento}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">EPS / Régimen</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-extrabold ${
                  pacienteActivo.eps === 'Ecopetrol'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200 text-slate-700 border border-slate-300'
                }`}>
                  {pacienteActivo.eps || 'Particular'}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Edad: {pacienteActivo.fechaNacimiento ? `${new Date().getFullYear() - new Date(pacienteActivo.fechaNacimiento).getFullYear()} años` : '38 años'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Especialista a Cargo</span>
                <span className="text-xs font-bold text-slate-800 block">
                  {especialistaSeleccionado.nombre}
                </span>
                <span className="text-[11px] text-dentist-700 font-medium block">
                  {especialistaSeleccionado.especialidad}
                </span>
              </div>

              <div className="flex flex-col gap-1 text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Contacto Directo</span>
                <span className="text-xs font-bold text-slate-700 flex items-center justify-end gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  {pacienteActivo.telefono || 'Sin teléfono'}
                </span>
                <span className="text-[11px] text-slate-400">
                  Fecha: {new Date().toLocaleDateString('es-CO')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Fila 2: Odontograma Diagnóstico Interactivo */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
            <div>
              <span className="text-xs font-bold text-dentist-600 uppercase tracking-wider">Paso 2: Diagnóstico Clínico</span>
              <h2 className="text-base font-bold text-slate-900">
                Odontograma FDI de Valoración Inicial (32 Piezas Dentales)
              </h2>
              <p className="text-xs text-slate-500">
                Haz clic en cualquier pieza dental para marcar su estado y transferir de inmediato el tratamiento al presupuesto.
              </p>
            </div>

            {/* Accesos rápidos de procedimientos según la pieza seleccionada */}
            {piezaSeleccionada && (
              <div className="flex items-center gap-2 bg-dentist-50 border border-dentist-200 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-bold text-dentist-800">
                  Órgano Dentario {piezaSeleccionada}
                </span>
                <div className="h-4 w-[1px] bg-dentist-200"></div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAgregarDelCatalogo(procedimientosCatalogo[0] || CATALOGO_PROCEDIMIENTOS[0], piezaSeleccionada)}
                    className="text-[11px] font-bold bg-white hover:bg-dentist-600 hover:text-white text-dentist-800 border border-dentist-300 px-2 py-0.5 rounded transition cursor-pointer"
                    title="Añadir Provisional a este diente"
                  >
                    + Provisional
                  </button>
                  <button
                    onClick={() => handleAgregarDelCatalogo(procedimientosCatalogo[1] || CATALOGO_PROCEDIMIENTOS[1], piezaSeleccionada)}
                    className="text-[11px] font-bold bg-white hover:bg-dentist-600 hover:text-white text-dentist-800 border border-dentist-300 px-2 py-0.5 rounded transition cursor-pointer"
                    title="Añadir Núcleo a este diente"
                  >
                    + Núcleo
                  </button>
                  <button
                    onClick={() => handleAgregarDelCatalogo(procedimientosCatalogo[2] || CATALOGO_PROCEDIMIENTOS[2], piezaSeleccionada)}
                    className="text-[11px] font-bold bg-white hover:bg-dentist-600 hover:text-white text-dentist-800 border border-dentist-300 px-2 py-0.5 rounded transition cursor-pointer"
                    title="Añadir Corona Individual a este diente"
                  >
                    + Corona
                  </button>
                  <button
                    onClick={() => handleAgregarDelCatalogo(procedimientosCatalogo[7] || CATALOGO_PROCEDIMIENTOS[7] || procedimientosCatalogo[0], piezaSeleccionada)}
                    className="text-[11px] font-bold bg-white hover:bg-dentist-600 hover:text-white text-dentist-800 border border-dentist-300 px-2 py-0.5 rounded transition cursor-pointer"
                    title="Añadir Resina a este diente"
                  >
                    + Resina
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Visualizador del Odontograma */}
          <OdontogramaVisual
            dientes={odontograma}
            onActualizarDiente={handleActualizarDiente}
            soloLectura={false}
          />
        </div>

        {/* Fila 3: Presupuesto Odontológico Oficial (Tabla Interactiva) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
            <div>
              <span className="text-xs font-bold text-dentist-600 uppercase tracking-wider">Paso 3: Plan de Tratamiento & Cotización</span>
              <h2 className="text-base font-bold text-slate-900">
                Presupuesto Oficial de Procedimientos
              </h2>
              <p className="text-xs text-slate-500">
                Los procedimientos indicados se presentarán en la hoja membretada institucional de la Dra. Yasmín Blanco
              </p>
            </div>

            {/* Selector rápido del catálogo */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    const proc = procedimientosCatalogo.find(p => p.id === e.target.value);
                    if (proc) {
                      handleAgregarDelCatalogo(proc);
                      e.target.value = '';
                    }
                  }
                }}
                defaultValue=""
                className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-dentist-500"
              >
                <option value="" disabled>➕ Agregar del Catálogo Odontológico...</option>
                {procedimientosCatalogo.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({formatearMonedaCOP(p.precioSugerido)})
                  </option>
                ))}
              </select>

              <button
                onClick={handleAgregarFilaLibre}
                className="inline-flex items-center gap-1 text-xs font-bold bg-dentist-50 hover:bg-dentist-100 text-dentist-700 border border-dentist-200 px-3 py-2 rounded-xl transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Fila Libre</span>
              </button>
            </div>
          </div>

          {/* Tabla de Presupuesto Editable */}
          <div className="overflow-x-auto border-2 border-slate-900 rounded-xl mb-4">
            <table className="w-full text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-extrabold uppercase text-center">
                  <th className="py-2.5 px-3 text-left w-1/2 border-r border-slate-800">
                    TRATAMIENTO / PROCEDIMIENTO
                  </th>
                  <th className="py-2.5 px-3 w-1/6 border-r border-slate-800">
                    VALOR UNIDAD
                  </th>
                  <th className="py-2.5 px-3 w-1/12 border-r border-slate-800">
                    CANTIDAD
                  </th>
                  <th className="py-2.5 px-3 w-1/6 border-r border-slate-800">
                    VALOR TOTAL
                  </th>
                  <th className="py-2.5 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {itemsPresupuesto.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs italic">
                      No se han agregado procedimientos al presupuesto. Selecciona uno en el odontograma o catálogo.
                    </td>
                  </tr>
                ) : (
                  itemsPresupuesto.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <input
                          type="text"
                          value={item.tratamiento}
                          onChange={(e) => handleActualizarItem(item.id, 'tratamiento', e.target.value)}
                          placeholder="Ej. CORONA INDIVIDUAL A NIVEL DE ORGANO DENTARIO 15"
                          className="w-full uppercase font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-dentist-500 focus:outline-none py-1 text-xs sm:text-sm"
                        />
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-center">
                        <input
                          type="number"
                          step={10000}
                          value={item.valorUnidad}
                          onChange={(e) => handleActualizarItem(item.id, 'valorUnidad', parseFloat(e.target.value) || 0)}
                          className="w-28 text-center font-bold text-slate-800 bg-slate-50 rounded-lg border border-slate-200 py-1 text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-center">
                        <input
                          type="number"
                          min={1}
                          max={32}
                          value={item.cantidad}
                          onChange={(e) => handleActualizarItem(item.id, 'cantidad', parseInt(e.target.value) || 1)}
                          className="w-16 text-center font-bold text-slate-800 bg-slate-50 rounded-lg border border-slate-200 py-1 text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-right font-black text-slate-900 text-sm">
                        {formatearMonedaCOP(item.valorTotal)}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => handleEliminarItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                          title="Eliminar este tratamiento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}

                {/* Fila del Total */}
                <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-900">
                  <td className="py-3 px-4 uppercase tracking-wider text-sm sm:text-base border-r border-slate-300 text-right">
                    TOTAL PRESUPUESTO
                  </td>
                  <td className="border-r border-slate-300"></td>
                  <td className="border-r border-slate-300"></td>
                  <td className="py-3 px-3 text-right text-base sm:text-lg font-black text-dentist-700">
                    {formatearMonedaCOP(totalPresupuesto)}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Opciones adicionales: Observaciones y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Observaciones Médicas y Condiciones del Tratamiento:
              </label>
              <textarea
                rows={2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Indica la validez de la cotización, formas de pago, garantías o indicaciones clínicas..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dentist-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estado del Presupuesto:
              </label>
              <select
                value={estadoPresupuesto}
                onChange={(e) => setEstadoPresupuesto(e.target.value as EstadoPresupuesto)}
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-dentist-500 mb-3"
              >
                <option value="borrador">📝 En Elaboración / Borrador</option>
                <option value="aprobado">✅ Aprobado por el Paciente</option>
                <option value="en_tratamiento">🩺 En Curso / Tratamiento Iniciado</option>
              </select>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalImprimirAbierto(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Membrete</span>
                </button>

                <button
                  onClick={handleGuardarPresupuesto}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-dentist-600 hover:bg-dentist-700 text-white text-xs font-bold transition shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Modal con el Documento Membretado Oficial */}
      {modalImprimirAbierto && (
        <DocumentoPresupuestoMembretado
          presupuesto={presupuestoParaImprimir}
          onCerrar={() => setModalImprimirAbierto(false)}
          modoModal={true}
        />
      )}
    </div>
  );
}
