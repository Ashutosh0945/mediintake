import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Activity, Eye, EyeOff, User, Stethoscope } from 'lucide-react'
import { InlineSpinner } from '../../components/LoadingSpinner'

export default function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultRole = searchParams.get('role') === 'admin' ? 'admin' : 'patient'

  const [role, setRole] = useState(defaultRole)
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    age: '', gender: '', phone: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const isAdmin = role === 'admin'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)

    const { error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          role,
          age: form.age || null,
          gender: form.gender || null,
          phone: form.phone || null,
        },
      },
    })

    if (authErr) { setError(authErr.message); setLoading(false); return }
    await new Promise(r => setTimeout(r, 800))
    navigate(isAdmin ? '/admin' : '/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">

        <Link to="/" className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 bg-teal-500/20 border border-teal-500/40 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-teal-400" />
          </div>
          <span className="font-display font-bold text-white text-xl tracking-tight">
            Medi<span className="text-teal-400">Intake</span>
          </span>
        </Link>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button type="button" onClick={() => { setRole('patient'); setError('') }}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${!isAdmin ? 'bg-teal-500/15 border-teal-500/40' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!isAdmin ? 'bg-teal-500/20' : 'bg-slate-700'}`}>
              <User className={`w-5 h-5 ${!isAdmin ? 'text-teal-400' : 'text-slate-400'}`} />
            </div>
            <span className={`text-sm font-semibold ${!isAdmin ? 'text-teal-300' : 'text-slate-400'}`}>Patient</span>
          </button>

          <button type="button" onClick={() => { setRole('admin'); setError('') }}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${isAdmin ? 'bg-violet-500/15 border-violet-500/40' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAdmin ? 'bg-violet-500/20' : 'bg-slate-700'}`}>
              <Stethoscope className={`w-5 h-5 ${isAdmin ? 'text-violet-400' : 'text-slate-400'}`} />
            </div>
            <span className={`text-sm font-semibold ${isAdmin ? 'text-violet-300' : 'text-slate-400'}`}>Hospital Staff</span>
          </button>
        </div>

        <div className={`card p-8 border transition-colors ${isAdmin ? 'border-violet-500/20' : 'border-slate-800'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAdmin ? 'bg-violet-500/15' : 'bg-teal-500/15'}`}>
              {isAdmin ? <Stethoscope className="w-5 h-5 text-violet-400" /> : <User className="w-5 h-5 text-teal-400" />}
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-white">
                {isAdmin ? 'Hospital Staff Registration' : 'Patient Registration'}
              </h1>
              <p className="text-slate-500 text-xs mt-0.5">
                {isAdmin ? 'Create your hospital staff account' : 'Create your patient account'}
              </p>
            </div>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" type="text" placeholder="John Doe" value={form.fullName} onChange={set('fullName')} required />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>

            {!isAdmin && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Age</label>
                    <input className="input" type="number" placeholder="30" min="1" max="130" value={form.age} onChange={set('age')} />
                  </div>
                  <div>
                    <label className="label">Gender</label>
                    <select className="input" value={form.gender} onChange={set('gender')}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input className="input" type="tel" placeholder="+91 9876543210" value={form.phone} onChange={set('phone')} />
                </div>
              </>
            )}

            <div className="relative">
              <label className="label">Password</label>
              <input className="input pr-10" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-[38px] text-slate-500 hover:text-slate-300">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input className="input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
            </div>

            <button type="submit"
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 mt-2 ${isAdmin ? 'bg-violet-500 hover:bg-violet-400 text-white' : 'btn-primary'}`}
              disabled={loading}>
              {loading ? <><InlineSpinner /> Creating account…</> : `Register as ${isAdmin ? 'Hospital Staff' : 'Patient'}`}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to={`/login?role=${role}`} className={`font-medium ${isAdmin ? 'text-violet-400 hover:text-violet-300' : 'text-teal-400 hover:text-teal-300'}`}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
