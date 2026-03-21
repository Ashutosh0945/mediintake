import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import { InlineSpinner } from '../../components/LoadingSpinner'
import { Lock, CheckCircle, Eye, EyeOff } from 'lucide-react'

export default function ChangePassword() {
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.newPassword !== form.confirmPassword) { setError('Passwords do not match.'); return }
    if (form.newPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
    setSaving(true)
    const { error: err } = await supabase.auth.updateUser({ password: form.newPassword })
    if (err) { setError(err.message) }
    else { setDone(true); setForm({ newPassword: '', confirmPassword: '' }) }
    setSaving(false)
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-md mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8 animate-slide-up">
          <h1 className="section-title flex items-center gap-3"><Lock className="w-6 h-6 text-teal-400" />Change Password</h1>
          <p className="text-slate-400 text-sm mt-1">Update your account password</p>
        </div>

        <div className="card p-8 animate-slide-up">
          {done && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Password updated successfully!
            </div>
          )}
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input className="input pr-10" type={showNew ? 'text' : 'password'} placeholder="Min. 8 characters"
                  value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} required />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <div className="relative">
                <input className="input pr-10" type={showConfirm ? 'text' : 'password'} placeholder="Repeat new password"
                  value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Strength indicator */}
            {form.newPassword && (
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Password strength</p>
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
                      form.newPassword.length >= i * 3
                        ? form.newPassword.length >= 12 ? 'bg-emerald-500'
                          : form.newPassword.length >= 8 ? 'bg-amber-500' : 'bg-red-500'
                        : 'bg-slate-700'
                    }`} />
                  ))}
                </div>
                <p className="text-xs mt-1 text-slate-500">
                  {form.newPassword.length < 8 ? 'Too short' : form.newPassword.length < 12 ? 'Good' : 'Strong'}
                </p>
              </div>
            )}

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3" disabled={saving}>
              {saving ? <><InlineSpinner />Updating…</> : <><Lock className="w-4 h-4" />Update Password</>}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
