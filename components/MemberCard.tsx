'use client'

import { useState } from 'react'
import Image from 'next/image'
import CarterinhaModal from './CarterinhaModal'
import { type CarterinhaData } from './Carteirinha'

interface Props {
  data: CarterinhaData
  type: 'coyotes' | 'baskferia'
}

export default function MemberCard({ data, type }: Props) {
  const [open, setOpen] = useState(false)
  const accent = type === 'baskferia' ? '#E0FF00' : '#FF5722'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative flex items-stretch w-full overflow-hidden bg-b-gray border border-b-stone/20 hover:border-b-orange transition-all duration-300 text-left"
        style={{ minHeight: 120 }}
      >
        {/* Foto */}
        <div className="relative w-28 shrink-0 overflow-hidden">
          <Image
            src={data.photo_url}
            alt={data.name}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          {/* fade lateral direita */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-b-gray" />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between flex-1 px-4 py-3">
          {/* Nome */}
          <div>
            <p className="font-display text-white uppercase text-xl leading-tight group-hover:text-b-orange transition-colors">
              {data.name}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-end gap-6 mt-2">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-gray-500 mb-0.5">Altura</p>
              <p className="font-display text-3xl leading-none" style={{ color: accent }}>
                {data.height}
              </p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-gray-500 mb-0.5">Cidade</p>
              <p className="font-display text-sm text-white uppercase leading-tight">
                {data.city}
              </p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-gray-500 mb-0.5">Bairro</p>
              <p className="font-display text-sm text-white uppercase leading-tight">
                {data.neighborhood}
              </p>
            </div>
          </div>
        </div>

        {/* Carteirinha hint */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 border"
            style={{ borderColor: accent, color: accent }}>
            carteirinha
          </span>
        </div>
      </button>

      {open && <CarterinhaModal data={data} type={type} onClose={() => setOpen(false)} />}
    </>
  )
}
