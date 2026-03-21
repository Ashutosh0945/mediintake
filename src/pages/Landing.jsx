import { Link } from 'react-router-dom'
import { Activity, Shield, Clock, Users, ArrowRight, CheckCircle2, Zap, Heart, MapPin, Bell, Syringe, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'

function ECGLine() {
  return (
    <svg viewBox="0 0 300 60" className="w-full opacity-20" style={{ height: '40px' }}>
      <polyline
        fill="none"
        stroke="#64B5F6"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ecg-line"
        points="0,30 20,30 30,30 35,10 40,50 45,30 55,30 60,30 65,20 70,40 75,30 100,30 105,5 110,55 115,30 120,30 160,30 165,15 170,45 175,30 200,30 205,8 210,52 215,30 240,30 245,18 250,42 255,30 300,30"
      />
    </svg>
  )
}

function CountUp({ end, duration = 2000 }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [end])
  return <span>{count}</span>
}

export default function Landing() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#EEF2F7' }}>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #0B2447 0%, #19376D 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ background: 'rgba(30,136,229,0.2)', border: '1px solid rgba(30,136,229,0.4)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity className="w-4 h-4 text-blue-300" />
            </div>
            <div>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, color: 'white', fontSize: '16px', letterSpacing: '-0.02em' }}>
                Medi<span style={{ color: '#64B5F6' }}>Intake</span>
              </div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Healthcare System</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}>
              Sign In
            </Link>
            <Link to="/register" style={{ background: 'linear-gradient(135deg, #1565C0, #1E88E5)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 2px 8px rgba(21,101,192,0.4)' }}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section style={{ background: 'linear-gradient(180deg, #0B2447 0%, #19376D 60%, #EEF2F7 100%)', paddingTop: '80px', paddingBottom: '60px', position: 'relative', overflow: 'hidden' }}>
          {/* Background circles */}
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', background: 'rgba(30,136,229,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '60px', left: '-80px', width: '300px', height: '300px', background: 'rgba(0,137,123,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />

          <div className={`relative max-w-5xl mx-auto px-6 text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

            {/* Pill badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(30,136,229,0.15)', border: '1px solid rgba(30,136,229,0.3)', color: '#90CAF9', fontSize: '12px', fontWeight: 600, padding: '6px 16px', borderRadius: '20px', marginBottom: '32px', letterSpacing: '0.04em' }}>
              <Zap style={{ width: '12px', height: '12px' }} />
              RULE-BASED EMERGENCY RISK SCORING
            </div>

            <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '20px' }}>
              Digital Healthcare
              <br />
              <span style={{ color: '#64B5F6' }}>Intake & Triage</span>
            </h1>

            {/* ECG line */}
            <div className="max-w-md mx-auto mb-6">
              <ECGLine />
            </div>

            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '17px', lineHeight: 1.7, maxWidth: '580px', margin: '0 auto 36px' }}>
              Digitise patient registration, capture structured medical history, and automatically
              prioritise emergencies with a transparent, explainable risk engine.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
              <Link to="/register" style={{ background: 'linear-gradient(135deg, #1565C0, #1E88E5)', color: 'white', padding: '14px 28px', borderRadius: '10px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(21,101,192,0.4)' }}>
                Register as Patient <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
              <Link to="/login?role=admin" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '14px 28px', borderRadius: '10px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Hospital Staff Portal
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '480px', margin: '0 auto' }}>
              {[
                { value: 18, suffix: '+', label: 'Symptoms Tracked' },
                { value: 100, suffix: '%', label: 'Transparent Scoring' },
                { value: 12, suffix: '+', label: 'Patient Features' },
              ].map(({ value, suffix, label }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px 8px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '28px', fontWeight: 800, color: '#64B5F6', lineHeight: 1 }}>
                    <CountUp end={value} />{suffix}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '4px', letterSpacing: '0.03em' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#1565C0', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Everything you need</p>
            <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '28px', fontWeight: 800, color: '#0B2447', letterSpacing: '-0.02em' }}>Built for real healthcare workflows</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Clock,    title: 'Fast Digital Registration',   desc: 'One-time medical profile — no repeated form filling during emergencies.', accent: '#1565C0' },
              { icon: Shield,   title: 'Transparent Risk Scoring',    desc: 'Every risk level backed by explicit rules and point weights. Fully auditable.', accent: '#00897B' },
              { icon: Users,    title: 'Structured Triage Dashboard', desc: 'Hospital staff see all submissions sorted by risk. High-risk patients surface first.', accent: '#7B1FA2' },
              { icon: MapPin,   title: 'Hospitals Near Me',           desc: 'GPS-based hospital finder with live map, directions, and emergency indicators.', accent: '#C62828' },
              { icon: Bell,     title: 'Real-Time Notifications',     desc: 'Patients notified when intakes are reviewed and appointments confirmed.', accent: '#E65100' },
              { icon: Heart,    title: 'Health Score Card',           desc: 'Overall health summary score based on intakes, conditions, and vaccinations.', accent: '#1B5E20' },
              { icon: Syringe,  title: 'Vaccination Records',         desc: 'Track immunization history with overdue and upcoming dose reminders.', accent: '#4527A0' },
              { icon: FileText, title: 'Print Patient Summary',       desc: 'Full printable report for any patient with medical history and intake records.', accent: '#006064' },
              { icon: Zap,      title: 'Emergency Quick-View',        desc: 'One-click critical info view: blood group, allergies, medications, emergency contact.', accent: '#BF360C' },
            ].map(({ icon: Icon, title, desc, accent }) => (
              <div key={title} className="card-hover p-6">
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${accent}14`, border: `1px solid ${accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <Icon style={{ width: '19px', height: '19px', color: accent }} />
                </div>
                <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, color: '#0B2447', fontSize: '15px', marginBottom: '6px' }}>{title}</h3>
                <p style={{ color: '#4A6080', fontSize: '13px', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Risk levels */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="card p-8 card-ecg">
            <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '22px', fontWeight: 800, color: '#0B2447', textAlign: 'center', marginBottom: '24px', letterSpacing: '-0.02em' }}>
              How Risk Scoring Works
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { level: 'LOW RISK', range: '0–30 pts', bg: '#E8F5E9', border: '#A5D6A7', accent: '#2E7D32', items: ['Minor symptoms', 'Normal vitals', 'No chronic conditions', 'Younger age'] },
                { level: 'MEDIUM RISK', range: '31–60 pts', bg: '#FFF3E0', border: '#FFCC80', accent: '#E65100', items: ['Moderate symptoms', 'Slightly abnormal vitals', 'Existing conditions', 'Age factor'] },
                { level: 'HIGH RISK', range: '61+ pts', bg: '#FFEBEE', border: '#EF9A9A', accent: '#C62828', items: ['Chest pain / breathlessness', 'Critical vitals', 'Multiple conditions', 'Loss of consciousness'] },
              ].map(({ level, range, bg, border, accent, items }) => (
                <div key={level} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '14px', padding: '20px' }}>
                  <div className="flex items-center justify-between mb-4">
                    <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, color: accent, fontSize: '14px', letterSpacing: '0.04em' }}>{level}</span>
                    <span style={{ fontSize: '11px', color: accent, background: `${accent}18`, padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>{range}</span>
                  </div>
                  <ul className="space-y-2">
                    {items.map(item => (
                      <li key={item} className="flex items-center gap-2" style={{ fontSize: '13px', color: '#4A6080' }}>
                        <CheckCircle2 style={{ width: '14px', height: '14px', color: accent, flexShrink: 0 }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer style={{ background: '#0B2447', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '20px 0' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity style={{ width: '16px', height: '16px', color: '#64B5F6' }} />
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>MediIntake</span>
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Digital Healthcare Intake System — For demonstration purposes only.</p>
        </div>
      </footer>
    </div>
  )
}
