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
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: agentData } = await supabase.from('agents').select('*').eq('user_id', user.id).single()
    if (!agentData?.is_admin) { navigate('/app/dashboard'); return }
    setAgent(agentData)
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

  async function handleCreateAgent(e) {
    e.preventDefault()
    setCreating(true)
    setError('')
    setSuccess('')

    // Note: creating users requires service_role key. For MVP, guide Koben to create via Supabase dashboard.
    // This form collects info and shows instructions.
    setSuccess(`Untuk membuat akun baru untuk ${newAgent.name}:\n1. Buka Supabase Dashboard → Authentication → Users\n2. Klik "Add user" → masukkan email: ${newAgent.email}\n3. Set password: ${newAgent.password}\n4. User akan otomatis terdaftar sebagai agen aktif.`)
    setCreating(false)
    setNewAgent({ name: '', email: '', password: '' })
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
            {error && <div style={s.errorBox}>{error}</div>}
            {success && <div style={s.successBox}>{success}</div>}
            <button type="submit" disabled={creating} style={s.createBtn}>
              {creating ? 'Memproses...' : 'Lihat Panduan Buat Akun'}
            </button>
          </form>
        </div>
      </div>

      {/* Agent list */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Daftar Agen</h2>
        {loading ? <div style={{ color:'#aaa', fontSize:'14px' }}>Memuat...</div> : (
          <div style={s.agentList}>
            {agents.map(a => (
              <div key={a.id} style={s.agentCard}>
                <div style={s.agentAvatar}>{a.full_name?.[0] || 'A'}</div>
                <div style={s.agentInfo}>
                  <div style={s.agentName}>{a.full_name}</div>
                  <div style={s.agentEmail}>{a.email}</div>
                  {a.is_admin && <span style={s.adminBadge}>Admin</span>}
                </div>
                <div style={s.agentActions}>
                  <span style={{ ...s.statusDot, background: a.is_active ? '#059669' : '#D1D5DB' }} />
                  <span style={s.statusText}>{a.is_active ? 'Aktif' : 'Nonaktif'}</span>
                  {!a.is_admin && (
                    <button onClick={() => toggleAgent(a.id, a.is_active)} style={{ ...s.toggleBtn, background: a.is_active ? '#FEE2E2' : '#D1FAE5', color: a.is_active ? '#991B1B' : '#065F46' }}>
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
  sectionTitle: { fontSize:'15px', fontWeight:'600', color:'#333', marginBottom:'12px' },
  formCard: { background:'#fff', borderRadius:'10px', padding:'20px', border:'1px solid #eee' },
  form: { display:'flex', flexDirection:'column', gap:'14px' },
  fieldRow: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px' },
  field: { display:'flex', flexDirection:'column', gap:'5px' },
  label: { fontSize:'12px', fontWeight:'500', color:'#666' },
  input: { padding:'8px 10px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'13px', color:'#1a1a1a' },
  errorBox: { background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'8px', padding:'10px 12px', fontSize:'13px', color:'#991B1B' },
  successBox: { background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:'8px', padding:'10px 12px', fontSize:'13px', color:'#166534', whiteSpace:'pre-wrap' },
  createBtn: { padding:'10px 20px', background:'#C0392B', color:'#fff', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'600', cursor:'pointer', alignSelf:'flex-start' },
  agentList: { display:'flex', flexDirection:'column', gap:'8px' },
  agentCard: { background:'#fff', borderRadius:'10px', padding:'14px 18px', border:'1px solid #eee', display:'flex', alignItems:'center', gap:'14px' },
  agentAvatar: { width:'36px', height:'36px', background:'#C0392B', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'600', fontSize:'14px', flexShrink:0 },
  agentInfo: { flex:1 },
  agentName: { fontSize:'14px', fontWeight:'600', color:'#1a1a1a' },
  agentEmail: { fontSize:'12px', color:'#888' },
  adminBadge: { display:'inline-block', background:'#EDE9FE', color:'#5B21B6', fontSize:'10px', padding:'2px 8px', borderRadius:'99px', fontWeight:'500', marginTop:'3px' },
  agentActions: { display:'flex', alignItems:'center', gap:'8px' },
  statusDot: { width:'8px', height:'8px', borderRadius:'50%', display:'inline-block' },
  statusText: { fontSize:'12px', color:'#888' },
  toggleBtn: { padding:'5px 12px', border:'none', borderRadius:'6px', fontSize:'12px', fontWeight:'500', cursor:'pointer' },
}
