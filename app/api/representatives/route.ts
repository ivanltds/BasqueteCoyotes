import { NextResponse } from 'next/server'
import { getSupabasePublic } from '@/lib/supabase-server'

// GET — Retorna todos os representantes públicos em ordem alfabética
export async function GET() {
  const sb = getSupabasePublic()

  const { data, error } = await sb
    .from('representatives')
    .select('id, name, modality, photo_url, link, teams(name)')
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Mapear para facilitar o consumo no frontend, transformando o objeto teams em uma string teamName
  const formatted = (data ?? []).map((rep: any) => ({
    id: rep.id,
    name: rep.name,
    modality: rep.modality,
    photo_url: rep.photo_url,
    link: rep.link,
    team_name: rep.teams?.name ?? 'Sem time'
  }))

  return NextResponse.json({ representatives: formatted })
}
