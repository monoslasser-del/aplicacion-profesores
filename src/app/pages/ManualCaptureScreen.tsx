import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, MessageSquare, Check, X, Search, Loader } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';

export function ManualCaptureScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  
  const state = location.state || {};
  const activityType = state.activityType || 'registro';
  const activityName = state.activityName || 'Lectura de compresión';
  const campoName = state.campoName || 'Lenguajes';

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar alumnos reales del backend
  useEffect(() => {
    studentService.getStudents()
      .then(data => {
        setStudents(data.map((s: any, idx: number) => ({
          id: s.id,
          listNumber: idx + 1,
          name: s.name,
          grade: '',
          status: null,
          notes: ''
        })));
      })
      .catch(err => console.error('Error cargando alumnos:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = (id: any, status: any) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleGradeChange = (id: any, grade: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, grade } : s));
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Guardar registros en el backend
  const handleSave = async () => {
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      for (const student of students) {
        let backendStatus: 'present' | 'absent' | 'late' = 'present';
        if (activityType === 'registro') {
          backendStatus = student.status === 'yes' ? 'present' : student.status === 'no' ? 'absent' : 'present';
        } else {
          backendStatus = 'present'; // Actividad calificada = presencia implícita
        }
        await attendanceService.markManual({
          student_id: student.id,
          date: today,
          status: backendStatus,
        });
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
            <h1 className="text-gray-900 font-bold text-lg">Captura Manual</h1>
            <p className="text-gray-500 text-sm">{activityName}</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 active:bg-blue-100">
            <Save className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 rounded-xl p-3 flex justify-between items-center mb-4 border border-blue-100">
          <div className="flex gap-4 text-sm font-bold text-blue-800">
            <span>3° "A"</span>
            <span>•</span>
            <span>{campoName}</span>
          </div>
          <span className="bg-white text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm">
            {activityType === 'calificada' ? 'Calificada' : activityType === 'participacion' ? 'Participación' : 'Registro'}
          </span>
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
      <div className="flex px-4 py-3 bg-gray-100/80 text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">
        <div className="w-10 text-center">N°</div>
        <div className="flex-1 px-2">Alumno</div>
        <div className="w-24 text-center">{activityType === 'calificada' ? 'Calificación' : 'Estado'}</div>
        <div className="w-10 text-center">Obs</div>
      </div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="divide-y divide-gray-100">
          {filteredStudents.map((student) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center px-4 py-3 bg-white"
            >
              <div className="w-10 text-center font-bold text-gray-400 text-sm shrink-0">
                {student.listNumber}
              </div>
              <div className="flex-1 px-2 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{student.name}</p>
              </div>

              <div className="w-24 flex justify-center shrink-0">
                {activityType === 'calificada' ? (
                  <input 
                    type="number" 
                    min="0" max="10"
                    placeholder="-"
                    value={student.grade}
                    onChange={(e) => handleGradeChange(student.id, e.target.value)}
                    className="w-14 h-10 text-center font-bold text-lg bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                  />
                ) : activityType === 'participacion' ? (
                  <div className="flex flex-col gap-1 w-full px-1">
                    <select
                      value={student.status || ''}
                      onChange={(e) => handleStatusChange(student.id, e.target.value)}
                      className="w-full h-10 text-[10px] font-bold uppercase bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    >
                      <option value="">-</option>
                      <option value="apoyo">Apoyo</option>
                      <option value="proceso">Proceso</option>
                      <option value="desarrollo">Desarrollo</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleStatusChange(student.id, 'yes')}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        student.status === 'yes' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleStatusChange(student.id, 'no')}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        student.status === 'no' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="w-10 flex justify-end shrink-0 pl-2">
                <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                  <MessageSquare className="w-4 h-4" />
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
          {saving ? 'Guardando...' : 'Guardar y Finalizar'}
        </button>
      </div>
    </div>
  );
}