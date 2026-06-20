/** Rota pública — lista galerias para o site e upload modal */
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('galleries')
    .select('id, folder_slug, display_name, sort_order')
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ galleries: data ?? [] })
}
