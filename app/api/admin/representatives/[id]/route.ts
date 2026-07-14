import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// Helper para excluir uma imagem física hospedada no Cloudinary
async function destroyCloudinaryImage(publicId: string): Promise<boolean> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) return false

  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
  const body = new URLSearchParams({ public_id: publicId, invalidate: 'true' })

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })
    return res.ok
  } catch (err) {
    console.error(`[Cloudinary Destroy Error representatives] public_id: ${publicId}`, err)
    return false
  }
}

// PATCH — Atualiza os dados de um representante
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const sb = getSupabaseAdmin()

    const { error } = await sb
      .from('representatives')
      .update(body)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao atualizar representante.' }, { status: 400 })
  }
}

// DELETE — Exclui o representante do banco de dados e do Cloudinary
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const { id } = await params
    const sb = getSupabaseAdmin()

    // 1. Busca o public_id da imagem associada
    const { data: rep, error: fetchError } = await sb
      .from('representatives')
      .select('photo_public_id')
      .eq('id', id)
      .single()

    if (fetchError || !rep) {
      return NextResponse.json({ error: fetchError?.message ?? 'Representante não encontrado.' }, { status: 404 })
    }

    // 2. Destrói fisicamente a foto no Cloudinary
    if (rep.photo_public_id) {
      await destroyCloudinaryImage(rep.photo_public_id)
    }

    // 3. Exclui o registro no Supabase
    const { error: deleteError } = await sb
      .from('representatives')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao deletar representante.' }, { status: 400 })
  }
}
