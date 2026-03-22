import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, MessageSquare, Check, X, Search, Loader, Nfc, RadioReceiver } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { studentService } from '../../services/studentService';
import { activityService } from '../../services/activityService';
import { hardwareServices } from '../../utils/hardwareServices';

export function ManualCaptureScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [isNfcActive, setIsNfcActive] = useState(false);
  
  const state = location.state || {};
  const activityId = state.activityId;
  const activityType = state.activityType || 'registro';
  const activityName = state.activityName || 'Lectura de comprensión';
  const campoName = state.campoName || 'Lenguajes';
  const evaluationScale = state.evaluationScale || 'numeric';

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
            // Marcar alumno según escala seleccionada (evaluación rápida)
            setStudents(prev => {
              const copy = [...prev];
              if (activityType === 'calificada') {
                if (evaluationScale === 'numeric') {
                  copy[stuIndex] = { ...copy[stuIndex], grade: '10' };
                } else {
                  copy[stuIndex] = { ...copy[stuIndex], level: 'Sobresaliente' };
                }
              } else {
                copy[stuIndex] = { ...copy[stuIndex], status: 'yes' };
              }
              return copy;
            });
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

  const handleStatusChange = (id: any, status: any) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };
  
  const handleLevelChange = (id: any, level: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, level } : s));
  };

  const handleGradeChange = (id: any, grade: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, grade } : s));
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
      
      navigate('/activities');
    } catch (err) {
      console.error('Error guardando:', err);
      alert('Hubo un error al guardar. Verifica la conexión con el servidor.');
    } finally {
      setSaving(false);
    }
  };

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
          <div className="bg-blue-50 rounded-xl p-3 flex justify-between items-center border border-blue-100">
            <div className="flex gap-4 text-sm font-bold text-blue-800">
              <span>{campoName}</span>
            </div>
            <span className="bg-white text-blue-700 px-2.5 py-1 rounded-lg text-xs font-black shadow-sm uppercase">
              {activityType === 'calificada' ? (evaluationScale === 'numeric' ? 'Numérica' : 'Niveles') : 'Registro'}
            </span>
          </div>
          
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
      <div className="flex-1 overflow-y-auto pb-24">
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
                <p className="text-sm font-bold text-gray-900 truncate">{student.name}</p>
                {student.nfc_tag && <span className="text-[9px] text-green-500 font-bold uppercase tracking-widest mt-0.5">NFC Vinculado</span>}
              </div>

              <div className="w-32 flex justify-center shrink-0">
                {activityType === 'calificada' ? (
                  evaluationScale === 'numeric' ? (
                    <input 
                      type="number" 
                      min="5" max="10" step="0.1"
                      placeholder="-"
                      value={student.grade}
                      onChange={(e) => handleGradeChange(student.id, e.target.value)}
                      className="w-16 h-10 text-center font-black text-lg text-blue-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    />
                  ) : (
                    <select
                      value={student.level || ''}
                      onChange={(e) => handleLevelChange(student.id, e.target.value)}
                      className="w-full h-10 text-[10px] font-bold uppercase bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    >
                      <option value="">(Selección)</option>
                      <option value="Sobresaliente">Sobresaliente</option>
                      <option value="Satisfactorio">Satisfactorio</option>
                      <option value="Suficiente">Suficiente</option>
                      <option value="En Proceso">En Proceso</option>
                    </select>
                  )
                ) : activityType === 'participacion' || activityType === 'registro' ? (
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleStatusChange(student.id, 'yes')}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        student.status === 'yes' ? 'bg-green-500 text-white shadow-md shadow-green-200 scale-105' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleStatusChange(student.id, 'no')}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        student.status === 'no' ? 'bg-red-500 text-white shadow-md shadow-red-200 scale-105' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : null}
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
    </div>
  );
}