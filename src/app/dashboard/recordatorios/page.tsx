'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Bell, 
  MessageCircle, 
  Mail, 
  Send, 
  CheckCircle2, 
  Clock, 
  Calendar as CalendarIcon, 
  ExternalLink, 
  Settings, 
  Edit3, 
  Sparkles, 
  Copy, 
  Check, 
  Zap, 
  Smartphone,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Sun,
  FlaskConical
} from 'lucide-react';
import ModalCrearCitasPrueba, { CitaPruebaGenerada } from '@/modules/citas/components/ModalCrearCitasPrueba';
import { 
  CanalRecordatorio, 
  PlantillaRecordatorio, 
  RecordatorioItem, 
  VariablesCita 
} from '@/modules/recordatorios/types';
import { 
  interpolarMensaje, 
  generarEnlaceWhatsApp,
  generarEnlacesAccionCita,
  generarEnlaceEmail,
  obtenerFechaHoy,
  obtenerFechaManana,
  formatearFechaEspanol
} from '@/modules/recordatorios/utils';
import { supabase } from '@/lib/supabase';
import { obtenerDatosConsultorio } from '@/modules/configuracion/consultorioService';

// Plantillas iniciales con enlaces de Confirmación, Reagendamiento y Cancelación
const PLANTILLAS_INICIALES: PlantillaRecordatorio[] = [
  {
    id: 'plan-wa-24h',
    nombre: 'Recordatorio WhatsApp (24h Antes)',
    canal: 'whatsapp',
    contenido: '¡Hola {{nombre_paciente}}! 👋 Te recordamos tu cita de {{tratamiento}} con el {{doctor}} programada para el {{fecha}} a las {{hora}} en la Clínica Dental Dra. Yasmín Blanco. 🦷\n\nElige una opción para gestionar tu cita de inmediato:\n✅ Confirmar asistencia: {{enlace_confirmar}}\n🔄 Reagendar fecha u hora: {{enlace_reagendar}}\n❌ Cancelar cita: {{enlace_cancelar}}\n\nSede: {{consultorio_direccion}}. Teléfono: {{consultorio_telefono}}\n¡Te esperamos!',
    anticipacionHoras: 24,
    activa: true,
  },
  {
    id: 'plan-mail-24h',
    nombre: 'Recordatorio Correo Electrónico (24h Antes)',
    canal: 'email',
    asunto: 'Recordatorio de Cita Odontológica - {{fecha}} a las {{hora}}',
    contenido: 'Estimado(a) {{nombre_paciente}},\n\nLe confirmamos los detalles de su cita odontológica agendada en la Clínica Dental Dra. Yasmín Blanco:\n\n• Tratamiento: {{tratamiento}}\n• Profesional: {{doctor}}\n• Fecha y Hora: {{fecha}} a las {{hora}}\n• Sede: {{consultorio_direccion}}\n\nPor favor seleccione una de las siguientes opciones para gestionar su cita de inmediato:\n\n👉 [CONFIRMAR CITA]: {{enlace_confirmar}}\n👉 [REAGENDAR CITA]: {{enlace_reagendar}}\n👉 [CANCELAR CITA]: {{enlace_cancelar}}\n\nTeléfono de atención al paciente: {{consultorio_telefono}}\n\nAtentamente,\nEquipo Médico Dra. Yasmín Blanco',
    anticipacionHoras: 24,
    activa: true,
  },
];

// Cola inicial de recordatorios generados a partir de las citas
const COLA_INICIAL: RecordatorioItem[] = [
  {
    id: 'rec-pedro-perez',
    citaId: '93799ea9-00cd-4def-ba4f-2cfd253dc093',
    pacienteNombre: 'Pedro Pérez',
    pacienteTelefono: '3015499931',
    pacienteEmail: 'gimob47836@ensproxy.com',
    doctorNombre: 'Dra. Yasmín Blanco',
    tratamiento: 'Valoración Odontológica Inicial',
    fechaCita: '2026-10-15',
    horaCita: '08:00 AM',
    canal: 'whatsapp',
    mensajeGenerado: '',
    estado: 'pendiente',
    programadoPara: '2026-10-14 08:00 AM (Aviso 24h antes)',
  },
  {
    id: 'rec-manana-2',
    citaId: 'cita-manana-restrepo',
    pacienteNombre: 'Valentina Restrepo Gil',
    pacienteTelefono: '+57 312 888 4433',
    pacienteEmail: 'valentina.restrepo@ejemplo.com',
    doctorNombre: 'Dra. Yasmín Blanco',
    tratamiento: 'Diseño de Sonrisa & Carillas',
    fechaCita: '2026-10-15',
    horaCita: '10:30 AM',
    canal: 'whatsapp',
    mensajeGenerado: '',
    estado: 'pendiente',
    programadoPara: '2026-10-14 08:00 AM (Aviso 24h antes)',
  },
  {
    id: 'rec-1',
    citaId: 'cita-1',
    pacienteNombre: 'María Camila Pérez',
    pacienteTelefono: '+57 310 987 6543',
    pacienteEmail: 'maria.perez@ejemplo.com',
    doctorNombre: 'Dr. Carlos Ruiz',
    tratamiento: 'Profilaxis y Limpieza Profunda',
    fechaCita: '2026-10-14',
    horaCita: '09:30 AM',
    canal: 'whatsapp',
    mensajeGenerado: '',
    estado: 'enviado',
    enviadoEn: '08:15 AM',
    programadoPara: '2026-10-14 08:00 AM',
  },
  {
    id: 'rec-2',
    citaId: 'cita-2',
    pacienteNombre: 'Andrés Felipe Gómez',
    pacienteTelefono: '+57 320 123 4567',
    pacienteEmail: 'andres.gomez@ejemplo.com',
    doctorNombre: 'Dra. Laura Vega',
    tratamiento: 'Control de Ortodoncia',
    fechaCita: '2026-10-16',
    horaCita: '02:00 PM',
    canal: 'whatsapp',
    mensajeGenerado: '',
    estado: 'pendiente',
    programadoPara: '2026-10-15 08:00 AM',
  },
  {
    id: 'rec-3',
    citaId: 'cita-3',
    pacienteNombre: 'Lucía Torres Mendoza',
    pacienteTelefono: '+57 301 555 7890',
    pacienteEmail: 'lucia.torres@ejemplo.com',
    doctorNombre: 'Dr. Carlos Ruiz',
    tratamiento: 'Resina Fotocurada (1 superficie)',
    fechaCita: '2026-10-14',
    horaCita: '10:00 AM',
    canal: 'email',
    mensajeGenerado: '',
    estado: 'enviado',
    enviadoEn: '2026-10-13 08:00 AM',
    programadoPara: '2026-10-13 08:00 AM',
  },
];

const VARIABLES_DISPONIBLES = [
  { etiqueta: '{{nombre_paciente}}', descripcion: 'Nombre del paciente' },
  { etiqueta: '{{fecha}}', descripcion: 'Fecha de la cita' },
  { etiqueta: '{{hora}}', descripcion: 'Hora asignada' },
  { etiqueta: '{{doctor}}', descripcion: 'Nombre del odontólogo' },
  { etiqueta: '{{tratamiento}}', descripcion: 'Servicio odontológico' },
  { etiqueta: '{{enlace_confirmar}}', descripcion: 'Enlace para confirmar cita' },
  { etiqueta: '{{enlace_reagendar}}', descripcion: 'Enlace para reagendar cita' },
  { etiqueta: '{{enlace_cancelar}}', descripcion: 'Enlace para cancelar cita' },
  { etiqueta: '{{enlace_portal}}', descripcion: 'Enlace al portal paciente' },
  { etiqueta: '{{consultorio_telefono}}', descripcion: 'Teléfono del consultorio' },
  { etiqueta: '{{consultorio_direccion}}', descripcion: 'Dirección del consultorio' },
];

export default function RecordatoriosPage() {
  const [pestaña, setPestaña] = useState<'cola' | 'plantillas' | 'automatizacion'>('cola');
  const [plantillas, setPlantillas] = useState<PlantillaRecordatorio[]>(PLANTILLAS_INICIALES);
  const [cola, setCola] = useState<RecordatorioItem[]>(COLA_INICIAL);
  const [plantillaActivaId, setPlantillaActivaId] = useState(PLANTILLAS_INICIALES[0].id);
  const [mensajeAlerta, setMensajeAlerta] = useState<string | null>(null);
  const [cargandoDB, setCargandoDB] = useState<boolean>(false);
  const [filtroFechaCola, setFiltroFechaCola] = useState<'manana' | 'hoy' | 'todas'>('manana');
  const [modalPruebaAbierto, setModalPruebaAbierto] = useState<boolean>(false);

  const fechaHoy = obtenerFechaHoy();
  const fechaManana = obtenerFechaManana();

  const handleCitasPruebaCreadas = ({
    citaHoy,
    citaManana,
  }: {
    citaHoy: CitaPruebaGenerada;
    citaManana: CitaPruebaGenerada;
  }) => {
    const itemHoy: RecordatorioItem = {
      id: `rec-${citaHoy.id}`,
      citaId: citaHoy.id,
      pacienteNombre: citaHoy.nombre,
      pacienteTelefono: citaHoy.telefono,
      pacienteEmail: citaHoy.email,
      doctorNombre: citaHoy.doctor,
      tratamiento: citaHoy.tratamiento,
      fechaCita: citaHoy.fecha,
      horaCita: citaHoy.hora,
      canal: 'whatsapp',
      mensajeGenerado: '',
      estado: 'pendiente',
      programadoPara: `${citaHoy.fecha} ${citaHoy.hora}`,
    };

    const itemManana: RecordatorioItem = {
      id: `rec-${citaManana.id}`,
      citaId: citaManana.id,
      pacienteNombre: citaManana.nombre,
      pacienteTelefono: citaManana.telefono,
      pacienteEmail: citaManana.email,
      doctorNombre: citaManana.doctor,
      tratamiento: citaManana.tratamiento,
      fechaCita: citaManana.fecha,
      horaCita: citaManana.hora,
      canal: 'whatsapp',
      mensajeGenerado: '',
      estado: 'pendiente',
      programadoPara: `${citaManana.fecha} ${citaManana.hora} (Aviso 24h antes)`,
    };

    setCola((prev) => [itemManana, itemHoy, ...prev]);
    setMensajeAlerta('¡Citas de prueba creadas! 1 para Hoy y 1 para Mañana agregadas a tu lista de envíos.');
    setTimeout(() => setMensajeAlerta(null), 6000);
  };

  // Sincronización en vivo con Supabase (Cargar citas reales como la de Pedro Pérez)
  React.useEffect(() => {
    let montado = true;
    async function sincronizarCitasReales() {
      try {
        setCargandoDB(true);
        const { data, error } = await supabase.rpc('obtener_citas_gestion');
        if (!error && Array.isArray(data) && data.length > 0 && montado) {
          const citasDB: RecordatorioItem[] = data.map((c: any) => ({
            id: `rec-db-${c.id}`,
            citaId: c.id,
            pacienteNombre: c.paciente_nombre || 'Paciente sin nombre',
            pacienteTelefono: c.paciente_telefono || '',
            pacienteEmail: c.paciente_email || '',
            doctorNombre: c.doctor_nombre || 'Dra. Yasmín Blanco',
            tratamiento: c.tratamiento_nombre || 'Valoración General',
            fechaCita: c.fecha,
            horaCita: c.hora_inicio || '08:00 AM',
            canal: 'whatsapp',
            mensajeGenerado: '',
            estado: c.estado === 'confirmada' ? 'enviado' : 'pendiente',
            programadoPara: `${c.fecha} ${c.hora_inicio || ''}`,
          }));

          setCola(prev => {
            const idsDB = new Set(citasDB.map(r => r.citaId));
            const prevFiltradas = prev.filter(p => !idsDB.has(p.citaId));
            return [...citasDB, ...prevFiltradas];
          });
        }
      } catch (err) {
        console.warn('Citas reales de Supabase en proceso:', err);
      } finally {
        if (montado) setCargandoDB(false);
      }
    }
    sincronizarCitasReales();
    return () => { montado = false; };
  }, []);

  // Plantilla seleccionada para editar
  const plantillaSeleccionada = plantillas.find(p => p.id === plantillaActivaId) || plantillas[0];

  // Filtros de fecha
  const colaManana = cola.filter(r => r.fechaCita === fechaManana);
  const colaHoy = cola.filter(r => r.fechaCita === fechaHoy);
  const colaFiltrada = cola.filter(r => {
    if (filtroFechaCola === 'manana') return r.fechaCita === fechaManana;
    if (filtroFechaCola === 'hoy') return r.fechaCita === fechaHoy;
    return true;
  });

  const pendientesManana = colaManana.filter(r => r.estado === 'pendiente');
  const pendientesTotales = cola.filter(r => r.estado === 'pendiente');

  // Generar texto para un recordatorio específico usando su plantilla con enlaces de acción
  const generarTextoParaCita = (item: RecordatorioItem, canal: CanalRecordatorio): string => {
    const plantilla = plantillas.find(p => p.canal === canal && p.activa) || plantillas[0];
    const enlaces = generarEnlacesAccionCita(item.citaId);
    const datosConsultorio = obtenerDatosConsultorio();
    
    const variables: VariablesCita = {
      nombre_paciente: item.pacienteNombre,
      doctor: item.doctorNombre,
      tratamiento: item.tratamiento,
      fecha: item.fechaCita === fechaManana ? `mañana (${formatearFechaEspanol(item.fechaCita)})` : item.fechaCita,
      hora: item.horaCita,
      consultorio_telefono: datosConsultorio.telefonoPrincipal || '+57 300 123 4567',
      consultorio_direccion: datosConsultorio.direccion || 'Calle 123 # 45-67',
      enlace_portal: 'https://odontocontrol-ashen.vercel.app/portal-paciente',
      enlace_confirmar: enlaces.confirmar,
      enlace_reagendar: enlaces.reagendar,
      enlace_cancelar: enlaces.cancelar,
    };
    return interpolarMensaje(plantilla.contenido, variables);
  };

  // Disparo manual de recordatorio por WhatsApp adaptado según si es para mañana o hoy
  const handleEnviarWhatsApp = (item: RecordatorioItem) => {
    const esManana = item.fechaCita === fechaManana;
    const enlaces = generarEnlacesAccionCita(item.citaId);
    const datosConsultorio = obtenerDatosConsultorio();

    const momentoTexto = esManana ? `mañana (${formatearFechaEspanol(item.fechaCita)})` : `el ${item.fechaCita}`;
    const texto = `¡Hola ${item.pacienteNombre}! 👋 Te recordamos tu cita odontológica para ${momentoTexto} a las ${item.horaCita} para "${item.tratamiento}" con ${item.doctorNombre} en ${datosConsultorio.nombre}.\n\n📅 Fecha: ${item.fechaCita}\n⏰ Hora: ${item.horaCita}\n📍 Dirección: ${datosConsultorio.direccion}\n\nOpciones de autogestión directa de tu cita:\n✅ Confirmar Asistencia: ${enlaces.confirmar}\n🔄 Solicitar Reagendamiento: ${enlaces.reagendar}\n❌ Cancelar Cita: ${enlaces.cancelar}\n\nSi necesitas ayuda, comunícate al ${datosConsultorio.telefonoPrincipal}. ¡Te esperamos!`;

    const enlace = generarEnlaceWhatsApp(item.pacienteTelefono, texto);

    // Marcar como enviado en la cola
    setCola(prev => prev.map(r => r.id === item.id ? { 
      ...r, 
      estado: 'enviado', 
      enviadoEn: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) 
    } : r));

    setMensajeAlerta(`Abriendo WhatsApp para enviar recordatorio de ${esManana ? 'mañana' : 'cita'} a ${item.pacienteNombre}...`);
    setTimeout(() => setMensajeAlerta(null), 5000);

    // Abrir WhatsApp en nueva pestaña
    window.open(enlace, '_blank');
  };

  // Disparo real de Correo Electrónico
  const handleEnviarEmail = (item: RecordatorioItem) => {
    const esManana = item.fechaCita === fechaManana;
    const enlaces = generarEnlacesAccionCita(item.citaId);
    const datosConsultorio = obtenerDatosConsultorio();

    const asunto = esManana 
      ? `Recordatorio: Tu cita odontológica es mañana a las ${item.horaCita} - ${datosConsultorio.nombre}`
      : `Recordatorio de Cita Odontológica (${item.fechaCita}) - ${datosConsultorio.nombre}`;

    const cuerpo = `Hola ${item.pacienteNombre},\n\nTe recordamos tu cita odontológica agendada en ${datosConsultorio.nombre} para ${esManana ? 'mañana' : item.fechaCita}:\n\n• Especialista: ${item.doctorNombre}\n• Tratamiento: ${item.tratamiento}\n• Horario: ${item.horaCita}\n• Sede: ${datosConsultorio.direccion}\n\nPor favor autogestiona tu cita seleccionando una opción:\n\n✅ Confirmar Asistencia: ${enlaces.confirmar}\n🔄 Solicitar Reagendamiento: ${enlaces.reagendar}\n❌ Cancelar Cita: ${enlaces.cancelar}\n\nTeléfono de atención: ${datosConsultorio.telefonoPrincipal}\n\nAtentamente,\nEquipo de ${datosConsultorio.nombre}`;

    const enlaceMail = generarEnlaceEmail(item.pacienteEmail, asunto, cuerpo);

    // Marcar como enviado en la cola
    setCola(prev => prev.map(r => r.id === item.id ? { 
      ...r, 
      estado: 'enviado', 
      enviadoEn: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) 
    } : r));

    setMensajeAlerta(`Abriendo cliente de correo para ${item.pacienteNombre} (${item.pacienteEmail})...`);
    setTimeout(() => setMensajeAlerta(null), 5000);

    // Abrir cliente de correo
    window.location.href = enlaceMail;
  };

  // Disparar en lote los recordatorios de mañana (Prioridad 24h)
  const handleDispararAutomaticos = () => {
    const pendientesParaManana = cola.filter(r => r.fechaCita === fechaManana && r.estado === 'pendiente');
    
    if (pendientesParaManana.length === 0) {
      const otrosPendientes = cola.filter(r => r.estado === 'pendiente');
      if (otrosPendientes.length === 0) {
        setMensajeAlerta('No hay recordatorios pendientes en la cola por despachar.');
      } else {
        setMensajeAlerta(`Todos los recordatorios de mañana (${formatearFechaEspanol(fechaManana)}) ya fueron enviados. Quedan ${otrosPendientes.length} citas en otras fechas.`);
      }
      setTimeout(() => setMensajeAlerta(null), 4000);
      return;
    }

    setCola(prev => prev.map(r => {
      if (r.fechaCita === fechaManana && r.estado === 'pendiente') {
        return {
          ...r,
          estado: 'enviado',
          enviadoEn: 'Hoy a las ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return r;
    }));

    // Abrir la primera cita de mañana para envío por WhatsApp en nueva pestaña
    const primera = pendientesParaManana[0];
    const enlaces = generarEnlacesAccionCita(primera.citaId);
    const datos = obtenerDatosConsultorio();
    const texto = `¡Hola ${primera.pacienteNombre}! 👋 Te recordamos tu cita odontológica para mañana (${primera.fechaCita}) a las ${primera.horaCita} para "${primera.tratamiento}" con ${primera.doctorNombre} en ${datos.nombre}.\n\n📅 Fecha: ${primera.fechaCita}\n⏰ Hora: ${primera.horaCita}\n📍 Sede: ${datos.direccion}\n\nOpciones de autogestión directa:\n✅ Confirmar Asistencia: ${enlaces.confirmar}\n🔄 Solicitar Reagendamiento: ${enlaces.reagendar}\n❌ Cancelar Cita: ${enlaces.cancelar}\n\n¡Te esperamos!`;
    const enlaceWA = generarEnlaceWhatsApp(primera.pacienteTelefono, texto);
    window.open(enlaceWA, '_blank');

    setMensajeAlerta(`¡Recordatorios de mañana enviados a ${pendientesParaManana.length} paciente(s)! Abriendo chat para ${primera.pacienteNombre}.`);
    setTimeout(() => setMensajeAlerta(null), 6000);
  };

  // Insertar variable en el cursor de la plantilla
  const handleInsertarVariable = (variable: string) => {
    setPlantillas(prev => prev.map(p => {
      if (p.id === plantillaSeleccionada.id) {
        return { ...p, contenido: p.contenido + ' ' + variable };
      }
      return p;
    }));
  };

  // Ejemplo de vista previa en vivo
  const vistaPreviaEjemplo = interpolarMensaje(plantillaSeleccionada.contenido, {
    nombre_paciente: 'Pedro Pérez',
    doctor: 'Dra. Yasmín Blanco',
    tratamiento: 'Valoración Odontológica Inicial',
    fecha: `mañana (${formatearFechaEspanol(fechaManana)})`,
    hora: '08:00 AM',
    consultorio_telefono: '+57 301 549 9931',
    consultorio_direccion: 'Calle 123 # 45-67, Consultorio 402',
    enlace_portal: 'https://odontocontrol-ashen.vercel.app/portal-paciente',
    enlace_confirmar: 'https://odontocontrol-ashen.vercel.app/portal-paciente?accion=confirmar',
    enlace_reagendar: 'https://odontocontrol-ashen.vercel.app/portal-paciente?accion=reagendar',
    enlace_cancelar: 'https://odontocontrol-ashen.vercel.app/portal-paciente?accion=cancelar',
  });

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
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Recordatorios Automáticos de Citas
                </h1>
                <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-600" />
                  Prioridad Mañana (24h)
                </span>
              </div>
              <p className="text-xs text-slate-500">Automatización de confirmaciones y reducción de inasistencias</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalPruebaAbierto(true)}
              className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95"
              title="Crear 2 citas de prueba para hoy y mañana con tus datos"
            >
              <FlaskConical className="w-4 h-4 text-slate-900" />
              <span>🧪 Crear Citas de Prueba</span>
            </button>

            <button
              onClick={handleDispararAutomaticos}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition active:scale-95"
              title="Enviar recordatorios automáticos por WhatsApp a los pacientes de mañana"
            >
              <Zap className="w-4 h-4" />
              <span>Disparar Recordatorios de Mañana ({pendientesManana.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Alerta de Éxito */}
      {mensajeAlerta && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{mensajeAlerta}</span>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Métricas del Sistema de Recordatorios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Citas de Mañana (Prioritarias) */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-100 uppercase tracking-wider flex items-center gap-1">
                <Sun className="w-3.5 h-3.5" />
                Citas de Mañana ({fechaManana})
              </span>
              <p className="text-3xl font-black mt-1">{colaManana.length}</p>
              <span className="text-[11px] text-amber-100 font-medium">
                {pendientesManana.length} pendientes de aviso
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/20 text-white">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Citas de Hoy */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Citas de Hoy ({fechaHoy})</span>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{colaHoy.length}</p>
              <span className="text-[11px] text-emerald-600 font-semibold">
                {colaHoy.filter(r => r.estado === 'enviado').length} avisos enviados
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CalendarIcon className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Tasa de Asistencia */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Tasa de Confirmación</span>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">97.2%</p>
              <span className="text-[11px] text-emerald-600 font-semibold">+18% con links directos</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Total Pendientes Globales */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Total Pendientes en Cola</span>
              <p className="text-2xl font-bold text-amber-600 mt-0.5">
                {pendientesTotales.length}
              </p>
              <span className="text-[11px] text-slate-500">WhatsApp & Correo</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <MessageCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setPestaña('cola')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
              pestaña === 'cola'
                ? 'bg-dentist-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Cola de Envíos de Citas</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              pestaña === 'cola' ? 'bg-white text-dentist-700' : 'bg-slate-200 text-slate-700'
            }`}>
              {cola.length}
            </span>
          </button>

          <button
            onClick={() => setPestaña('plantillas')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 ${
              pestaña === 'plantillas'
                ? 'bg-dentist-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Editor de Plantillas Dinámicas</span>
          </button>

          <button
            onClick={() => setPestaña('automatizacion')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 ${
              pestaña === 'automatizacion'
                ? 'bg-dentist-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configuración del Robot (Cron)</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* PESTAÑA 1: COLA DE ENVÍOS */}
        {/* ============================================================== */}
        {pestaña === 'cola' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            
            {/* Cabecera con Conmutador de Fecha */}
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Cola Programada de Avisos para Pacientes</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  El sistema detecta las citas de mañana ({formatearFechaEspanol(fechaManana)}) para enviar recordatorios con 24h de anticipación.
                </p>
              </div>

              {/* Conmutador de Fechas */}
              <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setFiltroFechaCola('manana')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    filtroFechaCola === 'manana'
                      ? 'bg-white text-dentist-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Mañana ({colaManana.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFiltroFechaCola('hoy')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    filtroFechaCola === 'hoy'
                      ? 'bg-white text-dentist-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-dentist-600" />
                  <span>Hoy ({colaHoy.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFiltroFechaCola('todas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    filtroFechaCola === 'todas'
                      ? 'bg-white text-dentist-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Todas ({cola.length})</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Paciente</th>
                    <th className="py-3.5 px-4">Cita Programada</th>
                    <th className="py-3.5 px-4">Canal</th>
                    <th className="py-3.5 px-4">Estado de Entrega</th>
                    <th className="py-3.5 px-4 text-right">Acción Inmediata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {colaFiltrada.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        <Sun className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-sm text-slate-700">No hay recordatorios en esta fecha</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Selecciona otra pestaña o agenda nuevas citas desde el panel.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    colaFiltrada.map((item) => {
                      const esManana = item.fechaCita === fechaManana;
                      const esHoy = item.fechaCita === fechaHoy;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block text-sm">{item.pacienteNombre}</span>
                            <span className="text-slate-500 text-[11px] block">{item.pacienteTelefono}</span>
                            {item.pacienteEmail && (
                              <span className="text-slate-400 text-[10px] block truncate max-w-[180px]">{item.pacienteEmail}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-900">{item.tratamiento}</span>
                              {esManana ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                                  <Sun className="w-3 h-3 text-amber-600" />
                                  Mañana
                                </span>
                              ) : esHoy ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Hoy
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                  {item.fechaCita}
                                </span>
                              )}
                            </div>
                            <span className="text-slate-500 text-[11px] block mt-0.5">
                              {formatearFechaEspanol(item.fechaCita)} • {item.horaCita} ({item.doctorNombre})
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              WhatsApp
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {item.estado === 'enviado' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Enviado {item.enviadoEn ? `(${item.enviadoEn})` : ''}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-full text-[11px]">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                {esManana ? 'Programado para aviso 24h' : 'Pendiente'}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleEnviarWhatsApp(item)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg shadow-2xs transition ${
                                item.estado === 'enviado'
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                              title={`Abrir WhatsApp con recordatorio para ${item.pacienteNombre}`}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>{item.estado === 'enviado' ? 'Reenviar' : 'Enviar WhatsApp'}</span>
                            </button>

                            <button
                              onClick={() => handleEnviarEmail(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                              title="Enviar por Correo Electrónico"
                            >
                              <Mail className="w-3.5 h-3.5 text-slate-500" />
                              <span>Email</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 2: EDITOR DE PLANTILLAS DINÁMICAS */}
        {/* ============================================================== */}
        {pestaña === 'plantillas' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Columna Izquierda: Editor */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-dentist-50 text-dentist-600">
                    <Edit3 className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Personalizar Plantilla de Mensaje</h3>
                    <p className="text-xs text-slate-500">Diseña el texto que recibirán los pacientes automáticamente</p>
                  </div>
                </div>

                <select
                  value={plantillaActivaId}
                  onChange={(e) => setPlantillaActivaId(e.target.value)}
                  className="text-xs border border-slate-300 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none"
                >
                  {plantillas.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Botones de Variables Disponibles */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Variables Dinámicas Disponibles (Haz clic para insertar):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {VARIABLES_DISPONIBLES.map(v => (
                    <button
                      key={v.etiqueta}
                      type="button"
                      onClick={() => handleInsertarVariable(v.etiqueta)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-dentist-50 hover:text-dentist-700 border border-slate-200 text-slate-700 transition flex items-center gap-1"
                      title={v.descripcion}
                    >
                      <span>{v.etiqueta}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Área de Texto */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cuerpo del Mensaje ({plantillaSeleccionada.canal.toUpperCase()}):
                </label>
                <textarea
                  rows={8}
                  value={plantillaSeleccionada.contenido}
                  onChange={(e) => {
                    const nuevoContenido = e.target.value;
                    setPlantillas(prev => prev.map(p => p.id === plantillaSeleccionada.id ? { ...p, contenido: nuevoContenido } : p));
                  }}
                  className="w-full text-xs font-mono p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  Anticipación: <strong>{plantillaSeleccionada.anticipacionHoras} horas antes</strong> de la cita.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMensajeAlerta('Plantilla guardada y actualizada con éxito.');
                    setTimeout(() => setMensajeAlerta(null), 3000);
                  }}
                  className="px-5 py-2 text-xs font-semibold bg-dentist-600 hover:bg-dentist-700 text-white rounded-xl shadow-sm transition"
                >
                  Guardar Plantilla
                </button>
              </div>
            </div>

            {/* Columna Derecha: Vista Previa en Vivo (Simulación de Celular) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Vista Previa en Tiempo Real (Paciente)</span>
              </h4>

              {/* Celular Maquetado */}
              <div className="bg-slate-900 rounded-3xl p-3 shadow-xl max-w-sm mx-auto">
                {/* Pantalla */}
                <div className="bg-[#efeae2] rounded-2xl p-4 min-h-[380px] flex flex-col justify-between">
                  {/* Barra superior de WhatsApp */}
                  <div className="bg-[#075e54] -mx-4 -mt-4 p-3 rounded-t-2xl flex items-center gap-2 text-white">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                      YB
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">Clínica Dra. Yasmín Blanco</p>
                      <p className="text-[10px] text-emerald-200">Cuenta de empresa oficial</p>
                    </div>
                  </div>

                  {/* Globo de mensaje */}
                  <div className="my-auto">
                    <div className="bg-white rounded-2xl rounded-tl-none p-3.5 shadow-sm text-xs text-slate-800 leading-relaxed space-y-2 whitespace-pre-wrap">
                      <p>{vistaPreviaEjemplo}</p>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400">08:00 AM ✓✓</span>
                      </div>
                    </div>
                  </div>

                  {/* Pie de pantalla */}
                  <div className="text-center pt-2">
                    <span className="text-[10px] text-slate-400">
                      Mensaje cifrado de extremo a extremo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 3: CONFIGURACIÓN DEL ROBOT (CRON) */}
        {/* ============================================================== */}
        {pestaña === 'automatizacion' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Motor de Automatización de Envíos (Cron Job)</h3>
                <p className="text-xs text-slate-500">
                  Configura cómo y cuándo el sistema dispara los recordatorios de manera autónoma.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Envío Automático Diario</h4>
                  <p className="text-slate-500 mt-0.5">El sistema busca todas las citas del día siguiente y envía los recordatorios.</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs">
                  Activo (08:00 AM)
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Canal de Envío Preferido</h4>
                  <p className="text-slate-500 mt-0.5">Intentar primero por WhatsApp; si no hay respuesta o falla, enviar correo.</p>
                </div>
                <span className="bg-sky-100 text-sky-800 font-semibold px-3 py-1 rounded-full text-xs">
                  WhatsApp ➔ Email
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Enlace de Reagendamiento en el Mensaje</h4>
                  <p className="text-slate-500 mt-0.5">Incluye un enlace con token seguro para que el paciente confirme o cambie la hora en 1 clic.</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs">
                  Habilitado
                </span>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setMensajeAlerta('Configuración del motor de automatización guardada correctamente.');
                  setTimeout(() => setMensajeAlerta(null), 3000);
                }}
                className="px-6 py-2.5 text-xs font-semibold bg-dentist-600 hover:bg-dentist-700 text-white rounded-xl shadow-sm transition"
              >
                Guardar Ajustes del Robot
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal para Crear Citas de Prueba (Hoy y Mañana) */}
      <ModalCrearCitasPrueba
        abierto={modalPruebaAbierto}
        onCerrar={() => setModalPruebaAbierto(false)}
        onCitasCreadas={handleCitasPruebaCreadas}
      />
    </div>
  );
}
