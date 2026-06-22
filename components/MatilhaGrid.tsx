'use client'

import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import MemberCard from './MemberCard'
import JoinForm from './JoinForm'
import type { CarterinhaData } from './Carteirinha'

interface Member extends CarterinhaData { id: string }

interface Props {
  members?: Member[]
  type?: 'coyotes' | 'baskferia'
  showJoinButton?: boolean
}

const PAGE_SIZE = 5

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function MatilhaGrid({ members = [], type = 'coyotes', showJoinButton = false }: Props) {
  const [formOpen, setFormOpen]   = useState(false)
  const [success, setSuccess]     = useState(false)
  const [page, setPage]           = useState(0)
  const [showAll, setShowAll]     = useState(false)
  const [query, setQuery]         = useState('')
  const [mounted, setMounted]     = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const shuffled    = useMemo(() => shuffle(members), [members])
  const totalPages  = Math.ceil(shuffled.length / PAGE_SIZE)
  const visible     = shuffled.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return members
    return members.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.city.toLowerCase().includes(q) ||
      m.neighborhood.toLowerCase().includes(q)
    )
  }, [members, query])

  const accentClass = type === 'baskferia' ? 'hover:border-b-neon hover:text-b-neon' : 'hover:border-b-orange hover:text-b-orange'
  const btnColor    = type === 'baskferia' ? 'text-b-neon border-b-neon/30' : 'text-b-orange'

  // ── Botão "Junte-se" (modo cabeçalho de seção) ──────────────────────────
  if (showJoinButton) {
    return (
      <>
        {success
          ? <p className="font-mono text-sm text-b-neon uppercase tracking-widest">
              {type === 'coyotes' ? 'Cadastro enviado! Aguarde aprovação. 🐺' : 'Registrado! Confira na lista abaixo. 🏀'}
            </p>
          : <button
              onClick={() => setFormOpen(true)}
              className={`font-display text-lg uppercase px-8 py-4 tracking-wider transition-all duration-200 ${
                type === 'baskferia'
                  ? 'border-2 border-b-neon text-b-neon shadow-neon-yellow hover:bg-b-neon hover:text-b-dark'
                  : 'bg-b-orange text-b-dark shadow-brutal hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px]'
              }`}
            >
              {type === 'coyotes' ? 'Junte-se à Matilha' : 'Registrar Participação'}
            </button>
        }
        {formOpen && mounted && createPortal(
          <JoinForm type={type} onClose={() => setFormOpen(false)} onSuccess={() => { setFormOpen(false); setSuccess(true) }} />,
          document.body
        )}
      </>
    )
  }

  // ── Grade + carrossel ───────────────────────────────────────────────────
  return (
    <>
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map(m => <MemberCard key={m.id} data={m} type={type} />)}
        {/* Slots vazios para manter altura */}
        {Array.from({ length: PAGE_SIZE - visible.length }).map((_, i) => (
          <div key={`empty-${i}`} className="h-[120px] bg-b-stone/5 border border-b-stone/10 hidden lg:block" />
        ))}
      </div>

      {/* Navegação */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className={`font-display uppercase px-5 py-2 border border-b-stone text-gray-400 ${accentClass} disabled:opacity-20 transition-all`}
        >
          ← Anterior
        </button>

        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-gray-600 uppercase tracking-widest">
            {page + 1} / {totalPages}
          </span>
          {members.length > PAGE_SIZE && (
            <button
              onClick={() => setShowAll(true)}
              className={`font-mono text-xs uppercase tracking-widest transition-colors ${btnColor} hover:text-b-neon`}
            >
              Ver todos ({members.length}) →
            </button>
          )}
        </div>

        <button
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          className={`font-display uppercase px-5 py-2 border border-b-stone text-gray-400 ${accentClass} disabled:opacity-20 transition-all`}
        >
          Próximos →
        </button>
      </div>

      {/* Modal "Ver todos" */}
      {showAll && mounted && createPortal(
        <div
          className="fixed inset-0 z-[90] bg-black/95 overflow-y-auto"
          onClick={e => { if (e.target === e.currentTarget) setShowAll(false) }}
        >
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className={`font-mono text-xs uppercase tracking-[0.3em] mb-2 block ${type === 'baskferia' ? 'text-b-neon' : 'text-b-orange'}`}>
                  // {type === 'coyotes' ? 'a matilha' : 'participantes'}
                </span>
                <h2 className="font-display text-4xl md:text-6xl uppercase text-white leading-none">
                  {type === 'coyotes' ? 'Todos os Integrantes' : 'Todos os Participantes'}
                </h2>
              </div>
              <button
                onClick={() => setShowAll(false)}
                className="font-mono text-xs text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
              >
                ✕ Fechar
              </button>
            </div>

            {/* Busca */}
            <div className="relative max-w-md mb-10">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </span>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar por nome, cidade ou bairro…"
                className="w-full bg-b-gray border border-b-stone/40 text-white font-body text-sm pl-11 pr-10 py-3 placeholder:text-gray-600 focus:outline-none focus:border-b-orange transition-colors"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">✕</button>
              )}
            </div>

            {query && (
              <p className="font-mono text-xs text-gray-600 mb-6 uppercase tracking-widest">
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para &ldquo;{query}&rdquo;
              </p>
            )}

            {filtered.length === 0
              ? <p className="font-body text-gray-600">Nenhum resultado encontrado.</p>
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filtered.map(m => <MemberCard key={m.id} data={m} type={type} />)}
                </div>
            }
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
