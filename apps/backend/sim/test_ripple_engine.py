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


def _make_shock(target_ids, magnitude=0.5, duration_hours=24):
    from schemas import Shock
    from datetime import datetime
    return Shock(
        target_ids=target_ids,
        magnitude=magnitude,
        duration_hours=duration_hours,
        start_ts=datetime.now(),
    )


def test_shock_propagates_to_downstream_neighbor():
    """A shock must ripple to directly-connected downstream nodes,
    regardless of node iteration order (regression: delay-0 edges)."""
    engine = RippleEngine()
    # oxygen_grid -> colony_alpha (weight 0.8, delay 0). colony_alpha is
    # defined *before* oxygen_grid in the data file, which previously caused
    # the impact to be silently dropped.
    result = engine.simulate_shock(_make_shock(["oxygen_grid"], 0.5, 48))
    colony = result.impact_series["colony_alpha"]
    assert max(colony) > 0.0, "downstream colony should receive ripple impact"


def test_mars_and_earth_shocks_both_propagate():
    engine = RippleEngine()
    suez = engine.simulate_shock(_make_shock(["suez_canal"], 0.4, 72))
    assert max(suez.impact_series["rotterdam"]) > 0.0
