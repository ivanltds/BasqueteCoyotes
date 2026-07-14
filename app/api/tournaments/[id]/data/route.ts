import { NextRequest, NextResponse } from 'next/server'
import { getSupabasePublic } from '@/lib/supabase-server'

// GET — Retorna os dados do torneio (seja chaveamento/matches ou classificação/ranking)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sb = getSupabasePublic()

    // 1. Busca as configurações do torneio para validar o formato
    const { data: tournament, error: tourError } = await sb
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (tourError || !tournament) {
      return NextResponse.json({ error: tourError?.message ?? 'Torneio não encontrado ou inativo.' }, { status: 404 })
    }

    // 2. Buscar dados dependendo do formato
    if (tournament.format === 'ranking') {
      const { data: rankings, error: rankError } = await sb
        .from('rankings')
        .select('*, teams(*), representatives(*, teams(*))')
        .eq('tournament_id', id)
        .order('score', { ascending: false })

      if (rankError) {
        return NextResponse.json({ error: rankError.message }, { status: 500 })
      }

      // Formata o retorno para facilitar o consumo no frontend
      const formattedRankings = (rankings ?? []).map((r: any) => ({
        id: r.id,
        score: r.score,
        name: r.representatives?.name || r.teams?.name || 'Competidor',
        photo_url: r.representatives?.photo_url || r.teams?.logo_url || null,
        team_name: r.representatives?.teams?.name || r.teams?.name || null,
        team_logo_url: r.representatives?.teams?.logo_url || r.teams?.logo_url || null,
      }))

      return NextResponse.json({ format: 'ranking', rankings: formattedRankings })
    } else {
      // Formato 'bracket' (chaveamento)
      const { data: matches, error: matchError } = await sb
        .from('matches')
        .select('*, team_1:teams!team_id_1(*), team_2:teams!team_id_2(*), rep_1:representatives!representative_id_1(*, teams(*)), rep_2:representatives!representative_id_2(*, teams(*))')
        .eq('tournament_id', id)
        .order('match_number', { ascending: true })

      if (matchError) {
        return NextResponse.json({ error: matchError.message }, { status: 500 })
      }

      // Mapear para um formato de objeto uniforme para o frontend consumir
      const formattedMatches = (matches ?? []).map((m: any) => {
        const c1 = m.rep_1 
          ? {
              id: m.rep_1.id,
              name: m.rep_1.name,
              photo_url: m.rep_1.photo_url,
              team_name: m.rep_1.teams?.name ?? null,
              team_logo_url: m.rep_1.teams?.logo_url ?? null,
            }
          : m.team_1
          ? {
              id: m.team_1.id,
              name: m.team_1.name,
              photo_url: null,
              team_name: m.team_1.name,
              team_logo_url: m.team_1.logo_url,
            }
          : null

        const c2 = m.rep_2
          ? {
              id: m.rep_2.id,
              name: m.rep_2.name,
              photo_url: m.rep_2.photo_url,
              team_name: m.rep_2.teams?.name ?? null,
              team_logo_url: m.rep_2.teams?.logo_url ?? null,
            }
          : m.team_2
          ? {
              id: m.team_2.id,
              name: m.team_2.name,
              photo_url: null,
              team_name: m.team_2.name,
              team_logo_url: m.team_2.logo_url,
            }
          : null

        return {
          id: m.id,
          match_number: m.match_number,
          stage: m.stage,
          competidor_1: c1,
          competidor_2: c2,
          score_1: m.score_1,
          score_2: m.score_2,
        }
      })

      return NextResponse.json({ format: 'bracket', matches: formattedMatches })
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao processar dados do torneio.' }, { status: 400 })
  }
}
