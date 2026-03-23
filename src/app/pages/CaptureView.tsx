import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Save, MessageSquare, Check, X, Search, Loader, Nfc, RadioReceiver,
  BookOpen, FileText, MapPin, HeartHandshake, ChevronRight, Plus, CloudOff
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { studentService } from '../../services/studentService';
import { activityService } from '../../services/activityService';
import { authService } from '../../services/authService';
import { hardwareServices } from '../../utils/hardwareServices';
import { useFormativeFields } from '../../hooks/useFormativeFields';
import { useSyncStore } from '../../store/useSyncStore';



export function CaptureView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [isNfcActive, setIsNfcActive] = useState(false);
  
  const { fields, loading: loadingFields, getIcon } = useFormativeFields();

  // States to represent the current activity gracefully
  const [activityId, setActivityId] = useState<number | null>(location.state?.activityId || null);
  const [activityType, setActivityType] = useState(location.state?.activityType || 'registro');
  const [activityName, setActivityName] = useState(location.state?.activityName || 'Cargando sesión...');
  const [campoName, setCampoName] = useState(location.state?.campoName || '');
  const [evaluationScale, setEvaluationScale] = useState(location.state?.evaluationScale || 'numeric');

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [loadingActiveActivity, setLoadingActiveActivity] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityType, setNewActivityType] = useState('registro');
  const [newEvaluationScale, setNewEvaluationScale] = useState<'numeric' | 'levels'>('numeric');
  const [activeCampo, setActiveCampo] = useState('lenguajes');

  const { pendingRecords, addRecord, syncData, isOnline, setOnlineStatus } = useSyncStore();

  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      syncData();
    };
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.onLine) syncData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncData, setOnlineStatus]);

  // Intentar cargar la actividad activa si venimos desde el Side Nav sin estado previo
  useEffect(() => {
    if (!activityId) {
      activityService.getActiveActivity()
        .then(act => {
          setActivityId(act.id!);
          setActivityName(act.title);
          setActivityType(act.type || 'registro');
          setEvaluationScale(act.evaluation_scale || 'numeric');
          setCampoName(act.subject);
        })
        .catch(err => {
          console.log('No active activity found:', err);
          setActivityName('Ninguna actividad en la clase');
        })
        .finally(() => setLoadingActiveActivity(false));
    } else {
      setLoadingActiveActivity(false);
    }
  }, [activityId]);

  const studentsRef = useRef(students);
  useEffect(() => {
    studentsRef.current = students;
  }, [students]);

  // Cargar alumnos reales del backend
  useEffect(() => {
    studentService.getStudents()
      .then(data => {
        setStudents(data.map((s: any, idx: number) => ({
          id: s.id,
          listNumber: idx + 1,
          name: s.name,
          nfc_tag: s.nfc_tag,
          grade: '',
          status: null,
          level: '',
          notes: ''
        })));
      })
      .catch(err => console.error('Error cargando alumnos:', err))
      .finally(() => setLoading(false));
  }, []);

  // QUICK GRADE MODAL STATE
  const [activeNfcStudent, setActiveNfcStudent] = useState<any | null>(null);
  const [gradingMode, setGradingMode] = useState<'nfc' | 'manual' | null>(null);

  // --- Híbrido: NFC Background Listener ---
  useEffect(() => {
    let active = true;
    if (isNfcActive) {
      hardwareServices.initNfcListener(
        async (tagData: any) => {
          if (!active) return;
          const uid = tagData.id ? Array.from(tagData.id as number[]).map((i: number) => i.toString(16).padStart(2, '0')).join(':') : 'unknown';
          
          const currentStudents = studentsRef.current;
          const stuIndex = currentStudents.findIndex(s => s.nfc_tag === uid);
          
          if (stuIndex !== -1) {
            await hardwareServices.vibrateSuccess();
            // En vez de evaluar automáticamente, disparamos el modal interactivo
            // y mantenemos el NFC activo
            setGradingMode('nfc');
            setActiveNfcStudent(currentStudents[stuIndex]);
          } else {
             await hardwareServices.vibrateError();
          }
        },
        async (err: any) => {
          if (!active) return;
          console.log('NFC error', err);
        }
      );
    }
    return () => { active = false; };
  }, [isNfcActive, evaluationScale, activityType]);

  const handleQuickGrade = async (student: any, gradeValue: string | null, levelValue: string | null, statusValue: string | null) => {
    if (!activityId) return;
    
    // 1. Update local state visual
    setStudents(prev => {
      const copy = [...prev];
      const idx = copy.findIndex(s => s.id === student.id);
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

    // 2. Cierra modal instantáneo para seguir flujo cero-fricción o avanza si es manual
    if (gradingMode === 'manual') {
      const copyStudents = studentsRef.current;
      const idx = copyStudents.findIndex(s => s.id === student.id);
      if (idx !== -1 && idx < copyStudents.length - 1) {
        setActiveNfcStudent(copyStudents[idx + 1]);
      } else {
        setActiveNfcStudent(null);
        setGradingMode(null);
      }
    } else {
      setActiveNfcStudent(null);
      setGradingMode(null);
    }
    await hardwareServices.vibrateSuccess(); // Doble retroalimentación al confirmar

    // 3. Enviar a backend silenciosamente en background
    const scoreVal = gradeValue ? parseFloat(gradeValue) : null;
    let scoreText = null;

    if (activityType === 'calificada') {
      if (evaluationScale !== 'numeric') {
        scoreText = levelValue || null;
      }
    } else {
      scoreText = statusValue === 'yes' ? 'Completado' : (statusValue === 'no' ? 'Pendiente' : null);
    }

    if (!navigator.onLine) {
      addRecord({
        studentId: student.id,
        activityId: activityId.toString(),
        type: 'evaluation',
        value: scoreText || (scoreVal !== null ? scoreVal.toString() : undefined)
      });
      return;
    }

    try {
      await activityService.submitGrades(activityId, [{
        student_id: student.id,
        score: scoreVal,
        score_text: scoreText
      }]);
    } catch (err) {
      console.error('NFC QuickGrade Error:', err);
      addRecord({
        studentId: student.id,
        activityId: activityId.toString(),
        type: 'evaluation',
        value: scoreText || (scoreVal !== null ? scoreVal.toString() : undefined)
      });
    }
  };

  const startManualGrading = (student: any) => {
    setGradingMode('manual');
    setActiveNfcStudent(student);
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Guardar registros unificados en backend
  const handleSave = async () => {
    if (!activityId) {
      alert("Error: Actividad no válida.");
      return;
    }
    setSaving(true);
    try {
      const gradesToSubmit = students.map(student => {
        let scoreVal = null;
        let scoreText = null;

        if (activityType === 'calificada') {
          if (evaluationScale === 'numeric') {
             scoreVal = student.grade ? parseFloat(student.grade) : null;
          } else {
             scoreText = student.level || null;
          }
        } else {
           scoreText = student.status === 'yes' ? 'Completado' : (student.status === 'no' ? 'Pendiente' : null);
        }

        return {
          student_id: student.id,
          score: scoreVal,
          score_text: scoreText
        };
      }).filter(g => g.score !== null || g.score_text !== null);

      if (gradesToSubmit.length > 0) {
        await activityService.submitGrades(activityId, gradesToSubmit);
      }
      
      // Desactivar la actividad para que no vuelva a aparecer en Captura Híbrida
      await activityService.updateActivity(activityId, { is_active: false });

      // Opcional: limpiar estado interno por si vuelven mediante navegación pop
      setActivityId(null);
      setActivityName('Ninguna actividad en la clase');

      navigate('/records');
    } catch (err) {
      console.error('Error guardando:', err);
      alert('Hubo un error al guardar. Verifica la conexión con el servidor.');
    } finally {
      setSaving(false);
    }
  };

  const currentCampo = fields.find(c => c.slug === activeCampo) || fields[0] || { name: 'Lenguajes' };

  const handleCreateActivity = async () => {
    if (!newActivityName.trim()) return;

    try {
      const storedUser = authService.getStoredUser();
      const teacherGroupId = storedUser?.group_info?.id;
      
      const response = await activityService.createActivity({
        title: newActivityName.trim(),
        subject: currentCampo.name, // The backend expects the subject string, or ID.
        due_date: new Date().toISOString().split('T')[0],
        group_id: teacherGroupId,
        type: newActivityType as any,
        evaluation_scale: newEvaluationScale
      });

      // Update local state to instantly use the new activity!
      setActivityId(response.id!);
      setActivityName(response.title);
      setActivityType(response.type || 'registro');
      setEvaluationScale(response.evaluation_scale || 'numeric');
      setCampoName(response.subject);
      
      setShowNewModal(false);
      setNewActivityName('');
    } catch (error) {
      console.error("Error creating activity", error);
      alert("Hubo un error al guardar la actividad en la nube.");
    }
  };

  const renderNewActivityModal = () => (
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

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-white pb-10">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de la actividad</label>
                <input 
                  type="text" 
                  value={newActivityName}
                  onChange={(e) => setNewActivityName(e.target.value)}
                  placeholder="Ej. Lectura de comprensión" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Campo Formativo</label>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {loadingFields ? (
                    <div className="col-span-2 text-center text-slate-400 py-4">Cargando campos...</div>
                  ) : (
                    fields.map((campo) => {
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
                            borderWidth: isSelected ? '2px' : '1px'
                          }}
                          className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${
                            isSelected ? 'shadow-md scale-[1.02]' : 'hover:bg-slate-50'
                          }`}
                        >
                          <IconComponent size={24} style={{ color: isSelected ? campo.color_hex : '#94a3b8' }} />
                          <span className="text-xs font-bold text-center leading-tight">
                            {campo.name}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Registro</label>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setNewActivityType('registro')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${newActivityType === 'registro' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-gray-200/50'}`}
                  >
                    Solo registro
                  </button>
                  <button 
                    onClick={() => setNewActivityType('participacion')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${newActivityType === 'participacion' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-gray-200/50'}`}
                  >
                    Participación
                  </button>
                  <button 
                    onClick={() => setNewActivityType('calificada')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${newActivityType === 'calificada' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-gray-200/50'}`}
                  >
                    Calificada
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Evaluación (OBLIGATORIO)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setNewEvaluationScale('numeric')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${newEvaluationScale === 'numeric' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="font-bold text-sm">Numérica</span>
                    <span className="text-[10px] mt-1 opacity-80">(del 5 al 10)</span>
                  </button>
                  <button 
                    onClick={() => setNewEvaluationScale('levels')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${newEvaluationScale === 'levels' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="font-bold text-sm">Niveles de Desarrollo</span>
                    <span className="text-[10px] mt-1 opacity-80">(formativo)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-gray-100 shrink-0">
              <button 
                onClick={handleCreateActivity}
                disabled={!newActivityName.trim()}
                className={`w-full font-bold text-lg py-4 rounded-2xl transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                  newActivityName.trim() ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' : 'bg-gray-200 text-gray-400 shadow-none'
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
  );

  if (!activityId && !loadingActiveActivity) {
    return (
      <div className="flex flex-col h-full bg-slate-50 relative absolute inset-0 overflow-hidden">
         {/* HEADER EMPTY STATE */}
         <div className="bg-white px-4 pt-6 pb-4 shadow-sm z-10 shrink-0">
            <h1 className="text-gray-900 font-bold text-xl text-center">Captura Híbrida</h1>
         </div>
         <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
               <Nfc className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">No hay actividad activa</h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              Crea una actividad para habilitar el escáner NFC y comenzar la captura rápida.
            </p>
            <button 
              onClick={() => setShowNewModal(true)}
              className="bg-blue-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-all w-full max-w-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-6 h-6" /> Crear Nueva Actividad
            </button>
         </div>
         
         {renderNewActivityModal()}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 absolute inset-0 overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 shadow-sm z-10 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center active:bg-gray-100">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <div className="text-center">
            <h1 className="text-gray-900 font-bold text-lg">Captura Híbrida</h1>
            <p className="text-gray-500 text-sm">{activityName}</p>
          </div>
          <button onClick={handleSave} className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 active:bg-blue-100">
            <Save className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner & NFC Toggle */}
        <div className="flex flex-col gap-3 mb-4">
          <button 
            onClick={() => setIsNfcActive(!isNfcActive)}
            className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
              isNfcActive ? 'bg-green-500 text-white shadow-md shadow-green-200 animate-pulse' : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            {isNfcActive ? <RadioReceiver className="w-5 h-5 animate-spin-slow" /> : <Nfc className="w-5 h-5" />}
            {isNfcActive ? 'Lector NFC Activo (Escuchando...)' : 'Activar Asistente NFC'}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar alumno..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table Header */}
      <div className="flex px-4 py-3 bg-gray-100/80 text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0">
        <div className="w-8 text-center">N°</div>
        <div className="flex-1 px-2">Alumno</div>
        <div className="w-32 text-center">{activityType === 'calificada' ? 'Calificación / Nivel' : 'Estado'}</div>
      </div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto pb-[120px]">
        <div className="divide-y divide-gray-100">
          {filteredStudents.map((student) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`flex items-center px-4 py-3 transition-colors ${
                student.grade || student.level || student.status ? 'bg-blue-50/30' : 'bg-white'
              }`}
            >
              <div className="w-8 text-center font-bold text-gray-400 text-sm shrink-0">
                {student.listNumber}
              </div>
              <div className="flex-1 px-2 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate flex items-center gap-2">
                  {student.name}
                  {pendingRecords.some((r: any) => r.studentId === student.id && r.activityId === activityId?.toString()) && (
                    <span title="Pendiente de Sincronizar (Offline)"><CloudOff className="w-3.5 h-3.5 text-gray-400" /></span>
                  )}
                  {!pendingRecords.some((r: any) => r.studentId === student.id && r.activityId === activityId?.toString()) && (student.grade || student.level || student.status) && (
                    <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center" title="Sincronizado">
                       <Check className="w-2.5 h-2.5 text-green-600" />
                    </span>
                  )}
                </p>
                {student.nfc_tag && <span className="text-[9px] text-green-500 font-bold uppercase tracking-widest mt-0.5">NFC Vinculado</span>}
              </div>

              <div className="w-32 flex justify-center shrink-0">
                <button 
                  onClick={() => startManualGrading(student)}
                  className={`w-full h-10 rounded-xl font-bold flex items-center justify-center transition-all ${
                    student.grade || student.level || student.status
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {activityType === 'calificada' ? (
                    evaluationScale === 'numeric' ? (
                      student.grade || 'Evaluar'
                    ) : (
                      student.level || 'Evaluar'
                    )
                  ) : (
                    student.status === 'yes' ? <><Check className="w-4 h-4 mr-1" /> Listo</> : (
                      student.status === 'no' ? <><X className="w-4 h-4 mr-1" /> No</> : 'Evaluar'
                    )
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-6 left-0 right-0 px-6 z-20 pb-4">
        <button 
          onClick={handleSave}
          disabled={saving || loading}
          className="w-full bg-gray-900 hover:bg-black text-white font-bold text-lg py-4 rounded-2xl transition-colors active:scale-95 shadow-xl flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Guardando en la Nube...' : 'Guardar y Finalizar'}
        </button>
      </div>

      {/* QUICK GRADE MODAL */}
      <AnimatePresence>
        {activeNfcStudent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => {
                setActiveNfcStudent(null);
                setGradingMode(null);
              }}
              className="absolute inset-0 bg-slate-900/60 z-40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] z-50 overflow-hidden shadow-2xl pb-8"
            >
              <div className="px-6 pt-8 pb-4">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
                <div className="flex flex-col mb-6">
                  <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">Evaluando a</span>
                  <h2 className="text-2xl font-black text-slate-900">{activeNfcStudent.name}</h2>
                </div>
                
                {activityType === 'calificada' ? (
                  evaluationScale === 'levels' ? (
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => handleQuickGrade(activeNfcStudent, null, 'Logrado', null)}
                        className="w-full py-4 px-6 rounded-2xl bg-green-50 text-green-700 font-bold border-2 border-green-200 active:scale-95 transition-all text-lg"
                      >
                        Logrado
                      </button>
                      <button 
                        onClick={() => handleQuickGrade(activeNfcStudent, null, 'En Proceso', null)}
                        className="w-full py-4 px-6 rounded-2xl bg-yellow-50 text-yellow-700 font-bold border-2 border-yellow-200 active:scale-95 transition-all text-lg"
                      >
                        En Proceso
                      </button>
                      <button 
                        onClick={() => handleQuickGrade(activeNfcStudent, null, 'Requiere Apoyo', null)}
                        className="w-full py-4 px-6 rounded-2xl bg-red-50 text-red-700 font-bold border-2 border-red-200 active:scale-95 transition-all text-lg"
                      >
                        Requiere Apoyo
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {[5, 6, 7, 8, 9, 10].map(grade => (
                        <button 
                          key={grade}
                          onClick={() => handleQuickGrade(activeNfcStudent, grade.toString(), null, null)}
                          className="py-5 rounded-2xl bg-blue-50 text-blue-700 font-black text-2xl border-2 border-blue-200 active:scale-95 transition-all"
                        >
                          {grade}
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleQuickGrade(activeNfcStudent, null, null, 'yes')}
                      className="py-5 rounded-2xl bg-green-50 text-green-700 font-black text-xl border-2 border-green-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-6 h-6" /> Listo
                    </button>
                    <button 
                      onClick={() => handleQuickGrade(activeNfcStudent, null, null, 'no')}
                      className="py-5 rounded-2xl bg-red-50 text-red-700 font-black text-xl border-2 border-red-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-6 h-6" /> Pendiente
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {renderNewActivityModal()}
    </div>
  );
}