import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { X, User, CalendarDays, BookOpen, ChevronRight } from 'lucide-react';
import type { Student } from '../StudentListScreen';

interface StudentActionModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
}

export function StudentActionModal({ isOpen, student, onClose }: StudentActionModalProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && student && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 shadow-2xl pb-6"
          >
            <div className="p-6">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-700 font-black text-lg">
                      {student.lastName.charAt(0)}{student.firstName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">
                      {student.firstName} {student.lastName}
                    </h2>
                    <p className="text-gray-400 text-xs font-mono mt-0.5">
                      {student.curp || 'Sin CURP'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center active:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => {
                    onClose();
                    navigate(`/student/${student.id}`);
                  }}
                  className="w-full bg-gray-50 flex items-center gap-4 p-4 rounded-2xl active:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-gray-900 font-bold text-sm">Ver Perfil Completo</h3>
                    <p className="text-gray-500 text-xs mt-0.5">Historial, datos y gráficas</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                
                <button className="w-full bg-blue-50 flex items-center gap-4 p-4 rounded-2xl active:bg-blue-100 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                    <CalendarDays className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-blue-900 font-bold text-sm">Asistencias con Calendario</h3>
                    <p className="text-blue-600/70 text-xs mt-0.5">Revisar reporte de faltas</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-400" />
                </button>
                
                <button className="w-full bg-purple-50 flex items-center gap-4 p-4 rounded-2xl active:bg-purple-100 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-purple-900 font-bold text-sm">Registro de Trabajos</h3>
                    <p className="text-purple-600/70 text-xs mt-0.5">Por campos formativos</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-purple-400" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
