import { NextResponse } from 'next/server'
import { getSupabasePublic } from '@/lib/supabase-server'

// GET — Retorna todos os torneios ativos
export async function GET() {
  const sb = getSupabasePublic()
  const { data, error } = await sb
    .from('tournaments')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tournaments: data ?? [] })
}
