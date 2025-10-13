'use client'
import { useEffect, useRef, useState } from 'react'

interface CesiumEarthProps {
  currentPlanet: 'earth' | 'mars';
  activeLayers: Record<string, boolean>;
  impacts: Record<string, number>;
  onScenarioRun?: () => void;
}

export default function CesiumEarth({ currentPlanet, activeLayers, impacts, onScenarioRun }: CesiumEarthProps) {
  const el = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const cesiumRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let viewer: any
    ;(async () => {
      try {
        const Cesium = await import('cesium')

        // ion token
        ;(Cesium as any).Ion.defaultAccessToken =
          process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || ''

        // high-res terrain + imagery
        const terrain = await Cesium.createWorldTerrainAsync()
        const imagery = new (Cesium as any).IonImageryProvider({ assetId: 2 }) // Bing Aerial via ion

        viewer = new Cesium.Viewer(el.current!, {
          terrain: terrain as any,
          imageryProvider: imagery as any,
          animation: false,
          timeline: false,
          baseLayerPicker: false,
          sceneModePicker: false,
          geocoder: false,
          navigationHelpButton: false,
          homeButton: false,
          infoBox: false,
          selectionIndicator: false
        } as any)

        // photorealistic 3D cities (if your ion account allows)
        try {
          const tiles = await (Cesium as any).createGooglePhotorealistic3DTileset()
          viewer.scene.primitives.add(tiles)
        } catch (e) {
          console.warn('Photorealistic 3D Tiles unavailable (ok for demo):', e)
        }

        // realism + perf
        viewer.scene.globe.enableLighting = true
        viewer.scene.skyAtmosphere = new Cesium.SkyAtmosphere()
        viewer.scene.postProcessStages.bloom.enabled = true
        viewer.scene.requestRenderMode = true
        viewer.scene.maximumRenderTimeChange = Infinity

        // nice starting camera
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(-74, 40.7, 1_200_000), // NYC-ish
          duration: 1.8
        })

        viewerRef.current = viewer
        cesiumRef.current = Cesium
        setIsLoading(false)
        setError(null)

      } catch (e: any) {
        console.error('Cesium initialization failed:', e)
        setError(e.message || 'Failed to initialize Cesium')
        setIsLoading(false)
      }
    })()
    return () => { 
      if (viewer) {
        viewer.destroy()
        viewerRef.current = null
      }
    }
  }, [])

  // Handle scenario effects
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !onScenarioRun) return

    // Clear existing entities
    viewer.entities.removeAll()

    // Add impact visualization based on impacts
    Object.entries(impacts).forEach(([location, intensity]) => {
      if (intensity > 0) {
        // Map location names to coordinates
        let lat, lng
        switch (location) {
          case 'rotterdam':
            lat = 51.9244; lng = 4.4777
            break
          case 'suez_canal':
            lat = 30.5852; lng = 32.2650
            break
          case 'panama_canal':
            lat = 9.0765; lng = -79.6075
            break
          case 'singapore_port':
            lat = 1.2966; lng = 103.7764
            break
          case 'eu_central':
            lat = 50.1109; lng = 8.6821
            break
          default:
            return
        }

        // Create impact ring
        const Cesium = cesiumRef.current
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(lng, lat, 0),
          ellipse: {
            semiMajorAxis: 50000 + intensity * 100000, // 50-150km radius
            semiMinorAxis: 50000 + intensity * 100000,
            material: Cesium.Color.RED.withAlpha(intensity * 0.6),
            outline: true,
            outlineColor: Cesium.Color.RED.withAlpha(intensity),
            outlineWidth: 3,
            height: 0,
            extrudedHeight: 1000 * intensity
          },
          label: {
            text: `${location.replace('_', ' ').toUpperCase()}\n${(intensity * 100).toFixed(0)}%`,
            font: '14pt sans-serif',
            fillColor: Cesium.Color.WHITE,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -20),
            scale: 1.2
          }
        })
      }
    })

    // If Suez Canal has impact, fly there
    if (impacts.suez_canal && impacts.suez_canal > 0) {
      const Cesium = cesiumRef.current
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(32.2650, 30.5852, 500000),
        duration: 2.0
      })
    }

  }, [impacts, onScenarioRun])

  if (error) {
    return (
      <div className="w-full h-[70vh] bg-red-900 flex items-center justify-center text-white rounded-xl">
        <div className="text-center p-6">
          <h2 className="text-xl font-bold mb-2">CesiumJS Error</h2>
          <p className="text-sm mb-4">{error}</p>
          <p className="text-xs text-gray-300">Check your Cesium Ion token in .env.local</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[70vh] rounded-xl overflow-hidden bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm text-white z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <div className="text-lg font-semibold mb-2">Loading Google Earth...</div>
            <div className="text-sm text-gray-400">
              Initializing satellite imagery and 3D terrain
            </div>
          </div>
        </div>
      )}
      <div ref={el} className="w-full h-full" />
      
      {/* Status overlay */}
      <div className="absolute top-4 left-4 bg-green-800/90 text-green-200 px-3 py-1 rounded text-sm">
        ✅ CesiumJS Active
      </div>
      
      <div className="absolute top-4 right-4 bg-blue-800/90 text-blue-200 px-3 py-1 rounded text-sm">
        {currentPlanet === 'earth' ? '🌍 Earth' : '🪐 Mars'}
      </div>
    </div>
  )
}