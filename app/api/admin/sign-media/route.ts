import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { isAuthenticated } from '@/lib/admin-auth'

const SECTION_FOLDERS: Record<string, string> = {
  hero_main:        'coyotes/hero/main',
  hero_main_mobile: 'coyotes/hero/main-mobile',
  hero_baskferia:   'coyotes/hero/baskferia',
  person_thiago:    'coyotes/team/thiago',
  person_ivan:      'coyotes/team/ivan',
  person_geovani:   'coyotes/team/geovani',
  news_cover:       'coyotes/news',
}

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const section = req.nextUrl.searchParams.get('section') ?? ''
  const folder  = SECTION_FOLDERS[section]
  if (!folder) {
    return NextResponse.json({ error: 'Seção inválida.' }, { status: 400 })
  }

  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!apiKey || !apiSecret || !cloudName) {
    return NextResponse.json({ error: 'Cloudinary não configurado.' }, { status: 500 })
  }

  const timestamp = Math.floor(Date.now() / 1000).toString()

  const paramsToSign: Record<string, string> = { folder, timestamp }
  const str = Object.keys(paramsToSign)
    .sort()
    .map(k => `${k}=${paramsToSign[k]}`)
    .join('&')

  const signature = crypto
    .createHash('sha1')
    .update(str + apiSecret)
    .digest('hex')

  return NextResponse.json({
    signature,
    timestamp,
    api_key:       apiKey,
    cloud_name:    cloudName,
    folder,
    resource_type: 'auto',
  })
}
