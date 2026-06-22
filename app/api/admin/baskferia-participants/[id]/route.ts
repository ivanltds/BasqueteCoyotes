import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  const { id } = await params
  const body   = await req.json()
  const sb     = getSupabaseAdmin()
  const { error } = await sb.from('baskferia_participants').update(body).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  const { id } = await params
  const sb     = getSupabaseAdmin()
  const { error } = await sb.from('baskferia_participants').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
