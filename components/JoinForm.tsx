'use client'

import { useRef, useState } from 'react'

const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]
const currentYear = new Date().getFullYear()
const YEARS_COYOTES = Array.from({ length: currentYear - 2008 }, (_, i) => 2009 + i).reverse()

interface BaseFields {
  name: string
  height: string
  neighborhood: string
  city: string
  photo_url: string
  photo_public_id: string
}

interface CoyotesFields extends BaseFields {
  started_month: number
  started_year: number
}

interface Props {
  type: 'coyotes' | 'baskferia'
  onSuccess: () => void
  onClose: () => void
}

export default function JoinForm({ type, onSuccess, onClose }: Props) {
  const [name, setName]               = useState('')
  const [height, setHeight]           = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity]               = useState('')
  const [month, setMonth]             = useState(1)
  const [year, setYear]               = useState(currentYear)
  const [photoFile, setPhotoFile]     = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploading, setUploading]     = useState(false)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function uploadPhoto(): Promise<{ url: string; public_id: string }> {
    if (!photoFile) throw new Error('Selecione uma foto.')
    const section = type === 'coyotes' ? 'member_photo' : 'baskferia_photo'
    const sig     = await fetch(`/api/sign-public?section=${section}`).then(r => r.json())

    const fd = new FormData()
    fd.append('file',      photoFile)
    fd.append('api_key',   sig.api_key)
    fd.append('timestamp', sig.timestamp)
    fd.append('signature', sig.signature)
    fd.append('folder',    sig.folder)

    const res  = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`, { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message ?? 'Upload falhou')
    return { url: data.secure_url, public_id: data.public_id }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!photoFile) { setError('Adicione uma foto.'); return }
    if (!name.trim() || !height.trim() || !neighborhood.trim() || !city.trim())
      { setError('Preencha todos os campos.'); return }

    setUploading(true)
    let photo: { url: string; public_id: string }
    try { photo = await uploadPhoto() }
    catch (err) { setError((err as Error).message); setUploading(false); return }
    setUploading(false)
    setSaving(true)

    try {
      const endpoint = type === 'coyotes' ? '/api/members' : '/api/baskferia-participants'
      const body: Record<string, unknown> = {
        name: name.trim(), height: height.trim(),
        neighborhood: neighborhood.trim(), city: city.trim(),
        photo_url: photo.url, photo_public_id: photo.public_id,
      }
      if (type === 'coyotes') { body.started_month = month; body.started_year = year }

      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      onSuccess()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const busy = uploading || saving
  const busyLabel = uploading ? 'Enviando foto…' : saving ? 'Cadastrando…' : 'Cadastrar'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-b-gray border border-b-stone/40 p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-xl uppercase text-white">
            {type === 'coyotes' ? 'Junte-se à Matilha' : 'Registrar no Baskferia'}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-600 hover:text-white text-lg">✕</button>
        </div>

        {/* Foto */}
        <div>
          <div
            className="relative w-full aspect-square bg-b-stone/30 border-2 border-dashed border-b-stone/50 flex items-center justify-center cursor-pointer overflow-hidden hover:border-b-orange transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            {photoPreview
              ? <img src={photoPreview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
              : <span className="font-mono text-xs text-gray-600 uppercase tracking-widest text-center px-4">
                  Toque aqui para<br />adicionar sua foto
                </span>
            }
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        <div>
          <label className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Nome completo *</label>
          <input value={name} onChange={e => setName(e.target.value)} required
            className="w-full bg-b-stone/20 border border-b-stone px-3 py-2 font-body text-white text-sm focus:outline-none focus:border-b-orange" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Altura *</label>
            <input value={height} onChange={e => setHeight(e.target.value)} placeholder="1.80m" required
              className="w-full bg-b-stone/20 border border-b-stone px-3 py-2 font-body text-white text-sm focus:outline-none focus:border-b-orange" />
          </div>
          <div>
            <label className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Cidade *</label>
            <input value={city} onChange={e => setCity(e.target.value)} required
              className="w-full bg-b-stone/20 border border-b-stone px-3 py-2 font-body text-white text-sm focus:outline-none focus:border-b-orange" />
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Bairro *</label>
          <input value={neighborhood} onChange={e => setNeighborhood(e.target.value)} required
            className="w-full bg-b-stone/20 border border-b-stone px-3 py-2 font-body text-white text-sm focus:outline-none focus:border-b-orange" />
        </div>

        {type === 'coyotes' && (
          <div>
            <label className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block mb-1">
              No Coyotes desde *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select value={month} onChange={e => setMonth(Number(e.target.value))}
                className="bg-b-stone/20 border border-b-stone px-3 py-2 font-body text-white text-sm focus:outline-none focus:border-b-orange">
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <select value={year} onChange={e => setYear(Number(e.target.value))}
                className="bg-b-stone/20 border border-b-stone px-3 py-2 font-body text-white text-sm focus:outline-none focus:border-b-orange">
                {YEARS_COYOTES.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        )}

        {error && <p className="font-mono text-xs text-red-400">{error}</p>}

        <button type="submit" disabled={busy}
          className="w-full font-display uppercase py-3 bg-b-orange text-b-dark hover:bg-b-neon transition-all disabled:opacity-50 tracking-widest">
          {busyLabel}
        </button>

        {type === 'coyotes' && (
          <p className="font-mono text-[10px] text-gray-600 text-center">
            Seu cadastro será revisado antes de aparecer no site.
          </p>
        )}
      </form>
    </div>
  )
}
