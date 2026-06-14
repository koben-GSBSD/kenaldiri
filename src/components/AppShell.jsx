import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AppShell({ children, agent }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await supabase.auth.signOut()
    navigate('/login')
  }

  const nav = [
    { path: '/app/dashboard', label: 'Dashboard', icon: '◈' },
    { path: '/app/survey/new', label: 'Survey Baru', icon: '＋' },
    { path: '/app/products', label: 'Produk', icon: '⊡' },
    ...(agent?.is_admin ? [{ path: '/app/admin', label: 'Admin', icon: '⚙' }] : []),
  ]

  return (
    <div style={s.wrap}>
      <aside style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.brand}>
            <div style={s.brandMark}>KD</div>
            <div style={s.brandLabel}>Portal Agen</div>
          </div>
          <nav style={s.nav}>
            {nav.map(item => (
              <Link key={item.path} to={item.path} style={{
                ...s.navItem,
                ...(location.pathname.startsWith(item.path) ? s.navActive : {})
              }}>
                <span style={s.navIcon}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div style={s.sideBot}>
          <div style={s.agentInfo}>
            <div style={s.avatar}>{agent?.full_name?.[0] || 'A'}</div>
            <div>
              <div style={s.agentName}>{agent?.full_name || 'Agen'}</div>
              <div style={s.agentRole}>{agent?.is_admin ? 'Admin' : 'Agen'}</div>
            </div>
          </div>
          <button onClick={handleLogout} disabled={loggingOut} style={s.logoutBtn}>
            {loggingOut ? '...' : 'Keluar'}
          </button>
        </div>
      </aside>
      <main style={s.main}>{children}</main>
    </div>
  )
}

const s = {
  wrap: { display:'flex', minHeight:'100vh', fontFamily:'system-ui,-apple-system,sans-serif', background:'#f7f7f7' },
  sidebar: { width:'220px', background:'#1a1a1a', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'0', flexShrink:0, position:'sticky', top:0, height:'100vh' },
  sideTop: { padding:'20px 16px' },
  brand: { display:'flex', alignItems:'center', gap:'10px', marginBottom:'28px', paddingBottom:'20px', borderBottom:'1px solid rgba(255,255,255,0.1)' },
  brandMark: { width:'32px', height:'32px', background:'#C0392B', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'13px' },
  brandLabel: { fontSize:'14px', fontWeight:'600', color:'#fff' },
  nav: { display:'flex', flexDirection:'column', gap:'2px' },
  navItem: { display:'flex', alignItems:'center', gap:'10px', padding:'9px 12px', borderRadius:'8px', textDecoration:'none', fontSize:'13px', color:'rgba(255,255,255,0.65)', transition:'all 0.15s' },
  navActive: { background:'rgba(255,255,255,0.1)', color:'#fff' },
  navIcon: { fontSize:'16px', width:'18px', textAlign:'center' },
  sideBot: { padding:'16px', borderTop:'1px solid rgba(255,255,255,0.1)' },
  agentInfo: { display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' },
  avatar: { width:'32px', height:'32px', background:'#C0392B', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'600', fontSize:'13px', flexShrink:0 },
  agentName: { fontSize:'13px', fontWeight:'500', color:'#fff' },
  agentRole: { fontSize:'11px', color:'rgba(255,255,255,0.45)' },
  logoutBtn: { width:'100%', padding:'8px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', color:'rgba(255,255,255,0.65)', fontSize:'12px', cursor:'pointer' },
  main: { flex:1, padding:'32px', minWidth:0 },
}
