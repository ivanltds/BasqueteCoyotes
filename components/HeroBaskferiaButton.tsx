'use client'

import { useState } from 'react'
import JoinForm from './JoinForm'

export default function HeroBaskferiaButton() {
  const [open, setOpen]       = useState(false)
  const [success, setSuccess] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="font-display text-xl uppercase border-2 border-b-orange text-b-orange px-8 py-4 tracking-wider hover:bg-b-orange hover:text-b-dark transition-all duration-200"
      >
        {success ? '✓ Registrado!' : 'Registrar Participação'}
      </button>
      {open && (
        <JoinForm
          type="baskferia"
          onClose={() => setOpen(false)}
          onSuccess={() => { setOpen(false); setSuccess(true) }}
        />
      )}
    </>
  )
}
