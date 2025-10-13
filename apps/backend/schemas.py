from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class WeatherPoint(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    temp_c: float = Field(..., description="Temperature in Celsius")
    ts: datetime = Field(..., description="Timestamp")

class Port(BaseModel):
    id: str = Field(..., description="Unique port identifier")
    name: str = Field(..., description="Port name")
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    throughput_index: float = Field(..., ge=0, le=1, description="Normalized throughput capacity")
    region: str = Field(..., description="Geographic region")

class GridRegion(BaseModel):
    id: str = Field(..., description="Unique grid region identifier")
    name: str = Field(..., description="Region name")
    region: str = Field(..., description="Geographic region")
    capacity_mw: float = Field(..., ge=0, description="Total capacity in megawatts")
    load_mw: float = Field(..., ge=0, description="Current load in megawatts")
    stress_index: float = Field(..., ge=0, le=1, description="Normalized stress level")

class Alert(BaseModel):
    id: str = Field(..., description="Unique alert identifier")
    ts: datetime = Field(..., description="Alert timestamp")
    title: str = Field(..., description="Alert title")
    summary: str = Field(..., description="Alert summary")
    severity: Severity = Field(..., description="Alert severity")
    tags: List[str] = Field(default_factory=list, description="Alert tags")
    region_ids: List[str] = Field(default_factory=list, description="Affected region IDs")
    asset_ids: List[str] = Field(default_factory=list, description="Affected asset IDs")

class Shock(BaseModel):
    target_ids: List[str] = Field(..., description="Target node/asset IDs")
    magnitude: float = Field(..., ge=0, le=1, description="Shock magnitude (0-1)")
    duration_hours: int = Field(..., ge=1, description="Shock duration in hours")
    start_ts: datetime = Field(default_factory=datetime.now, description="Shock start time")

class SimulationResult(BaseModel):
    scenario_id: str = Field(..., description="Unique scenario identifier")
    shock: Shock = Field(..., description="Applied shock")
    impact_series: Dict[str, List[float]] = Field(..., description="Node impact time series")
    kpis: Dict[str, Any] = Field(default_factory=dict, description="Derived KPIs")
    duration_hours: int = Field(..., description="Simulation duration")

class NLQuery(BaseModel):
    text: str = Field(..., description="Natural language query")

class NLInterpretation(BaseModel):
    scenario_spec: Optional[Shock] = Field(None, description="Parsed scenario specification")
    queries: List[str] = Field(default_factory=list, description="Derived queries")
    confidence: float = Field(..., ge=0, le=1, description="Parsing confidence")

class NLResponse(BaseModel):
    interpretation: NLInterpretation = Field(..., description="Query interpretation")
    simulation_result: Optional[SimulationResult] = Field(None, description="Simulation results if applicable")
    error: Optional[str] = Field(None, description="Error message if any")
