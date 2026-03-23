import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';
import { googleAuthService } from '../../services/googleAuthService';
import tizaMascot from '../../assets/tiza_mascot.svg';

export function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@appmaestri.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      await authService.login({ email, password });
      navigate('/dashboard');
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
      {/* Decorative Side Panel for Large Screens */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-blue-500 rounded-full blur-[120px] opacity-20 mix-blend-screen"></div>
        <div className="absolute top-[60%] -left-[10%] w-[50%] h-[50%] bg-indigo-500 rounded-full blur-[100px] opacity-20 mix-blend-screen"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-16">
            <img src={tizaMascot} alt="Tiza" style={{width:38,height:38,objectFit:'contain',filter:'brightness(0) invert(1) opacity(.9)'}} />
            <span className="text-2xl font-black tracking-wide">Tiza &amp; Datos</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <h2 className="text-5xl font-black text-white leading-tight mb-6">
              Transformando la<br/>Gestión Escolar.
            </h2>
            <p className="text-blue-100/80 text-lg w-4/5 font-medium leading-relaxed">
              Descubre una plataforma diseñada específicamente para simplificar el día a día de los profesores y mejorar la educación.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-blue-200 text-sm font-medium">
          <span>© 2026 Tiza &amp; Datos</span>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></div>
          <span>Privacidad</span>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></div>
          <span>Términos</span>
        </div>
      </div>

      {/* Main Login Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 xl:p-24 relative">
        <div className="absolute top-0 right-0 w-full h-full bg-blue-50/50 -z-10 lg:hidden block"></div>
        
        <div className="w-full max-w-[440px]">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 text-blue-900 mb-12 justify-center">
            <img src={tizaMascot} alt="Tiza" style={{width:36,height:36,objectFit:'contain'}} />
            <span className="text-2xl font-black tracking-wide" style={{background:'linear-gradient(135deg,#0f172a,#2563eb)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Tiza &amp; Datos</span>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 text-center lg:text-left"
          >
            <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
              Bienvenido de nuevo
            </h1>
            <p className="text-slate-500 text-base font-medium">Ingresa a tu cuenta para continuar.</p>
          </motion.div>

          {/* Login Form */}
          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            onSubmit={handleLogin}
            className="flex flex-col gap-5"
          >
            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-3.5 shadow-sm"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-semibold">{error}</p>
              </motion.div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5 group">
              <label className="text-[13px] font-bold text-slate-500 uppercase tracking-widest pl-1">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-blue-600">
                  <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border-2 border-slate-200/80 rounded-2xl pl-12 pr-4 py-3.5 font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 group">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Contraseña</label>
                <button type="button" className="text-[13px] font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">¿Olvidaste tu contraseña?</button>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border-2 border-slate-200/80 rounded-2xl pl-12 pr-4 py-3.5 font-black text-slate-900 tracking-[0.2em] focus:bg-white focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 transition-all outline-none placeholder:tracking-normal placeholder:font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1 pb-3 cursor-pointer group w-fit" onClick={() => setRememberMe(!rememberMe)}>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 border-2 ${rememberMe ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-slate-300 group-hover:border-blue-400'}`}>
                <Check className={`w-3.5 h-3.5 text-white transition-opacity ${rememberMe ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
              </div>
              <span className="text-[14px] font-semibold text-slate-600 select-none group-hover:text-slate-900 transition-colors">Mantener sesión iniciada</span>
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading || !email || !password}
              type="submit"
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 group ${
                (!isLoading && email && password) 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_24px_-6px_rgba(37,99,235,0.5)]' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Ingresar</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
            
            <div className="relative flex items-center py-4">
               <div className="flex-grow border-t border-slate-200"></div>
               <span className="flex-shrink-0 mx-4 text-slate-400 text-[11px] font-bold uppercase tracking-widest">O continuar con</span>
               <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              type="button"
              disabled={isGoogleLoading || isLoading}
              onClick={async () => {
                setIsGoogleLoading(true);
                setError(null);
                try {
                  await googleAuthService.signIn();
                  navigate('/dashboard');
                } catch (err: any) {
                  setError(err.message ?? 'No se pudo iniciar sesión con Google.');
                } finally {
                  setIsGoogleLoading(false);
                }
              }}
              className="w-full bg-white border-2 border-slate-200/80 hover:border-blue-100 text-slate-700 font-bold text-[15px] py-3.5 rounded-2xl shadow-sm transition-all hover:bg-slate-50 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/50 transition-colors"></div>
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin z-10" />
              ) : (
                <div className="flex items-center gap-3 z-10">
                  <GoogleIcon />
                  <span className="tracking-wide">Google</span>
                </div>
              )}
            </motion.button>

          </motion.form>
          
          <div className="mt-10 text-center">
            <p className="text-[15px] font-semibold text-slate-500">
              ¿No tienes cuenta? <Link to="/register" className="text-blue-600 hover:text-blue-800 transition-colors underline decoration-2 underline-offset-4 decoration-blue-200 hover:decoration-blue-600">Regístrate aquí</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
