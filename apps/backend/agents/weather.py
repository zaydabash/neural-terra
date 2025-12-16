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
        """Fetch live weather data from Open-Meteo API"""
        import httpx
        
        # Get node locations from the world graph
        # Note: In a real app we'd inject the graph or read the JSON. 
        # For now, we'll read the JSON directly to know where to query.
        try:
            with open("data/world_nodes.json", "r") as f:
                world_data = json.load(f)
            
            nodes = world_data.get("nodes", [])
            lats = [n["lat"] for n in nodes]
            lons = [n["lon"] for n in nodes]
            ids = [n["id"] for n in nodes]
            
            if not nodes:
                return pd.DataFrame()
                
            # Open-Meteo accepts comma-separated lists
            url = "https://api.open-meteo.com/v1/forecast"
            params = {
                "latitude": lats,
                "longitude": lons,
                "current": "temperature_2m",
                "timezone": "auto"
            }
            
            response = httpx.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            # Parse response
            # Open-Meteo returns a list of results if multiple coords provided
            results = []
            
            # Handle single vs multiple results structure
            response_list = data if isinstance(data, list) else [data]
            
            for i, item in enumerate(response_list):
                if i < len(nodes):
                    current = item.get("current", {})
                    results.append({
                        "node_id": ids[i],
                        "lat": lats[i],
                        "lon": lons[i],
                        "temp_c": current.get("temperature_2m", 0.0),
                        "ts": datetime.now()
                    })
            
            return pd.DataFrame(results)
            
        except Exception as e:
            print(f"Weather API failed: {e}")
            # Fallback to synthetic if API fails
            return self._generate_synthetic()

    def _generate_synthetic(self) -> pd.DataFrame:
        """Fallback synthetic data"""
        np.random.seed(42)
        lats = np.linspace(-90, 90, 20)
        lons = np.linspace(-180, 180, 40)
        data = []
        for lat in lats:
            for lon in lons:
                temp_c = 15 + np.sin(np.radians(lat)) * 20 + np.random.normal(0, 3)
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
