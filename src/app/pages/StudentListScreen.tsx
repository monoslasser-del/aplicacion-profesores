import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  User, 
  CalendarDays, 
  BookOpen, 
  ChevronRight,
  MoreVertical,
  X,
  CheckCircle2,
  XCircle,
  UserPlus,
  Hash,
  Nfc
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { pdfGenerator } from '../../lib/pdfGenerator';
import { CapacitorNfc } from '@capgo/capacitor-nfc';
import { studentService } from '../../services/studentService';

// Define the Student type
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  status: 'present' | 'absent' | 'late';
  curp: string;
  isRepetidor?: boolean;
}

// Mock students with CURPs (mix of ages 8, 9, 10, H/M)
const MOCK_STUDENTS: Student[] = [
  { id: '1', firstName: 'Isabela', lastName: 'Martínez Solano', status: 'present', curp: 'MASI150210MXXXXX01', isRepetidor: false }, // ~11
  { id: '2', firstName: 'Valeria', lastName: 'Santos López', status: 'absent', curp: 'SALV160520MXXXXX02', isRepetidor: false }, // ~10
  { id: '3', firstName: 'Ricardo', lastName: 'Hernández Rivera', status: 'present', curp: 'HERR160115HXXXXX03', isRepetidor: true }, // ~10 Repeater
  { id: '4', firstName: 'Sofía', lastName: 'Álvarez Gómez', status: 'present', curp: 'ALGS151001MXXXXX04', isRepetidor: false }, // ~10 (casi 11)
  { id: '5', firstName: 'Mateo', lastName: 'López Ruiz', status: 'late', curp: 'LORM140810HXXXXX05', isRepetidor: false }, // ~12
  { id: '6', firstName: 'Camila', lastName: 'García Pérez', status: 'present', curp: 'GAPC160910MXXXXX06', isRepetidor: false }, // ~9
  { id: '7', firstName: 'Sebastián', lastName: 'Díaz Romero', status: 'absent', curp: 'DIRS170110HXXXXX07', isRepetidor: false }, // ~9
  { id: '8', firstName: 'Valentina', lastName: 'Torres Méndez', status: 'present', curp: 'TOMV160410MXXXXX08', isRepetidor: true }, // ~10 Repeater
];

export function StudentListScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [studentsList, setStudentsList] = useState<Student[]>(MOCK_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  React.useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await studentService.getStudents();
        const mappedData: Student[] = data.map(s => {
          const parts = s.name.split(' ');
          const fn = parts[0] || '';
          const ln = parts.slice(1).join(' ') || '';
          return {
            id: s.id?.toString() || '',
            firstName: fn,
            lastName: ln,
            curp: s.curp,
            status: 'present'
          };
        });
        setStudentsList(mappedData);
      } catch(e) {
        console.error('Failed to parse students list from backend', e);
      }
    };
    fetchStudents();
  }, []);

  // Manual Enrollment Modal State
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('1A');
  const [newCurp, setNewCurp] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [success, setSuccess] = useState(false);

  // Manual NFC Link Handler
  const handleManualLink = async () => {
    if (!newName.trim()) return;
    setIsLinking(true);
    
    try {
      await CapacitorNfc.startScanning();
      
      const listener = await CapacitorNfc.addListener('nfcEvent', async (event: any) => {
        const tagData = event.tag || event;
        const uid = tagData.id ? Array.from(tagData.id).map((i: any) => i.toString(16).padStart(2, '0')).join(':') : 'unknown-uid';
        console.log('Linked Tag UID (Manual):', uid);
        
        try {
          await studentService.createStudent({
            name: newName.trim(),
            curp: newCurp.trim(),
            nfc_tag: uid,
            group_id: newGroup, // Opcional, dependiendo si el usuario capturó el ID real
          });
        } catch (dbError) {
          console.error("Error saving student to DB:", dbError);
        }
        
        setIsLinking(false);
        setSuccess(true);
        CapacitorNfc.stopScanning();
        listener.remove();

        setTimeout(() => {
          setSuccess(false);
          setNewName('');
          setNewGroup('1A');
          setNewCurp('');
          setIsEnrollModalOpen(false);
        }, 2000);
      });
    } catch (error) {
      alert("Error iniciando NFC o tu dispositivo no lo soporta: " + JSON.stringify(error));
      setIsLinking(false);
    }
  };

  // Sort by last name and filter by search query
  const filteredAndSortedStudents = useMemo(() => {
    return studentsList
      .filter(student => {
        const fullName = `${student.lastName} ${student.firstName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [searchQuery, studentsList]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'late':
        return <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-white text-[10px] font-bold">R</div>;
      default:
        return null;
    }
  };

  const handleDownload911 = () => {
    // Adapter to match expected shape
    const statsInput = studentsList.map(s => ({
      name: `${s.lastName} ${s.firstName}`,
      curp: s.curp,
      isRepetidor: s.isRepetidor
    }));
    pdfGenerator.generate911ReportPDF(statsInput);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 absolute inset-0 overflow-hidden">
      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white px-4 pt-6 pb-4 shadow-sm z-10 shrink-0"
      >
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center active:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-800" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Lista del Grupo</h1>
          </div>
          
          <button 
            onClick={() => setIsEnrollModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-purple-100 text-purple-700 hover:bg-purple-200 active:bg-purple-300 px-3 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Alumno
          </button>
        </div>

        <button 
          onClick={handleDownload911}
          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 mb-4 transition-colors shadow-sm border border-blue-100"
        >
          📄 Descargar Formato 911 (PDF)
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar alumno por apellidos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </motion.div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3 pb-24">
          <AnimatePresence>
            {filteredAndSortedStudents.map((student, i) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                onClick={() => setSelectedStudent(student)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer active:scale-98 transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0 border border-blue-50">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-bold text-base truncate">
                    {student.lastName}
                  </h3>
                  <p className="text-gray-500 text-sm truncate">
                    {student.firstName}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusIcon(student.status)}
                  <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 active:bg-gray-100">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredAndSortedStudents.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No se encontraron alumnos</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Action Bottom Sheet */}
      <AnimatePresence>
        {selectedStudent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-black/40 z-40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 overflow-hidden shadow-2xl pb-6"
            >
              <div className="p-6">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 leading-tight">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </h2>
                      <p className="text-gray-500 text-sm">Opciones del alumno</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedStudent(null)}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center active:bg-gray-200"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => navigate(`/student/${selectedStudent.id}`)}
                    className="w-full bg-gray-50 hover:bg-gray-100 flex items-center gap-4 p-4 rounded-2xl transition-colors active:scale-[0.98]"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-gray-900 font-bold text-sm">Ver Perfil Completo</h3>
                      <p className="text-gray-500 text-xs mt-0.5">Historial, datos y gráficas</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>

                  <button className="w-full bg-blue-50 hover:bg-blue-100 flex items-center gap-4 p-4 rounded-2xl transition-colors active:scale-[0.98]">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                      <CalendarDays className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-blue-900 font-bold text-sm">Asistencias con Calendario</h3>
                      <p className="text-blue-600/70 text-xs mt-0.5">Revisar reporte de faltas</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-blue-400" />
                  </button>

                  <button className="w-full bg-purple-50 hover:bg-purple-100 flex items-center gap-4 p-4 rounded-2xl transition-colors active:scale-[0.98]">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-purple-900 font-bold text-sm">Registro de Trabajos</h3>
                      <p className="text-purple-600/70 text-xs mt-0.5">Por campos formativos</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-purple-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Manual Enrollment Full Screen Modal */}
      <AnimatePresence>
        {isEnrollModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute inset-0 z-50 bg-white flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-4 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nuevo Estudiante</h1>
                <p className="text-gray-500 text-sm">Registro manual y tarjeta NFC</p>
              </div>
              <button 
                onClick={() => !isLinking && setIsEnrollModalOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-gray-400" /> Nombre Completo
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">CURP (Opcional para 911)</label>
                <input
                  type="text"
                  value={newCurp}
                  onChange={(e) => setNewCurp(e.target.value.toUpperCase())}
                  placeholder="18 caracteres"
                  maxLength={18}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-400" /> Grupo Asignado
                </label>
                <select
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  className="appearance-none w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="1A">1° A</option>
                  <option value="1B">1° B</option>
                  <option value="2A">2° A</option>
                </select>
              </div>
            </div>

            {/* Bottom Sticky Action */}
            <div className="p-6 bg-white border-t border-gray-100 shrink-0">
              <button
                onClick={handleManualLink}
                disabled={!newName.trim() || isLinking || success}
                className={`w-full flex items-center justify-center gap-3 text-white text-lg font-bold rounded-2xl py-4 shadow-lg transition-all ${
                  !newName.trim() ? 'bg-gray-200 text-gray-400 shadow-none' : 
                  success ? 'bg-green-500 shadow-green-500/30' : 
                  'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30 active:scale-95'
                }`}
              >
                {success ? (
                  <> <CheckCircle2 className="w-6 h-6" /> Registrado & Vinculado </>
                ) : isLinking ? (
                  <> <Nfc className="w-6 h-6 animate-pulse" /> Acerca Tarjeta NFC </>
                ) : (
                  <> <Nfc className="w-6 h-6" /> Vincular Tarjeta </>
                )}
              </button>
            </div>

            {/* Fullscreen Linking Overlay */}
            <AnimatePresence>
              {isLinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-md"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-purple-500 p-8 rounded-full shadow-[0_0_40px_rgba(168,85,247,0.6)]"
                  >
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
