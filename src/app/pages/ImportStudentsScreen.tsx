import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Wifi, 
  CheckCircle2, 
  RefreshCcw, 
  ChevronLeft,
  Search,
  Users,
  Save,
  Loader,
  AlertTriangle
} from 'lucide-react';
import { hardwareServices } from '../../utils/hardwareServices';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';

// Detects column name flexibly
function findCol(headers: string[], variants: string[]): string | undefined {
  return headers.find(h => variants.some(v => h.trim().toLowerCase() === v.toLowerCase()));
}

interface StudentRow { id?: number | string; nl: number; name: string; curp: string; hasNfc: boolean; isRepetidor: boolean; }

export function ImportStudentsScreen() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const [fileName, setFileName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // NFC Modal State
  const [scanningStudent, setScanningStudent] = useState<string | null>(null);

  // Cargar alumnos existentes del servidor al montar
  useEffect(() => {
    studentService.getStudents()
      .then(data => {
        setStudents(data.map((s: any, i: number) => ({
          id: s.id,
          nl: i + 1,
          name: s.name,
          curp: s.curp ?? '',
          hasNfc: !!s.nfc_tag,
          isRepetidor: false,
        })));
      })
      .catch(err => console.error('Error cargando alumnos:', err));
  }, []);

  // Filter
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nl.toString().includes(searchQuery)
  );

  // --- Lectura de Excel con ArrayBuffer (compatible con Chrome/Edge modernos) ---
  const processFile = useCallback((file: File) => {
    setFeedback(null);
    const reader = new FileReader();
    reader.onerror = () => setFeedback({ ok: false, msg: 'No se pudo leer el archivo.' });
    reader.onload = (evt) => {
      try {
        const buf = evt.target?.result as ArrayBuffer;
        const wb = XLSX.read(new Uint8Array(buf), { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (!rows.length) { setFeedback({ ok: false, msg: 'El archivo está vacío.' }); return; }
        const headers = Object.keys(rows[0]);
        const nombreKey = findCol(headers, ['Nombre', 'nombre', 'NOMBRE', 'name', 'Name', 'Alumno', 'ALUMNO', 'Nombre Completo']);
        const curpKey   = findCol(headers, ['CURP', 'curp', 'Curp', 'Clave']);
        if (!nombreKey) {
          setFeedback({ ok: false, msg: `Columnas detectadas: ${headers.join(', ')}. Renombra la de nombre a "Nombre".` });
          return;
        }
        const parsed: StudentRow[] = rows
          .map((r: any, i: number) => ({
            nl: i + 1,
            name: r[nombreKey]?.toString().trim() ?? '',
            curp: curpKey ? r[curpKey]?.toString().trim().toUpperCase() : '',
            hasNfc: false,
            isRepetidor: false,
          }))
          .filter(r => r.name.length > 0);
        if (!parsed.length) { setFeedback({ ok: false, msg: 'No se encontraron filas con nombre válido.' }); return; }
        setStudents(parsed);
        setHasFile(true);
        setFileName(file.name);
        setFeedback({ ok: true, msg: `${parsed.length} alumno(s) leídos del archivo. Revisa y presiona "Guardar Lista".` });
      } catch (e: any) {
        setFeedback({ ok: false, msg: `Error al leer el archivo: ${e?.message}` });
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
    e.target.value = '';
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  // --- Guardar Lista al servidor ---
  const handleSaveList = async () => {
    const toSave = students.filter(s => s.name);
    if (!toSave.length) return;
    setSaving(true);
    setFeedback(null);
    try {
      const token = localStorage.getItem('auth_token');
      const baseUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ?? 'https://tech.ecteam.mx/api';
      const res = await fetch(`${baseUrl}/v1/students/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ students: toSave.map(s => ({ name: s.name, curp: s.curp || null, is_repetidor: s.isRepetidor })) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? `Error ${res.status}`);
      setFeedback({ ok: true, msg: `✅ ${json.inserted} guardados, ${json.skipped} ya existían.` });
      // Refrescar con IDs reales
      const updated = await studentService.getStudents();
      setStudents(updated.map((s: any, i: number) => ({
        id: s.id, nl: i + 1, name: s.name, curp: s.curp ?? '', hasNfc: !!s.nfc_tag, isRepetidor: false,
      })));
    } catch (e: any) {
      setFeedback({ ok: false, msg: e.message ?? 'Error al guardar.' });
    } finally {
      setSaving(false);
    }
  };

  // NFC Binding Flow
  const startNfcScan = async (studentId: string | number) => {
    setScanningStudent(String(studentId));
    try {
      const tagData = await hardwareServices.initNfcListener();
      if (tagData) {
        await hardwareServices.vibrateSuccess();
        // Asignar NFC tag en el backend si el alumno tiene ID real
        const uid = tagData.id
          ? Array.from(tagData.id as number[]).map((i: number) => i.toString(16).padStart(2, '0')).join(':')
          : String(Math.random());
        const student = students.find(s => String(s.id) === String(studentId));
        if (student?.id) {
          try { await studentService.assignNfc(student.id, uid); } catch (_) {}
        }
        setStudents(prev => prev.map(s => String(s.id) === String(studentId) ? { ...s, hasNfc: true } : s));
        setScanningStudent(null);
      }
    } catch (error: any) {
      console.warn('NFC Error:', error);
      if (!error?.message?.includes('Unimplemented')) setScanningStudent(null);
    }
  };

  const mockFinishScanWeb = () => {
    if (scanningStudent) {
      setStudents(prev => prev.map(s => String(s.id) === scanningStudent ? { ...s, hasNfc: true } : s));
      setScanningStudent(null);
    }
  };

  const toggleRepeater = (studentId: string | number) => {
    setStudents(prev => prev.map(s => String(s.id) === String(studentId) ? { ...s, isRepetidor: !s.isRepetidor } : s));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 absolute inset-0 overflow-hidden relative">
      
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-100 shadow-sm relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800">Importar Grupo</h1>
            <p className="text-xs font-semibold text-slate-400 capitalize">Subir y Vincular Tarjetas</p>
          </div>
        </div>
        {/* Botón Guardar Lista */}
        <button
          onClick={handleSaveList}
          disabled={saving || students.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-md ${
            saving || students.length === 0
              ? 'bg-slate-100 text-slate-400 shadow-none'
              : 'bg-blue-600 text-white shadow-blue-500/30 hover:bg-blue-700'
          }`}
        >
          {saving
            ? <Loader className="w-4 h-4 animate-spin" />
            : <Save className="w-4 h-4" />}
          {saving ? 'Guardando...' : 'Guardar Lista'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
        
        {/* Feedback */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 px-4 py-3 rounded-2xl text-sm font-semibold ${
              feedback.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {feedback.ok ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
            <span>{feedback.msg}</span>
          </motion.div>
        )}

        {/* Step 1: Upload Area */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">1</span>
            <h2 className="text-sm font-bold tracking-widest text-slate-500 uppercase">Cargar Excel</h2>
          </div>
          
          <label 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-3xl cursor-pointer transition-all overflow-hidden
              ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-slate-300 bg-white hover:bg-slate-50'}
              ${hasFile ? 'border-green-400 bg-green-50' : ''}
            `}
          >
            <input 
              type="file" 
              className="hidden" 
              accept=".xlsx,.xls,.csv" 
              onChange={handleFileInput}
            />
            {hasFile ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                <FileSpreadsheet className="w-10 h-10 text-green-500 mb-2" />
                <p className="text-sm font-bold text-slate-700">{fileName || 'Archivo Listo (.xlsx)'}</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">Clic para reemplazar</p>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center text-center px-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700">
                  <span className="text-blue-600">Sube un archivo</span> o arrástralo aquí
                </p>
                <p className="text-xs font-semibold text-slate-400 mt-1">.xlsx, .xls, .csv — columna "Nombre" requerida</p>
              </div>
            )}
            {isDragging && (
               <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full scale-150 animate-pulse"></div>
            )}
          </label>
        </section>

        {/* Divider */}
        <div className="h-px bg-slate-200/60 w-full" />

        {/* Step 2: Student List & NFC Binding */}
        <section className="space-y-4 pb-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">2</span>
              <h2 className="text-sm font-bold tracking-widest text-slate-500 uppercase">Vincular Tarjetas</h2>
            </div>
            {hasFile && (
              <div className="flex items-center gap-1.5 bg-blue-100 px-3 py-1 rounded-full text-blue-700">
                <Users className="w-4 h-4" />
                <span className="text-xs font-bold">{students.length} alumnos</span>
              </div>
            )}
          </div>

          {/* Search bar */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Buscar alumno..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-slate-200/60 rounded-2xl pl-12 pr-4 py-3 font-medium text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            />
          </div>

          {/* Table / List View */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            
            {/* Table Header - Hidden on very small screens, shown as columns otherwise */}
            <div className="grid grid-cols-[3rem_1fr_auto] gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50 font-bold text-xs text-slate-500 uppercase tracking-widest leading-none">
              <div>NL</div>
              <div>Alumno / CURP</div>
              <div className="text-right pr-2">NFC</div>
            </div>

            {/* List Body */}
            <div className="divide-y divide-slate-100/80">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, idx) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={student.id ?? `nl-${student.nl}-${idx}`}
                    className="grid grid-cols-[3rem_1fr_auto] items-center gap-2 p-4 transition-colors hover:bg-slate-50/50"
                  >
                    {/* NL */}
                    <div className="font-extrabold text-slate-400 text-base">
                      {student.nl.toString().padStart(2, '0')}
                    </div>
                    
                    {/* INFO */}
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-800 text-sm truncate">{student.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-slate-400 font-medium truncate">{student.curp}</p>
                        {/* Repeater Toggle Badge — toca para cambiar estado */}
                        <button 
                          onClick={() => toggleRepeater(student.id ?? student.nl)}
                          title="Toca para cambiar: Nuevo Ingreso o Repetidor"
                          className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg transition-all active:scale-95 border-2 ${
                            student.isRepetidor 
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-400' 
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-300'
                          }`}
                        >
                          {student.isRepetidor ? '↩ Repetidor' : '✦ N. Ingreso'}
                        </button>
                      </div>
                    </div>

                    {/* NFC ACTION */}
                    <div className="flex items-center justify-end shrink-0">
                      {student.hasNfc ? (
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Vinculado
                          </span>
                          <button 
                            onClick={() => student.id != null && startNfcScan(student.id)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-blue-600 transition-colors pr-1"
                          >
                            <RefreshCcw className="w-3 h-3" />
                            Reasignar
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => student.id != null && startNfcScan(student.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 rounded-2xl px-4 py-2.5 flex items-center justify-center gap-2 transition-transform active:scale-95"
                        >
                          <Wifi className="w-4 h-4" />
                          <span className="font-bold text-xs uppercase tracking-wide">Vincular</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-3">
                    <Search className="w-8 h-8" />
                  </div>
                  <p className="font-bold text-slate-500">No hay alumnos</p>
                  <p className="text-xs font-medium text-slate-400 mt-1">Intenta con otra búsqueda o sube un archivo.</p>
                </div>
              )}
            </div>

          </div>
        </section>
      </div>

      {/* --- NFC SCANNING MODAL --- */}
      <AnimatePresence>
        {scanningStudent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm sm:items-center sm:justify-center"
          >
            {/* Modal Content */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 w-full max-w-sm flex flex-col items-center shadow-2xl relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mt-20 -mr-20"></div>

              <div className="w-16 h-1.5 bg-slate-200 rounded-full mb-8 relative z-10" />
              
              <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
                {/* Ripples */}
                <span className="absolute w-full h-full bg-blue-100 rounded-full animate-ping opacity-75"></span>
                <span className="absolute w-24 h-24 bg-blue-200 rounded-full animate-ping opacity-50 animation-delay-500"></span>
                {/* Center Icon */}
                <div className="relative w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 z-10">
                  <Wifi className="w-10 h-10 text-white" />
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-800 text-center mb-2 relative z-10">Acerca la Tarjeta</h3>
              <p className="text-slate-500 text-center font-medium leading-relaxed mb-8 relative z-10">
                Mantén la tarjeta NFC de<br/>
                <span className="text-blue-600 font-bold whitespace-nowrap px-1">
                  {students.find(s => s.id === scanningStudent)?.name.split(',')[0]}
                </span><br/>
                junto al reverso del celular.
              </p>

              <div className="w-full flex gap-3 relative z-10">
                <button 
                  onClick={() => setScanningStudent(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
                {/* Mock completion for Web Demo */}
                <button 
                  onClick={mockFinishScanWeb}
                  className="flex-[0.5] bg-blue-50 text-blue-600 font-bold py-4 rounded-2xl hover:bg-blue-100 transition-colors hidden md:block"
                >
                  Simular ✅
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
