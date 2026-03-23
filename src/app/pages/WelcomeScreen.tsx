import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import tizaMascot from '../../assets/tiza_mascot.svg';

// ─── Feature pills ────────────────────────────────────────
const FEATURES = [
  { emoji: '📋', text: 'Asistencia NFC' },
  { emoji: '📝', text: 'Fichas Descriptivas' },
  { emoji: '📅', text: 'Calendario Escolar' },
  { emoji: '📊', text: 'Reportes NEM' },
];

export function WelcomeScreen() {
  const navigate = useNavigate();
  const [pillIdx, setPillIdx] = useState(0);

  // Cycle through feature pills every 2.2 s
  useEffect(() => {
    const t = setInterval(() => setPillIdx(i => (i + 1) % FEATURES.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      display:'flex',flexDirection:'column',
      minHeight:'100dvh',
      background:'#f8fafc',
      overflow:'hidden',
      position:'relative',
      fontFamily:'Inter, system-ui, sans-serif',
    }}>

      {/* ── BLOB BACKGROUNDS ─────────────────────────────── */}
      <div style={{
        position:'absolute',top:'-80px',left:'-80px',
        width:320,height:320,borderRadius:'50%',
        background:'radial-gradient(circle,rgba(37,99,235,0.18),transparent 70%)',
        pointerEvents:'none',
      }}/>
      <div style={{
        position:'absolute',top:'20%',right:'-60px',
        width:240,height:240,borderRadius:'50%',
        background:'radial-gradient(circle,rgba(79,70,229,0.12),transparent 70%)',
        pointerEvents:'none',
      }}/>
      <div style={{
        position:'absolute',bottom:'25%',left:'-40px',
        width:200,height:200,borderRadius:'50%',
        background:'radial-gradient(circle,rgba(16,185,129,0.10),transparent 70%)',
        pointerEvents:'none',
      }}/>

      {/* ── HEADER SECTION ───────────────────────────────── */}
      <div style={{
        flex:'0 0 auto',
        paddingTop:'env(safe-area-inset-top, 48px)',
        paddingTop:48,
        display:'flex',flexDirection:'column',alignItems:'center',
        padding:'52px 28px 0',
      }}>
        {/* Brand chip */}
        <motion.div
          initial={{opacity:0,y:-12}}
          animate={{opacity:1,y:0}}
          transition={{delay:.1}}
          style={{
            display:'inline-flex',alignItems:'center',gap:6,
            padding:'5px 14px',borderRadius:99,
            background:'rgba(37,99,235,0.08)',
            border:'1px solid rgba(37,99,235,0.2)',
            marginBottom:24,
          }}>
          <span style={{width:7,height:7,borderRadius:'50%',background:'#2563eb',display:'inline-block'}}/>
          <span style={{fontSize:11,fontWeight:800,color:'#2563eb',letterSpacing:'0.06em',textTransform:'uppercase'}}>
            Plataforma Educativa
          </span>
        </motion.div>
      </div>

      {/* ── CENTER: MASCOT + BRAND NAME ──────────────────── */}
      <div style={{
        flex:1,display:'flex',flexDirection:'column',
        alignItems:'center',justifyContent:'center',
        padding:'0 28px',
      }}>

        {/* Mascot */}
        <motion.div
          initial={{scale:.7,opacity:0,y:20}}
          animate={{scale:1,opacity:1,y:0}}
          transition={{type:'spring',stiffness:180,damping:18,delay:.15}}
          style={{marginBottom:24,position:'relative'}}
        >
          {/* Glow ring */}
          <div style={{
            position:'absolute',inset:'-12px',borderRadius:'50%',
            background:'radial-gradient(circle,rgba(37,99,235,0.12),transparent 70%)',
            animation:'pulse 3s ease-in-out infinite',
          }}/>
          <img
            src={tizaMascot}
            alt="Tiza mascot"
            style={{width:140,height:140,objectFit:'contain',position:'relative',zIndex:1}}
          />
        </motion.div>

        {/* Brand name */}
        <motion.div
          initial={{opacity:0,y:16}}
          animate={{opacity:1,y:0}}
          transition={{delay:.28}}
          style={{textAlign:'center',marginBottom:10}}
        >
          <h1 style={{
            fontSize:36,fontWeight:900,lineHeight:1.1,
            margin:0,letterSpacing:'-0.03em',
            background:'linear-gradient(135deg,#0f172a 0%,#2563eb 60%,#4f46e5 100%)',
            WebkitBackgroundClip:'text',
            WebkitTextFillColor:'transparent',
          }}>
            Tiza &amp; Datos
          </h1>
          <p style={{
            fontSize:13,fontWeight:600,color:'#64748b',
            marginTop:6,marginBottom:0,letterSpacing:'0.01em',
          }}>
            Tu asistente educativo inteligente
          </p>
        </motion.div>

        {/* Rotating feature pill */}
        <motion.div
          initial={{opacity:0}}
          animate={{opacity:1}}
          transition={{delay:.4}}
          style={{
            height:36,display:'flex',alignItems:'center',
            justifyContent:'center',marginTop:8,marginBottom:0,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pillIdx}
              initial={{opacity:0,y:8,scale:.95}}
              animate={{opacity:1,y:0,scale:1}}
              exit={{opacity:0,y:-8,scale:.95}}
              transition={{duration:.25}}
              style={{
                display:'flex',alignItems:'center',gap:6,
                padding:'6px 16px',borderRadius:99,
                background:'white',
                boxShadow:'0 2px 12px rgba(15,23,42,0.08)',
                border:'1px solid #e2e8f0',
              }}
            >
              <span style={{fontSize:15}}>{FEATURES[pillIdx].emoji}</span>
              <span style={{fontSize:12,fontWeight:700,color:'#334155'}}>
                {FEATURES[pillIdx].text}
              </span>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── BOTTOM ACTIONS ───────────────────────────────── */}
      <div style={{
        flex:'0 0 auto',
        padding:'20px 28px 40px',
        display:'flex',flexDirection:'column',gap:12,
      }}>
        {/* Create account */}
        <motion.button
          initial={{opacity:0,y:20}}
          animate={{opacity:1,y:0}}
          transition={{delay:.5,type:'spring',stiffness:200}}
          whileTap={{scale:.97}}
          onClick={() => navigate('/register')}
          style={{
            width:'100%',padding:'16px',border:'none',borderRadius:18,
            background:'linear-gradient(135deg,#2563eb,#4f46e5)',
            color:'white',fontWeight:800,fontSize:16,cursor:'pointer',
            boxShadow:'0 8px 28px rgba(37,99,235,0.35)',
            fontFamily:'inherit',letterSpacing:'-0.01em',
          }}
        >
          Crear cuenta gratis
        </motion.button>

        {/* Login */}
        <motion.button
          initial={{opacity:0,y:20}}
          animate={{opacity:1,y:0}}
          transition={{delay:.6}}
          whileTap={{scale:.97}}
          onClick={() => navigate('/login')}
          style={{
            width:'100%',padding:'16px',borderRadius:18,
            border:'2px solid #e2e8f0',
            background:'white',color:'#334155',
            fontWeight:700,fontSize:16,cursor:'pointer',
            boxShadow:'0 1px 4px rgba(15,23,42,0.06)',
            fontFamily:'inherit',letterSpacing:'-0.01em',
          }}
        >
          Ya tengo cuenta
        </motion.button>

        {/* Footer tagline */}
        <motion.p
          initial={{opacity:0}}
          animate={{opacity:1}}
          transition={{delay:.75}}
          style={{
            textAlign:'center',fontSize:11,color:'#94a3b8',
            fontWeight:500,margin:0,paddingTop:4,
          }}
        >
          Hecho para docentes de México 🇲🇽 · Ciclo NEM 2024-2025
        </motion.p>
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { transform:scale(1); opacity:.6; }
          50% { transform:scale(1.08); opacity:1; }
        }
      `}</style>
    </div>
  );
}
