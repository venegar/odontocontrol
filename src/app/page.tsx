'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import FormularioSolicitudCita from "@/modules/citas/components/FormularioSolicitudCita";
import { 
  obtenerDatosConsultorio, 
  DATOS_CONSULTORIO_DEFAULT, 
  DatosConsultorio 
} from "@/modules/configuracion/consultorioService";
import BannerPatrocinadores from "@/modules/patrocinadores/components/BannerPatrocinadores";

export default function HomePage() {
  const [datosConsultorio, setDatosConsultorio] = useState<DatosConsultorio>(DATOS_CONSULTORIO_DEFAULT);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState<boolean>(false);

  useEffect(() => {
    setDatosConsultorio(obtenerDatosConsultorio());

    const handleActualizacion = () => {
      setDatosConsultorio(obtenerDatosConsultorio());
    };

    window.addEventListener('consultorio_actualizado', handleActualizacion);
    return () => window.removeEventListener('consultorio_actualizado', handleActualizacion);
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased font-sans selection:bg-secondary-fixed selection:text-on-secondary-fixed flex flex-col justify-between">
      
      {/* ========================================================================= */}
      {/* 1. BARRA DE NAVEGACIÓN SUPERIOR / TOP APP BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between py-2 sm:py-3">
          
          {/* Logotipo Oficial Dra. Yasmín Blanco (Tamaño Ampliado Prominente) */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="relative h-20 sm:h-24 md:h-28 w-64 sm:w-80 md:w-96 transition-transform duration-200 group-hover:scale-[1.02]">
              <Image
                src="/brand/logo-yasmin-blanco.png"
                alt="Logotipo Dra. Yasmín Blanco | Odontología Avanzada y Estética Dental"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          </Link>

          {/* Enlaces de Navegación de Escritorio: Orden exacto solicitado */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-sm font-semibold">
            <Link 
              href="/portal-paciente" 
              className="text-on-surface-variant hover:text-primary transition-colors duration-200 py-1"
            >
              portal paciente
            </Link>
            <Link 
              href="#tratamientos" 
              className="text-on-surface-variant hover:text-primary transition-colors duration-200 py-1"
            >
              Tratamientos
            </Link>
            <Link 
              href="#casos" 
              className="text-on-surface-variant hover:text-primary transition-colors duration-200 py-1"
            >
              casos de exito
            </Link>
            <Link 
              href="#blog" 
              className="text-on-surface-variant hover:text-primary transition-colors duration-200 py-1"
            >
              Blog
            </Link>
            <Link 
              href="#contacto" 
              className="text-on-surface-variant hover:text-primary transition-colors duration-200 py-1"
            >
              contacto
            </Link>
          </nav>

          {/* Accesos a la Plataforma y Botón Primario */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-xs sm:text-sm font-bold text-on-surface-variant hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-surface-container"
            >
              Iniciar sesión
            </Link>

            <Link
              href="#agendar"
              className="inline-flex items-center justify-center h-11 px-4 sm:px-6 rounded-lg bg-primary hover:bg-secondary text-on-primary text-xs sm:text-sm font-bold transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md custom-teal-shadow"
            >
              <span className="material-symbols-outlined mr-2 text-[20px]">calendar_month</span>
              <span>Agendar Cita</span>
            </Link>

            {/* Botón Menú Móvil */}
            <button
              type="button"
              onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
              className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
              aria-label="Abrir o cerrar menú"
            >
              <span className="material-symbols-outlined text-[26px]">
                {menuMovilAbierto ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Menú Desplegable Móvil */}
        {menuMovilAbierto && (
          <div className="lg:hidden border-t border-outline-variant/30 bg-surface-container-lowest/98 px-6 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 shadow-md">
            <nav className="flex flex-col space-y-3 text-sm font-semibold">
              <Link 
                href="/portal-paciente" 
                onClick={() => setMenuMovilAbierto(false)}
                className="text-on-surface-variant hover:text-primary transition-colors py-1 border-b border-outline-variant/20"
              >
                portal paciente
              </Link>
              <Link 
                href="#tratamientos" 
                onClick={() => setMenuMovilAbierto(false)}
                className="text-on-surface-variant hover:text-primary transition-colors py-1 border-b border-outline-variant/20"
              >
                Tratamientos
              </Link>
              <Link 
                href="#casos" 
                onClick={() => setMenuMovilAbierto(false)}
                className="text-on-surface-variant hover:text-primary transition-colors py-1 border-b border-outline-variant/20"
              >
                casos de exito
              </Link>
              <Link 
                href="#blog" 
                onClick={() => setMenuMovilAbierto(false)}
                className="text-on-surface-variant hover:text-primary transition-colors py-1 border-b border-outline-variant/20"
              >
                Blog
              </Link>
              <Link 
                href="#contacto" 
                onClick={() => setMenuMovilAbierto(false)}
                className="text-on-surface-variant hover:text-primary transition-colors py-1 border-b border-outline-variant/20"
              >
                contacto
              </Link>
              <Link 
                href="/login" 
                onClick={() => setMenuMovilAbierto(false)}
                className="text-primary font-bold transition-colors py-1"
              >
                Iniciar sesión
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. CONTENIDO PRINCIPAL */}
      {/* ========================================================================= */}
      <main className="flex-1">

        {/* HERO SECTION */}
        <section className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary-fixed/20 via-surface to-background pointer-events-none -z-10" />
          
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Hero Text & CTA */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
                
                {/* Badge de Vanguardia */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary-container/50 border border-outline-variant/60 w-fit">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-primary text-xs font-bold tracking-wide">
                    Clínica Odontológica de Alta Precisión
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-on-surface tracking-tight leading-[1.12]">
                  Sonrisas saludables, <br />
                  <span className="text-primary font-black">atención de vanguardia.</span>
                </h1>

                <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                  Experimenta una odontología humana, empática y completamente digital. En la clínica de la{" "}
                  <strong className="font-bold text-primary">Dra. Yasmín Blanco</strong> transformamos tu salud bucal mediante diagnósticos 3D indoloros, armonización estética y excelencia médica.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="#agendar"
                    className="inline-flex items-center justify-center h-12 px-7 rounded-lg bg-primary hover:bg-secondary text-on-primary text-sm font-bold transition-all duration-200 active:scale-[0.98] custom-teal-shadow hover:shadow-lg"
                  >
                    <span>Solicitar Valoración</span>
                    <span className="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>
                  </Link>

                  <Link
                    href="#tratamientos"
                    className="inline-flex items-center justify-center h-12 px-7 rounded-lg bg-surface-container-lowest border border-outline-variant text-primary text-sm font-bold hover:bg-secondary-container/20 transition-all duration-200"
                  >
                    <span>Ver Tratamientos</span>
                  </Link>
                </div>

                {/* Trust Badges / Estadísticas */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-outline-variant/40 mt-4">
                  <div>
                    <p className="text-3xl sm:text-4xl font-extrabold text-primary">+15</p>
                    <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">Años de experiencia médica</p>
                  </div>
                  <div>
                    <p className="text-3xl sm:text-4xl font-extrabold text-primary">+10.000</p>
                    <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">Sonrisas restauradas</p>
                  </div>
                  <div>
                    <p className="text-3xl sm:text-4xl font-extrabold text-primary">99%</p>
                    <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">Satisfacción sin dolor</p>
                  </div>
                </div>
              </div>

              {/* Hero Visual / Atmosphere Card */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden custom-teal-elevated border border-outline-variant/40 bg-surface-container-lowest">
                  {/* Imagen de la Dra. Yasmín Blanco */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW9drWZjVToaRAZ5ajH75whwxmMzVGY1rL8qGgXk7PZCYy72hmBfmAXkPDv2rz4VRATBi1tDasaeqaIpW3U_8LdjoVgFpd9EjQ-6C5-vGtcdFPBkImjQfEuxQuabWTAFgZN7W3zWM4HRkqjl9mVUFfEg9hLkx4PJwQoEMdhSBef9TXQ6U6iccQYNPL_09v4y2RmhI_2ACDG8Aywz5HvqHIEIgnTbWCDWChDXo0HjhzWGPMs3Wnx5Xq"
                    alt="Dra. Yasmín Blanco en suite clínica con tecnología dental digital"
                    className="w-full h-[460px] object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Clinical Reassurance Badge */}
                  <div className="absolute bottom-5 left-5 right-5 p-4 bg-surface-container-lowest/95 backdrop-blur-md rounded-xl border border-outline-variant/50 shadow-md flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary-container/60 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                    </div>
                    <div>
                      <h2 className="font-bold text-on-surface text-[15px] leading-tight">
                        Garantía Clínica y Protocolo Guiado
                      </h2>
                      <p className="text-on-surface-variant text-xs mt-0.5">
                        Instalaciones certificadas con biocompatibilidad total
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BANNER DE PATROCINADORES Y MARCAS ALIADAS (BAJO EL BANNER PRINCIPAL) */}
        {/* ========================================================================= */}
        <BannerPatrocinadores />

        {/* ========================================================================= */}
        {/* 3. TRATAMIENTOS / ESPECIALIDADES (BENTO GRID STYLE) */}
        {/* ========================================================================= */}
        <section className="py-20 bg-surface-container-low border-y border-outline-variant/30" id="tratamientos">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block px-3.5 py-1 rounded-full bg-secondary-container/40 text-primary text-xs font-bold uppercase tracking-wider mb-3">
                Áreas de Especialidad
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
                Tratamientos odontológicos de alta precisión
              </h2>
              <p className="text-base text-on-surface-variant mt-3 leading-relaxed">
                Combinamos biotecnología avanzada, materiales cerámicos de última generación y un enfoque conservador para cuidar tu salud bucal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* 1. Ortodoncia Invisible */}
              <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/50 custom-teal-shadow hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="w-14 h-14 rounded-xl bg-secondary-container/40 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
                    <span className="material-symbols-outlined text-[30px]">health_and_safety</span>
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary-container/30 text-primary text-xs font-bold mb-3">
                    Ortodoncia Digital
                  </span>
                  <h3 className="text-xl font-bold text-on-surface mb-2 leading-snug">
                    Ortodoncia Invisible e Invisalign
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Alineadores transparentes imperceptibles diseñados digitalmente para armonizar tu mordida sin alambres ni molestias metálicas.
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-outline-variant/30 flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">Diagnóstico 3D incluido</span>
                  <Link href="#contacto" className="text-primary hover:text-secondary inline-flex items-center font-bold">
                    <span>Consultar</span>
                    <span className="material-symbols-outlined ml-1 text-[18px]">chevron_right</span>
                  </Link>
                </div>
              </div>

              {/* 2. Implantología */}
              <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/50 custom-teal-shadow hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="w-14 h-14 rounded-xl bg-secondary-container/40 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
                    <span className="material-symbols-outlined text-[30px]">dentistry</span>
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary-container/30 text-primary text-xs font-bold mb-3">
                    Cirugía Guiada
                  </span>
                  <h3 className="text-xl font-bold text-on-surface mb-2 leading-snug">
                    Implantología y Cirugía Oral
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Reposición de piezas dentales con implantes de titanio biocompatible de osteointegración acelerada y carga inmediata en el mismo día.
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-outline-variant/30 flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">Carga en 24h</span>
                  <Link href="#contacto" className="text-primary hover:text-secondary inline-flex items-center font-bold">
                    <span>Consultar</span>
                    <span className="material-symbols-outlined ml-1 text-[18px]">chevron_right</span>
                  </Link>
                </div>
              </div>

              {/* 3. Estética Dental */}
              <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/50 custom-teal-shadow hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="w-14 h-14 rounded-xl bg-secondary-container/40 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
                    <span className="material-symbols-outlined text-[30px]">auto_fix_high</span>
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary-container/30 text-primary text-xs font-bold mb-3">
                    Diseño de Sonrisa
                  </span>
                  <h3 className="text-xl font-bold text-on-surface mb-2 leading-snug">
                    Estética Dental y Carillas
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Carillas de disilicato de litio y porcelana ultrafina mínimamente invasivas para una simetría luminosa y natural sin tallado agresivo.
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-outline-variant/30 flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">Acabado Natural</span>
                  <Link href="#contacto" className="text-primary hover:text-secondary inline-flex items-center font-bold">
                    <span>Consultar</span>
                    <span className="material-symbols-outlined ml-1 text-[18px]">chevron_right</span>
                  </Link>
                </div>
              </div>

              {/* 4. Odontología Preventiva */}
              <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/50 custom-teal-shadow hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="w-14 h-14 rounded-xl bg-secondary-container/40 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
                    <span className="material-symbols-outlined text-[30px]">clean_hands</span>
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary-container/30 text-primary text-xs font-bold mb-3">
                    Profilaxis Guiada
                  </span>
                  <h3 className="text-xl font-bold text-on-surface mb-2 leading-snug">
                    Odontología Preventiva
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Higiene dental mediante ultrasonido y tecnología de aeropulido con micropartículas de glicina, eliminando manchas y sarro sin agredir el esmalte.
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-outline-variant/30 flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">Tecnología Airflow</span>
                  <Link href="#contacto" className="text-primary hover:text-secondary inline-flex items-center font-bold">
                    <span>Consultar</span>
                    <span className="material-symbols-outlined ml-1 text-[18px]">chevron_right</span>
                  </Link>
                </div>
              </div>

              {/* 5. Blanqueamiento Láser */}
              <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/50 custom-teal-shadow hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="w-14 h-14 rounded-xl bg-secondary-container/40 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
                    <span className="material-symbols-outlined text-[30px]">wb_sunny</span>
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary-container/30 text-primary text-xs font-bold mb-3">
                    Brillo Instantáneo
                  </span>
                  <h3 className="text-xl font-bold text-on-surface mb-2 leading-snug">
                    Blanqueamiento Dental Láser
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Aclaramiento de hasta 6 tonos en una sola sesión clínica bajo activación lumínica LED de luz fría, protegiendo la sensibilidad de la dentina.
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-outline-variant/30 flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">Cero Sensibilidad</span>
                  <Link href="#contacto" className="text-primary hover:text-secondary inline-flex items-center font-bold">
                    <span>Consultar</span>
                    <span className="material-symbols-outlined ml-1 text-[18px]">chevron_right</span>
                  </Link>
                </div>
              </div>

              {/* 6. Periodoncia */}
              <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/50 custom-teal-shadow hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="w-14 h-14 rounded-xl bg-secondary-container/40 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
                    <span className="material-symbols-outlined text-[30px]">healing</span>
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary-container/30 text-primary text-xs font-bold mb-3">
                    Salud Gingival
                  </span>
                  <h3 className="text-xl font-bold text-on-surface mb-2 leading-snug">
                    Periodoncia y Cuidado de Encías
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Tratamiento integral de gingivitis y periodontitis con descontaminación láser y regeneración tisular guiada para preservar tus dientes naturales.
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-outline-variant/30 flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">Micro-cirugía Plástica</span>
                  <Link href="#contacto" className="text-primary hover:text-secondary inline-flex items-center font-bold">
                    <span>Consultar</span>
                    <span className="material-symbols-outlined ml-1 text-[18px]">chevron_right</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. SOBRE LA DRA. YASMIN BLANCO Y SU EQUIPO */}
        {/* ========================================================================= */}
        <section className="py-24 bg-surface-container-lowest" id="equipo">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Doctor Profile Card with Accent Frame */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden border border-outline-variant/60 custom-teal-elevated">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3yF6wJfIyut6Dc4Uy87ZbZPHnUc-jCctcmNkKvT_f2N9sH0ucl40PRtjldoDTV5DtPnIT3Bp1XgJXv5uLAe9myftKorDJOCNzsb5X8LAJInP8ne3cVtg_uwvg9QR8JkWAAW_R4rRWNYWovhkt8I1kCW8dT2H7k4h8Yo1cp6tpLKlYYLCm1EaJenvGbKxiwO6DJXgjXlwLcqdGEuDvH7yWU4ppcklOrCDC6NNaSgNB0Tkn-qZYkYJo"
                    alt="Retrato oficial de la Dra. Yasmín Blanco, especialista en implantología y estética dental"
                    className="w-full h-[520px] object-cover object-top"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-on-surface via-on-surface/75 to-transparent p-6 text-on-primary">
                    <h3 className="text-2xl font-bold text-white">Dra. Yasmín Blanco</h3>
                    <p className="text-sm font-semibold text-secondary-fixed mt-0.5">
                      Directora Médica & Especialista en Implantología y Estética
                    </p>
                    <p className="text-xs text-outline-variant mt-1">
                      Colegiado Nº 28004921 • Máster en Cirugía Bucal y Rehabilitación
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio & Philosophy Details */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
                <span className="inline-block px-3.5 py-1 rounded-full bg-secondary-container/40 text-primary text-xs font-bold w-fit uppercase tracking-wider">
                  Filosofía & Trayectoria
                </span>
                
                <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
                  &ldquo;La excelencia dental nace de la empatía, el diagnóstico riguroso y la odontología sin dolor.&rdquo;
                </h2>

                <p className="text-base text-on-surface-variant leading-relaxed">
                  Con más de quince años de dedicación clínica exclusiva, la Dra. Yasmín Blanco ha liderado la transición hacia una práctica odontológica serena, libre de ansiedad y respaldada por evidencia científica. Nuestro equipo multidisciplinario combina el trato humano con tecnología robótica y protocolos mínimamente invasivos.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[28px] mt-0.5">sentiment_satisfied</span>
                    <div>
                      <h4 className="font-bold text-on-surface text-[15px]">Protocolo Sin Dolor</h4>
                      <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">
                        Anestesia computarizada y sedación consciente monitorizada para una experiencia relajante.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[28px] mt-0.5">view_in_ar</span>
                    <div>
                      <h4 className="font-bold text-on-surface text-[15px]">Escáner Intraoral 3D</h4>
                      <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">
                        Prescindimos de las incómodas pastas de moldeo gracias a la digitalización óptica instantánea.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[28px] mt-0.5">radiology</span>
                    <div>
                      <h4 className="font-bold text-on-surface text-[15px]">Tomografía CBCT</h4>
                      <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">
                        Radiografía volumétrica 3D con hasta un 80% menos de radiación que los sistemas convencionales.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[28px] mt-0.5">verified_user</span>
                    <div>
                      <h4 className="font-bold text-on-surface text-[15px]">Biomateriales Certificados</h4>
                      <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">
                        Uso exclusivo de implantes y cerámicas biocompatibles con trazabilidad internacional.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="#contacto"
                    className="inline-flex items-center text-primary text-sm font-bold hover:text-secondary group"
                  >
                    <span>Conoce a nuestro equipo de especialistas</span>
                    <span className="material-symbols-outlined ml-1 group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. TECNOLOGÍA CLÍNICA (INTERACTIVE SHOWCASE) */}
        {/* ========================================================================= */}
        <section className="py-20 bg-surface-container border-y border-outline-variant/30" id="tecnologia">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
              <div>
                <span className="inline-block px-3.5 py-1 rounded-full bg-secondary-container/40 text-primary text-xs font-bold uppercase tracking-wider mb-3">
                  Vanguardia Tecnológica
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface">
                  Odontología Digital de Flujo Completo
                </h2>
              </div>
              <p className="text-sm text-on-surface-variant max-w-md leading-relaxed">
                Eliminamos la incertidumbre médica planificando cada milímetro de tu tratamiento en modelos virtuales interactivos de alta fidelidad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Card 1: Escáner Óptico */}
              <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/50 custom-teal-shadow hover:shadow-lg transition">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAnsQIuHqq-GLrpjzZA188BI6M2eJczQIq3VBA_GLMnzl6pmx274ISfyXXKzuBULEM-T3xxBrYUEHt6pxH8u77L_u6T36MJ0SoL8B3pMFtqwsGjov4MlV1DXw6fklRIKrJa2JI1vpwn35wVz6iTpw0NPDYEZwHxzMs8ZU2d8QBRMm9hamoIha5QcHNoub61xtfoui9x2wK-Am2gJ1r3zIRR4WzupJplF8rN6zpwNEDyQMrMdjzeW7s"
                  alt="Escaneo intraoral digital 3D"
                  className="w-full h-52 object-cover"
                />
                <div className="p-6">
                  <span className="text-primary text-xs font-bold uppercase tracking-wider">Flujo Digital</span>
                  <h3 className="text-lg font-bold text-on-surface mt-1 mb-2">
                    Escáner Óptico de Alta Definición
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Captura digital exacta en 60 segundos. Permite simular el resultado de tu alineación u ortodoncia antes de iniciar.
                  </p>
                </div>
              </div>

              {/* Card 2: Fresado Robótico CAD/CAM */}
              <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/50 custom-teal-shadow hover:shadow-lg transition">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZ4pMYaQtDDvGr0JWFmlyZWNatJDFyJCibSiH44gJjSheU_bF4b-elGMii_B8fP2uhDiPhreDdua4f0ctx21HvdsEuaAViqeEdXW80pjAMo89oFnMUHhUjzQV_JHA5bx--H1jI6rzZkT_xs4KOThj1pFWEMseGT2Z9PeiI2Z8-AunPIDbeKzoUr88BwCj_7796SQD5RrN0m5dGAGuZPKsDt6OQrqKCExgWWBPYdXCMvL4JjaKpEq-i"
                  alt="Fresado robótico de coronas dentales"
                  className="w-full h-52 object-cover"
                />
                <div className="p-6">
                  <span className="text-primary text-xs font-bold uppercase tracking-wider">Laboratorio In-House</span>
                  <h3 className="text-lg font-bold text-on-surface mt-1 mb-2">
                    Fresado Robótico CAD/CAM
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Confección robótica de coronas y carillas en cuestión de horas con ajuste micrométrico perfecto y sellado bacteriano superior.
                  </p>
                </div>
              </div>

              {/* Card 3: Radiología Tridimensional CBCT */}
              <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/50 custom-teal-shadow hover:shadow-lg transition">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzp1UwWqwNhaeMxIQqjnpKb6KHyPHJYQalp0ouX6k-8FXh11G251xwcg-bAFWCRseWyRiDKP2ePy8yGu0G3-XCRJxCvRXYWcjcCwFoHahjMWoELXQtKIfFMdBHcljNhuA2alxAabs6_Mrn3JELb9Eg1Nab9t0V4fV9nSf45UMtn7w2inf_la0ODGa9Ayq2Vf7W6MXJID4wJ2EGL5HNFOtPwDIy2v0NKREJ5gLsvJSvk9gCxMzWFIdO"
                  alt="Tomografía volumétrica 3D CBCT de baja radiación"
                  className="w-full h-52 object-cover"
                />
                <div className="p-6">
                  <span className="text-primary text-xs font-bold uppercase tracking-wider">Diagnóstico 3D</span>
                  <h3 className="text-lg font-bold text-on-surface mt-1 mb-2">
                    Radiología Tridimensional CBCT
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Planificación virtual de implantes que evita tocar nervios o estructuras sensibles, asegurando cirugías precisas y sin suturas invasivas.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. CASOS DE ÉXITO & TESTIMONIOS */}
        {/* ========================================================================= */}
        <section className="py-24 bg-surface-container-lowest" id="casos">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block px-3.5 py-1 rounded-full bg-secondary-container/40 text-primary text-xs font-bold uppercase tracking-wider mb-3">
                Casos de Éxito
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface">
                Sonrisas reales, historias de confianza
              </h2>
              <p className="text-sm text-on-surface-variant mt-3 leading-relaxed">
                Descubre los testimonios de pacientes que recuperaron su salud, estética y seguridad al sonreír.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Testimonio 1 */}
              <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/40 custom-teal-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-primary mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-on-surface italic leading-relaxed">
                    &ldquo;Llevaba años posponiendo mi tratamiento por auténtico pánico al dentista. El trato de la Dra. Yasmín Blanco fue tan cercano y delicado que ni me enteré del procedimiento de implantes. Un cambio radical de vida.&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-outline-variant/30">
                  <div className="w-12 h-12 rounded-full bg-secondary-container text-primary font-bold flex items-center justify-center text-sm">
                    CR
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">Carlos Rodríguez</h4>
                    <p className="text-xs text-on-surface-variant">Rehabilitación con Implantes Guiados</p>
                  </div>
                </div>
              </div>

              {/* Testimonio 2 */}
              <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/40 custom-teal-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-primary mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-on-surface italic leading-relaxed">
                    &ldquo;Me realicé ortodoncia invisible y un posterior blanqueamiento dental. La tecnología de la clínica es impresionante, ves en la pantalla cómo va a quedar tu sonrisa desde el primer día. 100% recomendable.&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-outline-variant/30">
                  <div className="w-12 h-12 rounded-full bg-secondary-container text-primary font-bold flex items-center justify-center text-sm">
                    MV
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">María Eugenia Vidal</h4>
                    <p className="text-xs text-on-surface-variant">Invisalign & Blanqueamiento Láser</p>
                  </div>
                </div>
              </div>

              {/* Testimonio 3 */}
              <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/40 custom-teal-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-primary mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-on-surface italic leading-relaxed">
                    &ldquo;Las carillas de porcelana que me diseñó la Dra. Yasmín tienen una naturalidad asombrosa. Nadie nota que son postizas, solo que mi sonrisa luce impecable. El seguimiento post-tratamiento es inmejorable.&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-outline-variant/30">
                  <div className="w-12 h-12 rounded-full bg-secondary-container text-primary font-bold flex items-center justify-center text-sm">
                    AM
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">Alejandro Morales</h4>
                    <p className="text-xs text-on-surface-variant">Diseño de Sonrisa & Carillas</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. BLOG DE SALUD ORAL DE LA CLÍNICA */}
        {/* ========================================================================= */}
        <section id="blog" className="py-20 bg-surface-container-low border-t border-outline-variant/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="inline-block px-3.5 py-1 rounded-full bg-secondary-container/40 text-primary text-xs font-bold uppercase tracking-wider mb-3">
                  Educación y Prevención Dental
                </span>
                <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">
                  Blog de Salud Oral
                </h2>
                <p className="text-on-surface-variant text-sm mt-2 max-w-xl leading-relaxed">
                  Artículos y guías preventivas redactadas por la Dra. Yasmín Blanco y su equipo médico para preservar tu sonrisa de por vida.
                </p>
              </div>

              <div className="mt-4 md:mt-0">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-secondary bg-surface-container-lowest border border-outline-variant/60 px-4 py-2.5 rounded-xl transition shadow-xs"
                >
                  <span>Ver todos los artículos</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Artículo 1 */}
              <article className="bg-surface-container-lowest rounded-2xl border border-outline-variant/50 p-6 flex flex-col justify-between custom-teal-shadow hover:shadow-md transition group">
                <div>
                  <div className="flex items-center justify-between text-xs text-on-surface-variant mb-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary-container/40 text-primary font-bold text-[11px]">
                      Higiene Dental
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
                      4 min de lectura
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-on-surface group-hover:text-primary transition-colors leading-snug mb-3">
                    5 consejos prácticos para cuidar y proteger el esmalte dental
                  </h3>

                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    El esmalte es la barrera más resistente de tu cuerpo. Aprende a protegerlo de alimentos ácidos y técnicas agresivas de cepillado.
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-outline-variant/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-[11px] flex items-center justify-center">
                      YB
                    </div>
                    <span className="text-on-surface font-semibold">Dra. Yasmín Blanco</span>
                  </div>
                  <Link href="/blog" className="font-bold text-primary inline-flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    <span>Leer</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </Link>
                </div>
              </article>

              {/* Artículo 2 */}
              <article className="bg-surface-container-lowest rounded-2xl border border-outline-variant/50 p-6 flex flex-col justify-between custom-teal-shadow hover:shadow-md transition group">
                <div>
                  <div className="flex items-center justify-between text-xs text-on-surface-variant mb-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary-container/40 text-primary font-bold text-[11px]">
                      Ortodoncia
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
                      6 min de lectura
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-on-surface group-hover:text-primary transition-colors leading-snug mb-3">
                    Mitos y realidades sobre los tratamientos de ortodoncia invisible
                  </h3>

                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    ¿Los alineadores invisibles funcionan para cualquier caso? Respondemos todas las preguntas sobre el confort y la duración.
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-outline-variant/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-secondary text-on-secondary font-bold text-[11px] flex items-center justify-center">
                      LV
                    </div>
                    <span className="text-on-surface font-semibold">Dra. Laura Vega</span>
                  </div>
                  <Link href="/blog" className="font-bold text-primary inline-flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    <span>Leer</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </Link>
                </div>
              </article>

              {/* Artículo 3 */}
              <article className="bg-surface-container-lowest rounded-2xl border border-outline-variant/50 p-6 flex flex-col justify-between custom-teal-shadow hover:shadow-md transition group">
                <div>
                  <div className="flex items-center justify-between text-xs text-on-surface-variant mb-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary-container/40 text-primary font-bold text-[11px]">
                      Prevención
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
                      5 min de lectura
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-on-surface group-hover:text-primary transition-colors leading-snug mb-3">
                    ¿Por qué debes realizarte una profilaxis dental cada 6 meses?
                  </h3>

                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    La remoción de sarro calcificado con tecnología de ultrasonido previene la gingivitis y garantiza encías sanas y firmes.
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-outline-variant/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-[11px] flex items-center justify-center">
                      YB
                    </div>
                    <span className="text-on-surface font-semibold">Dra. Yasmín Blanco</span>
                  </div>
                  <Link href="/blog" className="font-bold text-primary inline-flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    <span>Leer</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </Link>
                </div>
              </article>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. AGENDAMIENTO & CONTACTO / UBICACIÓN */}
        {/* ========================================================================= */}
        <section className="py-20 bg-surface-container border-t border-outline-variant/30" id="contacto">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Formulario de Cita Rápida Conectado a la Plataforma */}
              <div id="agendar" className="lg:col-span-7">
                <FormularioSolicitudCita />
              </div>

              {/* Ubicación, Horarios e Información de la Clínica */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/50 custom-teal-shadow">
                  <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">pin_drop</span>
                    <span>{datosConsultorio.nombreConsultorio}</span>
                  </h3>

                  <div className="space-y-5 text-sm">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-[22px] mt-0.5">location_on</span>
                      <div>
                        <p className="font-bold text-on-surface">Dirección Principal</p>
                        <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                          {datosConsultorio.direccion}, {datosConsultorio.ciudad}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-[22px] mt-0.5">call</span>
                      <div>
                        <p className="font-bold text-on-surface">Teléfono & Urgencias</p>
                        <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                          {datosConsultorio.telefonoPrincipal} / {datosConsultorio.telefonoUrgencias}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-[22px] mt-0.5">schedule</span>
                      <div>
                        <p className="font-bold text-on-surface">Horario de Consulta</p>
                        <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                          {datosConsultorio.horarioSemana}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {datosConsultorio.horarioSabado}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Representación de Mapa de la Clínica */}
                  <div className="mt-6 rounded-xl overflow-hidden border border-outline-variant/40 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNCLJM717Apdu5NmdyqVgx6E-175242eC9l52cCpL1FqxiNCJdWTWz45Wjh8_VIzku02DMDo3jac_CzP4y6Pw3IHFTZKaco5VWjuVut1PRZJZUZt1QsMutpIQlnlVErwOBBurYGkijEWmmYBQ9XvmZk2G6gpCLyG4Hygrghxv5RsQeHtBZTxUDRHuxnC_VPFlfOojJTs6SHC24AojZr4bfd6MpvbdQpUT5itFCPWbxxpmAxg126HEX"
                      alt="Mapa de ubicación de la clínica"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-3 py-1 bg-surface-container-lowest/90 backdrop-blur-md rounded-md text-[12px] font-semibold text-primary shadow-xs flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">directions_car</span>
                      <span>Parking concertado gratuito</span>
                    </div>
                  </div>
                </div>

                {/* Tarjeta de Garantía y Certificación */}
                <div className="p-5 rounded-2xl bg-secondary-container/40 border border-secondary-container text-xs text-secondary leading-relaxed flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[28px] shrink-0">verified</span>
                  <div>
                    <span className="font-bold block text-primary text-sm">Certificación Médica de Excelencia</span>
                    <span>Instalaciones habilitadas con normas ISO de esterilización y flujo 100% digital.</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

      </main>

      {/* ========================================================================= */}
      {/* 9. PIE DE PÁGINA / FOOTER INSTITUCIONAL */}
      {/* ========================================================================= */}
      <footer className="w-full bg-surface-container-low border-t border-outline-variant/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Marca y Copyright */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href="/" className="inline-block">
              <div className="relative h-20 sm:h-24 w-72 sm:w-80">
                <Image
                  src="/brand/logo-yasmin-blanco.png"
                  alt="Logotipo Dra. Yasmín Blanco"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-xs text-on-surface-variant text-center md:text-left">
              © {new Date().getFullYear()} {datosConsultorio.nombreConsultorio}. Todos los derechos reservados.
            </p>
          </div>

          {/* Enlaces y Módulos del Sistema */}
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2.5 text-xs font-semibold text-on-surface-variant">
            <Link href="/portal-paciente" className="hover:text-primary transition-colors">Portal paciente</Link>
            <Link href="#tratamientos" className="hover:text-primary transition-colors">Tratamientos</Link>
            <Link href="#casos" className="hover:text-primary transition-colors">Casos de éxito</Link>
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <Link href="#contacto" className="hover:text-primary transition-colors">Contacto</Link>
            <Link href="/dashboard" className="hover:text-primary transition-colors">Panel Administrativo</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
