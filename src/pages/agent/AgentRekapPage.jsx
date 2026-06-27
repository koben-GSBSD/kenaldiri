import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAgent } from '../../hooks/useAgent'
import AgentShell from '../../components/agent/AgentShell'

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
const STAGE_LABEL = { fact_finding:'Fact Finding', fu1:'FU 1', fu2:'FU 2', presentasi:'Presentasi', closing:'Closing' }
const SOURCE_LABEL = { keluarga:'Keluarga', teman:'Teman', tetangga:'Tetangga', media_sosial:'Media Sosial', komunitas:'Komunitas', kenaldiri:'KenalDiri', lainnya:'Lainnya' }

export default function AgentRekapPage() {
  const { agent } = useAgent()
  const [view, setView]       = useState('self') // 'self' | 'all' (admin only)
  const [month, setMonth]     = useState(new Date().getMonth())
  const [year, setYear]       = useState(new Date().getFullYear())
  const [prospects, setProspects] = useState([])
  const [allAgents, setAllAgents] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (ag) => {
    if (!ag) return
    const start = new Date(year, month, 1).toISOString()
    const end   = new Date(year, month + 1, 0, 23, 59, 59).toISOString()

    let q = supabase.from('prospects').select('*, agents(full_name)')
      .gte('created_at', start).lte('created_at', end)
    if (view === 'self' || !ag.is_admin) q = q.eq('agent_id', ag.id)
    const { data } = await q
    setProspects(data || [])

    // Load all agents for admin view
    if (ag.is_admin && view === 'all') {
      const { data: agents } = await supabase.from('agents').select('id, full_name').eq('is_active', true)
      setAllAgents(agents || [])
    }
    setLoading(false)
  }, [month, year, view])

  useEffect(() => { if (agent) load(agent) }, [agent, load])

  const stats = {
    total:       prospects.length,
    nasabah:     prospects.filter(p => p.prospect_type === 'nasabah').length,
    rekrutan:    prospects.filter(p => p.prospect_type === 'rekrutan').length,
    fu:          prospects.filter(p => ['fu1','fu2'].includes(p.stage)).length,
    presentasi:  prospects.filter(p => p.stage === 'presentasi').length,
    closing:     prospects.filter(p => p.stage === 'closing').length,
  }

  // Source breakdown
  const sourceCounts = {}
  prospects.forEach(p => { sourceCounts[p.source] = (sourceCounts[p.source] || 0) + 1 })
  const sourceList = Object.entries(sourceCounts).sort((a,b) => b[1]-a[1])
  const maxSource = Math.max(...Object.values(sourceCounts), 1)

  // Stage breakdown
  const stageCounts = {}
  prospects.forEach(p => { stageCounts[p.stage] = (stageCounts[p.stage] || 0) + 1 })

  // Agent leaderboard (admin)
  const agentCounts = {}
  if (view === 'all') {
    prospects.forEach(p => {
      const name = p.agents?.full_name || 'Unknown'
      if (!agentCounts[name]) agentCounts[name] = { total:0, closing:0 }
      agentCounts[name].total++
      if (p.stage === 'closing') agentCounts[name].closing++
    })
  }
  const leaderboard = Object.entries(agentCounts).sort((a,b) => b[1].total - a[1].total)

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }
  const nextMonth = () => {
    const now = new Date()
    if (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth())) return
    if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1)
  }

  return (
    <AgentShell agent={agent} pageTitle="Rekap Bulanan">
      {/* Header controls */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px', flexWrap:'wrap', gap:'10px' }}>
        <div style={{ display:'flex', gap:'3px', background:'#F1F3F5', padding:'4px', borderRadius:'10px' }}>
          <button onClick={() => setView('self')} style={{ padding:'6px 13px', borderRadius:'7px', fontSize:'12px', fontWeight:'600', cursor:'pointer', border:'none', background: view==='self'?'white':'transparent', color: view==='self'?'#1A1A2E':'#6C757D', boxShadow: view==='self'?'0 1px 3px rgba(0,0,0,.1)':'none' }}>Aktivitas Saya</button>
          {agent?.is_admin && (
            <button onClick={() => setView('all')} style={{ padding:'6px 13px', borderRadius:'7px', fontSize:'12px', fontWeight:'600', cursor:'pointer', border:'none', background: view==='all'?'white':'transparent', color: view==='all'?'#1A1A2E':'#6C757D', boxShadow: view==='all'?'0 1px 3px rgba(0,0,0,.1)':'none' }}>👑 Semua Agen</button>
          )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <button onClick={prevMonth} style={{ width:'28px', height:'28px', borderRadius:'7px', border:'1px solid #E9ECEF', background:'white', cursor:'pointer', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
          <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:'700', color:'#1A1A2E', fontSize:'14px', minWidth:'120px', textAlign:'center' }}>{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} style={{ width:'28px', height:'28px', borderRadius:'7px', border:'1px solid #E9ECEF', background:'white', cursor:'pointer', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center' }}>→</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'#ADB5BD', fontSize:'13px' }}>Memuat rekap...</div>
      ) : (
        <>
          {/* STAT CARDS */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' }}>
            {[
              { label:'Prospek Baru', value:stats.total,      top:'#ED1B2E' },
              { label:'Total FU',     value:stats.fu,         top:'#2563EB' },
              { label:'Presentasi',   value:stats.presentasi, top:'#D4A843' },
              { label:'Closing',      value:stats.closing,    top:'#12B76A' },
            ].map(c => (
              <div key={c.label} style={{ background:'white', borderRadius:'11px', padding:'14px', border:'1px solid #E9ECEF', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:c.top }} />
                <div style={{ fontSize:'10px', color:'#6C757D', fontWeight:'500', textTransform:'uppercase', letterSpacing:'.4px', marginBottom:'6px' }}>{c.label}</div>
                <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:'28px', fontWeight:'800', color:'#1A1A2E', lineHeight:'1' }}>{c.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns: agent?.is_admin && view==='all' ? '1fr 1fr 1fr' : '1fr 1fr', gap:'12px' }}>
            {/* Stage breakdown */}
            <div style={{ background:'white', borderRadius:'11px', border:'1px solid #E9ECEF' }}>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid #E9ECEF', fontSize:'13px', fontWeight:'700', color:'#1A1A2E' }}>Sebaran Tahap</div>
              <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:'9px' }}>
                {Object.entries(STAGE_LABEL).map(([k,l]) => {
                  const c = stageCounts[k] || 0
                  const pct = stats.total ? Math.round((c/stats.total)*100) : 0
                  const colors = { fact_finding:'#7C3AED', fu1:'#D97706', fu2:'#CA8A04', presentasi:'#1D4ED8', closing:'#059669' }
                  return (
                    <div key={k}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                        <span style={{ fontSize:'12px', fontWeight:'500', color:'#343A40' }}>{l}</span>
                        <span style={{ fontSize:'12px', fontWeight:'700', color:colors[k] }}>{c}</span>
                      </div>
                      <div style={{ height:'5px', background:'#F1F3F5', borderRadius:'3px' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:colors[k], borderRadius:'3px', transition:'width .5s' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Source breakdown */}
            <div style={{ background:'white', borderRadius:'11px', border:'1px solid #E9ECEF' }}>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid #E9ECEF', fontSize:'13px', fontWeight:'700', color:'#1A1A2E' }}>Sumber Terbaik</div>
              <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:'9px' }}>
                {sourceList.length === 0 ? (
                  <div style={{ fontSize:'12px', color:'#ADB5BD', textAlign:'center', padding:'20px 0' }}>Belum ada data</div>
                ) : sourceList.map(([src, count]) => (
                  <div key={src}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                      <span style={{ fontSize:'12px', fontWeight:'500', color:'#343A40' }}>{SOURCE_LABEL[src] || src}</span>
                      <span style={{ fontSize:'12px', fontWeight:'700', color:'#ED1B2E' }}>{count}</span>
                    </div>
                    <div style={{ height:'5px', background:'#F1F3F5', borderRadius:'3px' }}>
                      <div style={{ height:'100%', width:`${Math.round((count/maxSource)*100)}%`, background:'#ED1B2E', borderRadius:'3px', opacity:.7 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard (admin only) */}
            {agent?.is_admin && view === 'all' && (
              <div style={{ background:'white', borderRadius:'11px', border:'1px solid #E9ECEF' }}>
                <div style={{ padding:'12px 16px', borderBottom:'1px solid #E9ECEF', fontSize:'13px', fontWeight:'700', color:'#1A1A2E' }}>Leaderboard Agen</div>
                <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:'8px' }}>
                  {leaderboard.length === 0 ? (
                    <div style={{ fontSize:'12px', color:'#ADB5BD', textAlign:'center', padding:'20px 0' }}>Belum ada data</div>
                  ) : leaderboard.slice(0,5).map(([name, data], i) => (
                    <div key={name} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 10px', borderRadius:'8px', background:'#F8F9FA' }}>
                      <div style={{ width:'20px', height:'20px', borderRadius:'50%', background: i===0?'#ED1B2E':i===1?'#ADB5BD':'#D4A843', color:'white', fontSize:'10px', fontWeight:'800', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:'12px', fontWeight:'600', color:'#1A1A2E', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</div>
                        <div style={{ fontSize:'10px', color:'#6C757D' }}>{data.closing} closing · {data.total} prospek</div>
                      </div>
                      <div style={{ width:'60px', height:'5px', background:'#E9ECEF', borderRadius:'3px', flexShrink:0 }}>
                        <div style={{ height:'100%', width:`${Math.round((data.total/leaderboard[0][1].total)*100)}%`, background:'#ED1B2E', borderRadius:'3px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nasabah vs Rekrutan */}
          <div style={{ background:'white', borderRadius:'11px', border:'1px solid #E9ECEF', padding:'14px 16px', marginTop:'12px', display:'flex', gap:'20px', flexWrap:'wrap' }}>
            <div style={{ flex:1, display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#FFF0F1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>🏦</div>
              <div>
                <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:'22px', fontWeight:'800', color:'#ED1B2E' }}>{stats.nasabah}</div>
                <div style={{ fontSize:'11px', color:'#6C757D' }}>Calon Nasabah</div>
              </div>
            </div>
            <div style={{ flex:1, display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>🤝</div>
              <div>
                <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:'22px', fontWeight:'800', color:'#2563EB' }}>{stats.rekrutan}</div>
                <div style={{ fontSize:'11px', color:'#6C757D' }}>Calon Rekrutan</div>
              </div>
            </div>
            <div style={{ flex:1, display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#ECFDF3', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>📈</div>
              <div>
                <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:'22px', fontWeight:'800', color:'#059669' }}>
                  {stats.total ? Math.round((stats.closing / stats.total) * 100) : 0}%
                </div>
                <div style={{ fontSize:'11px', color:'#6C757D' }}>Closing Rate</div>
              </div>
            </div>
          </div>
        </>
      )}
    </AgentShell>
  )
}
