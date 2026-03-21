import { Link } from 'react-router-dom'
import { Activity, Shield, Clock, Users, ArrowRight, CheckCircle2, Zap, Heart, MapPin, Bell, Syringe } from 'lucide-react'
import { useEffect, useState } from 'react'

function CountUp({ end, duration = 2000 }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let s = 0; const step = end / (duration / 16)
    const t = setInterval(() => { s += step; if (s >= end) { setCount(end); clearInterval(t) } else setCount(Math.floor(s)) }, 16)
    return () => clearInterval(t)
  }, [end])
  return <span>{count}</span>
}

export default function Landing() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const cyan = '#22D3EE'; const cyanDim = 'rgba(34,211,238,0.12)'; const cyanBorder = 'rgba(34,211,238,0.25)'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#020617', backgroundImage: 'radial-gradient(ellipse at 20% 0%, rgba(8,145,178,0.14) 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(6,182,212,0.08) 0%, transparent 55%)' }}>

      <header style={{ background: 'rgba(2,6,23,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(8,145,178,0.22)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#0E7490,#0891B2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(8,145,178,0.5)' }}>
              <Activity style={{ width: '16px', height: '16px', color: '#67E8F9' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: '17px', letterSpacing: '-0.03em', color: '#E0F7FF' }}>Medi<span style={{ color: cyan }}>Intake</span></div>
              <div style={{ fontSize: '9px', color: 'rgba(103,232,249,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Healthcare System</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" style={{ background: cyanDim, border: `1px solid ${cyanBorder}`, color: '#A5F3FC', padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
            <Link to="/register" style={{ background: 'linear-gradient(135deg,#0E7490,#0891B2)', color: 'white', padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(8,145,178,0.5)' }}>Get Started</Link>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {/* Hero */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '700px', height: '350px', background: 'rgba(8,145,178,0.07)', borderRadius: '50%', filter: 'blur(70px)', pointerEvents: 'none' }} />
          <div className={`relative transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: cyanDim, border: `1px solid ${cyanBorder}`, color: '#67E8F9', fontSize: '12px', fontWeight: 700, padding: '6px 16px', borderRadius: '20px', marginBottom: '28px', letterSpacing: '0.05em' }}>
              <Zap style={{ width: '12px', height: '12px' }} /> RULE-BASED EMERGENCY RISK SCORING
            </div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(36px,6vw,68px)', fontWeight: 900, color: '#E0F7FF', lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '20px' }}>
              Digital Healthcare<br />
              <span style={{ background: 'linear-gradient(135deg,#67E8F9,#22D3EE,#0891B2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Intake & Triage</span>
            </h1>
            <p style={{ color: 'rgba(165,243,252,0.5)', fontSize: '17px', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 36px' }}>
              Digitise patient registration, capture structured medical history, and automatically prioritise emergencies with a transparent rule-based engine.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
              <Link to="/register" style={{ background: 'linear-gradient(135deg,#0E7490,#0891B2)', color: 'white', padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 6px 20px rgba(8,145,178,0.5)' }}>
                Register as Patient <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
              <Link to="/login?role=admin" style={{ background: cyanDim, border: `1.5px solid ${cyanBorder}`, color: '#A5F3FC', padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Hospital Staff Portal
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', maxWidth: '440px', margin: '0 auto' }}>
              {[{ value: 18, suffix: '+', label: 'Symptoms Tracked' }, { value: 100, suffix: '%', label: 'Transparent Scoring' }, { value: 12, suffix: '+', label: 'Patient Features' }].map(({ value, suffix, label }) => (
                <div key={label} style={{ background: cyanDim, border: `1px solid ${cyanBorder}`, borderRadius: '14px', padding: '16px 8px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: '28px', fontWeight: 900, color: cyan, lineHeight: 1 }}><CountUp end={value} />{suffix}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(103,232,249,0.4)', marginTop: '4px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 60px' }}>
          <p style={{ textAlign: 'center', fontSize: '11px', fontWeight: 800, color: 'rgba(34,211,238,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Everything you need</p>
          <h2 style={{ textAlign: 'center', fontFamily: 'Outfit,sans-serif', fontSize: '26px', fontWeight: 900, color: '#E0F7FF', letterSpacing: '-0.03em', marginBottom: '28px' }}>Built for real healthcare workflows</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '14px' }}>
            {[
              { icon: Clock,   title: 'Fast Digital Registration',   desc: 'One-time medical profile — no repeated form filling.', color: '#22D3EE' },
              { icon: Shield,  title: 'Transparent Risk Scoring',    desc: 'Every decision backed by explicit rules. Fully auditable.', color: '#34D399' },
              { icon: Users,   title: 'Structured Triage Dashboard', desc: 'High-risk patients surface instantly. Sort by priority.', color: '#67E8F9' },
              { icon: MapPin,  title: 'Hospitals Near Me',           desc: 'GPS-based finder with live map and directions.', color: '#F87171' },
              { icon: Bell,    title: 'Real-Time Notifications',     desc: 'Patients notified when intakes are reviewed.', color: '#FCD34D' },
              { icon: Heart,   title: 'Health Score Card',           desc: 'Overall health summary based on your records.', color: '#C084FC' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} style={{ background: 'rgba(2,26,60,0.7)', border: '1.5px solid rgba(8,145,178,0.18)', borderRadius: '16px', padding: '22px', transition: 'all 0.2s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(34,211,238,0.4)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(34,211,238,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(8,145,178,0.18)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${color}14`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <Icon style={{ width: '19px', height: '19px', color }} />
                </div>
                <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, color: '#E0F7FF', fontSize: '15px', marginBottom: '6px' }}>{title}</h3>
                <p style={{ color: 'rgba(103,232,249,0.4)', fontSize: '13px', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Risk levels */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 60px' }}>
          <div style={{ background: 'rgba(2,26,60,0.7)', border: '1.5px solid rgba(8,145,178,0.2)', borderRadius: '20px', padding: '32px' }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '22px', fontWeight: 900, color: '#E0F7FF', textAlign: 'center', marginBottom: '24px', letterSpacing: '-0.03em' }}>How Risk Scoring Works</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px' }}>
              {[
                { level: 'LOW RISK', range: '0–30 pts', accent: '#34D399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.22)', items: ['Minor symptoms','Normal vitals','No chronic conditions','Younger age'] },
                { level: 'MEDIUM RISK', range: '31–60 pts', accent: '#22D3EE', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.22)', items: ['Moderate symptoms','Slightly abnormal vitals','Existing conditions','Age factor'] },
                { level: 'HIGH RISK', range: '61+ pts', accent: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.22)', items: ['Chest pain / breathlessness','Critical vitals','Multiple conditions','Loss of consciousness'] },
              ].map(({ level, range, accent, bg, border, items }) => (
                <div key={level} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: '14px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, color: accent, fontSize: '13px', letterSpacing: '0.04em' }}>{level}</span>
                    <span style={{ fontSize: '10px', color: accent, background: `${accent}18`, padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>{range}</span>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {items.map(item => (
                      <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(165,243,252,0.5)' }}>
                        <CheckCircle2 style={{ width: '13px', height: '13px', color: accent, flexShrink: 0 }} />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer style={{ background: 'rgba(2,6,23,0.9)', borderTop: '1px solid rgba(8,145,178,0.18)', padding: '20px 0' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity style={{ width: '16px', height: '16px', color: '#22D3EE' }} />
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, color: 'rgba(165,243,252,0.5)', fontSize: '13px' }}>MediIntake</span>
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(8,145,178,0.3)' }}>Digital Healthcare Intake System — For demonstration purposes only.</p>
        </div>
      </footer>
    </div>
  )
}
