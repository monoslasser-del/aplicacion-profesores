import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  ArrowLeft, Pencil, Lock, Camera, Save, Eye, EyeOff,
  CheckCircle2, AlertCircle, Shield, Trash2, Loader2, Mail,
  X, ChevronDown, ChevronUp, User, Home, Users, ClipboardList,
  Smartphone, AlertTriangle,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { AUTH_TOKEN_KEY } from '../../lib/apiClient';

// ─── Color tokens ─────────────────────────────────────────
const C = {
  primary:    '#2563eb',
  primaryDk:  '#1d4ed8',
  primaryLt:  '#eff6ff',
  accent:     '#4f46e5',
  success:    '#16a34a',
  successLt:  '#f0fdf4',
  error:      '#dc2626',
  errorLt:    '#fef2f2',
  warn:       '#d97706',
  warnLt:     '#fffbeb',
  gray50:     '#f8fafc',
  gray100:    '#f1f5f9',
  gray200:    '#e2e8f0',
  gray400:    '#94a3b8',
  gray600:    '#475569',
  gray700:    '#334155',
  gray900:    '#0f172a',
  white:      '#ffffff',
};

// ─── Avatar deterministic color ───────────────────────────
function avatarColor(name: string): string {
  const p = ['#2563eb','#0ea5e9','#10b981','#f59e0b','#7c3aed','#ec4899','#14b8a6'];
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return p[Math.abs(h) % p.length];
}

// ─── Toast ────────────────────────────────────────────────
function Toast({ msg, type, onDismiss }: { msg: string; type: 'success'|'error'|'warn'; onDismiss: () => void }) {
  const bg   = type === 'success' ? C.successLt : type === 'warn' ? C.warnLt : C.errorLt;
  const bdr  = type === 'success' ? '#86efac'   : type === 'warn' ? '#fcd34d' : '#fca5a5';
  const clr  = type === 'success' ? C.success   : type === 'warn' ? C.warn    : C.error;
  const Icon = type === 'success' ? CheckCircle2 : type === 'warn' ? AlertTriangle : AlertCircle;
  const iconColor = type === 'success' ? '#22c55e' : type === 'warn' ? '#f59e0b' : '#ef4444';
  return (
    <div onClick={onDismiss} style={{
      position:'fixed',bottom:88,left:16,right:16,zIndex:9999,
      display:'flex',alignItems:'center',gap:10,
      padding:'14px 16px',borderRadius:14,cursor:'pointer',
      background:bg,border:`1.5px solid ${bdr}`,color:clr,
      fontWeight:700,fontSize:13,fontFamily:'Inter,system-ui,sans-serif',
      boxShadow:'0 8px 32px rgba(0,0,0,0.12)',
      animation:'slideUp .25s ease',
    }}>
      <Icon size={18} color={iconColor} style={{flexShrink:0}} />
      <span style={{flex:1}}>{msg}</span>
      <X size={15} color={clr} />
    </div>
  );
}

// ─── Password strength ────────────────────────────────────
function PasswordStrength({ pwd }: { pwd: string }) {
  if (!pwd) return null;
  const checks = [
    { label:'8+ chars',  ok: pwd.length >= 8 },
    { label:'Mayúscula', ok: /[A-Z]/.test(pwd) },
    { label:'Número',    ok: /[0-9]/.test(pwd) },
  ];
  const score = checks.filter(c => c.ok).length;
  const color = score === 3 ? '#22c55e' : score === 2 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{marginTop:8}}>
      <div style={{display:'flex',gap:4,marginBottom:5}}>
        {[0,1,2].map(i => <div key={i} style={{flex:1,height:3,borderRadius:99,background:i<score?color:C.gray200,transition:'background .3s'}} />)}
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {checks.map(c => (
          <span key={c.label} style={{fontSize:10,fontWeight:700,color:c.ok?C.success:C.gray400,display:'flex',alignItems:'center',gap:2}}>
            <CheckCircle2 size={9} color={c.ok?'#22c55e':C.gray200}/>{c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{background:C.white,borderRadius:20,padding:'20px 18px',
      boxShadow:'0 2px 12px rgba(15,23,42,0.06)',
      border:`1px solid ${C.gray100}`, ...style}}>
      {children}
    </div>
  );
}

// ─── Section label ────────────────────────────────────────
function SLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:16}}>
      {icon}
      <span style={{fontSize:13,fontWeight:800,color:C.gray900,letterSpacing:'-0.01em'}}>{label}</span>
    </div>
  );
}

// ─── Field Input ──────────────────────────────────────────
function Field({
  label, value, onChange, disabled, icon, rightSlot, type='text', maxLength, placeholder, error,
}: {
  label:string; value:string; onChange?:(v:string)=>void;
  disabled?:boolean; icon?:React.ReactNode; rightSlot?:React.ReactNode;
  type?:string; maxLength?:number; placeholder?:string; error?:string;
}) {
  return (
    <div>
      <label style={{display:'block',fontSize:10,fontWeight:700,color:C.gray400,
        textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:5}}>
        {label}
      </label>
      <div style={{position:'relative',display:'flex',alignItems:'center'}}>
        {icon && (
          <span style={{position:'absolute',left:12,display:'flex',pointerEvents:'none'}}>
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={placeholder}
          style={{
            width:'100%',boxSizing:'border-box',
            padding:`12px ${rightSlot?'44px':'14px'} 12px ${icon?'38px':'14px'}`,
            border:`2px solid ${error ? '#fca5a5' : C.gray200}`,borderRadius:12,
            fontSize:14,fontWeight:600,color:disabled?C.gray400:C.gray900,
            background:disabled?C.gray50:C.white,
            outline:'none',fontFamily:'Inter,system-ui,sans-serif',
            transition:'border-color .15s',
            cursor:disabled?'not-allowed':'text',
          }}
          onFocus={e => { if(!disabled) e.target.style.borderColor = C.primary; }}
          onBlur={e => { e.target.style.borderColor = error ? '#fca5a5' : C.gray200; }}
        />
        {rightSlot && <span style={{position:'absolute',right:12}}>{rightSlot}</span>}
      </div>
      {error && <p style={{fontSize:11,color:C.error,fontWeight:600,marginTop:4}}>{error}</p>}
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────
function ProgressBar({ pct }: { pct: number }) {
  return (
    <div style={{width:'100%',height:4,background:C.gray100,borderRadius:99,overflow:'hidden',marginTop:8}}>
      <div style={{height:'100%',width:`${pct}%`,borderRadius:99,
        background:`linear-gradient(90deg,${C.primary},${C.accent})`,
        transition:'width .3s ease'}}/>
    </div>
  );
}

// ─── Password Modal ───────────────────────────────────────
function PasswordModal({ onClose }: { onClose: (msg?: string) => void }) {
  const [cur,    setCur]    = useState('');
  const [nw,     setNw]     = useState('');
  const [cfm,    setCfm]    = useState('');
  const [showC,  setShowC]  = useState(false);
  const [showN,  setShowN]  = useState(false);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  const valid = cur && nw && cfm && nw === cfm && nw.length >= 8
                && /[A-Z]/.test(nw) && /[0-9]/.test(nw) && nw !== cur;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSaving(true); setErr('');
    try {
      const res = await userService.updatePassword({ current_password:cur, password:nw, password_confirmation:cfm });
      localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      onClose('¡Contraseña actualizada correctamente!');
    } catch (e: any) {
      setErr(e?.message ?? 'Contraseña actual incorrecta.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position:'fixed',inset:0,zIndex:9000,
      background:'rgba(15,23,42,0.55)',backdropFilter:'blur(4px)',
      display:'flex',alignItems:'flex-end',
    }} onClick={() => onClose()}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:C.white,borderRadius:'24px 24px 0 0',
          padding:'8px 20px 36px',width:'100%',
          animation:'slideUp .3s ease',
        }}>
        {/* Handle */}
        <div style={{width:36,height:4,background:C.gray200,borderRadius:99,margin:'12px auto 20px'}}/>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h3 style={{fontSize:17,fontWeight:800,color:C.gray900,margin:0}}>Cambiar Contraseña</h3>
          <button onClick={() => onClose()} style={{background:'none',border:'none',cursor:'pointer',display:'flex',padding:4}}>
            <X size={20} color={C.gray400}/>
          </button>
        </div>

        {/* Warning */}
        <div style={{display:'flex',gap:8,padding:'10px 12px',background:C.warnLt,
          border:`1px solid #fcd34d`,borderRadius:12,marginBottom:18}}>
          <AlertTriangle size={15} color={C.warn} style={{flexShrink:0,marginTop:1}}/>
          <p style={{fontSize:12,color:C.warn,fontWeight:600,margin:0}}>
            Al guardar se revocará la sesión en otros dispositivos.
          </p>
        </div>

        <form onSubmit={handleSave} style={{display:'flex',flexDirection:'column',gap:14}}>
          {/* Contraseña actual */}
          <Field label="Contraseña actual" value={cur} onChange={setCur}
            type={showC?'text':'password'} placeholder="••••••••"
            icon={<Lock size={15} color={C.gray400}/>}
            rightSlot={
              <button type="button" onClick={()=>setShowC(!showC)}
                style={{background:'none',border:'none',cursor:'pointer',display:'flex',padding:0}}>
                {showC?<EyeOff size={16} color={C.gray400}/>:<Eye size={16} color={C.gray400}/>}
              </button>
            }
          />

          {/* Nueva contraseña */}
          <div>
            <Field label="Nueva contraseña" value={nw} onChange={setNw}
              type={showN?'text':'password'} placeholder="Mín. 8 chars, 1 mayúscula, 1 número"
              icon={<Lock size={15} color={C.gray400}/>}
              rightSlot={
                <button type="button" onClick={()=>setShowN(!showN)}
                  style={{background:'none',border:'none',cursor:'pointer',display:'flex',padding:0}}>
                  {showN?<EyeOff size={16} color={C.gray400}/>:<Eye size={16} color={C.gray400}/>}
                </button>
              }
            />
            <PasswordStrength pwd={nw}/>
          </div>

          {/* Confirmar */}
          <Field label="Confirmar nueva contraseña" value={cfm} onChange={setCfm}
            type="password" placeholder="Repite la contraseña"
            icon={<Lock size={15} color={C.gray400}/>}
            error={cfm && cfm !== nw ? '✗ Las contraseñas no coinciden' : ''}
          />
          {cfm && cfm === nw && nw.length >= 8 && (
            <p style={{fontSize:11,color:C.success,fontWeight:700,marginTop:-8}}>✓ Las contraseñas coinciden</p>
          )}

          {err && (
            <div style={{display:'flex',gap:7,padding:'10px 12px',background:C.errorLt,
              border:`1px solid #fca5a5`,borderRadius:10}}>
              <AlertCircle size={14} color='#ef4444' style={{flexShrink:0}}/>
              <p style={{fontSize:12,color:C.error,fontWeight:600,margin:0}}>{err}</p>
            </div>
          )}

          <div style={{display:'flex',gap:10,marginTop:4}}>
            <button type="button" onClick={()=>onClose()}
              style={{flex:1,padding:'13px',borderRadius:12,border:`2px solid ${C.gray200}`,
                background:C.white,color:C.gray600,fontWeight:700,fontSize:14,cursor:'pointer',
                fontFamily:'Inter,system-ui,sans-serif'}}>
              Cancelar
            </button>
            <button type="submit" disabled={!valid || saving}
              style={{flex:2,padding:'13px',borderRadius:12,border:'none',
                background: valid && !saving
                  ? `linear-gradient(135deg,${C.accent},${C.primary})`
                  : C.gray100,
                color: valid && !saving ? C.white : C.gray400,
                fontWeight:700,fontSize:14,cursor: valid && !saving ? 'pointer' : 'not-allowed',
                display:'flex',alignItems:'center',justifyContent:'center',gap:7,
                fontFamily:'Inter,system-ui,sans-serif'}}>
              {saving ? <Loader2 size={16}/> : <Shield size={15}/>}
              {saving ? 'Guardando…' : 'Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Bottom Navbar ────────────────────────────────────────
function BottomNav({ active }: { active: 'capture'|'home'|'records'|'students'|'profile' }) {
  const navigate = useNavigate();
  const items = [
    { id:'capture',  icon:Smartphone, label:'CAPTURAR',  path:'/manual-capture' },
    { id:'home',     icon:Home,       label:'INICIO',    path:'/dashboard' },
    { id:'records',  icon:ClipboardList, label:'REGISTROS', path:'/records' },
    { id:'students', icon:Users,      label:'GRUPOS',    path:'/students' },
  ] as const;

  return (
    <nav style={{
      position:'fixed',bottom:0,left:0,right:0,zIndex:800,
      background:C.white,borderTop:`1px solid ${C.gray100}`,
      display:'flex',alignItems:'stretch',
      boxShadow:'0 -4px 20px rgba(15,23,42,0.07)',
    }}>
      {items.map(item => {
        const isActive = active === item.id;
        const Icon = item.icon;
        return (
          <button key={item.id} onClick={() => navigate(item.path)}
            style={{
              flex:1,display:'flex',flexDirection:'column',alignItems:'center',
              justifyContent:'center',gap:3,padding:'10px 0 12px',
              background:'none',border:'none',cursor:'pointer',
              color:isActive?C.primary:C.gray400,
              borderTop:`2px solid ${isActive?C.primary:'transparent'}`,
              transition:'color .15s,border-color .15s',
            }}>
            <Icon size={20} strokeWidth={isActive?2.5:1.8}/>
            <span style={{fontSize:9,fontWeight:isActive?800:600,letterSpacing:'0.05em'}}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════
//  MAIN SCREEN
// ═══════════════════════════════════════════════════════════
export function TeacherProfileScreen() {
  const navigate = useNavigate();
  const stored   = authService.getStoredUser();

  // ── Profile state ──────────────────────────────────────
  const [name,          setName]          = useState(stored?.name ?? '');
  const [email]                           = useState(stored?.email ?? '');
  const [avatarUrl,     setAvatarUrl]     = useState<string|null>((stored as any)?.avatar ?? null);
  const [preview,       setPreview]       = useState<string|null>(null);
  const [avatarFile,    setAvatarFile]    = useState<File|null>(null);

  // ── UI state ───────────────────────────────────────────
  const [nameEditing,   setNameEditing]   = useState(false);
  const [originalName,  setOriginalName]  = useState(stored?.name ?? '');
  const [nameError,     setNameError]     = useState('');
  const [uploadPct,     setUploadPct]     = useState(0);
  const [showPwdModal,  setShowPwdModal]  = useState(false);

  const [savingName,    setSavingName]    = useState(false);
  const [savingAvatar,  setSavingAvatar]  = useState(false);

  const [toast, setToast] = useState<{msg:string;type:'success'|'error'|'warn'}|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // ── Load profile ───────────────────────────────────────
  useEffect(() => {
    authService.me().then(u => {
      const n = u?.name ?? '';
      setName(n); setOriginalName(n);
      setAvatarUrl((u as any)?.avatar ?? null);
    }).catch(() => {});
  }, []);

  const showToast = useCallback((msg: string, type: 'success'|'error'|'warn' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3800);
  }, []);

  // ── Name validation ────────────────────────────────────
  const validateName = (v: string) => {
    if (!v.trim()) return 'El nombre no puede estar vacío.';
    if (/\d/.test(v)) return 'El nombre no puede contener números.';
    if (v.trim().length < 3) return 'Mínimo 3 caracteres.';
    return '';
  };

  const handleNameChange = (v: string) => {
    if (v.length > 50) return;           // max 50 chars
    setName(v);
    setNameError(validateName(v));
  };

  const handleSaveName = async () => {
    const err = validateName(name);
    if (err) { setNameError(err); return; }
    setSavingName(true);
    try {
      await userService.updateProfile(name.trim());
      setOriginalName(name.trim());
      setNameEditing(false);
      showToast('Nombre actualizado correctamente.', 'success');
      await authService.me();
    } catch (e: any) {
      showToast(e?.message ?? 'Error al actualizar.', 'error');
    } finally {
      setSavingName(false);
    }
  };

  const handleCancelName = () => {
    setName(originalName); setNameError(''); setNameEditing(false);
  };

  // ── Avatar ─────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return showToast('La imagen supera los 2 MB.', 'error');
    if (!['image/jpeg','image/png','image/webp'].includes(file.type))
      return showToast('Solo JPG, PNG o WebP.', 'error');
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) return;
    setSavingAvatar(true); setUploadPct(10);
    // Simula progreso visual mientras hace el fetch
    const timer = setInterval(() => setUploadPct(p => Math.min(p + 15, 85)), 300);
    try {
      const res = await userService.updateAvatar(avatarFile);
      clearInterval(timer); setUploadPct(100);
      setTimeout(() => { setUploadPct(0); setAvatarUrl(res.avatar_url); setPreview(null); setAvatarFile(null); }, 400);
      showToast('¡Foto de perfil actualizada!', 'success');
    } catch (e: any) {
      clearInterval(timer); setUploadPct(0);
      showToast(e?.message ?? 'Error al subir la foto.', 'error');
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
      showToast('No se pudo eliminar la foto.', 'error');
    } finally {
      setSavingAvatar(false);
    }
  };

  // ── Derived ────────────────────────────────────────────
  const displayAvatar = preview ?? avatarUrl;
  const initials      = (name.trim().charAt(0) || '?').toUpperCase();
  const bg            = avatarColor(name || 'U');
  const nameChanged   = name !== originalName;

  return (
    <div style={{minHeight:'100vh',background:C.gray50,fontFamily:'Inter,system-ui,sans-serif',paddingBottom:80}}>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .spin { animation: spin 1s linear infinite; }
      `}</style>

      {/* ── HEADER ───────────────────────────────────────── */}
      <div style={{
        background:`linear-gradient(160deg,#0f172a 0%,#1e3a8a 100%)`,
        padding:'52px 20px 32px',position:'relative',
      }}>
        <button onClick={() => navigate(-1)} style={{
          position:'absolute',top:52,left:16,
          background:'rgba(255,255,255,0.1)',border:'none',borderRadius:12,
          padding:'8px 10px',cursor:'pointer',display:'flex',
          backdropFilter:'blur(8px)',
        }}>
          <ArrowLeft size={20} color="#fff"/>
        </button>
        <h1 style={{color:'#fff',fontSize:20,fontWeight:900,textAlign:'center',margin:0}}>Mi Perfil</h1>
        <p style={{color:'rgba(219,234,254,0.65)',fontSize:12,textAlign:'center',marginTop:3,marginBottom:0}}>
          Gestiona tu cuenta
        </p>
      </div>

      {/* ── AVATAR HERO ──────────────────────────────────── */}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginTop:-40,padding:'0 20px',marginBottom:20}}>
        {/* Avatar ring + click to upload */}
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            position:'relative',background:'none',border:'none',cursor:'pointer',padding:0,
            borderRadius:'50%',display:'block',
          }}
          title="Cambiar foto de perfil"
        >
          <div style={{
            width:96,height:96,borderRadius:'50%',
            background:displayAvatar?'transparent':bg,
            border:`4px solid ${C.white}`,boxShadow:'0 4px 24px rgba(15,23,42,0.18)',
            display:'flex',alignItems:'center',justifyContent:'center',
            overflow:'hidden',fontSize:34,fontWeight:900,color:'#fff',
          }}>
            {displayAvatar
              ? <img src={displayAvatar} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              : initials}
          </div>
          {/* Camera badge */}
          <div style={{
            position:'absolute',bottom:2,right:2,
            width:28,height:28,borderRadius:'50%',
            background:C.primary,border:`3px solid ${C.white}`,
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 2px 8px rgba(37,99,235,0.4)',
          }}>
            {savingAvatar
              ? <Loader2 size={12} color="#fff" className="spin"/>
              : <Camera size={12} color="#fff"/>}
          </div>
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
          style={{display:'none'}} onChange={handleFileChange}/>

        {/* Name + email below avatar */}
        <p style={{fontSize:17,fontWeight:800,color:C.gray900,marginTop:12,marginBottom:2}}>
          {originalName || 'Sin nombre'}
        </p>
        <p style={{fontSize:12,fontWeight:500,color:C.gray400,marginBottom:0}}>{email}</p>

        {/* Avatar action buttons — only when preview exists */}
        {preview && (
          <div style={{display:'flex',gap:10,marginTop:14}}>
            <button onClick={() => { setPreview(null); setAvatarFile(null); }}
              style={{padding:'9px 18px',borderRadius:10,border:`2px solid ${C.gray200}`,
                background:C.white,color:C.gray600,fontWeight:700,fontSize:13,cursor:'pointer',
                fontFamily:'inherit'}}>
              Cancelar
            </button>
            <button onClick={handleSaveAvatar} disabled={savingAvatar}
              style={{padding:'9px 20px',borderRadius:10,border:'none',
                background:`linear-gradient(135deg,${C.primary},${C.accent})`,
                color:C.white,fontWeight:700,fontSize:13,cursor:savingAvatar?'not-allowed':'pointer',
                display:'flex',alignItems:'center',gap:6,fontFamily:'inherit'}}>
              {savingAvatar?<Loader2 size={13} className="spin"/>:<Save size={13}/>}
              Guardar foto
            </button>
          </div>
        )}
        {/* Upload progress */}
        {uploadPct > 0 && <div style={{width:200,marginTop:8}}><ProgressBar pct={uploadPct}/></div>}

        {/* Delete avatar link */}
        {avatarUrl && !preview && (
          <button onClick={handleDeleteAvatar} disabled={savingAvatar}
            style={{marginTop:10,background:'none',border:'none',cursor:'pointer',
              color:C.error,fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:4,
              opacity:savingAvatar?.5:1}}>
            <Trash2 size={12}/> Eliminar foto
          </button>
        )}
      </div>

      {/* ── CARDS ────────────────────────────────────────── */}
      <div style={{padding:'0 16px',display:'flex',flexDirection:'column',gap:14}}>

        {/* Card 1 — Información personal */}
        <Card>
          <SLabel icon={<User size={15} color={C.primary}/>} label="Información Personal"/>

          {/* Name field */}
          <div style={{marginBottom:14}}>
            <label style={{display:'block',fontSize:10,fontWeight:700,color:C.gray400,
              textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:5}}>
              Nombre completo
            </label>
            <div style={{position:'relative',display:'flex',alignItems:'center'}}>
              <input
                ref={nameRef}
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                disabled={!nameEditing}
                maxLength={50}
                placeholder="Tu nombre completo"
                style={{
                  width:'100%',boxSizing:'border-box',
                  padding:'12px 44px 12px 14px',
                  border:`2px solid ${nameError ? '#fca5a5' : nameEditing ? C.primary : C.gray200}`,
                  borderRadius:12,fontSize:14,fontWeight:600,
                  color:nameEditing?C.gray900:C.gray600,
                  background:nameEditing?C.white:C.gray50,
                  outline:'none',fontFamily:'inherit',transition:'all .15s',
                }}
              />
              {/* Pencil icon — always visible to indicate editability */}
              <button
                onClick={() => {
                  setNameEditing(true);
                  setTimeout(() => nameRef.current?.focus(), 50);
                }}
                style={{
                  position:'absolute',right:12,background:'none',border:'none',
                  cursor:'pointer',display:'flex',padding:4,
                  color:nameEditing ? C.primary : C.gray400,
                }}
                title="Editar nombre"
              >
                <Pencil size={15}/>
              </button>
            </div>
            {nameError && <p style={{fontSize:11,color:C.error,fontWeight:600,marginTop:4}}>{nameError}</p>}
            <p style={{fontSize:10,color:C.gray400,fontWeight:500,marginTop:4}}>
              Máx. 50 caracteres · Sin números · {name.length}/50
            </p>
          </div>

          {/* Save / cancel — appear only on change */}
          {nameChanged && nameEditing && (
            <div style={{display:'flex',gap:8,marginBottom:14,animation:'slideUp .2s ease'}}>
              <button onClick={handleCancelName}
                style={{flex:1,padding:'11px',borderRadius:10,border:`2px solid ${C.gray200}`,
                  background:C.white,color:C.gray600,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>
                Descartar
              </button>
              <button onClick={handleSaveName} disabled={savingName || !!nameError}
                style={{flex:2,padding:'11px',borderRadius:10,border:'none',
                  background:(savingName || !!nameError)?C.gray100:`linear-gradient(135deg,${C.primary},${C.accent})`,
                  color:(savingName || !!nameError)?C.gray400:C.white,
                  fontWeight:700,fontSize:13,cursor:(savingName||!!nameError)?'not-allowed':'pointer',
                  display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontFamily:'inherit'}}>
                {savingName?<Loader2 size={14} className="spin"/>:<Save size={14}/>}
                {savingName?'Guardando…':'Guardar nombre'}
              </button>
            </div>
          )}

          {/* Email — clearly disabled */}
          <div>
            <label style={{display:'block',fontSize:10,fontWeight:700,color:C.gray400,
              textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:5}}>
              Correo electrónico
            </label>
            <div style={{position:'relative'}}>
              <Mail size={15} color={C.gray400} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)'}}/>
              <input value={email} disabled style={{
                width:'100%',boxSizing:'border-box',
                padding:'12px 14px 12px 36px',
                border:`2px solid ${C.gray100}`,borderRadius:12,
                fontSize:14,fontWeight:500,color:C.gray400,
                background:C.gray50,outline:'none',fontFamily:'inherit',cursor:'not-allowed',
              }}/>
            </div>
            <p style={{fontSize:10,color:C.gray400,fontWeight:500,marginTop:4}}>
              🔒 Para cambiar el correo contacta al administrador.
            </p>
          </div>
        </Card>

        {/* Card 2 — Contraseña */}
        <Card>
          <SLabel icon={<Shield size={15} color="#7c3aed"/>} label="Seguridad"/>
          <button
            onClick={() => setShowPwdModal(true)}
            style={{
              width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',
              padding:'14px 16px',border:`2px solid ${C.gray200}`,borderRadius:14,
              background:C.white,cursor:'pointer',transition:'all .15s',fontFamily:'inherit',
            }}
            onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#7c3aed'; (e.currentTarget as HTMLButtonElement).style.background = '#faf5ff'; }}
            onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.gray200; (e.currentTarget as HTMLButtonElement).style.background = C.white; }}
          >
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:'#ede9fe',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Lock size={16} color="#7c3aed"/>
              </div>
              <div style={{textAlign:'left'}}>
                <p style={{fontSize:14,fontWeight:700,color:C.gray900,margin:0}}>Cambiar contraseña</p>
                <p style={{fontSize:11,fontWeight:500,color:C.gray400,margin:0}}>Actualiza tu contraseña de acceso</p>
              </div>
            </div>
            <ChevronDown size={18} color={C.gray400}/>
          </button>
        </Card>

        {/* Info card */}
        <div style={{padding:'12px 14px',borderRadius:14,background:'#eff6ff',border:'1px solid #bfdbfe',
          display:'flex',gap:8,alignItems:'flex-start'}}>
          <AlertCircle size={14} color={C.primary} style={{flexShrink:0,marginTop:1}}/>
          <p style={{fontSize:11,color:'#1d4ed8',fontWeight:600,margin:0}}>
            Tu información personal es visible solo para ti y el administrador del sistema.
          </p>
        </div>
      </div>

      {/* ── Password Modal ───────────────────────────────── */}
      {showPwdModal && (
        <PasswordModal onClose={(msg) => {
          setShowPwdModal(false);
          if (msg) showToast(msg, 'success');
        }}/>
      )}

      {/* ── Toast ────────────────────────────────────────── */}
      {toast && <Toast msg={toast.msg} type={toast.type} onDismiss={() => setToast(null)}/>}

      {/* ── Bottom Navbar ─────────────────────────────────── */}
      <BottomNav active="home"/>
    </div>
  );
}
