import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, BookOpen, Sparkles, TrendingUp, Trophy, LibraryBig, Languages, Microscope, Users, HeartHandshake, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { gradeStatsService, type StudentWork } from '../../../services/gradeStatsService';

type FormativeField = string;

const fieldConfig: Record<string, { color: string; icon: any; bg: string; text: string }> = {
  'lenguajes': {
    color: 'from-purple-500 to-pink-500', icon: Languages,
    bg: 'bg-purple-100', text: 'text-purple-700'
  },
  'saberes': {
    color: 'from-cyan-500 to-blue-500', icon: Microscope,
    bg: 'bg-cyan-100', text: 'text-cyan-700'
  },
  'etica': {
    color: 'from-emerald-500 to-teal-500', icon: Users,
    bg: 'bg-emerald-100', text: 'text-emerald-700'
  },
  'comunitario': {
    color: 'from-orange-500 to-amber-500', icon: HeartHandshake,
    bg: 'bg-orange-100', text: 'text-orange-700'
  },
  'general': {
    color: 'from-gray-600 to-gray-800', icon: BookOpen,
    bg: 'bg-gray-100', text: 'text-gray-700'
  },
};

function getFieldConfig(slug: string) {
  // Busca la clave que esté incluida en el slug del backend
  const key = Object.keys(fieldConfig).find(k => slug?.toLowerCase().includes(k)) ?? 'general';
  return fieldConfig[key];
}

export function StudentWorksScreen() {
  const navigate   = useNavigate();
  const { id }     = useParams();
  const [works, setWorks]             = useState<StudentWork[]>([]);
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading]         = useState(true);
  const [selectedField, setSelectedField] = useState<string>('Todos');

  // Carga real desde el backend
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    gradeStatsService.getStudentWorks(id)
      .then(res => {
        setStudentName(res.student.name);
        setWorks(res.works);
      })
      .catch(err => {
        console.error('Error cargando trabajos:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Campos únicos para el filtro
  const fields = useMemo(() => ['Todos', ...Array.from(new Set(works.map(w => w.field)))], [works]);

  const filteredWorks = useMemo(() => {
    if (selectedField === 'Todos') return works;
    return works.filter(w => w.field === selectedField);
  }, [works, selectedField]);

  // Estadísticas del filtro actual
  const stats = useMemo(() => {
    if (filteredWorks.length === 0) return { avg: '—', count: 0, highest: null };
    const sum = filteredWorks.reduce((acc, w) => acc + w.score, 0);
    const avg = sum / filteredWorks.length;
    const highest = [...filteredWorks].sort((a, b) => b.score - a.score)[0];
    return { avg: avg.toFixed(1), count: filteredWorks.length, highest };
  }, [filteredWorks]);

  // Pista de progreso circular
  const CircularProgress = ({ value, colorClass }: { value: number; colorClass: string }) => {
    const circumference = 2 * Math.PI * 18;
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
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-white px-5 pt-8 pb-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] z-20 shrink-0 border-b border-gray-100 flex items-center gap-4"
      >
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black text-gray-900 tracking-tight truncate">
            {studentName || 'Registro de Trabajos'}
          </h1>
          <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider mt-0.5">Campos Formativos</p>
        </div>
      </motion.div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      )}

      {!loading && (
        <>
          {/* ── Selector de Campos ── */}
          <div className="bg-white shadow-sm border-b border-gray-100 shrink-0">
            <div className="flex overflow-x-auto hide-scrollbar px-4 py-3 gap-2 snap-x">
              {fields.map(field => {
                const isSelected = selectedField === field;
                const config = field === 'Todos' ? null : getFieldConfig(field);
                return (
                  <button
                    key={field}
                    onClick={() => setSelectedField(field)}
                    className={`snap-start shrink-0 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 border ${
                      isSelected
                        ? config
                          ? `bg-gradient-to-r ${config.color} border-transparent text-white shadow-md`
                          : 'bg-gray-900 border-gray-900 text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {field === 'Todos' ? <LibraryBig className="w-4 h-4" /> : null}
                    {field === 'Todos' ? 'Todos' : field}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-10">
            {/* ── Stats Banner ── */}
            <div className="px-5 mt-6 mb-6">
              <motion.div
                key={selectedField}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`rounded-3xl p-5 relative overflow-hidden text-white shadow-lg ${
                  selectedField === 'Todos'
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900'
                    : `bg-gradient-to-br ${getFieldConfig(selectedField).color}`
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">
                      Promedio en {selectedField === 'Todos' ? 'General' : 'Campo'}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black">{stats.avg}</span>
                      {stats.avg !== '—' && <span className="text-xl text-white/50 font-bold">/ 10</span>}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-center">
                    <Trophy className="w-6 h-6 text-yellow-300 mx-auto mb-1" />
                    <p className="text-xs font-bold text-white/90">{stats.count} Actividades</p>
                  </div>
                </div>
                {stats.highest && (
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
                    <p className="text-xs text-white/90 font-medium truncate">
                      Mejor trabajo: <strong>{stats.highest.title}</strong> ({stats.highest.score})
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* ── Lista de Trabajos ── */}
            <div className="px-5 space-y-3">
              {filteredWorks.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                  <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-bold mb-1">Sin Registros</p>
                  <p className="text-gray-400 text-sm">No hay trabajos evaluados{selectedField !== 'Todos' ? ' en este campo' : ''}.</p>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredWorks.map((work, i) => {
                    const config = getFieldConfig(work.field);
                    const typeBg =
                      work.type === 'Examen'       ? 'bg-red-50 text-red-600 border-red-100' :
                      work.type === 'Proyecto'      ? 'bg-purple-50 text-purple-600 border-purple-100' :
                      work.type === 'Participación' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                      'bg-blue-50 text-blue-600 border-blue-100';
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: Math.min(i * 0.05, 0.3) }}
                        key={work.id}
                        className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100/80 flex items-center gap-4"
                      >
                        <CircularProgress value={work.score} colorClass={config.text} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${typeBg}`}>
                              {work.type}
                            </span>
                            <span className="text-gray-400 text-[10px] font-medium">{work.date}</span>
                          </div>
                          <h3 className="text-gray-900 font-bold text-[15px] truncate">{work.title}</h3>
                          {selectedField === 'Todos' && (
                            <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 truncate ${config.text}`}>
                              • {work.field}
                            </p>
                          )}
                          {work.feedback && (
                            <p className="text-gray-500 text-xs mt-1.5 leading-snug truncate">"{work.feedback}"</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
