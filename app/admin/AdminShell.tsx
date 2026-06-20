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

type Tab = 'aprovacoes' | 'galerias'

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
          { id: 'galerias',   label: 'Galerias'   },
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
        {tab === 'aprovacoes' ? <TabAprovacoes /> : <TabGalerias />}
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
      console.log('[Approve] OK →', d.to_public_id, d.skipped ? '(skipped)' : '')
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

// ─── Aba: Galerias ────────────────────────────────────────────────────────────

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
