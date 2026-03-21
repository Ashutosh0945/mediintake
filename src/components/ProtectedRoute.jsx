import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ role }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-slate-700 border-t-teal-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading your profile…</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  // Profile missing — show error instead of silent redirect
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <p className="text-red-400 font-semibold text-lg mb-2">Profile Not Found</p>
          <p className="text-slate-400 text-sm mb-4">
            Your account exists but your profile record is missing from the database.
          </p>
          <p className="text-slate-500 text-xs mb-6">User ID: <span className="text-slate-300 font-mono">{user?.id}</span></p>
          <p className="text-slate-400 text-sm">
            Run this in Supabase SQL Editor:
          </p>
          <pre className="text-left bg-slate-800 rounded-xl p-4 text-xs text-teal-300 mt-3 overflow-auto">
{`INSERT INTO public.profiles
  (id, email, full_name, role)
VALUES (
  '${user?.id}',
  '${user?.email}',
  'Your Name',
  'patient'
) ON CONFLICT (id) DO NOTHING;`}
          </pre>
        </div>
      </div>
    )
  }

  if (role && profile.role !== role) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/dashboard'} replace />
  }

  return <Outlet />
}
