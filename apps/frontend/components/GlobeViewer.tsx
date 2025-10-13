'use client'

import { useEffect, useRef, useState } from 'react'
import { useSimStore } from '@/store/sim'

export default function GlobeViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  
  const planet = useSimStore(s => s.planet)
  const active = useSimStore(s => s.active)
  const impacts = useSimStore(s => s.impacts)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Simple globe drawing
    const drawGlobe = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) * 0.3

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw globe
      const gradient = ctx.createRadialGradient(centerX - radius * 0.3, centerY - radius * 0.3, 0, centerX, centerY, radius)
      
      if (planet === 'earth') {
        gradient.addColorStop(0, '#4A90E2')
        gradient.addColorStop(0.7, '#2E5BBA')
        gradient.addColorStop(1, '#1E3A8A')
      } else {
        gradient.addColorStop(0, '#FF6B6B')
        gradient.addColorStop(0.7, '#E53E3E')
        gradient.addColorStop(1, '#C53030')
      }

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()

      // Draw atmosphere
      const atmosphereGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius * 1.2)
      atmosphereGradient.addColorStop(0, 'rgba(0,0,0,0)')
      atmosphereGradient.addColorStop(1, planet === 'earth' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)')
      
      ctx.fillStyle = atmosphereGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 1.2, 0, Math.PI * 2)
      ctx.fill()

      // Draw data points based on backend data
      const points = [
        { x: centerX - radius * 0.3, y: centerY - radius * 0.2, layer: 'weather', color: '#60A5FA', backendKey: 'rotterdam' },
        { x: centerX + radius * 0.2, y: centerY - radius * 0.1, layer: 'ports', color: '#10B981', backendKey: 'rotterdam' },
        { x: centerX - radius * 0.1, y: centerY + radius * 0.2, layer: 'grid', color: '#F59E0B', backendKey: 'eu_central' },
        { x: centerX + radius * 0.3, y: centerY + radius * 0.1, layer: 'alerts', color: '#EF4444', backendKey: 'rotterdam' }
      ]

      points.forEach(point => {
        if (active[point.layer as keyof typeof active]) {
          const impact = impacts[point.backendKey] || 0
          const size = 4 + impact * 8
          
          ctx.fillStyle = point.color
          ctx.beginPath()
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2)
          ctx.fill()
          
          // Add glow effect for high impact
          if (impact > 0.5) {
            ctx.shadowColor = point.color
            ctx.shadowBlur = 10
            ctx.beginPath()
            ctx.arc(point.x, point.y, size * 1.5, 0, Math.PI * 2)
            ctx.fill()
            ctx.shadowBlur = 0
          }
        }
      })

      // Draw planet label
      ctx.fillStyle = planet === 'earth' ? '#3B82F6' : '#EF4444'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(planet === 'earth' ? '🌍 Earth' : '🪐 Mars', centerX, centerY + radius + 30)
    }

    drawGlobe()
    setIsLoaded(true)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [planet, active, impacts])

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  )
}