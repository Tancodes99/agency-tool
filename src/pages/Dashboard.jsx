import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { uploadVideo } from '../lib/upload'

import {
  canUpload,
  canManageClients
} from '../lib/permissions'

import {
  Plus,
  Copy,
  Check,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'

const statusConfig = {

  pending: {
    label: 'Pending',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    icon: Clock
  },

  approved: {
    label: 'Approved',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    icon: CheckCircle
  },

  'changes requested': {
    label: 'Changes',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    icon: AlertCircle
  },

}

export default function Dashboard() {

  const [projects, setProjects] = useState([])
  const [clientStats, setClientStats]
  = useState([])
  const [profile, setProfile] = useState(null)

  const [title, setTitle] = useState('')
  const [clientName, setClientName]
  = useState('')

const [clients, setClients]
  = useState([])

const [newClient, setNewClient]
  = useState('')
  const [file, setFile] = useState(null)

  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [copiedId, setCopiedId] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {

    fetchProfile()

  }, [])

  useEffect(() => {

    if (profile) {

  fetchProjects()

  fetchClients()

}

  }, [profile])

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

  async function fetchClients() {

  if (!profile?.agency_id) return

  const { data } = await supabase

    .from('clients')

    .select('*')

    .eq('agency_id', profile.agency_id)

    .order('name')

  if (data) {
    setClients(data)
  }
}
function buildClientStats(data) {

  const grouped = {}

  data.forEach(project => {

    const client =
      project.client_name || 'Unknown'

    if (!grouped[client]) {

      grouped[client] = {
        name: client,
        pending: 0,
        approved: 0,
        changes: 0,
        total: 0,
      }
    }

    grouped[client].total++

    if (project.status === 'pending') {
      grouped[client].pending++
    }

    if (project.status === 'approved') {
      grouped[client].approved++
    }

    if (
      project.status ===
      'changes requested'
    ) {
      grouped[client].changes++
    }

  })

  setClientStats(
    Object.values(grouped)
  )
}
  async function fetchProjects() {

    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('agency_id', profile?.agency_id)
      .eq('archived', false)
      .order('created_at', {
        ascending: false
      })

    if (data) {

  setProjects(data)

  buildClientStats(data)

}
  }

  async function handleUpload(e) {

    e.preventDefault()

    if (!file || !title || !clientName) {
      return alert('Fill all fields')
    }

    if (!profile) {
      return alert('Profile not loaded')
    }

    setUploading(true)

    try {

      const url = await uploadVideo(file)

      const { data, error } = await supabase

  .from('projects')

  .insert([
    {
      title,
      client_name: clientName,
      status: 'pending',
      revision_count: 0,
      revision_limit: 2,
      agency_id: profile.agency_id
    }
  ])

  .select()

  .single()
  await supabase

  .from('project_versions')

  .insert([
    {
      project_id: data.id,
      video_url: url,
      version_number: 1,
      uploaded_by: profile.email
    }
  ])

      if (error) {

        console.log(error)

        alert(error.message)

        setUploading(false)

        return
      }

      setTitle('')
      setClientName('')
      setFile(null)

      setShowForm(false)

      fetchProjects()

    } catch (err) {

      console.log(err)

      alert('Upload failed')
    }

    setUploading(false)
  }

  function copyLink(id) {

    navigator.clipboard.writeText(
      `${window.location.origin}/client/${id}`
    )

    setCopiedId(id)

    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  return (

    <div>

      {/* Header */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}
      >

        <div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#fff'
            }}
          >
            Projects
          </h1>

          <p
            style={{
              color: '#777',
              marginTop: '4px'
            }}
          >
            {projects.length} active projects
          </p>

        </div>

        {
          canUpload(profile?.role) && (

            <button
              onClick={() =>
                setShowForm(!showForm)
              }
              style={{
                background: '#7c5cfc',
                border: 'none',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600
              }}
            >

              <Plus size={16} />

              New Project

            </button>

          )
        }

      </div>

      {/* Upload Form */}

      {
        showForm && (

          <form
            onSubmit={handleUpload}
            style={{
              background: '#141417',
              padding: '20px',
              borderRadius: '14px',
              border: '1px solid #1f1f24',
              marginBottom: '24px'
            }}
          >

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '12px'
              }}
            >

              <input
                placeholder="Project Title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
              />

              <select
  value={clientName}

  onChange={(e) =>
    setClientName(e.target.value)
  }
>

  <option value="">
    Select Client
  </option>

  {
    clients.map(client => (

      <option
        key={client.id}
        value={client.name}
      >
        {client.name}
      </option>

    ))
  }

</select>
{
  canManageClients(profile?.role) && (

    <div
      style={{
        display: 'flex',
        gap: '8px',
        marginTop: '8px'
      }}
    >

      <input
        type="text"

        placeholder="New Client"

        value={newClient}

        onChange={(e) =>
          setNewClient(e.target.value)
        }
      />

      <button

        type="button"

        onClick={async () => {

          if (!newClient.trim()) return

          await supabase

            .from('clients')

            .insert([
              {
                agency_id:
                  profile.agency_id,

                name: newClient
              }
            ])

          setNewClient('')

          fetchClients()

        }}
      >

        Add

      </button>

    </div>

  )
}

            </div>

            <input
              type="file"
              accept="video/*"
              onChange={(e) =>
                setFile(e.target.files[0])
              }
              style={{
                marginBottom: '12px'
              }}
            />

            <button
              type="submit"
              disabled={uploading}
              style={{
                background: '#7c5cfc',
                border: 'none',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 600
              }}
            >

              {
                uploading
                  ? 'Uploading...'
                  : 'Upload Project'
              }

            </button>

          </form>

        )
      }

<div
  style={{
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fill, minmax(220px, 1fr))',

    gap: '16px',

    marginBottom: '24px'
  }}
>

  {
    clientStats.map(client => (

      <div
        key={client.name}

        style={{
          background: '#141417',
          border: '1px solid #1f1f24',
          borderRadius: '14px',
          padding: '18px'
        }}
      >

        <div
          style={{
            color: '#fff',
            fontSize: '15px',
            fontWeight: 600,
            marginBottom: '14px'
          }}
        >
          {client.name}
        </div>

        <div
          style={{
            display: 'grid',
            gap: '8px',
            fontSize: '13px'
          }}
        >

          <div
            style={{
              color: '#f59e0b'
            }}
          >
            Pending:
            {' '}
            {client.pending}
          </div>

          <div
            style={{
              color: '#22c55e'
            }}
          >
            Approved:
            {' '}
            {client.approved}
          </div>

          <div
            style={{
              color: '#ef4444'
            }}
          >
            Changes:
            {' '}
            {client.changes}
          </div>

          <div
            style={{
              color: '#777'
            }}
          >
            Total:
            {' '}
            {client.total}
          </div>

        </div>

      </div>

    ))
  }

</div>
      {/* Projects Grid */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}
      >

        {
          projects.map((proj) => {

            const status =
              statusConfig[proj.status]
              || statusConfig.pending

            const StatusIcon = status.icon

            return (

              <div
                key={proj.id}
                onClick={() =>
                  navigate(`/project/${proj.id}`)
                }
                style={{
                  background: '#141417',
                  border: '1px solid #1f1f24',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >

                <div style={{
  width: '100%', height: '160px',
  background: '#070709',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
}}>
  <div style={{
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'rgba(124,92,252,0.18)',
    border: '1.5px solid #7c5cfc',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }}>
    <div style={{
      width: 0, height: 0,
      borderTop: '8px solid transparent',
      borderBottom: '8px solid transparent',
      borderLeft: '14px solid #7c5cfc',
      marginLeft: '3px'
    }} />
  </div>
</div>

                <div style={{ padding: '14px' }}>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}
                  >

                    <div>

                      <h3
                        style={{
                          color: '#fff',
                          fontSize: '15px',
                          marginBottom: '4px'
                        }}
                      >
                        {proj.title}
                      </h3>

                      <p
                        style={{
                          color: '#777',
                          fontSize: '13px'
                        }}
                      >
                        {proj.client_name}
                      </p>

                    </div>

                    <div
                      style={{
                        background: status.bg,
                        color: status.color,
                        padding: '4px 8px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >

                      <StatusIcon size={12} />

                      {status.label}

                    </div>

                  </div>

                  <button
                    onClick={(e) => {

                      e.stopPropagation()

                      copyLink(proj.id)

                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid #2a2a31',
                      color: '#aaa',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px'
                    }}
                  >

                    {
                      copiedId === proj.id
                        ? <Check size={12} />
                        : <Copy size={12} />
                    }

                    {
                      copiedId === proj.id
                        ? 'Copied'
                        : 'Copy Review Link'
                    }

                  </button>

                </div>

              </div>

            )
          })
        }

      </div>

    </div>
  )
}
