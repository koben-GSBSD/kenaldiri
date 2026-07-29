import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAgent } from '../../hooks/useAgent'
import AgentShell from '../../components/agent/AgentShell'
import ResultPanel from '../../components/agent/ResultPanel'

const PROFILE_LABEL = {
  perencana: 'The Architect', pelindung: 'The Guardian',
  pembangun: 'The Builder',  penjelajah: 'The Explorer',
  connector: 'The Connector', achiever: 'The Achiever',
  empath: 'The Empath',      explorer: 'The Explorer (Peluang)',
}

const BASE_URL = window.location.origin

export default function AgentKenaldiriPage() {
  const { agent }   = useAgent()
  const location    = useLocation()
  const initTab     = new URLSearchParams(location.search).get('tab') === 'results' ? 'results' : 'new_survey'
  const [tab, setTab]           = useState(initTab)
  const [surveys, setSurveys]   = useState([])
  const [importedIds, setImportedIds] = useState(new Set())
  const [loading, setLoading]   = useState(false)
  const [generating, setGenerating] = useState(null) // 'selling' | 'recruiting' | null
  const [generatedLink, setGeneratedLink] = useState(null) // { url, type }
  const [copied, setCopied]     = useState(false)
  const [panel, setPanel]       = useState(null) // { survey, response }
  const [importing, setImporting] = useState(false)
  const [genError, setGenError] = useState(null)

  const loadSurveys = useCallback(async (ag) => {
    if (!ag) return
    setLoading(true)
    let q = supabase
      .from('survey_links')
      .select('*, survey_responses(personality_type, primary_product, extra_data, readiness_score, recommendation_narrative, shio)')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(50)
    if (!ag.is_admin) q = q.eq('agent_id', ag.id)
    const { data } = await q
    setSurveys(data || [])

    if (data?.length) {
      const ids = data.map(s => s.id)
      const { data: existing } = await supabase
        .from('prospects').select('survey_link_id').in('survey_link_id', ids)
      setImportedIds(new Set((existing || []).map(x => x.survey_link_id)))
    }
    setLoading(false)
  }, [])

  useEffect(() => { if (agent) loadSurveys(agent) }, [agent, loadSurveys])

  async function generateLink(type) {
    if (!agent) return
    setGenerating(type)
    setGeneratedLink(null)
    setGenError(null)
    const token = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const { error } = await supabase.from('survey_links').insert({
      agent_id:    agent.id,
      token,
      survey_type: type,
      status:      'pending',
      expires_at:  expires,
      prospect_name: '',
    })
    if (!error) {
      setGeneratedLink({ url: `${BASE_URL}/s/${token}`, type })
    } else {
      setGenError(error.message || 'Gagal membuat link. Coba lagi.')
    }
    setGenerating(null)
  }

  async function copyLink() {
    if (!generatedLink) return
    await navigator.clipboard.writeText(generatedLink.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareWA() {
    if (!generatedLink) return
    const isCareer = generatedLink.type === 'recruiting'
    const msg = isCareer
      ? `Halo! Kami mengundangmu untuk mengisi survey singkat *ProfilKu Peluang* — kenali potensi dan peluang karirmu.\n\nLink survey (berlaku 24 jam):\n${generatedLink.url}`
      : `Halo! Kami mengundangmu untuk mengisi survey singkat *ProfilKu Finansial* — kenali kepribadian dan profil keuanganmu.\n\nLink survey (berlaku 24 jam):\n${generatedLink.url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  async function openPanel(survey) {
    const response = survey.survey_responses || null
    setPanel({ survey, response })
  }

  async function handleImport(survey) {
    if (!agent || importedIds.has(survey.id)) return
    setImporting(true)
    const response = survey.survey_responses
    const { error } = await supabase.from('prospects').insert({
      agent_id:       survey.agent_id || agent.id,
      prospect_type:  survey.survey_type === 'selling' ? 'nasabah' : 'rekrutan',
      full_name:      survey.prospect_name || 'Prospek dari KenalDiri',
      dob:            survey.prospect_dob || null,
      occupation:     survey.prospect_job || null,
      source:         'kenaldiri',
      stage:          'fact_finding',
      survey_link_id: survey.id,
      notes: `Dari KenalDiri. Profil: ${PROFILE_LABEL[response?.personality_type] || response?.personality_type || '—'}.`,
    })
    if (!error) {
      setImportedIds(prev => new Set([...prev, survey.id]))
      setPanel(null)
    }
    setImporting(false)
  }

  const unprocessed = surveys.filter(s => !importedIds.has(s.id)).length

  const accent = '#7F77DD'

  return (
    <AgentShell agent={agent} pageTitle="KenalDiri">
      {/* Tabs */}
      <div style={{ display:'flex', gap:'0', marginBottom:'20px', background:'#F1F3F5', borderRadius:'10px', padding:'3px' }}>
        {[
          { key:'new_survey', label:'🔗 Survey Baru' },
          { key:'results', label:`📋 Hasil Survey${unprocessed > 0 ? ` (${unprocessed})` : ''}` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex:1, padding:'9px 14px', border:'none', borderRadius:'8px', cursor:'pointer',
            fontSize:'13px', fontWeight:'600', transition:'all .15s',
            background: tab === t.key ? '#fff' : 'transparent',
            color: tab === t.key ? '#1A1A2E' : '#6C757D',
            boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
            fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Survey Baru */}
      {tab === 'new_survey' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <p style={{ fontSize:'13px', color:'#6C757D', margin:0 }}>
            Generate link survey dan bagikan ke calon nasabah atau rekrutan via WhatsApp. Link berlaku 24 jam.
          </p>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            {[
              { type:'selling',    icon:'💼', label:'ProfilKu Finansial', desc:'Untuk calon nasabah — profil kepribadian & keuangan', color:'#7F77DD', light:'#EEEDFE' },
              { type:'recruiting', icon:'🌱', label:'ProfilKu Peluang',   desc:'Untuk calon agen — potensi & kesiapan karir', color:'#1D9E75', light:'#E6F9F3' },
            ].map(opt => (
              <button key={opt.type} onClick={() => generateLink(opt.type)} disabled={!!generating}
                style={{ background:'#fff', border:`2px solid ${opt.light}`, borderRadius:'14px', padding:'20px 16px', cursor: generating ? 'not-allowed' : 'pointer', textAlign:'left', transition:'all .15s', opacity: generating ? 0.7 : 1, fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
                <div style={{ fontSize:'28px', marginBottom:'8px' }}>{opt.icon}</div>
                <div style={{ fontSize:'14px', fontWeight:'700', color:'#1A1A2E', marginBottom:'4px' }}>{opt.label}</div>
                <div style={{ fontSize:'12px', color:'#6C757D', lineHeight:1.5 }}>{opt.desc}</div>
                {generating === opt.type && (
                  <div style={{ fontSize:'12px', color: opt.color, marginTop:'8px', fontWeight:'600' }}>Membuat link...</div>
                )}
              </button>
            ))}
          </div>

          {genError && (
            <div style={{ background:'#FCEAEA', border:'1px solid #F5B7B1', borderRadius:'10px', padding:'12px 16px', fontSize:'13px', color:'#9B1C1C', fontWeight:'500' }}>
              ⚠️ {genError}
            </div>
          )}

          {generatedLink && (
            <div style={{ background:'#fff', border:'1px solid #E9ECEF', borderRadius:'14px', padding:'20px' }}>
              <div style={{ fontSize:'12px', fontWeight:'600', color:'#ADB5BD', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px' }}>
                Link {generatedLink.type === 'selling' ? 'ProfilKu Finansial' : 'ProfilKu Peluang'} siap ✅
              </div>
              <div style={{ background:'#F8F9FA', borderRadius:'8px', padding:'10px 14px', fontSize:'13px', color:'#343A40', fontFamily:'monospace', wordBreak:'break-all', marginBottom:'14px' }}>
                {generatedLink.url}
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={copyLink} style={{ flex:1, padding:'11px', border:'1px solid #E9ECEF', borderRadius:'8px', background: copied ? '#EAF3DE' : '#fff', color: copied ? '#27500A' : '#343A40', fontSize:'13px', fontWeight:'600', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
                  {copied ? '✓ Tersalin!' : '📋 Copy Link'}
                </button>
                <button onClick={shareWA} style={{ flex:1, padding:'11px', border:'none', borderRadius:'8px', background:'#25D366', color:'#fff', fontSize:'13px', fontWeight:'700', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
                  💬 Share WA
                </button>
              </div>
              <button onClick={() => { setGeneratedLink(null) }} style={{ width:'100%', marginTop:'8px', padding:'8px', border:'none', background:'transparent', fontSize:'12px', color:'#ADB5BD', cursor:'pointer' }}>
                Buat link lain
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB: Hasil Survey */}
      {tab === 'results' && (
        <div>
          {unprocessed > 0 && (
            <div style={{ background:'#FFF4E5', border:'1px solid #FED7AA', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px', fontSize:'13px', color:'#92400E', fontWeight:'500' }}>
              ⚡ {unprocessed} survey belum diimport sebagai prospek.
            </div>
          )}
          {loading ? (
            <div style={{ textAlign:'center', padding:'60px', color:'#ADB5BD', fontSize:'13px' }}>Memuat...</div>
          ) : surveys.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px', color:'#ADB5BD', fontSize:'13px' }}>Belum ada survey yang selesai diisi.</div>
          ) : (
            <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #E9ECEF', overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1.2fr 1.5fr 1fr 1fr 1fr', padding:'10px 16px', background:'#F8F9FA', borderBottom:'1px solid #E9ECEF' }}>
                {['NAMA','TIPE SURVEY','PROFIL','WAKTU','STATUS','AKSI'].map(h => (
                  <div key={h} style={{ fontSize:'10px', fontWeight:'700', color:'#ADB5BD', letterSpacing:'0.06em' }}>{h}</div>
                ))}
              </div>
              {surveys.map(s => {
                const resp = s.survey_responses
                const imported = importedIds.has(s.id)
                const isCareer = s.survey_type === 'recruiting'
                return (
                  <div key={s.id} onClick={() => openPanel(s)}
                    style={{ display:'grid', gridTemplateColumns:'1.5fr 1.2fr 1.5fr 1fr 1fr 1fr', padding:'14px 16px', borderBottom:'1px solid #F1F3F5', cursor:'pointer', transition:'background .1s' }}
                    onMouseEnter={e => e.currentTarget.style.background='#FAFAFA'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <div>
                      <div style={{ fontSize:'13px', fontWeight:'600', color:'#1A1A2E' }}>{s.prospect_name || '—'}</div>
                      <div style={{ fontSize:'11px', color:'#ADB5BD' }}>#{s.id.slice(0,8)}</div>
                    </div>
                    <div>
                      <span style={{ fontSize:'11px', fontWeight:'600', padding:'3px 8px', borderRadius:'99px', background: isCareer ? '#E6F9F3' : '#EEEDFE', color: isCareer ? '#085041' : '#3C3489' }}>
                        {isCareer ? '🌱 ProfilKu Peluang' : '💼 ProfilKu Finansial'}
                      </span>
                    </div>
                    <div style={{ fontSize:'12px', color:'#495057', alignSelf:'center' }}>
                      {PROFILE_LABEL[resp?.personality_type] || resp?.personality_type || '—'}
                    </div>
                    <div style={{ fontSize:'12px', color:'#ADB5BD', alignSelf:'center' }}>
                      {s.completed_at ? new Date(s.completed_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'}
                    </div>
                    <div style={{ alignSelf:'center' }}>
                      {imported
                        ? <span style={{ fontSize:'11px', fontWeight:'600', color:'#059669', background:'#D1FAE5', padding:'3px 8px', borderRadius:'99px' }}>✓ Sudah diimport</span>
                        : <span style={{ fontSize:'11px', fontWeight:'600', color:'#D97706', background:'#FEF3C7', padding:'3px 8px', borderRadius:'99px' }}>Belum diproses</span>
                      }
                    </div>
                    <div style={{ alignSelf:'center' }} onClick={e => { e.stopPropagation(); if (!imported) handleImport(s) }}>
                      {!imported && (
                        <button style={{ fontSize:'11px', fontWeight:'700', padding:'6px 12px', borderRadius:'8px', border:'none', background:'#C0392B', color:'#fff', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
                          + Tambah ke List
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Result Panel */}
      {panel && (
        <ResultPanel
          survey={panel.survey}
          response={panel.response}
          onClose={() => setPanel(null)}
          onImport={handleImport}
          importing={importing}
        />
      )}
    </AgentShell>
  )
}
