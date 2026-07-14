import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// GET — Retorna todas as partidas/confrontos de um torneio específico
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
    .from('matches')
    .select('*, team_1:teams!team_id_1(*), team_2:teams!team_id_2(*), rep_1:representatives!representative_id_1(*, teams(*)), rep_2:representatives!representative_id_2(*, teams(*))')
    .eq('tournament_id', tournamentId)
    .order('match_number', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ matches: data ?? [] })
}
