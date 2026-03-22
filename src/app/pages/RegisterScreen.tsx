import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, User, MapPin, AlertCircle, ArrowRight, BookOpen, GraduationCap, ChevronDown } from 'lucide-react';
import { authService } from '../../services/authService';
import { googleAuthService } from '../../services/googleAuthService';
import {
  EDUCATIONAL_LEVELS, GRADES_BY_LEVEL, GROUPS,
  type EducationalLevel, type GroupLetter
} from '../../constants/education';

// ── Shared select style ───────────────────────────────────────────────────────
const selectCls = "w-full bg-slate-50/50 hover:bg-slate-50 border-2 border-slate-200/80 rounded-xl pl-10 pr-8 py-3 font-semibold text-[15px] text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 transition-all outline-none appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

function SelectField({
  label, icon: Icon, value, onChange, disabled = false, children
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 group">
      <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pl-1">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <Icon className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        </div>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          required
          className={selectCls}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function RegisterScreen() {
  const navigate = useNavigate();

  // Datos personales
  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [estado,          setEstado]          = useState('');
  const [municipio,       setMunicipio]       = useState('');

  // Perfil educativo NEM
  const [level, setLevel] = useState<EducationalLevel | ''>('');
  const [grade, setGrade] = useState<string>('');
  const [group, setGroup] = useState<GroupLetter | ''>('');

  const [isLoading,       setIsLoading]       = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error,           setError]           = useState<string | null>(null);

  // Grados disponibles según el nivel elegido
  const availableGrades = level ? GRADES_BY_LEVEL[level as EducationalLevel] : [];

  // Resetear grado y grupo cuando cambia el nivel
  const handleLevelChange = (v: string) => {
    setLevel(v as EducationalLevel);
    setGrade('');
    setGroup('');
  };

  const isFormValid = !!(
    name && email && password && password === confirmPassword &&
    estado && municipio && level && grade && group
  );

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsLoading(true);
    setError(null);
    try {
      await authService.register({
        name,
        email,
        password,
        password_confirmation: confirmPassword,
        estado,
        municipio,
        level:          level as EducationalLevel,
        grade:          Number(grade),
        group:          group as GroupLetter,
        // legacy: construir grado_asignado para compatibilidad con el servidor antiguo
        grado_asignado: `${grade}° ${level}`,
        nivel_educativo: level as EducationalLevel,
      });
      navigate('/planes');
    } catch (err: any) {
      setError(err.message ?? 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  return (
    <div className="flex min-h-screen bg-white">
      {/* Decorative Side Panel */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 p-12 flex-col justify-between relative overflow-hidden order-last">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute top-[20%] -left-[20%] w-[80%] h-[80%] bg-blue-500 rounded-full blur-[140px] opacity-20 mix-blend-screen" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-500 rounded-full blur-[100px] opacity-20 mix-blend-screen" />

        <div className="relative z-10 flex justify-end w-full">
          <div className="flex items-center gap-3 text-white">
            <span className="text-2xl font-black tracking-wide">EduPro</span>
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md border border-white/10">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <h2 className="text-5xl font-black text-white leading-tight mb-6 text-right">
              Únete a la<br/>comunidad.
            </h2>
            <p className="text-blue-100/80 text-lg ml-auto w-5/6 font-medium leading-relaxed text-right">
              Estás a un paso de organizar y potenciar tu rendimiento académico, con herramientas listas para el aula.
            </p>

            {/* NEM Badge */}
            <div className="mt-8 ml-auto inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3">
              <GraduationCap className="w-6 h-6 text-emerald-400" />
              <div className="text-right">
                <p className="text-white font-bold text-sm">Nueva Escuela Mexicana</p>
                <p className="text-blue-200/70 text-xs">Contenido filtrado por tu grado</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Register Area */}
      <div className="w-full lg:w-[55%] flex justify-center p-6 sm:p-10 xl:p-16 relative overflow-y-auto max-h-screen no-scrollbar">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-50/50 -z-10 lg:hidden block" />

        <div className="w-full max-w-[500px] my-auto">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 text-blue-900 mb-10 justify-center">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/20">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black tracking-wide">EduPro</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8 text-center lg:text-left pt-4 lg:pt-0">
            <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Crear cuenta</h1>
            <p className="text-slate-500 text-base font-medium">Completa tus datos y comienza gratis.</p>
          </motion.div>

          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }} onSubmit={handleRegister} className="flex flex-col gap-4">
            
            {/* Error Banner */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-3.5 shadow-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-semibold leading-snug">{error}</p>
              </motion.div>
            )}

            {/* Nombre */}
            <div className="space-y-1.5 group">
              <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pl-1">Nombre Completo</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2"><User className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" /></div>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Ej. María López"
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border-2 border-slate-200/80 rounded-xl pl-12 pr-4 py-3 font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 transition-all outline-none" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5 group">
              <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pl-1">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2"><Mail className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" /></div>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="ejemplo@correo.com"
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border-2 border-slate-200/80 rounded-xl pl-12 pr-4 py-3 font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 transition-all outline-none" />
              </div>
            </div>

            {/* Estado & Municipio */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 group">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pl-1">Estado</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2"><MapPin className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" /></div>
                  <input type="text" required value={estado} onChange={e => setEstado(e.target.value)} placeholder="Ej. Jalisco"
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border-2 border-slate-200/80 rounded-xl pl-10 pr-3 py-3 font-semibold text-[15px] text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 transition-all outline-none" />
                </div>
              </div>
              <div className="space-y-1.5 group">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pl-1">Municipio</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2"><MapPin className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" /></div>
                  <input type="text" required value={municipio} onChange={e => setMunicipio(e.target.value)} placeholder="Ej. Zapopan"
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border-2 border-slate-200/80 rounded-xl pl-10 pr-3 py-3 font-semibold text-[15px] text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 transition-all outline-none" />
                </div>
              </div>
            </div>

            {/* ── Perfil Educativo NEM ── */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Perfil Educativo
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Nivel */}
              <SelectField label="Nivel Educativo" icon={GraduationCap} value={level} onChange={handleLevelChange}>
                <option value="" disabled>Selecciona un nivel…</option>
                {EDUCATIONAL_LEVELS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </SelectField>

              {/* Grado + Grupo */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <SelectField label="Grado" icon={GraduationCap} value={grade} onChange={setGrade} disabled={!level}>
                  <option value="" disabled>Grado…</option>
                  {availableGrades.map(g => (
                    <option key={g} value={String(g)}>{g}° Grado</option>
                  ))}
                </SelectField>

                <SelectField label="Grupo" icon={GraduationCap} value={group} onChange={v => setGroup(v as GroupLetter)} disabled={!grade}>
                  <option value="" disabled>Grupo…</option>
                  {GROUPS.map(g => (
                    <option key={g} value={g}>Grupo {g}</option>
                  ))}
                </SelectField>
              </div>

              {/* Chip visual del perfil seleccionado */}
              {level && grade && group && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 mt-1">
                  <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-sm font-bold text-blue-700">
                    {level} · {grade}° · Grupo {group}
                  </span>
                  <span className="ml-auto text-[10px] text-blue-400 font-semibold">Tu contenido se filtrará aquí</span>
                </motion.div>
              )}
            </div>

            {/* Contraseñas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
              <div className="space-y-1.5 group">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pl-1">Contraseña</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2"><Lock className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" /></div>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border-2 border-slate-200/80 rounded-xl pl-11 pr-4 py-3 font-black text-slate-900 tracking-[0.2em] focus:bg-white focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 transition-all outline-none placeholder:tracking-normal placeholder:font-semibold" />
                </div>
              </div>
              <div className="space-y-1.5 group">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pl-1 overflow-hidden text-ellipsis whitespace-nowrap">Repetir Contraseña</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className={`w-4 h-4 transition-colors ${confirmPassword && password !== confirmPassword ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-600'}`} />
                  </div>
                  <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••"
                    className={`w-full bg-slate-50/50 hover:bg-slate-50 border-2 rounded-xl pl-11 pr-4 py-3 font-black tracking-[0.2em] transition-all outline-none placeholder:tracking-normal placeholder:font-semibold ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-[4px] focus:ring-red-500/10 bg-red-50/30'
                        : 'border-slate-200/80 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10'
                    }`} />
                </div>
              </div>
            </div>

            {/* Submit */}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              disabled={isLoading || !isFormValid || password !== confirmPassword}
              type="submit"
              className={`w-full py-4 mt-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 group ${
                (!isLoading && isFormValid && password === confirmPassword)
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}>
              {isLoading
                ? <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Crear Cuenta</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              }
            </motion.button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink-0 mx-4 text-slate-400 text-[11px] font-bold uppercase tracking-widest">O continúa con</span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            {/* Google */}
            <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }} type="button"
              disabled={isGoogleLoading || isLoading}
              onClick={async () => {
                setIsGoogleLoading(true); setError(null);
                try { await googleAuthService.signIn(); navigate('/dashboard'); }
                catch (err: any) { setError(err.message ?? 'No se pudo registrarse con Google.'); }
                finally { setIsGoogleLoading(false); }
              }}
              className="w-full bg-white border-2 border-slate-200/80 hover:border-blue-100 text-slate-700 font-bold text-[15px] py-3.5 rounded-2xl shadow-sm transition-all hover:bg-slate-50 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/50 transition-colors" />
              {isGoogleLoading
                ? <div className="w-5 h-5 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin z-10" />
                : <div className="flex items-center gap-3 z-10"><GoogleIcon /><span className="tracking-wide">Registrarse con Google</span></div>
              }
            </motion.button>
          </motion.form>

          <div className="mt-8 text-center pb-8 lg:pb-0">
            <p className="text-[15px] font-semibold text-slate-500">
              ¿Ya tienes cuenta? <Link to="/login" className="text-blue-600 hover:text-blue-800 transition-colors underline decoration-2 underline-offset-4 decoration-blue-200 hover:decoration-blue-600">Inicia sesión</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
