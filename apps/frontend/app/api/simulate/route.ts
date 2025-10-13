import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Map frontend scenario IDs to backend shock parameters
    const scenarioMappings: Record<string, any> = {
      'suez_disruption': {
        target_ids: ['suez_canal'],
        magnitude: 0.4,
        duration_hours: 168,
        start_ts: new Date().toISOString()
      },
      'eu_heatwave': {
        target_ids: ['eu_central', 'eu_north'],
        magnitude: 0.6,
        duration_hours: 72,
        start_ts: new Date().toISOString()
      },
      'la_port_shutdown': {
        target_ids: ['los_angeles'],
        magnitude: 1.0,
        duration_hours: 24,
        start_ts: new Date().toISOString()
      }
    }

    const scenarioId = body.scenarioId
    const shockParams = scenarioMappings[scenarioId]

    if (!shockParams) {
      return NextResponse.json(
        { error: 'Unknown scenario ID' },
        { status: 400 }
      )
    }

    // Call backend simulation API
    const response = await fetch(`${API_BASE_URL}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shockParams),
    })

    if (!response.ok) {
      throw new Error('Backend simulation failed')
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Simulation API error:', error)
    return NextResponse.json(
      { error: 'Simulation failed' },
      { status: 500 }
    )
  }
}
