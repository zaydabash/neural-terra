'use client'

import { useState, useEffect } from 'react'

export default function SimpleWorkingGlobe() {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {/* Animated Globe */}
      <div className="relative">
        <div 
          className="w-80 h-80 rounded-full relative overflow-hidden"
          style={{
            background: 'linear-gradient(45deg, #1e40af, #3b82f6, #60a5fa, #93c5fd)',
            transform: `rotateY(${rotation}deg)`,
            boxShadow: '0 0 50px rgba(59, 130, 246, 0.5), inset 0 0 50px rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Earth-like continents */}
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
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
              transform: 'scale(1.1)',
            }}
          ></div>
        </div>

        {/* Orbiting data points */}
        <div 
          className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-400 rounded-full animate-pulse"
          style={{
            transform: `translate(-50%, -50%) translateX(200px) rotate(${-rotation}deg)`,
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)',
          }}
        ></div>
        
        <div 
          className="absolute top-1/2 left-1/2 w-3 h-3 bg-green-400 rounded-full animate-pulse"
          style={{
            transform: `translate(-50%, -50%) translateX(180px) rotate(${-rotation * 1.2}deg)`,
            boxShadow: '0 0 15px rgba(34, 197, 94, 0.8)',
          }}
        ></div>
        
        <div 
          className="absolute top-1/2 left-1/2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"
          style={{
            transform: `translate(-50%, -50%) translateX(220px) rotate(${-rotation * 0.8}deg)`,
            boxShadow: '0 0 15px rgba(251, 191, 36, 0.8)',
          }}
        ></div>
      </div>

      {/* Status indicator */}
      <div className="absolute top-4 left-4 bg-green-800/90 text-green-200 px-3 py-1 rounded text-sm">
        Interactive Globe Active
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 bg-blue-800/90 text-blue-200 px-3 py-1 rounded text-sm">
        Real-time Earth Simulation
      </div>
    </div>
  )
}
