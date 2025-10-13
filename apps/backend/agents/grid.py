import pandas as pd
import json
from datetime import datetime
from pathlib import Path
from .base import AgentBase

class GridAgent(AgentBase):
    """Agent for power grid data"""
    
    def fetch_live(self) -> pd.DataFrame:
        """Fetch live grid data (placeholder for real API)"""
        # In a real implementation, this might call grid operators' APIs
        # For now, return static grid data
        return self.load_snapshot()
    
    def load_snapshot(self) -> pd.DataFrame:
        """Load grid snapshot from file"""
        snapshot_path = Path("data/snapshots/grid_sample.json")
        if snapshot_path.exists():
            with open(snapshot_path, 'r') as f:
                data = json.load(f)
            return pd.DataFrame(data)
        
        # Generate sample data if snapshot doesn't exist
        return self._generate_sample_grid()
    
    def _generate_sample_grid(self) -> pd.DataFrame:
        """Generate sample power grid data"""
        grid_data = [
            {
                'id': 'us_east',
                'name': 'US Eastern Interconnection',
                'region': 'North America',
                'capacity_mw': 500000,
                'load_mw': 420000,
                'stress_index': 0.84
            },
            {
                'id': 'us_west',
                'name': 'US Western Interconnection',
                'region': 'North America',
                'capacity_mw': 200000,
                'load_mw': 180000,
                'stress_index': 0.90
            },
            {
                'id': 'eu_central',
                'name': 'European Continental Grid',
                'region': 'Europe',
                'capacity_mw': 400000,
                'load_mw': 350000,
                'stress_index': 0.875
            },
            {
                'id': 'eu_north',
                'name': 'Nordic Grid',
                'region': 'Europe',
                'capacity_mw': 80000,
                'load_mw': 65000,
                'stress_index': 0.81
            },
            {
                'id': 'china_east',
                'name': 'China Eastern Grid',
                'region': 'Asia',
                'capacity_mw': 600000,
                'load_mw': 520000,
                'stress_index': 0.87
            },
            {
                'id': 'china_west',
                'name': 'China Western Grid',
                'region': 'Asia',
                'capacity_mw': 300000,
                'load_mw': 250000,
                'stress_index': 0.83
            },
            {
                'id': 'india_north',
                'name': 'Northern Regional Grid',
                'region': 'Asia',
                'capacity_mw': 150000,
                'load_mw': 140000,
                'stress_index': 0.93
            },
            {
                'id': 'india_south',
                'name': 'Southern Regional Grid',
                'region': 'Asia',
                'capacity_mw': 120000,
                'load_mw': 110000,
                'stress_index': 0.92
            },
            {
                'id': 'japan',
                'name': 'Japan Grid',
                'region': 'Asia',
                'capacity_mw': 200000,
                'load_mw': 180000,
                'stress_index': 0.90
            },
            {
                'id': 'australia',
                'name': 'Australian National Grid',
                'region': 'Oceania',
                'capacity_mw': 50000,
                'load_mw': 42000,
                'stress_index': 0.84
            }
        ]
        
        return pd.DataFrame(grid_data)
    
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
