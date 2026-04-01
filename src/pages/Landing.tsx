import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Zap, Brain, BarChart2, ChevronRight, Star,
  Upload, MessageSquare, Trophy, ArrowRight, Sparkles, Check, Menu, X
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────
   Responsive CSS injected once
───────────────────────────────────────────────────────────────────────── */
const RESPONSIVE_STYLES = `
  .landing-hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
  }
  .landing-features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .landing-how-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }
  .resume-card-wrap {
    width: 340px;
  }
  .landing-nav-links { display: flex; }
  .landing-nav-cta   { display: flex; }
  .landing-hamburger { display: none; }
  .landing-mobile-menu { display: none; }

  @media (max-width: 900px) {
    .landing-hero-grid {
      grid-template-columns: 1fr;
      gap: 40px;
      text-align: center;
    }
    .landing-features-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .landing-how-grid {
      grid-template-columns: 1fr;
      gap: 48px;
    }
    .resume-card-wrap {
      width: 100%;
      max-width: 340px;
    }
  }

  @media (max-width: 640px) {
    .landing-features-grid {
      grid-template-columns: 1fr;
    }
    .landing-nav-links { display: none; }
    .landing-nav-cta   { display: none; }
    .landing-hamburger { display: flex; }
    .landing-mobile-menu.open { display: flex; }
    .resume-card-wrap {
      width: 100%;
      max-width: 300px;
    }
    .cta-inner-box {
      padding: 48px 24px !important;
    }
  }
`;

function InjectStyles() {
  useEffect(() => {
    if (document.getElementById('landing-responsive')) return;
    const el = document.createElement('style');
    el.id = 'landing-responsive';
    el.textContent = RESPONSIVE_STYLES;
    document.head.appendChild(el);
    return () => { document.getElementById('landing-responsive')?.remove(); };
  }, []);
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────── */
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/* ─────────────────────────────────────────────────────────────────────────
   Animated Fluid Orbs (canvas)
───────────────────────────────────────────────────────────────────────── */
function FluidOrbs() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const orbs = [
      { x: 0.2, y: 0.3, r: 320, vx: 0.00012, vy: 0.00008, color: '#6C63FF' },
      { x: 0.75, y: 0.2, r: 260, vx: -0.00010, vy: 0.00015, color: '#4F46E5' },
      { x: 0.5, y: 0.7, r: 200, vx: 0.00008, vy: -0.00012, color: '#818CF8' },
      { x: 0.85, y: 0.65, r: 180, vx: -0.00014, vy: -0.00009, color: '#3B82F6' },
    ];

    let t = 0;
    let raf: number;

    const draw = () => {
      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      orbs.forEach(orb => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < 0 || orb.x > 1) orb.vx *= -1;
        if (orb.y < 0 || orb.y > 1) orb.vy *= -1;

        const cx = orb.x * canvas.width;
        const cy = orb.y * canvas.height;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orb.r);
        grad.addColorStop(0, orb.color + '33');
        grad.addColorStop(0.5, orb.color + '15');
        grad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(cx, cy, orb.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   3D Resume Card (pure CSS perspective + framer-motion tilt)
───────────────────────────────────────────────────────────────────────── */
function ResumeCard3D() {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const springX = useSpring(rotX, { stiffness: 100, damping: 20 });
  const springY = useSpring(rotY, { stiffness: 100, damping: 20 });

  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    rotY.set(clamp(dx * 18, -18, 18));
    rotX.set(clamp(-dy * 18, -18, 18));
  };

  const handleMouseLeave = () => {
    rotX.set(0);
    rotY.set(0);
    setHovered(false);
  };

  const skills = ['React', 'TypeScript', 'Python', 'Node.js', 'SQL', 'Git'];
  const exp = [
    { label: 'Total Experience', value: '4+ Years' },
    { label: 'Target Role', value: 'Full Stack Developer' },
  ];

  return (
    <div style={{ perspective: '900px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 0' }}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setHovered(true)}
        className="resume-card-wrap"
        style={{
          rotateX: springX,
          rotateY: springY,
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
        animate={{
          y: [0, -18, 0],
          rotateZ: [0, 1.5, 0, -1.5, 0],
        }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          rotateZ: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        {/* Glow shadow */}
        <motion.div
          style={{
            position: 'absolute', inset: '-20px', borderRadius: '28px',
            background: 'radial-gradient(ellipse, rgba(108,99,255,0.35) 0%, transparent 70%)',
            filter: 'blur(24px)',
            transformStyle: 'preserve-3d',
            transform: 'translateZ(-40px)',
            zIndex: 0,
          }}
          animate={{ opacity: hovered ? 0.9 : 0.6 }}
        />

        {/* Main card */}
        <motion.div
          style={{
            background: 'linear-gradient(135deg, rgba(30,27,75,0.98) 0%, rgba(15,12,40,0.97) 100%)',
            border: '1px solid rgba(108,99,255,0.3)',
            borderRadius: '20px',
            padding: '28px',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
            transformStyle: 'preserve-3d',
            position: 'relative',
            zIndex: 1,
            overflow: 'hidden',
          }}
        >
          {/* Shimmer overlay */}
          <motion.div
            style={{
              position: 'absolute', inset: 0, borderRadius: '20px',
              background: 'linear-gradient(105deg, transparent 40%, rgba(108,99,255,0.12) 50%, transparent 60%)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', transform: 'translateZ(12px)' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6C63FF, #3B82F6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(108,99,255,0.5)',
              fontSize: 22, fontWeight: 700, color: '#fff',
              fontFamily: 'Syne, sans-serif',
            }}>
              AK
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: 'Syne, sans-serif' }}>Alex Kumar</div>
              <div style={{ color: '#818CF8', fontSize: 12, marginTop: 2 }}>Full Stack Developer</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div style={{
                background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.4)',
                borderRadius: 20, padding: '4px 10px', fontSize: 11, color: '#818CF8',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                AI Matched
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(108,99,255,0.4), transparent)', marginBottom: 18 }} />

          {/* Experience */}
          <div style={{ marginBottom: 18, transform: 'translateZ(8px)' }}>
            <div style={{ color: '#9CA3AF', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
              Profile Overview
            </div>
            {exp.map((e, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ color: '#D1D5DB', fontSize: 13, fontWeight: 500 }}>{e.label}</div>
                <div style={{ color: '#F9FAFB', fontSize: 13, fontWeight: 700, background: 'rgba(108,99,255,0.15)', padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(108,99,255,0.3)' }}>{e.value}</div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div style={{ transform: 'translateZ(6px)' }}>
            <div style={{ color: '#9CA3AF', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
              Skills
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {skills.map((s, i) => (
                <motion.span
                  key={s}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)',
                    borderRadius: 99, padding: '3px 10px', fontSize: 11, color: '#A5B4FC',
                  }}
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Fluid Graph */}
          <div style={{ marginTop: 18, transform: 'translateZ(10px)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#9CA3AF', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Performance Trajectory</span>
              <span style={{ color: '#10B981', fontSize: 11, fontWeight: 700 }}>+24% Growth</span>
            </div>
            <div style={{ height: 50, position: 'relative', marginTop: 10 }}>
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="graphGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(108,99,255,0.6)" />
                    <stop offset="100%" stopColor="rgba(108,99,255,0)" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <motion.path
                  d="M0 40 Q 15 20, 30 25 T 60 15 T 100 5 L 100 40 Z"
                  fill="url(#graphGrad)"
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                  style={{ transformOrigin: 'bottom' }}
                />
                <motion.path
                  d="M0 40 Q 15 20, 30 25 T 60 15 T 100 5"
                  fill="none"
                  stroke="#818CF8"
                  strokeWidth="2"
                  filter="url(#glow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: 'easeInOut', delay: 0.3 }}
                />
                {/* Floating animated points */}
                <motion.circle
                  cx="60" cy="15" r="2.5" fill="#fff"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  style={{ filter: 'drop-shadow(0 0 4px #818CF8)' }}
                />
                <motion.circle
                  cx="100" cy="5" r="3" fill="#10B981"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: [1, 1.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                  style={{ filter: 'drop-shadow(0 0 6px #10B981)' }}
                />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Floating badge 1 */}
        <motion.div
          style={{
            position: 'absolute', top: -14, right: -18,
            background: 'linear-gradient(135deg, #10B981, #059669)',
            borderRadius: 12, padding: '7px 12px',
            boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
            display: 'flex', alignItems: 'center', gap: 6,
            transform: 'translateZ(30px)',
            zIndex: 10, border: '1px solid rgba(255,255,255,0.15)',
          }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        >
          <Zap size={13} color="#fff" />
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>AI Matched</span>
        </motion.div>

        {/* Floating badge 2 */}
        <motion.div
          style={{
            position: 'absolute', bottom: -14, left: -18,
            background: 'rgba(15,12,40,0.95)', border: '1px solid rgba(108,99,255,0.4)',
            borderRadius: 12, padding: '7px 12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', gap: 6,
            transform: 'translateZ(30px)',
            backdropFilter: 'blur(20px)', zIndex: 10,
          }}
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        >
          <Brain size={13} color="#818CF8" />
          <span style={{ color: '#E5E7EB', fontSize: 12, fontWeight: 600 }}>Questions ready</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Feature Card
───────────────────────────────────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, gradient, delay }: {
  icon: any; title: string; desc: string; gradient: string; delay: number;
}) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov
          ? 'linear-gradient(135deg, rgba(30,27,75,0.9), rgba(20,16,60,0.9))'
          : 'rgba(17,24,39,0.6)',
        border: hov ? '1px solid rgba(108,99,255,0.4)' : '1px solid rgba(255,255,255,0.05)',
        borderRadius: 20, padding: '28px',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.3s ease',
        cursor: 'default',
        boxShadow: hov ? '0 20px 60px rgba(108,99,255,0.15)' : '0 4px 20px rgba(0,0,0,0.2)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {hov && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            position: 'absolute', inset: 0, borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(108,99,255,0.06) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
      )}
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 18, boxShadow: '0 8px 20px rgba(108,99,255,0.3)',
      }}>
        <Icon size={22} color="#fff" strokeWidth={1.8} />
      </div>
      <h3 style={{ color: '#F9FAFB', fontWeight: 700, fontSize: 17, marginBottom: 10, fontFamily: 'Syne, sans-serif' }}>
        {title}
      </h3>
      <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Step Card
───────────────────────────────────────────────────────────────────────── */
function StepCard({ num, icon: Icon, title, desc, delay }: {
  num: string; icon: any; title: string; desc: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6C63FF22, #3B82F622)',
          border: '1px solid rgba(108,99,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color="#818CF8" strokeWidth={1.8} />
        </div>
        <div style={{
          position: 'absolute', top: -6, right: -6,
          width: 20, height: 20, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6C63FF, #3B82F6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 800, color: '#fff',
        }}>
          {num}
        </div>
      </div>
      <div>
        <h4 style={{ color: '#F9FAFB', fontWeight: 700, fontSize: 16, marginBottom: 6, fontFamily: 'Syne, sans-serif' }}>{title}</h4>
        <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Floating Particles
───────────────────────────────────────────────────────────────────────── */
function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 4,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: '50%',
            background: p.id % 3 === 0 ? '#6C63FF' : p.id % 3 === 1 ? '#3B82F6' : '#818CF8',
            opacity: 0.4,
          }}
          animate={{
            y: [0, -60, 0],
            opacity: [0.1, 0.5, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Navbar
───────────────────────────────────────────────────────────────────────── */
function Navbar({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled || mobileOpen ? 'rgba(10,15,30,0.95)' : 'transparent',
          backdropFilter: scrolled || mobileOpen ? 'blur(20px)' : 'none',
          borderBottom: scrolled || mobileOpen ? '1px solid rgba(108,99,255,0.15)' : '1px solid transparent',
          transition: 'all 0.4s ease',
          padding: '0 5%',
        }}
      >
        {/* Main bar */}
        <div style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/logo.png"
              alt="Resume2Interview Logo"
              style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8 }}
            />
            <span style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18,
              background: 'linear-gradient(135deg, #F9FAFB, #818CF8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Resume2Interview
            </span>
          </div>

          {/* Nav links — hidden below 640px */}
          <div className="landing-nav-links" style={{ alignItems: 'center', gap: 32 }}>
            {['Features', 'How It Works'].map(link => (
              <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`}
                style={{ color: '#9CA3AF', fontSize: 14, textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F9FAFB')}
                onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
              >
                {link}
              </a>
            ))}
          </div>

          {/* CTA — hidden below 640px */}
          <div className="landing-nav-cta" style={{ alignItems: 'center', gap: 12 }}>
            <button onClick={onLogin} style={{
              background: 'transparent', border: '1px solid rgba(108,99,255,0.4)',
              borderRadius: 99, padding: '8px 20px', color: '#A5B4FC', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6C63FF'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(108,99,255,0.4)'; e.currentTarget.style.color = '#A5B4FC'; }}
            >
              Log In
            </button>
            <button onClick={onSignup} style={{
              background: 'linear-gradient(135deg, #6C63FF, #4F46E5)',
              border: 'none', borderRadius: 99, padding: '9px 22px',
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(108,99,255,0.4)', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(108,99,255,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(108,99,255,0.4)'; }}
            >
              Sign Up
            </button>
          </div>

          {/* Hamburger — shown below 640px */}
          <button
            className="landing-hamburger"
            onClick={() => setMobileOpen(o => !o)}
            style={{
              background: 'transparent', border: '1px solid rgba(108,99,255,0.3)',
              borderRadius: 10, padding: '8px', cursor: 'pointer',
              color: '#A5B4FC', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', borderTop: '1px solid rgba(108,99,255,0.1)' }}
            >
              <div style={{ padding: '16px 0 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {['Features', 'How It Works'].map(link => (
                  <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`}
                    onClick={() => setMobileOpen(false)}
                    style={{ color: '#9CA3AF', fontSize: 15, textDecoration: 'none', fontWeight: 500 }}
                  >
                    {link}
                  </a>
                ))}
                <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                  <button onClick={() => { setMobileOpen(false); onLogin(); }} style={{
                    flex: 1, background: 'transparent', border: '1px solid rgba(108,99,255,0.4)',
                    borderRadius: 99, padding: '10px', color: '#A5B4FC', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}>
                    Log In
                  </button>
                  <button onClick={() => { setMobileOpen(false); onSignup(); }} style={{
                    flex: 1, background: 'linear-gradient(135deg, #6C63FF, #4F46E5)',
                    border: 'none', borderRadius: 99, padding: '10px',
                    color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  }}>
                    Sign Up
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Main Landing Page
───────────────────────────────────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -60]);

  const features = [
    {
      icon: Brain, title: 'AI-Powered Analysis', gradient: 'linear-gradient(135deg, #6C63FF, #818CF8)',
      desc: 'Our AI deeply analyzes your resume to extract skills, experience, and strengths — generating hyper-relevant interview questions tailored to your profile.',
    },
    {
      icon: MessageSquare, title: 'Realistic Mock Interviews', gradient: 'linear-gradient(135deg, #3B82F6, #6366F1)',
      desc: 'Practice with questions an actual interviewer would ask based on exactly what\'s in your resume. No generic templates.',
    },
    {
      icon: BarChart2, title: 'Detailed Performance Reports', gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
      desc: 'Get scored on each answer with actionable feedback. Track your progress over multiple sessions with rich analytics.',
    },
    {
      icon: Zap, title: 'Instant Question Generation', gradient: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
      desc: 'Upload your resume and get a customized interview set in seconds — no waiting, no setup, just practice.',
    },
    {
      icon: Trophy, title: 'Streak & Gamification', gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
      desc: 'Stay motivated with daily streaks, performance badges, and progress milestones that keep you on track.',
    },
    {
      icon: Sparkles, title: 'Smart Skill Matching', gradient: 'linear-gradient(135deg, #10B981, #3B82F6)',
      desc: 'Questions are intelligently weighted by your proficiency level — harder for expert skills, foundational for newer ones.',
    },
  ];

  const steps = [
    { icon: Upload, title: 'Upload Your Resume', desc: 'Drop your PDF resume. Our AI instantly parses skills, experience, education, and projects.' },
    { icon: Brain, title: 'AI Generates Questions', desc: 'Smart algorithms craft role-specific interview questions based on your actual resume content.' },
    { icon: MessageSquare, title: 'Practice & Improve', desc: 'Answer questions at your own pace. Get instant scoring and improvement suggestions.' },
    { icon: Trophy, title: 'Track Your Progress', desc: 'Review detailed reports, track streaks, and watch your interview confidence grow over time.' },
  ];

  return (
    <div style={{ background: '#0A0F1E', minHeight: '100vh', color: '#F9FAFB', overflowX: 'hidden' }}>
      <InjectStyles />
      <Navbar onLogin={() => navigate('/login')} onSignup={() => navigate('/signup')} />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <FluidOrbs />
        <Particles />

        {/* Grid texture */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(108,99,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <motion.div style={{ opacity: heroOpacity, y: heroY, position: 'relative', zIndex: 2, width: '100%' }}>
          <div
            className="landing-hero-grid"
            style={{ maxWidth: 1300, margin: '0 auto', padding: '120px 5% 80px' }}
          >
            {/* Left */}
            <div>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.3)',
                  borderRadius: 99, padding: '6px 16px', marginBottom: 28,
                }}
              >
                <Sparkles size={13} color="#818CF8" />
                <span style={{ color: '#818CF8', fontSize: 13, fontWeight: 600 }}>AI-Powered Interview Prep</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
                style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(38px, 5vw, 64px)',
                  lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em',
                }}
              >
                Your Resume,{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #6C63FF 0%, #818CF8 50%, #3B82F6 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  Your Interview
                </span>
                <br />Questions. Ready.
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                style={{ color: '#6B7280', fontSize: 'clamp(15px, 1.5vw, 18px)', lineHeight: 1.75, marginBottom: 36, maxWidth: 480 }}
              >
                Upload your resume and get AI-generated interview questions crafted specifically from your experience,
                skills, and projects. Practice smarter, not harder.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}
              >
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/signup')}
                  style={{
                    background: 'linear-gradient(135deg, #6C63FF, #4F46E5)',
                    border: 'none', borderRadius: 99, padding: '14px 30px',
                    color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 8px 32px rgba(108,99,255,0.45)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  Sign Up <ArrowRight size={16} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/login')}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(108,99,255,0.3)',
                    borderRadius: 99, padding: '13px 28px',
                    color: '#A5B4FC', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  Sign In <ChevronRight size={15} />
                </motion.button>
              </motion.div>

            </div>

            {/* Right – 3D Resume Card */}
            <motion.div
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 420 }}
            >
              <ResumeCard3D />
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, zIndex: 1, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, transparent, #0A0F1E)',
        }} />
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)',
              borderRadius: 99, padding: '5px 14px', marginBottom: 20,
            }}>
              <span style={{ color: '#818CF8', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Features</span>
            </div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 46px)', marginBottom: 16 }}>
              Everything You Need to{' '}
              <span style={{ background: 'linear-gradient(135deg, #6C63FF, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Ace Interviews
              </span>
            </h2>
            <p style={{ color: '#6B7280', fontSize: 16, maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
              From resume parsing to performance analytics — every tool you need in one place.
            </p>
          </motion.div>

          <div className="landing-features-grid">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '100px 5%', position: 'relative' }}>
        {/* Background accent */}
        <div style={{
          position: 'absolute', top: '10%', right: '5%', width: 400, height: 400,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        <div className="landing-how-grid" style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
            >
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)',
                borderRadius: 99, padding: '5px 14px', marginBottom: 20,
              }}>
                <span style={{ color: '#818CF8', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>How It Works</span>
              </div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(26px, 3.5vw, 42px)', marginBottom: 16, lineHeight: 1.2 }}>
                From Resume to{' '}
                <span style={{ background: 'linear-gradient(135deg, #6C63FF, #818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Interview Ready
                </span>{' '}in Minutes
              </h2>
              <p style={{ color: '#6B7280', fontSize: 15, lineHeight: 1.75, marginBottom: 40 }}>
                Our streamlined process takes you from raw resume to confident interview practice with zero friction.
              </p>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28, position: 'relative' }}>
              {/* Connecting line */}
              <div style={{
                position: 'absolute', left: 25, top: 52, bottom: 10,
                width: 1, background: 'linear-gradient(to bottom, rgba(108,99,255,0.4), transparent)',
              }} />
              {steps.map((s, i) => (
                <StepCard key={s.title} num={String(i + 1)} {...s} delay={i * 0.1} />
              ))}
            </div>
          </div>

          {/* Right – mini resume preview panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            style={{ position: 'relative' }}
          >
            {/* Outer glow */}
            <div style={{
              position: 'absolute', inset: -30,
              background: 'radial-gradient(ellipse, rgba(108,99,255,0.15) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }} />

            {/* Panel */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(20,16,60,0.95), rgba(10,10,30,0.95))',
              border: '1px solid rgba(108,99,255,0.25)', borderRadius: 24, padding: 32,
              backdropFilter: 'blur(30px)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Top bar */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                {['#EF4444', '#F59E0B', '#10B981'].map(c => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                ))}
              </div>

              {/* Headline */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: '#F9FAFB', fontWeight: 700, fontSize: 15, fontFamily: 'Syne, sans-serif', marginBottom: 4 }}>
                  AI-Generated Interview Questions
                </div>
                <div style={{ color: '#6B7280', fontSize: 12 }}>Based on your React & TypeScript experience</div>
              </div>

              {/* Question cards */}
              {[
                { q: 'Explain the difference between useEffect and useLayoutEffect.', tag: 'React' },
                { q: 'How do you handle async state updates in TypeScript?', tag: 'TypeScript' },
                { q: 'Describe a challenging project from your TechCorp experience.', tag: 'Behavioral' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                  style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12, padding: '12px 14px', marginBottom: 10,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10,
                  }}
                >
                  <span style={{ color: '#D1D5DB', fontSize: 13, lineHeight: 1.5, flex: 1 }}>
                    Q{i + 1}. {item.q}
                  </span>
                  <span style={{
                    flexShrink: 0, background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)',
                    borderRadius: 99, padding: '2px 8px', fontSize: 10, color: '#818CF8', fontWeight: 600,
                  }}>
                    {item.tag}
                  </span>
                </motion.div>
              ))}

              {/* Score preview */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.5 }}
                style={{
                  marginTop: 16, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <Check size={14} color="#10B981" />
                <span style={{ color: '#10B981', fontSize: 13, fontWeight: 600 }}>Session Score: 88/100 — Great work!</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────────────────── */}
      <section style={{ padding: '100px 5%' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="cta-inner-box"
          style={{
            maxWidth: 800, margin: '0 auto', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(59,130,246,0.08))',
            border: '1px solid rgba(108,99,255,0.2)', borderRadius: 28, padding: '72px 48px',
            backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Background shimmer */}
          <motion.div
            style={{
              position: 'absolute', inset: 0, borderRadius: 28,
              background: 'linear-gradient(105deg, transparent 30%, rgba(108,99,255,0.08) 50%, transparent 70%)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20,
              background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.25)',
              borderRadius: 99, padding: '5px 14px',
            }}>
              <Sparkles size={13} color="#818CF8" />
              <span style={{ color: '#818CF8', fontSize: 12, fontWeight: 600 }}>Free to Start</span>
            </div>

            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 48px)', marginBottom: 16, lineHeight: 1.2 }}>
              Ready to Ace Your{' '}
              <span style={{ background: 'linear-gradient(135deg, #6C63FF, #818CF8, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Next Interview?
              </span>
            </h2>

            <p style={{ color: '#6B7280', fontSize: 16, lineHeight: 1.7, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
              Join hundreds of job seekers who are already preparing smarter with AI-powered, resume-specific interview practice.
            </p>

            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/signup')}
                style={{
                  background: 'linear-gradient(135deg, #6C63FF, #4F46E5)',
                  border: 'none', borderRadius: 99, padding: '15px 36px',
                  color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(108,99,255,0.5)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                Sign Up <ArrowRight size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/login')}
                style={{
                  background: 'transparent', border: '1px solid rgba(108,99,255,0.3)',
                  borderRadius: 99, padding: '14px 32px', color: '#A5B4FC',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(10px)',
                }}
              >
                Sign In Instead
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 5%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img 
            src="/logo.png" 
            alt="Resume2Interview Logo" 
            style={{ width: 30, height: 30, objectFit: 'contain', borderRadius: 6 }} 
          />
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#9CA3AF' }}>
            Resume2Interview
          </span>
        </div>
        <div style={{ color: '#4B5563', fontSize: 13 }}>
          © 2026 Resume2Interview.
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Help'].map(link => (
            <a key={link} href={`/${link.toLowerCase()}`} style={{ color: '#4B5563', fontSize: 13, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#818CF8'}
              onMouseLeave={e => e.currentTarget.style.color = '#4B5563'}
            >
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
