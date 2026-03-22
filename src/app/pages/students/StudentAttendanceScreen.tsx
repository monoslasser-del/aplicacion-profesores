import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import {ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth,
  isSameDay, isToday, isWeekend
} from 'date-fns';
import { es } from 'date-fns/locale';

// Simulación de una base de datos de asistencias por fecha 'YYYY-MM-DD'
// Se puede expandir o recibir por API en un futuro.
const generateMockAttendance = () => {
  const map: Record<string, 'present' | 'absent' | 'late'> = {};
  const current = new Date();
  for (let i = 0; i < 45; i++) {
    const d = new Date(current);
    d.setDate(d.getDate() - i);
    if (isWeekend(d)) continue; // No hay clases sabados/domingos
    const dateStr = format(d, 'yyyy-MM-dd');
    const rand = Math.random();
    if (rand > 0.90) map[dateStr] = 'absent';
    else if (rand > 0.82) map[dateStr] = 'late';
    else map[dateStr] = 'present';
  }
  return map;
};

export function StudentAttendanceScreen() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState<'all' | 'present' | 'absent' | 'late'>('all');
  const [attendanceData] = useState(() => generateMockAttendance());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const monthStats = useMemo(() => {
    let present = 0, absent = 0, late = 0, total = 0;
    days.forEach(day => {
      if (isSameMonth(day, currentDate) && !isWeekend(day) && day <= new Date()) {
        total++;
        const status = attendanceData[format(day, 'yyyy-MM-dd')];
        if (status === 'present') present++;
        else if (status === 'absent') absent++;
        else if (status === 'late') late++;
      }
    });
    const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;
    return { present, absent, late, rate: attendanceRate };
  }, [days, attendanceData, currentDate]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'present') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (status === 'absent') return <XCircle className="w-4 h-4 text-rose-500" />;
    if (status === 'late') return <Clock className="w-4 h-4 text-amber-500" />;
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] absolute inset-0 overflow-hidden font-sans">
      {/* ── Navbar ── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white px-5 pt-8 pb-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] z-20 shrink-0 flex items-center gap-4 rounded-b-3xl"
      >
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Historial de Asistencia</h1>
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mt-0.5">Reporte del Ciclo Escolar</p>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto pb-10">
        
        {/* ── Tarjeta de Progreso ── */}
        <div className="px-5 mt-6 mb-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-3xl p-6 shadow-xl shadow-blue-500/20 text-white relative overflow-hidden"
          >
            {/* Shapes abstractos de fondo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-5 -mb-5"></div>

            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Índice del mes</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter">{monthStats.rate}</span>
                  <span className="text-2xl font-bold text-blue-200">%</span>
                </div>
                <p className="text-blue-50/80 text-xs mt-2 font-medium max-w-[140px] leading-snug">
                  {monthStats.rate >= 90 ? '¡Excelente! Estudiante ejemplar este mes.' : 'Atención: por debajo del 90% recomendado.'}
                </p>
              </div>
              
              {/* Resumen lateral */}
              <div className="flex flex-col gap-2">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-3 py-2 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <div>
                    <p className="text-[10px] text-blue-100 uppercase tracking-wider font-bold">Presente</p>
                    <p className="text-sm font-black leading-none">{monthStats.present} d</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-3 py-2 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                  <div>
                    <p className="text-[10px] text-blue-100 uppercase tracking-wider font-bold">Faltas</p>
                    <p className="text-sm font-black leading-none">{monthStats.absent} d</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Filtros Innovadores ── */}
        <div className="px-5 mb-6">
          <div className="flex bg-gray-100/80 p-1.5 rounded-2xl gap-1">
            {['all', 'present', 'late', 'absent'].map((f) => {
              const isActive = filter === f;
              const labels: Record<string, string> = { all: 'Todos', present: 'Asistió', late: 'Retardos', absent: 'Faltó' };
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    isActive ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:bg-gray-200/50'
                  }`}
                >
                  {labels[f]}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Calendario Dinámico ── */}
        <div className="px-5">
          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
            {/* Controles de Mes */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-50 active:scale-90 transition-transform text-gray-400">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-black text-gray-800 uppercase tracking-widest cursor-default">
                {format(currentDate, 'MMMM yyyy', { locale: es })}
              </h2>
              <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-50 active:scale-90 transition-transform text-gray-400">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-gray-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid de Mes */}
            <motion.div 
              className="grid grid-cols-7 gap-2"
              initial={false}
              animate={{ opacity: 1 }}
            >
              {days.map((day, i) => {
                const isCurrentMonth = isSameMonth(day, currentDate);
                const dateKey = format(day, 'yyyy-MM-dd');
                const rawStatus = attendanceData[dateKey] || 'none';
                const isFuture = day > new Date();
                const weekend = isWeekend(day);
                
                // Aplicar fade por filtro
                const isFaded = !isCurrentMonth || isFuture || weekend || 
                  (filter !== 'all' && rawStatus !== filter);

                // Colores para el estado
                let bgClass = "bg-gray-50 border border-gray-100 text-gray-600";
                if (!isFaded && rawStatus === 'present') bgClass = "bg-emerald-50 border-emerald-200 text-emerald-700 ring-1 ring-emerald-500/20";
                if (!isFaded && rawStatus === 'absent') bgClass = "bg-rose-50 border-rose-200 text-rose-700 ring-1 ring-rose-500/20";
                if (!isFaded && rawStatus === 'late') bgClass = "bg-amber-50 border-amber-200 text-amber-700 ring-1 ring-amber-500/20";

                const isTodayDay = isToday(day);

                return (
                  <motion.div
                    key={dateKey}
                    whileTap={!isFaded && !weekend && !isFuture ? { scale: 0.85 } : {}}
                    className={`
                      relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300
                      ${bgClass}
                      ${isFaded ? 'opacity-30 scale-95 grayscale' : 'hover:shadow-sm cursor-pointer'}
                      ${isTodayDay ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                    `}
                  >
                    <span className="text-[13px] font-bold z-10">{format(day, 'd')}</span>
                    {/* Puntitos de estado miniatura */}
                    {!isFaded && rawStatus !== 'none' && (
                      <div className="absolute top-1 right-1">
                        <StatusIcon status={rawStatus} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
}
