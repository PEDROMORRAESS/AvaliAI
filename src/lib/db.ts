import { createClient, SupabaseClient } from '@supabase/supabase-js'

const globalForSupabase = globalThis as unknown as { supabaseServer?: SupabaseClient }

function createServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos')
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  })
}

// Singleton para evitar múltiplas instâncias em dev (hot reload)
export const supabase: SupabaseClient =
  globalForSupabase.supabaseServer ?? createServerClient()

if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.supabaseServer = supabase
}
