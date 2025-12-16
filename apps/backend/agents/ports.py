import pandas as pd
import json
from datetime import datetime
from pathlib import Path
from .base import AgentBase

class PortsAgent(AgentBase):
    """Agent for major world ports data"""
    
    def fetch_live(self) -> pd.DataFrame:
        """Fetch live port data"""
        # In a real implementation, this would call MarineTraffic API
        # For now, we load from our unified world graph
        return self._load_from_graph()
    
    def load_snapshot(self) -> pd.DataFrame:
        """Load ports snapshot"""
        return self._load_from_graph()
        
    def _load_from_graph(self) -> pd.DataFrame:
        """Load ports from world_nodes.json"""
        try:
            with open("data/world_nodes.json", "r") as f:
                data = json.load(f)
            
            ports = [
                n for n in data.get("nodes", []) 
                if n.get("type") == "asset" and n.get("asset_type") == "port"
            ]
            
            # Add derived fields expected by frontend
            for p in ports:
                p['throughput_index'] = p.get('capacity', 0.8)
                # Map region_id to region name if needed, or just keep as is
                # For now, we'll just ensure the fields match what the frontend expects
            
            return pd.DataFrame(ports)
        except Exception as e:
            print(f"Failed to load ports from graph: {e}")
            return pd.DataFrame()
    
    def normalize(self, data: pd.DataFrame) -> pd.DataFrame:
        """Normalize ports data to standard schema"""
        required_cols = ['id', 'name', 'lat', 'lon', 'throughput_index', 'region']
        
        # Ensure all required columns exist
        for col in required_cols:
            if col not in data.columns:
                raise ValueError(f"Missing required column: {col}")
        
        # Validate ranges
        data = data[
            (data['lat'] >= -90) & (data['lat'] <= 90) &
            (data['lon'] >= -180) & (data['lon'] <= 180) &
            (data['throughput_index'] >= 0) & (data['throughput_index'] <= 1)
        ]
        
        return data[required_cols].copy()
