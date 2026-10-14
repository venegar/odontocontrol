'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar as CalendarIcon, 
  Send, 
  CheckCircle2, 
  User, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { TipoDocumento } from '@/modules/pacientes/types';
import { crearSolicitudCitaPublica } from '@/modules/citas/actions';
import { supabase } from '@/lib/supabase';

const TRATAMIENTOS_PUBLICOS = [
  { id: '1', nombre: 'Primera Valoración General y Diagnóstico 3D', duracion: '30 min', descripcion: 'Escaneo intraoral, diagnóstico integral y plan sin dolor' },
  { id: '2', nombre: 'Ortodoncia Invisible e Invisalign', duracion: '45 min', descripcion: 'Alineadores invisibles diseñados digitalmente' },
  { id: '3', nombre: 'Implantología y Cirugía Oral Guiada', duracion: '60 min', descripcion: 'Reposición con titanio biocompatible de carga inmediata' },
  { id: '4', nombre: 'Estética Dental y Carillas de Porcelana', duracion: '45 min', descripcion: 'Diseño de sonrisa mínimamente invasivo' },
  { id: '5', nombre: 'Odontología Preventiva / Limpieza Airflow', duracion: '40 min', descripcion: 'Ultrasonido y micropartículas sin desgaste' },
  { id: '6', nombre: 'Blanqueamiento Dental Láser', duracion: '50 min', descripcion: 'Aclaramiento en sesión clínica sin sensibilidad' },
  { id: '7', nombre: 'Periodoncia y Cuidado de Encías', duracion: '45 min', descripcion: 'Descontaminación láser y regeneración tisular' },
];

const ESPECIALISTAS = [
  'Dra. Yasmín Blanco (Directora Médica & Cirugía/Estética)',
  'Dr. Carlos Ruiz (Odontología General y Rehabilitación)',
  'Dra. Laura Vega (Ortodoncia y Ortopedia Maxilofacial)',
  'Cualquier especialista disponible para la fecha',
];

export default function FormularioSolicitudCita() {
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [citaConfirmada, setCitaConfirmada] = useState<{
    id?: string;
    estado?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    tipoDocumento: 'CC' as TipoDocumento,
    numeroDocumento: '',
    telefono: '',
    email: '',
    tratamiento: TRATAMIENTOS_PUBLICOS[0].nombre,
    especialista: ESPECIALISTAS[0],
    fechaDeseada: '',
    jornada: 'mañana' as 'mañana' | 'tarde',
    horaSugerida: '09:00 AM',
    motivo: '',
  });

function convertirHoraA24(horaStr: string): string {
  const limpia = (horaStr || '').trim();
  const match = limpia.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return '09:00:00';
  let horas = parseInt(match[1], 10);
  const minutos = match[2];
  const ampm = match[3] ? match[3].toUpperCase() : null;
  if (ampm === 'PM' && horas < 12) horas += 12;
  else if (ampm === 'AM' && horas === 12) horas = 0;
  return `${horas.toString().padStart(2, '0')}:${minutos}:00`;
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setErrorEnvio(null);

    try {
      // 1. Intento directo por Supabase RPC (inmediato, sin intermediarios)
      const hora24 = convertirHoraA24(formData.horaSugerida);
      const { data: rpcData, error: rpcError } = await supabase.rpc('solicitar_cita_publica', {
        p_nombres: formData.nombres.trim(),
        p_apellidos: formData.apellidos.trim(),
        p_tipo_documento: formData.tipoDocumento.toUpperCase(),
        p_numero_documento: formData.numeroDocumento.trim(),
        p_telefono: formData.telefono.trim(),
        p_email: formData.email.trim() || null,
        p_fecha: formData.fechaDeseada,
        p_hora_inicio: hora24,
        p_motivo: formData.motivo.trim() || `Solicitud para ${formData.tratamiento}`,
        p_tratamiento_nombre: formData.tratamiento,
        p_especialista_nombre: formData.especialista || null,
        p_fecha_nacimiento: null,
      });

      if (!rpcError && rpcData && typeof rpcData === 'object' && (rpcData as { exito?: boolean }).exito) {
        const respuesta = rpcData as { cita_id?: string; estado?: string };
        setCitaConfirmada({
          id: respuesta.cita_id,
          estado: respuesta.estado || 'solicitada',
        });
        setEnviado(true);
        return;
      }

      // 2. Si el RPC directo devolvió error, intentar a través de Server Action
      const resultado = await crearSolicitudCitaPublica({
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        telefono: formData.telefono,
        email: formData.email,
        tratamiento: formData.tratamiento,
        especialista: formData.especialista,
        fechaDeseada: formData.fechaDeseada,
        jornada: formData.jornada,
        horaSugerida: formData.horaSugerida,
        motivo: formData.motivo,
      });

      if (resultado.exito) {
        setCitaConfirmada({
          id: resultado.datos?.citaId,
          estado: resultado.datos?.estado || 'solicitada',
        });
        setEnviado(true);
        return;
      }

      const mensajeError = rpcError?.message || resultado.error || resultado.mensaje || 'No fue posible registrar la solicitud.';
      setErrorEnvio(mensajeError);
    } catch (err) {
      console.error('Error al enviar la solicitud de cita a Supabase:', err);
      const detalle = err instanceof Error ? err.message : 'Error de conectividad';
      setErrorEnvio(`Error al procesar la cita: ${detalle}. Por favor intenta de nuevo o comunícate vía WhatsApp.`);
    } finally {
      setCargando(false);
    }
  };

  const handleReset = () => {
    setEnviado(false);
    setErrorEnvio(null);
    setCitaConfirmada(null);
    setFormData({
      nombres: '',
      apellidos: '',
      tipoDocumento: 'CC',
      numeroDocumento: '',
      telefono: '',
      email: '',
      tratamiento: TRATAMIENTOS_PUBLICOS[0].nombre,
      especialista: ESPECIALISTAS[0],
      fechaDeseada: '',
      jornada: 'mañana',
      horaSugerida: '09:00 AM',
      motivo: '',
    });
  };

  // Fecha mínima permitida: mañana
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const minFecha = manana.toISOString().split('T')[0];

  return (
    <div id="agendar" className="scroll-mt-20">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Cabecera del formulario */}
        <div className="bg-gradient-to-r from-secondary via-primary to-primary px-6 sm:px-10 py-8 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            Valoración 3D y Agendamiento en Línea 24/7
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Solicita tu Cita con la Dra. Yasmín Blanco
          </h2>
          <p className="text-secondary-fixed text-sm mt-1.5 max-w-2xl leading-relaxed">
            Diligencia el formulario y nuestro equipo revisará la agenda. Recibirás confirmación médica inmediata por WhatsApp y correo electrónico.
          </p>
        </div>

        {/* Cuerpo del formulario */}
        <div className="p-6 sm:p-10">
          {enviado ? (
            <div className="text-center py-8 max-w-lg mx-auto animate-scale-up">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                ¡Solicitud de Cita Recibida con Éxito!
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Gracias, <strong className="text-slate-800">{formData.nombres}</strong>. Tu solicitud para <strong>{formData.tratamiento}</strong> el día <strong>{formData.fechaDeseada} ({formData.horaSugerida})</strong> ha ingresado a nuestra <strong>bandeja de recepción</strong> en Supabase.
              </p>

              {citaConfirmada?.id && (
                <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 bg-sky-50 text-sky-800 border border-sky-200 rounded-full text-xs font-mono">
                  <span>Radicado ID:</span>
                  <span className="font-bold">{citaConfirmada.id}</span>
                </div>
              )}

              <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Estado:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] bg-amber-100 text-amber-800">
                    Solicitada (Pendiente de aprobación clínica)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Paciente:</span>
                  <span className="font-semibold">{formData.nombres} {formData.apellidos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Documento:</span>
                  <span className="font-semibold">{formData.tipoDocumento} {formData.numeroDocumento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">WhatsApp de contacto:</span>
                  <span className="font-semibold">{formData.telefono}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Especialista:</span>
                  <span className="font-semibold">{formData.especialista}</span>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/portal-paciente"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-dentist-600 hover:bg-dentist-700 text-white font-semibold text-xs shadow-sm transition"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Ver en Portal del Paciente</span>
                </Link>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                >
                  Solicitar Otra Cita
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Mensaje de error amigable */}
              {errorEnvio && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">No fue posible radicar la solicitud</h4>
                    <p className="mt-0.5 text-rose-700">{errorEnvio}</p>
                  </div>
                </div>
              )}

              {/* Sección 1: Datos Personales */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-dentist-600" />
                  <span>1. Tus Datos de Contacto</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombres *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. María Camila"
                      value={formData.nombres}
                      onChange={e => setFormData({ ...formData, nombres: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Apellidos *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Pérez Gómez"
                      value={formData.apellidos}
                      onChange={e => setFormData({ ...formData, apellidos: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Documento *</label>
                    <select
                      value={formData.tipoDocumento}
                      onChange={e => setFormData({ ...formData, tipoDocumento: e.target.value as TipoDocumento })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
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
                      value={formData.numeroDocumento}
                      onChange={e => setFormData({ ...formData, numeroDocumento: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono Móvil (WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. +57 300 123 4567"
                      value={formData.telefono}
                      onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico (Para confirmación)</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                  />
                </div>
              </div>

              {/* Sección 2: Selección de Cita y Tratamiento */}
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-dentist-600" />
                  <span>2. Tratamiento y Fecha Preferida</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Servicio / Tratamiento Requerido *</label>
                    <select
                      value={formData.tratamiento}
                      onChange={e => setFormData({ ...formData, tratamiento: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                    >
                      {TRATAMIENTOS_PUBLICOS.map(t => (
                        <option key={t.id} value={t.nombre}>
                          {t.nombre} ({t.duracion})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Odontólogo Preferido</label>
                    <select
                      value={formData.especialista}
                      onChange={e => setFormData({ ...formData, especialista: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                    >
                      {ESPECIALISTAS.map(esp => (
                        <option key={esp} value={esp}>{esp}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha Deseada *</label>
                    <input
                      type="date"
                      required
                      min={minFecha}
                      value={formData.fechaDeseada}
                      onChange={e => setFormData({ ...formData, fechaDeseada: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jornada Preferida</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, jornada: 'mañana', horaSugerida: '09:00 AM' })}
                        className={`text-xs py-2.5 rounded-xl font-semibold border transition ${
                          formData.jornada === 'mañana'
                            ? 'bg-dentist-600 text-white border-dentist-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Mañana
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, jornada: 'tarde', horaSugerida: '03:00 PM' })}
                        className={`text-xs py-2.5 rounded-xl font-semibold border transition ${
                          formData.jornada === 'tarde'
                            ? 'bg-dentist-600 text-white border-dentist-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Tarde
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hora Tentativa</label>
                    <select
                      value={formData.horaSugerida}
                      onChange={e => setFormData({ ...formData, horaSugerida: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                    >
                      {formData.jornada === 'mañana' ? (
                        <>
                          <option value="08:00 AM">08:00 AM</option>
                          <option value="09:00 AM">09:00 AM</option>
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="11:00 AM">11:00 AM</option>
                        </>
                      ) : (
                        <>
                          <option value="02:00 PM">02:00 PM</option>
                          <option value="03:00 PM">03:00 PM</option>
                          <option value="04:00 PM">04:00 PM</option>
                          <option value="05:00 PM">05:00 PM</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ¿Tienes dolor o alguna necesidad específica? (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe brevemente el motivo de tu consulta..."
                    value={formData.motivo}
                    onChange={e => setFormData({ ...formData, motivo: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                  />
                </div>
              </div>

              {/* Botón de Envío */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Tus datos se manejan de forma segura y confidencial bajo RLS médico.
                </span>

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-dentist-600 hover:bg-dentist-700 disabled:opacity-50 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  {cargando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registrando solicitud...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Solicitud de Cita</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
