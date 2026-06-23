export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import DynamicGallery from '@/components/DynamicGallery'
import InstaFeed from '@/components/InstaFeed'
import MarqueeStrip from '@/components/MarqueeStrip'
import HeroSlideshow, { type SiteMedia } from '@/components/HeroSlideshow'
import AudioPlayer from '@/components/AudioPlayer'
import NewsSection from '@/components/NewsSection'
import MatilhaSection from '@/components/MatilhaSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import HeroJoinButton from '@/components/HeroJoinButton'
import { getSupabasePublic } from '@/lib/supabase-server'
import { getCloudinaryImages } from '@/lib/cloudinary'

// Fallbacks (imagens fixas enquanto site_media estiver vazio)
const HERO_FOLDER      = process.env.CLOUDINARY_HERO_FOLDER ?? 'coyotes/hero'
const FALLBACK_COACH   = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dqt35bpzt'}/image/upload/v1/foto-treinador.jpg`
const FALLBACK_GEOVANI = 'https://res.cloudinary.com/dqt35bpzt/image/upload/v1775908084/nani_ha122j.jpg'
const FALLBACK_IVAN    = 'https://res.cloudinary.com/dqt35bpzt/image/upload/v1775908084/ivan_ocqtgu.jpg'

async function getAudioTracks(section: string) {
  const sb = getSupabasePublic()
  const { data } = await sb
    .from('site_audio')
    .select('id, name, cloudinary_url')
    .eq('section', section)
    .order('sort_order', { ascending: true })
  return data ?? []
}

async function getSiteMedia(section: string): Promise<SiteMedia[]> {
  const sb = getSupabasePublic()
  const { data } = await sb
    .from('site_media')
    .select('id, cloudinary_url, resource_type')
    .eq('section', section)
    .order('sort_order', { ascending: true })
  return data ?? []
}

export default async function Home() {
  // Busca mídia configurável em paralelo
  const [heroDesktopRaw, heroMobileRaw, thiagoItems, geovaniItems, ivanItems, allHeroImages, audioTracks] = await Promise.all([
    getSiteMedia('hero_main'),
    getSiteMedia('hero_main_mobile'),
    getSiteMedia('person_thiago'),
    getSiteMedia('person_geovani'),
    getSiteMedia('person_ivan'),
    getCloudinaryImages(HERO_FOLDER, 10, { shuffle: false, skipFilter: true }),
    getAudioTracks('homepage'),
  ])

  // Fallbacks para fotos de membros
  const coachSrc   = thiagoItems[0]?.cloudinary_url  ?? (() => {
    const img = allHeroImages.find(i => i.public_id.includes('foto-treinador'))
    return img?.secure_url ?? FALLBACK_COACH
  })()
  const geovaniSrc = geovaniItems[0]?.cloudinary_url ?? (() => {
    const img = allHeroImages.find(i => i.public_id.includes('nani'))
    return img?.secure_url ?? FALLBACK_GEOVANI
  })()
  const ivanSrc    = ivanItems[0]?.cloudinary_url    ?? (() => {
    const img = allHeroImages.find(i => i.public_id.includes('ivan'))
    return img?.secure_url ?? FALLBACK_IVAN
  })()

  // Fallback hero quando site_media vazio
  const heroFallbackSrc = (() => {
    const img = allHeroImages.find(i => i.public_id.includes('foto-time-completo'))
    return img?.secure_url ?? '/images/hero/foto-time-completo.jpg'
  })()
  const heroFallback: SiteMedia[] = [{ id: 'fallback', cloudinary_url: heroFallbackSrc, resource_type: 'image' }]

  // Desktop: fotos sempre aparecem + vídeos horizontais
  // Mobile: fotos sempre aparecem + vídeos verticais
  // Se o slot mobile estiver vazio, usa o desktop como fallback
  const heroDesktopItems = heroDesktopRaw.length > 0 ? heroDesktopRaw : heroFallback
  const heroMobileItems  = heroMobileRaw.length  > 0 ? heroMobileRaw  : heroDesktopItems

  return (
    <main className="min-h-screen bg-b-dark text-white overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden noise-overlay">
        {/* Background slideshow — desktop (md+) */}
        <div className="hidden md:block absolute inset-0 z-0">
          <HeroSlideshow items={heroDesktopItems} />
        </div>
        {/* Background slideshow — mobile */}
        <div className="block md:hidden absolute inset-0 z-0">
          <HeroSlideshow items={heroMobileItems} />
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-b-dark/70 via-b-dark/40 to-b-dark pointer-events-none" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-b-dark/50 via-transparent to-b-dark/50 pointer-events-none" />

        {/* Conteúdo hero */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="w-48 md:w-72 mb-8 animate-in animate-in-delay-1 drop-shadow-[0_0_40px_rgba(255,87,34,0.4)]">
            <Image
              src="/images/logos/logo-coyotes.png"
              alt="Logo Coyotes do Basquetebol"
              width={300}
              height={300}
              className="w-full h-auto"
            />
          </div>

          {/* Quote */}
          <blockquote className="animate-in animate-in-delay-2 mb-8 max-w-2xl">
            <p className="font-display text-2xl md:text-3xl lg:text-4xl text-b-cream leading-snug mb-3">
              &ldquo;Talento ganha jogos, mas trabalho em equipe e inteligência ganham campeonatos.&rdquo;
            </p>
            <footer className="font-body text-b-orange font-bold uppercase tracking-[0.2em] text-sm">
              — Michael Jordan
            </footer>
          </blockquote>

          {/* CTA */}
          <div className="animate-in animate-in-delay-3 flex flex-col sm:flex-row gap-4">
            <HeroJoinButton />
            <Link
              href="/baskferia"
              className="font-display text-xl uppercase border-2 border-b-neon text-b-neon px-8 py-4 tracking-wider hover:bg-b-neon hover:text-b-dark transition-colors duration-200"
            >
              Conheça o Baskferia
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-60">
          <span className="font-mono text-xs uppercase tracking-widest text-gray-400">scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-b-orange to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <MarqueeStrip />

      {/* ── NOTÍCIAS ── */}
      <NewsSection />

      {/* ── MATILHA ── */}
      <MatilhaSection />
      <TestimonialsSection type="coyotes" />

      {/* ── SOBRE ── */}
      <section id="sobre" className="py-24 px-6 md:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="font-mono text-b-orange uppercase tracking-[0.3em] text-xs mb-4 block">
              // nossa história
            </span>
            <h2 className="font-display text-5xl md:text-7xl text-white uppercase mb-8 leading-none">
              Coyotes: Respeito e Basquete <span className="text-stroke">desde 2009</span>
            </h2>
            
            <div className="space-y-6 border-l-2 border-b-stone pl-6">
              <p className="font-body text-gray-400 text-lg leading-relaxed">
                Nascido em 2009, o projeto Coyotes reúne moradores do bairro sem qualquer restrição de idade ou gênero. Aqui, ensinamos o basquete do zero, imergindo cada participante em um ambiente onde os princípios do jogo — lealdade, disciplina e garra — são refletidos diretamente em suas vidas.
              </p>
              <p className="font-body text-gray-400 text-lg leading-relaxed">
                Para se juntar à matilha, não tem burocracia: é só aparecer no sábado e se apresentar. Todos são bem-vindos para aprender, evoluir e fazer parte da nossa família.
              </p>
              <div className="bg-b-gray/50 p-6 border border-b-stone/30">
                <h4 className="font-display text-b-orange text-xl uppercase mb-3 text-shadow-sm">As Regras da Quadra</h4>
                <p className="font-body text-gray-400 text-sm leading-relaxed italic">
                  "Sem preconceito, sem qualquer tipo de violência e com o máximo respeito. Valorizamos a sinergia entre quem está iniciando e quem já tem estrada no projeto. Evoluímos as pessoas através da nossa paixão pelo basquete."
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '100+', label: 'Atletas na matilha' },
                { num: '4ª',   label: 'Edição do Baskferia' },
                { num: '10+',  label: 'Anos de história' },
                { num: '0',    label: 'Preconceito tolerado' },
              ].map(({ num, label }) => (
                <div
                  key={label}
                  className="bg-b-gray border border-b-stone p-6 hover:border-b-orange transition-colors duration-300 group"
                >
                  <div className="font-display text-5xl text-b-orange group-hover:text-b-neon transition-colors duration-300 mb-2">
                    {num}
                  </div>
                  <div className="font-body text-gray-400 text-sm uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
            
            <div className="pt-4">
              <Link
                href="/apoiar"
                className="inline-block w-full text-center font-display text-2xl uppercase bg-b-orange text-b-dark px-8 py-5 tracking-widest shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all"
              >
                Quero Apoiar a Matilha →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TREINADOR ── */}
      <section className="py-24 bg-b-dark/50 border-y border-b-stone/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-20">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            {/* Foto Coach */}
            <div className="relative w-full md:w-1/3 aspect-[4/5] group overflow-hidden border-4 border-b-stone/30 shadow-brutal">
              <Image
                src={coachSrc}
                alt="Thiago Fidelis - Coordenador Coyotes"
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-b-dark via-transparent to-transparent opacity-60" />
            </div>

            {/* Crédito Coach */}
            <div className="md:w-2/3">
              <span className="font-mono text-b-neon uppercase tracking-[0.3em] text-xs mb-4 block">
                // a liderança
              </span>
              <h2 className="font-display text-5xl md:text-6xl text-white uppercase mb-6 leading-tight">
                Thiago Fidelis
              </h2>
              <div className="inline-block bg-b-orange text-b-dark font-display text-sm uppercase px-4 py-1 mb-8">
                Idealizador e Coordenador do Projeto
              </div>
              <p className="font-body text-gray-400 text-xl leading-relaxed italic border-l-4 border-b-orange pl-8 py-2">
                "O basquete é o nosso meio, mas a formação de pessoas com caráter e respeito é o nosso maior legado."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARKETING & DIGITAL ── */}
      <section className="py-24 bg-b-dark overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-20">
          <div className="text-center mb-16">
            <span className="font-mono text-b-orange uppercase tracking-[0.3em] text-xs mb-4 block">
              // os bastidores
            </span>
            <h2 className="font-display text-5xl md:text-6xl text-white uppercase leading-none">
              Marketing & <span className="text-stroke-neon">Digital</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
            
            {/* Geovane Nunes */}
            <div className="group bg-b-gray border-2 border-b-stone hover:border-b-orange transition-all duration-300 overflow-hidden shadow-brutal-org">
              <div className="relative aspect-square md:aspect-[4/3] overflow-hidden">
                <Image
                  src={geovaniSrc}
                  alt="Geovane Nunes - Marketing e Operações"
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-b-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-8">
                <h3 className="font-display text-4xl text-white uppercase mb-2">Geovane Nunes</h3>
                <div className="font-mono text-b-orange text-xs uppercase tracking-widest font-bold mb-4">
                  Marketing & Operações
                </div>
                <p className="font-body text-gray-400 text-sm leading-relaxed">
                  Responsável por manter a engrenagem girando, cuidando da imagem do projeto e de toda a operação por trás dos eventos.
                </p>
              </div>
            </div>

            {/* IVAN SOUZA */}
            <div className="group bg-b-gray border-2 border-b-stone hover:border-b-neon transition-all duration-300 overflow-hidden shadow-brutal-org">
              <div className="relative aspect-square md:aspect-[4/3] overflow-hidden">
                <Image
                  src={ivanSrc}
                  alt="Ivan Souza - Redes Sociais e Interações Digitais"
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-b-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-8">
                <h3 className="font-display text-4xl text-white uppercase mb-2">Ivan Souza</h3>
                <div className="font-mono text-b-neon text-xs uppercase tracking-widest font-bold mb-4">
                  Redes Sociais & Interações
                </div>
                <p className="font-body text-gray-400 text-sm leading-relaxed">
                  A voz digital dos Coyotes. Cuida das nossas redes e garante que a matilha esteja sempre conectada e engajada.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CHAMADA BASKFERIA ── */}
      <section className="relative py-32 clip-diagonal bg-b-gray overflow-hidden">
        {/* Texto fantasma de fundo */}
        <div
          aria-hidden
          className="absolute -right-8 top-1/2 -translate-y-1/2 font-display text-[clamp(80px,16vw,200px)] text-white/[0.03] leading-none select-none pointer-events-none whitespace-nowrap"
        >
          BASKFERIA
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-20 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2">
            {/* Badge */}
            <span className="inline-block bg-b-neon text-b-dark font-body font-bold text-xs uppercase px-3 py-1 tracking-widest mb-6">
              4ª Edição • 2026
            </span>

            <div className="w-56 md:w-72 mb-8">
              <Image
                src="/images/logos/logo-baskferia.png"
                alt="Logo Baskferia"
                width={400}
                height={400}
                className="w-full h-auto drop-shadow-[0_0_30px_rgba(224,255,0,0.3)]"
              />
            </div>

            <p className="font-body text-gray-300 text-xl mb-8 leading-relaxed max-w-md">
              O maior evento de streetball da zona oeste. Dois sábados. Uma experiência que transforma vidas.
            </p>

            <Link
              href="/baskferia"
              className="inline-block font-display text-xl uppercase border-2 border-b-neon text-b-neon px-8 py-4 tracking-wider shadow-neon-yellow hover:bg-b-neon hover:text-b-dark transition-all duration-200"
            >
              Ver Tudo sobre o Evento →
            </Link>
          </div>

          {/* Info rápida */}
          <div className="md:w-1/2 grid grid-cols-1 gap-4 max-w-sm w-full">
            {[
              { date: '18 Jul', title: '1º Sábado', desc: 'Desafios individuais — 3pts, X1, Habilidades' },
              { date: '25 Jul', title: '2º Sábado', desc: 'Torneio 5v5 — 8 equipes, categoria livre' },
            ].map(({ date, title, desc }) => (
              <div key={title} className="flex gap-4 items-start border border-b-stone bg-b-dark p-5 hover:border-b-orange transition-colors duration-200">
                <div className="font-display text-b-orange text-xl leading-none min-w-[3.5rem] border-r border-b-stone pr-4">
                  {date}
                </div>
                <div>
                  <div className="font-display text-white text-xl mb-1">{title}</div>
                  <div className="font-body text-gray-500 text-sm">{desc}</div>
                </div>
              </div>
            ))}
            <div className="border border-b-stone bg-b-dark p-5">
              <div className="font-mono text-b-neon text-xs uppercase tracking-widest mb-1">📍 Local</div>
              <div className="font-display text-white text-lg">Col. Est. Prof. Oswaldo Walder</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM FEED — COYOTES ── */}
      <section className="py-24 bg-b-gray border-t border-b-stone">
        <div className="max-w-7xl mx-auto px-6 md:px-20">
          <div className="flex items-center gap-4 mb-12">
            <span className="font-mono text-xs text-gray-600 uppercase tracking-widest">// instagram</span>
            <h2 className="font-display text-4xl text-white uppercase">
              @basquetecoyotes
            </h2>
          </div>
          <InstaFeed profile="coyotes" />
        </div>
      </section>


      {/* ── GALERIA DINÂMICA ── */}
      <section id="galeria" className="py-24 px-6 md:px-20 max-w-7xl mx-auto scroll-mt-32">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="font-mono text-b-orange uppercase tracking-[0.3em] text-xs mb-4 block">
              // galeria
            </span>
            <h2 className="font-display text-6xl md:text-7xl text-white uppercase leading-none">
              Em QUADRA
            </h2>
          </div>
          <div className="hidden md:block font-display text-b-stone text-xl uppercase tracking-widest">
            {/* Aqui pode ir um contador de fotos — DynamicGallery pode expor um count via prop */}
            Fotos da matilha
          </div>
        </div>

        {/* Componente Server Component — lê /public/images/gallery/ no servidor */}
        <DynamicGallery />
      </section>

      <AudioPlayer tracks={audioTracks} />
    </main>
  )
}
