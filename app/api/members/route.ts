import { NextRequest, NextResponse } from 'next/server'
import { getSupabasePublic, getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const sb = getSupabasePublic()
  const { data } = await sb
    .from('members')
    .select('id, name, height, neighborhood, city, started_month, started_year, photo_url')
    .eq('approved', true)
    .order('created_at', { ascending: true })
  return NextResponse.json({ members: data ?? [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, height, neighborhood, city, started_month, started_year, photo_url, photo_public_id } = body
  if (!name || !height || !neighborhood || !city || !started_month || !started_year || !photo_url)
    return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 })

  const sb = getSupabaseAdmin()
  const { error } = await sb.from('members').insert({
    name, height, neighborhood, city,
    started_month: Number(started_month),
    started_year:  Number(started_year),
    photo_url, photo_public_id: photo_public_id ?? null,
    approved: false,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
