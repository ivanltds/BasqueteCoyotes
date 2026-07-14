'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { track } from '@vercel/analytics'

const MODALITIES = [
  { id: '3pts', label: 'Arremesso de 3 Pontos', icon: '🏀', restricted: true },
  { id: '2pts', label: 'Arremesso de 2 Pontos', icon: '🎯', restricted: false },
  { id: 'skills', label: 'Desafio de Habilidades', icon: '⚡', restricted: false },
  { id: 'x1', label: 'X1 — Um contra Um', icon: '🔥', restricted: true },
]

export default function PreInscricaoPage() {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    gender: '',
    ageGroup: '',
    modality: '',
    teamName: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    byModality: {} as Record<string, number>
  })

  // Buscar estatísticas em tempo real
  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('pre_inscricoes')
        .select('modalidade')

      if (error) throw error

      const counts = data.reduce((acc: Record<string, number>, curr) => {
        acc[curr.modalidade] = (acc[curr.modalidade] || 0) + 1
        return acc
      }, {})

      setStats({
        total: data.length,
        byModality: counts
      })
    } catch (err) {
      console.error('Erro ao buscar stats:', err)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const selectModality = (id: string) => {
    const next = formData.modality === id ? '' : id
    if (next) track('modality_selected', { modality: next })
    setFormData((prev) => ({ ...prev, modality: next }))
  }

  const isRestrictedSelected = MODALITIES.find((m) => m.id === formData.modality)?.restricted

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    track('form_submit_attempt', { modality: formData.modality, gender: formData.gender, age_group: formData.ageGroup })
    
    const normalizedEmail = formData.email.trim().toLowerCase()
    const normalizedWhatsapp = formData.whatsapp.replace(/\D/g, '')

    try {
      const { data: existing, error: checkError } = await supabase
        .from('pre_inscricoes')
        .select('id')
        .or(`email.eq.${normalizedEmail},whatsapp.eq.${normalizedWhatsapp}`)
        .maybeSingle()

      if (checkError) {
        console.error('Erro no check de duplicidade:', checkError)
      }

      if (existing) {
        track('form_duplicate', { modality: formData.modality })
        alert('Ei! Já encontramos uma inscrição com este E-mail ou WhatsApp. Cada pessoa pode se inscrever apenas uma vez.')
        setIsSubmitting(false)
        return
      }

      const { error } = await supabase
        .from('pre_inscricoes')
        .insert([
          {
            nome: formData.name.trim(),
            whatsapp: normalizedWhatsapp,
            email: normalizedEmail,
            genero: formData.gender,
            faixa_etaria: formData.ageGroup,
            modalidade: formData.modality,
            time_oficial: formData.teamName?.trim() || null,
          }
        ])

      if (error) throw error

      track('pre_inscricao_concluida', {
        modality: formData.modality,
        gender: formData.gender,
        age_group: formData.ageGroup,
        has_team: !!formData.teamName,
      })
      setSubmitted(true)
      fetchStats() // Atualiza os números após o envio
    } catch (error) {
      track('form_error', { modality: formData.modality })
      console.error('Erro ao salvar no Supabase:', error)
      alert('Ops! Tivemos um problema ao salvar sua inscrição. Verifique se você já se inscreveu ou tente novamente mais tarde.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-b-dark text-white pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center">
        <div className="bg-b-neon text-b-dark p-12 shadow-brutal-org max-w-2xl">
          <h1 className="font-display text-5xl uppercase mb-4">Pré-Inscrição Realizada!</h1>
          <p className="font-body text-xl font-bold mb-8 uppercase tracking-widest">
            Valeu por se inscrever na matilha.
          </p>
          <p className="font-body text-lg mb-8 leading-relaxed">
            Agora nossa equipe vai analisar os dados e entrar em contato via WhatsApp para confirmar sua participação conforme as chaves de competição. 
            **Acompanhe o @baskferia para novidades!**
          </p>
          <Link 
            href="/baskferia"
            className="inline-block bg-b-dark text-white font-display text-2xl uppercase px-8 py-4 hover:translate-x-1 hover:translate-y-1 transition-transform"
          >
            Voltar ao Baskferia
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-b-dark text-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho do Formulário */}
        <header className="mb-12 border-b-4 border-b-neon pb-8">
          <span className="font-mono text-b-neon uppercase tracking-[0.3em] text-xs mb-4 block">
            // a nossa rua, a nossa regra
          </span>
          <h1 className="font-display text-6xl md:text-7xl uppercase leading-none mb-4">
            Cola no <span className="text-b-neon">Baskferia</span>
          </h1>
          <p className="font-body text-gray-400 text-lg leading-relaxed max-w-2xl">
            O evento é pra todo mundo que vive o basquete. Se você quer mostrar seu talento em quadra, a pré-inscrição para os desafios do **1º Sábado** começa aqui. 
          </p>
        </header>

        {/* Dashboard de Inscritos */}
        <section className="mb-16 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-b-neon p-6 border-2 border-b-neon shadow-brutal-org flex flex-col items-center justify-center">
            <span className="font-display text-5xl text-b-dark leading-none">{stats.total}</span>
            <span className="font-mono text-[10px] uppercase font-bold text-b-dark/60 tracking-tighter">Total Inscritos</span>
          </div>
          {MODALITIES.map((mod) => (
            <div key={mod.id} className="bg-b-gray p-4 border-2 border-b-stone flex flex-col items-center justify-center text-center">
              <span className="text-xl mb-1">{mod.icon}</span>
              <span className="font-display text-2xl text-white leading-none">{stats.byModality[mod.id] || 0}</span>
              <span className="font-mono text-[9px] uppercase text-gray-500 tracking-tighter leading-tight mt-1">{mod.label}</span>
            </div>
          ))}
        </section>

        <div className="border-4 border-dashed border-b-neon p-8 md:p-12 text-center bg-b-gray/30 max-w-3xl shadow-brutal-org">
          <span className="font-mono text-b-orange text-sm uppercase tracking-widest block mb-4">// chaves fechadas</span>
          <h2 className="font-display text-4xl md:text-5xl uppercase text-white mb-6">
            Inscrições <span className="text-stroke">Encerradas!</span>
          </h2>
          <p className="font-body text-gray-300 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
            Agradecemos o corre de todos! A pré-inscrição para as modalidades individuais da 4ª edição do Baskferia está oficialmente encerrada. 
            Nossa comissão organizadora está montando as chaves e entrará em contato via WhatsApp com os selecionados.
          </p>
          <div className="inline-block bg-b-neon text-b-dark font-display text-xl uppercase px-8 py-4 tracking-wider">
            Nos vemos na quadra 🐾
          </div>
        </div>
      </div>
    </main>
  )
}
