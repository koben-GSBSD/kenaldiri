import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAgent } from '../../hooks/useAgent'
import AgentShell from '../../components/agent/AgentShell'
import ProspekModal from '../../components/agent/ProspekModal'

const STAGE_LABEL = {
  fact_finding: 'Fact Finding',
  fu1: 'FU 1', fu2: 'FU 2',
  presentasi: 'Presentasi', closing: 'Closing'
}
const STAGE_COLOR = {
  fact_finding: { bg:'#F3E8FF', text:'#7C3AED' },
  fu1: { bg:'#FEF3C7', text:'#D97706' },
  fu2: { bg:'#FEF9C3', text:'#CA8A04' },
  presentasi: { bg:'#DBEAFE', text:'#1D4ED8' },
  closing: { bg:'#ECFDF3', text:'#059669' },
}
const TYPE_COLOR = {
  nasabah: { bg:'#FFF0F1', text:'#ED1B2E' },
  rekrutan: { bg:'#EFF6FF', text:'#2563EB' },
}

export default function AgentDashboardPage() {
  const { agent } = useAgent()
  const navigate  = useNavigate()
  const [stats, setStats]           = useState({ total:0, proses:0, presentasi:0, closing:0 })
  const [pipeline, setPipeline]     = useState({})
  const [recentProspects, setRecent] = useState([])
  const [todayReminders, setTodayR]  = useState([])
  const [showModal, setShowModal]    = useState(false)
  const [loading, setLoading]        = useState(true)

  const loadData = useCallback(async (ag) => {
    if (!ag) return
    const filter = ag.is_admin ? {} : { agent_id: ag.id }

    // Prospects
    let q = supabase.from('prospects').select('*').order('created_at', { ascending: false })
    if (!ag.is_admin) q = q.eq('agent_id', ag.id)
    const { data: prospects } = await q

    if (prospects) {
      const counts = {}
      prospects.forEach(p => { counts[p.stage] = (counts[p.stage] || 0) + 1 })
      setPipeline(counts)
      setStats({
        total: prospects.length,
        proses: prospects.filter(p => ['fu1','fu2'].includes(p.stage)).length,
        presentasi: prospects.filter(p => p.stage === 'presentasi').length,
        closing: prospects.filter(p => p.stage === 'closing').length,
      })
      setRecent(prospects.slice(0, 5))
    }

    // Today reminders
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const end   = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()
    let rq = supabase
      .from('reminders')
      .select('*, prospects(full_name, stage)')
      .eq('is_done', false)
      .gte('remind_at', start)
      .lt('remind_at', end)
      .order('remind_at', { ascending: true })
    if (!ag.is_admin) rq = rq.eq('agent_id', ag.id)
    const { data: reminders } = await rq
    setTodayR(reminders || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (agent) loadData(agent)
  }, [agent, loadData])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 11) return 'Selamat pagi'
    if (h < 15) return 'Selamat siang'
    if (h < 18) return 'Selamat sore'
    return 'Selamat malam'
  }

  const maxPipeline = Math.max(...Object.values(pipeline), 1)

  return (
    <AgentShell agent={agent} pageTitle="Dashboard" onAddProspek={() => setShowModal(true)}>
      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'#ADB5BD', fontSize:'13px' }}>Memuat data...</div>
      ) : (
        <>
          {/* GREETING */}
          <div style={{ marginBottom:'20px' }}>
            <h1 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:'20px', fontWeight:'800', color:'#1A1A2E', marginBottom:'3px' }}>
              {greeting()}, {agent?.full_name?.split(' ')[0] || 'Agen'} 👋
            </h1>
            <p style={{ fontSize:'12px', color:'#ADB5BD' }}>
              {todayReminders.length > 0
                ? `Kamu punya ${todayReminders.length} reminder hari ini`
                : 'Tidak ada reminder hari ini'}
            </p>
          </div>

          {/* STAT CARDS */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
            {[
              { label:'Total Prospek',   value: stats.total,       color:'#ED1B2E', top:'#ED1B2E' },
              { label:'Sedang Diproses', value: stats.proses,       color:'#2563EB', top:'#2563EB' },
              { label:'Presentasi',      value: stats.presentasi,   color:'#D4A843', top:'#D4A843' },
              { label:'Closing',         value: stats.closing,      color:'#12B76A', top:'#12B76A' },
            ].map(c => (
              <div key={c.label} style={{ background:'white', borderRadius:'11px', padding:'14px', border:'1px solid #E9ECEF', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:c.top }} />
                <div style={{ fontSize:'10px', color:'#6C757D', fontWeight:'500', textTransform:'uppercase', letterSpacing:'.4px', marginBottom:'6px' }}>{c.label}</div>
                <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:'28px', fontWeight:'800', color:'#1A1A2E', lineHeight:'1', marginBottom:'4px' }}>{c.value}</div>
              </div>
            ))}
          </div>

          {/* PIPELINE + REMINDER */}
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'12px', marginBottom:'20px' }}>
            {/* Pipeline */}
            <div style={{ background:'white', borderRadius:'11px', border:'1px solid #E9ECEF' }}>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid #E9ECEF', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:'700', color:'#1A1A2E' }}>Pipeline Prospek</div>
                  <div style={{ fontSize:'11px', color:'#ADB5BD', marginTop:'1px' }}>Status follow-up semua prospek aktif</div>
                </div>
                <button className="pa-btn pa-btn-outline pa-btn-sm" onClick={() => navigate('/agent/pipeline')}>Lihat →</button>
              </div>
              <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:'7px' }}>
                {['fact_finding','fu1','fu2','presentasi','closing'].map(stage => {
                  const count = pipeline[stage] || 0
                  const pct = Math.round((count / maxPipeline) * 100) || 0
                  const stageColors = { fact_finding:'#7C3AED', fu1:'#D97706', fu2:'#CA8A04', presentasi:'#1D4ED8', closing:'#059669' }
                  return (
                    <div key={stage} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div style={{ width:'88px', fontSize:'11px', fontWeight:'500', color:'#6C757D', flexShrink:0 }}>{STAGE_LABEL[stage]}</div>
                      <div style={{ flex:1, height:'26px', background:'#F1F3F5', borderRadius:'6px', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${Math.max(pct,4)}%`, background:stageColors[stage], borderRadius:'6px', display:'flex', alignItems:'center', paddingLeft:'9px', fontSize:'11px', fontWeight:'700', color:'white', transition:'width .5s ease' }}>
                          {count > 0 ? count : ''}
                        </div>
                      </div>
                      <div style={{ width:'24px', fontSize:'12px', fontWeight:'700', color:'#1A1A2E', textAlign:'right' }}>{count}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Reminders Hari Ini */}
            <div style={{ background:'white', borderRadius:'11px', border:'1px solid #E9ECEF' }}>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid #E9ECEF' }}>
                <div style={{ fontSize:'13px', fontWeight:'700', color:'#1A1A2E' }}>Reminder Hari Ini</div>
                <div style={{ fontSize:'11px', color:'#ADB5BD', marginTop:'1px' }}>
                  {todayReminders.length > 0 ? `${todayReminders.length} jadwal` : 'Tidak ada'}
                </div>
              </div>
              <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:'7px' }}>
                {todayReminders.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'20px 0', fontSize:'12px', color:'#ADB5BD' }}>
                    ✅ Semua beres hari ini
                  </div>
                ) : todayReminders.slice(0, 4).map(r => (
                  <div key={r.id} style={{ display:'flex', alignItems:'flex-start', gap:'8px', padding:'8px 10px', borderRadius:'8px', background:'#F8F9FA', border:'1px solid #E9ECEF', cursor:'pointer' }} onClick={() => navigate('/agent/reminder')}>
                    <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#ED1B2E', marginTop:'4px', flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'12px', fontWeight:'600', color:'#1A1A2E', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.prospects?.full_name}</div>
                      <div style={{ fontSize:'11px', color:'#6C757D', marginTop:'1px' }}>{STAGE_LABEL[r.prospects?.stage]}</div>
                    </div>
                    <div style={{ fontSize:'11px', color:'#ADB5BD', flexShrink:0 }}>
                      {new Date(r.remind_at).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RECENT PROSPECTS */}
          <div style={{ background:'white', borderRadius:'11px', border:'1px solid #E9ECEF' }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid #E9ECEF', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontSize:'13px', fontWeight:'700', color:'#1A1A2E' }}>Prospek Terbaru</div>
              <button className="pa-btn pa-btn-outline pa-btn-sm" onClick={() => navigate('/agent/prospek')}>Lihat semua →</button>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'500px' }}>
                <thead>
                  <tr>
                    {['Nama','Tipe','Tahap','Keterangan','Ditambahkan'].map(h => (
                      <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:'10px', fontWeight:'700', color:'#ADB5BD', textTransform:'uppercase', letterSpacing:'.5px', background:'#F8F9FA', borderBottom:'1px solid #E9ECEF', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentProspects.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding:'30px', textAlign:'center', fontSize:'13px', color:'#ADB5BD' }}>Belum ada prospek. Tambah prospek pertama kamu!</td></tr>
                  ) : recentProspects.map(p => (
                    <tr key={p.id} style={{ cursor:'pointer' }} onClick={() => navigate('/agent/prospek')}>
                      <td style={{ padding:'11px 14px', borderBottom:'1px solid #F1F3F5' }}>
                        <div style={{ fontWeight:'600', color:'#1A1A2E', fontSize:'13px' }}>{p.full_name}</div>
                        <div style={{ fontSize:'10px', color:'#ADB5BD', marginTop:'2px' }}>{p.marital_status === 'menikah' ? 'Menikah' : 'Single'} · {p.occupation || '—'}</div>
                      </td>
                      <td style={{ padding:'11px 14px', borderBottom:'1px solid #F1F3F5' }}>
                        <span style={{ background:TYPE_COLOR[p.prospect_type]?.bg, color:TYPE_COLOR[p.prospect_type]?.text, padding:'3px 8px', borderRadius:'20px', fontSize:'11px', fontWeight:'600' }}>
                          {p.prospect_type === 'nasabah' ? '🏦 Nasabah' : '🤝 Rekrutan'}
                        </span>
                      </td>
                      <td style={{ padding:'11px 14px', borderBottom:'1px solid #F1F3F5' }}>
                        <span style={{ background:STAGE_COLOR[p.stage]?.bg, color:STAGE_COLOR[p.stage]?.text, padding:'3px 9px', borderRadius:'20px', fontSize:'11px', fontWeight:'600' }}>
                          {STAGE_LABEL[p.stage]}
                        </span>
                      </td>
                      <td style={{ padding:'11px 14px', borderBottom:'1px solid #F1F3F5', maxWidth:'180px' }}>
                        <div style={{ fontSize:'11px', color:'#6C757D', overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                          {p.notes || <span style={{ color:'#ADB5BD', fontStyle:'italic' }}>—</span>}
                        </div>
                      </td>
                      <td style={{ padding:'11px 14px', borderBottom:'1px solid #F1F3F5', fontSize:'11px', color:'#ADB5BD', whiteSpace:'nowrap' }}>
                        {new Date(p.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <ProspekModal
          agent={agent}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadData(agent) }}
        />
      )}
    </AgentShell>
  )
}
