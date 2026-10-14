'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Camera, UploadCloud, X, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface FotoPerfilDropzoneProps {
  valor?: string | null;
  onChange: (base64: string | null) => void;
  etiqueta?: string;
  descripcion?: string;
  ayuda?: string;
  tamano?: 'sm' | 'md' | 'lg';
}

export default function FotoPerfilDropzone({
  valor,
  onChange,
  etiqueta = 'Foto de Perfil',
  descripcion = 'Arrastra y suelta tu foto aquí o haz clic para explorar',
  ayuda = 'Formatos admitidos: PNG, JPG o WebP (Máx. 5MB)',
  tamano = 'md',
}: FotoPerfilDropzoneProps) {
  const [estaArrastrando, setEstaArrastrando] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Procesar archivo de imagen
  const procesarArchivo = (archivo: File) => {
    setErrorValidacion(null);

    // Validar tipo MIME
    if (!archivo.type.startsWith('image/')) {
      setErrorValidacion('Por favor selecciona un archivo de imagen válido (PNG, JPG o WebP).');
      return;
    }

    // Validar tamaño máximo (5MB)
    const tamanoMaximoBytes = 5 * 1024 * 1024;
    if (archivo.size > tamanoMaximoBytes) {
      setErrorValidacion('La imagen no debe superar los 5MB de tamaño.');
      return;
    }

    // Leer como Data URL base64
    const lector = new FileReader();
    lector.onload = () => {
      if (typeof lector.result === 'string') {
        onChange(lector.result);
      }
    };
    lector.onerror = () => {
      setErrorValidacion('Ocurrió un error al procesar la imagen. Intenta de nuevo.');
    };
    lector.readAsDataURL(archivo);
  };

  // Eventos de Drag and Drop
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setEstaArrastrando(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setEstaArrastrando(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setEstaArrastrando(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setEstaArrastrando(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const archivo = e.dataTransfer.files[0];
      procesarArchivo(archivo);
    }
  };

  // Manejo de clic para abrir selector de archivos
  const handleClickZona = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const archivo = e.target.files[0];
      procesarArchivo(archivo);
    }
  };

  const handleEliminar = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const dimensionesAvatar = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }[tamano];

  return (
    <div className="space-y-2">
      {etiqueta && (
        <label className="block text-xs font-bold text-slate-800">
          {etiqueta}
        </label>
      )}

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Si ya hay una foto cargada */}
      {valor ? (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`relative ${dimensionesAvatar} rounded-2xl overflow-hidden border-2 border-primary shadow-xs shrink-0 bg-white`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={valor}
                alt="Foto de perfil cargada"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Foto de perfil cargada con éxito
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Haz clic en cambiar o arrastra otra imagen para reemplazarla.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClickZona}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-primary hover:text-secondary bg-white hover:bg-slate-100 border border-outline-variant/60 transition shadow-2xs"
            >
              Cambiar
            </button>
            <button
              type="button"
              onClick={handleEliminar}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              title="Eliminar foto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Zona Drag and Drop para subir foto */
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClickZona}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
            estaArrastrando
              ? 'border-primary bg-secondary-container/30 scale-[1.01] shadow-sm'
              : 'border-slate-300 hover:border-primary/70 bg-slate-50/70 hover:bg-white'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
              estaArrastrando
                ? 'bg-primary text-white'
                : 'bg-secondary-container/50 text-primary'
            }`}>
              {estaArrastrando ? (
                <UploadCloud className="w-6 h-6 animate-bounce" />
              ) : (
                <Camera className="w-6 h-6" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800">
                {estaArrastrando ? '¡Suelta la foto aquí!' : descripcion}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {ayuda}
              </p>
            </div>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-primary shadow-2xs hover:bg-slate-50">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Seleccionar desde este equipo</span>
            </span>
          </div>
        </div>
      )}

      {/* Error de validación si existe */}
      {errorValidacion && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorValidacion}</span>
        </div>
      )}
    </div>
  );
}
