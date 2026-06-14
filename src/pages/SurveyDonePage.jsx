import { useLocation } from 'react-router-dom'
import { PRODUCTS } from '../data/products'

export default function SurveyDonePage() {
  const { state } = useLocation()
  const result = state?.result
  const name = state?.name || 'Kamu'

  if (!result) {
    return (
      <Screen>
        <div style={{ textAlign:'center', padding:'40px', color:'#888' }}>
          <div style={{ fontSize:'40px', marginBottom:'16px' }}>✓</div>
          <h2 style={{ fontSize:'18px', fontWeight:'700', color:'#1a1a1a' }}>Survey selesai!</h2>
          <p style={{ fontSize:'14px', marginTop:'8px' }}>Terima kasih sudah mengisi survey.</p>
        </div>
      </Screen>
    )
  }

  const primary = PRODUCTS[result.primary_product]
  const secondary = result.secondary_product ? PRODUCTS[result.secondary_product] : null

  return (
    <Screen>
      <div style={s.wrap}>
        {/* Header KenalDiri */}
        <div style={s.brand}>KenalDiri</div>

        {/* Personality result */}
        <div style={s.heroCard}>
          <div style={s.personalityIcon}>{result.personality_icon}</div>
          <div style={s.shioTag}>Shio {result.shio}</div>
          <h1 style={s.personalityLabel}>{result.personality_label}</h1>
          <p style={s.personalityDesc}>{result.personality_description}</p>
        </div>

        {/* Insight */}
        <div style={s.insightCard}>
          <div style={s.insightIcon}>💡</div>
          <p style={s.insightText}>{result.personality_insight}</p>
        </div>

        {/* Shio traits */}
        <div style={s.shioCard}>
          <div style={s.shioTitle}>Karakter Shio {result.shio}</div>
          <p style={s.shioText}>{result.shio_traits}</p>
        </div>

        {/* Kesiapan finansial */}
        <div style={s.readinessCard}>
          <div style={s.readinessTitle}>Kesiapan finansial keluarga</div>
          <div style={s.readinessBar}>
            {[1,2,3,4,5].map(n => (
              <div key={n} style={{
                ...s.readinessDot,
                background: n <= result.readiness_score ? '#7F77DD' : '#e0e0e0'
              }} />
            ))}
          </div>
          <div style={s.readinessNote}>
            {result.readiness_score <= 2 ? 'Ada area yang perlu diperkuat segera'
            : result.readiness_score <= 3 ? 'Fondasi ada, perlu dilengkapi'
            : 'Sudah cukup baik, bisa ditingkatkan'}
          </div>
        </div>

        {/* Closing message */}
        <div style={s.closingCard}>
          <p style={s.closingText}>
            Terima kasih, <strong>{name}</strong>! Agen kamu sudah melihat hasil ini dan siap membantu menjelaskan langkah terbaik untuk melindungi keuangan keluargamu.
          </p>
        </div>

        <div style={s.footer}>KenalDiri · Analisa Kepribadian Finansial</div>
      </div>
    </Screen>
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
  brand: { fontSize:'12px', fontWeight:'700', color:'#7F77DD', letterSpacing:'0.12em', textTransform:'uppercase', textAlign:'center', paddingTop:'8px' },
  heroCard: { background:'#fff', borderRadius:'16px', padding:'32px 24px', border:'1px solid #eee', textAlign:'center' },
  personalityIcon: { fontSize:'48px', marginBottom:'8px' },
  shioTag: { display:'inline-block', background:'#f0effe', color:'#7F77DD', fontSize:'12px', fontWeight:'600', padding:'4px 14px', borderRadius:'99px', marginBottom:'12px' },
  personalityLabel: { fontSize:'22px', fontWeight:'700', color:'#1a1a1a', marginBottom:'12px' },
  personalityDesc: { fontSize:'14px', color:'#666', lineHeight:1.7 },
  insightCard: { background:'#FEF3C7', borderRadius:'12px', padding:'16px 18px', display:'flex', gap:'12px', alignItems:'flex-start' },
  insightIcon: { fontSize:'18px', flexShrink:0 },
  insightText: { fontSize:'13px', color:'#78350F', lineHeight:1.7 },
  shioCard: { background:'#fff', borderRadius:'12px', padding:'16px 18px', border:'1px solid #eee' },
  shioTitle: { fontSize:'12px', fontWeight:'600', color:'#7F77DD', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px' },
  shioText: { fontSize:'13px', color:'#555', lineHeight:1.6 },
  readinessCard: { background:'#fff', borderRadius:'12px', padding:'16px 18px', border:'1px solid #eee' },
  readinessTitle: { fontSize:'13px', fontWeight:'600', color:'#333', marginBottom:'10px' },
  readinessBar: { display:'flex', gap:'8px', marginBottom:'8px' },
  readinessDot: { flex:1, height:'8px', borderRadius:'99px' },
  readinessNote: { fontSize:'12px', color:'#888' },
  closingCard: { background:'#f0effe', borderRadius:'12px', padding:'18px', border:'1px solid #e0defe' },
  closingText: { fontSize:'14px', color:'#4C1D95', lineHeight:1.7, margin:0 },
  footer: { textAlign:'center', fontSize:'11px', color:'#ccc', paddingTop:'8px' },
}
