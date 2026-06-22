import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  const sb = getSupabaseAdmin()

  const [mRes, bRes] = await Promise.all([
    sb.from('members')
      .select('id, name, city, photo_url, rating, story, highlights, improvement_points, suggestions, testimonial_approved, approved, created_at')
      .not('story', 'is', null)
      .order('created_at', { ascending: false }),
    sb.from('baskferia_participants')
      .select('id, name, city, photo_url, rating, story, highlights, improvement_points, suggestions, testimonial_approved, created_at')
      .not('story', 'is', null)
      .order('created_at', { ascending: false }),
  ])

  const members = (mRes.data ?? []).map(r => ({ ...r, source: 'coyotes' as const }))
  const bask    = (bRes.data ?? []).map(r => ({ ...r, source: 'baskferia' as const, approved: true }))
  const all     = [...members, ...bask].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  return NextResponse.json({ feedback: all })
}
