'use client'
import { create } from 'zustand'

type Planet = 'earth' | 'mars'
type Layer = 'weather' | 'ports' | 'grid' | 'alerts'
type Impacts = Record<string, number>

type State = {
  planet: Planet
  active: Record<Layer, boolean>
  impacts: Impacts
  toggleLayer: (k: Layer) => void
  setPlanet: (p: Planet) => void
  runScenario: (payload: any) => Promise<void>
  _setImpacts: (updater: (prev: Impacts) => Impacts) => void
}

export const useSimStore = create<State>((set, get) => ({
  planet: 'earth',
  active: { weather: true, ports: true, grid: true, alerts: true },
  impacts: {},
  toggleLayer: (k) => set(s => ({ active: { ...s.active, [k]: !s.active[k] } })),
  setPlanet: (p) => set({ planet: p }),
  _setImpacts: (updater) => set(s => ({ impacts: updater(s.impacts) })),

  // Hit your backend; fall back to a fake ripple if server not up
  runScenario: async (payload) => {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const endpoint = get().planet === 'mars' ? '/mars/simulate' : '/simulate'
      const r = await fetch(base + endpoint, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          target_ids: payload.targets,
          magnitude: payload.magnitude,
          duration_hours: payload.duration_hours,
          start_ts: payload.start_ts
        }) 
      })
      if (!r.ok) throw new Error(`Bad response ${r.status}`)
      const data = await r.json()  // expect { impact_series: { nodeId: number[] } ... }
      // visualize last timestep impact
      const impacts: Impacts = {}
      const series = data.impact_series || {}
      Object.keys(series).forEach(k => {
        const arr = series[k] || []
        impacts[k] = arr.length ? Math.max(0, Math.min(1, arr[arr.length - 1])) : 0
      })
      set({ impacts })
    } catch {
      // offline demo ripple
      set({ impacts: { 'port:la': 0.9, 'grid:na': 0.6 } })
    }
  }
}))
