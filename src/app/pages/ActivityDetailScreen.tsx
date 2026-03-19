import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, Hand, Search, Settings2, BarChart3, Clock, CheckCircle2, User } from 'lucide-react';

export function ActivityDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  // En producción esto vendría de la BD al consultar por el id
  const state = location.state || {};
  const activityName = state.activityName || 'Lectura de Comprensión';
  const campoName = state.campoName || 'Lenguajes';
  const campoColor = state.campoColor || 'bg-orange-500';
  const activityType = state.activityType || 'registro'; // registro, participacion, calificada

  // Datos mock para el resumen de la actividad
  const stats = {
    total: 35,
    evaluated: 0,
    pending: 35,
    percentage: 0
  };

  // State para el modal flotante de selección de escala (sólo si es Actividad Calificada)
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<'nfc' | 'manual' | null>(null);
  const [evalScale, setEvalScale] = useState('numerica'); // 'numerica', 'estatus'

  const startCapture = (method: 'nfc' | 'manual') => {
    if (activityType === 'calificada') {
      // Necesita configuración extra (Escala)
      setPendingRoute(method);
      setShowConfigModal(true);
    } else {
      // Ejecuta directamente
      executeCapture(method, null);
    }
  };

  const executeCapture = (method: 'nfc' | 'manual', configuredScale: string | null) => {
    setShowConfigModal(false);
    
    // Preparar estado de navegación común
    const baseState = {
      activityName,
      campoName,
      campoColor,
      isGraded: activityType === 'calificada',
      evalScale: configuredScale || null
    };

    if (method === 'manual') {
      if (activityType === 'calificada') {
         navigate('/evaluation-capture', { state: baseState });
      } else {
         navigate('/manual-capture', { state: baseState });
      }
    } else {
      // Flujo NFC Continuo
      navigate('/capture', { state: baseState });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative absolute inset-0">
      {/* Header Extendido */}
      <div className={`${campoColor} px-4 pt-6 pb-20 shadow-lg relative rounded-b-3xl transition-colors duration-500 shrink-0`}>
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-xl drop-shadow-sm truncate">{activityName}</h1>
            <p className="text-white/80 text-sm font-medium">{campoName}</p>
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/90 hover:bg-white/10 transition-colors">
            <MoreHorizontalIcon />
          </button>
        </div>

        {/* Resumen Progress */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-white/80 text-xs font-bold uppercase tracking-wider block mb-1">Progreso General</span>
              <span className="text-white text-3xl font-black">{stats.percentage}%</span>
            </div>
            <div className="text-right flex items-center gap-3">
              <div className="bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                <span className="text-white/70 text-xs block font-medium">Asignados</span>
                <span className="text-white font-bold text-sm block">{stats.total}</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-black/20 rounded-full h-1.5 mt-2">
            <div className="bg-white h-1.5 rounded-full" style={{ width: `${stats.percentage}%` }}></div>
          </div>
        </div>
      </div>

      {/* Tarjeta Flotante Principal de Acciones */}
      <div className="flex flex-col flex-1 px-4 -mt-10 z-10">
        <div className="bg-white rounded-3xl p-5 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-4">
          <h2 className="text-slate-800 font-bold text-lg mb-1 flex items-center gap-2">
             <Play className="w-5 h-5 text-indigo-500 fill-indigo-100" />
             Atajos de Captura
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Botón NFC */}
            <button 
              onClick={() => startCapture('nfc')}
              className="group active:scale-95 transition-all flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white hover:border-indigo-300 shadow-sm"
            >
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                <NfcIcon />
              </div>
              <div className="flex flex-col items-center">
                <span className="font-extrabold text-slate-800 text-[13px] uppercase tracking-wide">Pase Mágico</span>
                <span className="text-[11px] text-slate-500 font-medium">Escaneo Constante</span>
              </div>
            </button>

            {/* Botón Manual */}
            <button 
              onClick={() => startCapture('manual')}
              className="group active:scale-95 transition-all flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 group-hover:scale-110 transition-transform">
                <Hand className="w-6 h-6 text-slate-600" />
              </div>
              <div className="flex flex-col items-center">
                <span className="font-extrabold text-slate-800 text-[13px] uppercase tracking-wide">Lista en Pantalla</span>
                <span className="text-[11px] text-slate-500 font-medium">Llenado Manual</span>
              </div>
            </button>
          </div>
        </div>

        {/* Lista Previa Resumida */}
        <div className="mt-8 flex-1 overflow-y-auto pb-6">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-slate-800 font-bold">Estado del Grupo</h3>
            <button className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
              <Search className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center h-48 bg-slate-100/50 rounded-3xl border border-slate-200 border-dashed">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <p className="font-bold text-slate-600">Aún no hay capturas</p>
            <p className="text-sm text-slate-500 text-center px-8 mt-1">Presiona uno de los botones de arriba para comenzar a evaluar este grupo.</p>
          </div>
        </div>
      </div>

      {/* Modal Requisitos "Calificada" */}
      <AnimatePresence>
        {showConfigModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowConfigModal(false)}
              className="absolute inset-0 bg-slate-900/60 z-40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] z-50 overflow-hidden shadow-2xl pb-8"
            >
              <div className="px-6 pt-8 pb-4">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <Settings2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Ajustes de Evaluación</h2>
                </div>
                <p className="text-slate-500 text-sm mb-6 pl-13">Estás a punto de iniciar una captura de actividad <strong className="text-indigo-600">Calificada</strong>. ¿Cómo deseas asentar los registros?</p>
                
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <button 
                    onClick={() => setEvalScale('numerica')}
                    className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all ${
                      evalScale === 'numerica' 
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <span className={`text-base font-bold mb-1 ${evalScale === 'numerica' ? 'text-indigo-900' : 'text-slate-700'}`}>🔢 Numérica</span>
                    <span className={`text-[11px] leading-snug ${evalScale === 'numerica' ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>Del 5 al 10 con decimales.</span>
                  </button>
                  <button 
                    onClick={() => setEvalScale('estatus')}
                    className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all ${
                      evalScale === 'estatus' 
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <span className={`text-base font-bold mb-1 ${evalScale === 'estatus' ? 'text-indigo-900' : 'text-slate-700'}`}>🚥 Estatus</span>
                    <span className={`text-[11px] leading-snug ${evalScale === 'estatus' ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>Bien, Incompleto, Pendiente.</span>
                  </button>
                </div>

                <button 
                  onClick={() => pendingRoute && executeCapture(pendingRoute, evalScale)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg py-4.5 rounded-[1.5rem] transition-all active:scale-95 shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2"
                >
                  Continuar
                  <Play className="w-5 h-5 fill-current" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function NfcIcon() {
  return (
    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18h8" />
      <path d="M19 12c-3.87 3.87-4 10-4 10" />
      <path d="M15 12c-2.73 2.73-2.83 7-2.83 7" />
      <path d="M11 12c-1.6 1.6-1.66 4-1.66 4" />
      <path d="M3 12c0-4.97 4.03-9 9-9 4.97 0 9 4.03 9 9" />
    </svg>
  );
}

function MoreHorizontalIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}
