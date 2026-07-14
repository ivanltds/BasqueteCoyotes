'use client'

import { useEffect, useState, useCallback } from 'react'

export interface Tournament {
  id: string
  name: string
  is_active: boolean
  format: 'bracket' | 'ranking'
}

interface Competidor {
  id: string
  name: string
  photo_url: string | null
  team_name: string | null
  team_logo_url: string | null
}

interface Match {
  id: string
  match_number: number
  stage: 'quarterfinals' | 'semifinals' | 'final'
  competidor_1: Competidor | null
  competidor_2: Competidor | null
  score_1: number | null
  score_2: number | null
}

interface RankingItem {
  id: string
  score: number
  name: string
  photo_url: string | null
  team_name: string | null
  team_logo_url: string | null
}

interface Props {
  initialTournaments: Tournament[]
}

export default function BaskferiaTournamentsSection({ initialTournaments }: Props) {
  const [tournaments] = useState<Tournament[]>(initialTournaments)
  const [activeTab, setActiveTab] = useState<string>(initialTournaments[0]?.id || '')
  const [loading, setLoading] = useState(false)
  const [format, setFormat] = useState<'bracket' | 'ranking'>('bracket')
  const [matches, setMatches] = useState<Match[]>([])
  const [rankings, setRankings] = useState<RankingItem[]>([])
  const [mobileStage, setMobileStage] = useState<'quarterfinals' | 'semifinals' | 'final'>('quarterfinals')

  const loadData = useCallback(async (tourId: string) => {
    if (!tourId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/tournaments/${tourId}/data`)
      const d = await res.json()
      setFormat(d.format)
      if (d.format === 'ranking') {
        setRankings(d.rankings ?? [])
        setMatches([])
      } else {
        setMatches(d.matches ?? [])
        setRankings([])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData(activeTab)
  }, [activeTab, loadData])

  // Identificar quem já foi eliminado em qualquer partida concluída do torneio
  const lostIds = new Set<string>()
  matches.forEach((m) => {
    if (m.score_1 !== null && m.score_2 !== null) {
      if (m.score_1 > m.score_2) {
        if (m.competidor_2) lostIds.add(m.competidor_2.id)
      } else if (m.score_2 > m.score_1) {
        if (m.competidor_1) lostIds.add(m.competidor_1.id)
      }
    }
  })

  // Helper para renderizar o slot do competidor
  function renderCompetidor(comp: Competidor | null, score: number | null, isWinner: boolean) {
    if (!comp) {
      return (
        <div className="flex items-center justify-between bg-b-dark/40 border border-dashed border-b-stone/20 p-3 h-16">
          <span className="font-mono text-xs text-gray-600 uppercase tracking-widest">// em breve</span>
        </div>
      )
    }

    const hasLost = lostIds.has(comp.id)

    return (
      <div 
        className={`flex items-center justify-between p-3 h-16 border transition-colors ${
          hasLost 
            ? 'bg-b-dark/20 border-b-stone/20 grayscale opacity-45' 
            : isWinner
            ? 'bg-b-neon/5 border-b-neon text-b-neon'
            : 'bg-b-gray border-b-stone/30 text-white'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {comp.photo_url ? (
            <div className="relative w-12 h-12 shrink-0">
              <img 
                src={comp.photo_url} 
                alt={comp.name} 
                className="w-full h-full object-cover border border-b-stone/20 rounded" 
              />
              {comp.team_logo_url && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-b-dark/90 p-0.5 rounded border border-b-stone/30 flex items-center justify-center">
                  <img 
                    src={comp.team_logo_url} 
                    alt="Time" 
                    className="max-w-full max-h-full object-contain" 
                  />
                </div>
              )}
            </div>
          ) : comp.team_logo_url ? (
            <img 
              src={comp.team_logo_url} 
              alt={comp.name} 
              className="w-12 h-12 object-contain shrink-0" 
            />
          ) : null}
          <div className="min-w-0 leading-tight">
            <p className="font-display text-sm uppercase truncate">{comp.name}</p>
            {comp.photo_url && comp.team_name && (
              <span className="font-mono text-[9px] text-gray-500 uppercase tracking-wider block">
                🛡️ {comp.team_name}
              </span>
            )}
          </div>
        </div>
        <div className="font-display text-xl px-2">
          {score !== null ? score : '-'}
        </div>
      </div>
    )
  }

  // Helper para renderizar a partida inteira
  function renderMatch(matchNum: number) {
    const match = matches.find(m => m.match_number === matchNum)
    if (!match) return null

    const hasScores = match.score_1 !== null && match.score_2 !== null
    const isWinner1 = hasScores && match.score_1! > match.score_2!
    const isWinner2 = hasScores && match.score_2! > match.score_1!

    return (
      <div className="bg-b-gray/30 border-2 border-b-stone/30 shadow-md">
        <div className="bg-b-dark px-3 py-1 border-b border-b-stone/20 flex justify-between items-center">
          <span className="font-mono text-[9px] text-gray-500 uppercase tracking-wider">Jogo {matchNum}</span>
          {match.stage === 'final' && (
            <span className="font-mono text-[9px] text-b-orange font-bold uppercase tracking-widest">🏆 Final</span>
          )}
        </div>
        <div className="divide-y divide-b-stone/20">
          {renderCompetidor(match.competidor_1, match.score_1, isWinner1)}
          {renderCompetidor(match.competidor_2, match.score_2, isWinner2)}
        </div>
      </div>
    )
  }

  if (tournaments.length === 0) return null

  return (
    <section className="py-24 border-t border-t-stone/30 bg-b-dark px-6 md:px-20 noise-overlay">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabeçalho da seção */}
        <div className="mb-12 text-center">
          <span className="font-mono text-b-neon uppercase tracking-[0.3em] text-xs mb-2 block">
            // tabela e chaveamento
          </span>
          <h2 className="font-display text-5xl md:text-7xl uppercase text-white leading-none">
            Resultados & <span className="text-stroke-neon">Confrontos</span>
          </h2>
        </div>

        {/* Abas dos Torneios Ativos */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {tournaments.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`font-display text-lg md:text-xl uppercase px-6 py-3 tracking-wider transition-all border-2 ${
                activeTab === t.id
                  ? 'bg-b-neon text-b-dark border-b-neon shadow-brutal-org'
                  : 'bg-b-gray text-gray-400 border-b-stone/30 hover:text-white'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <span className="font-mono text-xs text-b-neon uppercase tracking-widest animate-pulse">
              Carregando dados do torneio...
            </span>
          </div>
        ) : format === 'ranking' ? (
          /* ── LAYOUT DE RANKING (TABELA POR PONTOS) ── */
          <div className="max-w-3xl mx-auto">
            {rankings.length === 0 ? (
              <div className="border border-dashed border-b-stone p-12 text-center bg-b-gray/20">
                <p className="font-mono text-gray-600 text-sm uppercase">Nenhum competidor pontuou ainda</p>
                <p className="font-mono text-[10px] text-gray-700 uppercase mt-2">// pontuações em breve 🐾</p>
              </div>
            ) : (
              <div className="border-2 border-b-stone/30 bg-b-gray shadow-brutal-org">
                <div className="grid grid-cols-12 bg-b-dark text-gray-500 font-mono text-xs uppercase px-6 py-3 border-b border-b-stone/30 tracking-wider">
                  <div className="col-span-2">Pos</div>
                  <div className="col-span-7">Competidor</div>
                  <div className="col-span-3 text-right">Pontos</div>
                </div>
                <div className="divide-y divide-b-stone/20">
                  {rankings.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-12 items-center px-6 py-4 hover:bg-b-neon/[0.02] transition-colors">
                      {/* Posição */}
                      <div className="col-span-2 font-display text-2xl text-white">
                        {idx + 1}º
                      </div>
                      
                      {/* Competidor */}
                      <div className="col-span-7 flex items-center gap-3">
                        {item.photo_url ? (
                          <div className="relative w-14 h-14 shrink-0">
                            <img 
                              src={item.photo_url} 
                              alt={item.name} 
                              className="w-full h-full object-cover border border-b-stone/20 rounded" 
                            />
                            {item.team_logo_url && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-b-dark/95 p-0.5 rounded border border-b-stone/30 flex items-center justify-center">
                                <img 
                                  src={item.team_logo_url} 
                                  alt="Time" 
                                  className="max-w-full max-h-full object-contain" 
                                />
                              </div>
                            )}
                          </div>
                        ) : item.team_logo_url ? (
                          <img 
                            src={item.team_logo_url} 
                            alt={item.name} 
                            className="w-14 h-14 object-contain shrink-0" 
                          />
                        ) : null}
                        <div>
                          <p className="font-display text-lg uppercase text-white leading-tight">{item.name}</p>
                          {item.photo_url && item.team_name && (
                            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1 block">
                              🛡️ {item.team_name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pontuação */}
                      <div className="col-span-3 text-right font-display text-3xl text-b-orange">
                        {item.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── LAYOUT DE CHAVEAMENTO (BRACKET) ── */
          <div>
            {matches.length === 0 ? (
              <div className="border border-dashed border-b-stone p-12 text-center bg-b-gray/20">
                <p className="font-mono text-gray-600 text-sm uppercase">Chaves indisponíveis</p>
              </div>
            ) : (
              <div>
                {/* ── DESIGN DESKTOP (ÁRVORE DE CONFRONTOS) ── */}
                <div className="hidden lg:grid lg:grid-cols-3 lg:gap-12 lg:items-center relative max-w-5xl mx-auto py-8">
                  {/* QUARTAS DE FINAL */}
                  <div className="space-y-12">
                    <div className="mb-4 text-center md:text-left border-b border-b-stone/20 pb-2">
                      <h4 className="font-display text-xl uppercase text-b-orange tracking-wider">Quartas de Final</h4>
                    </div>
                    <div className="space-y-10">
                      {renderMatch(1)}
                      {renderMatch(2)}
                      {renderMatch(3)}
                      {renderMatch(4)}
                    </div>
                  </div>

                  {/* SEMIFINAIS */}
                  <div className="space-y-36 relative">
                    <div className="absolute top-[-44px] left-0 right-0 text-center border-b border-b-stone/20 pb-2">
                      <h4 className="font-display text-xl uppercase text-b-neon tracking-wider">Semifinais</h4>
                    </div>
                    <div className="space-y-32">
                      {renderMatch(5)}
                      {renderMatch(6)}
                    </div>
                  </div>

                  {/* FINAL */}
                  <div className="space-y-10 relative">
                    <div className="absolute top-[-44px] left-0 right-0 text-center border-b border-b-stone/20 pb-2">
                      <h4 className="font-display text-xl uppercase text-white tracking-wider">Grande Final</h4>
                    </div>
                    {renderMatch(7)}
                  </div>
                </div>

                {/* ── DESIGN MOBILE (VERSÃO POR ABAS) ── */}
                <div className="lg:hidden max-w-md mx-auto space-y-6">
                  {/* Sub-abas de etapa */}
                  <div className="grid grid-cols-3 border-b border-b-stone/30">
                    {(['quarterfinals', 'semifinals', 'final'] as const).map((stage) => {
                      const labels = {
                        quarterfinals: 'Quartas',
                        semifinals: 'Semifinais',
                        final: 'Final',
                      }
                      return (
                        <button
                          key={stage}
                          onClick={() => setMobileStage(stage)}
                          className={`font-mono text-xs uppercase py-3 border-b-2 tracking-wider ${
                            mobileStage === stage
                              ? 'border-b-neon text-b-neon font-bold'
                              : 'border-b-transparent text-gray-500'
                          }`}
                        >
                          {labels[stage]}
                        </button>
                      )
                    })}
                  </div>

                  {/* Listagem de jogos da etapa selecionada */}
                  <div className="space-y-4">
                    {matches
                      .filter((m) => m.stage === mobileStage)
                      .map((match) => (
                        <div key={match.id}>
                          {renderMatch(match.match_number)}
                        </div>
                      ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </section>
  )
}
