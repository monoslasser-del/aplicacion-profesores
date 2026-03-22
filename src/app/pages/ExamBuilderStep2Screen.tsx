import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, FileSignature, CheckCircle2, 
  Loader2, AlertCircle, Calendar, RefreshCw, FileText
} from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

interface ExamDraft {
  id: string;
  title: string;
  generated_at: string;
  total_questions: number;
  status: string;
  projects_included: number[];
  questions: any[];
}

export function ExamBuilderStep2Screen() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectIds = location.state?.project_ids || [];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exam, setExam] = useState<ExamDraft | null>(null);

  useEffect(() => {
    const buildExam = async () => {
      if (!projectIds || projectIds.length === 0) {
        setError('No se seleccionaron proyectos para compilar.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.post<{ success: boolean; exam: ExamDraft }>(
          '/v1/exams/build', 
          { project_ids: projectIds }
        );
        
        if (response.success && response.exam) {
          // Simulamos un retraso cognitivo para UX Premium (parece que la IA está pensando)
          setTimeout(() => {
            setExam(response.exam);
            setLoading(false);
          }, 1500);
        } else {
          throw new Error('Formato de respuesta inválido');
        }
      } catch (err: any) {
        setError(err.message || 'Error al conectar con el servidor.');
        setLoading(false);
      }
    };

    buildExam();
  }, [projectIds]);

  return (
    <div className="flex flex-col h-full bg-slate-50 absolute inset-0 overflow-hidden">
      {/* Header Premium */}
      <div className="bg-indigo-600 rounded-b-[2.5rem] px-5 pt-6 pb-8 shadow-xl shrink-0 relative z-20 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute top-10 left-0 w-32 h-32 bg-indigo-400 opacity-20 rounded-full blur-2xl"></div>

        <div className="flex items-center gap-4 relative z-10 mb-5">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md active:scale-95 transition-transform border border-white/20"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-black text-2xl tracking-tight leading-none mb-1">Borrador de Examen</h1>
            <p className="text-indigo-100 font-medium text-xs uppercase tracking-wider">Paso 2: Generación AI</p>
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-28 mb-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-full">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
              <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin absolute" />
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                 <FileSignature className="w-8 h-8 text-indigo-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Compilando Examen</h2>
            <p className="text-slate-500 text-sm max-w-[250px]">
              Analizando los campos formativos de los proyectos seleccionados e integrando reactivos...
            </p>
          </div>
        ) : error ? (
           <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-3xl border border-red-100 mt-4 h-64">
             <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
             <p className="text-red-700 font-bold text-lg mb-2">Error de Generación</p>
             <p className="text-red-500 text-sm mb-6">{error}</p>
             <button onClick={() => navigate(-1)} className="bg-red-100 text-red-700 font-bold py-2 px-6 rounded-full hover:bg-red-200">
               Regresar
             </button>
           </div>
        ) : exam ? (
           <AnimatePresence>
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100"
             >
                <div className="flex justify-center mb-6">
                   <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center ring-8 ring-emerald-50/50">
                     <CheckCircle2 className="w-10 h-10" />
                   </div>
                </div>

                <h2 className="text-2xl font-black text-center text-slate-800 tracking-tight leading-tight mb-2">
                  ¡Estructura Generada con Éxito!
                </h2>
                <p className="text-center text-slate-500 text-sm mb-8 px-4">
                  El sistema ha correlacionado los contenidos y construido los reactivos base para tu trimestre.
                </p>

                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100">
                     <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                       <FileText className="w-5 h-5 text-indigo-500" />
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Título del Borrador</p>
                       <p className="text-sm font-bold text-slate-800">{exam.title}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reactivos</p>
                       <p className="text-3xl font-black text-indigo-600 leading-none">{exam.total_questions}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center flex flex-col items-center justify-center">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Proyectos</p>
                       <p className="text-xl font-bold text-slate-700 leading-none">{exam.projects_included.length}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100">
                     <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                       <Calendar className="w-5 h-5 text-slate-400" />
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha de Creación</p>
                       <p className="text-sm font-semibold text-slate-600">
                         {new Date(exam.generated_at).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                       </p>
                     </div>
                  </div>
                </div>

             </motion.div>
           </AnimatePresence>
        ) : null}
      </div>

      {/* Floating Bottom Bar */}
      {exam && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 pt-4 pb-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-30">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 rounded-[1.5rem] font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20"
          >
            Guardar en mi Biblioteca
          </button>
          <button 
            onClick={() => alert('Pantalla de edición de reactivos próxima a implementarse')}
            className="w-full py-3 mt-2 rounded-[1.5rem] font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
          >
            Revisar y Editar Reactivos
          </button>
        </div>
      )}
    </div>
  );
}
