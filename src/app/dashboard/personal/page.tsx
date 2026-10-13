'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  UserCheck, 
  ArrowLeft, 
  Check, 
  X, 
  Users, 
  PlusCircle, 
  Lock, 
  CheckCircle2, 
  Sliders, 
  Search, 
  Mail, 
  Phone, 
  Award,
  AlertCircle
} from 'lucide-react';
import { 
  PerfilPersonal, 
  PermisoCodigo, 
  CATALOGO_PERMISOS, 
  RolUsuario 
} from '@/modules/personal/types';

// Personal inicial de prueba
const PERSONAL_INICIAL: PerfilPersonal[] = [
  {
    id: 'user-admin',
    nombres: 'Dra. Patricia',
    apellidos: 'Gómez Salazar',
    rol: 'admin',
    telefono: '+57 300 987 6543',
    especialidad: 'Directora Médica / Cirugía Oral',
    registroProfesional: 'OD-19842',
    activo: true,
    permisos: [
      'citas.ver', 'citas.aprobar', 'citas.crear', 'citas.cancelar',
      'pacientes.ver', 'pacientes.crear', 'pacientes.editar',
      'historias.ver', 'historias.crear',
      'personal.ver', 'personal.gestionar',
      'tratamientos.gestionar', 'recordatorios.gestionar', 'configuracion.editar'
    ],
  },
  {
    id: 'user-doc-1',
    nombres: 'Dr. Carlos',
    apellidos: 'Ruiz Morales',
    rol: 'odontologo',
    telefono: '+57 310 111 2233',
    especialidad: 'Odontología General y Estética',
    registroProfesional: 'OD-24510',
    activo: true,
    permisos: [
      'citas.ver', 'citas.aprobar',
      'pacientes.ver',
      'historias.ver', 'historias.crear'
    ],
  },
  {
    id: 'user-doc-2',
    nombres: 'Dra. Laura',
    apellidos: 'Vega Pardo',
    rol: 'odontologo',
    telefono: '+57 315 222 3344',
    especialidad: 'Ortodoncia y Ortopedia Maxilar',
    registroProfesional: 'OD-28901',
    activo: true,
    permisos: [
      'citas.ver', 'citas.aprobar',
      'pacientes.ver',
      'historias.ver', 'historias.crear'
    ],
  },
  {
    id: 'user-recep-1',
    nombres: 'Andrea',
    apellidos: 'Morales Díaz',
    rol: 'recepcionista',
    telefono: '+57 320 333 4455',
    especialidad: 'Coordinación y Recepción',
    activo: true,
    permisos: [
      'citas.ver', 'citas.aprobar', 'citas.crear', 'citas.cancelar',
      'pacientes.ver', 'pacientes.crear', 'pacientes.editar',
      'recordatorios.gestionar'
    ],
  },
];

// Módulos agrupados para las casillas de verificación
const MODULOS_PERMISOS = [
  'Citas',
  'Pacientes',
  'Historias Clínicas',
  'Personal',
  'Tratamientos',
  'Configuración',
] as const;

export default function GestionPersonalPermisosPage() {
  const [personal, setPersonal] = useState<PerfilPersonal[]>(PERSONAL_INICIAL);
  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState<string>(PERSONAL_INICIAL[1].id); // Por defecto el Dr. Carlos
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroRol, setFiltroRol] = useState<string>('todos');
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Modal para agregar nuevo miembro
  const [modalNuevoMiembro, setModalNuevoMiembro] = useState<boolean>(false);
  const [nuevoMiembro, setNuevoMiembro] = useState({
    nombres: '',
    apellidos: '',
    rol: 'odontologo' as RolUsuario,
    telefono: '',
    especialidad: '',
    registroProfesional: '',
  });

  // Usuario actualmente seleccionado para editar sus permisos
  const usuarioActivo = personal.find(p => p.id === usuarioSeleccionadoId) || personal[0];

  // Alternar un permiso específico para el usuario activo
  const handleTogglePermiso = (codigo: PermisoCodigo) => {
    if (usuarioActivo.rol === 'admin') return; // Los administradores tienen todos los permisos bloqueados en activo

    setPersonal(prev => prev.map(u => {
      if (u.id === usuarioActivo.id) {
        const tienePermiso = u.permisos.includes(codigo);
        const nuevosPermisos = tienePermiso
          ? u.permisos.filter(p => p !== codigo)
          : [...u.permisos, codigo];

        return { ...u, permisos: nuevosPermisos };
      }
      return u;
    }));

    setMensajeExito(`Permisos de ${usuarioActivo.nombres} ${usuarioActivo.apellidos} actualizados correctamente.`);
    setTimeout(() => setMensajeExito(null), 3500);
  };

  // Conceder todos los permisos del módulo
  const handleConcederTodosModulo = (modulo: string) => {
    if (usuarioActivo.rol === 'admin') return;
    const permisosDelModulo = CATALOGO_PERMISOS.filter(p => p.modulo === modulo).map(p => p.codigo);
    
    setPersonal(prev => prev.map(u => {
      if (u.id === usuarioActivo.id) {
        const union = Array.from(new Set([...u.permisos, ...permisosDelModulo]));
        return { ...u, permisos: union };
      }
      return u;
    }));
  };

  // Crear nuevo miembro del equipo
  const handleCrearMiembro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMiembro.nombres || !nuevoMiembro.apellidos) return;

    // Permisos por defecto según el rol seleccionado
    let permisosBase: PermisoCodigo[] = [];
    if (nuevoMiembro.rol === 'admin') {
      permisosBase = CATALOGO_PERMISOS.map(p => p.codigo);
    } else if (nuevoMiembro.rol === 'odontologo') {
      permisosBase = ['citas.ver', 'citas.aprobar', 'pacientes.ver', 'historias.ver', 'historias.crear'];
    } else if (nuevoMiembro.rol === 'recepcionista') {
      permisosBase = ['citas.ver', 'citas.aprobar', 'citas.crear', 'citas.cancelar', 'pacientes.ver', 'pacientes.crear', 'pacientes.editar', 'recordatorios.gestionar'];
    }

    const nuevo: PerfilPersonal = {
      id: `user-${Date.now()}`,
      nombres: nuevoMiembro.nombres,
      apellidos: nuevoMiembro.apellidos,
      rol: nuevoMiembro.rol,
      telefono: nuevoMiembro.telefono,
      especialidad: nuevoMiembro.especialidad,
      registroProfesional: nuevoMiembro.registroProfesional,
      activo: true,
      permisos: permisosBase,
    };

    setPersonal([...personal, nuevo]);
    setUsuarioSeleccionadoId(nuevo.id);
    setModalNuevoMiembro(false);
    setNuevoMiembro({
      nombres: '',
      apellidos: '',
      rol: 'odontologo',
      telefono: '',
      especialidad: '',
      registroProfesional: '',
    });
    setMensajeExito(`Se ha registrado a ${nuevo.nombres} ${nuevo.apellidos} con éxito.`);
    setTimeout(() => setMensajeExito(null), 4000);
  };

  // Filtrado del personal
  const personalFiltrado = personal.filter(p => {
    const coincideRol = filtroRol === 'todos' || p.rol === filtroRol;
    const coincideBusqueda = 
      `${p.nombres} ${p.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.especialidad && p.especialidad.toLowerCase().includes(busqueda.toLowerCase()));
    return coincideRol && coincideBusqueda;
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
              title="Volver al panel principal"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Control de Roles y Permisos
                </h1>
                <span className="text-[11px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-200">
                  Panel de Administrador
                </span>
              </div>
              <p className="text-xs text-slate-500">Asigna permisos individuales al personal del consultorio</p>
            </div>
          </div>

          <button
            onClick={() => setModalNuevoMiembro(true)}
            className="inline-flex items-center gap-1.5 bg-dentist-600 hover:bg-dentist-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Colaborador</span>
          </button>
        </div>
      </header>

      {/* Alerta de notificación */}
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

      {/* Contenido Principal con Diseño de 2 Columnas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ============================================================== */}
          {/* COLUMNA IZQUIERDA: LISTA DEL PERSONAL (4 Cols) */}
          {/* ============================================================== */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-dentist-600" />
                  <span>Equipo del Consultorio ({personalFiltrado.length})</span>
                </h2>
                <select
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none"
                >
                  <option value="todos">Todos los roles</option>
                  <option value="admin">Administradores</option>
                  <option value="odontologo">Odontólogos</option>
                  <option value="recepcionista">Recepción</option>
                </select>
              </div>

              {/* Buscador */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o especialidad..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-dentist-500"
                />
              </div>
            </div>

            {/* Lista de colaboradores */}
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {personalFiltrado.map((u) => {
                const esSeleccionado = u.id === usuarioActivo.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => setUsuarioSeleccionadoId(u.id)}
                    className={`p-4 cursor-pointer transition-all flex items-start justify-between ${
                      esSeleccionado 
                        ? 'bg-dentist-50/70 border-l-4 border-dentist-600' 
                        : 'hover:bg-slate-50/80 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {u.nombres} {u.apellidos}
                        </span>
                        {u.rol === 'admin' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                            Superadmin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {u.especialidad || (u.rol === 'recepcionista' ? 'Recepción y Atención' : 'Personal Clínico')}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span className="capitalize font-medium text-slate-600">Rol: {u.rol}</span>
                        <span>•</span>
                        <span className="font-semibold text-dentist-700">
                          {u.rol === 'admin' ? 'Todos los permisos' : `${u.permisos.length} permisos activos`}
                        </span>
                      </div>
                    </div>

                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${u.activo ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================================== */}
          {/* COLUMNA DERECHA: MATRIZ DE PERMISOS GRANULARES (7 Cols) */}
          {/* ============================================================== */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              {/* Encabezado del usuario seleccionado */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      Permisos de {usuarioActivo.nombres} {usuarioActivo.apellidos}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rol: <span className="font-semibold capitalize text-slate-800">{usuarioActivo.rol}</span>
                    {usuarioActivo.registroProfesional && (
                      <span> • Registro: {usuarioActivo.registroProfesional}</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-xl border border-slate-200">
                    {usuarioActivo.rol === 'admin' 
                      ? 'Acceso Total (14/14)' 
                      : `${usuarioActivo.permisos.length} de ${CATALOGO_PERMISOS.length} concedidos`}
                  </span>
                </div>
              </div>

              {/* Aviso si es Administrador */}
              {usuarioActivo.rol === 'admin' ? (
                <div className="p-4 mb-6 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-bold text-indigo-950">Este usuario tiene el rol de Administrador</p>
                    <p className="mt-0.5 text-indigo-800">
                      Los administradores cuentan con todos los permisos habilitados por defecto en el sistema y no requieren asignación manual.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 mb-6 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 flex items-center justify-between text-xs">
                  <span className="text-slate-600">
                    Marca o desmarca las casillas para habilitar o restringir funciones a este usuario.
                  </span>
                </div>
              )}

              {/* Grupos de Permisos por Módulo */}
              <div className="space-y-6">
                {MODULOS_PERMISOS.map((modulo) => {
                  const permisosModulo = CATALOGO_PERMISOS.filter(p => p.modulo === modulo);
                  if (permisosModulo.length === 0) return null;

                  return (
                    <div key={modulo} className="bg-slate-50/70 rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                          Módulo: {modulo}
                        </h3>
                        {usuarioActivo.rol !== 'admin' && (
                          <button
                            onClick={() => handleConcederTodosModulo(modulo)}
                            className="text-[11px] font-semibold text-dentist-700 hover:text-dentist-800 hover:underline"
                          >
                            Habilitar todos
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {permisosModulo.map((permiso) => {
                          const estaActivo = usuarioActivo.rol === 'admin' || usuarioActivo.permisos.includes(permiso.codigo);
                          const esBloqueadoAdmin = usuarioActivo.rol === 'admin';

                          return (
                            <label
                              key={permiso.codigo}
                              className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                                estaActivo
                                  ? 'bg-white border-dentist-300 shadow-2xs'
                                  : 'bg-white/60 border-slate-200 hover:bg-white'
                              } ${esBloqueadoAdmin ? 'cursor-not-allowed opacity-90' : ''}`}
                            >
                              <input
                                type="checkbox"
                                disabled={esBloqueadoAdmin}
                                checked={estaActivo}
                                onChange={() => handleTogglePermiso(permiso.codigo)}
                                className="mt-0.5 rounded border-slate-300 text-dentist-600 focus:ring-dentist-500 h-4 w-4 shrink-0"
                              />
                              <div>
                                <span className="block text-xs font-semibold text-slate-900 leading-tight">
                                  {permiso.nombre}
                                </span>
                                <span className="block text-[11px] text-slate-500 mt-0.5 leading-snug">
                                  {permiso.descripcion}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pie del Panel */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Los cambios se aplican y sincronizan de forma inmediata con las políticas de seguridad (RLS).
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================== */}
      {/* MODAL: REGISTRAR NUEVO COLABORADOR */}
      {/* ============================================================== */}
      {modalNuevoMiembro && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="font-bold text-base text-slate-900">Registrar Nuevo Colaborador</h3>
                <p className="text-xs text-slate-500">Añade personal al consultorio y configura sus permisos</p>
              </div>
              <button 
                onClick={() => setModalNuevoMiembro(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearMiembro} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Manuel"
                    value={nuevoMiembro.nombres}
                    onChange={e => setNuevoMiembro({ ...nuevoMiembro, nombres: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Cárdenas"
                    value={nuevoMiembro.apellidos}
                    onChange={e => setNuevoMiembro({ ...nuevoMiembro, apellidos: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rol Asignado *</label>
                  <select
                    value={nuevoMiembro.rol}
                    onChange={e => setNuevoMiembro({ ...nuevoMiembro, rol: e.target.value as RolUsuario })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                  >
                    <option value="odontologo">Odontólogo / Doctor</option>
                    <option value="recepcionista">Recepcionista</option>
                    <option value="admin">Administrador General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono Móvil</label>
                  <input
                    type="text"
                    placeholder="+57 300 000 0000"
                    value={nuevoMiembro.telefono}
                    onChange={e => setNuevoMiembro({ ...nuevoMiembro, telefono: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                  />
                </div>
              </div>

              {nuevoMiembro.rol === 'odontologo' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Especialidad</label>
                    <input
                      type="text"
                      placeholder="Ej. Endodoncia, Periodoncia"
                      value={nuevoMiembro.especialidad}
                      onChange={e => setNuevoMiembro({ ...nuevoMiembro, especialidad: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tarjeta Profesional</label>
                    <input
                      type="text"
                      placeholder="Ej. OD-12345"
                      value={nuevoMiembro.registroProfesional}
                      onChange={e => setNuevoMiembro({ ...nuevoMiembro, registroProfesional: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalNuevoMiembro(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-dentist-600 hover:bg-dentist-700 text-white rounded-xl shadow-sm transition"
                >
                  Guardar y Asignar Permisos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
