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
    setError('')
    setLoading(true)

    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (err) { setError(err.message); setLoading(false); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const actualRole = profile?.role

    // Role mismatch check
    if (actualRole !== role) {
      await supabase.auth.signOut()
      setError(role === 'admin'
        ? 'This account is not registered as hospital staff.'
        : 'This account is a hospital staff account. Please use the Hospital Staff login.')
      setLoading(false)
      return
    }

    navigate(actualRole === 'admin' ? '/admin' : '/dashboard')
  }

  const isAdmin = role === 'admin'

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 bg-teal-500/20 border border-teal-500/40 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-teal-400" />
          </div>
          <span className="font-display font-bold text-white text-xl tracking-tight">
            Medi<span className="text-teal-400">Intake</span>
          </span>
        </Link>

        {/* Role selector cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => { setRole('patient'); setError('') }}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
              !isAdmin
                ? 'bg-teal-500/15 border-teal-500/40 shadow-lg shadow-teal-500/10'
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!isAdmin ? 'bg-teal-500/20' : 'bg-slate-700'}`}>
              <User className={`w-5 h-5 ${!isAdmin ? 'text-teal-400' : 'text-slate-400'}`} />
            </div>
            <span className={`text-sm font-semibold ${!isAdmin ? 'text-teal-300' : 'text-slate-400'}`}>Patient</span>
          </button>

          <button
            type="button"
            onClick={() => { setRole('admin'); setError('') }}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
              isAdmin
                ? 'bg-violet-500/15 border-violet-500/40 shadow-lg shadow-violet-500/10'
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAdmin ? 'bg-violet-500/20' : 'bg-slate-700'}`}>
              <Stethoscope className={`w-5 h-5 ${isAdmin ? 'text-violet-400' : 'text-slate-400'}`} />
            </div>
            <span className={`text-sm font-semibold ${isAdmin ? 'text-violet-300' : 'text-slate-400'}`}>Hospital Staff</span>
          </button>
        </div>

        {/* Card */}
        <div className={`card p-8 border transition-colors ${isAdmin ? 'border-violet-500/20' : 'border-slate-800'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAdmin ? 'bg-violet-500/15' : 'bg-teal-500/15'}`}>
              {isAdmin
                ? <Stethoscope className="w-5 h-5 text-violet-400" />
                : <User className="w-5 h-5 text-teal-400" />}
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-white">
                {isAdmin ? 'Hospital Staff Sign In' : 'Patient Sign In'}
              </h1>
              <p className="text-slate-500 text-xs mt-0.5">
                {isAdmin ? 'Access the hospital dashboard' : 'Manage your health intake'}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 ${
                isAdmin
                  ? 'bg-violet-500 hover:bg-violet-400 text-white'
                  : 'btn-primary'
              }`}
              disabled={loading}
            >
              {loading ? <><InlineSpinner /> Signing in…</> : `Sign In as ${isAdmin ? 'Hospital Staff' : 'Patient'}`}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to={`/register?role=${role}`} className={`font-medium ${isAdmin ? 'text-violet-400 hover:text-violet-300' : 'text-teal-400 hover:text-teal-300'}`}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
