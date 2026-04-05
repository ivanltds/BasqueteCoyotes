import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const profile = searchParams.get('profile')

  const BEHOLD_URL = profile === 'coyotes'
    ? process.env.NEXT_PUBLIC_BEHOLD_URL_COYOTES
    : process.env.NEXT_PUBLIC_BEHOLD_URL_BASKFERIA

  if (!BEHOLD_URL) {
    return NextResponse.json({ error: 'Behold URL não configurada' }, { status: 500 })
  }

  try {
    const res = await fetch(BEHOLD_URL, {
      next: { revalidate: 3600 } // Cache por 1 hora
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Falha ao buscar Behold' }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API Instagram] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
