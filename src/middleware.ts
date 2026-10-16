import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

/**
 * Middleware de seguridad para proteger rutas privadas del panel clínico.
 * Intercepta accesos a /dashboard/* y /inventario/* sin sesión activa de Supabase,
 * respondiendo con redirección 307 hacia /login.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas protegidas que requieren autenticación del personal del consultorio
  const esRutaProtegida = pathname.startsWith('/dashboard') || pathname.startsWith('/inventario');

  if (esRutaProtegida) {
    const cookies = request.cookies.getAll();
    
    // Comprobar presencia de tokens de sesión de Supabase Auth
    const tieneSesionSupabase = cookies.some((c) => {
      const nombre = c.name.toLowerCase();
      return (
        (nombre.startsWith('sb-') && nombre.endsWith('-auth-token')) ||
        nombre === 'sb-access-token' ||
        nombre === 'supabase-auth-token' ||
        nombre.includes('auth-token')
      );
    });

    if (!tieneSesionSupabase) {
      const urlLogin = new URL('/login', request.url);
      urlLogin.searchParams.set('redirect', pathname);
      return NextResponse.redirect(urlLogin, 307);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/inventario/:path*',
  ],
};
