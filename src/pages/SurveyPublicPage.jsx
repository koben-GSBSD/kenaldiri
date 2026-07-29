import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { QUESTIONS } from '../data/questions'
import { CAREER_QUESTIONS } from '../data/questionsCareer'
import { calculateScore } from '../data/scoring'
import { calculateCareerScore } from '../data/scoringCareer'

// ─── CSS injected once ────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .kd-survey-root {
    min-height: 100vh;
    min-height: 100dvh;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow-x: hidden;
  }

  /* BG gradient based on type */
  .kd-bg-financial { background: linear-gradient(160deg, #f0effe 0%, #f8f7ff 40%, #fafafa 100%); }
  .kd-bg-career    { background: linear-gradient(160deg, #e6f9f3 0%, #f4fbf8 40%, #fafafa 100%); }

  /* TOP BAR */
  .kd-topbar {
    position: sticky; top: 0; z-index: 50;
    padding: 14px 20px 10px;
    display: flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }
  .kd-back-btn {
    width: 36px; height: 36px;
    border: none; border-radius: 50%; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; line-height: 1;
    flex-shrink: 0;
    transition: background 0.15s;
  }
  .kd-back-btn-financial { background: #ede9fe; color: #7F77DD; }
  .kd-back-btn-career    { background: #d1fae5; color: #1D9E75; }
  .kd-back-btn:active { opacity: 0.7; transform: scale(0.93); }
  .kd-phase-track { flex: 1; display: flex; flex-direction: column; gap: 5px; }
  .kd-phase-info {
    display: flex; justify-content: space-between; align-items: center;
  }
  .kd-phase-text {
    font-size: 11px; font-weight: 600; letter-spacing: 0.07em;
    text-transform: uppercase;
  }
  .kd-phase-text-financial { color: #7F77DD; }
  .kd-phase-text-career    { color: #1D9E75; }
  .kd-q-counter { font-size: 11px; font-weight: 500; color: #aaa; }
  .kd-seg-track {
    display: flex; gap: 3px; height: 4px;
  }
  .kd-seg {
    flex: 1; border-radius: 99px; transition: background 0.4s;
  }
  .kd-seg-done-financial { background: #7F77DD; }
  .kd-seg-done-career    { background: #1D9E75; }
  .kd-seg-active-financial { background: #c4bff5; }
  .kd-seg-active-career    { background: #6ee7c0; }
  .kd-seg-empty { background: #e5e5e5; }

  /* MAIN QUESTION AREA */
  .kd-main {
    flex: 1;
    display: flex; flex-direction: column;
    padding: 28px 20px 40px;
    max-width: 540px; width: 100%; margin: 0 auto;
  }

  /* SLIDE ANIMATION */
  .kd-slide-enter { animation: kd-slide-in 0.28s cubic-bezier(0.22,1,0.36,1) forwards; }
  .kd-slide-exit  { animation: kd-slide-out 0.18s ease-in forwards; }
  @keyframes kd-slide-in {
    from { opacity: 0; transform: translateX(32px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes kd-slide-out {
    from { opacity: 1; transform: translateX(0); }
    to   { opacity: 0; transform: translateX(-24px); }
  }
  .kd-slide-back-enter { animation: kd-slide-back-in 0.28s cubic-bezier(0.22,1,0.36,1) forwards; }
  @keyframes kd-slide-back-in {
    from { opacity: 0; transform: translateX(-32px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .kd-q-label {
    font-size: 12px; font-weight: 600;
    letter-spacing: 0.06em; text-transform: uppercase;
    margin-bottom: 16px;
  }
  .kd-q-label-financial { color: #9f97e8; }
  .kd-q-label-career    { color: #34c997; }

  .kd-q-text {
    font-size: 20px; font-weight: 700;
    color: #1a1a2e; line-height: 1.45;
    margin-bottom: 10px;
  }
  .kd-q-note {
    font-size: 13px; color: #9fa0b0;
    line-height: 1.55; margin-bottom: 28px;
    font-style: italic;
  }
  .kd-q-text:not(+ .kd-q-note) { margin-bottom: 28px; }

  /* OPTIONS */
  .kd-options { display: flex; flex-direction: column; gap: 10px; margin-top: auto; }

  .kd-opt {
    width: 100%; min-height: 56px; padding: 14px 16px;
    display: flex; align-items: center; gap: 14px;
    background: #fff;
    border: 1.5px solid #e8e8ef;
    border-radius: 14px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
    position: relative; overflow: hidden;
  }
  .kd-opt:active { transform: scale(0.98); }

  .kd-opt-selected-financial {
    border-color: #7F77DD;
    background: #f0effe;
  }
  .kd-opt-selected-career {
    border-color: #1D9E75;
    background: #e6f9f3;
  }

  .kd-opt-ripple {
    position: absolute; inset: 0; pointer-events: none;
    background: rgba(127,119,221,0.1);
    border-radius: 14px;
    animation: kd-ripple 0.35s ease-out forwards;
  }
  .kd-opt-ripple-career { background: rgba(29,158,117,0.1); }
  @keyframes kd-ripple {
    from { opacity: 1; transform: scale(0.92); }
    to   { opacity: 0; transform: scale(1.04); }
  }

  .kd-opt-badge {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; flex-shrink: 0;
    transition: all 0.15s;
  }
  .kd-opt-badge-default { background: #f0f0f7; color: #888; }
  .kd-opt-badge-financial { background: #7F77DD; color: #fff; }
  .kd-opt-badge-career    { background: #1D9E75; color: #fff; }

  .kd-opt-text {
    font-size: 15px; font-weight: 500; color: #1a1a2e;
    line-height: 1.4; flex: 1;
  }
  .kd-opt-check {
    width: 20px; height: 20px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; flex-shrink: 0;
  }
  .kd-opt-check-financial { background: #7F77DD; color: #fff; }
  .kd-opt-check-career    { background: #1D9E75; color: #fff; }

  /* INTRO PAGE */
  .kd-intro-wrap {
    flex: 1; display: flex; flex-direction: column;
    justify-content: center;
    padding: 32px 24px 40px;
    max-width: 540px; width: 100%; margin: 0 auto;
    animation: kd-slide-in 0.4s cubic-bezier(0.22,1,0.36,1);
  }
  .kd-intro-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px; border-radius: 99px;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    margin-bottom: 24px; width: fit-content;
  }
  .kd-intro-badge-financial { background: #ede9fe; color: #7F77DD; }
  .kd-intro-badge-career    { background: #d1fae5; color: #1D9E75; }
  .kd-intro-hi {
    font-size: 30px; font-weight: 800; color: #1a1a2e;
    line-height: 1.2; margin-bottom: 8px;
  }
  .kd-intro-sub {
    font-size: 16px; color: #6b7280; line-height: 1.6;
    margin-bottom: 28px;
  }
  .kd-intro-cards { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
  .kd-intro-card {
    display: flex; align-items: center; gap: 12px;
    background: #fff; border: 1px solid #eee;
    border-radius: 12px; padding: 14px 16px;
  }
  .kd-intro-card-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .kd-intro-card-icon-financial { background: #ede9fe; }
  .kd-intro-card-icon-career    { background: #d1fae5; }
  .kd-intro-card-text { font-size: 14px; color: #374151; line-height: 1.4; }
  .kd-intro-card-text strong { color: #1a1a2e; font-weight: 600; }
  .kd-intro-privacy {
    font-size: 12px; color: #9ca3af;
    line-height: 1.55; margin-bottom: 24px;
    display: flex; gap: 6px; align-items: flex-start;
  }
  .kd-start-btn {
    width: 100%; padding: 17px;
    border: none; border-radius: 14px;
    font-size: 16px; font-weight: 700;
    color: #fff; cursor: pointer;
    letter-spacing: 0.01em;
    transition: all 0.15s;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  }
  .kd-start-btn:active { transform: scale(0.98); opacity: 0.9; }
  .kd-start-btn-financial { background: linear-gradient(135deg, #7F77DD 0%, #9f97f5 100%); }
  .kd-start-btn-career    { background: linear-gradient(135deg, #1D9E75 0%, #34c997 100%); }
  .kd-start-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* FORM DATA DIRI */
  .kd-form-group { margin-bottom: 18px; }
  .kd-form-label {
    display: block; font-size: 13px; font-weight: 700; color: #1a1a2e;
    margin-bottom: 7px;
  }
  .kd-form-label span { color: #9ca3af; font-weight: 500; }
  .kd-form-input {
    width: 100%; padding: 13px 16px;
    border: 1.5px solid #e5e7eb; border-radius: 12px;
    font-size: 15px; font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    color: #1a1a2e; background: #fff;
    transition: border-color 0.15s;
    outline: none;
  }
  .kd-form-input:focus { border-color: #7F77DD; }
  .kd-form-input-career:focus { border-color: #1D9E75; }
  .kd-form-checkbox-row {
    display: flex; align-items: center; gap: 10px;
    padding: 13px 16px; background: #f8f9fa; border-radius: 12px;
    margin-bottom: 8px; cursor: pointer;
  }
  .kd-form-checkbox-row input { width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; }
  .kd-form-checkbox-row span { font-size: 14px; color: #374151; }
  .kd-form-error {
    background: #fceaea; color: #9b1c1c; font-size: 13px;
    padding: 10px 14px; border-radius: 10px; margin-bottom: 16px;
  }

  /* STATUS SCREENS */
  .kd-status-wrap {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 40px 24px; text-align: center;
    animation: kd-slide-in 0.4s cubic-bezier(0.22,1,0.36,1);
  }
  .kd-status-icon {
    width: 72px; height: 72px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 32px; margin: 0 auto 20px;
  }
  .kd-status-title { font-size: 20px; font-weight: 700; color: #1a1a2e; margin-bottom: 8px; }
  .kd-status-msg   { font-size: 15px; color: #6b7280; line-height: 1.6; max-width: 320px; }

  /* SUBMITTING */
  .kd-submit-wrap {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 40px 24px; gap: 20px;
  }
  .kd-spinner {
    width: 48px; height: 48px;
    border-radius: 50%;
    border: 3px solid #e5e5e5;
    border-top-color: #7F77DD;
    animation: kd-spin 0.8s linear infinite;
  }
  .kd-spinner-career { border-top-color: #1D9E75; }
  @keyframes kd-spin { to { transform: rotate(360deg); } }
  .kd-submit-label { font-size: 15px; font-weight: 600; color: #6b7280; }

  /* FOOTER BRAND */
  .kd-footer { text-align: center; padding: 16px; font-size: 11px; color: #ccc; }

  @media (max-width: 380px) {
    .kd-q-text { font-size: 18px; }
    .kd-opt { min-height: 52px; padding: 12px 14px; }
    .kd-opt-text { font-size: 14px; }
  }
`

let cssInjected = false
function injectCSS() {
  if (cssInjected) return
  const style = document.createElement('style')
  style.textContent = CSS
  document.head.appendChild(style)
  cssInjected = true
}

// Nama fase per survey type
const PHASE_NAMES = {
  financial: ['Karakter Dasar', 'Gaya Finansial', 'Proteksi & Risiko', 'Kehidupan & Tujuan', 'Perspektif'],
  career:    ['Situasi & Rasa', 'Karakter & Motivasi', 'Jaringan & Pengaruh', 'Peluang & Kesiapan', 'Visi'],
}

export default function SurveyPublicPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [link, setLink] = useState(null)
  const [status, setStatus] = useState('loading')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [introData, setIntroData] = useState({})
  const [formData, setFormData]   = useState({ name: '', dob: '', job: '', smoker: false })
  const [formError, setFormError] = useState('')
  const [formSaving, setFormSaving] = useState(false)
  const [anim, setAnim] = useState('enter')  // 'enter' | 'exit' | 'back-enter'
  const [ripple, setRipple] = useState(null) // optId yang diklik
  const storageKey = `kenaldiri_${token}`
  const animRef = useRef(null)

  useEffect(() => { injectCSS(); validateLink() }, [token])

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
    setIntroData({
      name: data.prospect_name,
      dob: data.prospect_dob,
      job: data.prospect_job,
      smoker: data.prospect_smoker,
      type: data.survey_type || 'selling',
    })

    if (!data.opened_at) {
      await supabase.from('survey_links').update({ opened_at: new Date().toISOString() }).eq('id', data.id)
    }

    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setAnswers(parsed.answers || {})
        setCurrentQ(parsed.currentQ || 0)
      } catch {}
    }
    // Kalau nama & tgl lahir belum diisi (link digenerate kosong oleh agent),
    // minta prospek isi data diri dulu sebelum masuk layar sambutan.
    if (!data.prospect_name || !data.prospect_dob) {
      setStatus('form')
    } else {
      setStatus('intro')
    }
  }

  async function submitForm() {
    if (!formData.name.trim()) { setFormError('Nama lengkap wajib diisi.'); return }
    if (!formData.dob) { setFormError('Tanggal lahir wajib diisi.'); return }
    setFormError('')
    setFormSaving(true)
    const updates = {
      prospect_name: formData.name.trim(),
      prospect_dob:  formData.dob,
      prospect_job:  formData.job.trim() || null,
      prospect_smoker: !!formData.smoker,
    }
    const { error } = await supabase.from('survey_links').update(updates).eq('id', link.id)
    setFormSaving(false)
    if (error) { setFormError('Gagal menyimpan data. Coba lagi.'); return }
    setIntroData(prev => ({ ...prev, name: updates.prospect_name, dob: updates.prospect_dob, job: updates.prospect_job, smoker: updates.prospect_smoker }))
    setStatus('intro')
  }

  const isCareer  = introData.type === 'recruiting'
  const questions = isCareer ? CAREER_QUESTIONS : QUESTIONS
  const q         = questions[currentQ]
  const t         = isCareer ? 'career' : 'financial'
  const phaseNames = isCareer ? PHASE_NAMES.career : PHASE_NAMES.financial

  // Hitung fase dan segmen untuk progress bar
  const phases = [...new Set(questions.map(q => q.phase))]
  const currentPhase = q?.phase || 1
  const qInPhase  = questions.filter(x => x.phase === currentPhase)
  const idxInPhase = qInPhase.indexOf(q)

  function goNext(newAnswers, nextIdx) {
    setAnim('exit')
    clearTimeout(animRef.current)
    animRef.current = setTimeout(() => {
      if (nextIdx < questions.length) {
        setCurrentQ(nextIdx)
        setAnim('enter')
      }
    }, 180)
    localStorage.setItem(storageKey, JSON.stringify({ answers: newAnswers, currentQ: nextIdx }))
  }

  function goBack() {
    if (currentQ === 0) { setStatus('intro'); return }
    setAnim('back-enter')
    clearTimeout(animRef.current)
    animRef.current = setTimeout(() => {
      setCurrentQ(prev => prev - 1)
    }, 0)
    localStorage.setItem(storageKey, JSON.stringify({ answers, currentQ: currentQ - 1 }))
  }

  function handleAnswer(questionId, optId) {
    setRipple(optId)
    setTimeout(() => setRipple(null), 400)
    const newAnswers = { ...answers, [questionId]: optId }
    setAnswers(newAnswers)
    const next = currentQ + 1
    if (next < questions.length) {
      goNext(newAnswers, next)
    } else {
      setStatus('submitting')
      submitSurvey(newAnswers)
    }
  }

  async function submitSurvey(finalAnswers) {
    let result
    if (isCareer) {
      result = calculateCareerScore(finalAnswers, introData.dob)
      await supabase.from('survey_responses').insert({
        link_id: link.id,
        answers: finalAnswers,
        personality_type: result.profile_type,
        shio: result.shio || '-',
        readiness_score: result.openness_score,
        primary_product: result.need_level,
        secondary_product: result.profile_type,
        recommendation_narrative: result.recommendation_narrative,
        extra_data: {
          survey_type: 'recruiting',
          profile_label: result.profile_label,
          profile_icon: result.profile_icon,
          profile_tagline: result.profile_tagline,
          profile_description: result.profile_description,
          profile_insight: result.profile_insight,
          profile_opportunity: result.profile_opportunity,
          readiness_note: result.readiness_note,
          scores: result.scores,
          shio_emoji: result.shio_emoji,
          shio_strength: result.shio_strength,
          shio_weakness: result.shio_weakness,
          shio_career: result.shio_career,
          shio_jobs: result.shio_jobs,
          cri_score: result.cri_score,
          cri_breakdown: result.cri_breakdown,
          key_moments: result.key_moments,
        },
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
        extra_data: {
          survey_type: 'selling',
          personality_label: result.personality_label,
          personality_icon: result.personality_icon,
          personality_description: result.personality_description,
          personality_insight: result.personality_insight,
          scores: result.scores,
          shio_emoji: result.shio_emoji,
          shio_spending_behavior: result.shio_spending_behavior,
          frs_score: result.frs_score,
          frs_breakdown: result.frs_breakdown,
          protection_areas: result.protection_areas,
          key_moments: result.key_moments,
        },
      })
    }
    await supabase.from('survey_links').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    }).eq('id', link.id)
    localStorage.removeItem(storageKey)
    navigate(`/s/${token}/done`, { state: { result, name: introData.name, type: introData.type } })
  }

  // ── RENDER: Status screens ────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className={`kd-survey-root kd-bg-financial`}>
        <div className="kd-submit-wrap">
          <div className="kd-spinner" />
          <div className="kd-submit-label">Memuat survey...</div>
        </div>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="kd-survey-root kd-bg-financial">
        <div className="kd-status-wrap">
          <div className="kd-status-icon" style={{ background: '#fee2e2' }}>❌</div>
          <div className="kd-status-title">Link tidak tersedia</div>
          <div className="kd-status-msg">Link ini tidak valid atau telah dinonaktifkan. Silakan hubungi agen Anda.</div>
        </div>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="kd-survey-root kd-bg-financial">
        <div className="kd-status-wrap">
          <div className="kd-status-icon" style={{ background: '#fef3c7' }}>⏰</div>
          <div className="kd-status-title">Link sudah kedaluwarsa</div>
          <div className="kd-status-msg">Link survey ini sudah tidak aktif. Minta link baru kepada agen Anda.</div>
        </div>
      </div>
    )
  }

  if (status === 'completed') {
    return (
      <div className="kd-survey-root kd-bg-financial">
        <div className="kd-status-wrap">
          <div className="kd-status-icon" style={{ background: '#d1fae5' }}>✓</div>
          <div className="kd-status-title">Survey sudah diisi</div>
          <div className="kd-status-msg">Terima kasih! Survey ini sudah pernah diisi sebelumnya.</div>
        </div>
      </div>
    )
  }

  if (status === 'submitting') {
    return (
      <div className={`kd-survey-root kd-bg-${t}`}>
        <div className="kd-submit-wrap">
          <div className={`kd-spinner${isCareer ? ' kd-spinner-career' : ''}`} />
          <div className="kd-submit-label">Menganalisa jawabanmu...</div>
        </div>
      </div>
    )
  }

  // ── RENDER: Form data diri (sebelum intro, kalau data prospek belum ada) ──
  if (status === 'form') {
    return (
      <div className={`kd-survey-root kd-bg-${t}`}>
        <div className="kd-intro-wrap">
          <div className={`kd-intro-badge kd-intro-badge-${t}`}>
            {isCareer ? '🌱 ProfilKu Peluang' : '💼 ProfilKu Finansial'}
          </div>
          <h1 className="kd-intro-hi">Kenalan dulu, yuk 👋</h1>
          <p className="kd-intro-sub">
            Isi data singkat ini supaya hasil profilmu lebih akurat dan agen bisa menghubungimu dengan tepat.
          </p>

          {formError && <div className="kd-form-error">⚠️ {formError}</div>}

          <div className="kd-form-group">
            <label className="kd-form-label">Nama Lengkap</label>
            <input
              type="text"
              className="kd-form-input"
              placeholder="Nama kamu"
              value={formData.name}
              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="kd-form-group">
            <label className="kd-form-label">Tanggal Lahir</label>
            <input
              type="date"
              className="kd-form-input"
              value={formData.dob}
              max={new Date().toISOString().slice(0, 10)}
              onChange={e => setFormData(f => ({ ...f, dob: e.target.value }))}
            />
          </div>

          <div className="kd-form-group">
            <label className="kd-form-label">Pekerjaan <span>(opsional)</span></label>
            <input
              type="text"
              className="kd-form-input"
              placeholder="Contoh: Karyawan Swasta"
              value={formData.job}
              onChange={e => setFormData(f => ({ ...f, job: e.target.value }))}
            />
          </div>

          {!isCareer && (
            <label className="kd-form-checkbox-row">
              <input
                type="checkbox"
                checked={formData.smoker}
                onChange={e => setFormData(f => ({ ...f, smoker: e.target.checked }))}
              />
              <span>Saya adalah perokok aktif</span>
            </label>
          )}

          <div style={{ marginTop: '10px' }}>
            <button
              className={`kd-start-btn kd-start-btn-${t}`}
              onClick={submitForm}
              disabled={formSaving}
            >
              {formSaving ? 'Menyimpan...' : 'Lanjutkan →'}
            </button>
          </div>
        </div>
        <div className="kd-footer">KenalDiri · {isCareer ? 'ProfilKu Peluang' : 'ProfilKu Finansial'}</div>
      </div>
    )
  }

  // ── RENDER: Intro ─────────────────────────────────────────────────
  if (status === 'intro') {
    const cards = isCareer
      ? [
          { icon: '🧠', text: <><strong>25 pertanyaan</strong> tentang karakter, motivasi, dan potensimu</> },
          { icon: '⏱️', text: <><strong>10–15 menit</strong> — bisa dijawab santai</> },
          { icon: '🎯', text: <>Hasil analisa <strong>langsung</strong> setelah selesai</> },
        ]
      : [
          { icon: '💡', text: <><strong>25 pertanyaan</strong> tentang kepribadian dan gaya hidupmu</> },
          { icon: '⏱️', text: <><strong>10–15 menit</strong> — tidak ada jawaban benar atau salah</> },
          { icon: '📊', text: <>Profil finansial <strong>lengkap</strong> langsung setelah selesai</> },
        ]

    return (
      <div className={`kd-survey-root kd-bg-${t}`}>
        <div className="kd-intro-wrap">
          <div className={`kd-intro-badge kd-intro-badge-${t}`}>
            {isCareer ? '🌱 ProfilKu Peluang' : '💼 ProfilKu Finansial'}
          </div>
          <h1 className="kd-intro-hi">Halo, {introData.name}! 👋</h1>
          <p className="kd-intro-sub">
            {isCareer
              ? 'Siap kenalan sama potensi dirimu? Survey singkat ini akan ungkap karakter dan peluang yang cocok untukmu.'
              : 'Mari kenali lebih dalam gaya finansial dan kepribadianmu. Hasilnya bisa jadi cermin diri yang berguna.'}
          </p>
          <div className="kd-intro-cards">
            {cards.map((c, i) => (
              <div key={i} className="kd-intro-card">
                <div className={`kd-intro-card-icon kd-intro-card-icon-${t}`}>{c.icon}</div>
                <div className="kd-intro-card-text">{c.text}</div>
              </div>
            ))}
          </div>
          <div className="kd-intro-privacy">
            <span>🔒</span>
            <span>Jawabanmu bersifat pribadi dan hanya digunakan untuk analisa profilmu. Tidak dibagikan kepada pihak lain.</span>
          </div>
          <button
            className={`kd-start-btn kd-start-btn-${t}`}
            onClick={() => setStatus('survey')}
          >
            Mulai Sekarang →
          </button>
        </div>
        <div className="kd-footer">KenalDiri · {isCareer ? 'ProfilKu Peluang' : 'ProfilKu Finansial'}</div>
      </div>
    )
  }

  // ── RENDER: Survey ────────────────────────────────────────────────
  const animClass = anim === 'exit' ? 'kd-slide-exit'
    : anim === 'back-enter' ? 'kd-slide-back-enter'
    : 'kd-slide-enter'

  return (
    <div className={`kd-survey-root kd-bg-${t}`}>
      {/* TOP BAR */}
      <div className="kd-topbar">
        <button
          className={`kd-back-btn kd-back-btn-${t}`}
          onClick={goBack}
          aria-label="Kembali"
        >←</button>
        <div className="kd-phase-track">
          <div className="kd-phase-info">
            <span className={`kd-phase-text kd-phase-text-${t}`}>
              {phaseNames[currentPhase - 1]}
            </span>
            <span className="kd-q-counter">{currentQ + 1} / {questions.length}</span>
          </div>
          {/* Segmented progress — satu segmen per fase */}
          <div className="kd-seg-track">
            {phases.map(ph => {
              const phQs = questions.filter(x => x.phase === ph)
              const phStart = questions.indexOf(phQs[0])
              const phEnd = phStart + phQs.length - 1
              const done = currentQ > phEnd
              const active = currentQ >= phStart && currentQ <= phEnd
              const cls = done ? `kd-seg-done-${t}`
                : active ? `kd-seg-active-${t}`
                : 'kd-seg-empty'
              return <div key={ph} className={`kd-seg ${cls}`} />
            })}
          </div>
        </div>
      </div>

      {/* QUESTION */}
      <div className="kd-main">
        <div key={currentQ} className={animClass} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ flex: 1 }}>
            <div className={`kd-q-label kd-q-label-${t}`}>
              Pertanyaan {currentQ + 1}
            </div>
            <p className="kd-q-text">{q.text}</p>
            {q.note && <p className="kd-q-note">{q.note}</p>}
          </div>
          <div className="kd-options">
            {q.options.map(opt => {
              const selected = answers[q.id] === opt.id
              const isRippling = ripple === opt.id
              return (
                <button
                  key={opt.id}
                  className={[
                    'kd-opt',
                    selected ? `kd-opt-selected-${t}` : '',
                  ].join(' ')}
                  onClick={() => handleAnswer(q.id, opt.id)}
                >
                  {isRippling && (
                    <span className={`kd-opt-ripple${isCareer ? ' kd-opt-ripple-career' : ''}`} />
                  )}
                  <span className={`kd-opt-badge ${selected ? `kd-opt-badge-${t}` : 'kd-opt-badge-default'}`}>
                    {opt.id.toUpperCase()}
                  </span>
                  <span className="kd-opt-text">{opt.text}</span>
                  {selected && (
                    <span className={`kd-opt-check kd-opt-check-${t}`}>✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="kd-footer">KenalDiri · {isCareer ? 'ProfilKu Peluang' : 'ProfilKu Finansial'}</div>
    </div>
  )
}
