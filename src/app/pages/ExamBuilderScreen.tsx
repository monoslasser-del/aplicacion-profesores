import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, FileText, Settings, Sparkles, BookOpen, PenTool, Lightbulb, ListChecks } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { examService, GeneratedExamPayload } from '../../services/examService';

// === Tipos y Mocks (Iguales a ProjectsScreen para consistencia) ===
type FormativeField = 'Lenguajes' | 'Saberes' | 'Ética' | 'De lo Humano';

interface ProjectData {
  id: string;
  title: string;
  field: FormativeField;
  image: string;
  pda: string[];
}

const MOCK_PROJECTS: ProjectData[] = [
  {
    id: '1',
    title: 'Cuentos de mi Comunidad',
    field: 'Lenguajes',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    pda: [
      'Narra anécdotas e historias usando secuencias lógicas.',
      'Identifica características de personajes y escenarios.',
    ],
  },
  {
    id: '2',
    title: 'Exploradores de la Naturaleza',
    field: 'Saberes',
    image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=400',
    pda: [
      'Describe y registra características de seres vivos.',
      'Compara a los seres vivos basándose en características.',
    ],
  },
  {
    id: '3',
    title: 'Reglas de Convivencia',
    field: 'Ética',
    image: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&q=80&w=400',
    pda: [
      'Entiende la importancia de proponer reglas de forma colectiva.',
      'Participa en la toma de decisiones por consenso.',
    ],
  },
  {
    id: '4',
    title: 'Mi Cuerpo en Movimiento',
    field: 'De lo Humano',
    image: 'https://images.unsplash.com/photo-1510034636952-16e537dcfdf6?auto=format&fit=crop&q=80&w=400',
    pda: [
      'Reconoce su cuerpo y sus posibilidades de movimiento.',
      'Participa en juegos y actividades que implican coordinación.',
    ],
  }
];

export function ExamBuilderScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectIds: string[] = location.state?.projectIds || [];
  
  const [selectedPDAs, setSelectedPDAs] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [examTitle, setExamTitle] = useState('Evaluación del Primer Trimestre');
  const [includeKey, setIncludeKey] = useState(true);
  const [includeOmr, setIncludeOmr] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<GeneratedExamPayload | null>(null);

  // Obtener solo los proyectos seleccionados
  const selectedProjects = MOCK_PROJECTS.filter(p => projectIds.includes(p.id));

  const togglePDA = (pda: string) => {
    const newSet = new Set(selectedPDAs);
    if (newSet.has(pda)) newSet.delete(pda);
    else newSet.add(pda);
    setSelectedPDAs(newSet);
  };

  const handleGenerate = async () => {
    if (selectedPDAs.size === 0) {
      alert("Selecciona al menos un PDA para evaluar en el examen.");
      return;
    }
    
    setIsGenerating(true);

    try {
      // Registrar el borrador en el backend (opcional, si quisieras guardarlo)
      // await examService.buildExamRecord(projectIds);

      // Llamada real al servicio para generar JSON a través del Promt
      const payload = await examService.generateAiQuestions({
        grado_escolar: "1er Grado",
        cantidad_preguntas: selectedPDAs.size,
        proyectos_y_pdas: [] // Aquí se mandarían los pdas seleccionados
      });

      setGeneratedExam(payload);
      setStep(3);
    } catch (error) {
      alert("Ocurrió un error generando el examen.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (projectIds.length === 0) {
    return (
      <div className="flex flex-col h-full bg-slate-50 items-center justify-center p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">No hay proyectos seleccionados</h2>
        <button 
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-md"
        >
          Volver a Proyectos
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      
      {/* Header Fijo */}
      <div className="px-6 pt-12 pb-4 bg-white shadow-sm shrink-0 flex items-center gap-4 z-10 sticky top-0 relative">
        <button 
          onClick={() => {
            if (step > 1 && step < 4) setStep((s) => (s - 1) as any);
            else navigate(-1);
          }} 
          className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black text-slate-800 tracking-tight leading-tight">
            {step === 2 ? 'Configuración del Examen' : 'Generador de Examen'}
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
            {step === 1 && 'Paso 1: Selección de PDA'}
            {step === 2 && 'Paso 2: Configuraciones'}
            {step === 3 && 'Paso 3: Examen Listo'}
            {step === 4 && 'Revisión de Preguntas'}
          </p>
        </div>
      </div>

      {step === 2 && (
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 z-20">
          <div className="h-full bg-emerald-500 transition-all duration-500 w-2/3"></div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 pb-32 space-y-6"
            >
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-5 shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-lg font-black mb-1 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-300" /> IA Evaluadora
                  </h2>
                  <p className="text-sm text-indigo-100 font-medium">
                    Selecciona los Procesos de Desarrollo de Aprendizaje (PDA) que deseas incluir. Generaremos preguntas de opción múltiple basadas en ellos.
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 bg-white/10 w-32 h-32 rounded-full blur-2xl"></div>
              </div>

              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-800 text-md uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" /> Proyectos Seleccionados
                </h3>

                {selectedProjects.map((project) => (
                  <div key={project.id} className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100">
                    <div className="flex gap-4 items-center mb-4 pb-4 border-b border-slate-50">
                      <img src={project.image} alt={project.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {project.field}
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm mt-1 leading-tight">{project.title}</h4>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">PDA Asociados</h5>
                      {project.pda.map((pda, i) => {
                        const isSelected = selectedPDAs.has(pda);
                        return (
                          <div 
                            key={i} 
                            onClick={() => togglePDA(pda)}
                            className={`p-3.5 rounded-2xl flex items-start gap-3 cursor-pointer transition-all border ${
                              isSelected 
                                ? 'bg-indigo-50/50 border-indigo-200' 
                                : 'bg-slate-50 border-transparent hover:bg-slate-100'
                            }`}
                          >
                            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-transparent'
                            }`}>
                              <CheckCircle className="w-3.5 h-3.5" />
                            </div>
                            <span className={`text-[13px] font-medium leading-relaxed ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>
                              {pda}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 pb-32 space-y-6"
            >
              <div className="space-y-6">
                
                {/* Título */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Título del Examen</label>
                  <input 
                    type="text" 
                    value={examTitle} 
                    onChange={(e) => setExamTitle(e.target.value)} 
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" 
                  />
                </div>

                {/* Número de Preguntas */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Número de Preguntas (Total: {selectedPDAs.size})</label>
                  <button className="w-full bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold py-3.5 rounded-2xl">
                    Todas
                  </button>
                </div>

                {/* Opciones Adicionales */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3 px-1">Opciones Adicionales</label>
                  <div className="space-y-3">
                    <div 
                      onClick={() => setIncludeKey(!includeKey)}
                      className="flex items-center justify-between border border-slate-100 p-4 rounded-[1.2rem] bg-white shadow-sm cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-[0.8rem] flex items-center justify-center">
                          <FileText className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-slate-800 leading-tight">Generar Hoja de Respuestas</p>
                          <p className="text-[11px] text-slate-500 font-medium tracking-wide mt-0.5">Clave para calificar rápido</p>
                        </div>
                      </div>
                      <div className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${includeKey ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${includeKey ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                    
                    <div 
                      onClick={() => setIncludeOmr(!includeOmr)}
                      className="flex items-center justify-between border border-slate-100 p-4 rounded-[1.2rem] bg-white shadow-sm cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-[0.8rem] flex items-center justify-center">
                          <ListChecks className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-slate-800 leading-tight">Incluir Hoja de bolitas</p>
                          <p className="text-[11px] text-slate-500 font-medium tracking-wide mt-0.5">OMR para escáner por cámara</p>
                        </div>
                      </div>
                      <div className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${includeOmr ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${includeOmr ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 flex flex-col items-center justify-center h-full pt-12 pb-32"
            >
              <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-3 text-center tracking-tight">¡Examen Generado!</h2>
              <p className="text-center text-slate-500 font-medium mb-8 max-w-[280px]">
                Se han generado {selectedPDAs.size * 2} preguntas estratégicas basadas en los proyectos que elegiste.
              </p>

              <div className="w-full space-y-3">
                <button 
                  onClick={() => setStep(4)}
                  className="w-full bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-slate-700 font-bold py-4 px-4 rounded-[1.2rem] flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span>Ver y Editar Preguntas</span>
                  </div>
                  <PenTool className="w-4 h-4 text-slate-300" />
                </button>
                <button className="w-full bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-slate-700 font-bold py-4 px-4 rounded-[1.2rem] flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span>Asignar a mi Grupo</span>
                  </div>
                  <Settings className="w-4 h-4 text-slate-300" />
                </button>
              </div>

              <button 
                onClick={() => navigate('/projects')}
                className="mt-8 text-slate-400 font-bold text-sm hover:text-slate-600 uppercase tracking-widest"
              >
                Volver a Proyectos
              </button>
            </motion.div>
          )}

          {step === 4 && generatedExam && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 pb-32 space-y-6"
            >
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
                 <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                 <p className="text-[13px] text-blue-700 font-medium">
                   Estas preguntas fueron generadas usando los PDA seleccionados. Puedes revisarlas y, si estás conforme, asignarlas o guardarlas como PDF.
                 </p>
              </div>

              {generatedExam.examen_para_word.map((item, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-slate-100 text-slate-600 font-bold text-xs px-2.5 py-1 rounded-md">
                      Pregunta {item.id_pregunta}
                    </span>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                      {item.campo_formativo}
                    </span>
                  </div>
                  
                  {/* Contexto situacional */}
                  <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl mb-3">
                    <p className="text-[13px] text-amber-900 font-medium italic">
                      {item.situacion_contexto}
                    </p>
                  </div>

                  <p className="text-[14px] text-slate-800 font-bold leading-relaxed mb-4">
                    {item.pregunta_directa}
                  </p>

                  <div className="space-y-2.5">
                    {Object.entries(item.opciones).map(([letter, text]) => {
                      const isCorrect = item.respuesta_correcta === letter;
                      return (
                        <div 
                          key={letter}
                          className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                            isCorrect 
                              ? 'bg-emerald-50 border-emerald-500 shadow-sm' 
                              : 'bg-slate-50 border-slate-100'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                            isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {letter}
                          </div>
                          <span className={`text-[13px] font-medium leading-relaxed ${isCorrect ? 'text-emerald-900' : 'text-slate-600'}`}>
                            {text as string}
                          </span>
                          {isCorrect && <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />}
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Justificación del docente */}
                  <div className="mt-4 pt-4 border-t border-slate-50">
                     <div className="flex items-start gap-1.5 mb-2">
                       <Lightbulb className="w-4 h-4 text-emerald-500 mt-0.5" />
                       <p className="text-[12px] text-emerald-800 font-medium leading-relaxed">
                         <strong className="text-emerald-900 block mb-0.5">Justificación:</strong>
                         {item.justificacion_docente}
                       </p>
                     </div>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest line-clamp-1 mt-3">
                       PDA: {item.pda_evaluado}
                     </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer Fijo Paso 1 */}
      {step === 1 && (
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/90 backdrop-blur-md border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-20">
          <button 
            onClick={() => {
              if (selectedPDAs.size === 0) {
                alert("Selecciona al menos un PDA para continuar.");
                return;
              }
              setStep(2);
            }}
            className="w-full bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all text-white font-bold text-base py-4 rounded-[1.2rem] flex items-center justify-center gap-2 shadow-lg"
          >
            Continuar a Configuración
          </button>
        </div>
      )}

      {/* Footer Fijo Paso 2 */}
      {step === 2 && (
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/90 backdrop-blur-md border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-20">
          <button 
            disabled={isGenerating}
            onClick={handleGenerate}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-70 active:scale-95 transition-all text-white font-bold text-[15px] py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Generando con IA...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 text-amber-300 shrink-0" />
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Generar Examen en PDF
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/90 backdrop-blur-md border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-20 flex gap-3">
          <button 
            onClick={() => setStep(3)}
            className="w-14 h-14 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-600 font-bold rounded-[1.2rem] flex items-center justify-center shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => {
              alert('¡Examen guardado correctamente y asignado al grupo!');
              navigate('/projects');
            }}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-95 transition-all text-white font-bold text-base rounded-[1.2rem] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
          >
            <CheckCircle className="w-5 h-5" />
            Finalizar y Guardar
          </button>
        </div>
      )}
      
    </div>
  );
}
