import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,       // simpan di localStorage, tidak hilang saat tab tutup
    autoRefreshToken: true,     // auto-refresh token sebelum expired
    detectSessionInUrl: true,
    storageKey: 'kenaldiri-session', // key unik agar tidak konflik
  }
})
