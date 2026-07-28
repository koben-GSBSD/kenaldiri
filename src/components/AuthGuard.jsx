import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// Status:
//   'loading'  — belum tahu (initial state)
//   'ok'       — session valid + agen aktif
//   'unauth'   — tidak ada session
//   'inactive' — session ada tapi agen dinonaktifkan admin

export default function AuthGuard() {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let mounted = true

    async function check() {
      // 1. Cek session Supabase
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        if (mounted) setStatus('unauth')
        return
      }

      // 2. Cek apakah user terdaftar sebagai agen dan MASIH AKTIF
      //    Ini penting: agen yang di-nonaktifkan admin tidak boleh bisa masuk
      const { data: agent, error } = await supabase
        .from('agents')
        .select('id, is_active')
        .eq('user_id', session.user.id)
        .single()

      if (!mounted) return

      if (error || !agent) {
        // User ada di Supabase Auth tapi tidak terdaftar di tabel agents
        await supabase.auth.signOut()
        setStatus('unauth')
        return
      }

      if (!agent.is_active) {
        // Agen dinonaktifkan — keluarkan dari session
        await supabase.auth.signOut()
        setStatus('inactive')
        return
      }

      setStatus('ok')
    }

    check()

    // Pantau perubahan auth state (mis. session expired atau logout dari tab lain)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && mounted) setStatus('unauth')
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (status === 'loading') return <LoadingScreen />

  if (status === 'inactive') return <Navigate to="/login?reason=inactive" replace />

  if (status === 'unauth') return <Navigate to="/login" replace />

  return <Outlet />
}

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: '#f8f7ff',
    }}>
      <div style={{ color: '#aaa', fontSize: '14px' }}>Memuat...</div>
    </div>
  )
}
