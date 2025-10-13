import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any
import json
from pathlib import Path
from .base import AgentBase

class WeatherAgent(AgentBase):
    """Agent for weather/temperature data"""
    
    def fetch_live(self) -> pd.DataFrame:
        """Fetch live weather data (placeholder for real API)"""
        # In a real implementation, this would call OpenWeatherMap or similar
        # For now, generate synthetic data
        np.random.seed(42)  # For reproducible demo data
        
        # Generate grid of weather points
        lats = np.linspace(-90, 90, 20)
        lons = np.linspace(-180, 180, 40)
        
        data = []
        base_temp = 15  # Base temperature
        
        for lat in lats:
            for lon in lons:
                # Add some realistic temperature variation
                temp_variation = np.sin(np.radians(lat)) * 20  # Latitude effect
                temp_variation += np.sin(np.radians(lon * 2)) * 5  # Longitude effect
                temp_variation += np.random.normal(0, 3)  # Random variation
                
                temp_c = base_temp + temp_variation
                
                data.append({
                    'lat': lat,
                    'lon': lon,
                    'temp_c': round(temp_c, 1),
                    'ts': datetime.now()
                })
        
        return pd.DataFrame(data)
    
    def load_snapshot(self) -> pd.DataFrame:
        """Load weather snapshot from file"""
        snapshot_path = Path("data/snapshots/weather_sample.parquet")
        if snapshot_path.exists():
            return pd.read_parquet(snapshot_path)
        
        # Generate sample data if snapshot doesn't exist
        return self.fetch_live()
    
    def normalize(self, data: pd.DataFrame) -> pd.DataFrame:
        """Normalize weather data to standard schema"""
        required_cols = ['lat', 'lon', 'temp_c', 'ts']
        
        # Ensure all required columns exist
        for col in required_cols:
            if col not in data.columns:
                raise ValueError(f"Missing required column: {col}")
        
        # Convert timestamp if needed
        if not pd.api.types.is_datetime64_any_dtype(data['ts']):
            data['ts'] = pd.to_datetime(data['ts'])
        
        # Validate ranges
        data = data[
            (data['lat'] >= -90) & (data['lat'] <= 90) &
            (data['lon'] >= -180) & (data['lon'] <= 180) &
            (data['temp_c'] >= -100) & (data['temp_c'] <= 100)
        ]
        
        return data[required_cols].copy()
