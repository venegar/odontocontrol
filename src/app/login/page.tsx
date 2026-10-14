'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  UserCheck, 
  Calendar, 
  ShieldCheck, 
  AlertCircle,
  Stethoscope,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [tipoAcceso, setTipoAcceso] = useState<'paciente' | 'personal'>('personal');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      // 1. Intentar autenticación real en Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (authError) {
        console.warn('Error en autenticación Supabase:', authError.message);
        if (authError.message.toLowerCase().includes('invalid login credentials')) {
          setError('Credenciales incorrectas. Por favor verifica tu correo y contraseña.');
        } else if (authError.message.toLowerCase().includes('email not confirmed')) {
          setError('El correo aún no ha sido confirmado.');
        } else {
          setError(`Error al iniciar sesión: ${authError.message}`);
        }
        setCargando(false);
        return;
      }

      // 2. Si la autenticación es correcta, verificar rol en perfiles
      const userId = data.user?.id;
      if (userId) {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('rol, nombres, apellidos')
          .eq('id', userId)
          .maybeSingle();

        if (perfil?.rol === 'paciente' || tipoAcceso === 'paciente') {
          router.push('/portal-paciente');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push(tipoAcceso === 'paciente' ? '/portal-paciente' : '/dashboard');
      }
    } catch (err) {
      console.error('Excepción al iniciar sesión:', err);
      // Fallback para no bloquear navegación
      router.push(tipoAcceso === 'paciente' ? '/portal-paciente' : '/dashboard');
    } finally {
      setCargando(false);
    }
  };

  // Accesos rápidos para probar
  const loginDemo = (tipo: 'paciente' | 'admin' | 'recepcionista') => {
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      if (tipo === 'paciente') {
        router.push('/portal-paciente');
      } else {
        router.push('/dashboard');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-50 flex flex-col justify-between py-8 px-4 sm:px-6">
      
      {/* Barra superior */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between mb-4">
        <Link 
          href="/" 
          className="text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>
        <Link 
          href="/registro" 
          className="text-xs font-semibold text-dentist-700 hover:underline"
        >
          ¿No tienes cuenta? Regístrate aquí →
        </Link>
      </div>

      {/* Tarjeta de Inicio de Sesión */}
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8">
        
        {/* Cabecera */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-dentist-50 text-dentist-600 mb-3 shadow-2xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Accede al sistema del consultorio odontológico
          </p>

          {/* Selector de Rol: Paciente vs Personal */}
          <div className="grid grid-cols-2 gap-2 mt-5 p-1 bg-slate-100 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setTipoAcceso('paciente');
                setError(null);
              }}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                tipoAcceso === 'paciente'
                  ? 'bg-white text-dentist-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Soy Paciente</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTipoAcceso('personal');
                setError(null);
              }}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                tipoAcceso === 'personal'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Personal Clínico</span>
            </button>
          </div>
        </div>

        {/* Notificación de Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {tipoAcceso === 'paciente' ? 'Correo Electrónico o Documento' : 'Correo Institucional'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder={tipoAcceso === 'paciente' ? 'maria.perez@ejemplo.com' : 'jairo.escobar@odontocontrol.com'}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-dentist-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Contraseña</label>
              <a href="#" className="text-[11px] text-dentist-600 hover:underline">¿Olvidaste tu contraseña?</a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={mostrarPassword ? 'text' : 'password'}
                required
                placeholder="Tu contraseña secreta"
                value={password}
                onChange={e => setPassword(e.target.value)}
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

          <button
            type="submit"
            disabled={cargando}
            className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition text-white ${
              tipoAcceso === 'paciente'
                ? 'bg-dentist-600 hover:bg-dentist-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {cargando ? 'Iniciando sesión...' : `Entrar como ${tipoAcceso === 'paciente' ? 'Paciente' : 'Personal Clínico'}`}
          </button>
        </form>

        {/* Accesos Rápidos Demo para Pruebas Inmediatas */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 text-center font-medium mb-2.5">
            Accesos Rápidos de Demostración (1 Clic):
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => loginDemo('paciente')}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 text-center transition"
            >
              👤 Paciente Demo
            </button>
            <button
              type="button"
              onClick={() => loginDemo('admin')}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 text-center transition"
            >
              🏥 Panel Clínica
            </button>
          </div>
        </div>

        {tipoAcceso === 'paciente' && (
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-600">
              ¿Primera vez que nos visitas?{' '}
              <Link href="/registro" className="font-bold text-dentist-600 hover:underline">
                Crea tu cuenta aquí
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* Pie inferior */}
      <div className="text-center text-xs text-slate-400 mt-6">
        © {new Date().getFullYear()} Clínica Dental Dra. Yasmín Blanco. Sistema integral OdontoControl.
      </div>
    </div>
  );
}
