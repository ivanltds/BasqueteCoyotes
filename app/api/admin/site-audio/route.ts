import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin, getSupabasePublic } from '@/lib/supabase-server'

const VALID_SECTIONS = ['homepage', 'baskferia']

// GET — lista faixas de uma seção (público, usado pelo player)
export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get('section')
  if (!section || !VALID_SECTIONS.includes(section)) {
    return NextResponse.json({ error: 'Seção inválida.' }, { status: 400 })
  }

  const sb = getSupabasePublic()
  const { data, error } = await sb
    .from('site_audio')
    .select('id, name, cloudinary_url, sort_order')
    .eq('section', section)
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tracks: data ?? [] })
}

// POST — salva nova faixa após upload no Cloudinary (admin)
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { section, name, cloudinary_public_id, cloudinary_url } = await req.json()

  if (!section || !name || !cloudinary_public_id || !cloudinary_url) {
    return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
  }
  if (!VALID_SECTIONS.includes(section)) {
    return NextResponse.json({ error: 'Seção inválida.' }, { status: 400 })
  }

  const sb = getSupabaseAdmin()

  const { data: existing } = await sb
    .from('site_audio')
    .select('sort_order')
    .eq('section', section)
    .order('sort_order', { ascending: false })
    .limit(1)

  const sort_order = (existing?.[0]?.sort_order ?? -1) + 1

  const { data, error } = await sb
    .from('site_audio')
    .insert({ section, name, cloudinary_public_id, cloudinary_url, sort_order })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, track: data })
}
