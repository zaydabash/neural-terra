import { random } from './random'

interface TelemetryEvent {
  event: string
  timestamp: number
  data?: Record<string, any>
}

class Telemetry {
  private enabled: boolean = false
  private events: TelemetryEvent[] = []
  private maxEvents: number = 1000

  constructor() {
    // Check if telemetry is enabled via environment
    this.enabled = process.env.NEXT_PUBLIC_TELEMETRY === '1'
  }

  enable(): void {
    this.enabled = true
    console.log('📊 Telemetry enabled')
  }

  disable(): void {
    this.enabled = false
    this.events = []
    console.log('📊 Telemetry disabled')
  }

  log(event: string, data?: Record<string, any>): void {
    if (!this.enabled) return

    const telemetryEvent: TelemetryEvent = {
      event,
      timestamp: Date.now(),
      data: data ? { ...data } : undefined
    }

    this.events.push(telemetryEvent)

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${event}:`, data)
    }
  }

  // Performance metrics
  logRenderTime(component: string, renderTime: number): void {
    this.log('render_time', {
      component,
      renderTime,
      fps: Math.round(1000 / renderTime)
    })
  }

  logAPILatency(endpoint: string, latency: number): void {
    this.log('api_latency', {
      endpoint,
      latency
    })
  }

  logFrameDrop(frameCount: number, droppedFrames: number): void {
    const dropRate = droppedFrames / frameCount
    this.log('frame_drop', {
      frameCount,
      droppedFrames,
      dropRate: Math.round(dropRate * 100) / 100
    })
  }

  // User interaction metrics
  logLayerToggle(layer: string, enabled: boolean): void {
    this.log('layer_toggle', {
      layer,
      enabled
    })
  }

  logScenarioRun(scenarioId: string, duration: number): void {
    this.log('scenario_run', {
      scenarioId,
      duration
    })
  }

  logNLQuery(query: string, confidence: number): void {
    this.log('nl_query', {
      queryLength: query.length,
      confidence,
      // Don't log the actual query for privacy
    })
  }

  // Get telemetry summary
  getSummary(): Record<string, any> {
    if (!this.enabled || this.events.length === 0) {
      return { enabled: false, eventCount: 0 }
    }

    const eventTypes = this.events.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const avgRenderTime = this.events
      .filter(e => e.event === 'render_time')
      .reduce((sum, e) => sum + (e.data?.renderTime || 0), 0) / 
      Math.max(1, eventTypes.render_time || 1)

    const avgAPILatency = this.events
      .filter(e => e.event === 'api_latency')
      .reduce((sum, e) => sum + (e.data?.latency || 0), 0) / 
      Math.max(1, eventTypes.api_latency || 1)

    return {
      enabled: true,
      eventCount: this.events.length,
      eventTypes,
      avgRenderTime: Math.round(avgRenderTime * 100) / 100,
      avgAPILatency: Math.round(avgAPILatency * 100) / 100,
      sessionDuration: this.events.length > 0 ? 
        this.events[this.events.length - 1].timestamp - this.events[0].timestamp : 0
    }
  }

  // Export telemetry data (for debugging)
  export(): TelemetryEvent[] {
    return [...this.events]
  }

  // Clear telemetry data
  clear(): void {
    this.events = []
  }
}

// Singleton instance
export const telemetry = new Telemetry()

// Performance monitoring utilities
export const performanceMonitor = {
  startTimer(label: string): () => void {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      telemetry.log('timer', { label, duration })
    }
  },

  measureRender<T>(component: string, renderFn: () => T): T {
    const start = performance.now()
    const result = renderFn()
    const duration = performance.now() - start
    telemetry.logRenderTime(component, duration)
    return result
  },

  measureAPI<T>(endpoint: string, apiCall: () => Promise<T>): Promise<T> {
    const start = performance.now()
    return apiCall().then(result => {
      const duration = performance.now() - start
      telemetry.logAPILatency(endpoint, duration)
      return result
    })
  }
}
