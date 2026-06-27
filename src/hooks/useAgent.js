import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAgent() {
  const [agent, setAgent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setAgent(data || null)
      setLoading(false)
    }
    load()
  }, [])

  return { agent, loading }
}
