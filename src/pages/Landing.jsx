import { Link } from 'react-router-dom'
import { Activity, Shield, Clock, ArrowRight, CheckCircle2, Zap, Heart, MapPin, Bell, Syringe } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

/* ── Animated counter ─────────────────────────────────── */
function CountUp({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true) }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  useEffect(() => {
    if (!started) return
    let s = 0; const step = end / (duration / 16)
    const t = setInterval(() => { s += step; if (s >= end) { setCount(end); clearInterval(t) } else setCount(Math.floor(s)) }, 16)
    return () => clearInterval(t)
  }, [started])
  return <span ref={ref}>{count}{suffix}</span>
}

/* ── Floating particle ────────────────────────────────── */
function Particle({ style }) {
  return <div style={{ position: 'absolute', borderRadius: '50%', pointerEvents: 'none', ...style }} />
}

/* ── Animated ECG path ────────────────────────────────── */
function ECGLine() {
  return (
    <svg viewBox="0 0 600 60" style={{ width: '100%', height: '44px', overflow: 'visible' }}>
      <defs>
        <linearGradient id="ecg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0" />
          <stop offset="30%" stopColor="#22D3EE" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#67E8F9" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none" stroke="url(#ecg-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        points="0,30 30,30 40,30 48,12 55,48 62,30 80,30 90,30 98,22 106,38 112,30 140,30 148,8 156,52 163,30 175,30 210,30 218,18 226,42 232,30 260,30 265,6 272,54 278,30 295,30 330,30 338,20 346,40 352,30 380,30 385,10 392,50 398,30 415,30 450,30 458,22 466,38 472,30 500,30 505,14 512,46 518,30 535,30 560,30 568,18 576,42 582,30 600,30"
      />
      <style>{`
        @keyframes ecg-move {
          0%   { stroke-dashoffset: 800; }
          100% { stroke-dashoffset: 0; }
        }
        svg polyline {
          stroke-dasharray: 800;
          stroke-dashoffset: 800;
          animation: ecg-move 3s ease-out forwards;
        }
      `}</style>
    </svg>
  )
}

/* ── Feature card ─────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, color, delay }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      background: 'rgba(2,26,60,0.7)', border: '1.5px solid rgba(8,145,178,0.18)',
      borderRadius: '18px', padding: '24px', transition: 'all 0.5s ease',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)',
      transitionDelay: `${delay}ms`,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(34,211,238,0.45)'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 12px 36px rgba(34,211,238,0.12)` }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(8,145,178,0.18)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}
    >
      <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', transition: 'all 0.3s' }}>
        <Icon style={{ width: '20px', height: '20px', color }} />
      </div>
      <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, color: '#E0F7FF', fontSize: '15px', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'rgba(103,232,249,0.45)', fontSize: '13px', lineHeight: 1.7 }}>{desc}</p>
    </div>
  )
}

export default function Landing() {
  const [visible, setVisible] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef()

  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const handle = (e) => {
      const rect = hero.getBoundingClientRect()
      setMousePos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height })
    }
    hero.addEventListener('mousemove', handle)
    return () => hero.removeEventListener('mousemove', handle)
  }, [])

  const particles = [
    { size: 4, top: '15%', left: '8%',  color: '#22D3EE', opacity: 0.5, dur: '6s', delay: '0s' },
    { size: 6, top: '25%', left: '92%', color: '#67E8F9', opacity: 0.4, dur: '8s', delay: '1s' },
    { size: 3, top: '60%', left: '5%',  color: '#34D399', opacity: 0.4, dur: '7s', delay: '2s' },
    { size: 5, top: '70%', left: '88%', color: '#22D3EE', opacity: 0.35,dur: '9s', delay: '0.5s'},
    { size: 4, top: '40%', left: '95%', color: '#A5F3FC', opacity: 0.3, dur: '6s', delay: '3s' },
    { size: 7, top: '80%', left: '12%', color: '#67E8F9', opacity: 0.25,dur: '10s',delay: '1.5s'},
    { size: 3, top: '10%', left: '50%', color: '#34D399', opacity: 0.3, dur: '7s', delay: '2.5s'},
    { size: 5, top: '50%', left: '3%',  color: '#22D3EE', opacity: 0.2, dur: '8s', delay: '4s' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#020617', overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        @keyframes float {
          0%,100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(-18px) scale(1.08); }
        }
        @keyframes float2 {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          33%      { transform: translateY(-12px) rotate(120deg); }
          66%      { transform: translateY(6px) rotate(240deg); }
        }
        @keyframes glow-pulse {
          0%,100% { box-shadow: 0 0 20px rgba(34,211,238,0.3), 0 0 40px rgba(34,211,238,0.1); }
          50%      { box-shadow: 0 0 40px rgba(34,211,238,0.6), 0 0 80px rgba(34,211,238,0.2); }
        }
        @keyframes badge-shine {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(140px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(140px) rotate(-360deg); }
        }
        @keyframes orbit2 {
          from { transform: rotate(180deg) translateX(100px) rotate(-180deg); }
          to   { transform: rotate(540deg) translateX(100px) rotate(-540deg); }
        }
        @keyframes counter-in {
          from { opacity:0; transform: translateY(12px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes border-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .hero-btn-primary {
          background: linear-gradient(135deg, #0C7B96, #0891B2, #06B6D4);
          background-size: 200%;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .hero-btn-primary::after {
          content: '';
          position: absolute;
          top: -50%; left: -60%;
          width: 40%; height: 200%;
          background: rgba(255,255,255,0.15);
          transform: skewX(-20deg);
          animation: shimmer 3s ease-in-out infinite;
        }
        .hero-btn-primary:hover {
          background-position: right;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(8,145,178,0.55);
        }
        .hero-btn-secondary {
          background: rgba(8,145,178,0.08);
          border: 1.5px solid rgba(34,211,238,0.25);
          transition: all 0.3s ease;
        }
        .hero-btn-secondary:hover {
          background: rgba(8,145,178,0.16);
          border-color: rgba(34,211,238,0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(34,211,238,0.12);
        }
        .stat-card {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .stat-card::before {
          content:'';
          position: absolute;
          top:-50%; left:-50%;
          width: 200%; height: 200%;
          background: conic-gradient(from 0deg, transparent 0deg, rgba(34,211,238,0.08) 60deg, transparent 120deg);
          animation: border-spin 6s linear infinite;
        }
        .stat-card:hover { transform: translateY(-4px) scale(1.02); }
        .nav-link-hover {
          transition: all 0.2s;
        }
        .nav-link-hover:hover {
          color: white !important;
          background: rgba(255,255,255,0.06) !important;
        }
        .feature-icon-wrap {
          transition: all 0.3s ease;
        }
      `}</style>

      {/* ── Navbar ── */}
      <header style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(8,145,178,0.18)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg,#0C7B96,#0891B2)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(8,145,178,0.5)', animation: 'glow-pulse 3s ease-in-out infinite' }}>
              <Activity style={{ width: '17px', height: '17px', color: '#67E8F9' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: '18px', letterSpacing: '-0.03em', color: '#E0F7FF' }}>Medi<span style={{ color: '#22D3EE' }}>Intake</span></div>
              <div style={{ fontSize: '9px', color: 'rgba(103,232,249,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1 }}>Healthcare System</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/login" className="nav-link-hover" style={{ color: 'rgba(165,243,252,0.6)', padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(8,145,178,0.2)' }}>Sign In</Link>
            <Link to="/register" className="hero-btn-primary" style={{ color: 'white', padding: '9px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(8,145,178,0.45)' }}>Get Started →</Link>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>

        {/* ── Hero ── */}
        <section ref={heroRef} style={{ position: 'relative', minHeight: '94vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 0%, rgba(8,145,178,0.18) 0%, transparent 65%)' }}>

          {/* Animated particles */}
          {particles.map((p, i) => (
            <div key={i} style={{
              position: 'absolute', width: p.size, height: p.size, borderRadius: '50%',
              background: p.color, opacity: p.opacity, top: p.top, left: p.left,
              animation: `float ${p.dur} ease-in-out infinite`, animationDelay: p.delay,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              pointerEvents: 'none',
            }} />
          ))}

          {/* Mouse-following glow */}
          <div style={{
            position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(8,145,178,0.08) 0%, transparent 70%)',
            left: `${mousePos.x * 100}%`, top: `${mousePos.y * 100}%`,
            transform: 'translate(-50%,-50%)', transition: 'left 0.8s ease, top 0.8s ease',
          }} />

          {/* Orbiting rings */}
          <div style={{ position: 'absolute', right: '8%', top: '50%', transform: 'translateY(-50%)', width: '320px', height: '320px', opacity: 0.12 }}>
            <div style={{ position: 'absolute', inset: 0, border: '1px solid #22D3EE', borderRadius: '50%', animation: 'border-spin 12s linear infinite' }} />
            <div style={{ position: 'absolute', inset: '20px', border: '1px dashed rgba(34,211,238,0.5)', borderRadius: '50%', animation: 'border-spin 20s linear infinite reverse' }} />
            <div style={{ position: 'absolute', inset: '50px', border: '1px solid rgba(34,211,238,0.3)', borderRadius: '50%', animation: 'border-spin 8s linear infinite' }} />
          </div>

          {/* Orbit dots */}
          <div style={{ position: 'absolute', right: 'calc(8% + 160px)', top: '50%', marginTop: '-160px', width: '320px', height: '320px', pointerEvents: 'none', opacity: 0.5 }}>
            {[
              { color: '#22D3EE', size: 8, dur: '8s', orbit: 140 },
              { color: '#34D399', size: 6, dur: '12s', orbit: 100 },
              { color: '#F87171', size: 5, dur: '6s', orbit: 60 },
            ].map((d, i) => (
              <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: `${d.orbit * 2}px`, height: `${d.orbit * 2}px`, marginLeft: `-${d.orbit}px`, marginTop: `-${d.orbit}px`, borderRadius: '50%' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', marginLeft: `-${d.size/2}px`, marginTop: `-${d.size/2}px`, width: d.size, height: d.size, borderRadius: '50%', background: d.color, boxShadow: `0 0 10px ${d.color}`, animation: `border-spin ${d.dur} linear infinite` }} />
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', width: '100%', position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: '680px' }}>

              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '28px',
                padding: '7px 18px', borderRadius: '30px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em',
                background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(34,211,238,0.3)', color: '#67E8F9',
                opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-12px)',
                transition: 'all 0.6s ease 0.1s',
                backgroundImage: 'linear-gradient(90deg, rgba(34,211,238,0) 0%, rgba(34,211,238,0.08) 50%, rgba(34,211,238,0) 100%)',
                backgroundSize: '200%',
                animation: visible ? 'badge-shine 3s linear infinite' : 'none',
              }}>
                <Zap style={{ width: '12px', height: '12px' }} />
                RULE-BASED EMERGENCY RISK SCORING ENGINE
              </div>

              {/* Headline */}
              <h1 style={{
                fontFamily: 'Outfit,sans-serif', fontWeight: 900, lineHeight: 1.05,
                letterSpacing: '-0.04em', fontSize: 'clamp(40px,6vw,72px)',
                color: '#E0F7FF', marginBottom: '20px',
                opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.7s ease 0.2s',
              }}>
                Digital Healthcare<br />
                <span style={{ background: 'linear-gradient(135deg, #67E8F9 0%, #22D3EE 40%, #0891B2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Intake & Triage
                </span>
              </h1>

              {/* ECG line */}
              <div style={{ maxWidth: '440px', marginBottom: '20px', opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.5s' }}>
                <ECGLine />
              </div>

              {/* Subtitle */}
              <p style={{
                color: 'rgba(165,243,252,0.55)', fontSize: '17px', lineHeight: 1.75,
                maxWidth: '540px', marginBottom: '36px',
                opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
                transition: 'all 0.7s ease 0.35s',
              }}>
                Digitise patient registration, capture structured medical history, and automatically
                prioritise emergencies with a fully transparent scoring engine.
              </p>

              {/* CTA buttons */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '64px',
                opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
                transition: 'all 0.7s ease 0.45s',
              }}>
                <Link to="/register" className="hero-btn-primary" style={{ color: 'white', padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 6px 24px rgba(8,145,178,0.45)' }}>
                  Register as Patient <ArrowRight style={{ width: '16px', height: '16px' }} />
                </Link>
                <Link to="/login?role=admin" className="hero-btn-secondary" style={{ color: '#A5F3FC', padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Hospital Staff Portal
                </Link>
              </div>

              {/* Stats */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', maxWidth: '480px',
                opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.7s ease 0.55s',
              }}>
                {[
                  { value: 18, suffix: '+', label: 'Symptoms Tracked' },
                  { value: 100, suffix: '%', label: 'Transparent Rules' },
                  { value: 12, suffix: '+', label: 'Patient Features' },
                ].map(({ value, suffix, label }) => (
                  <div key={label} className="stat-card" style={{ background: 'rgba(2,26,60,0.6)', border: '1px solid rgba(34,211,238,0.18)', borderRadius: '16px', padding: '18px 12px', textAlign: 'center', backdropFilter: 'blur(8px)' }}>
                    <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: '30px', fontWeight: 900, color: '#22D3EE', lineHeight: 1, letterSpacing: '-0.03em', animation: 'counter-in 0.5s ease-out both' }}>
                      <CountUp end={value} suffix={suffix} />
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(103,232,249,0.4)', marginTop: '5px', fontWeight: 600, letterSpacing: '0.03em' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom fade */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(to bottom, transparent, #020617)', pointerEvents: 'none' }} />
        </section>

        {/* ── Features ── */}
        <section style={{ background: '#020617', padding: '80px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(34,211,238,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>Everything you need</div>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, color: '#E0F7FF', letterSpacing: '-0.03em' }}>
                Built for real healthcare workflows
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '16px' }}>
              {[
                { icon: Clock,    title: 'Fast Digital Registration',   desc: 'One-time medical profile — no repeated form filling during emergencies.', color: '#22D3EE', delay: 0 },
                { icon: Shield,   title: 'Transparent Risk Scoring',    desc: 'Every risk level backed by explicit rules. Fully auditable by doctors.', color: '#34D399', delay: 80 },
                { icon: Activity, title: 'Structured Triage Dashboard', desc: 'Hospital staff see all submissions sorted by risk. High-risk first.', color: '#A78BFA', delay: 160 },
                { icon: MapPin,   title: 'Hospitals & Pharmacy Finder', desc: 'GPS-based finder with live map, directions and opening hours.', color: '#F87171', delay: 240 },
                { icon: Bell,     title: 'Real-Time Notifications',     desc: 'Patients notified when intakes are reviewed and appointments confirmed.', color: '#FCD34D', delay: 320 },
                { icon: Heart,    title: 'Health Score Card',           desc: 'Overall health score with animated ring chart and trend tracking.', color: '#FB7185', delay: 400 },
                { icon: Syringe,  title: 'Vaccination Records',         desc: 'Track immunisation history with overdue and upcoming dose alerts.', color: '#6EE7B7', delay: 480 },
                { icon: Zap,      title: 'Emergency Quick-View',        desc: 'One-click critical info — blood group, allergies, emergency contact.', color: '#22D3EE', delay: 560 },
              ].map(props => <FeatureCard key={props.title} {...props} />)}
            </div>
          </div>
        </section>

        {/* ── Risk scoring ── */}
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(2,26,60,0.9) 0%, rgba(2,12,35,0.95) 100%)', border: '1.5px solid rgba(8,145,178,0.2)', borderRadius: '24px', padding: '48px', position: 'relative', overflow: 'hidden' }}>
              {/* Decorative glow */}
              <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', background: 'rgba(34,211,238,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '180px', height: '180px', background: 'rgba(52,211,153,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '28px', fontWeight: 900, color: '#E0F7FF', textAlign: 'center', marginBottom: '32px', letterSpacing: '-0.03em' }}>How Risk Scoring Works</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '20px' }}>
                {[
                  { level: 'LOW RISK', range: '0–30 pts', accent: '#34D399', bg: 'rgba(52,211,153,0.07)', border: 'rgba(52,211,153,0.22)', items: ['Minor symptoms','Normal vitals','No chronic conditions','Younger age'] },
                  { level: 'MEDIUM RISK', range: '31–60 pts', accent: '#22D3EE', bg: 'rgba(34,211,238,0.07)', border: 'rgba(34,211,238,0.22)', items: ['Moderate symptoms','Slightly abnormal vitals','Existing conditions','Age factor'] },
                  { level: 'HIGH RISK', range: '61+ pts', accent: '#F87171', bg: 'rgba(248,113,113,0.07)', border: 'rgba(248,113,113,0.22)', items: ['Chest pain / breathlessness','Critical vitals','Multiple conditions','Loss of consciousness'] },
                ].map(({ level, range, accent, bg, border, items }) => (
                  <div key={level} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: '16px', padding: '22px', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, color: accent, fontSize: '13px', letterSpacing: '0.04em' }}>{level}</span>
                      <span style={{ fontSize: '11px', color: accent, background: `${accent}15`, padding: '3px 10px', borderRadius: '8px', fontWeight: 800, border: `1px solid ${accent}25` }}>{range}</span>
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {items.map(item => (
                        <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(165,243,252,0.55)' }}>
                          <CheckCircle2 style={{ width: '14px', height: '14px', color: accent, flexShrink: 0 }} />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: '0 24px 100px', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '32px', fontWeight: 900, color: '#E0F7FF', marginBottom: '14px', letterSpacing: '-0.03em' }}>Ready to get started?</h2>
            <p style={{ color: 'rgba(103,232,249,0.45)', fontSize: '15px', marginBottom: '32px' }}>Join patients and hospitals already using MediIntake for faster, smarter healthcare.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="hero-btn-primary" style={{ color: 'white', padding: '14px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 6px 24px rgba(8,145,178,0.45)' }}>
                Register as Patient <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
              <Link to="/login?role=admin" className="hero-btn-secondary" style={{ color: '#A5F3FC', padding: '14px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Hospital Staff Portal
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ background: 'rgba(2,6,23,0.95)', borderTop: '1px solid rgba(8,145,178,0.15)', padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity style={{ width: '16px', height: '16px', color: '#22D3EE' }} />
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, color: 'rgba(165,243,252,0.5)', fontSize: '14px' }}>MediIntake</span>
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(8,145,178,0.35)' }}>Digital Healthcare Intake System — For demonstration purposes only.</p>
        </div>
      </footer>
    </div>
  )
}
