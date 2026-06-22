import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Política de privacidade e uso de cookies do site Coyotes do Basquetebol, conforme a LGPD.',
  robots: { index: false, follow: false },
}

export default function Privacidade() {
  return (
    <main className="min-h-screen bg-b-dark text-white pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <span className="font-mono text-b-orange uppercase tracking-[0.3em] text-xs mb-4 block">
          // lgpd
        </span>
        <h1 className="font-display text-5xl md:text-6xl uppercase leading-none mb-12">
          Política de Privacidade
        </h1>

        <div className="space-y-10 font-body text-gray-300 leading-relaxed">

          <section>
            <h2 className="font-display text-2xl text-white uppercase mb-3">1. Quem somos</h2>
            <p>
              Coyotes do Basquetebol é um projeto esportivo e social localizado na Zona Oeste de São Paulo.
              Este site (<strong className="text-white">basquete-coyotes.vercel.app</strong>) é operado
              pelo responsável do projeto e tem como finalidade divulgar o trabalho do grupo e viabilizar
              inscrições nos eventos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-white uppercase mb-3">2. Dados que coletamos</h2>
            <p className="mb-3">Coletamos dados nas seguintes situações:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong className="text-white">Formulário de inscrição (Baskferia):</strong> nome, número
                de WhatsApp e posição de jogo, usados exclusivamente para organizar o evento e entrar em
                contato com os participantes.
              </li>
              <li>
                <strong className="text-white">Google Analytics (cookies):</strong> dados de navegação
                anônimos (páginas visitadas, dispositivo, localização aproximada) para fins de análise de
                audiência — somente se você aceitar os cookies.
              </li>
              <li>
                <strong className="text-white">Vercel Analytics:</strong> métricas de desempenho
                agregadas e anônimas, sem identificação pessoal.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-white uppercase mb-3">3. Como usamos os dados</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Organização e comunicação sobre os eventos (inscrições).</li>
              <li>Entendimento do perfil do público para melhorar o site (analytics).</li>
              <li>Não vendemos, alugamos nem compartilhamos seus dados com terceiros para fins comerciais.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-white uppercase mb-3">4. Cookies</h2>
            <p>
              Usamos cookies do Google Analytics para medir o uso do site. Você pode aceitar ou recusar
              o uso de cookies no banner que aparece na primeira visita. Se recusar, nenhum dado de
              navegação será coletado. Você pode mudar sua escolha a qualquer momento limpando os dados
              do site no seu navegador.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-white uppercase mb-3">5. Retenção dos dados</h2>
            <p>
              Os dados de inscrição são mantidos pelo período necessário para a realização do evento e
              por até 6 meses após, para eventuais dúvidas ou contatos. Após esse prazo, são deletados.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-white uppercase mb-3">6. Seus direitos (LGPD)</h2>
            <p className="mb-3">
              Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Confirmar se seus dados estão sendo tratados.</li>
              <li>Solicitar acesso, correção ou exclusão dos seus dados.</li>
              <li>Revogar o consentimento a qualquer momento.</li>
            </ul>
            <p className="mt-3">
              Para exercer qualquer um desses direitos, entre em contato pelo WhatsApp:{' '}
              <a href="https://wa.me/5511959924340" className="text-b-orange hover:text-b-neon underline">
                (11) 95992-4340
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-white uppercase mb-3">7. Contato</h2>
            <p>
              Dúvidas sobre esta política:{' '}
              <a href="https://wa.me/5511959924340" className="text-b-orange hover:text-b-neon underline">
                (11) 95992-4340
              </a>{' '}
              — Thiago Fidelis, responsável pelo projeto.
            </p>
          </section>

          <p className="text-xs text-gray-600 border-t border-b-stone pt-6">
            Última atualização: junho de 2026.
          </p>
        </div>

        <div className="mt-12">
          <Link href="/" className="font-display uppercase text-b-orange hover:text-b-neon tracking-widest text-sm transition-colors">
            ← Voltar ao site
          </Link>
        </div>
      </div>
    </main>
  )
}
