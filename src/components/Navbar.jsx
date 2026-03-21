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
    { to: '/notifications',        label: 'Notifications',  icon: Bell, badge: unreadCount },
    { to: '/medical-profile',      label: 'Medical Profile',icon: User },
    { to: '/edit-profile',         label: 'Edit Profile',   icon: Edit },
    { to: '/change-password',      label: 'Password',       icon: Lock },
  ]
  const adminLinks = [
    { to: '/admin',                label: 'Dashboard',  icon: LayoutDashboard },
    { to: '/admin/doctor-profile', label: 'My Profile', icon: Stethoscope },
  ]
  const links = isAdmin ? adminLinks : patientLinks
  const isActive = (path) => location.pathname === path

  return (
    <nav style={{ background: 'linear-gradient(135deg, #0B2447 0%, #19376D 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(11,36,71,0.2)' }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2.5 group flex-shrink-0">
          <div style={{ background: 'rgba(30,136,229,0.2)', border: '1px solid rgba(30,136,229,0.4)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            className="group-hover:bg-blue-500/30 transition-colors">
            <Activity className="w-4 h-4 text-blue-300" />
          </div>
          <div>
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, color: 'white', fontSize: '16px', letterSpacing: '-0.02em' }}>
              Medi<span style={{ color: '#64B5F6' }}>Intake</span>
            </span>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1 }}>
              Healthcare System
            </div>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-0.5 overflow-x-auto max-w-3xl">
          {links.map(({ to, label, icon: Icon, badge }) => (
            <Link key={to} to={to}
              style={isActive(to) ? {
                background: 'rgba(30,136,229,0.2)',
                color: '#90CAF9',
                border: '1px solid rgba(30,136,229,0.3)',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '5px',
                whiteSpace: 'nowrap', position: 'relative',
              } : {
                color: 'rgba(255,255,255,0.55)',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '5px',
                whiteSpace: 'nowrap', position: 'relative',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!isActive(to)) e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (!isActive(to)) { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = 'transparent' } }}
            >
              <Icon style={{ width: '13px', height: '13px' }} />
              {label}
              {badge > 0 && (
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '16px', height: '16px', background: '#F59E0B', color: '#0B2447', fontSize: '10px', fontWeight: 700, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={toggleTheme}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '7px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <div className="hidden sm:flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 10px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4CAF50', boxShadow: '0 0 6px #4CAF50' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{profile?.full_name?.split(' ')[0]}</span>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '5px', background: isAdmin ? 'rgba(167,139,250,0.2)' : 'rgba(30,136,229,0.2)', color: isAdmin ? '#C4B5FD' : '#90CAF9', fontWeight: 700 }}>
              {isAdmin ? 'ADMIN' : 'PATIENT'}
            </span>
          </div>

          <button onClick={handleSignOut}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '7px', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(198,40,40,0.2)'; e.currentTarget.style.color = '#EF9A9A' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>

          <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '7px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: '#0B2447', borderTop: '1px solid rgba(255,255,255,0.08)' }} className="lg:hidden px-4 py-3 flex flex-col gap-1 animate-fade-in max-h-96 overflow-y-auto">
          {links.map(({ to, label, icon: Icon, badge }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              style={isActive(to)
                ? { background: 'rgba(30,136,229,0.2)', color: '#90CAF9', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(30,136,229,0.25)' }
                : { color: 'rgba(255,255,255,0.55)', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <Icon style={{ width: '15px', height: '15px' }} />
              {label}
              {badge > 0 && <span style={{ marginLeft: 'auto', width: '20px', height: '20px', background: '#F59E0B', color: '#0B2447', fontSize: '11px', fontWeight: 700, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
