import { createClient } from '@supabase/supabase-js'

/** Client com service role — usar apenas em API Routes de admin */
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Client público (anon key) para Server Components que lêem dados públicos.
 * Usa apenas NEXT_PUBLIC_* vars, que já estão disponíveis em qualquer ambiente.
 */
export function getSupabasePublic() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export interface GalleryRow {
  id: string
  folder_slug: string
  display_name: string
  sort_order: number
  created_at: string
}
