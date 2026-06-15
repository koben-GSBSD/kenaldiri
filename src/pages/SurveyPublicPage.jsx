import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { QUESTIONS } from '../data/questions'
import { CAREER_QUESTIONS } from '../data/questionsCareer'
import { calculateScore } from '../data/scoring'
import { calculateCareerScore } from '../data/scoringCareer'

export default function SurveyPublicPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [link, setLink] = useState(null)
  const [status, setStatus] = useState('loading')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [introData, setIntroData] = useState({})
  const storageKey = `kenaldiri_${token}`

  useEffect(() => { validateLink() }, [token])

  async function validateLink() {
    const { data, error } = await supabase
      .from('survey_links')
      .select('*, agents(is_active)')
      .eq('token', token)
      .single()

    if (error || !data) { setStatus('invalid'); return }
    if (!data.agents?.is_active) { setStatus('invalid'); return }
    if (data.status === 'completed') { setStatus('completed'); return }
    if (data.status === 'expired' || new Date(data.expires_at) < new Date()) {
      if (data.status !== 'expired') {
        await supabase.from('survey_links').update({ status: 'expired' }).eq('id', data.id)
      }
      setStatus('expired'); return
    }

    setLink(data)
    setIntroData({ name: data.prospect_name, dob: data.prospect_dob, job: data.prospect_job, smoker: data.prospect_smoker, type: data.survey_type || 'selling' })

    if (!data.opened_at) {
      await supabase.from('survey_links').update({ opened_at: new Date().toISOString() }).eq('id', data.id)
    }

    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const parsed = JSON.parse(saved)
      setAnswers(parsed.answers || {})
      setCurrentQ(parsed.currentQ || 0)
    }
    setStatus('intro')
  }

  const isCareer = introData.type === 'recruiting'
  const questions = isCareer ? CAREER_QUESTIONS : QUESTIONS
  const q = questions[currentQ]

  function handleAnswer(questionId, optionId) {
    const newAnswers = { ...answers, [questionId]: optionId }
    setAnswers(newAnswers)
    const next = currentQ + 1
    localStorage.setItem(storageKey, JSON.stringify({ answers: newAnswers, currentQ: next }))
    if (next < questions.length) {
      setTimeout(() => setCurrentQ(next), 280)
    } else {
      submitSurvey(newAnswers)
    }
  }

  async function submitSurvey(finalAnswers) {
    setStatus('submitting')
    let result
    if (isCareer) {
      result = calculateCareerScore(finalAnswers)
      await supabase.from('survey_responses').insert({
        link_id: link.id,
        answers: finalAnswers,
        personality_type: result.profile_type,
        shio: '-',
        readiness_score: result.openness_score,
        primary_product: result.need_level,
        secondary_product: result.profile_type,
        recommendation_narrative: result.recommendation_narrative,
      })
    } else {
      result = calculateScore(finalAnswers, introData.dob, introData.smoker)
      await supabase.from('survey_responses').insert({
        link_id: link.id,
        answers: finalAnswers,
        personality_type: result.personality_type,
        shio: result.shio,
        readiness_score: result.readiness_score,
        primary_product: result.primary_product,
        secondary_product: result.secondary_product,
        recommendation_narrative: result.recommendation_narrative,
      })
    }
    await supabase.from('survey_links').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', link.id)
    localStorage.removeItem(storageKey)
    navigate(`/s/${token}/done`, { state: { result, name: introData.name, type: introData.type } })
  }

  const progress = Math.round((currentQ / questions.length) * 100)

  // Color theme based on type
  const theme = isCareer
    ? { primary: '#1D9E75', light: '#E1F5EE', brand: 'KENALDIRI · PROFIL PELUANG' }
    : { primary: '#7F77DD', light: '#EEEDFE', brand: 'KENALDIRI · PROFIL KEUANGAN' }

  if (status === 'loading') return <Screen><Spinner /></Screen>
  if (status === 'invalid') return <Screen><ErrorMsg title="Link tidak tersedia" msg="Link ini tidak valid atau telah dinonaktifkan." /></Screen>
  if (status === 'expired') return <Screen><ErrorMsg title="Link sudah kedaluwarsa" msg="Link survey ini hanya aktif selama 1 jam. Silakan minta link baru kepada agen Anda." /></Screen>
  if (status === 'completed') return <Screen><ErrorMsg title="Survey sudah diisi" msg="Terima kasih! Survey ini sudah pernah diisi sebelumnya." green /></Screen>
  if (status === 'submitting') return <Screen><Spinner label="Menganalisa jawabanmu..." /></Screen>

  if (status === 'intro') {
    return (
      <Screen theme={theme}>
        <div style={s.card}>
          <div style={{ ...s.kdBrand, color: theme.primary }}>{theme.brand}</div>
          <h1 style={s.introTitle}>Halo, {introData.name}!</h1>
          <p style={s.introText}>
            Kamu akan menjawab <strong>{questions.length} pertanyaan</strong> singkat tentang{' '}
            {isCareer ? 'karakter, motivasi, dan peluang karirmu' : 'kepribadian dan gaya hidupmu'}.{' '}
            Tidak ada jawaban benar atau salah — semua tentang dirimu.
          </p>
          <p style={s.introText}>Estimasi waktu: <strong>10–15 menit</strong>.</p>
          <div style={s.privacyNote}>
            Data yang kamu isi hanya digunakan untuk keperluan analisa dan tidak dibagikan kepada pihak ketiga.
          </div>
          <button onClick={() => setStatus('survey')} style={{ ...s.startBtn, background: theme.primary }}>
            Mulai Sekarang →
          </button>
        </div>
      </Screen>
    )
  }

  return (
    <Screen theme={theme}>
      <div style={s.surveyWrap}>
        <div style={s.progressWrap}>
          <div style={s.progressBar}>
            <div style={{ ...s.progressFill, width: `${progress}%`, background: theme.primary }} />
          </div>
          <div style={s.progressLabel}>{currentQ + 1} / {questions.length}</div>
        </div>

        <div style={{ ...s.phaseLabel, color: theme.primary }}>Bagian {q.phase}</div>

        <div style={s.questionCard}>
          <p style={s.questionText}>{q.text}</p>
          {q.note && <p style={s.questionNote}>{q.note}</p>}
          <div style={s.options}>
            {q.options.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleAnswer(q.id, opt.id)}
                style={{
                  ...s.optionBtn,
                  ...(answers[q.id] === opt.id ? { ...s.optionSelected, background: theme.light, border: `2px solid ${theme.primary}` } : {})
                }}
              >
                <span style={{ ...s.optionLetter, background: theme.light, color: theme.primary }}>{opt.id.toUpperCase()}</span>
                <span style={s.optionText}>{opt.text}</span>
              </button>
            ))}
          </div>
        </div>

        {currentQ > 0 && (
          <button onClick={() => setCurrentQ(currentQ - 1)} style={s.backBtn}>← Kembali</button>
        )}

        <div style={s.brandFooter}>KenalDiri · {isCareer ? 'ProfilKu Peluang' : 'ProfilKu Finansial'}</div>
      </div>
    </Screen>
  )
}

function Screen({ children, theme }) {
  return (
    <div style={{ minHeight:'100vh', background:'#f8f7ff', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', fontFamily:'system-ui,-apple-system,sans-serif' }}>
      <div style={{ width:'100%', maxWidth:'480px' }}>{children}</div>
    </div>
  )
}

function Spinner({ label = 'Memuat...' }) {
  return (
    <div style={{ textAlign:'center', color:'#888', padding:'40px' }}>
      <div style={{ fontSize:'24px', marginBottom:'12px', animation:'spin 1s linear infinite' }}>⟳</div>
      <div style={{ fontSize:'14px' }}>{label}</div>
    </div>
  )
}

function ErrorMsg({ title, msg, green }) {
  return (
    <div style={{ background:'#fff', borderRadius:'16px', padding:'40px', textAlign:'center', border:'1px solid #eee' }}>
      <div style={{ fontSize:'40px', marginBottom:'16px' }}>{green ? '✓' : '✕'}</div>
      <h2 style={{ fontSize:'18px', fontWeight:'700', color:'#1a1a1a', marginBottom:'8px' }}>{title}</h2>
      <p style={{ fontSize:'14px', color:'#888', lineHeight:1.6 }}>{msg}</p>
    </div>
  )
}

const s = {
  card: { background:'#fff', borderRadius:'16px', padding:'36px 28px', border:'1px solid #eee' },
  kdBrand: { fontSize:'12px', fontWeight:'700', letterSpacing:'0.1em', marginBottom:'20px', textTransform:'uppercase' },
  introTitle: { fontSize:'22px', fontWeight:'700', color:'#1a1a1a', marginBottom:'12px' },
  introText: { fontSize:'15px', color:'#555', lineHeight:1.7, marginBottom:'10px' },
  privacyNote: { background:'#f0f0f0', borderRadius:'8px', padding:'12px', fontSize:'12px', color:'#888', marginBottom:'24px', lineHeight:1.5 },
  startBtn: { width:'100%', padding:'14px', color:'#fff', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:'600', cursor:'pointer' },
  surveyWrap: { display:'flex', flexDirection:'column', gap:'16px' },
  progressWrap: { display:'flex', alignItems:'center', gap:'12px' },
  progressBar: { flex:1, height:'6px', background:'#e8e8f0', borderRadius:'99px', overflow:'hidden' },
  progressFill: { height:'100%', borderRadius:'99px', transition:'width 0.3s' },
  progressLabel: { fontSize:'12px', color:'#999', minWidth:'40px', textAlign:'right' },
  phaseLabel: { fontSize:'12px', fontWeight:'500', textTransform:'uppercase', letterSpacing:'0.08em' },
  questionCard: { background:'#fff', borderRadius:'16px', padding:'28px', border:'1px solid #eee' },
  questionText: { fontSize:'16px', fontWeight:'600', color:'#1a1a1a', lineHeight:1.6, marginBottom:'8px' },
  questionNote: { fontSize:'13px', color:'#999', marginBottom:'20px', fontStyle:'italic' },
  options: { display:'flex', flexDirection:'column', gap:'10px' },
  optionBtn: { display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', background:'#f8f8f8', border:'2px solid transparent', borderRadius:'10px', cursor:'pointer', textAlign:'left', transition:'all 0.15s' },
  optionSelected: { background:'#f0effe', border:'2px solid #7F77DD' },
  optionLetter: { width:'28px', height:'28px', background:'#e8e8f0', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', flexShrink:0 },
  optionText: { fontSize:'14px', color:'#333', lineHeight:1.4 },
  backBtn: { background:'none', border:'none', color:'#999', fontSize:'13px', cursor:'pointer', padding:'4px 0' },
  brandFooter: { textAlign:'center', fontSize:'11px', color:'#ccc', paddingTop:'8px' },
}
