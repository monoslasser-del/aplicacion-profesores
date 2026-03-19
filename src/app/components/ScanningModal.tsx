import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Smartphone, X } from 'lucide-react';

interface ScanningModalProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function ScanningModal({ onComplete, onCancel }: ScanningModalProps) {
  // Simulate an NFC scan taking 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm"
    >
      <button 
        onClick={onCancel}
        className="absolute top-6 right-6 p-3 text-white/70 hover:text-white bg-white/10 rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="flex flex-col items-center justify-center px-8 text-center">
        {/* Animated NFC Icon Container */}
        <div className="relative mb-10">
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-blue-500 rounded-full blur-2xl"
          />
          <motion.div
            animate={{
              y: [-5, 5, -5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative bg-white/10 p-8 rounded-full border border-white/20 backdrop-blur-md"
          >
            <Smartphone className="w-20 h-20 text-blue-400" strokeWidth={1.5} />
            
            {/* NFC Wave animations */}
            <motion.div 
              className="absolute top-4 right-4 text-blue-300"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" opacity="0" />
                <path d="M6 12h.01M10 8h.01M14 4h.01" />
              </svg>
            </motion.div>
          </motion.div>
        </div>

        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white mb-4"
        >
          Leyendo Tarjeta
        </motion.h2>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-blue-100/80 text-lg max-w-xs leading-relaxed"
        >
          Acerque la tarjeta del estudiante a la parte superior del teléfono...
        </motion.p>
      </div>
    </motion.div>
  );
}
