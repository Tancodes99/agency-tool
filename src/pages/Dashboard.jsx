import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { uploadVideo } from '../lib/upload'
import { Plus, Copy, Check, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const statusConfig = {
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  approved: { label: 'Approved', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: CheckCircle },
  'changes requested': { label: 'Changes', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: AlertCircle },
}

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [title, setTitle] = useState('')
  const [clientName, setClientName] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { fetchProjects() }, [])

  async function fetchProjects() {
    const { data } = await supabase.from('projects').select('*')
.eq('archived', false)
.eq("archived", false).order('created_at', { ascending: false })
    if (data) setProjects(data)
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!file || !title || !clientName) return alert('Fill all fields')
    setUploading(true)
    try {
      const url = await uploadVideo(file)
      await supabase.from('projects').insert([{
        title, client_name: clientName, video_url: url,
        status: 'pending', revision_count: 0, revision_limit: 2
      }])
      setTitle(''); setClientName(''); setFile(null)
      setShowForm(false)
      fetchProjects()
    } catch (err) {
      alert('Upload failed')
    }
    setUploading(false)
  }

  async function handleApprove(id) {
    await supabase.from('projects').update({ status: 'approved' }).eq('id', id)
    fetchProjects()
  }

  async function handleChanges(id) {
    const proj = projects.find(p => p.id === id)
    await supabase.from('projects').update({
      status: 'changes requested',
      revision_count: (proj.revision_count || 0) + 1
    }).eq('id', id)
    fetchProjects()
  }

  async function handleAddRevision(id) {
    const proj = projects.find(p => p.id === id)
    await supabase.from('projects').update({
      revision_limit: (proj.revision_limit || 2) + 1
    }).eq('id', id)
    fetchProjects()
  }

  function copyLink(id) {
    navigator.clipboard.writeText(`${window.location.origin}/client/${id}`)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#f0f0f4', marginBottom: '4px' }}>Projects</h1>
          <p style={{ fontSize: '13px', color: '#6b6b7a' }}>{projects.length} active project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#7c5cfc', border: 'none', color: '#fff',
            padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500
          }}
        >
          <Plus size={14} /> New Project
        </button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div style={{
          background: '#141417', border: '1px solid #1e1e26',
          borderRadius: '12px', padding: '20px', marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '16px', color: '#f0f0f4' }}>Upload New Project</h3>
          <form onSubmit={handleUpload}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#6b6b7a', display: 'block', marginBottom: '5px' }}>Project Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Brand Film Reel" />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#6b6b7a', display: 'block', marginBottom: '5px' }}>Client Name</label>
                <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Spice House" />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: '#6b6b7a', display: 'block', marginBottom: '5px' }}>Video File</label>
              <input type="file" accept="video/*" onChange={e => setFile(e.target.files[0])}
                style={{ padding: '7px 12px', cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={uploading} style={{
                background: uploading ? '#3a3a4a' : '#7c5cfc', border: 'none',
                color: '#fff', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 500
              }}>
                {uploading ? 'Uploading...' : 'Upload Project'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                background: 'transparent', border: '1px solid #2e2e3c',
                color: '#6b6b7a', padding: '8px 16px', borderRadius: '8px', fontSize: '13px'
              }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
        {[
          { label: 'Total Projects', value: projects.length, color: '#a78bfa' },
          { label: 'Pending Review', value: projects.filter(p => p.status === 'pending').length, color: '#f59e0b' },
          { label: 'Approved', value: projects.filter(p => p.status === 'approved').length, color: '#22c55e' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#141417', border: '1px solid #1e1e26',
            borderRadius: '10px', padding: '14px'
          }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: '#6b6b7a', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div style={{
          background: '#141417', border: '1px dashed #2e2e3c',
          borderRadius: '12px', padding: '48px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
          <div style={{ fontSize: '14px', color: '#6b6b7a' }}>No projects yet. Upload your first one.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
          {projects.map(proj => {
            const status = statusConfig[proj.status] || statusConfig.pending
            const StatusIcon = status.icon
            const revPct = proj.revision_limit > 0 ? (proj.revision_count / proj.revision_limit) * 100 : 0
            const atLimit = proj.revision_count >= proj.revision_limit

            return (
              <div key={proj.id} onClick={() => navigate(`/project/${proj.id}`)} style={{
  background: '#141417',
  border: `1px solid ${atLimit && proj.status === 'changes requested' ? 'rgba(239,68,68,0.3)' : '#1e1e26'}`,
  borderRadius: '12px', overflow: 'hidden', cursor: 'pointer'
}}>
                {/* Video */}
                <div style={{ background: '#0a0a0d', position: 'relative' }}>
                  <video src={proj.video_url} controls
                    style={{ width: '100%', maxHeight: '180px', display: 'block', objectFit: 'cover' }} />
                </div>

                {/* Card Body */}
                <div style={{ padding: '14px' }}>
                  {/* Title + Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#f0f0f4', marginBottom: '2px' }}>{proj.title}</div>
                      <div style={{ fontSize: '12px', color: '#6b6b7a' }}>{proj.client_name}</div>
                    </div>
                    <span style={{
                      background: status.bg, color: status.color,
                      padding: '3px 8px', borderRadius: '20px',
                      fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
                      display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0
                    }}>
                      <StatusIcon size={10} />
                      {status.label}
                    </span>
                  </div>

                  {/* Revision Bar */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '11px', color: '#6b6b7a' }}>Revisions</span>
                      <span style={{ fontSize: '11px', color: atLimit ? '#ef4444' : '#f0f0f4', fontWeight: 500 }}>
                        {proj.revision_count} / {proj.revision_limit}
                        {atLimit && ' — limit reached'}
                      </span>
                    </div>
                    <div style={{ height: '3px', background: '#1e1e26', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '2px',
                        width: `${Math.min(revPct, 100)}%`,
                        background: atLimit ? '#ef4444' : '#7c5cfc',
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button onClick={() => handleApprove(proj.id)} style={{
                      background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                      color: '#22c55e', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500
                    }}>Approve</button>

                    <button onClick={() => handleChanges(proj.id)} style={{
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.22)',
                      color: '#ef4444', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500
                    }}>Changes</button>

                    <button onClick={() => handleAddRevision(proj.id)} style={{
                      background: 'transparent', border: '1px solid #2e2e3c',
                      color: '#6b6b7a', padding: '5px 10px', borderRadius: '6px', fontSize: '11px',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}><RefreshCw size={10} /> +Rev</button>

                    <button onClick={() => copyLink(proj.id)} style={{
                      background: 'transparent', border: '1px solid #2e2e3c',
                      color: copiedId === proj.id ? '#22c55e' : '#6b6b7a',
                      padding: '5px 10px', borderRadius: '6px', fontSize: '11px',
                      display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto'
                    }}>
                      {copiedId === proj.id ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy Link</>}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}