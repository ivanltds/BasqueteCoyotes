import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  const sb = getSupabaseAdmin()
  const { data } = await sb.from('members').select('*').order('created_at', { ascending: false })
  return NextResponse.json({ members: data ?? [] })
}
