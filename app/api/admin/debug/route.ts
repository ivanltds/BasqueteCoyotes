import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  const envCheck = {
    CLOUDINARY_CLOUD_NAME: !!cloudName,
    CLOUDINARY_API_KEY:    !!apiKey,
    CLOUDINARY_API_SECRET: !!apiSecret,
    cloudNameValue:        cloudName ?? 'MISSING',
    apiKeyPrefix:          apiKey ? apiKey.slice(0, 6) + '…' : 'MISSING',
  }

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ ok: false, envCheck, error: 'Variáveis faltando' })
  }

  // Testa chamada real à API do Cloudinary (ping via lista de pastas)
  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
  const testRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/folders/coyotes/gallery`,
    { headers: { Authorization: `Basic ${credentials}` }, cache: 'no-store' }
  )
  const testBody = await testRes.text()

  // Testa rename com IDs fictícios para ver a resposta de erro (esperado: 404, não 401)
  const renameBody = new URLSearchParams({
    from_public_id: 'coyotes/gallery/pendentes/__test_nonexistent__',
    to_public_id:   'coyotes/gallery/antigas/__test_nonexistent__',
    overwrite:      'false',
  })
  const renameRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/rename`,
    {
      method: 'POST',
      headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: renameBody.toString(),
    }
  )
  const renameBody2 = await renameRes.text()

  return NextResponse.json({
    ok: true,
    envCheck,
    folderTest:  { status: testRes.status,  body: testBody.slice(0, 300) },
    renameTest:  { status: renameRes.status, body: renameBody2.slice(0, 300) },
  })
}
