'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const GALLERY_LABELS: Record<string, string> = {
  antigas:     'Antigas',
  baskferia25: "Baskferia '25",
  jogo:        'Jogos',
}

interface PendingPhoto {
  public_id: string
  secure_url: string
  width: number
  height: number
  created_at: string
  context?: { custom?: { target_gallery?: string } }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [photos, setPhotos]   = useState<PendingPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]       = useState<string | null>(null) // public_id em processamento

  const fetchPending = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/pending')
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setPhotos(data.photos ?? [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchPending() }, [fetchPending])

  async function approve(photo: PendingPhoto) {
    const target = photo.context?.custom?.target_gallery ?? 'antigas'
    setBusy(photo.public_id)
    await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id: photo.public_id, target_gallery: target }),
    })
    setBusy(null)
    fetchPending()
  }

  async function reject(photo: PendingPhoto) {
    if (!confirm('Recusar e apagar esta foto permanentemente?')) return
    setBusy(photo.public_id)
    await fetch('/api/admin/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id: photo.public_id }),
    })
    setBusy(null)
    fetchPending()
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <main className="min-h-screen bg-b-dark text-white">
      {/* Header */}
      <header className="border-b border-b-stone px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl uppercase">Admin · Fotos Pendentes</h1>
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mt-0.5">
            // coyotes do basquetebol
          </p>
        </div>
        <button
          onClick={logout}
          className="font-mono text-xs uppercase text-gray-500 hover:text-b-orange transition-colors border border-b-stone px-4 py-2"
        >
          Sair
        </button>
      </header>

      <div className="px-8 py-10 max-w-7xl mx-auto">
        {loading ? (
          <p className="font-mono text-gray-500 text-sm uppercase animate-pulse">Carregando...</p>
        ) : photos.length === 0 ? (
          <div className="border-2 border-dashed border-b-stone p-20 text-center">
            <p className="font-display text-4xl text-gray-700 uppercase mb-2">Nenhuma foto pendente</p>
            <p className="font-mono text-xs text-gray-600 uppercase">Tudo em dia 🐾</p>
          </div>
        ) : (
          <>
            <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-8">
              {photos.length} foto{photos.length !== 1 ? 's' : ''} aguardando aprovação
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {photos.map(photo => {
                const target = photo.context?.custom?.target_gallery ?? '?'
                const isBusy = busy === photo.public_id

                return (
                  <div
                    key={photo.public_id}
                    className="bg-b-gray border-2 border-b-stone overflow-hidden flex flex-col"
                  >
                    {/* Imagem */}
                    <div className="relative aspect-square bg-b-dark">
                      <Image
                        src={photo.secure_url}
                        alt="Foto pendente"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </div>

                    {/* Meta */}
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase text-gray-500">Destino:</span>
                        <span className="font-display text-sm text-b-neon uppercase">
                          {GALLERY_LABELS[target] ?? target}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-gray-600 truncate">{photo.public_id}</p>

                      {/* Ações */}
                      <div className="flex gap-2 mt-auto pt-2">
                        <button
                          onClick={() => approve(photo)}
                          disabled={isBusy}
                          className="flex-1 bg-b-neon text-b-dark font-display text-sm uppercase py-2 tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40"
                        >
                          {isBusy ? '...' : '✓ Aprovar'}
                        </button>
                        <button
                          onClick={() => reject(photo)}
                          disabled={isBusy}
                          className="flex-1 border-2 border-red-800 text-red-400 font-display text-sm uppercase py-2 tracking-wider hover:bg-red-950 transition-colors disabled:opacity-40"
                        >
                          {isBusy ? '...' : '✕ Recusar'}
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
    </main>
  )
}
