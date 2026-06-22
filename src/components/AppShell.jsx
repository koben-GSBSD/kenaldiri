import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// Inject responsive CSS once
const CSS = `
.kd-wrap { display:flex; min-height:100vh; font-family:system-ui,-apple-system,sans-serif; background:#f7f7f7; }
.kd-sidebar { width:240px; background:#1a1a1a; display:flex; flex-direction:column; justify-content:space-between; flex-shrink:0; position:sticky; top:0; height:100vh; overflow:hidden; }
.kd-side-top { padding:20px 16px; flex:1; overflow-y:auto; }
.kd-brand { display:flex; align-items:center; gap:10px; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.1); }
.kd-brand-mark { width:32px; height:32px; background:#C0392B; border-radius:6px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:13px; flex-shrink:0; }
.kd-brand-label { font-size:14px; font-weight:600; color:#fff; }
.kd-nav { display:flex; flex-direction:column; gap:2px; }
.kd-nav-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; text-decoration:none; font-size:13px; color:rgba(255,255,255,0.6); transition:all 0.15s; }
.kd-nav-item:hover { color:#fff; background:rgba(255,255,255,0.08); }
.kd-nav-item.active { color:#fff; background:rgba(255,255,255,0.12); }
.kd-nav-icon { font-size:16px; width:20px; text-align:center; }
.kd-side-bot { padding:14px 16px; border-top:1px solid rgba(255,255,255,0.1); }
.kd-user-card { display:flex; align-items:flex-start; gap:10px; margin-bottom:10px; padding:10px 12px; background:rgba(255,255,255,0.06); border-radius:8px; }
.kd-avatar { border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; flex-shrink:0; }
.kd-user-name { font-size:13px; font-weight:600; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; }
.kd-user-email { font-size:11px; color:rgba(255,255,255,0.4); margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; }
.kd-admin-badge { display:inline-block; margin-top:4px; background:#C0392B; color:#fff; font-size:9px; font-weight:700; padding:2px 7px; border-radius:4px; letter-spacing:0.06em; text-transform:uppercase; }
.kd-logout { width:100%; padding:8px; background:transparent; border:1px solid rgba(255,255,255,0.15); border-radius:8px; color:rgba(255,255,255,0.5); font-size:12px; cursor:pointer; transition:all 0.15s; }
.kd-logout:hover { background:rgba(255,255,255,0.08); color:#fff; }
.kd-main { flex:1; min-width:0; padding:28px 32px 32px; }
.kd-mobile-header { display:none; position:fixed; top:0; left:0; right:0; z-index:100; background:#1a1a1a; padding:12px 16px; flex-direction:row; align-items:center; justify-content:space-between; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
.kd-hamburger { background:none; border:none; color:#fff; font-size:22px; cursor:pointer; padding:4px 8px; border-radius:6px; line-height:1; }
.kd-overlay { display:none; position:fixed; inset:0; z-index:200; background:rgba(0,0,0,0.6); }
.kd-drawer { position:absolute; top:0; left:0; bottom:0; width:280px; background:#1a1a1a; padding:24px 16px; display:flex; flex-direction:column; gap:16px; overflow-y:auto; }
.kd-drawer-user { display:flex; align-items:center; gap:12px; padding:14px; background:rgba(255,255,255,0.06); border-radius:10px; }
.kd-drawer-item { display:flex; align-items:center; gap:14px; padding:13px 14px; border-radius:8px; text-decoration:none; font-size:15px; color:rgba(255,255,255,0.7); transition:all 0.15s; }
.kd-drawer-item:hover, .kd-drawer-item.active { background:rgba(255,255,255,0.12); color:#fff; }
.kd-drawer-logout { margin-top:8px; padding:12px; background:transparent; border:1px solid rgba(255,255,255,0.2); border-radius:8px; color:rgba(255,255,255,0.6); font-size:14px; cursor:pointer; text-align:left; width:100%; }
.kd-bottom-nav { display:none; position:fixed; bottom:0; left:0; right:0; z-index:100; background:#1a1a1a; flex-direction:row; border-top:1px solid rgba(255,255,255,0.1); padding-bottom:env(safe-area-inset-bottom,0px); }
.kd-bottom-item { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:10px 4px 8px; text-decoration:none; font-size:10px; color:rgba(255,255,255,0.45); gap:3px; transition:color 0.15s; }
.kd-bottom-item.active { color:#C0392B; }
.kd-bottom-icon { font-size:20px; line-height:1; }

@media (max-width: 768px) {
  .kd-sidebar { display:none !important; }
  .kd-mobile-header { display:flex !important; }
  .kd-main { padding:70px 16px 90px !important; }
  .kd-bottom-nav { display:flex !important; }
  .kd-overlay.open { display:block !important; }
}
@media (min-width: 769px) {
  .kd-mobile-header { display:none !important; }
  .kd-bottom-nav { display:none !important; }
  .kd-overlay { display:none !important; }
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

export default function AppShell({ children, agent }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [loggingOut, setLoggingOut] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { injectCSS() }, [])

  async function handleLogout() {
    setLoggingOut(true)
    await supabase.auth.signOut()
    navigate('/login')
  }

  const nav = [
    { path: '/app/dashboard', label: 'Dashboard', icon: '◈' },
    { path: '/app/survey/new', label: 'Survey Baru', icon: '+' },
    { path: '/app/products', label: 'Produk', icon: '⊡' },
    { path: '/app/profiles', label: 'Profil', icon: '★' },
    ...(agent?.is_admin ? [{ path: '/app/admin', label: 'Admin', icon: '⚙' }] : []),
  ]

  const initial = (agent?.full_name?.[0] || agent?.email?.[0] || 'A').toUpperCase()
  const displayName = agent?.full_name || agent?.email?.split('@')[0] || 'Agen'
  const displayEmail = agent?.email || ''
  const isAdmin = !!agent?.is_admin
  const avatarColor = isAdmin ? '#C0392B' : '#4F46E5'

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const UserInfo = ({ size = 'sm' }) => (
    <div className={size === 'lg' ? 'kd-drawer-user' : 'kd-user-card'}>
      <div className="kd-avatar" style={{
        width: size === 'lg' ? '44px' : '34px',
        height: size === 'lg' ? '44px' : '34px',
        fontSize: size === 'lg' ? '18px' : '14px',
        background: avatarColor,
      }}>{initial}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div className="kd-user-name" style={{ fontSize: size === 'lg' ? '15px' : '13px' }}>{displayName}</div>
        <div className="kd-user-email" style={{ maxWidth: size === 'lg' ? '200px' : '140px' }}>{displayEmail}</div>
        {isAdmin && <span className="kd-admin-badge">Super Admin</span>}
      </div>
    </div>
  )

  return (
    <div className="kd-wrap">

      {/* DESKTOP SIDEBAR */}
      <aside className="kd-sidebar">
        <div className="kd-side-top">
          <div className="kd-brand">
            <div className="kd-brand-mark">KD</div>
            <div className="kd-brand-label">Portal Agen</div>
          </div>
          <nav className="kd-nav">
            {nav.map(item => (
              <Link key={item.path} to={item.path}
                className={`kd-nav-item${isActive(item.path) ? ' active' : ''}`}>
                <span className="kd-nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="kd-side-bot">
          <UserInfo size="sm" />
          <button onClick={handleLogout} disabled={loggingOut} className="kd-logout">
            {loggingOut ? 'Keluar...' : 'Keluar'}
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="kd-mobile-header">
        <div className="kd-brand" style={{ margin:0, padding:0, border:'none', gap:'10px' }}>
          <div className="kd-brand-mark">KD</div>
          <div className="kd-brand-label">Portal Agen</div>
        </div>
        <button className="kd-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      <div className={`kd-overlay${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)}>
        <div className="kd-drawer" onClick={e => e.stopPropagation()}>
          <UserInfo size="lg" />
          <nav style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
            {nav.map(item => (
              <Link key={item.path} to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`kd-drawer-item${isActive(item.path) ? ' active' : ''}`}>
                <span style={{ fontSize:'20px', width:'26px', textAlign:'center' }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <button onClick={() => { setMenuOpen(false); handleLogout() }} className="kd-drawer-logout">
            → {loggingOut ? 'Keluar...' : 'Keluar'}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <main className="kd-main">
        {children}
      </main>

      {/* MOBILE BOTTOM NAV */}
      <div className="kd-bottom-nav">
        {nav.map(item => (
          <Link key={item.path} to={item.path}
            className={`kd-bottom-item${isActive(item.path) ? ' active' : ''}`}>
            <span className="kd-bottom-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

    </div>
  )
}
