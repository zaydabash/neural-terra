import re
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from schemas import Shock, NLQuery, NLInterpretation, NLResponse, SimulationResult
from sim import RippleEngine

import re
import os
import json
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
import google.generativeai as genai
from schemas import Shock, NLQuery, NLInterpretation, NLResponse, SimulationResult
from sim import RippleEngine

class NLEngine:
    """Natural language processing engine for scenario interpretation"""
    
    def __init__(self, ripple_engine: RippleEngine):
        self.ripple_engine = ripple_engine
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Keep aliases for fallback
        self.asset_aliases = self._build_asset_aliases()
        self.region_aliases = self._build_region_aliases()
    
    def interpret(self, query: NLQuery) -> NLInterpretation:
        """Interpret natural language query into structured scenario"""
        if self.api_key:
            try:
                return self._interpret_llm(query)
            except Exception as e:
                print(f"LLM interpretation failed: {e}. Falling back to regex.")
                return self._interpret_regex(query)
        else:
            return self._interpret_regex(query)

    def _interpret_llm(self, query: NLQuery) -> NLInterpretation:
        """Interpret query using Gemini"""
        # Get available nodes for context
        graph_data = self.ripple_engine.get_graph_data(planet='earth') # Default to earth context
        nodes = [f"{n['name']} (id: {n['id']})" for n in graph_data['nodes']]
        nodes_list = "\n".join(nodes)
        
        prompt = f"""
        You are an AI assistant for a planetary simulation engine.
        Your task is to interpret a user's natural language query and convert it into a structured simulation scenario (Shock).
        
        Available Nodes in the Simulation:
        {nodes_list}
        
        User Query: "{query.text}"
        
        Extract the following fields:
        1. target_ids: List of node IDs that are the targets of the shock. Map the user's intent to the closest available node IDs.
        2. magnitude: A float between 0.0 and 1.0 representing the intensity of the shock (1.0 = total failure/shutdown, 0.1 = minor disruption).
        3. duration_hours: Integer representing duration in hours.
        4. description: A brief summary of the action.
        
        Return ONLY a JSON object with these fields. Do not include markdown formatting.
        Example JSON:
        {{
            "target_ids": ["suez_canal"],
            "magnitude": 0.5,
            "duration_hours": 48,
            "description": "Simulate 50% slowdown of Suez Canal for 48 hours"
        }}
        """
        
        response = self.model.generate_content(prompt)
        text = response.text.strip()
        # Clean markdown if present
        if text.startswith("```json"):
            text = text[7:-3]
        
        data = json.loads(text)
        
        scenario_spec = Shock(
            target_ids=data.get("target_ids", []),
            magnitude=float(data.get("magnitude", 0.5)),
            duration_hours=int(data.get("duration_hours", 24)),
            start_ts=datetime.now()
        )
        
        return NLInterpretation(
            scenario_spec=scenario_spec,
            queries=[data.get("description", query.text)],
            confidence=0.95
        )

    def _interpret_regex(self, query: NLQuery) -> NLInterpretation:
        """Interpret natural language query using regex (Fallback)"""
        text = query.text.lower()
        
        # Extract scenario components
        targets = self._extract_targets(text)
        magnitude = self._extract_magnitude(text)
        duration = self._extract_duration(text)
        action = self._extract_action(text)
        
        # Build scenario specification
        scenario_spec = None
        queries = []
        confidence = 0.0
        
        if targets and magnitude is not None and duration is not None:
            scenario_spec = Shock(
                target_ids=targets,
                magnitude=magnitude,
                duration_hours=duration,
                start_ts=datetime.now()
            )
            confidence = 0.8
            queries.append(f"Simulate {action} of {', '.join(targets)} by {magnitude*100:.0f}% for {duration} hours")
        else:
            # Try to extract other types of queries
            if 'choke point' in text or 'bottleneck' in text:
                queries.append("Identify critical infrastructure choke points")
                confidence = 0.6
            elif 'show' in text or 'display' in text:
                queries.append("Display current system status")
                confidence = 0.7
        
        return NLInterpretation(
            scenario_spec=scenario_spec,
            queries=queries,
            confidence=confidence
        )
    
    def _build_asset_aliases(self) -> Dict[str, str]:
        """Build mapping of natural language terms to asset IDs"""
        return {
            'panama': 'panama_canal',
            'panama canal': 'panama_canal',
            'suez': 'suez_canal',
            'suez canal': 'suez_canal',
            'los angeles': 'los_angeles',
            'la port': 'los_angeles',
            'rotterdam': 'rotterdam',
            'singapore': 'singapore',
            'us grid': 'us_east',
            'european grid': 'eu_central',
            'china grid': 'china_east',
        }
    
    def _build_region_aliases(self) -> Dict[str, str]:
        """Build mapping of natural language terms to region IDs"""
        return {
            'north america': 'na',
            'america': 'na',
            'usa': 'na',
            'us': 'na',
            'europe': 'eu',
            'asia': 'as',
            'china': 'as',
            'africa': 'af',
            'oceania': 'oc',
            'australia': 'oc',
        }

    def _extract_targets(self, text: str) -> List[str]:
        """Extract target assets/regions from text"""
        targets = []
        
        # Check for asset mentions
        for alias, asset_id in self.asset_aliases.items():
            if alias in text:
                targets.append(asset_id)
        
        # Check for region mentions
        for alias, region_id in self.region_aliases.items():
            if alias in text:
                targets.append(region_id)
        
        # Check for specific patterns
        if 'port' in text:
            if 'panama' in text:
                targets.append('panama_canal')
            elif 'suez' in text:
                targets.append('suez_canal')
            elif 'los angeles' in text or 'la' in text:
                targets.append('los_angeles')
        
        if 'grid' in text or 'power' in text:
            if 'us' in text or 'america' in text:
                targets.append('us_east')
            elif 'europe' in text:
                targets.append('eu_central')
            elif 'china' in text:
                targets.append('china_east')
        
        return list(set(targets))  # Remove duplicates
    
    def _extract_magnitude(self, text: str) -> Optional[float]:
        """Extract magnitude percentage from text"""
        # Look for percentage patterns
        percent_pattern = r'(\d+(?:\.\d+)?)\s*%'
        match = re.search(percent_pattern, text)
        if match:
            return float(match.group(1)) / 100.0
        
        # Look for fraction patterns
        fraction_patterns = [
            r'(\d+(?:\.\d+)?)\s*percent',
            r'(\d+(?:\.\d+)?)\s*per\s*cent',
            r'(\d+(?:\.\d+)?)\s*of',
        ]
        
        for pattern in fraction_patterns:
            match = re.search(pattern, text)
            if match:
                return float(match.group(1)) / 100.0
        
        # Look for qualitative terms
        if 'complete' in text or 'total' in text or 'full' in text:
            return 1.0
        elif 'partial' in text or 'some' in text:
            return 0.5
        elif 'minor' in text or 'small' in text:
            return 0.2
        
        return None
    
    def _extract_duration(self, text: str) -> Optional[int]:
        """Extract duration from text"""
        # Look for hour patterns
        hour_patterns = [
            r'(\d+)\s*hours?',
            r'(\d+)\s*hrs?',
            r'(\d+)\s*h',
        ]
        
        for pattern in hour_patterns:
            match = re.search(pattern, text)
            if match:
                return int(match.group(1))
        
        # Look for day patterns
        day_patterns = [
            r'(\d+)\s*days?',
            r'(\d+)\s*d',
        ]
        
        for pattern in day_patterns:
            match = re.search(pattern, text)
            if match:
                return int(match.group(1)) * 24
        
        # Look for week patterns
        week_patterns = [
            r'(\d+)\s*weeks?',
            r'(\d+)\s*w',
        ]
        
        for pattern in week_patterns:
            match = re.search(pattern, text)
            if match:
                return int(match.group(1)) * 24 * 7
        
        # Default durations for common scenarios
        if 'brief' in text or 'short' in text:
            return 24
        elif 'extended' in text or 'long' in text:
            return 168  # 1 week
        
        return None
    
    def _extract_action(self, text: str) -> str:
        """Extract action type from text"""
        if 'shutdown' in text or 'close' in text:
            return 'shutdown'
        elif 'slowdown' in text or 'slow' in text:
            return 'slowdown'
        elif 'disruption' in text or 'disrupt' in text:
            return 'disruption'
        elif 'failure' in text or 'fail' in text:
            return 'failure'
        else:
            return 'disruption'
    
    def run_query(self, query: NLQuery) -> NLResponse:
        """Run natural language query and return results"""
        interpretation = self.interpret(query)
        
        simulation_result = None
        error = None
        
        if interpretation.scenario_spec:
            try:
                simulation_result = self.ripple_engine.simulate_shock(interpretation.scenario_spec)
            except Exception as e:
                error = f"Simulation failed: {str(e)}"
        
        return NLResponse(
            interpretation=interpretation,
            simulation_result=simulation_result,
            error=error
        )
