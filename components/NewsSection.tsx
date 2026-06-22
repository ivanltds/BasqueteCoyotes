import Image from 'next/image'
import Link from 'next/link'
import { getSupabasePublic } from '@/lib/supabase-server'

interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_url: string | null
  published_at: string | null
}

async function getHomeNews(count: number): Promise<NewsItem[]> {
  const sb = getSupabasePublic()
  const { data } = await sb
    .from('news')
    .select('id, title, slug, excerpt, cover_url, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(count)
  return data ?? []
}

async function getHomeNewsCount(): Promise<number> {
  const sb = getSupabasePublic()
  const { data } = await sb
    .from('site_config')
    .select('value')
    .eq('key', 'home_news_count')
    .single()
  return parseInt(data?.value ?? '3', 10)
}

function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export default async function NewsSection() {
  const count = await getHomeNewsCount()
  const news  = await getHomeNews(count)

  if (news.length === 0) return null

  return (
    <section className="py-24 px-6 md:px-20 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-12">
        <div>
          <span className="font-mono text-b-orange uppercase tracking-[0.3em] text-xs mb-4 block">
            // notícias
          </span>
          <h2 className="font-display text-6xl md:text-7xl text-white uppercase leading-none">
            Novidades
          </h2>
        </div>
        <Link
          href="/noticias"
          className="hidden md:block font-display text-b-stone text-xl uppercase tracking-widest hover:text-b-orange transition-colors"
        >
          Ver todas →
        </Link>
      </div>

      <div className={`grid gap-6 ${
        news.length === 1 ? 'grid-cols-1 max-w-lg' :
        news.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {news.map((item, i) => (
          <Link
            key={item.id}
            href={`/noticias/${item.slug}`}
            className="group flex flex-col bg-b-gray border border-b-stone/20 hover:border-b-orange transition-all duration-300"
          >
            {/* Capa */}
            <div className="relative aspect-[16/9] overflow-hidden bg-b-stone/10">
              {item.cover_url ? (
                <Image
                  src={item.cover_url}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority={i === 0}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-6xl text-b-stone/20">C</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-b-dark/60 to-transparent" />
            </div>

            {/* Texto */}
            <div className="flex flex-col flex-1 p-5">
              <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">
                {formatDate(item.published_at)}
              </p>
              <h3 className="font-display text-xl text-white uppercase leading-tight mb-3 group-hover:text-b-orange transition-colors line-clamp-2">
                {item.title}
              </h3>
              {item.excerpt && (
                <p className="font-body text-sm text-gray-400 leading-relaxed line-clamp-2 flex-1">
                  {item.excerpt}
                </p>
              )}
              <span className="mt-4 font-mono text-xs text-b-orange uppercase tracking-widest">
                Ler mais →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 md:hidden text-center">
        <Link href="/noticias" className="font-display text-b-orange uppercase tracking-widest hover:text-b-neon transition-colors">
          Ver todas as notícias →
        </Link>
      </div>
    </section>
  )
}
