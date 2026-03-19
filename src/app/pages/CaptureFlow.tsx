import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CaptureScreen } from '../components/CaptureScreen';
import { ScanningModal } from '../components/ScanningModal';
import { SuccessScreen } from '../components/SuccessScreen';

export type ScreenState = 'capture' | 'scanning' | 'success';

export interface GradeRecord {
  id: string;
  student: string;
  subject: string;
  grade: string;
  date: string;
  activityName?: string;
}

const mockStudents = ['Juan Pérez', 'María Gómez', 'Carlos López', 'Ana Martínez'];

export function CaptureFlow() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('capture');
  const [subject, setSubject] = useState('Matemáticas');
  const [activityName, setActivityName] = useState('Examen Parcial');
  const [grade, setGrade] = useState('');
  
  const [history, setHistory] = useState<GradeRecord[]>([
    { id: '1', student: 'Laura Torres', subject: 'Matemáticas', grade: '9.0', date: new Date().toISOString(), activityName: 'Examen Parcial' },
    { id: '2', student: 'Pedro Ruiz', subject: 'Historia', grade: '7.5', date: new Date().toISOString(), activityName: 'Tarea 1' },
  ]);

  const handleScanInit = () => {
    if (!grade || !activityName.trim()) return;
    setCurrentScreen('scanning');
  };

  const handleScanComplete = () => {
    const randomStudent = mockStudents[Math.floor(Math.random() * mockStudents.length)];
    const newRecord: GradeRecord = {
      id: Math.random().toString(36).substr(2, 9),
      student: randomStudent,
      subject,
      grade,
      date: new Date().toISOString(),
      activityName: activityName.trim() || 'Actividad General',
    };
    setHistory((prev) => [newRecord, ...prev].slice(0, 3));
    setCurrentScreen('success');
  };

  const handleReset = () => {
    setGrade('');
    // activityName is intentionally NOT reset here, keeping it for the next scan
    setCurrentScreen('capture');
  };

  return (
    <div className="flex-1 relative bg-white flex flex-col">
      <AnimatePresence mode="wait">
        {currentScreen === 'capture' && (
          <motion.div
            key="capture"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col bg-white overflow-y-auto"
          >
            <CaptureScreen 
              subject={subject} 
              setSubject={setSubject}
              activityName={activityName}
              setActivityName={setActivityName}
              grade={grade} 
              setGrade={setGrade} 
              onScan={handleScanInit} 
            />
          </motion.div>
        )}

        {currentScreen === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col bg-gray-50 overflow-y-auto"
          >
            <SuccessScreen history={history} onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentScreen === 'scanning' && (
          <ScanningModal onComplete={handleScanComplete} onCancel={() => setCurrentScreen('capture')} />
        )}
      </AnimatePresence>
    </div>
  );
}
