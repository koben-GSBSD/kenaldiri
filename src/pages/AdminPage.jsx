import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AppShell from '../components/AppShell'

export default function AdminPage() {
  const [agent, setAgent] = useState(null)
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [newAgent, setNewAgent] = useState({ name: '', email: '', password: '' })
  const [creating, setCreating] = useState(false)
  const [msg, setMsg] = useState(null) // { type: 'success'|'error', text: string }
  const navigate = useNavigate()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: agentData } = await supabase.from('agents').select('*').eq('user_id', user.id).single()
    if (!agentData?.is_admin) { navigate('/app/dashboard'); return }
    setAgent(agentData)
    await loadAgents()
  }

  async function loadAgents() {
    // Admin bisa lihat semua agen via RLS policy
    const { data } = await supabase.from('agents').select('*').order('created_at', { ascending: false })
    setAgents(data || [])
    setLoading(false)
  }

  async function toggleAgent(agentId, currentStatus) {
    await supabase.from('agents').update({ is_active: !currentStatus }).eq('id', agentId)
    await loadAgents()
  }

  async function handleCreateAgent(e) {
    e.preventDefault()
    setCreating(true)
    setMsg(null)

    // Gunakan Supabase Auth Admin API via service role
    // Karena kita pakai anon key, kita perlu pendekatan alternatif:
    // 1. Koben create via Supabase Dashboard (yang sudah terbukti bekerja)
    // 2. Atau tampilkan instruksi jelas dengan data yang sudah diisi

    // Simulasi: tampilkan panduan dengan data sudah terisi
    setMsg({
      type: 'info',
      text: `Untuk menambah agen baru:\n\n1. Buka link ini di tab baru:\nhttps://supabase.com/dashboard/project/zlzmyftafysmcahmmkfj/auth/users\n\n2. Klik "Add user" → "Create new user"\n3. Isi Email: ${newAgent.email}\n4. Isi Password: ${newAgent.password}\n5. Centang "Auto confirm user"\n6. Klik "Create User"\n\nAgen akan otomatis muncul di daftar ini setelah dibuat.`
    })
    setCreating(false)
  }

  async function openSupabaseDashboard() {
    window.open('https://supabase.com/dashboard/project/zlzmyftafysmcahmmkfj/auth/users', '_blank')
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

      <div style={s.statsRow}>
        {[['Total Agen', stats.total], ['Aktif', stats.active], ['Nonaktif', stats.inactive]].map(([label, val]) => (
          <div key={label} style={s.statCard}>
            <div style={s.statVal}>{val}</div>
            <div style={s.statLbl}>{label}</div>
          </div>
        ))}
      </div>

      {/* Create agent */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Tambah Agen Baru</h2>
        <div style={s.formCard}>
          <form onSubmit={handleCreateAgent} style={s.form}>
            <div style={s.fieldRow}>
              <div style={s.field}>
                <label style={s.label}>Nama Lengkap</label>
                <input value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value})} style={s.input} placeholder="Nama agen" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Email</label>
                <input type="email" value={newAgent.email} onChange={e => setNewAgent({...newAgent, email: e.target.value})} style={s.input} placeholder="email@domain.com" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Password Awal</label>
                <input type="text" value={newAgent.password} onChange={e => setNewAgent({...newAgent, password: e.target.value})} style={s.input} placeholder="min. 8 karakter" minLength={8} required />
              </div>
            </div>

            {msg && (
              <div style={{
                ...s.msgBox,
                background: msg.type === 'info' ? '#EFF6FF' : msg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${msg.type === 'info' ? '#BFDBFE' : msg.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
                color: msg.type === 'info' ? '#1E40AF' : msg.type === 'success' ? '#166534' : '#991B1B',
              }}>
                <pre style={{ margin:0, fontFamily:'inherit', whiteSpace:'pre-wrap', fontSize:'13px', lineHeight:1.6 }}>{msg.text}</pre>
              </div>
            )}

            <div style={s.btnRow}>
              <button type="submit" disabled={creating} style={s.createBtn}>
                {creating ? 'Memproses...' : 'Panduan Buat Akun'}
              </button>
              <button type="button" onClick={openSupabaseDashboard} style={s.directBtn}>
                Buka Supabase Dashboard ↗
              </button>
            </div>
          </form>

          <div style={s.tipBox}>
            <strong>💡 Cara termudah:</strong> Klik "Buka Supabase Dashboard" di atas → Add user → Create new user → isi email &amp; password → centang Auto confirm → Create User. Agen langsung aktif dan muncul di daftar.
          </div>
        </div>
      </div>

      {/* Agent list */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Daftar Agen ({agents.length})</h2>
          <button onClick={loadAgents} style={s.refreshBtn}>↻ Refresh</button>
        </div>
        {loading ? <div style={{ color:'#aaa', fontSize:'14px' }}>Memuat...</div> : (
          <div style={s.agentList}>
            {agents.map(a => (
              <div key={a.id} style={s.agentCard}>
                <div style={{ ...s.agentAvatar, background: a.is_admin ? '#C0392B' : '#6366F1' }}>
                  {(a.full_name?.[0] || a.email?.[0] || 'A').toUpperCase()}
                </div>
                <div style={s.agentInfo}>
                  <div style={s.agentName}>{a.full_name || a.email?.split('@')[0]}</div>
                  <div style={s.agentEmail}>{a.email}</div>
                  {a.is_admin && <span style={s.adminBadge}>Admin</span>}
                </div>
                <div style={s.agentActions}>
                  <span style={{ ...s.statusDot, background: a.is_active ? '#059669' : '#D1D5DB' }} />
                  <span style={s.statusText}>{a.is_active ? 'Aktif' : 'Nonaktif'}</span>
                  {!a.is_admin && (
                    <button
                      onClick={() => toggleAgent(a.id, a.is_active)}
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
  title: { fontSize:'22px', fontWeight:'700', color:'#1a1a1a', marginBottom:'8px' },
  subtitle: { fontSize:'14px', color:'#888', marginBottom:'24px' },
  statsRow: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'28px' },
  statCard: { background:'#fff', borderRadius:'10px', padding:'16px', border:'1px solid #eee', textAlign:'center' },
  statVal: { fontSize:'24px', fontWeight:'700', color:'#1a1a1a' },
  statLbl: { fontSize:'12px', color:'#888', marginTop:'4px' },
  section: { marginBottom:'28px' },
  sectionTitle: { fontSize:'15px', fontWeight:'600', color:'#333', margin:0 },
  sectionHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' },
  refreshBtn: { background:'none', border:'1px solid #ddd', borderRadius:'8px', padding:'6px 12px', fontSize:'12px', color:'#666', cursor:'pointer' },
  formCard: { background:'#fff', borderRadius:'10px', padding:'20px', border:'1px solid #eee' },
  form: { display:'flex', flexDirection:'column', gap:'16px' },
  fieldRow: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px' },
  field: { display:'flex', flexDirection:'column', gap:'5px' },
  label: { fontSize:'12px', fontWeight:'500', color:'#666' },
  input: { padding:'8px 10px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'13px', color:'#1a1a1a' },
  msgBox: { borderRadius:'8px', padding:'12px 14px' },
  btnRow: { display:'flex', gap:'10px', flexWrap:'wrap' },
  createBtn: { padding:'10px 18px', background:'#C0392B', color:'#fff', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'600', cursor:'pointer' },
  directBtn: { padding:'10px 18px', background:'#1a1a1a', color:'#fff', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'600', cursor:'pointer' },
  tipBox: { marginTop:'14px', background:'#FFFBEB', border:'1px solid #FCD34D', borderRadius:'8px', padding:'12px 14px', fontSize:'13px', color:'#78350F', lineHeight:1.6 },
  agentList: { display:'flex', flexDirection:'column', gap:'8px' },
  agentCard: { background:'#fff', borderRadius:'10px', padding:'14px 18px', border:'1px solid #eee', display:'flex', alignItems:'center', gap:'14px' },
  agentAvatar: { width:'36px', height:'36px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'600', fontSize:'14px', flexShrink:0 },
  agentInfo: { flex:1 },
  agentName: { fontSize:'14px', fontWeight:'600', color:'#1a1a1a' },
  agentEmail: { fontSize:'12px', color:'#888' },
  adminBadge: { display:'inline-block', background:'#EDE9FE', color:'#5B21B6', fontSize:'10px', padding:'2px 8px', borderRadius:'99px', fontWeight:'500', marginTop:'3px' },
  agentActions: { display:'flex', alignItems:'center', gap:'8px' },
  statusDot: { width:'8px', height:'8px', borderRadius:'50%', display:'inline-block' },
  statusText: { fontSize:'12px', color:'#888' },
  toggleBtn: { padding:'5px 12px', border:'none', borderRadius:'6px', fontSize:'12px', fontWeight:'500', cursor:'pointer' },
}
