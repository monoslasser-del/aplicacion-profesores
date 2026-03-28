import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, ChevronRight, Search, Plus, Filter,
  FileText, Star, ClipboardList, CheckCircle2, User,
  ListTodo, Clock, LayoutGrid, List as ListIcon, X, MapPin, 
  Book, HeartHandshake, FileSpreadsheet, Nfc, Hand, 
  MoreHorizontal, Eye, ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { activityService } from '../../services/activityService';
import { authService } from '../../services/authService';
import { useFormativeFields } from '../../hooks/useFormativeFields';
import { gradeStatsService } from '../../services/gradeStatsService';
import * as XLSX from 'xlsx';

// Tipos de datos mock
type CellStatus = 'A' | 'P' | 'B' | 'I' | 'E' | '-' | number; // Asistencia, Pendiente, Bien, Incompleto, Excelencia, sin calificar, o Numérica
type ActivityDetails = {
  id: string;
  name: string;
  date: string;
  observation?: string;
  status: CellStatus;
  type: 'registro' | 'participacion' | 'calificada';
};

// Campos Formativos Constants

export function RecordsView() {
  const navigate = useNavigate();
  const [activeCampo, setActiveCampo] = useState('lenguajes');
  const [viewMode, setViewMode] = useState<'resumen' | 'detalle'>('detalle'); // Default to detalle para mostrar la nueva vista
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado para el popover de la celda
  const [selectedCell, setSelectedCell] = useState<{ studentId: number, activityId: string, rect: DOMRect, details: ActivityDetails } | null>(null);

  const { fields, getIcon } = useFormativeFields();

  const currentCampo = fields.find(c => c.slug === activeCampo) || fields[0] || { name: 'Lenguajes', icon: 'BookOpen' };
  const Icon = getIcon(currentCampo.icon);

  // State for Real Data
  const [students, setStudents] = useState<any[]>([]);
  const [dbActivities, setDbActivities] = useState<any[]>([]);

  // Fetch from DB
  React.useEffect(() => {
    // Carga paralela: alumnos + calificaciones reales + actividades
    Promise.all([
      import('../../services/studentService').then(m => m.studentService.getStudents()),
      gradeStatsService.getGroupStats().catch(() => null),
      activityService.getActivities(),
    ]).then(([studentsData, gradeStats, activitiesData]) => {
      // Mapa rápido: student_id → stats reales
      const statsMap = new Map(
        (gradeStats?.by_student ?? []).map(s => [s.student_id, s])
      );

      setStudents(studentsData.map((s: any, index: number) => {
        const real = statsMap.get(s.id);
        const totalAct = (gradeStats?.total_graded ?? 0) + (gradeStats?.total_pending ?? 0) > 0
          ? activitiesData.length
          : 12;
        return {
          id: s.id,
          listNumber: index + 1,
          name: s.name,
          totalAct,
          graded:  real?.graded  ?? 0,
          pending: real?.pending ?? totalAct,
          avg:     real?.avg     ?? null,   // null = sin calificaciones aún
          status: real?.avg == null ? 'neutral'
               : real.avg >= 8  ? 'good'
               : real.avg >= 6  ? 'warning'
               : 'danger',
        };
      }));

      setDbActivities(activitiesData);
    });
  }, []);

  // Filter activities by active Campo (handle both slug and Name)
  const currentCampoName = currentCampo.name.toLowerCase();
  const currentCampoSlug = (currentCampo.slug || activeCampo).toLowerCase();
  const filteredActivities = dbActivities.filter(a => {
    const subj = (a.subject || '').toLowerCase();
    return subj === currentCampoSlug || subj === currentCampoName;
  });
  
  // Group activities dynamically for the table header
  const daysColumns = filteredActivities.length > 0 ? [
    { 
      name: 'Actividades NEM', 
      actividades: filteredActivities.map(a => ({ id: String(a.id), label: a.title.substring(0, 10) })) 
    }
  ] : [
    { name: 'Sin Actividades', actividades: [{ id: '-', label: 'N/A' }] }
  ];

  // Real Data Generator Helper
  const getCellStatus = (studentId: number, actId: string): CellStatus => {
    const act = dbActivities.find(a => String(a.id) === actId);
    if (!act) return '-';
    const grades = act.grades || [];
    const grade = grades.find((g: any) => String(g.student_id) === String(studentId));
    if (!grade) return '-';

    if (act.type === 'calificada') {
      if (act.evaluation_scale === 'numeric') return grade.score ? Math.round(grade.score) : '-';
      if (act.evaluation_scale === 'levels') {
        if (grade.level === 'Logrado') return 'B';
        if (grade.level === 'En Proceso') return 'I';
        if (grade.level === 'Requiere Apoyo') return 'P';
        return grade.level ? grade.level as CellStatus : '-';
      }
    }
    if (grade.status === 'yes') return 'B';
    if (grade.status === 'no') return 'P';
    return '-';
  }

  // Helper para generar detalles de actividad para el popover
  const getActivityDetails = (studentId: number, actId: string): ActivityDetails => {
    const act = dbActivities.find(a => String(a.id) === actId);
    const grade = (act?.grades || []).find((g: any) => String(g.student_id) === String(studentId));
    
    return {
      id: actId,
      name: act?.title || 'Actividad desconocida',
      date: new Date(act?.due_date || act?.created_at || new Date()).toLocaleDateString(),
      observation: grade?.comments || '',
      status: getCellStatus(studentId, actId),
      type: act?.type || 'registro'
    };
  };

  const handleCellClick = (e: React.MouseEvent, studentId: number, activityId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (selectedCell?.studentId === studentId && selectedCell?.activityId === activityId) {
      setSelectedCell(null); // Toggle off if clicked again
    } else {
      setSelectedCell({
        studentId,
        activityId,
        rect,
        details: getActivityDetails(studentId, activityId)
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

  const exportToExcel = () => {
    // 1. Prepare Data
    const excelData = students.map(student => {
      // Base columns
      const row: any = {
        'N° Lista': student.listNumber,
        'Nombre Completo': student.name,
        'CURP/Matrícula': `MAT-${2026000 + student.listNumber}`, // Dato mock
      };
      
      // Dynamic Activity columns baseadas en el campo formativo filtrado
      filteredActivities.forEach(act => {
        const val = getCellStatus(student.id, act.id);
        const translated = val === 'B' ? 'Bien' : val === 'P' ? 'Pendiente' : val === 'I' ? 'Incompleto' : val;
        row[act.title] = translated;
      });
      
      return row;
    });

    // 2. Generate Sheet and Workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Evaluacion_Grupo');
    
    // 3. Force download
    XLSX.writeFile(workbook, `Sabana_Semana24_${activeCampo}.xlsx`);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 absolute inset-0 overflow-hidden z-0">
      {/* Header Concentrado */}
      <div 
        style={{ backgroundColor: currentCampo.color_hex || '#f97316' }}
        className={`px-4 pt-5 pb-6 shadow-md z-10 shrink-0 relative transition-colors duration-500`}
      >
        <div className="flex items-center gap-3 mb-4">
          {/* Botón de regreso */}
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center active:scale-90 transition-transform border border-white/30 shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-xl leading-tight">Acompáñame</h1>
            <p className="text-white/80 text-sm">Registro de Actividades</p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-lg">3° "A"</p>
            <p className="text-white/80 text-sm">Semana 24</p>
          </div>
        </div>

        {/* Campos Formativos Selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 snap-x">
          {fields.map(campo => {
            const IconComponent = getIcon(campo.icon);
            const isActive = activeCampo === campo.slug;
            return (
              <button
                key={campo.id}
                onClick={() => setActiveCampo(campo.slug)}
                style={{
                  backgroundColor: isActive ? 'white' : 'rgba(255,255,255,0.2)',
                  color: isActive ? '#111827' : 'white'
                }}
                className={`snap-center whitespace-nowrap px-4 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
                  isActive 
                    ? 'shadow-sm scale-100' 
                    : 'hover:bg-white/30 scale-95'
                }`}
              >
                <IconComponent className={`w-4 h-4`} style={{ color: isActive ? campo.color_hex : 'white' }} />
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
        <button onClick={exportToExcel} className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 active:bg-green-200" title="Exportar Sábana a Excel">
          <FileSpreadsheet className="w-5 h-5" />
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
                        // Get real graded status
                        const status = getCellStatus(student.id, act.id);
                        const isSelected = selectedCell?.studentId === student.id && selectedCell?.activityId === act.id;
                        
                        return (
                          <td 
                            key={`${student.id}-${act.id}`} 
                            className={`border-b border-r border-gray-100 p-1.5 text-center cursor-pointer transition-all ${isSelected ? 'bg-blue-50 ring-2 ring-blue-500 relative z-10 scale-105 shadow-md rounded-md' : 'bg-transparent hover:bg-slate-100/50'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCellClick(e, student.id, act.id);
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
    </div>
  );
}