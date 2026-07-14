import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const ALLOWED: Record<string, string> = {
  member_photo:    'coyotes/members',
  baskferia_photo: 'coyotes/baskferia',
  team_logo:       'coyotes/teams',
  team_photo:      'coyotes/teams',
}

export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get('section') ?? ''
  const folder  = ALLOWED[section]
  if (!folder) return NextResponse.json({ error: 'Seção inválida.' }, { status: 400 })

  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!apiKey || !apiSecret || !cloudName)
    return NextResponse.json({ error: 'Cloudinary não configurado.' }, { status: 500 })

  const timestamp = Math.floor(Date.now() / 1000).toString()
  const str       = `folder=${folder}&timestamp=${timestamp}`
  const signature = crypto.createHash('sha1').update(str + apiSecret).digest('hex')

  return NextResponse.json({ signature, timestamp, api_key: apiKey, cloud_name: cloudName, folder })
}
