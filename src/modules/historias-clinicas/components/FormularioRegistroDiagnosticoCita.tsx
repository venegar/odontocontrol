'use client';

import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Sparkles, 
  AlertTriangle, 
  ShieldAlert, 
  HeartPulse, 
  Calendar, 
  Clock, 
  Pill, 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  X, 
  Camera, 
  Plus, 
  Trash2, 
  Bookmark, 
  Check,
  ListChecks,
  Tag,
  Package,
  FlaskConical,
  UserPlus
} from 'lucide-react';
import { 
  EvolucionClinica, 
  EstadoDiente, 
  ESTADOS_DIENTE_CONFIG, 
  NOMBRES_PIEZAS_FDI, 
  DIAGNOSTICOS_ODONTOLOGICOS_FRECUENTES,
  DiagnosticoFrecuente,
  CATALOGO_PROCEDIMIENTOS_CITA
} from '../types';
import { Paciente, ImagenDiagnostica, TipoImagenDiagnostica } from '@/modules/pacientes/types';
import { registrarDiagnosticoCitaStorage } from '@/modules/pacientes/storage';
import { obtenerInsumos, descontarInsumosProcedimientoFEFO } from '@/modules/inventario/actions';
import { Insumo } from '@/modules/inventario/types';

interface FormularioRegistroDiagnosticoCitaProps {
  paciente: Paciente;
  pacientesDisponibles?: Paciente[];
  citaIdInicial?: string;
  onCambiarPaciente?: (pacienteId: string) => void;
  onRegistrarNuevoPaciente?: () => void;
  onGuardarExito: (evolucion: EvolucionClinica, nuevoEstadoDiente?: EstadoDiente, dienteNumero?: number) => void;
  onCancelar?: () => void;
}

const DOCTORES_CONSULTORIO = [
  'Dra. Yasmín Blanco (Esp. Prostodoncia y ATM)',
  'Dr. Carlos Ruiz (Odontología General)',
  'Dra. Laura Vega (Ortodoncia y Estética)'
];

const TIPOS_ANESTESIA = [
  'Sin anestesia requerida',
  'Anestesia tópica en gel (Benzocaína 20%)',
  'Infiltrativa local: Lidocaína 2% con Epinefrina 1:80.000',
  'Infiltrativa local: Mepivacaína 3% sin vasoconstrictor',
  'Troncular / Bloqueo regional mandibular',
  'Anestesia intraligamentosa'
];

export default function FormularioRegistroDiagnosticoCita({
  paciente,
  pacientesDisponibles,
  citaIdInicial,
  onCambiarPaciente,
  onRegistrarNuevoPaciente,
  onGuardarExito,
  onCancelar,
}: FormularioRegistroDiagnosticoCitaProps) {
  // 1. Tipo de Consulta y Cita asociada
  const [tipoConsulta, setTipoConsulta] = useState<'valoracion_inicial' | 'evolucion_cita' | 'control_postoperatorio' | 'urgencia'>('evolucion_cita');
  const [citaSeleccionadaId, setCitaSeleccionadaId] = useState<string>(citaIdInicial || '');
  const [doctorNombre, setDoctorNombre] = useState<string>('Dra. Yasmín Blanco');
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState<string>('09:00 AM');

  // Procedimientos realizados en la cita
  const [procedimientosSeleccionados, setProcedimientosSeleccionados] = useState<string[]>([]);
  const [otroProcedimiento, setOtroProcedimiento] = useState<string>('');

  // 2. Anamnesis y Diagnóstico
  const [motivoConsulta, setMotivoConsulta] = useState<string>('');
  const [diagnostico, setDiagnostico] = useState<string>('');
  const [diagnosticoCie10, setDiagnosticoCie10] = useState<string>('');
  
  // 3. Hallazgos en Odontograma
  const [piezaSeleccionada, setPiezaSeleccionada] = useState<string>('26');
  const [actualizarOdontograma, setActualizarOdontograma] = useState<boolean>(true);
  const [nuevoEstadoDiente, setNuevoEstadoDiente] = useState<EstadoDiente>('obturado');
  const [notaDiente, setNotaDiente] = useState<string>('');

  // 4. Procedimiento y Anestesia
  const [procedimiento, setProcedimiento] = useState<string>('');
  const [anestesia, setAnestesia] = useState<string>(TIPOS_ANESTESIA[2]);

  // 5. Prescripción y Cuidados
  const [prescripcion, setPrescripcion] = useState<string>('');
  const [indicaciones, setIndicaciones] = useState<string>('');
  const [proximoControl, setProximoControl] = useState<string>('Control clínico en 6 meses o al finalizar tratamiento.');

  // 6. Imágenes Diagnósticas de la Cita
  const [imagenesAdjuntas, setImagenesAdjuntas] = useState<ImagenDiagnostica[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // 7. Alertas de seguridad clínica
  const [alertaMedicamento, setAlertaMedicamento] = useState<string | null>(null);

  // 8. Control de insumos utilizados y descuento FEFO
  const [insumosCatalogo, setInsumosCatalogo] = useState<Insumo[]>([]);
  const [insumosUsados, setInsumosUsados] = useState<Array<{ insumoId: string; cantidad: number }>>([]);
  const [insumoSeleccionadoId, setInsumoSeleccionadoId] = useState<string>('');
  const [cantidadInsumoUso, setCantidadInsumoUso] = useState<number>(1);
  const [errorStockFEFO, setErrorStockFEFO] = useState<string | null>(null);
  const [costoProcedimiento, setCostoProcedimiento] = useState<number>(85000);

  useEffect(() => {
    obtenerInsumos().then((lista) => {
      setInsumosCatalogo(lista);
      if (lista.length > 0) {
        setInsumoSeleccionadoId(lista[0].id);
      }
    });
  }, []);

  // Precargar datos si se selecciona una cita
  useEffect(() => {
    if (citaSeleccionadaId && paciente?.citas && Array.isArray(paciente.citas)) {
      const cita = paciente.citas.find((c) => c.id === citaSeleccionadaId);
      if (cita) {
        setFecha(cita.fecha);
        setHora(cita.hora);
        setDoctorNombre(cita.doctorNombre);
        if (!motivoConsulta) {
          setMotivoConsulta(`Cita programada para: ${cita.tratamiento}. ${cita.notas || ''}`);
        }
      }
    }
  }, [citaSeleccionadaId, paciente?.citas, motivoConsulta]);

  // Detector de advertencias de alergia en prescripción
  useEffect(() => {
    if (!prescripcion || !paciente?.alergias || !Array.isArray(paciente.alergias) || paciente.alergias.length === 0) {
      setAlertaMedicamento(null);
      return;
    }

    const textoLower = prescripcion.toLowerCase();
    const alergiasPaciente = paciente.alergias.map((a) => String(a || '').toLowerCase());

    const advertencias: string[] = [];

    if (alergiasPaciente.some((a) => a.includes('penicilina') || a.includes('betalactamicos'))) {
      if (
        textoLower.includes('amoxicilina') ||
        textoLower.includes('penicilina') ||
        textoLower.includes('ampicilina') ||
        textoLower.includes('clavulan')
      ) {
        advertencias.push('¡ALERTA CRÍTICA! El paciente es alérgico a la PENICILINA. La prescripción contiene antibióticos betalactámicos.');
      }
    }

    if (alergiasPaciente.some((a) => a.includes('aspirina') || a.includes('aines'))) {
      if (
        textoLower.includes('aspirina') ||
        textoLower.includes('ibuprofeno') ||
        textoLower.includes('naproxeno') ||
        textoLower.includes('diclofenac') ||
        textoLower.includes('ketorolaco')
      ) {
        advertencias.push('¡PRECAUCIÓN! El paciente presenta alergia o sensibilidad a AINEs / Aspirina.');
      }
    }

    if (advertencias.length > 0) {
      setAlertaMedicamento(advertencias.join(' '));
    } else {
      setAlertaMedicamento(null);
    }
  }, [prescripcion, paciente?.alergias]);

  // Selección rápida de diagnóstico clínico frecuente
  const handleSeleccionarDiagnosticoFrecuente = (item: DiagnosticoFrecuente) => {
    setDiagnostico(item.nombre);
    setDiagnosticoCie10(item.codigoCie10);
    if (item.procedimientoSugerido) {
      setProcedimiento(item.procedimientoSugerido);
    }
    if (item.estadoDienteSugerido) {
      setNuevoEstadoDiente(item.estadoDienteSugerido);
    }
  };

  // Manejo de carga de imágenes diagnósticas
  const handleArchivosSeleccionados = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    procesarArchivos(Array.from(e.target.files));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      procesarArchivos(Array.from(e.dataTransfer.files));
    }
  };

  const procesarArchivos = (archivos: File[]) => {
    archivos.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const tamanoMB = (file.size / (1024 * 1024)).toFixed(1);
        
        // Deducir tipo tentativo
        let tipo: TipoImagenDiagnostica = 'fotografia_intraoral';
        const nombreLower = file.name.toLowerCase();
        if (nombreLower.includes('periapical') || nombreLower.includes('rx')) {
          tipo = 'radiografia_periapical';
        } else if (nombreLower.includes('panoramica')) {
          tipo = 'radiografia_panoramica';
        } else if (nombreLower.includes('tomografia') || nombreLower.includes('cbct')) {
          tipo = 'tomografia_cbct';
        }

        const nuevaImagen: ImagenDiagnostica = {
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          nombre: file.name,
          tipo,
          tipoLabel: tipo.replace('_', ' ').toUpperCase(),
          url,
          tamano: `${tamanoMB} MB`,
          fechaSubida: new Date().toISOString().split('T')[0],
          notas: `Registrada en consulta diagnóstica de la pieza ${piezaSeleccionada || 'General'}`,
        };

        setImagenesAdjuntas((prev) => [nuevaImagen, ...prev]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleEliminarImagen = (id: string) => {
    setImagenesAdjuntas((prev) => prev.filter((img) => img.id !== id));
  };

  // Manejo de procedimientos realizados en la cita
  const handleToggleProcedimiento = (proc: string) => {
    setProcedimientosSeleccionados((prev) =>
      prev.includes(proc) ? prev.filter((p) => p !== proc) : [...prev, proc]
    );
  };

  const handleAgregarInsumoUso = () => {
    if (!insumoSeleccionadoId || cantidadInsumoUso <= 0) return;
    setInsumosUsados((prev) => {
      const idx = prev.findIndex((i) => i.insumoId === insumoSeleccionadoId);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], cantidad: copy[idx].cantidad + cantidadInsumoUso };
        return copy;
      }
      return [...prev, { insumoId: insumoSeleccionadoId, cantidad: cantidadInsumoUso }];
    });
    setErrorStockFEFO(null);
  };

  const handleRemoverInsumoUso = (id: string) => {
    setInsumosUsados((prev) => prev.filter((i) => i.insumoId !== id));
  };

  // Guardar la información diagnóstica
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStockFEFO(null);
    if (!diagnostico.trim() || !procedimiento.trim()) {
      alert('Por favor completa el diagnóstico y el procedimiento realizado.');
      return;
    }

    // Si se seleccionaron insumos odontológicos, aplicar descuento por FEFO
    if (insumosUsados.length > 0) {
      const resDescuento = await descontarInsumosProcedimientoFEFO(
        insumosUsados.map((item) => ({
          insumo_id: item.insumoId,
          cantidad: item.cantidad,
          procedimiento_id: procedimiento,
          cita_id: citaSeleccionadaId || undefined,
        }))
      );
      if (!resDescuento.exito) {
        setErrorStockFEFO(resDescuento.mensaje);
        return;
      }
    }

    const insumosUtilizadosMapeados = insumosUsados.map((item) => {
      const info = insumosCatalogo.find((i) => i.id === item.insumoId);
      return {
        insumoId: item.insumoId,
        nombre: info ? `${info.nombre} (${info.marca})` : 'Insumo Odontológico',
        cantidad: item.cantidad,
        unidad: info?.presentacion_comercial || 'unidad',
        lote: info?.lotes?.[0]?.numero_lote || 'LOT-2026-FEFO',
        registroInvima: info?.registro_invima,
      };
    });

    const numeroDiente = piezaSeleccionada && piezaSeleccionada !== 'general' ? parseInt(piezaSeleccionada, 10) : undefined;

    const nuevaEvolucion: EvolucionClinica = {
      id: `evo-${Date.now()}`,
      pacienteId: paciente.id,
      pacienteNombre: `${paciente.nombres || ''} ${paciente.apellidos || ''}`.trim(),
      doctorNombre,
      fecha,
      hora,
      citaId: citaSeleccionadaId || undefined,
      tipoConsulta,
      procedimientosRealizados: procedimientosSeleccionados.length > 0 ? procedimientosSeleccionados : undefined,
      motivoConsulta: motivoConsulta || 'Atención y valoración odontológica',
      diagnostico,
      diagnosticoCie10: diagnosticoCie10 || undefined,
      procedimiento,
      piezaDental: numeroDiente 
        ? `Pieza ${numeroDiente} (${NOMBRES_PIEZAS_FDI[numeroDiente] || ''})` 
        : 'Toda la cavidad oral (General)',
      dienteNumero: numeroDiente,
      nuevoEstadoDiente: actualizarOdontograma && numeroDiente ? nuevoEstadoDiente : undefined,
      anestesia,
      prescripcion: prescripcion.trim() || undefined,
      indicaciones: indicaciones.trim() || undefined,
      proximoControl: proximoControl.trim() || undefined,
      estado: 'completado',
      insumosUtilizados: insumosUtilizadosMapeados.length > 0 ? insumosUtilizadosMapeados : undefined,
      costoProcedimiento: Number(costoProcedimiento) || 0,
      estadoPago: 'pagado',
      imagenesAdjuntas: imagenesAdjuntas.length > 0 ? imagenesAdjuntas : undefined,
    };

    // Guardar en el almacenamiento unificado
    registrarDiagnosticoCitaStorage({
      pacienteId: paciente.id,
      evolucion: nuevaEvolucion,
      actualizacionOdontograma: actualizarOdontograma && numeroDiente ? {
        dienteNumero: numeroDiente,
        nuevoEstado: nuevoEstadoDiente,
        notas: notaDiente.trim() || `${diagnostico}: ${String(procedimiento || '').substring(0, 40)}...`,
      } : undefined,
      citaId: citaSeleccionadaId || undefined,
      imagenesAdjuntas: imagenesAdjuntas.length > 0 ? imagenesAdjuntas : undefined,
    });

    onGuardarExito(
      nuevaEvolucion, 
      actualizarOdontograma && numeroDiente ? nuevoEstadoDiente : undefined, 
      numeroDiente
    );
  };

  if (!paciente) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
        Selecciona o registra un paciente para iniciar la atención clínica.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto">
      {/* Encabezado del Formulario y Selección de Paciente */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-dentist-50 text-dentist-700 border border-dentist-200 shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Registro Diagnóstico de Cita Odontológica
            </h2>
            <p className="text-xs text-slate-500">
              Registra los hallazgos clínicos, procedimiento y actualiza el Odontograma del paciente
            </p>
          </div>
        </div>

        {/* Ficha / Selector de Paciente y Botón de Alta Rápida */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Paciente en Atención:
            </span>
            {pacientesDisponibles && onCambiarPaciente ? (
              <select
                value={paciente.id}
                onChange={(e) => {
                  if (e.target.value === '__NUEVO__' && onRegistrarNuevoPaciente) {
                    onRegistrarNuevoPaciente();
                  } else if (onCambiarPaciente) {
                    onCambiarPaciente(e.target.value);
                  }
                }}
                className="mt-0.5 bg-white font-bold border border-slate-300 rounded-lg px-2.5 py-1 text-slate-900 text-xs focus:ring-2 focus:ring-dentist-500 focus:outline-none max-w-[240px] truncate"
              >
                <optgroup label="Pacientes Registrados">
                  {pacientesDisponibles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombres || ''} {p.apellidos || ''} ({p.tipoDocumento || 'CC'} {p.numeroDocumento || ''})
                    </option>
                  ))}
                </optgroup>
                {onRegistrarNuevoPaciente && (
                  <optgroup label="Acciones">
                    <option value="__NUEVO__">+ Registrar Paciente Nuevo...</option>
                  </optgroup>
                )}
              </select>
            ) : (
              <div>
                <span className="font-bold text-slate-900 block">{paciente.nombres || ''} {paciente.apellidos || ''}</span>
                <span className="text-slate-500 text-[11px]">{paciente.tipoDocumento || 'CC'} {paciente.numeroDocumento || ''} • {paciente.eps || 'Particular'}</span>
              </div>
            )}
          </div>

          {onRegistrarNuevoPaciente && (
            <button
              type="button"
              onClick={onRegistrarNuevoPaciente}
              className="inline-flex items-center gap-1.5 bg-dentist-600 hover:bg-dentist-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs whitespace-nowrap active:scale-95 self-stretch sm:self-auto justify-center"
              title="Registrar paciente nuevo que asiste por primera vez"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Paciente Nuevo</span>
            </button>
          )}
        </div>
      </div>

      {/* Alertas Médicas del Paciente (Alergias / Patologías) */}
      {(Array.isArray(paciente.alergias) && paciente.alergias.length > 0) || (Array.isArray(paciente.enfermedadesPrevias) && paciente.enfermedadesPrevias.length > 0) ? (
        <div className="mb-6 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 flex flex-wrap items-center gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <strong className="font-semibold">Antecedentes Clínicos del Paciente:</strong>
          {Array.isArray(paciente.alergias) && paciente.alergias.map((al, idx) => (
            <span key={idx} className="bg-rose-100 border border-rose-300 text-rose-800 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-600" /> Alérgico a: {al}
            </span>
          ))}
          {Array.isArray(paciente.enfermedadesPrevias) && paciente.enfermedadesPrevias.map((enf, idx) => (
            <span key={idx} className="bg-amber-100 border border-amber-300 text-amber-800 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
              <HeartPulse className="w-3 h-3 text-amber-600" /> {enf}
            </span>
          ))}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* 1. SECCIÓN: ASOCIACIÓN CON LA CITA Y PROFESIONAL */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-dentist-600" />
            <span>1. Cita Odontológica de Origen y Tipo de Consulta</span>
          </div>

          {/* Selector de Tipo de Consulta / Evolución */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tipo de Acto Clínico:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'evolucion_cita', label: '🩺 Evolución de Cita', desc: 'Progreso y tratamiento en cita programada' },
                { id: 'valoracion_inicial', label: '📋 Valoración Inicial', desc: 'Diagnóstico general inicial y plan' },
                { id: 'control_postoperatorio', label: '🩹 Control Post-Operatorio', desc: 'Revisión y ajuste tras intervención' },
                { id: 'urgencia', label: '🚨 Atención de Urgencia', desc: 'Alivio del dolor / trauma agudo' }
              ].map((tc) => (
                <button
                  key={tc.id}
                  type="button"
                  onClick={() => setTipoConsulta(tc.id as 'valoracion_inicial' | 'evolucion_cita' | 'control_postoperatorio' | 'urgencia')}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    tipoConsulta === tc.id
                      ? 'bg-dentist-50 border-dentist-500 ring-2 ring-dentist-500/20 text-dentist-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs">{tc.label}</span>
                  <span className="text-[10px] text-slate-500 font-normal mt-0.5">{tc.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Selector de Cita del Paciente */}
            <div className="md:col-span-1">
              <label className="block font-semibold text-slate-700 mb-1">
                Cita Odontológica Vinculada:
              </label>
              <select
                value={citaSeleccionadaId}
                onChange={(e) => setCitaSeleccionadaId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-dentist-500 font-medium"
              >
                <option value="">Atención Directa (Sin cita previa / Urgencia)</option>
                {paciente.citas && paciente.citas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fecha} ({c.hora}) - {c.tratamiento} [{c.estado}]
                  </option>
                ))}
              </select>
            </div>

            {/* Profesional tratante */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Odontólogo o Especialista Tratante: *
              </label>
              <select
                value={doctorNombre}
                onChange={(e) => setDoctorNombre(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-dentist-500 font-medium"
              >
                {DOCTORES_CONSULTORIO.map((doc, i) => (
                  <option key={i} value={doc.split(' (')[0]}>{doc}</option>
                ))}
              </select>
            </div>

            {/* Fecha y Hora de la Atención */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fecha:</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-dentist-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hora:</label>
                <input
                  type="text"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  placeholder="09:00 AM"
                  className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-dentist-500"
                />
              </div>
            </div>
          </div>

          {/* Motivo de Consulta referido */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-xs">
              Motivo de Consulta y Síntomas Referidos por el Paciente:
            </label>
            <input
              type="text"
              placeholder="Ej. Paciente acude por dolor al masticar y sensibilidad en el cuadrante superior derecho..."
              value={motivoConsulta}
              onChange={(e) => setMotivoConsulta(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-dentist-500"
            />
          </div>
        </div>

        {/* 2. SECCIÓN: DIAGNÓSTICO ODONTOLÓGICO CLÍNICO (CON CIE-10) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-dentist-600" />
              <span>2. Diagnóstico Odontológico Clínico</span>
            </label>
            <span className="text-[11px] text-slate-400">Selección rápida sugerida con CIE-10</span>
          </div>

          {/* Botones de diagnóstico rápido */}
          <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
            {DIAGNOSTICOS_ODONTOLOGICOS_FRECUENTES.slice(0, 8).map((diag, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => handleSeleccionarDiagnosticoFrecuente(diag)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1 ${
                  diagnostico === diag.nombre
                    ? 'bg-dentist-600 text-white border-dentist-700 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-[10px] font-bold opacity-80">[{diag.codigoCie10}]</span>
                <span>{diag.nombre}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Diagnóstico Principal y Hallazgos Clínicos: *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Caries de dentina profunda en cara oclusal sin compromiso pulpar"
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-dentist-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código CIE-10 (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ej. K02.1 / K04.0"
                value={diagnosticoCie10}
                onChange={(e) => setDiagnosticoCie10(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-dentist-500"
              />
            </div>
          </div>
        </div>

        {/* 3. SECCIÓN: VINCULACIÓN Y ACTUALIZACIÓN EN ODONTOGRAMA (SISTEMA FDI) */}
        <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>3. Pieza Dental y Actualización en el Odontograma (FDI)</span>
              </span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-sky-900">
              <input
                type="checkbox"
                checked={actualizarOdontograma}
                onChange={(e) => setActualizarOdontograma(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded-sm border-slate-300 focus:ring-sky-500"
              />
              <span>Actualizar automáticamente el Odontograma del paciente</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Selector de Pieza FDI */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pieza Dental Intervenida:
              </label>
              <select
                value={piezaSeleccionada}
                onChange={(e) => setPiezaSeleccionada(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-bold"
              >
                <option value="General">Toda la boca (Procedimiento general / Profilaxis)</option>
                {Object.keys(NOMBRES_PIEZAS_FDI).map((numStr) => {
                  const num = Number(numStr);
                  return (
                    <option key={num} value={num}>
                      Pieza #{num} - {NOMBRES_PIEZAS_FDI[num]}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Selector de Nuevo Estado en Odontograma */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nuevo Estado a reflejar en el Odontograma para esta pieza:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {(Object.entries(ESTADOS_DIENTE_CONFIG) as [EstadoDiente, typeof ESTADOS_DIENTE_CONFIG[EstadoDiente]][]).map(
                  ([estadoKey, conf]) => (
                    <button
                      type="button"
                      key={estadoKey}
                      onClick={() => setNuevoEstadoDiente(estadoKey)}
                      className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                        nuevoEstadoDiente === estadoKey
                          ? 'border-sky-600 bg-sky-100/80 shadow-2xs ring-2 ring-sky-500/30'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${conf.colorBg} border ${conf.colorBorde}`} />
                      <span className="text-[10px] font-bold text-slate-800 truncate w-full">
                        {conf.etiqueta.split(' ')[0]}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Nota específica de la pieza */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nota específica para la pieza dental en el odontograma (aparecerá en la ficha del diente):
            </label>
            <input
              type="text"
              placeholder="Ej. Resina nanohíbrida tono A2 en oclusal y mesial con buen sellado marginal"
              value={notaDiente}
              onChange={(e) => setNotaDiente(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* 4. SECCIÓN: PROCEDIMIENTOS REALIZADOS EN LA CITA */}
        <div className="space-y-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ListChecks className="w-4 h-4 text-dentist-600" />
              <span>4. Procedimientos Realizados en esta Cita</span>
            </label>
            <span className="text-[11px] text-slate-500 font-medium">
              {procedimientosSeleccionados.length} seleccionados
            </span>
          </div>

          {/* Chips con catálogo rápido de procedimientos */}
          <div>
            <p className="text-[11px] font-semibold text-slate-600 mb-2">
              Selecciona los procedimientos odontológicos ejecutados durante esta atención:
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
              {CATALOGO_PROCEDIMIENTOS_CITA.map((proc, idx) => {
                const activo = procedimientosSeleccionados.includes(proc);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleToggleProcedimiento(proc)}
                    className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-medium transition flex items-center gap-1.5 ${
                      activo
                        ? 'bg-dentist-600 text-white border-dentist-700 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{activo ? '✓' : '+'}</span>
                    <span>{proc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agregar otro procedimiento personalizado */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Otro procedimiento odontológico específico..."
              value={otroProcedimiento}
              onChange={(e) => setOtroProcedimiento(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAgregarOtroProcedimiento();
                }
              }}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-dentist-500"
            />
            <button
              type="button"
              onClick={handleAgregarOtroProcedimiento}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition"
            >
              Agregar
            </button>
          </div>

          {/* Resumen de procedimientos seleccionados */}
          {procedimientosSeleccionados.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[11px] font-bold text-emerald-900 mr-1">Procedimientos incluidos en la cita:</span>
              {procedimientosSeleccionados.map((proc, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[11px] bg-white text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md font-semibold"
                >
                  <span>{proc}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleProcedimiento(proc)}
                    className="text-rose-500 hover:text-rose-700 font-bold ml-1 text-xs"
                    title="Quitar procedimiento"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Detalle descriptivo clínico del procedimiento y anestesia */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Evolución y Descripción Detallada del Procedimiento: *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe el paso a paso: apertura cavitaria, remoción con fresa redonda, aislamiento, grabado ácido, adhesivo y resina..."
                value={procedimiento}
                onChange={(e) => setProcedimiento(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-dentist-500 leading-relaxed font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Técnica Anestésica Empleada:
              </label>
              <select
                value={anestesia}
                onChange={(e) => setAnestesia(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-dentist-500"
              >
                {TIPOS_ANESTESIA.map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-2">
                Verifica antecedentes médicos antes de infiltrar vasoconstrictores.
              </p>
            </div>
          </div>
        </div>

        {/* 5. SECCIÓN: IMÁGENES DIAGNÓSTICAS Y RADIOGRAFÍAS DE LA CITA */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-dentist-600" />
              <span>5. Imágenes Diagnósticas y Radiografías Tomadas en la Cita</span>
            </label>
            <span className="text-[11px] text-slate-500">{imagenesAdjuntas.length} imágenes adjuntas</span>
          </div>

          {/* Zona de Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-4 text-center transition cursor-pointer ${
              isDragging ? 'border-dentist-500 bg-dentist-50/50' : 'border-slate-300 hover:border-dentist-400 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              id="archivos-cita-input"
              multiple
              accept="image/*"
              onChange={handleArchivosSeleccionados}
              className="hidden"
            />
            <label htmlFor="archivos-cita-input" className="cursor-pointer block">
              <UploadCloud className="w-6 h-6 text-dentist-600 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-800">
                Arrastra o haz clic para adjuntar radiografías periapicales o fotos intraorales
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG o DICOM convertido a imagen</p>
            </label>
          </div>

          {/* Miniaturas de imágenes adjuntas */}
          {imagenesAdjuntas.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {imagenesAdjuntas.map((img) => (
                <div key={img.id} className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-100 p-1">
                  <img
                    src={img.url}
                    alt={img.nombre}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <div className="p-1">
                    <p className="text-[10px] font-semibold text-slate-800 truncate">{img.nombre}</p>
                    <span className="text-[9px] text-slate-500 block">{img.tipoLabel}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEliminarImagen(img.id)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-rose-600 text-white shadow-xs opacity-90 hover:opacity-100"
                    title="Eliminar imagen"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECCIÓN: INSUMOS ODONTOLÓGICOS CONSUMIDOS (CONTROL FEFO) */}
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-teal-600" />
              <span>Insumos y Materiales Utilizados (Descuento FEFO)</span>
            </label>
            <span className="text-[11px] text-teal-600 font-medium">Asignación automática por lote más próximo</span>
          </div>

          {errorStockFEFO && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorStockFEFO}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={insumoSeleccionadoId}
              onChange={(e) => setInsumoSeleccionadoId(e.target.value)}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
            >
              {insumosCatalogo.map((ins) => (
                <option key={ins.id} value={ins.id}>
                  {ins.nombre} ({ins.marca}) - {ins.presentacion_comercial}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                step="1"
                value={cantidadInsumoUso}
                onChange={(e) => setCantidadInsumoUso(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-20 text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white text-center focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={handleAgregarInsumoUso}
                className="px-3 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir</span>
              </button>
            </div>
          </div>

          {/* Lista de insumos que serán descontados */}
          {insumosUsados.length > 0 && (
            <div className="space-y-1.5 p-3 bg-teal-50/40 rounded-xl border border-teal-100">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                Insumos a descontar de existencias al guardar ({insumosUsados.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {insumosUsados.map((item) => {
                  const info = insumosCatalogo.find((i) => i.id === item.insumoId);
                  return (
                    <span
                      key={item.insumoId}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-teal-200 text-slate-800 shadow-2xs"
                    >
                      <FlaskConical className="w-3 h-3 text-teal-600" />
                      <span>{info?.nombre || 'Insumo'}</span>
                      <strong className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded text-[11px]">
                        x{item.cantidad}
                      </strong>
                      <button
                        type="button"
                        onClick={() => handleRemoverInsumoUso(item.insumoId)}
                        className="text-slate-400 hover:text-rose-600 ml-1"
                        title="Remover insumo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 6. SECCIÓN: PRESCRIPCIÓN MÉDICA E INDICACIONES POST-OPERATORIAS */}
        <div className="space-y-4 pt-2 border-t border-slate-200">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-dentist-600" />
            <span>6. Prescripción Médica y Cuidados Post-Operatorios</span>
          </label>

          {/* Advertencia farmacológica en caso de alergia */}
          {alertaMedicamento && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2 animate-pulse">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{alertaMedicamento}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fórmula / Medicamentos Prescritos (Dosis, Horario, Días):
              </label>
              <textarea
                rows={2}
                placeholder="Ej. Acetaminofén 500mg cada 8 horas por 2 días si presenta dolor leve..."
                value={prescripcion}
                onChange={(e) => setPrescripcion(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-dentist-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Indicaciones y Recomendaciones al Paciente:
              </label>
              <textarea
                rows={2}
                placeholder="Ej. Evitar alimentos calientes o duros las primeras 24h. No realizar buches enérgicos..."
                value={indicaciones}
                onChange={(e) => setIndicaciones(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-dentist-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Próximo Control o Cita Recomendada:
            </label>
            <input
              type="text"
              placeholder="Ej. Control de oclusión en 7 días / Cita de higiene en 6 meses"
              value={proximoControl}
              onChange={(e) => setProximoControl(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-dentist-500"
            />
          </div>
        </div>

        {/* 7. SECCIÓN: VALOR Y COSTO DEL PROCEDIMIENTO REALIZADO */}
        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                7. Costo del Procedimiento y Liquidación ($ COP):
              </span>
              <p className="text-xs text-slate-600 mt-0.5">
                Valor facturable asociado al procedimiento e insumos utilizados para el historial clínico del paciente.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">$ COP</span>
              <input
                type="number"
                min="0"
                step="5000"
                value={costoProcedimiento}
                onChange={(e) => setCostoProcedimiento(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-36 text-sm font-bold px-3 py-2 rounded-xl border border-slate-300 bg-white text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                placeholder="85000"
              />
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Al guardar se actualizarán inmediatamente la Historia Clínica y el Odontograma.</span>
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {onCancelar && (
              <button
                type="button"
                onClick={onCancelar}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold bg-dentist-600 hover:bg-dentist-700 text-white rounded-xl shadow-sm transition flex items-center gap-2 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Evolución de Cita</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
