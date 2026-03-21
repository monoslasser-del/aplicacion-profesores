import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  CheckCircle2, 
  XCircle,
  Clock,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { studentService } from '../../services/studentService';
import { db } from '../../storage/db';
import { activityService, GradePayload } from '../../services/activityService';

interface UIStudent {
  id: number;
  listNumber: number;
  name: string;
  status: 'entregado' | 'no_entregado';
  grade: number | string | null;
}

export function EvaluationCaptureScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const state = location.state || {};
  const sessionData = state.sessionData || null; // Comes from NFC
  const activityId = state.activityId || sessionData?.activityId || null; // ID de Laravel si existe
  const activityName = state.activityName || sessionData?.activityName || 'Lectura de comprensión';
  const campoName = state.campoName || sessionData?.campoName || 'Lenguajes';
  const campoColor = state.campoColor || 'bg-orange-500';
  const evalScale = state.evalScale || 'numerica'; // 'numerica' or 'estatus'

  const [students, setStudents] = useState<UIStudent[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    studentService.getAllStudents().then(data => {
      // Sort by NL
      data.sort((a, b) => (a.nl || 0) - (b.nl || 0));

      const attendedIds = sessionData ? sessionData.records.map((r: any) => r.studentId) : [];

      const mapped = data.map(s => {
        // En captura NFC, los success records marcan "entregaron/asistieron". Si no hay sesión previa, todos asistieron.
        const status = (sessionData && !attendedIds.includes(s.id)) ? 'no_entregado' : 'entregado';
        return {
          id: s.id,
          listNumber: s.nl || 0,
          name: s.name,
          status: status as 'entregado' | 'no_entregado',
          grade: null
        };
      });
      setStudents(mapped);
    });
  }, [sessionData]);

  const setGrade = (studentId: number, grade: number | string) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, grade } : s
    ));
  };

  const toggleStatus = (studentId: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const newStatus = s.status === 'entregado' ? 'no_entregado' : 'entregado';
        return { ...s, status: newStatus, grade: newStatus === 'no_entregado' ? null : s.grade };
      }
      return s;
    }));
  };

  const applyGradeToAll = () => {
    const firstGraded = students.find(s => s.grade !== null);
    if (!firstGraded) return alert("Puntúa al menos a un alumno primero para copiar ese valor al resto.");
    
    if(confirm(`¿Deseas aplicar la calificación de "${firstGraded.grade}" a los demás alumnos que han entregado?`)) {
      setStudents(prev => prev.map(s => 
        s.status === 'entregado' && s.grade === null ? { ...s, grade: firstGraded.grade } : s
      ));
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Requiere apoyo': return 'bg-red-100 text-red-700 border-red-200';
      case 'En proceso': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'En desarrollo': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 absolute inset-0 overflow-hidden">
      {/* Header */}
      <div className={`${campoColor} px-4 pt-6 pb-6 shadow-md z-10 shrink-0 relative transition-colors duration-500`}>
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-xl leading-tight">{activityName}</h1>
            <p className="text-white/80 text-sm">{campoName} • 3° "A"</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/80" />
            <span className="text-white text-sm font-medium">14 Mar 2026</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
            {evalScale === 'numerica' ? 'Escala: 5-10' : 'Escala: Estatus'}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 shrink-0 shadow-sm z-10">
        <p className="text-sm font-bold text-gray-700">
          <span className="text-green-600">{students.filter(s => s.status === 'entregado').length}</span> entregaron
        </p>
        <button onClick={applyGradeToAll} className="text-sm font-bold text-blue-600 active:text-blue-700">
          Aplicar valor a todos
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        {students.map((student, i) => (
          <motion.div 
            key={student.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white rounded-2xl p-4 shadow-sm border ${student.status === 'no_entregado' ? 'opacity-70 border-gray-200' : 'border-gray-100'}`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm shrink-0">
                  {student.listNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{student.name}</h3>
                  <button 
                    onClick={() => toggleStatus(student.id)}
                    className="flex items-center gap-1 mt-0.5 active:scale-95 transition-transform"
                  >
                    {student.status === 'entregado' ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Entregó
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                        <XCircle className="w-3 h-3" /> No entregó
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Evaluation Controls */}
              {student.status === 'entregado' ? (
                <div className="mt-2">
                  {evalScale === 'numerica' ? (
                    <div className="flex gap-2">
                      {[5, 6, 7, 8, 9, 10].map(val => (
                        <button
                          key={val}
                          onClick={() => setGrade(student.id, val)}
                          className={`flex-1 py-2 rounded-xl text-sm font-black transition-all ${
                            student.grade === val 
                              ? 'bg-blue-600 text-white shadow-md scale-105' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {['Requiere apoyo', 'En proceso', 'En desarrollo'].map(estatus => {
                        const isSelected = student.grade === estatus;
                        return (
                          <button
                            key={estatus}
                            onClick={() => setGrade(student.id, estatus)}
                            className={`flex-1 py-2 px-1 rounded-xl text-[10px] uppercase font-bold text-center transition-all border ${
                              isSelected 
                                ? getStatusColor(estatus)
                                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {estatus}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-2 bg-gray-50 rounded-xl py-3 px-4 flex items-center justify-center border border-gray-100">
                  <span className="text-gray-400 text-sm font-medium">Evaluación no disponible</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t border-gray-100 p-4 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
        <div className="flex gap-3">
          <button 
            onClick={async () => {
              setIsSaving(true);
              try {
                // 1. Convert grades to number for NEM
                const records = students.map(s => {
                  let numScore = 5;
                  if (typeof s.grade === 'number') numScore = s.grade;
                  else if (s.grade === 'Requiere apoyo') numScore = 5;
                  else if (s.grade === 'En proceso') numScore = 8;
                  else if (s.grade === 'En desarrollo' || s.grade === 'Bien') numScore = 10;
                  
                  return {
                    studentId: s.id,
                    time: new Date().toLocaleTimeString(),
                    status: s.status === 'entregado' ? 'success' as const : 'error' as const,
                    score: s.status === 'entregado' ? numScore : 0
                  };
                });

                // 2. Intentar guardar masivamente en el backend si tenemos el ID (Opción B del prompt)
                if (activityId) {
                   const bulkGrades: GradePayload[] = records
                     .filter(r => r.status === 'success') // Opcional: solo calificados
                     .map(r => ({
                        student_id: r.studentId,
                        score: r.score
                     }));

                   if (bulkGrades.length > 0) {
                     await activityService.submitGrades(activityId, bulkGrades);
                   }
                }

                // 3. Fallback / Sincronización Local en IndexedDB
                const newActivity = {
                  activityName,
                  campoName,
                  date: new Date().toISOString(),
                  records,
                  sync_status: activityId ? 'SYNCED' as const : 'PENDING' as const
                };

                if (sessionData && sessionData.id) {
                  await db.activities.update(sessionData.id, newActivity);
                } else {
                  await db.activities.add(newActivity);
                }
                
                alert("Calificaciones sincronizadas y guardadas correctamente.");
                navigate('/dashboard');
              } catch (e) {
                console.error(e);
                alert("No se pudo conectar con el servidor, guardado localmente (Offline).");
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving}
            className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl active:scale-95 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Finalizar y Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
