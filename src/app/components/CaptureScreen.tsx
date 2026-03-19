import React from 'react';
import { BookOpen, Wifi, Tag } from 'lucide-react';

interface CaptureScreenProps {
  subject: string;
  setSubject: (subject: string) => void;
  activityName: string;
  setActivityName: (name: string) => void;
  grade: string;
  setGrade: (grade: string) => void;
  onScan: () => void;
}

export function CaptureScreen({ subject, setSubject, activityName, setActivityName, grade, setGrade, onScan }: CaptureScreenProps) {
  const subjects = ['Matemáticas', 'Historia', 'Ciencias', 'Literatura', 'Educación Física'];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Registrar Calificación</h1>
        <p className="text-gray-500 text-sm">Selecciona la materia y digita la nota del estudiante.</p>
      </div>

      <div className="flex-1 px-6 flex flex-col">
        {/* Subject and Activity Selection */}
        <div className="mb-8 flex gap-3">
          <div className="flex-[0.4]">
            <label htmlFor="subject" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-gray-400" />
              Materia
            </label>
            <div className="relative">
              <select
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="appearance-none w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="flex-[0.6]">
            <label htmlFor="activity" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-gray-400" />
              Actividad
            </label>
            <input
              id="activity"
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="Ej. Examen 1..."
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
            />
          </div>
        </div>

        {/* Grade Input */}
        <div className="flex-1 flex flex-col items-center justify-center pb-12">
          <label htmlFor="grade" className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-wider">
            Calificación
          </label>
          <div className="w-full grid grid-cols-4 gap-1.5 sm:gap-2 max-w-[280px] px-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0].map((num) => (
              <button
                key={num}
                onClick={() => setGrade(num.toString())}
                className={`h-10 sm:h-12 rounded-xl text-lg font-bold transition-all active:scale-95 flex items-center justify-center ${
                  grade === num.toString()
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105 ring-2 ring-blue-600 ring-offset-2'
                    : 'bg-white text-gray-700 shadow-sm border border-gray-200/60 hover:bg-gray-50'
                } ${num === 0 ? 'col-span-4' : ''}`}
              >
                {num}
              </button>
            ))}
          </div>
          {/* Subtle underline for the input area to ground it */}
          <div className="w-32 h-1 bg-gray-100 mt-4 rounded-full" />
        </div>
      </div>

      {/* Main CTA */}
      <div className="p-6 pb-8">
        <button
          onClick={onScan}
          disabled={!grade}
          className={`w-full flex items-center justify-center gap-3 text-white text-xl font-semibold rounded-3xl py-5 px-6 shadow-lg transform transition-all active:scale-95 ${
            grade 
              ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30' 
              : 'bg-gray-300 cursor-not-allowed shadow-none'
          }`}
        >
          <Wifi className={`w-6 h-6 ${grade ? 'animate-pulse' : ''}`} />
          Escanear Tarjeta NFC
        </button>
      </div>
    </div>
  );
}
