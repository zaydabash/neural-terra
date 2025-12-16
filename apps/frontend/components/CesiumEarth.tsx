'use client'
import { useEffect, useRef, useState } from 'react'
import { useGlobeStore } from '@/lib/store'

export default function CesiumEarth() {
  const viewerRef = useRef<any>(null)
  const cesiumRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isViewerReady, setIsViewerReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const planet = useGlobeStore(s => s.currentPlanet)
  const active = useGlobeStore(s => s.activeLayers)
  const simulationData = useGlobeStore(s => s.simulationData)
  const currentTime = useGlobeStore(s => s.currentTime)
  const graphData = useGlobeStore(s => s.graphData)
  const fetchGraph = useGlobeStore(s => s.fetchGraph)

  // Fetch graph on mount
  useEffect(() => {
    fetchGraph()
  }, [fetchGraph])

  useEffect(() => {
    let viewer: any
    let isMounted = true

    const initCesium = async () => {
      try {
        console.log('Cesium: Starting initialization...')

          // Set base URL before importing
          ; (window as any).CESIUM_BASE_URL = '/cesium'

        const Cesium = await import('cesium')
        console.log('Cesium: Module loaded', Cesium)

        if (!isMounted) return

        const container = document.getElementById('cesium-container')
        console.log('Cesium: Container found?', container)

        if (!container) {
          throw new Error('Cesium container not found in DOM')
        }

        // ion token
        const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN
        if (token) {
          (Cesium as any).Ion.defaultAccessToken = token
        } else {
          console.warn('Cesium: No Ion token found')
        }

        console.log('Cesium: Creating Viewer...')

        // Minimal viewer
        viewer = new Cesium.Viewer('cesium-container', {
          sceneModePicker: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          navigationHelpButton: false,
          selectionIndicator: false,
          timeline: false,
          animation: false,
          baseLayerPicker: false,
          skyAtmosphere: false, // Disable initially to avoid potential issues
          shouldAnimate: true,
        } as any)

        console.log('Cesium: Viewer created successfully')

        if (!isMounted) {
          console.log('Cesium: Component unmounted, destroying viewer')
          viewer.destroy()
          return
        }

        // Configure scene
        viewer.scene.globe.enableLighting = true
        viewer.scene.requestRenderMode = true
        viewer.scene.maximumRenderTimeChange = Infinity

        // Add atmosphere safely
        try {
          viewer.scene.skyAtmosphere = new Cesium.SkyAtmosphere()
        } catch (e) {
          console.warn('Cesium: Failed to create SkyAtmosphere', e)
        }

        // Fly to start
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(-74, 40.7, 12000000),
          duration: 0
        })

        viewerRef.current = viewer
        cesiumRef.current = Cesium

        setIsLoading(false)
        setIsViewerReady(true)
        setError(null)

      } catch (e: any) {
        console.error('Cesium: Initialization failed', e)
        if (isMounted) {
          setError(e.message || 'Failed to initialize Cesium')
          setIsLoading(false)
        }
      }
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(initCesium, 100)

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      if (viewer && !viewer.isDestroyed()) {
        try {
          viewer.destroy()
        } catch (e) {
          console.error('Cesium: Error destroying viewer', e)
        }
      }
    }
  }, [])

  // Update entities based on graphData and active layers
  useEffect(() => {
    const viewer = viewerRef.current
    // We need to access the Cesium namespace. 
    // Since we loaded it asynchronously, we can grab it from the window or a ref if we saved it.
    // For simplicity, we'll assume window.Cesium is available if we attached it, 
    // OR better, we'll just re-import it or use the ref if I save it.
    // Let's save it to cesiumRef in the init effect.
    const Cesium = cesiumRef.current

    if (!viewer || !Cesium || !graphData) return

    viewer.entities.removeAll()

    // Map impacts
    const impacts: Record<string, number> = {}
    if (simulationData) {
      const series = simulationData.impactSeries || {}
      Object.keys(series).forEach((key) => {
        const arr = series[key] || []
        if (arr.length) {
          // Use current time, clamped to array bounds
          const timeIndex = Math.min(currentTime, arr.length - 1)
          impacts[key] = Math.max(0, Math.min(1, arr[timeIndex]))
        }
      })
    }

    if (graphData.nodes) {
      graphData.nodes.forEach((node: any) => {
        let shouldDraw = false
        let color = Cesium.Color.WHITE
        let size = 10

        if (node.asset_type === 'port' && active.ports) {
          shouldDraw = true
          color = Cesium.Color.fromCssColorString('#10B981')
          size = 15
        } else if (node.asset_type === 'grid' && active.grid) {
          shouldDraw = true
          color = Cesium.Color.fromCssColorString('#F59E0B')
          size = 12
        } else if ((node.type === 'colony' || node.type === 'life_support')) {
          shouldDraw = true
          color = Cesium.Color.fromCssColorString('#EF4444')
          size = 20
        } else if (active.weather) {
          shouldDraw = true
          color = Cesium.Color.fromCssColorString('#60A5FA').withAlpha(0.5)
          size = 8
        }

        const impact = impacts[node.id] || 0
        if (impact > 0.1) {
          shouldDraw = true
          size = 20 + impact * 30
          color = Cesium.Color.RED.withAlpha(0.8)
        }

        if (shouldDraw) {
          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(node.lon, node.lat),
            point: {
              pixelSize: size,
              color: color,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2
            },
            label: impact > 0.1 ? {
              text: `${node.name}\n${(impact * 100).toFixed(0)}% Impact`,
              font: '14pt sans-serif',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -20)
            } : undefined
          })

          // Add ripple effect for high impact
          if (impact > 0.3) {
            viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(node.lon, node.lat),
              ellipse: {
                semiMajorAxis: 200000 * impact,
                semiMinorAxis: 200000 * impact,
                material: Cesium.Color.RED.withAlpha(0.3),
                outline: true,
                outlineColor: Cesium.Color.RED,
                height: 1000
              }
            })
          }
        }
      })
    }

    // Handle planet switch visual
    if (planet === 'mars') {
      viewer.scene.skyAtmosphere.hueShift = 0.6
      viewer.scene.skyAtmosphere.saturationShift = 0.5
    } else {
      viewer.scene.skyAtmosphere.hueShift = 0.0
      viewer.scene.skyAtmosphere.saturationShift = 0.0
    }

  }, [graphData, active, simulationData, planet, isViewerReady, currentTime])

  if (error) {
    return (
      <div className="w-full h-full bg-red-900 flex items-center justify-center text-white rounded-xl">
        <div className="text-center p-6">
          <h2 className="text-xl font-bold mb-2">CesiumJS Error</h2>
          <p className="text-sm mb-4">{error}</p>
          <p className="text-xs text-gray-300">Check console for details</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm text-white z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <div className="text-lg font-semibold mb-2">Loading Real Earth...</div>
          </div>
        </div>
      )}
      <div id="cesium-container" className="w-full h-full" />
    </div>
  )
}