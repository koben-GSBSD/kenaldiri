import { useState } from 'react'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PRODUCTS } from '../data/products'
import AppShell from '../components/AppShell'

export default function ProductsPage() {
  const [agent, setAgent] = useState(null)
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      supabase.from('agents').select('*').eq('user_id', user.id).single().then(({ data }) => setAgent(data))
    })
  }, [])

  return (
    <AppShell agent={agent}>
      <h1 style={s.title}>Produk Prudential</h1>
      <p style={s.subtitle}>Referensi benefit produk untuk membantu percakapan dengan nasabah.</p>
      <div style={s.grid}>
        {Object.values(PRODUCTS).map(p => (
          <div key={p.id} style={{ ...s.card, borderTop: `4px solid ${p.color}` }}>
            <div style={s.cardHeader}>
              <div>
                <div style={{ ...s.category, color: p.colorText, background: p.colorLight }}>{p.category}</div>
                <h2 style={s.productName}>{p.name}</h2>
                <p style={s.tagline}>{p.tagline}</p>
              </div>
            </div>
            <div style={s.highlight}>
              <span style={{ color: p.colorText }}>★</span> {p.highlight}
            </div>
            <div style={s.section}>
              <div style={s.sectionTitle}>Manfaat Utama</div>
              <ul style={s.list}>
                {p.benefits.map((b, i) => (
                  <li key={i} style={s.listItem}>
                    <span style={{ color: p.color, marginRight: '6px' }}>✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div style={s.section}>
              <div style={s.sectionTitle}>Ideal untuk</div>
              <ul style={s.list}>
                {p.idealFor.map((t, i) => (
                  <li key={i} style={s.listItem}>
                    <span style={{ color: '#aaa', marginRight: '6px' }}>→</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <a href={p.url} target="_blank" rel="noreferrer" style={{ ...s.link, background: p.color }}>
              Lihat di Prudential.co.id ↗
            </a>
          </div>
        ))}
      </div>
    </AppShell>
  )
}

const s = {
  title: { fontSize:'22px', fontWeight:'700', color:'#1a1a1a', marginBottom:'8px' },
  subtitle: { fontSize:'14px', color:'#888', marginBottom:'28px' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'20px' },
  card: { background:'#fff', borderRadius:'12px', padding:'24px', border:'1px solid #eee', display:'flex', flexDirection:'column', gap:'16px' },
  cardHeader: {},
  category: { display:'inline-block', fontSize:'11px', fontWeight:'600', padding:'3px 10px', borderRadius:'99px', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em' },
  productName: { fontSize:'18px', fontWeight:'700', color:'#1a1a1a', marginBottom:'4px' },
  tagline: { fontSize:'13px', color:'#888' },
  highlight: { background:'#f8f8f8', borderRadius:'8px', padding:'10px 12px', fontSize:'13px', color:'#333' },
  section: {},
  sectionTitle: { fontSize:'11px', fontWeight:'600', color:'#aaa', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px' },
  list: { listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'6px' },
  listItem: { fontSize:'13px', color:'#444', lineHeight:1.5, display:'flex', alignItems:'flex-start' },
  link: { display:'block', textAlign:'center', padding:'10px', borderRadius:'8px', color:'#fff', textDecoration:'none', fontSize:'13px', fontWeight:'600', marginTop:'auto' },
}
