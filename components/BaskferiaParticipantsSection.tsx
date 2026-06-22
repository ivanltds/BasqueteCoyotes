import { getSupabasePublic } from '@/lib/supabase-server'
import BaskferiaGrid from './BaskferiaGrid'

export default async function BaskferiaParticipantsSection() {
  const sb = getSupabasePublic()
  const { data } = await sb
    .from('baskferia_participants')
    .select('id, name, height, neighborhood, city, edition, year, photo_url')
    .order('created_at', { ascending: true })

  const participants = data ?? []

  return (
    <section className="py-24 bg-b-dark border-t border-b-stone/20">
      <div className="max-w-7xl mx-auto px-6 md:px-20">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-14">
          <div>
            <span className="font-mono text-b-neon uppercase tracking-[0.3em] text-xs mb-4 block">// participantes</span>
            <h2 className="font-display text-5xl md:text-7xl text-white uppercase leading-none">
              Estiveram <span className="text-stroke-neon">Aqui</span>
            </h2>
            <p className="font-body text-gray-500 mt-3">
              {participants.length > 0 ? `${participants.length} participante${participants.length !== 1 ? 's' : ''} do Baskferia 2026` : 'Seja o primeiro a registrar sua participação!'}
            </p>
          </div>
          <BaskferiaGrid participants={participants} showJoinButton />
        </div>
        {participants.length > 0 && <BaskferiaGrid participants={participants} />}
      </div>
    </section>
  )
}
