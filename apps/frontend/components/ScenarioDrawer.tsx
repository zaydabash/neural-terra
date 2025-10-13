'use client'

import { useState } from 'react'
import { useGlobeStore } from '@/lib/store'
import { 
  ChevronRight, 
  Play, 
  Zap, 
  Ship, 
  Thermometer,
  AlertTriangle,
  Rocket,
  MapPin
} from 'lucide-react'

const scenarios = [
  {
    id: 'suez_disruption',
    name: 'Suez Canal Disruption',
    description: '40% slowdown for 7 days',
    icon: Ship,
    color: 'text-orange-400',
    duration: '7 days',
    impact: 'High'
  },
  {
    id: 'eu_heatwave',
    name: 'European Heatwave',
    description: '+3°C temperature spike',
    icon: Thermometer,
    color: 'text-red-400',
    duration: '3 days',
    impact: 'Medium'
  },
  {
    id: 'la_port_shutdown',
    name: 'LA Port Shutdown',
    description: 'Complete closure for 24h',
    icon: AlertTriangle,
    color: 'text-red-500',
    duration: '24 hours',
    impact: 'Critical'
  },
  {
    id: 'oxygen_grid_failure',
    name: 'Oxygen Grid Failure',
    description: '50% oxygen failure at Colony Alpha',
    icon: AlertTriangle,
    color: 'text-red-400',
    duration: '48 hours',
    impact: 'Critical',
    planet: 'mars'
  },
  {
    id: 'launch_delay',
    name: 'Launch Pad Delay',
    description: '12-hour maintenance delay',
    icon: Rocket,
    color: 'text-orange-400',
    duration: '12 hours',
    impact: 'High',
    planet: 'mars'
  },
  {
    id: 'mars_terraforming',
    name: 'Mars Terraforming',
    description: 'CO₂ → O₂ conversion',
    icon: Rocket,
    color: 'text-red-300',
    duration: '100 years',
    impact: 'Epic',
    comingSoon: true
  },
  {
    id: 'mars_colony',
    name: 'Mars Colony Planning',
    description: 'Optimal settlement locations',
    icon: MapPin,
    color: 'text-red-300',
    duration: '50 years',
    impact: 'Epic',
    comingSoon: true
  }
]

export default function ScenarioDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const { runScenario, currentPlanet } = useGlobeStore()

  const handleRunScenario = async (scenarioId: string, comingSoon: boolean = false) => {
    if (comingSoon) {
      alert('🚀 Mars Mode scenarios coming in Neural Terra v2.0!\n\nExperience the future of planetary simulation with terraforming, colony planning, and ecosystem design.')
      return
    }
    
    try {
      await runScenario(scenarioId)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to run scenario:', error)
    }
  }

  // Filter scenarios based on current planet
  const filteredScenarios = scenarios.filter(scenario => {
    if (scenario.comingSoon) return true // Always show coming soon scenarios
    if (!scenario.planet) return currentPlanet === 'earth' // Earth scenarios
    return scenario.planet === currentPlanet // Mars scenarios
  })

  return (
    <>
      {/* Drawer Toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
        >
          <Play className="w-4 h-4 text-neural-blue" />
          <span className="text-white font-medium">Scenarios</span>
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-90' : ''
          }`} />
        </button>
      </div>

      {/* Drawer Content */}
      <div className={`absolute top-16 right-4 w-80 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
      }`}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Simulation Scenarios</h3>
          
          <div className="space-y-3">
            {filteredScenarios.map((scenario) => {
              const Icon = scenario.icon
              const isMarsMode = scenario.comingSoon
              
              return (
                <div
                  key={scenario.id}
                  className={`p-4 rounded-lg transition-colors cursor-pointer ${
                    isMarsMode 
                      ? 'bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 hover:from-red-900/30 hover:to-orange-900/30' 
                      : 'bg-gray-700/50 hover:bg-gray-700'
                  }`}
                  onClick={() => handleRunScenario(scenario.id, scenario.comingSoon)}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${scenario.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-white">{scenario.name}</h4>
                        {isMarsMode && (
                          <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">v2.0</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{scenario.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Duration: {scenario.duration}</span>
                        <span>Impact: {scenario.impact}</span>
                      </div>
                    </div>
                    {isMarsMode ? (
                      <Rocket className="w-4 h-4 text-red-400" />
                    ) : (
                      <Play className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700">
            <button className="w-full px-4 py-2 bg-neural-purple hover:bg-purple-600 text-white rounded-lg transition-colors">
              Create Custom Scenario
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
