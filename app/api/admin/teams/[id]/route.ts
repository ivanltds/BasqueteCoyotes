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
    console.error(`[Cloudinary Destroy Error] public_id: ${publicId}`, err)
    return false
  }
}

// PATCH — Atualiza os dados de uma equipe
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const sb = getSupabaseAdmin()

    const { error } = await sb
      .from('teams')
      .update(body)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao atualizar equipe.' }, { status: 400 })
  }
}

// DELETE — Exclui fisicamente o time (Supabase + Cloudinary)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const { id } = await params
    const sb = getSupabaseAdmin()

    // 1. Busca os public_ids das imagens vinculadas
    const { data: team, error: fetchError } = await sb
      .from('teams')
      .select('logo_public_id, team_photo_public_id')
      .eq('id', id)
      .single()

    if (fetchError || !team) {
      return NextResponse.json({ error: fetchError?.message ?? 'Equipe não encontrada.' }, { status: 404 })
    }

    // 2. Apaga as mídias do Cloudinary
    const destructions: Promise<boolean>[] = []
    if (team.logo_public_id) {
      destructions.push(destroyCloudinaryImage(team.logo_public_id))
    }
    if (team.team_photo_public_id) {
      destructions.push(destroyCloudinaryImage(team.team_photo_public_id))
    }
    await Promise.all(destructions)

    // 3. Exclui o registro da tabela no Supabase
    const { error: deleteError } = await sb
      .from('teams')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao deletar equipe.' }, { status: 400 })
  }
}
