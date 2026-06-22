import { NextRequest, NextResponse } from 'next/server'
import { getSupabasePublic } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '10', 10)
  const sb = getSupabasePublic()

  const { data, error } = await sb
    .from('news')
    .select('id, title, slug, excerpt, cover_url, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ news: data ?? [] })
}
