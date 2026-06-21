import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// DELETE — remove do Supabase e apaga no Cloudinary
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { id } = await params
  const sb = getSupabaseAdmin()

  // Busca public_id e resource_type antes de deletar
  const { data: row } = await sb.from('site_media').select('cloudinary_public_id, resource_type').eq('id', id).single()

  if (row) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey    = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (cloudName && apiKey && apiSecret) {
      const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
      const resType = row.resource_type === 'video' ? 'video' : 'image'
      const body = new URLSearchParams({ public_id: row.cloudinary_public_id })

      await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resType}/destroy`, {
        method: 'POST',
        headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })
    }
  }

  const { error } = await sb.from('site_media').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

// PATCH — atualiza sort_order
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { id } = await params
  const { sort_order } = await req.json()

  const sb = getSupabaseAdmin()
  const { error } = await sb.from('site_media').update({ sort_order }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
