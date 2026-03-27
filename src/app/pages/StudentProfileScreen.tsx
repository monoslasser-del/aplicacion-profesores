import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, Activity, Calendar, FileText, Loader2, Star, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { apiClient } from '../../lib/apiClient';
import { descriptiveCardService } from '../../services/descriptiveCardService';
import type { DescriptiveCardData } from '../../services/descriptiveCardService';

interface Activity {
  id: number;
  title: string;
  type: string;
  field?: string;
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

  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [cardData, setCardData] = useState<DescriptiveCardData | null>(null);
  const [loadingCard, setLoadingCard] = useState(false);
  const [savingCard, setSavingCard] = useState(false);

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

  const handleOpenEditor = async () => {
    setIsEditorOpen(true);
    setLoadingCard(true);
    try {
      const card = await descriptiveCardService.getCard(Number(id));
      setCardData(card);
    } catch (err) {
      console.error(err);
      alert('Error cargando ficha descriptiva');
    } finally {
      setLoadingCard(false);
    }
  };

  const handleSaveCard = async () => {
    if (!cardData || !id) return;
    setSavingCard(true);
    try {
      await descriptiveCardService.saveCard(Number(id), cardData);
      alert('¡Ficha guardada con éxito!');
    } catch (error) {
      console.error(error);
      alert('Error guardando la ficha');
    } finally {
      setSavingCard(false);
      setIsEditorOpen(false);
    }
  };

  const handleDownload = () => {
    if (id) window.open(descriptiveCardService.downloadPdfUrl(Number(id)), '_blank');
  };

  const handleChange = (field: keyof DescriptiveCardData, value: string) => {
    setCardData(prev => prev ? { ...prev, [field]: value } : null);
  };

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

        {/* Ficha Descriptiva IA Button */}
        <motion.button 
           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
           onClick={handleOpenEditor}
           className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 shadow-lg shadow-indigo-500/30 flex items-center justify-between active:scale-95 transition-transform"
        >
           <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                 <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                 <h3 className="text-white font-black text-lg leading-tight">Ficha Descriptiva</h3>
                 <p className="text-indigo-100 text-xs font-medium">Borrador asistido con analítica</p>
              </div>
           </div>
           <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-bold text-white flex items-center gap-1">
              Generar
           </div>
        </motion.button>

        {/* Kardex por Campo Formativo */}
        <div>
          <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Kardex de Actividades
          </h2>
          
          <div className="space-y-6">
            {recent_activities.length > 0 ? (
              Object.entries(
                recent_activities.reduce((acc, act) => {
                  const field = act.field || 'General';
                  if (!acc[field]) acc[field] = [];
                  acc[field].push(act);
                  return acc;
                }, {} as Record<string, typeof recent_activities>)
              ).map(([field, activities]) => {
                const fieldAvg = activities.reduce((sum, act) => sum + ((act.score / (act.max_score || 10)) * 10), 0) / activities.length;
                
                return (
                  <div key={field} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-100">
                      <h3 className="font-bold text-gray-800 text-sm">{field}</h3>
                      <span className="text-xs font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">Promedio: {fieldAvg.toFixed(1)}</span>
                    </div>
                    <div className="p-3 bg-white space-y-2">
                      {activities.map((act) => (
                        <div key={act.id} className="flex justify-between items-center px-1 py-1.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 rounded-lg transition-colors">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800">{act.title}</span>
                            <span className="text-[10px] text-gray-400 font-medium">
                              {new Date(act.date).toLocaleDateString()} &middot; {act.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {act.feedback && <span className="text-[10px] text-gray-400 italic max-w-[100px] truncate" title={act.feedback}>{act.feedback}</span>}
                            <div className="bg-gray-100 px-2 py-1 rounded-md min-w-[40px] text-center">
                              <span className="font-bold text-sm text-gray-700">{act.score}</span>
                              <span className="text-[9px] text-gray-400 ml-0.5">/{act.max_score}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm text-center py-4 bg-white rounded-2xl border border-dashed border-gray-200">No hay actividades recientes.</p>
            )}
          </div>
        </div>

      </div>
      
      {/* Editor Modal Fullscreen Overlay */}
      {isEditorOpen && (
        <motion.div 
          initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
          className="absolute inset-0 bg-white z-50 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 bg-indigo-50 border-b border-indigo-100">
            <h2 className="text-lg font-black text-indigo-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Editor Descriptivo
            </h2>
            <button onClick={() => setIsEditorOpen(false)} className="bg-white p-2 rounded-full text-indigo-600 shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 pb-24">
            {loadingCard ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Sparkles className="w-10 h-10 text-indigo-400 animate-pulse mb-4" />
                <p className="text-slate-500 font-bold text-center">Analizando el progreso histórico<br/>de {student.name}...</p>
              </div>
            ) : cardData ? (
              <div className="space-y-4">
                <div className="bg-indigo-100 text-indigo-800 text-xs rounded-xl p-3">
                  <strong>Borrador autogenerado.</strong> El motor analizó {cardData.evaluaciones_count || 0} bitácoras. Edita el texto si lo deseas.
                </div>
                
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-emerald-600 mb-2">Fortalezas Consolidadas</h3>
                  <textarea 
                    value={cardData.fortalezas || ''}
                    onChange={e => handleChange('fortalezas', e.target.value)}
                    className="w-full h-24 bg-gray-50 rounded-xl p-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-rose-600 mb-2">Áreas de Oportunidad</h3>
                  <textarea 
                    value={cardData.areas_oportunidad || ''}
                    onChange={e => handleChange('areas_oportunidad', e.target.value)}
                    className="w-full h-24 bg-gray-50 rounded-xl p-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
                
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-blue-600 mb-2">Recomendaciones: Familia</h3>
                  <textarea 
                    value={cardData.recomendaciones_familia || ''}
                    onChange={e => handleChange('recomendaciones_familia', e.target.value)}
                    className="w-full h-24 bg-gray-50 rounded-xl p-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-700 mb-2">Acuerdos Generales</h3>
                  <textarea 
                    value={cardData.recomendaciones_generales || ''}
                    onChange={e => handleChange('recomendaciones_generales', e.target.value)}
                    className="w-full h-24 bg-gray-50 rounded-xl p-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-gray-500/20"
                  />
                </div>
              </div>
            ) : null}
          </div>

          {!loadingCard && cardData && (
            <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] flex gap-3">
              {cardData.status === 'Generada' && (
                <button onClick={handleDownload} className="flex-1 bg-indigo-50 text-indigo-700 font-bold rounded-xl py-3 flex justify-center items-center gap-2">
                  <FileText className="w-5 h-5"/> PDF
                </button>
              )}
              <button 
                onClick={handleSaveCard} disabled={savingCard}
                className="flex-[2] bg-indigo-600 text-white font-bold rounded-xl py-3 shadow-lg shadow-indigo-200 active:scale-95 transition-all"
              >
                {savingCard ? 'Guardando...' : 'Guardar y Finalizar'}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
