import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const PENDING_FOLDER = 'coyotes/gallery/pendentes'

export async function GET(req: NextRequest) {
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!apiKey || !apiSecret || !cloudName) {
    return NextResponse.json({ error: 'Cloudinary não configurado.' }, { status: 500 })
  }

  const targetGallery = req.nextUrl.searchParams.get('target') ?? 'antigas'
  const timestamp     = Math.floor(Date.now() / 1000).toString()
  const context       = `target_gallery=${targetGallery}`
  const folder        = PENDING_FOLDER

  // Parâmetros ordenados alfabeticamente (sem file, api_key, resource_type, cloud_name)
  const paramsToSign = { context, folder, timestamp }
  const str = Object.keys(paramsToSign)
    .sort()
    .map(k => `${k}=${paramsToSign[k as keyof typeof paramsToSign]}`)
    .join('&')

  const signature = crypto
    .createHash('sha1')
    .update(str + apiSecret)
    .digest('hex')

  return NextResponse.json({ signature, timestamp, api_key: apiKey, cloud_name: cloudName, folder, context })
}
