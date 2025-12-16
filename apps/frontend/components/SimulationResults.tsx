'use client'

import { useGlobeStore } from '@/lib/store'

function formatPercent(x: number | undefined): string {
  if (x === undefined || Number.isNaN(x)) return '0%'
  return `${Math.round(x * 100)}%`
}

export default function SimulationResults() {
  const simulationData = useGlobeStore(s => s.simulationData)

  if (!simulationData) {
    return (
      <div
        className="flex flex-col gap-2 p-4 bg-gray-800/90 backdrop-blur-sm rounded-lg text-xs text-gray-400"
        data-testid="simulation-results-empty"
      >
        <div className="text-sm font-semibold text-white">Simulation Results</div>
        <div>No scenario has been run yet.</div>
      </div>
    )
  }

  const { kpis, impactSeries } = simulationData

  // Compute top impacted nodes by max impact over time
  const impacts: { id: string; max: number }[] = Object.entries(impactSeries || {}).map(
    ([id, series]) => ({
      id,
      max: series.reduce((m, v) => (v > m ? v : m), 0),
    })
  )

  impacts.sort((a, b) => b.max - a.max)
  const topImpacts = impacts.slice(0, 3)

  const prettyName = (id: string) => {
    const mapping: Record<string, string> = {
      suez_canal: 'Suez Canal',
      panama_canal: 'Panama Canal',
      rotterdam: 'Port of Rotterdam',
      singapore: 'Port of Singapore',
      eu_central: 'European Grid',
      us_east: 'US Eastern Grid',
      us_west: 'US Western Grid',
    }
    return mapping[id] || id.replace(/_/g, ' ')
  }

  return (
    <div
      className="flex flex-col gap-3 p-4 bg-gray-800/90 backdrop-blur-sm rounded-lg text-xs text-gray-200"
      data-testid="simulation-results"
    >
      <div className="text-sm font-semibold text-white">Simulation Results</div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Global Trade Impact</span>
          <span className="font-mono">
            {formatPercent(kpis.global_trade_index_delta as number | undefined)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Energy Stress</span>
          <span className="font-mono">
            {formatPercent(kpis.regional_energy_stress_delta as number | undefined)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Peak Impact</span>
          <span className="font-mono">
            {formatPercent(kpis.peak_impact as number | undefined)}
          </span>
        </div>
      </div>

      {topImpacts.length > 0 && (
        <div className="mt-2 border-t border-gray-700 pt-2">
          <div className="text-xs font-semibold text-gray-300 mb-1">
            Top Impacted Nodes
          </div>
          <div className="space-y-1">
            {topImpacts.map((n) => (
              <div key={n.id} className="flex justify-between">
                <span>{prettyName(n.id)}</span>
                <span className="font-mono">{formatPercent(n.max)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


