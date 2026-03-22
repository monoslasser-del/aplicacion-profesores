import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { motion } from 'motion/react';

export function StudentAttendanceScreen() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="flex flex-col h-full bg-gray-50 absolute inset-0 overflow-hidden">
      {/* ── Header ── */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white px-4 pt-6 pb-4 shadow-sm z-10 shrink-0 flex items-center gap-3 border-b border-gray-100"
      >
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center active:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Asistencias</h1>
          <p className="text-xs text-gray-500">Alumno ID: {id}</p>
        </div>
      </motion.div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
        <CalendarDays className="w-16 h-16 text-blue-200 mb-4" />
        <h2 className="text-lg font-bold text-gray-700">Calendario de Asistencias</h2>
        <p className="text-gray-400 text-sm mt-2 max-w-xs">
          Aquí integraremos el calendario con el detalle de faltas, retardos y asistencias.
        </p>
      </div>
    </div>
  );
}
