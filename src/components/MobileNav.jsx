import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, PlusCircle, MapPin, Bell, User } from 'lucide-react'

export default function MobileNav({ unreadCount = 0 }) {
  const { isAdmin } = useAuth()
  const location = useLocation()
  const isActive = (path) => location.pathname === path
  if (isAdmin) return null

  const links = [
    { to: '/dashboard',         label: 'Home',      icon: LayoutDashboard },
    { to: '/new-intake',        label: 'Intake',    icon: PlusCircle },
    { to: '/hospitals-near-me', label: 'Hospitals', icon: MapPin },
    { to: '/notifications',     label: 'Alerts',    icon: Bell, badge: unreadCount },
    { to: '/medical-profile',   label: 'Profile',   icon: User },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50" style={{ background: 'white', borderTop: '1px solid #C5D3E8', boxShadow: '0 -4px 20px rgba(11,36,71,0.08)' }}>
      <div className="flex items-center justify-around px-2 py-1">
        {links.map(({ to, label, icon: Icon, badge }) => (
          <Link key={to} to={to}
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '8px 10px', borderRadius: '10px', transition: 'all 0.2s', color: isActive(to) ? '#1565C0' : '#8FA3C0', background: isActive(to) ? 'rgba(21,101,192,0.08)' : 'transparent', textDecoration: 'none' }}>
            <div style={{ position: 'relative' }}>
              <Icon style={{ width: '20px', height: '20px' }} />
              {badge > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', background: '#F59E0B', color: '#0B2447', fontSize: '9px', fontWeight: 700, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge > 9 ? '9+' : badge}</span>}
            </div>
            <span style={{ fontSize: '10px', fontWeight: isActive(to) ? 700 : 500 }}>{label}</span>
            {isActive(to) && <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', width: '20px', height: '2px', background: '#1565C0', borderRadius: '2px 2px 0 0' }} />}
          </Link>
        ))}
      </div>
    </nav>
  )
}
