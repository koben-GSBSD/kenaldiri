// ── AgentProdukPage ──
import { useAgent } from '../../hooks/useAgent'
import AgentShell from '../../components/agent/AgentShell'

const PRODUCTS = [
  { id:'paa', name:'PRULink Assurance Account', tagline:'Proteksi + Investasi seumur hidup', icon:'🛡️', color:'#ED1B2E',
    desc:'Produk unit-linked yang memberikan perlindungan jiwa sekaligus pertumbuhan investasi melalui berbagai pilihan dana investasi.',
    tags:['Unit-Link','Investasi','Jiwa'],
    points:['Premi mulai Rp 300.000/bulan','Pilihan 8+ fund investasi','Manfaat jiwa + kesehatan tambahan','Masa perlindungan seumur hidup'],
    target:'Karyawan, professional, pedagang berusia 18–55 tahun' },
  { id:'prc', name:'PRUCinta', tagline:'Proteksi jiwa + tabungan keluarga', icon:'❤️', color:'#1D4ED8',
    desc:'Asuransi jiwa dwiguna yang memberikan manfaat hidup dan meninggal, cocok untuk perencanaan keluarga jangka panjang.',
    tags:['Dwiguna','Tabungan','Keluarga'],
    points:['Uang pertanggungan hingga 100x premi','Nilai tunai bertumbuh','Bisa pinjaman polis','Premi tetap selama polis berjalan'],
    target:'Pasangan muda, keluarga dengan anak, usia 18–50 tahun' },
  { id:'phs', name:'PRUHospital & Surgical', tagline:'Proteksi biaya RS lengkap', icon:'🏥', color:'#059669',
    desc:'Manfaat rawat inap dan bedah komprehensif, menanggung biaya RS termasuk ICU, operasi, dan konsultasi dokter.',
    tags:['Kesehatan','Rawat Inap','Bedah'],
    points:['Kamar VIP hingga Rp 1 juta/malam','ICU, operasi, dokter ditanggung','Cashless di 1.000+ RS rekanan','Bisa sebagai rider tambahan'],
    target:'Semua segmen, terutama yang tidak punya asuransi kesehatan' },
  { id:'ple', name:'PRULink Education', tagline:'Dana pendidikan terproteksi', icon:'🎓', color:'#7C3AED',
    desc:'Solusi perencanaan dana pendidikan anak dengan perlindungan jiwa, memastikan dana pendidikan tetap tersedia.',
    tags:['Pendidikan','Anak','Investasi'],
    points:['Dana cair saat anak masuk SD/SMP/SMA/kuliah','Jika orang tua meninggal, premi bebas','Ilustrasi disesuaikan usia anak','Pilihan mata uang Rp atau USD'],
    target:'Orang tua dengan anak 0–12 tahun' },
  { id:'pci', name:'PRUCritical Illness', tagline:'Perlindungan 34 penyakit kritis', icon:'🌟', color:'#D97706',
    desc:'Memberikan manfaat berupa uang tunai saat terdiagnosa 34 penyakit kritis untuk biaya pengobatan dan kebutuhan hidup.',
    tags:['Penyakit Kritis','Cash Benefit','Jiwa'],
    points:['Cover 34 jenis penyakit kritis','Bayar sekali saat diagnosis','Dana bebas digunakan','Termasuk kanker, jantung, stroke'],
    target:'Usia 18–55 tahun, riwayat keluarga penyakit kritis' },
  { id:'pls', name:'PRULink Syariah', tagline:'Investasi sesuai prinsip syariah', icon:'💰', color:'#CA8A04',
    desc:'Produk unit-linked syariah yang dikelola sesuai prinsip Islam, dengan dana investasi terpisah dari kegiatan yang dilarang.',
    tags:['Syariah','Unit-Link','Investasi'],
    points:['Akad Wakalah bil Ujrah','Dana dikelola secara halal','Surplus underwriting dibagi','Tersedia rider syariah'],
    target:'Nasabah Muslim yang ingin investasi halal' },
]

export function AgentProdukPage() {
  const { agent } = useAgent()
  return (
    <AgentShell agent={agent} pageTitle="Produk Prudential">
      <div style={{ marginBottom:'16px' }}>
        <p style={{ fontSize:'12px', color:'#ADB5BD' }}>Ringkasan produk Prudential untuk referensi agen. Klik kartu untuk melihat detail.</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px' }}>
        {PRODUCTS.map(p => (
          <div key={p.id} style={{ background:'white', borderRadius:'12px', border:'1px solid #E9ECEF', overflow:'hidden', transition:'box-shadow .15s,transform .15s', cursor:'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,.1)'; e.currentTarget.style.transform='translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow=''; e.currentTarget.style.transform='' }}>
            <div style={{ background:p.color, padding:'14px 14px 12px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', bottom:'-20px', right:'-20px', width:'80px', height:'80px', borderRadius:'50%', background:'rgba(255,255,255,.08)' }} />
              <div style={{ fontSize:'22px', marginBottom:'5px' }}>{p.icon}</div>
              <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:'13px', fontWeight:'800', color:'white', lineHeight:'1.2' }}>{p.name}</div>
              <div style={{ fontSize:'10px', color:'rgba(255,255,255,.8)', marginTop:'3px' }}>{p.tagline}</div>
            </div>
            <div style={{ padding:'12px 14px' }}>
              <p style={{ fontSize:'11px', color:'#6C757D', lineHeight:'1.5', marginBottom:'10px' }}>{p.desc}</p>
              <div style={{ marginBottom:'10px' }}>
                {p.points.map((pt, i) => (
                  <div key={i} style={{ display:'flex', gap:'6px', marginBottom:'4px' }}>
                    <span style={{ color:p.color, fontSize:'11px', fontWeight:'700', flexShrink:0 }}>✓</span>
                    <span style={{ fontSize:'11px', color:'#343A40' }}>{pt}</span>
                  </div>
                ))}
              </div>
              <div style={{ background:'#F8F9FA', borderRadius:'6px', padding:'6px 8px', fontSize:'10px', color:'#6C757D' }}>
                <strong style={{ color:'#343A40' }}>Target:</strong> {p.target}
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', marginTop:'8px' }}>
                {p.tags.map(t => (
                  <span key={t} style={{ background:`${p.color}18`, color:p.color, fontSize:'10px', fontWeight:'600', padding:'2px 7px', borderRadius:'10px' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AgentShell>
  )
}

export default AgentProdukPage
