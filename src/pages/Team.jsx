import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  canManageTeam
} from '../lib/permissions'

export default function Team() {

  const [profile, setProfile] = useState(null)

  const [members, setMembers] = useState([])

  const [email, setEmail] = useState('')

  const [role, setRole] = useState('viewer')

  async function fetchProfile() {

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(data)
  }

  async function fetchMembers(agencyId) {

    const { data } = await supabase
      .from('team_members')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', {
        ascending: false
      })

    setMembers(data || [])
  }

  useEffect(() => {

    fetchProfile()

  }, [])

  useEffect(() => {

    if (profile) {
      fetchMembers(profile.agency_id)
    }

  }, [profile])

  async function inviteMember(e) {
       if (
  profile &&
  !canManageTeam(profile.role)
) {

  return (

    <div
      style={{
        padding: '24px',
        color: '#fff'
      }}
    >

      You do not have permission
      to manage team members.

    </div>
  )
}

    e.preventDefault()

    if (!email) {
      return alert('Enter email')
    }

    const { error } = await supabase
      .from('team_members')
      .insert([
        {
          agency_id: profile.agency_id,
          email,
          role,
          invited_by: profile.id
        }
      ])

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setEmail('')

    setRole('viewer')

    fetchMembers(profile.agency_id)
  }

  return (
 
    
    

    <div style={{ padding: '24px' }}>

      <h1
        style={{
          color: '#fff',
          marginBottom: '20px'
        }}
      >
        Team Members
      </h1>

      {/* Invite Form */}
      <form
        onSubmit={inviteMember}
        style={{
          background: '#141417',
          border: '1px solid #1f1f24',
          padding: '20px',
          borderRadius: '14px',
          marginBottom: '24px'
        }}
      >

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 180px 120px',
            gap: '12px'
          }}
        >

          <input
            type="email"
            placeholder="Teammate Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
          >

            <option value="viewer">
              Viewer
            </option>

            <option value="editor">
              Editor
            </option>

            <option value="manager">
              Manager
            </option>

          </select>

          <button
            type="submit"
            style={{
              background: '#7c5cfc',
              border: 'none',
              color: '#fff',
              borderRadius: '10px'
            }}
          >
            Invite
          </button>

        </div>

      </form>

      {/* Members List */}
      <div
        style={{
          display: 'grid',
          gap: '12px'
        }}
      >

        {members.map(member => (

          <div
            key={member.id}
            style={{
              background: '#141417',
              border: '1px solid #1f1f24',
              borderRadius: '14px',
              padding: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >

            <div>

              <div
                style={{
                  color: '#fff',
                  marginBottom: '4px'
                }}
              >
                {member.email}
              </div>

              <div
                style={{
                  color: '#777',
                  fontSize: '13px'
                }}
              >
                {member.role}
              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}