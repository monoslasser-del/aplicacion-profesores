import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, User, GraduationCap, BookOpen, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';
import { googleAuthService } from '../../services/googleAuthService';

const MEXICO_DATA: Record<string, string[]> = {
  "Aguascalientes": ["Aguascalientes", "Jesús María", "Calvillo", "Otro..."],
  "Baja California": ["Tijuana", "Mexicali", "Ensenada", "Otro..."],
  "Baja California Sur": ["La Paz", "Los Cabos", "Otro..."],
  "Campeche": ["Campeche", "Ciudad del Carmen", "Otro..."],
  "Chiapas": ["Tuxtla Gutiérrez", "Tapachula", "San Cristóbal", "Otro..."],
  "Chihuahua": ["Chihuahua", "Ciudad Juárez", "Cuauhtémoc", "Otro..."],
  "Ciudad de México": ["Álvaro Obregón", "Cuauhtémoc", "Iztapalapa", "Miguel Hidalgo", "Tlalpan", "Otro..."],
  "Coahuila": ["Saltillo", "Torreón", "Monclova", "Otro..."],
  "Colima": ["Colima", "Manzanillo", "Otro..."],
  "Durango": ["Durango", "Gómez Palacio", "Otro..."],
  "Estado de México": ["Toluca", "Ecatepec", "Naucalpan", "Tlalnepantla", "Otro..."],
  "Guanajuato": ["León", "Irapuato", "Celaya", "Guanajuato", "Otro..."],
  "Guerrero": ["Acapulco", "Chilpancingo", "Iguala", "Otro..."],
  "Hidalgo": ["Pachuca", "Tulancingo", "Tizayuca", "Otro..."],
  "Jalisco": ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá", "Tlajomulco", "Otro..."],
  "Michoacán": ["Morelia", "Uruapan", "Zamora", "Otro..."],
  "Morelos": ["Cuernavaca", "Jiutepec", "Cuautla", "Otro..."],
  "Nayarit": ["Tepic", "Bahía de Banderas", "Otro..."],
  "Nuevo León": ["Monterrey", "San Pedro", "Apodaca", "Guadalupe", "Otro..."],
  "Oaxaca": ["Oaxaca de Juárez", "Tuxtepec", "Salina Cruz", "Otro..."],
  "Puebla": ["Puebla", "Tehuacán", "Cholula", "Otro..."],
  "Querétaro": ["Querétaro", "San Juan del Río", "Corregidora", "Otro..."],
  "Quintana Roo": ["Cancún", "Playa del Carmen", "Chetumal", "Otro..."],
  "San Luis Potosí": ["San Luis Potosí", "Ciudad Valles", "Otro..."],
  "Sinaloa": ["Culiacán", "Mazatlán", "Ahome", "Otro..."],
  "Sonora": ["Hermosillo", "Cajeme", "Nogales", "Otro..."],
  "Tabasco": ["Villahermosa", "Cárdenas", "Comalcalco", "Otro..."],
  "Tamaulipas": ["Reynosa", "Matamoros", "Nuevo Laredo", "Tampico", "Otro..."],
  "Tlaxcala": ["Tlaxcala", "Apizaco", "Huamantla", "Otro..."],
  "Veracruz": ["Veracruz", "Xalapa", "Coatzacoalcos", "Córdoba", "Otro..."],
  "Yucatán": ["Mérida", "Kanasín", "Valladolid", "Otro..."],
  "Zacatecas": ["Zacatecas", "Fresnillo", "Guadalupe", "Otro..."]
};

export function RegisterScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Location
  const [estado, setEstado] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [customMunicipio, setCustomMunicipio] = useState('');

  // Education Level
  const [nivel, setNivel] = useState('');
  const [grado, setGrado] = useState('');
  const [grupo, setGrupo] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalMunicipio = municipio === 'Otro...' ? customMunicipio : municipio;
    const isValid = !!(name && email && estado && finalMunicipio && nivel && grado && grupo && password);
    if (!isValid || password !== confirmPassword) return;
    
    setIsLoading(true);
    try {
      await authService.register({
        name,
        email,
        grade: `${grado} ${grupo} ${nivel}`, // Send formatted string to backend as grade
        password
      });

      navigate('/dashboard');
    } catch (error) {
      alert("Error al intentar registrar la cuenta");
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

  const isFormValid = !!(name && email && estado && (municipio === 'Otro...' ? customMunicipio : municipio) && nivel && grado && grupo && password);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Decorative Side Panel for Large Screens */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 p-12 flex-col justify-between relative overflow-hidden order-last">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-[20%] -left-[20%] w-[80%] h-[80%] bg-blue-500 rounded-full blur-[140px] opacity-20 mix-blend-screen"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-500 rounded-full blur-[100px] opacity-20 mix-blend-screen"></div>
        
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
          </motion.div>
        </div>
      </div>

      {/* Register Form */}
      <div className="flex-1 px-6 pt-6 pb-8 flex flex-col z-0">

        
        <div className="w-full max-w-[500px] my-auto">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 text-blue-900 mb-10 justify-center">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/20">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black tracking-wide">EduPro</span>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center lg:text-left pt-4 lg:pt-0"
          >
            <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
              Crear cuenta
            </h1>
            <p className="text-slate-500 text-base font-medium">Completa tus datos y comienza gratis.</p>
          </motion.div>

          {/* Registration Form */}
          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            onSubmit={handleRegister}
            className="flex flex-col gap-4"
          >
            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-3.5 shadow-sm"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-semibold leading-snug">{error}</p>
              </motion.div>
            )}

            {/* Name Field */}
            <div className="space-y-1.5 group">
              <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pl-1">Nombre Completo</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <User className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Ej. María López"
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border-2 border-slate-200/80 rounded-xl pl-12 pr-4 py-3 font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 transition-all outline-none"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5 group">
              <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pl-1">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border-2 border-slate-200/80 rounded-xl pl-12 pr-4 py-3 font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 transition-all outline-none"
                />
              </div>
            </div>

            {/* Estado & Municipio Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 group">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pl-1">Estado</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                    <MapPin className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <select 
                    required 
                    value={estado} 
                    onChange={e => { setEstado(e.target.value); setMunicipio(''); }} 
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border-2 border-slate-200/80 rounded-xl pl-10 pr-3 py-3 font-semibold text-[15px] text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Selecciona estado...</option>
                    {Object.keys(MEXICO_DATA).map(est => (
                       <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pl-1">Municipio</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                    <MapPin className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <select 
                    required 
                    disabled={!estado}
                    value={municipio} 
                    onChange={e => setMunicipio(e.target.value)} 
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border-2 border-slate-200/80 rounded-xl pl-10 pr-3 py-3 font-semibold text-[15px] text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 transition-all outline-none appearance-none disabled:opacity-50 cursor-pointer"
                  >
                    <option value="" disabled>Selecciona municipio...</option>
                    {estado && MEXICO_DATA[estado]?.map(mun => (
                       <option key={mun} value={mun}>{mun}</option>
                    ))}
                  </select>
                </div>
                {municipio === 'Otro...' && (
                  <input
                     type="text"
                     value={customMunicipio}
                     onChange={(e) => setCustomMunicipio(e.target.value)}
                     placeholder="Escribe tu municipio..."
                     className="w-full mt-2 bg-slate-50/50 hover:bg-slate-50 border-2 border-slate-200/80 rounded-xl px-3 py-2 font-semibold text-[14px] text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 transition-all outline-none"
                  />
                )}
              </div>
            </div>

            {/* Nivel & Grado Row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5 group">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pl-1">Nivel</label>
                <select 
                  required 
                  value={nivel} 
                  onChange={e => { setNivel(e.target.value); setGrado(''); }} 
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border-2 border-slate-200/80 rounded-xl px-3 py-3 font-semibold text-[14px] text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="" disabled>Nivel...</option>
                  <option value="Preescolar">Preescolar</option>
                  <option value="Primaria">Primaria</option>
                  <option value="Secundaria">Secundaria</option>
                </select>
              </div>

              <div className="space-y-1.5 group">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pl-1">Grado</label>
                <select 
                  required 
                  disabled={!nivel}
                  value={grado} 
                  onChange={e => setGrado(e.target.value)} 
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border-2 border-slate-200/80 rounded-xl px-3 py-3 font-semibold text-[14px] text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 transition-all outline-none appearance-none disabled:opacity-50 cursor-pointer"
                >
                  <option value="" disabled>Grado...</option>
                  {nivel === 'Preescolar' && ['1º', '2º', '3º'].map(g => <option key={g} value={g}>{g}</option>)}
                  {nivel === 'Primaria' && ['1º', '2º', '3º', '4º', '5º', '6º'].map(g => <option key={g} value={g}>{g}</option>)}
                  {nivel === 'Secundaria' && ['1º', '2º', '3º'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="space-y-1.5 group">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pl-1">Grupo</label>
                <select 
                  required 
                  value={grupo} 
                  onChange={e => setGrupo(e.target.value)} 
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border-2 border-slate-200/80 rounded-xl px-3 py-3 font-semibold text-[14px] text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="" disabled>Grupo...</option>
                  {['A', 'B', 'C', 'D', 'E', 'F'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
              <div className="space-y-1.5 group">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pl-1">Contraseña</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input 
                    type="password" 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="••••••••"
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border-2 border-slate-200/80 rounded-xl pl-11 pr-4 py-3 font-black text-slate-900 tracking-[0.2em] focus:bg-white focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 transition-all outline-none placeholder:tracking-normal placeholder:font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pl-1 overflow-hidden text-ellipsis whitespace-nowrap">Repetir Contraseña</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className={`w-4 h-4 transition-colors ${confirmPassword && password !== confirmPassword ? 'text-red-400 group-focus-within:text-red-500' : 'text-slate-400 group-focus-within:text-blue-600'}`} />
                  </div>
                  <input 
                    type="password" 
                    required 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    placeholder="••••••••"
                    className={`w-full bg-slate-50/50 hover:bg-slate-50 border-2 rounded-xl pl-11 pr-4 py-3 font-black tracking-[0.2em] transition-all outline-none placeholder:tracking-normal placeholder:font-semibold ${
                      confirmPassword && password !== confirmPassword 
                        ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-[4px] focus:ring-red-500/10 bg-red-50/30' 
                        : 'border-slate-200/80 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading || !isFormValid || password !== confirmPassword}
              type="submit"
              className={`w-full py-4 mt-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 group ${
                (!isLoading && isFormValid && password === confirmPassword) 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_24px_-6px_rgba(37,99,235,0.5)]' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Crear Cuenta</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
            
            <div className="relative flex items-center py-2">
               <div className="flex-grow border-t border-slate-200"></div>
               <span className="flex-shrink-0 mx-4 text-slate-400 text-[11px] font-bold uppercase tracking-widest">O continúa con</span>
               <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Google Button */}
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
                  setError(err.message ?? 'No se pudo registrarse con Google.');
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
                  <span className="tracking-wide">Registrarse con Google</span>
                </div>
              )}
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
