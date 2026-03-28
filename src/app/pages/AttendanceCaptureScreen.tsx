import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Save, Check, X, Search, Loader, Nfc, RadioReceiver,
  QrCode, Camera, Users
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { studentService, Student } from '../../services/studentService';
import { activityService } from '../../services/activityService';
import { captureService } from '../../services/captureService';
import { hardwareServices } from '../../utils/hardwareServices';
import { CapacitorNfc } from '@capgo/capacitor-nfc';

// Re-usamos QrScannerOverlay de CaptureView adaptado rápidamente
function QrScannerOverlay({ onScanned, onClose }: { onScanned: (code: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animFrameId: number;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          canvas = document.createElement('canvas');
          ctx = canvas.getContext('2d');
          scanFrame();
        }
      } catch {
        setError('No se pudo acceder a la cámara.');
      }
    };

    const scanFrame = () => {
      if (!videoRef.current || !ctx) return;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        detector.detect(canvas).then((barcodes: any[]) => {
          if (barcodes.length > 0) { onScanned(barcodes[0].rawValue); return; }
          animFrameId = requestAnimationFrame(scanFrame);
        }).catch(() => { animFrameId = requestAnimationFrame(scanFrame); });
      } else {
        animFrameId = requestAnimationFrame(scanFrame);
      }
    };

    startCamera();
    return () => { cancelAnimationFrame(animFrameId); stream?.getTracks().forEach(t => t.stop()); };
  }, [onScanned]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
        <button onClick={onClose} className="absolute top-8 right-6 w-12 h-12 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-md">
          <X className="w-6 h-6" />
        </button>
      </div>
    </motion.div>
  );
}

export function AttendanceCaptureScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<(Student & { status: string | null })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [captureMode, setCaptureMode] = useState<'manual' | 'qr' | 'nfc'>('manual');
  
  // Scanners
  const [isNfcActive, setIsNfcActive] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  
  // Autocreation of activity
  const [activityId, setActivityId] = useState<number | null>(null);

  // References for scanners
  const studentsRef = useRef(students);
  useEffect(() => { studentsRef.current = students; }, [students]);

  useEffect(() => {
    const init = async () => {
      try {
        const today = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
        // Crea la sesión de pase de lista en base de datos al instante
        const act = await activityService.createActivity({
          title: `Pase de Lista - ${today}`,
          subject: 'lenguajes', // Default formativo
          type: 'participacion',
          // @ts-ignore - Valid in server payload builders
          evaluation_scale: null
        });
        setActivityId(act.id!);

        const st = await studentService.getStudents();
        setStudents(st.map(s => ({ ...s, status: null })));
      } catch (err) {
        console.error(err);
        alert("Error iniciando pase de lista. Revisa tu red.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleAttendanceToggle = (studentId: number, val: string | null) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: val } : s));
  };

  const processScanMatch = async (matchStudent: Student & { status: string | null }) => {
    handleAttendanceToggle(matchStudent.id as number, 'yes'); // Si escanea = Presente
    await hardwareServices.vibrateSuccess();
  };

  const handleNfcScan = async () => {
    try {
      await hardwareServices.initNfcListener(async (data: any) => {
        const match = studentsRef.current.find(s => s.nfc_tag === data.serialNumber);
        if (match) await processScanMatch(match);
        else { await hardwareServices.vibrateError(); alert("Dispositivo o tarjeta no asignada."); }
      });
      setIsNfcActive(true);
    } catch {
      alert("Error iniciando NFC.");
    }
  };

  const handleQrScanned = async (code: string) => {
    setShowQrScanner(false);
    const match = studentsRef.current.find(s => s.qr_code === code);
    if (match) await processScanMatch(match);
    else { await hardwareServices.vibrateError(); alert("Código QR no asignado a ningún alumno."); }
  };

  const handleSave = async () => {
    if (!activityId) return;
    setSaving(true);
    try {
      const session = { activityId, activityType: 'participacion' as any, evaluationScale: 'numeric' as any }; // numeric dummy para payload builder
      await captureService.submitSessionAndClose(session, students.map(s => ({
        id: s.id as number, grade: '', level: '', status: s.status,
      })));
      navigate('/dashboard');
    } catch {
      alert('Error guardando asistencia.');
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const completedCount = students.filter(s => s.status !== null).length;

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* ── Header ── */}
      <div className="bg-emerald-500 rounded-b-[2rem] px-5 pt-8 pb-6 shadow-md relative z-10 shrink-0">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-black text-2xl tracking-tight leading-none">Asistencia</h1>
            <p className="text-emerald-100 text-sm font-medium mt-1">Hoy, {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-white/20 p-1.5 rounded-2xl mb-4 backdrop-blur-md">
          {[
            { key: 'manual', label: 'Manual', icon: Users },
            { key: 'nfc', label: 'Lector NFC', icon: Nfc },
            { key: 'qr', label: 'Cámara QR', icon: QrCode },
          ].map(m => (
            <button
              key={m.key}
              onClick={() => {
                setCaptureMode(m.key as any);
                if (m.key === 'nfc') handleNfcScan(); else { setIsNfcActive(false); CapacitorNfc.stopScanning().catch(()=>{}); }
                if (m.key === 'qr') setShowQrScanner(true);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all ${
                captureMode === m.key ? 'bg-white text-emerald-600 shadow-md scale-[1.02]' : 'text-emerald-50 opacity-80 hover:opacity-100'
              }`}
            >
              <m.icon className="w-4 h-4" /> {m.label}
            </button>
          ))}
        </div>

        {captureMode === 'nfc' && isNfcActive && (
           <div className="bg-emerald-400/50 border border-emerald-300/50 rounded-xl p-3 flex justify-center items-center gap-2 mb-2 animate-pulse text-white text-sm font-bold">
              <RadioReceiver className="w-4 h-4" /> Escuchando tarjetas NFC...
           </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700/50" />
          <input
            type="text" placeholder="Buscar alumno..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-400/30"
          />
        </div>
      </div>

      {/* ── Student List ── */}
      <div className="flex-1 overflow-y-auto pb-28 pt-2">
        {loading ? (
          <div className="flex justify-center py-10"><Loader className="w-8 h-8 text-emerald-500 animate-spin" /></div>
        ) : (
          <div className="space-y-2 px-4 pb-4">
            {filteredStudents.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`p-3.5 rounded-2xl flex items-center justify-between shadow-sm transition-colors border ${
                  s.status === 'yes' ? 'bg-emerald-50 border-emerald-200' : s.status === 'no' ? 'bg-red-50 border-red-200' : 'bg-white border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 w-[60%]">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">{i+1}</div>
                  <p className="font-bold text-sm text-slate-800 truncate leading-tight">{s.name}</p>
                </div>
                
                <div className="flex gap-2">
                  <button onClick={() => handleAttendanceToggle(s.id as number, s.status === 'yes' ? null : 'yes')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${s.status === 'yes' ? 'bg-emerald-500 text-white shadow-md scale-105' : 'bg-slate-100 text-slate-400'}`}>
                    <Check className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleAttendanceToggle(s.id as number, s.status === 'no' ? null : 'no')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${s.status === 'no' ? 'bg-red-500 text-white shadow-md scale-105' : 'bg-slate-100 text-slate-400'}`}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent z-20 pointer-events-none">
        <button
          onClick={handleSave} disabled={saving || loading}
          className="w-full bg-slate-900 hover:bg-black text-white font-bold text-base py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 pointer-events-auto disabled:opacity-60 active:scale-95"
        >
          {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Guardando...' : `Guardar Asistencia (${completedCount}/${students.length})`}
        </button>
      </div>

      <AnimatePresence>
        {showQrScanner && <QrScannerOverlay onScanned={handleQrScanned} onClose={() => { setShowQrScanner(false); setCaptureMode('manual'); }} />}
      </AnimatePresence>
    </div>
  );
}
