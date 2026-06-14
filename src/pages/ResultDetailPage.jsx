import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { PRODUCTS } from '../data/products'
import AppShell from '../components/AppShell'

export default function ResultDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [agent, setAgent] = useState(null)
  const [survey, setSurvey] = useState(null)
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: agentData } = await supabase.from('agents').select('*').eq('user_id', user.id).single()
    setAgent(agentData)

    const { data: surveyData } = await supabase.from('survey_links').select('*').eq('id', id).single()
    setSurvey(surveyData)

    const { data: responseData } = await supabase.from('survey_responses').select('*').eq('link_id', id).single()
    setResponse(responseData)
    setLoading(false)
  }

  if (loading) return <AppShell agent={agent}><div style={{ color:'#888', padding:'40px' }}>Memuat...</div></AppShell>
  if (!survey) return <AppShell agent={agent}><div style={{ color:'#888', padding:'40px' }}>Survey tidak ditemukan.</div></AppShell>

  const primary = response ? PRODUCTS[response.primary_product] : null
  const secondary = response?.secondary_product ? PRODUCTS[response.secondary_product] : null

  return (
    <AppShell agent={agent}>
      <button onClick={() => navigate('/app/dashboard')} style={s.backBtn}>← Dashboard</button>

      <div style={s.header}>
        <div>
          <h1 style={s.title}>{survey.prospect_name}</h1>
          <div style={s.meta}>
            {survey.prospect_job} · {new Date(survey.prospect_dob).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}
            {survey.prospect_smoker && <span style={s.smokerTag}>Perokok</span>}
          </div>
          <div style={s.metaSmall}>Survey dibuat {formatDate(survey.created_at)}</div>
        </div>
        <div style={{ ...s.statusBadge, ...getStatusStyle(survey.status) }}>
          {getStatusLabel(survey.status)}
        </div>
      </div>

      {survey.status !== 'completed' || !response ? (
        <div style={s.emptyResult}>
          <div style={s.emptyIcon}>{survey.status === 'expired' ? '⌛' : '⏳'}</div>
          <div style={s.emptyTitle}>
            {survey.status === 'expired' ? 'Link kedaluwarsa' : 'Menunggu nasabah mengisi survey'}
          </div>
          <div style={s.emptyNote}>
            {survey.status === 'pending'
              ? `Kedaluwarsa pada ${formatDate(survey.expires_at)}`
              : 'Link survey telah kedaluwarsa sebelum diisi.'}
          </div>
        </div>
      ) : (
        <div style={s.resultWrap}>
          {/* Personality */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Profil Kepribadian</h2>
            <div style={s.personalityCard}>
              <div style={s.persHeader}>
                <div style={s.persIcon}>
                  {response.personality_type === 'pelindung' ? '🛡️'
                  : response.personality_type === 'perencana' ? '🧭'
                  : response.personality_type === 'penikmat' ? '✨' : '🌿'}
                </div>
                <div>
                  <div style={s.persType}>
                    {response.personality_type === 'pelindung' ? 'Si Pelindung Keluarga'
                    : response.personality_type === 'perencana' ? 'Si Perencana Bijak'
                    : response.personality_type === 'penikmat' ? 'Si Penikmat Hidup' : 'Si Pencari Ketenangan'}
                  </div>
                  <div style={s.persShio}>Shio {response.shio}</div>
                </div>
                <div style={s.readinessBlock}>
                  <div style={s.readinessNum}>{response.readiness_score}/5</div>
                  <div style={s.readinessLbl}>Kesiapan</div>
                </div>
              </div>
              <div style={s.narrativeBox}>
                {response.recommendation_narrative.split('\n\n').map((para, i) => (
                  <p key={i} style={s.narrativePara}>{para}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Product Recommendations */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Rekomendasi Produk</h2>
            <div style={s.prodGrid}>
              {primary && <ProductCard product={primary} label="Utama" onDetail={() => navigate('/app/products')} />}
              {secondary && <ProductCard product={secondary} label="Pelengkap" onDetail={() => navigate('/app/products')} />}
            </div>
          </div>

          {/* Agent script */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Panduan Percakapan</h2>
            <div style={s.scriptCard}>
              <div style={s.scriptItem}>
                <div style={s.scriptLabel}>Pembuka yang bisa digunakan:</div>
                <div style={s.scriptText}>
                  "{survey.prospect_name}, dari jawaban tadi, kamu termasuk tipe yang {
                    response.personality_type === 'pelindung' ? 'sangat mengutamakan keluarga'
                    : response.personality_type === 'perencana' ? 'selalu berpikir ke depan'
                    : response.personality_type === 'penikmat' ? 'menikmati hidup sepenuhnya'
                    : 'menghargai ketenangan dan stabilitas'
                  }. Ini adalah kekuatan besar — dan ada satu hal yang bisa memperkuat itu."
                </div>
              </div>
              <div style={s.scriptItem}>
                <div style={s.scriptLabel}>Poin utama yang beresonansi:</div>
                <div style={s.scriptText}>
                  Skor kesiapan finansial {survey.prospect_name} adalah {response.readiness_score}/5
                  {response.readiness_score <= 3 ? ' — ada celah yang perlu kita isi bersama.' : ' — sudah baik, dan bisa semakin kuat dengan proteksi yang tepat.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

function ProductCard({ product, label, onDetail }) {
  return (
    <div style={{ ...s.prodCard, borderTop: `3px solid ${product.color}` }}>
      <div style={s.prodLabel}>{label}</div>
      <div style={s.prodName}>{product.name}</div>
      <div style={s.prodTagline}>{product.tagline}</div>
      <ul style={s.prodBenefits}>
        {product.benefits.slice(0,3).map((b, i) => <li key={i} style={s.prodBenefit}>{b}</li>)}
      </ul>
      <div style={s.prodBtnRow}>
        <button onClick={onDetail} style={{ ...s.prodBtn, background: product.colorLight, color: product.colorText }}>
          Detail Produk
        </button>
        <a href={product.url} target="_blank" rel="noreferrer" style={{ ...s.prodBtn, background: product.color, color: '#fff', textDecoration:'none' }}>
          Prudential.co.id ↗
        </a>
      </div>
    </div>
  )
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
}
function getStatusLabel(s) { return { pending:'Menunggu', completed:'Selesai', expired:'Kedaluwarsa' }[s] || s }
function getStatusStyle(s) {
  return { pending: { background:'#FEF3C7', color:'#92400E' }, completed: { background:'#D1FAE5', color:'#065F46' }, expired: { background:'#F3F4F6', color:'#6B7280' } }[s] || {}
}

const s = {
  backBtn: { background:'none', border:'none', color:'#888', fontSize:'13px', cursor:'pointer', padding:'0 0 16px', display:'block' },
  header: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'28px' },
  title: { fontSize:'22px', fontWeight:'700', color:'#1a1a1a', margin:'0 0 6px' },
  meta: { fontSize:'14px', color:'#666', display:'flex', alignItems:'center', gap:'8px' },
  metaSmall: { fontSize:'12px', color:'#aaa', marginTop:'4px' },
  smokerTag: { background:'#FEE2E2', color:'#991B1B', fontSize:'11px', padding:'2px 8px', borderRadius:'99px' },
  statusBadge: { padding:'4px 12px', borderRadius:'99px', fontSize:'12px', fontWeight:'500', flexShrink:0 },
  emptyResult: { background:'#fff', borderRadius:'12px', padding:'40px', textAlign:'center', border:'1px solid #eee' },
  emptyIcon: { fontSize:'32px', marginBottom:'12px' },
  emptyTitle: { fontSize:'16px', fontWeight:'600', color:'#333', marginBottom:'8px' },
  emptyNote: { fontSize:'13px', color:'#aaa' },
  resultWrap: { display:'flex', flexDirection:'column', gap:'24px' },
  section: {},
  sectionTitle: { fontSize:'15px', fontWeight:'600', color:'#333', marginBottom:'12px' },
  personalityCard: { background:'#fff', borderRadius:'12px', border:'1px solid #eee', overflow:'hidden' },
  persHeader: { display:'flex', alignItems:'center', gap:'16px', padding:'20px', borderBottom:'1px solid #f0f0f0' },
  persIcon: { fontSize:'32px' },
  persType: { fontSize:'16px', fontWeight:'700', color:'#1a1a1a' },
  persShio: { fontSize:'13px', color:'#7F77DD', marginTop:'2px' },
  readinessBlock: { marginLeft:'auto', textAlign:'center' },
  readinessNum: { fontSize:'22px', fontWeight:'700', color:'#7F77DD' },
  readinessLbl: { fontSize:'11px', color:'#aaa' },
  narrativeBox: { padding:'20px' },
  narrativePara: { fontSize:'13px', color:'#555', lineHeight:1.75, marginBottom:'12px' },
  prodGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' },
  prodCard: { background:'#fff', borderRadius:'12px', padding:'20px', border:'1px solid #eee', display:'flex', flexDirection:'column' },
  prodLabel: { fontSize:'11px', fontWeight:'600', color:'#888', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px' },
  prodName: { fontSize:'15px', fontWeight:'700', color:'#1a1a1a', marginBottom:'4px' },
  prodTagline: { fontSize:'13px', color:'#888', marginBottom:'12px' },
  prodBenefits: { paddingLeft:'16px', margin:'0 0 16px', flex:1 },
  prodBenefit: { fontSize:'12px', color:'#555', marginBottom:'5px', lineHeight:1.4 },
  prodBtnRow: { display:'flex', gap:'8px' },
  prodBtn: { flex:1, padding:'8px 10px', border:'none', borderRadius:'8px', fontSize:'12px', fontWeight:'500', cursor:'pointer', textAlign:'center' },
  scriptCard: { background:'#fff', borderRadius:'12px', padding:'20px', border:'1px solid #eee', display:'flex', flexDirection:'column', gap:'16px' },
  scriptItem: {},
  scriptLabel: { fontSize:'11px', fontWeight:'600', color:'#888', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px' },
  scriptText: { fontSize:'13px', color:'#333', lineHeight:1.7, fontStyle:'italic', background:'#f8f8f8', padding:'12px', borderRadius:'8px' },
}
