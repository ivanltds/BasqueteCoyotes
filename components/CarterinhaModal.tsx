'use client'

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Carteirinha, { type CarterinhaData } from './Carteirinha'

interface Props {
  data: CarterinhaData
  type: 'coyotes' | 'baskferia'
  onClose: () => void
}

export default function CarterinhaModal({ data, type, onClose }: Props) {
  const igRef  = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    if (!igRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(igRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#0D0D0D',
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `coyotes-${type === 'coyotes' ? 'membro' : 'baskferia'}-${data.name.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error(e)
      alert('Erro ao gerar imagem. Tente tirar um screenshot.')
    } finally {
      setDownloading(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">

        {/* Carteirinha visível */}
        <Carteirinha data={data} type={type} />

        {/* Elemento para Instagram (1:1, renderizado aqui para html2canvas) */}
        <div
          ref={igRef}
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            width: 540,
            height: 540,
            background: '#0D0D0D',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            padding: 40,
            boxSizing: 'border-box',
          }}
        >
          <Carteirinha data={data} type={type} plain />
          <div style={{
            fontFamily: 'sans-serif',
            fontSize: 11,
            color: '#555',
            letterSpacing: 2,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}>
            {type === 'coyotes'
              ? 'coyotesdobasquetebol.com.br'
              : `Baskferia ${data.year ?? 2026} · ${data.edition ?? 4}ª Edição`}
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 w-full">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 font-display uppercase py-3 bg-b-orange text-b-dark hover:bg-b-neon transition-all disabled:opacity-50 text-sm tracking-wider"
          >
            {downloading ? 'Gerando…' : '↓ Baixar para Instagram'}
          </button>
          <button
            onClick={onClose}
            className="px-5 font-display uppercase py-3 border border-b-stone text-gray-400 hover:text-white hover:border-white transition-all text-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
