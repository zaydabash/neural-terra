import pytest
from agents import WeatherAgent, PortsAgent, GridAgent, AlertsAgent
from sim import RippleEngine
from schemas import Shock
from datetime import datetime

def test_weather_agent():
    """Test weather agent data loading"""
    agent = WeatherAgent()
    data = agent.load_data()
    
    assert not data.empty
    assert 'lat' in data.columns
    assert 'lon' in data.columns
    assert 'temp_c' in data.columns
    assert 'ts' in data.columns

def test_ports_agent():
    """Test ports agent data loading"""
    agent = PortsAgent()
    data = agent.load_data()
    
    assert not data.empty
    assert 'id' in data.columns
    assert 'name' in data.columns
    assert 'lat' in data.columns
    assert 'lon' in data.columns
    assert 'throughput_index' in data.columns

def test_grid_agent():
    """Test grid agent data loading"""
    agent = GridAgent()
    data = agent.load_data()
    
    assert not data.empty
    assert 'id' in data.columns
    assert 'name' in data.columns
    assert 'capacity_mw' in data.columns
    assert 'load_mw' in data.columns
    assert 'stress_index' in data.columns

def test_alerts_agent():
    """Test alerts agent data loading"""
    agent = AlertsAgent()
    data = agent.load_data()
    
    assert not data.empty
    assert 'id' in data.columns
    assert 'title' in data.columns
    assert 'summary' in data.columns
    assert 'severity' in data.columns

def test_ripple_engine():
    """Test ripple engine initialization and simulation"""
    engine = RippleEngine()
    
    # Test graph structure
    graph_data = engine.get_graph_data()
    assert 'nodes' in graph_data
    assert 'edges' in graph_data
    assert len(graph_data['nodes']) > 0
    
    # Test simulation
    shock = Shock(
        target_ids=['suez_canal'],
        magnitude=0.5,
        duration_hours=24,
        start_ts=datetime.now()
    )
    
    result = engine.simulate_shock(shock)
    assert result.scenario_id is not None
    assert result.shock == shock
    assert 'impact_series' in result.dict()
    assert 'kpis' in result.dict()
