'use client'

import { useGlobeStore } from '@/lib/store'
import { Globe2, Radio, WifiOff, Clock } from 'lucide-react'

export default function StatusBar() {
  const isConnected = useGlobeStore((s) => s.isConnected)
  const currentTime = useGlobeStore((s) => s.currentTime)
  const simulationData = useGlobeStore((s) => s.simulationData)
  const planet = useGlobeStore((s) => s.currentPlanet)

  const accent = planet === 'mars' ? 'text-neural-orange' : 'text-neural-cyan'

  return (
    <div className="absolute inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-white/5 bg-ink-950/60 px-4 backdrop-blur-md sm:px-6">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="relative grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-ink-800">
          <Globe2 className={`h-4 w-4 ${accent}`} strokeWidth={2.2} />
          <span
            className={`absolute -inset-px rounded-xl ${
              planet === 'mars' ? 'shadow-glow-red' : 'shadow-glow-blue'
            } opacity-40`}
          />
        </div>
        <div className="leading-none">
          <div className="text-[13px] font-semibold tracking-wide text-white">
            NEURAL&nbsp;TERRA
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-widest2 text-slate-500">
            {planet === 'mars' ? 'Mars Console' : 'Earth Console'}
          </div>
        </div>
      </div>

      {/* Right HUD */}
      <div className="flex items-center gap-2 sm:gap-3">
        {simulationData && (
          <span className="hidden items-center gap-1.5 rounded-full border border-neural-orange/30 bg-neural-orange/10 px-2.5 py-1 text-[11px] font-medium text-neural-orange sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neural-orange" />
            Simulation Active
          </span>
        )}

        <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-800/80 px-2.5 py-1 font-mono text-[11px] text-slate-300">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          T+{Math.round(currentTime)}h
        </span>

        {isConnected ? (
          <span className="flex items-center gap-1.5 rounded-full border border-neural-green/30 bg-neural-green/10 px-2.5 py-1 text-[11px] font-medium text-neural-green">
            <Radio className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Live</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
            <WifiOff className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Offline</span>
          </span>
        )}
      </div>
    </div>
  )
}
