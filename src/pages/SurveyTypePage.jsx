import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AppShell from '../components/AppShell'

export default function SurveyTypePage() {
  const navigate = useNavigate()
  const [agent, setAgent] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) supabase.from('agents').select('*').eq('user_id', user.id).single().then(({ data }) => setAgent(data))
    })
  }, [])

  const types = [
    {
      id: 'selling',
      title: 'ProfilKu Finansial',
      subtitle: 'Kenali Tipe Kepribadian Keuanganmu',
      desc: 'Survey untuk memahami karakter finansial, gaya hidup, dan kebutuhan proteksi nasabah. Hasilnya membantu agen merekomendasikan produk yang paling tepat.',
      tag: 'Untuk calon nasabah',
      tagColor: '#3C3489', tagBg: '#EEEDFE',
      border: '#7F77DD', btnBg: '#7F77DD',
      img: '/images/survey-finansial.png',
      path: '/app/survey/new/form?type=selling',
    },
    {
      id: 'recruiting',
      title: 'ProfilKu Peluang',
      subtitle: 'Temukan Potensi Penghasilan Barumu',
      desc: 'Survey untuk mengeksplorasi situasi karir, motivasi finansial, dan kesiapan seseorang membuka peluang penghasilan baru sebagai konsultan keuangan.',
      tag: 'Untuk calon agen',
      tagColor: '#085041', tagBg: '#E1F5EE',
      border: '#1D9E75', btnBg: '#1D9E75',
      img: '/images/survey-karir.png',
      path: '/app/survey/new/form?type=recruiting',
    },
  ]

  return (
    <AppShell agent={agent}>
      <div style={s.pageHead}>
        <h1 style={s.title}>Pilih Jenis Survey</h1>
        <p style={s.sub}>Tentukan tujuan survey sebelum membuat link untuk dikirimkan</p>
      </div>
      <div className="kd-type-grid" style={s.grid}>
        {types.map(t => (
          <button key={t.id} onClick={() => navigate(t.path)}
            style={{ ...s.card, borderTop: `4px solid ${t.border}` }}>
            <div className="kd-type-img" style={{ ...s.cardImg, backgroundImage:`url(${t.img})` }} />
            <div style={s.cardBody}>
              <span style={{ ...s.tag, color:t.tagColor, background:t.tagBg }}>{t.tag}</span>
              <h2 style={s.cardTitle}>{t.title}</h2>
              <p style={s.cardSub}>{t.subtitle}</p>
              <p style={s.cardDesc}>{t.desc}</p>
              <div style={{ ...s.cta, background:t.btnBg }}>Buat Link Survey →</div>
            </div>
          </button>
        ))}
      </div>
    </AppShell>
  )
}

const s = {
  pageHead: { textAlign:'center', marginBottom:'28px' },
  title: { fontSize:'22px', fontWeight:'700', color:'#1a1a1a', margin:'0 0 6px' },
  sub: { fontSize:'14px', color:'#888' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'20px' },
  card: { background:'#fff', borderRadius:'12px', border:'1px solid #eee', cursor:'pointer', textAlign:'left', padding:'0', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.06)', transition:'transform 0.15s, box-shadow 0.15s' },
  cardImg: { width:'100%', height:'200px', backgroundSize:'cover', backgroundPosition:'center', background:'#f0f0f0' },
  cardBody: { padding:'18px' },
  tag: { display:'inline-block', fontSize:'11px', fontWeight:'600', padding:'3px 10px', borderRadius:'99px', marginBottom:'8px', letterSpacing:'0.04em' },
  cardTitle: { fontSize:'17px', fontWeight:'700', color:'#1a1a1a', margin:'0 0 3px' },
  cardSub: { fontSize:'13px', fontWeight:'500', color:'#555', margin:'0 0 8px' },
  cardDesc: { fontSize:'13px', color:'#888', lineHeight:1.6, margin:'0 0 14px' },
  cta: { padding:'10px 14px', borderRadius:'8px', color:'#fff', fontSize:'13px', fontWeight:'600', textAlign:'center' },
}
