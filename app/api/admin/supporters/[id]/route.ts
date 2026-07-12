import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// PATCH — Atualiza os dados de um apoiador
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const sb = getSupabaseAdmin()

    const { error } = await sb
      .from('supporters')
      .update(body)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao processar requisição.' }, { status: 400 })
  }
}

// DELETE — Exclui um apoiador
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const { id } = await params
    const sb = getSupabaseAdmin()

    // Opcional: Se tivéssemos a lógica para apagar a foto do Cloudinary direto no backend,
    // faríamos aqui. Mas de acordo com o padrão do projeto, a exclusão da foto no Cloudinary
    // pode ser feita por uma API separada ou mantida para limpeza periódica.
    // Vamos apenas excluir o registro do banco de dados conforme especificado.
    const { error } = await sb
      .from('supporters')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao processar requisição.' }, { status: 400 })
  }
}
