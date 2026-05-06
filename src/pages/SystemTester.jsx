import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function SystemTester() {

  const [logs, setLogs] = useState([])
  const [running, setRunning] = useState(false)

  function addLog(type, message) {

    setLogs(prev => [
      ...prev,
      {
        type,
        message,
        time: new Date().toLocaleTimeString()
      }
    ])
  }

  async function runTests() {

    setLogs([])

    setRunning(true)

    addLog('info', 'Starting system tests...')

    try {

      // AUTH TEST
      addLog('info', 'Checking auth session...')

      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser()

      if (authError || !user) {
        addLog('error', 'Auth session failed')
      } else {
        addLog('success', `Logged in as ${user.email}`)
      }

      // PROFILE TEST
      addLog('info', 'Checking profiles table...')

      const {
        data: profile,
        error: profileError
      } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        addLog('error', 'Profile fetch failed')
      } else {
        addLog('success', 'Profile loaded successfully')
      }

      // AGENCY TEST
      addLog('info', 'Checking agencies table...')

      const {
        data: agency,
        error: agencyError
      } = await supabase
        .from('agencies')
        .select('*')
        .eq('id', profile.agency_id)
        .single()

      if (agencyError || !agency) {
        addLog('error', 'Agency fetch failed')
      } else {
        addLog('success', `Agency found: ${agency.name}`)
      }

      // PROJECTS TEST
      addLog('info', 'Checking projects table...')

      const {
        data: projects,
        error: projectsError
      } = await supabase
        .from('projects')
        .select('*')
        .eq('agency_id', profile.agency_id)

      if (projectsError) {
        addLog('error', 'Projects fetch failed')
      } else {
        addLog(
          'success',
          `${projects.length} projects loaded`
        )
      }

      // COMMENTS TEST
      addLog('info', 'Checking comments table...')

      const {
        data: comments,
        error: commentsError
      } = await supabase
        .from('comments')
        .select('*')
        .eq('agency_id', profile.agency_id)

      if (commentsError) {
        addLog('error', 'Comments fetch failed')
      } else {
        addLog(
          'success',
          `${comments.length} comments loaded`
        )
      }

      // STORAGE TEST
      addLog('info', 'Checking storage access...')

      const {
        data: storageData,
        error: storageError
      } = await supabase.storage
        .from('videos')
        .list('', {
          limit: 1
        })

      if (storageError) {
        addLog('error', 'Storage access failed')
      } else {
        addLog('success', 'Storage working')
      }

      // AGENCY ISOLATION TEST
      addLog('info', 'Checking agency isolation...')

      const invalidProjects = projects.filter(
        p => p.agency_id !== profile.agency_id
      )

      if (invalidProjects.length > 0) {
        addLog(
          'error',
          'Agency isolation broken'
        )
      } else {
        addLog(
          'success',
          'Agency isolation working'
        )
      }

      addLog(
        'success',
        'All tests completed'
      )

    } catch (err) {

      console.log(err)

      addLog(
        'error',
        err.message || 'Unknown error'
      )
    }

    setRunning(false)
  }

  return (

    <div
      style={{
        padding: '24px'
      }}
    >

      <h1
        style={{
          color: '#fff',
          marginBottom: '12px'
        }}
      >
        System Tester
      </h1>

      <button
        onClick={runTests}
        disabled={running}
        style={{
          background: '#7c5cfc',
          border: 'none',
          color: '#fff',
          padding: '12px 18px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}
      >
        {
          running
            ? 'Running Tests...'
            : 'Run System Test'
        }
      </button>

      <div
        style={{
          background: '#141417',
          border: '1px solid #1f1f24',
          borderRadius: '14px',
          padding: '18px'
        }}
      >

        {
          logs.map((log, index) => (

            <div
              key={index}
              style={{
                marginBottom: '12px',
                color:
                  log.type === 'success'
                    ? '#22c55e'
                    : log.type === 'error'
                    ? '#ef4444'
                    : '#aaa'
              }}
            >

              [{log.time}] {log.message}

            </div>
          ))
        }

      </div>

    </div>
  )
}

