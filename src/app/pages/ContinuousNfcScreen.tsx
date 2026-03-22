import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Nfc, CheckCircle2, AlertTriangle, XCircle, Hand, Check, X, ArrowLeft, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { attendanceService } from '../../services/attendanceService';
import { hardwareServices } from '../../utils/hardwareServices';

interface ScanRecord {
  id: string;
  name: string;
  time: string;
  status: 'success' | 'warning' | 'error';
  message?: string;
}

export function ContinuousNfcScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [isScanning, setIsScanning] = useState(true);

  // Read state from navigation
  const state = location.state || {};
  const isGraded = state.isGraded || false;
  const activityName = state.activityName || 'Lectura de comprensión';
  const campoName = state.campoName || 'Lenguajes';
  const evalScale = state.evalScale || 'numerica';

  const totalStudents = 30;
  const registeredCount = scans.filter(s => s.status === 'success').length;
  const cleanupRef = useRef<(() => void) | null>(null);

  // Iniciar escaner NFC real al montar el componente
  useEffect(() => {
    if (!isScanning) return;

    let active = true;

    const startNfc = async () => {
      try {
        await hardwareServices.initNfcListener(
          async (tagData: any) => {
            if (!active) return;
            // Extraer UID de la tarjeta
            const uid = tagData.id
              ? Array.from(tagData.id as number[]).map((i: number) => i.toString(16).padStart(2, '0')).join(':')
              : 'unknown';

            try {
              // Registrar asistencia en el backend
              const res = await attendanceService.scanNfc(uid);
              await hardwareServices.vibrateSuccess();
              setScans(prev => [{
                id: Math.random().toString(),
                name: res.student_name,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'success',
              }, ...prev.slice(0, 49)]);
            } catch (err: any) {
              await hardwareServices.vibrateError();
              const isDouble = err?.message?.toLowerCase().includes('ya registrado');
              setScans(prev => [{
                id: Math.random().toString(),
                name: isDouble ? 'Alumno' : 'Tarjeta desconocida',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: isDouble ? 'warning' : 'error',
                message: isDouble ? 'Ya registrado hoy' : 'Tarjeta no válida o no asignada',
              }, ...prev.slice(0, 49)]);
            }
          },
          async (error: any) => {
            if (!active) return;
            await hardwareServices.vibrateError();
            console.error('NFC error:', error);
          }
        );
      } catch (_) {
        // Si el hardware NFC no está disponible (navegador/web), no hacer nada
        console.info('Hardware NFC no disponible en este dispositivo.');
      }
    };

    startNfc();

    return () => {
      active = false;
    };
  }, [isScanning]);

  return (
    <div className="flex flex-col h-full bg-gray-50 absolute inset-0 overflow-hidden">
      {/* Header */}
      <div className="bg-orange-500 px-4 pt-6 pb-8 shadow-md shrink-0 relative transition-colors duration-500 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-white font-black text-lg">Actividad Activa</h1>
            <p className="text-white/90 text-sm font-medium">Registro Continuo NFC</p>
          </div>
          <div className="w-10 h-10" />
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-white">
          <h2 className="font-bold text-xl mb-1">{activityName}</h2>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-white"></span> {campoName}</span>
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> 3° "A"</span>
            <span>14 Mar</span>
          </div>
        </div>
      </div>

      {/* Reader Status */}
      <div className="flex justify-center -mt-6 z-10 shrink-0">
        <motion.div 
          animate={isScanning ? {
            boxShadow: ["0px 0px 0px 0px rgba(34,197,94,0.4)", "0px 0px 0px 15px rgba(34,197,94,0)", "0px 0px 0px 0px rgba(34,197,94,0)"]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-white rounded-full p-2 shadow-xl"
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isScanning ? 'bg-green-500' : 'bg-gray-400'} text-white`}>
            <Nfc className="w-10 h-10" />
          </div>
        </motion.div>
      </div>

      <div className="text-center mt-3 shrink-0">
        <h3 className={`font-bold text-lg ${isScanning ? 'text-green-600' : 'text-gray-500'}`}>
          {isScanning ? 'Lector Activo' : 'Lector Pausado'}
        </h3>
        <p className="text-gray-500 text-sm">Acerca las tarjetas al dispositivo</p>
      </div>

      {/* Counter */}
      <div className="px-6 py-4 shrink-0 flex justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-3 flex items-center gap-4">
          <div className="text-center">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Registrados</p>
            <p className="text-3xl font-black text-gray-900">{registeredCount}<span className="text-lg text-gray-400">/{totalStudents}</span></p>
          </div>
          <div className="w-px h-10 bg-gray-200" />
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
        </div>
      </div>

      {/* Scans List */}
      <div className="flex-1 overflow-y-auto px-4 pb-28">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Últimos Escaneos</h3>
        <div className="space-y-3">
          <AnimatePresence>
            {scans.map((scan, i) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-4 ${
                  scan.status === 'success' ? 'border-green-100' :
                  scan.status === 'warning' ? 'border-yellow-200' :
                  'border-red-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  scan.status === 'success' ? 'bg-green-100 text-green-600' :
                  scan.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {scan.status === 'success' && <CheckCircle2 className="w-6 h-6" />}
                  {scan.status === 'warning' && <AlertTriangle className="w-6 h-6" />}
                  {scan.status === 'error' && <XCircle className="w-6 h-6" />}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-sm truncate ${
                    scan.status === 'success' ? 'text-gray-900' :
                    scan.status === 'warning' ? 'text-yellow-900' :
                    'text-red-900'
                  }`}>{scan.name}</h4>
                  {scan.message && (
                    <p className={`text-xs font-medium ${
                      scan.status === 'warning' ? 'text-yellow-700' : 'text-red-700'
                    }`}>{scan.message}</p>
                  )}
                </div>

                <div className="text-xs font-bold text-gray-400 shrink-0">
                  {scan.time}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {scans.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Nfc className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Esperando alumnos...</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-20 flex gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pb-8">
        <button 
          onClick={() => navigate('/manual-capture', { state })}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-2 rounded-2xl flex items-center justify-center gap-2 transition-colors active:scale-95"
        >
          <Hand className="w-5 h-5" />
          <span className="text-sm">Manual</span>
        </button>
        <button 
          onClick={() => {
            setIsScanning(false);
            if (isGraded) {
              navigate('/evaluation-capture', { state });
            } else {
              navigate('/activities');
            }
          }}
          className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-lg shadow-blue-200"
        >
          <Check className="w-5 h-5" />
          {isGraded ? 'Evaluar Alumnos' : 'Finalizar'}
        </button>
      </div>
    </div>
  );
}