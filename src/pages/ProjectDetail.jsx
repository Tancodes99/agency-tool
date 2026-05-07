import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  logActivity
} from '../lib/activity'
import {
  canApprove,
  canDelete
} from '../lib/permissions'
import { ArrowLeft, Clock, CheckCircle, AlertCircle, MessageSquare, Lock } from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [comments, setComments] = useState([])
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [profile, setProfile] = useState(null)
  const videoRef = useRef(null)

 useEffect(() => {

  fetchAll()

  fetchProfile()

}, [id])
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

  async function fetchAll() {
    const { data: p } = await supabase.from('projects').select('*').eq('id', id).single()
    const { data: c } = await supabase.from('comments').select('*').eq('project_id', id).order('created_at', { ascending: true })
    if (p) setProject(p)
    if (c) setComments(c)
  }

  async function handleApprove() {
    await supabase.from('projects').update({ status: 'approved' }).eq('id', id)
    await logActivity({
  agencyId: project.agency_id,
  projectId: id,
  userEmail: 'Owner',
  action: 'Approved project',
})
    await logActivity({
  agencyId: project.agency_id,
  projectId: id,
  userEmail: profile?.email,
  action: 'approved project',
})
    fetchAll()
  }

  async function handleChanges() {
    const rev = (project?.revision_count || 0) + 1
    await supabase.from('projects').update({ status: 'changes requested', revision_count: rev }).eq('id', id)
   await logActivity({
  agencyId: project.agency_id,
  projectId: id,
  userEmail: 'Owner',
  action: 'Requested changes',
})
    await logActivity({
  agencyId: project.agency_id,
  projectId: id,
  userEmail: profile?.email,
  action: 'requested changes',
})
    fetchAll()
  }

  async function handleAddRevision() {
    await supabase.from('projects').update({ revision_limit: (project.revision_limit || 2) + 1 }).eq('id', id)
    fetchAll()
  }

  async function addInternalNote(e) {

    e.preventDefault()
    if (!note.trim()) return
    setSubmitting(true)
    const ts = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0
    const mins = Math.floor(ts / 60)
    const secs = ts % 60
    const tsStr = `${mins}:${secs.toString().padStart(2, '0')}`
    await supabase.from('comments').insert([{
      project_id: id,
      comment: note,
      timestamp: tsStr,
      type: 'internal'
    }])
    await logActivity({
  agencyId: project.agency_id,
  projectId: id,
  userEmail: profile?.email,
  action: 'added internal note',
})
    setNote('')
    fetchAll()
    setSubmitting(false)
  }
    

  function seekTo(ts) {
    if (!videoRef.current || !ts) return
    const [m, s] = ts.split(':').map(Number)
    videoRef.current.currentTime = m * 60 + s
    videoRef.current.play()
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/client/${id}`)
    alert('Client link copied!')
  }

  if (!project) return (
    <div style={{ color: '#6b6b7a', padding: '40px', textAlign: 'center' }}>Loading...</div>
  )

  const atLimit = project.revision_count >= project.revision_limit
  const isLocked = project.status === 'approved'

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <button onClick={() => navigate('/')} style={{
            background: 'transparent', border: 'none', color: '#6b6b7a',
            fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', padding: 0
          }}>
            <ArrowLeft size={13} /> Back to Projects
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#f0f0f4' }}>{project.title}</h1>
            <span style={{
              padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
              background: project.status === 'approved' ? 'rgba(34,197,94,0.1)' : project.status === 'changes requested' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
              color: project.status === 'approved' ? '#22c55e' : project.status === 'changes requested' ? '#ef4444' : '#f59e0b'
            }}>{project.status}</span>
            {isLocked && <Lock size={13} style={{ color: '#6b6b7a' }} />}
          </div>
          <div style={{ fontSize: '12px', color: '#6b6b7a' }}>{project.client_name}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={copyLink} style={{
            background: 'transparent', border: '1px solid #2e2e3c',
            color: '#6b6b7a', padding: '7px 14px', borderRadius: '8px', fontSize: '12px'
          }}>Share Client Link</button>
          {!isLocked && (
            <button onClick={handleAddRevision} style={{
              background: 'transparent', border: '1px solid #2e2e3c',
              color: '#6b6b7a', padding: '7px 14px', borderRadius: '8px', fontSize: '12px'
            }}>+ Add Revision</button>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', alignItems: 'start' }}>

        {/* Left — Video */}
        <div>
          <div style={{ background: '#070709', borderRadius: '10px', overflow: 'hidden', border: '1px solid #1e1e26', marginBottom: '12px' }}>
            <video ref={videoRef} src={project.video_url} controls
              style={{ width: '100%', display: 'block', maxHeight: '380px', objectFit: 'contain' }} />
          </div>

          {/* Revision info */}
          <div style={{
            background: '#141417', border: `1px solid ${atLimit ? 'rgba(239,68,68,0.3)' : '#1e1e26'}`,
            borderRadius: '10px', padding: '14px', marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b6b7a' }}>Revisions</span>
              <span style={{ fontSize: '12px', fontWeight: 500, color: atLimit ? '#ef4444' : '#f0f0f4' }}>
                {project.revision_count} / {project.revision_limit}
                {atLimit && ' — limit reached'}
              </span>
            </div>
            <div style={{ height: '3px', background: '#1e1e26', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '2px',
                width: `${Math.min((project.revision_count / project.revision_limit) * 100, 100)}%`,
                background: atLimit ? '#ef4444' : '#7c5cfc'
              }} />
            </div>
          </div>

          {/* Action buttons */}
{
  !isLocked &&
  canApprove(profile?.role) && (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridAutoRows: '1fr',
    gap: '8px'
  }}>

    <button
      onClick={handleApprove}
      style={{
        background: 'rgba(34,197,94,0.1)',
        border: '1px solid rgba(34,197,94,0.25)',
        color: '#22c55e',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }}
    >
      <CheckCircle size={14} />
      Approve
    </button>

    <button
      onClick={handleChanges}
      disabled={atLimit}
      style={{
        background: atLimit
          ? '#141417'
          : 'rgba(239,68,68,0.08)',
        border: `1px solid ${
          atLimit
            ? '#2e2e3c'
            : 'rgba(239,68,68,0.22)'
        }`,
        color: atLimit
          ? '#3a3a4a'
          : '#ef4444',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        cursor: atLimit
          ? 'not-allowed'
          : 'pointer'
      }}
    >
      <AlertCircle size={14} />
      Request Changes
    </button>

    <button
      onClick={async () => {

        await supabase
          .from('projects')
          .update({
            archived: true,
            archived_at: new Date(),
          })
          .eq('id', id)

        navigate('/')

      }}
      style={{
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.22)',
        color: '#f59e0b',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }}
    >
      Archive Project
    </button>

    <button
      onClick={async () => {

        const confirmDelete = window.confirm(
          'Permanently delete this project?'
        )

        if (!confirmDelete) return

        await supabase
          .from('comments')
          .delete()
          .eq('project_id', id)

        await supabase
          .from('projects')
          .delete()
          .eq('id', id)

        navigate('/')

      }}
      style={{
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.22)',
        color: '#ef4444',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }}
    >
      Delete Permanently
    </button>

  </div>
)}

          {isLocked && (
            <div style={{
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '10px', padding: '14px', textAlign: 'center'
            }}>
              <CheckCircle size={18} style={{ color: '#22c55e', marginBottom: '5px' }} />
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#22c55e' }}>Approved & Locked</div>
              <div style={{ fontSize: '11px', color: '#6b6b7a', marginTop: '3px' }}>No further changes can be made</div>
            </div>
          )}
        </div>

        {/* Right — Comments */}
        <div style={{ background: '#141417', border: '1px solid #1e1e26', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #1e1e26', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={13} /> Comments
              <span style={{ color: '#6b6b7a', fontWeight: 400 }}>({comments.length})</span>
            </div>
          </div>

          {/* Comments list */}
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {comments.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#6b6b7a', fontSize: '12px' }}>
                No comments yet
              </div>
            ) : (
              comments.map(c => (
                <div key={c.id} style={{
                  padding: '10px 14px', borderBottom: '1px solid #1e1e26',
                  borderLeft: c.type === 'internal' ? '2px solid rgba(96,165,250,0.4)' : 'none'
                }}>
                  {c.timestamp && (
                    <button onClick={() => seekTo(c.timestamp)} style={{
                      background: 'rgba(124,92,252,0.12)', border: 'none',
                      color: '#a78bfa', borderRadius: '4px', padding: '2px 7px',
                      fontSize: '11px', fontWeight: 500, marginBottom: '5px',
                      display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer'
                    }}>
                      <Clock size={10} /> {c.timestamp}
                    </button>
                  )}
                  <div style={{ fontSize: '12px', color: '#f0f0f4', lineHeight: 1.5 }}>{c.comment}</div>
                  <div style={{ fontSize: '10px', color: '#6b6b7a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {c.type === 'internal'
                      ? <span style={{ color: '#60a5fa' }}>Internal note</span>
                      : <span>Client</span>
                    }
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Internal note input */}
          {!isLocked && (
            <div style={{ padding: '12px 14px', borderTop: '1px solid #1e1e26' }}>
              <div style={{ fontSize: '11px', color: '#6b6b7a', marginBottom: '7px' }}>
                Add internal note (hidden from client)
              </div>
              <form onSubmit={addInternalNote}>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                  placeholder="e.g. Slow logo at 0:08..."
                  style={{ marginBottom: '8px', resize: 'none', fontSize: '12px' }}
                />
                <button type="submit" disabled={submitting} style={{
                  background: '#7c5cfc', border: 'none', color: '#fff',
                  padding: '7px', borderRadius: '7px', fontSize: '12px',
                  fontWeight: 500, width: '100%'
                }}>
                  {submitting ? 'Adding...' : 'Add Note'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}