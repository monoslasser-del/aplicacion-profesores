import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save, Calendar as CalendarIcon, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import { calendarService, CalendarEvent, EventType } from '../../services/calendarService';

const EVENT_TYPES: { value: string; label: string }[] = [
  { value: 'inicio_fin', label: 'Inicio/Fin de Curso' },
  { value: 'cte', label: 'Consejo Técnico' },
  { value: 'descarga', label: 'Descarga Administrativa' },
  { value: 'festivo', label: 'Día Festivo / Suspensión' },
  { value: 'vacaciones', label: 'Vacaciones' },
  { value: 'registro', label: 'Periodo de Evaluación' },
  { value: 'taller', label: 'Taller Intensivo' },
  { value: 'custom', label: 'Personalizado (Color manual)' }
];

const PRESET_COLORS = [
  { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', name: 'Rojo' },
  { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500', name: 'Naranja' },
  { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', name: 'Amarillo' },
  { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', name: 'Verde' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500', name: 'Esmeralda' },
  { bg: 'bg-teal-100', text: 'text-teal-800', dot: 'bg-teal-500', name: 'Turquesa' },
  { bg: 'bg-cyan-100', text: 'text-cyan-800', dot: 'bg-cyan-500', name: 'Cian' },
  { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', name: 'Azul' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500', name: 'Índigo' },
  { bg: 'bg-violet-100', text: 'text-violet-800', dot: 'bg-violet-500', name: 'Violeta' },
  { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500', name: 'Morado' },
  { bg: 'bg-pink-100', text: 'text-pink-800', dot: 'bg-pink-500', name: 'Rosa' },
  { bg: 'bg-slate-100', text: 'text-slate-800', dot: 'bg-slate-500', name: 'Gris' },
];

export function AddCalendarEventScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<EventType | string>('cte');
  
  // States for custom color
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !type) {
      alert("Por favor completa todos los campos requeridos.");
      return;
    }

    setLoading(true);
    try {
      const eventPayload: CalendarEvent = {
        title,
        date,
        type,
      };

      if (type === 'custom') {
        const color = PRESET_COLORS[selectedColorIdx];
        eventPayload.bg_color = color.bg;
        eventPayload.text_color = color.text;
        eventPayload.dot_color = color.dot;
      }

      await calendarService.createEvent(eventPayload);
      alert("¡Evento agregado con éxito al calendario!");
      navigate('/calendar');
    } catch (error: any) {
      alert("Error al guardar el evento: " + (error.message || 'Desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full min-h-0 bg-slate-50 overflow-hidden relative">
      <div className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617] p-6 pb-12 shrink-0 relative z-20">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-white active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white text-lg font-bold tracking-wide">Nuevo Evento</h1>
          <div className="w-10 h-10" />
        </div>
        <p className="text-blue-200 text-sm text-center">Agrega una nueva fecha importante al calendario escolar.</p>
      </div>

      <div className="flex-1 px-5 -mt-6 pb-24 overflow-y-auto z-30">
        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100 flex flex-col gap-6">
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Título del Evento</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Junta de Padres"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Fecha</label>
            <div className="relative">
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Tipo de Evento</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
            >
              {EVENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <motion.div 
            initial={false}
            animate={{ height: type === 'custom' ? 'auto' : 0, opacity: type === 'custom' ? 1 : 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-2">
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-500" />
                Elige un Color
              </label>
              
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-3">
                {PRESET_COLORS.map((c, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedColorIdx(idx)}
                    className={`
                      aspect-square rounded-2xl flex flex-col items-center justify-center transition-all ${c.bg}
                      ${selectedColorIdx === idx ? 'ring-2 ring-emerald-500 ring-offset-2 scale-110 shadow-md' : 'shadow-sm hover:scale-105 opacity-80'}
                    `}
                  >
                    <div className={`w-3 h-3 rounded-full ${c.dot}`}></div>
                  </button>
                ))}
              </div>
              
              <p className="text-xs text-slate-500 font-medium mt-2 text-center">
                Color seleccionado: <b className="text-slate-800">{PRESET_COLORS[selectedColorIdx].name}</b>
              </p>
            </div>
          </motion.div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Evento'}
          </button>
        </form>
      </div>

    </div>
  );
}
