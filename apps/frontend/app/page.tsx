'use client'

import StatusBar from '@/components/StatusBar'
import ControlPanel from '@/components/ControlPanel'
import GlobeViewer from '@/components/GlobeViewer'
import ScenarioDrawer from '@/components/ScenarioDrawer'
import Timeline from '@/components/Timeline'
import NLCommandBar from '@/components/NLCommandBar'

export default function Home() {
  return (
    <div className="w-full h-screen bg-gray-900 relative overflow-hidden">
      <StatusBar />

      {/* Control Panel */}
      <div className="absolute left-4 top-16 w-80 z-20">
        <ControlPanel />
      </div>

      {/* Globe Visualization */}
      <div className="absolute inset-0 pt-12">
        <GlobeViewer />
      </div>

      {/* Scenario drawer, timeline, and NL command bar */}
      <ScenarioDrawer />
      <Timeline />
      <NLCommandBar />
    </div>
  )
}