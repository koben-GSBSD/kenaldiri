import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PERSONALITY_TYPES } from '../data/scoring'
import { CAREER_PROFILES } from '../data/scoringCareer'
import AppShell from '../components/AppShell'

// Halaman referensi untuk agen — menjelaskan ke-8 profil (4 finansial + 4 karir)
// supaya bisa ditunjukkan langsung ke prospek saat membahas hasil survey.
const FINANCIAL_THEME = { primary: '#7F77DD', light: '#EEEDFE' }
const CAREER_THEME = { primary: '#1D9E75', light: '#E1F5EE' }

export default function ProfilesPage() {
  const [agent, setAgent] = useState(null)
  const [tab, setTab] = useState('financial')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      supabase.from('agents').select('*').eq('user_id', user.id).single().then(({ data }) => setAgent(data))
    })
  }, [])

  const financialProfiles = Object.values(PERSONALITY_TYPES)
  const careerProfiles = Object.values(CAREER_PROFILES)

  return (
    <AppShell agent={agent}>
      <h1 style={s.title}>Panduan 8 Profil KenalDiri</h1>
      <p style={s.subtitle}>
        Referensi untuk dijelaskan ke prospek saat membahas hasil survey — 4 profil ProfilKu Finansial
        dan 4 profil ProfilKu Peluang.
      </p>

      <div style={s.tabRow}>
        <button
          onClick={() => setTab('financial')}
          style={{ ...s.tabBtn, ...(tab === 'financial' ? { background: FINANCIAL_THEME.light, color: FINANCIAL_THEME.primary, fontWeight: 700 } : {}) }}
        >
          🧭 ProfilKu Finansial
        </button>
        <button
          onClick={() => setTab('career')}
          style={{ ...s.tabBtn, ...(tab === 'career' ? { background: CAREER_THEME.light, color: CAREER_THEME.primary, fontWeight: 700 } : {}) }}
        >
          🤝 ProfilKu Peluang
        </button>
      </div>

      {tab === 'financial' ? (
        <div style={s.grid}>
          {financialProfiles.map(p => (
            <div key={p.type} style={{ ...s.card, borderTop: `4px solid ${FINANCIAL_THEME.primary}` }}>
              <div style={s.cardHeader}>
                <div style={s.cardIcon}>{p.icon}</div>
                <div>
                  <div style={s.cardLabel}>{p.label}</div>
                  <div style={{ ...s.cardTag, color: FINANCIAL_THEME.primary, background: FINANCIAL_THEME.light }}>Profil Finansial</div>
                </div>
              </div>
              <p style={s.cardDesc}>{p.description}</p>
              <div style={{ ...s.insightBox, background: FINANCIAL_THEME.light }}>
                <div style={{ ...s.insightLabel, color: FINANCIAL_THEME.primary }}>Insight untuk prospek</div>
                <div style={s.insightText}>{p.insight}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={s.grid}>
          {careerProfiles.map(p => (
            <div key={p.type} style={{ ...s.card, borderTop: `4px solid ${CAREER_THEME.primary}` }}>
              <div style={s.cardHeader}>
                <div style={s.cardIcon}>{p.icon}</div>
                <div>
                  <div style={s.cardLabel}>{p.label}</div>
                  <div style={{ ...s.cardTag, color: CAREER_THEME.primary, background: CAREER_THEME.light }}>Profil Karir</div>
                </div>
              </div>
              {p.tagline && <p style={s.cardTagline}>"{p.tagline}"</p>}
              <p style={s.cardDesc}>{p.description}</p>
              <div style={{ ...s.insightBox, background: CAREER_THEME.light }}>
                <div style={{ ...s.insightLabel, color: CAREER_THEME.primary }}>Insight untuk prospek</div>
                <div style={s.insightText}>{p.insight}</div>
              </div>
              {p.opportunity && (
                <div style={s.opportunityBox}>
                  <div style={s.insightLabel}>Peluang yang relevan</div>
                  <div style={s.insightText}>{p.opportunity}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  )
}

const s = {
  title: { fontSize:'22px', fontWeight:'700', color:'#1a1a1a', marginBottom:'8px' },
  subtitle: { fontSize:'14px', color:'#888', marginBottom:'24px', lineHeight:1.6 },
  tabRow: { display:'flex', gap:'8px', marginBottom:'24px' },
  tabBtn: { padding:'10px 18px', borderRadius:'10px', border:'1px solid #eee', background:'#fff', color:'#888', fontSize:'13px', cursor:'pointer', transition:'all 0.15s' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'20px' },
  card: { background:'#fff', borderRadius:'12px', padding:'24px', border:'1px solid #eee', display:'flex', flexDirection:'column', gap:'14px' },
  cardHeader: { display:'flex', alignItems:'center', gap:'14px' },
  cardIcon: { fontSize:'32px', flexShrink:0 },
  cardLabel: { fontSize:'17px', fontWeight:'700', color:'#1a1a1a' },
  cardTag: { display:'inline-block', fontSize:'11px', fontWeight:'600', padding:'3px 10px', borderRadius:'99px', marginTop:'4px', textTransform:'uppercase', letterSpacing:'0.05em' },
  cardTagline: { fontSize:'13px', fontStyle:'italic', color:'#888', margin:0 },
  cardDesc: { fontSize:'13px', color:'#555', lineHeight:1.7, margin:0 },
  insightBox: { borderRadius:'8px', padding:'12px 14px' },
  insightLabel: { fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'4px', color:'#888' },
  insightText: { fontSize:'13px', color:'#333', lineHeight:1.6 },
  opportunityBox: { background:'#f8f8f8', borderRadius:'8px', padding:'12px 14px' },
}
