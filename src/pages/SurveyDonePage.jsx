import { useLocation } from 'react-router-dom'
import { PRODUCTS } from '../data/products'
import { getShio } from '../lib/shio'
import { getShioCareer } from '../lib/shioCareer'

export default function SurveyDonePage() {
  const { state } = useLocation()
  const result = state?.result
  const name = state?.name || 'Kamu'
  const type = state?.type || 'selling'
  const isCareer = type === 'recruiting'

  if (!result) return <Screen><CompletedCard /></Screen>

  return isCareer
    ? <CareerResult result={result} name={name} />
    : <FinancialResult result={result} name={name} />
}

const STATUS_COLORS = {
  urgent: { bg: '#FCEAEA', text: '#9B1C1C', bar: '#E25B5B' },
  moderate: { bg: '#FAEEDA', text: '#633806', bar: '#EF9F27' },
  good: { bg: '#EAF3DE', text: '#27500A', bar: '#639922' },
}

const STATUS_LABEL = { urgent: 'Mendesak', moderate: 'Cukup', good: 'Baik' }

// ─── CAREER RESULT ───
function CareerResult({ result, name }) {
  const pc = {
    connector: { primary: '#1D9E75', light: '#E1F5EE', dark: '#085041' },
    achiever: { primary: '#7F77DD', light: '#EEEDFE', dark: '#3C3489' },
    empath: { primary: '#D85A30', light: '#FAECE7', dark: '#712B13' },
    explorer: { primary: '#BA7517', light: '#FAEEDA', dark: '#633806' },
  }[result.profile_type] || { primary: '#7F77DD', light: '#EEEDFE', dark: '#3C3489' }

  const nc = {
    high: { bg: '#FAECE7', text: '#712B13', bar: '#D85A30' },
    medium: { bg: '#FAEEDA', text: '#633806', bar: '#EF9F27' },
    low: { bg: '#EAF3DE', text: '#27500A', bar: '#639922' },
  }[result.need_level] || { bg: '#FAEEDA', text: '#633806', bar: '#EF9F27' }

  // Get shio career data
  const shioData = result.shio && result.shio !== '-' ? result.shio : null
  const shioCareer = shioData ? getShioCareer(shioData) : null
  const shioEmoji = result.shio_emoji || shioCareer?.emoji || '🌟'
  const shioJobs = result.shio_jobs || shioCareer?.jobs || []

  const cri = result.cri_score
  const criLabel = cri >= 70 ? 'Sangat Siap' : cri >= 45 ? 'Cukup Siap' : 'Mulai Eksplorasi'

  return (
    <Screen>
      <div style={s.wrap}>
        <div style={{ ...s.brandTag, color: pc.primary }}>KENALDIRI · PROFIL PELUANG</div>

        {/* Hero */}
        <div style={{ ...s.heroCard, borderTop: `4px solid ${pc.primary}` }}>
          <div style={s.heroIcon}>{result.profile_icon}</div>
          <div style={{ ...s.profileBadge, background: pc.light, color: pc.dark }}>{result.profile_label}</div>
          <h1 style={s.profileTagline}>"{result.profile_tagline}"</h1>
        </div>

        {/* Description */}
        <div style={s.descCard}>
          {result.profile_description?.split('\n\n').map((para, i) => (
            <p key={i} style={s.descPara}>{para}</p>
          ))}
        </div>

        {/* Insight */}
        <div style={s.insightCard}>
          <div style={s.insightIcon}>💡</div>
          <p style={s.insightText}>{result.profile_insight}</p>
        </div>

        {/* Career Readiness Index */}
        {typeof cri === 'number' && (
          <div style={{ ...s.criCard, borderTop: `3px solid ${pc.primary}` }}>
            <div style={s.criHeader}>
              <div style={s.criTitle}>Career Readiness Index</div>
              <div style={{ ...s.criScoreBadge, background: pc.light, color: pc.dark }}>{cri}/100 · {criLabel}</div>
            </div>
            <div style={s.criBarOuter}>
              <div style={{ ...s.criBarInner, width: `${cri}%`, background: pc.primary }} />
            </div>
            {result.cri_breakdown && (
              <div style={s.criBreakdown}>
                {result.cri_breakdown.map((b) => (
                  <div key={b.key} style={s.criItem}>
                    <div style={s.criItemTop}>
                      <span style={s.criItemLabel}>{b.label}</span>
                      <span style={{ ...s.criItemPts, color: pc.dark }}>{b.points}/{b.max}</span>
                    </div>
                    {b.answer && <div style={s.criItemAnswer}>"{b.answer}"</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Key Moments */}
        {result.key_moments?.length > 0 && (
          <div style={s.keyMomentsCard}>
            <div style={s.keyMomentsTitle}>🔑 Momen Kunci dari Jawabanmu</div>
            {result.key_moments.map((km, i) => (
              <div key={i} style={s.keyMomentItem}>
                <div style={s.keyMomentQ}>{km.question}</div>
                <div style={s.keyMomentA}>"{km.answer}"</div>
                <div style={{ ...s.keyMomentInsight, color: pc.dark }}>{km.insight}</div>
              </div>
            ))}
          </div>
        )}

        {/* Shio Career Section */}
        {shioData && shioCareer && (
          <div style={s.shioSection}>
            <div style={s.shioHeader}>
              <span style={s.shioEmoji}>{shioEmoji}</span>
              <div>
                <div style={s.shioTitle}>Shio {shioData} dalam Dunia Karir</div>
                <div style={s.shioTrait}>{shioCareer.careerTrait}</div>
              </div>
            </div>

            <div style={s.prosConsGrid}>
              {/* Kelebihan */}
              <div style={{ ...s.prosConsCard, borderTop: '3px solid #059669' }}>
                <div style={s.prosConsTitle}>✅ Kelebihan</div>
                <ul style={s.prosList}>
                  {shioCareer.strength.map((item, i) => (
                    <li key={i} style={s.prosItem}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Kekurangan */}
              <div style={{ ...s.prosConsCard, borderTop: '3px solid #D97706' }}>
                <div style={s.prosConsTitle}>⚠️ Perlu Dikembangkan</div>
                <ul style={s.prosList}>
                  {shioCareer.weakness.map((item, i) => (
                    <li key={i} style={s.prosItem}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {shioJobs.length > 0 && (
              <div style={s.jobsCard}>
                <div style={s.jobsTitle}>💼 Peran yang Cocok Untukmu</div>
                <div style={s.jobsTags}>
                  {shioJobs.map((job, i) => (
                    <span key={i} style={{ ...s.jobTag, background: pc.light, color: pc.dark }}>{job}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Sales fit */}
            <div style={{ ...s.salesFitCard, background: pc.light, border: `1px solid ${pc.primary}20` }}>
              <div style={{ ...s.salesFitTitle, color: pc.dark }}>🎯 Potensi Karirmu</div>
              <p style={{ ...s.salesFitText, color: pc.dark }}>{shioCareer.salesFit}</p>
            </div>
          </div>
        )}

        {/* Need level */}
        <div style={{ ...s.needCard, background: nc.bg }}>
          <div style={{ ...s.needTitle, color: nc.text }}>Sinyal Finansial Saat Ini</div>
          <div style={s.needBar}>
            {[1,2,3].map(n => (
              <div key={n} style={{ flex:1, height:'6px', borderRadius:'99px',
                background: n <= (result.need_level === 'high' ? 3 : result.need_level === 'medium' ? 2 : 1) ? nc.bar : '#e0e0e0' }} />
            ))}
          </div>
          <div style={{ ...s.needNote, color: nc.text }}>
            {result.need_level === 'high' ? 'Ada kebutuhan finansial yang cukup mendesak untuk diatasi'
            : result.need_level === 'medium' ? 'Ada ruang besar untuk meningkatkan kondisi finansial'
            : 'Kondisi stabil — tapi selalu ada peluang untuk tumbuh lebih'}
          </div>
        </div>

        {/* Openness */}
        <div style={s.readinessCard}>
          <div style={s.readinessTitle}>Keterbukaan terhadap peluang baru</div>
          <div style={s.readinessBar}>
            {[1,2,3,4,5].map(n => (
              <div key={n} style={{ flex:1, height:'8px', borderRadius:'99px', background: n <= result.openness_score ? pc.primary : '#e0e0e0' }} />
            ))}
          </div>
          <div style={s.readinessNote}>{result.readiness_note}</div>
        </div>

        {/* Opportunity */}
        {result.profile_opportunity && (
          <div style={{ ...s.opportunityCard, borderLeft: `3px solid ${pc.primary}` }}>
            <div style={{ ...s.oppTitle, color: pc.dark }}>🚪 Peluang yang Relevan Untukmu</div>
            <p style={s.oppText}>{result.profile_opportunity}</p>
          </div>
        )}

        {/* Closing */}
        <div style={s.closingCard}>
          <p style={s.closingText}>
            Terima kasih, <strong>{name}</strong>! Konsultanmu sudah melihat hasil ini dan siap menjelaskan lebih lanjut tentang peluang yang paling cocok untukmu.
          </p>
        </div>

        <div style={s.footer}>KenalDiri · ProfilKu Peluang</div>
      </div>
    </Screen>
  )
}

// ─── FINANCIAL RESULT ───
function FinancialResult({ result, name }) {
  const frs = result.frs_score
  const frsLabel = frs >= 70 ? 'Sudah Siap' : frs >= 45 ? 'Cukup Siap' : 'Perlu Diperkuat'
  const shioEmoji = result.shio_emoji || '🌟'

  return (
    <Screen>
      <div style={s.wrap}>
        <div style={{ ...s.brandTag, color: '#7F77DD' }}>KENALDIRI · PROFIL KEUANGAN</div>

        <div style={{ ...s.heroCard, borderTop: '4px solid #7F77DD' }}>
          <div style={s.heroIcon}>{result.personality_icon}</div>
          <div style={{ ...s.profileBadge, background: '#EEEDFE', color: '#3C3489' }}>{shioEmoji} Shio {result.shio}</div>
          <h1 style={s.profileTagline}>{result.personality_label}</h1>
          <p style={{ fontSize:'14px', color:'#666', lineHeight:1.7, marginTop:'12px' }}>{result.personality_description}</p>
        </div>

        <div style={s.insightCard}>
          <div style={s.insightIcon}>💡</div>
          <p style={s.insightText}>{result.personality_insight}</p>
        </div>

        {/* Financial Readiness Score */}
        {typeof frs === 'number' && (
          <div style={{ ...s.criCard, borderTop: '3px solid #7F77DD' }}>
            <div style={s.criHeader}>
              <div style={s.criTitle}>Financial Readiness Score</div>
              <div style={{ ...s.criScoreBadge, background: '#EEEDFE', color: '#3C3489' }}>{frs}/100 · {frsLabel}</div>
            </div>
            <div style={s.criBarOuter}>
              <div style={{ ...s.criBarInner, width: `${frs}%`, background: '#7F77DD' }} />
            </div>
            {result.frs_breakdown && (
              <div style={s.criBreakdown}>
                {result.frs_breakdown.map((b) => (
                  <div key={b.key} style={s.criItem}>
                    <div style={s.criItemTop}>
                      <span style={s.criItemLabel}>{b.label}</span>
                      <span style={{ ...s.criItemPts, color: '#3C3489' }}>{b.points}/{b.max}</span>
                    </div>
                    {b.answer && <div style={s.criItemAnswer}>"{b.answer}"</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Protection Areas */}
        {result.protection_areas?.length > 0 && (
          <div style={s.protectionCard}>
            <div style={s.keyMomentsTitle}>🧩 4 Area Proteksi Keluarga</div>
            <div style={s.protectionGrid}>
              {result.protection_areas.map((area) => {
                const sc = STATUS_COLORS[area.status] || STATUS_COLORS.moderate
                return (
                  <div key={area.key} style={{ ...s.protectionItem, background: sc.bg }}>
                    <div style={s.protectionIcon}>{area.icon}</div>
                    <div style={s.protectionLabel}>{area.label}</div>
                    <div style={{ ...s.protectionStatus, color: sc.text }}>{STATUS_LABEL[area.status] || area.status}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Key Moments */}
        {result.key_moments?.length > 0 && (
          <div style={s.keyMomentsCard}>
            <div style={s.keyMomentsTitle}>🔑 Momen Kunci dari Jawabanmu</div>
            {result.key_moments.map((km, i) => (
              <div key={i} style={s.keyMomentItem}>
                <div style={s.keyMomentQ}>{km.question}</div>
                <div style={s.keyMomentA}>"{km.answer}"</div>
                <div style={{ ...s.keyMomentInsight, color: '#3C3489' }}>{km.insight}</div>
              </div>
            ))}
          </div>
        )}

        {result.shio_traits && (
          <div style={s.descCard}>
            <div style={{ fontSize:'12px', fontWeight:'600', color:'#7F77DD', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px' }}>
              Karakter Shio {result.shio}
            </div>
            <p style={s.descPara}>{result.shio_traits}</p>
            {result.shio_spending_behavior && (
              <>
                <div style={{ fontSize:'12px', fontWeight:'600', color:'#7F77DD', textTransform:'uppercase', letterSpacing:'0.06em', margin:'12px 0 6px' }}>
                  Kecenderungan Soal Uang
                </div>
                <p style={s.descPara}>{result.shio_spending_behavior}</p>
              </>
            )}
          </div>
        )}

        <div style={s.readinessCard}>
          <div style={s.readinessTitle}>Kesiapan finansial keluarga</div>
          <div style={s.readinessBar}>
            {[1,2,3,4,5].map(n => (
              <div key={n} style={{ flex:1, height:'8px', borderRadius:'99px', background: n <= result.readiness_score ? '#7F77DD' : '#e0e0e0' }} />
            ))}
          </div>
          <div style={s.readinessNote}>
            {result.readiness_score <= 2 ? 'Ada area yang perlu diperkuat segera'
            : result.readiness_score <= 3 ? 'Fondasi ada, perlu dilengkapi'
            : 'Sudah cukup baik, bisa ditingkatkan'}
          </div>
        </div>

        <div style={s.closingCard}>
          <p style={s.closingText}>
            Terima kasih, <strong>{name}</strong>! Agen kamu sudah melihat hasil ini dan siap membantu menjelaskan langkah terbaik untuk melindungi keuangan keluargamu.
          </p>
        </div>

        <div style={s.footer}>KenalDiri · ProfilKu Finansial</div>
      </div>
    </Screen>
  )
}

function CompletedCard() {
  return (
    <div style={{ background:'#fff', borderRadius:'16px', padding:'40px', textAlign:'center', border:'1px solid #eee' }}>
      <div style={{ fontSize:'40px', marginBottom:'16px' }}>✓</div>
      <h2 style={{ fontSize:'18px', fontWeight:'700', color:'#1a1a1a' }}>Survey selesai!</h2>
      <p style={{ fontSize:'14px', marginTop:'8px', color:'#888' }}>Terima kasih sudah mengisi survey.</p>
    </div>
  )
}

function Screen({ children }) {
  return (
    <div style={{ minHeight:'100vh', background:'#f8f7ff', padding:'20px 16px', fontFamily:'system-ui,-apple-system,sans-serif' }}>
      <div style={{ width:'100%', maxWidth:'480px', margin:'0 auto' }}>{children}</div>
    </div>
  )
}

const s = {
  wrap: { display:'flex', flexDirection:'column', gap:'12px' },
  brandTag: { fontSize:'12px', fontWeight:'700', letterSpacing:'0.12em', textTransform:'uppercase', textAlign:'center', paddingTop:'8px' },
  heroCard: { background:'#fff', borderRadius:'16px', padding:'28px 24px', border:'1px solid #eee', textAlign:'center' },
  heroIcon: { fontSize:'52px', marginBottom:'12px' },
  profileBadge: { display:'inline-block', fontSize:'12px', fontWeight:'600', padding:'4px 14px', borderRadius:'99px', marginBottom:'12px' },
  profileTagline: { fontSize:'18px', fontWeight:'700', color:'#1a1a1a', lineHeight:1.4, margin:0 },
  descCard: { background:'#fff', borderRadius:'12px', padding:'20px', border:'1px solid #eee' },
  descPara: { fontSize:'14px', color:'#555', lineHeight:1.75, marginBottom:'12px' },
  insightCard: { background:'#FEF3C7', borderRadius:'12px', padding:'16px 18px', display:'flex', gap:'12px', alignItems:'flex-start' },
  insightIcon: { fontSize:'18px', flexShrink:0 },
  insightText: { fontSize:'13px', color:'#78350F', lineHeight:1.7, margin:0 },
  // Readiness index (FRS/CRI) card
  criCard: { background:'#fff', borderRadius:'12px', padding:'18px 20px', border:'1px solid #eee' },
  criHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', gap:'10px', marginBottom:'10px', flexWrap:'wrap' },
  criTitle: { fontSize:'13px', fontWeight:'700', color:'#1a1a1a' },
  criScoreBadge: { fontSize:'12px', fontWeight:'600', padding:'4px 10px', borderRadius:'99px' },
  criBarOuter: { height:'8px', background:'#eee', borderRadius:'99px', overflow:'hidden', marginBottom:'14px' },
  criBarInner: { height:'100%', borderRadius:'99px', transition:'width 0.4s' },
  criBreakdown: { display:'flex', flexDirection:'column', gap:'10px' },
  criItem: { borderTop:'1px solid #f0f0f0', paddingTop:'8px' },
  criItemTop: { display:'flex', justifyContent:'space-between', alignItems:'baseline' },
  criItemLabel: { fontSize:'12.5px', fontWeight:'600', color:'#333' },
  criItemPts: { fontSize:'12px', fontWeight:'700' },
  criItemAnswer: { fontSize:'12px', color:'#999', fontStyle:'italic', marginTop:'2px' },
  // Key moments
  keyMomentsCard: { background:'#fff', borderRadius:'12px', padding:'18px 20px', border:'1px solid #eee', display:'flex', flexDirection:'column', gap:'14px' },
  keyMomentsTitle: { fontSize:'13px', fontWeight:'700', color:'#1a1a1a' },
  keyMomentItem: { borderLeft:'3px solid #e8e8f0', paddingLeft:'12px' },
  keyMomentQ: { fontSize:'12px', fontWeight:'600', color:'#666', marginBottom:'2px' },
  keyMomentA: { fontSize:'13px', color:'#333', fontStyle:'italic', marginBottom:'6px' },
  keyMomentInsight: { fontSize:'12.5px', lineHeight:1.6, fontWeight:'500' },
  // Protection areas
  protectionCard: { background:'#fff', borderRadius:'12px', padding:'18px 20px', border:'1px solid #eee', display:'flex', flexDirection:'column', gap:'12px' },
  protectionGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' },
  protectionItem: { borderRadius:'10px', padding:'14px 10px', textAlign:'center' },
  protectionIcon: { fontSize:'22px', marginBottom:'6px' },
  protectionLabel: { fontSize:'11.5px', fontWeight:'600', color:'#333', lineHeight:1.4, marginBottom:'4px' },
  protectionStatus: { fontSize:'11px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.04em' },
  // Shio Career
  shioSection: { background:'#fff', borderRadius:'12px', padding:'20px', border:'1px solid #eee', display:'flex', flexDirection:'column', gap:'14px' },
  shioHeader: { display:'flex', gap:'12px', alignItems:'flex-start' },
  shioEmoji: { fontSize:'28px', flexShrink:0 },
  shioTitle: { fontSize:'14px', fontWeight:'600', color:'#1a1a1a', marginBottom:'4px' },
  shioTrait: { fontSize:'13px', color:'#666', lineHeight:1.5 },
  prosConsGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' },
  prosConsCard: { background:'#fafafa', borderRadius:'8px', padding:'12px', border:'1px solid #eee' },
  prosConsTitle: { fontSize:'12px', fontWeight:'600', color:'#333', marginBottom:'8px' },
  prosList: { paddingLeft:'16px', margin:0, display:'flex', flexDirection:'column', gap:'5px' },
  prosItem: { fontSize:'12px', color:'#555', lineHeight:1.5 },
  jobsCard: { background:'#fafafa', borderRadius:'8px', padding:'12px', border:'1px solid #eee' },
  jobsTitle: { fontSize:'12px', fontWeight:'600', color:'#333', marginBottom:'8px' },
  jobsTags: { display:'flex', flexWrap:'wrap', gap:'6px' },
  jobTag: { fontSize:'11.5px', fontWeight:'600', padding:'5px 10px', borderRadius:'99px' },
  salesFitCard: { borderRadius:'10px', padding:'14px' },
  salesFitTitle: { fontSize:'12px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'6px' },
  salesFitText: { fontSize:'13px', lineHeight:1.6, margin:0 },
  // Need & readiness
  needCard: { borderRadius:'12px', padding:'16px 18px' },
  needTitle: { fontSize:'12px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'8px' },
  needBar: { display:'flex', gap:'6px', marginBottom:'8px' },
  needNote: { fontSize:'12px', lineHeight:1.5 },
  readinessCard: { background:'#fff', borderRadius:'12px', padding:'16px 18px', border:'1px solid #eee' },
  readinessTitle: { fontSize:'13px', fontWeight:'600', color:'#333', marginBottom:'10px' },
  readinessBar: { display:'flex', gap:'6px', marginBottom:'8px' },
  readinessNote: { fontSize:'12px', color:'#888', lineHeight:1.5 },
  opportunityCard: { background:'#fff', borderRadius:'12px', padding:'20px', border:'1px solid #eee' },
  oppTitle: { fontSize:'13px', fontWeight:'600', marginBottom:'10px' },
  oppText: { fontSize:'14px', color:'#555', lineHeight:1.75, margin:0 },
  closingCard: { background:'#f0effe', borderRadius:'12px', padding:'18px', border:'1px solid #e0defe' },
  closingText: { fontSize:'14px', color:'#4C1D95', lineHeight:1.7, margin:0 },
  footer: { textAlign:'center', fontSize:'11px', color:'#ccc', paddingTop:'8px' },
}
