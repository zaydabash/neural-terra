'use client'
import { useGlobeStore } from '@/lib/store'

export default function ControlPanel() {
  const planet = useGlobeStore(s => s.currentPlanet)
  const setPlanet = useGlobeStore(s => s.setPlanet)
  const active = useGlobeStore(s => s.activeLayers)
  const toggleLayer = useGlobeStore(s => s.toggleLayer)
  const runScenario = useGlobeStore(s => s.runScenario)

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-800/90 backdrop-blur-sm rounded-lg">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Neural Terra</h1>
        <p className="text-gray-400 text-sm">
          {planet === 'earth' ? 'Earth Mode' : 'Mars Mode'}
        </p>
      </div>

      {/* Planet Toggle */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Planet Mode</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setPlanet('earth')}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm ${
              planet === 'earth' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            >
            Earth
          </button>
          <button
            onClick={() => setPlanet('mars')}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm ${
              planet === 'mars' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            >
            Mars
          </button>
        </div>
      </div>

      {/* Data Layers */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Data Layers</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => toggleLayer('weather')}
            className={`p-3 rounded-lg transition-colors text-sm ${
              active.weather 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
              >
                Weather {active.weather ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => toggleLayer('ports')}
            className={`p-3 rounded-lg transition-colors text-sm ${
              active.ports 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
              >
                Ports {active.ports ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => toggleLayer('grid')}
            className={`p-3 rounded-lg transition-colors text-sm ${
              active.grid 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
              >
                Grid {active.grid ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => toggleLayer('alerts')}
            className={`p-3 rounded-lg transition-colors text-sm ${
              active.alerts 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
              >
                Alerts {active.alerts ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Scenario Button */}
      <button
        onClick={() => runScenario('suez_disruption')}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
      >
        Run Suez-like Scenario
      </button>
    </div>
  )
}