'use client'

import { motion } from 'framer-motion'
import { useGlobeStore, type LayerState } from '@/lib/store'
import { Globe, Mountain, CloudSun, Anchor, Zap, AlertTriangle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface LayerDef {
  key: keyof LayerState
  label: string
  icon: LucideIcon
  dot: string
  active: string
}

const LAYERS: LayerDef[] = [
  { key: 'weather', label: 'Weather', icon: CloudSun, dot: 'bg-sky-400', active: 'text-sky-300' },
  { key: 'ports', label: 'Ports', icon: Anchor, dot: 'bg-emerald-400', active: 'text-emerald-300' },
  { key: 'grid', label: 'Power Grid', icon: Zap, dot: 'bg-amber-400', active: 'text-amber-300' },
  { key: 'alerts', label: 'Alerts', icon: AlertTriangle, dot: 'bg-rose-400', active: 'text-rose-300' },
]

export default function ControlPanel() {
  const planet = useGlobeStore((s) => s.currentPlanet)
  const setPlanet = useGlobeStore((s) => s.setPlanet)
  const active = useGlobeStore((s) => s.activeLayers)
  const toggleLayer = useGlobeStore((s) => s.toggleLayer)

  const activeCount = Object.values(active).filter(Boolean).length

  return (
    <div className="glass overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div>
          <div className="panel-label">Mission Control</div>
          <div className="mt-0.5 text-sm font-semibold text-white">Data Layers & Body</div>
        </div>
        <span className="rounded-md bg-white/5 px-2 py-1 font-mono text-[11px] text-slate-400">
          {activeCount}/4
        </span>
      </div>

      <div className="space-y-5 p-4">
        {/* Planet segmented switch */}
        <div>
          <div className="panel-label mb-2">Planetary Body</div>
          <div className="relative flex rounded-2xl border border-white/10 bg-ink-800/70 p-1">
            {(['earth', 'mars'] as const).map((p) => {
              const selected = planet === p
              const Icon = p === 'earth' ? Globe : Mountain
              return (
                <button
                  key={p}
                  onClick={() => setPlanet(p)}
                  className={`seg-btn flex items-center justify-center gap-2 ${
                    selected
                      ? p === 'earth'
                        ? 'text-ink-950'
                        : 'text-ink-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="planet-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className={`absolute inset-1 -z-10 rounded-xl ${
                        p === 'earth'
                          ? 'bg-gradient-to-br from-sky-300 to-cyan-400 shadow-glow-blue'
                          : 'bg-gradient-to-br from-orange-300 to-rose-400 shadow-glow-red'
                      }`}
                    />
                  )}
                  <Icon className="h-4 w-4" />
                  {p === 'earth' ? 'Earth' : 'Mars'}
                </button>
              )
            })}
          </div>
        </div>

        {/* Layer toggles */}
        <div>
          <div className="panel-label mb-2">Overlays</div>
          <div className="space-y-1.5">
            {LAYERS.map(({ key, label, icon: Icon, dot, active: activeText }) => {
              const on = active[key]
              return (
                <button
                  key={key}
                  onClick={() => toggleLayer(key)}
                  className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    on
                      ? 'border-white/10 bg-white/[0.04]'
                      : 'border-transparent bg-transparent hover:bg-white/[0.03]'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${on ? dot : 'bg-slate-600'}`} />
                  <Icon
                    className={`h-4 w-4 ${on ? activeText : 'text-slate-500'}`}
                    strokeWidth={2}
                  />
                  <span
                    className={`flex-1 text-sm font-medium ${
                      on ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {label}
                  </span>
                  {/* switch */}
                  <span
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      on ? 'bg-sky-500/80' : 'bg-slate-700'
                    }`}
                  >
                    <motion.span
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow ${
                        on ? 'left-[1.125rem]' : 'left-0.5'
                      }`}
                    />
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-slate-500">
          Use the command bar below or open Scenarios to run a simulation and watch ripple
          effects propagate across the globe.
        </p>
      </div>
    </div>
  )
}
