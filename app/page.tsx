import Link from 'next/link'
import Image from 'next/image'
import DynamicGallery from '@/components/DynamicGallery'
import InstaFeed from '@/components/InstaFeed'
import MarqueeStrip from '@/components/MarqueeStrip'
import { getCloudinaryImages } from '@/lib/cloudinary'

const HERO_FOLDER = process.env.CLOUDINARY_HERO_FOLDER ?? 'coyotes/hero'

export default async function Home() {
  const heroImages = await getCloudinaryImages(HERO_FOLDER, 1)
  const heroSrc = heroImages.length > 0 ? heroImages[0].secure_url : '/images/hero/foto-time-completo.jpg'

  return (
    <main className="min-h-screen bg-b-dark text-white overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden noise-overlay">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroSrc}
            alt="Matilha Coyotes completa"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          {/* Gradient layers para o efeito escuro com vinheta */}
          <div className="absolute inset-0 bg-gradient-to-b from-b-dark/70 via-b-dark/40 to-b-dark" />
          <div className="absolute inset-0 bg-gradient-to-r from-b-dark/50 via-transparent to-b-dark/50" />
        </div>

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
            <a
              href="#sobre"
              className="font-display text-xl uppercase bg-b-orange text-b-dark px-8 py-4 tracking-wider shadow-brutal hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all duration-150"
            >
              Junte-se à Matilha
            </a>
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

      {/* ── SOBRE ── */}
      <section id="sobre" className="py-24 px-6 md:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="font-mono text-b-orange uppercase tracking-[0.3em] text-xs mb-4 block">
              // sobre o projeto
            </span>
            <h2 className="font-display text-6xl md:text-7xl text-white uppercase mb-6 leading-none">
              Nossa Rua,{' '}
              <span className="text-stroke">Nossa Regra</span>
            </h2>
            <p className="font-body text-gray-400 text-lg leading-relaxed mb-6 border-l-2 border-b-stone pl-6">
              O Coyotes do Basquetebol é mais do que um time — é um movimento. Nascido na zona oeste
              de São Paulo, focamos em trazer a cultura do streetball e o impacto positivo do esporte
              para a nossa comunidade.
            </p>
            <p className="font-body text-gray-400 text-lg leading-relaxed pl-6 border-l-2 border-b-stone">
              Jogamos com garra, lealdade e respeito. A quadra é o nosso palco, o bairro é a nossa
              casa, e a matilha é a nossa família.
            </p>
          </div>

          {/* Stats */}
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
              @coyotesdobasquetebol
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
              Em Campo
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

    </main>
  )
}
