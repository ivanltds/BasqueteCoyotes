import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// Mapeamento de avanço dos jogos (Single Elimination 8 Competidores)
// match_number -> { nextMatchNumber, position: 1 | 2 }
const NEXT_MATCH_MAP: Record<number, { nextMatchNumber: number; position: 1 | 2 }> = {
  1: { nextMatchNumber: 5, position: 1 },
  2: { nextMatchNumber: 5, position: 2 },
  3: { nextMatchNumber: 6, position: 1 },
  4: { nextMatchNumber: 6, position: 2 },
  5: { nextMatchNumber: 7, position: 1 },
  6: { nextMatchNumber: 7, position: 2 },
}

// PATCH — Atualiza dados e placar de um confronto eliminatório
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const { 
      team_id_1, 
      team_id_2, 
      representative_id_1, 
      representative_id_2, 
      score_1, 
      score_2 
    } = body

    // 1. Validar empates
    const s1 = score_1 !== undefined && score_1 !== null ? Number(score_1) : null
    const s2 = score_2 !== undefined && score_2 !== null ? Number(score_2) : null

    if (s1 !== null && s2 !== null && s1 === s2) {
      return NextResponse.json({ error: 'O basquete não aceita empates. Preencha o placar com o desempate/prorrogação.' }, { status: 400 })
    }

    const sb = getSupabaseAdmin()

    // 2. Buscar o estado atual da partida para sabermos o match_number e tournament_id
    const { data: match, error: fetchError } = await sb
      .from('matches')
      .select('tournament_id, match_number')
      .eq('id', id)
      .single()

    if (fetchError || !match) {
      return NextResponse.json({ error: fetchError?.message ?? 'Partida não encontrada.' }, { status: 404 })
    }

    // 3. Atualizar a partida atual no banco
    const updates: Record<string, any> = {
      team_id_1: team_id_1 || null,
      team_id_2: team_id_2 || null,
      representative_id_1: representative_id_1 || null,
      representative_id_2: representative_id_2 || null,
      score_1: s1,
      score_2: s2,
    }

    const { error: updateError } = await sb
      .from('matches')
      .update(updates)
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // 4. Lógica de Avanço Automático para a próxima fase
    const nextStep = NEXT_MATCH_MAP[match.match_number]
    if (nextStep) {
      let nextWinnerTeamId: string | null = null
      let nextWinnerRepId: string | null = null

      if (s1 !== null && s2 !== null) {
        if (s1 > s2) {
          nextWinnerTeamId = team_id_1 || null
          nextWinnerRepId = representative_id_1 || null
        } else {
          nextWinnerTeamId = team_id_2 || null
          nextWinnerRepId = representative_id_2 || null
        }
      }

      // Monta objeto do UPDATE para o próximo confronto
      const nextMatchUpdates: Record<string, any> = {}
      if (nextStep.position === 1) {
        nextMatchUpdates.team_id_1 = nextWinnerTeamId
        nextMatchUpdates.representative_id_1 = nextWinnerRepId
      } else {
        nextMatchUpdates.team_id_2 = nextWinnerTeamId
        nextMatchUpdates.representative_id_2 = nextWinnerRepId
      }

      // Se o vencedor mudou ou limpou, limpamos também os scores dele dali pra frente
      // Para evitar chaves órfãs, se o vencedor for limpo ou alterado, a partida seguinte
      // deve ter os seus scores limpos para que a chave seja recalculada corretamente.
      nextMatchUpdates.score_1 = null
      nextMatchUpdates.score_2 = null

      // Atualiza o próximo confronto
      await sb
        .from('matches')
        .update(nextMatchUpdates)
        .eq('tournament_id', match.tournament_id)
        .eq('match_number', nextStep.nextMatchNumber)
      
      // Se limpamos a semifinal, precisamos limpar também o time correspondente na final!
      const finalStep = NEXT_MATCH_MAP[nextStep.nextMatchNumber]
      if (finalStep) {
        const finalMatchUpdates: Record<string, any> = {}
        if (finalStep.position === 1) {
          finalMatchUpdates.team_id_1 = null
          finalMatchUpdates.representative_id_1 = null
        } else {
          finalMatchUpdates.team_id_2 = null
          finalMatchUpdates.representative_id_2 = null
        }
        finalMatchUpdates.score_1 = null
        finalMatchUpdates.score_2 = null

        await sb
          .from('matches')
          .update(finalMatchUpdates)
          .eq('tournament_id', match.tournament_id)
          .eq('match_number', finalStep.nextMatchNumber)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao atualizar confronto.' }, { status: 400 })
  }
}
