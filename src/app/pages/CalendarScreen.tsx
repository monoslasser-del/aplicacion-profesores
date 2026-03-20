import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calendarService, type CalendarEvent } from '../../services/calendarService';

type EventType = 'inicio_fin' | 'cte' | 'descarga' | 'festivo' | 'vacaciones' | 'registro' | 'taller' | 'custom';

// Solo colores del punto (dot) — sin fondos de día
const DOT_COLOR: Record<string, string> = {
  inicio_fin: 'bg-green-500',
  cte:        'bg-red-500',
  descarga:   'bg-emerald-500',
  festivo:    'bg-orange-500',
  vacaciones: 'bg-blue-500',
  registro:   'bg-purple-500',
  taller:     'bg-pink-500',
  custom:     'bg-gray-400',
};

const TYPE_LABEL: Record<string, string> = {
  inicio_fin: 'Inicio / Fin de Curso',
  cte:        'Consejo Técnico',
  descarga:   'Descarga Administrativa',
  festivo:    'Suspensión Labores',
  vacaciones: 'Vacaciones',
  registro:   'Periodo de Evaluación',
  taller:     'Taller Intensivo',
  custom:     'Evento Personalizado',
};

const MONTHS = [
  { name: 'Agosto',     year: 2025, days: 31, startDay: 5 },
  { name: 'Septiembre', year: 2025, days: 30, startDay: 1 },
  { name: 'Octubre',    year: 2025, days: 31, startDay: 3 },
  { name: 'Noviembre',  year: 2025, days: 30, startDay: 6 },
  { name: 'Diciembre',  year: 2025, days: 31, startDay: 1 },
  { name: 'Enero',      year: 2026, days: 31, startDay: 4 },
  { name: 'Febrero',    year: 2026, days: 28, startDay: 0 },
  { name: 'Marzo',      year: 2026, days: 31, startDay: 0 },
  { name: 'Abril',      year: 2026, days: 30, startDay: 3 },
  { name: 'Mayo',       year: 2026, days: 31, startDay: 5 },
  { name: 'Junio',      year: 2026, days: 30, startDay: 1 },
  { name: 'Julio',      year: 2026, days: 31, startDay: 3 },
];

export const CalendarScreen = () => {
  const navigate = useNavigate();
  const [currentMonthIdx, setCurrentMonthIdx] = useState(0);
  const [selectedEvent,   setSelectedEvent]   = useState<CalendarEvent | null>(null);
  const [apiEvents,       setApiEvents]       = useState<CalendarEvent[]>([]);
  const [loading,         setLoading]         = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await calendarService.getEvents();
        setApiEvents(data);
      } catch (error) {
        console.error('Failed to load events', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const monthData   = MONTHS[currentMonthIdx];
  const daysArray   = Array.from({ length: monthData.days }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: monthData.startDay }, (_, i) => i);

  // Date string helpers
  const nums = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7];
  const monthStr = `${monthData.year}-${String(nums[currentMonthIdx]).padStart(2, '0')}`;
  const todayStr = new Date().toISOString().split('T')[0];

  // Only API events — no static fallback
  const getEventsForDay = (day: number): CalendarEvent[] => {
    const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`;
    return apiEvents.filter(e => e.date === dateStr);
  };

  // Next upcoming event from API
  const upcomingEvent = apiEvents.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-blue-200">

      {/* Header */}
      <div className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617] p-6 pb-24 relative overflow-hidden shrink-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-blue-500/10 rotate-12 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[120%] bg-purple-500/10 -rotate-12 blur-3xl rounded-full pointer-events-none" />

        <div className="flex items-center justify-between mb-6 relative z-10">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white text-lg font-bold tracking-wide">Ciclo 2025–2026</h1>
          <div className="w-10" />
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Calendario SEP</h2>
          <p className="text-blue-200 text-sm">Oficial Diurno · Nueva Escuela Mexicana</p>
        </div>
      </div>

      <div className="flex-1 px-4 -mt-16 pb-14 overflow-y-auto z-20">

        {/* Próximo evento — solo si hay datos de API */}
        {upcomingEvent ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 mb-6 flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-gray-100`}>
              <CalendarIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Siguiente Evento Escolar</span>
              <h3 className="text-gray-900 font-bold leading-tight">{upcomingEvent.title}</h3>
              <p className="text-sm mt-1 font-semibold text-gray-500">{upcomingEvent.date}</p>
            </div>
          </div>
        ) : !loading && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 mb-6 flex items-center gap-3">
            <Info className="w-5 h-5 text-gray-400 shrink-0" />
            <p className="text-sm text-gray-500">Sin eventos próximos registrados en el servidor.</p>
          </div>
        )}

        {/* Navegación de mes */}
        <div className="flex justify-between items-center mb-4 px-2">
          <button
            onClick={() => setCurrentMonthIdx(i => Math.max(0, i - 1))}
            disabled={currentMonthIdx === 0}
            className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h2 className="text-xl font-black text-gray-800 text-center flex-1">
            {monthData.name} {monthData.year}
          </h2>
          <button
            onClick={() => setCurrentMonthIdx(i => Math.min(MONTHS.length - 1, i + 1))}
            disabled={currentMonthIdx === MONTHS.length - 1}
            className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Cuadrícula */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 mb-6">
          {/* Cabeceras días */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map((d, i) => (
              <div key={d} className={`text-center text-xs font-bold py-2 ${i === 0 || i === 6 ? 'text-gray-400' : 'text-gray-500'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Días */}
          <div className="grid grid-cols-7 gap-2">
            {blanksArray.map(b => <div key={`blank-${b}`} className="aspect-square" />)}
            {daysArray.map(day => {
              const dayEvents = getEventsForDay(day);
              const hasEvent  = dayEvents.length > 0;
              const firstEvent = hasEvent ? dayEvents[0] : null;
              const dotClass  = firstEvent ? (DOT_COLOR[firstEvent.type] ?? DOT_COLOR.custom) : '';
              const isWeekend = (day + monthData.startDay - 1) % 7 === 0 || (day + monthData.startDay - 1) % 7 === 6;
              const isToday   = `${monthStr}-${String(day).padStart(2, '0')}` === todayStr;

              return (
                <button
                  key={day}
                  disabled={!hasEvent}
                  onClick={() => firstEvent && setSelectedEvent(firstEvent)}
                  className={[
                    'relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all',
                    // Sin colorear el fondo, solo fondo neutro siempre
                    isWeekend ? 'bg-gray-50/60' : 'bg-white hover:bg-gray-50',
                    isToday   ? 'ring-2 ring-blue-500 ring-offset-1' : '',
                    hasEvent  ? 'active:scale-95 cursor-pointer' : '',
                  ].join(' ')}
                >
                  <span className={`text-sm font-bold ${isWeekend ? 'text-gray-400' : 'text-gray-700'} ${hasEvent ? 'font-black' : ''}`}>
                    {day}
                  </span>
                  {/* Dot de acotación — único indicador visual */}
                  {hasEvent && (
                    <span className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${dotClass}`} />
                  )}
                  {/* Badge si hay múltiples eventos */}
                  {dayEvents.length > 1 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-gray-700 text-white text-[8px] font-bold flex items-center justify-center">
                      {dayEvents.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Leyenda de acotaciones */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" /> Nomenclatura Oficial
          </h3>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            {Object.entries(TYPE_LABEL).filter(([k]) => k !== 'custom').map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${DOT_COLOR[key]}`} />
                <span className="text-xs text-gray-600 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de detalle */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1,   opacity: 1, y: 0  }}
              exit={  { scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl"
            >
              {/* Dot de acotación grande */}
              <div className={`w-10 h-10 rounded-full mb-4 ${DOT_COLOR[selectedEvent.type] ?? DOT_COLOR.custom} flex items-center justify-center`}>
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-1">
                {TYPE_LABEL[selectedEvent.type] ?? 'Evento'}
              </span>
              <h3 className="text-xl font-black text-gray-900 mb-1 leading-tight">{selectedEvent.title}</h3>
              <p className="text-sm text-gray-500 font-medium mb-6">{selectedEvent.date}</p>
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-3 bg-gray-100 rounded-xl font-bold text-gray-800 active:scale-95 transition-all"
              >
                Cerrar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
