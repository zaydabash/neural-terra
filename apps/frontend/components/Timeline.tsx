'use client'

import { useState, useEffect } from 'react'
import { useGlobeStore } from '@/lib/store'
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react'

const SPEEDS = [0.5, 1, 2, 5] as const

export default function Timeline() {
  const {
    currentTime,
    simulationDuration,
    isPlaying,
    simulationData,
    setCurrentTime,
    togglePlayback,
    advanceTime,
    resetSimulation,
  } = useGlobeStore()

  const [speed, setSpeed] = useState<number>(1)

  const formatTime = (hours: number) => {
    if (hours < 24) return `${Math.round(hours)}h`
    const days = Math.floor(hours / 24)
    const remainingHours = Math.round(hours % 24)
    return `${days}d ${remainingHours}h`
  }

  // Playback loop. Interval scales with the selected speed.
  useEffect(() => {
    if (!isPlaying) return
    const id = setInterval(() => advanceTime(), Math.max(40, 200 / speed))
    return () => clearInterval(id)
  }, [isPlaying, advanceTime, speed])

  const progress = simulationDuration > 0 ? (currentTime / simulationDuration) * 100 : 0
  const disabled = !simulationData

  return (
    <div className="absolute bottom-4 left-1/2 z-20 w-[min(680px,calc(100%-2rem))] -translate-x-1/2">
      <div className="glass animate-slide-up px-4 py-3 [animation-delay:120ms]">
        <div className="flex items-center gap-4">
          {/* Transport */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentTime(Math.max(0, currentTime - 1))}
              disabled={disabled}
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
              title="Step back"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              onClick={togglePlayback}
              disabled={disabled}
              className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 text-ink-950 shadow-glow-blue transition-transform hover:scale-105 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" fill="currentColor" />
              ) : (
                <Play className="h-4 w-4 translate-x-px" fill="currentColor" />
              )}
            </button>

            <button
              onClick={() => setCurrentTime(Math.min(simulationDuration, currentTime + 1))}
              disabled={disabled}
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
              title="Step forward"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          {/* Scrubber */}
          <div className="flex flex-1 items-center gap-3">
            <span className="w-12 text-right font-mono text-[11px] text-slate-300">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={simulationDuration}
              step={0.1}
              value={currentTime}
              disabled={disabled}
              onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
              className="nt-slider flex-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: `linear-gradient(to right, #38bdf8 ${progress}%, rgba(148,163,184,0.18) ${progress}%)`,
              }}
            />
            <span className="w-12 font-mono text-[11px] text-slate-500">
              {formatTime(simulationDuration)}
            </span>
          </div>

          {/* Speed + reset */}
          <div className="flex items-center gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`rounded-md px-1.5 py-1 font-mono text-[11px] transition-colors ${
                  speed === s
                    ? 'bg-sky-500/20 text-sky-300'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {s}x
              </button>
            ))}
            <button
              onClick={resetSimulation}
              disabled={disabled}
              className="ml-1 grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
              title="Reset"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
