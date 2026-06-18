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

  async function handleCreate(e) {
    e.preventDefault()
    if (form.password.length < 8) { setMsg({ type:'error', text:'Password minimal 8 karakter.' }); return }
    setCreating(true)
    setMsg(null)

    try {
      // Ambil token Super Admin untuk kirim ke Edge Function
      const { data: { session } } = await supabase.auth.getSession()
      
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-agent`,
        {
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
          }),
        }
      )

      const result = await res.json()

      if (!res.ok || result.error) {
        setMsg({ type:'error', text: result.error || 'Gagal membuat akun. Coba lagi.' })
      } else {
        setMsg({ type:'success', text: `✓ Akun agen "${form.name}" (${form.email}) berhasil dibuat dan langsung aktif!` })
        setForm({ name:'', email:'', password:'' })
        await loadAgents() // refresh daftar
      }
    } catch (err) {
      setMsg({ type:'error', text: 'Koneksi error. Pastikan internet aktif.' })
    } finally {
      setCreating(false)
    }
  }

  async function toggleAgent(agentId, currentStatus) {
    await supabase.from('agents').update({ is_active: !currentStatus }).eq('id', agentId)
    await loadAgents()
  }

  const stats = {
    total: agents.length,
    active: agents.filter(a => a.is_active).length,
    inactive: agents.filter(a => !a.is_active).length,
  }

  return (
    <AppShell agent={agent}>
      <h1 style={s.title}>Admin Panel</h1>
      <p style={s.subtitle}>Kelola akun agen tim {agent?.full_name || 'Koben'}.</p>

      {/* Stats */}
      <div style={s.statsRow}>
        {[['Total Agen', stats.total], ['Aktif', stats.active], ['Nonaktif', stats.inactive]].map(([lbl, val]) => (
          <div key={lbl} style={s.statCard}>
            <div style={s.statVal}>{val}</div>
            <div style={s.statLbl}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Form Tambah Agen */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Tambah Agen Baru</h2>
        <div style={s.formCard}>
          <form onSubmit={handleCreate} style={s.form}>
            <div className="kd-admin-field-row" style={s.fieldRow}>
              <div style={s.field}>
                <label style={s.label}>Nama Lengkap *</label>
                <input
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  style={s.input} placeholder="Nama agen" required
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  style={s.input} placeholder="email@domain.com" required
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Password Awal *</label>
                <input
                  type="text"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  style={s.input} placeholder="min. 8 karakter" required minLength={8}
                />
              </div>
            </div>

            {msg && (
              <div style={{
                ...s.msg,
                background: msg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${msg.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
                color: msg.type === 'success' ? '#166534' : '#991B1B',
              }}>
                {msg.text}
              </div>
            )}

            <div style={s.formNote}>
              💡 Akun agen akan langsung aktif setelah dibuat. Agen bisa langsung login di <strong>kenaldiri.vercel.app</strong> dengan email dan password yang diisi di sini.
            </div>

            <button type="submit" disabled={creating} style={s.submitBtn}>
              {creating ? (
                <span>Membuat akun...</span>
              ) : (
                <span>+ Tambah Agen</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Daftar Agen */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Daftar Agen ({agents.length})</h2>
          <button onClick={loadAgents} style={s.refreshBtn}>↻ Refresh</button>
        </div>

        {loading ? (
          <div style={{ color:'#aaa', fontSize:'14px' }}>Memuat...</div>
        ) : (
          <div style={s.agentList}>
            {agents.map(a => (
              <div key={a.id} style={s.agentCard}>
                <div style={{ ...s.agentAvatar, background: a.is_admin ? '#C0392B' : '#4F46E5' }}>
                  {(a.full_name?.[0] || a.email?.[0] || 'A').toUpperCase()}
                </div>
                <div style={s.agentInfo}>
                  <div style={s.agentName}>{a.full_name || a.email?.split('@')[0]}</div>
                  <div style={s.agentEmail}>{a.email}</div>
                  {a.is_admin && <span style={s.adminBadge}>Super Admin</span>}
                </div>
                <div style={s.agentRight}>
                  <div style={s.statusRow}>
                    <div style={{ ...s.dot, background: a.is_active ? '#059669' : '#D1D5DB' }} />
                    <span style={s.statusText}>{a.is_active ? 'Aktif' : 'Nonaktif'}</span>
                  </div>
                  {!a.is_admin && (
                    <button
                      onClick={() => toggleAgent(a.id, a.is_active)}
                      style={{
                        ...s.toggleBtn,
                        background: a.is_active ? '#FEE2E2' : '#D1FAE5',
                        color: a.is_active ? '#991B1B' : '#065F46',
                      }}>
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
  title: { fontSize:'22px', fontWeight:'700', color:'#1a1a1a', margin:'0 0 6px' },
  subtitle: { fontSize:'14px', color:'#888', marginBottom:'24px' },
  statsRow: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'28px' },
  statCard: { background:'#fff', borderRadius:'10px', padding:'16px', border:'1px solid #eee', textAlign:'center' },
  statVal: { fontSize:'24px', fontWeight:'700', color:'#1a1a1a' },
  statLbl: { fontSize:'12px', color:'#888', marginTop:'4px' },
  section: { marginBottom:'28px' },
  sectionTitle: { fontSize:'15px', fontWeight:'600', color:'#1a1a1a', margin:'0 0 12px' },
  sectionHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' },
  refreshBtn: { background:'none', border:'1px solid #ddd', borderRadius:'8px', padding:'6px 12px', fontSize:'12px', color:'#666', cursor:'pointer' },
  formCard: { background:'#fff', borderRadius:'12px', padding:'24px', border:'1px solid #eee' },
  form: { display:'flex', flexDirection:'column', gap:'16px' },
  fieldRow: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px' },
  field: { display:'flex', flexDirection:'column', gap:'5px' },
  label: { fontSize:'12px', fontWeight:'500', color:'#555' },
  input: { padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', color:'#1a1a1a', outline:'none', fontFamily:'inherit' },
  msg: { borderRadius:'8px', padding:'12px 14px', fontSize:'13px', lineHeight:1.5 },
  formNote: { background:'#FFF7ED', border:'1px solid #FED7AA', borderRadius:'8px', padding:'12px 14px', fontSize:'13px', color:'#92400E', lineHeight:1.6 },
  submitBtn: { padding:'12px 20px', background:'#C0392B', color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor:'pointer', alignSelf:'flex-start' },
  agentList: { display:'flex', flexDirection:'column', gap:'8px' },
  agentCard: { background:'#fff', borderRadius:'10px', padding:'14px 18px', border:'1px solid #eee', display:'flex', alignItems:'center', gap:'14px' },
  agentAvatar: { width:'36px', height:'36px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'14px', flexShrink:0 },
  agentInfo: { flex:1, minWidth:0 },
  agentName: { fontSize:'14px', fontWeight:'600', color:'#1a1a1a' },
  agentEmail: { fontSize:'12px', color:'#888', marginTop:'1px' },
  adminBadge: { display:'inline-block', marginTop:'3px', background:'#FEE2E2', color:'#991B1B', fontSize:'10px', fontWeight:'600', padding:'2px 7px', borderRadius:'4px' },
  agentRight: { display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'6px', flexShrink:0 },
  statusRow: { display:'flex', alignItems:'center', gap:'6px' },
  dot: { width:'7px', height:'7px', borderRadius:'50%' },
  statusText: { fontSize:'12px', color:'#888' },
  toggleBtn: { padding:'5px 12px', border:'none', borderRadius:'6px', fontSize:'12px', fontWeight:'500', cursor:'pointer', whiteSpace:'nowrap' },
}
