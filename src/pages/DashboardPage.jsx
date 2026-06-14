import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AppShell from '../components/AppShell'

const STATUS_LABEL = { pending: 'Menunggu', completed: 'Selesai', expired: 'Kedaluwarsa' }
const STATUS_COLOR = { pending: '#D97706', completed: '#059669', expired: '#9CA3AF' }
const STATUS_BG = { pending: '#FEF3C7', completed: '#D1FAE5', expired: '#F3F4F6' }

export default function DashboardPage() {
  const [agent, setAgent] = useState(null)
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
    // Realtime: listen for survey_links changes
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'survey_links' }, () => {
        loadSurveys()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'survey_responses' }, () => {
        loadSurveys()
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: agentData } = await supabase.from('agents').select('*').eq('user_id', user.id).single()
    setAgent(agentData)
    await loadSurveys(agentData)
  }

  async function loadSurveys(agentData) {
    const { data } = await supabase
      .from('survey_links')
      .select('*, survey_responses(personality_type, primary_product, submitted_at)')
      .order('created_at', { ascending: false })
      .limit(50)
    setSurveys(data || [])
    setLoading(false)
  }

  const stats = {
    total: surveys.length,
    completed: surveys.filter(s => s.status === 'completed').length,
    pending: surveys.filter(s => s.status === 'pending').length,
  }

  return (
    <AppShell agent={agent}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Dashboard</h1>
          <p style={s.subtitle}>Selamat datang, {agent?.full_name || 'Agen'}</p>
        </div>
        <button onClick={() => navigate('/app/survey/new')} style={s.newBtn}>
          + Survey Baru
        </button>
      </div>

      <div style={s.statsGrid}>
        {[
          { label: 'Total Survey', value: stats.total, color: '#6366F1' },
          { label: 'Selesai Diisi', value: stats.completed, color: '#059669' },
          { label: 'Menunggu', value: stats.pending, color: '#D97706' },
        ].map(stat => (
          <div key={stat.label} style={s.statCard}>
            <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={s.section}>
        <h2 style={s.sectionTitle}>Daftar Survey</h2>
        {loading ? (
          <div style={s.empty}>Memuat...</div>
        ) : surveys.length === 0 ? (
          <div style={s.empty}>Belum ada survey. Buat survey baru untuk memulai.</div>
        ) : (
          <div style={s.list}>
            {surveys.map(survey => (
              <div key={survey.id} style={s.card} onClick={() => navigate(`/app/survey/${survey.id}`)}>
                <div style={s.cardLeft}>
                  <div style={s.prospectName}>{survey.prospect_name}</div>
                  <div style={s.prospectMeta}>{survey.prospect_job} · {formatDate(survey.created_at)}</div>
                  {survey.survey_responses && (
                    <div style={s.resultTag}>
                      {survey.survey_responses.personality_type && `Tipe: ${survey.survey_responses.personality_type}`}
                      {survey.survey_responses.primary_product && ` · ${survey.survey_responses.primary_product}`}
                    </div>
                  )}
                </div>
                <div style={s.cardRight}>
                  <span style={{ ...s.badge, background: STATUS_BG[survey.status], color: STATUS_COLOR[survey.status] }}>
                    {STATUS_LABEL[survey.status]}
                  </span>
                  {survey.status === 'pending' && isExpiringSoon(survey.expires_at) && (
                    <div style={s.expireNote}>Kedaluwarsa {formatExpiry(survey.expires_at)}</div>
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

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
}
function isExpiringSoon(ts) {
  return new Date(ts) > new Date() && (new Date(ts) - new Date()) < 1000 * 60 * 20
}
function formatExpiry(ts) {
  const mins = Math.round((new Date(ts) - new Date()) / 60000)
  if (mins <= 0) return 'sebentar lagi'
  return `${mins} menit lagi`
}

const s = {
  header: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'28px' },
  title: { fontSize:'24px', fontWeight:'700', color:'#1a1a1a', margin:0 },
  subtitle: { fontSize:'14px', color:'#888', marginTop:'4px' },
  newBtn: { padding:'10px 20px', background:'#C0392B', color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor:'pointer' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'32px' },
  statCard: { background:'#fff', borderRadius:'12px', padding:'20px', border:'1px solid #eee' },
  statValue: { fontSize:'32px', fontWeight:'700', lineHeight:1 },
  statLabel: { fontSize:'13px', color:'#888', marginTop:'6px' },
  section: {},
  sectionTitle: { fontSize:'16px', fontWeight:'600', color:'#1a1a1a', marginBottom:'16px' },
  empty: { color:'#aaa', fontSize:'14px', padding:'40px 0', textAlign:'center' },
  list: { display:'flex', flexDirection:'column', gap:'8px' },
  card: { background:'#fff', borderRadius:'10px', padding:'16px 20px', border:'1px solid #eee', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', transition:'box-shadow 0.15s' },
  cardLeft: { flex:1 },
  cardRight: { display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px' },
  prospectName: { fontSize:'15px', fontWeight:'600', color:'#1a1a1a' },
  prospectMeta: { fontSize:'12px', color:'#888', marginTop:'2px' },
  resultTag: { fontSize:'12px', color:'#6366F1', marginTop:'4px' },
  badge: { fontSize:'12px', fontWeight:'500', padding:'3px 10px', borderRadius:'99px' },
  expireNote: { fontSize:'11px', color:'#D97706' },
}
