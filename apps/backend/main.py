from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
import os
import random
import numpy as np
from dotenv import load_dotenv
from typing import Dict, Any, List

# Set global RNG seeds for deterministic behavior
os.environ["PYTHONHASHSEED"] = "0"
random.seed(1337)
np.random.seed(1337)

# Import our modules
from agents import WeatherAgent, PortsAgent, GridAgent, AlertsAgent
from sim import RippleEngine
from nl import NLEngine
from schemas import Shock, SimulationResult, NLQuery, NLResponse

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Neural Terra API",
    description="Real-time digital twin of Earth simulation engine",
    version="0.1.0",
    default_response_class=ORJSONResponse
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents and engines
weather_agent = WeatherAgent()
ports_agent = PortsAgent()
grid_agent = GridAgent()
alerts_agent = AlertsAgent()
ripple_engine = RippleEngine()
nl_engine = NLEngine(ripple_engine)

@app.get("/healthz")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "neural-terra-backend"}

@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "message": "Neural Terra API",
        "version": "0.1.0",
        "docs": "/docs"
    }

@app.get("/layers/weather")
async def get_weather_layer():
    """Get current weather layer data"""
    try:
        data = weather_agent.load_data()
        return data.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather data error: {str(e)}")

@app.get("/layers/ports")
async def get_ports_layer():
    """Get current ports layer data"""
    try:
        data = ports_agent.load_data()
        return data.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ports data error: {str(e)}")

@app.get("/layers/grid")
async def get_grid_layer():
    """Get current grid layer data"""
    try:
        data = grid_agent.load_data()
        return data.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Grid data error: {str(e)}")

@app.get("/alerts")
async def get_alerts():
    """Get current alerts data"""
    try:
        data = alerts_agent.load_data()
        return data.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alerts data error: {str(e)}")

@app.get("/graph")
async def get_graph():
    """Get simulation graph structure"""
    try:
        return ripple_engine.get_graph_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph data error: {str(e)}")

@app.post("/simulate")
async def simulate_scenario(shock: Shock) -> SimulationResult:
    """Run a simulation scenario"""
    try:
        result = ripple_engine.simulate_shock(shock)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

@app.post("/nl/interpret")
async def interpret_nl_query(query: NLQuery):
    """Interpret natural language query"""
    try:
        interpretation = nl_engine.interpret(query)
        return interpretation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NL interpretation error: {str(e)}")

@app.post("/nl/run")
async def run_nl_query(query: NLQuery) -> NLResponse:
    """Run natural language query and return results"""
    try:
        response = nl_engine.run_query(query)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NL query error: {str(e)}")

# Mars Mode endpoints
@app.get("/mars/layers/grid")
async def get_mars_grid_layer():
    """Get Mars grid layer data"""
    try:
        import json
        import os
        mars_grid_path = os.path.join(os.path.dirname(__file__), "../../data/mars_snapshots/mars_grid.json")
        with open(mars_grid_path, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mars grid data error: {str(e)}")

@app.get("/mars/layers/ports")
async def get_mars_ports_layer():
    """Get Mars ports layer data"""
    try:
        import json
        import os
        mars_ports_path = os.path.join(os.path.dirname(__file__), "../../data/mars_snapshots/mars_ports.json")
        with open(mars_ports_path, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mars ports data error: {str(e)}")

@app.get("/mars/alerts")
async def get_mars_alerts():
    """Get Mars alerts data"""
    try:
        import json
        import os
        mars_alerts_path = os.path.join(os.path.dirname(__file__), "../../data/mars_snapshots/mars_alerts.json")
        with open(mars_alerts_path, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mars alerts data error: {str(e)}")

@app.get("/mars/graph")
async def get_mars_graph():
    """Get Mars simulation graph structure"""
    try:
        # Create Mars-specific graph data
        mars_graph = {
            "nodes": [
                {"id": "colony_alpha", "name": "Colony Alpha", "type": "colony", "lat": 18.4, "lon": 77.5},
                {"id": "colony_bravo", "name": "Colony Bravo", "type": "colony", "lat": -14.6, "lon": 175.5},
                {"id": "oxygen_grid", "name": "Oxygen Grid", "type": "life_support", "lat": 0.0, "lon": 0.0},
                {"id": "water_plant", "name": "Water Plant", "type": "life_support", "lat": 25.0, "lon": 310.0},
                {"id": "launch_pad", "name": "Launch Pad", "type": "transport", "lat": 0.0, "lon": 0.0},
            ],
            "edges": [
                {"source": "oxygen_grid", "target": "colony_alpha", "weight": 0.8, "delay_hours": 0, "decay": 0.1},
                {"source": "oxygen_grid", "target": "colony_bravo", "weight": 0.7, "delay_hours": 0, "decay": 0.1},
                {"source": "water_plant", "target": "oxygen_grid", "weight": 0.6, "delay_hours": 2, "decay": 0.05},
                {"source": "launch_pad", "target": "colony_alpha", "weight": 0.5, "delay_hours": 6, "decay": 0.1},
                {"source": "launch_pad", "target": "colony_bravo", "weight": 0.4, "delay_hours": 8, "decay": 0.1},
            ]
        }
        return mars_graph
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mars graph data error: {str(e)}")

@app.post("/mars/simulate")
async def simulate_mars_scenario(shock: Shock) -> SimulationResult:
    """Run a Mars simulation scenario"""
    try:
        # Use the same ripple engine but with Mars-specific parameters
        result = ripple_engine.simulate_shock(shock)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mars simulation error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
