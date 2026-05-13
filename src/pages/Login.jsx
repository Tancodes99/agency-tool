import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { alert(error.message); return }
    navigate('/')
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0c0c0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#141417', border: '1px solid #1e1e26',
        borderRadius: '16px', padding: '32px',
        width: '100%', maxWidth: '400px'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '7px',
            background: 'var(--brand-color)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="#fff">
              <path d="M8 1L2 4v4c0 3.5 2.5 6.5 6 7.5C11.5 14.5 14 11.5 14 8V4L8 1z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#f0f0f4' }}>Purple Media</div>
            <div style={{ fontSize: '10px', color: '#6b6b7a' }}>Agency Tool</div>
          </div>
        </div>

        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#f0f0f4', marginBottom: '4px' }}>
          Welcome back
        </h1>
        <p style={{ fontSize: '13px', color: '#6b6b7a', marginBottom: '24px' }}>
          Login to your agency workspace
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '11px', color: '#6b6b7a', display: 'block', marginBottom: '5px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@agency.com"
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', color: '#6b6b7a', display: 'block', marginBottom: '5px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', background: loading ? '#3a3a4a' : 'var(--brand-color)',
            border: 'none', color: '#fff', padding: '10px',
            borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer'
          }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ fontSize: '12px', color: '#6b6b7a', textAlign: 'center', marginTop: '20px' }}>
          No account?{' '}
          <Link to="/signup" style={{ color: '#a78bfa', textDecoration: 'none' }}>
            Create agency
          </Link>
        </p>
      </div>
    </div>
  )
}