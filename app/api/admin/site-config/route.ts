import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin, getSupabasePublic } from '@/lib/supabase-server'

export async function GET() {
  const sb = getSupabasePublic()
  const { data } = await sb.from('site_config').select('key, value')
  const config: Record<string, string> = {}
  for (const row of data ?? []) config[row.key] = row.value
  return NextResponse.json({ config })
}

export async function PATCH(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const updates: Record<string, string> = await req.json()
  const sb = getSupabaseAdmin()

  const rows = Object.entries(updates).map(([key, value]) => ({
    key,
    value: String(value),
    updated_at: new Date().toISOString(),
  }))

  const { error } = await sb
    .from('site_config')
    .upsert(rows, { onConflict: 'key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
