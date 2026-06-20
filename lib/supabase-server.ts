import { createClient } from '@supabase/supabase-js'

/** Client com service role — usar apenas em Server Components e API Routes */
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface GalleryRow {
  id: string
  folder_slug: string
  display_name: string
  sort_order: number
  created_at: string
}
