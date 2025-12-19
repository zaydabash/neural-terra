import pandas as pd
import json
from datetime import datetime, timedelta
from pathlib import Path
from .base import AgentBase

class AlertsAgent(AgentBase):
    """Agent for alerts/news data"""
    
    def fetch_live(self) -> pd.DataFrame:
        """Fetch live alerts data (placeholder for real API)"""
        # In a real implementation, this might call news APIs
        # For now, return static alerts data
        return self.load_snapshot()
    
    def load_snapshot(self) -> pd.DataFrame:
        """Load alerts snapshot from file"""
        snapshot_path = Path("data/snapshots/alerts_sample.json")
        if snapshot_path.exists():
            with open(snapshot_path, 'r') as f:
                data = json.load(f)
            return pd.DataFrame(data)
        
        # Generate sample data if snapshot doesn't exist
        return self._generate_sample_alerts()
    
    def _generate_sample_alerts(self) -> pd.DataFrame:
        """Generate sample alerts data"""
        now = datetime.now()
        
        alerts_data = [
            {
                'id': 'panama_drought_2024',
                'ts': now - timedelta(hours=2),
                'title': 'Panama Canal Drought Restrictions',
                'summary': 'Water levels at historic lows, restricting ship passages',
                'severity': 'high',
                'tags': ['shipping', 'drought', 'infrastructure'],
                'region_ids': ['Central America'],
                'asset_ids': ['panama_canal']
            },
            {
                'id': 'eu_heatwave_2024',
                'ts': now - timedelta(hours=6),
                'title': 'European Heatwave Alert',
                'summary': 'Temperatures 3°C above normal across Western Europe',
                'severity': 'medium',
                'tags': ['weather', 'heatwave', 'energy'],
                'region_ids': ['Europe'],
                'asset_ids': ['eu_central', 'eu_north']
            },
            {
                'id': 'california_grid_stress',
                'ts': now - timedelta(hours=12),
                'title': 'California Grid Stress Warning',
                'summary': 'High demand expected due to air conditioning load',
                'severity': 'medium',
                'tags': ['energy', 'grid', 'demand'],
                'region_ids': ['North America'],
                'asset_ids': ['us_west']
            },
            {
                'id': 'suez_traffic_delay',
                'ts': now - timedelta(hours=18),
                'title': 'Suez Canal Traffic Delays',
                'summary': 'Increased wait times due to maintenance work',
                'severity': 'low',
                'tags': ['shipping', 'maintenance', 'delays'],
                'region_ids': ['Middle East'],
                'asset_ids': ['suez_canal']
            },
            {
                'id': 'china_manufacturing_surge',
                'ts': now - timedelta(hours=24),
                'title': 'Chinese Manufacturing Surge',
                'summary': 'Increased production driving higher energy consumption',
                'severity': 'low',
                'tags': ['manufacturing', 'energy', 'production'],
                'region_ids': ['Asia'],
                'asset_ids': ['china_east', 'china_west']
            }
        ]
        
        return pd.DataFrame(alerts_data)
    
    def normalize(self, data: pd.DataFrame) -> pd.DataFrame:
        """Normalize alerts data to standard schema"""
        if data.empty:
            return pd.DataFrame(columns=['id', 'ts', 'title', 'summary', 'severity', 'tags', 'region_ids', 'asset_ids'])
        
        required_cols = ['id', 'ts', 'title', 'summary', 'severity', 'tags', 'region_ids', 'asset_ids']
        
        # Ensure all required columns exist
        for col in required_cols:
            if col not in data.columns:
                raise ValueError(f"Missing required column: {col}")
        
        # Convert timestamp if needed
        if not pd.api.types.is_datetime64_any_dtype(data['ts']):
            data['ts'] = pd.to_datetime(data['ts'])
        
        # Ensure lists are properly formatted
        for col in ['tags', 'region_ids', 'asset_ids']:
            if not data[col].apply(lambda x: isinstance(x, list)).all():
                data[col] = data[col].apply(lambda x: x if isinstance(x, list) else [])
        
        return data[required_cols].copy()
