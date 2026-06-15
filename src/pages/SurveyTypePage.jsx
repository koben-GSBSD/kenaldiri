import { useNavigate } from 'react-router-dom'

export default function SurveyTypePage() {
  const navigate = useNavigate()

  const types = [
    {
      id: 'selling',
      title: 'ProfilKu Finansial',
      subtitle: 'Kenali Tipe Kepribadian Keuanganmu',
      desc: 'Survey untuk memahami karakter finansial, gaya hidup, dan kebutuhan proteksi nasabah. Hasilnya membantu agen merekomendasikan produk yang paling tepat.',
      tag: 'Untuk calon nasabah',
      tagColor: '#7F77DD',
      tagBg: '#EEEDFE',
      icon: '◈',
      iconBg: '#EEEDFE',
      iconColor: '#7F77DD',
      border: '#7F77DD',
      img: '/images/survey-finansial.png',
      path: '/app/survey/new/form?type=selling',
    },
    {
      id: 'recruiting',
      title: 'ProfilKu Peluang',
      subtitle: 'Temukan Potensi Penghasilan Barumu',
      desc: 'Survey untuk mengeksplorasi situasi karir, motivasi finansial, dan kesiapan seseorang membuka peluang penghasilan baru sebagai konsultan keuangan.',
      tag: 'Untuk calon agen',
      tagColor: '#0F6E56',
      tagBg: '#E1F5EE',
      icon: '⟳',
      iconBg: '#E1F5EE',
      iconColor: '#0F6E56',
      border: '#1D9E75',
      img: '/images/survey-karir.png',
      path: '/app/survey/new/form?type=recruiting',
    },
  ]

  return (
    <div style={s.bg}>
      <div style={s.wrap}>
        <div style={s.header}>
          <div style={s.logo}>
            <div style={s.logoMark}>KD</div>
            <div style={s.logoText}>Portal Agen</div>
          </div>
          <h1 style={s.title}>Pilih Jenis Survey</h1>
          <p style={s.sub}>Tentukan tujuan survey sebelum membuat link untuk dikirimkan</p>
        </div>

        <div style={s.grid}>
          {types.map(t => (
            <button key={t.id} onClick={() => navigate(t.path)} style={{ ...s.card, borderTop: `4px solid ${t.border}` }}>
              <div style={{ ...s.cardImg, backgroundImage: `url(${t.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div style={s.cardBody}>
                <span style={{ ...s.tag, color: t.tagColor, background: t.tagBg }}>{t.tag}</span>
                <h2 style={s.cardTitle}>{t.title}</h2>
                <p style={s.cardSub}>{t.subtitle}</p>
                <p style={s.cardDesc}>{t.desc}</p>
                <div style={{ ...s.cta, background: t.border }}>Buat Link Survey →</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const s = {
  bg: { minHeight:'100vh', background:'#f5f5f5', fontFamily:'system-ui,-apple-system,sans-serif', padding:'32px 20px' },
  wrap: { maxWidth:'860px', margin:'0 auto' },
  header: { textAlign:'center', marginBottom:'32px' },
  logo: { display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'24px' },
  logoMark: { width:'36px', height:'36px', background:'#C0392B', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'14px' },
  logoText: { fontSize:'16px', fontWeight:'600', color:'#1a1a1a' },
  title: { fontSize:'26px', fontWeight:'700', color:'#1a1a1a', marginBottom:'8px' },
  sub: { fontSize:'14px', color:'#888' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(340px, 1fr))', gap:'20px' },
  card: { background:'#fff', borderRadius:'12px', border:'1px solid #eee', cursor:'pointer', textAlign:'left', padding:'0', overflow:'hidden', transition:'transform 0.15s, box-shadow 0.15s', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' },
  cardImg: { width:'100%', height:'200px', background:'#f0f0f0' },
  cardBody: { padding:'20px' },
  tag: { display:'inline-block', fontSize:'11px', fontWeight:'600', padding:'3px 10px', borderRadius:'99px', marginBottom:'10px', letterSpacing:'0.04em' },
  cardTitle: { fontSize:'18px', fontWeight:'700', color:'#1a1a1a', marginBottom:'4px' },
  cardSub: { fontSize:'13px', fontWeight:'500', color:'#555', marginBottom:'10px' },
  cardDesc: { fontSize:'13px', color:'#888', lineHeight:1.6, marginBottom:'16px' },
  cta: { padding:'10px 16px', borderRadius:'8px', color:'#fff', fontSize:'13px', fontWeight:'600', textAlign:'center' },
}
