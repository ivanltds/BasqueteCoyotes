interface MarqueeStripProps {
  variant?: 'orange' | 'neon'
}

const WORDS_ORANGE = [
  'COYOTES', '·', 'BASQUETEBOL', '·', 'ZONA OESTE', '·',
  'STREETBALL', '·', 'MATILHA', '·', 'SÃO PAULO', '·',
  'COYOTES', '·', 'BASQUETEBOL', '·', 'ZONA OESTE', '·',
  'STREETBALL', '·', 'MATILHA', '·', 'SÃO PAULO', '·',
]

const WORDS_NEON = [
  'BASKFERIA', '·', '4ª EDIÇÃO', '·', '2026', '·',
  'ZONA OESTE', '·', '5v5', '·', 'X1', '·',
  'BASKFERIA', '·', '4ª EDIÇÃO', '·', '2026', '·',
  'ZONA OESTE', '·', '5v5', '·', 'X1', '·',
]

export default function MarqueeStrip({ variant = 'orange' }: MarqueeStripProps) {
  const words = variant === 'neon' ? WORDS_NEON : WORDS_ORANGE
  const color = variant === 'neon' ? 'text-b-neon' : 'text-b-orange'
  const bg    = variant === 'neon' ? 'bg-b-stone'  : 'bg-b-gray'

  // Duplica para seamless loop
  const allWords = [...words, ...words]

  return (
    <div className={`${bg} border-y border-b-stone py-3 overflow-hidden`}>
      <div className="flex whitespace-nowrap animate-marquee">
        {allWords.map((word, i) => (
          <span
            key={i}
            className={`font-display text-sm uppercase tracking-widest ${color} mx-4 flex-shrink-0`}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  )
}
