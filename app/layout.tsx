import type { Metadata } from 'next'
import './globals.css'
import SiteNav from '@/components/SiteNav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { CookieConsentProvider } from '@/contexts/CookieConsentContext'
import CookieBanner from '@/components/CookieBanner'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://basquete-coyotes.vercel.app'),
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
    'baskferia',
    'baskferia 2026',
    'coyotes basquetebol',
    'coyotes do basquetebol',
    'treino basquete iniciante sp',
    'esporte comunitário sp',
    'basquete de rua vila madalena',
    'torneio basquete sp',
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
  },
  verification: {
    google: 'yf2lvvRi68ocJ8s8lSU4f1jxjrFPePcNt7IzQYYR0mA',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* gtag consent: nega analytics por padrão até o usuário aceitar */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', { analytics_storage: 'denied' });
            `,
          }}
        />
      </head>
      <body>
        <CookieConsentProvider>
          <SiteNav>
            {children}
          </SiteNav>
          <CookieBanner />
          <Analytics />
          <SpeedInsights />
        </CookieConsentProvider>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  )
}
