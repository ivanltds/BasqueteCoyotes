import { getSupabasePublic } from '@/lib/supabase-server'
import Image from 'next/image'

interface Testimonial {
  id: string
  name: string
  city: string
  photo_url: string
  rating: number | null
  story: string | null
  highlights: string | null
}

async function getTestimonials(type: 'coyotes' | 'baskferia'): Promise<Testimonial[]> {
  const sb = getSupabasePublic()

  if (type === 'baskferia') {
    const { data } = await sb
      .from('baskferia_participants')
      .select('id, name, city, photo_url, rating, story, highlights')
      .eq('testimonial_approved', true)
      .order('created_at', { ascending: false })
    return (data ?? []).filter((t: Testimonial) => t.story || t.highlights)
  }

  const { data } = await sb
    .from('members')
    .select('id, name, city, photo_url, rating, story, highlights')
    .eq('approved', true)
    .eq('testimonial_approved', true)
    .order('created_at', { ascending: false })
  return (data ?? []).filter((t: Testimonial) => t.story || t.highlights)
}

interface Props {
  type: 'coyotes' | 'baskferia'
}

export default async function TestimonialsSection({ type }: Props) {
  const testimonials = await getTestimonials(type)
  if (testimonials.length === 0) return null

  const accent    = type === 'baskferia' ? '#E0FF00' : '#FF5722'
  const accentCls = type === 'baskferia' ? 'text-[#E0FF00]' : 'text-b-orange'
  const label     = type === 'baskferia' ? 'O Que Disseram' : 'A Voz da Matilha'
  const sublabel  = type === 'baskferia'
    ? '// depoimentos dos participantes'
    : '// depoimentos dos membros'

  return (
    <section className="py-20 px-6 md:px-20 border-t border-b-stone/20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <span className={`font-mono text-xs uppercase tracking-[0.3em] mb-3 block ${accentCls}`}>
            {sublabel}
          </span>
          <h2 className="font-display text-5xl md:text-6xl text-white uppercase leading-none">
            {label}
          </h2>
        </div>

        {/* Horizontal scroll de cards */}
        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory">
          {testimonials.map(t => {
            const text    = t.story || t.highlights || ''
            const preview = text.length > 220 ? text.slice(0, 220).trimEnd() + '…' : text

            return (
              <article
                key={t.id}
                className="flex-none w-72 md:w-80 snap-start bg-b-gray border border-b-stone/30 p-5 flex flex-col gap-4"
                style={{ borderTopColor: accent, borderTopWidth: 2 }}
              >
                <span className="font-display text-4xl leading-none" style={{ color: accent }}>&ldquo;</span>
                <p className="font-body text-gray-300 text-sm leading-relaxed flex-1 -mt-2">{preview}</p>

                <div className="flex items-center gap-3 pt-3 border-t border-b-stone/20">
                  {t.photo_url && (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2" style={{ borderColor: accent }}>
                      <Image src={t.photo_url} alt={t.name} fill className="object-cover object-top" unoptimized />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-bold text-white text-sm truncate">{t.name}</p>
                    <p className="font-mono text-[10px] text-gray-600 uppercase">{t.city}</p>
                  </div>
                  {t.rating != null && (
                    <span className="font-display text-lg shrink-0" style={{ color: accent }}>
                      {t.rating}<span className="font-mono text-[10px] text-gray-600">/10</span>
                    </span>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
