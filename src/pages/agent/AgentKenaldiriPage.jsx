import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAgent } from '../../hooks/useAgent'
import AgentShell from '../../components/agent/AgentShell'

const PROFILE_LABEL = {
  perencana: 'The Architect (Si Perencana)',
  pelindung: 'The Guardian (Si Penjaga)',
  pembangun: 'The Builder (Si Pembangun)',
  penjelajah: 'The Explorer (Si Penjelajah)',
  connector: 'The Connector (Si Penghubung)',
  achiever: 'The Achiever (Si Pencetak Hasil)',
  empath: 'The Empath (Si Pembawa Makna)',
  explorer: 'The Explorer (Si Penjelajah Peluang)',
}

export default function AgentKenaldiriPage() {
  const { agent }   = useAgent()
  const [tab, setTab] = useState('new_survey') // 'new_survey' | 'results'
  const [surveys, setSurveys]       = useState([])
  const [importing, setImporting]   = useState(null)
  const [importedIds, setImportedIds] = useState(new Set())
  const [loading, setLoading]       = useState(false)
  const [iframeUrl, setIframeUrl]   = useState('')

  // Load completed surveys from KenalDiri that don't have a prospect yet
  const loadSurveys = useCallback(async (ag) => {
    if (!ag) return
    setLoading(true)
    let q = supabase
      .from('survey_links')
      .select('*, survey_responses(personality_type, primary_product, submitted_at)')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(30)
    if (!ag.is_admin) q = q.eq('agent_id', ag.id)
    const { data } = await q
    setSurveys(data || [])

    // Check which survey_link_ids already imported as prospects
    if (data?.length) {
      const ids = data.map(s => s.id)
      const { data: existing } = await supabase
        .from('prospects')
        .select('survey_link_id')
        .in('survey_link_id', ids)
      setImportedIds(new Set((existing || []).map(x => x.survey_link_id)))
    }
    setLoading(false)
  }, [])

  useEffect(() => { if (agent) loadSurveys(agent) }, [agent, loadSurveys])

  // Build KenalDiri survey URL for iframe
  function openSurvey(type) {
    // Opens new survey flow within KenalDiri embedded
    setTab('new_survey')
    setIframeUrl(`/app/survey/new?embed=1&type=${type}`)
  }

  async function importAsProspect(survey) {
    setImporting(survey.id)
    try {
      const { error } = await supabase.from('prospects').insert({
        agent_id:        survey.agent_id || agent.id,
        prospect_type:   survey.survey_type === 'selling' ? 'nasabah' : 'rekrutan',
        full_name:       survey.prospect_name || 'Prospek dari KenalDiri',
        dob:             survey.prospect_dob || null,
        occupation:      survey.prospect_job || null,
        source:          'kenaldiri',
        stage:           'fact_finding',
        notes:           `Dari survey KenalDiri #${survey.id.slice(0,8)}. Profil: ${PROFILE_LABEL[survey.survey_responses?.personality_type] || survey.survey_responses?.personality_type || '—'}. Produk rekomendasi: ${survey.survey_responses?.primary_product || '—'}.`,
        survey_link_id:  survey.id,
      })
      if (!error) {
        setImportedIds(prev => new Set([...prev, survey.id]))
      }
    } finally {
      setImporting(null)
    }
  }

  const unimported = surveys.filter(s => !importedIds.has(s.id))
  const imported   = surveys.filter(s => importedIds.has(s.id))

  return (
    <AgentShell agent={agent} pageTitle="KenalDiri Survey">
      {/* Status banner */}
      <div style={{ background:'linear-gradient(135deg,#1A1A2E 0%,#2D2D4A 100%)', borderRadius:'11px', padding:'16px 18px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'14px', flexWrap:'wrap' }}>
        <div style={{ fontSize:'32px' }}>🔗</div>
        <div style={{ flex:1, minWidth:'180px' }}>
          <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:'15px', fontWeight:'800', color:'white', marginBottom:'3px' }}>Terhubung dengan KenalDiri</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,.55)' }}>Survey selesai otomatis bisa diimport sebagai prospek. Session login yang sama digunakan.</div>
        </div>
        <div style={{ background:'#12B76A', color:'white', padding:'5px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:'700', flexShrink:0 }}>● AKTIF</div>
      </div>

      {/* TABS */}
      <div style={{ display:'flex', gap:'3px', background:'#F1F3F5', padding:'4px', borderRadius:'10px', width:'fit-content', marginBottom:'16px' }}>
        {[['new_survey','Survey Baru'],['results','Hasil Survey']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding:'6px 14px', borderRadius:'7px', fontSize:'12px', fontWeight:'600', cursor:'pointer', border:'none', background: tab===k?'white':'transparent', color: tab===k?'#1A1A2E':'#6C757D', boxShadow: tab===k?'0 1px 3px rgba(0,0,0,.1)':'none' }}>
            {l} {k==='results' && unimported.length > 0 && <span style={{ background:'#ED1B2E', color:'white', fontSize:'10px', fontWeight:'700', padding:'1px 5px', borderRadius:'10px', marginLeft:'4px' }}>{unimported.length}</span>}
          </button>
        ))}
      </div>

      {/* TAB: SURVEY BARU */}
      {tab === 'new_survey' && (
        <div>
          {!iframeUrl ? (
            <>
              <p style={{ fontSize:'12px', color:'#6C757D', marginBottom:'16px' }}>Pilih jenis survey untuk dibuka langsung di sini. Gunakan saat bertemu calon nasabah atau rekrutan.</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px' }}>
                {[
                  { type:'selling', icon:'🏦', title:'ProfilKu Finansial', desc:'Survey untuk calon nasabah. Mengetahui profil keuangan dan kebutuhan asuransi.', color:'#ED1B2E', bg:'#FFF0F1' },
                  { type:'recruiting', icon:'🤝', title:'ProfilKu Peluang', desc:'Survey untuk calon rekrutan. Mengetahui profil karier dan potensi sebagai agen.', color:'#2563EB', bg:'#EFF6FF' },
                ].map(s => (
                  <div key={s.type} onClick={() => openSurvey(s.type)}
                    style={{ background:'white', borderRadius:'12px', border:`2px solid #E9ECEF`, padding:'20px', cursor:'pointer', transition:'all .15s', textAlign:'center' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=s.color; e.currentTarget.style.background=s.bg }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='#E9ECEF'; e.currentTarget.style.background='white' }}>
                    <div style={{ fontSize:'36px', marginBottom:'10px' }}>{s.icon}</div>
                    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:'15px', fontWeight:'700', color:'#1A1A2E', marginBottom:'6px' }}>{s.title}</div>
                    <p style={{ fontSize:'12px', color:'#6C757D', lineHeight:'1.5' }}>{s.desc}</p>
                    <div style={{ marginTop:'14px', padding:'8px 16px', background:s.color, color:'white', borderRadius:'8px', fontSize:'12px', fontWeight:'700', display:'inline-block' }}>
                      Buka Survey →
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background:'#F8F9FA', border:'1px solid #E9ECEF', borderRadius:'11px', padding:'14px 16px' }}>
                <div style={{ fontSize:'12px', fontWeight:'600', color:'#343A40', marginBottom:'8px' }}>💡 Cara Penggunaan</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  {['Pilih jenis survey sesuai tipe prospek (Nasabah atau Rekrutan)','Survey terbuka langsung di halaman ini — minta prospek mengisi di HP atau laptop kamu','Setelah selesai, hasil otomatis muncul di tab "Hasil Survey"','Import hasil survey sebagai prospek baru dengan 1 klik'].map((s, i) => (
                    <div key={i} style={{ display:'flex', gap:'8px', fontSize:'12px', color:'#6C757D' }}>
                      <span style={{ color:'#ED1B2E', fontWeight:'700', flexShrink:0 }}>{i+1}.</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                <div style={{ fontSize:'13px', fontWeight:'600', color:'#1A1A2E' }}>Survey aktif</div>
                <button onClick={() => setIframeUrl('')} className="pa-btn pa-btn-outline pa-btn-sm">← Kembali</button>
              </div>
              <div style={{ borderRadius:'11px', overflow:'hidden', border:'1px solid #E9ECEF', height:'calc(100vh - 220px)' }}>
                <iframe src={iframeUrl} style={{ width:'100%', height:'100%', border:'none' }} title="KenalDiri Survey" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: HASIL SURVEY */}
      {tab === 'results' && (
        <div>
          {loading ? (
            <div style={{ textAlign:'center', padding:'60px', color:'#ADB5BD', fontSize:'13px' }}>Memuat hasil survey...</div>
          ) : surveys.length === 0 ? (
            <div style={{ background:'white', borderRadius:'11px', border:'1px solid #E9ECEF', padding:'50px', textAlign:'center' }}>
              <div style={{ fontSize:'32px', marginBottom:'12px' }}>📋</div>
              <div style={{ fontSize:'13px', color:'#ADB5BD' }}>Belum ada survey yang selesai. Ajak prospek untuk mengisi survey KenalDiri.</div>
            </div>
          ) : (
            <>
              {unimported.length > 0 && (
                <div style={{ background:'#FFF0F1', border:'1px solid #FDDDE0', borderRadius:'11px', padding:'12px 16px', marginBottom:'14px', display:'flex', alignItems:'center', gap:'10px' }}>
                  <span style={{ color:'#ED1B2E', fontSize:'16px' }}>⚡</span>
                  <div style={{ fontSize:'13px', color:'#C0141F', fontWeight:'600' }}>{unimported.length} survey belum diimport sebagai prospek.</div>
                </div>
              )}
              <div style={{ background:'white', borderRadius:'11px', border:'1px solid #E9ECEF', overflow:'hidden' }}>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'600px' }}>
                    <thead>
                      <tr>
                        {['Nama','Tipe Survey','Profil','Waktu','Status','Aksi'].map(h => (
                          <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontSize:'10px', fontWeight:'700', color:'#ADB5BD', textTransform:'uppercase', letterSpacing:'.5px', background:'#F8F9FA', borderBottom:'1px solid #E9ECEF', whiteSpace:'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {surveys.map(s => {
                        const isImported = importedIds.has(s.id)
                        return (
                          <tr key={s.id} style={{ background: !isImported ? '#FAFAFA' : 'white' }}>
                            <td style={{ padding:'11px 12px', borderBottom:'1px solid #F1F3F5' }}>
                              <div style={{ fontWeight:'600', color:'#1A1A2E', fontSize:'13px' }}>{s.prospect_name || '—'}</div>
                              <div style={{ fontSize:'10px', color:'#ADB5BD', marginTop:'2px' }}>#{s.id.slice(0,8)}</div>
                            </td>
                            <td style={{ padding:'11px 12px', borderBottom:'1px solid #F1F3F5' }}>
                              <span style={{ background: s.survey_type==='selling'?'#FFF0F1':'#EFF6FF', color: s.survey_type==='selling'?'#ED1B2E':'#2563EB', padding:'3px 8px', borderRadius:'20px', fontSize:'11px', fontWeight:'600' }}>
                                {s.survey_type === 'selling' ? '💰 ProfilKu Finansial' : '🤝 ProfilKu Peluang'}
                              </span>
                            </td>
                            <td style={{ padding:'11px 12px', borderBottom:'1px solid #F1F3F5', fontSize:'12px', color:'#6C757D' }}>
                              {PROFILE_LABEL[s.survey_responses?.personality_type] || s.survey_responses?.personality_type || '—'}
                            </td>
                            <td style={{ padding:'11px 12px', borderBottom:'1px solid #F1F3F5', fontSize:'11px', color:'#ADB5BD', whiteSpace:'nowrap' }}>
                              {s.completed_at ? new Date(s.completed_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'}
                            </td>
                            <td style={{ padding:'11px 12px', borderBottom:'1px solid #F1F3F5' }}>
                              {isImported
                                ? <span style={{ background:'#ECFDF3', color:'#059669', padding:'3px 8px', borderRadius:'20px', fontSize:'11px', fontWeight:'600' }}>✓ Sudah diimport</span>
                                : <span style={{ background:'#FEF3C7', color:'#D97706', padding:'3px 8px', borderRadius:'20px', fontSize:'11px', fontWeight:'600' }}>Belum diproses</span>
                              }
                            </td>
                            <td style={{ padding:'11px 12px', borderBottom:'1px solid #F1F3F5' }}>
                              {isImported
                                ? <span style={{ fontSize:'11px', color:'#ADB5BD' }}>—</span>
                                : <button onClick={() => importAsProspect(s)} disabled={importing === s.id} className="pa-btn pa-btn-red pa-btn-sm" style={{ opacity: importing===s.id?.7:1 }}>
                                    {importing === s.id ? 'Mengimport...' : '+ Tambah ke List'}
                                  </button>
                              }
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </AgentShell>
  )
}
