import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CheckCircle, AlertCircle, MessageSquare, Clock } from 'lucide-react'

export default function ClientPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    fetchProject()
    fetchComments()
  }, [id])

  async function fetchProject() {
    const { data } = await supabase.from('projects').select('*').eq('id', id).single()
    if (data) setProject(data)
  }

  async function fetchComments() {
    const { data } = await supabase.from('comments').select('*')
      .eq('project_id', id)
      .eq('type', 'client')
      .order('created_at', { ascending: true })
    if (data) setComments(data)
  }

  async function handleApprove() {
    await supabase.from('projects').update({ status: 'approved' }).eq('id', id)
    fetchProject()
  }

  async function handleChanges() {
    const rev = (project?.revision_count || 0) + 1
    await supabase.from('projects').update({ status: 'changes requested', revision_count: rev }).eq('id', id)
    fetchProject()
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmitting(true)
    const ts = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0
    const mins = Math.floor(ts / 60)
    const secs = ts % 60
    const tsStr = `${mins}:${secs.toString().padStart(2, '0')}`
    await supabase.from('comments').insert([{
      project_id: id,
      comment,
      timestamp: tsStr,
      agency_id: project.agency_id,
      type: 'client'
    }])
    setComment('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
    fetchComments()
    setSubmitting(false)
  }

  function seekTo(ts) {
    if (!videoRef.current || !ts) return
    const [m, s] = ts.split(':').map(Number)
    videoRef.current.currentTime = m * 60 + s
    videoRef.current.play()
  }

  if (!project) return (
    <div style={{
      minHeight: '100vh', background: '#0c0c0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ color: '#6b6b7a', fontSize: '14px' }}>Loading project...</div>
    </div>
  )

  const atLimit = project.revision_count >= project.revision_limit

  return (
    <div style={{ minHeight: '100vh', background: '#0c0c0f', padding: '24px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Brand Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '20px', padding: '12px 16px',
          background: '#141417', border: '1px solid #1e1e26', borderRadius: '10px'
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
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f0f0f4' }}>Purple Media</div>
            <div style={{ fontSize: '10px', color: '#6b6b7a' }}>Video Review · No login needed</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{
              padding: '3px 9px', borderRadius: '20px', fontSize: '10px',
              fontWeight: 600, textTransform: 'uppercase',
              background: project.status === 'approved'
                ? 'rgba(34,197,94,0.1)'
                : project.status === 'changes requested'
                ? 'rgba(239,68,68,0.1)'
                : 'rgba(245,158,11,0.1)',
              color: project.status === 'approved'
                ? '#22c55e'
                : project.status === 'changes requested'
                ? '#ef4444'
                : '#f59e0b'
            }}>{project.status}</span>
          </div>
        </div>

        {/* Project Title */}
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#f0f0f4', marginBottom: '3px' }}>
            {project.title}
          </h1>
          <p style={{ fontSize: '13px', color: '#6b6b7a' }}>
            Review the video below and share your feedback
          </p>
        </div>

        {/* Video */}
        <div style={{
          background: '#070709', borderRadius: '10px', overflow: 'hidden',
          border: '1px solid #1e1e26', marginBottom: '16px'
        }}>
          <video ref={videoRef} src={project.video_url} controls
            style={{ width: '100%', display: 'block', maxHeight: '360px', objectFit: 'contain' }} />
        </div>

        {/* Approve / Changes */}
        {project.status !== 'approved' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <button onClick={handleApprove} style={{
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
              color: '#22c55e', padding: '12px', borderRadius: '9px',
              fontSize: '13px', fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}>
              <CheckCircle size={15} /> Looks good — Approve
            </button>
            <button onClick={handleChanges} disabled={atLimit} style={{
              background: atLimit ? '#141417' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${atLimit ? '#2e2e3c' : 'rgba(239,68,68,0.22)'}`,
              color: atLimit ? '#3a3a4a' : '#ef4444',
              padding: '12px', borderRadius: '9px', fontSize: '13px', fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              cursor: atLimit ? 'not-allowed' : 'pointer'
            }}>
              <AlertCircle size={15} />
              {atLimit ? 'Revision limit reached' : 'Need changes'}
            </button>
          </div>
        )}

        {project.status === 'approved' && (
          <div style={{
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '10px', padding: '16px', textAlign: 'center', marginBottom: '16px'
          }}>
            <CheckCircle size={20} style={{ color: '#22c55e', marginBottom: '6px' }} />
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#22c55e' }}>Video Approved</div>
            <div style={{ fontSize: '12px', color: '#6b6b7a', marginTop: '3px' }}>
              Thank you! The team has been notified.
            </div>
          </div>
        )}

        {/* Revision count */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 14px', background: '#141417', border: '1px solid #1e1e26',
          borderRadius: '8px', marginBottom: '16px'
        }}>
          <span style={{ fontSize: '12px', color: '#6b6b7a' }}>Revisions used</span>
          <span style={{ fontSize: '12px', fontWeight: 500, color: atLimit ? '#ef4444' : '#f0f0f4' }}>
            {project.revision_count} / {project.revision_limit}
          </span>
        </div>

        {/* Comment Form */}
        <div style={{
          background: '#141417', border: '1px solid #1e1e26',
          borderRadius: '10px', padding: '16px', marginBottom: '16px'
        }}>
          <div style={{
            fontSize: '13px', fontWeight: 500, marginBottom: '8px',
            color: '#f0f0f4', display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <MessageSquare size={14} /> Leave a comment
          </div>
          <p style={{ fontSize: '11px', color: '#6b6b7a', marginBottom: '10px' }}>
            Pause the video at the exact moment — timestamp is captured automatically
          </p>
          <form onSubmit={handleComment}>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              placeholder="Describe what you'd like changed..."
              style={{ marginBottom: '10px', resize: 'none' }}
            />
            <button type="submit" disabled={submitting} style={{
              background: submitting ? '#3a3a4a' : '#7c5cfc', border: 'none',
              color: '#fff', padding: '8px 20px', borderRadius: '8px',
              fontSize: '13px', fontWeight: 500, width: '100%'
            }}>
              {submitted ? '✓ Comment submitted!' : submitting ? 'Submitting...' : 'Submit Comment'}
            </button>
          </form>
        </div>

        {/* Comments List */}
        {comments.length > 0 && (
          <div style={{
            background: '#141417', border: '1px solid #1e1e26',
            borderRadius: '10px', overflow: 'hidden'
          }}>
            <div style={{
              padding: '12px 16px', borderBottom: '1px solid #1e1e26',
              fontSize: '13px', fontWeight: 500, color: '#f0f0f4'
            }}>
              Feedback ({comments.length})
            </div>
            {comments.map(c => (
              <div key={c.id} style={{ padding: '12px 16px', borderBottom: '1px solid #1e1e26' }}>
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
                <div style={{ fontSize: '13px', color: '#f0f0f4', lineHeight: 1.5 }}>
                  {c.comment}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}