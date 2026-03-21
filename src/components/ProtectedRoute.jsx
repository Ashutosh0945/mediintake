import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ role }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#EEF2F7' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #C5D3E8', borderTopColor: '#1565C0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#8FA3C0', fontSize: '14px' }}>Loading your profile…</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: '#EEF2F7' }}>
        <div className="card p-8 max-w-md w-full text-center">
          <div style={{ width: '48px', height: '48px', background: '#FFEBEE', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
          </div>
          <p style={{ color: '#C62828', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>Profile Not Found</p>
          <p style={{ color: '#8FA3C0', fontSize: '13px', marginBottom: '16px' }}>Your account exists but profile record is missing from the database.</p>
          <p style={{ color: '#4A6080', fontSize: '12px', marginBottom: '8px' }}>User ID: <span style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#1565C0' }}>{user?.id}</span></p>
          <pre style={{ background: '#F7F9FC', border: '1px solid #C5D3E8', borderRadius: '10px', padding: '14px', fontSize: '11px', color: '#1565C0', textAlign: 'left', overflowX: 'auto', fontFamily: 'IBM Plex Mono, monospace' }}>
{`INSERT INTO public.profiles (id, email, full_name, role)
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
