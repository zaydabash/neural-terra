import pytest
from sim.ripple_engine import RippleEngine
from pathlib import Path
import json

def test_ripple_engine_loads_json():
    engine = RippleEngine()
    
    # Check if graph is populated
    assert len(engine.nodes) > 0
    assert len(engine.graph.nodes) > 0
    
    # Check specific nodes from our JSON
    assert "suez_canal" in engine.nodes
    assert "rotterdam" in engine.nodes
    
    # Check node data
    suez = engine.nodes["suez_canal"]
    assert suez.lat == 30.5852
    assert suez.lon == 32.2650
    
    # Check edges
    assert engine.graph.has_edge("suez_canal", "rotterdam")
