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

  // ── Evaluasi Mingguan (admin only) ──
  const [weekView, setWeekView]     = useState('monthly') // 'monthly' | 'weekly' — hanya untuk admin
  const [selectedAgent, setSelectedAgent] = useState(null) // agent id untuk evaluasi
  const [weekOffset, setWeekOffset] = useState(0) // 0 = minggu ini, -1 = minggu lalu, dst
  const [weekData, setWeekData]     = useState(null) // { prospects, logs, reminders, days, dailyNew }
  const [weekLoading, setWeekLoading] = useState(false)

  const load = useCallback(async (ag) => {
    if (!ag) return
    const start = new Date(year, month, 1).toISOString()
    const end   = new Date(year, month + 1, 0, 23, 59, 59).toISOString()

    let q = supabase.from('prospects').select('*, agents(full_name)')
      .gte('created_at', start).lte('created_at', end)
    if (view === 'self' || !ag.is_admin) q = q.eq('agent_id', ag.id)
    const { data } = await q
    setProspects(data || [])

    // Load all agents for admin view (juga dipakai oleh selector di tab Evaluasi Mingguan)
    if (ag.is_admin) {
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

  // ── Evaluasi Mingguan (admin only) ──
  function getWeekRange(offset = 0) {
    const now = new Date()
    const day = now.getDay() // 0=Sun
    const mon = new Date(now)
    mon.setDate(now.getDate() - ((day === 0 ? 7 : day) - 1) + offset * 7)
    mon.setHours(0, 0, 0, 0)
    const sun = new Date(mon)
    sun.setDate(mon.getDate() + 6)
    sun.setHours(23, 59, 59, 999)
    return { start: mon, end: sun }
  }

  async function loadWeekData(agentId, offset) {
    if (!agentId) return
    setWeekLoading(true)
    const { start, end } = getWeekRange(offset)
    const startISO = start.toISOString()
    const endISO   = end.toISOString()

    const [{ data: pros }, { data: logs }, { data: rems }] = await Promise.all([
      supabase.from('prospects').select('*').eq('agent_id', agentId).gte('created_at', startISO).lte('created_at', endISO),
      supabase.from('followup_logs').select('*').eq('agent_id', agentId).gte('created_at', startISO).lte('created_at', endISO),
      supabase.from('reminders').select('*').eq('agent_id', agentId).eq('is_done', true).gte('done_at', startISO).lte('done_at', endISO),
    ])

    // Hitung aktivitas per hari (Senin–Minggu)
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
    const dailyNew = days.map(d => {
      const ds = d.toISOString().slice(0, 10)
      return (pros || []).filter(p => p.created_at.slice(0, 10) === ds).length
    })

    setWeekData({ prospects: pros || [], logs: logs || [], reminders: rems || [], days, dailyNew })
    setWeekLoading(false)
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

      {/* Tab selector — hanya tampil untuk admin */}
      {agent?.is_admin && (
        <div style={{ display:'flex', gap:'0', marginBottom:'20px', background:'#F1F3F5', borderRadius:'10px', padding:'3px' }}>
          {[{ key:'monthly', label:'📅 Rekap Bulanan' }, { key:'weekly', label:'📊 Evaluasi Mingguan' }].map(t => (
            <button key={t.key} onClick={() => setWeekView(t.key)} style={{
              flex:1, padding:'9px 14px', border:'none', borderRadius:'8px', cursor:'pointer',
              fontSize:'13px', fontWeight:'600', transition:'all .15s', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
              background: weekView === t.key ? '#fff' : 'transparent',
              color: weekView === t.key ? '#1A1A2E' : '#6C757D',
              boxShadow: weekView === t.key ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
            }}>{t.label}</button>
          ))}
        </div>
      )}

      {(!agent?.is_admin || weekView === 'monthly') && (loading ? (
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
      ))}

      {/* EVALUASI MINGGUAN */}
      {agent?.is_admin && weekView === 'weekly' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {/* Pilih agen */}
          <div style={{ display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' }}>
            <select
              value={selectedAgent || ''}
              onChange={e => { setSelectedAgent(e.target.value); loadWeekData(e.target.value, weekOffset) }}
              style={{ padding:'8px 12px', border:'1px solid #E9ECEF', borderRadius:'8px', fontSize:'13px', outline:'none', background:'#fff', cursor:'pointer' }}>
              <option value="">Pilih Agen...</option>
              {allAgents.map(a => <option key={a.id} value={a.id}>{a.full_name}</option>)}
            </select>
            {/* Navigasi minggu */}
            <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'#fff', border:'1px solid #E9ECEF', borderRadius:'8px', padding:'6px 12px' }}>
              <button onClick={() => { const o = weekOffset - 1; setWeekOffset(o); if (selectedAgent) loadWeekData(selectedAgent, o) }}
                style={{ background:'none', border:'none', cursor:'pointer', fontSize:'16px', color:'#6C757D', padding:'0 4px' }}>←</button>
              <span style={{ fontSize:'13px', fontWeight:'600', color:'#1A1A2E', minWidth:'120px', textAlign:'center' }}>
                {(() => { const { start, end } = getWeekRange(weekOffset); return `${start.toLocaleDateString('id-ID', { day:'numeric', month:'short' })} – ${end.toLocaleDateString('id-ID', { day:'numeric', month:'short' })}` })()}
              </span>
              <button onClick={() => { if (weekOffset < 0) { const o = weekOffset + 1; setWeekOffset(o); if (selectedAgent) loadWeekData(selectedAgent, o) } }}
                disabled={weekOffset >= 0}
                style={{ background:'none', border:'none', cursor: weekOffset >= 0 ? 'not-allowed' : 'pointer', fontSize:'16px', color: weekOffset >= 0 ? '#E9ECEF' : '#6C757D', padding:'0 4px' }}>→</button>
            </div>
          </div>

          {!selectedAgent && (
            <div style={{ textAlign:'center', padding:'60px', color:'#ADB5BD', fontSize:'13px' }}>Pilih agen untuk melihat evaluasi mingguannya.</div>
          )}

          {selectedAgent && weekLoading && (
            <div style={{ textAlign:'center', padding:'60px', color:'#ADB5BD', fontSize:'13px' }}>Memuat data...</div>
          )}

          {selectedAgent && !weekLoading && weekData && (
            <>
              {/* Stats 4 kartu */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>
                {[
                  { label:'Prospek Baru', value: weekData.prospects.length, color:'#7F77DD', bg:'#EEEDFE' },
                  { label:'FU Dilakukan', value: weekData.logs.length, color:'#1D4ED8', bg:'#DBEAFE' },
                  { label:'Reminder Selesai', value: weekData.reminders.length, color:'#059669', bg:'#D1FAE5' },
                  { label:'Closing', value: weekData.prospects.filter(p => p.stage === 'closing').length, color:'#D97706', bg:'#FEF3C7' },
                ].map(s => (
                  <div key={s.label} style={{ background:'#fff', borderRadius:'12px', border:'1px solid #E9ECEF', padding:'16px', textAlign:'center' }}>
                    <div style={{ fontSize:'28px', fontWeight:'800', color: s.color, lineHeight:1 }}>{s.value}</div>
                    <div style={{ fontSize:'11px', color:'#6C757D', marginTop:'5px', fontWeight:'500' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Bar chart 7 hari */}
              <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #E9ECEF', padding:'16px 20px' }}>
                <div style={{ fontSize:'13px', fontWeight:'600', color:'#1A1A2E', marginBottom:'16px' }}>Prospek Baru per Hari</div>
                <div style={{ display:'flex', gap:'6px', alignItems:'flex-end', height:'80px' }}>
                  {weekData.days.map((d, i) => {
                    const val = weekData.dailyNew[i]
                    const max = Math.max(...weekData.dailyNew, 1)
                    const pct = (val / max) * 100
                    const isToday = d.toDateString() === new Date().toDateString()
                    return (
                      <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
                        <div style={{ fontSize:'10px', fontWeight:'700', color:'#6C757D' }}>{val > 0 ? val : ''}</div>
                        <div style={{ width:'100%', borderRadius:'4px 4px 0 0', background: isToday ? '#7F77DD' : '#C4C0F5', minHeight:'4px', height:`${Math.max(pct, 5)}%`, transition:'height 0.3s' }} />
                        <div style={{ fontSize:'10px', color: isToday ? '#7F77DD' : '#ADB5BD', fontWeight: isToday ? '700' : '400' }}>
                          {['Sen','Sel','Rab','Kam','Jum','Sab','Min'][i]}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Pipeline snapshot */}
              <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #E9ECEF', padding:'16px 20px' }}>
                <div style={{ fontSize:'13px', fontWeight:'600', color:'#1A1A2E', marginBottom:'12px' }}>Pipeline Saat Ini</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {[
                    { key:'fact_finding', label:'Fact Finding', color:'#7C3AED' },
                    { key:'fu1',          label:'FU 1',          color:'#D97706' },
                    { key:'fu2',          label:'FU 2',          color:'#CA8A04' },
                    { key:'presentasi',   label:'Presentasi',    color:'#1D4ED8' },
                    { key:'closing',      label:'Closing',       color:'#059669' },
                  ].map(st => {
                    const cnt = weekData.prospects.filter(p => p.stage === st.key).length
                    return (
                      <div key={st.key} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:'90px', fontSize:'12px', color:'#6C757D', flexShrink:0 }}>{st.label}</div>
                        <div style={{ flex:1, height:'8px', background:'#F1F3F5', borderRadius:'99px', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${cnt > 0 ? Math.max((cnt / Math.max(weekData.prospects.length, 1)) * 100, 4) : 0}%`, background: st.color, borderRadius:'99px' }} />
                        </div>
                        <div style={{ width:'24px', fontSize:'12px', fontWeight:'700', color:'#1A1A2E', textAlign:'right' }}>{cnt}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </AgentShell>
  )
}
