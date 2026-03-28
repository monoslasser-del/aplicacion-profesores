import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Crown, Star, ArrowRight, ShieldCheck, Zap, ChevronLeft } from 'lucide-react';
import { stripeService, planService, PlanData } from '../../services/stripeService';
import { useNavigate } from 'react-router';

export function PricingScreen() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await planService.getPlans();
        setPlans(data);
      } catch (err) {
        console.error('Failed to load plans', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleCheckout = async (priceId: string, planName: string) => {
    setLoadingPlan(planName);
    try {
      // Si el plan es Premium y tiene Price_ID
      if (priceId) {
        const checkoutUrl = await stripeService.createCheckoutSession(priceId, planName);
        window.location.href = checkoutUrl; // Redirige oficialmente a Stripe
      } else {
        // Plan Básico / Gratuito directo al dashboard
        window.location.href = '/dashboard';
      }
    } catch (e) {
      alert("Hubo un error contactando a Stripe. Revisa tu consola o tu API.");
      setLoadingPlan(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando planes...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

      {/* Botón de regreso */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center active:scale-90 transition-transform z-10"
      >
        <ChevronLeft className="w-5 h-5 text-slate-600" />
      </button>
      <div className="max-w-4xl w-full z-10">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
             <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
               <ShieldCheck size={16} /> Registro Exitoso
             </span>
             <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Elige el plan ideal para tu salón</h1>
             <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
               Ahorra decenas de horas a la semana con herramientas automatizadas de la Nueva Escuela Mexicana (NEM).
             </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div 
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className={`p-8 rounded-[2rem] border-2 shadow-xl ${plan.is_recommended ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-200'} relative`}
            >
              {plan.is_recommended && (
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide flex items-center gap-1 shadow-md">
                    <Zap size={14} /> Recomendado
                 </div>
              )}
              
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-2xl ${plan.is_recommended ? 'bg-amber-100' : 'bg-blue-100'}`}>
                  {plan.is_recommended ? <Crown className="w-6 h-6 text-amber-500" /> : <Star className="w-6 h-6 text-blue-500" />}
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
              </div>
              
              <div className="mb-8">
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-black text-slate-900 tracking-tighter">{plan.price == 0 ? 'Gratis' : `$${plan.price}`}</span>
                  <span className="text-slate-500 font-semibold mb-2">{plan.duration}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {(plan.features || []).map((feature, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <div className="mt-1">
                       <Check size={18} className={plan.is_recommended ? 'text-blue-600' : 'text-slate-400'} />
                    </div>
                    <span className="text-slate-600 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleCheckout(plan.stripe_price_id || '', plan.name)}
                disabled={loadingPlan === plan.name}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  plan.is_recommended 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50' 
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200'
                }`}
              >
                {loadingPlan === plan.name ? (
                  <div className={`w-5 h-5 border-[3px] rounded-full animate-spin ${plan.is_recommended ? 'border-blue-300 border-t-white' : 'border-slate-300 border-t-slate-600'}`}></div>
                ) : (
                  <>
                    {plan.stripe_price_id ? 'Actualizar Nivel' : 'Continuar Gratis'}
                    {!plan.is_recommended && <ArrowRight size={18} />}
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
           <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
             <Lock size={14} /> Pagos seguros y cifrados a través de plataforma Stripe
           </p>
        </div>
      </div>
    </div>
  );
}

const Lock = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
