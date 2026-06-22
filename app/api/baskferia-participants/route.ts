import { NextRequest, NextResponse } from 'next/server'
import { getSupabasePublic, getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const sb = getSupabasePublic()
  const { data } = await sb
    .from('baskferia_participants')
    .select('id, name, height, neighborhood, city, edition, year, photo_url')
    .order('created_at', { ascending: true })
  return NextResponse.json({ participants: data ?? [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, height, neighborhood, city, photo_url, photo_public_id,
          rating, story, highlights, improvement_points, suggestions } = body
  if (!name || !height || !neighborhood || !city || !photo_url)
    return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 })

  const sb = getSupabaseAdmin()
  const { error } = await sb.from('baskferia_participants').insert({
    name, height, neighborhood, city,
    photo_url, photo_public_id: photo_public_id ?? null,
    edition: 4, year: 2026,
    rating: rating ?? null,
    story: story ?? null,
    highlights: highlights ?? null,
    improvement_points: improvement_points ?? null,
    suggestions: suggestions ?? null,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
