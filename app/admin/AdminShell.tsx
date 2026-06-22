'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PendingPhoto {
  public_id: string
  secure_url: string
  created_at: string
  context?: { custom?: { target_gallery?: string } }
}

interface Gallery {
  id: string
  folder_slug: string
  display_name: string
  sort_order: number
  photo_count: number
}

type Tab = 'aprovacoes' | 'fotos' | 'galerias' | 'midia' | 'audio' | 'noticias' | 'membros' | 'feedbacks'

interface SiteMediaItem {
  id: string
  section: string
  cloudinary_public_id: string
  cloudinary_url: string
  resource_type: string
  sort_order: number
}

// ─── Shell principal ───────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: 'aprovacoes', label: 'Aprovações' },
  { id: 'fotos',      label: 'Fotos'      },
  { id: 'galerias',   label: 'Galerias'   },
  { id: 'midia',      label: 'Mídia'      },
  { id: 'audio',      label: 'Áudio'      },
  { id: 'noticias',   label: 'Notícias'   },
  { id: 'membros',    label: 'Membros'    },
  { id: 'feedbacks',  label: 'Feedbacks'  },
]

export default function AdminShell() {
  const router  = useRouter()
  const [tab, setTab]         = useState<Tab>('aprovacoes')
  const [menuOpen, setMenuOpen] = useState(false)

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  function selectTab(t: Tab) {
    setTab(t)
    setMenuOpen(false)
  }

  const currentLabel = TABS.find(t => t.id === tab)?.label ?? ''

  return (
    <main className="min-h-screen bg-b-dark text-white">
      {/* Header */}
      <header className="border-b border-b-stone px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/images/logos/logo-coyotes.png" alt="Coyotes" width={32} height={32} className="opacity-70" />
          <span className="font-display text-xl uppercase tracking-widest">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="font-mono text-xs uppercase text-gray-500 hover:text-red-400 transition-colors border border-b-stone hover:border-red-900 px-4 py-2"
          >
            Sair →
          </button>
          {/* Hambúrguer — só mobile */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8 p-1"
            aria-label="Menu"
          >
            <span className={`block h-px bg-white transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
            <span className={`block h-px bg-white transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px bg-white transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
          </button>
        </div>
      </header>

      {/* Abas desktop — ocultas em mobile */}
      <div className="hidden md:flex border-b border-b-stone px-6 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => selectTab(t.id)}
            className={`font-display text-base uppercase px-5 py-3 tracking-widest border-b-2 whitespace-nowrap transition-all ${
              tab === t.id
                ? 'border-b-orange text-b-orange'
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Menu mobile — dropdown */}
      {menuOpen && (
        <div className="md:hidden border-b border-b-stone bg-b-gray z-50">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => selectTab(t.id)}
              className={`w-full text-left font-display text-base uppercase px-6 py-4 tracking-widest border-b border-b-stone/20 last:border-0 transition-colors ${
                tab === t.id
                  ? 'text-b-orange bg-b-orange/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === t.id && <span className="text-b-orange mr-2">▸</span>}
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Aba ativa — breadcrumb mobile */}
      <div className="md:hidden px-4 py-2 border-b border-b-stone/20 flex items-center gap-2">
        <span className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">Admin</span>
        <span className="font-mono text-[10px] text-gray-600">›</span>
        <span className="font-mono text-[10px] text-b-orange uppercase tracking-widest">{currentLabel}</span>
      </div>

      {/* Conteúdo */}
      <div className="px-4 md:px-6 py-6 md:py-8 max-w-7xl mx-auto">
        {tab === 'aprovacoes' && <TabAprovacoes />}
        {tab === 'fotos'      && <TabFotos />}
        {tab === 'galerias'   && <TabGalerias />}
        {tab === 'midia'      && <TabMidia />}
        {tab === 'audio'      && <TabAudio />}
        {tab === 'noticias'   && <TabNoticias />}
        {tab === 'membros'    && <TabMembros />}
        {tab === 'feedbacks'  && <TabFeedbacks />}
      </div>
    </main>
  )
}

// ─── Aba: Aprovações ──────────────────────────────────────────────────────────

function TabAprovacoes() {
  const router = useRouter()
  const [photos, setPhotos]         = useState<PendingPhoto[]>([])
  const [galleries, setGalleries]   = useState<{ folder_slug: string; display_name: string }[]>([])
  const [loading, setLoading]       = useState(true)
  const [busy, setBusy]             = useState<string | null>(null)
  // mapa de overrides: public_id → galeria escolhida pelo admin
  const [overrides, setOverrides]   = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    const [pr, gr] = await Promise.all([
      fetch('/api/admin/pending'),
      fetch('/api/galleries'),
    ])
    if (pr.status === 401) { router.push('/admin/login'); return }
    const pd = await pr.json()
    const gd = await gr.json()
    setPhotos(pd.photos ?? [])
    setGalleries(gd.galleries ?? [])
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  function targetFor(photo: PendingPhoto) {
    return overrides[photo.public_id] ?? photo.context?.custom?.target_gallery ?? galleries[0]?.folder_slug ?? ''
  }

  async function approve(photo: PendingPhoto) {
    const target = targetFor(photo)
    if (!target) { alert('Selecione uma galeria de destino.'); return }
    setBusy(photo.public_id)
    const res = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id: photo.public_id, target_gallery: target }),
    })
    const d = await res.json()
    if (!res.ok) {
      console.error('[Approve] Erro:', d)
      alert(d.error ?? 'Erro ao aprovar.')
    } else {
      console.log('[Approve] calculado:', d.to_public_id)
      console.log('[Approve] Cloudinary real:', d.cloudinary_public_id)
      if (d.cloudinary_public_id && d.cloudinary_public_id !== d.to_public_id) {
        console.warn('[Approve] DIVERGÊNCIA entre calculado e real!')
      }
      setPhotos(prev => prev.filter(p => p.public_id !== photo.public_id))
    }
    setBusy(null)
  }

  async function reject(photo: PendingPhoto) {
    if (!confirm('Recusar e apagar esta foto permanentemente?')) return
    setBusy(photo.public_id)
    const res = await fetch('/api/admin/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id: photo.public_id }),
    })
    if (res.ok) {
      setPhotos(prev => prev.filter(p => p.public_id !== photo.public_id))
    } else {
      alert('Erro ao recusar foto.')
    }
    setBusy(null)
  }

  if (loading) return <Spinner />

  if (photos.length === 0) return (
    <div className="border-2 border-dashed border-b-stone p-20 text-center mt-4">
      <p className="font-display text-4xl text-gray-700 uppercase mb-2">Nenhuma foto pendente</p>
      <p className="font-mono text-xs text-gray-600 uppercase tracking-widest">Tudo em dia 🐾</p>
    </div>
  )

  return (
    <div>
      <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-6">
        {photos.length} foto{photos.length !== 1 ? 's' : ''} aguardando aprovação
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {photos.map(photo => {
          const isBusy  = busy === photo.public_id
          const current = targetFor(photo)

          return (
            <div key={photo.public_id} className="bg-b-gray border-2 border-b-stone flex flex-col">
              <div className="relative aspect-square bg-b-dark">
                <Image src={photo.secure_url} alt="Foto pendente" fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
              </div>

              <div className="p-4 flex flex-col gap-3 flex-1">
                {/* Seletor de galeria */}
                <div>
                  <span className="font-mono text-[10px] uppercase text-gray-500 mb-1.5 block">Galeria de destino</span>
                  <select
                    value={current}
                    onChange={e => setOverrides(prev => ({ ...prev, [photo.public_id]: e.target.value }))}
                    disabled={isBusy}
                    className="w-full bg-b-dark border-2 border-b-neon text-b-neon font-display text-sm uppercase px-3 py-2 outline-none appearance-none cursor-pointer hover:border-b-orange transition-colors disabled:opacity-40"
                  >
                    {galleries.map(g => (
                      <option key={g.folder_slug} value={g.folder_slug}>{g.display_name}</option>
                    ))}
                  </select>
                </div>

                <p className="font-mono text-[10px] text-gray-600 truncate">{photo.public_id}</p>

                <div className="flex gap-2 mt-auto">
                  <button onClick={() => approve(photo)} disabled={isBusy || !current}
                    className="flex-1 bg-b-neon text-b-dark font-display text-sm uppercase py-2 tracking-wider hover:opacity-90 disabled:opacity-40">
                    {isBusy ? '...' : '✓ Aprovar'}
                  </button>
                  <button onClick={() => reject(photo)} disabled={isBusy}
                    className="flex-1 border-2 border-red-800 text-red-400 font-display text-sm uppercase py-2 tracking-wider hover:bg-red-950 disabled:opacity-40">
                    {isBusy ? '...' : '✕ Recusar'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Aba: Fotos ───────────────────────────────────────────────────────────────

interface GalleryPhoto {
  public_id:  string
  secure_url: string
  created_at: string
}

function TabFotos() {
  const router = useRouter()
  const [galleries, setGalleries] = useState<{ folder_slug: string; display_name: string }[]>([])
  const [activeSlug, setActiveSlug] = useState<string>('')
  const [photos, setPhotos]         = useState<GalleryPhoto[]>([])
  const [loading, setLoading]       = useState(false)
  const [busy, setBusy]             = useState<string | null>(null)
  const [moveTarget, setMoveTarget] = useState<Record<string, string>>({})
  const [movingPhoto, setMovingPhoto] = useState<string | null>(null) // public_id com painel de mover aberto

  // Carrega lista de galerias
  useEffect(() => {
    fetch('/api/galleries')
      .then(r => { if (r.status === 401) router.push('/admin/login'); return r.json() })
      .then(d => {
        const gals = d.galleries ?? []
        setGalleries(gals)
        if (gals.length > 0) setActiveSlug(gals[0].folder_slug)
      })
  }, [router])

  // Carrega fotos da galeria ativa
  const loadPhotos = useCallback(async (slug: string) => {
    if (!slug) return
    setLoading(true)
    setPhotos([])
    const res = await fetch(`/api/admin/gallery-photos?slug=${slug}`)
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setPhotos(data.photos ?? [])
    setLoading(false)
  }, [router])

  useEffect(() => { if (activeSlug) loadPhotos(activeSlug) }, [activeSlug, loadPhotos])

  function selectGallery(slug: string) {
    setActiveSlug(slug)
    setMoveTarget({})
    setMovingPhoto(null)
  }

  function targetFor(photo: GalleryPhoto) {
    return moveTarget[photo.public_id] ?? galleries.find(g => g.folder_slug !== activeSlug)?.folder_slug ?? ''
  }

  async function move(photo: GalleryPhoto) {
    const to = targetFor(photo)
    if (!to) return
    setBusy(photo.public_id)
    const res = await fetch('/api/admin/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id: photo.public_id, to_gallery: to }),
    })
    if (res.ok) {
      setPhotos(prev => prev.filter(p => p.public_id !== photo.public_id))
      setMovingPhoto(null)
    } else {
      const d = await res.json()
      alert(d.error ?? 'Erro ao mover.')
    }
    setBusy(null)
  }

  async function remove(photo: GalleryPhoto) {
    if (!confirm('Apagar esta foto permanentemente?')) return
    setBusy(photo.public_id)
    const res = await fetch('/api/admin/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id: photo.public_id }),
    })
    if (res.ok) {
      setPhotos(prev => prev.filter(p => p.public_id !== photo.public_id))
    } else {
      alert('Erro ao apagar.')
    }
    setBusy(null)
  }

  const otherGalleries = galleries.filter(g => g.folder_slug !== activeSlug)

  return (
    <div>
      {/* Seletor de galeria */}
      <div className="flex gap-0 border-b border-b-stone mb-8 overflow-x-auto">
        {galleries.map(g => (
          <button
            key={g.folder_slug}
            onClick={() => selectGallery(g.folder_slug)}
            className={`font-display text-base uppercase px-5 py-2.5 tracking-widest border-b-2 whitespace-nowrap transition-all ${
              activeSlug === g.folder_slug
                ? 'border-b-neon text-b-neon'
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            {g.display_name}
          </button>
        ))}
      </div>

      {loading && <Spinner />}

      {!loading && photos.length === 0 && (
        <div className="border-2 border-dashed border-b-stone p-20 text-center">
          <p className="font-display text-4xl text-gray-700 uppercase">Galeria vazia</p>
        </div>
      )}

      {!loading && photos.length > 0 && (
        <>
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-6">
            {photos.length} foto{photos.length !== 1 ? 's' : ''} em{' '}
            <span className="text-b-neon">{galleries.find(g => g.folder_slug === activeSlug)?.display_name}</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {photos.map(photo => {
              const isBusy    = busy === photo.public_id
              const isMoving  = movingPhoto === photo.public_id
              const to        = targetFor(photo)

              return (
                <div key={photo.public_id} className="bg-b-gray border-2 border-b-stone flex flex-col">
                  <div className="relative aspect-square bg-b-dark">
                    <Image src={photo.secure_url} alt="Foto" fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
                  </div>

                  <div className="p-3 flex flex-col gap-2">
                    {/* Painel de mover — abre ao clicar em "Mover para..." */}
                    {isMoving && otherGalleries.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <select
                          value={to}
                          onChange={e => setMoveTarget(prev => ({ ...prev, [photo.public_id]: e.target.value }))}
                          disabled={isBusy}
                          className="w-full bg-b-dark border border-b-orange text-white font-mono text-xs px-2 py-1.5 outline-none appearance-none cursor-pointer disabled:opacity-40"
                        >
                          {otherGalleries.map(g => (
                            <option key={g.folder_slug} value={g.folder_slug}>{g.display_name}</option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => move(photo)}
                            disabled={isBusy || !to}
                            className="flex-1 bg-b-orange text-b-dark font-display text-xs uppercase py-2 tracking-wider hover:opacity-90 disabled:opacity-40"
                          >
                            {isBusy ? '...' : '→ Confirmar'}
                          </button>
                          <button
                            onClick={() => setMovingPhoto(null)}
                            disabled={isBusy}
                            className="px-3 border border-b-stone text-gray-500 font-mono text-xs hover:text-white disabled:opacity-40"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {otherGalleries.length > 0 && !isMoving && (
                        <button
                          onClick={() => setMovingPhoto(photo.public_id)}
                          disabled={isBusy}
                          className="flex-1 border border-b-stone text-gray-300 font-display text-xs uppercase py-2 tracking-wider hover:border-b-orange hover:text-b-orange transition-colors disabled:opacity-40"
                        >
                          Mover para...
                        </button>
                      )}
                      <button
                        onClick={() => remove(photo)}
                        disabled={isBusy}
                        className="flex-1 border border-red-900 text-red-400 font-display text-xs uppercase py-2 tracking-wider hover:bg-red-950 disabled:opacity-40"
                      >
                        {isBusy ? '...' : '✕ Apagar'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
function TabGalerias() {
  const router = useRouter()
  const [galleries, setGalleries]     = useState<Gallery[]>([])
  const [loading, setLoading]         = useState(true)
  const [modal, setModal]             = useState<null | 'create' | { type: 'edit'; gallery: Gallery }>(null)
  const [inputName, setInputName]     = useState('')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/galleries')
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setGalleries(data.galleries ?? [])
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  function openCreate() { setInputName(''); setError(''); setModal('create') }
  function openEdit(g: Gallery) { setInputName(g.display_name); setError(''); setModal({ type: 'edit', gallery: g }) }
  function closeModal() { setModal(null) }

  async function handleCreate() {
    if (!inputName.trim()) { setError('Nome obrigatório.'); return }
    setSaving(true); setError('')
    const res = await fetch('/api/admin/galleries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: inputName }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Erro.'); setSaving(false); return }
    setSaving(false); closeModal(); load()
  }

  async function handleEdit() {
    if (!modal || modal === 'create') return
    if (!inputName.trim()) { setError('Nome obrigatório.'); return }
    setSaving(true); setError('')
    const res = await fetch(`/api/admin/galleries/${(modal as { gallery: Gallery }).gallery.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: inputName }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Erro.'); setSaving(false); return }
    setSaving(false); closeModal(); load()
  }

  async function handleDelete(g: Gallery) {
    if (!confirm(`Deletar galeria "${g.display_name}"?\n\nA pasta deve estar vazia no Cloudinary.`)) return
    const res = await fetch(`/api/admin/galleries/${g.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { alert(data.error ?? 'Erro ao deletar.'); return }
    load()
  }

  async function moveOrder(g: Gallery, direction: 'up' | 'down') {
    const idx    = galleries.findIndex(x => x.id === g.id)
    const target = direction === 'up' ? galleries[idx - 1] : galleries[idx + 1]
    if (!target) return
    await Promise.all([
      fetch(`/api/admin/galleries/${g.id}`,      { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sort_order: target.sort_order }) }),
      fetch(`/api/admin/galleries/${target.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sort_order: g.sort_order }) }),
    ])
    load()
  }

  const previewSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const isCreate = modal === 'create'
  const isEdit   = modal !== null && modal !== 'create'

  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">
          {galleries.length} galeria{galleries.length !== 1 ? 's' : ''} cadastrada{galleries.length !== 1 ? 's' : ''}
        </p>
        <button onClick={openCreate}
          className="bg-b-orange text-b-dark font-display text-sm uppercase px-5 py-2 tracking-widest shadow-brutal hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
          + Nova Galeria
        </button>
      </div>

      <div className="space-y-3 max-w-2xl">
        {galleries.map((g, idx) => (
          <div key={g.id} className="bg-b-gray border-2 border-b-stone flex items-center gap-4 px-5 py-4">
            <div className="flex flex-col gap-1">
              <button onClick={() => moveOrder(g, 'up')} disabled={idx === 0}
                className="font-mono text-xs text-gray-600 hover:text-white disabled:opacity-20 leading-none">▲</button>
              <button onClick={() => moveOrder(g, 'down')} disabled={idx === galleries.length - 1}
                className="font-mono text-xs text-gray-600 hover:text-white disabled:opacity-20 leading-none">▼</button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-xl uppercase">{g.display_name}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="font-mono text-[10px] text-gray-500">pasta: <span className="text-b-neon">{g.folder_slug}</span></span>
                <span className="font-mono text-[10px] text-gray-500">{g.photo_count} foto{g.photo_count !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => openEdit(g)}
                className="font-mono text-xs uppercase text-b-orange border border-b-stone px-3 py-1.5 hover:border-b-orange transition-colors">Editar</button>
              <button onClick={() => handleDelete(g)}
                className="font-mono text-xs uppercase text-red-400 border border-b-stone px-3 py-1.5 hover:border-red-800 transition-colors">Deletar</button>
            </div>
          </div>
        ))}
        {galleries.length === 0 && (
          <div className="border-2 border-dashed border-b-stone p-16 text-center">
            <p className="font-display text-3xl text-gray-700 uppercase">Nenhuma galeria</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {(isCreate || isEdit) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={closeModal}>
          <div className="bg-b-gray border-2 border-b-stone w-full max-w-md shadow-brutal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-b-stone">
              <h2 className="font-display text-2xl uppercase">{isCreate ? 'Nova Galeria' : 'Editar Galeria'}</h2>
              <button onClick={closeModal} className="font-mono text-gray-500 hover:text-white text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <label className="block">
                <span className="font-mono text-xs uppercase text-gray-500 mb-2 block">Nome da Galeria</span>
                <input autoFocus type="text" value={inputName}
                  onChange={e => setInputName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (isCreate ? handleCreate() : handleEdit())}
                  placeholder="Ex: Treinos 2026"
                  className="w-full bg-b-dark border-2 border-b-stone focus:border-b-orange p-3 font-body text-white outline-none transition-colors"
                />
              </label>
              {isCreate && inputName.trim() && (
                <p className="font-mono text-[10px] text-gray-500">
                  Pasta: <span className="text-b-neon">{previewSlug(inputName)}</span>
                  <span className="text-gray-600 ml-1">(imutável após criação)</span>
                </p>
              )}
              {isEdit && (
                <p className="font-mono text-[10px] text-gray-600">
                  Pasta: <span className="text-b-stone">{(modal as { gallery: Gallery }).gallery.folder_slug}</span> — imutável
                </p>
              )}
              {error && <p className="font-mono text-xs text-red-400 bg-red-950/30 border border-red-900 px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={closeModal}
                  className="flex-1 border-2 border-b-stone text-gray-400 font-display text-lg uppercase py-3 tracking-widest hover:border-white/40 transition-colors">
                  Cancelar
                </button>
                <button onClick={isCreate ? handleCreate : handleEdit} disabled={saving}
                  className="flex-1 bg-b-orange text-b-dark font-display text-lg uppercase py-3 tracking-widest shadow-brutal hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50">
                  {saving ? 'Salvando...' : isCreate ? 'Criar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Spinner() {
  return <p className="font-mono text-gray-500 text-sm uppercase animate-pulse mt-4">Carregando...</p>
}

// ─── Aba: Mídia (Hero + Equipe) ───────────────────────────────────────────────

const MEDIA_SECTIONS = [
  { id: 'hero_main',        label: 'Hero Desktop',      multi: true,  accept: 'image/*,video/*', hint: 'Videos horizontais + fotos (telas grandes)' },
  { id: 'hero_main_mobile', label: 'Hero Mobile',       multi: true,  accept: 'image/*,video/*', hint: 'Videos verticais + fotos (celulares)' },
  { id: 'hero_baskferia',   label: 'Hero Baskferia',    multi: true,  accept: 'image/*,video/*', hint: '' },
  { id: 'person_thiago',    label: 'Foto - Thiago',     multi: false, accept: 'image/*',         hint: '' },
  { id: 'person_geovani',   label: 'Foto - Geovani',    multi: false, accept: 'image/*',         hint: '' },
  { id: 'person_ivan',      label: 'Foto - Ivan',       multi: false, accept: 'image/*',         hint: '' },
]

function TabMidia() {
  const [activeSection, setActiveSection] = useState(MEDIA_SECTIONS[0].id)
  const [items, setItems]                 = useState<SiteMediaItem[]>([])
  const [loading, setLoading]             = useState(false)
  const [uploading, setUploading]         = useState(false)
  const [progress, setProgress]           = useState(0)
  const [error, setError]                 = useState<string | null>(null)

  const sectionMeta = MEDIA_SECTIONS.find(s => s.id === activeSection)!

  const loadSection = useCallback(async (section: string) => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`/api/admin/site-media?section=${section}`)
      const d = await r.json()
      setItems(d.media ?? [])
    } catch {
      setError('Erro ao carregar midia.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadSection(activeSection) }, [activeSection, loadSection])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const sigRes = await fetch(`/api/admin/sign-media?section=${activeSection}`)
      if (!sigRes.ok) throw new Error('Falha ao obter assinatura')
      const sig = await sigRes.json()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', sig.api_key)
      formData.append('timestamp', sig.timestamp)
      formData.append('signature', sig.signature)
      formData.append('folder', sig.folder)
      // resource_type vai na URL path, não no formData

      const uploadUrl = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/auto/upload`

      const uploadResult = await new Promise<{ secure_url: string; public_id: string; resource_type: string }>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.upload.onprogress = ev => {
            if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 90))
          }
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText))
            } else {
              reject(new Error(`Upload falhou: ${xhr.status}`))
            }
          }
          xhr.onerror = () => reject(new Error('Erro de rede no upload'))
          xhr.open('POST', uploadUrl)
          xhr.send(formData)
        }
      )

      setProgress(95)

      const saveRes = await fetch('/api/admin/site-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: activeSection,
          cloudinary_public_id: uploadResult.public_id,
          cloudinary_url: uploadResult.secure_url,
          resource_type: uploadResult.resource_type === 'video' ? 'video' : 'image',
        }),
      })
      if (!saveRes.ok) throw new Error('Falha ao salvar midia')

      setProgress(100)
      await loadSection(activeSection)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta midia?')) return
    const r = await fetch(`/api/admin/site-media/${id}`, { method: 'DELETE' })
    if (r.ok) setItems(prev => prev.filter(i => i.id !== id))
    else setError('Erro ao remover.')
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl uppercase text-white mb-1">Midia do Site</h2>
        <p className="font-mono text-xs text-gray-500 uppercase tracking-wider">
          Configure imagens e videos das secoes hero e da equipe
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {MEDIA_SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`font-mono text-xs uppercase px-4 py-2 border transition-all ${
              activeSection === s.id
                ? 'border-b-orange text-b-orange bg-b-orange/10'
                : 'border-b-stone text-gray-400 hover:border-white hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl uppercase text-white">{sectionMeta.label}</h3>
          {sectionMeta.hint && (
            <p className="font-mono text-xs text-b-neon mt-1">{sectionMeta.hint}</p>
          )}
          {!sectionMeta.multi && (
            <p className="font-mono text-xs text-b-orange mt-1">
              Secao de foto unica - novo upload substitui o anterior
            </p>
          )}
        </div>
        <label className={`cursor-pointer font-display text-sm uppercase px-6 py-3 tracking-wider transition-all ${
          uploading
            ? 'bg-b-stone/40 text-gray-500 cursor-not-allowed'
            : 'bg-b-orange text-b-dark hover:opacity-90 shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1'
        }`}>
          {uploading ? `Enviando ${progress}%` : '+ Adicionar'}
          <input type="file" accept={sectionMeta.accept} className="hidden" disabled={uploading} onChange={handleUpload} />
        </label>
      </div>

      {uploading && (
        <div className="mb-6 h-1 bg-b-stone rounded overflow-hidden">
          <div className="h-full bg-b-orange transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && <p className="mb-4 font-mono text-xs text-red-400 uppercase">{error}</p>}

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className="border border-dashed border-b-stone rounded p-12 text-center">
          <p className="font-mono text-gray-600 text-sm uppercase">Nenhuma midia configurada</p>
          <p className="font-mono text-gray-700 text-xs mt-2">Clique em + Adicionar para fazer upload</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <div key={item.id} className="relative group border border-b-stone bg-b-gray overflow-hidden">
              <div className="aspect-video relative bg-black">
                {item.resource_type === 'video' ? (
                  <video
                    src={item.cloudinary_url}
                    className="w-full h-full object-cover opacity-80"
                    muted
                    playsInline
                    onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
                    onMouseLeave={e => { const v = e.currentTarget as HTMLVideoElement; v.pause(); v.currentTime = 0 }}
                  />
                ) : (
                  <img src={item.cloudinary_url} alt="" className="w-full h-full object-cover" />
                )}
                <span className="absolute top-2 left-2 font-mono text-[10px] uppercase px-2 py-0.5 bg-black/70 text-gray-300">
                  {item.resource_type === 'video' ? 'video' : 'imagem'}
                </span>
                {sectionMeta.multi && (
                  <span className="absolute top-2 right-2 font-mono text-[10px] px-2 py-0.5 bg-b-orange/90 text-b-dark font-bold">
                    #{i + 1}
                  </span>
                )}
              </div>
              <div className="p-2 flex justify-end">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="font-mono text-[11px] uppercase text-red-500 hover:text-red-300 px-2 py-1 border border-red-900/40 hover:border-red-500 transition-all"
                >
                  X Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── TabAudio ─────────────────────────────────────────────────────────────────

interface AudioTrack {
  id: string
  name: string
  cloudinary_url: string
  sort_order: number
}

interface AudioSection {
  id: 'homepage' | 'baskferia'
  label: string
}

const AUDIO_SECTIONS: AudioSection[] = [
  { id: 'homepage',  label: 'Playlist — Página Principal' },
  { id: 'baskferia', label: 'Playlist — Baskferia' },
]

function TabAudio() {
  const [tracks, setTracks]     = useState<Record<string, AudioTrack[]>>({ homepage: [], baskferia: [] })
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const [hp, bk] = await Promise.all([
      fetch('/api/admin/site-audio?section=homepage').then(r => r.json()),
      fetch('/api/admin/site-audio?section=baskferia').then(r => r.json()),
    ])
    setTracks({ homepage: hp.tracks ?? [], baskferia: bk.tracks ?? [] })
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleUpload(section: 'homepage' | 'baskferia', file: File, name: string) {
    setUploading(u => ({ ...u, [section]: true }))
    try {
      const sigRes = await fetch(`/api/admin/sign-audio?section=${section}`)
      const sig    = await sigRes.json()
      if (!sigRes.ok) throw new Error(sig.error)

      const fd = new FormData()
      fd.append('file', file)
      fd.append('api_key',   sig.api_key)
      fd.append('timestamp', sig.timestamp)
      fd.append('signature', sig.signature)
      fd.append('folder',    sig.folder)

      const up = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/auto/upload`,
        { method: 'POST', body: fd }
      )
      const upData = await up.json()
      if (!up.ok) throw new Error(upData.error?.message ?? 'Upload falhou')

      await fetch('/api/admin/site-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          name,
          cloudinary_public_id: upData.public_id,
          cloudinary_url:       upData.secure_url,
        }),
      })
      await load()
    } catch (e) {
      alert('Erro no upload: ' + (e as Error).message)
    } finally {
      setUploading(u => ({ ...u, [section]: false }))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta faixa?')) return
    await fetch(`/api/admin/site-audio/${id}`, { method: 'DELETE' })
    await load()
  }

  async function handleRename(id: string, name: string) {
    await fetch(`/api/admin/site-audio/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setEditingId(null)
    await load()
  }

  async function handleMove(section: string, id: string, direction: 'up' | 'down') {
    const list = [...tracks[section]]
    const i    = list.findIndex(t => t.id === id)
    const j    = direction === 'up' ? i - 1 : i + 1
    if (j < 0 || j >= list.length) return

    const tmp = list[i]; list[i] = list[j]; list[j] = tmp

    await Promise.all(
      list.map((t, idx) =>
        fetch(`/api/admin/site-audio/${t.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sort_order: idx }),
        })
      )
    )
    await load()
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-12">
      {AUDIO_SECTIONS.map(sec => {
        const list = tracks[sec.id] ?? []
        return (
          <div key={sec.id} className="bg-b-gray border border-b-stone/30 p-6">
            <h3 className="font-display text-2xl uppercase text-white mb-1">{sec.label}</h3>
            <p className="font-mono text-xs text-gray-500 mb-6">{list.length} faixa{list.length !== 1 ? 's' : ''}</p>

            {/* Lista de faixas */}
            {list.length > 0 && (
              <div className="space-y-2 mb-6">
                {list.map((track, i) => (
                  <div key={track.id} className="flex items-center gap-3 bg-b-dark border border-b-stone/20 px-4 py-3">
                    <span className="font-mono text-xs text-gray-600 w-5 text-right">{i + 1}</span>

                    {/* Reordenar */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMove(sec.id, track.id, 'up')}
                        disabled={i === 0}
                        className="text-gray-600 hover:text-white disabled:opacity-20 text-xs leading-none"
                      >▲</button>
                      <button
                        onClick={() => handleMove(sec.id, track.id, 'down')}
                        disabled={i === list.length - 1}
                        className="text-gray-600 hover:text-white disabled:opacity-20 text-xs leading-none"
                      >▼</button>
                    </div>

                    {/* Nome (editável) */}
                    {editingId === track.id ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleRename(track.id, editingName)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          className="flex-1 bg-b-stone/20 border border-b-stone px-2 py-1 font-mono text-sm text-white focus:outline-none focus:border-b-orange"
                          autoFocus
                        />
                        <button
                          onClick={() => handleRename(track.id, editingName)}
                          className="font-mono text-xs text-b-neon px-2 py-1 border border-b-neon/40 hover:border-b-neon"
                        >OK</button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="font-mono text-xs text-gray-500 px-2 py-1"
                        >✕</button>
                      </div>
                    ) : (
                      <span
                        className="flex-1 font-body text-white truncate cursor-pointer hover:text-b-orange"
                        onClick={() => { setEditingId(track.id); setEditingName(track.name) }}
                        title="Clique para renomear"
                      >
                        {track.name}
                      </span>
                    )}

                    {/* Preview áudio */}
                    <audio src={track.cloudinary_url} controls className="h-7 w-40 opacity-70" />

                    {/* Remover */}
                    <button
                      onClick={() => handleDelete(track.id)}
                      className="font-mono text-[11px] uppercase text-red-500 hover:text-red-300 px-2 py-1 border border-red-900/40 hover:border-red-500 transition-all shrink-0"
                    >
                      ✕ Remover
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload */}
            <UploadAudioButton
              section={sec.id}
              uploading={!!uploading[sec.id]}
              onUpload={handleUpload}
            />
          </div>
        )
      })}
    </div>
  )
}

function UploadAudioButton({
  section,
  uploading,
  onUpload,
}: {
  section: 'homepage' | 'baskferia'
  uploading: boolean
  onUpload: (section: 'homepage' | 'baskferia', file: File, name: string) => void
}) {
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    if (!name) setName(f.name.replace(/\.[^/.]+$/, ''))
  }

  function handleSubmit() {
    if (!file || !name.trim()) return
    onUpload(section, file, name.trim())
    setFile(null)
    setName('')
  }

  return (
    <div className="border border-dashed border-b-stone/40 p-4 space-y-3">
      <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">Adicionar faixa</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.flac"
          onChange={handleFile}
          className="font-mono text-xs text-gray-400 file:bg-b-stone/30 file:border-0 file:text-white file:font-mono file:text-xs file:px-3 file:py-1 file:mr-3 file:cursor-pointer"
        />
        <input
          type="text"
          placeholder="Nome da faixa"
          value={name}
          onChange={e => setName(e.target.value)}
          className="flex-1 bg-b-stone/20 border border-b-stone px-3 py-1.5 font-mono text-sm text-white placeholder-gray-600 focus:outline-none focus:border-b-orange"
        />
        <button
          onClick={handleSubmit}
          disabled={!file || !name.trim() || uploading}
          className="font-display uppercase text-sm px-4 py-1.5 bg-b-neon text-b-dark disabled:opacity-40 disabled:cursor-not-allowed hover:bg-b-neon/80 transition-all shrink-0"
        >
          {uploading ? 'Enviando…' : 'Enviar'}
        </button>
      </div>
      {file && (
        <p className="font-mono text-xs text-gray-500">
          Arquivo: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </p>
      )}
    </div>
  )
}

// ─── TabNoticias ──────────────────────────────────────────────────────────────

interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_url: string | null
  published: boolean
  published_at: string | null
  created_at: string
}

interface NewsForm {
  title: string
  slug: string
  excerpt: string
  content: string
  cover_url: string
  cover_public_id: string
  published: boolean
}

interface InlineImage {
  id: string
  cloudinary_url: string
  sort_order: number
  caption: string
}

const EMPTY_FORM: NewsForm = {
  title: '', slug: '', excerpt: '', content: '',
  cover_url: '', cover_public_id: '', published: false,
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function TabNoticias() {
  const [news, setNews]                       = useState<NewsItem[]>([])
  const [loading, setLoading]                 = useState(true)
  const [view, setView]                       = useState<'list' | 'form'>('list')
  const [editId, setEditId]                   = useState<string | null>(null)
  const [form, setForm]                       = useState<NewsForm>(EMPTY_FORM)
  const [saving, setSaving]                   = useState(false)
  const [uploadingCover, setUploadingCover]   = useState(false)
  const [homeCount, setHomeCount]             = useState(3)
  const [savingCount, setSavingCount]         = useState(false)
  const [inlineImages, setInlineImages]       = useState<InlineImage[]>([])
  const [uploadingInline, setUploadingInline] = useState(false)
  const [editCaption, setEditCaption]         = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    const [newsRes, configRes] = await Promise.all([
      fetch('/api/admin/news'),
      fetch('/api/admin/site-config'),
    ])
    const { news: n } = await newsRes.json()
    const { config }  = await configRes.json()
    setNews(n ?? [])
    setHomeCount(parseInt(config?.home_news_count ?? '3', 10))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function loadInlineImages(id: string) {
    const res = await fetch(`/api/admin/news/${id}/images`)
    const { images } = await res.json()
    const imgs: InlineImage[] = images ?? []
    setInlineImages(imgs)
    const caps: Record<string, string> = {}
    imgs.forEach((img: InlineImage) => { caps[img.id] = img.caption ?? '' })
    setEditCaption(caps)
  }

  function openNew() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setInlineImages([])
    setEditCaption({})
    setView('form')
  }

  function openEdit(item: NewsItem & { content?: string }) {
    setEditId(item.id)
    setForm({
      title:           item.title,
      slug:            item.slug,
      excerpt:         item.excerpt ?? '',
      content:         item.content ?? '',
      cover_url:       item.cover_url ?? '',
      cover_public_id: '',
      published:       item.published,
    })
    setInlineImages([])
    setEditCaption({})
    loadInlineImages(item.id)
    setView('form')
  }

  async function loadFull(id: string) {
    const res = await fetch(`/api/admin/news/${id}`)
    const { news: item } = await res.json()
    if (item) openEdit(item)
  }

  function setField<K extends keyof NewsForm>(key: K, value: NewsForm[K]) {
    setForm(f => {
      const next = { ...f, [key]: value }
      if (key === 'title' && !editId) next.slug = slugify(value as string)
      return next
    })
  }

  async function handleCoverUpload(file: File) {
    setUploadingCover(true)
    try {
      const sig    = await fetch('/api/admin/sign-media?section=news_cover').then(r => r.json())
      const fd     = new FormData()
      fd.append('file', file); fd.append('api_key', sig.api_key)
      fd.append('timestamp', sig.timestamp); fd.append('signature', sig.signature)
      fd.append('folder', sig.folder)
      const up     = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`, { method: 'POST', body: fd })
      const upData = await up.json()
      if (!up.ok) throw new Error(upData.error?.message ?? 'Upload falhou')
      setForm(f => ({ ...f, cover_url: upData.secure_url, cover_public_id: upData.public_id }))
    } catch (e) { alert('Erro no upload: ' + (e as Error).message) }
    finally { setUploadingCover(false) }
  }

  async function handleInlineUpload(file: File) {
    if (!editId) return
    setUploadingInline(true)
    try {
      const sig    = await fetch('/api/admin/sign-media?section=news_inline').then(r => r.json())
      const fd     = new FormData()
      fd.append('file', file); fd.append('api_key', sig.api_key)
      fd.append('timestamp', sig.timestamp); fd.append('signature', sig.signature)
      fd.append('folder', sig.folder)
      const up     = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`, { method: 'POST', body: fd })
      const upData = await up.json()
      if (!up.ok) throw new Error(upData.error?.message ?? 'Upload falhou')
      await fetch(`/api/admin/news/${editId}/images`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloudinary_url: upData.secure_url, cloudinary_public_id: upData.public_id }),
      })
      await loadInlineImages(editId)
    } catch (e) { alert('Erro no upload: ' + (e as Error).message) }
    finally { setUploadingInline(false) }
  }

  async function handleInlineDelete(imgId: string) {
    if (!editId || !confirm('Remover esta foto?')) return
    await fetch(`/api/admin/news/${editId}/images/${imgId}`, { method: 'DELETE' })
    await loadInlineImages(editId)
  }

  async function handleInlineReorder(imgId: string, dir: 'up' | 'down') {
    if (!editId) return
    const idx  = inlineImages.findIndex(i => i.id === imgId)
    const swap = dir === 'up' ? idx - 1 : idx + 1
    if (swap < 0 || swap >= inlineImages.length) return
    const next = [...inlineImages];
    [next[idx], next[swap]] = [next[swap], next[idx]]
    setInlineImages(next.map((img, i) => ({ ...img, sort_order: i })))
    await fetch(`/api/admin/news/${editId}/images`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: next.map(i => i.id) }),
    })
  }

  async function handleSaveCaption(imgId: string) {
    if (!editId) return
    await fetch(`/api/admin/news/${editId}/images/${imgId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption: editCaption[imgId] ?? '' }),
    })
  }

  async function handleSave() {
    if (!form.title || !form.slug) { alert('Título e slug são obrigatórios.'); return }
    setSaving(true)
    try {
      const url    = editId ? `/api/admin/news/${editId}` : '/api/admin/news'
      const method = editId ? 'PATCH' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setView('list'); await load()
    } catch (e) { alert('Erro ao salvar: ' + (e as Error).message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Excluir "${title}"?`)) return
    await fetch(`/api/admin/news/${id}`, { method: 'DELETE' })
    await load()
  }

  async function handleTogglePublish(item: NewsItem) {
    await fetch(`/api/admin/news/${item.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !item.published }),
    })
    await load()
  }

  async function handleSaveCount() {
    setSavingCount(true)
    await fetch('/api/admin/site-config', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ home_news_count: String(homeCount) }),
    })
    setSavingCount(false)
  }

  if (loading) return <Spinner />

  // ── Formulário ──────────────────────────────────────────────────────────
  if (view === 'form') {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl uppercase text-white">
            {editId ? 'Editar Notícia' : 'Nova Notícia'}
          </h3>
          <button onClick={() => setView('list')} className="font-mono text-xs text-gray-500 hover:text-white transition-colors">← Voltar</button>
        </div>

        <div>
          <label className="font-mono text-xs text-gray-500 uppercase tracking-widest block mb-1">Título *</label>
          <input value={form.title} onChange={e => setField('title', e.target.value)}
            className="w-full bg-b-stone/20 border border-b-stone px-3 py-2 font-body text-white focus:outline-none focus:border-b-orange" />
        </div>

        <div>
          <label className="font-mono text-xs text-gray-500 uppercase tracking-widest block mb-1">Slug (URL) *</label>
          <input value={form.slug} onChange={e => setField('slug', e.target.value)}
            className="w-full bg-b-stone/20 border border-b-stone px-3 py-2 font-mono text-sm text-b-neon focus:outline-none focus:border-b-orange" />
          <p className="font-mono text-[10px] text-gray-600 mt-1">/noticias/{form.slug || '...'}</p>
        </div>

        <div>
          <label className="font-mono text-xs text-gray-500 uppercase tracking-widest block mb-1">Resumo (opcional)</label>
          <textarea value={form.excerpt} onChange={e => setField('excerpt', e.target.value)} rows={2}
            className="w-full bg-b-stone/20 border border-b-stone px-3 py-2 font-body text-white focus:outline-none focus:border-b-orange resize-none" />
        </div>

        <div>
          <label className="font-mono text-xs text-gray-500 uppercase tracking-widest block mb-2">Imagem de Capa</label>
          {form.cover_url && <img src={form.cover_url} alt="capa" className="w-48 h-28 object-cover mb-3 border border-b-stone/30" />}
          <input type="file" accept="image/*"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f) }}
            className="font-mono text-xs text-gray-400 file:bg-b-stone/30 file:border-0 file:text-white file:font-mono file:text-xs file:px-3 file:py-1 file:mr-3 file:cursor-pointer" />
          {uploadingCover && <span className="font-mono text-xs text-b-neon ml-3">Enviando…</span>}
        </div>

        <div>
          <label className="font-mono text-xs text-gray-500 uppercase tracking-widest block mb-1">
            Conteúdo (Markdown) — use &lt;IMG&gt; para inserir fotos do corpo
          </label>
          <textarea value={form.content} onChange={e => setField('content', e.target.value)} rows={16}
            placeholder={'# Título\n\nParágrafo inicial...\n\n<IMG>\n\nContinua o texto...'}
            className="w-full bg-b-stone/20 border border-b-stone px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-b-orange resize-y" />
        </div>

        {/* Fotos do corpo */}
        <div className="border border-b-stone/40 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <label className="font-mono text-xs text-gray-500 uppercase tracking-widest">
              Fotos do corpo ({inlineImages.length})
            </label>
            {editId ? (
              <label className="cursor-pointer font-mono text-xs uppercase px-3 py-1.5 bg-b-stone/30 text-white hover:bg-b-stone/50 transition-all">
                {uploadingInline ? 'Enviando…' : '+ Adicionar foto'}
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleInlineUpload(f); e.target.value = '' }}
                  disabled={uploadingInline} />
              </label>
            ) : (
              <span className="font-mono text-[11px] text-gray-600">Salve a notícia primeiro</span>
            )}
          </div>

          {inlineImages.length === 0 ? (
            <p className="font-mono text-[11px] text-gray-600">
              Nenhuma foto. Use &lt;IMG&gt; no conteúdo para marcar posições.
            </p>
          ) : (
            <div className="space-y-3">
              {inlineImages.map((img, idx) => (
                <div key={img.id} className="bg-b-stone/20 p-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-gray-600 w-5 shrink-0 text-center">{idx + 1}</span>
                    <img src={img.cloudinary_url} alt="" className="w-28 h-16 object-cover shrink-0 border border-b-stone/30" />
                    <div className="flex flex-col gap-1 shrink-0">
                      <button onClick={() => handleInlineReorder(img.id, 'up')} disabled={idx === 0}
                        className="font-mono text-[10px] px-2 py-0.5 border border-b-stone/40 text-gray-500 hover:text-white disabled:opacity-20">▲</button>
                      <button onClick={() => handleInlineReorder(img.id, 'down')} disabled={idx === inlineImages.length - 1}
                        className="font-mono text-[10px] px-2 py-0.5 border border-b-stone/40 text-gray-500 hover:text-white disabled:opacity-20">▼</button>
                    </div>
                    <button onClick={() => handleInlineDelete(img.id)}
                      className="ml-auto font-mono text-xs text-red-500 hover:text-red-300 px-2 py-1 border border-red-900/40 hover:border-red-500 transition-all">
                      Remover
                    </button>
                  </div>
                  <div className="flex gap-2 items-center pl-8">
                    <input
                      type="text"
                      placeholder="Legenda (ex: Foto: João Silva / Coyotes)"
                      value={editCaption[img.id] ?? ''}
                      onChange={e => setEditCaption(c => ({ ...c, [img.id]: e.target.value }))}
                      className="flex-1 bg-b-stone/20 border border-b-stone/40 px-2 py-1 font-mono text-xs text-gray-300 focus:outline-none focus:border-b-orange placeholder:text-gray-600"
                    />
                    <button onClick={() => handleSaveCaption(img.id)}
                      className="font-mono text-[11px] uppercase px-2 py-1 bg-b-stone/40 text-white hover:bg-b-orange hover:text-b-dark transition-all">
                      Salvar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.published} onChange={e => setField('published', e.target.checked)} className="w-4 h-4 accent-b-orange" />
          <span className="font-body text-white">Publicar imediatamente</span>
        </label>

        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving}
            className="font-display uppercase px-6 py-2 bg-b-orange text-b-dark hover:bg-b-neon transition-all disabled:opacity-40">
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
          <button onClick={() => setView('list')}
            className="font-display uppercase px-6 py-2 border border-b-stone text-gray-400 hover:text-white hover:border-white transition-all">
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  // ── Lista ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      <div className="bg-b-gray border border-b-stone/30 p-5 flex items-center gap-4 flex-wrap">
        <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">Notícias na home:</span>
        <input type="number" min={1} max={12} value={homeCount}
          onChange={e => setHomeCount(parseInt(e.target.value, 10))}
          className="w-20 bg-b-stone/20 border border-b-stone px-3 py-1.5 font-mono text-white text-center focus:outline-none focus:border-b-orange" />
        <button onClick={handleSaveCount} disabled={savingCount}
          className="font-mono text-xs uppercase px-3 py-1.5 bg-b-orange text-b-dark disabled:opacity-40 hover:bg-b-neon transition-all">
          {savingCount ? 'Salvando…' : 'Salvar'}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl uppercase text-white">{news.length} notícia{news.length !== 1 ? 's' : ''}</h3>
        <button onClick={openNew}
          className="font-display uppercase text-sm px-4 py-2 bg-b-neon text-b-dark hover:bg-b-neon/80 transition-all">
          + Nova Notícia
        </button>
      </div>

      {news.length === 0 ? (
        <p className="font-body text-gray-600">Nenhuma notícia ainda.</p>
      ) : (
        <div className="space-y-3">
          {news.map(item => (
            <div key={item.id} className="flex items-center gap-4 bg-b-gray border border-b-stone/20 px-4 py-3">
              {item.cover_url && <img src={item.cover_url} alt="" className="w-16 h-10 object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-body text-white truncate">{item.title}</p>
                <p className="font-mono text-[10px] text-gray-600">/noticias/{item.slug}</p>
              </div>
              <span className={`font-mono text-[10px] uppercase px-2 py-0.5 shrink-0 ${item.published ? 'bg-b-neon/20 text-b-neon border border-b-neon/30' : 'bg-b-stone/30 text-gray-500 border border-b-stone/30'}`}>
                {item.published ? 'Publicado' : 'Rascunho'}
              </span>
              <button onClick={() => handleTogglePublish(item)}
                className="font-mono text-[11px] uppercase px-2 py-1 border border-b-stone/40 text-gray-500 hover:text-white hover:border-white transition-all shrink-0">
                {item.published ? 'Despublicar' : 'Publicar'}
              </button>
              <button onClick={() => loadFull(item.id)}
                className="font-mono text-[11px] uppercase px-2 py-1 border border-b-orange/40 text-b-orange hover:border-b-orange transition-all shrink-0">
                Editar
              </button>
              <button onClick={() => handleDelete(item.id, item.title)}
                className="font-mono text-[11px] uppercase px-2 py-1 border border-red-900/40 text-red-500 hover:text-red-300 hover:border-red-500 transition-all shrink-0">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── TabMembros ──────────────────────────────────────────────────────────────

interface MemberAdmin {
  id: string
  name: string
  height: string
  neighborhood: string
  city: string
  started_month: number
  started_year: number
  photo_url: string
  approved: boolean
  role: string
  created_at: string
}

interface MemberEditForm {
  name: string
  height: string
  neighborhood: string
  city: string
  started_month: string
  started_year: string
}

const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function TabMembros() {
  const [members, setMembers]     = useState<MemberAdmin[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState<'pending' | 'approved'>('pending')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm]   = useState<MemberEditForm>({ name:'', height:'', neighborhood:'', city:'', started_month:'', started_year:'' })
  const [saving, setSaving]       = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { members: m } = await fetch('/api/admin/members').then(r => r.json())
    setMembers(m ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function startEdit(m: MemberAdmin) {
    setEditingId(m.id)
    setEditForm({
      name:          m.name,
      height:        m.height,
      neighborhood:  m.neighborhood,
      city:          m.city,
      started_month: String(m.started_month),
      started_year:  String(m.started_year),
    })
  }

  async function handleSaveEdit(id: string) {
    setSaving(true)
    await fetch(`/api/admin/members/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:          editForm.name.trim(),
        height:        editForm.height.trim(),
        neighborhood:  editForm.neighborhood.trim(),
        city:          editForm.city.trim(),
        started_month: parseInt(editForm.started_month, 10) || null,
        started_year:  parseInt(editForm.started_year, 10)  || null,
      }),
    })
    setSaving(false)
    setEditingId(null)
    await load()
  }

  async function handleApprove(id: string) {
    await fetch(`/api/admin/members/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: true }),
    })
    await load()
  }

  async function handleToggleRole(m: MemberAdmin) {
    const newRole = m.role === 'organizador' ? 'membro' : 'organizador'
    await fetch(`/api/admin/members/${m.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    await load()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir membro "${name}"?`)) return
    await fetch(`/api/admin/members/${id}`, { method: 'DELETE' })
    await load()
  }

  if (loading) return <Spinner />

  const pending  = members.filter(m => !m.approved)
  const approved = members.filter(m =>  m.approved)
  const list     = filter === 'pending' ? pending : approved

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-3">
        {([['pending','Pendentes', pending.length], ['approved','Aprovados', approved.length]] as const).map(([k, label, count]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`font-mono text-xs uppercase px-4 py-2 border transition-all ${
              filter === k
                ? 'border-b-orange text-b-orange bg-b-orange/10'
                : 'border-b-stone/40 text-gray-500 hover:text-white'
            }`}>
            {label} ({count})
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="font-body text-gray-600">{filter === 'pending' ? 'Nenhum cadastro pendente.' : 'Nenhum membro aprovado.'}</p>
      ) : (
        <div className="space-y-3">
          {list.map(m => (
            <div key={m.id} className="bg-b-gray border border-b-stone/20">
              {/* Linha principal */}
              <div className="flex items-center gap-4 px-4 py-3">
                {m.photo_url && (
                  <img src={m.photo_url} alt={m.name} className="w-12 h-14 object-cover object-top shrink-0 border border-b-stone/30" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-body text-white">{m.name}</p>
                    {m.approved && m.role === 'organizador' && (
                      <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-b-orange/20 border border-b-orange/50 text-b-orange tracking-widest">
                        Organizador
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-gray-600 uppercase">
                    {m.height} · {m.city} · {m.neighborhood} · desde {MONTHS_SHORT[(m.started_month ?? 1) - 1]}/{m.started_year}
                  </p>
                </div>
                {!m.approved && (
                  <button onClick={() => handleApprove(m.id)}
                    className="font-mono text-[11px] uppercase px-3 py-1 bg-b-neon/20 border border-b-neon/40 text-b-neon hover:bg-b-neon hover:text-b-dark transition-all shrink-0">
                    Aprovar
                  </button>
                )}
                {m.approved && (
                  <button onClick={() => handleToggleRole(m)}
                    className={`font-mono text-[11px] uppercase px-2 py-1 border transition-all shrink-0 ${
                      m.role === 'organizador'
                        ? 'border-b-orange/60 text-b-orange hover:bg-b-orange/10'
                        : 'border-b-stone/40 text-gray-400 hover:border-b-orange hover:text-b-orange'
                    }`}>
                    {m.role === 'organizador' ? 'Rebaixar' : 'Promover'}
                  </button>
                )}
                <button onClick={() => editingId === m.id ? setEditingId(null) : startEdit(m)}
                  className="font-mono text-[11px] uppercase px-2 py-1 border border-b-orange/40 text-b-orange hover:border-b-orange transition-all shrink-0">
                  {editingId === m.id ? 'Fechar' : 'Editar'}
                </button>
                <button onClick={() => handleDelete(m.id, m.name)}
                  className="font-mono text-[11px] uppercase px-2 py-1 border border-red-900/40 text-red-500 hover:text-red-300 hover:border-red-500 transition-all shrink-0">
                  ✕
                </button>
              </div>

              {/* Formulário de edição inline */}
              {editingId === m.id && (
                <div className="border-t border-b-stone/20 bg-b-dark/40 px-4 py-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="font-mono text-[10px] uppercase text-gray-500 mb-1 block">Nome</span>
                      <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full bg-b-stone/20 border border-b-stone px-3 py-1.5 font-body text-white text-sm focus:outline-none focus:border-b-orange" />
                    </label>
                    <label className="block">
                      <span className="font-mono text-[10px] uppercase text-gray-500 mb-1 block">Altura</span>
                      <input value={editForm.height} onChange={e => setEditForm(f => ({ ...f, height: e.target.value }))}
                        placeholder="ex: 1.82m"
                        className="w-full bg-b-stone/20 border border-b-stone px-3 py-1.5 font-body text-white text-sm focus:outline-none focus:border-b-orange" />
                    </label>
                    <label className="block">
                      <span className="font-mono text-[10px] uppercase text-gray-500 mb-1 block">Cidade</span>
                      <input value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                        className="w-full bg-b-stone/20 border border-b-stone px-3 py-1.5 font-body text-white text-sm focus:outline-none focus:border-b-orange" />
                    </label>
                    <label className="block">
                      <span className="font-mono text-[10px] uppercase text-gray-500 mb-1 block">Bairro</span>
                      <input value={editForm.neighborhood} onChange={e => setEditForm(f => ({ ...f, neighborhood: e.target.value }))}
                        className="w-full bg-b-stone/20 border border-b-stone px-3 py-1.5 font-body text-white text-sm focus:outline-none focus:border-b-orange" />
                    </label>
                    <label className="block">
                      <span className="font-mono text-[10px] uppercase text-gray-500 mb-1 block">Mês início (1–12)</span>
                      <input type="number" min={1} max={12} value={editForm.started_month}
                        onChange={e => setEditForm(f => ({ ...f, started_month: e.target.value }))}
                        className="w-full bg-b-stone/20 border border-b-stone px-3 py-1.5 font-mono text-white text-sm focus:outline-none focus:border-b-orange" />
                    </label>
                    <label className="block">
                      <span className="font-mono text-[10px] uppercase text-gray-500 mb-1 block">Ano início</span>
                      <input type="number" min={2000} max={2099} value={editForm.started_year}
                        onChange={e => setEditForm(f => ({ ...f, started_year: e.target.value }))}
                        className="w-full bg-b-stone/20 border border-b-stone px-3 py-1.5 font-mono text-white text-sm focus:outline-none focus:border-b-orange" />
                    </label>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => handleSaveEdit(m.id)} disabled={saving}
                      className="font-display uppercase text-sm px-5 py-2 bg-b-orange text-b-dark hover:bg-b-neon transition-all disabled:opacity-40">
                      {saving ? 'Salvando…' : 'Salvar'}
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="font-display uppercase text-sm px-5 py-2 border border-b-stone text-gray-400 hover:text-white hover:border-white transition-all">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── TabFeedbacks ─────────────────────────────────────────────────────────────

interface FeedbackEntry {
  id: string
  name: string
  city: string
  photo_url: string
  rating: number | null
  story: string | null
  highlights: string | null
  improvement_points: string | null
  suggestions: string | null
  testimonial_approved: boolean
  approved: boolean
  source: 'coyotes' | 'baskferia'
  created_at: string
}

// ─── helpers de stats ────────────────────────────────────────────────────────

function avg(nums: number[]): number {
  if (!nums.length) return 0
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
}

function dist(nums: number[]): number[] {
  const d = Array(11).fill(0)
  nums.forEach(n => { if (n >= 0 && n <= 10) d[n]++ })
  return d
}

// ─── RatingChart ─────────────────────────────────────────────────────────────

function RatingChart({ ratings, color, label }: { ratings: number[]; color: string; label: string }) {
  const average  = avg(ratings)
  const distData = dist(ratings)
  const maxCount = Math.max(...distData, 1)

  return (
    <div className="bg-b-gray border border-b-stone/20 p-5 space-y-4 flex-1 min-w-0">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500">{label}</p>
          <p className="font-display text-5xl leading-none mt-1" style={{ color }}>
            {ratings.length ? average : '—'}
            {ratings.length > 0 && <span className="font-mono text-base text-gray-600">/10</span>}
          </p>
        </div>
        <p className="font-mono text-xs text-gray-600">{ratings.length} nota{ratings.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Distribuição 0–10 */}
      <div className="space-y-1">
        {distData.map((count, score) => (
          <div key={score} className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-gray-600 w-4 text-right">{score}</span>
            <div className="flex-1 h-3 bg-b-dark/60 overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${(count / maxCount) * 100}%`, background: color, opacity: count ? 1 : 0 }}
              />
            </div>
            <span className="font-mono text-[10px] text-gray-600 w-4">{count || ''}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Mural ────────────────────────────────────────────────────────────────────

function Mural({ items, color, title, icon }: { items: string[]; color: string; title: string; icon: string }) {
  if (items.length === 0) return (
    <div className="bg-b-gray border border-b-stone/20 p-5">
      <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color }}>{icon} {title}</p>
      <p className="font-body text-gray-700 text-sm">Nenhuma resposta ainda.</p>
    </div>
  )

  return (
    <div className="bg-b-gray border border-b-stone/20 p-5">
      <p className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color }}>
        {icon} {title} <span className="text-gray-600 ml-1">({items.length})</span>
      </p>
      <div className="flex flex-wrap gap-3">
        {items.map((text, i) => (
          <div key={i}
            className="bg-b-dark/60 border px-4 py-3 text-sm font-body text-gray-300 leading-relaxed max-w-sm"
            style={{ borderColor: color + '33' }}>
            <span className="font-display text-xl mr-1" style={{ color }}>&ldquo;</span>
            {text}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── TabFeedbacks ─────────────────────────────────────────────────────────────

function TabFeedbacks() {
  const [feedback, setFeedback]   = useState<FeedbackEntry[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState<'all' | 'coyotes' | 'baskferia'>('all')
  const [expanded, setExpanded]   = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { feedback: f } = await fetch('/api/admin/feedback').then(r => r.json())
    setFeedback(f ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleTestimonial(entry: FeedbackEntry) {
    const endpoint = entry.source === 'coyotes'
      ? `/api/admin/members/${entry.id}`
      : `/api/admin/baskferia-participants/${entry.id}`
    await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testimonial_approved: !entry.testimonial_approved }),
    })
    await load()
  }

  if (loading) return <Spinner />

  const coyotesFeed  = feedback.filter(f => f.source === 'coyotes')
  const baskferiaFeed= feedback.filter(f => f.source === 'baskferia')
  const coyotesRatings  = coyotesFeed.filter(f => f.rating != null).map(f => f.rating as number)
  const baskferiaRatings= baskferiaFeed.filter(f => f.rating != null).map(f => f.rating as number)

  const improvements = feedback.filter(f => f.improvement_points?.trim()).map(f => f.improvement_points as string)
  const suggestions  = feedback.filter(f => f.suggestions?.trim()).map(f => f.suggestions as string)

  const list = filter === 'all' ? feedback : feedback.filter(f => f.source === filter)
  const approvedCount = feedback.filter(f => f.testimonial_approved).length

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl uppercase text-white">Feedbacks</h3>
          <p className="font-mono text-xs text-gray-500 mt-1">
            {feedback.length} resposta{feedback.length !== 1 ? 's' : ''} · {approvedCount} depoimento{approvedCount !== 1 ? 's' : ''} publicado{approvedCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* ── Gráficos de notas ── */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3">// notas médias</p>
        <div className="flex gap-4 flex-col sm:flex-row">
          <RatingChart ratings={coyotesRatings} color="#FF5722" label="Coyotes — Treinos" />
          <RatingChart ratings={baskferiaRatings} color="#E0FF00" label="Baskferia — Evento" />
        </div>
      </div>

      {/* ── Mural de melhorias ── */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3">// mural anônimo</p>
        <div className="space-y-4">
          <Mural items={improvements} color="#FF5722" title="Pontos de Melhoria" icon="△" />
          <Mural items={suggestions}  color="#E0FF00" title="Sugestões"          icon="→" />
        </div>
      </div>

      {/* ── Lista individual ── */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">// respostas individuais</p>
          <div className="flex gap-2">
            {([['all','Todos'], ['coyotes','Coyotes'], ['baskferia','Baskferia']] as const).map(([k, lbl]) => (
              <button key={k} onClick={() => setFilter(k)}
                className={`font-mono text-xs uppercase px-3 py-1.5 border transition-all ${
                  filter === k ? 'border-b-orange text-b-orange bg-b-orange/10' : 'border-b-stone/40 text-gray-500 hover:text-white'
                }`}>
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <p className="font-body text-gray-600">Nenhum feedback ainda.</p>
        ) : (
          <div className="space-y-3">
            {list.map(entry => {
              const isOpen   = expanded === entry.id
              const srcColor = entry.source === 'baskferia' ? '#E0FF00' : '#FF5722'
              const text     = entry.story || entry.highlights || ''
              const preview  = text.length > 120 ? text.slice(0, 120) + '…' : text

              return (
                <div key={entry.id} className="bg-b-gray border border-b-stone/20">
                  <div className="flex items-center gap-3 px-4 py-3">
                    {entry.photo_url && (
                      <img src={entry.photo_url} alt={entry.name}
                        className="w-10 h-12 object-cover object-top shrink-0 border border-b-stone/30" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-body text-white text-sm">{entry.name}</p>
                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 border"
                          style={{ borderColor: srcColor, color: srcColor }}>
                          {entry.source}
                        </span>
                        {entry.rating != null && (
                          <span className="font-display text-sm" style={{ color: srcColor }}>
                            {entry.rating}<span className="font-mono text-[9px] text-gray-600">/10</span>
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[10px] text-gray-600 truncate">{preview || '(sem texto)'}</p>
                    </div>
                    <button onClick={() => toggleTestimonial(entry)}
                      className={`font-mono text-[11px] uppercase px-2 py-1 border transition-all shrink-0 ${
                        entry.testimonial_approved
                          ? 'border-b-neon/60 text-b-neon bg-b-neon/10'
                          : 'border-b-stone/40 text-gray-500 hover:border-b-neon hover:text-b-neon'
                      }`}>
                      {entry.testimonial_approved ? '★ Publicado' : '☆ Publicar'}
                    </button>
                    <button onClick={() => setExpanded(isOpen ? null : entry.id)}
                      className="font-mono text-[11px] uppercase px-2 py-1 border border-b-stone/40 text-gray-400 hover:text-white shrink-0">
                      {isOpen ? 'Fechar' : 'Ver tudo'}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="border-t border-b-stone/20 bg-b-dark/30 px-4 py-4 space-y-3">
                      {entry.story && (
                        <div>
                          <p className="font-mono text-[10px] uppercase text-gray-500 mb-1">História</p>
                          <p className="font-body text-gray-300 text-sm leading-relaxed">{entry.story}</p>
                        </div>
                      )}
                      {entry.highlights && (
                        <div>
                          <p className="font-mono text-[10px] uppercase text-gray-500 mb-1">O que foi bom</p>
                          <p className="font-body text-gray-300 text-sm leading-relaxed">{entry.highlights}</p>
                        </div>
                      )}
                      {entry.improvement_points && (
                        <div>
                          <p className="font-mono text-[10px] uppercase text-gray-500 mb-1">Pontos de melhoria</p>
                          <p className="font-body text-gray-300 text-sm leading-relaxed">{entry.improvement_points}</p>
                        </div>
                      )}
                      {entry.suggestions && (
                        <div>
                          <p className="font-mono text-[10px] uppercase text-gray-500 mb-1">Sugestões</p>
                          <p className="font-body text-gray-300 text-sm leading-relaxed">{entry.suggestions}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
