import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-b-dark border-t border-b-stone py-16 px-6 md:px-20">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="w-16 h-16 relative mb-4">
              <Image
                src="/images/logos/logo-coyotes.png"
                alt="Coyotes"
                fill
                className="object-contain"
              />
            </div>
            <p className="font-body text-gray-500 text-sm leading-relaxed max-w-xs">
              Basquete, cultura e comunidade na zona oeste de São Paulo.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-xl text-white uppercase mb-4">Navegação</h4>
            <ul className="space-y-2">
              {[
                { href: '/',          label: 'O Time' },
                { href: '/baskferia', label: 'Baskferia 2026' },
                { href: '/#sobre',    label: 'Sobre o Projeto' },
                { href: '/#galeria',  label: 'Galeria' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="font-body text-gray-500 hover:text-b-orange transition-colors duration-200 text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-display text-xl text-white uppercase mb-4">Redes</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: '@basquetecoyotes', href: 'https://instagram.com/basquetecoyotes' },
                { label: '@baskferia',             href: 'https://instagram.com/baskferia' },
              ].map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-gray-500 hover:text-b-orange transition-colors duration-200 text-sm flex items-center gap-2"
                >
                  <span className="text-b-orange">▸</span>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-b-stone pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-gray-700 text-xs uppercase tracking-widest">
            © {year} @basquetecoyotes. Todos os direitos reservados.
          </p>
          <Link href="/privacidade" className="font-mono text-gray-700 text-xs hover:text-gray-400 transition-colors underline">
            Política de Privacidade
          </Link>
          <p className="font-mono text-gray-700 text-xs">
            Zona Oeste · São Paulo · SP
          </p>
          <Link href="/admin" className="font-mono text-base text-gray-700 hover:text-gray-500 transition-colors">
            ⚙
          </Link>
        </div>
      </div>
    </footer>
  )
}
