#!/usr/bin/env python3
"""LIFELINK Master Test Suite Runner.

Discovers and runs all 68 automated unit tests across the entire codebase:
  1. test_agents.py (Phase 8 Gemini multi-agent extraction & fallbacks)
  2. test_command_center.py (Phase 9 & Execution phase hero directives)
  3. test_hospital_matcher.py (Phase 5 deterministic suitability scoring)
  4. test_killer_demo.py (Phase 11 5-event automated simulation sequence)
  5. test_replanning.py (Phase 10 continuous closed-loop replanning)
  6. test_resource_optimization.py (Phase 7 OR-Tools MILP allocation)
  7. test_routing_engine.py (Phase 6 corridor detours & dispatch chains)
  8. test_triage_engine.py (Phase 4 numerical triage scoring)
  9. test_reliability_audit.py (Phase 13 10-point stress & refusal audit)
 10. test_evaluation_metrics.py (Phase 14 deterministic benchmark metrics)

Usage:
  python tests/run_tests.py
"""

import os
import sys
import unittest

# Reconfigure stdout for UTF-8 on Windows cp1252 consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Ensure repo root and backend directory are in sys.path
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR = os.path.join(REPO_ROOT, "backend")

if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)


def main():
    print("=" * 80)
    print("  ⚡ LIFELINK: MASTER TEST SUITE DISCOVERY")
    print("  Running all unit tests across 10 specialized modules...")
    print("=" * 80)

    loader = unittest.TestLoader()
    suite = loader.discover(start_dir=os.path.join(BACKEND_DIR, "tests"), pattern="test_*.py")

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    print("=" * 80)
    if result.wasSuccessful():
        print(f"  [✓] ALL {result.testsRun} TESTS PASSED SUCCESSFULLY!")
        print("=" * 80)
        sys.exit(0)
    else:
        print(f"  [✗] TEST SUITE FAILED: {len(result.failures)} failures, {len(result.errors)} errors")
        print("=" * 80)
        sys.exit(1)


if __name__ == "__main__":
    main()
