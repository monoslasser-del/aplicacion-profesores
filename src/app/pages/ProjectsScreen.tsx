import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, BookOpen, MapPin, FileText, HeartHandshake,
  ChevronLeft, ChevronRight, X, Download, ExternalLink,
  Clock, CheckCircle2, Play, Loader2, RefreshCw, AlertCircle,
  FileDown, Video, BookMarked, Package, Users, BarChart3,
  ArrowLeft, Bookmark,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { projectService } from '../../services/projectService';
import type { ProjectData, ProjectResource } from '../../services/projectService';

/* ─── Campos Formativos NEM ─────────────────────────────────────── */
const CAMPOS = [
  { id: 'todos',       label: 'Todos',     color: '#1e293b', bg: '#f1f5f9', icon: BookOpen },
  { id: 'lenguajes',   label: 'Lenguajes', color: '#f97316', bg: '#fff7ed', icon: BookOpen },
  { id: 'saberes',     label: 'Saberes',   color: '#3b82f6', bg: '#eff6ff', icon: FileText },
  { id: 'etica',       label: 'Ética',     color: '#a855f7', bg: '#faf5ff', icon: MapPin },
  { id: 'comunitario', label: 'Comunit.',  color: '#22c55e', bg: '#f0fdf4', icon: HeartHandshake },
];
const getField = (id: string) => CAMPOS.find(c => c.id === id) ?? CAMPOS[0];

/* ─── Resource type config ──────────────────────────────────────── */
const RES_CONFIG = {
  planeacion: { icon: FileDown,    label: 'Planeación Docente', color: '#7c3aed', bg: '#ede9fe', emoji: '📄' },
  material:   { icon: BookMarked,  label: 'Material',           color: '#1d4ed8', bg: '#dbeafe', emoji: '📚' },
  video:      { icon: Video,       label: 'Video',              color: '#d97706', bg: '#fef3c7', emoji: '▶️' },
  recurso:    { icon: Package,     label: 'Recurso',            color: '#15803d', bg: '#dcfce7', emoji: '📦' },
} as const;

const getRConfig = (type: string) =>
  RES_CONFIG[type as keyof typeof RES_CONFIG] ?? { icon: FileDown, label: 'Archivo', color: '#475569', bg: '#f1f5f9', emoji: '📎' };

/* ─── Status helpers ────────────────────────────────────────────── */
function StatusPill({ status }: { status?: string }) {
  const MAP: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    completed: { label: 'Completado', color: '#166534', bg: '#dcfce7', icon: <CheckCircle2 size={10} /> },
    active:    { label: 'En curso',   color: '#1e40af', bg: '#dbeafe', icon: <Play size={10} />         },
    pending:   { label: 'Pendiente',  color: '#64748b', bg: '#f1f5f9', icon: <Clock size={10} />        },
  };
  const s = MAP[status ?? 'pending'] ?? MAP.pending;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black"
      style={{ background: s.bg, color: s.color }}>
      {s.icon} {s.label}
    </span>
  );
}

/* ═══════════════════════════════════════════════ MAIN COMPONENT ═══ */
export function ProjectsScreen() {
  const navigate = useNavigate();

  const [tab,      setTab]      = useState('todos');
  const [query,    setQuery]    = useState('');
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [detail,   setDetail]   = useState<ProjectData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true); setError(null);
    try { setProjects(await projectService.getProjects()); }
    catch { setError('No se pudo cargar la biblioteca.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchProjects(); }, []);

  const openDetail = async (p: ProjectData) => {
    setDetail(p);
    if (!p.resources || p.resources.length === 0) {
      setDetailLoading(true);
      try { setDetail(await projectService.getProjectById(p.id)); }
      catch { /* keep partial data */ }
      finally { setDetailLoading(false); }
    }
  };

  const closeDetail = () => setDetail(null);

  const filtered = useMemo(() =>
    projects.filter(p => {
      const matchTab    = tab === 'todos' || p.field_id === tab;
      const matchSearch = p.title.toLowerCase().includes(query.toLowerCase());
      return matchTab && matchSearch;
    }), [projects, tab, query]);

  /* ── DETAIL VIEW ─────────────────────────────────────────────── */
  if (detail) {
    const field = getField(detail.field_id);
    const FieldIcon = field.icon;
    const resources = detail.resources ?? [];
    const resCount  = resources.length;

    return (
      <motion.div
        key="detail"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="flex flex-col flex-1 w-full min-h-0 bg-white overflow-hidden"
      >
        {/* ── Detail Header ── */}
        <div style={{ background: `linear-gradient(135deg, ${field.color}ee, ${field.color}aa)` }}
          className="px-5 pt-5 pb-6 shrink-0 relative overflow-hidden">
          <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-white opacity-10 rounded-full" />
          <div className="absolute top-0 left-0 w-full h-full"
            style={{ background: 'url(https://www.transparenttextures.com/patterns/black-scales.png)', opacity: 0.06 }} />

          {/* Back + bookmark */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <button onClick={closeDetail}
              className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center active:scale-95 border border-white/30">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/25">
              <FieldIcon className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-[10px] font-black uppercase tracking-wider">{field.label}</span>
            </div>
          </div>

          {/* Title */}
          <div className="relative z-10">
            <h1 className="text-white font-black text-2xl leading-tight mb-3">{detail.title}</h1>
            <div className="flex flex-wrap gap-2">
              <StatusPill status={detail.status} />
              {detail.grade && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-white/20 text-white">
                  {detail.grade}° Grado · {detail.nivel_educativo}
                </span>
              )}
              {detail.duration && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-white/20 text-white">
                  <Clock className="w-3 h-3" /> {detail.duration}
                </span>
              )}
            </div>
          </div>

          {/* Progress bar if any */}
          {(detail.progress ?? 0) > 0 && (
            <div className="relative z-10 mt-4">
              <div className="flex justify-between text-[10px] text-white/80 font-bold mb-1.5">
                <span>Progreso del proyecto</span>
                <span>{detail.progress}%</span>
              </div>
              <div className="h-2 bg-white/25 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-1000"
                  style={{ width: `${detail.progress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Detail Body (scrollable) ── */}
        <div className="flex-1 overflow-y-auto bg-slate-50">

          {/* ── RESOURCES — hero section ── */}
          <div className="bg-white mx-4 mt-4 rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: field.bg }}>
                  <Download className="w-4 h-4" style={{ color: field.color }} />
                </div>
                <div>
                  <h3 className="text-slate-900 font-black text-sm">Recursos Didácticos</h3>
                  <p className="text-slate-400 text-[10px] font-medium">
                    {detailLoading ? 'Cargando...' : `${resCount} archivo${resCount !== 1 ? 's' : ''} disponible${resCount !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
              {detailLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
            </div>

            {resources.length === 0 && !detailLoading && (
              <div className="px-5 py-10 flex flex-col items-center gap-2 text-slate-300">
                <BookOpen className="w-10 h-10 opacity-40" />
                <p className="text-sm font-bold text-slate-400">Sin recursos disponibles</p>
                <p className="text-xs text-slate-400 text-center">El administrador aún no ha subido materiales para este proyecto.</p>
              </div>
            )}

            {resources.map((r, i) => {
              const rc = getRConfig(r.type);
              const ResIcon = rc.icon;
              const available = r.file_url && r.file_url !== '#';
              return (
                <button
                  key={r.id}
                  onClick={() => available && projectService.openResource(r.file_url)}
                  disabled={!available}
                  className={`w-full flex items-center gap-4 px-5 py-4 active:scale-[0.98] transition-all ${i < resources.length - 1 ? 'border-b border-slate-50' : ''} ${!available ? 'opacity-50' : ''}`}
                >
                  {/* File icon */}
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{ background: rc.bg }}>
                    <span className="text-xl">{rc.emoji}</span>
                  </div>

                  {/* File info */}
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-slate-800 font-bold text-sm truncate">{r.label ?? r.name}</p>
                    <p className="text-slate-400 text-[11px] font-semibold mt-0.5 uppercase tracking-wide"
                      style={{ color: rc.color }}>{rc.label}</p>
                  </div>

                  {/* Action icon */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: available ? rc.bg : '#f1f5f9' }}>
                    {r.type === 'video'
                      ? <ExternalLink className="w-4 h-4" style={{ color: available ? rc.color : '#cbd5e1' }} />
                      : <Download  className="w-4 h-4" style={{ color: available ? rc.color : '#cbd5e1' }} />
                    }
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Project Info ── */}
          <div className="space-y-3 px-4 pb-8 mt-3">

            {/* Description */}
            {detail.description && (
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">📝 Descripción</p>
                <p className="text-slate-600 text-sm leading-relaxed">{detail.description}</p>
              </div>
            )}

            {/* PDA */}
            {detail.pda && (
              <div className="rounded-3xl p-5 shadow-sm border"
                style={{ background: field.bg, borderColor: field.color + '30' }}>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: field.color }}>
                  📋 Progresión de Aprendizaje (PDA)
                </p>
                <p className="text-sm leading-relaxed" style={{ color: field.color }}>{detail.pda}</p>
              </div>
            )}

            {/* Situación y Producto */}
            {(detail.problem || detail.product) && (
              <div className="grid grid-cols-2 gap-3">
                {detail.problem && (
                  <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-wider mb-1.5">💡 Situación</p>
                    <p className="text-orange-900 text-xs leading-relaxed">{detail.problem}</p>
                  </div>
                )}
                {detail.product && (
                  <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-wider mb-1.5">🎯 Producto</p>
                    <p className="text-green-900 text-xs leading-relaxed">{detail.product}</p>
                  </div>
                )}
              </div>
            )}

            {/* Stats chips */}
            {((detail.students ?? 0) > 0 || (detail.progress ?? 0) > 0) && (
              <div className="flex gap-3">
                {(detail.students ?? 0) > 0 && (
                  <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center">
                    <Users className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-slate-900 text-xl font-black">{detail.students}</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Alumnos</span>
                  </div>
                )}
                {(detail.progress ?? 0) > 0 && (
                  <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center">
                    <BarChart3 className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="font-black text-xl"
                      style={{ color: detail.progress === 100 ? '#10b981' : field.color }}>
                      {detail.progress}%
                    </span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Progreso</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── LIST VIEW ─────────────────────────────────────────────────── */
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="list"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col flex-1 w-full min-h-0 bg-slate-50 overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="bg-indigo-700 rounded-b-[2rem] px-5 pt-5 pb-5 shrink-0 relative overflow-hidden shadow-xl">
          <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-white opacity-10 rounded-full" />
          <div className="absolute inset-0"
            style={{ background: 'url(https://www.transparenttextures.com/patterns/black-scales.png)', opacity: 0.05 }} />

          <div className="flex items-center gap-3 mb-4 relative z-10">
            <button onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center active:scale-95 border border-white/20">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-white text-lg font-black leading-tight">Biblioteca de Proyectos</h1>
              <p className="text-indigo-200 text-xs font-medium">
                {loading ? 'Cargando...' : `${filtered.length} proyecto${filtered.length !== 1 ? 's' : ''} disponibles`}
              </p>
            </div>
            <button onClick={fetchProjects}
              className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center active:scale-95 border border-white/20">
              <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search */}
          <div className="relative z-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Buscar proyecto por nombre..."
              className="w-full bg-white rounded-2xl pl-11 pr-4 py-3 text-sm font-medium text-slate-700 focus:outline-none shadow-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* ── Campo Formativo tabs ── */}
        <div className="flex gap-2 px-4 pt-3 pb-1 overflow-x-auto shrink-0" style={{ scrollbarWidth: 'none' }}>
          {CAMPOS.map(c => {
            const active = tab === c.id;
            const Icon = c.icon;
            return (
              <button key={c.id} onClick={() => setTab(c.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black shrink-0 active:scale-95 transition-all border shadow-sm"
                style={{
                  background: active ? c.color : 'white',
                  color: active ? 'white' : '#64748b',
                  borderColor: active ? c.color : '#e2e8f0',
                  boxShadow: active ? `0 4px 12px ${c.color}40` : undefined,
                }}>
                <Icon size={11} /> {c.label}
              </button>
            );
          })}
        </div>

        {/* ── List ── */}
        <div className="flex-1 overflow-y-auto px-4 pt-3 pb-24 space-y-3">

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span className="text-red-700 text-sm font-medium flex-1">{error}</span>
              <button onClick={fetchProjects} className="text-red-600 font-black text-xs">Reintentar</button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-slate-500 text-sm font-medium">Cargando proyectos...</p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <BookOpen className="w-12 h-12 text-slate-200" />
              <p className="text-slate-500 font-bold text-sm">Sin proyectos en esta categoría</p>
              <p className="text-slate-400 text-xs text-center">El administrador publicará proyectos próximamente.</p>
            </div>
          )}

          {!loading && filtered.map((project, i) => {
            const field = getField(project.field_id);
            const FieldIcon = field.icon;
            const resCount = project.resources?.length ?? project.resources_count ?? 0;
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => openDetail(project)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 active:scale-[0.98] transition-transform cursor-pointer"
              >
                {/* Color top bar */}
                <div style={{ height: 3, background: field.color }} />

                <div className="p-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex items-center gap-2" style={{ color: field.color }}>
                      <div className="p-1.5 rounded-lg" style={{ background: field.bg }}>
                        <FieldIcon size={12} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider">{field.label}</span>
                    </div>
                    <StatusPill status={project.status} />
                  </div>

                  {/* Title */}
                  <h3 className="text-slate-900 font-black text-[1.05rem] leading-snug mb-1.5">{project.title}</h3>

                  {project.description && (
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-3">{project.description}</p>
                  )}

                  {/* Progress bar */}
                  {(project.progress ?? 0) > 0 && (
                    <div className="mb-3">
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{ width: `${project.progress}%`, background: project.progress === 100 ? '#10b981' : field.color, transition: 'width 1s' }} />
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {project.grade && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-violet-100 text-violet-700">
                          {project.grade}°
                        </span>
                      )}
                      {project.duration && (
                        <span className="flex items-center gap-1 text-slate-400 text-[10px] font-semibold">
                          <Clock size={10} /> {project.duration}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {resCount > 0 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black"
                          style={{ background: field.bg, color: field.color }}>
                          <Download size={9} /> {resCount} recurso{resCount > 1 ? 's' : ''}
                        </span>
                      )}
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                        style={{ background: field.bg }}>
                        <ChevronRight size={14} style={{ color: field.color }} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
