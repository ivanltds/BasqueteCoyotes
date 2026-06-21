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

type Tab = 'aprovacoes' | 'fotos' | 'galerias' | 'midia' | 'audio'

interface SiteMediaItem {
  id: string
  section: string
  cloudinary_public_id: string
  cloudinary_url: string
  resource_type: string
  sort_order: number
}

// ─── Shell principal ───────────────────────────────────────────────────────────

export default function AdminShell() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('aprovacoes')

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-b-dark text-white">
      {/* Header */}
      <header className="border-b border-b-stone px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/images/logos/logo-coyotes.png" alt="Coyotes" width={32} height={32} className="opacity-70" />
          <span className="font-display text-xl uppercase tracking-widest">Admin</span>
        </div>

        <button
          onClick={logout}
          className="font-mono text-xs uppercase text-gray-500 hover:text-red-400 transition-colors border border-b-stone hover:border-red-900 px-4 py-2"
        >
          Sair →
        </button>
      </header>

      {/* Abas */}
      <div className="border-b border-b-stone px-6 flex gap-0">
        {([
          { id: 'aprovacoes', label: 'Aprovações' },
          { id: 'fotos',      label: 'Fotos'      },
          { id: 'galerias',   label: 'Galerias'   },
          { id: 'midia',      label: 'Mídia'      },
          { id: 'audio',      label: 'Áudio'      },
        ] as { id: Tab; label: string }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`font-display text-lg uppercase px-6 py-3 tracking-widest border-b-2 transition-all ${
              tab === t.id
                ? 'border-b-orange text-b-orange'
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {tab === 'aprovacoes' && <TabAprovacoes />}
        {tab === 'fotos'      && <TabFotos />}
        {tab === 'galerias'   && <TabGalerias />}
        {tab === 'midia'      && <TabMidia />}
        {tab === 'audio'      && <TabAudio />}
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
