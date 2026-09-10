import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

/**
 * Browser-only Supabase client, or null when the project isn't configured.
 * Null is a supported state: the site then renders the JSON baked in at build
 * time, which is exactly how it behaved before any of this existed.
 */
export function useSupabase(): SupabaseClient | null {
  if (import.meta.server) return null

  const cfg = useRuntimeConfig().public
  const url = cfg.supabaseUrl as string
  const key = cfg.supabaseAnonKey as string
  if (!url || !key) return null

  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true }
    })
  }
  return client
}

export function isLiveConfigured(): boolean {
  const cfg = useRuntimeConfig().public
  return Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey)
}
