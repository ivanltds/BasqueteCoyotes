'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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
    setFormData((prev) => ({
      ...prev,
      modality: prev.modality === id ? '' : id,
    }))
  }

  const isRestrictedSelected = MODALITIES.find((m) => m.id === formData.modality)?.restricted

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
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

      setSubmitted(true)
      fetchStats() // Atualiza os números após o envio
    } catch (error) {
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

        <form onSubmit={handleSubmit} className="space-y-12 max-w-3xl">
          {/* Dados Pessoais */}
          <section className="space-y-6">
            <h2 className="font-display text-3xl uppercase text-b-orange tracking-widest">01. Seus Dados</h2>
            
            <div className="space-y-4">
              <label className="block">
                <span className="font-mono text-xs uppercase text-gray-500 mb-2 block">Nome Completo</span>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome ou vulgo"
                  className="w-full bg-b-gray border-2 border-b-stone focus:border-b-neon p-4 font-body outline-none transition-colors"
                />
              </label>

              <label className="block">
                <span className="font-mono text-xs uppercase text-gray-500 mb-2 block">E-mail</span>
                <input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="w-full bg-b-gray border-2 border-b-stone focus:border-b-neon p-4 font-body outline-none transition-colors"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="block">
                  <span className="font-mono text-xs uppercase text-gray-500 mb-2 block">WhatsApp</span>
                  <input 
                    required
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-b-gray border-2 border-b-stone focus:border-b-neon p-4 font-body outline-none transition-colors"
                  />
                </label>

                <label className="block">
                  <span className="font-mono text-xs uppercase text-gray-500 mb-2 block">Gênero</span>
                  <select 
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-b-gray border-2 border-b-stone focus:border-b-neon p-4 font-body outline-none transition-colors appearance-none"
                  >
                    <option value="">Selecione...</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Prefiro não dizer</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="font-mono text-xs uppercase text-gray-500 mb-2 block">Faixa Etária</span>
                <select 
                  required
                  value={formData.ageGroup}
                  onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                  className="w-full bg-b-gray border-2 border-b-stone focus:border-b-neon p-4 font-body outline-none transition-colors appearance-none"
                >
                  <option value="">Selecione...</option>
                  <option value="kids">Criança (Até 12 anos)</option>
                  <option value="teens">Adolescente (13-17 anos)</option>
                  <option value="adults">Adulto (18+)</option>
                </select>
              </label>
            </div>
          </section>

          {/* Modalidades */}
          <section className="space-y-6">
            <h2 className="font-display text-3xl uppercase text-b-orange tracking-widest">02. Modalidade</h2>
            <div className="bg-b-orange/10 border-l-4 border-b-orange p-4 mb-4">
              <p className="font-body text-sm text-b-orange leading-relaxed">
                <strong>Importante:</strong> O <strong>Desafio de Habilidades</strong> está aberto a todos. Já o <strong>Arremesso de 3 Pontos e o X1</strong> são exclusivos para jogadores inscritos e escalados oficialmente pelas equipes do campeonato 5x5. Escolha apenas <strong>uma</strong> modalidade.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MODALITIES.map((mod) => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => selectModality(mod.id)}
                  className={`flex items-center gap-4 p-4 border-2 transition-all text-left ${
                    formData.modality === mod.id
                      ? 'border-b-neon bg-b-neon/10 text-b-neon'
                      : 'border-b-stone bg-b-gray text-gray-400 hover:border-white/30'
                  }`}
                >
                  <span className="text-2xl">{mod.icon}</span>
                  <div className="flex flex-col">
                    <span className="font-display text-xl uppercase leading-none">{mod.label}</span>
                    {mod.restricted && (
                      <span className="font-mono text-[10px] uppercase tracking-tighter text-b-orange font-bold">Apenas Representantes 5x5</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Lógica de Representante */}
          {isRestrictedSelected && (
            <section className="animate-in space-y-4 p-6 border-l-4 border-b-neon bg-b-neon/5">
              <h2 className="font-display text-2xl uppercase text-b-neon">Validação de Equipe</h2>
              <p className="font-body text-gray-400 text-sm leading-relaxed">
                Você selecionou uma modalidade restrita. Informe o nome do time oficial que você representará no campeonato 5x5.
              </p>
              <label className="block">
                <span className="font-mono text-xs uppercase text-gray-500 mb-2 block">Nome do Time Oficial</span>
                <input 
                  required
                  type="text"
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  placeholder="Ex: Coyotes, Vila Madah, etc"
                  className="w-full bg-b-dark border-2 border-b-neon focus:border-b-neon p-4 font-body outline-none transition-colors"
                />
              </label>
            </section>
          )}

          {/* Botão Submit */}
          <div className="pt-8">
            <button
              disabled={isSubmitting || !formData.modality}
              type="submit"
              className={`w-full font-display text-3xl uppercase py-6 tracking-widest transition-all ${
                isSubmitting || !formData.modality
                  ? 'bg-b-stone text-gray-600 cursor-not-allowed'
                  : 'bg-b-neon text-b-dark shadow-brutal-org hover:translate-x-2 hover:translate-y-2 hover:shadow-none'
              }`}
            >
              {isSubmitting ? 'Enviando...' : 'Realizar Pré-Inscrição'}
            </button>
            {!formData.modality && (
              <p className="text-center font-mono text-xs text-b-orange mt-4 uppercase font-bold">
                Selecione uma modalidade para continuar.
              </p>
            )}
          </div}

        </form>
      </div>
    </main>
  )
}
