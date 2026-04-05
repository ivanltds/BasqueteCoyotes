import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'Coyotes do Basquetebol',
    template: '%s | Coyotes do Basquetebol',
  },
  description:
    'Coyotes do Basquetebol — um movimento de streetball da zona oeste de São Paulo. Basquete, cultura, comunidade.',
  keywords: ['basquete', 'streetball', 'baskferia', 'coyotes', 'zona oeste', 'são paulo', 'esporte', 'comunidade'],
  openGraph: {
    title: 'Coyotes do Basquetebol',
    description: 'Talento ganha jogos, mas trabalho em equipe e inteligência ganham campeonatos.',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
