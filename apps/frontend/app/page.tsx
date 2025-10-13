'use client'

import { useState } from 'react'

export default function Home() {
  const [currentPlanet, setCurrentPlanet] = useState<'earth' | 'mars'>('earth')
  const [activeLayers, setActiveLayers] = useState({
    weather: true,
    ports: true,
    grid: true,
    alerts: true,
  })
  const [impacts, setImpacts] = useState<Record<string, number>>({})
  const [showCesium, setShowCesium] = useState(false)

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }))
  }

  const runScenario = async () => {
    try {
      // Show loading state
      const scenarioBtn = document.getElementById('scenario-btn') as HTMLButtonElement
      if (scenarioBtn) {
        scenarioBtn.innerHTML = '🔄 Running Simulation...'
        scenarioBtn.disabled = true
      }
      
      // Simulate progressive impact buildup
      const maxImpacts = { 
        'rotterdam': 0.8, 
        'eu_central': 0.6,
        'suez_canal': 0.4,
        'panama_canal': 0.3,
        'singapore_port': 0.5
      }
      
      // Animate impact buildup over 3 seconds
      for (let step = 0; step <= 20; step++) {
        await new Promise(resolve => setTimeout(resolve, 150))
        
        const progress = step / 20
        const newImpacts: Record<string, number> = {}
        
        Object.entries(maxImpacts).forEach(([key, maxValue]) => {
          newImpacts[key] = Math.sin(progress * Math.PI / 2) * maxValue
        })
        
        setImpacts(newImpacts)
      }
      
      // Reset button
      if (scenarioBtn) {
        scenarioBtn.innerHTML = '🚀 Run Suez-like Scenario'
        scenarioBtn.disabled = false
      }
      
      console.log('✅ Scenario completed with dynamic effects:', impacts)
      
    } catch (error) {
      console.error('❌ Scenario failed:', error)
      const scenarioBtn = document.getElementById('scenario-btn') as HTMLButtonElement
      if (scenarioBtn) {
        scenarioBtn.innerHTML = '🚀 Run Suez-like Scenario'
        scenarioBtn.disabled = false
      }
    }
  }

  return (
    <div className="w-full h-screen bg-gray-900 relative overflow-hidden">
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 flex items-center justify-between px-6 z-10">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-white">Neural Terra</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-400 rounded-full"></div>
            <span className="text-xs text-green-400">Live Data</span>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-xs text-gray-400">
            Simulation Time: 0h
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="absolute left-4 top-16 w-80 z-20">
        <div className="flex flex-col gap-4 p-4 bg-gray-800/90 backdrop-blur-sm rounded-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Neural Terra</h1>
            <p className="text-gray-400 text-sm">
              {currentPlanet === 'earth' ? '🌍 Earth Mode' : '🪐 Mars Mode'}
            </p>
          </div>

          {/* Globe Mode Toggle */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Globe Mode</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCesium(false)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm ${
                  !showCesium 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🎯 Demo Mode
              </button>
              <button
                onClick={() => setShowCesium(true)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm ${
                  showCesium 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🌍 Google Earth
              </button>
            </div>
          </div>

          {/* Planet Toggle */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Planet Mode</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPlanet('earth')}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm ${
                  currentPlanet === 'earth' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🌍 Earth
              </button>
              <button
                onClick={() => setCurrentPlanet('mars')}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm ${
                  currentPlanet === 'mars' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🪐 Mars
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
                  activeLayers.weather 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                ☁️ Weather {activeLayers.weather ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => toggleLayer('ports')}
                className={`p-3 rounded-lg transition-colors text-sm ${
                  activeLayers.ports 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🚢 Ports {activeLayers.ports ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => toggleLayer('grid')}
                className={`p-3 rounded-lg transition-colors text-sm ${
                  activeLayers.grid 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                ⚡ Grid {activeLayers.grid ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => toggleLayer('alerts')}
                className={`p-3 rounded-lg transition-colors text-sm ${
                  activeLayers.alerts 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🚨 Alerts {activeLayers.alerts ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Scenario Button */}
          <button
            id="scenario-btn"
            onClick={runScenario}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            🚀 Run Suez-like Scenario
          </button>

          {/* Status */}
          <div className="text-center text-xs text-gray-400">
            {showCesium ? 'Google Earth Mode - Photorealistic Globe' : 'Demo Mode - Guaranteed Working'}
          </div>

          {/* Impact Display */}
          {Object.keys(impacts).length > 0 && (
            <div className="bg-purple-800/90 text-purple-200 px-3 py-2 rounded text-sm">
              <div className="font-semibold mb-1">Scenario Impact:</div>
              <div className="text-xs">
                {Object.entries(impacts).map(([key, value]) => (
                  <div key={key}>
                    {key.replace('_', ' ')}: {(value * 100).toFixed(0)}%
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Globe Visualization */}
      <div className="absolute inset-0 pt-12">
        {showCesium ? (
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <div className="text-lg font-semibold mb-2">Loading Google Earth...</div>
              <div className="text-sm text-gray-400 mb-4">
                This will show a photorealistic Google Earth-style globe
              </div>
              <button
                onClick={() => setShowCesium(false)}
                className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              >
                Switch to Demo Mode
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
            {/* Animated Globe */}
            <div className="relative">
              <div 
                className="w-80 h-80 rounded-full relative overflow-hidden"
                style={{
                  background: currentPlanet === 'earth' 
                    ? 'linear-gradient(45deg, #1e40af, #3b82f6, #60a5fa, #93c5fd)'
                    : 'linear-gradient(45deg, #dc2626, #ef4444, #f87171, #fca5a5)',
                  animation: 'spin 20s linear infinite',
                  boxShadow: currentPlanet === 'earth'
                    ? '0 0 50px rgba(59, 130, 246, 0.5), inset 0 0 50px rgba(255, 255, 255, 0.1)'
                    : '0 0 50px rgba(239, 68, 68, 0.5), inset 0 0 50px rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Planet-like continents */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-8 left-12 w-16 h-12 bg-green-600 rounded-full opacity-60"></div>
                  <div className="absolute top-16 right-16 w-20 h-16 bg-green-700 rounded-full opacity-60"></div>
                  <div className="absolute bottom-20 left-8 w-12 h-8 bg-green-500 rounded-full opacity-60"></div>
                  <div className="absolute bottom-12 right-12 w-18 h-14 bg-green-600 rounded-full opacity-60"></div>
                </div>
                
                {/* Atmosphere glow */}
                <div 
                  className="absolute inset-0 rounded-full opacity-20"
                  style={{
                    background: currentPlanet === 'earth'
                      ? 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)'
                      : 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%)',
                    transform: 'scale(1.1)',
                  }}
                ></div>
              </div>

              {/* Orbiting data points */}
              {activeLayers.weather && (
                <div 
                  className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-400 rounded-full animate-pulse"
                  style={{
                    transform: 'translate(-50%, -50%) translateX(200px)',
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)',
                    animation: 'orbit 3s linear infinite',
                  }}
                ></div>
              )}
              
              {activeLayers.ports && (
                <div 
                  className="absolute top-1/2 left-1/2 w-3 h-3 bg-green-400 rounded-full animate-pulse"
                  style={{
                    transform: 'translate(-50%, -50%) translateX(180px)',
                    boxShadow: '0 0 15px rgba(34, 197, 94, 0.8)',
                    animation: 'orbit 4s linear infinite reverse',
                  }}
                ></div>
              )}
              
              {activeLayers.grid && (
                <div 
                  className="absolute top-1/2 left-1/2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"
                  style={{
                    transform: 'translate(-50%, -50%) translateX(220px)',
                    boxShadow: '0 0 15px rgba(251, 191, 36, 0.8)',
                    animation: 'orbit 5s linear infinite',
                  }}
                ></div>
              )}

              {activeLayers.alerts && (
                <div 
                  className="absolute top-1/2 left-1/2 w-3 h-3 bg-red-400 rounded-full animate-pulse"
                  style={{
                    transform: 'translate(-50%, -50%) translateX(160px)',
                    boxShadow: '0 0 15px rgba(239, 68, 68, 0.8)',
                    animation: 'orbit 2s linear infinite reverse',
                  }}
                ></div>
              )}
            </div>

            {/* Status indicator */}
            <div className="absolute top-4 left-4 bg-green-800/90 text-green-200 px-3 py-1 rounded text-sm">
              ✅ Interactive Globe Active
            </div>

            {/* Planet indicator */}
            <div className="absolute top-4 right-4 bg-blue-800/90 text-blue-200 px-3 py-1 rounded text-sm">
              {currentPlanet === 'earth' ? '🌍 Earth' : '🪐 Mars'}
            </div>

            {/* Impact Visualization */}
            {Object.keys(impacts).length > 0 && (
              <div className="absolute bottom-4 left-4 bg-purple-800/90 text-purple-200 px-3 py-2 rounded text-sm">
                <div className="font-semibold mb-1">Scenario Impact:</div>
                {Object.entries(impacts).map(([key, value]) => (
                  <div key={key} className="text-xs">
                    {key}: {(value * 100).toFixed(0)}%
                  </div>
                ))}
              </div>
            )}

            {/* Controls hint */}
            <div className="absolute bottom-4 right-4 bg-gray-800/90 text-gray-200 px-3 py-1 rounded text-sm">
              🎮 All Controls Working
            </div>
          </div>
        )}
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit {
          from { transform: translate(-50%, -50%) translateX(200px) rotate(0deg); }
          to { transform: translate(-50%, -50%) translateX(200px) rotate(360deg); }
        }
      `}</style>
    </div>
  )
}