import pytest
from agents.weather import WeatherAgent
import pandas as pd
from unittest.mock import patch, MagicMock

def test_weather_agent_fetch_live_mock():
    with patch('httpx.get') as mock_get:
        # Mock response
        mock_response = MagicMock()
        mock_response.json.return_value = [
            {"current": {"temperature_2m": 25.5}},
            {"current": {"temperature_2m": 10.2}}
        ]
        mock_get.return_value = mock_response
        
        agent = WeatherAgent()
        # Mock reading the JSON file to avoid dependency on file existence in test env if needed,
        # but here we assume the file exists as we created it.
        
        df = agent.fetch_live()
        
        assert not df.empty
        assert "temp_c" in df.columns
        assert "lat" in df.columns
        assert "lon" in df.columns
