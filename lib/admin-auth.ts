import { cookies } from 'next/headers'
import crypto from 'crypto'

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? 'admin@coyotes.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Coyotes@2026'
const SESSION_SECRET = process.env.SESSION_SECRET ?? 'coyotes-session-secret-2026'

export const COOKIE_NAME = 'coyotes_admin'

export function makeSessionToken(): string {
  return crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`${ADMIN_EMAIL}:${ADMIN_PASSWORD}`)
    .digest('hex')
}

export function validateCredentials(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  return token === makeSessionToken()
}
