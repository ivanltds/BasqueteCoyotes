import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// PATCH — Atualiza a pontuação de um competidor no ranking
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const { score } = body

    if (score === undefined || score === null) {
      return NextResponse.json({ error: 'Pontuação (score) é obrigatória.' }, { status: 400 })
    }

    const sb = getSupabaseAdmin()
    const { error } = await sb
      .from('rankings')
      .update({ score: Number(score) })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao atualizar ranking.' }, { status: 400 })
  }
}

// DELETE — Remove um competidor do ranking
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const { id } = await params
    const sb = getSupabaseAdmin()

    const { error } = await sb
      .from('rankings')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao remover ranking.' }, { status: 400 })
  }
}
