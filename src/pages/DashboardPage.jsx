import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AppShell from '../components/AppShell'

const TYPE_LABEL = { selling: 'ProfilKu Finansial', recruiting: 'ProfilKu Peluang' }
const TYPE_COLOR = { selling: '#7F77DD', recruiting: '#1D9E75' }
const TYPE_BG   = { selling: '#EEEDFE',  recruiting: '#E1F5EE' }
const STATUS_LABEL = { pending: 'Menunggu', completed: 'Selesai', expired: 'Kedaluwarsa' }
const STATUS_COLOR = { pending: '#D97706', completed: '#059669', expired: '#9CA3AF' }
const STATUS_BG    = { pending: '#FEF3C7', completed: '#D1FAE5', expired: '#F3F4F6' }

export default function DashboardPage() {
  const [agent, setAgent] = useState(null)
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const agentRef = useRef(null)
  const navigate = useNavigate()

  const loadSurveys = useCallback(async (currentAgent) => {
    const agentData = currentAgent || agentRef.current
    if (!agentData) return
    let query = supabase
      .from('survey_links')
      .select('*, survey_responses(personality_type, primary_product, submitted_at), agents(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(100)
    if (!agentData.is_admin) {
      query = query.eq('agent_id', agentData.id)
    }
    const { data, error } = await query
    if (!error) setSurveys(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: me } = await supabase.from('agents').select('*').eq('user_id', user.id).single()
      setAgent(me)
      agentRef.current = me
      await loadSurveys(me)
    }
    loadData()
    const channel = supabase
      .channel('dashboard-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'survey_links' }, () => loadSurveys(agentRef.current))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'survey_responses' }, () => loadSurveys(agentRef.current))
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [loadSurveys])

  const filtered = filter === 'all' ? surveys
    : filter === 'selling' ? surveys.filter(s => s.survey_type === 'selling')
    : surveys.filter(s => s.survey_type === 'recruiting')

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
          <p style={s.subtitle}>Selamat datang, {agent?.full_name || '...'}</p>
        </div>
        <button onClick={() => navigate('/app/survey/new')} style={s.newBtn}>+ Survey Baru</button>
      </div>

      <div className="kd-stats-grid" style={s.statsGrid}>
        {[
          { label: 'Total Survey', value: stats.total, color: '#6366F1' },
          { label: 'Selesai', value: stats.completed, color: '#059669' },
          { label: 'Menunggu', value: stats.pending, color: '#D97706' },
        ].map(stat => (
          <div key={stat.label} style={s.statCard}>
            <div className="kd-stat-value" style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Daftar Survey</h2>
          <div className="kd-filter-row" style={s.filterRow}>
            {[['all','Semua'], ['selling','Finansial'], ['recruiting','Peluang']].map(([val, lbl]) => (
              <button key={val} onClick={() => setFilter(val)}
                className="kd-filter-btn"
                style={{ ...s.filterBtn, ...(filter === val ? s.filterActive : {}) }}>
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={s.empty}>Memuat...</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>Belum ada survey. Klik "+ Survey Baru" untuk memulai.</div>
        ) : (
          <div style={s.list}>
            {filtered.map(survey => (
              <div key={survey.id} className="kd-survey-card" style={s.card}
                onClick={() => navigate(`/app/survey/${survey.id}`)}>
                <div style={s.cardLeft}>
                  <div style={s.cardTopRow}>
                    <span style={{ ...s.typeBadge, color: TYPE_COLOR[survey.survey_type], background: TYPE_BG[survey.survey_type] }}>
                      {TYPE_LABEL[survey.survey_type]}
                    </span>
                    {agent?.is_admin && survey.agents && (
                      <span style={s.agentBadge}>
                        👤 {survey.agents.full_name || survey.agents.email?.split('@')[0]}
                      </span>
                    )}
                  </div>
                  <div style={s.prospectName}>{survey.prospect_name}</div>
                  <div style={s.prospectMeta}>{survey.prospect_job} · {formatDate(survey.created_at)}</div>
                  {survey.survey_responses && (
                    <div style={s.resultTag}>
                      {survey.survey_responses.personality_type && `Tipe: ${survey.survey_responses.personality_type}`}
                      {survey.survey_responses.primary_product && ` · ${survey.survey_responses.primary_product}`}
                    </div>
                  )}
                </div>
                <div className="kd-card-right" style={s.cardRight}>
                  <span style={{ ...s.badge, background: STATUS_BG[survey.status], color: STATUS_COLOR[survey.status] }}>
                    {STATUS_LABEL[survey.status]}
                  </span>
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
  return new Date(ts).toLocaleDateString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
}

const s = {
  header: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' },
  title: { fontSize:'22px', fontWeight:'700', color:'#1a1a1a', margin:0 },
  subtitle: { fontSize:'13px', color:'#888', marginTop:'4px' },
  newBtn: { padding:'10px 18px', background:'#C0392B', color:'#fff', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'24px' },
  statCard: { background:'#fff', borderRadius:'10px', padding:'16px', border:'1px solid #eee' },
  statValue: { fontSize:'28px', fontWeight:'700', lineHeight:1 },
  statLabel: { fontSize:'12px', color:'#888', marginTop:'5px' },
  sectionHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px', flexWrap:'wrap', gap:'10px' },
  sectionTitle: { fontSize:'15px', fontWeight:'600', color:'#1a1a1a', margin:0 },
  filterRow: { display:'flex', gap:'6px' },
  filterBtn: { padding:'6px 12px', background:'#f0f0f0', border:'1px solid #e5e5e5', borderRadius:'99px', fontSize:'12px', color:'#555', cursor:'pointer' },
  filterActive: { background:'#1a1a1a', color:'#fff', border:'1px solid #1a1a1a' },
  empty: { color:'#aaa', fontSize:'14px', padding:'40px 0', textAlign:'center' },
  list: { display:'flex', flexDirection:'column', gap:'8px' },
  card: { background:'#fff', borderRadius:'10px', padding:'14px 16px', border:'1px solid #eee', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' },
  cardLeft: { flex:1, minWidth:0 },
  cardTopRow: { display:'flex', alignItems:'center', gap:'6px', marginBottom:'5px', flexWrap:'wrap' },
  cardRight: { display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px', flexShrink:0 },
  typeBadge: { fontSize:'11px', fontWeight:'600', padding:'2px 8px', borderRadius:'99px' },
  agentBadge: { fontSize:'11px', color:'#888', background:'#f5f5f5', padding:'2px 7px', borderRadius:'99px' },
  prospectName: { fontSize:'14px', fontWeight:'600', color:'#1a1a1a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  prospectMeta: { fontSize:'12px', color:'#888', marginTop:'2px' },
  resultTag: { fontSize:'12px', color:'#6366F1', marginTop:'3px' },
  badge: { fontSize:'11px', fontWeight:'500', padding:'3px 10px', borderRadius:'99px', whiteSpace:'nowrap' },
}
