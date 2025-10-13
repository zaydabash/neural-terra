#!/usr/bin/env python3
"""
Backend smoke test for Neural Terra.
Tests that the backend is running and can process a Suez Canal scenario.
"""

import requests
import sys
import time
import json
from datetime import datetime

def wait_for_backend(max_attempts: int = 30, timeout: float = 1.0) -> bool:
    """Wait for backend to be ready."""
    print("🔄 Waiting for backend to start...")
    
    for attempt in range(max_attempts):
        try:
            response = requests.get("http://127.0.0.1:8000/healthz", timeout=timeout)
            if response.ok:
                print("✅ Backend is ready")
                return True
        except Exception as e:
            if attempt < max_attempts - 1:
                print(f"   Attempt {attempt + 1}/{max_attempts}: {e}")
                time.sleep(0.2)
            else:
                print(f"❌ Backend failed to start: {e}")
                return False
    
    return False

def test_suez_scenario() -> bool:
    """Test Suez Canal scenario simulation."""
    print("🧪 Testing Suez Canal scenario...")
    
    payload = {
        "target_ids": ["suez_canal"],
        "magnitude": 0.4,
        "duration_hours": 168,  # 7 days
        "start_ts": datetime.now().isoformat()
    }
    
    try:
        response = requests.post(
            "http://127.0.0.1:8000/simulate", 
            json=payload, 
            timeout=30
        )
        response.raise_for_status()
        
        data = response.json()
        
        # Validate response structure
        required_fields = ["scenario_id", "shock", "impact_series", "kpis", "duration_hours"]
        for field in required_fields:
            if field not in data:
                print(f"❌ Missing required field: {field}")
                return False
        
        # Check that impact series is not empty
        impact_series = data.get("impact_series", {})
        if not impact_series:
            print("❌ Impact series is empty")
            return False
        
        # Check that at least one node has non-empty time series
        has_data = any(len(series) > 0 for series in impact_series.values())
        if not has_data:
            print("❌ All impact series are empty")
            return False
        
        # Check KPIs
        kpis = data.get("kpis", {})
        if not kpis:
            print("⚠️  No KPIs generated")
        
        print("✅ Suez scenario simulation successful")
        print(f"   Scenario ID: {data['scenario_id']}")
        print(f"   Duration: {data['duration_hours']} hours")
        print(f"   Nodes with data: {len([s for s in impact_series.values() if len(s) > 0])}")
        print(f"   KPIs: {len(kpis)} metrics")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON response: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_nl_query() -> bool:
    """Test natural language query processing."""
    print("🧪 Testing natural language query...")
    
    payload = {
        "text": "Simulate 30% slowdown in Panama Canal for 7 days"
    }
    
    try:
        response = requests.post(
            "http://127.0.0.1:8000/nl/run", 
            json=payload, 
            timeout=30
        )
        response.raise_for_status()
        
        data = response.json()
        
        # Check response structure
        if "interpretation" not in data:
            print("❌ Missing interpretation in NL response")
            return False
        
        interpretation = data["interpretation"]
        if interpretation.get("confidence", 0) < 0.5:
            print("⚠️  Low confidence NL interpretation")
        
        print("✅ Natural language query successful")
        print(f"   Confidence: {interpretation.get('confidence', 0):.2f}")
        
        return True
        
    except Exception as e:
        print(f"❌ NL query failed: {e}")
        return False

def main():
    """Main smoke test function."""
    print("🚀 Starting Neural Terra backend smoke test")
    
    # Wait for backend
    if not wait_for_backend():
        sys.exit(1)
    
    # Test Suez scenario
    if not test_suez_scenario():
        sys.exit(1)
    
    # Test NL query
    if not test_nl_query():
        sys.exit(1)
    
    print("\n🎉 All smoke tests passed!")
    print("✅ Backend is ready for production")

if __name__ == "__main__":
    main()
