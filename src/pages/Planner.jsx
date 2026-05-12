import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ChevronLeft, ChevronRight, Plus, X, Check } from 'lucide-react'

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']

const statusConfig = {
  idea:      { label: 'Idea',      color: '#6b6b7a', bg: '#1a1a1f' },
  scheduled: { label: 'Scheduled', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  posted:    { label: 'Posted',    color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
}

export default function Planner() {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [profile, setProfile] = useState(null)
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState('all')
  const [posts, setPosts] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', caption: '', status: 'idea', platform: 'Instagram' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchProfile() }, [])
  useEffect(() => { if (profile) { fetchClients(); fetchPosts() } }, [profile, month, year])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(data)
  }

  async function fetchClients() {
    const { data } = await supabase.from('clients').select('*')
      .eq('agency_id', profile.agency_id).order('name')
    if (data) setClients(data)
  }

  async function fetchPosts() {
    const { data } = await supabase.from('content_plans')
      .select('*')
      .eq('agency_id', profile.agency_id)
      .eq('month', month + 1)
      .eq('year', year)
    if (data) setPosts(data)
  }

  async function savePost(e) {
    e.preventDefault()
    if (!formData.title || !selectedDay) return
    setSaving(true)
    await supabase.from('content_plans').insert([{
      agency_id: profile.agency_id,
      client_name: selectedClient === 'all' ? (clients[0]?.name || 'General') : selectedClient,
      month: month + 1,
      year,
      day: selectedDay,
      title: formData.title,
      caption: formData.caption,
      status: formData.status,
      platform: formData.platform
    }])
    setFormData({ title: '', caption: '', status: 'idea', platform: 'Instagram' })
    setShowForm(false)
    setSaving(false)
    fetchPosts()
  }

  async function updateStatus(id, status) {
    await supabase.from('content_plans').update({ status }).eq('id', id)
    fetchPosts()
  }

  async function deletePost(id) {
    await supabase.from('content_plans').delete().eq('id', id)
    fetchPosts()
  }

  function getDaysInMonth(m, y) {
    return new Date(y, m + 1, 0).getDate()
  }

  function getFirstDayOfMonth(m, y) {
    return new Date(y, m, 1).getDay()
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function getPostsForDay(day) {
    return posts.filter(p => p.day === day &&
      (selectedClient === 'all' || p.client_name === selectedClient))
  }

  const daysInMonth = getDaysInMonth(month, year)
  const firstDay = getFirstDayOfMonth(month, year)
  const calendarCells = []
  for (let i = 0; i < firstDay; i++) calendarCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d)

  const filteredPosts = posts.filter(p =>
    selectedClient === 'all' || p.client_name === selectedClient)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#f0f0f4', marginBottom: '4px' }}>Content Planner</h1>
          <p style={{ fontSize: '13px', color: '#6b6b7a' }}>Plan and track content per client</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Client filter */}
          <select
            value={selectedClient}
            onChange={e => setSelectedClient(e.target.value)}
            style={{
              background: '#1a1a1f', border: '1px solid #2e2e3c',
              color: '#f0f0f4', borderRadius: '8px',
              padding: '7px 12px', fontSize: '13px'
            }}
          >
            <option value="all">All Clients</option>
            {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Month navigator */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        marginBottom: '16px'
      }}>
        <button onClick={prevMonth} style={{
          background: '#1a1a1f', border: '1px solid #2e2e3c',
          color: '#f0f0f4', borderRadius: '7px', padding: '6px 10px', cursor: 'pointer'
        }}><ChevronLeft size={16} /></button>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#f0f0f4', minWidth: '160px', textAlign: 'center' }}>
          {MONTHS[month]} {year}
        </div>
        <button onClick={nextMonth} style={{
          background: '#1a1a1f', border: '1px solid #2e2e3c',
          color: '#f0f0f4', borderRadius: '7px', padding: '6px 10px', cursor: 'pointer'
        }}><ChevronRight size={16} /></button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', fontSize: '12px', color: '#6b6b7a' }}>
          {Object.entries(statusConfig).map(([key, val]) => (
            <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: val.color, display: 'inline-block' }} />
              {val.label}: {filteredPosts.filter(p => p.status === key).length}
            </span>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div style={{
        background: '#141417', border: '1px solid #1e1e26',
        borderRadius: '12px', overflow: 'hidden', marginBottom: '16px'
      }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #1e1e26' }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} style={{
              padding: '10px', textAlign: 'center',
              fontSize: '11px', color: '#6b6b7a', fontWeight: 500,
              textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>{d}</div>
          ))}
        </div>

        {/* Calendar cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {calendarCells.map((day, idx) => {
            const dayPosts = day ? getPostsForDay(day) : []
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
            const isSelected = day === selectedDay
            return (
              <div
                key={idx}
                onClick={() => {
                  if (!day) return
                  setSelectedDay(day)
                  setShowForm(false)
                }}
                style={{
                  minHeight: '80px',
                  padding: '8px',
                  borderRight: (idx + 1) % 7 !== 0 ? '1px solid #1e1e26' : 'none',
                  borderBottom: idx < calendarCells.length - 7 ? '1px solid #1e1e26' : 'none',
                  background: isSelected ? 'rgba(124,92,252,0.08)' : 'transparent',
                  cursor: day ? 'pointer' : 'default',
                  transition: 'background 0.1s'
                }}
                onMouseEnter={e => { if (day && !isSelected) e.currentTarget.style.background = '#1a1a1f' }}
                onMouseLeave={e => { if (day && !isSelected) e.currentTarget.style.background = 'transparent' }}
              >
                {day && (
                  <>
                    <div style={{
                      fontSize: '12px', fontWeight: 500, marginBottom: '4px',
                      color: isToday ? '#fff' : '#6b6b7a',
                      background: isToday ? '#7c5cfc' : 'transparent',
                      width: '22px', height: '22px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>{day}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {dayPosts.slice(0, 3).map(post => (
                        <div key={post.id} style={{
                          fontSize: '10px', padding: '2px 5px', borderRadius: '3px',
                          background: statusConfig[post.status]?.bg || '#1a1a1f',
                          color: statusConfig[post.status]?.color || '#6b6b7a',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>
                          {post.title}
                        </div>
                      ))}
                      {dayPosts.length > 3 && (
                        <div style={{ fontSize: '10px', color: '#6b6b7a' }}>+{dayPosts.length - 3} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selectedDay && (
        <div style={{
          background: '#141417', border: '1px solid #1e1e26',
          borderRadius: '12px', padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#f0f0f4' }}>
              {MONTHS[month]} {selectedDay}, {year}
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                background: '#7c5cfc', border: 'none', color: '#fff',
                padding: '6px 14px', borderRadius: '7px', fontSize: '12px',
                fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
              }}
            >
              <Plus size={13} /> Add Post
            </button>
          </div>

          {/* Add post form */}
          {showForm && (
            <form onSubmit={savePost} style={{
              background: '#1a1a1f', border: '1px solid #2e2e3c',
              borderRadius: '10px', padding: '14px', marginBottom: '14px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b6b7a', marginBottom: '4px' }}>Post Title</div>
                  <input
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Product launch reel"
                  />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b6b7a', marginBottom: '4px' }}>Client</div>
                  <select
                    value={selectedClient === 'all' ? (clients[0]?.name || '') : selectedClient}
                    onChange={e => setSelectedClient(e.target.value)}
                    style={{
                      width: '100%', background: '#141417', border: '1px solid #2e2e3c',
                      color: '#f0f0f4', borderRadius: '8px', padding: '8px 10px', fontSize: '13px'
                    }}
                  >
                    {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b6b7a', marginBottom: '4px' }}>Platform</div>
                  <select
                    value={formData.platform}
                    onChange={e => setFormData({ ...formData, platform: e.target.value })}
                    style={{
                      width: '100%', background: '#141417', border: '1px solid #2e2e3c',
                      color: '#f0f0f4', borderRadius: '8px', padding: '8px 10px', fontSize: '13px'
                    }}
                  >
                    <option>Instagram</option>
                    <option>Facebook</option>
                    <option>YouTube</option>
                    <option>LinkedIn</option>
                    <option>Twitter</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b6b7a', marginBottom: '4px' }}>Status</div>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%', background: '#141417', border: '1px solid #2e2e3c',
                      color: '#f0f0f4', borderRadius: '8px', padding: '8px 10px', fontSize: '13px'
                    }}
                  >
                    <option value="idea">Idea</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="posted">Posted</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#6b6b7a', marginBottom: '4px' }}>Caption (optional)</div>
                <textarea
                  value={formData.caption}
                  onChange={e => setFormData({ ...formData, caption: e.target.value })}
                  rows={2}
                  placeholder="Write caption here..."
                  style={{ resize: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" disabled={saving} style={{
                  background: saving ? '#3a3a4a' : '#7c5cfc', border: 'none',
                  color: '#fff', padding: '7px 18px', borderRadius: '7px',
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer'
                }}>{saving ? 'Saving...' : 'Save Post'}</button>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  background: 'transparent', border: '1px solid #2e2e3c',
                  color: '#6b6b7a', padding: '7px 14px', borderRadius: '7px',
                  fontSize: '13px', cursor: 'pointer'
                }}>Cancel</button>
              </div>
            </form>
          )}

          {/* Posts for selected day */}
          {getPostsForDay(selectedDay).length === 0 && !showForm ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b6b7a', fontSize: '13px' }}>
              No posts planned for this day. Click Add Post to start.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {getPostsForDay(selectedDay).map(post => {
                const sc = statusConfig[post.status] || statusConfig.idea
                return (
                  <div key={post.id} style={{
                    background: '#1a1a1f', border: '1px solid #2e2e3c',
                    borderRadius: '9px', padding: '12px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#f0f0f4' }}>{post.title}</span>
                        <span style={{
                          background: sc.bg, color: sc.color,
                          padding: '2px 7px', borderRadius: '20px',
                          fontSize: '10px', fontWeight: 600, textTransform: 'uppercase'
                        }}>{sc.label}</span>
                        <span style={{
                          background: '#141417', color: '#6b6b7a',
                          padding: '2px 7px', borderRadius: '20px', fontSize: '10px'
                        }}>{post.platform}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b6b7a', marginBottom: post.caption ? '6px' : '0' }}>
                        {post.client_name}
                      </div>
                      {post.caption && (
                        <div style={{ fontSize: '12px', color: '#a0a0b0', lineHeight: 1.5 }}>{post.caption}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '5px', marginLeft: '12px', flexShrink: 0 }}>
                      {post.status !== 'posted' && (
                        <button onClick={() => updateStatus(post.id,
                          post.status === 'idea' ? 'scheduled' : 'posted'
                        )} style={{
                          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.22)',
                          color: '#22c55e', padding: '4px 8px', borderRadius: '6px',
                          fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px'
                        }}>
                          <Check size={10} />
                          {post.status === 'idea' ? 'Schedule' : 'Mark Posted'}
                        </button>
                      )}
                      <button onClick={() => deletePost(post.id)} style={{
                        background: 'transparent', border: '1px solid #2e2e3c',
                        color: '#6b6b7a', padding: '4px 8px', borderRadius: '6px',
                        fontSize: '11px', cursor: 'pointer'
                      }}><X size={10} /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}