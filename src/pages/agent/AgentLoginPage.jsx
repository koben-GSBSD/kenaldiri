import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AgentLoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const navigate = useNavigate()

  // Jika sudah login, langsung ke dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/agent/dashboard', { replace: true })
    })
  }, [navigate])

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Email atau password salah.')
      setLoading(false)
      return
    }

    // Cek apakah user terdaftar sebagai agent aktif
    const { data: { user } } = await supabase.auth.getUser()
    const { data: agent } = await supabase
      .from('agents')
      .select('id, is_active, full_name')
      .eq('user_id', user.id)
      .single()

    if (!agent || !agent.is_active) {
      await supabase.auth.signOut()
      setError('Akun tidak aktif. Hubungi Super Admin.')
      setLoading(false)
      return
    }

    navigate('/agent/dashboard', { replace: true })
  }

  return (
    <div style={s.bg}>
      {/* Background pattern */}
      <div style={s.bgPattern} />

      <div style={s.card}>
        {/* Logo */}
        <div style={s.logoWrap}>
          <div style={s.logoBox}>
            <span style={s.logoText}>PRU</span>
          </div>
          <div>
            <div style={s.appName}>PRUActive Agent</div>
            <div style={s.appSub}>oneforlife.id</div>
          </div>
        </div>

        <h1 style={s.heading}>Selamat Datang</h1>
        <p style={s.subheading}>Masuk untuk mengelola aktivitas prospek kamu</p>

        <form onSubmit={handleLogin} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={s.input}
              placeholder="email@domain.com"
              required
              autoFocus
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={s.input}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div style={s.errorBox}>{error}</div>}

          <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? .7 : 1 }}>
            {loading ? 'Masuk...' : 'Masuk →'}
          </button>
        </form>

        <p style={s.footer}>
          Butuh akses? Hubungi Super Admin tim Anda.
        </p>
      </div>
    </div>
  )
}

const s = {
  bg: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2D4A 50%, #1A1A2E 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Inter', system-ui, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  bgPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(237,27,46,0.08) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(237,27,46,0.06) 0%, transparent 40%)`,
    pointerEvents: 'none',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '36px 32px 28px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
    position: 'relative',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '28px',
  },
  logoBox: {
    width: '42px',
    height: '42px',
    background: '#ED1B2E',
    borderRadius: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: '800',
    fontSize: '14px',
    color: 'white',
    letterSpacing: '-0.5px',
  },
  appName: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '16px',
    fontWeight: '700',
    color: '#1A1A2E',
    lineHeight: '1.2',
  },
  appSub: {
    fontSize: '11px',
    color: '#ADB5BD',
    marginTop: '2px',
  },
  heading: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '22px',
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: '4px',
  },
  subheading: {
    fontSize: '13px',
    color: '#6C757D',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#343A40',
  },
  input: {
    padding: '10px 13px',
    borderRadius: '9px',
    border: '1.5px solid #E9ECEF',
    fontSize: '14px',
    outline: 'none',
    color: '#1A1A2E',
    fontFamily: "'Inter', system-ui, sans-serif",
    transition: 'border-color .15s',
  },
  errorBox: {
    background: '#FFF0F1',
    border: '1px solid #FDDDE0',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '13px',
    color: '#C0141F',
  },
  btn: {
    padding: '12px',
    background: '#ED1B2E',
    color: 'white',
    border: 'none',
    borderRadius: '9px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '4px',
    fontFamily: "'Inter', system-ui, sans-serif",
    letterSpacing: '0.2px',
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '11px',
    color: '#ADB5BD',
  },
}
