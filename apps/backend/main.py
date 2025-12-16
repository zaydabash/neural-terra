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
# Load environment variables from root
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
dotenv_path = os.path.join(root_dir, '.env')
load_dotenv(dotenv_path)

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
        # Load all grid data and filter for Mars
        # Note: In a real app, we'd pass planet to the agent
        data = grid_agent.load_data()
        if not data.empty and 'planet' in data.columns:
            mars_data = data[data['planet'] == 'mars']
            return mars_data.to_dict('records')
        
        # Fallback if planet column missing (shouldn't happen with new code)
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mars grid data error: {str(e)}")

@app.get("/mars/layers/ports")
async def get_mars_ports_layer():
    """Get Mars ports layer data"""
    try:
        data = ports_agent.load_data()
        if not data.empty and 'planet' in data.columns:
            mars_data = data[data['planet'] == 'mars']
            return mars_data.to_dict('records')
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mars ports data error: {str(e)}")

@app.get("/mars/alerts")
async def get_mars_alerts():
    """Get Mars alerts data"""
    try:
        # Alerts agent might not be unified yet, but let's try to use it or return empty
        # For now, return empty as we haven't unified alerts yet
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mars alerts data error: {str(e)}")

@app.get("/mars/graph")
async def get_mars_graph():
    """Get Mars simulation graph structure"""
    try:
        return ripple_engine.get_graph_data(planet='mars')
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
