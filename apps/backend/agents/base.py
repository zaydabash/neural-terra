from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import pandas as pd
from datetime import datetime, timedelta
import os
import json
from pathlib import Path

class AgentBase(ABC):
    """Base class for all data agents"""
    
    def __init__(self, cache_dir: str = ".cache", ttl_minutes: int = 30):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        self.ttl_minutes = ttl_minutes
        self.use_offline = os.getenv("USE_OFFLINE_SNAPSHOTS", "true").lower() == "true"
    
    @abstractmethod
    def fetch_live(self) -> pd.DataFrame:
        """Fetch live data from external APIs"""
        pass
    
    @abstractmethod
    def load_snapshot(self) -> pd.DataFrame:
        """Load offline snapshot data"""
        pass
    
    @abstractmethod
    def normalize(self, data: pd.DataFrame) -> pd.DataFrame:
        """Normalize data to standard schema"""
        pass
    
    def get_cache_path(self) -> Path:
        """Get cache file path for this agent"""
        return self.cache_dir / f"{self.__class__.__name__.lower()}.parquet"
    
    def is_cache_valid(self) -> bool:
        """Check if cache is still valid"""
        cache_path = self.get_cache_path()
        if not cache_path.exists():
            return False
        
        cache_age = datetime.now() - datetime.fromtimestamp(cache_path.stat().st_mtime)
        return cache_age < timedelta(minutes=self.ttl_minutes)
    
    def load_data(self) -> pd.DataFrame:
        """Load data with caching and offline fallback"""
        # Try cache first
        if self.is_cache_valid():
            try:
                return pd.read_parquet(self.get_cache_path())
            except Exception as e:
                print(f"Cache load failed: {e}")
        
        # Try live data if not offline mode
        if not self.use_offline:
            try:
                live_data = self.fetch_live()
                normalized = self.normalize(live_data)
                # Cache the result
                normalized.to_parquet(self.get_cache_path())
                return normalized
            except Exception as e:
                print(f"Live data fetch failed: {e}")
        
        # Fallback to snapshot
        try:
            snapshot_data = self.load_snapshot()
            return self.normalize(snapshot_data)
        except Exception as e:
            print(f"Snapshot load failed: {e}")
            # Return empty DataFrame as last resort
            return pd.DataFrame()
    
    def clear_cache(self):
        """Clear cached data"""
        cache_path = self.get_cache_path()
        if cache_path.exists():
            cache_path.unlink()
