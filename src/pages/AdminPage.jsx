import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AppShell from '../components/AppShell'

export default function AdminPage() {
  const [agent, setAgent] = useState(null)
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [creating, setCreating] = useState(false)
  const [msg, setMsg] = useState(null) // { type: 'success'|'error', text }
  const navigate = useNavigate()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: me } = await supabase.from('agents').select('*').eq('user_id', user.id).single()
    if (!me?.is_admin) { navigate('/app/dashboard'); return }
    setAgent(me)
    await loadAgents()
  }

  async function loadAgents() {
    const { data } = await supabase.from('agents').select('*').order('created_at', { ascending: false })
    setAgents(data || [])
    setLoading(false)
  }

  async function toggleAgent(agentId, currentStatus) {
    await supabase.from('agents').update({ is_active: !currentStatus }).eq('id', agentId)
    await loadAgents()
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    setMsg(null)

    // Ambil session token untuk authorize Edge Function
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setMsg({ type: 'error', text: 'Sesi habis. Silakan login ulang.' })
      setCreating(false)
      return
    }

    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

    const resp = await fetch(`${SUPABASE_URL}/functions/v1/create-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        full_name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
    })

    const result = await resp.json()

    if (result.success) {
      setMsg({ type: 'success', text: `✓ ${result.message}` })
      setForm({ name: '', email: '', password: '' })
      await loadAgents() // refresh daftar
    } else {
      setMsg({ type: 'error', text: result.error || 'Gagal membuat akun. Coba lagi.' })
    }

    setCreating(false)
  }

  const stats = {
    total: agents.length,
    active: agents.filter(a => a.is_active).length,
    inactive: agents.filter(a => !a.is_active).length,
  }

  return (
    <AppShell agent={agent}>
      <h1 style={s.title}>Admin Panel</h1>
      <p style={s.subtitle}>Kelola akun agen tim Koben.</p>

      {/* Stats */}
      <div style={s.statsRow}>
        {[['Total Agen', stats.total], ['Aktif', stats.active], ['Nonaktif', stats.inactive]].map(([lbl, val]) => (
          <div key={lbl} style={s.statCard}>
            <div style={s.statVal}>{val}</div>
            <div style={s.statLbl}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Create form */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Tambah Agen Baru</h2>
        <div style={s.card}>
          <form onSubmit={handleCreate} style={s.form}>
            <div style={s.fieldRow}>
              <div style={s.field}>
                <label style={s.label}>Nama Lengkap *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  style={s.input} placeholder="Nama agen" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  style={s.input} placeholder="email@domain.com" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Password Awal *</label>
                <input type="text" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  style={s.input} placeholder="min. 8 karakter" minLength={8} required />
              </div>
            </div>

            {msg && (
              <div style={{
                padding: '12px 14px', borderRadius: '8px', fontSize: '13px', lineHeight: 1.5,
                background: msg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${msg.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
                color: msg.type === 'success' ? '#166534' : '#991B1B',
              }}>{msg.text}</div>
            )}

            <button type="submit" disabled={creating} style={{
              ...s.createBtn,
              opacity: creating ? 0.7 : 1,
              cursor: creating ? 'not-allowed' : 'pointer'
            }}>
              {creating ? 'Membuat akun...' : '+ Tambah Agen'}
            </button>
          </form>

          <div style={s.tip}>
            💡 Agen dapat langsung login setelah akun dibuat. Berikan email dan password kepada agen bersangkutan.
          </div>
        </div>
      </div>

      {/* Agent list */}
      <div style={s.section}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
          <h2 style={s.sectionTitle}>Daftar Agen ({agents.length})</h2>
          <button onClick={loadAgents} style={s.refreshBtn}>↻ Refresh</button>
        </div>
        {loading ? (
          <div style={{ color:'#aaa', fontSize:'14px' }}>Memuat...</div>
        ) : (
          <div style={s.agentList}>
            {agents.map(a => (
              <div key={a.id} style={s.agentCard}>
                <div style={{ ...s.avatar, background: a.is_admin ? '#C0392B' : '#4F46E5' }}>
                  {(a.full_name?.[0] || a.email?.[0] || 'A').toUpperCase()}
                </div>
                <div style={s.agentInfo}>
                  <div style={s.agentName}>{a.full_name || a.email?.split('@')[0]}</div>
                  <div style={s.agentEmail}>{a.email}</div>
                  {a.is_admin && <span style={s.adminBadge}>Super Admin</span>}
                </div>
                <div style={s.agentActions}>
                  <span style={{ ...s.dot, background: a.is_active ? '#059669' : '#D1D5DB' }} />
                  <span style={{ fontSize:'12px', color:'#888' }}>{a.is_active ? 'Aktif' : 'Nonaktif'}</span>
                  {!a.is_admin && (
                    <button onClick={() => toggleAgent(a.id, a.is_active)}
                      style={{ ...s.toggleBtn, background: a.is_active ? '#FEE2E2' : '#D1FAE5', color: a.is_active ? '#991B1B' : '#065F46' }}>
                      {a.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}

const s = {
  title: { fontSize:'22px', fontWeight:'700', color:'#1a1a1a', marginBottom:'6px' },
  subtitle: { fontSize:'14px', color:'#888', marginBottom:'24px' },
  statsRow: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'24px' },
  statCard: { background:'#fff', borderRadius:'10px', padding:'16px', border:'1px solid #eee', textAlign:'center' },
  statVal: { fontSize:'24px', fontWeight:'700', color:'#1a1a1a' },
  statLbl: { fontSize:'12px', color:'#888', marginTop:'4px' },
  section: { marginBottom:'28px' },
  sectionTitle: { fontSize:'15px', fontWeight:'600', color:'#333', margin:0 },
  card: { background:'#fff', borderRadius:'10px', padding:'20px', border:'1px solid #eee' },
  form: { display:'flex', flexDirection:'column', gap:'16px' },
  fieldRow: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'12px' },
  field: { display:'flex', flexDirection:'column', gap:'5px' },
  label: { fontSize:'12px', fontWeight:'500', color:'#555' },
  input: { padding:'9px 11px', borderRadius:'7px', border:'1px solid #ddd', fontSize:'13px', color:'#1a1a1a', outline:'none' },
  createBtn: { padding:'11px 20px', background:'#C0392B', color:'#fff', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'600', alignSelf:'flex-start' },
  tip: { marginTop:'14px', background:'#FFFBEB', border:'1px solid #FCD34D', borderRadius:'8px', padding:'10px 14px', fontSize:'12px', color:'#78350F', lineHeight:1.6 },
  agentList: { display:'flex', flexDirection:'column', gap:'8px' },
  agentCard: { background:'#fff', borderRadius:'10px', padding:'12px 16px', border:'1px solid #eee', display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' },
  avatar: { width:'36px', height:'36px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'14px', flexShrink:0 },
  agentInfo: { flex:1, minWidth:'120px' },
  agentName: { fontSize:'14px', fontWeight:'600', color:'#1a1a1a' },
  agentEmail: { fontSize:'12px', color:'#888' },
  adminBadge: { display:'inline-block', marginTop:'3px', background:'#C0392B', color:'#fff', fontSize:'9px', fontWeight:'700', padding:'2px 6px', borderRadius:'4px', textTransform:'uppercase' },
  agentActions: { display:'flex', alignItems:'center', gap:'8px', flexShrink:0 },
  dot: { width:'8px', height:'8px', borderRadius:'50%', display:'inline-block' },
  toggleBtn: { padding:'5px 12px', border:'none', borderRadius:'6px', fontSize:'12px', fontWeight:'500', cursor:'pointer' },
  refreshBtn: { background:'none', border:'1px solid #ddd', borderRadius:'7px', padding:'5px 10px', fontSize:'12px', color:'#666', cursor:'pointer' },
}
