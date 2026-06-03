'use client'

import StatusBar from '@/components/StatusBar'
import ControlPanel from '@/components/ControlPanel'
import CesiumEarth from '@/components/CesiumEarth'
import ScenarioDrawer from '@/components/ScenarioDrawer'
import Timeline from '@/components/Timeline'
import NLCommandBar from '@/components/NLCommandBar'
import SimulationResults from '@/components/SimulationResults'

export default function Home() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-ink-950 text-slate-100">
      {/* Globe (hero layer) */}
      <div className="absolute inset-0">
        <CesiumEarth />
      </div>

      {/* Ambient lighting so glass panels read against the globe */}
      <div className="pointer-events-none absolute inset-0 z-[5] bg-vignette" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-48 bg-gradient-to-t from-ink-950/80 to-transparent" />

      {/* HUD */}
      <StatusBar />

      <div className="pointer-events-none absolute left-4 top-20 z-20 w-[19rem]">
        <div className="pointer-events-auto animate-slide-up">
          <ControlPanel />
        </div>
      </div>

      <div className="pointer-events-none absolute right-4 top-20 z-20 w-[19rem]">
        <div className="pointer-events-auto animate-slide-up [animation-delay:80ms]">
          <SimulationResults />
        </div>
      </div>

      <ScenarioDrawer />
      <Timeline />
      <NLCommandBar />
    </div>
  )
}
