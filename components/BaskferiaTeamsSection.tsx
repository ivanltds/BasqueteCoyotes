'use client'

import { useState } from 'react'

export interface Team {
  id: string
  name: string
  location: string
  logo_url: string
  team_photo_url: string
  description_short: string
  description_long: string
}

interface Props {
  teams: Team[]
}

export default function BaskferiaTeamsSection({ teams }: Props) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  return (
    <section className="py-20 border-t border-t-stone/30 bg-b-dark px-6 md:px-20">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center md:text-left">
          <span className="font-mono text-b-neon uppercase tracking-[0.3em] text-xs mb-2 block">
            // equipes de elite
          </span>
          <h2 className="font-display text-5xl md:text-6xl uppercase text-white">
            Quem disputa o <span className="text-stroke-neon">troféu</span>
          </h2>
        </div>

        {teams.length === 0 ? (
          <div className="border border-dashed border-b-stone p-12 text-center bg-b-gray/20">
            <p className="font-mono text-gray-600 text-sm uppercase">Equipes sendo convocadas</p>
            <p className="font-mono text-[10px] text-gray-700 uppercase mt-2">// chaves de elite em breve 🐾</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => setSelectedTeam(team)}
                className="bg-b-gray border-2 border-b-stone hover:border-b-neon hover:-translate-y-1 transition-all group p-4 flex flex-col items-center justify-between text-center aspect-square shadow-brutal-org hover:shadow-none outline-none"
              >
                {/* Logo do Time */}
                <div className="w-full h-24 md:h-28 flex items-center justify-center mb-3 shrink-0">
                  <img
                    src={team.logo_url}
                    alt={`Logo do ${team.name}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {/* Meta */}
                <div className="w-full">
                  <h3 className="font-display text-lg uppercase text-white group-hover:text-b-neon transition-colors truncate w-full mb-0.5">
                    {team.name}
                  </h3>
                  <p className="font-mono text-[9px] text-gray-500 uppercase tracking-wider mb-1">
                    📍 {team.location}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes da Equipe */}
      {selectedTeam && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-4 py-6 overflow-y-auto"
          onClick={() => setSelectedTeam(null)}
        >
          <div
            className="bg-b-gray border-2 border-b-neon w-full max-w-2xl shadow-brutal-org my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-b-stone/30 bg-b-dark/50">
              <div className="flex items-center gap-4">
                <img
                  src={selectedTeam.logo_url}
                  alt={`Logo do ${selectedTeam.name}`}
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <h2 className="font-display text-2xl uppercase text-b-neon leading-none">
                    {selectedTeam.name}
                  </h2>
                  <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mt-1 block">
                    📍 {selectedTeam.location}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="font-mono text-gray-500 hover:text-white text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-6">
              {/* Foto Oficial do Time */}
              <div className="relative aspect-video w-full bg-black border border-b-stone/30 overflow-hidden">
                <img
                  src={selectedTeam.team_photo_url}
                  alt={`Foto da equipe ${selectedTeam.name}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* História / Descrição Detalhada */}
              <div className="space-y-4">
                <h4 className="font-display text-lg uppercase text-b-orange tracking-widest">// história do time</h4>
                
                {/* Descrição curta com destaque brutalista */}
                <p className="font-body text-base md:text-lg text-white font-bold leading-relaxed border-l-4 border-b-neon pl-4 py-1 bg-b-neon/5">
                  {selectedTeam.description_short}
                </p>

                {/* História do time */}
                <p className="font-body text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                  {selectedTeam.description_long}
                </p>
              </div>

              {/* Botão de Fechar */}
              <div className="pt-4 border-t border-t-stone/20 flex justify-end">
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="bg-b-neon text-b-dark font-display text-sm uppercase px-8 py-3 tracking-widest hover:opacity-95 transition-opacity"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
