import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verifikasi bahwa caller adalah Super Admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Buat client dengan token caller untuk verifikasi
    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // Cek apakah caller adalah admin
    const { data: { user }, error: authError } = await callerClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: agentData } = await callerClient
      .from('agents')
      .select('is_admin, is_active')
      .eq('user_id', user.id)
      .single()

    if (!agentData?.is_admin || !agentData?.is_active) {
      return new Response(JSON.stringify({ error: 'Forbidden: Super Admin only' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Ambil data dari request body
    const { email, password, full_name } = await req.json()
    if (!email || !password || !full_name) {
      return new Response(JSON.stringify({ error: 'email, password, dan full_name wajib diisi' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ error: 'Password minimal 8 karakter' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Gunakan Service Role Key untuk buat user baru
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // langsung konfirm, tidak perlu email verifikasi
      user_metadata: { full_name }
    })

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update full_name di tabel agents (trigger otomatis buat row, tapi full_name perlu di-set)
    await adminClient
      .from('agents')
      .update({ full_name })
      .eq('user_id', newUser.user.id)

    return new Response(JSON.stringify({
      success: true,
      message: `Akun agen ${full_name} (${email}) berhasil dibuat`,
      user_id: newUser.user.id
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error: ' + err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
