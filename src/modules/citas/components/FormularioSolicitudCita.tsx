'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Send, 
  CheckCircle2, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { TipoDocumento } from '@/modules/pacientes/types';

const TRATAMIENTOS_PUBLICOS = [
  { id: '1', nombre: 'Valoración Odontológica Inicial', duracion: '30 min', descripcion: 'Diagnóstico general y plan de tratamiento' },
  { id: '2', nombre: 'Profilaxis y Limpieza Profunda', duracion: '45 min', descripcion: 'Eliminación de sarro, placa y pulido' },
  { id: '3', nombre: 'Control de Ortodoncia', duracion: '30 min', descripcion: 'Revisión periódica de brackets o alineadores' },
  { id: '4', nombre: 'Resina Estética / Calzas', duracion: '40 min', descripcion: 'Restauración por caries o fractura' },
  { id: '5', nombre: 'Blanqueamiento Dental LED', duracion: '60 min', descripcion: 'Aclaramiento en consultorio' },
  { id: '6', nombre: 'Urgencia Dental / Dolor Agudo', duracion: '30 min', descripcion: 'Atención prioritaria para alivio del dolor' },
];

const ESPECIALISTAS = [
  'Cualquier odontólogo disponible',
  'Dr. Carlos Ruiz (Odontología General y Estética)',
  'Dra. Laura Vega (Ortodoncia y Ortopedia)',
];

export default function FormularioSolicitudCita() {
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    // Simulación de envío a Supabase y bandeja de recepción
    setTimeout(() => {
      setCargando(false);
      setEnviado(true);
    }, 900);
  };

  const handleReset = () => {
    setEnviado(false);
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

  // Fecha mínima: mañana
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const minFecha = manana.toISOString().split('T')[0];

  return (
    <div id="agendar" className="scroll-mt-20">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Cabecera del formulario */}
        <div className="bg-gradient-to-r from-dentist-700 via-dentist-600 to-sky-600 px-6 sm:px-10 py-8 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            Agendamiento en Línea 24/7
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Solicita tu Cita Odontológica
          </h2>
          <p className="text-sky-100 text-sm mt-1.5 max-w-2xl leading-relaxed">
            Diligencia el formulario y nuestro equipo revisará la agenda. Recibirás confirmación automática o por WhatsApp en minutos.
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
                Gracias, <strong className="text-slate-800">{formData.nombres}</strong>. Tu solicitud para <strong>{formData.tratamiento}</strong> el día <strong>{formData.fechaDeseada} ({formData.horaSugerida})</strong> ha ingresado a nuestra <strong>bandeja de recepción</strong>.
              </p>

              <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-2 text-slate-700">
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico (Para recordatorio)</label>
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
                  Tus datos se manejan de forma segura y confidencial.
                </span>

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-dentist-600 hover:bg-dentist-700 disabled:opacity-50 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{cargando ? 'Enviando solicitud...' : 'Enviar Solicitud de Cita'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
