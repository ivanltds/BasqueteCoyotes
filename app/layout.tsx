import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://coyotesdobasquetebol.com.br'),
  title: {
    default: 'Coyotes do Basquetebol | Streetball e Comunidade na Zona Oeste SP',
    template: '%s | Coyotes do Basquetebol',
  },
  description:
    'O Coyotes do Basquetebol é um projeto esportivo e social desde 2009 na Zona Oeste de São Paulo. Treinos de basquete, cultura streetball e o evento Baskferia. Junte-se à matilha!',
  keywords: [
    'basquete zona oeste sp', 
    'projeto social basquete sp', 
    'streetball são paulo', 
    'baskferia 2026', 
    'coyotes basquetebol', 
    'treino basquete iniciante sp', 
    'esporte comunitário sp',
    'basquete de rua vila madalena'
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Coyotes do Basquetebol | A Nossa Rua, A Nossa Regra',
    description: 'Desde 2009, transformando vidas através do basquete na Zona Oeste de SP. Conheça o projeto Coyotes e o evento Baskferia.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Coyotes do Basquetebol',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/images/logos/logo-coyotes.png',
    apple: '/images/logos/logo-coyotes.png',
  }
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
