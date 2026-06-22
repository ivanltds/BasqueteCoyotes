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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex flex-col items-center bg-b-gray border border-b-stone/20 hover:border-b-orange transition-all duration-300 overflow-hidden text-left"
      >
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-b-stone/20">
          <Image
            src={data.photo_url}
            alt={data.name}
            fill
            className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-b-dark/80 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-0 right-0 text-center">
            <span className="font-mono text-[9px] uppercase tracking-widest text-b-orange opacity-0 group-hover:opacity-100 transition-opacity">
              Ver carteirinha →
            </span>
          </div>
        </div>
        <div className="p-3 w-full">
          <p className="font-display text-white uppercase text-sm leading-tight truncate">{data.name}</p>
          <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">{data.city}</p>
        </div>
      </button>

      {open && <CarterinhaModal data={data} type={type} onClose={() => setOpen(false)} />}
    </>
  )
}
