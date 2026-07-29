import { useEffect } from 'react'

const SCRIPTS = {
  pelindung: {
    opener: (n) => `${n}, dari jawaban tadi terlihat keluarga adalah prioritas utama buat kamu.`,
    resonance: 'Tekankan bahwa pelindung sejati butuh dilindungi juga — proteksi jiwa & income adalah cara menjaga peran itu tetap utuh.',
  },
  perencana: {
    opener: (n) => `${n}, kamu termasuk orang yang selalu mikir dua-tiga langkah ke depan.`,
    resonance: 'Highlight bahwa satu-satunya hal yang tidak bisa direncanakan adalah kesehatan & kehidupan — di sinilah proteksi melengkapi rencana yang sudah matang.',
  },
  penikmat: {
    opener: (n) => `${n}, kamu jelas tipe yang menjalani hidup sepenuhnya.`,
    resonance: 'Framing proteksi bukan sebagai pembatas, tapi sebagai "izin" supaya bisa terus menikmati hidup tanpa was-was.',
  },
  pencari_aman: {
    opener: (n) => `${n}, ketenangan dan stabilitas kelihatan banget jadi prioritas utama kamu.`,
    resonance: 'Tekankan bahwa ketenangan sejati datang dari kepastian finansial — proteksi yang menjaminnya di kondisi apapun.',
  },
  connector: {
    opener: (n) => `${n}, kamu punya bakat alami bikin orang nyaman dan percaya.`,
    resonance: 'Dia sudah "kerja sebagai konsultan" tanpa dibayar — saatnya itu jadi penghasilan nyata.',
  },
  achiever: {
    opener: (n) => `${n}, kelihatan dari jawabanmu kamu termotivasi banget sama hasil dan target yang jelas.`,
    resonance: 'Highlight sistem reward proporsional dengan usaha — tanpa plafon karir.',
  },
  empath: {
    opener: (n) => `${n}, buat kamu pekerjaan harus terasa berarti, bukan cuma soal angka.`,
    resonance: 'Framing: karir ini kasih dua hal — penghasilan signifikan DAN dampak nyata buat orang lain.',
  },
  explorer: {
    opener: (n) => `${n}, kelihatan kamu tipe yang nggak gampang puas di zona nyaman.`,
    resonance: 'Framing: kesempatan dengan kebebasan penuh — waktu, cara kerja, dan potensi penghasilan tanpa batas.',
  },
}

const AREA_STATUS_COLORS = {
  urgent:   { bg: '#FCEAEA', text: '#9B1C1C', bar: '#E25B5B' },
  moderate: { bg: '#FAEEDA', text: '#633806', bar: '#EF9F27' },
  good:     { bg: '#EAF3DE', text: '#27500A', bar: '#639922' },
}
const AREA_STATUS_LABEL = { urgent: 'Mendesak', moderate: 'Cukup', good: 'Baik' }

function scoreBand(score) {
  if (score >= 70) return { label: 'Tinggi', ...AREA_STATUS_COLORS.good }
  if (score >= 45) return { label: 'Sedang', ...AREA_STATUS_COLORS.moderate }
  return { label: 'Perlu Perhatian', ...AREA_STATUS_COLORS.urgent }
}

export default function ResultPanel({ survey, response, onClose, onImport, importing }) {
  const isCareer = survey.survey_type === 'recruiting'
  const extra    = response?.extra_data || {}
  const name     = survey.prospect_name || 'Nasabah'
  const pType    = response?.personality_type || ''
  const script   = SCRIPTS[pType] || (isCareer ? SCRIPTS.connector : SCRIPTS.pelindung)
  const accent   = isCareer ? '#1D9E75' : '#7F77DD'
  const accentBg = isCareer ? '#E6F9F3' : '#EEEDFE'
  const accentDark = isCareer ? '#085041' : '#3C3489'

  // FRS atau CRI
  const mainScore = isCareer ? extra.cri_score : extra.frs_score
  const scoreLabel = isCareer ? 'Career Readiness Index' : 'Financial Readiness Score'
  const scoreBandData = typeof mainScore === 'number' ? scoreBand(mainScore) : null

  // Close on Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', justifyContent:'flex-end' }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)' }}
      />
      {/* Panel */}
      <div style={{
        position:'relative', width:'min(520px, 100vw)', height:'100%',
        background:'#F8F9FA', overflowY:'auto',
        boxShadow:'-4px 0 32px rgba(0,0,0,0.15)',
        animation:'rp-slide-in 0.25s cubic-bezier(0.22,1,0.36,1)',
        fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
      }}>
        <style>{`
          @keyframes rp-slide-in { from { transform: translateX(100%) } to { transform: translateX(0) } }
        `}</style>

        {/* Header */}
        <div style={{ background:'#fff', borderBottom:'1px solid #E9ECEF', padding:'16px 20px', position:'sticky', top:0, zIndex:10, display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'16px', fontWeight:'700', color:'#1A1A2E' }}>{name}</div>
            <div style={{ fontSize:'12px', color:'#6C757D', marginTop:'2px' }}>
              {isCareer ? '🎯 ProfilKu Peluang' : '💼 ProfilKu Finansial'} · {survey.prospect_job || '—'}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'#F1F3F5', border:'none', borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer', fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center', color:'#6C757D' }}>✕</button>
        </div>

        <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:'14px' }}>

          {/* Profile card */}
          <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #E9ECEF', borderTop:`3px solid ${accent}`, padding:'18px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
              <div style={{ fontSize:'32px' }}>{extra.personality_icon || extra.profile_icon || '🌟'}</div>
              <div>
                <div style={{ fontSize:'14px', fontWeight:'700', color:'#1A1A2E' }}>
                  {extra.personality_label || extra.profile_label || pType}
                </div>
                <div style={{ fontSize:'12px', color: accent, marginTop:'2px' }}>
                  {response?.shio ? `Shio ${response.shio}` : ''}
                </div>
              </div>
              <div style={{ marginLeft:'auto', textAlign:'center' }}>
                <div style={{ fontSize:'20px', fontWeight:'700', color: accent }}>{response?.readiness_score || 0}/5</div>
                <div style={{ fontSize:'10px', color:'#ADB5BD' }}>{isCareer ? 'Keterbukaan' : 'Kesiapan'}</div>
              </div>
            </div>
            <p style={{ fontSize:'13px', color:'#495057', lineHeight:1.7, margin:0 }}>
              {extra.personality_description || extra.profile_description || response?.recommendation_narrative || '—'}
            </p>
          </div>

          {/* Score bar */}
          {typeof mainScore === 'number' && (
            <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #E9ECEF', padding:'16px 18px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                <div style={{ fontSize:'13px', fontWeight:'600', color:'#1A1A2E' }}>{scoreLabel}</div>
                <div style={{ fontSize:'12px', fontWeight:'600', padding:'3px 10px', borderRadius:'99px', background: scoreBandData.bg, color: scoreBandData.text }}>
                  {mainScore}/100 · {scoreBandData.label}
                </div>
              </div>
              <div style={{ height:'8px', background:'#E9ECEF', borderRadius:'99px', overflow:'hidden', marginBottom:'14px' }}>
                <div style={{ height:'100%', width:`${mainScore}%`, background: accent, borderRadius:'99px', transition:'width 0.4s' }} />
              </div>
              {(extra.frs_breakdown || extra.cri_breakdown || []).map((b) => (
                <div key={b.key} style={{ borderTop:'1px solid #F1F3F5', paddingTop:'8px', marginTop:'8px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px' }}>
                    <span style={{ fontWeight:'600', color:'#343A40' }}>{b.label}</span>
                    <span style={{ fontWeight:'700', color: accentDark }}>{b.points}/{b.max}</span>
                  </div>
                  {b.answer && <div style={{ fontSize:'11px', color:'#ADB5BD', fontStyle:'italic', marginTop:'2px' }}>"{b.answer}"</div>}
                </div>
              ))}
            </div>
          )}

          {/* Protection areas (finansial) */}
          {!isCareer && extra.protection_areas?.length > 0 && (
            <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #E9ECEF', padding:'16px 18px' }}>
              <div style={{ fontSize:'13px', fontWeight:'600', color:'#1A1A2E', marginBottom:'12px' }}>🧩 4 Area Proteksi Keluarga</div>
              {extra.protection_areas.map(area => (
                <div key={area.key} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px', background:'#F8F9FA', borderRadius:'8px', padding:'10px 12px' }}>
                  <div style={{ fontSize:'18px' }}>{area.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'12px', fontWeight:'600', color:'#343A40' }}>{area.label}</div>
                    {area.note && <div style={{ fontSize:'11px', color:'#ADB5BD', marginTop:'1px' }}>{area.note}</div>}
                  </div>
                  <div style={{ fontSize:'11px', fontWeight:'700', padding:'3px 8px', borderRadius:'99px', background: AREA_STATUS_COLORS[area.status]?.bg, color: AREA_STATUS_COLORS[area.status]?.text }}>
                    {AREA_STATUS_LABEL[area.status]}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Key moments */}
          {extra.key_moments?.length > 0 && (
            <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #E9ECEF', padding:'16px 18px' }}>
              <div style={{ fontSize:'13px', fontWeight:'600', color:'#1A1A2E', marginBottom:'12px' }}>🔑 Momen Kunci dari Jawaban</div>
              {extra.key_moments.map((m, i) => (
                <div key={i} style={{ borderLeft:`3px solid ${accent}`, paddingLeft:'12px', marginBottom:'12px' }}>
                  <div style={{ fontSize:'11px', fontWeight:'600', color:'#ADB5BD', marginBottom:'2px' }}>{m.question}</div>
                  <div style={{ fontSize:'13px', color:'#343A40', fontStyle:'italic', marginBottom:'4px' }}>"{m.answer}"</div>
                  <div style={{ fontSize:'12px', color:'#495057', lineHeight:1.6 }}>{m.insight}</div>
                </div>
              ))}
            </div>
          )}

          {/* Panduan percakapan */}
          <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #E9ECEF', padding:'16px 18px' }}>
            <div style={{ fontSize:'13px', fontWeight:'600', color:'#1A1A2E', marginBottom:'12px' }}>💬 Panduan Percakapan</div>
            <div style={{ marginBottom:'10px' }}>
              <div style={{ fontSize:'11px', fontWeight:'600', color:'#ADB5BD', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px' }}>Pembuka</div>
              <div style={{ fontSize:'13px', color:'#343A40', fontStyle:'italic', background:'#F8F9FA', padding:'10px 12px', borderRadius:'8px', lineHeight:1.6 }}>
                "{script.opener(name)}"
              </div>
            </div>
            <div>
              <div style={{ fontSize:'11px', fontWeight:'600', color:'#ADB5BD', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px' }}>Poin Utama</div>
              <div style={{ fontSize:'13px', color:'#343A40', background:'#F8F9FA', padding:'10px 12px', borderRadius:'8px', lineHeight:1.6 }}>
                {script.resonance}
              </div>
            </div>
          </div>

          {/* Import button */}
          <button
            onClick={() => onImport(survey)}
            disabled={importing}
            style={{
              width:'100%', padding:'14px', border:'none', borderRadius:'12px',
              background: importing ? '#E9ECEF' : accent,
              color: importing ? '#ADB5BD' : '#fff',
              fontSize:'14px', fontWeight:'700', cursor: importing ? 'not-allowed' : 'pointer',
              fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
              transition:'all 0.15s',
            }}
          >
            {importing ? 'Menambahkan...' : '+ Tambah ke List Prospek'}
          </button>

          <div style={{ height:'20px' }} />
        </div>
      </div>
    </div>
  )
}
