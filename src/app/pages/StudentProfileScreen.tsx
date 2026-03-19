import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Activity, GraduationCap } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function StudentProfileScreen() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data tailored for the student profile
  const history = [
    { id: 1, subject: 'Matemáticas', grade: '9.0', date: 'Hoy, 10:30 AM', type: 'Examen' },
    { id: 2, subject: 'Historia', grade: '8.5', date: 'Ayer, 09:15 AM', type: 'Participación' },
    { id: 3, subject: 'Ciencias', grade: '10.0', date: '15 Nov, 11:00 AM', type: 'Proyecto' },
    { id: 4, subject: 'Matemáticas', grade: '7.0', date: '12 Nov, 10:30 AM', type: 'Tarea' },
    { id: 5, subject: 'Educación Física', grade: '9.5', date: '10 Nov, 08:00 AM', type: 'Asistencia' },
  ];

  return (
    <div className="flex flex-col h-full bg-white absolute inset-0">
      {/* Header with back button */}
      <div className="px-6 pt-6 pb-2 flex items-center shrink-0">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 -ml-3 rounded-full hover:bg-gray-100 text-gray-600 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center px-6 pb-10 border-b border-gray-100 shrink-0">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 rounded-full overflow-hidden shadow-xl border-[6px] border-white bg-gray-100 mb-5 ring-4 ring-gray-50 z-10"
        >
          {/* Using Unsplash Image */}
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1688760118139-87c7eeb8b38d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHN0dWRlbnQlMjBwb3J0cmFpdCUyMGZhY2V8ZW58MXx8fHwxNzczMDE1MjEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Student Avatar"
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Laura Torres</h1>
        <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
          <GraduationCap className="w-4 h-4" />
          Grupo 3° A
        </div>
      </div>

      {/* Activity History */}
      <div className="flex-1 px-6 pt-8 bg-gray-50 overflow-y-auto pb-10">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-gray-400" />
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Últimas Actividades</h2>
        </div>

        <div className="space-y-4">
          {history.map((record, i) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center gap-4"
            >
              <div className="bg-gray-50 p-3 rounded-xl shrink-0">
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-gray-900 font-bold truncate text-base">{record.subject}</h3>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider bg-gray-100 px-2 py-0.5 rounded-md">
                    {record.type}
                  </span>
                </div>
                <p className="text-gray-400 text-sm truncate">{record.date}</p>
              </div>

              <div className="text-2xl font-black text-blue-600 shrink-0">
                {record.grade}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
