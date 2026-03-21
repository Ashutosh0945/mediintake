import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Activity, LogOut, LayoutDashboard, FileText, PlusCircle, Menu, X, Calendar, Edit, Bell, Pill, Lock, Stethoscope, MapPin, Syringe, Sun, Moon, User, Heart } from 'lucide-react'
import { useState } from 'react'

export default function Navbar({ unreadCount = 0 }) {
  const { profile, signOut, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const handleSignOut = async () => { await signOut(); navigate('/') }

  const patientLinks = [
    { to: '/dashboard',            label: 'Dashboard',      icon: LayoutDashboard },
    { to: '/new-intake',           label: 'New Intake',     icon: PlusCircle },
    { to: '/my-intakes',           label: 'Records',        icon: FileText },
    { to: '/health-score',         label: 'Health Score',   icon: Heart },
    { to: '/hospitals-near-me',    label: 'Hospitals',      icon: MapPin },
    { to: '/vaccinations',         label: 'Vaccines',       icon: Syringe },
    { to: '/appointments',         label: 'Appointments',   icon: Calendar },
    { to: '/medication-reminders', label: 'Medications',    icon: Pill },
    { to: '/notifications',        label: 'Alerts',         icon: Bell, badge: unreadCount },
    { to: '/medical-profile',      label: 'Profile',        icon: User },
    { to: '/edit-profile',         label: 'Edit',           icon: Edit },
    { to: '/change-password',      label: 'Password',       icon: Lock },
  ]
  const adminLinks = [
    { to: '/admin',                label: 'Dashboard',  icon: LayoutDashboard },
    { to: '/admin/doctor-profile', label: 'My Profile', icon: Stethoscope },
  ]
  const links = isAdmin ? adminLinks : patientLinks
  const isActive = (p) => location.pathname === p

  return (
    <nav style={{ background: 'rgba(2,6,23,0.95)', borderBottom: '1px solid rgba(8,145,178,0.25)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        <Link to={isAdmin ? '/admin' : '/dashboard'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#0E7490,#0891B2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(8,145,178,0.5)' }}>
            <Activity style={{ width: '16px', height: '16px', color: '#67E8F9' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: '17px', letterSpacing: '-0.03em', color: '#E0F7FF' }}>
              Medi<span style={{ color: '#22D3EE' }}>Intake</span>
            </div>
            <div style={{ fontSize: '9px', color: 'rgba(103,232,249,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1 }}>Healthcare</div>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-0.5 overflow-x-auto max-w-3xl">
          {links.map(({ to, label, icon: Icon, badge }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 9px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.15s',
              background: isActive(to) ? 'rgba(8,145,178,0.2)' : 'transparent',
              color: isActive(to) ? '#67E8F9' : 'rgba(103,232,249,0.4)',
              border: isActive(to) ? '1px solid rgba(34,211,238,0.3)' : '1px solid transparent',
            }}
              onMouseEnter={e => { if (!isActive(to)) { e.currentTarget.style.color='rgba(165,243,252,0.85)'; e.currentTarget.style.background='rgba(8,145,178,0.1)' } }}
              onMouseLeave={e => { if (!isActive(to)) { e.currentTarget.style.color='rgba(103,232,249,0.4)'; e.currentTarget.style.background='transparent' } }}
            >
              <Icon style={{ width: '13px', height: '13px' }} />{label}
              {badge > 0 && <span style={{ position: 'absolute', top: '-3px', right: '-3px', width: '16px', height: '16px', background: '#0891B2', color: 'white', fontSize: '9px', fontWeight: 800, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge > 9 ? '9+' : badge}</span>}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={toggleTheme} style={{ background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(8,145,178,0.25)', borderRadius: '8px', padding: '7px', color: '#67E8F9', cursor: 'pointer', transition: 'all 0.2s', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(8,145,178,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(8,145,178,0.1)'}>
            {theme === 'dark' ? <Sun style={{ width: '14px', height: '14px' }} /> : <Moon style={{ width: '14px', height: '14px' }} />}
          </button>
          <div className="hidden sm:flex items-center gap-2" style={{ background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(8,145,178,0.22)', borderRadius: '10px', padding: '6px 12px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22D3EE', boxShadow: '0 0 6px #22D3EE' }} className="animate-pulse-slow" />
            <span style={{ fontSize: '12px', color: '#A5F3FC', fontWeight: 700 }}>{profile?.full_name?.split(' ')[0]}</span>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '6px', background: isAdmin ? 'rgba(167,139,250,0.2)' : 'rgba(34,211,238,0.15)', color: isAdmin ? '#C4B5FD' : '#67E8F9', fontWeight: 800 }}>
              {isAdmin ? 'ADMIN' : 'PATIENT'}
            </span>
          </div>
          <button onClick={handleSignOut} style={{ background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(8,145,178,0.25)', borderRadius: '8px', padding: '7px', color: 'rgba(103,232,249,0.4)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(220,38,38,0.15)'; e.currentTarget.style.color='#FCA5A5'; e.currentTarget.style.borderColor='rgba(220,38,38,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(8,145,178,0.1)'; e.currentTarget.style.color='rgba(103,232,249,0.4)'; e.currentTarget.style.borderColor='rgba(8,145,178,0.25)' }}>
            <LogOut style={{ width: '14px', height: '14px' }} />
          </button>
          <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(8,145,178,0.25)', borderRadius: '8px', padding: '7px', color: '#67E8F9', cursor: 'pointer', display: 'flex' }}>
            {menuOpen ? <X style={{ width: '16px', height: '16px' }} /> : <Menu style={{ width: '16px', height: '16px' }} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ background: 'rgba(2,6,23,0.98)', borderTop: '1px solid rgba(8,145,178,0.2)' }} className="lg:hidden px-4 py-3 flex flex-col gap-1 animate-fade-in max-h-96 overflow-y-auto">
          {links.map(({ to, label, icon: Icon, badge }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              background: isActive(to) ? 'rgba(8,145,178,0.18)' : 'transparent',
              color: isActive(to) ? '#67E8F9' : 'rgba(103,232,249,0.4)',
              border: isActive(to) ? '1px solid rgba(34,211,238,0.25)' : '1px solid transparent',
            }}>
              <Icon style={{ width: '15px', height: '15px' }} />{label}
              {badge > 0 && <span style={{ marginLeft: 'auto', width: '20px', height: '20px', background: '#0891B2', color: 'white', fontSize: '10px', fontWeight: 800, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
