import { createClient, SupabaseClient } from '@supabase/supabase-js'

const globalForSupabase = globalThis as unknown as { supabaseServer?: SupabaseClient }

function getClient(): SupabaseClient {
  if (globalForSupabase.supabaseServer) return globalForSupabase.supabaseServer

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos')
  }

  const client = createClient(url, key, { auth: { persistSession: false } })

  if (process.env.NODE_ENV !== 'production') {
    globalForSupabase.supabaseServer = client
  }

  return client
}

// Proxy lazy: não inicializa o client até o primeiro uso
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getClient() as any)[prop]
  },
})
