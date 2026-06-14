import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email atau password salah. Hubungi admin jika akun bermasalah.')
      setLoading(false)
      return
    }
    // Check if agent is active
    const { data: agent } = await supabase
      .from('agents')
      .select('is_active')
      .eq('user_id', data.user.id)
      .single()
    if (!agent?.is_active) {
      await supabase.auth.signOut()
      setError('Akun ini telah dinonaktifkan. Hubungi admin.')
      setLoading(false)
      return
    }
    navigate('/app/dashboard')
  }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoMark}>KD</div>
          <div style={styles.logoText}>Portal Agen</div>
        </div>
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={styles.input}
              placeholder="email@domain.com"
              required
              autoFocus
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>
        <p style={styles.footer}>Butuh akses? Hubungi admin tim Anda.</p>
      </div>
    </div>
  )
}

const styles = {
  bg: { minHeight:'100vh', background:'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:'system-ui,-apple-system,sans-serif' },
  card: { background:'#fff', borderRadius:'12px', padding:'40px', width:'100%', maxWidth:'400px', boxShadow:'0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)' },
  logo: { display:'flex', alignItems:'center', gap:'12px', marginBottom:'32px' },
  logoMark: { width:'40px', height:'40px', background:'#C0392B', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'16px' },
  logoText: { fontSize:'18px', fontWeight:'600', color:'#1a1a1a' },
  form: { display:'flex', flexDirection:'column', gap:'16px' },
  field: { display:'flex', flexDirection:'column', gap:'6px' },
  label: { fontSize:'13px', fontWeight:'500', color:'#555' },
  input: { padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', outline:'none', color:'#1a1a1a' },
  error: { background:'#fff5f5', border:'1px solid #feb2b2', borderRadius:'8px', padding:'10px 12px', fontSize:'13px', color:'#c53030' },
  btn: { padding:'12px', background:'#C0392B', color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor:'pointer', marginTop:'4px' },
  footer: { marginTop:'24px', textAlign:'center', fontSize:'12px', color:'#999' },
}
