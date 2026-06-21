import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin, getSupabasePublic } from '@/lib/supabase-server'

const VALID_SECTIONS = [
  'hero_main', 'hero_baskferia',
  'person_thiago', 'person_ivan', 'person_geovani',
]

// GET — lista mídia de uma seção (público)
export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get('section')
  if (!section || !VALID_SECTIONS.includes(section)) {
    return NextResponse.json({ error: 'Seção inválida.' }, { status: 400 })
  }

  const sb = getSupabasePublic()
  const { data, error } = await sb
    .from('site_media')
    .select('*')
    .eq('section', section)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ media: data ?? [] })
}

// POST — salva nova mídia após upload no Cloudinary (admin)
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { section, cloudinary_public_id, cloudinary_url, resource_type } = await req.json()

  if (!section || !cloudinary_public_id || !cloudinary_url) {
    return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
  }
  if (!VALID_SECTIONS.includes(section)) {
    return NextResponse.json({ error: 'Seção inválida.' }, { status: 400 })
  }

  const sb = getSupabaseAdmin()

  // Para seções de pessoa (single media): remove a anterior antes de inserir
  if (section.startsWith('person_')) {
    await sb.from('site_media').delete().eq('section', section)
  }

  // Determina sort_order
  const { data: existing } = await sb
    .from('site_media')
    .select('sort_order')
    .eq('section', section)
    .order('sort_order', { ascending: false })
    .limit(1)

  const sort_order = (existing?.[0]?.sort_order ?? -1) + 1

  const { data, error } = await sb
    .from('site_media')
    .insert({ section, cloudinary_public_id, cloudinary_url, resource_type: resource_type ?? 'image', sort_order })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, media: data })
}
