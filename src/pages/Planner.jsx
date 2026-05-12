import {
  LayoutDashboard, FolderOpen, Users,
  Calendar, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FolderOpen, label: 'Projects', path: '/' },
  { icon: Calendar, label: 'Planner', path: '/planner' },
  { icon: Users, label: 'Team', path: '/team' },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div style={{
      width: collapsed ? '60px' : '200px',
      background: '#141417',
      borderRight: '1px solid #1e1e26',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s',
      flexShrink: 0,
      height: '100vh',
      overflow: 'hidden',
      position: 'fixed',
      top: 0, left: 0, zIndex: 50
    }}>

      {/* Logo */}
      <div style={{
        height: '52px', display: 'flex', alignItems: 'center',
        padding: '0 14px', borderBottom: '1px solid #1e1e26',
        gap: '10px', overflow: 'hidden'
      }}>
        <div style={{
          width: '26px', height: '26px', borderRadius: '7px',
          background: '#7c5cfc', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0
        }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="#fff">
            <path d="M8 1L2 4v4c0 3.5 2.5 6.5 6 7.5C11.5 14.5 14 11.5 14 8V4L8 1z"/>
          </svg>
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f0f0f4', whiteSpace: 'nowrap' }}>Purple Media</div>
            <div style={{ fontSize: '10px', color: '#6b6b7a' }}>PMDE · Agency Tool</div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <div style={{ padding: '10px 7px', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path ||
            (path !== '/' && location.pathname.startsWith(path))
          return (
            <div
              key={label}
              onClick={() => navigate(path)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 10px', borderRadius: '7px', cursor: 'pointer',
                color: isActive ? '#a78bfa' : '#6b6b7a',
                background: isActive ? 'rgba(124,92,252,0.13)' : 'transparent',
                transition: 'all 0.1s', overflow: 'hidden', whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = '#1a1a1f'
                  e.currentTarget.style.color = '#f0f0f4'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#6b6b7a'
                }
              }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ fontSize: '12px' }}>{label}</span>}
            </div>
          )
        })}
      </div>

      {/* Collapse toggle */}
      <div
        onClick={() => setCollapsed && setCollapsed(!collapsed)}
        style={{
          padding: '12px 14px', borderTop: '1px solid #1e1e26',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-end', color: '#6b6b7a'
        }}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </div>
    </div>
  )
}