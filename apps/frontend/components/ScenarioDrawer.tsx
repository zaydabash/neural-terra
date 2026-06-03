'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGlobeStore } from '@/lib/store'
import {
  ChevronDown,
  Play,
  Ship,
  Thermometer,
  AlertTriangle,
  Rocket,
  MapPin,
  Sparkles,
  Plus,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Scenario {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: string
  duration: string
  impact: 'Medium' | 'High' | 'Critical' | 'Epic'
  planet?: 'mars'
  comingSoon?: boolean
}

const scenarios: Scenario[] = [
  { id: 'suez_disruption', name: 'Suez Canal Disruption', description: '40% slowdown for 7 days', icon: Ship, color: 'text-orange-300', duration: '7 days', impact: 'High' },
  { id: 'eu_heatwave', name: 'European Heatwave', description: '+3°C temperature spike', icon: Thermometer, color: 'text-rose-300', duration: '3 days', impact: 'Medium' },
  { id: 'la_port_shutdown', name: 'LA Port Shutdown', description: 'Complete closure for 24h', icon: AlertTriangle, color: 'text-rose-400', duration: '24 hours', impact: 'Critical' },
  { id: 'oxygen_grid_failure', name: 'Oxygen Grid Failure', description: '50% O₂ failure at Colony Alpha', icon: AlertTriangle, color: 'text-rose-300', duration: '48 hours', impact: 'Critical', planet: 'mars' },
  { id: 'launch_delay', name: 'Launch Pad Delay', description: '12-hour maintenance delay', icon: Rocket, color: 'text-orange-300', duration: '12 hours', impact: 'High', planet: 'mars' },
  { id: 'mars_terraforming', name: 'Mars Terraforming', description: 'CO₂ → O₂ conversion', icon: Rocket, color: 'text-rose-200', duration: '100 years', impact: 'Epic', comingSoon: true },
  { id: 'mars_colony', name: 'Mars Colony Planning', description: 'Optimal settlement locations', icon: MapPin, color: 'text-rose-200', duration: '50 years', impact: 'Epic', comingSoon: true },
]

const IMPACT_STYLES: Record<Scenario['impact'], string> = {
  Medium: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  High: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  Critical: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
  Epic: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
}

export default function ScenarioDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const { runScenario, currentPlanet } = useGlobeStore()

  const handleRunScenario = async (scenario: Scenario) => {
    if (scenario.comingSoon) {
      alert(
        'Mars Mode scenarios are coming in Neural Terra v2.0.\n\nTerraforming, colony planning, and ecosystem design are planned but not implemented yet.'
      )
      return
    }
    try {
      await runScenario(scenario.id)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to run scenario:', error)
    }
  }

  const filtered = scenarios.filter((s) => {
    if (s.comingSoon) return true
    if (!s.planet) return currentPlanet === 'earth'
    return s.planet === currentPlanet
  })

  return (
    <div className="absolute right-4 top-[4.75rem] z-30 w-[19rem]">
      {/* Toggle */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="glass flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-ink-800/70"
      >
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-400 to-fuchsia-500 text-ink-950">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="flex-1 text-left">
          <span className="block text-sm font-semibold text-white">Scenarios</span>
          <span className="block text-[11px] text-slate-500">
            {filtered.filter((s) => !s.comingSoon).length} ready to run
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mt-2 overflow-hidden"
          >
            <div className="glass scroll-thin max-h-[60vh] overflow-y-auto p-3">
              <div className="space-y-2">
                {filtered.map((scenario) => {
                  const Icon = scenario.icon
                  const locked = !!scenario.comingSoon
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => handleRunScenario(scenario)}
                      className={`group flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                        locked
                          ? 'border-rose-500/20 bg-gradient-to-br from-rose-900/15 to-orange-900/10 hover:from-rose-900/25'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-ink-800">
                        <Icon className={`h-4 w-4 ${scenario.color}`} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-white">
                            {scenario.name}
                          </span>
                          {locked && (
                            <span className="shrink-0 rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-rose-300">
                              v2.0
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-slate-400">
                          {scenario.description}
                        </span>
                        <span className="mt-2 flex items-center gap-2">
                          <span
                            className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${IMPACT_STYLES[scenario.impact]}`}
                          >
                            {scenario.impact}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {scenario.duration}
                          </span>
                        </span>
                      </span>
                      {!locked && (
                        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors group-hover:bg-sky-500/20 group-hover:text-sky-300">
                          <Play className="h-3.5 w-3.5" fill="currentColor" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:border-white/25 hover:text-white">
                <Plus className="h-4 w-4" />
                Create Custom Scenario
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
