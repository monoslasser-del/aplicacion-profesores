import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import tizaMascot from '../../assets/tiza_mascot.svg';

const FEATURES = [
  { emoji: '📋', text: 'Asistencia NFC' },
  { emoji: '📝', text: 'Fichas Descriptivas' },
  { emoji: '📅', text: 'Calendario Escolar' },
  { emoji: '📊', text: 'Reportes NEM' },
];

// ─── Chalk-style SVG decorations (top half — blackboard green) ────────────────
function ChalkDecors() {
  return (
    <svg viewBox="0 0 390 320" preserveAspectRatio="xMidYMid slice"
      style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:.55 }}
      aria-hidden="true">
      {/* chalk texture lines */}
      <line x1="0" y1="60"  x2="390" y2="55"  stroke="white" strokeWidth=".4" strokeDasharray="4 6" opacity=".3"/>
      <line x1="0" y1="120" x2="390" y2="118" stroke="white" strokeWidth=".4" strokeDasharray="3 8" opacity=".2"/>
      <line x1="0" y1="200" x2="390" y2="200" stroke="white" strokeWidth=".4" strokeDasharray="5 5" opacity=".15"/>

      {/* 2 + 2 = 4 */}
      <text x="22" y="48" fill="white" fontSize="18" fontFamily="Georgia, serif" fontWeight="bold" opacity=".7">2 + 2 = 4</text>

      {/* Fraction */}
      <text x="280" y="36" fill="white" fontSize="13" fontFamily="Georgia, serif" opacity=".65">¾ × 8</text>
      <line x1="275" y1="40" x2="330" y2="40" stroke="white" strokeWidth="1" opacity=".5"/>
      <text x="287" y="54" fill="white" fontSize="13" fontFamily="Georgia, serif" opacity=".65">= 6</text>

      {/* ABC letters */}
      <text x="18" y="100" fill="#86efac" fontSize="22" fontFamily="Georgia, serif" fontWeight="bold" opacity=".75" transform="rotate(-8,18,100)">A</text>
      <text x="46" y="96" fill="#fde68a" fontSize="22" fontFamily="Georgia, serif" fontWeight="bold" opacity=".7" transform="rotate(5,46,96)">B</text>
      <text x="72" y="102" fill="#a5f3fc" fontSize="22" fontFamily="Georgia, serif" fontWeight="bold" opacity=".72" transform="rotate(-4,72,102)">C</text>

      {/* Star drawn in chalk */}
      <polygon points="345,28 348,20 351,28 359,28 353,33 355,41 348,36 341,41 343,33 337,28"
        fill="none" stroke="#fde68a" strokeWidth="1.2" opacity=".7"/>

      {/* Triangle */}
      <polygon points="190,20 205,50 175,50"
        fill="none" stroke="white" strokeWidth="1.4" strokeDasharray="3 2" opacity=".55"/>
      <text x="182" y="64" fill="white" fontSize="10" fontFamily="Georgia" opacity=".6">▲</text>

      {/* Circle π */}
      <circle cx="240" cy="38" r="18" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="4 3" opacity=".5"/>
      <text x="233" y="43" fill="white" fontSize="13" fontFamily="Georgia, serif" fontWeight="bold" opacity=".8">π</text>

      {/* x² + y² = z² */}
      <text x="80" y="140" fill="white" fontSize="12" fontFamily="Georgia, serif" opacity=".6">x² + y² = z²</text>

      {/* Ruler sketch */}
      <rect x="18" y="150" width="90" height="14" rx="2"
        fill="none" stroke="#fde68a" strokeWidth="1.2" opacity=".5"/>
      {[0,1,2,3,4,5,6,7,8].map(i => (
        <line key={i} x1={22+i*10} y1="150" x2={22+i*10} y2={i%5===0?158:155}
          stroke="#fde68a" strokeWidth="1" opacity=".6"/>
      ))}

      {/* Sigma Σ */}
      <text x="330" y="100" fill="white" fontSize="28" fontFamily="Georgia, serif" fontWeight="bold" opacity=".6">Σ</text>

      {/* small stars */}
      {[[120,80],[300,60],[160,120],[350,150]].map(([x,y],i)=>(
        <text key={i} x={x} y={y} fill="#fde68a" fontSize="14" opacity=".6" fontFamily="sans-serif">★</text>
      ))}

      {/* atom orbit */}
      <ellipse cx="355" cy="200" rx="28" ry="12" fill="none" stroke="#a5f3fc" strokeWidth="1.2" opacity=".5" transform="rotate(-30,355,200)"/>
      <ellipse cx="355" cy="200" rx="28" ry="12" fill="none" stroke="#a5f3fc" strokeWidth="1.2" opacity=".5" transform="rotate(30,355,200)"/>
      <circle cx="355" cy="200" r="4" fill="#a5f3fc" opacity=".6"/>

      {/* Pencil icon */}
      <line x1="140" y1="165" x2="150" y2="140" stroke="white" strokeWidth="3" strokeLinecap="round" opacity=".5"/>
      <polygon points="150,140 154,136 146,137" fill="white" opacity=".5"/>

      {/* "MAESTRO" chalk */}
      <text x="18" y="200" fill="white" fontSize="11" fontFamily="Georgia" letterSpacing="4" opacity=".4">MAESTRO</text>
    </svg>
  );
}

// ─── Tech-style SVG decorations (bottom half — deep blue) ─────────────────────
function TechDecors() {
  const dots = [[20,30],[60,20],[100,50],[140,25],[200,40],[250,15],[300,35],[350,20],[380,55],[30,70],[80,80],[160,65],[230,75],[310,60],[370,80]];
  const lines: [number,number,number,number][] = [[20,30,60,20],[60,20,100,50],[100,50,140,25],[200,40,250,15],[250,15,300,35],[300,35,350,20],[30,70,80,80],[160,65,230,75],[310,60,370,80]];
  return (
    <svg viewBox="0 0 390 160" preserveAspectRatio="xMidYMid slice"
      style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.35}}
      aria-hidden="true">
      {/* circuit lines */}
      {lines.map(([x1,y1,x2,y2],i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#60a5fa" strokeWidth="1" opacity=".7"/>
      ))}
      {/* circuit dots */}
      {dots.map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i%4===0?3:1.5} fill="#93c5fd" opacity=".8"/>
      ))}
      {/* code snippets */}
      <text x="18" y="110" fill="#a5f3fc" fontSize="9" fontFamily="monospace" opacity=".7">{'</>  if(x) { return a; }'}</text>
      <text x="18" y="125" fill="#6ee7b7" fontSize="9" fontFamily="monospace" opacity=".6">{'fn learn() -> Result<>'}</text>
      <text x="220" y="115" fill="#c4b5fd" fontSize="9" fontFamily="monospace" opacity=".65">{'AI · NFC · NEM'}</text>
      {/* binary fragments */}
      <text x="310" y="105" fill="#60a5fa" fontSize="8" fontFamily="monospace" opacity=".45">010110</text>
      <text x="310" y="118" fill="#60a5fa" fontSize="8" fontFamily="monospace" opacity=".35">110010</text>
      {/* wifi icon */}
      <path d="M355 145 Q365 138 375 145" stroke="#93c5fd" strokeWidth="1.5" fill="none" opacity=".7"/>
      <path d="M350 140 Q365 130 380 140" stroke="#93c5fd" strokeWidth="1.5" fill="none" opacity=".5"/>
      <circle cx="365" cy="148" r="2.5" fill="#93c5fd" opacity=".8"/>
    </svg>
  );
}

export function WelcomeScreen() {
  const navigate = useNavigate();
  const [pillIdx, setPillIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPillIdx(i => (i + 1) % FEATURES.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      display:'flex', flexDirection:'column',
      height:'100dvh', overflow:'hidden',
      position:'relative',
      fontFamily:'Inter, system-ui, sans-serif',
    }}>

      {/* ── TOP HALF — Pizarra verde ───────────────────────── */}
      <div style={{
        position:'absolute', top:0, left:0, right:0,
        height:'52%',
        background:'linear-gradient(160deg,#1a4731 0%,#166534 40%,#14532d 100%)',
        borderBottomLeftRadius:48,
        borderBottomRightRadius:48,
        overflow:'hidden',
        boxShadow:'0 12px 40px rgba(0,0,0,0.35)',
      }}>
        <ChalkDecors/>
        {/* chalk dust overlay */}
        <div style={{
          position:'absolute',inset:0,
          background:'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.04), transparent 60%)',
        }}/>
      </div>

      {/* ── BOTTOM HALF — Azul tecnológico ─────────────────── */}
      <div style={{
        position:'absolute',bottom:0,left:0,right:0,
        height:'52%',
        background:'linear-gradient(180deg,#1e3a8a 0%,#1e40af 50%,#1d4ed8 100%)',
        overflow:'hidden',
      }}>
        <TechDecors/>
        <div style={{
          position:'absolute',inset:0,
          background:'radial-gradient(ellipse at 70% 80%, rgba(99,102,241,0.25), transparent 60%)',
        }}/>
      </div>

      {/* ── CONTENT LAYER (on top of both halves) ─────────── */}
      <div style={{
        position:'relative', zIndex:10,
        display:'flex', flexDirection:'column',
        height:'100%',
      }}>

        {/* Brand chip */}
        <div style={{
          display:'flex', justifyContent:'center',
          paddingTop:48,
        }}>
          <motion.div
            initial={{opacity:0,y:-12}}
            animate={{opacity:1,y:0}}
            transition={{delay:.1}}
            style={{
              display:'inline-flex',alignItems:'center',gap:5,
              padding:'4px 14px', borderRadius:99,
              background:'rgba(255,255,255,0.15)',
              border:'1px solid rgba(255,255,255,0.25)',
              backdropFilter:'blur(8px)',
            }}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#86efac',display:'inline-block'}}/>
            <span style={{fontSize:10,fontWeight:800,color:'white',letterSpacing:'0.07em',textTransform:'uppercase'}}>
              Plataforma Educativa NEM
            </span>
          </motion.div>
        </div>

        {/* Center: mascot + name */}
        <div style={{
          flex:1, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          gap:0,
        }}>
          {/* Mascot card floating in the middle */}
          <motion.div
            initial={{scale:.7,opacity:0,y:20}}
            animate={{scale:1,opacity:1,y:0}}
            transition={{type:'spring',stiffness:160,damping:18,delay:.15}}
            style={{
              width:110, height:110, borderRadius:32,
              background:'rgba(255,255,255,0.95)',
              boxShadow:'0 8px 40px rgba(0,0,0,0.35), 0 0 0 4px rgba(255,255,255,0.2)',
              display:'flex', alignItems:'center', justifyContent:'center',
              marginBottom:16,
            }}
          >
            <img src={tizaMascot} alt="Tiza" style={{width:80,height:80,objectFit:'contain'}}/>
          </motion.div>

          {/* Brand name */}
          <motion.div
            initial={{opacity:0,y:12}}
            animate={{opacity:1,y:0}}
            transition={{delay:.28}}
            style={{textAlign:'center',marginBottom:8}}
          >
            <h1 style={{
              fontSize:30, fontWeight:900, lineHeight:1.1,
              margin:0, letterSpacing:'-0.03em', color:'white',
              textShadow:'0 2px 12px rgba(0,0,0,0.4)',
            }}>
              Tiza &amp; Datos
            </h1>
            <p style={{
              fontSize:12, fontWeight:600,
              color:'rgba(255,255,255,0.75)',
              marginTop:4, marginBottom:0,
            }}>
              Tu asistente educativo inteligente
            </p>
          </motion.div>

          {/* Rotating feature pill */}
          <motion.div
            initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.4}}
            style={{height:32,display:'flex',alignItems:'center',justifyContent:'center',marginTop:8}}
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
                  padding:'5px 14px', borderRadius:99,
                  background:'rgba(255,255,255,0.18)',
                  border:'1px solid rgba(255,255,255,0.3)',
                  backdropFilter:'blur(8px)',
                }}
              >
                <span style={{fontSize:14}}>{FEATURES[pillIdx].emoji}</span>
                <span style={{fontSize:12,fontWeight:700,color:'white'}}>
                  {FEATURES[pillIdx].text}
                </span>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Bottom buttons */}
        <div style={{
          flex:'0 0 auto',
          padding:'12px 24px 36px',
          display:'flex', flexDirection:'column', gap:10,
        }}>
          <motion.button
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
            transition={{delay:.5,type:'spring',stiffness:200}}
            whileTap={{scale:.97}}
            onClick={() => navigate('/register')}
            style={{
              width:'100%', padding:'14px', border:'none', borderRadius:16,
              background:'white',
              color:'#1d4ed8', fontWeight:800, fontSize:15, cursor:'pointer',
              boxShadow:'0 4px 24px rgba(0,0,0,0.2)',
              fontFamily:'inherit', letterSpacing:'-0.01em',
            }}
          >
            Crear cuenta gratis
          </motion.button>

          <motion.button
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
            transition={{delay:.6}}
            whileTap={{scale:.97}}
            onClick={() => navigate('/login')}
            style={{
              width:'100%', padding:'14px', borderRadius:16,
              border:'2px solid rgba(255,255,255,0.35)',
              background:'rgba(255,255,255,0.12)',
              color:'white', fontWeight:700, fontSize:15, cursor:'pointer',
              backdropFilter:'blur(8px)',
              fontFamily:'inherit', letterSpacing:'-0.01em',
            }}
          >
            Ya tengo cuenta
          </motion.button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { transform:scale(1); opacity:.5; }
          50% { transform:scale(1.1); opacity:.9; }
        }
      `}</style>
    </div>
  );
}
