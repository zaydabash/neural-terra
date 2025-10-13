import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Call backend NL API
    const response = await fetch(`${API_BASE_URL}/nl/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error('Backend NL processing failed')
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('NL API error:', error)
    return NextResponse.json(
      { error: 'Natural language processing failed' },
      { status: 500 }
    )
  }
}
