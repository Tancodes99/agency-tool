import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const roleColors = {
  owner:   { bg: 'rgba(124,92,252,0.12)', color: '#a78bfa' },
  manager: { bg: 'rgba(96,165,250,0.1)',  color: '#60a5fa' },
  editor:  { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' },
  viewer:  { bg: '#1a1a1f',               color: '#6b6b7a' },
}

export default function Team() {
  const [profile, setProfile] = useState(null)
  const [members, setMembers] = useState([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('viewer')
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchProfile() }, [])

  useEffect(() => {
    if (profile?.agency_id) fetchMembers(profile.agency_id)
  }, [profile])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()
    setProfile(data)
  }

  async function fetchMembers(agencyId) {
    const { data } = await supabase
      .from('team_members').select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
    setMembers(data || [])
  }

  async function inviteMember(e) {
    e.preventDefault()
    if (!profile || profile.role !== 'owner') {
      return alert('Only the owner can invite team members')
    }
    if (!email) return alert('Enter an email')
    setLoading(true)
    const { error } = await supabase.from('team_members').insert([{
      agency_id: profile.agency_id,
      email,
      role,
      invited_by: profile.id
    }])
    setLoading(false)
    if (error) { alert(error.message); return }
    setEmail('')
    setRole('viewer')
    fetchMembers(profile.agency_id)
  }

  async function removeMember(id) {
    if (!window.confirm('Remove this member?')) return
    await supabase.from('team_members').delete().eq('id', id)
    fetchMembers(profile.agency_id)
  }

  const isOwner = profile?.role === 'owner'

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#f0f0f4', marginBottom: '4px' }}>
          Team
        </h1>
        <p style={{ fontSize: '13px', color: '#6b6b7a' }}>
          {isOwner ? 'Manage your team members and roles' : 'Your team'}
        </p>
      </div>

      {/* Invite form — owner only */}
      {isOwner && (
        <div style={{
          background: '#141417', border: '1px solid #1e1e26',
          borderRadius: '12px', padding: '18px', marginBottom: '20px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#f0f0f4', marginBottom: '12px' }}>
            Invite Member
          </div>
          <form onSubmit={inviteMember}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 110px', gap: '10px' }}>
              <input
                type="email"
                placeholder="Teammate email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                style={{
                  background: '#1a1a1f', border: '1px solid #2e2e3c',
                  color: '#f0f0f4', borderRadius: '8px',
                  padding: '8px 10px', fontSize: '13px'
                }}
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="manager">Manager</option>
              </select>
              <button type="submit" disabled={loading} style={{
                background: loading ? '#3a3a4a' : '#7c5cfc',
                border: 'none', color: '#fff',
                borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                cursor: 'pointer'
              }}>
                {loading ? 'Inviting...' : 'Invite'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

        {/* Current user (owner) at top */}
        {profile && (
          <div style={{
            background: '#141417', border: '1px solid #1e1e26',
            borderRadius: '10px', padding: '14px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '13px', color: '#f0f0f4', marginBottom: '2px' }}>
                {profile.email}
              </div>
              <div style={{ fontSize: '11px', color: '#6b6b7a' }}>You</div>
            </div>
            <span style={{
              background: roleColors.owner.bg, color: roleColors.owner.color,
              padding: '3px 9px', borderRadius: '20px',
              fontSize: '10px', fontWeight: 600, textTransform: 'uppercase'
            }}>Owner</span>
          </div>
        )}

        {/* Invited members */}
        {members.length === 0 ? (
          <div style={{
            background: '#141417', border: '1px dashed #2e2e3c',
            borderRadius: '10px', padding: '32px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '13px', color: '#6b6b7a' }}>
              No team members yet. Invite someone above.
            </div>
          </div>
        ) : (
          members.map(member => {
            const rc = roleColors[member.role] || roleColors.viewer
            return (
              <div key={member.id} style={{
                background: '#141417', border: '1px solid #1e1e26',
                borderRadius: '10px', padding: '14px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#f0f0f4', marginBottom: '2px' }}>
                    {member.email}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b6b7a' }}>Invited member</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    background: rc.bg, color: rc.color,
                    padding: '3px 9px', borderRadius: '20px',
                    fontSize: '10px', fontWeight: 600, textTransform: 'uppercase'
                  }}>
                    {member.role}
                  </span>
                  {isOwner && (
                    <button onClick={() => removeMember(member.id)} style={{
                      background: 'transparent', border: '1px solid #2e2e3c',
                      color: '#6b6b7a', padding: '3px 8px',
                      borderRadius: '6px', fontSize: '11px', cursor: 'pointer'
                    }}>Remove</button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}