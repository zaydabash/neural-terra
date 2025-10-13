'use client'

import { useGlobeStore } from '@/lib/store'
import { Activity, Wifi, WifiOff } from 'lucide-react'

export default function StatusBar() {
  const { isConnected, currentTime, simulationData } = useGlobeStore()

  return (
    <div className="absolute top-0 left-0 right-0 h-12 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 flex items-center justify-between px-6 z-10">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-neural-blue" />
          <span className="text-sm font-medium text-white">Neural Terra</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400">Live Data</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400">Offline Mode</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="text-xs text-gray-400">
          Simulation Time: {Math.round(currentTime)}h
        </div>
        
        {simulationData && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-neural-orange rounded-full animate-pulse"></div>
            <span className="text-xs text-neural-orange">Simulation Active</span>
          </div>
        )}
      </div>
    </div>
  )
}
