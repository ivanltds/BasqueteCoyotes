export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { getSupabasePublic } from '@/lib/supabase-server'
import NoticiasGrid from './NoticiasGrid'

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

  return (
    <main className="min-h-screen bg-b-dark text-white pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <span className="font-mono text-b-orange uppercase tracking-[0.3em] text-xs mb-4 block">// notícias</span>
        <h1 className="font-display text-6xl md:text-8xl uppercase leading-none mb-16">Novidades</h1>
        <NoticiasGrid items={news ?? []} />
      </div>
    </main>
  )
}
