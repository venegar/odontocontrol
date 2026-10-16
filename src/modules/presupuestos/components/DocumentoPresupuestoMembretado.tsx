'use client';

import React from 'react';
import Image from 'next/image';
import { Printer, Share2, X, FileSpreadsheet } from 'lucide-react';
import { Presupuesto } from '../types';
import { formatearMonedaCOP } from '../datos';

interface DocumentoPresupuestoMembretadoProps {
  presupuesto: Presupuesto;
  onCerrar?: () => void;
  modoModal?: boolean;
}

export default function DocumentoPresupuestoMembretado({
  presupuesto,
  onCerrar,
  modoModal = false,
}: DocumentoPresupuestoMembretadoProps) {
  const handleImprimir = () => {
    window.print();
  };

  const handleCompartirWhatsApp = () => {
    const telefonoLimpio = presupuesto.pacienteTelefono?.replace(/\D/g, '') || '';
    let mensaje = `*PRESUPUESTO ODONTOLÓGICO OFICIAL*\n`;
    mensaje += `*Clínica Odontológica Dra. Yasmín Blanco*\n`;
    mensaje += `NIT. 45.498.143-6 - Esp. en Prostodoncia Oclusión y ATM\n\n`;
    mensaje += `*Paciente:* ${presupuesto.pacienteNombre}\n`;
    mensaje += `*Cédula:* ${presupuesto.pacienteDocumento || 'No registrada'}\n`;
    mensaje += `*Fecha:* ${presupuesto.fecha}\n\n`;
    mensaje += `*PROCEDIMIENTOS PRESUPUESTADOS:*\n`;

    presupuesto.items.forEach((item, idx) => {
      mensaje += `${idx + 1}. ${item.tratamiento}\n`;
      mensaje += `   Cant: ${item.cantidad} x ${formatearMonedaCOP(item.valorUnidad)} = *${formatearMonedaCOP(item.valorTotal)}*\n`;
    });

    mensaje += `\n*VALOR TOTAL:* ${formatearMonedaCOP(presupuesto.total)}\n`;
    if (presupuesto.observaciones) {
      mensaje += `\n_Observaciones: ${presupuesto.observaciones}_\n`;
    }
    mensaje += `\nQuedamos a su entera disposición para iniciar su tratamiento.`;

    const url = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  // Rellenar filas en blanco si hay menos de 6 ítems para mantener la estructura visual idéntica a la hoja médica impresa
  const filasMinimas = 6;
  const filasVacias = Math.max(0, filasMinimas - presupuesto.items.length);

  const contenidoDocumento = (
    <div className="bg-white text-slate-900 font-sans p-6 sm:p-10 max-w-4xl mx-auto shadow-lg print:shadow-none print:p-0 print:max-w-full">
      {/* Encabezado Institucional con Logo */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-2">
          {/* Logo Dra. Yasmín Blanco */}
          <div className="relative w-48 h-16 sm:w-56 sm:h-20">
            <Image
              src="/brand/logo-yasmin-blanco-transparente.png"
              alt="Logo Dra. Yasmín Blanco"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <h2 className="text-base sm:text-lg font-bold tracking-wider uppercase text-slate-900 leading-tight">
          {presupuesto.doctorNombre || 'YASMIN BLANCO ESCORCIA'}
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-slate-800">
          {presupuesto.doctorNit || 'NIT. 45.498.143-6'}
        </p>
        <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          {presupuesto.doctorEspecialidad || 'ESPECIALISTA EN PROSTODONCIA OCLUSION Y ATM'}
        </p>
        <p className="text-xs font-medium text-slate-600">
          {presupuesto.doctorInstitucion || 'Colegio universitario colombiano'}
        </p>
      </div>

      {/* Caja de Presupuesto con Marco y Bordes Negros Oficiales */}
      <div className="border-2 border-black">
        {/* Título de la Sección */}
        <div className="border-b-2 border-black py-2 text-center bg-slate-50 print:bg-transparent">
          <h1 className="text-sm sm:text-base font-black tracking-widest uppercase text-black">
            PRESUPUESTO
          </h1>
        </div>

        {/* Datos del Paciente */}
        <div className="border-b-2 border-black p-3 sm:p-4 text-xs sm:text-sm font-bold grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
          <div className="md:col-span-6 flex items-baseline gap-2">
            <span className="uppercase text-black whitespace-nowrap">NOMBRE DEL PACIENTE:</span>
            <span className="border-b border-black flex-1 uppercase font-black text-black pl-1">
              {presupuesto.pacienteNombre}
            </span>
          </div>

          <div className="md:col-span-3 flex items-baseline gap-2">
            <span className="uppercase text-black whitespace-nowrap">CEDULA:</span>
            <span className="border-b border-black flex-1 font-black text-black pl-1">
              {presupuesto.pacienteDocumento || '_________________'}
            </span>
          </div>

          <div className="md:col-span-3 flex items-baseline gap-2">
            <span className="uppercase text-black whitespace-nowrap">EDAD:</span>
            <span className="border-b border-black flex-1 font-black text-black pl-1">
              {presupuesto.pacienteEdad ? `${presupuesto.pacienteEdad} AÑOS` : '______'}
            </span>
          </div>
        </div>

        {/* Tabla Oficial de Presupuesto */}
        <table className="w-full text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-black text-black font-black uppercase text-center bg-slate-50 print:bg-transparent">
              <th className="border-r-2 border-black py-2.5 px-3 text-left w-1/2">
                TRATAMIENTO
              </th>
              <th className="border-r-2 border-black py-2.5 px-3 w-1/6">
                VALOR UNIDAD
              </th>
              <th className="border-r-2 border-black py-2.5 px-3 w-1/12">
                CANTIDAD
              </th>
              <th className="py-2.5 px-3 w-1/4">
                VALOR TOTAL
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Filas de Procedimientos Presupuestados */}
            {presupuesto.items.map((item, index) => (
              <tr key={item.id || index} className="border-b border-black min-h-[48px]">
                <td className="border-r-2 border-black py-3 px-3 uppercase font-bold text-black leading-snug">
                  {item.tratamiento}
                </td>
                <td className="border-r-2 border-black py-3 px-3 text-center font-bold text-black whitespace-nowrap">
                  {formatearMonedaCOP(item.valorUnidad)}
                </td>
                <td className="border-r-2 border-black py-3 px-3 text-center font-bold text-black">
                  {item.cantidad}
                </td>
                <td className="py-3 px-3 text-center sm:text-right font-black text-black whitespace-nowrap">
                  {formatearMonedaCOP(item.valorTotal)}
                </td>
              </tr>
            ))}

            {/* Filas en blanco para preservar la diagramación idéntica a la hoja médica impresa */}
            {Array.from({ length: filasVacias }).map((_, i) => (
              <tr key={`vacia-${i}`} className="border-b border-black h-12">
                <td className="border-r-2 border-black py-2 px-3">&nbsp;</td>
                <td className="border-r-2 border-black py-2 px-3">&nbsp;</td>
                <td className="border-r-2 border-black py-2 px-3">&nbsp;</td>
                <td className="py-2 px-3">&nbsp;</td>
              </tr>
            ))}

            {/* Fila del Total */}
            <tr className="font-black text-black">
              <td className="border-r-2 border-black py-3 px-4 uppercase text-center tracking-wider text-sm sm:text-base">
                TOTAL
              </td>
              <td className="border-r-2 border-black py-3 px-3 text-center"></td>
              <td className="border-r-2 border-black py-3 px-3 text-center"></td>
              <td className="py-3 px-3 text-center sm:text-right text-base sm:text-lg font-black text-black">
                {formatearMonedaCOP(presupuesto.total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Notas / Observaciones al Pie */}
      {presupuesto.observaciones && (
        <div className="mt-4 p-3 bg-slate-50 border border-slate-300 rounded text-xs text-slate-700 print:bg-transparent print:border-none print:p-0">
          <p className="font-bold uppercase text-[11px] text-slate-900 mb-0.5">Observaciones & Condiciones:</p>
          <p>{presupuesto.observaciones}</p>
        </div>
      )}

      {/* Pie de Firma Institucional */}
      <div className="mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-600 gap-6">
        <div className="text-left">
          <p className="font-semibold text-slate-900">Fecha de Emisión: {presupuesto.fecha}</p>
          <p>Validez del presupuesto: 30 días calendario</p>
        </div>

        <div className="text-center sm:text-right">
          <div className="w-56 border-b border-black mb-1 mx-auto sm:ml-auto"></div>
          <p className="font-bold uppercase text-slate-900">{presupuesto.doctorNombre}</p>
          <p className="text-[11px]">{presupuesto.doctorEspecialidad}</p>
        </div>
      </div>
    </div>
  );

  if (modoModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in print:p-0 print:bg-white print:fixed-none">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 print:max-h-full print:border-none print:shadow-none">
          {/* Barra de Control de Impresión (No se imprime) */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm">Presupuesto Odontológico Oficial</h3>
                <p className="text-xs text-slate-400">{presupuesto.codigo} - {presupuesto.pacienteNombre}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCompartirWhatsApp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                title="Compartir por WhatsApp"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>

              <button
                onClick={handleImprimir}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-dentist-600 hover:bg-dentist-700 text-white text-xs font-bold transition shadow-xs"
                title="Imprimir o Guardar en PDF"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / PDF</span>
              </button>

              {onCerrar && (
                <button
                  onClick={onCerrar}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  title="Cerrar vista previa"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Cuerpo imprimible con scroll en pantalla */}
          <div className="overflow-y-auto p-4 sm:p-6 bg-slate-100 print:bg-white print:overflow-visible print:p-0">
            {contenidoDocumento}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Botones de acción si se usa inline */}
      <div className="mb-4 flex items-center justify-end gap-2 print:hidden">
        <button
          onClick={handleCompartirWhatsApp}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
        >
          <Share2 className="w-4 h-4" />
          <span>Enviar por WhatsApp</span>
        </button>

        <button
          onClick={handleImprimir}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-dentist-600 hover:bg-dentist-700 text-white text-xs font-bold transition shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Descargar PDF</span>
        </button>
      </div>

      {contenidoDocumento}
    </div>
  );
}
