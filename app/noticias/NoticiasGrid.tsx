'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_url: string | null
  published_at: string | null
}

export default function NoticiasGrid({ items }: { items: NewsItem[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        (item.excerpt ?? '').toLowerCase().includes(q)
    )
  }, [query, items])

  return (
    <>
      {/* Busca */}
      <div className="mb-10">
        <div className="relative max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar notícias..."
            className="w-full bg-b-gray border border-b-stone/40 text-white font-body text-sm pl-11 pr-4 py-3
              placeholder:text-gray-600 focus:outline-none focus:border-b-orange transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        {query && (
          <p className="font-mono text-xs text-gray-600 mt-3 uppercase tracking-widest">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="font-body text-gray-600">Nenhuma notícia encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, i) => (
            <Link
              key={item.id}
              href={`/noticias/${item.slug}`}
              className="group flex flex-col bg-b-gray border border-b-stone/20 hover:border-b-orange transition-all duration-300"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-b-stone/10">
                {item.cover_url ? (
                  <Image
                    src={item.cover_url}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority={i < 3}
                  />
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
                    ? new Date(item.published_at).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                      })
                    : ''}
                </p>
                <h2 className="font-display text-xl text-white uppercase leading-tight mb-3 group-hover:text-b-orange transition-colors line-clamp-2">
                  {item.title}
                </h2>
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
      )}
    </>
  )
}
