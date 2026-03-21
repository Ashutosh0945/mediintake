import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Activity, Eye, EyeOff, User, Stethoscope } from 'lucide-react'
import { InlineSpinner } from '../../components/LoadingSpinner'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultRole = searchParams.get('role') === 'admin' ? 'admin' : 'patient'
  const [role, setRole] = useState(defaultRole)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (err) { setError(err.message); setLoading(false); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    if (profile?.role !== role) {
      await supabase.auth.signOut()
      setError(role === 'admin' ? 'This account is not registered as hospital staff.' : 'This account is a hospital staff account.')
      setLoading(false); return
    }
    navigate(profile.role === 'admin' ? '/admin' : '/dashboard')
  }

  const isAdmin = role === 'admin'

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#EEF2F7' }}>
      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 justify-center mb-8">
          <div style={{ background: 'linear-gradient(135deg, #0B2447, #19376D)', borderRadius: '14px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(11,36,71,0.3)' }}>
            <Activity className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, color: '#0B2447', fontSize: '20px', letterSpacing: '-0.02em' }}>
              Medi<span style={{ color: '#1565C0' }}>Intake</span>
            </div>
            <div style={{ fontSize: '10px', color: '#8FA3C0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Healthcare System</div>
          </div>
        </Link>

        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {[
            { r: 'patient', label: 'Patient',        Icon: User,         color: '#1565C0', bg: '#E3F2FD', border: '#90CAF9' },
            { r: 'admin',   label: 'Hospital Staff',  Icon: Stethoscope,  color: '#7B1FA2', bg: '#F3E5F5', border: '#CE93D8' },
          ].map(({ r, label, Icon, color, bg, border }) => (
            <button key={r} type="button" onClick={() => { setRole(r); setError('') }}
              style={{ padding: '16px 12px', borderRadius: '14px', border: `2px solid ${role === r ? border : '#C5D3E8'}`, background: role === r ? bg : 'white', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: role === r ? `0 4px 16px ${color}20` : '0 1px 4px rgba(11,36,71,0.06)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: role === r ? `${color}18` : '#F7F9FC', border: `1px solid ${role === r ? `${color}30` : '#E2EAF4'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon style={{ width: '18px', height: '18px', color: role === r ? color : '#8FA3C0' }} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: role === r ? color : '#8FA3C0' }}>{label}</span>
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="card p-8">
          <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: '20px', color: '#0B2447', marginBottom: '4px' }}>
            {isAdmin ? 'Hospital Staff Sign In' : 'Patient Sign In'}
          </h1>
          <p style={{ fontSize: '13px', color: '#8FA3C0', marginBottom: '24px' }}>
            {isAdmin ? 'Access the hospital triage dashboard' : 'Manage your health intake records'}
          </p>

          {error && (
            <div style={{ background: '#FFEBEE', border: '1px solid #EF9A9A', color: '#C62828', fontSize: '13px', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input className="input pr-10" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8FA3C0', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" style={{ padding: '12px', marginTop: '8px' }} disabled={loading}>
              {loading ? <><InlineSpinner /> Signing in…</> : `Sign In as ${isAdmin ? 'Hospital Staff' : 'Patient'}`}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#8FA3C0', marginTop: '20px' }}>
            Don't have an account?{' '}
            <Link to={`/register?role=${role}`} style={{ color: isAdmin ? '#7B1FA2' : '#1565C0', fontWeight: 700 }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
