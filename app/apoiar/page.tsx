'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Supporter {
  id: string
  name: string
  photo_url: string
  link: string
}

export default function ApoiarPage() {
  const whatsappNumber = '5511959924340' // Número atualizado do Thiago
  const message = encodeURIComponent('Olá Thiago! Vi o site dos Coyotes e gostaria de apoiar o projeto. Como posso ajudar?')
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`

  const [supporters, setSupporters] = useState<Supporter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/supporters')
      .then(r => r.json())
      .then(d => {
        setSupporters(d.supporters ?? [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Erro ao carregar apoiadores:', err)
        setLoading(false)
      })
  }, [])

  function handleSupporterClick(id: string) {
    try {
      fetch(`/api/supporters/${id}/click`, { method: 'POST' })
    } catch (err) {
      console.error('Erro ao registrar clique:', err)
    }
  }

  return (
    <main className="min-h-screen bg-b-dark text-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 border-b-4 border-b-orange pb-8">
          <span className="font-mono text-b-orange uppercase tracking-[0.3em] text-xs mb-4 block">
            // faça parte da história
          </span>
          <h1 className="font-display text-6xl md:text-8xl uppercase leading-none mb-6">
            Quer apoiar o <span className="text-stroke">Coyotes?</span>
          </h1>
          <p className="font-body text-gray-300 text-xl md:text-2xl leading-relaxed max-w-3xl">
            Desde 2009, a nossa matilha transforma vidas através do basquete na Zona Oeste de SP. 
            Mas ninguém ganha um campeonato sozinho. Precisamos de gente que acredita no corre.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-b-gray p-8 border-2 border-b-stone hover:border-b-orange transition-colors group">
            <div className="font-display text-4xl text-b-orange mb-4">COMO AJUDAR?</div>
            <ul className="space-y-4 font-body text-gray-400 text-lg">
              <li className="flex items-center gap-3">
                <span className="text-b-orange">🏀</span> Doações de materiais esportivos
              </li>
              <li className="flex items-center gap-3">
                <span className="text-b-orange">🤝</span> Voluntariado nos eventos
              </li>
              <li className="flex items-center gap-3">
                <span className="text-b-orange">⚡</span> Indicação de patrocinadores
              </li>
              <li className="flex items-center gap-3">
                <span className="text-b-orange">🔥</span> Divulgação e apoio digital
              </li>
            </ul>
          </div>

          <div className="flex flex-col justify-center bg-b-orange/5 p-8 border-l-4 border-b-orange">
            <h3 className="font-display text-3xl uppercase mb-4 text-white">Fale com a Liderança</h3>
            <p className="font-body text-gray-400 mb-8">
              Toda ajuda é bem-vinda. Clique no botão abaixo para trocar uma ideia direto com o Thiago Fidelis e ver como seu apoio pode fazer a diferença.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-center font-display text-2xl uppercase bg-b-orange text-b-dark px-8 py-6 tracking-widest shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all"
            >
              Chamar no WhatsApp
            </a>
          </div>
        </div>

        {/* Seção de Apoiadores */}
        <section className="mb-20 border-t border-t-stone/30 pt-16">
          <div className="mb-10 text-center md:text-left">
            <span className="font-mono text-b-orange uppercase tracking-[0.3em] text-xs mb-2 block">
              // nossos parceiros
            </span>
            <h2 className="font-display text-4xl md:text-5xl uppercase text-white">
              Quem apoia a <span className="text-stroke">matilha</span>
            </h2>
          </div>

          {loading ? (
            <p className="font-mono text-gray-500 text-sm uppercase animate-pulse text-center">
              Carregando parceiros...
            </p>
          ) : supporters.length === 0 ? (
            <div className="border-2 border-dashed border-b-stone p-12 text-center bg-b-gray/20">
              <p className="font-mono text-gray-600 text-sm uppercase">Sua marca pode estar aqui</p>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 font-mono text-xs uppercase text-b-orange hover:underline"
              >
                Seja um apoiador oficial →
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {supporters.map(s => (
                <a
                  key={s.id}
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSupporterClick(s.id)}
                  className="bg-b-gray border-2 border-b-stone hover:border-b-orange hover:-translate-y-1 transition-all group p-4 flex flex-col items-center justify-center text-center aspect-square"
                >
                  <div className="relative w-full aspect-square max-h-[140px] flex items-center justify-center mb-3">
                    <img
                      src={s.photo_url}
                      alt={s.name}
                      className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <span className="font-display text-base uppercase text-gray-400 group-hover:text-white transition-colors truncate w-full">
                    {s.name}
                  </span>
                </a>
              ))}
            </div>
          )}
        </section>

        <div className="text-center">
          <Link 
            href="/"
            className="font-mono text-xs uppercase text-gray-600 hover:text-white tracking-[0.3em] transition-colors"
          >
            ← Voltar para a Home
          </Link>
        </div>
      </div>
    </main>
  )
}
