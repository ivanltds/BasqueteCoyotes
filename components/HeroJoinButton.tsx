'use client'

import { useState } from 'react'
import JoinForm from './JoinForm'

export default function HeroJoinButton() {
  const [open, setOpen]       = useState(false)
  const [success, setSuccess] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="font-display text-xl uppercase bg-b-orange text-b-dark px-8 py-4 tracking-wider shadow-brutal hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all duration-150"
      >
        {success ? '✓ Cadastro enviado!' : 'Junte-se à Matilha'}
      </button>
      {open && (
        <JoinForm
          type="coyotes"
          onClose={() => setOpen(false)}
          onSuccess={() => { setOpen(false); setSuccess(true) }}
        />
      )}
    </>
  )
}
