import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAgent } from '../../hooks/useAgent'
import AgentShell from '../../components/agent/AgentShell'
import ProspekModal from '../../components/agent/ProspekModal'
import ReminderModal from '../../components/agent/ReminderModal'

const STAGE_LABEL = { fact_finding:'Fact Finding', fu1:'FU 1', fu2:'FU 2', presentasi:'Presentasi', closing:'Closing' }
const STAGE_COLOR = {
  fact_finding:{ bg:'#F3E8FF', text:'#7C3AED' },
  fu1:{ bg:'#FEF3C7', text:'#D97706' },
  fu2:{ bg:'#FEF9C3', text:'#CA8A04' },
  presentasi:{ bg:'#DBEAFE', text:'#1D4ED8' },
  closing:{ bg:'#ECFDF3', text:'#059669' },
}
const SOURCE_LABEL = { keluarga:'Keluarga', teman:'Teman', tetangga:'Tetangga', media_sosial:'Media Sosial', komunitas:'Komunitas', kenaldiri:'KenalDiri 🔗', lainnya:'Lainnya' }
const OCC_LABEL = { karyawan:'Karyawan', executive_manajer:'Executive/Manajer', pedagang:'Pedagang', online_shop:'Online Shop', pensiunan:'Pensiunan', lainnya:'Lainnya' }

export default function AgentProspekPage() {
  const { agent }     = useAgent()
  const [prospects, setProspects] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStage, setFilterStage] = useState('all')
  const [showModal, setShowModal]   = useState(false)
  const [editItem, setEditItem]     = useState(null)
  const [reminderFor, setReminderFor] = useState(null)
  const [deleting, setDeleting]     = useState(null)

  const load = useCallback(async (ag) => {
    if (!ag) return
    let q = supabase.from('prospects').select('*').order('created_at', { ascending: false })
    if (!ag.is_admin) q = q.eq('agent_id', ag.id)
    const { data } = await q
    setProspects(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { if (agent) load(agent) }, [agent, load])

  async function handleDelete(id) {
    if (!window.confirm('Hapus prospek ini?')) return
    setDeleting(id)
    await supabase.from('prospects').delete().eq('id', id)
    setProspects(p => p.filter(x => x.id !== id))
    setDeleting(null)
  }

  const filtered = prospects.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.full_name.toLowerCase().includes(q) || (p.notes || '').toLowerCase().includes(q)
    const matchType  = filterType  === 'all' || p.prospect_type === filterType
    const matchStage = filterStage === 'all' || p.stage === filterStage
    return matchSearch && matchType && matchStage
  })

  const counts = { nasabah: prospects.filter(p => p.prospect_type === 'nasabah').length, rekrutan: prospects.filter(p => p.prospect_type === 'rekrutan').length }

  return (
    <AgentShell agent={agent} pageTitle="List Prospek" onAddProspek={() => { setEditItem(null); setShowModal(true) }}>
      {/* FILTER BAR */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'16px', flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'7px', background:'white', border:'1px solid #E9ECEF', borderRadius:'8px', padding:'6px 11px', flex:'1', minWidth:'140px', maxWidth:'260px' }}>
          <span style={{ color:'#ADB5BD' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama..." style={{ border:'none', outline:'none', fontSize:'12px', color:'#343A40', width:'100%', background:'transparent' }} />
        </div>
        <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
          {[['all','Semua'],['nasabah','🏦 Nasabah'],['rekrutan','🤝 Rekrutan']].map(([v,l]) => (
            <button key={v} onClick={() => setFilterType(v)} style={{ padding:'5px 11px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', cursor:'pointer', border:'none', background: filterType === v ? (v === 'nasabah' ? '#FFF0F1' : v === 'rekrutan' ? '#EFF6FF' : '#1A1A2E') : '#F1F3F5', color: filterType === v ? (v === 'nasabah' ? '#ED1B2E' : v === 'rekrutan' ? '#2563EB' : 'white') : '#6C757D' }}>
              {l} {v !== 'all' ? `(${counts[v] || 0})` : `(${prospects.length})`}
            </button>
          ))}
        </div>
        <select value={filterStage} onChange={e => setFilterStage(e.target.value)} style={{ padding:'6px 10px', border:'1px solid #E9ECEF', borderRadius:'8px', fontSize:'12px', outline:'none', color:'#343A40', background:'white', cursor:'pointer' }}>
          <option value="all">Semua Tahap</option>
          {Object.entries(STAGE_LABEL).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* TABLE */}
      <div style={{ background:'white', borderRadius:'11px', border:'1px solid #E9ECEF', overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'700px' }}>
            <thead>
              <tr>
                {['Nama & Info','Tipe','Sumber','Pekerjaan','Tahap','Keterangan','Aksi'].map(h => (
                  <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontSize:'10px', fontWeight:'700', color:'#ADB5BD', textTransform:'uppercase', letterSpacing:'.5px', background:'#F8F9FA', borderBottom:'1px solid #E9ECEF', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding:'40px', textAlign:'center', fontSize:'13px', color:'#ADB5BD' }}>Memuat...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding:'40px', textAlign:'center', fontSize:'13px', color:'#ADB5BD' }}>
                  {prospects.length === 0 ? 'Belum ada prospek. Klik "+ Prospek" untuk menambah.' : 'Tidak ada hasil pencarian.'}
                </td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} style={{ transition:'background .1s' }} onMouseEnter={e => e.currentTarget.style.background='#F8F9FA'} onMouseLeave={e => e.currentTarget.style.background=''}>
                  <td style={{ padding:'11px 12px', borderBottom:'1px solid #F1F3F5', verticalAlign:'top' }}>
                    <div style={{ fontWeight:'600', color:'#1A1A2E', fontSize:'13px' }}>{p.full_name}</div>
                    <div style={{ fontSize:'10px', color:'#ADB5BD', marginTop:'2px' }}>
                      {p.dob ? new Date(p.dob).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) : '—'} · {p.marital_status === 'menikah' ? 'Menikah' : 'Single'}
                    </div>
                  </td>
                  <td style={{ padding:'11px 12px', borderBottom:'1px solid #F1F3F5', verticalAlign:'top' }}>
                    <span style={{ background: p.prospect_type === 'nasabah' ? '#FFF0F1' : '#EFF6FF', color: p.prospect_type === 'nasabah' ? '#ED1B2E' : '#2563EB', padding:'3px 8px', borderRadius:'20px', fontSize:'11px', fontWeight:'600' }}>
                      {p.prospect_type === 'nasabah' ? '🏦 Nasabah' : '🤝 Rekrutan'}
                    </span>
                  </td>
                  <td style={{ padding:'11px 12px', borderBottom:'1px solid #F1F3F5', fontSize:'12px', color:'#6C757D', verticalAlign:'top' }}>
                    {SOURCE_LABEL[p.source] || p.source || '—'}
                  </td>
                  <td style={{ padding:'11px 12px', borderBottom:'1px solid #F1F3F5', fontSize:'12px', color:'#6C757D', verticalAlign:'top' }}>
                    {OCC_LABEL[p.occupation] || p.occupation || '—'}
                  </td>
                  <td style={{ padding:'11px 12px', borderBottom:'1px solid #F1F3F5', verticalAlign:'top' }}>
                    <span style={{ background:STAGE_COLOR[p.stage]?.bg, color:STAGE_COLOR[p.stage]?.text, padding:'3px 9px', borderRadius:'20px', fontSize:'11px', fontWeight:'600' }}>
                      {STAGE_LABEL[p.stage]}
                    </span>
                  </td>
                  <td style={{ padding:'11px 12px', borderBottom:'1px solid #F1F3F5', verticalAlign:'top', maxWidth:'160px' }}>
                    {p.notes
                      ? <div style={{ fontSize:'11px', color:'#6C757D', lineHeight:'1.4', overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{p.notes}</div>
                      : <div style={{ fontSize:'11px', color:'#ADB5BD', fontStyle:'italic', cursor:'pointer' }} onClick={() => { setEditItem(p); setShowModal(true) }}>+ Tambah keterangan</div>
                    }
                  </td>
                  <td style={{ padding:'11px 12px', borderBottom:'1px solid #F1F3F5', verticalAlign:'top' }}>
                    <div style={{ display:'flex', gap:'4px' }}>
                      <button title="Edit" onClick={() => { setEditItem(p); setShowModal(true) }} style={s.iconBtn}>✏️</button>
                      <button title="Set Reminder" onClick={() => setReminderFor(p)} style={s.iconBtn}>🔔</button>
                      <button title="Hapus" onClick={() => handleDelete(p.id)} disabled={deleting === p.id} style={{ ...s.iconBtn, opacity: deleting === p.id ? .5 : 1 }}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div style={{ padding:'10px 14px', borderTop:'1px solid #F1F3F5', fontSize:'11px', color:'#ADB5BD' }}>
            Menampilkan {filtered.length} dari {prospects.length} prospek
          </div>
        )}
      </div>

      {showModal && (
        <ProspekModal
          agent={agent}
          initial={editItem}
          onClose={() => { setShowModal(false); setEditItem(null) }}
          onSaved={() => { setShowModal(false); setEditItem(null); load(agent) }}
        />
      )}

      {reminderFor && (
        <ReminderModal
          agent={agent}
          prospect={reminderFor}
          onClose={() => setReminderFor(null)}
          onSaved={() => setReminderFor(null)}
        />
      )}
    </AgentShell>
  )
}

const s = {
  iconBtn: { width:'26px', height:'26px', borderRadius:'6px', border:'1px solid #E9ECEF', background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', transition:'background .15s' },
}
