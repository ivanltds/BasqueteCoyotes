'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type ConsentStatus = 'unknown' | 'accepted' | 'rejected'

interface CookieConsentCtx {
  status: ConsentStatus
  bannerVisible: boolean
  accept: () => void
  reject: () => void
}

const Ctx = createContext<CookieConsentCtx>({
  status: 'unknown',
  bannerVisible: false,
  accept: () => {},
  reject: () => {},
})

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus]               = useState<ConsentStatus>('unknown')
  const [bannerVisible, setBannerVisible] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('cookie_consent') as ConsentStatus | null
    if (saved === 'accepted' || saved === 'rejected') {
      setStatus(saved)
      setBannerVisible(false)
      if (saved === 'accepted') grantConsent()
    } else {
      setBannerVisible(true)
    }
  }, [])

  const accept = useCallback(() => {
    localStorage.setItem('cookie_consent', 'accepted')
    setStatus('accepted')
    setBannerVisible(false)
    grantConsent()
  }, [])

  const reject = useCallback(() => {
    localStorage.setItem('cookie_consent', 'rejected')
    setStatus('rejected')
    setBannerVisible(false)
  }, [])

  return (
    <Ctx.Provider value={{ status, bannerVisible, accept, reject }}>
      {children}
    </Ctx.Provider>
  )
}

export function useCookieConsent() {
  return useContext(Ctx)
}

type GtagFn = (cmd: string, ...args: unknown[]) => void

function grantConsent() {
  if (typeof window === 'undefined') return
  const w = window as unknown as { gtag?: GtagFn }
  if (typeof w.gtag === 'function') {
    w.gtag('consent', 'update', { analytics_storage: 'granted' })
  }
}
