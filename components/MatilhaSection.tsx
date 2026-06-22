import { getSupabasePublic } from '@/lib/supabase-server'
import MatilhaGrid from './MatilhaGrid'

export default async function MatilhaSection() {
  const sb = getSupabasePublic()
  const { data } = await sb
    .from('members')
    .select('id, name, height, neighborhood, city, started_month, started_year, photo_url')
    .eq('approved', true)
    .order('created_at', { ascending: true })

  const members = data ?? []
  if (members.length === 0) return null

  return (
    <section className="py-24 bg-b-gray border-t border-b-stone/20">
      <div className="max-w-7xl mx-auto px-6 md:px-20">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-14">
          <div>
            <span className="font-mono text-b-orange uppercase tracking-[0.3em] text-xs mb-4 block">// a matilha</span>
            <h2 className="font-display text-5xl md:text-7xl text-white uppercase leading-none">
              Integrantes
            </h2>
            <p className="font-body text-gray-500 mt-3">{members.length} membro{members.length !== 1 ? 's' : ''}</p>
          </div>
          <MatilhaGrid showJoinButton />
        </div>
        <MatilhaGrid members={members} />
      </div>
    </section>
  )
}
