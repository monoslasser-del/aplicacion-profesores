import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, Activity, Calendar, FileText, Loader2, Star } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { apiClient } from '../../lib/apiClient';

interface Activity {
  id: number;
  title: string;
  type: string;
  date: string;
  score: number;
  max_score: number;
  feedback: string;
}

interface StudentProfileData {
  student: {
    id: string;
    name: string;
    curp: string;
    estado: string;
  };
  recent_activities: Activity[];
  stats: {
    average: number;
    attendance_rate: number;
    total_activities: number;
  };
}

export function StudentProfileScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await apiClient.get<StudentProfileData>(`/v1/students/${id}/activities`);
        setData(response as unknown as StudentProfileData);
      } catch (err) {
        console.error('Error al cargar el perfil del alumno', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!data || !data.student) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50 p-6 text-center">
        <User className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700">No se encontró el alumno</h2>
        <button onClick={() => navigate(-1)} className="mt-6 font-bold text-blue-600 underline">Volver</button>
      </div>
    );
  }

  const { student, recent_activities, stats } = data;
  const initials = student.name ? student.name.substring(0, 2).toUpperCase() : 'AL';

  return (
    <div className="flex flex-col h-full bg-gray-50 absolute inset-0 overflow-hidden">
      {/* Header */}
      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white px-4 pt-6 pb-6 shadow-sm z-10 shrink-0">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center active:bg-gray-100 transition-colors mb-4">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/20 mb-4 border-4 border-white">
            <span className="text-white font-black text-3xl">{initials}</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 text-center leading-tight mb-1">{student.name}</h1>
          <p className="text-gray-500 text-sm font-mono">{student.curp || 'Sin CURP'}</p>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        
        {/* Stats Grid */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <span className="text-blue-500 font-black text-2xl">{stats.average.toFixed(1)}</span>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Promedio</span>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <span className="text-green-500 font-black text-2xl">{stats.attendance_rate}%</span>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Asistencia</span>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <span className="text-purple-500 font-black text-2xl">{stats.total_activities}</span>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Actividades</span>
          </div>
        </motion.div>

        {/* Últimas actividades */}
        <div>
          <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Últimas Actividades
          </h2>
          
          <div className="space-y-3">
            {recent_activities.length > 0 ? recent_activities.map((act, i) => (
              <motion.div 
                key={act.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 pr-4">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-1.5">{act.type}</span>
                    <h3 className="text-gray-900 font-bold text-sm leading-snug">{act.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-xl">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-black text-gray-900 text-sm">{act.score}</span>
                    <span className="text-gray-400 text-[10px]">/{act.max_score}</span>
                  </div>
                </div>
                <p className="text-gray-500 text-xs">{act.feedback}</p>
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50 text-gray-400 text-[10px] font-medium">
                  <Calendar className="w-3 h-3" />
                  {new Date(act.date).toLocaleDateString()}
                </div>
              </motion.div>
            )) : (
              <p className="text-gray-500 text-sm text-center py-4">No hay actividades recientes.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
