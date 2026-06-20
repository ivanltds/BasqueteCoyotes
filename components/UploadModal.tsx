'use client'

import { useRef, useState, useEffect } from 'react'

interface GalleryOption { id: string; label: string }

interface UploadModalProps {
  onClose: () => void
}

export default function UploadModal({ onClose }: UploadModalProps) {
  const [galleries, setGalleries] = useState<GalleryOption[]>([])

  useEffect(() => {
    fetch('/api/galleries')
      .then(r => r.json())
      .then(d => setGalleries((d.galleries ?? []).map((g: { folder_slug: string; display_name: string }) => ({ id: g.folder_slug, label: g.display_name }))))
      .catch(() => {})
  }, [])
  const inputRef              = useRef<HTMLInputElement>(null)
  const [target, setTarget]   = useState('')
  const [file, setFile]       = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus]   = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function handleFile(f: File) {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setStatus('idle')
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) handleFile(f)
  }

  async function handleUpload() {
    if (!file) return
    setStatus('uploading')
    setProgress(0)

    // 1. Buscar assinatura no servidor
    const signRes = await fetch(`/api/upload/sign?target=${target}`)
    if (!signRes.ok) { setStatus('error'); setErrorMsg('Erro ao gerar assinatura.'); return }
    const { signature, timestamp, api_key, cloud_name, folder, context } = await signRes.json()

    // 2. Upload direto para o Cloudinary via XHR (suporta progress)
    const form = new FormData()
    form.append('file', file)
    form.append('api_key', api_key)
    form.append('timestamp', timestamp)
    form.append('signature', signature)
    form.append('folder', folder)
    form.append('context', context)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        setStatus('done')
        setProgress(100)
      } else {
        setStatus('error')
        setErrorMsg('Falha no upload. Tente novamente.')
      }
    }

    xhr.onerror = () => { setStatus('error'); setErrorMsg('Erro de rede.') }
    xhr.send(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={onClose}>
      <div
        className="bg-b-gray border-2 border-b-stone w-full max-w-lg shadow-brutal"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-b-stone">
          <h2 className="font-display text-2xl uppercase">Enviar Foto</h2>
          <button onClick={onClose} className="font-mono text-gray-500 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {status === 'done' ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🐾</div>
              <p className="font-display text-2xl uppercase text-b-neon mb-2">Foto enviada!</p>
              <p className="font-body text-gray-400 text-sm mb-6">
                Sua foto está em análise. Ela aparecerá na galeria após aprovação da equipe.
              </p>
              <button
                onClick={onClose}
                className="bg-b-neon text-b-dark font-display text-lg uppercase px-8 py-3 tracking-widest"
              >
                Fechar
              </button>
            </div>
          ) : (
            <>
              {/* Seleção de galeria */}
              <div>
                <span className="font-mono text-xs uppercase text-gray-500 mb-3 block">Para qual galeria?</span>
                {galleries.length === 0 && (
                  <p className="font-mono text-xs text-gray-600 animate-pulse">Carregando galerias...</p>
                )}
                <div className="flex gap-2 flex-wrap">
                  {galleries.map(g => (
                    <button
                      key={g.id}
                      onClick={() => setTarget(g.id)}
                      className={`font-display text-sm uppercase px-4 py-2 border-2 transition-all ${
                        target === g.id
                          ? 'bg-b-orange text-b-dark border-b-orange'
                          : 'border-b-stone text-gray-400 hover:border-white/40'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drop zone */}
              <div
                onDrop={onDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-b-stone hover:border-b-orange transition-colors cursor-pointer p-6 text-center"
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="preview" className="max-h-48 mx-auto object-contain" />
                ) : (
                  <>
                    <p className="font-display text-xl text-gray-500 uppercase mb-1">Arraste a foto aqui</p>
                    <p className="font-mono text-xs text-gray-600">ou clique para selecionar</p>
                  </>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
              </div>

              {file && (
                <p className="font-mono text-xs text-gray-500 truncate">{file.name}</p>
              )}

              {/* Barra de progresso */}
              {status === 'uploading' && (
                <div className="space-y-1">
                  <div className="h-2 bg-b-dark border border-b-stone">
                    <div
                      className="h-full bg-b-neon transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="font-mono text-xs text-gray-500">{progress}%</p>
                </div>
              )}

              {status === 'error' && (
                <p className="font-mono text-xs text-red-400 bg-red-950/30 border border-red-900 px-3 py-2">
                  {errorMsg}
                </p>
              )}

              {/* Aviso */}
              <p className="font-mono text-[10px] text-gray-600 leading-relaxed">
                ⚠ Fotos passam por aprovação antes de aparecer na galeria.
              </p>

              <button
                onClick={handleUpload}
                disabled={!file || !target || status === 'uploading'}
                className="w-full bg-b-orange text-b-dark font-display text-xl uppercase py-4 tracking-widest shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-brutal"
              >
                {status === 'uploading' ? `Enviando... ${progress}%` : 'Enviar Foto'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
