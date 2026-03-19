import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, Check } from 'lucide-react';

export function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 absolute inset-0 overflow-y-auto no-scrollbar">
      
      {/* Header Area */}
      <div className="pt-12 px-8 pb-6 bg-white shrink-0 relative rounded-b-[2.5rem] shadow-sm z-10 border-b border-slate-100">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2">
            Bienvenido<br/>de nuevo 👋
          </h1>
          <p className="text-slate-500 font-medium text-sm">Ingresa tus datos para acceder a tu panel.</p>
        </motion.div>
      </div>

      {/* Login Form */}
      <div className="flex-1 px-6 pt-8 pb-8 flex flex-col z-0">
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleLogin}
          className="flex flex-col gap-5 flex-1"
        >
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Mail className="w-5 h-5 text-slate-400" />
              </div>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="correo@ejemplo.com"
                className="w-full bg-white border-2 border-slate-200/60 rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between pl-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contraseña</label>
              <button type="button" className="text-xs font-bold text-blue-600 hover:underline">¿Olvidaste tu contraseña?</button>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock className="w-5 h-5 text-slate-400" />
              </div>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••"
                className="w-full bg-white border-2 border-slate-200/60 rounded-2xl pl-12 pr-4 py-4 font-black text-slate-900 tracking-widest focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm placeholder:tracking-normal placeholder:font-medium"
              />
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-2 pt-1 pb-2" onClick={() => setRememberMe(!rememberMe)}>
            <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer ${rememberMe ? 'bg-blue-600' : 'bg-slate-200'}`}>
              {rememberMe && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </div>
            <span className="text-sm font-medium text-slate-600 select-none cursor-pointer">Mantener sesión iniciada</span>
          </div>

          {/* Submit Button */}
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading || !email || !password}
            type="submit"
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center mt-2 ${
              (!isLoading && email && password) ? 'bg-blue-600 text-white shadow-blue-600/30' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : <span>Ingresar</span>}
          </motion.button>
          
          <div className="relative flex items-center py-2">
             <div className="flex-grow border-t border-slate-200"></div>
             <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">o</span>
             <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Google Button */}
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className="w-full bg-white border-2 border-slate-200 text-slate-700 font-bold text-base py-3.5 rounded-2xl shadow-sm transition-all hover:bg-slate-50 flex items-center justify-center gap-3"
          >
            <GoogleIcon />
            <span>Continuar con Google</span>
          </motion.button>

        </motion.form>
        
        {/* Footer Link */}
        <div className="mt-auto pt-6 text-center">
          <p className="text-sm font-medium text-slate-600">
            ¿No tienes cuenta? <Link to="/register" className="text-blue-600 font-bold hover:underline">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
