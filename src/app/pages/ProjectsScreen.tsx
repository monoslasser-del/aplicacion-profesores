import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { ChevronDown, FileText, CheckCircle, ArrowLeft, Play, LayoutGrid, Clock, Users, BookOpen } from 'lucide-react';

// === Tipos Mocks ===
type FormativeField = 'Lenguajes' | 'Saberes' | 'Ética' | 'De lo Humano';

interface ProjectData {
  id: string;
  title: string;
  field: FormativeField;
  duration: string;
  status: 'Disponible' | 'Abordado';
  image: string;
  grade: string;
  pda: string[];
  description: string;
  problem: string;
  product: string;
  activities: { day: string; title: string }[];
}

const MOCK_PROJECTS: ProjectData[] = [
  {
    id: '1',
    title: 'Cuentos de mi Comunidad',
    field: 'Lenguajes',
    duration: '2 semanas',
    status: 'Disponible',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    grade: '1° Grado',
    description: 'Los alumnos investigarán relatos o mitos locales y redactarán e ilustrarán sus propios cuentos basados en su comunidad.',
    problem: 'Falta de conexión con las raíces culturales y narrativas orales de su localidad.',
    product: 'Antología de cuentos locales ilustrada por los estudiantes.',
    pda: [
      'Narra anécdotas e historias usando secuencias lógicas.',
      'Identifica características de personajes y escenarios.',
      'Reflexiona sobre la importancia de las historias locales.'
    ],
    activities: [
      { day: 'Sesión 1', title: 'Lectura de un cuento clásico' },
      { day: 'Sesión 2', title: 'Entrevista a familiares sobre relatos locales' },
      { day: 'Sesión 3', title: 'Borrador del cuento' },
      { day: 'Sesión 4', title: 'Ilustración y presentación final' }
    ]
  },
  {
    id: '2',
    title: 'Exploradores de la Naturaleza',
    field: 'Saberes',
    duration: '3 semanas',
    status: 'Abordado',
    image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=400',
    grade: '1° Grado',
    description: 'Exploración del entorno biológico cercano a la escuela para identificar flora y fauna y entender el ciclo de vida básica.',
    problem: 'Desconocimiento de las especies endémicas y el ciclo del agua en su entorno cercano.',
    product: 'Guía ilustrada de animales y plantas de la escuela.',
    pda: [
      'Describe y registra características de seres vivos.',
      'Compara a los seres vivos basándose en características.',
      'Representa ideas sobre su entorno mediante dibujos.'
    ],
    activities: [
      { day: 'Sesión 1', title: 'Observando el patio escolar' },
      { day: 'Sesión 2', title: 'Dibujo de una flor y sus partes' },
      { day: 'Sesión 3', title: 'Clasificando insectos vs plantas' }
    ]
  },
  {
    id: '3',
    title: 'Reglas de Convivencia',
    field: 'Ética',
    duration: '1 semana',
    status: 'Disponible',
    image: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&q=80&w=400',
    grade: '1° Grado',
    description: 'Diseño asambleario de los acuerdos y reglas del aula a través del diálogo, promoviendo el respeto y escucha activa.',
    problem: 'Conflictos frecuentes durante el juego libre en el recreo.',
    product: 'Cartel grupal con los acuerdos de convivencia del aula.',
    pda: [
      'Entiende la importancia de proponer reglas de forma colectiva.',
      'Participa en la toma de decisiones por consenso.',
      'Propone soluciones pacíficas a conflictos cotidianos.'
    ],
    activities: [
      { day: 'Sesión 1', title: 'Dinámica de roles y conflictos' },
      { day: 'Sesión 2', title: 'Lluvia de ideas de acuerdos' },
      { day: 'Sesión 3', title: 'Votación circular y decoración del cartel' }
    ]
  },
  {
    id: '4',
    title: 'Mi Cuerpo en Movimiento',
    field: 'De lo Humano',
    duration: '4 semanas',
    status: 'Disponible',
    image: 'https://images.unsplash.com/photo-1510034636952-16e537dcfdf6?auto=format&fit=crop&q=80&w=400',
    grade: '1° Grado',
    description: 'Exploraremos posibilidades motrices mediante retos físicos, para que mejoren su coordinación y aprecien su propio cuerpo.',
    problem: 'Necesidad de estimular la coordinación motriz gruesa y afianzar hábitos de higiene tras la actividad.',
    product: 'Circuito de actividad física guiado por los mismos alumnos.',
    pda: [
      'Reconoce su cuerpo y sus posibilidades de movimiento.',
      'Participa en juegos y actividades que implican coordinación.',
      'Identifica hábitos de higiene y cuidado posterior al ejercicio.'
    ],
    activities: [
      { day: 'Sesión 1', title: 'Autodiagnóstico físico (circuitos)' },
      { day: 'Sesión 2', title: 'Juegos cooperativos' },
      { day: 'Sesión 3', title: 'Diseñar el propio circuito escolar' },
      { day: 'Sesión 4', title: 'Feria de los circuitos motores' }
    ]
  }
];

// Colores por campo formativo (Cohesión de UI)
const FIELD_COLORS: Record<string, string> = {
  'Lenguajes': 'text-red-500 bg-red-50',
  'Saberes': 'text-emerald-600 bg-emerald-50',
  'Ética': 'text-yellow-600 bg-yellow-50',
  'De lo Humano': 'text-blue-500 bg-blue-50'
};

const DOT_COLORS: Record<string, string> = {
  'Lenguajes': 'bg-red-500',
  'Saberes': 'bg-emerald-500',
  'Ética': 'bg-yellow-500',
  'De lo Humano': 'bg-blue-500'
};

export function ProjectsScreen() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>('Todos');
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  
  // Nuevo estado para el Generador de Examen
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedForExam, setSelectedForExam] = useState<Set<string>>(new Set());

  const filters = ['Todos', 'Lenguajes', 'Saberes', 'Ética', 'De lo Humano'];

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'Todos') return MOCK_PROJECTS;
    return MOCK_PROJECTS.filter(p => p.field === activeFilter);
  }, [activeFilter]);

  return (
    <div className="flex flex-col h-full bg-slate-50 absolute inset-0 overflow-hidden relative">
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar pb-24">
        
        {/* Header */}
        <div className="px-6 pt-10 pb-5 bg-white shrink-0 relative z-10 sticky top-0 border-b border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Proyectos y PDA</h1>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 transition-colors">
              1° Grado
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {isSelectionMode ? (
            <div className="flex gap-2 mb-4">
              <button 
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedForExam(new Set());
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 px-4 rounded-[1.2rem] flex items-center justify-center transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (selectedForExam.size === 0) {
                    alert("Abre al menos un proyecto para continuar.");
                    return;
                  }
                  navigate('/exam-builder', { state: { projectIds: Array.from(selectedForExam) } });
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all text-white font-bold py-3.5 px-4 rounded-[1.2rem] flex items-center justify-center gap-2 shadow-md shadow-blue-500/30"
              >
                Continuar ({selectedForExam.size})
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsSelectionMode(true)}
              className="w-full bg-gradient-to-r from-emerald-50 to-emerald-100/50 hover:from-emerald-100 hover:to-emerald-100 active:scale-95 transition-all text-emerald-700 font-bold py-3.5 px-4 rounded-[1.2rem] flex items-center justify-center gap-2 border border-emerald-200/60 shadow-sm mb-4"
            >
              <FileText className="w-4 h-4" />
              Generar Examen Trimestral
            </button>
          )}

          {/* Filters (Horizontal Scroll) */}
          <div className="flex -mx-6 px-6 overflow-x-auto no-scrollbar gap-2 pb-1">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-bold text-[13px] transition-all ${
                  activeFilter === filter 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05, duration: 0.2 }}
                  key={project.id}
                  onClick={() => {
                    if (isSelectionMode) {
                      const newSet = new Set(selectedForExam);
                      if (newSet.has(project.id)) {
                        newSet.delete(project.id);
                      } else {
                        newSet.add(project.id);
                      }
                      setSelectedForExam(newSet);
                    } else {
                      setSelectedProject(project);
                    }
                  }}
                  className={`bg-white rounded-3xl overflow-hidden shadow-sm flex flex-col h-full cursor-pointer hover:shadow-md transition-all active:scale-95 duration-200 ${
                    isSelectionMode && selectedForExam.has(project.id) 
                      ? 'border-4 border-blue-500 transform scale-[0.98]' 
                      : 'border border-slate-100 scale-100'
                  }`}
                >
                  {/* Card Cover */}
                  <div className="relative h-32 w-full overflow-hidden shrink-0 bg-slate-200">
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${project.status === 'Abordado' ? 'brightness-50 grayscale-[30%]' : ''}`}
                    />
                    
                    {/* Duration Badge */}
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center shadow-sm">
                      <span className="text-[10px] font-bold text-slate-700">{project.duration}</span>
                    </div>

                    {/* Abordado Center Icon (If Completed) */}
                    {!isSelectionMode && project.status === 'Abordado' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="bg-emerald-500/90 text-white p-2.5 rounded-full backdrop-blur-md shadow-lg">
                           <CheckCircle className="w-7 h-7" />
                         </div>
                      </div>
                    )}

                    {/* Selection Overlay */}
                    {isSelectionMode && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                         <div className={`p-2.5 rounded-full backdrop-blur-md shadow-lg transition-colors duration-300 ${
                           selectedForExam.has(project.id) ? 'bg-blue-500/90 text-white scale-110' : 'bg-white/90 text-slate-400'
                         }`}>
                           <CheckCircle className="w-7 h-7" />
                         </div>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-3.5 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[project.field]}`}></span>
                        <span className={`text-[9px] font-extrabold uppercase tracking-widest ${FIELD_COLORS[project.field].split(' ')[0]}`}>
                          {project.field}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 mb-2">
                        {project.title}
                      </h3>
                    </div>

                    {/* Footer Badge */}
                    <div className="mt-auto pt-2">
                      {project.status === 'Disponible' ? (
                        <span className="inline-flex items-center justify-center w-max px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                          Disponible
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-1 w-max px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                          <CheckCircle className="w-3 h-3" />
                          Abordado
                        </span>
                      )}
                    </div>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredProjects.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <LayoutGrid className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-bold">No hay proyectos para este campo.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* --- Detail View Modal --- */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            {/* Draggable header / Cover */}
            <div className="relative h-[35%] shrink-0">
               <img src={selectedProject.image} alt="cover" className="w-full h-full object-cover opacity-80" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60"></div>
               
               {/* Controls */}
               <div className="absolute top-10 left-5">
                 <button 
                  onClick={() => setSelectedProject(null)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center transition-all active:scale-90"
                 >
                   <ArrowLeft className="w-6 h-6 text-white" />
                 </button>
               </div>

               <div className="absolute bottom-5 left-5 right-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-white/20 text-white border border-white/30`}>
                      {selectedProject.field}
                    </span>
                    <span className="text-white/80 font-medium text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {selectedProject.duration}
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-white leading-tight drop-shadow-md">{selectedProject.title}</h1>
               </div>
            </div>

            {/* Bottom White Card pulling up */}
            <motion.div 
              initial={{ y: 50, borderTopLeftRadius: "0rem", borderTopRightRadius: "0rem" }}
              animate={{ y: 0, borderTopLeftRadius: "2rem", borderTopRightRadius: "2rem" }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="flex-1 bg-white -mt-6 z-10 overflow-y-auto no-scrollbar relative flex flex-col shadow-[0_-15px_40px_rgba(0,0,0,0.3)]"
            >
               {/* Drag Handle */}
               <div className="w-full flex justify-center py-4 shrink-0 bg-white sticky top-0 z-20">
                 <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
               </div>

               <div className="px-6 pb-28 space-y-8 flex-1">
                 
                 {/* PDA Section */}
                 <section className="bg-slate-50 border border-slate-100 rounded-3xl p-5 shadow-sm">
                   <h3 className="flex items-center gap-2 font-bold text-slate-800 text-[15px] mb-3">
                     <div className={`w-1.5 h-4 rounded-full ${DOT_COLORS[selectedProject.field]}`}></div>
                     PDA a desarrollar
                   </h3>
                   <ul className="space-y-2.5">
                     {selectedProject.pda.map((item, i) => (
                       <li key={i} className="flex gap-2.5 text-slate-600 text-[13px] leading-relaxed font-medium">
                         <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
                         {item}
                       </li>
                     ))}
                   </ul>
                 </section>

                 {/* Content description */}
                 <section className="space-y-4">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide mb-1.5">Justificación</h3>
                      <p className="text-slate-500 text-[13px] leading-relaxed font-medium">{selectedProject.description}</p>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                        Problema del Contexto
                      </h3>
                      <p className="text-slate-500 text-[13px] leading-relaxed font-medium">{selectedProject.problem}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                       <h3 className="font-extrabold text-emerald-800 text-sm uppercase tracking-wide mb-1.5">Producto Final</h3>
                       <p className="text-emerald-700 text-[13px] font-bold">{selectedProject.product}</p>
                    </div>
                 </section>

                 {/* Timeline / Activities */}
                 <section>
                   <h3 className="font-black text-slate-800 text-lg mb-4 flex items-center gap-2">
                     <BookOpen className="w-5 h-5 text-slate-400" />
                     Secuencia Didáctica
                   </h3>
                   <div className="space-y-4">
                     {selectedProject.activities.map((act, i) => (
                       <div key={i} className="flex gap-4">
                         {/* Line and bubble */}
                         <div className="flex flex-col items-center">
                           <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-[11px] shadow-sm z-10 shrink-0">
                             {i + 1}
                           </div>
                           {i !== selectedProject.activities.length - 1 && (
                             <div className="w-0.5 min-h-[2rem] h-full bg-blue-100 -mt-1"></div>
                           )}
                         </div>
                         {/* Content */}
                         <div className="pt-1 pb-2">
                           <h4 className="font-bold text-slate-800 text-sm">{act.title}</h4>
                           <span className="text-slate-400 text-xs font-semibold">{act.day}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                 </section>

                 {/* Anexos y Recursos */}
                 <section>
                   <h3 className="font-black text-slate-800 text-lg mb-3">Anexos y Recursos</h3>
                   <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                      <div className="w-32 h-20 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center shrink-0 cursor-pointer hover:bg-slate-200 transition-colors">
                        <FileText className="w-6 h-6 text-slate-500 mb-1" />
                        <span className="text-[10px] font-bold text-slate-600">Formato PDF</span>
                      </div>
                      <div className="w-32 h-20 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center shrink-0 cursor-pointer hover:bg-slate-200 transition-colors">
                        <Play className="w-6 h-6 text-slate-500 mb-1" />
                        <span className="text-[10px] font-bold text-slate-600">Video Guía</span>
                      </div>
                   </div>
                 </section>

               </div>
               
               {/* CTA Fijo */}
               <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/90 backdrop-blur-md border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                  <button 
                    onClick={() => {
                       alert("Planeación seleccionada correctamente. Agregada a tu calendario.");
                       setSelectedProject(null);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-bold text-base py-4 rounded-[1.2rem] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                  >
                     <FileText className="w-5 h-5" />
                     Implementar esta planeación
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
