import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

// Status:
//   'loading'  — belum tahu
//   'ok'       — session valid + agen aktif
//   'unauth'   — tidak ada session / bukan agen terdaftar
//   'inactive' — agen dinonaktifkan admin

export default function AgentGuard() {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let mounted = true

    async function check() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        if (mounted) setStatus('unauth')
        return
      }

      const { data: agent, error } = await supabase
        .from('agents')
        .select('id, is_active')
        .eq('user_id', session.user.id)
        .single()

      if (!mounted) return

      if (error || !agent) {
        await supabase.auth.signOut()
        setStatus('unauth')
        return
      }

      if (!agent.is_active) {
        await supabase.auth.signOut()
        setStatus('inactive')
        return
      }

      setStatus('ok')
    }

    check()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session && mounted) setStatus('unauth')
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (status === 'loading') return <LoadingScreen />

  if (status === 'inactive') return <Navigate to="/agent/login?reason=inactive" replace />

  if (status === 'unauth') return <Navigate to="/agent/login" replace />

  return <Outlet />
}

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: "'Inter', system-ui, sans-serif",
      background: '#f8f9fa',
    }}>
      <div style={{ color: '#aaa', fontSize: '14px' }}>Memuat...</div>
    </div>
  )
}
