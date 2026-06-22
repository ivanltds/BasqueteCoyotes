'use client'

import Link from 'next/link'
import { useCookieConsent } from '@/contexts/CookieConsentContext'

export default function CookieBanner() {
  const { bannerVisible, accept, reject } = useCookieConsent()

  if (!bannerVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-b-dark border-t-2 border-b-orange">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="font-body text-sm text-gray-300 flex-1">
          Usamos cookies para analytics (Google Analytics) e para processar os dados das inscrições,
          conforme a{' '}
          <Link href="/privacidade" className="text-b-orange underline hover:text-b-neon transition-colors">
            nossa política de privacidade
          </Link>
          {' '}(LGPD).
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={reject}
            className="font-mono text-xs uppercase px-4 py-2 border border-b-stone text-gray-400 hover:text-white hover:border-white transition-all"
          >
            Recusar
          </button>
          <button
            onClick={accept}
            className="font-mono text-xs uppercase px-4 py-2 bg-b-orange text-b-dark hover:bg-b-neon transition-all font-bold"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}
