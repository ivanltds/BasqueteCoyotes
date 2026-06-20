import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

const GALLERY_BASE = process.env.CLOUDINARY_GALLERY_FOLDER ?? 'coyotes/gallery'

function cloudinaryAuth() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) return null
  return {
    cloudName,
    credentials: Buffer.from(`${apiKey}:${apiSecret}`).toString('base64'),
  }
}

/** GET /api/admin/galleries — lista com contagem de fotos */
export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

  const sb = getSupabaseAdmin()
  const { data: galleries, error } = await sb
    .from('galleries')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Conta fotos de cada galeria via Cloudinary
  const cloud = cloudinaryAuth()
  const withCounts = await Promise.all(
    (galleries ?? []).map(async (g) => {
      if (!cloud) return { ...g, photo_count: 0 }
      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud.cloudName}/resources/search`, {
          method: 'POST',
          headers: { Authorization: `Basic ${cloud.credentials}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ expression: `folder:"${GALLERY_BASE}/${g.folder_slug}"`, max_results: 1 }),
          cache: 'no-store',
        })
        const data = await res.json()
        return { ...g, photo_count: data.total_count ?? 0 }
      } catch { return { ...g, photo_count: 0 } }
    })
  )

  return NextResponse.json({ galleries: withCounts })
}

/** POST /api/admin/galleries — cria galeria */
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

  const { display_name } = await req.json()
  if (!display_name?.trim()) return NextResponse.json({ error: 'Nome obrigatório.' }, { status: 400 })

  // Gera slug a partir do nome (ex: "Treinos 2026" → "treinos-2026")
  const folder_slug = display_name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  // 1. Cria pasta no Cloudinary
  const cloud = cloudinaryAuth()
  if (cloud) {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud.cloudName}/folders/${GALLERY_BASE}/${folder_slug}`,
      { method: 'POST', headers: { Authorization: `Basic ${cloud.credentials}` } }
    )
    if (!res.ok) {
      const err = await res.text()
      // Ignora se pasta já existe (409)
      if (res.status !== 409) {
        console.error('[Galleries] Erro ao criar pasta Cloudinary:', err)
        return NextResponse.json({ error: 'Erro ao criar pasta no Cloudinary.' }, { status: 500 })
      }
    }
  }

  // 2. Persiste no Supabase
  const sb = getSupabaseAdmin()
  const { data: existing } = await sb.from('galleries').select('id').eq('folder_slug', folder_slug).maybeSingle()
  if (existing) return NextResponse.json({ error: 'Já existe uma galeria com esse nome.' }, { status: 409 })

  const { data: maxOrder } = await sb.from('galleries').select('sort_order').order('sort_order', { ascending: false }).limit(1).single()
  const sort_order = (maxOrder?.sort_order ?? -1) + 1

  const { data, error } = await sb.from('galleries').insert({ folder_slug, display_name: display_name.trim(), sort_order }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ gallery: data }, { status: 201 })
}
