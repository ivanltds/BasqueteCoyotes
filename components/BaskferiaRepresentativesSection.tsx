'use client'

export interface Representative {
  id: string
  name: string
  modality: string
  photo_url: string
  link: string | null
  team_name: string
  team_logo_url?: string | null
}

interface Props {
  representatives: Representative[]
}

const MODALITY_LABELS: Record<string, string> = {
  '3pts': '3 Pontos',
  'habilidades': 'Habilidades',
  '2pts': '2 Pontos',
  'x1': 'X1 - Um contra Um',
  '5x5': 'Campeonato 5x5',
}
const MODALITY_COLORS: Record<string, string> = {
  '3pts': 'bg-b-orange/10 border-b-orange text-b-orange',
  'habilidades': 'bg-b-neon/10 border-b-neon text-b-neon',
  '2pts': 'bg-cyan-500/10 border-cyan-500 text-cyan-500',
  'x1': 'bg-rose-500/10 border-rose-500 text-rose-500',
  '5x5': 'bg-violet-500/10 border-violet-500 text-violet-500',
}

export default function BaskferiaRepresentativesSection({ representatives }: Props) {
  return (
    <section className="py-20 border-t border-t-stone/30 bg-b-dark px-6 md:px-20 noise-overlay">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center md:text-left">
          <span className="font-mono text-b-orange uppercase tracking-[0.3em] text-xs mb-2 block">
            // atletas confirmados
          </span>
          <h2 className="font-display text-5xl md:text-6xl uppercase text-white">
            Representantes dos <span className="text-stroke">Torneios</span>
          </h2>
        </div>

        {representatives.length === 0 ? (
          <div className="border border-dashed border-b-stone p-12 text-center bg-b-gray/20">
            <p className="font-mono text-gray-600 text-sm uppercase">Atletas sendo registrados</p>
            <p className="font-mono text-[10px] text-gray-700 uppercase mt-2">// chaves de desafios em breve 🐾</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {representatives.map((rep) => {
              const colorClass = MODALITY_COLORS[rep.modality] || 'bg-b-orange/10 border-b-orange text-b-orange'
              const CardContent = (
                <div className="flex flex-col justify-between p-4 bg-b-gray border-2 border-b-stone group-hover:border-b-neon transition-all shadow-brutal-org group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 h-full">
                  {/* Foto do Jogador */}
                  <div className="relative aspect-[3/4] w-full bg-b-dark overflow-hidden border border-b-stone/30 mb-3 shrink-0">
                    <img
                      src={rep.photo_url}
                      alt={rep.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {rep.team_logo_url && (
                      <div className="absolute top-2 right-2 w-11 h-11 md:w-14 md:h-14 bg-b-dark/80 p-1 border border-b-stone/30 rounded flex items-center justify-center backdrop-blur-sm opacity-60 group-hover:opacity-90 transition-opacity">
                        <img
                          src={rep.team_logo_url}
                          alt="Time"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="text-left">
                    <span className={`inline-block border font-mono text-[9px] uppercase px-2 py-0.5 mb-2 font-bold ${colorClass}`}>
                      {MODALITY_LABELS[rep.modality] || rep.modality}
                    </span>
                    <h3 className="font-display text-lg uppercase text-white group-hover:text-b-neon transition-colors truncate">
                      {rep.name}
                    </h3>
                    <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                      🛡️ {rep.team_name}
                    </p>
                  </div>
                </div>
              )

              if (rep.link) {
                return (
                  <a
                    key={rep.id}
                    href={rep.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block outline-none h-full"
                  >
                    {CardContent}
                  </a>
                )
              }

              return (
                <div key={rep.id} className="group h-full">
                  {CardContent}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
