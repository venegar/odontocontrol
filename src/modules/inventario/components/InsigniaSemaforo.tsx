import React from 'react';
import { ResultadoSemaforo } from '../types';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  semaforo?: ResultadoSemaforo;
}

export default function InsigniaSemaforo({ semaforo }: Props) {
  if (!semaforo) return null;

  const Icono = () => {
    switch (semaforo.color) {
      case 'rojo':
        return semaforo.estaVencido ? (
          <XCircle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
        );
      case 'amarillo':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      case 'verde':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  const getPuntoColor = () => {
    switch (semaforo.color) {
      case 'rojo':
        return 'bg-red-500';
      case 'amarillo':
        return 'bg-amber-500';
      case 'verde':
        return 'bg-emerald-500';
    }
  };

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-sm transition ${semaforo.clasesBadge}`}
      title={semaforo.descripcion}
    >
      <span className={`w-2 h-2 rounded-full ${getPuntoColor()} ${semaforo.color === 'rojo' ? 'animate-ping' : ''}`} />
      <Icono />
      <span>{semaforo.etiqueta}</span>
    </div>
  );
}
