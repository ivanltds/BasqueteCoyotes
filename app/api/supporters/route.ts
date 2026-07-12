import { NextResponse } from 'next/server'
import { getSupabasePublic } from '@/lib/supabase-server'

// GET — Retorna todos os apoiadores (dados públicos apenas)
export async function GET() {
  const sb = getSupabasePublic()
  
  // Ordena alfabeticamente pelo nome para não beneficiar nenhum apoiador individualmente
  const { data, error } = await sb
    .from('supporters')
    .select('id, name, photo_url, link')
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ supporters: data ?? [] })
}
