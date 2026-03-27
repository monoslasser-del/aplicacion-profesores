import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, Sparkles, CheckCircle, Clock, Save,
  X, FileText, ChevronRight, AlertCircle, Home,
  ClipboardList, Users, BookOpen,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { descriptiveCardService, type DescriptiveCardData } from '../../services/descriptiveCardService';

// ─── Color tokens ─────────────────────────────────────────
const C = {
  primary:  '#4f46e5',
  emerald:  '#059669',
  rose:     '#e11d48',
  amber:    '#d97706',
  slate50:  '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate500: '#64748b',
  slate700: '#334155',
  slate900: '#0f172a',
} as const;

// ─── Toast ─────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: .95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: .95 }}
      style={{
        position: 'fixed', top: 52, left: 16, right: 16, zIndex: 999,
        background: type === 'success' ? '#059669' : '#dc2626',
        borderRadius: 14, padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      }}
    >
      {type === 'success'
        ? <CheckCircle size={18} color="white" />
        : <AlertCircle size={18} color="white" />}
      <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{msg}</span>
    </motion.div>
  );
}

// ─── Progress Ring ─────────────────────────────────────────
function ProgressRing({ generated, total }: { generated: number; total: number }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? generated / total : 0;
  const offset = circ - pct * circ;
  return (
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      <svg width={120} height={120} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={60} cy={60} r={r} fill="none" stroke={C.slate100} strokeWidth={12} />
        <circle
          cx={60} cy={60} r={r} fill="none"
          stroke={C.primary} strokeWidth={12}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 24, fontWeight: 900, color: C.slate900, lineHeight: 1 }}>
          {generated}<span style={{ fontSize: 14, fontWeight: 600, color: C.slate500 }}>/{total}</span>
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.slate500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Fichas
        </span>
      </div>
    </div>
  );
}

// ─── Card Field Editor ─────────────────────────────────────
function FieldEditor({
  label, color, value, onChange, placeholder,
}: { label: string; color: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 800, color, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        style={{
          width: '100%', borderRadius: 12, border: `2px solid ${C.slate200}`,
          background: C.slate50, padding: '10px 12px',
          fontSize: 13, color: C.slate700, lineHeight: 1.6,
          resize: 'none', outline: 'none', fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
        onFocus={e => { e.target.style.borderColor = color; e.target.style.background = 'white'; }}
        onBlur={e => { e.target.style.borderColor = C.slate200; e.target.style.background = C.slate50; }}
      />
    </div>
  );
}

// ─── Main Screen ───────────────────────────────────────────
export function DescriptiveCardsScreen() {
  const navigate = useNavigate();
  const user = authService.getStoredUser?.() ?? null;
  const groupId: number = (user as any)?.group_info?.id ?? 1;

  const [progress, setProgress]       = useState<any>(null);
  const [loading, setLoading]         = useState(true);

  // Modal state
  const [modalOpen, setModalOpen]     = useState(false);
  const [editingStudent, setEditing]  = useState<any>(null);
  const [card, setCard]               = useState<DescriptiveCardData | null>(null);
  const [loadingCard, setLoadingCard] = useState(false);
  const [saving, setSaving]           = useState(false);

  const [toast, setToast]             = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadProgress = useCallback(async () => {
    setLoading(true);
    try {
      const data = await descriptiveCardService.getGroupProgress(groupId);
      setProgress(data);
    } catch {
      showToast('No se pudo cargar el progreso del grupo', 'error');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  const handleBatchGenerate = async () => {
    if (!progress || progress.pending === 0) return;
    setIsGeneratingBatch(true);
    try {
      showToast('Iniciando generación en lote con IA...', 'success');
      const res = await descriptiveCardService.generateBatch(groupId);
      showToast(res.message, 'success');
      await loadProgress(); // Recargar la lista
    } catch (err) {
      showToast('Error al generar fichas en lote', 'error');
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  // Open editor
  const openEditor = async (student: any) => {
    setEditing(student);
    setModalOpen(true);
    setLoadingCard(true);
    setCard(null);
    try {
      const data = await descriptiveCardService.getCard(student.id);
      setCard(data);
    } catch {
      showToast('Error al cargar la ficha', 'error');
      setModalOpen(false);
    } finally {
      setLoadingCard(false);
    }
  };

  // Save card
  const saveCard = async () => {
    if (!card) return;
    setSaving(true);
    try {
      await descriptiveCardService.saveCard(card.student_id, card);
      showToast('¡Ficha guardada correctamente! ✓');
      setModalOpen(false);
      loadProgress();
    } catch {
      showToast('Error al guardar la ficha', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Open PDF in new tab
  const openPdf = (studentId: number) => {
    const url = descriptiveCardService.downloadPdfUrl(studentId);
    window.open(url, '_blank');
  };

  const updateField = (field: keyof DescriptiveCardData, value: string) => {
    setCard(prev => prev ? { ...prev, [field]: value } : null);
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', overflow: 'hidden',
      background: C.slate50, fontFamily: 'Inter, system-ui, sans-serif',
      position: 'relative',
    }}>

      {/* Toast */}
      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} />}</AnimatePresence>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{
        background: 'white', borderBottom: `1px solid ${C.slate100}`,
        padding: '52px 20px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: C.slate100, border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}
        >
          <ArrowLeft size={20} color={C.slate700} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 900, color: C.slate900, margin: 0, letterSpacing: '-0.02em' }}>
            Fichas Descriptivas
          </h1>
          <p style={{ fontSize: 12, color: C.slate500, margin: 0, fontWeight: 500 }}>
            {user ? `${(user as any).group_info?.name ?? 'Grupo'}` : 'Grupo'} · Ciclo NEM
          </p>
        </div>
        <div style={{
          background: `${C.primary}15`, borderRadius: 10, padding: '6px 10px',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <Sparkles size={14} color={C.primary} />
          <span style={{ fontSize: 11, fontWeight: 800, color: C.primary }}>IA</span>
        </div>
      </div>

      {/* ── SCROLLABLE BODY ────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 90px' }}>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              style={{ width: 36, height: 36, borderRadius: '50%', border: `4px solid ${C.slate200}`, borderTopColor: C.primary }}
            />
            <p style={{ color: C.slate500, fontWeight: 600, marginTop: 16, fontSize: 14 }}>Cargando fichas...</p>
          </div>
        ) : progress ? (
          <>
            {/* Progress Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'white', borderRadius: 20, padding: 20,
                boxShadow: '0 2px 16px rgba(0,0,0,0.07)', marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 20,
              }}
            >
              <ProgressRing generated={progress.generated} total={progress.total_students} />
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 13, color: C.slate500, margin: 0, fontWeight: 600 }}>Progreso del grupo</p>
                  <p style={{ fontSize: 22, fontWeight: 900, color: C.slate900, margin: '2px 0 0', letterSpacing: '-0.02em' }}>
                    {progress.total_students > 0
                      ? `${Math.round((progress.generated / progress.total_students) * 100)}%`
                      : '0%'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{
                    flex: 1, background: `${C.emerald}15`, borderRadius: 10, padding: '6px 10px', textAlign: 'center',
                  }}>
                    <p style={{ fontSize: 18, fontWeight: 900, color: C.emerald, margin: 0 }}>{progress.generated}</p>
                    <p style={{ fontSize: 10, fontWeight: 700, color: C.emerald, margin: 0, letterSpacing: '0.03em' }}>GENERADAS</p>
                  </div>
                  <div style={{
                    flex: 1, background: `${C.amber}15`, borderRadius: 10, padding: '6px 10px', textAlign: 'center',
                  }}>
                    <p style={{ fontSize: 18, fontWeight: 900, color: C.amber, margin: 0 }}>{progress.pending}</p>
                    <p style={{ fontSize: 10, fontWeight: 700, color: C.amber, margin: 0, letterSpacing: '0.03em' }}>PENDIENTES</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI tip banner with Batch Button */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .2 }}
              style={{
                background: `linear-gradient(135deg, ${C.primary}18, #7c3aed18)`,
                border: `1px solid ${C.primary}30`,
                borderRadius: 14, padding: '12px 16px',
                display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <Sparkles size={16} color={C.primary} style={{ marginTop: 2, flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: C.primary, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
                  El motor de IA analiza las calificaciones y genera un borrador personalizado para cada alumno. 
                  Puedes editarlo libremente antes de guardarlo.
                </p>
              </div>
              {progress.pending > 0 && (
                <button
                  onClick={handleBatchGenerate}
                  disabled={isGeneratingBatch}
                  style={{
                    backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: 10,
                    padding: '10px 14px', fontSize: 13, fontWeight: 800, cursor: isGeneratingBatch ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, alignSelf: 'flex-start',
                    opacity: isGeneratingBatch ? 0.7 : 1, transition: 'all 0.2s'
                  }}
                >
                  {isGeneratingBatch ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }}
                      />
                      En proceso...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Generar Todas ({progress.pending})
                    </>
                  )}
                </button>
              )}
            </motion.div>

            {/* Student list */}
            <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
              <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${C.slate100}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} color={C.primary} />
                <span style={{ fontSize: 14, fontWeight: 800, color: C.slate900 }}>Alumnos del Grupo</span>
                <span style={{
                  marginLeft: 'auto', background: C.slate100, borderRadius: 20,
                  padding: '2px 8px', fontSize: 11, fontWeight: 700, color: C.slate500,
                }}>
                  {progress.students.length}
                </span>
              </div>

              {progress.students.map((student: any, idx: number) => (
                <motion.button
                  key={student.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => openEditor(student)}
                  style={{
                    width: '100%', background: 'white', border: 'none',
                    borderBottom: idx < progress.students.length - 1 ? `1px solid ${C.slate100}` : 'none',
                    padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  {/* Avatar letter */}
                  <div style={{
                    width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                    background: student.status === 'Generada' ? `${C.emerald}20` : `${C.amber}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, fontWeight: 800,
                    color: student.status === 'Generada' ? C.emerald : C.amber,
                  }}>
                    {student.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.slate900, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {student.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                      {student.status === 'Generada' ? (
                        <>
                          <CheckCircle size={12} color={C.emerald} />
                          <span style={{ fontSize: 11, fontWeight: 700, color: C.emerald }}>Ficha generada</span>
                        </>
                      ) : (
                        <>
                          <Clock size={12} color={C.amber} />
                          <span style={{ fontSize: 11, fontWeight: 700, color: C.amber }}>Pendiente de generar</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.primary }}>
                      {student.status === 'Generada' ? 'Ver/Editar' : 'Generar IA'}
                    </span>
                    <ChevronRight size={14} color={C.primary} />
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: 80, color: C.slate500 }}>
            <FileText size={40} style={{ opacity: .3, marginBottom: 12 }} />
            <p style={{ fontWeight: 600 }}>Sin datos de fichas</p>
          </div>
        )}
      </div>

      {/* ── EDITOR MODAL (slide up) ─────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !saving && setModalOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 100, backdropFilter: 'blur(4px)' }}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
                background: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28,
                maxHeight: '92dvh', display: 'flex', flexDirection: 'column',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
              }}
            >
              {/* Handle */}
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: C.slate200 }} />
              </div>

              {/* Modal Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 20px 16px',
                borderBottom: `1px solid ${C.slate100}`,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={18} color={C.primary} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 900, color: C.slate900, margin: 0 }}>Ficha Descriptiva NEM</p>
                  <p style={{ fontSize: 12, color: C.slate500, margin: 0, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {editingStudent?.name}
                  </p>
                </div>
                <button
                  onClick={() => !saving && setModalOpen(false)}
                  style={{ background: C.slate100, border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}
                >
                  <X size={18} color={C.slate500} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                {loadingCard ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48 }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                      style={{ width: 32, height: 32, borderRadius: '50%', border: `4px solid ${C.slate200}`, borderTopColor: C.primary }}
                    />
                    <p style={{ color: C.slate500, fontWeight: 600, marginTop: 12, fontSize: 13 }}>
                      Analizando calificaciones y generando borrador...
                    </p>
                  </div>
                ) : card ? (
                  <>
                    {/* Info banner */}
                    <div style={{
                      background: `${C.primary}12`, borderRadius: 12, padding: '10px 14px',
                      marginBottom: 16, display: 'flex', gap: 8,
                    }}>
                      <Sparkles size={14} color={C.primary} style={{ flexShrink: 0, marginTop: 2 }} />
                      <p style={{ fontSize: 12, color: C.primary, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
                        Borrador basado en {card.evaluaciones_count ?? 0} evaluaciones. Edita libremente antes de guardar.
                      </p>
                    </div>

                    <FieldEditor
                      label="⚡ Fortalezas Consolidadas"
                      color={C.emerald}
                      value={card.fortalezas ?? ''}
                      onChange={v => updateField('fortalezas', v)}
                      placeholder="Describe las fortalezas del alumno..."
                    />
                    <FieldEditor
                      label="⚠ Áreas de Oportunidad"
                      color={C.rose}
                      value={card.areas_oportunidad ?? ''}
                      onChange={v => updateField('areas_oportunidad', v)}
                      placeholder="Aspectos a trabajar..."
                    />
                    <FieldEditor
                      label="❤ Orientaciones para la Familia"
                      color="#2563eb"
                      value={card.recomendaciones_familia ?? ''}
                      onChange={v => updateField('recomendaciones_familia', v)}
                      placeholder="Actividades y rutinas para casa..."
                    />
                    <FieldEditor
                      label="📋 Acuerdos Generales"
                      color={C.slate500}
                      value={card.recomendaciones_generales ?? ''}
                      onChange={v => updateField('recomendaciones_generales', v)}
                      placeholder="Acuerdos adicionales del aula..."
                    />

                    {/* PDF button if already saved */}
                    {card.status === 'Generada' && (
                      <button
                        onClick={() => openPdf(card.student_id)}
                        style={{
                          width: '100%', padding: '12px', borderRadius: 12, marginBottom: 8,
                          border: `2px solid ${C.primary}`, background: 'white',
                          color: C.primary, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          fontFamily: 'inherit',
                        }}
                      >
                        <FileText size={16} />
                        Ver PDF de esta ficha
                      </button>
                    )}
                  </>
                ) : null}
              </div>

              {/* Modal Footer */}
              {!loadingCard && card && (
                <div style={{ padding: '12px 20px 32px', borderTop: `1px solid ${C.slate100}`, display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => setModalOpen(false)}
                    style={{
                      flex: 1, padding: '14px', borderRadius: 14, border: `2px solid ${C.slate200}`,
                      background: 'white', color: C.slate700, fontWeight: 700, fontSize: 14,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveCard}
                    disabled={saving}
                    style={{
                      flex: 2, padding: '14px', borderRadius: 14, border: 'none',
                      background: saving ? C.slate200 : C.slate900,
                      color: saving ? C.slate500 : 'white',
                      fontWeight: 800, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      fontFamily: 'inherit', boxShadow: saving ? 'none' : '0 4px 16px rgba(0,0,0,0.18)',
                    }}
                  >
                    {saving ? (
                      <motion.div
                        animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ width: 18, height: 18, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }}
                      />
                    ) : <Save size={16} />}
                    {saving ? 'Guardando...' : 'Guardar Ficha Oficial'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── BOTTOM NAVBAR ──────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'white', borderTop: `1px solid ${C.slate100}`,
        display: 'flex', zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      }}>
        {[
          { icon: ClipboardList, label: 'CAPTURAR', path: '/capture' },
          { icon: Home, label: 'INICIO', path: '/dashboard' },
          { icon: BookOpen, label: 'REGISTROS', path: '/records' },
          { icon: Users, label: 'GRUPOS', path: '/groups' },
        ].map(({ icon: Icon, label, path }) => {
          const active = path === '/dashboard'; // none active — we're on a sub-page
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={{
                flex: 1, background: 'none', border: 'none',
                padding: '10px 0 6px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                position: 'relative',
              }}
            >
              {active && (
                <div style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: 2, background: C.primary, borderRadius: 2 }} />
              )}
              <Icon size={22} color={active ? C.primary : C.slate500} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{ fontSize: 9, fontWeight: 800, color: active ? C.primary : C.slate500, letterSpacing: '0.04em' }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
