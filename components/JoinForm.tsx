'use client'

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]
const currentYear = new Date().getFullYear()
const YEARS_COYOTES = Array.from({ length: currentYear - 2008 }, (_, i) => 2009 + i).reverse()

interface Props {
  type: 'coyotes' | 'baskferia'
  onSuccess: () => void
  onClose: () => void
}

export default function JoinForm({ type, onSuccess, onClose }: Props) {
  // Required fields
  const [name, setName]               = useState('')
  const [height, setHeight]           = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity]               = useState('')
  const [month, setMonth]             = useState(1)
  const [year, setYear]               = useState(currentYear)
  const [photoFile, setPhotoFile]     = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Optional feedback
  const [rating, setRating]                 = useState<number | null>(null)
  const [story, setStory]                   = useState('')
  const [highlights, setHighlights]         = useState('')
  const [improvementPoints, setImprovementPoints] = useState('')
  const [suggestions, setSuggestions]       = useState('')

  // State
  const [uploading, setUploading]     = useState(false)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const isBask    = type === 'baskferia'
  const accent    = isBask ? '#E0FF00' : '#FF5722'
  const accentCls = isBask ? 'border-[#E0FF00] text-[#E0FF00] bg-[#E0FF00]' : 'border-b-orange text-b-orange bg-b-orange'

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
    const section = isBask ? 'baskferia_photo' : 'member_photo'
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
      { setError('Preencha todos os campos obrigatórios.'); return }

    setUploading(true)
    let photo: { url: string; public_id: string }
    try { photo = await uploadPhoto() }
    catch (err) { setError((err as Error).message); setUploading(false); return }
    setUploading(false)
    setSaving(true)

    try {
      const endpoint = isBask ? '/api/baskferia-participants' : '/api/members'
      const body: Record<string, unknown> = {
        name: name.trim(), height: height.trim(),
        neighborhood: neighborhood.trim(), city: city.trim(),
        photo_url: photo.url, photo_public_id: photo.public_id,
        rating:            rating,
        story:             story.trim()            || null,
        highlights:        highlights.trim()       || null,
        improvement_points: improvementPoints.trim() || null,
        suggestions:       suggestions.trim()      || null,
      }
      if (!isBask) { body.started_month = month; body.started_year = year }

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

  const busy      = uploading || saving
  const busyLabel = uploading ? 'Enviando foto…' : saving ? 'Cadastrando…' : 'Cadastrar'

  return createPortal(
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/90 py-8 px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm mx-auto bg-b-gray border border-b-stone/40 p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-xl uppercase text-white">
            {isBask ? 'Registrar no Baskferia' : 'Junte-se à Matilha'}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-600 hover:text-white text-lg">✕</button>
        </div>

        {/* Foto */}
        <div>
          <div
            className="relative w-full h-48 bg-b-stone/30 border-2 border-dashed border-b-stone/50 flex items-center justify-center cursor-pointer overflow-hidden hover:border-b-orange transition-colors"
            style={{ borderColor: photoPreview ? accent : undefined }}
            onClick={() => inputRef.current?.click()}
          >
            {photoPreview
              ? <img src={photoPreview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
              : <span className="font-mono text-xs text-gray-600 uppercase tracking-widest text-center px-4">
                  Toque aqui para<br />adicionar sua foto *
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

        {!isBask && (
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

        {/* ── Divider: Feedback opcional ─────────────────────────── */}
        <div className="pt-2 pb-1 border-t border-b-stone/30">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: accent }}>
            Compartilhe sua experiência <span className="text-gray-600">(opcional)</span>
          </p>
        </div>

        {/* Rating 0–10 */}
        <div>
          <label className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
            Nota geral {isBask ? 'do evento' : 'dos treinos'} (0–10)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i} type="button"
                onClick={() => setRating(rating === i ? null : i)}
                className="w-8 h-8 font-mono text-xs border transition-all"
                style={
                  rating === i
                    ? { background: accent, color: '#000', borderColor: accent }
                    : { borderColor: '#444', color: '#888' }
                }
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Story */}
        <div>
          <label className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block mb-1">
            {isBask ? 'Como foi sua participação no Baskferia?' : 'Conta um pouco da sua história no Coyotes'}
          </label>
          <textarea
            value={story} onChange={e => setStory(e.target.value)} rows={3}
            placeholder={isBask ? 'O que o evento significou pra você…' : 'Como você começou, o que o time representa…'}
            className="w-full bg-b-stone/20 border border-b-stone px-3 py-2 font-body text-white text-sm focus:outline-none resize-none"
            style={{ '--tw-ring-color': accent } as React.CSSProperties}
          />
        </div>

        {/* Highlights */}
        <div>
          <label className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block mb-1">O que foi bom?</label>
          <textarea
            value={highlights} onChange={e => setHighlights(e.target.value)} rows={2}
            placeholder="Pontos positivos, momentos marcantes…"
            className="w-full bg-b-stone/20 border border-b-stone px-3 py-2 font-body text-white text-sm focus:outline-none resize-none"
          />
        </div>

        {/* Improvement */}
        <div>
          <label className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Pontos de melhoria</label>
          <textarea
            value={improvementPoints} onChange={e => setImprovementPoints(e.target.value)} rows={2}
            placeholder="O que poderia ser diferente…"
            className="w-full bg-b-stone/20 border border-b-stone px-3 py-2 font-body text-white text-sm focus:outline-none resize-none"
          />
        </div>

        {/* Suggestions */}
        <div>
          <label className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Sugestões</label>
          <textarea
            value={suggestions} onChange={e => setSuggestions(e.target.value)} rows={2}
            placeholder="Ideias para próximas edições ou treinos…"
            className="w-full bg-b-stone/20 border border-b-stone px-3 py-2 font-body text-white text-sm focus:outline-none resize-none"
          />
        </div>

        {error && <p className="font-mono text-xs text-red-400">{error}</p>}

        <button type="submit" disabled={busy}
          className="w-full font-display uppercase py-3 text-b-dark hover:opacity-90 transition-all disabled:opacity-50 tracking-widest"
          style={{ background: accent }}>
          {busyLabel}
        </button>

        {!isBask && (
          <p className="font-mono text-[10px] text-gray-600 text-center">
            Seu cadastro será revisado antes de aparecer no site.
          </p>
        )}
      </form>
    </div>,
    document.body
  )
}
