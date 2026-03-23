import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, Bell, Send, Plus, X, CheckCheck,
  Users, User, Clock, AlertCircle, CheckCircle,
  MessageSquare, ChevronRight, Home, ClipboardList, BookOpen,
  Megaphone, BookMarked,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { notificationService, type NotificationPayload } from '../../services/notificationService';
import { studentService } from '../../services/studentService';

// ─── Color tokens ─────────────────────────────────────────
const C = {
  primary:  '#4f46e5',
  emerald:  '#059669',
  amber:    '#d97706',
  rose:     '#e11d48',
  slate50:  '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate700: '#334155',
  slate900: '#0f172a',
} as const;

// ─── Helpers ───────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60)  return 'Ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

const PALETTE = ['#4f46e5','#0891b2','#059669','#d97706','#e11d48','#7c3aed','#0284c7'];
function avatarColor(name: string) {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) % PALETTE.length;
  return PALETTE[h];
}

// ─── Toast ─────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      style={{
        position: 'fixed', top: 52, left: 16, right: 16, zIndex: 999,
        background: type === 'success' ? C.emerald : C.rose,
        borderRadius: 14, padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      }}
    >
      {type === 'success' ? <CheckCircle size={18} color="white" /> : <AlertCircle size={18} color="white" />}
      <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{msg}</span>
    </motion.div>
  );
}

// ─── Compose Modal ─────────────────────────────────────────
interface ComposeProps {
  students: any[];
  groupId: number;
  onSend: (payload: NotificationPayload) => Promise<void>;
  onClose: () => void;
  sending: boolean;
}
function ComposeModal({ students, groupId, onSend, onClose, sending }: ComposeProps) {
  const [target, setTarget] = useState<'group' | 'student'>('group');
  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const QUICK = [
    { icon: '📅', text: 'Recordatorio: Junta de padres mañana a las 5 PM' },
    { icon: '⚠️', text: 'Aviso importante sobre los materiales del período' },
    { icon: '🏫', text: 'No hay clases el próximo viernes (día de asueto)' },
    { icon: '📝', text: 'Entrega de fichas descriptivas esta semana' },
  ];

  const handleSend = () => {
    if (!title.trim() || !message.trim()) return;
    onSend({
      title,
      message,
      group_id:   target === 'group' ? groupId : undefined,
      student_id: target === 'student' && studentId ? parseInt(studentId) : undefined,
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
          background: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28,
          maxHeight: '92dvh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.slate200 }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px 16px', borderBottom: `1px solid ${C.slate100}` }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Megaphone size={18} color={C.primary} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 900, color: C.slate900, margin: 0 }}>Nuevo Aviso</p>
            <p style={{ fontSize: 11, color: C.slate500, margin: 0, fontWeight: 600 }}>Enviar a padres de familia</p>
          </div>
          <button onClick={onClose} style={{ background: C.slate100, border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}>
            <X size={18} color={C.slate500} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

          {/* Destinatario */}
          <p style={{ fontSize: 11, fontWeight: 800, color: C.slate500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Destinatario</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['group', 'student'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTarget(t)}
                style={{
                  flex: 1, padding: '10px 8px', borderRadius: 12, border: `2px solid ${target === t ? C.primary : C.slate200}`,
                  background: target === t ? `${C.primary}12` : 'white',
                  color: target === t ? C.primary : C.slate500,
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit',
                }}
              >
                {t === 'group' ? <><Users size={14} /> Todo el grupo</> : <><User size={14} /> Alumno específico</>}
              </button>
            ))}
          </div>

          {target === 'student' && (
            <select
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 12,
                border: `2px solid ${C.slate200}`, background: C.slate50,
                fontSize: 13, color: C.slate700, marginBottom: 16,
                outline: 'none', fontFamily: 'inherit', appearance: 'none',
              }}
            >
              <option value="">-- Selecciona alumno --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}

          {/* Asunto */}
          <p style={{ fontSize: 11, fontWeight: 800, color: C.slate500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Asunto</p>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ej: Recordatorio de junta mensual"
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 12,
              border: `2px solid ${C.slate200}`, background: C.slate50,
              fontSize: 13, color: C.slate900, marginBottom: 16,
              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />

          {/* Mensaje */}
          <p style={{ fontSize: 11, fontWeight: 800, color: C.slate500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Mensaje</p>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Escribe el contenido del aviso..."
            rows={4}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 12,
              border: `2px solid ${C.slate200}`, background: C.slate50,
              fontSize: 13, color: C.slate700, marginBottom: 14,
              outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />

          {/* Mensajes rápidos */}
          <p style={{ fontSize: 11, fontWeight: 800, color: C.slate500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Mensajes rápidos</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
            {QUICK.map((q, i) => (
              <button
                key={i}
                onClick={() => setMessage(q.text)}
                style={{
                  textAlign: 'left', padding: '10px 12px', borderRadius: 12,
                  border: `1px solid ${C.slate200}`, background: 'white',
                  fontSize: 12, color: C.slate700, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <span>{q.icon}</span>
                <span>{q.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px 32px', borderTop: `1px solid ${C.slate100}`, display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: 14, borderRadius: 14,
              border: `2px solid ${C.slate200}`, background: 'white',
              color: C.slate700, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !title.trim() || !message.trim()}
            style={{
              flex: 2, padding: 14, borderRadius: 14, border: 'none',
              background: (!title.trim() || !message.trim() || sending) ? C.slate200 : C.primary,
              color: (!title.trim() || !message.trim() || sending) ? C.slate500 : 'white',
              fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: (!title.trim() || !message.trim() || sending) ? 'none' : `0 4px 16px ${C.primary}40`,
            }}
          >
            {sending ? (
              <motion.div
                animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: 18, height: 18, borderRadius: '50%', border: '3px solid rgba(255,255,255,.3)', borderTopColor: 'white' }}
              />
            ) : <Send size={16} />}
            {sending ? 'Enviando...' : 'Enviar Aviso'}
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Main Screen ───────────────────────────────────────────
export function NotificationsScreen() {
  const navigate = useNavigate();
  const user = authService.getStoredUser?.() ?? null;
  const groupId: number = (user as any)?.group_info?.id ?? 1;

  const [sent, setSent]         = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [compose, setCompose]   = useState(false);
  const [sending, setSending]   = useState(false);
  const [toast, setToast]       = useState<{ msg: string; type: 'success'|'error' }|null>(null);

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [notifs, studs] = await Promise.all([
        notificationService.getSent() as Promise<any[]>,
        studentService.getStudents() as Promise<any[]>,
      ]);
      setSent(Array.isArray(notifs) ? notifs : []);
      setStudents(Array.isArray(studs) ? studs : []);
    } catch {
      showToast('No se pudo cargar el historial', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSend = async (payload: NotificationPayload) => {
    setSending(true);
    try {
      await notificationService.send(payload);
      setCompose(false);
      showToast('¡Aviso enviado correctamente! ✓');
      load(); // refresh history
    } catch {
      showToast('Error al enviar el aviso', 'error');
    } finally {
      setSending(false);
    }
  };

  // Group sent notifications by day
  const byDay: Record<string, any[]> = {};
  sent.forEach(n => {
    const day = new Date(n.created_at).toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'long' });
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(n);
  });

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', overflow: 'hidden',
      background: C.slate50, fontFamily: 'Inter, system-ui, sans-serif', position: 'relative',
    }}>

      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} />}</AnimatePresence>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{
        background: 'white', borderBottom: `1px solid ${C.slate100}`,
        padding: '52px 20px 16px',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ background: C.slate100, border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}
          >
            <ArrowLeft size={20} color={C.slate700} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: C.slate900, margin: 0, letterSpacing: '-0.02em' }}>
              Notificaciones
            </h1>
            <p style={{ fontSize: 12, color: C.slate500, margin: 0, fontWeight: 500 }}>
              Avisos enviados a padres de familia
            </p>
          </div>
          <motion.button
            whileTap={{ scale: .94 }}
            onClick={() => setCompose(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 12, border: 'none',
              background: C.primary, color: 'white',
              fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: `0 4px 14px ${C.primary}40`,
            }}
          >
            <Plus size={16} />
            Nuevo
          </motion.button>
        </div>

        {/* Stats pills */}
        {!loading && (
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <div style={{
              flex: 1, background: `${C.primary}10`, borderRadius: 12,
              padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <CheckCheck size={14} color={C.primary} />
              <div>
                <p style={{ fontSize: 16, fontWeight: 900, color: C.primary, margin: 0, lineHeight: 1 }}>{sent.length}</p>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.primary, margin: 0, letterSpacing: '0.03em' }}>ENVIADOS</p>
              </div>
            </div>
            <div style={{
              flex: 1, background: `${C.emerald}10`, borderRadius: 12,
              padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Users size={14} color={C.emerald} />
              <div>
                <p style={{ fontSize: 16, fontWeight: 900, color: C.emerald, margin: 0, lineHeight: 1 }}>
                  {sent.filter(n => n.group_id).length}
                </p>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.emerald, margin: 0, letterSpacing: '0.03em' }}>GRUPO</p>
              </div>
            </div>
            <div style={{
              flex: 1, background: `${C.amber}10`, borderRadius: 12,
              padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <User size={14} color={C.amber} />
              <div>
                <p style={{ fontSize: 16, fontWeight: 900, color: C.amber, margin: 0, lineHeight: 1 }}>
                  {sent.filter(n => n.student_id).length}
                </p>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.amber, margin: 0, letterSpacing: '0.03em' }}>INDIVIDUALES</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── BODY ───────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 90px' }}>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60 }}>
            <motion.div
              animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              style={{ width: 36, height: 36, borderRadius: '50%', border: `4px solid ${C.slate200}`, borderTopColor: C.primary }}
            />
            <p style={{ color: C.slate500, fontWeight: 600, marginTop: 14, fontSize: 14 }}>Cargando historial...</p>
          </div>
        ) : sent.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, textAlign: 'center' }}
          >
            <div style={{ width: 72, height: 72, borderRadius: 22, background: `${C.primary}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Bell size={32} color={C.primary} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 800, color: C.slate700, margin: 0 }}>Sin avisos enviados</p>
            <p style={{ fontSize: 13, color: C.slate400, marginTop: 6, maxWidth: 220 }}>
              Toca "Nuevo" para enviar tu primer aviso a los padres de familia.
            </p>
            <motion.button
              whileTap={{ scale: .95 }}
              onClick={() => setCompose(true)}
              style={{
                marginTop: 20, padding: '12px 24px', borderRadius: 14, border: 'none',
                background: C.primary, color: 'white', fontWeight: 800, fontSize: 14,
                cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: `0 4px 20px ${C.primary}40`,
              }}
            >
              <Plus size={16} /> Redactar primer aviso
            </motion.button>
          </motion.div>
        ) : (
          Object.entries(byDay).map(([day, items]) => (
            <div key={day} style={{ marginBottom: 20 }}>
              {/* Day separator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1, height: 1, background: C.slate200 }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: C.slate400, textTransform: 'capitalize', letterSpacing: '0.04em' }}>{day}</span>
                <div style={{ flex: 1, height: 1, background: C.slate200 }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map((n, idx) => {
                  const isGroup = !!n.group_id;
                  const label = isGroup ? 'Todo el grupo' : (n.student?.name ?? `Alumno #${n.student_id}`);
                  const color = isGroup ? C.primary : C.amber;
                  return (
                    <motion.div
                      key={n.id ?? idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      style={{
                        background: 'white', borderRadius: 18,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Color top bar */}
                      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, ${color}80)` }} />
                      <div style={{ padding: '14px 16px' }}>
                        {/* Header row */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                            background: `${color}18`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {isGroup ? <Users size={18} color={color} /> : <User size={18} color={color} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                              <span style={{
                                fontSize: 10, fontWeight: 800, color, textTransform: 'uppercase',
                                letterSpacing: '0.05em', background: `${color}15`,
                                padding: '2px 8px', borderRadius: 20,
                              }}>
                                {isGroup ? '👨‍👩‍👧‍👦 Grupo completo' : '👤 Individual'}
                              </span>
                              <span style={{ fontSize: 11, color: C.slate400, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Clock size={10} />
                                {timeAgo(n.created_at)}
                              </span>
                            </div>
                            <p style={{ fontSize: 14, fontWeight: 800, color: C.slate900, margin: '4px 0 0', lineHeight: 1.2 }}>
                              {n.title}
                            </p>
                            <p style={{ fontSize: 11, color: C.slate500, margin: '2px 0 0', fontWeight: 600 }}>
                              Para: {label}
                            </p>
                          </div>
                        </div>

                        {/* Message */}
                        <div style={{
                          background: C.slate50, borderRadius: 12,
                          padding: '10px 12px', borderLeft: `3px solid ${color}`,
                        }}>
                          <p style={{ fontSize: 13, color: C.slate700, margin: 0, lineHeight: 1.55 }}>
                            {n.message}
                          </p>
                        </div>

                        {/* Footer */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10 }}>
                          <CheckCheck size={13} color={C.emerald} />
                          <span style={{ fontSize: 11, color: C.emerald, fontWeight: 700 }}>Enviado</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── COMPOSE MODAL ──────────────────────────────────── */}
      <AnimatePresence>
        {compose && (
          <ComposeModal
            students={students}
            groupId={groupId}
            onSend={handleSend}
            onClose={() => setCompose(false)}
            sending={sending}
          />
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
        ].map(({ icon: Icon, label, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            style={{
              flex: 1, background: 'none', border: 'none',
              padding: '10px 0 6px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            }}
          >
            <Icon size={22} color={C.slate400} strokeWidth={1.8} />
            <span style={{ fontSize: 9, fontWeight: 800, color: C.slate400, letterSpacing: '0.04em' }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
