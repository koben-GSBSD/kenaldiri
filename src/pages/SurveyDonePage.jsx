import { useLocation } from 'react-router-dom'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .done-root { min-height: 100vh; min-height: 100dvh; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 20px; }
  .done-card { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 14px; animation: done-in 0.4s cubic-bezier(0.22,1,0.36,1); }
  @keyframes done-in { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
`

let injected = false
function inject() {
  if (injected) return
  const s = document.createElement('style')
  s.textContent = CSS
  document.head.appendChild(s)
  injected = true
}

export default function SurveyDonePage() {
  inject()
  const { state } = useLocation()
  const result = state?.result
  const name   = state?.name || 'Kamu'
  const type   = state?.type || 'selling'
  const isCareer = type === 'recruiting'

  const accent   = isCareer ? '#1D9E75' : '#7F77DD'
  const accentBg = isCareer ? '#E6F9F3' : '#EEEDFE'
  const bgColor  = isCareer ? '#f0fdf8' : '#f5f3ff'

  if (!result) {
    return (
      <div className="done-root" style={{ background: bgColor }}>
        <div className="done-card">
          <div style={{ textAlign:'center', fontSize:'40px', marginBottom:'8px' }}>✓</div>
          <div style={{ textAlign:'center', fontSize:'20px', fontWeight:'800', color:'#1a1a2e' }}>Survey selesai!</div>
          <div style={{ textAlign:'center', fontSize:'14px', color:'#6b7280', lineHeight:1.6 }}>Terima kasih sudah mengisi survey ini.</div>
        </div>
      </div>
    )
  }

  const icon  = result.personality_icon || result.profile_icon || '🌟'
  const label = result.personality_label || result.profile_label || ''
  const desc  = isCareer
    ? (result.profile_description?.split('\n\n')[0] || '')
    : result.personality_description || ''
  const shio  = result.shio && result.shio !== '-' ? result.shio : null
  const shioEmoji = result.shio_emoji || '🌟'

  return (
    <div className="done-root" style={{ background: bgColor }}>
      <div className="done-card">
        {/* Brand */}
        <div style={{ textAlign:'center', fontSize:'11px', fontWeight:'700', letterSpacing:'0.1em', textTransform:'uppercase', color: accent }}>
          KENALDIRI · {isCareer ? 'PROFIL PELUANG' : 'PROFIL KEUANGAN'}
        </div>

        {/* Hero */}
        <div style={{ background:'#fff', borderRadius:'20px', border:`1px solid ${accentBg}`, borderTop:`4px solid ${accent}`, padding:'28px 24px', textAlign:'center' }}>
          <div style={{ fontSize:'52px', marginBottom:'12px' }}>{icon}</div>
          <div style={{ display:'inline-block', fontSize:'12px', fontWeight:'600', padding:'4px 14px', borderRadius:'99px', background: accentBg, color: accent, marginBottom:'12px' }}>
            {label}
          </div>
          <p style={{ fontSize:'15px', color:'#374151', lineHeight:1.7, margin:0 }}>{desc}</p>
        </div>

        {/* Shio */}
        {shio && (
          <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #f0f0f7', padding:'16px 20px', display:'flex', alignItems:'center', gap:'14px' }}>
            <div style={{ fontSize:'28px' }}>{shioEmoji}</div>
            <div>
              <div style={{ fontSize:'12px', fontWeight:'600', color:'#9ca3af', marginBottom:'2px' }}>SHIO KAMU</div>
              <div style={{ fontSize:'15px', fontWeight:'700', color:'#1a1a2e' }}>Shio {shio}</div>
            </div>
          </div>
        )}

        {/* Closing message */}
        <div style={{ background: accentBg, borderRadius:'14px', padding:'18px 20px' }}>
          <p style={{ fontSize:'14px', color: isCareer ? '#085041' : '#3C3489', lineHeight:1.7, margin:0 }}>
            Terima kasih, <strong>{name}</strong>! Agen kami sudah menerima hasilmu dan akan segera menghubungimu untuk membahas lebih lanjut. 🙏
          </p>
        </div>

        <div style={{ textAlign:'center', fontSize:'11px', color:'#d1d5db', paddingTop:'8px' }}>
          KenalDiri · oneforlife.id
        </div>
      </div>
    </div>
  )
}
