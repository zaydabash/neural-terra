import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import worldGraph from './worldGraph.json'

type GraphData = { nodes: any[]; edges: any[] }

// Bundled offline graph so the globe always renders nodes, even when no
// backend is reachable (e.g. the hosted static demo).
const FALLBACK_GRAPH: Record<'earth' | 'mars', GraphData> = worldGraph as Record<
  'earth' | 'mars',
  GraphData
>

export interface LayerState {
  weather: boolean
  ports: boolean
  grid: boolean
  alerts: boolean
}

export interface SimulationData {
  scenarioId: string
  impactSeries: Record<string, number[]>
  kpis: Record<string, any>
  duration: number
}

interface GlobeStore {
  // Viewer state
  viewer: any | null
  setViewer: (viewer: any) => void

  // Planet state
  currentPlanet: 'earth' | 'mars'
  setPlanet: (planet: 'earth' | 'mars') => void

  // Layer state
  activeLayers: LayerState
  toggleLayer: (layer: keyof LayerState) => void

  // Simulation state
  simulationData: SimulationData | null
  currentTime: number
  simulationDuration: number
  isPlaying: boolean

  // Connection state
  isConnected: boolean

  // Actions
  runScenario: (scenarioId: string) => Promise<void>
  runNLQuery: (query: string) => Promise<void>
  togglePlayback: () => void
  setCurrentTime: (time: number) => void
  resetSimulation: () => void
  advanceTime: () => void

  // Graph state
  graphData: { nodes: any[], edges: any[] } | null
  fetchGraph: () => Promise<void>
}

export const useGlobeStore = create<GlobeStore>()(
  devtools(
    (set, get) => ({
      // Viewer state
      viewer: null,
      setViewer: (viewer) => set({ viewer }),

      // Planet state
      currentPlanet: 'earth' as const,
      setPlanet: (planet) => {
        set({ currentPlanet: planet })
        get().fetchGraph()
      },

      // Graph state
      graphData: null,
      fetchGraph: async () => {
        const planet = get().currentPlanet
        try {
          const endpoint = planet === 'earth' ? '/api/graph' : '/api/mars/graph'
          const response = await fetch(endpoint)
          if (!response.ok) throw new Error('Failed to fetch graph')
          const data = await response.json()
          // Guard against an empty/invalid payload, fall back to bundled graph.
          if (!data?.nodes?.length) throw new Error('Empty graph payload')
          set({ graphData: data, isConnected: true })
        } catch (error) {
          console.error('Graph fetch failed, using bundled offline graph:', error)
          set({ graphData: FALLBACK_GRAPH[planet], isConnected: false })
        }
      },

      // Layer state
      activeLayers: {
        weather: true,
        ports: true,
        grid: true,
        alerts: true,
      },
      toggleLayer: (layer) =>
        set((state) => ({
          activeLayers: {
            ...state.activeLayers,
            [layer]: !state.activeLayers[layer],
          },
        })),

      // Simulation state
      simulationData: null,
      currentTime: 0,
      simulationDuration: 168, // 7 days default
      isPlaying: false,

      // Connection state
      isConnected: true, // Updated based on backend health

      // Actions
      runScenario: async (scenarioId: string) => {
        try {
          const response = await fetch('/api/simulate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              scenarioId,
              // Add scenario-specific parameters
            }),
          })

          if (!response.ok) {
            throw new Error('Failed to run scenario')
          }

          const data = await response.json()

          set({
            simulationData: {
              scenarioId: data.scenario_id,
              impactSeries: data.impact_series,
              kpis: data.kpis,
              duration: data.duration_hours,
            },
            simulationDuration: data.duration_hours,
            currentTime: 0,
            isPlaying: true,
            isConnected: true,
          })
        } catch (error) {
          console.error('Scenario execution failed:', error)

          // Offline demo fallback: synthesize a planet-appropriate pattern
          const ramp = (base: number, slope: number) =>
            Array.from({ length: 169 }, (_, i) =>
              i === 0 ? 0 : Math.min(1, base + i * slope)
            )

          const fallbackImpactSeries: Record<string, number[]> =
            get().currentPlanet === 'mars'
              ? {
                  oxygen_grid: ramp(0.5, 0.003),
                  colony_alpha: ramp(0.35, 0.0028),
                  colony_bravo: ramp(0.28, 0.0024),
                }
              : {
                  suez_canal: ramp(0.4, 0.003),
                  rotterdam: ramp(0.3, 0.0025),
                  eu_central: ramp(0.25, 0.002),
                }

          set({
            simulationData: {
              scenarioId: `demo_${scenarioId}`,
              impactSeries: fallbackImpactSeries,
              kpis: {
                global_trade_index_delta: 0.7,
                regional_energy_stress_delta: 0.5,
                peak_impact: 0.7,
                peak_impact_time_hours: 24,
              },
              duration: 168,
            },
            simulationDuration: 168,
            currentTime: 0,
            isPlaying: true,
            isConnected: false,
          })
        }
      },

      runNLQuery: async (query: string) => {
        try {
          const response = await fetch('/api/nl/run', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: query }),
          })

          if (!response.ok) {
            throw new Error('Failed to process NL query')
          }

          const data = await response.json()

          if (data.simulation_result) {
            set({
              simulationData: {
                scenarioId: data.simulation_result.scenario_id,
                impactSeries: data.simulation_result.impact_series,
                kpis: data.simulation_result.kpis,
                duration: data.simulation_result.duration_hours,
              },
              simulationDuration: data.simulation_result.duration_hours,
              currentTime: 0,
              isPlaying: true,
              isConnected: true,
            })
          }
        } catch (error) {
          console.error('NL query failed:', error)

          // NL offline: keep existing simulation state but mark as disconnected
          set({ isConnected: false })
        }
      },

      togglePlayback: () =>
        set((state) => ({ isPlaying: !state.isPlaying })),

      setCurrentTime: (time: number) =>
        set({ currentTime: Math.max(0, Math.min(time, get().simulationDuration)) }),

      advanceTime: () =>
        set((state) => {
          if (!state.isPlaying || !state.simulationData) return state
          const next = Math.min(state.simulationDuration, state.currentTime + 1)
          return { ...state, currentTime: next }
        }),

      resetSimulation: () =>
        set({
          simulationData: null,
          currentTime: 0,
          isPlaying: false,
        }),
    }),
    {
      name: 'globe-store',
    }
  )
)
