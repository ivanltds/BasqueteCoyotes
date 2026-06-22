'use client'

import { useState } from 'react'
import MemberCard from './MemberCard'
import JoinForm from './JoinForm'
import type { CarterinhaData } from './Carteirinha'

interface Participant extends CarterinhaData { id: string }

interface Props {
  participants?: Participant[]
  showJoinButton?: boolean
}

export default function BaskferiaGrid({ participants = [], showJoinButton = false }: Props) {
  const [formOpen, setFormOpen] = useState(false)
  const [success, setSuccess]   = useState(false)

  if (showJoinButton) {
    return (
      <div className="flex items-center gap-4">
        {success
          ? <p className="font-mono text-sm text-b-neon uppercase tracking-widest">
              Registrado! Sua carteirinha está na seção abaixo. 🏀
            </p>
          : <button
              onClick={() => setFormOpen(true)}
              className="font-display text-lg uppercase border-2 border-b-neon text-b-neon px-8 py-4 tracking-wider shadow-neon-yellow hover:bg-b-neon hover:text-b-dark transition-all duration-200"
            >
              Registrar Participação
            </button>
        }
        {formOpen && (
          <JoinForm
            type="baskferia"
            onClose={() => setFormOpen(false)}
            onSuccess={() => { setFormOpen(false); setSuccess(true) }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {participants.map(p => (
        <MemberCard key={p.id} data={p} type="baskferia" />
      ))}
    </div>
  )
}
