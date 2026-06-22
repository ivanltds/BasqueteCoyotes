export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getSupabasePublic } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Notícias',
  description: 'Acompanhe as novidades dos Coyotes do Basquetebol.',
}

export default async function NoticiasPage() {
  const sb = getSupabasePublic()
  const { data: news } = await sb
    .from('news')
    .select('id, title, slug, excerpt, cover_url, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })

  const items = news ?? []

  return (
    <main className="min-h-screen bg-b-dark text-white pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <span className="font-mono text-b-orange uppercase tracking-[0.3em] text-xs mb-4 block">// notícias</span>
        <h1 className="font-display text-6xl md:text-8xl uppercase leading-none mb-16">Novidades</h1>

        {items.length === 0 ? (
          <p className="font-body text-gray-600">Nenhuma notícia publicada ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, i) => (
              <Link key={item.id} href={`/noticias/${item.slug}`}
                className="group flex flex-col bg-b-gray border border-b-stone/20 hover:border-b-orange transition-all duration-300">
                <div className="relative aspect-[16/9] overflow-hidden bg-b-stone/10">
                  {item.cover_url ? (
                    <Image src={item.cover_url} alt={item.title} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      priority={i < 3} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display text-6xl text-b-stone/20">C</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-b-dark/60 to-transparent" />
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">
                    {item.published_at
                      ? new Date(item.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      : ''}
                  </p>
                  <h2 className="font-display text-xl text-white uppercase leading-tight mb-3 group-hover:text-b-orange transition-colors line-clamp-2">
                    {item.title}
                  </h2>
                  {item.excerpt && (
                    <p className="font-body text-sm text-gray-400 leading-relaxed line-clamp-2 flex-1">{item.excerpt}</p>
                  )}
                  <span className="mt-4 font-mono text-xs text-b-orange uppercase tracking-widest">Ler mais →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
