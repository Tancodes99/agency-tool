import { useState } from 'react'
import Sidebar from './Sidebar'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0c0c0f', color: '#f0f0f4' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{
        flex: 1,
        marginLeft: collapsed ? '60px' : '200px',
        transition: 'margin-left 0.2s',
        minWidth: 0
      }}>
        <div style={{
          height: '52px', background: '#141417',
          borderBottom: '1px solid #1e1e26',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky', top: 0, zIndex: 10
        }}>
          <div style={{ fontSize: '13px', color: '#6b6b7a' }}>
            Purple Media · Agency Tool
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: 'rgba(124,92,252,0.13)',
              border: '1px solid rgba(124,92,252,0.28)',
              color: '#a78bfa', borderRadius: '5px',
              padding: '3px 9px', fontSize: '11px', fontWeight: 600
            }}>Pro Plan</span>
            <button onClick={handleLogout} style={{
              background: 'transparent',
              border: '1px solid #2e2e3c',
              color: '#6b6b7a', padding: '5px 12px',
              borderRadius: '7px', fontSize: '12px', cursor: 'pointer'
            }}>Logout</button>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'var(--brand-color)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff'
            }}>PM</div>
          </div>
        </div>
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}