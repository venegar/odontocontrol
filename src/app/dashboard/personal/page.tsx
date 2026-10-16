'use client';

import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Trash2,
  AlertTriangle,
  Crown,
  ShieldAlert,
  Package,
  Layers,
  FlaskConical
} from 'lucide-react';
import { 
  PerfilPersonal, 
  PermisoCodigo, 
  CATALOGO_PERMISOS, 
  RolUsuario 
} from '@/modules/personal/types';
import FotoPerfilDropzone from '@/components/ui/FotoPerfilDropzone';

// Personal inicial con Jairo Escobar Cárcamo como Superadmin y roles de Inventario
const PERSONAL_INICIAL: PerfilPersonal[] = [
  {
    id: 'user-superadmin-jairo',
    nombres: 'Jairo',
    apellidos: 'Escobar Cárcamo',
    rol: 'superadmin',
    telefono: '+57 300 123 4567',
    especialidad: 'Superadministrador & Dirección General',
    registroProfesional: 'SUPERADMIN-001',
    activo: true,
    permisos: CATALOGO_PERMISOS.map(p => p.codigo),
  },
  {
    id: 'user-admin-yasmin',
    nombres: 'Dra. Yasmín',
    apellidos: 'Blanco',
    rol: 'admin',
    telefono: '+57 312 345 6789',
    especialidad: 'Directora Médica & Implantología/Estética',
    registroProfesional: 'COL-28004921',
    activo: true,
    permisos: CATALOGO_PERMISOS.map(p => p.codigo),
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
      'historias.ver', 'historias.crear',
      'inventario.ver', 'inventario.descontar'
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
      'historias.ver', 'historias.crear',
      'inventario.ver', 'inventario.descontar'
    ],
  },
  {
    id: 'user-inv-1',
    nombres: 'Sofía',
    apellidos: 'Castro Peña',
    rol: 'gestor_inventario',
    telefono: '+57 318 444 5566',
    especialidad: 'Gestión de Farmacia, Insumos y Almacén',
    registroProfesional: 'INV-402',
    activo: true,
    permisos: [
      'inventario.ver',
      'inventario.crear',
      'inventario.editar',
      'inventario.descontar',
      'tratamientos.gestionar',
    ],
  },
  {
    id: 'user-asist-1',
    nombres: 'Valentina',
    apellidos: 'Ríos Gómez',
    rol: 'asistente',
    telefono: '+57 321 555 6677',
    especialidad: 'Auxiliar de Odontología e Instrumental',
    registroProfesional: 'AUX-891',
    activo: true,
    permisos: [
      'citas.ver',
      'historias.ver',
      'inventario.ver',
      'inventario.descontar',
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
      'inventario.ver',
      'recordatorios.gestionar'
    ],
  },
];

// Módulos agrupados para las casillas de verificación
const MODULOS_PERMISOS = [
  'Citas',
  'Pacientes',
  'Historias Clínicas',
  'Inventario',
  'Personal',
  'Tratamientos',
  'Configuración',
] as const;

const STORAGE_KEY_PERSONAL = 'consultorio_personal_v3';

export default function GestionPersonalPermisosPage() {
  const [personal, setPersonal] = useState<PerfilPersonal[]>(PERSONAL_INICIAL);
  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState<string>(PERSONAL_INICIAL[0].id); // Jairo Escobar por defecto
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroRol, setFiltroRol] = useState<string>('todos');
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Modal para agregar nuevo miembro
  const [modalNuevoMiembro, setModalNuevoMiembro] = useState<boolean>(false);
  const [nuevoMiembro, setNuevoMiembro] = useState({
    nombres: '',
    apellidos: '',
    rol: 'gestor_inventario' as RolUsuario,
    telefono: '',
    especialidad: '',
    registroProfesional: '',
    fotoUrl: '',
  });

  // Modal para eliminar / desvincular colaborador
  const [colaboradorAEliminar, setColaboradorAEliminar] = useState<PerfilPersonal | null>(null);

  // Detección del usuario con sesión activa
  const [usuarioEnSesion, setUsuarioEnSesion] = useState<{
    nombre: string;
    rol: RolUsuario;
  }>({
    nombre: 'Jairo Escobar Cárcamo',
    rol: 'superadmin',
  });

  // Cargar personal desde el almacenamiento local
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const guardado = localStorage.getItem(STORAGE_KEY_PERSONAL);
        if (guardado) {
          const parsed = JSON.parse(guardado);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Asegurar que Jairo Escobar Cárcamo esté siempre registrado como superadmin
            const asegurados = parsed.map((u: PerfilPersonal) => {
              if (
                u.id === 'user-superadmin-jairo' ||
                (u.nombres?.toLowerCase().includes('jairo') && u.apellidos?.toLowerCase().includes('escobar'))
              ) {
                return {
                  ...u,
                  nombres: 'Jairo',
                  apellidos: 'Escobar Cárcamo',
                  rol: 'superadmin' as RolUsuario,
                  permisos: CATALOGO_PERMISOS.map((p) => p.codigo),
                };
              }
              return u;
            });

            if (!asegurados.some((u: PerfilPersonal) => u.rol === 'superadmin')) {
              asegurados.unshift(PERSONAL_INICIAL[0]);
            }

            // Asegurar que existan los roles de inventario en la lista si no estaban presentes
            if (!asegurados.some((u: PerfilPersonal) => u.rol === 'gestor_inventario')) {
              asegurados.push(PERSONAL_INICIAL[4]);
            }
            if (!asegurados.some((u: PerfilPersonal) => u.rol === 'asistente')) {
              asegurados.push(PERSONAL_INICIAL[5]);
            }

            setPersonal(asegurados);
            return;
          }
        }
      } catch (e) {
        console.error('Error al cargar personal:', e);
      }
    }
    setPersonal(PERSONAL_INICIAL);
  }, []);

  // Leer sesión de usuario activo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const sesion = localStorage.getItem('consultorio_usuario_activo');
        if (sesion) {
          const p = JSON.parse(sesion);
          const esJairo = (p.nombres || '').toLowerCase().includes('jairo') || (p.apellidos || '').toLowerCase().includes('escobar');
          setUsuarioEnSesion({
            nombre: esJairo ? 'Jairo Escobar Cárcamo' : `${p.nombres || ''} ${p.apellidos || ''}`.trim() || 'Jairo Escobar Cárcamo',
            rol: esJairo ? 'superadmin' : (p.rol === 'admin' ? 'admin' : (p.rol as RolUsuario) || 'superadmin'),
          });
        }
      } catch {}
    }
  }, []);

  // Guardar en almacenamiento local
  const guardarEnStorage = (lista: PerfilPersonal[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_PERSONAL, JSON.stringify(lista));
      } catch (e) {
        console.error('Error al guardar personal:', e);
      }
    }
  };

  // Usuario actualmente seleccionado para editar sus permisos
  const usuarioActivo = personal.find((p) => p.id === usuarioSeleccionadoId) || personal[0];

  // Permiso para eliminar usuarios:
  // Solo lo tiene el Superadministrador o quien tenga el rol admin con permiso personal.eliminar
  const puedeEliminarUsuarios = usuarioEnSesion.rol === 'superadmin' || usuarioEnSesion.rol === 'admin';

  // Alternar un permiso específico para el usuario activo
  const handleTogglePermiso = (codigo: PermisoCodigo) => {
    if (usuarioActivo.rol === 'superadmin' || usuarioActivo.rol === 'admin') return;

    const nuevaLista = personal.map((u) => {
      if (u.id === usuarioActivo.id) {
        const tienePermiso = u.permisos.includes(codigo);
        const nuevosPermisos = tienePermiso
          ? u.permisos.filter((p) => p !== codigo)
          : [...u.permisos, codigo];

        return { ...u, permisos: nuevosPermisos };
      }
      return u;
    });

    setPersonal(nuevaLista);
    guardarEnStorage(nuevaLista);

    setMensajeExito(`Permisos de ${usuarioActivo.nombres} ${usuarioActivo.apellidos} actualizados correctamente.`);
    setTimeout(() => setMensajeExito(null), 3500);
  };

  // Conceder todos los permisos del módulo
  const handleConcederTodosModulo = (modulo: string) => {
    if (usuarioActivo.rol === 'superadmin' || usuarioActivo.rol === 'admin') return;
    const permisosDelModulo = CATALOGO_PERMISOS.filter((p) => p.modulo === modulo).map((p) => p.codigo);

    const nuevaLista = personal.map((u) => {
      if (u.id === usuarioActivo.id) {
        const union = Array.from(new Set([...u.permisos, ...permisosDelModulo]));
        return { ...u, permisos: union };
      }
      return u;
    });

    setPersonal(nuevaLista);
    guardarEnStorage(nuevaLista);
  };

  // Crear nuevo miembro del equipo
  const handleCrearMiembro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMiembro.nombres || !nuevoMiembro.apellidos) return;

    // Permisos por defecto según el rol seleccionado
    let permisosBase: PermisoCodigo[] = [];
    if (nuevoMiembro.rol === 'admin' || nuevoMiembro.rol === 'superadmin') {
      permisosBase = CATALOGO_PERMISOS.map((p) => p.codigo);
    } else if (nuevoMiembro.rol === 'gestor_inventario') {
      // Rol especializado en registrar y editar datos del inventario
      permisosBase = [
        'inventario.ver',
        'inventario.crear',
        'inventario.editar',
        'inventario.descontar',
        'tratamientos.gestionar',
      ];
    } else if (nuevoMiembro.rol === 'asistente') {
      // Rol auxiliar clínico de instrumental y consumo de insumos
      permisosBase = [
        'citas.ver',
        'historias.ver',
        'inventario.ver',
        'inventario.descontar',
      ];
    } else if (nuevoMiembro.rol === 'odontologo') {
      permisosBase = [
        'citas.ver',
        'citas.aprobar',
        'pacientes.ver',
        'historias.ver',
        'historias.crear',
        'inventario.ver',
        'inventario.descontar',
      ];
    } else if (nuevoMiembro.rol === 'recepcionista') {
      permisosBase = [
        'citas.ver',
        'citas.aprobar',
        'citas.crear',
        'citas.cancelar',
        'pacientes.ver',
        'pacientes.crear',
        'pacientes.editar',
        'inventario.ver',
        'recordatorios.gestionar',
      ];
    }

    const nuevo: PerfilPersonal = {
      id: `user-${Date.now()}`,
      nombres: nuevoMiembro.nombres,
      apellidos: nuevoMiembro.apellidos,
      rol: nuevoMiembro.rol,
      telefono: nuevoMiembro.telefono,
      especialidad: nuevoMiembro.especialidad || (
        nuevoMiembro.rol === 'gestor_inventario' 
          ? 'Gestión de Farmacia e Insumos' 
          : nuevoMiembro.rol === 'asistente'
          ? 'Auxiliar Clínico e Instrumental'
          : undefined
      ),
      registroProfesional: nuevoMiembro.registroProfesional,
      fotoUrl: nuevoMiembro.fotoUrl || undefined,
      activo: true,
      permisos: permisosBase,
    };

    const nuevaLista = [...personal, nuevo];
    setPersonal(nuevaLista);
    guardarEnStorage(nuevaLista);

    setUsuarioSeleccionadoId(nuevo.id);
    setModalNuevoMiembro(false);
    setNuevoMiembro({
      nombres: '',
      apellidos: '',
      rol: 'gestor_inventario',
      telefono: '',
      especialidad: '',
      registroProfesional: '',
      fotoUrl: '',
    });
    setMensajeExito(`Se ha registrado a ${nuevo.nombres} ${nuevo.apellidos} como ${nuevo.rol === 'gestor_inventario' ? 'Encargado de Inventario' : nuevo.rol} con éxito.`);
    setTimeout(() => setMensajeExito(null), 4000);
  };

  // Confirmar y ejecutar eliminación / desvinculación
  const handleEjecutarEliminacion = () => {
    if (!colaboradorAEliminar) return;

    if (colaboradorAEliminar.rol === 'superadmin') {
      alert('El Superadministrador posee protección permanente y no puede ser eliminado del sistema.');
      setColaboradorAEliminar(null);
      return;
    }

    const nuevaLista = personal.filter((p) => p.id !== colaboradorAEliminar.id);
    setPersonal(nuevaLista);
    guardarEnStorage(nuevaLista);

    // Si el usuario eliminado era el seleccionado, seleccionar el superadministrador
    if (usuarioSeleccionadoId === colaboradorAEliminar.id) {
      setUsuarioSeleccionadoId(nuevaLista[0]?.id || '');
    }

    setMensajeExito(
      `El colaborador ${colaboradorAEliminar.nombres} ${colaboradorAEliminar.apellidos} ha sido desvinculado y eliminado exitosamente.`
    );
    setColaboradorAEliminar(null);
    setTimeout(() => setMensajeExito(null), 4500);
  };

  // Filtrado del personal
  const personalFiltrado = personal.filter((p) => {
    const coincideRol =
      filtroRol === 'todos' ||
      (filtroRol === 'admin' ? p.rol === 'admin' || p.rol === 'superadmin' : p.rol === filtroRol);
    const coincideBusqueda =
      `${p.nombres} ${p.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.especialidad && p.especialidad.toLowerCase().includes(busqueda.toLowerCase()));
    return coincideRol && coincideBusqueda;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Barra Superior */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-2xs">
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
                <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-700" />
                  <span>Panel Superadministrador</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">Asigna permisos de inventario, clínica y desvinculaciones del equipo</p>
            </div>
          </div>

          <button
            onClick={() => setModalNuevoMiembro(true)}
            className="inline-flex items-center gap-1.5 bg-dentist-600 hover:bg-dentist-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Colaborador</span>
          </button>
        </div>
      </header>

      {/* Alerta de notificación */}
      {mensajeExito && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold shadow-xs animate-fade-in">
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
          {/* COLUMNA IZQUIERDA: LISTA DEL PERSONAL (5 Cols) */}
          {/* ============================================================== */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-dentist-600" />
                  <span>Equipo del Consultorio ({personalFiltrado.length})</span>
                </h2>
                <select
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none bg-slate-50 font-semibold"
                >
                  <option value="todos">Todos los roles</option>
                  <option value="superadmin">Superadministrador</option>
                  <option value="admin">Administradores</option>
                  <option value="odontologo">Odontólogos</option>
                  <option value="gestor_inventario">Gestor de Inventario</option>
                  <option value="asistente">Auxiliar de Odontología</option>
                  <option value="recepcionista">Recepción</option>
                </select>
              </div>

              {/* Buscador */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, especialidad o rol..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-dentist-500"
                />
              </div>
            </div>

            {/* Lista de colaboradores */}
            <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
              {personalFiltrado.map((u) => {
                const esSeleccionado = u.id === usuarioActivo.id;
                const esSuperadmin = u.rol === 'superadmin';

                return (
                  <div
                    key={u.id}
                    onClick={() => setUsuarioSeleccionadoId(u.id)}
                    className={`p-4 cursor-pointer transition-all flex items-start justify-between group ${
                      esSeleccionado 
                        ? 'bg-dentist-50/70 border-l-4 border-dentist-600' 
                        : 'hover:bg-slate-50/80 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl overflow-hidden font-bold text-xs flex items-center justify-center shrink-0 border shadow-2xs ${
                        esSuperadmin
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : u.rol === 'admin'
                          ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                          : u.rol === 'gestor_inventario'
                          ? 'bg-teal-100 text-teal-800 border-teal-200'
                          : u.rol === 'asistente'
                          ? 'bg-cyan-100 text-cyan-800 border-cyan-200'
                          : 'bg-dentist-100 text-dentist-700 border-slate-200'
                      }`}>
                        {u.fotoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.fotoUrl} alt={u.nombres} className="w-full h-full object-cover" />
                        ) : esSuperadmin ? (
                          <span>👑</span>
                        ) : u.rol === 'gestor_inventario' ? (
                          <span>📦</span>
                        ) : u.rol === 'asistente' ? (
                          <span>🩺</span>
                        ) : (
                          <span>{u.nombres.slice(0, 1)}{u.apellidos.slice(0, 1)}</span>
                        )}
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 truncate">
                            {u.nombres} {u.apellidos}
                          </span>
                          {esSuperadmin ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shrink-0">
                              <Crown className="w-2.5 h-2.5 text-amber-600" />
                              <span>Superadmin</span>
                            </span>
                          ) : u.rol === 'admin' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 shrink-0">
                              Admin
                            </span>
                          ) : u.rol === 'gestor_inventario' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1 shrink-0">
                              <Package className="w-2.5 h-2.5 text-teal-600" />
                              <span>Inventario</span>
                            </span>
                          ) : u.rol === 'asistente' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200 shrink-0">
                              Auxiliar
                            </span>
                          ) : null}
                        </div>

                        <p className="text-xs text-slate-500 truncate">
                          {u.especialidad || (u.rol === 'recepcionista' ? 'Recepción y Atención' : 'Personal Clínico')}
                        </p>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                          <span className="capitalize font-medium text-slate-600">
                            Rol: {
                              u.rol === 'superadmin' ? 'Superadmin' :
                              u.rol === 'gestor_inventario' ? 'Gestor Inventario' :
                              u.rol === 'asistente' ? 'Auxiliar Clínico' :
                              u.rol
                            }
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-dentist-700">
                            {esSuperadmin || u.rol === 'admin' ? 'Todos los permisos' : `${u.permisos.length} permisos`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${u.activo ? 'bg-emerald-500' : 'bg-slate-300'}`} title={u.activo ? 'Colaborador Activo' : 'Inactivo'} />

                      {/* Botón rápido para desvincular (solo si no es superadmin y el usuario tiene permisos) */}
                      {puedeEliminarUsuarios && !esSuperadmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setColaboradorAEliminar(u);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title={`Desvincular a ${u.nombres} ${u.apellidos}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================================== */}
          {/* COLUMNA DERECHA: MATRIZ DE PERMISOS GRANULARES (7 Cols) */}
          {/* ============================================================== */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
            <div>
              {/* Encabezado del usuario seleccionado */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 gap-4 mb-6">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl overflow-hidden font-bold text-sm flex items-center justify-center shrink-0 border shadow-xs ${
                    usuarioActivo.rol === 'superadmin'
                      ? 'bg-amber-100 text-amber-900 border-amber-300 text-lg'
                      : usuarioActivo.rol === 'admin'
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                      : usuarioActivo.rol === 'gestor_inventario'
                      ? 'bg-teal-100 text-teal-800 border-teal-200 text-base'
                      : usuarioActivo.rol === 'asistente'
                      ? 'bg-cyan-100 text-cyan-800 border-cyan-200'
                      : 'bg-dentist-100 text-dentist-700 border-slate-200'
                  }`}>
                    {usuarioActivo.fotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={usuarioActivo.fotoUrl} alt={usuarioActivo.nombres} className="w-full h-full object-cover" />
                    ) : usuarioActivo.rol === 'superadmin' ? (
                      <span>👑</span>
                    ) : usuarioActivo.rol === 'gestor_inventario' ? (
                      <span>📦</span>
                    ) : (
                      <span>{usuarioActivo.nombres.slice(0, 1)}{usuarioActivo.apellidos.slice(0, 1)}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">
                        {usuarioActivo.nombres} {usuarioActivo.apellidos}
                      </h2>
                      {usuarioActivo.rol === 'superadmin' && (
                        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-600" />
                          <span>Superadministrador</span>
                        </span>
                      )}
                      {usuarioActivo.rol === 'gestor_inventario' && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
                          <Package className="w-3 h-3 text-teal-600" />
                          <span>Gestión de Inventario</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Rol: <span className="font-semibold text-slate-800">
                        {usuarioActivo.rol === 'superadmin' ? 'Superadministrador' :
                         usuarioActivo.rol === 'gestor_inventario' ? 'Encargado de Farmacia e Inventario' :
                         usuarioActivo.rol === 'asistente' ? 'Auxiliar de Odontología / Asistente' :
                         usuarioActivo.rol}
                      </span>
                      {usuarioActivo.registroProfesional && (
                        <span> • Registro: {usuarioActivo.registroProfesional}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-xl border border-slate-200">
                    {usuarioActivo.rol === 'superadmin' || usuarioActivo.rol === 'admin' 
                      ? `Acceso Total (${CATALOGO_PERMISOS.length}/${CATALOGO_PERMISOS.length})` 
                      : `${usuarioActivo.permisos.length} de ${CATALOGO_PERMISOS.length} concedidos`}
                  </span>

                  {/* BOTÓN DESVINCULAR / ELIMINAR COLABORADOR */}
                  {puedeEliminarUsuarios && usuarioActivo.rol !== 'superadmin' && (
                    <button
                      type="button"
                      onClick={() => setColaboradorAEliminar(usuarioActivo)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition shadow-2xs cursor-pointer active:scale-95"
                      title="Desvincular y revocar accesos a este colaborador"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Desvincular</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Aviso si es Superadministrador, Administrador o Rol Inventario */}
              {usuarioActivo.rol === 'superadmin' ? (
                <div className="p-4 mb-6 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 flex items-start gap-3 shadow-2xs">
                  <Crown className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-black text-amber-950 text-sm">
                      Superadministrador Principal del Consultorio ({usuarioActivo.nombres} {usuarioActivo.apellidos})
                    </p>
                    <p className="mt-1 text-amber-900">
                      Cuenta con inmunidad institucional absoluta y acceso irrestricto a todos los módulos clínicos, financieros, de inventario, personal y configuración. <strong>No puede ser eliminado ni revocado.</strong>
                    </p>
                  </div>
                </div>
              ) : usuarioActivo.rol === 'admin' ? (
                <div className="p-4 mb-6 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-bold text-indigo-950">Este colaborador tiene el rol de Administrador</p>
                    <p className="mt-0.5 text-indigo-800">
                      Los administradores cuentan con todos los permisos habilitados por defecto en el sistema para la operación clínica diaria.
                    </p>
                  </div>
                </div>
              ) : usuarioActivo.rol === 'gestor_inventario' ? (
                <div className="p-3.5 mb-6 rounded-2xl bg-teal-50/90 border border-teal-200 text-teal-950 flex items-start gap-3 shadow-2xs">
                  <Package className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-bold text-teal-950 text-sm">
                      Rol Especializado: Gestión de Inventario, Insumos y Farmacia
                    </p>
                    <p className="mt-0.5 text-teal-800">
                      Diseñado para registrar insumos, lotes clínicos con INVIMA, controlar fechas de vencimiento con semáforo FEFO y editar existencias en el catálogo del consultorio.
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
                  const permisosModulo = CATALOGO_PERMISOS.filter((p) => p.modulo === modulo);
                  if (permisosModulo.length === 0) return null;

                  const esBloqueado = usuarioActivo.rol === 'superadmin' || usuarioActivo.rol === 'admin';
                  const esModuloInventario = modulo === 'Inventario';

                  return (
                    <div 
                      key={modulo} 
                      className={`rounded-xl p-4 border transition-all ${
                        esModuloInventario 
                          ? 'bg-teal-50/30 border-teal-200/80 shadow-2xs' 
                          : 'bg-slate-50/70 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
                        <div className="flex items-center gap-2">
                          {esModuloInventario && <Package className="w-4 h-4 text-teal-600" />}
                          <h3 className={`font-bold text-xs uppercase tracking-wider ${
                            esModuloInventario ? 'text-teal-900' : 'text-slate-800'
                          }`}>
                            Módulo: {modulo}
                          </h3>
                        </div>
                        {!esBloqueado && (
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
                          const estaActivo = esBloqueado || usuarioActivo.permisos.includes(permiso.codigo);
                          const esPermisoEliminar = permiso.codigo === 'personal.eliminar';
                          const esDeInventario = permiso.codigo.startsWith('inventario.');

                          return (
                            <label
                              key={permiso.codigo}
                              className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all ${
                                esPermisoEliminar && estaActivo
                                  ? 'bg-rose-50/50 border-rose-300 shadow-2xs'
                                  : esDeInventario && estaActivo
                                  ? 'bg-white border-teal-400 ring-1 ring-teal-500/20 shadow-2xs'
                                  : estaActivo
                                  ? 'bg-white border-dentist-300 shadow-2xs'
                                  : 'bg-white/60 border-slate-200 hover:bg-white'
                              } ${esBloqueado ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                            >
                              <input
                                type="checkbox"
                                disabled={esBloqueado}
                                checked={estaActivo}
                                onChange={() => handleTogglePermiso(permiso.codigo)}
                                className={`mt-0.5 rounded border-slate-300 h-4 w-4 shrink-0 ${
                                  esPermisoEliminar 
                                    ? 'text-rose-600 focus:ring-rose-500' 
                                    : esDeInventario
                                    ? 'text-teal-600 focus:ring-teal-500'
                                    : 'text-dentist-600 focus:ring-dentist-500'
                                }`}
                              />
                              <div>
                                <span className={`block text-xs font-semibold leading-tight ${
                                  esPermisoEliminar ? 'text-rose-950 font-bold' : esDeInventario ? 'text-teal-950 font-bold' : 'text-slate-900'
                                }`}>
                                  {permiso.nombre}
                                  {esPermisoEliminar && (
                                    <span className="ml-1.5 text-[9px] bg-rose-100 text-rose-800 font-extrabold px-1.5 py-0.2 rounded">
                                      Seguridad Crítica
                                    </span>
                                  )}
                                  {esDeInventario && (
                                    <span className="ml-1.5 text-[9px] bg-teal-100 text-teal-800 font-extrabold px-1.5 py-0.2 rounded">
                                      FEFO
                                    </span>
                                  )}
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Registrar Nuevo Colaborador</h3>
                <p className="text-xs text-slate-500">Añade personal al consultorio y configura sus permisos</p>
              </div>
              <button 
                onClick={() => setModalNuevoMiembro(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearMiembro} className="mt-4 space-y-3.5">
              
              {/* Foto de Perfil Drag and Drop */}
              <FotoPerfilDropzone
                valor={nuevoMiembro.fotoUrl || null}
                onChange={(base64) => setNuevoMiembro(prev => ({ ...prev, fotoUrl: base64 || '' }))}
                etiqueta="Foto de Perfil del Profesional"
                descripcion="Arrastra la fotografía aquí o haz clic para subir"
                ayuda="PNG, JPG o WebP recomendado (Máx. 5MB)"
                tamano="sm"
              />

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
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500 font-semibold"
                  >
                    <option value="odontologo">Odontólogo / Doctor</option>
                    <option value="gestor_inventario">📦 Encargado de Farmacia e Inventario</option>
                    <option value="asistente">🩺 Auxiliar de Odontología / Asistente</option>
                    <option value="recepcionista">📋 Recepcionista y Citas</option>
                    <option value="admin">👑 Administrador General</option>
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

              {/* Campos condicionales según el rol */}
              {(nuevoMiembro.rol === 'odontologo' || nuevoMiembro.rol === 'asistente' || nuevoMiembro.rol === 'gestor_inventario') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {nuevoMiembro.rol === 'odontologo' ? 'Especialidad Odontológica' : 'Área / Enfoque'}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        nuevoMiembro.rol === 'gestor_inventario' 
                          ? 'Ej. Control de Farmacia e Insumos' 
                          : nuevoMiembro.rol === 'asistente'
                          ? 'Ej. Auxiliar de Sillón e Instrumental'
                          : 'Ej. Endodoncia, Periodoncia'
                      }
                      value={nuevoMiembro.especialidad}
                      onChange={e => setNuevoMiembro({ ...nuevoMiembro, especialidad: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {nuevoMiembro.rol === 'odontologo' ? 'Tarjeta Profesional' : 'Código Interno / Carnet'}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        nuevoMiembro.rol === 'gestor_inventario' ? 'Ej. INV-01' : nuevoMiembro.rol === 'asistente' ? 'Ej. AUX-102' : 'Ej. OD-12345'
                      }
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
                  className="px-5 py-2 text-xs font-semibold bg-dentist-600 hover:bg-dentist-700 text-white rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                >
                  Guardar y Asignar Permisos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CONFIRMACIÓN DE DESVINCULACIÓN / ELIMINACIÓN */}
      {/* ============================================================== */}
      {colaboradorAEliminar && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-rose-100">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">¿Desvincular a este Colaborador?</h3>
                <p className="text-xs text-rose-600 font-semibold">Acción de seguridad administrativa</p>
              </div>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Estás a punto de desvincular y eliminar a{' '}
                <strong className="text-slate-900 font-bold">
                  {colaboradorAEliminar.nombres} {colaboradorAEliminar.apellidos}
                </strong>{' '}
                ({colaboradorAEliminar.rol}).
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  Efectos de la desvinculación:
                </p>
                <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
                  <li>Se revocarán inmediatamente todos sus accesos al sistema.</li>
                  <li>No podrá ingresar a citas, historias clínicas ni expedientes.</li>
                  <li>Los registros clínicos y movimientos de inventario históricos se conservarán intactos por trazabilidad legal médica.</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setColaboradorAEliminar(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEjecutarEliminacion}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sí, Desvincular y Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
