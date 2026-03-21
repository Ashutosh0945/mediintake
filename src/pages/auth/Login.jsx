import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Activity, Eye, EyeOff, User, Stethoscope } from 'lucide-react'
import { InlineSpinner } from '../../components/LoadingSpinner'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [role, setRole] = useState(searchParams.get('role') === 'admin' ? 'admin' : 'patient')
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (err) { setError(err.message); setLoading(false); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    if (profile?.role !== role) {
      await supabase.auth.signOut()
      setError(role === 'admin' ? 'This account is not registered as hospital staff.' : 'This is a hospital staff account.')
      setLoading(false); return
    }
    navigate(profile.role === 'admin' ? '/admin' : '/dashboard')
  }

  const isAdmin = role === 'admin'
  const accent = isAdmin ? '#A78BFA' : '#22D3EE'
  const accentBg = isAdmin ? 'rgba(167,139,250,0.1)' : 'rgba(34,211,238,0.1)'
  const accentBorder = isAdmin ? 'rgba(167,139,250,0.3)' : 'rgba(34,211,238,0.28)'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: '#020617', backgroundImage: 'radial-gradient(ellipse at 30% 30%, rgba(8,145,178,0.14) 0%, transparent 55%)' }}>
      <div className="w-full max-w-md animate-slide-up">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '28px', textDecoration: 'none' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg,#0E7490,#0891B2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(8,145,178,0.55)' }}>
            <Activity style={{ width: '18px', height: '18px', color: '#67E8F9' }} />
          </div>
          <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: '20px', letterSpacing: '-0.03em', color: '#E0F7FF' }}>
            Medi<span style={{ color: '#22D3EE' }}>Intake</span>
          </div>
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {[
            { r: 'patient', label: 'Patient',       Icon: User,        col: '#22D3EE', bg: 'rgba(34,211,238,0.08)',  border: 'rgba(34,211,238,0.28)' },
            { r: 'admin',   label: 'Hospital Staff', Icon: Stethoscope, col: '#A78BFA', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.3)' },
          ].map(({ r, label, Icon, col, bg, border }) => (
            <button key={r} type="button" onClick={() => { setRole(r); setError('') }}
              style={{ padding: '14px 10px', borderRadius: '14px', border: `2px solid ${role === r ? border : 'rgba(8,145,178,0.15)'}`, background: role === r ? bg : 'rgba(2,15,40,0.6)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', boxShadow: role === r ? `0 4px 16px ${col}20` : 'none' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: role === r ? `${col}15` : 'rgba(8,145,178,0.08)', border: `1px solid ${role === r ? border : 'rgba(8,145,178,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon style={{ width: '17px', height: '17px', color: role === r ? col : 'rgba(34,211,238,0.3)' }} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: role === r ? col : 'rgba(34,211,238,0.3)' }}>{label}</span>
            </button>
          ))}
        </div>

        <div style={{ background: 'rgba(2,26,60,0.9)', border: `1.5px solid ${accentBorder}`, borderRadius: '20px', padding: '28px', backdropFilter: 'blur(14px)', boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${accentBg}` }}>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: '20px', color: '#E0F7FF', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            {isAdmin ? 'Hospital Staff Sign In' : 'Patient Sign In'}
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(103,232,249,0.4)', marginBottom: '22px' }}>
            {isAdmin ? 'Access the hospital triage dashboard' : 'Manage your health intake records'}
          </p>

          {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#FCA5A5', fontSize: '13px', padding: '12px 16px', borderRadius: '10px', marginBottom: '18px' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" style={{ paddingRight: '42px' }} type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(103,232,249,0.4)', display: 'flex' }}>
                  {showPass ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" style={{ padding: '13px', marginTop: '4px' }} disabled={loading}>
              {loading ? <><InlineSpinner /> Signing in…</> : `Sign In as ${isAdmin ? 'Hospital Staff' : 'Patient'}`}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(34,211,238,0.35)', marginTop: '18px' }}>
            Don't have an account?{' '}
            <Link to={`/register?role=${role}`} style={{ color: accent, fontWeight: 800, textDecoration: 'none' }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
