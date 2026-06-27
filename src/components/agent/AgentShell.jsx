import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap');

.pa-wrap { display:flex; min-height:100vh; font-family:'Inter',system-ui,sans-serif; background:#F8F9FA; }

/* SIDEBAR */
.pa-sidebar { width:240px; background:#1A1A2E; display:flex; flex-direction:column; position:fixed; top:0; left:0; height:100vh; z-index:100; transition:transform .3s ease; flex-shrink:0; }
.pa-sidebar.pa-collapsed { transform:translateX(-240px); }

.pa-logo { padding:16px 14px; border-bottom:1px solid rgba(255,255,255,.08); display:flex; align-items:center; justify-content:space-between; }
.pa-logo-badge { display:flex; align-items:center; gap:10px; }
.pa-logo-icon { width:34px; height:34px; background:#ED1B2E; border-radius:9px; display:flex; align-items:center; justify-content:center; font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; color:white; font-size:12px; flex-shrink:0; }
.pa-logo-text { font-family:'Plus Jakarta Sans',sans-serif; font-weight:700; font-size:12px; color:white; line-height:1.2; }
.pa-logo-text span { display:block; font-weight:400; font-size:10px; color:rgba(255,255,255,.38); letter-spacing:.5px; }
.pa-collapse-btn { width:26px; height:26px; border-radius:7px; background:rgba(255,255,255,.08); border:none; color:rgba(255,255,255,.5); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:12px; }
.pa-collapse-btn:hover { background:rgba(255,255,255,.16); color:white; }

.pa-agent-card { padding:12px 14px; border-bottom:1px solid rgba(255,255,255,.08); display:flex; align-items:center; gap:9px; }
.pa-avatar { width:32px; height:32px; border-radius:50%; background:#ED1B2E; display:flex; align-items:center; justify-content:center; font-weight:700; color:white; font-size:11px; flex-shrink:0; }
.pa-avatar.admin { background:#D4A843; }
.pa-agent-name { font-size:12px; font-weight:600; color:white; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; }
.pa-agent-role { font-size:10px; color:rgba(255,255,255,.38); margin-top:1px; }
.pa-admin-badge { display:inline-block; margin-top:3px; background:#ED1B2E; color:white; font-size:9px; font-weight:700; padding:1px 6px; border-radius:4px; letter-spacing:.06em; text-transform:uppercase; }

.pa-nav { flex:1; padding:10px 8px; overflow-y:auto; }
.pa-nav-section { font-size:9px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:rgba(255,255,255,.22); padding:8px 8px 4px; margin-top:6px; }
.pa-nav-item { display:flex; align-items:center; gap:9px; padding:9px 10px; border-radius:8px; cursor:pointer; color:rgba(255,255,255,.5); font-size:13px; font-weight:500; margin-bottom:1px; text-decoration:none; transition:background .15s,color .15s; }
.pa-nav-item:hover { background:rgba(255,255,255,.07); color:white; }
.pa-nav-item.active { background:#ED1B2E; color:white; }
.pa-nav-icon { font-size:15px; flex-shrink:0; width:18px; text-align:center; }
.pa-nav-badge { margin-left:auto; font-size:10px; font-weight:700; padding:2px 6px; border-radius:10px; min-width:18px; text-align:center; background:rgba(255,255,255,.15); color:white; }
.pa-nav-item.active .pa-nav-badge { background:rgba(255,255,255,.28); }
.pa-nav-badge.green { background:#12B76A; }

.pa-sidebar-bot { padding:10px 8px; border-top:1px solid rgba(255,255,255,.08); }
.pa-logout-btn { width:100%; padding:8px; background:transparent; border:1px solid rgba(255,255,255,.14); border-radius:8px; color:rgba(255,255,255,.45); font-size:12px; cursor:pointer; transition:all .15s; text-align:left; }
.pa-logout-btn:hover { background:rgba(255,255,255,.08); color:white; }

/* MAIN */
.pa-main { margin-left:240px; flex:1; display:flex; flex-direction:column; min-width:0; transition:margin-left .3s ease; }
.pa-main.pa-expanded { margin-left:0; }

/* TOPBAR */
.pa-topbar { background:white; border-bottom:1px solid #E9ECEF; padding:0 16px 0 12px; height:54px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:90; gap:10px; }
.pa-topbar-left { display:flex; align-items:center; gap:10px; min-width:0; flex:1; }
.pa-menu-btn { width:34px; height:34px; border-radius:8px; border:1px solid #E9ECEF; background:white; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
.pa-menu-btn:hover { background:#F1F3F5; }
.pa-page-title { font-family:'Plus Jakarta Sans',sans-serif; font-size:15px; font-weight:700; color:#1A1A2E; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.pa-page-date { font-size:10px; color:#ADB5BD; margin-top:1px; }
.pa-topbar-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }

/* NOTIF BUTTON */
.pa-notif-btn { position:relative; width:34px; height:34px; border-radius:50%; border:1px solid #E9ECEF; background:white; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:15px; }
.pa-notif-dot { position:absolute; top:5px; right:6px; width:8px; height:8px; background:#ED1B2E; border-radius:50%; border:2px solid white; }

/* NOTIF PANEL */
.pa-notif-panel { position:fixed; top:54px; right:0; width:300px; background:white; border-left:1px solid #E9ECEF; border-bottom:1px solid #E9ECEF; border-radius:0 0 0 12px; z-index:150; box-shadow:-4px 4px 20px rgba(0,0,0,.08); transform:translateX(100%); transition:transform .25s; max-height:calc(100vh - 54px); overflow-y:auto; }
.pa-notif-panel.open { transform:translateX(0); }
.pa-notif-head { padding:12px 14px; border-bottom:1px solid #E9ECEF; display:flex; justify-content:space-between; align-items:center; position:sticky; top:0; background:white; }
.pa-notif-title { font-weight:700; font-size:13px; color:#1A1A2E; }
.pa-notif-clear { font-size:11px; color:#ED1B2E; cursor:pointer; font-weight:600; background:none; border:none; }
.pa-notif-item { padding:11px 14px; border-bottom:1px solid #F1F3F5; display:flex; gap:9px; cursor:pointer; }
.pa-notif-item:hover { background:#F8F9FA; }
.pa-notif-item.unread { background:#FFF0F1; }
.pa-notif-icon { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; }
.pa-notif-text { font-size:11px; color:#343A40; line-height:1.4; }
.pa-notif-text strong { color:#1A1A2E; }
.pa-notif-when { font-size:10px; color:#ADB5BD; margin-top:2px; }

/* CONTENT */
.pa-content { padding:20px 20px; flex:1; min-width:0; }

/* OVERLAY mobile */
.pa-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:99; }
.pa-overlay.open { display:block; }

/* BTN */
.pa-btn { display:inline-flex; align-items:center; gap:5px; padding:7px 14px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; border:none; transition:all .15s; white-space:nowrap; font-family:'Inter',sans-serif; }
.pa-btn-red { background:#ED1B2E; color:white; }
.pa-btn-red:hover { background:#C0141F; }
.pa-btn-outline { background:white; border:1px solid #E9ECEF; color:#343A40; }
.pa-btn-outline:hover { background:#F1F3F5; }
.pa-btn-sm { padding:5px 10px; font-size:11px; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .pa-sidebar { transform:translateX(-240px); }
  .pa-sidebar.pa-mobile-open { transform:translateX(0); }
  .pa-main { margin-left:0 !important; }
  .pa-content { padding:12px; }
}
@media (max-width: 480px) {
  .pa-page-date { display:none; }
  .pa-notif-panel { width:100vw; }
}

/* scrollbar */
.pa-nav::-webkit-scrollbar { width:3px; }
.pa-nav::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:2px; }
`

let cssInjected = false
function injectCSS() {
  if (cssInjected) return
  const s = document.createElement('style')
  s.textContent = CSS
  document.head.appendChild(s)
  cssInjected = true
}

export default function AgentShell({ children, agent, pageTitle, onAddProspek, notifCount = 0 }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [reminders, setReminders] = useState([])

  useEffect(() => { injectCSS() }, [])

  // Load today's reminders for notification panel
  useEffect(() => {
    if (!agent) return
    async function loadReminders() {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const end   = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()
      const { data } = await supabase
        .from('reminders')
        .select('*, prospects(full_name, stage)')
        .eq('agent_id', agent.id)
        .eq('is_done', false)
        .gte('remind_at', start)
        .lt('remind_at', end)
        .order('remind_at', { ascending: true })
        .limit(10)
      setReminders(data || [])
    }
    loadReminders()
  }, [agent])

  async function handleLogout() {
    setLoggingOut(true)
    await supabase.auth.signOut()
    navigate('/agent/login')
  }

  function toggleSidebar() {
    const isMobile = window.innerWidth <= 768
    if (isMobile) { setMobileOpen(m => !m) }
    else { setCollapsed(c => !c) }
  }

  const isActive = (path) => location.pathname === path

  const nav = [
    { path: '/agent/dashboard', label: 'Dashboard',     icon: '📊', section: null },
    { path: '/agent/prospek',   label: 'List Prospek',  icon: '👥', badge: null, section: 'Menu Utama' },
    { path: '/agent/pipeline',  label: 'Pipeline FU',   icon: '🎯', badge: null },
    { path: '/agent/reminder',  label: 'Reminder',      icon: '🔔', badge: reminders.length || null },
    { path: '/agent/rekap',     label: 'Rekap Bulanan', icon: '📈', section: 'Laporan & Info' },
    { path: '/agent/produk',    label: 'Produk PRU',    icon: '📋' },
    { path: '/agent/kenaldiri', label: 'KenalDiri Survey', icon: '🔗', section: 'Integrasi', badgeGreen: true },
  ]

  const initial = (agent?.full_name?.[0] || 'A').toUpperCase()
  const isAdmin = !!agent?.is_admin
  const today = new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
  const todayRemCount = reminders.length

  return (
    <div className="pa-wrap">
      {/* OVERLAY mobile */}
      <div className={`pa-overlay${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)} />

      {/* SIDEBAR */}
      <aside className={`pa-sidebar${collapsed ? ' pa-collapsed' : ''}${mobileOpen ? ' pa-mobile-open' : ''}`}>
        <div className="pa-logo">
          <div className="pa-logo-badge">
            <div className="pa-logo-icon">PRU</div>
            <div className="pa-logo-text">PRUActive<span>AGENT TOOLS</span></div>
          </div>
          <button className="pa-collapse-btn" onClick={toggleSidebar} title="Tutup menu">◀</button>
        </div>

        <div className="pa-agent-card">
          <div className={`pa-avatar${isAdmin ? ' admin' : ''}`}>{initial}</div>
          <div style={{ minWidth:0 }}>
            <div className="pa-agent-name">{agent?.full_name || '...'}</div>
            <div className="pa-agent-role">{agent?.email || ''}</div>
            {isAdmin && <span className="pa-admin-badge">Super Admin</span>}
          </div>
        </div>

        <nav className="pa-nav">
          {nav.map((item, i) => (
            <div key={item.path}>
              {item.section && <div className="pa-nav-section">{item.section}</div>}
              {i === 0 && <div className="pa-nav-section">Menu Utama</div>}
              <Link
                to={item.path}
                className={`pa-nav-item${isActive(item.path) ? ' active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="pa-nav-icon">{item.icon}</span>
                {item.label}
                {(item.badge || item.badgeGreen) && (
                  <span className={`pa-nav-badge${item.badgeGreen ? ' green' : ''}`}>
                    {item.badge || '●'}
                  </span>
                )}
              </Link>
            </div>
          ))}
        </nav>

        <div className="pa-sidebar-bot">
          <button className="pa-logout-btn" onClick={handleLogout} disabled={loggingOut}>
            🚪 {loggingOut ? 'Keluar...' : 'Keluar'}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className={`pa-main${collapsed ? ' pa-expanded' : ''}`}>
        {/* TOPBAR */}
        <header className="pa-topbar">
          <div className="pa-topbar-left">
            <button className="pa-menu-btn" onClick={toggleSidebar}>☰</button>
            <div>
              <div className="pa-page-title">{pageTitle || 'PRUActive'}</div>
              <div className="pa-page-date">{today}{todayRemCount > 0 ? ` · ${todayRemCount} reminder hari ini` : ''}</div>
            </div>
          </div>
          <div className="pa-topbar-right">
            <button className="pa-notif-btn" onClick={(e) => { e.stopPropagation(); setNotifOpen(o => !o) }}>
              🔔
              {todayRemCount > 0 && <span className="pa-notif-dot" />}
            </button>
            {onAddProspek && (
              <button className="pa-btn pa-btn-red" onClick={onAddProspek}>+ Prospek</button>
            )}
          </div>
        </header>

        {/* NOTIF PANEL */}
        <div className={`pa-notif-panel${notifOpen ? ' open' : ''}`}>
          <div className="pa-notif-head">
            <span className="pa-notif-title">🔔 Notifikasi</span>
            <button className="pa-notif-clear" onClick={() => setNotifOpen(false)}>Tutup</button>
          </div>
          {reminders.length === 0 ? (
            <div style={{ padding:'20px', textAlign:'center', fontSize:'12px', color:'#ADB5BD' }}>
              Tidak ada reminder hari ini
            </div>
          ) : reminders.map(r => (
            <div key={r.id} className="pa-notif-item unread" onClick={() => { navigate('/agent/reminder'); setNotifOpen(false) }}>
              <div className="pa-notif-icon" style={{ background:'#FFFBEB' }}>⏰</div>
              <div>
                <div className="pa-notif-text">
                  <strong>Reminder {r.prospects?.stage?.replace('_',' ').toUpperCase()}</strong> — {r.prospects?.full_name}
                </div>
                <div className="pa-notif-text">{r.label || 'Follow-up terjadwal'}</div>
                <div className="pa-notif-when">{new Date(r.remind_at).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CONTENT */}
        <main className="pa-content" onClick={() => setNotifOpen(false)}>
          {children}
        </main>
      </div>
    </div>
  )
}
