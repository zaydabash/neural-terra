import { NextResponse } from 'next/server'

// Live proxy to the backend — never prerender at build time.
export const dynamic = 'force-dynamic'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/mars/graph`)
    if (!response.ok) {
      throw new Error('Backend Mars graph fetch failed')
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Mars graph API error:', error)
    // Signal the client to use its bundled offline fallback graph.
    return NextResponse.json({ error: 'Mars graph unavailable' }, { status: 503 })
  }
}
