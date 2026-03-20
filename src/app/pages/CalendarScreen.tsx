import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calendarService, type CalendarEvent as ApiCalendarEvent } from '../../services/calendarService';

// Definición aproximada del Calendario SEP 2025-2026
// Basado en la estructura estándar de 190 días efectivos de clase.
// Los meses abarcan desde Agosto 2025 hasta Julio 2026.

type EventType = 'inicio_fin' | 'cte' | 'descarga' | 'festivo' | 'vacaciones' | 'registro' | 'taller' | 'custom';

interface CalendarEvent {
  id?: number;
  date: string; // YYYY-MM-DD
  title: string;
  type: EventType | string;
  bg_color?: string;
  text_color?: string;
  dot_color?: string;
}

const SEP_EVENTS: CalendarEvent[] = [
  // Agosto 2025
  { date: '2025-08-18', title: 'Fase Intensiva CTE / Taller Docente', type: 'taller' },
  { date: '2025-08-19', title: 'Fase Intensiva CTE / Taller Docente', type: 'taller' },
  { date: '2025-08-20', title: 'Fase Intensiva CTE / Taller Docente', type: 'taller' },
  { date: '2025-08-21', title: 'Fase Intensiva CTE / Taller Docente', type: 'taller' },
  { date: '2025-08-22', title: 'Fase Intensiva CTE / Taller Docente', type: 'taller' },
  { date: '2025-08-25', title: 'Inicio de Clases Ciclo 2025-2026', type: 'inicio_fin' },
  
  // Septiembre 2025
  { date: '2025-09-16', title: 'Día de la Independencia (Suspensión)', type: 'festivo' },
  { date: '2025-09-26', title: 'Consejo Técnico Escolar', type: 'cte' },
  
  // Octubre 2025
  { date: '2025-10-31', title: 'Consejo Técnico Escolar', type: 'cte' },
  
  // Noviembre 2025
  { date: '2025-11-17', title: 'Día de la Revolución Mexicana (Suspensión)', type: 'festivo' },
  { date: '2025-11-21', title: 'Descarga Administrativa', type: 'descarga' },
  { date: '2025-11-24', title: 'Entrega de Boletas', type: 'registro' },
  { date: '2025-11-25', title: 'Entrega de Boletas', type: 'registro' },
  { date: '2025-11-26', title: 'Entrega de Boletas', type: 'registro' },
  { date: '2025-11-27', title: 'Entrega de Boletas', type: 'registro' },
  { date: '2025-11-28', title: 'Consejo Técnico Escolar', type: 'cte' },

  // Diciembre 2025
  { date: '2025-12-18', title: 'Inicio Vacaciones de Invierno', type: 'vacaciones' },
  { date: '2025-12-19', title: 'Vacaciones de Invierno', type: 'vacaciones' },
  { date: '2025-12-22', title: 'Vacaciones de Invierno', type: 'vacaciones' },
  { date: '2025-12-23', title: 'Vacaciones de Invierno', type: 'vacaciones' },
  { date: '2025-12-24', title: 'Vacaciones de Invierno', type: 'vacaciones' },
  { date: '2025-12-25', title: 'Navidad (Vacaciones)', type: 'vacaciones' },
  { date: '2025-12-26', title: 'Vacaciones de Invierno', type: 'vacaciones' },
  { date: '2025-12-29', title: 'Vacaciones de Invierno', type: 'vacaciones' },
  { date: '2025-12-30', title: 'Vacaciones de Invierno', type: 'vacaciones' },
  { date: '2025-12-31', title: 'Vacaciones de Invierno', type: 'vacaciones' },

  // Enero 2026
  { date: '2026-01-01', title: 'Año Nuevo', type: 'vacaciones' },
  { date: '2026-01-02', title: 'Vacaciones de Invierno', type: 'vacaciones' },
  { date: '2026-01-05', title: 'Taller Intensivo para Directivos', type: 'taller' },
  { date: '2026-01-06', title: 'Taller Intersivo para Docentes', type: 'taller' },
  { date: '2026-01-07', title: 'Taller Intersivo para Docentes', type: 'taller' },
  { date: '2026-01-08', title: 'Reinicio de Clases', type: 'inicio_fin' },
  { date: '2026-01-30', title: 'Consejo Técnico Escolar', type: 'cte' },

  // Febrero 2026
  { date: '2026-02-02', title: 'Promulgación Constitución (Día Festivo)', type: 'festivo' },
  { date: '2026-02-27', title: 'Consejo Técnico Escolar', type: 'cte' },

  // Marzo 2026
  { date: '2026-03-13', title: 'Descarga Administrativa', type: 'descarga' },
  { date: '2026-03-16', title: 'Natalicio Benito Juárez (Día Festivo)', type: 'festivo' },
  { date: '2026-03-17', title: 'Entrega de Boletas', type: 'registro' },
  { date: '2026-03-18', title: 'Entrega de Boletas', type: 'registro' },
  { date: '2026-03-19', title: 'Entrega de Boletas', type: 'registro' },
  { date: '2026-03-20', title: 'Entrega de Boletas', type: 'registro' },
  { date: '2026-03-27', title: 'Consejo Técnico Escolar', type: 'cte' },
  { date: '2026-03-30', title: 'Inicio Vacaciones Semana Santa', type: 'vacaciones' },
  { date: '2026-03-31', title: 'Vacaciones Semana Santa', type: 'vacaciones' },

  // Abril 2026
  { date: '2026-04-01', title: 'Vacaciones Semana Santa', type: 'vacaciones' },
  { date: '2026-04-02', title: 'Vacaciones Semana Santa', type: 'vacaciones' },
  { date: '2026-04-03', title: 'Vacaciones Semana Santa', type: 'vacaciones' },
  { date: '2026-04-06', title: 'Vacaciones Semana Santa', type: 'vacaciones' },
  { date: '2026-04-07', title: 'Vacaciones Semana Santa', type: 'vacaciones' },
  { date: '2026-04-08', title: 'Vacaciones Semana Santa', type: 'vacaciones' },
  { date: '2026-04-09', title: 'Vacaciones Semana Santa', type: 'vacaciones' },
  { date: '2026-04-10', title: 'Término Vacaciones Semana Santa', type: 'vacaciones' },
  { date: '2026-04-24', title: 'Consejo Técnico Escolar', type: 'cte' },
  
  // Mayo 2026
  { date: '2026-05-01', title: 'Día del Trabajo (Suspensión)', type: 'festivo' },
  { date: '2026-05-05', title: 'Batalla de Puebla (Suspensión)', type: 'festivo' },
  { date: '2026-05-15', title: 'Día del Maestro (Suspensión)', type: 'festivo' },
  { date: '2026-05-29', title: 'Consejo Técnico Escolar', type: 'cte' },

  // Junio 2026
  { date: '2026-06-26', title: 'Consejo Técnico Escolar', type: 'cte' },

  // Julio 2026
  { date: '2026-07-10', title: 'Descarga Administrativa', type: 'descarga' },
  { date: '2026-07-13', title: 'Entrega de Boletas', type: 'registro' },
  { date: '2026-07-14', title: 'Entrega de Boletas', type: 'registro' },
  { date: '2026-07-15', title: 'Clausura Ciclo Escolar', type: 'inicio_fin' }
];

const EVENT_STYLES: Record<EventType, { bg: string, text: string, dot: string, label: string }> = {
  inicio_fin: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', label: 'Inicio/Fin de Curso' },
  cte: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', label: 'Consejo Técnico' },
  descarga: { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500', label: 'Descarga Admin' },
  festivo: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500', label: 'Suspensión Labores' },
  vacaciones: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', label: 'Vacaciones' },
  registro: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500', label: 'Periodo Evaluacion' },
  taller: { bg: 'bg-pink-100', text: 'text-pink-800', dot: 'bg-pink-500', label: 'Taller Intensivo' },
  custom: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500', label: 'Evento Personalizado' }
};

const getEventStyle = (event: CalendarEvent) => {
  if (event.type === 'custom' && event.bg_color) {
    return {
      bg: event.bg_color,
      text: event.text_color || 'text-white',
      dot: event.dot_color || 'bg-white',
      label: event.type
    };
  }
  const type = (event.type as EventType) in EVENT_STYLES ? (event.type as EventType) : 'custom';
  return EVENT_STYLES[type];
};

const MONTHS = [
  { name: 'Agosto', year: 2025, days: 31, startDay: 5 }, // 1 de Agosto es Viernes (approx, adjust based on 2025)
  { name: 'Septiembre', year: 2025, days: 30, startDay: 1 }, 
  { name: 'Octubre', year: 2025, days: 31, startDay: 3 },
  { name: 'Noviembre', year: 2025, days: 30, startDay: 6 },
  { name: 'Diciembre', year: 2025, days: 31, startDay: 1 },
  { name: 'Enero', year: 2026, days: 31, startDay: 4 },
  { name: 'Febrero', year: 2026, days: 28, startDay: 0 },
  { name: 'Marzo', year: 2026, days: 31, startDay: 0 },
  { name: 'Abril', year: 2026, days: 30, startDay: 3 },
  { name: 'Mayo', year: 2026, days: 31, startDay: 5 },
  { name: 'Junio', year: 2026, days: 30, startDay: 1 },
  { name: 'Julio', year: 2026, days: 31, startDay: 3 }
];
// NOTA: StartDay (0=Domingo, 1=Lunes...) es aproximado para renderizar la cuadrícula. Se debe calcular estáticamente:
// 2025-08-01 = Viernes (5) -> comprobado.

export const CalendarScreen = () => {
  const navigate = useNavigate();
  const [currentMonthIdx, setCurrentMonthIdx] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [apiEvents, setApiEvents] = useState<ApiCalendarEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await calendarService.getEvents();
        setApiEvents(data);
      } catch (error) {
        console.error('Failed to load events', error);
      }
    };
    fetchEvents();
  }, []);

  const prevMonth = () => setCurrentMonthIdx(Math.max(0, currentMonthIdx - 1));
  const nextMonth = () => setCurrentMonthIdx(Math.min(MONTHS.length - 1, currentMonthIdx + 1));

  const monthData = MONTHS[currentMonthIdx];
  const daysArray = Array.from({ length: monthData.days }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: monthData.startDay }, (_, i) => i);

  // Pad the YYYY-MM
  const monthStr = `${monthData.year}-${String(currentMonthIdx + 8 > 12 ? currentMonthIdx - 4 : currentMonthIdx + 8).padStart(2, '0')}`;

  const getEventForDay = (day: number) => {
    const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`;
    const apiEvent = apiEvents.find(e => e.date === dateStr);
    if (apiEvent) return apiEvent;
    return SEP_EVENTS.find(e => e.date === dateStr);
  };

  // Find next upcoming event from today (simulated as current system date or minimum Aug 2025)
  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split('T')[0];
  const upcomingEvent = SEP_EVENTS.find(e => e.date >= todayStr) || SEP_EVENTS[0];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-blue-200">
      {/* Rediseño de Header usando estilo de la App */}
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
          <h1 className="text-white text-lg font-bold tracking-wide">Ciclo 2025-2026</h1>
          <div className="w-10" />
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Calendario SEP</h2>
          <p className="text-blue-200 text-sm">Oficial Diurno - Nueva Escuela Mexicana</p>
        </div>
      </div>

      <div className="flex-1 px-4 -mt-16 pb-14 overflow-y-auto z-20">
        {/* Banner de Próximo Evento */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 mb-6 flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getEventStyle(upcomingEvent).bg}`}>
            <CalendarIcon className={`w-6 h-6 ${getEventStyle(upcomingEvent).text}`} />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Siguiente Evento Escolar</span>
            <h3 className="text-gray-900 font-bold leading-tight">{upcomingEvent.title}</h3>
            <p className={`text-sm mt-1 font-semibold ${getEventStyle(upcomingEvent).text}`}>{upcomingEvent.date}</p>
          </div>
        </div>

        {/* Controles de Navegación del Mes */}
        <div className="flex justify-between items-center mb-4 px-2">
          <button onClick={prevMonth} disabled={currentMonthIdx === 0} className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h2 className="text-xl font-black text-gray-800 text-center flex-1">{monthData.name} {monthData.year}</h2>
          <button onClick={nextMonth} disabled={currentMonthIdx === MONTHS.length - 1} className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Cuadrícula del Calendario */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Do','Lu','Ma','Mi','Ju','Vi','Sá'].map((d, i) => (
              <div key={d} className={`text-center text-xs font-bold py-2 ${i === 0 || i === 6 ? 'text-gray-400' : 'text-gray-600'}`}>
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {blanksArray.map(b => (
              <div key={`blank-${b}`} className="aspect-square rounded-xl bg-gray-50/50"></div>
            ))}
            {daysArray.map(day => {
              const event = getEventForDay(day);
              const isWeekend = (day + monthData.startDay - 1) % 7 === 0 || (day + monthData.startDay - 1) % 7 === 6;
              const isToday = `${monthStr}-${String(day).padStart(2, '0')}` === todayStr;

              return (
                <button 
                  key={day}
                  onClick={() => event && setSelectedEvent(event)}
                  disabled={!event}
                  className={`
                    relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all
                    ${event ? getEventStyle(event).bg + ' shadow-sm active:scale-95' : (isWeekend ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50')}
                    ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                  `}
                >
                  <span className={`text-sm font-bold ${event ? getEventStyle(event).text : (isWeekend ? 'text-gray-400' : 'text-gray-700')}`}>
                    {day}
                  </span>
                  {event && (
                    <span className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${getEventStyle(event).dot}`}></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Info Legend */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" /> Nomenclatura Oficial
          </h3>
          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            {Object.entries(EVENT_STYLES).map(([key, style]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${style.dot} shadow-sm`} />
                <span className="text-xs text-gray-600 font-medium">{style.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl ${getEventStyle(selectedEvent).bg} border border-white/40`}
            >
               <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center bg-white shadow-sm`}>
                 <CalendarIcon className={`w-6 h-6 ${getEventStyle(selectedEvent).text}`} />
               </div>
               <h3 className={`text-xl font-black mb-1 ${getEventStyle(selectedEvent).text}`}>{selectedEvent.title}</h3>
               <p className={`text-sm font-medium ${getEventStyle(selectedEvent).text} opacity-80 mb-6`}>{selectedEvent.date}</p>
               
               <button 
                onClick={() => setSelectedEvent(null)}
                className="w-full py-3 bg-white rounded-xl font-bold text-gray-800 shadow-sm active:scale-95 transition-all"
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
