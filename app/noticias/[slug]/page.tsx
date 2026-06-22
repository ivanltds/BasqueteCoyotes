import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { getSupabasePublic } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_url: string | null
  published_at: string | null
}

async function getNews(slug: string): Promise<NewsItem | null> {
  const sb = getSupabasePublic()
  const { data } = await sb
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  return data ?? null
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const news = await getNews(slug)
  if (!news) return { title: 'Notícia não encontrada' }
  return {
    title: news.title,
    description: news.excerpt ?? undefined,
    openGraph: {
      title: news.title,
      description: news.excerpt ?? undefined,
      images: news.cover_url ? [{ url: news.cover_url }] : [],
      type: 'article',
      locale: 'pt_BR',
    },
  }
}

export default async function NewsPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const news = await getNews(slug)
  if (!news) notFound()

  const dateStr = news.published_at
    ? new Date(news.published_at).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
    : ''

  return (
    <main className="min-h-screen bg-b-dark text-white pt-24 pb-24">
      {/* Hero capa */}
      {news.cover_url && (
        <div className="relative w-full h-[50vh] max-h-[480px] mb-12">
          <Image
            src={news.cover_url}
            alt={news.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-b-dark via-b-dark/40 to-transparent" />
        </div>
      )}

      <article className="max-w-3xl mx-auto px-6">
        {/* Meta */}
        <div className="mb-6">
          <Link
            href="/noticias"
            className="font-mono text-xs text-gray-600 uppercase tracking-widest hover:text-b-orange transition-colors"
          >
            ← Notícias
          </Link>
        </div>

        {dateStr && (
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-4">{dateStr}</p>
        )}

        <h1 className="font-display text-4xl md:text-6xl uppercase leading-tight text-white mb-8">
          {news.title}
        </h1>

        {news.excerpt && (
          <p className="font-body text-xl text-gray-300 leading-relaxed mb-10 border-l-4 border-b-orange pl-5">
            {news.excerpt}
          </p>
        )}

        {/* Conteúdo Markdown */}
        <div className="prose prose-invert prose-lg max-w-none
          prose-headings:font-display prose-headings:uppercase prose-headings:text-white
          prose-p:text-gray-300 prose-p:leading-relaxed
          prose-a:text-b-orange prose-a:no-underline hover:prose-a:text-b-neon
          prose-strong:text-white
          prose-li:text-gray-300
          prose-hr:border-b-stone
          prose-blockquote:border-b-orange prose-blockquote:text-gray-400">
          <ReactMarkdown>{news.content}</ReactMarkdown>
        </div>

        {/* Voltar */}
        <div className="mt-16 pt-8 border-t border-b-stone">
          <Link
            href="/noticias"
            className="font-display uppercase text-b-orange hover:text-b-neon tracking-widest transition-colors"
          >
            ← Todas as notícias
          </Link>
        </div>
      </article>
    </main>
  )
}
