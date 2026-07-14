import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// GET — Lista todos os atletas/times ranqueados para um torneio
export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const tournamentId = searchParams.get('tournament_id')

  if (!tournamentId) {
    return NextResponse.json({ error: 'tournament_id é obrigatório.' }, { status: 400 })
  }

  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('rankings')
    .select('*, teams(*), representatives(*, teams(*))')
    .eq('tournament_id', tournamentId)
    .order('score', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ rankings: data ?? [] })
}

// POST — Adiciona competidor ao ranking por pontos do torneio
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { tournament_id, team_id, representative_id, score } = body

    if (!tournament_id || (!team_id && !representative_id)) {
      return NextResponse.json({ error: 'Torneio e um competidor (time ou representante) são obrigatórios.' }, { status: 400 })
    }

    const sb = getSupabaseAdmin()

    // Evitar duplicar o mesmo competidor no mesmo ranking de torneio
    const query = sb.from('rankings').select('id').eq('tournament_id', tournament_id)
    if (team_id) query.eq('team_id', team_id)
    if (representative_id) query.eq('representative_id', representative_id)

    const { data: existing } = await query
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Este competidor já está registrado neste ranking.' }, { status: 400 })
    }

    const { data, error } = await sb
      .from('rankings')
      .insert({
        tournament_id,
        team_id: team_id || null,
        representative_id: representative_id || null,
        score: score ? Number(score) : 0,
      })
      .select('*, teams(*), representatives(*, teams(*))')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, ranking: data })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao cadastrar pontuação no ranking.' }, { status: 400 })
  }
}
