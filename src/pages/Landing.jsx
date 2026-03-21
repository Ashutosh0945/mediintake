import { Link } from 'react-router-dom'
import { Activity, Shield, Clock, Users, ArrowRight, CheckCircle2, Zap } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-500/20 border border-teal-500/40 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-teal-400" />
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">
              Medi<span className="text-teal-400">Intake</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-500/5 rounded-full blur-3xl" />
          </div>

          <div className="relative text-center max-w-4xl mx-auto animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/25 text-teal-400 text-sm font-medium px-4 py-2 rounded-full mb-8">
              <Zap className="w-3.5 h-3.5" />
              Rule-Based Emergency Risk Scoring
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6">
              Smarter Hospital
              <br />
              <span className="text-teal-400">Patient Intake</span>
            </h1>
            <p className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
              Digitise patient registration, collect structured medical history, and automatically
              prioritise emergencies — all with a fully transparent, rule-based scoring engine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary flex items-center justify-center gap-2 text-base py-3 px-7">
                Register as Patient
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="btn-secondary flex items-center justify-center gap-2 text-base py-3 px-7">
                Hospital Staff Login
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
            {[
              {
                icon: Clock,
                title: 'Fast Digital Registration',
                desc: 'One-time medical profile so critical info is always available — no repeated form filling during emergencies.',
                color: 'teal',
              },
              {
                icon: Shield,
                title: 'Transparent Risk Scoring',
                desc: 'Every risk level is backed by explicit rules and point weights — no black-box ML. Fully auditable decisions.',
                color: 'blue',
              },
              {
                icon: Users,
                title: 'Structured Triage Dashboard',
                desc: 'Hospital staff see all submissions sorted by risk level. High-risk patients surface immediately with a one-click emergency view.',
                color: 'violet',
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card-hover p-6">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                  color === 'teal' ? 'bg-teal-500/15 border border-teal-500/25' :
                  color === 'blue' ? 'bg-blue-500/15 border border-blue-500/25' :
                  'bg-violet-500/15 border border-violet-500/25'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    color === 'teal' ? 'text-teal-400' :
                    color === 'blue' ? 'text-blue-400' : 'text-violet-400'
                  }`} />
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Risk levels explanation */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="card p-8">
            <h2 className="font-display text-2xl font-bold text-white mb-6 text-center">
              How Risk Scoring Works
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { level: 'LOW', range: '0–30 pts', color: 'emerald', items: ['Minor symptoms', 'Normal vitals', 'No chronic conditions', 'Younger age'] },
                { level: 'MEDIUM', range: '31–60 pts', color: 'amber', items: ['Moderate symptoms', 'Slightly abnormal vitals', 'Existing chronic conditions', 'Age factor'] },
                { level: 'HIGH', range: '61+ pts', color: 'red', items: ['Chest pain / breathlessness', 'Critical vitals', 'Multiple conditions', 'Loss of consciousness'] },
              ].map(({ level, range, color, items }) => (
                <div key={level} className={`p-5 rounded-xl border ${
                  color === 'emerald' ? 'bg-emerald-500/5 border-emerald-500/20' :
                  color === 'amber' ? 'bg-amber-500/5 border-amber-500/20' :
                  'bg-red-500/5 border-red-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-display font-bold text-lg ${
                      color === 'emerald' ? 'text-emerald-400' :
                      color === 'amber' ? 'text-amber-400' : 'text-red-400'
                    }`}>{level} RISK</span>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md">{range}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
                        <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${
                          color === 'emerald' ? 'text-emerald-500' :
                          color === 'amber' ? 'text-amber-500' : 'text-red-500'
                        }`} />
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

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            <span className="font-display font-semibold text-slate-300 text-sm">MediIntake</span>
          </div>
          <p className="text-slate-600 text-xs">Digital Healthcare Intake System — For demonstration purposes only.</p>
        </div>
      </footer>
    </div>
  )
}
