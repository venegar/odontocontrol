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
  CalendarPlus
} from 'lucide-react';
import { Paciente, TipoDocumento } from '@/modules/pacientes/types';

// Pacientes iniciales de demostración con antecedentes clínicos
const PACIENTES_INICIALES: Paciente[] = [
  {
    id: 'pac-1',
    tipoDocumento: 'CC',
    numeroDocumento: '1020304050',
    nombres: 'María Camila',
    apellidos: 'Pérez Gómez',
    email: 'maria.perez@ejemplo.com',
    telefono: '+57 310 987 6543',
    fechaNacimiento: '1995-06-15',
    genero: 'Femenino',
    ciudad: 'Bogotá',
    direccion: 'Calle 127 # 19-45 Apto 302',
    alergias: ['Penicilina', 'Látex'],
    enfermedadesPrevias: ['Hipotensión'],
    medicamentosActuales: ['Antihistamínicos'],
    grupoSanguineo: 'O+',
    contactoEmergenciaNombre: 'Carlos Pérez (Padre)',
    contactoEmergenciaTelefono: '+57 311 222 3344',
    contactoEmergenciaParentesco: 'Padre',
    observaciones: 'Presenta fobia a las agujas; requiere anestesia con técnica lenta.',
    creadoEn: '2026-01-10',
  },
  {
    id: 'pac-2',
    tipoDocumento: 'CC',
    numeroDocumento: '79845123',
    nombres: 'Andrés Felipe',
    apellidos: 'Gómez Salcedo',
    email: 'andres.gomez@ejemplo.com',
    telefono: '+57 320 123 4567',
    fechaNacimiento: '1988-11-23',
    genero: 'Masculino',
    ciudad: 'Bogotá',
    direccion: 'Carrera 7 # 65-12',
    alergias: [],
    enfermedadesPrevias: ['Hipertensión arterial controlada'],
    medicamentosActuales: ['Losartán 50mg'],
    grupoSanguineo: 'A+',
    contactoEmergenciaNombre: 'Diana Rincón',
    contactoEmergenciaTelefono: '+57 315 888 9900',
    contactoEmergenciaParentesco: 'Esposa',
    observaciones: 'Tomar presión arterial antes de cualquier procedimiento invasivo.',
    creadoEn: '2026-02-14',
  },
  {
    id: 'pac-3',
    tipoDocumento: 'CC',
    numeroDocumento: '52431980',
    nombres: 'Lucía',
    apellidos: 'Torres Mendoza',
    email: 'lucia.torres@ejemplo.com',
    telefono: '+57 301 555 7890',
    fechaNacimiento: '2001-03-30',
    genero: 'Femenino',
    ciudad: 'Bogotá',
    direccion: 'Transversal 23 # 85-30',
    alergias: ['Aspirina / AINEs'],
    enfermedadesPrevias: [],
    medicamentosActuales: [],
    grupoSanguineo: 'B+',
    contactoEmergenciaNombre: 'Martha Mendoza',
    contactoEmergenciaTelefono: '+57 300 444 1122',
    contactoEmergenciaParentesco: 'Madre',
    observaciones: 'Buena salud general. Tratamiento de ortodoncia en curso.',
    creadoEn: '2026-03-05',
  },
  {
    id: 'pac-4',
    tipoDocumento: 'TI',
    numeroDocumento: '1098234567',
    nombres: 'Santiago',
    apellidos: 'Morales Silva',
    email: 'contacto.padres@ejemplo.com',
    telefono: '+57 312 666 7788',
    fechaNacimiento: '2012-08-19',
    genero: 'Masculino',
    ciudad: 'Bogotá',
    direccion: 'Calle 140 # 9-20',
    alergias: [],
    enfermedadesPrevias: ['Asma bronquial'],
    medicamentosActuales: ['Salbutamol inhalador si presenta crisis'],
    grupoSanguineo: 'O+',
    contactoEmergenciaNombre: 'Claudia Silva',
    contactoEmergenciaTelefono: '+57 312 666 7788',
    contactoEmergenciaParentesco: 'Madre',
    observaciones: 'Paciente menor de edad. Asiste siempre con acudiente.',
    creadoEn: '2026-04-18',
  },
];

export default function GestionPacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>(PACIENTES_INICIALES);
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroCondicion, setFiltroCondicion] = useState<'todos' | 'alergias' | 'enfermedades'>('todos');
  
  // Modales
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);
  const [modalNuevoPaciente, setModalNuevoPaciente] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Formulario de Nuevo Paciente
  const [nuevoForm, setNuevoForm] = useState({
    tipoDocumento: 'CC' as TipoDocumento,
    numeroDocumento: '',
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
    const texto = `${p.nombres} ${p.apellidos} ${p.numeroDocumento} ${p.telefono} ${p.email}`.toLowerCase();
    const coincideBusqueda = texto.includes(busqueda.toLowerCase());

    if (!coincideBusqueda) return false;

    if (filtroCondicion === 'alergias') {
      return p.alergias && p.alergias.length > 0;
    }
    if (filtroCondicion === 'enfermedades') {
      return p.enfermedadesPrevias && p.enfermedadesPrevias.length > 0;
    }

    return true;
  });

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
      observaciones: nuevoForm.observaciones,
      creadoEn: new Date().toISOString().split('T')[0],
    };

    setPacientes([nuevo, ...pacientes]);
    setModalNuevoPaciente(false);
    setMensajeExito(`¡Paciente ${nuevo.nombres} ${nuevo.apellidos} registrado con éxito en el sistema!`);
    setTimeout(() => setMensajeExito(null), 5000);

    // Reset formulario
    setNuevoForm({
      tipoDocumento: 'CC',
      numeroDocumento: '',
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

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filtroCondicion}
              onChange={(e) => setFiltroCondicion(e.target.value as any)}
              className="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-dentist-500 w-full sm:w-auto"
            >
              <option value="todos">Todos los Pacientes</option>
              <option value="alergias">Solo con Alergias a Medicamentos</option>
              <option value="enfermedades">Solo con Enfermedades Previas</option>
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
                  <th className="py-3.5 px-4">Documento</th>
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
                          <span className="block text-[11px] text-slate-400">GS: {pac.grupoSanguineo || 'N/A'}</span>
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
                <span className="text-[11px] font-bold uppercase tracking-wider text-dentist-600 bg-dentist-50 px-2 py-0.5 rounded-md">
                  Ficha Odontológica Oficial
                </span>
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

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-100">
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
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-1 focus:ring-dentist-500"
                    >
                      <option value="CC">Cédula de Ciudadanía (CC)</option>
                      <option value="TI">Tarjeta de Identidad (TI)</option>
                      <option value="CE">Cédula de Extranjería (CE)</option>
                      <option value="Pasaporte">Pasaporte</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
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

              {/* Sección 3: Contacto de Emergencia */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  3. Contacto de Emergencia
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
    </div>
  );
}
