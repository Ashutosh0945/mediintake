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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(2,6,23,0.97)',
        borderTop: '1px solid rgba(8,145,178,0.22)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '8px 8px 4px' }}>
        {links.map(({ to, label, icon: Icon, badge }) => (
          <Link key={to} to={to} style={{
            position: 'relative',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            padding: '8px 12px', borderRadius: '12px',
            transition: 'all 0.2s',
            color: isActive(to) ? '#22D3EE' : 'rgba(103,232,249,0.35)',
            background: isActive(to) ? 'rgba(34,211,238,0.1)' : 'transparent',
            textDecoration: 'none',
          }}>
            <div style={{ position: 'relative' }}>
              <Icon style={{ width: '20px', height: '20px' }} />
              {badge > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-6px', width: '14px', height: '14px', background: '#0891B2', color: 'white', fontSize: '9px', fontWeight: 800, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>
            <span style={{ fontSize: '10px', fontWeight: isActive(to) ? 800 : 600 }}>{label}</span>
            {isActive(to) && (
              <div style={{ position: 'absolute', bottom: '-2px', left: '50%', transform: 'translateX(-50%)', width: '20px', height: '2px', background: '#22D3EE', borderRadius: '2px' }} />
            )}
          </Link>
        ))}
      </div>
    </nav>
  )
}
