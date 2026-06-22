import { NextRequest, NextResponse } from 'next/server'
import { getSupabasePublic } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') ?? 'coyotes'
  const sb   = getSupabasePublic()

  if (type === 'baskferia') {
    const { data } = await sb
      .from('baskferia_participants')
      .select('id, name, city, photo_url, rating, story, highlights')
      .eq('testimonial_approved', true)
      .order('created_at', { ascending: false })
    return NextResponse.json({ testimonials: data ?? [] })
  }

  const { data } = await sb
    .from('members')
    .select('id, name, city, photo_url, rating, story, highlights, role')
    .eq('approved', true)
    .eq('testimonial_approved', true)
    .order('created_at', { ascending: false })
  return NextResponse.json({ testimonials: data ?? [] })
}
