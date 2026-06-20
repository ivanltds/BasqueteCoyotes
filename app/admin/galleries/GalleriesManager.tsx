'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Gallery {
  id: string
  folder_slug: string
  display_name: string
  sort_order: number
  photo_count: number
}

export default function GalleriesManager() {
  const router = useRouter()
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading]     = useState(true)

  // Modal state
  const [modal, setModal] = useState<null | 'create' | { type: 'edit'; gallery: Gallery }>(null)
  const [inputName, setInputName] = useState('')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/galleries')
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setGalleries(data.galleries ?? [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetch_() }, [fetch_])

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
    setSaving(false); closeModal(); fetch_()
  }

  async function handleEdit() {
    if (modal === null || modal === 'create') return
    if (!inputName.trim()) { setError('Nome obrigatório.'); return }
    setSaving(true); setError('')
    const res = await fetch(`/api/admin/galleries/${modal.gallery.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: inputName }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Erro.'); setSaving(false); return }
    setSaving(false); closeModal(); fetch_()
  }

  async function handleDelete(g: Gallery) {
    if (!confirm(`Deletar galeria "${g.display_name}"?\n\nA pasta será removida do Cloudinary. Ela deve estar vazia.`)) return
    const res = await fetch(`/api/admin/galleries/${g.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { alert(data.error ?? 'Erro ao deletar.'); return }
    fetch_()
  }

  async function moveOrder(g: Gallery, direction: 'up' | 'down') {
    const idx    = galleries.findIndex(x => x.id === g.id)
    const target = direction === 'up' ? galleries[idx - 1] : galleries[idx + 1]
    if (!target) return

    await Promise.all([
      fetch(`/api/admin/galleries/${g.id}`,      { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sort_order: target.sort_order }) }),
      fetch(`/api/admin/galleries/${target.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sort_order: g.sort_order }) }),
    ])
    fetch_()
  }

  const isCreate = modal === 'create'
  const isEdit   = modal !== null && modal !== 'create'

  return (
    <main className="min-h-screen bg-b-dark text-white">
      {/* Header */}
      <header className="border-b border-b-stone px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="font-mono text-xs text-gray-500 hover:text-b-orange transition-colors uppercase">
            ← Admin
          </Link>
          <span className="text-b-stone">|</span>
          <div>
            <h1 className="font-display text-2xl uppercase">Galerias</h1>
            <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">// gerenciar galerias de fotos</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="bg-b-orange text-b-dark font-display text-sm uppercase px-5 py-2 tracking-widest shadow-brutal hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          + Nova Galeria
        </button>
      </header>

      <div className="px-8 py-10 max-w-3xl mx-auto">
        {loading ? (
          <p className="font-mono text-gray-500 text-sm uppercase animate-pulse">Carregando...</p>
        ) : (
          <div className="space-y-3">
            {galleries.map((g, idx) => (
              <div
                key={g.id}
                className="bg-b-gray border-2 border-b-stone flex items-center gap-4 px-5 py-4"
              >
                {/* Ordenação */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveOrder(g, 'up')}
                    disabled={idx === 0}
                    className="font-mono text-xs text-gray-600 hover:text-white disabled:opacity-20 leading-none"
                  >▲</button>
                  <button
                    onClick={() => moveOrder(g, 'down')}
                    disabled={idx === galleries.length - 1}
                    className="font-mono text-xs text-gray-600 hover:text-white disabled:opacity-20 leading-none"
                  >▼</button>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-display text-xl uppercase text-white">{g.display_name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-mono text-[10px] text-gray-500">
                      pasta: <span className="text-b-neon">{g.folder_slug}</span>
                    </span>
                    <span className="font-mono text-[10px] text-gray-500">
                      {g.photo_count} foto{g.photo_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(g)}
                    className="font-mono text-xs uppercase text-b-orange border border-b-stone px-3 py-1.5 hover:border-b-orange transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(g)}
                    className="font-mono text-xs uppercase text-red-400 border border-b-stone px-3 py-1.5 hover:border-red-800 transition-colors"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}

            {galleries.length === 0 && (
              <div className="border-2 border-dashed border-b-stone p-16 text-center">
                <p className="font-display text-3xl text-gray-700 uppercase">Nenhuma galeria</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal criar / editar */}
      {(isCreate || isEdit) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={closeModal}>
          <div
            className="bg-b-gray border-2 border-b-stone w-full max-w-md shadow-brutal"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-b-stone">
              <h2 className="font-display text-2xl uppercase">
                {isCreate ? 'Nova Galeria' : 'Editar Galeria'}
              </h2>
              <button onClick={closeModal} className="font-mono text-gray-500 hover:text-white text-xl">✕</button>
            </div>

            <div className="p-6 space-y-5">
              <label className="block">
                <span className="font-mono text-xs uppercase text-gray-500 mb-2 block">Nome da Galeria</span>
                <input
                  autoFocus
                  type="text"
                  value={inputName}
                  onChange={e => setInputName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (isCreate ? handleCreate() : handleEdit())}
                  placeholder="Ex: Treinos 2026"
                  className="w-full bg-b-dark border-2 border-b-stone focus:border-b-orange p-3 font-body text-white outline-none transition-colors"
                />
              </label>

              {isCreate && inputName.trim() && (
                <p className="font-mono text-[10px] text-gray-500">
                  Pasta no Cloudinary:{' '}
                  <span className="text-b-neon">
                    {inputName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}
                  </span>
                  <span className="text-gray-600 ml-1">(gerado automaticamente, imutável)</span>
                </p>
              )}

              {isEdit && (
                <p className="font-mono text-[10px] text-gray-600">
                  Pasta no Cloudinary: <span className="text-b-stone">{(modal as { gallery: Gallery }).gallery.folder_slug}</span> — imutável
                </p>
              )}

              {error && (
                <p className="font-mono text-xs text-red-400 bg-red-950/30 border border-red-900 px-3 py-2">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="flex-1 border-2 border-b-stone text-gray-400 font-display text-lg uppercase py-3 tracking-widest hover:border-white/40 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={isCreate ? handleCreate : handleEdit}
                  disabled={saving}
                  className="flex-1 bg-b-orange text-b-dark font-display text-lg uppercase py-3 tracking-widest shadow-brutal hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : isCreate ? 'Criar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
