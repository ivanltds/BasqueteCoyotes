import { NextRequest, NextResponse } from 'next/server'
import { getSupabasePublic } from '@/lib/supabase-server'

// GET — Retorna os dados do torneio (seja chaveamento/matches, classificação/ranking ou grupos)
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

    // 2. Buscar rankings se aplicável (ranking ou groups)
    let formattedRankings: any[] = []
    let groupA: any[] = []
    let groupB: any[] = []

    if (tournament.format === 'ranking' || tournament.format === 'groups') {
      const { data: rankings, error: rankError } = await sb
        .from('rankings')
        .select('*, teams(*), representatives(*, teams(*))')
        .eq('tournament_id', id)
        .order('score', { ascending: false })

      if (rankError) {
        return NextResponse.json({ error: rankError.message }, { status: 500 })
      }

      // Formatar ranking geral
      const allRankings = (rankings ?? []).map((r: any) => ({
        id: r.representatives?.id || r.teams?.id || r.id, // ID real da entidade
        ranking_id: r.id, // ID da linha de ranking
        score: r.score,
        name: r.representatives?.name || r.teams?.name || 'Competidor',
        photo_url: r.representatives?.photo_url || r.teams?.logo_url || null,
        team_name: r.representatives?.teams?.name || r.teams?.name || null,
        team_logo_url: r.representatives?.teams?.logo_url || r.teams?.logo_url || null,
        group_name: r.group_name || null,
      }))

      if (tournament.format === 'groups') {
        groupA = allRankings.filter((r: any) => r.group_name === 'A')
        groupB = allRankings.filter((r: any) => r.group_name === 'B')
      } else {
        formattedRankings = allRankings
      }
    }

    // 3. Buscar matches se aplicável
    let matches: any[] = []
    if (tournament.format === 'bracket' || tournament.format === 'groups' || tournament.format === 'ranking') {
      const { data: matchesData, error: matchError } = await sb
        .from('matches')
        .select('*, team_1:teams!team_id_1(*), team_2:teams!team_id_2(*), rep_1:representatives!representative_id_1(*, teams(*)), rep_2:representatives!representative_id_2(*, teams(*))')
        .eq('tournament_id', id)
        .order('match_number', { ascending: true })

      if (matchError) {
        return NextResponse.json({ error: matchError.message }, { status: 500 })
      }

      matches = (matchesData ?? []).map((m: any) => {
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
    }

    // 4. Lógica de Final Dinâmica para rankings e grupos
    if (tournament.format === 'ranking') {
      const finalMatchIndex = matches.findIndex((m) => m.match_number === 7)
      if (finalMatchIndex !== -1) {
        const fm = matches[finalMatchIndex]
        const c1 = fm.competidor_1 || (formattedRankings[0] ? {
          id: formattedRankings[0].id,
          name: formattedRankings[0].name,
          photo_url: formattedRankings[0].photo_url,
          team_name: formattedRankings[0].team_name,
          team_logo_url: formattedRankings[0].team_logo_url,
        } : null)

        const c2 = fm.competidor_2 || (formattedRankings[1] ? {
          id: formattedRankings[1].id,
          name: formattedRankings[1].name,
          photo_url: formattedRankings[1].photo_url,
          team_name: formattedRankings[1].team_name,
          team_logo_url: formattedRankings[1].team_logo_url,
        } : null)

        matches[finalMatchIndex] = {
          ...fm,
          competidor_1: c1,
          competidor_2: c2,
        }
      }

      return NextResponse.json({
        format: 'ranking',
        rankings: formattedRankings,
        finalMatch: matches.find((m) => m.match_number === 7) || null
      })
    }

    if (tournament.format === 'groups') {
      // 1. Busca os registros de rankings para saber quem é de qual grupo
      const { data: rankings, error: rankError } = await sb
        .from('rankings')
        .select('*, teams(*), representatives(*, teams(*))')
        .eq('tournament_id', id)

      if (rankError) {
        return NextResponse.json({ error: rankError.message }, { status: 500 })
      }

      // Mapear rankings originais
      const allRankings = (rankings ?? []).map((r: any) => ({
        id: r.representatives?.id || r.teams?.id || r.id,
        ranking_id: r.id,
        name: r.representatives?.name || r.teams?.name || 'Competidor',
        photo_url: r.representatives?.photo_url || r.teams?.logo_url || null,
        team_name: r.representatives?.teams?.name || r.teams?.name || null,
        team_logo_url: r.representatives?.teams?.logo_url || r.teams?.logo_url || null,
        group_name: r.group_name || 'A',
      }))

      // Separar confrontos de fase de grupos (1 a 6) e final (7)
      const groupMatches = matches.filter((m) => m.match_number >= 1 && m.match_number <= 6)
      const finalMatchRaw = matches.find((m) => m.match_number === 7) || null

      // Calcular vitórias e pontos de cada participante do ranking na fase de grupos (matches 1 a 6)
      const participantsStats = allRankings.map((r: any) => {
        let wins = 0
        let pointsMade = 0

        groupMatches.forEach((m) => {
          if (m.score_1 !== null && m.score_2 !== null) {
            const isComp1 = m.competidor_1?.id === r.id
            const isComp2 = m.competidor_2?.id === r.id

            if (isComp1) {
              pointsMade += m.score_1
              if (m.score_1 > m.score_2) wins += 1
            } else if (isComp2) {
              pointsMade += m.score_2
              if (m.score_2 > m.score_1) wins += 1
            }
          }
        })

        return {
          ...r,
          wins,
          pointsMade,
          score: wins // Exibe vitórias como score para o frontend
        }
      })

      // Ordenar por vitórias desc, depois pontos feitos desc
      const sortFunction = (a: any, b: any) => {
        if (b.wins !== a.wins) return b.wins - a.wins
        return b.pointsMade - a.pointsMade
      }

      const groupA = participantsStats.filter((p) => p.group_name === 'A').sort(sortFunction)
      const groupB = participantsStats.filter((p) => p.group_name === 'B').sort(sortFunction)

      // Resolver final (Jogo 7) dinamicamente com os líderes calculados de cada grupo
      let finalMatch = finalMatchRaw
      if (finalMatch) {
        const c1 = finalMatch.competidor_1 || (groupA[0] ? {
          id: groupA[0].id,
          name: groupA[0].name,
          photo_url: groupA[0].photo_url,
          team_name: groupA[0].team_name,
          team_logo_url: groupA[0].team_logo_url,
        } : null)

        const c2 = finalMatch.competidor_2 || (groupB[0] ? {
          id: groupB[0].id,
          name: groupB[0].name,
          photo_url: groupB[0].photo_url,
          team_name: groupB[0].team_name,
          team_logo_url: groupB[0].team_logo_url,
        } : null)

        finalMatch = {
          ...finalMatch,
          competidor_1: c1,
          competidor_2: c2,
        }
      }

      return NextResponse.json({
        format: 'groups',
        groupA,
        groupB,
        groupMatches,
        finalMatch
      })
    }

    // Formato padrão bracket
    return NextResponse.json({ format: 'bracket', matches })

  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao processar dados do torneio.' }, { status: 400 })
  }
}
