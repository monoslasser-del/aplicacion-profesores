import React from 'react';
import { CheckCircle2, RotateCcw, User, BookOpen } from 'lucide-react';
import type { GradeRecord } from '../pages/CaptureFlow';
import { motion } from 'motion/react';

interface SuccessScreenProps {
  history: GradeRecord[];
  onReset: () => void;
}

export function SuccessScreen({ history, onReset }: SuccessScreenProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Success Banner */}
      <div className="bg-white px-6 py-12 flex flex-col items-center justify-center shadow-sm rounded-b-[2rem]">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="bg-green-100 text-green-600 p-4 rounded-full mb-6"
        >
          <CheckCircle2 className="w-16 h-16" strokeWidth={2} />
        </motion.div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Calificación guardada!</h1>
        <p className="text-gray-500 text-center max-w-xs">
          El registro se ha sincronizado correctamente en el sistema.
        </p>
      </div>

      {/* History List */}
      <div className="flex-1 px-6 pt-8 pb-4 flex flex-col">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
          Últimos 3 registros
        </h2>
        
        <div className="flex-1 space-y-4">
          {history.map((record, index) => (
            <motion.div 
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-gray-900 font-semibold">
                  <User className="w-4 h-4 text-gray-400" />
                  {record.student}
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                  {record.subject}
                </div>
              </div>
              
              <div className="bg-blue-50 text-blue-700 font-bold text-xl py-2 px-4 rounded-xl">
                {record.grade}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Area */}
      <div className="p-6 bg-gray-50">
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 text-gray-700 bg-white border-2 border-gray-200 text-lg font-semibold rounded-3xl py-4 px-6 hover:bg-gray-50 transition-colors active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
          Nuevo Registro
        </button>
      </div>
    </div>
  );
}
