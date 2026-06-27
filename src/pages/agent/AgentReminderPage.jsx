// ── AgentReminderPage ──
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAgent } from '../../hooks/useAgent'
import AgentShell from '../../components/agent/AgentShell'
import ReminderModal from '../../components/agent/ReminderModal'

const STAGE_LABEL = { fact_finding:'Fact Finding', fu1:'FU 1', fu2:'FU 2', presentasi:'Presentasi', closing:'Closing' }

export function AgentReminderPage() {
  const { agent }   = useAgent()
  const [tab, setTab] = useState('today') // today | upcoming | overdue | done
  const [reminders, setReminders] = useState([])
  const [loading, setLoading]   = useState(true)
  const [addFor, setAddFor]     = useState(null)
  const [prospects, setProspects] = useState([])

  const load = useCallback(async (ag) => {
    if (!ag) return
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const todayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

    let q = supabase.from('reminders')
      .select('*, prospects(id, full_name, stage, prospect_type, whatsapp)')
      .order('remind_at', { ascending: true })
    if (!ag.is_admin) q = q.eq('agent_id', ag.id)

    const { data } = await q
    setReminders(data || [])

    // Load prospects for "add reminder" picker
    let pq = supabase.from('prospects').select('id, full_name, stage, prospect_type').neq('stage','closing').order('full_name')
    if (!ag.is_admin) pq = pq.eq('agent_id', ag.id)
    const { data: pd } = await pq
    setProspects(pd || [])
    setLoading(false)
  }, [])

  useEffect(() => { if (agent) load(agent) }, [agent, load])

  async function markDone(id) {
    await supabase.from('reminders').update({ is_done:true, done_at: new Date().toISOString() }).eq('id', id)
    setReminders(r => r.map(x => x.id === id ? { ...x, is_done:true } : x))
  }

  async function deleteReminder(id) {
    await supabase.from('reminders').delete().eq('id', id)
    setReminders(r => r.filter(x => x.id !== id))
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  const filtered = reminders.filter(r => {
    const dt = new Date(r.remind_at)
    if (tab === 'today')    return !r.is_done && dt >= todayStart && dt < todayEnd
    if (tab === 'upcoming') return !r.is_done && dt >= todayEnd
    if (tab === 'overdue')  return !r.is_done && dt < todayStart
    if (tab === 'done')     return r.is_done
    return true
  })

  const counts = {
    today:    reminders.filter(r => { const dt=new Date(r.remind_at); return !r.is_done && dt>=todayStart && dt<todayEnd }).length,
    upcoming: reminders.filter(r => !r.is_done && new Date(r.remind_at)>=todayEnd).length,
    overdue:  reminders.filter(r => !r.is_done && new Date(r.remind_at)<todayStart).length,
    done:     reminders.filter(r => r.is_done).length,
  }

  const urgencyColor = (r) => {
    if (r.is_done) return '#059669'
    const dt = new Date(r.remind_at)
    if (dt < todayStart) return '#ED1B2E'
    if (dt >= todayStart && dt < todayEnd) return '#F59E0B'
    return '#2563EB'
  }

  return (
    <AgentShell agent={agent} pageTitle="Reminder">
      <div style={{ marginBottom:'16px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'8px' }}>
        <p style={{ fontSize:'12px', color:'#ADB5BD' }}>Jadwal follow-up yang kamu tetapkan sendiri sesuai kesepakatan dengan prospek.</p>
        <button className="pa-btn pa-btn-red pa-btn-sm" onClick={() => setAddFor('pick')}>+ Tambah Reminder</button>
      </div>

      {/* TABS */}
      <div style={{ display:'flex', gap:'3px', background:'#F1F3F5', padding:'4px', borderRadius:'10px', width:'fit-content', marginBottom:'16px' }}>
        {[['today','Hari Ini'],['upcoming','Mendatang'],['overdue','Terlambat'],['done','Selesai']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding:'6px 13px', borderRadius:'7px', fontSize:'12px', fontWeight:'600', cursor:'pointer', border:'none', background: tab===k ? 'white' : 'transparent', color: tab===k ? '#1A1A2E' : '#6C757D', boxShadow: tab===k ? '0 1px 3px rgba(0,0,0,.1)' : 'none', whiteSpace:'nowrap' }}>
            {l} {counts[k] > 0 && <span style={{ background: k==='overdue'?'#ED1B2E':'#ADB5BD', color:'white', fontSize:'10px', fontWeight:'700', padding:'1px 5px', borderRadius:'10px', marginLeft:'4px' }}>{counts[k]}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'#ADB5BD', fontSize:'13px' }}>Memuat...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background:'white', borderRadius:'11px', border:'1px solid #E9ECEF', padding:'50px', textAlign:'center' }}>
          <div style={{ fontSize:'32px', marginBottom:'12px' }}>✅</div>
          <div style={{ fontSize:'13px', color:'#ADB5BD' }}>
            {tab === 'today' ? 'Tidak ada reminder hari ini.' : tab === 'overdue' ? 'Tidak ada reminder yang terlambat.' : 'Tidak ada reminder.'}
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {filtered.map(r => {
            const dt = new Date(r.remind_at)
            const isOverdue = !r.is_done && dt < todayStart
            const isToday   = !r.is_done && dt >= todayStart && dt < todayEnd
            return (
              <div key={r.id} style={{ background: isOverdue ? '#FFF0F1' : 'white', border:`1px solid ${isOverdue ? '#FDDDE0' : '#E9ECEF'}`, borderRadius:'11px', padding:'14px', display:'flex', alignItems:'flex-start', gap:'12px', flexWrap:'wrap' }}>
                <div style={{ width:'38px', height:'38px', borderRadius:'50%', background: isOverdue?'#ED1B2E': isToday?'#FFFBEB':'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px', flexShrink:0 }}>
                  {r.is_done ? '✅' : isOverdue ? '⚠️' : '⏰'}
                </div>
                <div style={{ flex:1, minWidth:'180px' }}>
                  <div style={{ fontSize:'11px', fontWeight:'700', color: urgencyColor(r), marginBottom:'2px', textTransform:'uppercase', letterSpacing:'.4px' }}>
                    {r.is_done ? 'Selesai' : isOverdue ? `TERLAMBAT · ${Math.floor((now-dt)/(1000*60*60*24))} hari` : dt.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'}) + ' · ' + dt.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}
                  </div>
                  <div style={{ fontSize:'14px', fontWeight:'700', color:'#1A1A2E' }}>{r.prospects?.full_name}</div>
                  <div style={{ fontSize:'12px', color:'#6C757D' }}>
                    {STAGE_LABEL[r.prospects?.stage]} · {r.prospects?.prospect_type === 'nasabah' ? '🏦 Nasabah' : '🤝 Rekrutan'}
                  </div>
                  {r.label && <div style={{ fontSize:'11px', color:'#ADB5BD', marginTop:'4px', fontStyle:'italic' }}>"{r.label}"</div>}
                  {r.prospects?.whatsapp && (
                    <a href={`https://wa.me/${r.prospects.whatsapp.replace(/^0/,'62')}`} target="_blank" rel="noopener noreferrer"
                      style={{ display:'inline-block', marginTop:'6px', fontSize:'11px', color:'#25D366', fontWeight:'600', textDecoration:'none' }}>
                      📱 WA: {r.prospects.whatsapp}
                    </a>
                  )}
                </div>
                <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', flexShrink:0 }}>
                  {!r.is_done && (
                    <>
                      <button onClick={() => markDone(r.id)} className="pa-btn pa-btn-outline pa-btn-sm">✓ Selesai</button>
                      {r.prospects?.whatsapp && (
                        <a href={`https://wa.me/${r.prospects.whatsapp.replace(/^0/,'62')}`} target="_blank" rel="noopener noreferrer" className="pa-btn pa-btn-red pa-btn-sm" style={{ textDecoration:'none' }}>📞 Hubungi</a>
                      )}
                    </>
                  )}
                  <button onClick={() => deleteReminder(r.id)} className="pa-btn pa-btn-outline pa-btn-sm" style={{ color:'#ED1B2E' }}>🗑</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pick prospect for new reminder */}
      {addFor === 'pick' && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }} onClick={e => { if(e.target===e.currentTarget) setAddFor(null) }}>
          <div style={{ background:'white', borderRadius:'14px', width:'100%', maxWidth:'400px', maxHeight:'70vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid #E9ECEF', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:'700', fontSize:'14px', color:'#1A1A2E' }}>Pilih Prospek</div>
            <div style={{ overflowY:'auto', flex:1 }}>
              {prospects.map(p => (
                <div key={p.id} style={{ padding:'12px 18px', borderBottom:'1px solid #F1F3F5', cursor:'pointer', transition:'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background='#F8F9FA'} onMouseLeave={e => e.currentTarget.style.background=''}
                  onClick={() => { setAddFor(p); }}>
                  <div style={{ fontWeight:'600', fontSize:'13px', color:'#1A1A2E' }}>{p.full_name}</div>
                  <div style={{ fontSize:'11px', color:'#6C757D', marginTop:'2px' }}>{STAGE_LABEL[p.stage]} · {p.prospect_type === 'nasabah' ? '🏦' : '🤝'}</div>
                </div>
              ))}
            </div>
            <div style={{ padding:'12px 18px', borderTop:'1px solid #E9ECEF' }}>
              <button className="pa-btn pa-btn-outline" style={{ width:'100%', justifyContent:'center' }} onClick={() => setAddFor(null)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {addFor && addFor !== 'pick' && typeof addFor === 'object' && (
        <ReminderModal
          agent={agent}
          prospect={addFor}
          onClose={() => setAddFor(null)}
          onSaved={() => { setAddFor(null); load(agent) }}
        />
      )}
    </AgentShell>
  )
}

export default AgentReminderPage
