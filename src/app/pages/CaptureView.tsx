import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Save, Check, X, Search, Loader, Nfc, RadioReceiver,
  Plus, CloudOff, QrCode, List, Camera, ChevronRight, Zap
} from 'lucide-react';
import { BackHeader } from '../components/BackHeader';
import { useNavigate, useLocation } from 'react-router';
import { studentService } from '../../services/studentService';
import { activityService } from '../../services/activityService';
import { captureService } from '../../services/captureService';
import { authService } from '../../services/authService';
import { hardwareServices } from '../../utils/hardwareServices';
import { useFormativeFields } from '../../hooks/useFormativeFields';
import { useSyncStore } from '../../store/useSyncStore';

// ─── Types ────────────────────────────────────────────────────────────────────

type CaptureMode = 'manual' | 'qr' | 'nfc';

interface Student {
  id: number;
  listNumber: number;
  name: string;
  nfc_tag: string | null;
  qr_code?: string | null;
  grade: string;
  level: string;
  status: string | null;
  notes: string;
}

// ─── QR Scanner Component ─────────────────────────────────────────────────────

function QrScannerOverlay({
  onScanned,
  onClose,
}: {
  onScanned: (code: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

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
          setScanning(true);
          canvas = document.createElement('canvas');
          ctx = canvas.getContext('2d');
          scanFrame();
        }
      } catch (err) {
        setError('No se pudo acceder a la cámara. Verifica los permisos.');
      }
    };

    const scanFrame = () => {
      if (!videoRef.current || !ctx) return;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        detector
          .detect(canvas)
          .then((barcodes: any[]) => {
            if (barcodes.length > 0) {
              onScanned(barcodes[0].rawValue);
              return;
            }
            animFrameId = requestAnimationFrame(scanFrame);
          })
          .catch(() => {
            animFrameId = requestAnimationFrame(scanFrame);
          });
      } else {
        animFrameId = requestAnimationFrame(scanFrame);
      }
    };

    startCamera();

    return () => {
      cancelAnimationFrame(animFrameId);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onScanned]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-64 h-64">
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
              <div
                key={pos}
                className={`absolute w-8 h-8 border-white border-[3px] ${
                  pos === 'top-left' ? 'top-0 left-0 border-r-0 border-b-0 rounded-tl-lg' :
                  pos === 'top-right' ? 'top-0 right-0 border-l-0 border-b-0 rounded-tr-lg' :
                  pos === 'bottom-left' ? 'bottom-0 left-0 border-r-0 border-t-0 rounded-bl-lg' :
                  'bottom-0 right-0 border-l-0 border-t-0 rounded-br-lg'
                }`}
              />
            ))}
            <motion.div
              className="absolute left-2 right-2 h-0.5 bg-green-400 shadow-[0_0_8px_2px_rgba(74,222,128,0.6)]"
              animate={{ top: ['10%', '90%', '10%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-black/50" style={{
          clipPath: 'polygon(0% 0%, 0% 100%, calc(50% - 8rem) 100%, calc(50% - 8rem) calc(50% - 8rem), calc(50% + 8rem) calc(50% - 8rem), calc(50% + 8rem) calc(50% + 8rem), calc(50% - 8rem) calc(50% + 8rem), calc(50% - 8rem) 100%, 100% 100%, 100% 0%)',
        }} />
      </div>

      <div className="bg-black/90 backdrop-blur-sm px-6 pt-4 pb-10 space-y-4">
        {error ? (
          <p className="text-red-400 text-center text-sm font-medium">{error}</p>
        ) : (
          <p className="text-white/70 text-center text-sm">Apunta la cámara al código QR del alumno</p>
        )}
        <QrManualEntry onSubmit={onScanned} />
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl border border-white/20 text-white/80 font-bold text-sm active:scale-95 transition-all"
        >
          Cancelar
        </button>
      </div>
    </motion.div>
  );
}

function QrManualEntry({ onSubmit }: { onSubmit: (code: string) => void }) {
  const [val, setVal] = useState('');
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Ingresar código manualmente..."
        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/50"
        onKeyDown={(e) => { if (e.key === 'Enter' && val.trim()) { onSubmit(val.trim()); setVal(''); } }}
      />
      <button
        disabled={!val.trim()}
        onClick={() => { onSubmit(val.trim()); setVal(''); }}
        className="px-4 py-2 bg-green-500 text-white font-bold rounded-xl active:scale-95 transition-all disabled:opacity-40 text-sm"
      >
        OK
      </button>
    </div>
  );
}

// ─── Mode Switcher ────────────────────────────────────────────────────────────

const MODES: { key: CaptureMode; label: string; Icon: React.ElementType; color: string; activeClass: string }[] = [
  { key: 'manual', label: 'Manual',  Icon: List,   color: '#6366f1', activeClass: 'bg-indigo-600' },
  { key: 'qr',     label: 'QR',      Icon: QrCode,  color: '#0ea5e9', activeClass: 'bg-sky-600'    },
  { key: 'nfc',    label: 'NFC',     Icon: Nfc,     color: '#10b981', activeClass: 'bg-emerald-600' },
];

// ─── Level definitions ────────────────────────────────────────────────────────

const LEVELS = [
  { label: 'Logrado',        short: 'L', color: 'bg-emerald-50 text-emerald-700 border-emerald-300'  },
  { label: 'En Proceso',     short: 'P', color: 'bg-amber-50 text-amber-700 border-amber-300'        },
  { label: 'Requiere Apoyo', short: 'R', color: 'bg-red-50 text-red-700 border-red-300'             },
];

// ─── Inline: Participation Toggle ─────────────────────────────────────────────

function ParticipationToggle({
  status,
  onChange,
}: {
  status: string | null;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex gap-1">
      <button
        id={`toggle-yes`}
        onClick={() => onChange(status === 'yes' ? 'pending' : 'yes')}
        className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${
          status === 'yes'
            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
            : 'bg-white border-gray-200 text-gray-400 hover:border-emerald-300'
        }`}
        aria-label="Participó"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        id={`toggle-no`}
        onClick={() => onChange(status === 'no' ? 'pending' : 'no')}
        className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${
          status === 'no'
            ? 'bg-red-500 border-red-500 text-white shadow-sm'
            : 'bg-white border-gray-200 text-gray-400 hover:border-red-300'
        }`}
        aria-label="No participó"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Inline: Numeric Input ────────────────────────────────────────────────────

function NumericInput({
  grade,
  onChange,
}: {
  grade: string;
  onChange: (val: string) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      max={10}
      step={0.5}
      value={grade}
      onChange={(e) => onChange(e.target.value)}
      placeholder="—"
      className={`w-16 h-9 text-center rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all ${
        grade
          ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
          : 'border-gray-200 bg-white text-gray-500'
      }`}
    />
  );
}

// ─── Inline: Level Buttons ────────────────────────────────────────────────────

function LevelButtons({
  level,
  onChange,
}: {
  level: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex gap-1">
      {LEVELS.map(({ label, short, color }) => (
        <button
          key={label}
          onClick={() => onChange(level === label ? '' : label)}
          className={`w-8 h-9 rounded-xl border text-[11px] font-black transition-all active:scale-95 ${
            level === label ? color + ' shadow-sm' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
          }`}
          title={label}
          aria-label={label}
        >
          {short}
        </button>
      ))}
    </div>
  );
}

// ─── Grade Modal (for QR / NFC modes) ─────────────────────────────────────────

function GradeModal({
  student,
  activityType,
  evaluationScale,
  mode,
  onGrade,
  onCancel,
}: {
  student: Student;
  activityType: string;
  evaluationScale: string;
  mode: CaptureMode;
  onGrade: (grade: string | null, level: string | null, status: string | null) => void;
  onCancel: () => void;
}) {
  const modeInfo = MODES.find((m) => m.key === mode)!;
  const ModeIcon = modeInfo.Icon;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm z-40"
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] z-50 shadow-2xl pb-10 overflow-hidden"
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-5" />

        <div className="px-6 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ backgroundColor: modeInfo.color + '20', color: modeInfo.color }}
            >
              <ModeIcon className="w-3 h-3" />
              Vía {modeInfo.label}
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">{student.name}</h2>
          <p className="text-slate-500 text-sm mt-0.5">Lista #{student.listNumber}</p>
        </div>

        <div className="px-6 mt-5">
          {activityType === 'calificada' ? (
            evaluationScale === 'levels' ? (
              <div className="flex flex-col gap-3">
                {LEVELS.map(({ label, color }) => (
                  <button
                    key={label}
                    onClick={() => onGrade(null, label, null)}
                    className={`w-full py-4 px-5 rounded-2xl font-bold text-base border-2 ${color} active:scale-95 transition-all`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {[5, 6, 7, 8, 9, 10].map((g) => (
                  <button
                    key={g}
                    onClick={() => onGrade(g.toString(), null, null)}
                    className="py-5 rounded-2xl bg-indigo-50 text-indigo-700 font-black text-2xl border-2 border-indigo-200 active:scale-95 transition-all"
                  >
                    {g}
                  </button>
                ))}
              </div>
            )
          ) : (
            /* Participación / Registro */
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onGrade(null, null, 'yes')}
                className="py-5 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-xl border-2 border-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-6 h-6" /> Participó
              </button>
              <button
                onClick={() => onGrade(null, null, 'no')}
                className="py-5 rounded-2xl bg-red-50 text-red-700 font-black text-xl border-2 border-red-200 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <X className="w-6 h-6" /> No participó
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CaptureView() {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Activity state ──
  const [activityId, setActivityId] = useState<number | null>(location.state?.activityId || null);
  const [activityType, setActivityType] = useState(location.state?.activityType || 'registro');
  const [activityName, setActivityName] = useState(location.state?.activityName || 'Cargando sesión...');
  const [campoName, setCampoName] = useState(location.state?.campoName || '');
  const [evaluationScale, setEvaluationScale] = useState(location.state?.evaluationScale || 'numeric');
  const [loadingActiveActivity, setLoadingActiveActivity] = useState(true);

  // ── Students ──
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const studentsRef = useRef<Student[]>([]);
  useEffect(() => { studentsRef.current = students; }, [students]);

  // ── Capture mode ──
  const [captureMode, setCaptureMode] = useState<CaptureMode>('manual');

  // ── Grading modal (for QR/NFC) ──
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [gradingSource, setGradingSource] = useState<CaptureMode>('manual');

  // ── NFC ──
  const [isNfcActive, setIsNfcActive] = useState(false);

  // ── QR Scanner ──
  const [showQrScanner, setShowQrScanner] = useState(false);

  // ── New Activity modal ──
  const [showNewModal, setShowNewModal] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityType, setNewActivityType] = useState('registro');
  const [newEvaluationScale, setNewEvaluationScale] = useState<'numeric' | 'levels'>('numeric');
  const [activeCampo, setActiveCampo] = useState('lenguajes');

  // ── Misc ──
  const [saving, setSaving] = useState(false);
  const { fields, loading: loadingFields, getIcon } = useFormativeFields();
  const { pendingRecords, addRecord, syncData, isOnline, setOnlineStatus } = useSyncStore();

  // ── Sync / Online ──
  useEffect(() => {
    const up = () => { setOnlineStatus(true); syncData(); };
    const down = () => setOnlineStatus(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    if (navigator.onLine) syncData();
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, [syncData, setOnlineStatus]);

  // ── Load active activity if none passed ──
  useEffect(() => {
    if (!activityId) {
      activityService.getActiveActivity()
        .then((act) => {
          setActivityId(act.id!);
          setActivityName(act.title);
          setActivityType(act.type || 'registro');
          setEvaluationScale(act.evaluation_scale || 'numeric');
          setCampoName(act.subject);
        })
        .catch(() => setActivityName('Ninguna actividad en la clase'))
        .finally(() => setLoadingActiveActivity(false));
    } else {
      setLoadingActiveActivity(false);
    }
  }, [activityId]);

  // ── Load students ──
  useEffect(() => {
    studentService.getStudents()
      .then((data) => {
        setStudents(data.map((s: any, idx: number) => ({
          id: s.id,
          listNumber: idx + 1,
          name: s.name,
          nfc_tag: s.nfc_tag || null,
          qr_code: s.qr_code || null,
          grade: '',
          level: '',
          status: null,
          notes: '',
        })));
      })
      .catch((err) => console.error('Error cargando alumnos:', err))
      .finally(() => setLoading(false));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // NFC: background listener — only active when NFC mode is on
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (captureMode !== 'nfc' || !isNfcActive) return;
    let active = true;

    hardwareServices.initNfcListener(
      async (tagData: any) => {
        if (!active) return;
        const uid = tagData.id
          ? captureService.formatNfcUid(Array.from(tagData.id as number[]))
          : 'unknown';

        const stu = await captureService.resolveStudentByNfc(uid, studentsRef.current);
        if (stu) {
          await hardwareServices.vibrateSuccess();
          setGradingSource('nfc');
          const localStu = studentsRef.current.find((s) => s.id === stu.id) ||
            { ...stu, listNumber: 0, grade: '', level: '', status: null, notes: '' } as Student;
          setActiveStudent(localStu);
        } else {
          await hardwareServices.vibrateError();
        }
      },
      async (err: any) => {
        if (!active) return;
        console.log('NFC error', err);
      }
    );

    return () => { active = false; };
  }, [captureMode, isNfcActive]);

  // ─────────────────────────────────────────────────────────────────────────────
  // QR: handle code scanned
  // ─────────────────────────────────────────────────────────────────────────────
  const handleQrScanned = async (code: string) => {
    setShowQrScanner(false);
    const stu = studentsRef.current.find((s) => s.qr_code === code || s.id.toString() === code);
    if (stu) {
      await hardwareServices.vibrateSuccess();
      setGradingSource('qr');
      setActiveStudent(stu);
    } else {
      await hardwareServices.vibrateError();
      alert(`No se encontró ningún alumno con el código: "${code}"`);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Inline update — updates local state + persists
  // ─────────────────────────────────────────────────────────────────────────────
  const handleInlineUpdate = async (
    student: Student,
    gradeValue: string | null,
    levelValue: string | null,
    statusValue: string | null
  ) => {
    if (!activityId) return;

    setStudents((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((s) => s.id === student.id);
      if (idx !== -1) {
        if (activityType === 'calificada') {
          if (evaluationScale === 'numeric' && gradeValue !== null) copy[idx] = { ...copy[idx], grade: gradeValue };
          if (evaluationScale === 'levels' && levelValue !== null) copy[idx] = { ...copy[idx], level: levelValue };
        } else {
          if (statusValue !== null) copy[idx] = { ...copy[idx], status: statusValue };
        }
      }
      return copy;
    });

    await hardwareServices.vibrateSuccess();

    const session = { activityId, activityType: activityType as any, evaluationScale: evaluationScale as any };
    const result = await captureService.submitEvaluation(
      session,
      student.id as number,
      { gradeValue, levelValue, statusValue: statusValue as any },
      'manual'
    );

    if (!result.success && result.record) {
      addRecord({
        studentId: result.record.studentId,
        activityId: String(result.record.activityId),
        type: 'evaluation',
        value: result.record.value,
      });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Grade modal confirmed (QR / NFC modes)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleGradeConfirm = async (
    student: Student,
    gradeValue: string | null,
    levelValue: string | null,
    statusValue: string | null
  ) => {
    if (!activityId) return;

    setStudents((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((s) => s.id === student.id);
      if (idx !== -1) {
        if (activityType === 'calificada') {
          if (evaluationScale === 'numeric' && gradeValue) copy[idx] = { ...copy[idx], grade: gradeValue };
          if (evaluationScale === 'levels' && levelValue) copy[idx] = { ...copy[idx], level: levelValue };
        } else {
          if (statusValue) copy[idx] = { ...copy[idx], status: statusValue };
        }
      }
      return copy;
    });

    // QR/NFC: close modal after each grade (no auto-advance)
    setActiveStudent(null);

    await hardwareServices.vibrateSuccess();

    const session = { activityId, activityType: activityType as any, evaluationScale: evaluationScale as any };
    const result = await captureService.submitEvaluation(
      session,
      student.id as number,
      { gradeValue, levelValue, statusValue: statusValue as any },
      gradingSource
    );

    if (!result.success && result.record) {
      addRecord({
        studentId: result.record.studentId,
        activityId: String(result.record.activityId),
        type: 'evaluation',
        value: result.record.value,
      });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Save & finish
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!activityId) { alert('Error: Actividad no válida.'); return; }
    setSaving(true);
    try {
      const session = { activityId, activityType: activityType as any, evaluationScale: evaluationScale as any };
      await captureService.submitSessionAndClose(session, students.map((s) => ({
        id: s.id as number,
        grade: s.grade,
        level: s.level,
        status: s.status,
      })));
      setActivityId(null);
      setActivityName('Ninguna actividad en la clase');
      navigate('/records');
    } catch {
      alert('Hubo un error al guardar. Verifica la conexión con el servidor.');
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Create activity
  // ─────────────────────────────────────────────────────────────────────────────
  const currentCampo = fields.find((c) => c.slug === activeCampo) || fields[0] || { name: 'Lenguajes' };

  const handleCreateActivity = async () => {
    if (!newActivityName.trim()) return;
    // For non-calificada types, evaluation scale is irrelevant — always 'numeric' as safe default
    const scaleToSend = newActivityType === 'calificada' ? newEvaluationScale : 'numeric';
    try {
      const storedUser = authService.getStoredUser();
      const teacherGroupId = storedUser?.group_info?.id;
      const response = await activityService.createActivity({
        title: newActivityName.trim(),
        subject: currentCampo.name,
        due_date: new Date().toISOString().split('T')[0],
        group_id: teacherGroupId,
        type: newActivityType as any,
        evaluation_scale: scaleToSend,
      });
      setActivityId(response.id!);
      setActivityName(response.title);
      setActivityType(response.type || 'registro');
      setEvaluationScale(response.evaluation_scale || 'numeric');
      setCampoName(response.subject);
      setShowNewModal(false);
      setNewActivityName('');
    } catch {
      alert('Hubo un error al crear la actividad.');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Derived
  // ─────────────────────────────────────────────────────────────────────────────
  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const completedCount = students.filter((s) => s.grade || s.level || s.status).length;

  // ─────────────────────────────────────────────────────────────────────────────
  // Empty state (no activity)
  // ─────────────────────────────────────────────────────────────────────────────
  if (!activityId && !loadingActiveActivity) {
    return (
      <div className="flex flex-col h-full bg-slate-50 absolute inset-0 overflow-hidden">
        <BackHeader title="Captura" subtitle="Sin actividad activa" />
        <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-sky-100 rounded-full flex items-center justify-center mb-6 shadow-lg"
          >
            <Zap className="w-10 h-10 text-indigo-500" />
          </motion.div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">No hay actividad activa</h2>
          <p className="text-gray-500 mb-8 max-w-sm text-sm">
            Crea una actividad para habilitar la captura por Manual, QR o NFC.
          </p>
          <button
            onClick={() => setShowNewModal(true)}
            className="bg-indigo-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition-all w-full max-w-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-6 h-6" /> Crear Nueva Actividad
          </button>
        </div>
        <NewActivityModal
          show={showNewModal}
          onClose={() => setShowNewModal(false)}
          fields={fields}
          loadingFields={loadingFields}
          getIcon={getIcon}
          activeCampo={activeCampo}
          setActiveCampo={setActiveCampo}
          newActivityName={newActivityName}
          setNewActivityName={setNewActivityName}
          newActivityType={newActivityType}
          setNewActivityType={setNewActivityType}
          newEvaluationScale={newEvaluationScale}
          setNewEvaluationScale={setNewEvaluationScale}
          onConfirm={handleCreateActivity}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Main render
  // ─────────────────────────────────────────────────────────────────────────────

  // Determine column header label
  const colLabel =
    activityType === 'calificada'
      ? evaluationScale === 'numeric' ? 'Calif.' : 'Nivel'
      : 'Asistencia';

  return (
    <div className="flex flex-col h-full bg-gray-50 absolute inset-0 overflow-hidden">

      {/* ── Header ── */}
      <div className="bg-white px-4 pt-5 pb-3 shadow-sm z-10 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center active:bg-gray-100">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <div className="text-center flex-1 mx-2">
            <h1 className="text-gray-900 font-bold text-base leading-tight">Captura de Actividad</h1>
            <p className="text-gray-500 text-xs truncate">{activityName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`} title={isOnline ? 'En línea' : 'Sin conexión'} />
            <button
              onClick={handleSave}
              className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 active:bg-indigo-100"
            >
              <Save className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Mode Switcher ── */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-3">
          {MODES.map(({ key, label, Icon, activeClass }) => (
            <button
              key={key}
              onClick={() => {
                setCaptureMode(key);
                if (key !== 'nfc') setIsNfcActive(false);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                captureMode === key ? `${activeClass} text-white shadow-md` : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Mode-specific control strip ── */}
        <AnimatePresence mode="wait">
          {captureMode === 'nfc' && (
            <motion.div
              key="nfc-strip"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-2"
            >
              <button
                onClick={() => setIsNfcActive(!isNfcActive)}
                className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                  isNfcActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 animate-pulse'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                {isNfcActive
                  ? <><RadioReceiver className="w-4 h-4" /> Lector NFC Activo — escuchando...</>
                  : <><Nfc className="w-4 h-4" /> Activar Lector NFC</>
                }
              </button>
            </motion.div>
          )}

          {captureMode === 'qr' && (
            <motion.div
              key="qr-strip"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-2"
            >
              <button
                onClick={() => setShowQrScanner(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 text-white flex items-center justify-center gap-2 font-bold text-sm shadow-md shadow-sky-200 active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" /> Escanear Código QR
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Search ── */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar alumno..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="h-1 bg-gray-100 shrink-0">
        <motion.div
          className="h-full bg-indigo-500"
          animate={{ width: `${students.length ? (completedCount / students.length) * 100 : 0}%` }}
          transition={{ type: 'spring', stiffness: 80 }}
        />
      </div>

      {/* ── Table Header ── */}
      <div className="flex items-center px-4 py-2.5 bg-gray-100/80 text-[10px] font-black text-gray-400 uppercase tracking-wider shrink-0">
        <div className="w-8 text-center">#</div>
        <div className="flex-1 px-2">Alumno</div>
        <div className="w-28 text-center">{colLabel}</div>
      </div>

      {/* ── Student List ── */}
      <div className="flex-1 overflow-y-auto pb-28">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader className="w-7 h-7 text-indigo-400 animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredStudents.map((student) => {
              const isEvaluated = !!(student.grade || student.level || student.status);
              const isPending = pendingRecords.some(
                (r: any) => r.studentId === student.id && r.activityId === activityId?.toString()
              );

              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`flex items-center px-4 py-3 transition-colors ${isEvaluated ? 'bg-indigo-50/40' : 'bg-white'}`}
                >
                  {/* # */}
                  <div className="w-8 text-center font-bold text-gray-400 text-sm shrink-0">
                    {student.listNumber}
                  </div>

                  {/* Name + badges */}
                  <div className="flex-1 px-2 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate flex items-center gap-1.5">
                      {student.name}
                      {isPending && (
                        <span aria-label="Pendiente de sincronizar">
                          <CloudOff className="w-3 h-3 text-gray-400 shrink-0" />
                        </span>
                      )}
                      {!isPending && isEvaluated && (
                        <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {student.nfc_tag && (
                        <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest" aria-label="NFC vinculado">NFC</span>
                      )}
                      {student.qr_code && (
                        <span className="text-[9px] text-sky-500 font-black uppercase tracking-widest" aria-label="QR vinculado">QR</span>
                      )}
                    </div>
                  </div>

                  {/* ── Inline capture control ── */}
                  <div className="w-28 flex justify-center shrink-0">
                    {activityType === 'calificada' ? (
                      evaluationScale === 'numeric' ? (
                        /* Numeric inline input */
                        <NumericInput
                          grade={student.grade}
                          onChange={(val) => handleInlineUpdate(student, val, null, null)}
                        />
                      ) : (
                        /* Level buttons */
                        <LevelButtons
                          level={student.level}
                          onChange={(val) => handleInlineUpdate(student, null, val, null)}
                        />
                      )
                    ) : (
                      /* Participation / Registro toggle */
                      <ParticipationToggle
                        status={student.status}
                        onChange={(val) => handleInlineUpdate(student, null, null, val)}
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FAB Save ── */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-3 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent z-20">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="w-full bg-gray-900 hover:bg-black text-white font-bold text-base py-4 rounded-2xl transition-colors active:scale-95 shadow-xl flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Guardando...' : `Guardar y Finalizar · ${completedCount}/${students.length}`}
        </button>
      </div>

      {/* ── Grade Modal (QR / NFC) ── */}
      <AnimatePresence>
        {activeStudent && (
          <GradeModal
            student={activeStudent}
            activityType={activityType}
            evaluationScale={evaluationScale}
            mode={gradingSource}
            onGrade={(g, l, s) => handleGradeConfirm(activeStudent, g, l, s)}
            onCancel={() => setActiveStudent(null)}
          />
        )}
      </AnimatePresence>

      {/* ── QR Scanner overlay ── */}
      <AnimatePresence>
        {showQrScanner && (
          <QrScannerOverlay
            onScanned={handleQrScanned}
            onClose={() => setShowQrScanner(false)}
          />
        )}
      </AnimatePresence>

      {/* ── New Activity modal ── */}
      <NewActivityModal
        show={showNewModal}
        onClose={() => setShowNewModal(false)}
        fields={fields}
        loadingFields={loadingFields}
        getIcon={getIcon}
        activeCampo={activeCampo}
        setActiveCampo={setActiveCampo}
        newActivityName={newActivityName}
        setNewActivityName={setNewActivityName}
        newActivityType={newActivityType}
        setNewActivityType={setNewActivityType}
        newEvaluationScale={newEvaluationScale}
        setNewEvaluationScale={setNewEvaluationScale}
        onConfirm={handleCreateActivity}
      />
    </div>
  );
}

// ─── New Activity Modal ───────────────────────────────────────────────────────

function NewActivityModal({
  show, onClose, fields, loadingFields, getIcon,
  activeCampo, setActiveCampo,
  newActivityName, setNewActivityName,
  newActivityType, setNewActivityType,
  newEvaluationScale, setNewEvaluationScale,
  onConfirm,
}: any) {
  // Only show evaluation scale when activity type is "calificada"
  const showScale = newActivityType === 'calificada';

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl z-50 shadow-2xl h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col"
          >
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-black text-gray-900">Nueva Actividad</h2>
              <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-10">
              {/* Activity name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de la actividad</label>
                <input
                  type="text" value={newActivityName} onChange={(e) => setNewActivityName(e.target.value)}
                  placeholder="Ej. Lectura de comprensión"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Campo Formativo */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Campo Formativo</label>
                <div className="grid grid-cols-2 gap-3">
                  {loadingFields ? (
                    <div className="col-span-2 text-center text-slate-400 py-4">Cargando campos...</div>
                  ) : (
                    fields.map((campo: any) => {
                      const IconComponent = getIcon(campo.icon);
                      const isSelected = activeCampo === campo.slug;
                      return (
                        <button
                          key={campo.id}
                          onClick={() => setActiveCampo(campo.slug)}
                          style={{
                            backgroundColor: isSelected ? campo.bg_color_hex : 'white',
                            color: isSelected ? campo.color_hex : '#64748b',
                            borderColor: isSelected ? campo.color_hex : '#e2e8f0',
                            borderWidth: isSelected ? '2px' : '1px',
                          }}
                          className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all ${isSelected ? 'shadow-md scale-[1.02]' : 'hover:bg-slate-50'}`}
                        >
                          <IconComponent size={22} style={{ color: isSelected ? campo.color_hex : '#94a3b8' }} />
                          <span className="text-xs font-bold text-center leading-tight">{campo.name}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Activity type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Registro</label>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  {['registro', 'participacion', 'calificada'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewActivityType(t)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        newActivityType === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {t === 'registro' ? 'Registro' : t === 'participacion' ? 'Participación' : 'Calificada'}
                    </button>
                  ))}
                </div>
                {/* Hint for non-calificada types */}
                {!showScale && (
                  <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-500" />
                    Evaluación binaria: Participó / No participó
                  </p>
                )}
              </div>

              {/* Evaluation scale — only shown for "calificada" */}
              <AnimatePresence>
                {showScale && (
                  <motion.div
                    key="scale-section"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <label className="block text-sm font-bold text-gray-700 mb-2">Escala de Evaluación</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setNewEvaluationScale('numeric')}
                        className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                          newEvaluationScale === 'numeric' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-500'
                        }`}
                      >
                        <span className="font-bold text-sm">Numérica</span>
                        <span className="text-[10px] mt-1 opacity-70">(del 5 al 10)</span>
                      </button>
                      <button
                        onClick={() => setNewEvaluationScale('levels')}
                        className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                          newEvaluationScale === 'levels' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-500'
                        }`}
                      >
                        <span className="font-bold text-sm">Niveles</span>
                        <span className="text-[10px] mt-1 opacity-70">(formativo)</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-6 border-t border-gray-100 shrink-0">
              <button
                onClick={onConfirm}
                disabled={!newActivityName.trim()}
                className={`w-full font-bold text-lg py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  newActivityName.trim()
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                Crear Actividad <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}