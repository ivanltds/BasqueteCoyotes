import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ ok: false, error: 'Variáveis faltando' })
  }

  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')

  // Busca um public_id específico para debug (ex: /api/admin/debug?id=coyotes/gallery/teste/abc)
  const id = req.nextUrl.searchParams.get('id')
  if (id) {
    const r = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload/${id}`,
      { headers: { Authorization: `Basic ${credentials}` }, cache: 'no-store' }
    )
    return NextResponse.json({ status: r.status, body: await r.json() })
  }

  // Lista tudo dentro de coyotes/gallery (todas as subpastas)
  const [folderRes, resourcesRes] = await Promise.all([
    fetch(`https://api.cloudinary.com/v1_1/${cloudName}/folders/coyotes/gallery`, {
      headers: { Authorization: `Basic ${credentials}` }, cache: 'no-store',
    }),
    fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image?type=upload&prefix=coyotes/gallery/&max_results=50`, {
      headers: { Authorization: `Basic ${credentials}` }, cache: 'no-store',
    }),
  ])

  const folders   = await folderRes.json()
  const resources = await resourcesRes.json()

  return NextResponse.json({
    ok: true,
    folders,
    resources: (resources.resources ?? []).map((r: { public_id: string; asset_folder?: string }) => ({
      public_id:    r.public_id,
      asset_folder: r.asset_folder,
    })),
  })
}
