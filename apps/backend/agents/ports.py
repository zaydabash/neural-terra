import pandas as pd
import json
from datetime import datetime
from pathlib import Path
from .base import AgentBase

class PortsAgent(AgentBase):
    """Agent for major world ports data"""
    
    def fetch_live(self) -> pd.DataFrame:
        """Fetch live port data (placeholder for real API)"""
        # In a real implementation, this might call shipping APIs
        # For now, return static major ports data
        return self.load_snapshot()
    
    def load_snapshot(self) -> pd.DataFrame:
        """Load ports snapshot from file"""
        snapshot_path = Path("data/snapshots/ports_sample.json")
        if snapshot_path.exists():
            with open(snapshot_path, 'r') as f:
                data = json.load(f)
            return pd.DataFrame(data)
        
        # Generate sample data if snapshot doesn't exist
        return self._generate_sample_ports()
    
    def _generate_sample_ports(self) -> pd.DataFrame:
        """Generate sample major ports data"""
        ports_data = [
            {
                'id': 'panama_canal',
                'name': 'Panama Canal',
                'lat': 9.0765,
                'lon': -79.6555,
                'throughput_index': 0.95,
                'region': 'Central America'
            },
            {
                'id': 'suez_canal',
                'name': 'Suez Canal',
                'lat': 30.5852,
                'lon': 32.2650,
                'throughput_index': 0.90,
                'region': 'Middle East'
            },
            {
                'id': 'los_angeles',
                'name': 'Port of Los Angeles',
                'lat': 33.7175,
                'lon': -118.2728,
                'throughput_index': 0.85,
                'region': 'North America'
            },
            {
                'id': 'long_beach',
                'name': 'Port of Long Beach',
                'lat': 33.7701,
                'lon': -118.1937,
                'throughput_index': 0.80,
                'region': 'North America'
            },
            {
                'id': 'rotterdam',
                'name': 'Port of Rotterdam',
                'lat': 51.9225,
                'lon': 4.4792,
                'throughput_index': 0.88,
                'region': 'Europe'
            },
            {
                'id': 'singapore',
                'name': 'Port of Singapore',
                'lat': 1.2966,
                'lon': 103.7764,
                'throughput_index': 0.92,
                'region': 'Asia'
            },
            {
                'id': 'shanghai',
                'name': 'Port of Shanghai',
                'lat': 31.2304,
                'lon': 121.4737,
                'throughput_index': 0.90,
                'region': 'Asia'
            },
            {
                'id': 'hamburg',
                'name': 'Port of Hamburg',
                'lat': 53.5511,
                'lon': 9.9937,
                'throughput_index': 0.75,
                'region': 'Europe'
            },
            {
                'id': 'antwerp',
                'name': 'Port of Antwerp',
                'lat': 51.2194,
                'lon': 4.4025,
                'throughput_index': 0.78,
                'region': 'Europe'
            },
            {
                'id': 'busan',
                'name': 'Port of Busan',
                'lat': 35.1796,
                'lon': 129.0756,
                'throughput_index': 0.82,
                'region': 'Asia'
            }
        ]
        
        return pd.DataFrame(ports_data)
    
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
