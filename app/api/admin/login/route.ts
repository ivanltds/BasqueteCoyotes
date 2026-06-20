import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials, makeSessionToken, COOKIE_NAME } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!validateCredentials(email, password)) {
    return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, makeSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 horas
  })
  return res
}
