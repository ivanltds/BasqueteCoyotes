'use client'

import { useState } from 'react'
import DepoimentoModal from './DepoimentoModal'

interface Props {
  type: 'coyotes' | 'baskferia'
}

export default function DepoimentoCTA({ type }: Props) {
  const [open, setOpen] = useState(false)
  const isBask    = type === 'baskferia'
  const accent    = isBask ? '#E0FF00' : '#FF5722'
  const accentCls = isBask ? 'border-[#E0FF00] text-[#E0FF00] hover:bg-[#E0FF00]' : 'border-b-orange text-b-orange hover:bg-b-orange'

  return (
    <>
      <div className="mt-10 flex justify-center">
        <button
          onClick={() => setOpen(true)}
          className={`font-display text-base uppercase px-8 py-3 border-2 tracking-widest hover:text-b-dark transition-all duration-200 ${accentCls}`}
        >
          {isBask ? 'Deixar meu depoimento do Baskferia' : 'Deixar meu depoimento'}
        </button>
      </div>

      {open && <DepoimentoModal type={type} onClose={() => setOpen(false)} />}
    </>
  )
}
