import { NextResponse } from 'next/server'
import { getSupabasePublic } from '@/lib/supabase-server'

// GET — Retorna todos os times participantes em ordem alfabética
export async function GET() {
  const sb = getSupabasePublic()
  
  const { data, error } = await sb
    .from('teams')
    .select('id, name, location, logo_url, team_photo_url, description_short, description_long')
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ teams: data ?? [] })
}
