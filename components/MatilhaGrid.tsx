'use client'

import { useState } from 'react'
import MemberCard from './MemberCard'
import JoinForm from './JoinForm'
import type { CarterinhaData } from './Carteirinha'

interface Member extends CarterinhaData { id: string }

interface Props {
  members?: Member[]
  showJoinButton?: boolean
}

export default function MatilhaGrid({ members = [], showJoinButton = false }: Props) {
  const [formOpen, setFormOpen]     = useState(false)
  const [success, setSuccess]       = useState(false)

  if (showJoinButton) {
    return (
      <div className="flex items-center gap-4">
        {success
          ? <p className="font-mono text-sm text-b-neon uppercase tracking-widest">
              Cadastro enviado! Aguarde aprovação. 🐺
            </p>
          : <button
              onClick={() => setFormOpen(true)}
              className="font-display text-lg uppercase bg-b-orange text-b-dark px-8 py-4 tracking-wider shadow-brutal hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all duration-150"
            >
              Junte-se à Matilha
            </button>
        }
        {formOpen && (
          <JoinForm
            type="coyotes"
            onClose={() => setFormOpen(false)}
            onSuccess={() => { setFormOpen(false); setSuccess(true) }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {members.map(m => (
        <MemberCard key={m.id} data={m} type="coyotes" />
      ))}
    </div>
  )
}
