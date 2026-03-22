import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Search, User, CalendarDays, BookOpen, ChevronRight,
  MoreVertical, X, CheckCircle2, XCircle, UserPlus, Hash, Nfc,
  Loader2, AlertCircle, RefreshCw, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { pdfGenerator } from '../../lib/pdfGenerator';
import { CapacitorNfc } from '@capgo/capacitor-nfc';
import { studentService } from '../../services/studentService';
import type { Student as ApiStudent } from '../../services/studentService';
import { authService } from '../../services/authService';
import { StudentCard } from './students/StudentCard';
import { StudentActionModal } from './students/StudentActionModal';

// ── Local shape ──────────────────────────────────────────────
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  curp: string;
  status: 'present' | 'absent' | 'late';
  isRepetidor?: boolean;
}

const mapApiToLocal = (s: ApiStudent): Student => {
  const parts = (s.name ?? '').trim().split(' ');
  return {
    id:          String(s.id ?? ''),
    firstName:   parts.slice(0, -2).join(' ') || parts[0] || '',
    lastName:    parts.slice(-2).join(' ')     || '',
    curp:        s.curp ?? '',
    status:      'present',
    isRepetidor: !!s.is_repetidor,
  };
};

export function StudentListScreen() {
  const navigate = useNavigate();

  // ── State ──
  const [students,       setStudents]       = useState<Student[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [fetchError,     setFetchError]     = useState<string | null>(null);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Enrollment
  const storedUser = authService.getStoredUser();
  const teacherGroupId = storedUser?.group_info?.id ?? null;
  const teacherGroupName = storedUser?.group_info?.name ?? (storedUser?.grade && storedUser?.group ? `${storedUser.grade}° ${storedUser.group}` : 'Mi Grupo');

  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [newName,    setNewName]    = useState('');
  const [newCurp,    setNewCurp]    = useState('');
  const [isLinking,  setIsLinking]  = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [saveError,  setSaveError]  = useState<string | null>(null);

  // ── Fetch ──
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await studentService.getStudents();
      setStudents(data.map(mapApiToLocal));
    } catch (err: any) {
      setFetchError(err?.message ?? 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // ── Filter / sort ──
  const filteredStudents = useMemo(() =>
    students
      .filter(s => `${s.lastName} ${s.firstName}`.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.lastName.localeCompare(b.lastName)),
    [students, searchQuery]
  );

  // ── NFC Manual Enrollment ──
  const handleManualLink = async () => {
    if (!newName.trim()) return;
    setIsLinking(true);
    setSaveError(null);
    try {
      await CapacitorNfc.startScanning();
      const listener = await CapacitorNfc.addListener('nfcEvent', async (event: any) => {
        const tagData = event.tag || event;
        const uid = tagData.id
          ? Array.from(tagData.id as number[]).map((i) => i.toString(16).padStart(2, '0')).join(':')
          : 'unknown-uid';
        try {
      await studentService.createStudent({ name: newName.trim(), curp: newCurp.trim(), nfc_tag: uid, group_id: teacherGroupId ?? undefined });
          setLinkSuccess(true);
          fetchStudents(); // Reload list
        } catch (dbErr: any) {
          setSaveError(dbErr?.message ?? 'Error guardando alumno');
        } finally {
          setIsLinking(false);
          CapacitorNfc.stopScanning();
          listener.remove();
          setTimeout(() => {
            setLinkSuccess(false);
            setSaveError(null);
            setNewName(''); setNewCurp('');
            setIsEnrollModalOpen(false);
          }, 2200);
        }
      });
    } catch (err: any) {
      setSaveError('Error iniciando NFC: ' + (err?.message ?? JSON.stringify(err)));
      setIsLinking(false);
    }
  };

  // ── PDF ──
  const handleDownload911 = () => {
    const rows = students.map(s => ({ name: `${s.lastName} ${s.firstName}`, curp: s.curp, isRepetidor: s.isRepetidor }));
    pdfGenerator.generate911ReportPDF(rows);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 absolute inset-0 overflow-hidden">

      {/* ── Header ── */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white px-4 pt-6 pb-4 shadow-sm z-10 shrink-0"
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center active:bg-gray-100 transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-800" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Lista del Grupo</h1>
              {!loading && !fetchError && (
                <p className="text-xs text-gray-400">{students.length} alumno{students.length !== 1 ? 's' : ''} registrados</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchStudents} className="w-9 h-9 rounded-full flex items-center justify-center active:bg-gray-100 transition-colors" title="Recargar">
              <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsEnrollModalOpen(true)}
              className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-2 rounded-xl text-sm font-bold transition-colors active:bg-purple-200"
            >
              <UserPlus className="w-4 h-4" /> Alumno
            </button>
          </div>
        </div>

        {/* PDF Button */}
        <button
          onClick={handleDownload911}
          className="w-full bg-blue-50 text-blue-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 mb-3 border border-blue-100 active:bg-blue-100"
        >
          <FileText className="w-4 h-4" /> Descargar Formato 911 (PDF)
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por apellidos o nombre..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </motion.div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Cargando alumnos del servidor...</p>
          </div>
        )}

        {/* Error */}
        {!loading && fetchError && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-800 mb-1">Error de conexión</p>
              <p className="text-xs text-red-600 mb-3">{fetchError}</p>
              <button onClick={fetchStudents} className="text-xs text-red-700 font-bold underline">
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Student List */}
        {!loading && !fetchError && (
          <div className="space-y-3 pb-24">
            <AnimatePresence>
              {filteredStudents.map((student, i) => (
                <StudentCard 
                  key={student.id} 
                  student={student} 
                  onSelect={setSelectedStudent} 
                />
              ))}
            </AnimatePresence>

            {filteredStudents.length === 0 && students.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">No se encontraron coincidencias</p>
              </motion.div>
            )}

            {filteredStudents.length === 0 && students.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-14">
                <User className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-bold mb-1">Sin alumnos registrados</p>
                <p className="text-gray-400 text-sm">Agrega el primer alumno con el botón superior</p>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* ── Student Detail Bottom Sheet ── */}
      <StudentActionModal 
        isOpen={!!selectedStudent} 
        student={selectedStudent} 
        onClose={() => setSelectedStudent(null)} 
      />

      {/* ── Enrollment Modal ── */}
      <AnimatePresence>
        {isEnrollModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="absolute inset-0 z-50 bg-white flex flex-col"
          >
            <div className="px-4 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nuevo Alumno</h1>
                <p className="text-gray-500 text-sm">Registro manual con tarjeta NFC</p>
              </div>
              <button onClick={() => !isLinking && setIsEnrollModalOpen(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre Completo *</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ej. García Pérez Juan"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">CURP (Opcional)</label>
                <input type="text" value={newCurp} onChange={e => setNewCurp(e.target.value.toUpperCase())} placeholder="18 caracteres" maxLength={18}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono uppercase" />
              </div>
              {/* Grupo: mostrar el del docente (no editable) */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-blue-600 font-bold text-sm">Grupo asignado:</span>
                <span className="text-blue-800 font-black text-sm">{teacherGroupName}</span>
              </div>

              {saveError && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{saveError}</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-gray-100 shrink-0">
              <button onClick={handleManualLink} disabled={!newName.trim() || isLinking || linkSuccess}
                className={`w-full flex items-center justify-center gap-3 text-white text-base font-bold rounded-2xl py-4 shadow-lg transition-all ${
                  !newName.trim()  ? 'bg-gray-200 text-gray-400 shadow-none' :
                  linkSuccess      ? 'bg-green-500 shadow-green-500/30' :
                  'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30 active:scale-95'
                }`}>
                {linkSuccess  ? <><CheckCircle2 className="w-5 h-5" /> Registrado y vinculado</> :
                 isLinking    ? <><Nfc className="w-5 h-5 animate-pulse" /> Acerca la tarjeta NFC...</> :
                                <><Nfc className="w-5 h-5" /> Vincular Tarjeta NFC</>}
              </button>
            </div>

            {/* NFC Overlay */}
            <AnimatePresence>
              {isLinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-md">
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="bg-purple-500 p-8 rounded-full shadow-[0_0_40px_rgba(168,85,247,0.6)]">
                    <Nfc className="w-20 h-20 text-white" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
