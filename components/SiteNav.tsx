'use client'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

/** Renderiza Header e Footer apenas fora das rotas /admin */
export default function SiteNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  return (
    <>
      {!isAdmin && <Header />}
      {children}
      {!isAdmin && <Footer />}
    </>
  )
}
