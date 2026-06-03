"""Tests for the natural-language interpretation fallback (regex path)."""
import os

from nl.engine import NLEngine
from sim.ripple_engine import RippleEngine
from schemas import NLQuery


def _engine() -> NLEngine:
    # Force the regex fallback path (no LLM) for deterministic tests.
    os.environ.pop("GEMINI_API_KEY", None)
    return NLEngine(RippleEngine())


def test_query_with_implicit_magnitude_builds_scenario():
    """'shuts down' implies a full closure even with no explicit percentage."""
    eng = _engine()
    interp = eng.interpret(NLQuery(text="What happens if LA port shuts down for 24 hours?"))
    assert interp.scenario_spec is not None
    assert "los_angeles" in interp.scenario_spec.target_ids
    assert interp.scenario_spec.magnitude == 1.0
    assert interp.scenario_spec.duration_hours == 24


def test_query_with_explicit_percentage():
    eng = _engine()
    interp = eng.interpret(NLQuery(text="Simulate 40% slowdown in Suez Canal for 7 days"))
    assert interp.scenario_spec is not None
    assert "suez_canal" in interp.scenario_spec.target_ids
    assert abs(interp.scenario_spec.magnitude - 0.4) < 1e-6
    assert interp.scenario_spec.duration_hours == 168


def test_run_query_executes_simulation():
    eng = _engine()
    resp = eng.run_query(NLQuery(text="LA port shuts down for 24 hours"))
    assert resp.simulation_result is not None
    assert resp.error is None
