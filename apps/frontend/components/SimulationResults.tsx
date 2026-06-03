'use client'

import { motion } from 'framer-motion'
import { useGlobeStore } from '@/lib/store'
import { Activity, TrendingUp, Zap, Gauge } from 'lucide-react'

function pct(x: number | undefined): number {
  if (x === undefined || Number.isNaN(x)) return 0
  return Math.max(0, Math.min(100, Math.round(x * 100)))
}

const PRETTY: Record<string, string> = {
  suez_canal: 'Suez Canal',
  panama_canal: 'Panama Canal',
  los_angeles: 'Port of Los Angeles',
  rotterdam: 'Port of Rotterdam',
  singapore: 'Port of Singapore',
  eu_central: 'European Grid',
  eu_north: 'N. European Grid',
  us_east: 'US Eastern Grid',
  us_west: 'US Western Grid',
  // Mars
  colony_alpha: 'Colony Alpha',
  colony_bravo: 'Colony Bravo',
  oxygen_grid: 'Oxygen Grid',
  water_plant: 'Water Plant',
  launch_pad: 'Launch Pad',
}
const prettyName = (id: string) => PRETTY[id] || id.replace(/_/g, ' ')

function severity(p: number): string {
  if (p >= 75) return 'text-rose-300'
  if (p >= 45) return 'text-amber-300'
  return 'text-sky-300'
}
function severityBar(p: number): string {
  if (p >= 75) return 'from-rose-500 to-rose-400'
  if (p >= 45) return 'from-amber-500 to-amber-400'
  return 'from-sky-500 to-cyan-400'
}

export default function SimulationResults() {
  const simulationData = useGlobeStore((s) => s.simulationData)

  if (!simulationData) {
    return (
      <div className="glass p-4" data-testid="simulation-results-empty">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-slate-500" />
          <div className="panel-label">Simulation Results</div>
        </div>
        <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 py-7 text-center">
          <Gauge className="h-6 w-6 text-slate-600" />
          <p className="text-sm text-slate-400">No scenario running</p>
          <p className="max-w-[14rem] text-[11px] text-slate-600">
            Run a scenario to see global trade, energy stress, and the hardest-hit nodes.
          </p>
        </div>
      </div>
    )
  }

  const { kpis, impactSeries } = simulationData

  const metrics = [
    { label: 'Global Trade', icon: TrendingUp, value: pct(kpis.global_trade_index_delta as number) },
    { label: 'Energy Stress', icon: Zap, value: pct(kpis.regional_energy_stress_delta as number) },
    { label: 'Peak Impact', icon: Gauge, value: pct(kpis.peak_impact as number) },
  ]

  const impacts = Object.entries(impactSeries || {})
    .map(([id, series]) => ({ id, max: series.reduce((m, v) => (v > m ? v : m), 0) }))
    .filter((n) => n.max > 0.005) // hide untouched nodes (e.g. the other planet)
    .sort((a, b) => b.max - a.max)
    .slice(0, 4)

  return (
    <div className="glass overflow-hidden" data-testid="simulation-results">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-neural-cyan" />
          <div className="text-sm font-semibold text-white">Simulation Results</div>
        </div>
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neural-cyan" />
      </div>

      <div className="space-y-4 p-4">
        {/* KPI grid */}
        <div className="grid grid-cols-3 gap-2">
          {metrics.map(({ label, icon: Icon, value }) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5"
            >
              <Icon className={`mb-1.5 h-3.5 w-3.5 ${severity(value)}`} />
              <div className={`font-mono text-lg font-semibold leading-none ${severity(value)}`}>
                {value}
                <span className="text-xs text-slate-500">%</span>
              </div>
              <div className="mt-1 text-[10px] leading-tight text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Top impacted nodes */}
        {impacts.length > 0 && (
          <div>
            <div className="panel-label mb-2">Hardest-hit nodes</div>
            <div className="space-y-2.5">
              {impacts.map((n) => {
                const p = pct(n.max)
                return (
                  <div key={n.id}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-200">
                        {prettyName(n.id)}
                      </span>
                      <span className={`font-mono text-xs ${severity(p)}`}>{p}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${p}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${severityBar(p)}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
