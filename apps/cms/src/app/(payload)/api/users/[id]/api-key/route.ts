import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookie = request.headers.get('cookie') ?? ''
  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL

  if (!cookie) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
  }
  if (!baseUrl) {
    return NextResponse.json({ message: 'Server misconfigured (missing PAYLOAD_PUBLIC_SERVER_URL)' }, { status: 500 })
  }

  // Verify the caller can access this user (respects session/permissions via REST)
  const check = await fetch(`${baseUrl}/api/users/${id}`, {
    headers: {
      cookie,
    },
    cache: 'no-store',
  })

  if (check.status === 401) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
  }
  if (check.status === 403) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }
  if (!check.ok) {
    return NextResponse.json(
      { message: 'Unable to read user', status: check.status },
      { status: check.status },
    )
  }

  const apiKey = crypto.randomBytes(48).toString('hex')

  const update = await fetch(`${baseUrl}/api/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      cookie,
    },
    body: JSON.stringify({
      enableAPIKey: true,
      apiKey,
    }),
    cache: 'no-store',
  })

  if (!update.ok) {
    const text = await update.text()
    return NextResponse.json(
      {
        message: 'Failed to generate API key',
        status: update.status,
        error: text || undefined,
      },
      { status: update.status },
    )
  }

  return NextResponse.json({ apiKey })
}
