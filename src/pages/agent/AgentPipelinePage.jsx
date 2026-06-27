import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAgent } from '../../hooks/useAgent'
import AgentShell from '../../components/agent/AgentShell'
import ProspekModal from '../../components/agent/ProspekModal'

const STAGES = [
  { key:'fact_finding', label:'FACT FINDING', color:'#7C3AED', light:'#F3E8FF', desc:'Agen mencari tahu informasi detail, kebutuhan finansial serta kondisi keuangan dari calon nasabah.' },
  { key:'fu1', label:'FOLLOW-UP 1', color:'#D97706', light:'#FEF3C7', desc:'Jika data memenuhi kriteria, buat janji temu. Jelaskan maksud & tujuan menggunakan jembatan prospek.' },
  { key:'fu2', label:'FOLLOW-UP 2', color:'#CA8A04', light:'#FEF9C3', desc:'Setelah pertemuan pertama, FU ke-2 untuk menjelaskan detail proposal dan kebutuhan asuransi lebih lanjut.' },
  { key:'presentasi', label:'PRESENTASI', color:'#1D4ED8', light:'#DBEAFE', desc:'Menjelaskan detail ilustrasi atau konsep kebutuhan asuransi kepada calon nasabah / rekrutan.' },
  { key:'closing', label:'CLOSING ✅', color:'#059669', light:'#ECFDF3', desc:'Nasabah setuju tanda tangan form pengajuan asuransi, atau calon agen setuju bergabung sebagai agen.' },
]
const SOURCE_LABEL = { keluarga:'Keluarga', teman:'Teman', tetangga:'Tetangga', media_sosial:'Medsos', komunitas:'Komunitas', kenaldiri:'KenalDiri', lainnya:'Lainnya' }

export default function AgentPipelinePage() {
  const { agent } = useAgent()
  const [prospects, setProspects] = useState([])
  const [loading, setLoading]     = useState(true)
  const [editItem, setEditItem]   = useState(null)
  const [filterType, setFilterType] = useState('all')

  const load = useCallback(async (ag) => {
    if (!ag) return
    let q = supabase.from('prospects').select('*').order('updated_at', { ascending: false })
    if (!ag.is_admin) q = q.eq('agent_id', ag.id)
    const { data } = await q
    setProspects(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { if (agent) load(agent) }, [agent, load])

  async function moveStage(prospect, newStage) {
    const oldStage = prospect.stage
    // Optimistic update
    setProspects(prev => prev.map(p => p.id === prospect.id ? { ...p, stage: newStage } : p))
    await supabase.from('prospects').update({ stage: newStage }).eq('id', prospect.id)
    await supabase.from('followup_logs').insert({
      prospect_id: prospect.id,
      agent_id: agent.id,
      from_stage: oldStage,
      to_stage: newStage,
      notes: 'Dipindah via Pipeline',
    })
  }

  const filtered = prospects.filter(p => filterType === 'all' || p.prospect_type === filterType)
  const byStage  = (key) => filtered.filter(p => p.stage === key)

  return (
    <AgentShell agent={agent} pageTitle="Pipeline Follow-up" onAddProspek={() => { setEditItem({}); }}>
      <div style={{ marginBottom:'16px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'10px' }}>
        <p style={{ fontSize:'12px', color:'#ADB5BD' }}>Pantau progress setiap prospek di setiap tahapan. Klik nama prospek untuk edit atau pindah tahap.</p>
        <div style={{ display:'flex', gap:'5px' }}>
          {[['all','Semua'],['nasabah','🏦 Nasabah'],['rekrutan','🤝 Rekrutan']].map(([v,l]) => (
            <button key={v} onClick={() => setFilterType(v)} style={{ padding:'5px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', cursor:'pointer', border:'none', background: filterType===v ? '#1A1A2E' : '#F1F3F5', color: filterType===v ? 'white' : '#6C757D' }}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'#ADB5BD', fontSize:'13px' }}>Memuat pipeline...</div>
      ) : (
        <div style={{ overflowX:'auto', paddingBottom:'8px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,minmax(200px,1fr))', gap:'10px', minWidth:'1000px' }}>
            {STAGES.map(stage => {
              const cards = byStage(stage.key)
              return (
                <div key={stage.key} style={{ background:'white', borderRadius:'10px', border:'1px solid #E9ECEF', overflow:'hidden', display:'flex', flexDirection:'column' }}>
                  {/* Column Header */}
                  <div style={{ background:stage.color, padding:'12px 12px 10px', flexShrink:0 }}>
                    <div style={{ fontSize:'10px', fontWeight:'700', letterSpacing:'.5px', color:'rgba(255,255,255,.85)' }}>{stage.label}</div>
                    <div style={{ fontSize:'24px', fontWeight:'800', color:'white', lineHeight:'1', marginTop:'2px' }}>{cards.length}</div>
                    <div style={{ marginTop:'8px', padding:'7px 9px', background:'rgba(255,255,255,.13)', borderRadius:'6px' }}>
                      <div style={{ fontSize:'10px', color:'rgba(255,255,255,.88)', lineHeight:'1.5' }}>{stage.desc}</div>
                    </div>
                  </div>

                  {/* Cards */}
                  <div style={{ padding:'8px', display:'flex', flexDirection:'column', gap:'6px', overflowY:'auto', maxHeight:'380px', flex:1 }}>
                    {cards.length === 0 ? (
                      <div style={{ padding:'16px', textAlign:'center', fontSize:'11px', color:'#ADB5BD', fontStyle:'italic' }}>Tidak ada prospek</div>
                    ) : cards.map(p => (
                      <div key={p.id} style={{ background:stage.light, borderRadius:'7px', padding:'10px', borderLeft:`3px solid ${stage.color}`, cursor:'pointer', transition:'opacity .15s' }}
                        onClick={() => setEditItem(p)}>
                        <div style={{ fontSize:'12px', fontWeight:'600', color:'#1A1A2E' }}>{p.full_name}</div>
                        <div style={{ fontSize:'10px', color:'#6C757D', marginTop:'2px' }}>
                          {p.prospect_type === 'nasabah' ? '🏦' : '🤝'} {p.prospect_type === 'nasabah' ? 'Nasabah' : 'Rekrutan'} · {SOURCE_LABEL[p.source] || p.source}
                        </div>
                        {p.notes && (
                          <div style={{ fontSize:'10px', color:'#6C757D', marginTop:'3px', lineHeight:'1.3', overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', fontStyle:'italic' }}>
                            {p.notes}
                          </div>
                        )}
                        {/* Move buttons */}
                        <div style={{ marginTop:'6px', display:'flex', gap:'4px', flexWrap:'wrap' }}>
                          {STAGES.filter(s => s.key !== stage.key).slice(-2).map(s => (
                            <button key={s.key} onClick={e => { e.stopPropagation(); moveStage(p, s.key) }}
                              style={{ fontSize:'9px', fontWeight:'600', padding:'2px 6px', borderRadius:'4px', border:`1px solid ${s.color}`, background:'white', color:s.color, cursor:'pointer', whiteSpace:'nowrap' }}>
                              → {s.label.replace(' ✅','')}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {editItem && Object.keys(editItem).length > 0 && (
        <ProspekModal
          agent={agent}
          initial={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => { setEditItem(null); load(agent) }}
        />
      )}
    </AgentShell>
  )
}
