'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erro ao fazer login.')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-b-dark flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <Image
            src="/images/logos/logo-coyotes.png"
            alt="Coyotes"
            width={80}
            height={80}
            className="opacity-80"
          />
        </div>

        <div className="bg-b-gray border-2 border-b-stone p-8 shadow-brutal">
          <h1 className="font-display text-3xl uppercase text-white mb-1">Admin</h1>
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-8">
            // área restrita
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="font-mono text-xs uppercase text-gray-500 mb-2 block">E-mail</span>
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-b-dark border-2 border-b-stone focus:border-b-orange p-3 font-body text-white outline-none transition-colors"
              />
            </label>

            <label className="block">
              <span className="font-mono text-xs uppercase text-gray-500 mb-2 block">Senha</span>
              <input
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-b-dark border-2 border-b-stone focus:border-b-orange p-3 font-body text-white outline-none transition-colors"
              />
            </label>

            {error && (
              <p className="font-mono text-xs text-red-400 bg-red-950/30 border border-red-900 px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-b-orange text-b-dark font-display text-xl uppercase py-4 tracking-widest shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
