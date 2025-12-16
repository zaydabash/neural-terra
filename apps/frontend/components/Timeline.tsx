'use client'

import { useState, useEffect } from 'react'
import { useGlobeStore } from '@/lib/store'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'

export default function Timeline() {
  const { 
    currentTime, 
    simulationDuration, 
    isPlaying, 
    setCurrentTime,
    togglePlayback,
    advanceTime,
  } = useGlobeStore()

  const [scrubPosition, setScrubPosition] = useState(0)

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const position = parseFloat(e.target.value)
    setScrubPosition(position)
    setCurrentTime(position)
  }

  const formatTime = (hours: number) => {
    if (hours < 24) {
      return `${Math.round(hours)}h`
    } else {
      const days = Math.floor(hours / 24)
      const remainingHours = hours % 24
      return `${days}d ${Math.round(remainingHours)}h`
    }
  }

  // Simple playback loop: advance one hour every 200ms while playing
  useEffect(() => {
    if (!isPlaying) return
    const id = setInterval(() => {
      advanceTime()
    }, 200)
    return () => clearInterval(id)
  }, [isPlaying, advanceTime])

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
      <div className="flex items-center space-x-4">
        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentTime(Math.max(0, currentTime - 1))}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
          >
            <SkipBack className="w-4 h-4 text-gray-400" />
          </button>
          
          <button
            onClick={togglePlayback}
            className="p-2 bg-neural-blue hover:bg-blue-600 rounded transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white" />
            )}
          </button>
          
          <button
            onClick={() => setCurrentTime(Math.min(simulationDuration, currentTime + 1))}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
          >
            <SkipForward className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 w-12">
              {formatTime(currentTime)}
            </span>
            
            <input
              type="range"
              min="0"
              max={simulationDuration}
              step="0.1"
              value={currentTime}
              onChange={handleScrub}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            
            <span className="text-xs text-gray-400 w-12">
              {formatTime(simulationDuration)}
            </span>
          </div>
        </div>

        {/* Speed Control */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">Speed:</span>
          <select className="px-2 py-1 bg-gray-700 text-white text-xs rounded border border-gray-600">
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="2">2x</option>
            <option value="5">5x</option>
          </select>
        </div>
      </div>
    </div>
  )
}
