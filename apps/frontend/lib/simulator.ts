// Real simulation logic for Neural Terra
// This defines the actual "brains" behind the scenarios

export interface SimulationState {
  temperature: number; // Global average temp in Celsius
  energyDemand: number; // Energy demand multiplier (1.0 = normal)
  shippingDelay: number; // Shipping delay percentage
  heatwaveAlerts: string[]; // Active heatwave regions
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ScenarioInput {
  type: 'heatwave' | 'canal_closure' | 'storm' | 'drought';
  region: string;
  magnitude: number; // 0-1 scale
  duration: number; // hours
}

// Real simulation engine
export class NeuralTerraSimulator {
  private state: SimulationState;
  
  constructor() {
    this.state = {
      temperature: 15.0, // Global average
      energyDemand: 1.0,
      shippingDelay: 0.0,
      heatwaveAlerts: [],
      impactLevel: 'low'
    };
  }

  // Run a scenario and return real impacts
  runScenario(input: ScenarioInput): SimulationState {
    console.log(`🧠 Neural Terra: Running ${input.type} scenario`, input);
    
    switch (input.type) {
      case 'heatwave':
        return this.simulateHeatwave(input);
      case 'canal_closure':
        return this.simulateCanalClosure(input);
      case 'storm':
        return this.simulateStorm(input);
      case 'drought':
        return this.simulateDrought(input);
      default:
        return this.state;
    }
  }

  private simulateHeatwave(input: ScenarioInput): SimulationState {
    const tempIncrease = input.magnitude * 8; // Max 8°C increase
    const region = input.region;
    
    // Real cause-and-effect logic
    this.state.temperature += tempIncrease;
    
    // Energy demand increases with temperature (cooling needs)
    const energyMultiplier = 1 + (tempIncrease * 0.12); // 12% per degree
    this.state.energyDemand = Math.max(1.0, energyMultiplier);
    
    // Shipping delays due to heat stress on infrastructure
    const shippingImpact = tempIncrease * 2.5; // 2.5% delay per degree
    this.state.shippingDelay = Math.min(25, shippingImpact); // Cap at 25%
    
    // Heatwave alerts based on region and magnitude
    if (tempIncrease > 3) {
      this.state.heatwaveAlerts.push(`${region}: +${tempIncrease.toFixed(1)}°C Heatwave`);
    }
    
    // Impact level calculation
    if (tempIncrease > 6) this.state.impactLevel = 'critical';
    else if (tempIncrease > 4) this.state.impactLevel = 'high';
    else if (tempIncrease > 2) this.state.impactLevel = 'medium';
    
    return { ...this.state };
  }

  private simulateCanalClosure(input: ScenarioInput): SimulationState {
    const closureSeverity = input.magnitude; // 0-1
    
    // Shipping impact scales with closure severity
    this.state.shippingDelay = closureSeverity * 40; // Up to 40% delay
    
    // Energy demand increases due to longer shipping routes
    this.state.energyDemand = 1 + (closureSeverity * 0.15); // Up to 15% increase
    
    // Temperature slightly increases due to rerouted shipping (more emissions)
    this.state.temperature += closureSeverity * 0.3;
    
    if (closureSeverity > 0.7) {
      this.state.impactLevel = 'high';
      this.state.heatwaveAlerts.push(`${input.region}: Major Shipping Disruption`);
    }
    
    return { ...this.state };
  }

  private simulateStorm(input: ScenarioInput): SimulationState {
    const stormIntensity = input.magnitude;
    
    // Storms cause immediate shipping delays
    this.state.shippingDelay = stormIntensity * 30; // Up to 30% delay
    
    // Energy demand spikes due to emergency response
    this.state.energyDemand = 1 + (stormIntensity * 0.25); // Up to 25% increase
    
    // Temperature drops due to storm cooling
    this.state.temperature -= stormIntensity * 2;
    
    if (stormIntensity > 0.8) {
      this.state.impactLevel = 'critical';
      this.state.heatwaveAlerts.push(`${input.region}: Severe Storm Warning`);
    }
    
    return { ...this.state };
  }

  private simulateDrought(input: ScenarioInput): SimulationState {
    const droughtSeverity = input.magnitude;
    
    // Drought increases energy demand (irrigation, cooling)
    this.state.energyDemand = 1 + (droughtSeverity * 0.2); // Up to 20% increase
    
    // Shipping delays due to low water levels
    this.state.shippingDelay = droughtSeverity * 15; // Up to 15% delay
    
    // Temperature increases due to lack of evaporative cooling
    this.state.temperature += droughtSeverity * 1.5;
    
    if (droughtSeverity > 0.6) {
      this.state.impactLevel = 'high';
      this.state.heatwaveAlerts.push(`${input.region}: Severe Drought Alert`);
    }
    
    return { ...this.state };
  }

  // Get current state for UI updates
  getState(): SimulationState {
    return { ...this.state };
  }

  // Reset to baseline
  reset(): void {
    this.state = {
      temperature: 15.0,
      energyDemand: 1.0,
      shippingDelay: 0.0,
      heatwaveAlerts: [],
      impactLevel: 'low'
    };
  }
}

// Export singleton instance
export const neuralTerraSimulator = new NeuralTerraSimulator();
