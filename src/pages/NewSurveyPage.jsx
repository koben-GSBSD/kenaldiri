import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AppShell from '../components/AppShell'

function generateToken() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const SURVEY_META = {
  selling: {
    title: 'ProfilKu Finansial',
    subtitle: 'Kenali Tipe Kepribadian Keuangan Nasabah',
    tag: 'Untuk calon nasabah',
    tagColor: '#3C3489',
    tagBg: '#EEEDFE',
    color: '#7F77DD',
    prospectLabel: 'nasabah',
    waMsg: (name, url) => `Halo ${name}, berikut link survey kepribadian finansial dari saya. Mohon diisi dalam 1 jam ya 🙏\n\n${url}`,
  },
  recruiting: {
    title: 'ProfilKu Peluang',
    subtitle: 'Temukan Potensi Penghasilan Baru Calon Agen',
    tag: 'Untuk calon agen',
    tagColor: '#085041',
    tagBg: '#E1F5EE',
    color: '#1D9E75',
    prospectLabel: 'calon agen',
    waMsg: (name, url) => `Halo ${name}, saya punya kuis kepribadian karir yang menarik. Cuma 10 menit, coba isi ya! 🙂\n\n${url}`,
  },
}

export default function NewSurveyPage() {
  const [agent, setAgent] = useState(null)
  const [form, setForm] = useState({ name: '', dob: '', job: '', smoker: false })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const surveyType = searchParams.get('type') === 'recruiting' ? 'recruiting' : 'selling'
  const meta = SURVEY_META[surveyType]

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      supabase.from('agents').select('*').eq('user_id', user.id).single().then(({ data }) => setAgent(data))
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase.from('survey_links').insert({
      agent_id: agent.id,
      token,
      prospect_name: form.name.trim(),
      prospect_dob: form.dob,
      prospect_job: form.job.trim(),
      prospect_smoker: form.smoker,
      survey_type: surveyType,
      status: 'pending',
      expires_at: expiresAt,
    }).select().single()

    if (error) { alert('Gagal membuat link. Coba lagi.'); setLoading(false); return }
    const surveyUrl = `${window.location.origin}/s/${token}`
    setResult({ ...data, surveyUrl })
    setLoading(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(result.surveyUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareWA() {
    const msg = encodeURIComponent(meta.waMsg(form.name, result.surveyUrl))
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  if (result) {
    return (
      <AppShell agent={agent}>
        <div style={s.wrap}>
          <div style={s.successCard}>
            <div style={{ ...s.successIcon, background: meta.tagBg }}>✓</div>
            <h2 style={s.successTitle}>Link survey berhasil dibuat!</h2>
            <p style={s.successSub}>
              Untuk {meta.prospectLabel}: <strong>{result.prospect_name}</strong>
            </p>
            <div style={s.linkBox}>
              <code style={s.linkText}>{result.surveyUrl}</code>
            </div>
            <div style={s.expireNote}>
              Link kedaluwarsa dalam <strong>1 jam</strong> — {new Date(result.expires_at).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })}
            </div>
            <div style={s.btnRow}>
              <button onClick={shareWA} style={s.waBtn}>Kirim via WhatsApp</button>
              <button onClick={copyLink} style={s.copyBtn}>{copied ? 'Tersalin!' : 'Salin Link'}</button>
            </div>
            <div style={s.btnRow2}>
              <button onClick={() => navigate('/app/dashboard')} style={s.backBtn}>Kembali ke Dashboard</button>
              <button onClick={() => { setResult(null); setForm({ name:'', dob:'', job:'', smoker:false }) }} style={{ ...s.newBtn, background: meta.color }}>Buat Link Baru</button>
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell agent={agent}>
      <div style={s.wrap}>
        <div style={s.pageHeader}>
          <button onClick={() => navigate('/app/survey/new')} style={s.backLink}>← Ganti jenis survey</button>
          <span style={{ ...s.typeBadge, color: meta.tagColor, background: meta.tagBg }}>{meta.tag}</span>
        </div>
        <h1 style={s.title}>{meta.title}</h1>
        <p style={s.subtitle}>{meta.subtitle}</p>
        <div style={s.formCard}>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Nama lengkap {meta.prospectLabel} *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={s.input} placeholder="Contoh: Budi Santoso" required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Tanggal lahir *</label>
              <input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} style={s.input} required max={new Date().toISOString().split('T')[0]} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Pekerjaan *</label>
              <input value={form.job} onChange={e => setForm({...form, job: e.target.value})} style={s.input} placeholder="Contoh: Karyawan swasta, Wiraswasta..." required />
            </div>
            {surveyType === 'selling' && (
              <div style={s.checkField}>
                <input type="checkbox" id="smoker" checked={form.smoker} onChange={e => setForm({...form, smoker: e.target.checked})} style={s.checkbox} />
                <label htmlFor="smoker" style={s.checkLabel}>Perokok aktif</label>
              </div>
            )}
            <div style={s.note}>
              Link survey akan aktif selama <strong>1 jam</strong> setelah dibuat.
            </div>
            <button type="submit" disabled={loading} style={{ ...s.submitBtn, background: meta.color }}>
              {loading ? 'Membuat link...' : 'Buat Link Survey'}
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  )
}

const s = {
  wrap: { maxWidth:'520px' },
  pageHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' },
  backLink: { background:'none', border:'none', color:'#888', fontSize:'13px', cursor:'pointer', padding:0 },
  typeBadge: { fontSize:'11px', fontWeight:'600', padding:'3px 10px', borderRadius:'99px', letterSpacing:'0.04em' },
  title: { fontSize:'22px', fontWeight:'700', color:'#1a1a1a', marginBottom:'6px' },
  subtitle: { fontSize:'13px', color:'#888', marginBottom:'20px' },
  formCard: { background:'#fff', borderRadius:'12px', padding:'28px', border:'1px solid #eee' },
  form: { display:'flex', flexDirection:'column', gap:'20px' },
  field: { display:'flex', flexDirection:'column', gap:'6px' },
  label: { fontSize:'13px', fontWeight:'500', color:'#555' },
  input: { padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', color:'#1a1a1a', outline:'none' },
  checkField: { display:'flex', alignItems:'center', gap:'10px' },
  checkbox: { width:'16px', height:'16px', cursor:'pointer' },
  checkLabel: { fontSize:'14px', color:'#333', cursor:'pointer' },
  note: { background:'#FEF3C7', borderRadius:'8px', padding:'12px', fontSize:'13px', color:'#92400E' },
  submitBtn: { padding:'12px', color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor:'pointer' },
  successCard: { background:'#fff', borderRadius:'12px', padding:'40px', border:'1px solid #eee', textAlign:'center' },
  successIcon: { width:'56px', height:'56px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', color:'#059669', margin:'0 auto 16px' },
  successTitle: { fontSize:'20px', fontWeight:'700', color:'#1a1a1a', marginBottom:'8px' },
  successSub: { fontSize:'14px', color:'#888', marginBottom:'20px' },
  linkBox: { background:'#f5f5f5', borderRadius:'8px', padding:'14px 16px', marginBottom:'12px', wordBreak:'break-all' },
  linkText: { fontSize:'13px', color:'#333', fontFamily:'monospace' },
  expireNote: { fontSize:'13px', color:'#D97706', marginBottom:'24px' },
  btnRow: { display:'flex', gap:'12px', justifyContent:'center', marginBottom:'12px' },
  btnRow2: { display:'flex', gap:'12px', justifyContent:'center' },
  waBtn: { padding:'10px 20px', background:'#25D366', color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor:'pointer' },
  copyBtn: { padding:'10px 20px', background:'#f0f0f0', color:'#333', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px', cursor:'pointer' },
  backBtn: { padding:'10px 20px', background:'#f0f0f0', color:'#333', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px', cursor:'pointer' },
  newBtn: { padding:'10px 20px', color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', cursor:'pointer' },
}
