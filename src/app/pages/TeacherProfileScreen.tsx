import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, User, Lock, Camera, Save, Eye, EyeOff,
  CheckCircle2, AlertCircle, Shield, Trash2, Loader2, Mail
} from 'lucide-react';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { AUTH_TOKEN_KEY } from '../../lib/apiClient';

// ─── Helpers ───────────────────────────────────────────────
function avatarColor(name: string): string {
  const palette = ['#4f46e5','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

// ─── Password Strength ─────────────────────────────────────
function PasswordStrength({ pwd }: { pwd: string }) {
  if (!pwd) return null;
  const checks = [
    { label: '8+ caracteres', ok: pwd.length >= 8 },
    { label: 'Mayúscula', ok: /[A-Z]/.test(pwd) },
    { label: 'Número', ok: /[0-9]/.test(pwd) },
  ];
  const score = checks.filter(c => c.ok).length;
  const color = ['#ef4444', '#f59e0b', '#22c55e'][score - 1] ?? '#e2e8f0';
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i < score ? color : '#e2e8f0', transition: 'background .3s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {checks.map(c => (
          <span key={c.label} style={{ fontSize: 11, fontWeight: 600, color: c.ok ? '#16a34a' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
            <CheckCircle2 size={10} color={c.ok ? '#22c55e' : '#cbd5e1'} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: 16, right: 16, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '14px 18px', borderRadius: 14,
      background: type === 'success' ? '#f0fdf4' : '#fef2f2',
      border: `1px solid ${type === 'success' ? '#86efac' : '#fca5a5'}`,
      color: type === 'success' ? '#166534' : '#991b1b',
      fontWeight: 700, fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif',
      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
      animation: 'slideUp .3s ease',
    }}>
      {type === 'success' ? <CheckCircle2 size={18} color="#22c55e" /> : <AlertCircle size={18} color="#ef4444" />}
      {msg}
    </div>
  );
}

// ─── Section Card ───────────────────────────────────────────
function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: '20px 18px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 18 }}>
        {icon}{title}
      </h2>
      {children}
    </div>
  );
}

// ─── Input ─────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '12px 14px', border: '2px solid #e2e8f0', borderRadius: 12,
  fontSize: 14, fontWeight: 600, color: '#0f172a', background: '#fff',
  outline: 'none', fontFamily: 'Inter, system-ui, sans-serif',
};

const lbl: React.CSSProperties = {
  display: 'block', fontSize: 10, fontWeight: 700,
  color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5,
};

// ─── Main Screen ────────────────────────────────────────────
export function TeacherProfileScreen() {
  const navigate = useNavigate();
  const stored = authService.getStoredUser();

  const [name,        setName]        = useState(stored?.name ?? '');
  const [email]                       = useState(stored?.email ?? '');
  const [avatarUrl,   setAvatarUrl]   = useState<string | null>((stored as any)?.avatar ?? null);
  const [preview,     setPreview]     = useState<string | null>(null);
  const [avatarFile,  setAvatarFile]  = useState<File | null>(null);

  const [currentPwd,  setCurrentPwd]  = useState('');
  const [newPwd,      setNewPwd]      = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd,     setSavingPwd]     = useState(false);
  const [savingAvatar,  setSavingAvatar]  = useState(false);
  const [toast,         setToast]         = useState<{ msg: string; type: 'success'|'error' } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    authService.me().then(u => {
      setName(u?.name ?? '');
      setAvatarUrl((u as any)?.avatar ?? null);
    }).catch(() => {});
  }, []);

  const showToast = (msg: string, type: 'success'|'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Nombre
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) return showToast('El nombre debe tener al menos 3 caracteres.', 'error');
    setSavingProfile(true);
    try {
      const res = await userService.updateProfile(name.trim());
      showToast(res.message, 'success');
      await authService.me();
    } catch (err: any) {
      showToast(err?.message ?? 'Error al actualizar el nombre.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Contraseña
  const handleSavePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) return showToast('Las contraseñas no coinciden.', 'error');
    if (newPwd.length < 8 || !/[A-Z]/.test(newPwd) || !/[0-9]/.test(newPwd))
      return showToast('La contraseña no cumple los requisitos.', 'error');
    if (newPwd === currentPwd) return showToast('La nueva contraseña debe ser diferente.', 'error');
    setSavingPwd(true);
    try {
      const res = await userService.updatePassword({ current_password: currentPwd, password: newPwd, password_confirmation: confirmPwd });
      localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      showToast('Contraseña actualizada. Cierra sesión en otros dispositivos.', 'success');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err: any) {
      showToast(err?.message ?? 'Contraseña actual incorrecta.', 'error');
    } finally {
      setSavingPwd(false);
    }
  };

  // ── Avatar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return showToast('Máximo 2 MB.', 'error');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
      return showToast('Solo JPG, PNG o WebP.', 'error');
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) return;
    setSavingAvatar(true);
    try {
      const res = await userService.updateAvatar(avatarFile);
      setAvatarUrl(res.avatar_url);
      setPreview(null); setAvatarFile(null);
      showToast('¡Foto actualizada!', 'success');
    } catch (err: any) {
      showToast(err?.message ?? 'Error al subir la foto.', 'error');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm('¿Eliminar tu foto de perfil?')) return;
    setSavingAvatar(true);
    try {
      await userService.deleteAvatar();
      setAvatarUrl(null); setPreview(null); setAvatarFile(null);
      showToast('Foto eliminada.', 'success');
    } catch {
      showToast('Error al eliminar la foto.', 'error');
    } finally {
      setSavingAvatar(false);
    }
  };

  const displayAvatar = preview ?? avatarUrl;
  const initials = name.trim().charAt(0).toUpperCase() || '?';
  const bg = avatarColor(name || 'U');

  const btnPrimary = (loading: boolean): React.CSSProperties => ({
    width: '100%', padding: '13px', border: 'none', borderRadius: 12,
    background: loading ? '#e2e8f0' : 'linear-gradient(135deg,#2563eb,#4f46e5)',
    color: loading ? '#94a3b8' : '#fff', fontWeight: 700, fontSize: 14,
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: 'Inter, system-ui, sans-serif',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', padding: '48px 20px 24px', position: 'relative' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ position: 'absolute', top: 48, left: 16, background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 12, padding: '8px 10px', cursor: 'pointer', display: 'flex' }}
        >
          <ArrowLeft size={20} color="#fff" />
        </button>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, textAlign: 'center', margin: 0 }}>Mi Perfil</h1>
        <p style={{ color: 'rgba(219,234,254,0.7)', fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 0 }}>Gestiona tu cuenta</p>
      </div>

      {/* Avatar hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -32, marginBottom: 20, padding: '0 20px' }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: displayAvatar ? 'transparent' : bg,
            border: '4px solid #fff', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', fontSize: 32, fontWeight: 900, color: '#fff',
          }}>
            {displayAvatar
              ? <img src={displayAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            style={{ position: 'absolute', bottom: 0, right: 0, background: '#3b82f6', border: '3px solid #fff', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Camera size={12} color="#fff" />
          </button>
        </div>
        <span style={{ marginTop: 10, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>{name}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{email}</span>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFileChange} />

        {preview && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={handleSaveAvatar} disabled={savingAvatar} style={{ padding: '8px 18px', background: 'linear-gradient(135deg,#2563eb,#4f46e5)', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              {savingAvatar ? <Loader2 size={13} /> : <Save size={13} />} Guardar foto
            </button>
            <button onClick={() => { setPreview(null); setAvatarFile(null); }} style={{ padding: '8px 14px', background: '#f1f5f9', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        )}

        {avatarUrl && !preview && (
          <button onClick={handleDeleteAvatar} style={{ marginTop: 8, padding: '6px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, fontWeight: 700, fontSize: 12, color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Trash2 size={12} /> Eliminar foto
          </button>
        )}
      </div>

      {/* Cards */}
      <div style={{ padding: '0 16px 80px' }}>

        {/* Nombre */}
        <Card title="Información Personal" icon={<User size={16} color="#10b981" />}>
          <form onSubmit={handleSaveName} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={lbl}>Nombre completo</label>
              <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" minLength={3} required />
            </div>
            <div>
              <label style={lbl}>Correo electrónico</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input style={{ ...inp, paddingLeft: 36, background: '#f8fafc', color: '#94a3b8' }} value={email} disabled />
              </div>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, fontWeight: 500 }}>🔒 Contacta al administrador para cambiar el correo.</p>
            </div>
            <button type="submit" disabled={savingProfile} style={btnPrimary(savingProfile)}>
              {savingProfile ? <Loader2 size={16} /> : <Save size={16} />}
              {savingProfile ? 'Guardando...' : 'Guardar nombre'}
            </button>
          </form>
        </Card>

        {/* Contraseña */}
        <Card title="Cambiar Contraseña" icon={<Shield size={16} color="#8b5cf6" />}>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14, fontWeight: 500 }}>
            Al guardar se revocará la sesión en otros dispositivos.
          </p>
          <form onSubmit={handleSavePwd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={lbl}>Contraseña actual</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input style={{ ...inp, paddingLeft: 36, paddingRight: 40 }} type={showCurrent ? 'text' : 'password'} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label style={lbl}>Nueva contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input style={{ ...inp, paddingLeft: 36, paddingRight: 40 }} type={showNew ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Mínimo 8 caracteres" required />
                <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength pwd={newPwd} />
            </div>
            <div>
              <label style={lbl}>Confirmar nueva contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input style={{ ...inp, paddingLeft: 36, borderColor: confirmPwd && confirmPwd !== newPwd ? '#fca5a5' : undefined }} type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Repite la contraseña" required />
              </div>
              {confirmPwd && confirmPwd !== newPwd && <p style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, marginTop: 3 }}>✗ Las contraseñas no coinciden</p>}
              {confirmPwd && confirmPwd === newPwd && newPwd.length >= 8 && <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginTop: 3 }}>✓ Las contraseñas coinciden</p>}
            </div>
            <button type="submit" disabled={savingPwd || !currentPwd || !newPwd || newPwd !== confirmPwd}
              style={{ ...btnPrimary(savingPwd || !currentPwd || !newPwd || newPwd !== confirmPwd), background: (!savingPwd && currentPwd && newPwd && newPwd === confirmPwd) ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : '#e2e8f0' }}>
              {savingPwd ? <Loader2 size={16} /> : <Shield size={16} />}
              {savingPwd ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </Card>

      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
