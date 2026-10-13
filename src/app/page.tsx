import Link from "next/link";
import { 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  PhoneCall, 
  BookOpen, 
  ArrowRight,
  UserCheck,
  CheckCircle2,
  MapPin,
  Smile,
  Award,
  Stethoscope,
  HeartHandshake
} from "lucide-react";
import FormularioSolicitudCita from "@/modules/citas/components/FormularioSolicitudCita";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-slate-800">
      
      {/* 1. BARRA DE NAVEGACIÓN SUPERIOR */}
      <header className="border-b bg-white/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-dentist-600 text-white p-2 rounded-xl shadow-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">DentisCare</span>
              <span className="text-xs block text-slate-500 font-medium">Consultorio Odontológico</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <Link href="#servicios" className="hover:text-dentist-600 transition-colors">Servicios</Link>
            <Link href="#equipo" className="hover:text-dentist-600 transition-colors">Especialistas</Link>
            <Link href="/blog" className="hover:text-dentist-600 transition-colors">Blog Dental</Link>
            <Link href="#contacto" className="hover:text-dentist-600 transition-colors">Contacto</Link>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link 
              href="/login" 
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-dentist-600 px-2.5 py-1.5 transition-colors rounded-lg hover:bg-slate-50"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/registro" 
              className="text-xs sm:text-sm font-semibold text-dentist-700 bg-dentist-50 hover:bg-dentist-100 border border-dentist-200 px-3 py-1.5 rounded-xl transition-all"
            >
              Registrarse
            </Link>
            <Link 
              href="#agendar" 
              className="text-xs sm:text-sm font-semibold bg-dentist-600 hover:bg-dentist-700 text-white px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Calendar className="h-4 w-4" />
              <span>Agendar Cita</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="flex-1">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-sky-50/50 via-white to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dentist-50 text-dentist-700 text-xs font-semibold mb-6 border border-dentist-200">
                  <ShieldCheck className="h-4 w-4" />
                  Atención Odontológica Especializada y Segura
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
                  Tu sonrisa saludable en las mejores manos.
                </h1>
                <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl">
                  Brindamos tratamientos odontológicos de vanguardia con calidez humana. Agenda tu cita en segundos y gestiona tus controles desde nuestra plataforma digital.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="#agendar"
                    className="inline-flex justify-center items-center gap-2 px-6 py-3.5 rounded-xl bg-dentist-600 hover:bg-dentist-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    <span>Solicitar Consulta en Línea</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/blog"
                    className="inline-flex justify-center items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-semibold transition-all"
                  >
                    <BookOpen className="h-4 w-4 text-slate-500" />
                    <span>Leer Nuestro Blog</span>
                  </Link>
                </div>

                <div className="mt-12 grid grid-cols-3 gap-6 pt-8 border-t border-slate-200 text-slate-600">
                  <div>
                    <span className="block text-2xl font-bold text-slate-900">+10</span>
                    <span className="text-xs">Años de experiencia</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-bold text-slate-900">+3,500</span>
                    <span className="text-xs">Pacientes sonrientes</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-bold text-slate-900">100%</span>
                    <span className="text-xs">Atención digitalizada</span>
                  </div>
                </div>
              </div>

              {/* Tarjeta ilustrativa / Preview del sistema */}
              <div className="relative">
                <div className="bg-gradient-to-tr from-dentist-100 to-sky-50 rounded-3xl p-8 border border-dentist-200 shadow-xl">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <div>
                        <h2 className="font-bold text-slate-900">Próximas Citas Médicas</h2>
                        <p className="text-xs text-slate-500">Módulo de gestión en tiempo real</p>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                        En línea
                      </span>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-dentist-500 text-white flex items-center justify-center font-bold text-xs">
                            MC
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">María Camila Pérez</p>
                            <p className="text-xs text-slate-500">Limpieza y profilaxis profunda</p>
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <span className="font-semibold text-slate-700 flex items-center gap-1 justify-end">
                            <Clock className="h-3 w-3" /> 09:30 AM
                          </span>
                          <span className="text-dentist-600 font-medium">Dr. Carlos Ruiz</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                            JG
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">Juan Gómez</p>
                            <p className="text-xs text-slate-500">Control de ortodoncia</p>
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <span className="font-semibold text-slate-700 flex items-center gap-1 justify-end">
                            <Clock className="h-3 w-3" /> 11:00 AM
                          </span>
                          <span className="text-dentist-600 font-medium">Dra. Laura Vega</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs text-slate-500">
                      <span>Recordatorios automáticos activos</span>
                      <span className="font-semibold text-slate-700">WhatsApp / Email</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SECCIÓN DE SERVICIOS */}
        <section id="servicios" className="py-20 bg-slate-50/70 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-dentist-700 bg-dentist-100 px-3 py-1 rounded-full">
                Especialidades Odontológicas
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
                Tratamientos integrales para toda la familia
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                Equipos modernos de diagnóstico y materiales de última generación para garantizar resultados estéticos y duraderos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="w-11 h-11 rounded-xl bg-dentist-100 text-dentist-700 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Profilaxis y Prevención</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Limpieza profunda con ultrasonido, remoción de sarro subgingival, profilaxis y aplicación de flúor remineralizante.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                  <Smile className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Ortodoncia Avanzada</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Alineación dental con brackets convencionales, autoligado o alineadores invisibles transparentes según tu necesidad.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Estética y Blanqueamiento</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Blanqueamiento LED en consultorio y diseño de sonrisa con carillas y resinas de alta gama que conservan tu estructura natural.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SECCIÓN DEL EQUIPO MÉDICO */}
        <section id="equipo" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-dentist-700 bg-dentist-100 px-3 py-1 rounded-full">
                Nuestros Especialistas
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
                Profesionales certificados a tu cuidado
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                Conoce a nuestro equipo médico comprometido con la excelencia, la ética y tu bienestar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-dentist-600 text-white font-bold text-xl flex items-center justify-center shrink-0">
                  CR
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Dr. Carlos Ruiz Morales</h3>
                  <span className="text-xs font-semibold text-dentist-700 block mb-2">
                    Odontología General y Rehabilitación Estética
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Especialista con más de 12 años de trayectoria en restauraciones estéticas complejas, coronas y profilaxis de alta precisión.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shrink-0">
                  LV
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Dra. Laura Vega Pardo</h3>
                  <span className="text-xs font-semibold text-indigo-700 block mb-2">
                    Ortodoncia y Ortopedia Maxilofacial
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Experta en corrección de mordida y estética dental mediante alineadores transparentes y técnicas de ortodoncia de baja fricción.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SECCIÓN DEL FORMULARIO DE AGENDAMIENTO PÚBLICO */}
        <section className="py-20 bg-gradient-to-b from-slate-50 to-sky-50/40 border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <FormularioSolicitudCita />
          </div>
        </section>

        {/* 6. SECCIÓN DE CONTACTO Y HORARIOS */}
        <section id="contacto" className="py-16 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-slate-600">
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-dentist-600" /> Ubicación
                </h4>
                <p>Calle 127 # 19-45, Consultorio 302</p>
                <p>Bogotá, Colombia</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-dentist-600" /> Horarios de Atención
                </h4>
                <p>Lunes a Viernes: 08:00 AM - 06:00 PM</p>
                <p>Sábados: 08:00 AM - 01:00 PM</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-dentist-600" /> Canales Directos
                </h4>
                <p>WhatsApp: +57 (300) 123-4567</p>
                <p>Correo: contacto@dentiscare.com</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 7. PIE DE PÁGINA */}
      <footer className="border-t bg-slate-50 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} DentisCare Consultorio Odontológico. Todos los derechos reservados.</p>
          <div className="flex items-center space-x-4">
            <Link href="/blog" className="hover:text-dentist-600">Blog de Salud Oral</Link>
            <span>•</span>
            <Link href="/portal-paciente" className="hover:text-dentist-600">Portal del Paciente</Link>
            <span>•</span>
            <Link href="/dashboard" className="hover:text-dentist-600">Acceso Personal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
