import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

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
}

export const useGlobeStore = create<GlobeStore>()(
  devtools(
    (set, get) => ({
      // Viewer state
      viewer: null,
      setViewer: (viewer) => set({ viewer }),

      // Planet state
      currentPlanet: 'earth' as const,
      setPlanet: (planet) => set({ currentPlanet: planet }),

      // Layer state
      activeLayers: {
        weather: true,
        ports: false,
        grid: false,
        alerts: false,
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
      isConnected: true, // Will be updated based on actual connection

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
          })
        } catch (error) {
          console.error('Scenario execution failed:', error)
          throw error
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
            })
          }
        } catch (error) {
          console.error('NL query failed:', error)
          throw error
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
