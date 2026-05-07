import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Activity() {

  const [logs, setLogs] = useState([])

  const [profile, setProfile] = useState(null)

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

  async function fetchLogs(agencyId) {

    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', {
        ascending: false
      })

    if (data) {
      setLogs(data)
    }
  }

  useEffect(() => {

    fetchProfile()

  }, [])

useEffect(() => {

  if (!profile) return

  fetchLogs(profile.agency_id)

  const channel = supabase

    .channel('activity-feed')

    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'activity_logs',
      },
      () => {

        fetchLogs(profile.agency_id)

      }
    )

    .subscribe()

  return () => {

    supabase.removeChannel(channel)

  }

}, [profile])

  return (

    <div style={{ padding: '24px' }}>

      <h1
        style={{
          color: '#fff',
          fontSize: '24px',
          marginBottom: '20px'
        }}
      >
        Activity Feed
      </h1>

      <div
        style={{
          display: 'grid',
          gap: '12px'
        }}
      >

        {
          logs.map(log => (

            <div
              key={log.id}
              style={{
                background: '#141417',
                border: '1px solid #1f1f24',
                borderRadius: '14px',
                padding: '16px'
              }}
            >

              <div
                style={{
                  color: '#fff',
                  marginBottom: '6px'
                }}
              >
                {log.action}
              </div>

              <div
                style={{
                  color: '#777',
                  fontSize: '13px',
                  marginBottom: '4px'
                }}
              >
                {log.user_email}
              </div>

              <div
                style={{
                  color: '#555',
                  fontSize: '12px'
                }}
              >
                {
                  new Date(
                    log.created_at
                  ).toLocaleString()
                }
              </div>

            </div>

          ))
        }

      </div>

    </div>
  )
}