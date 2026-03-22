import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft, CheckSquare, Square, FileSignature, 
  MapPin, BookOpen, Calculator, HeartHandshake, CheckCircle2, ChevronRight, Loader2, AlertCircle
} from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

// Configuración visual de Campos Formativos
const CAMPOS = {
  lenguajes: { name: 'Lenguajes', color: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50', icon: BookOpen },
  saberes: { name: 'Saberes', color: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50', icon: Calculator },
  etica: { name: 'Ética y Nat.', color: 'bg-purple-500', text: 'text-purple-600', bg: 'bg-purple-50', icon: MapPin },
  comunitario: { name: 'De lo Humano', color: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50', icon: HeartHandshake }
};

interface Project {
  id: number;
  title: string;
  field: keyof typeof CAMPOS;
  reactivos_count: number;
}

export function ExamBuilderScreen() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Carga y Preselección Dinámica
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Consumir el endpoint implementado en el backend
        const response = await apiClient.get<{ success: boolean; data: Project[] }>('/v1/exams/projects/completed');
        
        if (response.success && response.data) {
          setProjects(response.data);
          // Nacer marcados por defecto en el estado local
          setSelectedIds(new Set(response.data.map(p => p.id)));
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar los proyectos.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // 2. Interactividad (Toggle Selection)
  const toggleSelection = (id: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === projects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(projects.map(p => p.id)));
    }
  };

  // 3. Navegación Asíncrona con datos
  const handleNextStep = () => {
    // Se prepara enviar únicamente los IDs al Paso 2
    const idsArray = Array.from(selectedIds);
    navigate('/exam-builder-step2', { state: { project_ids: idsArray } });
  };

  // Cálculo derivado dinámico
  const totalQuestions = Array.from(selectedIds).reduce((acc, id) => {
    const p = projects.find(proj => proj.id === id);
    return acc + (p?.reactivos_count || 0);
  }, 0);

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
            <h1 className="text-white font-black text-2xl tracking-tight leading-none mb-1">Generador de Exámenes</h1>
            <p className="text-indigo-100 font-medium text-xs uppercase tracking-wider">Alineado a la NEM</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0 shadow-inner">
               <FileSignature className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm mb-0.5">Paso 1: Selección de Proyectos</h2>
              <p className="text-indigo-100 text-[11px] leading-tight font-medium">
                Selecciona los proyectos abordados en clase. El sistema preparará un banco de preguntas alineado.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-28 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-800 font-bold text-lg">Proyectos Abordados</h3>
          <button 
            disabled={loading || !!error || projects.length === 0}
            onClick={selectAll}
            className="text-indigo-600 font-bold text-xs uppercase tracking-wider bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            {selectedIds.size === projects.length && projects.length > 0 ? 'Desmarcar Todos' : 'Seleccionar Todos'}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-3xl border border-red-100 mt-4">
            <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
            <p className="text-red-700 font-semibold mb-1">{error}</p>
            <p className="text-red-500 text-xs">Asegúrate de tener conexión y vuelve a intentar.</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border border-slate-100 mt-4 shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-600 font-bold mb-1">Sin proyectos terminados</p>
            <p className="text-slate-400 text-xs">Finaliza al menos un proyecto en el aula para poder incluirlo al examen trimestral.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {projects.map((project, i) => {
                const field = CAMPOS[project.field] || CAMPOS.saberes;
                const Icon = field.icon;
                const isSelected = selectedIds.has(project.id);

                return (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={project.id}
                    onClick={() => toggleSelection(project.id)}
                    className={`w-full text-left p-4 rounded-3xl border-2 transition-all active:scale-[0.98] flex items-center gap-4 ${
                      isSelected 
                        ? 'bg-indigo-50 border-indigo-500 shadow-md shadow-indigo-100' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-base truncate mb-1 ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                        {project.title}
                      </h4>
                      <div className="flex items-center gap-2">
                         <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${field.bg} ${field.text}`}>
                           <Icon className="w-3 h-3" />
                           {field.name}
                         </span>
                      </div>
                    </div>
                    
                    <div className={`text-center shrink-0 px-3 py-1.5 rounded-xl border ${
                       isSelected ? 'bg-white border-indigo-200 shadow-sm' : 'bg-slate-50 border-slate-100'
                    }`}>
                      <span className={`block text-lg font-black leading-none ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {project.reactivos_count}
                      </span>
                      <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Preg.</span>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Floating Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 pt-4 pb-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
             </div>
             <div>
               <p className="text-sm font-bold text-slate-800">Resumen del Examen</p>
               <p className="text-slate-500 text-xs font-medium">
                 {selectedIds.size} {selectedIds.size === 1 ? 'proyecto' : 'proyectos'} = <strong className="text-emerald-600">{totalQuestions} preguntas</strong>
               </p>
             </div>
          </div>
        </div>

        <button 
          disabled={selectedIds.size === 0 || loading}
          onClick={handleNextStep}
          className={`w-full py-4 rounded-[1.5rem] font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl ${
            selectedIds.size > 0 
              ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20' 
              : 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed'
          }`}
        >
          <span>Siguiente: Configurar</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
