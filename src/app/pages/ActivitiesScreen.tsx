import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, ChevronRight, Search, Plus, Filter,
  FileText, Star, ClipboardList, CheckCircle2, User,
  ListTodo, Clock, LayoutGrid, List as ListIcon, X, MapPin, 
  Book, HeartHandshake, FileSpreadsheet, Nfc, Hand, 
  MoreHorizontal, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router';

// Tipos de datos mock
type CellStatus = 'A' | 'P' | 'B' | 'I' | 'E' | number; // Asistencia, Pendiente, Bien, Incompleto, Excelencia, o Numérica
type ActivityDetails = {
  id: string;
  name: string;
  date: string;
  observation?: string;
  status: CellStatus;
  type: 'registro' | 'participacion' | 'calificada';
};

// Campos Formativos Constants
const CAMPOS = [
  { id: 'lenguajes', name: 'Lenguajes', color: 'bg-orange-500', lightColor: 'bg-orange-100', textColor: 'text-orange-600', icon: BookOpen },
  { id: 'saberes', name: 'Saberes y Pensamiento', color: 'bg-blue-500', lightColor: 'bg-blue-100', textColor: 'text-blue-600', icon: FileText },
  { id: 'etica', name: 'Ética y Naturaleza', color: 'bg-purple-500', lightColor: 'bg-purple-100', textColor: 'text-purple-600', icon: MapPin },
  { id: 'comunitario', name: 'De lo Humano', color: 'bg-green-500', lightColor: 'bg-green-100', textColor: 'text-green-600', icon: HeartHandshake }
];

export function ActivitiesScreen() {
  const navigate = useNavigate();
  const [activeCampo, setActiveCampo] = useState('lenguajes');
  const [viewMode, setViewMode] = useState<'resumen' | 'detalle'>('detalle'); // Default to detalle para mostrar la nueva vista
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado para el popover de la celda
  const [selectedCell, setSelectedCell] = useState<{ studentId: number, activityId: string, rect: DOMRect, details: ActivityDetails } | null>(null);

  // New Activity State
  const [activityName, setActivityName] = useState('');
  const [activityType, setActivityType] = useState('registro'); // 'registro', 'participacion', 'calificada'

  const currentCampo = CAMPOS.find(c => c.id === activeCampo) || CAMPOS[0];
  const Icon = currentCampo.icon;

  // Mock Students & Progress
  const students = [
    { listNumber: 1, name: 'Isabela Martínez Solano', totalAct: 12, graded: 10, pending: 2, avg: 9.2, status: 'good' },
    { listNumber: 2, name: 'Valeria Santos López', totalAct: 12, graded: 6, pending: 6, avg: 7.5, status: 'warning' },
    { listNumber: 3, name: 'Tuliana Rey Gómez', totalAct: 12, graded: 11, pending: 1, avg: 8.8, status: 'good' },
    { listNumber: 4, name: 'Mariña Lierio Boscolaz', totalAct: 12, graded: 4, pending: 8, avg: 6.5, status: 'danger' },
    { listNumber: 5, name: 'Ennilia Damienjrm Veríbe', totalAct: 12, graded: 9, pending: 3, avg: 8.0, status: 'warning' },
    { listNumber: 6, name: 'Daniela Ruane Latúnez', totalAct: 12, graded: 12, pending: 0, avg: 9.5, status: 'good' },
    { listNumber: 7, name: 'Sebastián Ventèz Latúnez', totalAct: 12, graded: 5, pending: 7, avg: 6.0, status: 'danger' },
    { listNumber: 8, name: 'Sebastián Lieti Perez', totalAct: 12, graded: 8, pending: 4, avg: 7.2, status: 'warning' },
    { listNumber: 9, name: 'Eleazar Dannejen Veríbe', totalAct: 12, graded: 10, pending: 2, avg: 8.5, status: 'good' },
    { listNumber: 10, name: 'Dáña Ratáel Camerń', totalAct: 12, graded: 11, pending: 1, avg: 9.0, status: 'good' },
  ];

  // Mock Structure for Table Data
  const daysColumns = [
    { name: 'Lunes', actividades: [{ id: 'A1', label: 'A' }, { id: 'A2', label: '2' }] },
    { name: 'Martes', actividades: [{ id: 'A3', label: '3' }, { id: 'A4', label: '4' }] },
    { name: 'Miercoles', actividades: [{ id: 'A5', label: '5' }, { id: 'A6', label: '6' }] },
    { name: 'Jueves', actividades: [{ id: 'A7', label: '7' }, { id: 'A8', label: '8' }] },
    { name: 'Viernes', actividades: [{ id: 'A9', label: '9' }, { id: 'A10', label: '10' }] }
  ];

  // Random Data Generator Helper
  const getCellStatus = (studentListNum: number, actId: string): CellStatus => {
    const r = Math.random();
    if (r > 0.8) return 'P'; // Pendiente
    if (r > 0.7) return 'I'; // Incompleto
    return 'B'; // Bien (Check verde)
  }

  // Helper para generar detalles de actividad para el popover
  const getActivityDetails = (actId: string, status: CellStatus): ActivityDetails => ({
    id: actId,
    name: 'Lectura en voz alta',
    date: '11 Marzo',
    observation: status === 'B' ? 'Leyó con fluidez.' : undefined,
    status: status,
    type: 'registro'
  });

  const handleCellClick = (e: React.MouseEvent, studentId: number, activityId: string, status: CellStatus) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (selectedCell?.studentId === studentId && selectedCell?.activityId === activityId) {
      setSelectedCell(null); // Toggle off if clicked again
    } else {
      setSelectedCell({
        studentId,
        activityId,
        rect,
        details: getActivityDetails(activityId, status)
      });
    }
  };

  // Helper para renderizar iconos de estado
  const renderStatusIcon = (status: CellStatus) => {
    if (status === 'B') return <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center"><CheckCircle2 className="w-3.5 h-3.5" /></div>;
    if (status === 'P') return <div className="w-5 h-5 rounded-full bg-red-400 text-white flex items-center justify-center"><X className="w-3.5 h-3.5" /></div>;
    if (status === 'I') return <div className="w-5 h-5 rounded-full bg-yellow-400 text-white flex items-center justify-center"><Clock className="w-3.5 h-3.5" /></div>;
    return <span className="font-bold text-sm text-gray-700">{status}</span>;
  };

  const handleCreateAndCapture = () => {
    if (!activityName.trim()) return;

    // TODO: Create the activity in the database here

    // Navigate to the detail view of the new activity
    // For now we use a dummy ID 'new'
    navigate('/activity/new', {
      state: {
        activityName: activityName.trim(),
        campoName: currentCampo.name,
        campoColor: currentCampo.color,
        activityType: activityType
      }
    });
    
    // Close the modal
    setShowNewModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 absolute inset-0 overflow-hidden z-0">
      {/* Header Concentrado */}
      <div className={`${currentCampo.color} px-4 pt-6 pb-6 shadow-md z-10 shrink-0 relative transition-colors duration-500`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white font-bold text-xl">Acompáñame</h1>
            <p className="text-white/80 text-sm">Registro de Actividades</p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-lg">3° "A"</p>
            <p className="text-white/80 text-sm">Semana 24</p>
          </div>
        </div>

        {/* Campos Formativos Selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 snap-x">
          {CAMPOS.map((campo) => {
            const isActive = activeCampo === campo.id;
            return (
              <button
                key={campo.id}
                onClick={() => setActiveCampo(campo.id)}
                className={`snap-center whitespace-nowrap px-4 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
                  isActive 
                    ? 'bg-white text-gray-900 shadow-sm scale-100' 
                    : 'bg-white/20 text-white hover:bg-white/30 scale-95'
                }`}
              >
                <campo.icon className={`w-4 h-4 ${isActive ? campo.textColor : 'text-white'}`} />
                {campo.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toolbox Bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 shrink-0 flex items-center gap-3 shadow-sm z-10 relative">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Buscar alumno..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 active:bg-gray-200">
          <Filter className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setShowNewModal(true)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white active:scale-95 shadow-sm transition-colors ${currentCampo.color}`}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* View Toggle */}
      <div className="px-4 py-3 shrink-0 flex justify-center z-0">
        <div className="bg-gray-200/80 p-1 rounded-xl flex w-full max-w-sm">
          <button 
            onClick={() => setViewMode('resumen')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
              viewMode === 'resumen' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Resumen
          </button>
          <button 
            onClick={() => setViewMode('detalle')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
              viewMode === 'detalle' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ListIcon className="w-4 h-4" />
            Detalle
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 flex flex-col overflow-y-auto ${viewMode === 'detalle' ? 'px-0 pb-0 pt-2' : 'px-4 pb-4'} relative`} onClick={() => selectedCell && setSelectedCell(null)}>
        {viewMode === 'resumen' ? (
          <div className="space-y-3">
            {students.map((student, i) => (
              <motion.div 
                key={student.listNumber}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm shrink-0">
                    {student.listNumber}
                  </div>
                  <h3 className="font-bold text-gray-900 flex-1 truncate">{student.name}</h3>
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    student.status === 'good' ? 'bg-green-100 text-green-700' :
                    student.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {student.avg}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 rounded-xl p-2 text-center">
                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-0.5">Total</p>
                    <p className="text-gray-900 font-black text-sm">{student.totalAct}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-2 text-center">
                    <p className="text-green-600 text-[10px] uppercase font-bold mb-0.5">Calif.</p>
                    <p className="text-green-700 font-black text-sm">{student.graded}</p>
                  </div>
                  <div className={`${student.pending > 0 ? 'bg-red-50' : 'bg-gray-50'} rounded-xl p-2 text-center`}>
                    <p className={`${student.pending > 0 ? 'text-red-600' : 'text-gray-500'} text-[10px] uppercase font-bold mb-0.5`}>Pend.</p>
                    <p className={`${student.pending > 0 ? 'text-red-700' : 'text-gray-900'} font-black text-sm`}>{student.pending}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex-1 w-full relative overflow-x-auto overflow-y-auto no-scrollbar px-4 pb-0">
            <div className="w-max min-w-full bg-white rounded-t-3xl shadow-sm border border-gray-200 border-b-0 overflow-hidden min-h-[100%] flex flex-col">
              <table className="w-full border-collapse text-sm">
                <thead>
                  {/* First Header Row: Days */}
                  <tr>
                    <th className="sticky left-0 bg-white z-20 border-b border-r border-gray-200 p-4 min-w-[240px] text-left align-bottom shadow-[4px_0_12px_rgba(0,0,0,0.04)]">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Estudiantes</span>
                        <span className="text-slate-800 font-bold text-sm">Nombre Completo</span>
                      </div>
                    </th>
                    {daysColumns.map((day, i) => (
                      <th key={day.name} colSpan={day.actividades.length} className={`border-b border-r border-gray-200 p-3 text-center bg-slate-50 relative`}>
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                          i === 0 ? 'from-blue-400 to-indigo-500' :
                          i === 1 ? 'from-emerald-400 to-teal-500' :
                          i === 2 ? 'from-amber-400 to-orange-500' :
                          i === 3 ? 'from-rose-400 to-pink-500' : 'from-purple-400 to-fuchsia-500'
                        } opacity-80`}></div>
                        <span className="text-slate-700 font-black text-xs uppercase tracking-widest">{day.name}</span>
                      </th>
                    ))}
                    <th className="border-b border-gray-200 p-4 text-center text-slate-500 text-xs font-black uppercase tracking-widest bg-slate-50 min-w-[80px]">
                      Progreso
                    </th>
                  </tr>
                  {/* Second Header Row: Activity Numbers/Labels */}
                  <tr>
                    <th className="sticky left-0 bg-white z-20 border-b border-r border-gray-200 shadow-[4px_0_12px_rgba(0,0,0,0.04)]"></th>
                    {daysColumns.flatMap(day => day.actividades).map((act, i) => (
                      <th key={act.id} className="bg-white border-b border-r border-gray-100 p-2 text-center min-w-[4rem]">
                        <div className="flex flex-col gap-1 items-center">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[11px]">{act.id}</span>
                          <span className="text-[10px] text-slate-400 font-medium truncate w-14 px-1">{act.label}</span>
                        </div>
                      </th>
                    ))}
                    <th className="bg-slate-50 border-b border-gray-200"></th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {students.map((student, i) => (
                    <tr key={student.listNumber} className="group hover:bg-slate-50/80 transition-colors">
                      {/* Fixed Student Column */}
                      <td className="sticky left-0 bg-white z-10 border-b border-r border-gray-100 p-3 shadow-[4px_0_12px_rgba(0,0,0,0.02)] group-hover:bg-slate-50/80 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 font-bold text-xs w-4 text-center">{student.listNumber}</span>
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 relative shadow-sm">
                            {/* Dummy avatars based on index */}
                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${student.name}&backgroundColor=f1f5f9`} alt="avatar" className="w-full h-full object-cover" />
                            {student.status === 'danger' && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>}
                            {student.status === 'warning' && <div className="absolute top-0 right-0 w-3 h-3 bg-orange-500 border-2 border-white rounded-full"></div>}
                            {student.status === 'good' && <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                          </div>
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="text-sm font-bold text-slate-800 truncate">{student.name.split(' ')[0]} {student.name.split(' ')[1] || ''}</span>
                            <span className="text-[10px] text-slate-400 font-medium truncate">{student.name.split(' ').slice(2).join(' ')}</span>
                          </div>
                        </div>
                      </td>

                      {/* Scrollable Data Cells */}
                      {daysColumns.flatMap(day => day.actividades).map((act, colIndex) => {
                        // Generate deterministic pseudo-random status
                        const status = getCellStatus(student.listNumber, act.id);
                        const isSelected = selectedCell?.studentId === student.listNumber && selectedCell?.activityId === act.id;
                        
                        return (
                          <td 
                            key={`${student.listNumber}-${act.id}`} 
                            className={`border-b border-r border-gray-100 p-1.5 text-center cursor-pointer transition-all ${isSelected ? 'bg-blue-50 ring-2 ring-blue-500 relative z-10 scale-105 shadow-md rounded-md' : 'bg-transparent hover:bg-slate-100/50'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCellClick(e, student.listNumber, act.id, status);
                            }}
                          >
                            <div className="flex items-center justify-center h-10 w-full">
                              {renderStatusIcon(status)}
                            </div>
                          </td>
                        );
                      })}
                      <td className="border-b border-gray-100 p-3 text-center bg-slate-50/50 group-hover:bg-slate-100/50 transition-colors">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-slate-800 font-bold text-sm tracking-tight">{Math.floor(Math.random() * 5) + 5}<span className="text-slate-400 text-xs font-medium">/{student.totalAct}</span></span>
                          <span className="text-xs font-black text-emerald-600 mt-0.5 bg-emerald-100 px-2 rounded-md">{student.avg}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Popover/Tooltip Portal (Simulated relative to absolute container) */}
            <AnimatePresence>
              {selectedCell && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  style={{
                    position: 'fixed',
                    top: Math.min(selectedCell.rect.bottom + 10, window.innerHeight - 200),
                    // Intenta centrarlo, pero no salir de la pantalla
                    left: Math.max(16, Math.min(selectedCell.rect.left - 100, window.innerWidth - 240)),
                    zIndex: 50
                  }}
                  className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-gray-100 w-60 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <BookOpen className="w-4 h-4 text-white" />
                       <span className="text-white font-bold text-sm truncate">{selectedCell.details.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-200" />
                  </div>
                  <div className="p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10 bg-[#FFFDF8]">
                    <div className="flex flex-col gap-3">
                      <div>
                        <span className="text-gray-900 font-bold text-sm">{selectedCell.details.date}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                          <span className="text-gray-600 text-xs text-left">Leer: Cuento corto</span>
                        </div>
                      </div>
                      
                      {selectedCell.details.observation && (
                        <div>
                          <span className="text-gray-500 font-bold text-xs uppercase">Observación:</span>
                          <div className="flex items-start gap-1.5 mt-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-gray-700 text-xs italic">"{selectedCell.details.observation}"</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-200/50">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-gray-900 font-bold text-sm">Entregado</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300">...</span>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal "Nueva Actividad" */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNewModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl z-50 overflow-hidden shadow-2xl h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col"
            >
              <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                <h2 className="text-xl font-bold text-gray-900">Nueva Actividad</h2>
                <button 
                  onClick={() => setShowNewModal(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-white">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de la actividad</label>
                  <input 
                    type="text" 
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    placeholder="Ej. Lectura de comprensión" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Campo Formativo</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CAMPOS.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => setActiveCampo(c.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${activeCampo === c.id ? `border-${c.color.split('-')[1]}-500 ${c.lightColor} ${c.textColor}` : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
                        <c.icon className="w-4 h-4" />
                        <span className="text-xs font-bold">{c.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Registro</label>
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setActivityType('registro')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activityType === 'registro' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-gray-200/50'}`}
                    >
                      Solo registro
                    </button>
                    <button 
                      onClick={() => setActivityType('participacion')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activityType === 'participacion' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-gray-200/50'}`}
                    >
                      Participación
                    </button>
                    <button 
                      onClick={() => setActivityType('calificada')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activityType === 'calificada' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-gray-200/50'}`}
                    >
                      Calificada
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border-t border-gray-100 shrink-0">
                <button 
                  onClick={handleCreateAndCapture}
                  disabled={!activityName.trim()}
                  className={`w-full font-bold text-lg py-4 rounded-2xl transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                    activityName.trim() ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' : 'bg-gray-200 text-gray-400 shadow-none'
                  }`}
                >
                  <span>Crear Actividad</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}