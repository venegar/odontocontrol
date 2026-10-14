'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  AlertCircle,
  HeartPulse,
  ShieldAlert
} from 'lucide-react';
import { TipoDocumento } from '@/modules/pacientes/types';
import FotoPerfilDropzone from '@/components/ui/FotoPerfilDropzone';

export default function RegistroPacientePage() {
  const router = useRouter();
  const [paso, setPaso] = useState<1 | 2>(1);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  // Estado del formulario
  const [form, setForm] = useState({
    // Foto de Perfil Drag and Drop
    fotoUrl: '',
    // Paso 1: Identificación y Contacto
    nombres: '',
    apellidos: '',
    tipoDocumento: 'CC' as TipoDocumento,
    numeroDocumento: '',
    telefono: '',
    fechaNacimiento: '',
    ciudad: 'Bogotá',
    
    // Paso 2: Credenciales y Antecedentes
    email: '',
    password: '',
    confirmPassword: '',
    alergiasTexto: '',
    enfermedadesTexto: '',
    aceptaTerminos: false,
  });

  const handleSiguientePaso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombres || !form.apellidos || !form.numeroDocumento || !form.telefono || !form.fechaNacimiento) {
      setError('Por favor completa todos los campos requeridos del primer paso.');
      return;
    }
    setError(null);
    setPaso(2);
  };

  const handleFinalizarRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden. Verifícalas e inténtalo de nuevo.');
      return;
    }

    if (!form.aceptaTerminos) {
      setError('Debes aceptar la política de privacidad y tratamiento de datos médicos.');
      return;
    }

    setCargando(true);

    // Simulación de registro en Supabase Auth y tabla de pacientes
    setTimeout(() => {
      setCargando(false);
      setRegistroExitoso(true);
      setTimeout(() => {
        router.push('/portal-paciente');
      }, 2500);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-50 flex flex-col justify-between py-8 px-4 sm:px-6">
      
      {/* Barra superior con volver al inicio */}
      <div className="max-w-xl w-full mx-auto flex items-center justify-between mb-4">
        <Link 
          href="/" 
          className="text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>
        <Link 
          href="/login" 
          className="text-xs font-semibold text-dentist-700 hover:underline"
        >
          ¿Ya tienes cuenta? Iniciar Sesión →
        </Link>
      </div>

      {/* Tarjeta de Registro */}
      <div className="max-w-xl w-full mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10">
        
        {/* Cabecera */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-dentist-50 text-dentist-600 mb-3 shadow-2xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Crear Cuenta de Paciente
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Regístrate para agendar, consultar y reagendar tus citas odontológicas en cualquier momento.
          </p>

          {/* Indicador de Pasos */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className={`w-8 h-1.5 rounded-full transition-all ${paso === 1 ? 'bg-dentist-600' : 'bg-dentist-200'}`} />
            <span className={`w-8 h-1.5 rounded-full transition-all ${paso === 2 ? 'bg-dentist-600' : 'bg-slate-200'}`} />
          </div>
        </div>

        {/* Notificación de Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Pantalla de Éxito */}
        {registroExitoso ? (
          <div className="text-center py-8 space-y-3 animate-scale-up">
            {form.fotoUrl ? (
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden mx-auto border-2 border-primary shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.fotoUrl} alt={form.nombres} className="w-full h-full object-cover" />
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            ) : (
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            )}
            <h3 className="text-lg font-bold text-slate-900">
              ¡Cuenta creada exitosamente, {form.nombres}!
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tu ficha médica con foto de perfil ha quedado registrada. Te estamos redirigiendo automáticamente a tu <strong>Portal del Paciente</strong>...
            </p>
          </div>
        ) : (
          <div>
            {/* ============================================================== */}
            {/* PASO 1: DATOS PERSONALES */}
            {/* ============================================================== */}
            {paso === 1 && (
              <form onSubmit={handleSiguientePaso} className="space-y-4">
                
                {/* Zona Drag and Drop para Foto de Perfil */}
                <div className="pb-1">
                  <FotoPerfilDropzone
                    valor={form.fotoUrl || null}
                    onChange={(nuevaFoto) => setForm(prev => ({ ...prev, fotoUrl: nuevaFoto || '' }))}
                    etiqueta="Foto de Perfil del Paciente (Opcional)"
                    descripcion="Arrastra y suelta tu foto aquí o haz clic para subirla"
                    ayuda="Recomendado: Fondo claro o neutro, archivo PNG o JPG (Máx. 5MB)"
                    tamano="md"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombres *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. María Camila"
                      value={form.nombres}
                      onChange={e => setForm({ ...form, nombres: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Apellidos *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Pérez Gómez"
                      value={form.apellidos}
                      onChange={e => setForm({ ...form, apellidos: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo Documento *</label>
                    <select
                      value={form.tipoDocumento}
                      onChange={e => setForm({ ...form, tipoDocumento: e.target.value as TipoDocumento })}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                    >
                      <option value="CC">Cédula (CC)</option>
                      <option value="TI">Tarjeta (TI)</option>
                      <option value="CE">Extranjería (CE)</option>
                      <option value="Pasaporte">Pasaporte</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Número de Documento *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. 1020304050"
                      value={form.numeroDocumento}
                      onChange={e => setForm({ ...form, numeroDocumento: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono Móvil (WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+57 300 123 4567"
                      value={form.telefono}
                      onChange={e => setForm({ ...form, telefono: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Nacimiento *</label>
                    <input
                      type="date"
                      required
                      value={form.fechaNacimiento}
                      onChange={e => setForm({ ...form, fechaNacimiento: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-dentist-600 hover:bg-dentist-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-1.5"
                  >
                    <span>Continuar al Paso 2</span>
                    <span>→</span>
                  </button>
                </div>
              </form>
            )}

            {/* ============================================================== */}
            {/* PASO 2: CREDENCIALES Y ANTECEDENTES */}
            {/* ============================================================== */}
            {paso === 2 && (
              <form onSubmit={handleFinalizarRegistro} className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico (Para iniciar sesión) *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="tu.correo@ejemplo.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={mostrarPassword ? 'text' : 'password'}
                        required
                        placeholder="Mínimo 6 caracteres"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        className="w-full text-xs pl-9 pr-9 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarPassword(!mostrarPassword)}
                        className="text-slate-400 hover:text-slate-600 absolute right-3 top-2.5"
                      >
                        {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmar Contraseña *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={mostrarPassword ? 'text' : 'password'}
                        required
                        placeholder="Repite la contraseña"
                        value={form.confirmPassword}
                        onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                        className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Antecedentes Clínicos Opcionales */}
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Antecedentes Médicos Iniciales (Opcional)
                  </span>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                        ¿Eres alérgico(a) a algún medicamento o material?
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Penicilina, Látex, Aspirina (separar por comas si son varios)"
                        value={form.alergiasTexto}
                        onChange={e => setForm({ ...form, alergiasTexto: e.target.value })}
                        className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <HeartPulse className="w-3.5 h-3.5 text-amber-500" />
                        ¿Padeces alguna enfermedad previa relevante?
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Hipertensión, Diabetes, Asma..."
                        value={form.enfermedadesTexto}
                        onChange={e => setForm({ ...form, enfermedadesTexto: e.target.value })}
                        className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Términos y Condiciones */}
                <div className="pt-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.aceptaTerminos}
                      onChange={e => setForm({ ...form, aceptaTerminos: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 text-dentist-600 focus:ring-dentist-500 h-4 w-4"
                    />
                    <span className="text-[11px] text-slate-600 leading-snug">
                      Acepto el tratamiento confidencial de mis datos clínicos y personales conforme a la ley de protección de datos en salud.
                    </span>
                  </label>
                </div>

                <div className="pt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaso(1)}
                    className="w-1/3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                  >
                    ← Volver
                  </button>
                  <button
                    type="submit"
                    disabled={cargando}
                    className="w-2/3 py-2.5 rounded-xl bg-dentist-600 hover:bg-dentist-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition"
                  >
                    {cargando ? 'Creando cuenta...' : 'Crear Cuenta y Entrar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Pie inferior */}
      <div className="text-center text-xs text-slate-400 mt-6">
        © {new Date().getFullYear()} DentisCare. Plataforma segura con cifrado de datos médicos.
      </div>
    </div>
  );
}
