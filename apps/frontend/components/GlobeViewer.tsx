'use client'

import { useEffect, useRef, useState } from 'react'
import { useGlobeStore } from '@/lib/store'

export default function GlobeViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const planet = useGlobeStore(s => s.currentPlanet)
  const active = useGlobeStore(s => s.activeLayers)
  const simulationData = useGlobeStore(s => s.simulationData)
  const graphData = useGlobeStore(s => s.graphData)
  const fetchGraph = useGlobeStore(s => s.fetchGraph)

  // Fetch graph on mount or planet change
  useEffect(() => {
    fetchGraph()
  }, [planet, fetchGraph])

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

      // Map backend impactSeries into a simple impact map at the current timestep
      const impacts: Record<string, number> = {}
      if (simulationData) {
        const series = simulationData.impactSeries || {}
        Object.keys(series).forEach((key) => {
          const arr = series[key] || []
          if (arr.length) {
            impacts[key] = Math.max(0, Math.min(1, arr[arr.length - 1]))
          }
        })
      }

      // Draw nodes from graph data
      if (graphData && graphData.nodes) {
        graphData.nodes.forEach((node: any) => {
          // Simple Equirectangular projection to 2D circle
          // This is a rough approximation for visualization
          // lon: -180 to 180 -> x
          // lat: -90 to 90 -> y

          // Only draw if active layer matches
          let shouldDraw = false
          let color = '#FFFFFF'

          if (node.asset_type === 'port' && active.ports) {
            shouldDraw = true
            color = '#10B981'
          } else if (node.asset_type === 'grid' && active.grid) {
            shouldDraw = true
            color = '#F59E0B'
          } else if ((node.type === 'colony' || node.type === 'life_support')) {
            shouldDraw = true
            color = '#EF4444'
          } else if (active.weather) {
            // Fallback for weather layer - show all nodes as small indicators
            shouldDraw = true
            color = '#60A5FA'
          }

          // Always show nodes with high impact regardless of layer?
          const impact = impacts[node.id] || 0
          if (impact > 0.1) shouldDraw = true

          if (shouldDraw) {
            // Project lat/lon to circle
            // NOTE: This is a very naive projection for a 2D circle view, 
            // but better than hardcoded points.
            // We map lon/lat to x/y on the sphere surface, then project to 2D.

            // Convert to radians
            const phi = (90 - node.lat) * (Math.PI / 180)
            const theta = (node.lon + 180) * (Math.PI / 180)

            // Cartesian coordinates on unit sphere
            const x = -(Math.sin(phi) * Math.cos(theta))
            const z = (Math.sin(phi) * Math.sin(theta))
            const y = (Math.cos(phi))

            // Orthographic projection (view from z-axis)
            // We rotate the globe slightly to show more relevant areas
            // For simplicity, let's just map x/y to canvas

            // Let's use a fixed rotation for now to center on Atlantic/Europe/Americas
            // or just use the raw projection.

            const scale = radius
            const px = centerX + x * scale
            const py = centerY + y * scale

            // Check visibility (backface culling)
            // If z > 0, it's on the back side (simplified)
            // Actually with this projection, z is depth.
            // Let's just draw everything for now as transparency handles it

            const size = 3 + impact * 6

            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(px, py, size, 0, Math.PI * 2)
            ctx.fill()

            // Glow
            if (impact > 0.5) {
              ctx.shadowColor = color
              ctx.shadowBlur = 10
              ctx.beginPath()
              ctx.arc(px, py, size * 1.5, 0, Math.PI * 2)
              ctx.fill()
              ctx.shadowBlur = 0
            }
          }
        })
      }

      // Draw planet label
      ctx.fillStyle = planet === 'earth' ? '#3B82F6' : '#EF4444'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(planet === 'earth' ? 'Earth' : 'Mars', centerX, centerY + radius + 30)
    }

    drawGlobe()
    setIsLoaded(true)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [planet, active, simulationData, graphData])

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