export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import InstaFeed from '@/components/InstaFeed'
import MarqueeStrip from '@/components/MarqueeStrip'
import HeroSlideshow, { type SiteMedia } from '@/components/HeroSlideshow'
import { getSupabasePublic } from '@/lib/supabase-server'
import AudioPlayer from '@/components/AudioPlayer'
import HeroBaskferiaButton from '@/components/HeroBaskferiaButton'
import BaskferiaParticipantsSection from '@/components/BaskferiaParticipantsSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import DepoimentoCTA from '@/components/DepoimentoCTA'

export const metadata: Metadata = {
  title: 'Baskferia 2026 | O Maior Evento de Streetball da Zona Oeste de São Paulo',
  description:
    'Baskferia 2026 — 4ª edição do torneio de basquete de rua organizado pelos Coyotes do Basquetebol na Zona Oeste de São Paulo. Desafios de 3 pontos, X1 e torneio 5x5. Inscreva sua equipe!',
  keywords: [
    'baskferia',
    'baskferia 2026',
    'torneio de basquete sp',
    'basquete de rua são paulo',
    'streetball zona oeste sp',
    'evento de basquete sp',
    'coyotes basquetebol',
    'torneio 5x5 sp',
    'desafio de habilidades basquete',
    'arremesso 3 pontos sp',
  ],
  alternates: {
    canonical: '/baskferia',
  },
  openGraph: {
    title: 'Baskferia 2026 | Streetball na Zona Oeste de SP',
    description: 'Baskferia 2026 — 4ª edição do maior evento de basquete de rua da Zona Oeste de São Paulo. Pelos Coyotes do Basquetebol.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Coyotes do Basquetebol',
    images: [{ url: '/images/logos/logo-baskferia.png', width: 500, height: 500, alt: 'Baskferia 2026' }],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SportsEvent',
  name: 'Baskferia 2026',
  description: '4ª edição do torneio de basquete de rua organizado pelos Coyotes do Basquetebol na Zona Oeste de São Paulo. Desafios de 3 pontos, X1 e torneio 5x5.',
  sport: 'Basquetebol',
  startDate: '2026',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: 'Zona Oeste',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      addressCountry: 'BR',
    },
  },
  organizer: {
    '@type': 'SportsOrganization',
    name: 'Coyotes do Basquetebol',
    url: 'https://basquete-coyotes.vercel.app',
    sport: 'Basquetebol',
  },
  url: 'https://basquete-coyotes.vercel.app/baskferia',
  image: 'https://basquete-coyotes.vercel.app/images/logos/logo-baskferia.png',
}

export default async function Baskferia() {
  const sb = getSupabasePublic()
  const { data } = await sb
    .from('site_media')
    .select('id, cloudinary_url, resource_type')
    .eq('section', 'hero_baskferia')
    .order('sort_order', { ascending: true })
  const baskferiaHeroItems: SiteMedia[] = data ?? []

  const { data: audioData } = await sb
    .from('site_audio')
    .select('id, name, cloudinary_url')
    .eq('section', 'baskferia')
    .order('sort_order', { ascending: true })
  const audioTracks = audioData ?? []

  return (
    <main className="min-h-screen bg-b-dark text-white overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO BASKFERIA ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden noise-overlay">
        {/* Fundo: slideshow configurável ou textura asfalto */}
        <div className="absolute inset-0 z-0">
          {baskferiaHeroItems.length > 0 ? (
            <HeroSlideshow items={baskferiaHeroItems} />
          ) : (
            <div className="absolute inset-0 bg-[url('/images/textures/asphalt.png')] bg-cover bg-center opacity-20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-b-dark/80 via-b-dark/50 to-b-dark" />
        </div>

        {/* Linhas decorativas de quadra */}
        <div aria-hidden className="absolute inset-0 z-[1] pointer-events-none overflow-hidden opacity-[0.06]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border-2 border-white rounded-full" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto pt-24">
          {/* Badge edição */}
          <span className="animate-in animate-in-delay-1 inline-block bg-b-neon text-b-dark font-body font-bold text-sm uppercase px-4 py-1.5 tracking-[0.2em] mb-8">
            4ª Edição · 2026
          </span>

          {/* Logo Baskferia */}
          <div className="animate-in animate-in-delay-2 w-64 md:w-[420px] mb-8 drop-shadow-[0_0_60px_rgba(224,255,0,0.25)]">
            <Image
              src="/images/logos/logo-baskferia.png"
              alt="Logo Baskferia"
              width={500}
              height={500}
              className="w-full h-auto"
              priority
            />
          </div>

          {/* Citação Thiago Fidelis */}
          <blockquote className="animate-in animate-in-delay-3 max-w-2xl mb-10">
            <p className="font-display text-2xl md:text-3xl lg:text-4xl text-b-cream leading-snug mb-3">
              &ldquo;Mais do que um evento esportivo, uma oportunidade de transformar vidas através do basquete.&rdquo;
            </p>
            <footer className="font-body text-b-orange font-bold uppercase tracking-[0.2em] text-sm">
              — Thiago Fidelis
            </footer>
          </blockquote>

          <div className="animate-in animate-in-delay-4 flex flex-col sm:flex-row gap-4">
            <Link
              href="/baskferia/pre-inscricao"
              className="font-display text-xl uppercase bg-b-gray border-2 border-b-neon text-b-neon px-8 py-4 tracking-wider hover:bg-b-neon hover:text-b-dark transition-all duration-150"
            >
              Ver Inscritos
            </Link>
            <a
              href="#formato"
              className="font-display text-xl uppercase border-2 border-b-neon text-b-neon px-8 py-4 tracking-wider hover:bg-b-neon/10 transition-all duration-200"
            >
              Ver o Formato
            </a>
            <HeroBaskferiaButton />
          </div>
        </div>
      </section>

      {/* ── HISTÓRICO EDICÕES ── */}
      <section className="relative z-20 py-12 mb-12 max-w-5xl mx-auto px-6">
        <div className="bg-b-gray border-2 border-b-stone/30 p-8 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { ed: '1ª', year: '2022', highlight: false },
              { ed: '2ª', year: '2023', highlight: false },
              { ed: '3ª', year: '2024', highlight: false },
              { ed: '4ª', year: '2026', highlight: true },
            ].map((item) => (
              <div key={item.ed} className={`text-center p-4 border ${item.highlight ? 'border-b-neon bg-b-neon/5' : 'border-b-stone/20'}`}>
                <div className={`font-display text-4xl mb-1 ${item.highlight ? 'text-b-neon' : 'text-gray-500'}`}>{item.ed}</div>
                <div className="font-mono text-xs uppercase tracking-widest text-gray-400">Edição · {item.year}</div>
                {item.highlight && <div className="mt-2 inline-block bg-b-neon text-b-dark text-[10px] font-bold px-2 py-0.5 uppercase tracking-tighter">Em breve</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <MarqueeStrip variant="neon" />

      {/* ── O QUE É ── */}
      <section className="py-24 px-6 md:px-20 max-w-5xl mx-auto text-center">
        <span className="font-mono text-b-neon uppercase tracking-[0.3em] text-xs mb-6 block">
          // a essência
        </span>
        <h2 className="font-display text-6xl md:text-8xl text-white uppercase leading-none mb-8">
          Mais que um<br />
          <span className="text-stroke-neon">evento</span>
        </h2>
        <p className="font-body text-gray-300 text-xl leading-relaxed max-w-3xl mx-auto border-t border-b-stone pt-8">
          Forjado na periferia da zona oeste de São Paulo, o Baskferia nasceu da vontade de criar algo
          maior. Nosso foco é proporcionar experiências marcantes, respeito absoluto e inclusão total —
          sem nenhum tipo de preconceito. Aqui, a quadra é de todos.
        </p>
      </section>

      {/* ── FORMATO ── */}
      <section id="formato" className="py-24 bg-b-gray clip-diagonal-rev">
        <div className="max-w-7xl mx-auto px-6 md:px-20">
          <div className="mb-16 text-center">
            <span className="font-mono text-b-orange uppercase tracking-[0.3em] text-xs mb-4 block">
              // programação
            </span>
            <h2 className="font-display text-6xl md:text-7xl text-white uppercase leading-none">
              O Formato
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">

            {/* Sábado 1 */}
            <div className="group bg-b-dark border-t-4 border-b-neon p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-mono text-b-neon text-xs uppercase tracking-widest">01</span>
                <h3 className="font-display text-4xl text-b-neon uppercase">1º Sábado</h3>
              </div>
              <p className="font-body text-gray-300 text-lg mb-8 leading-relaxed">
                Um dia focado na democracia e celebração. Abrimos as portas para <strong>toda a comunidade</strong> participar, independente do nível técnico. É a chance de todos mostrarem seu talento nos desafios individuais.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: '🏀', label: 'Arremesso de 3 Pontos' },
                  { icon: '⚡', label: 'Desafio de Habilidades' },
                  { icon: '🎯', label: 'Arremesso de 2 Pontos' },
                  { icon: '🔥', label: 'X1 — Um contra Um' },
                ].map(({ icon, label }) => (
                  <li key={label} className="flex items-center gap-3 font-body text-gray-200 text-lg border-b border-b-stone pb-4 last:border-0 last:pb-0">
                    <span className="text-2xl">{icon}</span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sábado 2 */}
            <div className="group bg-b-dark border-t-4 border-b-orange p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-mono text-b-orange text-xs uppercase tracking-widest">02</span>
                <h3 className="font-display text-4xl text-b-orange uppercase">2º Sábado</h3>
              </div>
              <p className="font-body font-bold text-gray-400 mb-8 uppercase tracking-widest text-sm">
                25 de Julho
              </p>
              <p className="font-body text-gray-300 text-lg mb-8 leading-relaxed">
                O dia da elite. 8 equipes selecionadas dando seu melhor em quadra. Foco total em <strong>competitividade e alto nível</strong>, onde apenas um sairá com o troféu de campeão.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: '🏆', label: '8 Equipes', highlight: true },
                  { icon: '⚔️', label: '5 contra 5', highlight: true },
                  { icon: '⭐', label: 'Categoria Livre', highlight: true },
                  { icon: '🥇', label: 'Final — Torneios Individuais', highlight: true },
                ].map(({ icon, label }) => (
                  <li key={label} className="flex items-center gap-3 font-body font-bold text-white text-lg border-b border-b-stone pb-4 last:border-0 last:pb-0">
                    <span className="text-2xl">{icon}</span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOCAL ── */}
      <section className="py-32 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Texto fantasma */}
        <div
          aria-hidden
          className="absolute font-display text-[clamp(60px,12vw,180px)] text-white/[0.025] leading-none select-none pointer-events-none whitespace-nowrap inset-x-0 text-center"
        >
          QUADRA
        </div>

        <div className="relative z-10 text-center px-6">
          <span className="font-mono text-b-orange uppercase tracking-[0.3em] text-xs mb-8 block">
            📍 local de batalha
          </span>
          <h3 className="font-display text-5xl md:text-7xl text-white uppercase leading-none mb-2">
            Colégio Estadual
          </h3>
          <h3 className="font-display text-5xl md:text-7xl text-b-orange uppercase leading-none mb-8">
            Prof. Oswaldo Walder
          </h3>
          <p className="font-body text-gray-500 uppercase tracking-widest text-sm">
            Zona Oeste · São Paulo · SP
          </p>
        </div>
      </section>

      {/* ── INSTAGRAM BASKFERIA ── */}
      <section className="py-24 bg-b-gray border-t border-b-stone">
        <div className="max-w-7xl mx-auto px-6 md:px-20">
          <div className="flex items-center gap-4 mb-12">
            <span className="font-mono text-xs text-gray-600 uppercase tracking-widest">// instagram</span>
            <h2 className="font-display text-4xl text-white uppercase">
              @baskferia
            </h2>
          </div>
          <InstaFeed profile="baskferia" />
        </div>
      </section>

      <BaskferiaParticipantsSection />
      <TestimonialsSection type="baskferia" />
      <DepoimentoCTA type="baskferia" />

      <AudioPlayer tracks={audioTracks} autoplay />
    </main>
  )
}
