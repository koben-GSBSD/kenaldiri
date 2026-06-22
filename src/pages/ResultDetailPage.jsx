import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { PRODUCTS } from '../data/products'
import { PERSONALITY_TYPES } from '../data/scoring'
import { CAREER_PROFILES } from '../data/scoringCareer'
import { getShioByName } from '../lib/shio'
import AppShell from '../components/AppShell'

// Lookup slug -> profil finansial (mis. 'pelindung' -> { label: 'The Guardian', ... })
const FINANCIAL_BY_SLUG = Object.fromEntries(Object.values(PERSONALITY_TYPES).map(p => [p.type, p]))
const CAREER_SLUGS = ['connector', 'achiever', 'empath', 'explorer']

// Warna status dipakai bersama untuk area proteksi (finansial) & badge skor FRS/CRI
const AREA_STATUS_COLORS = {
  urgent: { bg: '#FCEAEA', text: '#9B1C1C', bar: '#E25B5B' },
  moderate: { bg: '#FAEEDA', text: '#633806', bar: '#EF9F27' },
  good: { bg: '#EAF3DE', text: '#27500A', bar: '#639922' },
}
const AREA_STATUS_LABEL = { urgent: 'Mendesak', moderate: 'Cukup', good: 'Baik' }

function scoreBand(score) {
  if (score >= 70) return { label: 'Tinggi', ...AREA_STATUS_COLORS.good }
  if (score >= 45) return { label: 'Sedang', ...AREA_STATUS_COLORS.moderate }
  return { label: 'Perlu Perhatian', ...AREA_STATUS_COLORS.urgent }
}

// Naskah pembuka percakapan untuk ke-8 profil (4 finansial + 4 karir).
// Konten presentasi murni untuk dashboard agen — tidak menyentuh logic scoring.
const SCRIPTS = {
  pelindung: {
    opener: (n) => `${n}, dari jawaban tadi terlihat keluarga adalah prioritas utama buat kamu — bahkan di atas dirimu sendiri.`,
    resonance: 'Tekankan bahwa pelindung sejati butuh dilindungi juga — proteksi jiwa & income adalah cara menjaga peran itu tetap utuh.',
  },
  perencana: {
    opener: (n) => `${n}, kamu termasuk orang yang selalu mikir dua-tiga langkah ke depan — kelihatan jelas dari cara kamu menjawab.`,
    resonance: 'Highlight bahwa satu-satunya hal yang tidak bisa direncanakan adalah kesehatan & kehidupan itu sendiri — di sinilah proteksi melengkapi rencana yang sudah matang.',
  },
  penikmat: {
    opener: (n) => `${n}, kamu jelas tipe yang menjalani hidup sepenuhnya — energi itu yang bikin orang di sekitar nyaman.`,
    resonance: 'Framing proteksi bukan sebagai pembatas, tapi sebagai "izin" supaya bisa terus menikmati hidup tanpa was-was.',
  },
  pencari_aman: {
    opener: (n) => `${n}, ketenangan dan stabilitas kelihatan banget jadi prioritas utama kamu.`,
    resonance: 'Tekankan bahwa ketenangan sejati datang dari kepastian finansial — bukan cuma tabungan, tapi proteksi yang menjaminnya di kondisi apapun.',
  },
  connector: {
    opener: (n) => `${n}, kamu punya bakat alami bikin orang nyaman dan percaya — itu modal besar yang sering nggak disadari.`,
    resonance: 'Framing: dia sudah "kerja sebagai konsultan" tanpa dibayar — saatnya itu jadi penghasilan nyata.',
  },
  achiever: {
    opener: (n) => `${n}, kelihatan dari jawabanmu kamu termotivasi banget sama hasil dan target yang jelas.`,
    resonance: 'Highlight sistem reward yang proporsional dengan usaha — tanpa plafon karir.',
  },
  empath: {
    opener: (n) => `${n}, buat kamu pekerjaan harus terasa berarti, bukan cuma soal angka.`,
    resonance: 'Framing: karir ini kasih dua hal sekaligus — penghasilan signifikan DAN dampak nyata buat orang lain.',
  },
  explorer: {
    opener: (n) => `${n}, kelihatan kamu tipe yang nggak gampang puas di zona nyaman — selalu cari yang lebih baik.`,
    resonance: 'Framing: ini kesempatan dengan kebebasan penuh — waktu, cara kerja, dan potensi penghasilan tanpa batas.',
  },
}

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

  // Deteksi tipe survey: utamakan survey_type dari survey_links, fallback ke slug
  // personality_type (untuk robustness kalau survey_type lama/null).
  const isCareer = survey.survey_type === 'recruiting' || CAREER_SLUGS.includes(response?.personality_type)
  const extra = response?.extra_data || null
  const shioData = response ? getShioByName(response.shio) : null

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
      ) : isCareer ? (
        <CareerDetail survey={survey} response={response} extra={extra} shioData={shioData} navigate={navigate} />
      ) : (
        <FinancialDetail survey={survey} response={response} extra={extra} shioData={shioData} navigate={navigate} />
      )}
    </AppShell>
  )
}

function FinancialDetail({ survey, response, extra, shioData, navigate }) {
  const profile = FINANCIAL_BY_SLUG[response.personality_type] || PERSONALITY_TYPES.P
  const icon = extra?.personality_icon || profile.icon
  const label = extra?.personality_label || profile.label
  const primary = PRODUCTS[response.primary_product] || null
  const secondary = response.secondary_product ? PRODUCTS[response.secondary_product] : null
  const script = SCRIPTS[response.personality_type] || SCRIPTS.pelindung
  const frs = extra?.frs_score
  const frsBand = typeof frs === 'number' ? scoreBand(frs) : null

  return (
    <div style={s.resultWrap}>
      {/* Personality */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Profil Kepribadian</h2>
        <div style={s.personalityCard}>
          <div style={s.persHeader}>
            <div style={s.persIcon}>{icon}</div>
            <div>
              <div style={s.persType}>{label}</div>
              <div style={s.persShio}>{shioData?.emoji} Shio {response.shio}</div>
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

      {/* Financial Readiness Score */}
      {typeof frs === 'number' && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Financial Readiness Score</h2>
          <div style={s.scoreCard}>
            <div style={s.scoreHeader}>
              <div style={s.scoreTitle}>Skor Kesiapan Finansial</div>
              <div style={{ ...s.scoreBadge, background: frsBand.bg, color: frsBand.text }}>{frs}/100 · {frsBand.label}</div>
            </div>
            <div style={s.scoreBarOuter}>
              <div style={{ ...s.scoreBarInner, width: `${frs}%`, background: frsBand.bar }} />
            </div>
            <div style={s.scoreBreakdown}>
              {(extra?.frs_breakdown || []).map(item => (
                <div key={item.key} style={s.scoreItem}>
                  <div style={s.scoreItemTop}>
                    <span style={s.scoreItemLabel}>{item.label}</span>
                    <span style={s.scoreItemPts}>{item.points}/{item.max}</span>
                  </div>
                  <div style={s.scoreItemAnswer}>"{item.answer}"</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Protection areas */}
      {extra?.protection_areas?.length > 0 && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>4 Area Proteksi Keluarga</h2>
          <div style={s.protectionGrid}>
            {extra.protection_areas.map(area => (
              <div key={area.key} style={s.protectionItem}>
                <div style={s.protectionIcon}>{area.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={s.protectionLabel}>{area.label}</div>
                  <div style={s.protectionNote}>{area.note}</div>
                </div>
                <div style={{ ...s.protectionStatus, background: AREA_STATUS_COLORS[area.status].bg, color: AREA_STATUS_COLORS[area.status].text }}>
                  {AREA_STATUS_LABEL[area.status]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key moments */}
      {extra?.key_moments?.length > 0 && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Momen Kunci dari Jawaban</h2>
          <div style={s.keyMomentsCard}>
            {extra.key_moments.map((m, i) => (
              <div key={i} style={s.keyMomentItem}>
                <div style={s.keyMomentQ}>{m.question}</div>
                <div style={s.keyMomentA}>"{m.answer}"</div>
                <div style={s.keyMomentInsight}>{m.insight}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shio */}
      {shioData && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Karakter Shio</h2>
          <div style={s.shioCard}>
            <div style={s.shioHeader}>{shioData.emoji} Shio {response.shio}</div>
            {shioData.traits && <div style={s.shioTraits}>{shioData.traits}</div>}
            {shioData.spendingBehavior && (
              <div style={s.shioBehavior}><strong>Kecenderungan soal uang:</strong> {shioData.spendingBehavior}</div>
            )}
          </div>
        </div>
      )}

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
            <div style={s.scriptText}>"{script.opener(survey.prospect_name)}"</div>
          </div>
          <div style={s.scriptItem}>
            <div style={s.scriptLabel}>Poin utama yang beresonansi:</div>
            <div style={s.scriptText}>{script.resonance}</div>
          </div>
          <div style={s.scriptItem}>
            <div style={s.scriptLabel}>Konteks kesiapan:</div>
            <div style={s.scriptText}>
              {typeof frs === 'number'
                ? `Financial Readiness Score ${survey.prospect_name} adalah ${frs}/100 (${frsBand.label.toLowerCase()})`
                : `Skor kesiapan finansial ${survey.prospect_name} adalah ${response.readiness_score}/5`}
              {response.readiness_score <= 3 ? ' — ada celah yang perlu kita isi bersama.' : ' — sudah baik, dan bisa semakin kuat dengan proteksi yang tepat.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CareerDetail({ survey, response, extra, shioData, navigate }) {
  const profile = CAREER_PROFILES[response.personality_type] || CAREER_PROFILES.connector
  const icon = extra?.profile_icon || profile.icon
  const label = extra?.profile_label || profile.label
  const tagline = extra?.profile_tagline || profile.tagline
  const opportunity = extra?.profile_opportunity || profile.opportunity
  const script = SCRIPTS[response.personality_type] || SCRIPTS.connector
  const cri = extra?.cri_score
  const criBand = typeof cri === 'number' ? scoreBand(cri) : null
  const needLevelLabel = { high: 'Tinggi', medium: 'Sedang', low: 'Rendah' }[response.primary_product] || response.primary_product

  return (
    <div style={s.resultWrap}>
      {/* Profile */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Profil Karir</h2>
        <div style={s.personalityCard}>
          <div style={s.persHeader}>
            <div style={s.persIcon}>{icon}</div>
            <div>
              <div style={s.persType}>{label}</div>
              <div style={s.persShio}>{shioData?.emoji} Shio {response.shio}</div>
            </div>
            <div style={s.readinessBlock}>
              <div style={s.readinessNum}>{response.readiness_score}/5</div>
              <div style={s.readinessLbl}>Keterbukaan</div>
            </div>
          </div>
          {tagline && <div style={s.taglineBox}>"{tagline}"</div>}
          <div style={s.narrativeBox}>
            {response.recommendation_narrative.split('\n\n').map((para, i) => (
              <p key={i} style={s.narrativePara}>{para}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Career Readiness Index */}
      {typeof cri === 'number' && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Career Readiness Index</h2>
          <div style={s.scoreCard}>
            <div style={s.scoreHeader}>
              <div style={s.scoreTitle}>Tingkat Tekanan Kebutuhan & Keterbukaan</div>
              <div style={{ ...s.scoreBadge, background: criBand.bg, color: criBand.text }}>{cri}/100 · {criBand.label}</div>
            </div>
            <div style={s.scoreBarOuter}>
              <div style={{ ...s.scoreBarInner, width: `${cri}%`, background: criBand.bar }} />
            </div>
            <div style={s.scoreBreakdown}>
              {(extra?.cri_breakdown || []).map(item => (
                <div key={item.key} style={s.scoreItem}>
                  <div style={s.scoreItemTop}>
                    <span style={s.scoreItemLabel}>{item.label}</span>
                    <span style={s.scoreItemPts}>{item.points}/{item.max}</span>
                  </div>
                  <div style={s.scoreItemAnswer}>"{item.answer}"</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Key moments */}
      {extra?.key_moments?.length > 0 && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Momen Kunci dari Jawaban</h2>
          <div style={s.keyMomentsCard}>
            {extra.key_moments.map((m, i) => (
              <div key={i} style={s.keyMomentItem}>
                <div style={s.keyMomentQ}>{m.question}</div>
                <div style={s.keyMomentA}>"{m.answer}"</div>
                <div style={s.keyMomentInsight}>{m.insight}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opportunity */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Peluang yang Relevan</h2>
        <div style={s.opportunityCard}>
          <div style={s.opportunityText}>{opportunity}</div>
          <div style={s.opportunityMeta}>Indikasi kebutuhan finansial: <strong>{needLevelLabel}</strong></div>
        </div>
      </div>

      {/* Shio */}
      {shioData && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Karakter Shio & Kecocokan Karir</h2>
          <div style={s.shioCard}>
            <div style={s.shioHeader}>{shioData.emoji} Shio {response.shio}</div>
            {shioData.careerTrait && <div style={s.shioTraits}>{shioData.careerTrait}</div>}
            {shioData.salesFit && <div style={s.shioBehavior}>{shioData.salesFit}</div>}
            {shioData.jobs?.length > 0 && (
              <div style={s.jobsTags}>
                {shioData.jobs.map((j, i) => <span key={i} style={s.jobTag}>{j}</span>)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Agent script */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Panduan Percakapan</h2>
        <div style={s.scriptCard}>
          <div style={s.scriptItem}>
            <div style={s.scriptLabel}>Pembuka yang bisa digunakan:</div>
            <div style={s.scriptText}>"{script.opener(survey.prospect_name)}"</div>
          </div>
          <div style={s.scriptItem}>
            <div style={s.scriptLabel}>Poin utama yang beresonansi:</div>
            <div style={s.scriptText}>{script.resonance}</div>
          </div>
          <div style={s.scriptItem}>
            <div style={s.scriptLabel}>Konteks kesiapan:</div>
            <div style={s.scriptText}>
              {typeof cri === 'number'
                ? `Career Readiness Index ${survey.prospect_name} adalah ${cri}/100 (${criBand.label.toLowerCase()})`
                : `Skor keterbukaan ${survey.prospect_name} adalah ${response.readiness_score}/5`}
              {response.readiness_score <= 3 ? ' — perlu pendekatan bertahap dan lebih banyak bukti nyata.' : ' — sudah terbuka, saatnya ajak ke langkah konkret berikutnya.'}
            </div>
          </div>
        </div>
      </div>
    </div>
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
  taglineBox: { padding:'16px 20px 0', fontSize:'13px', fontStyle:'italic', color:'#7F77DD', fontWeight:'600' },
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

  // --- field tambahan (FRS/CRI, area proteksi, key moments, shio, peluang karir) ---
  scoreCard: { background:'#fff', borderRadius:'12px', padding:'20px', border:'1px solid #eee' },
  scoreHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', marginBottom:'10px', flexWrap:'wrap' },
  scoreTitle: { fontSize:'13px', fontWeight:'600', color:'#333' },
  scoreBadge: { fontSize:'12px', fontWeight:'700', padding:'4px 10px', borderRadius:'99px' },
  scoreBarOuter: { height:'8px', background:'#eee', borderRadius:'99px', overflow:'hidden', marginBottom:'16px' },
  scoreBarInner: { height:'100%', borderRadius:'99px', transition:'width 0.3s' },
  scoreBreakdown: { display:'flex', flexDirection:'column', gap:'10px' },
  scoreItem: { borderTop:'1px solid #f4f4f4', paddingTop:'10px' },
  scoreItemTop: { display:'flex', justifyContent:'space-between', fontSize:'12px', fontWeight:'600', color:'#444', marginBottom:'4px' },
  scoreItemLabel: {},
  scoreItemPts: { color:'#7F77DD' },
  scoreItemAnswer: { fontSize:'12px', color:'#888', fontStyle:'italic' },
  protectionGrid: { display:'flex', flexDirection:'column', gap:'10px' },
  protectionItem: { display:'flex', alignItems:'center', gap:'12px', background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'14px 16px' },
  protectionIcon: { fontSize:'20px', flexShrink:0 },
  protectionLabel: { fontSize:'13px', fontWeight:'600', color:'#333' },
  protectionNote: { fontSize:'12px', color:'#999', marginTop:'2px' },
  protectionStatus: { fontSize:'11px', fontWeight:'700', padding:'4px 10px', borderRadius:'99px', flexShrink:0 },
  keyMomentsCard: { background:'#fff', borderRadius:'12px', border:'1px solid #eee', padding:'4px 20px' },
  keyMomentItem: { padding:'16px 0', borderBottom:'1px solid #f4f4f4' },
  keyMomentQ: { fontSize:'11px', fontWeight:'600', color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'4px' },
  keyMomentA: { fontSize:'13px', color:'#333', fontStyle:'italic', marginBottom:'6px' },
  keyMomentInsight: { fontSize:'13px', color:'#555', lineHeight:1.6 },
  shioCard: { background:'#fff', borderRadius:'12px', border:'1px solid #eee', padding:'20px', display:'flex', flexDirection:'column', gap:'10px' },
  shioHeader: { fontSize:'14px', fontWeight:'700', color:'#1a1a1a' },
  shioTraits: { fontSize:'13px', color:'#555', lineHeight:1.6 },
  shioBehavior: { fontSize:'13px', color:'#555', lineHeight:1.6 },
  jobsTags: { display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'4px' },
  jobTag: { fontSize:'12px', color:'#7F77DD', background:'#EEEDFE', padding:'5px 12px', borderRadius:'99px', fontWeight:'500' },
  opportunityCard: { background:'#fff', borderRadius:'12px', border:'1px solid #eee', padding:'20px' },
  opportunityText: { fontSize:'13px', color:'#555', lineHeight:1.75, marginBottom:'12px' },
  opportunityMeta: { fontSize:'12px', color:'#888', borderTop:'1px solid #f4f4f4', paddingTop:'12px' },
}
