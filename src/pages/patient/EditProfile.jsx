import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import { InlineSpinner } from '../../components/LoadingSpinner'
import { CheckCircle, Save, User } from 'lucide-react'

export default function EditProfile() {
  const { profile, fetchProfile, user } = useAuth()
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    age: profile?.age || '',
    gender: profile?.gender || '',
    phone: profile?.phone || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error: err } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        age: parseInt(form.age) || null,
        gender: form.gender || null,
        phone: form.phone || null,
      })
      .eq('id', profile.id)

    if (err) { setError(err.message) }
    else {
      await fetchProfile(user.id)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8 animate-slide-up">
          <h1 className="section-title">Edit Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Update your personal information</p>
        </div>

        <div className="card p-8 animate-slide-up">
          {/* Avatar */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-teal-500/15 border-2 border-teal-500/30 rounded-full flex items-center justify-center">
              <User className="w-9 h-9 text-teal-400" />
            </div>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>}

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="label">Full Name</label>
              <input className="input" type="text" value={form.full_name} onChange={set('full_name')} required />
            </div>

            <div>
              <label className="label">Email Address</label>
              <input className="input opacity-50 cursor-not-allowed" type="email" value={profile?.email || ''} disabled />
              <p className="text-xs text-slate-600 mt-1">Email cannot be changed</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Age</label>
                <input className="input" type="number" min="1" max="130" placeholder="30" value={form.age} onChange={set('age')} />
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

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3" disabled={saving}>
              {saving ? <><InlineSpinner /> Saving…</> : saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
