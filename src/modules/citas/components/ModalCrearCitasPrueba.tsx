'use client';

import React, { useState } from 'react';
import { 
  FlaskConical, 
  X, 
  Sparkles, 
  Send, 
  MessageCircle, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Sun, 
  Calendar as CalendarIcon,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { 
  obtenerFechaHoy, 
  obtenerFechaManana, 
  formatearFechaEspanol, 
  generarEnlaceWhatsApp, 
  generarEnlaceEmail, 
  generarEnlacesAccionCita 
} from '@/modules/recordatorios/utils';
import { supabase } from '@/lib/supabase';
import { obtenerDatosConsultorio } from '@/modules/configuracion/consultorioService';

export interface CitaPruebaGenerada {
  id: string;
  fecha: string;
  hora: string;
  nombre: string;
  telefono: string;
  email: string;
  tratamiento: string;
  doctor: string;
  sillon: string;
  estadoCita: 'por_atender';
  notificacion: {
    estado: 'pendiente' | 'notificado';
    horaEnvio?: string;
  };
}

interface ModalCrearCitasPruebaProps {
  abierto: boolean;
  onCerrar: () => void;
  onCitasCreadas?: (citas: { citaHoy: CitaPruebaGenerada; citaManana: CitaPruebaGenerada }) => void;
}

export default function ModalCrearCitasPrueba({
  abierto,
  onCerrar,
  onCitasCreadas,
}: ModalCrearCitasPruebaProps) {
  const [nombre, setNombre] = useState('Jairo Escobar');
  const [telefono, setTelefono] = useState('3015499931');
  const [email, setEmail] = useState('');
  const [tratamiento, setTratamiento] = useState('Valoración Odontológica de Prueba');
  const [doctor, setDoctor] = useState('Dra. Yasmín Blanco');
  const [guardando, setGuardando] = useState(false);
  const [citasGeneradas, setCitasGeneradas] = useState<{
    hoy: CitaPruebaGenerada;
    manana: CitaPruebaGenerada;
  } | null>(null);
  const [alerta, setAlerta] = useState<string | null>(null);

  if (!abierto) return null;

  const fechaHoy = obtenerFechaHoy();
  const fechaManana = obtenerFechaManana();
  const datosConsultorio = obtenerDatosConsultorio();

  const handleCrearCitas = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setAlerta(null);

    const idHoy = `prueba-hoy-${Date.now()}`;
    const idManana = `prueba-manana-${Date.now() + 1}`;

    const citaHoy: CitaPruebaGenerada = {
      id: idHoy,
      fecha: fechaHoy,
      hora: '03:30 PM',
      nombre: nombre.trim() || 'Paciente Prueba',
      telefono: telefono.trim() || '3015499931',
      email: email.trim(),
      tratamiento,
      doctor,
      sillon: 'Sillón 1',
      estadoCita: 'por_atender',
      notificacion: { estado: 'pendiente' },
    };

    const citaManana: CitaPruebaGenerada = {
      id: idManana,
      fecha: fechaManana,
      hora: '09:00 AM',
      nombre: nombre.trim() || 'Paciente Prueba',
      telefono: telefono.trim() || '3015499931',
      email: email.trim(),
      tratamiento,
      doctor,
      sillon: 'Sillón 2',
      estadoCita: 'por_atender',
      notificacion: { estado: 'pendiente' },
    };

    // Intentar registrar en Supabase en segundo plano si está disponible
    try {
      await Promise.allSettled([
        supabase.rpc('solicitar_cita_publica', {
          p_nombres: nombre.trim().split(' ')[0] || 'Paciente',
          p_apellidos: nombre.trim().split(' ').slice(1).join(' ') || 'Prueba',
          p_tipo_documento: 'CC',
          p_numero_documento: '999999999',
          p_telefono: telefono.trim(),
          p_email: email.trim() || null,
          p_fecha: fechaHoy,
          p_hora_inicio: '15:30:00',
          p_motivo: `Cita de prueba hoy: ${tratamiento}`,
          p_tratamiento_nombre: tratamiento,
          p_especialista_nombre: doctor,
          p_fecha_nacimiento: null,
        }),
        supabase.rpc('solicitar_cita_publica', {
          p_nombres: nombre.trim().split(' ')[0] || 'Paciente',
          p_apellidos: nombre.trim().split(' ').slice(1).join(' ') || 'Prueba',
          p_tipo_documento: 'CC',
          p_numero_documento: '999999999',
          p_telefono: telefono.trim(),
          p_email: email.trim() || null,
          p_fecha: fechaManana,
          p_hora_inicio: '09:00:00',
          p_motivo: `Cita de prueba mañana: ${tratamiento}`,
          p_tratamiento_nombre: tratamiento,
          p_especialista_nombre: doctor,
          p_fecha_nacimiento: null,
        }),
      ]);
    } catch (err) {
      console.warn('Registro RPC Supabase en segundo plano:', err);
    }

    setCitasGeneradas({ hoy: citaHoy, manana: citaManana });
    setGuardando(false);
    setAlerta('¡Ambas citas de prueba han sido creadas con éxito! Ahora puedes probar los envíos de WhatsApp y Correo.');

    if (onCitasCreadas) {
      onCitasCreadas({ citaHoy, citaManana });
    }
  };

  // Enviar WhatsApp para una cita de prueba
  const handleEnviarWhatsAppPrueba = (cita: CitaPruebaGenerada, esManana: boolean) => {
    const enlaces = generarEnlacesAccionCita(cita.id);
    const momento = esManana 
      ? `mañana (${formatearFechaEspanol(cita.fecha)})` 
      : `hoy (${formatearFechaEspanol(cita.fecha)})`;

    const texto = `¡Hola ${cita.nombre}! 👋 Te recordamos tu cita odontológica para ${momento} a las ${cita.hora} para "${cita.tratamiento}" con ${cita.doctor} en ${datosConsultorio.nombre}.\n\n📅 Fecha: ${cita.fecha}\n⏰ Hora: ${cita.hora}\n📍 Sede: ${datosConsultorio.direccion}\n\nPor favor autogestiona tu asistencia en 1 clic:\n✅ Confirmar Cita: ${enlaces.confirmar}\n🔄 Solicitar Reagendamiento: ${enlaces.reagendar}\n❌ Cancelar Cita: ${enlaces.cancelar}\n\nTeléfono consultorio: ${datosConsultorio.telefonoPrincipal}. ¡Te esperamos!`;

    const url = generarEnlaceWhatsApp(cita.telefono, texto);
    window.open(url, '_blank');
  };

  // Enviar Email para una cita de prueba
  const handleEnviarEmailPrueba = (cita: CitaPruebaGenerada, esManana: boolean) => {
    if (!cita.email) {
      alert('Por favor ingresa un correo electrónico para realizar el envío por email.');
      return;
    }
    const enlaces = generarEnlacesAccionCita(cita.id);
    const asunto = esManana
      ? `Recordatorio Preventivo 24h: Tu cita odontológica es mañana a las ${cita.hora} - ${datosConsultorio.nombre}`
      : `Recordatorio: Tu cita odontológica de hoy a las ${cita.hora} - ${datosConsultorio.nombre}`;

    const cuerpo = `Hola ${cita.nombre},\n\nTe recordamos tu cita odontológica agendada en ${datosConsultorio.nombre}:\n\n• Especialista: ${cita.doctor}\n• Tratamiento: ${cita.tratamiento}\n• Horario: ${cita.hora}\n• Fecha: ${cita.fecha}\n• Sede: ${datosConsultorio.direccion}\n\nOpciones de autogestión directa:\n✅ Confirmar Asistencia: ${enlaces.confirmar}\n🔄 Solicitar Reagendamiento: ${enlaces.reagendar}\n❌ Cancelar Cita: ${enlaces.cancelar}\n\nAtentamente,\nEquipo Médico ${datosConsultorio.nombre}`;

    const url = generarEnlaceEmail(cita.email, asunto, cuerpo);
    window.location.href = url;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onCerrar}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full inline-block mb-1">
              Modo Laboratorio / Pruebas
            </span>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              Crear Citas de Prueba (Hoy y Mañana)
            </h2>
            <p className="text-xs text-slate-500">
              Genera 2 citas de prueba con tu teléfono y correo para verificar los recordatorios y enlaces de confirmación.
            </p>
          </div>
        </div>

        {alerta && (
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{alerta}</span>
          </div>
        )}

        {/* Si ya generó las citas, mostrar panel de prueba directo */}
        {citasGeneradas ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tarjeta Cita de Hoy */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-dentist-700 bg-dentist-50 px-2.5 py-1 rounded-lg border border-dentist-200">
                    <CalendarIcon className="w-3.5 h-3.5 text-dentist-600" />
                    Cita de Hoy ({citasGeneradas.hoy.fecha})
                  </span>
                  <span className="text-xs font-black text-slate-900">{citasGeneradas.hoy.hora}</span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p><strong>Paciente:</strong> {citasGeneradas.hoy.nombre}</p>
                  <p><strong>Teléfono:</strong> {citasGeneradas.hoy.telefono}</p>
                  <p><strong>Email:</strong> {citasGeneradas.hoy.email || 'No indicado'}</p>
                  <p><strong>Tratamiento:</strong> {citasGeneradas.hoy.tratamiento}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleEnviarWhatsAppPrueba(citasGeneradas.hoy, false)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enviar WhatsApp (Hoy)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEnviarEmailPrueba(citasGeneradas.hoy, false)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition"
                  >
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>Enviar Email (Hoy)</span>
                  </button>
                </div>
              </div>

              {/* Tarjeta Cita de Mañana */}
              <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                    <Sun className="w-3.5 h-3.5 text-amber-600" />
                    Cita de Mañana ({citasGeneradas.manana.fecha})
                  </span>
                  <span className="text-xs font-black text-slate-900">{citasGeneradas.manana.hora}</span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p><strong>Paciente:</strong> {citasGeneradas.manana.nombre}</p>
                  <p><strong>Teléfono:</strong> {citasGeneradas.manana.telefono}</p>
                  <p><strong>Email:</strong> {citasGeneradas.manana.email || 'No indicado'}</p>
                  <p><strong>Tratamiento:</strong> {citasGeneradas.manana.tratamiento}</p>
                </div>

                <div className="pt-2 border-t border-amber-200 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleEnviarWhatsAppPrueba(citasGeneradas.manana, true)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enviar WhatsApp (Mañana)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEnviarEmailPrueba(citasGeneradas.manana, true)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition"
                  >
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>Enviar Email (Mañana)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCitasGeneradas(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
              >
                ← Generar otras citas con otros datos
              </button>

              <button
                type="button"
                onClick={onCerrar}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                Cerrar y Ver en el Panel
              </button>
            </div>
          </div>
        ) : (
          /* Formulario de Configuración */
          <form onSubmit={handleCrearCitas} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Paciente
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Jairo Escobar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                />
              </div>

              {/* Teléfono WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teléfono / WhatsApp (donde llegará el mensaje)
                </label>
                <input
                  type="tel"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. 3015499931 ó +57 301 549 9931"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-dentist-500 font-medium"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Se le añadirá automáticamente el código de Colombia (+57).
                </span>
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico (donde llegará el recordatorio)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Opcional pero recomendado para probar el botón Email.
                </span>
              </div>

              {/* Tratamiento */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tratamiento
                </label>
                <select
                  value={tratamiento}
                  onChange={(e) => setTratamiento(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-dentist-500 bg-white"
                >
                  <option value="Valoración Odontológica de Prueba">Valoración Odontológica Inicial</option>
                  <option value="Profilaxis y Limpieza Profunda">Profilaxis y Limpieza Profunda</option>
                  <option value="Control de Ortodoncia">Control de Ortodoncia</option>
                  <option value="Blanqueamiento Dental LED">Blanqueamiento Dental LED</option>
                  <option value="Diseño de Sonrisa & Carillas">Diseño de Sonrisa & Carillas</option>
                </select>
              </div>
            </div>

            {/* Doctor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Especialista Asignado
              </label>
              <select
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-dentist-500 bg-white"
              >
                <option value="Dra. Yasmín Blanco">Dra. Yasmín Blanco (Rehabilitadora & Estética)</option>
                <option value="Dr. Carlos Ruiz">Dr. Carlos Ruiz (Periodoncia & Cirugía)</option>
                <option value="Dra. Laura Vega">Dra. Laura Vega (Ortodoncia)</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 text-sky-900 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-dentist-600" />
                ¿Qué se creará al presionar el botón?
              </p>
              <ul className="list-disc list-inside text-[11px] text-sky-800 space-y-0.5">
                <li>1 Cita para <strong>HOY ({fechaHoy}) a las 03:30 PM</strong></li>
                <li>1 Cita para <strong>MAÑANA ({fechaManana}) a las 09:00 AM</strong></li>
                <li>Ambas quedarán en tu Dashboard y en Centro de Recordatorios listas para despachar.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onCerrar}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={guardando}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-dentist-600 hover:bg-dentist-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-dentist-600/20 transition active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>{guardando ? 'Generando Citas...' : 'Generar Citas de Prueba'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
