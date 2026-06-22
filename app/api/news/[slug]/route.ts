import { NextRequest, NextResponse } from 'next/server'
import { getSupabasePublic } from '@/lib/supabase-server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const sb = getSupabasePublic()

  const { data, error } = await sb
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 })
  return NextResponse.json({ news: data })
}
