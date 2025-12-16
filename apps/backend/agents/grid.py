import pandas as pd
import json
from datetime import datetime
from pathlib import Path
from .base import AgentBase

class GridAgent(AgentBase):
    """Agent for power grid data"""
    
    def fetch_live(self) -> pd.DataFrame:
        """Fetch live grid data"""
        # In a real implementation, this would call grid APIs
        # For now, we load from our unified world graph
        return self._load_from_graph()
    
    def load_snapshot(self) -> pd.DataFrame:
        """Load grid snapshot"""
        return self._load_from_graph()
        
    def _load_from_graph(self) -> pd.DataFrame:
        """Load grid nodes from world_nodes.json"""
        try:
            with open("data/world_nodes.json", "r") as f:
                data = json.load(f)
            
            grids = [
                n for n in data.get("nodes", []) 
                if n.get("type") == "asset" and n.get("asset_type") == "grid"
            ]
            
            # Add derived fields expected by frontend
            for g in grids:
                capacity = g.get('capacity', 100000)
                g['capacity_mw'] = capacity
                g['load_mw'] = capacity * 0.8 # Synthetic load
                g['stress_index'] = 0.85 # Synthetic stress
                g['region'] = g.get('region_id', 'Unknown') # Map region_id to name if needed
            
            return pd.DataFrame(grids)
        except Exception as e:
            print(f"Failed to load grid from graph: {e}")
            return pd.DataFrame()
    
    def normalize(self, data: pd.DataFrame) -> pd.DataFrame:
        """Normalize grid data to standard schema"""
        required_cols = ['id', 'name', 'region', 'capacity_mw', 'load_mw', 'stress_index']
        
        # Ensure all required columns exist
        for col in required_cols:
            if col not in data.columns:
                raise ValueError(f"Missing required column: {col}")
        
        # Validate ranges
        data = data[
            (data['capacity_mw'] >= 0) &
            (data['load_mw'] >= 0) &
            (data['load_mw'] <= data['capacity_mw']) &
            (data['stress_index'] >= 0) & (data['stress_index'] <= 1)
        ]
        
        return data[required_cols].copy()
