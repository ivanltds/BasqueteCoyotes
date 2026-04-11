'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/',          label: 'Time' },
  { href: '/baskferia', label: 'Baskferia' },
  { href: '/apoiar',    label: 'Apoiar' },
  { href: '/#sobre',    label: 'Sobre' },
  { href: '/#galeria',  label: 'Galeria' },
]

export default function Header() {
  const [scrolled, setScrolled]     = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const pathname                     = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fecha menu ao navegar
  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-b-dark/95 backdrop-blur-sm border-b border-b-stone'
          : 'bg-transparent',
      ].join(' ')}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-20 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 relative">
            <Image
              src="/images/logos/logo-coyotes.png"
              alt="Coyotes"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-display text-lg uppercase tracking-wider text-white group-hover:text-b-orange transition-colors duration-200">
            Coyotes
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={[
                    'font-body text-sm uppercase tracking-widest transition-colors duration-200',
                    isActive
                      ? 'text-b-orange'
                      : 'text-gray-400 hover:text-white',
                  ].join(' ')}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* CTA desktop */}
        <div className="hidden md:block">
          <Link
            href="/baskferia"
            className="font-display text-sm uppercase bg-b-orange text-b-dark px-5 py-2 tracking-wider hover:bg-b-neon transition-colors duration-200"
          >
            Baskferia 2026
          </Link>
        </div>

        {/* Hamburger mobile */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-b-dark border-t border-b-stone px-6 py-6">
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="font-display text-2xl uppercase text-gray-300 hover:text-b-orange transition-colors duration-200 block"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/baskferia"
            className="mt-6 inline-block font-display text-xl uppercase bg-b-orange text-b-dark px-6 py-3 tracking-wider"
          >
            Baskferia 2026
          </Link>
        </div>
      )}
    </header>
  )
}
