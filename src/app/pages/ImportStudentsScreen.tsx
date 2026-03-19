import React, { useState } from 'react';
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
  Users
} from 'lucide-react';
import { hardwareServices } from '../../utils/hardwareServices';

// --- MOCK DATA FOR NOW ---
const MOCK_STUDENTS = [
  { id: '1', nl: 1, name: 'Aguilar Martínez, Carlos', curp: 'AUMC123456...', hasNfc: false, isRepetidor: false },
  { id: '2', nl: 2, name: 'Bautista Pérez, Sofía', curp: 'BAPS123456...', hasNfc: true, isRepetidor: false },
  { id: '3', nl: 3, name: 'Cortés Ruiz, Diego', curp: 'CORD123456...', hasNfc: false, isRepetidor: false },
  { id: '4', nl: 4, name: 'Domínguez Silva, Ana', curp: 'DOSA123456...', hasNfc: false, isRepetidor: false },
  { id: '5', nl: 5, name: 'Estrada Torres, Luis', curp: 'ESTL123456...', hasNfc: true, isRepetidor: false },
];

export function ImportStudentsScreen() {
  const navigate = useNavigate();
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [isDragging, setIsDragging] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // NFC Modal State
  const [scanningStudent, setScanningStudent] = useState<string | null>(null);

  // Filter logic
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nl.toString().includes(searchQuery)
  );

  // File Upload Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // TODO: Integrate xlsx parsing here
    setHasFile(true);
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // TODO: Integrate xlsx parsing here
      setHasFile(true);
    }
  };

  // NFC Binding Flow
  const startNfcScan = async (studentId: string) => {
    setScanningStudent(studentId);
    
    try {
      const tagId = await hardwareServices.initNfcListener();
      
      if (tagId) {
        // Success
        await hardwareServices.vibrateSuccess();
        
        // Update mock state
        setStudents(prev => prev.map(s => 
          s.id === studentId ? { ...s, hasNfc: true } : s
        ));
        setScanningStudent(null);
      }
    } catch (error: any) {
      console.warn("NFC Error (Likely web environment):", error);
      // On the web, it throws "Unimplemented". We catch it and DO NOT close the modal
      // so the user can use the "Simular ✅" button.
      if (error?.message?.includes("Unimplemented")) {
         console.log("Manteniendo modal abierto para simulación en Web.");
      } else {
         setScanningStudent(null);
      }
    }
  };

  // MOCK function to dismiss during testing locally on web without Capacitor
  const mockFinishScanWeb = () => {
    if (scanningStudent) {
      setStudents(prev => prev.map(s => 
        s.id === scanningStudent ? { ...s, hasNfc: true } : s
      ));
      setScanningStudent(null);
    }
  };

  // Toggle Repeater Student
  const toggleRepeater = (studentId: string) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, isRepetidor: !s.isRepetidor } : s
    ));
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
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
        
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
              accept=".xlsx,.csv" 
              onChange={handleFileInput}
            />
            {hasFile ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                <FileSpreadsheet className="w-10 h-10 text-green-500 mb-2" />
                <p className="text-sm font-bold text-slate-700">Archivo Listo (.xlsx)</p>
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
                <p className="text-xs font-semibold text-slate-400 mt-1">.xlsx, .csv (Máx. 5MB)</p>
              </div>
            )}
            
            {/* Background animated blob to make it look active during drag */}
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
                filteredStudents.map((student) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={student.id} 
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
                        {/* Repeater Toggle Badge */}
                        <button 
                          onClick={() => toggleRepeater(student.id)}
                          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md transition-colors ${
                            student.isRepetidor 
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {student.isRepetidor ? 'Repetidor' : 'N. Ingreso'}
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
                            onClick={() => startNfcScan(student.id)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-blue-600 transition-colors pr-1"
                          >
                            <RefreshCcw className="w-3 h-3" />
                            Reasignar
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => startNfcScan(student.id)}
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
