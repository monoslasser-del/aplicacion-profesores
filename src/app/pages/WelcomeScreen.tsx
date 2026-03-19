import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { BookOpen } from 'lucide-react';

export function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-slate-50 absolute inset-0 overflow-hidden">
      
      {/* Decorative Top Background */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-600 rounded-b-[4rem] px-5 pt-12 pb-6 shadow-xl z-0 overflow-hidden">
        {/* Background textures */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-teal-400 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute top-10 -left-10 w-48 h-48 bg-purple-400 opacity-20 rounded-full blur-3xl"></div>
      </div>

      <div className="flex flex-col h-full p-8 relative z-10 w-full max-w-sm mx-auto">
        
        {/* Logo and App Name */}
        <div className="flex flex-col items-center justify-center pt-16 flex-1">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 opacity-50"></div>
            <BookOpen className="w-12 h-12 text-blue-600 relative z-10" />
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white text-4xl font-black text-center leading-tight tracking-tight mb-2"
          >
            Acompáñame
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-blue-100 text-center font-medium text-base px-4"
          >
            Tu asistente educativo inteligente para una gestión escolar sin fricción.
          </motion.p>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto pt-10 w-full flex flex-col items-center gap-4">
          <motion.button 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/register')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center"
          >
            Crear Cuenta
          </motion.button>
          
          <motion.button 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold border-2 border-slate-200 text-lg py-4 px-8 rounded-2xl shadow-sm transition-all"
          >
            Ya tengo cuenta
          </motion.button>
        </div>

      </div>
    </div>
  );
}
