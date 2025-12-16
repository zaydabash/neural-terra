import networkx as nx
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import json
from pathlib import Path
from schemas import Shock, SimulationResult

class RegionNode:
    """Represents a geographic region"""
    def __init__(self, node_id: str, name: str, region: str, lat: float = 0, lon: float = 0):
        self.id = node_id
        self.name = name
        self.region = region
        self.lat = lat
        self.lon = lon
        self.base_impact = 0.0

class AssetNode:
    """Represents an infrastructure asset (port, grid, etc.)"""
    def __init__(self, node_id: str, name: str, asset_type: str, region_id: str, 
                 lat: float = 0, lon: float = 0, capacity: float = 1.0):
        self.id = node_id
        self.name = name
        self.asset_type = asset_type
        self.region_id = region_id
        self.lat = lat
        self.lon = lon
        self.capacity = capacity
        self.base_impact = 0.0

class RippleEngine:
    """Core simulation engine for modeling ripple effects"""
    
    def __init__(self):
        self.graph = nx.DiGraph()
        self.nodes: Dict[str, Any] = {}
        self.scenarios_dir = Path("scenarios")
        self.scenarios_dir.mkdir(exist_ok=True)
        self._build_minimal_world()
    
    def _build_minimal_world(self):
        """Build world graph from data file"""
        data_path = Path("data/world_nodes.json")
        if not data_path.exists():
            self._build_fallback_world()
            return

        with open(data_path, 'r') as f:
            world_data = json.load(f)

        # Add nodes
        for node_data in world_data.get('nodes', []):
            planet = node_data.get('planet', 'earth')
            
            if node_data['type'] == 'region':
                node = RegionNode(
                    node_id=node_data['id'],
                    name=node_data['name'],
                    region=node_data['name'],
                    lat=node_data['lat'],
                    lon=node_data['lon']
                )
                node.planet = planet # Attach planet to node object
                self.add_region_node(node)
            elif node_data['type'] == 'asset':
                node = AssetNode(
                    node_id=node_data['id'],
                    name=node_data['name'],
                    asset_type=node_data['asset_type'],
                    region_id=node_data['region_id'],
                    lat=node_data['lat'],
                    lon=node_data['lon'],
                    capacity=node_data.get('capacity', 1.0)
                )
                node.planet = planet
                self.add_asset_node(node)

        # Add edges
        for edge in world_data.get('edges', []):
            if edge['source'] in self.nodes and edge['target'] in self.nodes:
                self.graph.add_edge(
                    edge['source'], 
                    edge['target'], 
                    weight=edge['weight'],
                    delay_hours=edge['delay_hours'],
                    decay=edge['decay']
                )
    def _build_fallback_world(self):
        """Minimal fallback if data file is missing"""
        # Add major regions
        regions = [
            RegionNode("na", "North America", "North America", 45.0, -100.0),
            RegionNode("eu", "Europe", "Europe", 50.0, 10.0),
            RegionNode("as", "Asia", "Asia", 35.0, 100.0),
        ]
        for region in regions:
            self.add_region_node(region)
            
        # Add minimal coupling
        self.graph.add_edge("na", "eu", weight=0.5, delay_hours=24, decay=0.1)
        self.graph.add_edge("eu", "as", weight=0.5, delay_hours=24, decay=0.1)

    def add_region_node(self, region: RegionNode):
        """Add a region node to the graph"""
        self.graph.add_node(region.id, node_type="region", data=region)
        self.nodes[region.id] = region
    
    def add_asset_node(self, asset: AssetNode):
        """Add an asset node to the graph"""
        self.graph.add_node(asset.id, node_type="asset", data=asset)
        self.nodes[asset.id] = asset
        
        # Connect asset to its region
        if asset.region_id in self.nodes:
            self.graph.add_edge(asset.id, asset.region_id, weight=0.8, delay_hours=0, decay=0.1)
    
    def simulate_shock(self, shock: Shock) -> SimulationResult:
        """Simulate the ripple effects of a shock"""
        scenario_id = f"scenario_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Initialize impact tracking
        impact_series = {node_id: [0.0] for node_id in self.nodes.keys()}
        
        # Apply initial shock
        for target_id in shock.target_ids:
            if target_id in self.nodes:
                impact_series[target_id][0] = shock.magnitude
        
        # Propagate impacts over time
        timesteps = shock.duration_hours
        for t in range(1, timesteps + 1):
            # Update impacts for all nodes
            for node_id in self.nodes.keys():
                current_impact = impact_series[node_id][t - 1]
                
                # Calculate incoming impacts from neighbors
                incoming_impact = 0.0
                for predecessor in self.graph.predecessors(node_id):
                    edge_data = self.graph[predecessor][node_id]
                    weight = edge_data.get('weight', 0.0)
                    delay_hours = edge_data.get('delay_hours', 0)
                    decay = edge_data.get('decay', 0.1)
                    
                    # Get impact from predecessor at appropriate delay
                    delay_timestep = max(0, t - delay_hours)
                    if delay_timestep < len(impact_series[predecessor]):
                        delayed_impact = impact_series[predecessor][delay_timestep]
                        incoming_impact += delayed_impact * weight * np.exp(-decay * t)
                
                # Combine current impact with incoming impact
                new_impact = min(1.0, current_impact + incoming_impact)
                impact_series[node_id].append(new_impact)
        
        # Calculate derived KPIs
        kpis = self._calculate_kpis(impact_series, shock)
        
        # Create simulation result
        result = SimulationResult(
            scenario_id=scenario_id,
            shock=shock,
            impact_series=impact_series,
            kpis=kpis,
            duration_hours=shock.duration_hours
        )
        
        # Save scenario
        self._save_scenario(result)
        
        return result
    
    def _calculate_kpis(self, impact_series: Dict[str, List[float]], shock: Shock) -> Dict[str, Any]:
        """Calculate derived KPIs from impact series"""
        kpis = {}
        
        # Global trade index (weighted by port throughput)
        port_nodes = [node_id for node_id, node in self.nodes.items() 
                     if hasattr(node, 'asset_type') and node.asset_type == 'port']
        
        if port_nodes:
            max_port_impact = max(max(impact_series[node_id]) for node_id in port_nodes)
            kpis['global_trade_index_delta'] = max_port_impact
        
        # Regional energy stress (weighted by grid capacity)
        grid_nodes = [node_id for node_id, node in self.nodes.items() 
                     if hasattr(node, 'asset_type') and node.asset_type == 'grid']
        
        if grid_nodes:
            max_grid_impact = max(max(impact_series[node_id]) for node_id in grid_nodes)
            kpis['regional_energy_stress_delta'] = max_grid_impact
        
        # Peak impact time
        all_impacts = []
        for node_impacts in impact_series.values():
            all_impacts.extend(node_impacts)
        
        if all_impacts:
            peak_impact = max(all_impacts)
            kpis['peak_impact'] = peak_impact
            kpis['peak_impact_time_hours'] = all_impacts.index(peak_impact)
        
        return kpis
    
    def _save_scenario(self, result: SimulationResult):
        """Save scenario to file"""
        scenario_data = {
            'scenario_id': result.scenario_id,
            'shock': result.shock.dict(),
            'impact_series': result.impact_series,
            'kpis': result.kpis,
            'duration_hours': result.duration_hours,
            'created_at': datetime.now().isoformat()
        }
        
        scenario_file = self.scenarios_dir / f"{result.scenario_id}.json"
        with open(scenario_file, 'w') as f:
            json.dump(scenario_data, f, indent=2, default=str)
    
    def load_scenario(self, scenario_id: str) -> Optional[SimulationResult]:
        """Load a saved scenario"""
        scenario_file = self.scenarios_dir / f"{scenario_id}.json"
        if not scenario_file.exists():
            return None
        
        with open(scenario_file, 'r') as f:
            data = json.load(f)
        
        shock = Shock(**data['shock'])
        return SimulationResult(
            scenario_id=data['scenario_id'],
            shock=shock,
            impact_series=data['impact_series'],
            kpis=data['kpis'],
            duration_hours=data['duration_hours']
        )
    def get_graph_data(self, planet: str = 'earth') -> Dict[str, Any]:
        """Get graph structure for visualization, filtered by planet"""
        nodes = []
        edges = []
        
        # Filter nodes by planet
        valid_nodes = set()
        for node_id, node_data in self.graph.nodes(data=True):
            node = node_data['data']
            node_planet = getattr(node, 'planet', 'earth')
            
            if node_planet == planet:
                valid_nodes.add(node_id)
                nodes.append({
                    'id': node_id,
                    'name': node.name,
                    'type': node_data['node_type'],
                    'lat': getattr(node, 'lat', 0),
                    'lon': getattr(node, 'lon', 0),
                    'region': getattr(node, 'region', ''),
                    'asset_type': getattr(node, 'asset_type', ''),
                    'capacity': getattr(node, 'capacity', 1.0),
                    'planet': node_planet
                })
        
        # Filter edges where both source and target are on the planet
        for source, target, edge_data in self.graph.edges(data=True):
            if source in valid_nodes and target in valid_nodes:
                edges.append({
                    'source': source,
                    'target': target,
                    'weight': edge_data.get('weight', 0.0),
                    'delay_hours': edge_data.get('delay_hours', 0),
                    'decay': edge_data.get('decay', 0.1)
                })
        
        return {'nodes': nodes, 'edges': edges}
