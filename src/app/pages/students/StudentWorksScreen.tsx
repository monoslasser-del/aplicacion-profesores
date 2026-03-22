import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import {ArrowLeft, BookOpen, Star, Sparkles, TrendingUp, Trophy, LibraryBig, Languages, Microscope, Users, HeartHandshake} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// === Tipos de datos simulados ===
type FormativeField = 'Lenguajes' | 'Saberes y Pensamiento Científico' | 'Ética, Naturaleza y Sociedades' | 'De lo Humano y lo Comunitario';

interface WorkItem {
  id: string;
  field: FormativeField;
  title: string;
  type: 'Proyecto' | 'Examen' | 'Tarea' | 'Participación';
  score: number;
  maxScore: number;
  date: string;
  feedback: string;
}

const mockWorks: WorkItem[] = [
  { id: '1', field: 'Lenguajes', title: 'Ensayo Literario', type: 'Proyecto', score: 9.5, maxScore: 10, date: '12 Nov', feedback: 'Excelente redacción.' },
  { id: '2', field: 'Lenguajes', title: 'Examen Diagnóstico', type: 'Examen', score: 8.0, maxScore: 10, date: '05 Nov', feedback: 'Mejorar ortografía.' },
  { id: '3', field: 'Saberes y Pensamiento Científico', title: 'Feria de Ciencias', type: 'Proyecto', score: 10, maxScore: 10, date: '15 Oct', feedback: 'Proyecto destacado.' },
  { id: '4', field: 'Saberes y Pensamiento Científico', title: 'Práctica #2', type: 'Tarea', score: 7.5, maxScore: 10, date: '10 Oct', feedback: 'Faltó conclusión.' },
  { id: '5', field: 'Ética, Naturaleza y Sociedades', title: 'Debate Histórico', type: 'Participación', score: 9.0, maxScore: 10, date: '22 Nov', feedback: 'Buenos argumentos.' },
  { id: '6', field: 'De lo Humano y lo Comunitario', title: 'Circuito Motriz', type: 'Examen', score: 10, maxScore: 10, date: '01 Nov', feedback: 'Desempeño atlético alto.' }
];

const fieldConfig = {
  'Lenguajes': { color: 'from-purple-500 to-pink-500', icon: Languages, bg: 'bg-purple-100', text: 'text-purple-700' },
  'Saberes y Pensamiento Científico': { color: 'from-cyan-500 to-blue-500', icon: Microscope, bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'Ética, Naturaleza y Sociedades': { color: 'from-emerald-500 to-teal-500', icon: Users, bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'De lo Humano y lo Comunitario': { color: 'from-orange-500 to-amber-500', icon: HeartHandshake, bg: 'bg-orange-100', text: 'text-orange-700' },
};

export function StudentWorksScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedField, setSelectedField] = useState<FormativeField | 'Todos'>('Todos');
  const [works] = useState<WorkItem[]>(mockWorks);

  // Filtrado
  const filteredWorks = useMemo(() => {
    if (selectedField === 'Todos') return works;
    return works.filter(w => w.field === selectedField);
  }, [works, selectedField]);

  // Estadísticas del filtro actual
  const stats = useMemo(() => {
    if (filteredWorks.length === 0) return { avg: 0, count: 0, highest: null };
    const sum = filteredWorks.reduce((acc, w) => acc + (w.score / w.maxScore) * 10, 0);
    const avg = sum / filteredWorks.length;
    const highest = [...filteredWorks].sort((a, b) => (b.score / b.maxScore) - (a.score / a.maxScore))[0];
    return { avg: avg.toFixed(1), count: filteredWorks.length, highest };
  }, [filteredWorks]);

  // Pista de progreso circular
  const CircularProgress = ({ value, colorClass }: { value: number, colorClass: string }) => {
    const circumference = 2 * Math.PI * 18; // r=18
    const strokeDashoffset = circumference - (value / 10) * circumference;
    return (
      <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
        <svg className="w-12 h-12 transform -rotate-90">
          <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="4" fill="transparent"
            strokeDasharray={circumference}
            className={colorClass}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute font-black text-xs ${colorClass}`}>{value}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] absolute inset-0 overflow-hidden font-sans">
      {/* ── Navbar ── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white px-5 pt-8 pb-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] z-20 shrink-0 border-b border-gray-100 flex items-center gap-4"
      >
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Registro de Trabajos</h1>
          <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider mt-0.5">Campos Formativos</p>
        </div>
      </motion.div>

      {/* ── Selector de Campos Formativos (Scroll Horizontal) ── */}
      <div className="bg-white shadow-sm border-b border-gray-100 shrink-0">
        <div className="flex overflow-x-auto hide-scrollbar px-4 py-3 gap-2 snap-x">
          <button
            onClick={() => setSelectedField('Todos')}
            className={`snap-start shrink-0 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 border
              ${selectedField === 'Todos' ? 'bg-gray-900 border-gray-900 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <LibraryBig className="w-4 h-4" /> Todos
          </button>
          
          {(Object.keys(fieldConfig) as FormativeField[]).map(field => {
            const isSelected = selectedField === field;
            const config = fieldConfig[field];
            const Icon = config.icon;
            
            return (
              <button
                key={field}
                onClick={() => setSelectedField(field)}
                className={`snap-start shrink-0 px-4 py-2.5 rounded-2xl text-[13px] font-bold transition-all flex items-center gap-2 border
                  ${isSelected ? `bg-gradient-to-r ${config.color} border-transparent text-white shadow-md` : `bg-white ${config.text} border-${config.bg.split('-')[1]}-200 hover:${config.bg}`}`}
              >
                <Icon className="w-4 h-4" />
                {field}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-10">
        
        {/* ── Estadísticas Rápidas del Filtro ── */}
        <div className="px-5 mt-6 mb-6">
          <motion.div 
            key={selectedField}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl p-5 relative overflow-hidden text-white shadow-lg transition-colors
              ${selectedField === 'Todos' ? 'bg-gradient-to-br from-gray-800 to-gray-900' : `bg-gradient-to-br ${fieldConfig[selectedField as FormativeField].color}`}
            `}
          >
            {/* Shapes */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">
                  Promedio en {selectedField === 'Todos' ? 'General' : 'Campo'}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">{stats.avg}</span>
                  <span className="text-xl text-white/50 font-bold">/ 10</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-center">
                <Trophy className="w-6 h-6 text-yellow-300 mx-auto mb-1" />
                <p className="text-xs font-bold text-white/90">{stats.count} Actividades</p>
              </div>
            </div>
            
            {stats.highest && (
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <p className="text-xs text-white/90 font-medium truncate">
                  Mejor trabajo: <strong>{stats.highest.title}</strong> ({stats.highest.score})
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Lista de Trabajos ── */}
        <div className="px-5 space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredWorks.length > 0 ? filteredWorks.map((work, i) => {
              const bgBadge = work.type === 'Examen' ? 'bg-red-50 text-red-600 border-red-100' :
                              work.type === 'Proyecto' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                              work.type === 'Participación' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-blue-50 text-blue-600 border-blue-100';
              
              const fieldStyle = fieldConfig[work.field];
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  key={work.id}
                  className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100/80 flex items-center gap-4 group"
                >
                  <CircularProgress value={work.score} colorClass={fieldStyle.text} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${bgBadge}`}>
                        {work.type}
                      </span>
                      <span className="text-gray-400 text-[10px] font-medium flex items-center gap-1">
                        {work.date}
                      </span>
                    </div>
                    <h3 className="text-gray-900 font-bold text-[15px] truncate">{work.title}</h3>
                    
                    {/* Badge del Campo Formativo (Solo s es "Todos" para saber a que pertenece) */}
                    {selectedField === 'Todos' && (
                      <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 truncate ${fieldStyle.text}`}>
                        • {work.field}
                      </p>
                    )}
                    
                    {work.feedback && (
                      <p className="text-gray-500 text-xs mt-1.5 leading-snug truncate">
                        "{work.feedback}"
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            }) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-bold mb-1">Sin Registros</p>
                <p className="text-gray-400 text-sm">No hay trabajos evaluados en este campo.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
