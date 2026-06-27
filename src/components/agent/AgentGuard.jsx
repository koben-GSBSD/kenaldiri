import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AgentGuard() {
  const [status, setStatus] = useState('loading') // 'loading' | 'ok' | 'unauth'

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setStatus('unauth'); return }

      // Pastikan user terdaftar di tabel agents dan aktif
      const { data: agent } = await supabase
        .from('agents')
        .select('id, is_active')
        .eq('user_id', session.user.id)
        .single()

      if (!agent || !agent.is_active) { setStatus('unauth'); return }
      setStatus('ok')
    }

    check()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) setStatus('unauth')
    })

    return () => subscription.unsubscribe()
  }, [])

  if (status === 'loading') {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontFamily:'system-ui', background:'#f8f9fa' }}>
        <div style={{ color:'#aaa', fontSize:'14px' }}>Memuat...</div>
      </div>
    )
  }

  if (status === 'unauth') return <Navigate to="/agent/login" replace />

  return <Outlet />
}
