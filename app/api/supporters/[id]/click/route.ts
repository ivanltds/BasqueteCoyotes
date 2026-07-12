import { NextRequest, NextResponse } from 'next/server'
import { getSupabasePublic } from '@/lib/supabase-server'

// POST — Incrementa a contagem de cliques do apoiador (público)
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sb = getSupabasePublic()

    // 1. Busca a contagem atual de cliques
    const { data: current, error: fetchError } = await sb
      .from('supporters')
      .select('clicks_count')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: `Apoiador não encontrado: ${fetchError.message}` }, { status: 404 })
    }

    const currentClicks = current?.clicks_count ?? 0

    // 2. Incrementa o contador em 1
    const { error: updateError } = await sb
      .from('supporters')
      .update({ clicks_count: currentClicks + 1 })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao processar clique.' }, { status: 500 })
  }
}
