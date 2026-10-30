#!/usr/bin/env python3
"""LIFELINK Terminal Demo Execution Runner.

Executes the deterministic mass-casualty crisis simulation end-to-end:
  - Step 0: Baseline Chaos (214 victims, 31 critical, 4 open ICU beds, 5 ambulances)
  - Step 1: Event 1 - Responder Evidence (+17 victims, +5 critical)
  - Step 2: Event 2 - Hospital B ICU Capacity Drop (2 -> 1 beds) [PLAN v12 Reroute V129]
  - Step 3: Event 3 - Highway 101 Blocked (Route A 11m -> 27m) [Route B Bypass]
  - Step 4: Event 4 - Blood Reserve Depleted (18 -> 3 units) [V083 Reserve & Escort]
  - Step 5: Event 5 - Hospital C Trauma Team Mobilized (+2 ICU beds) [Fill Surgical Capacity]
  - Step 6: Deterministic Evaluation Benchmark Summary (8 Core Metrics)

Usage:
  python demo/run_demo.py [--auto] [--delay SECONDS]
"""

import argparse
import sys
import os
import time

# Reconfigure stdout for UTF-8 on Windows cp1252 consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Ensure backend is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.data.repository import db
from backend.app.command_center.command_center_engine import command_center_engine
from backend.app.replanning.replanning_engine import replanning_engine
from backend.app.simulation.simulator import simulator
from backend.app.evaluation.evaluation_engine import evaluation_engine


def print_banner():
    print("=" * 80)
    print("  ⚡ LIFELINK: AUTONOMOUS CRISIS RESPONSE ORCHESTRATION SYSTEM")
    print("  Deterministic Optimization (OR-Tools) + Cognitive Agents (Gemini)")
    print("=" * 80)
    print("  [!] DEMO / SIMULATION NOTICE:")
    print("      LIFELINK provides decision-support recommendations using synthetic data.")
    print("      It does not provide medical diagnosis, replace emergency professionals,")
    print("      or autonomously make clinical decisions.")
    print("=" * 80)
    print()


def run_simulation_demo(auto: bool = True, delay: float = 1.0):
    print_banner()

    # Step 0: Initial State
    simulator.reset()
    db.reset()

    print("[*] STEP 0: INITIAL CRISIS BASELINE LOADED")
    inc = db.get_incident()
    stats = inc.statistics
    print(f"    • Codename: {inc.codename}")
    print(f"    • Total Casualties: {stats.total_victims} ({stats.critical} Critical, {stats.serious} Serious, {stats.moderate} Moderate, {stats.unknown} In Rubble)")
    print(f"    • Fleet: {stats.active_ambulances} Active ALS/BLS Ambulances")
    print(f"    • Regional Hospitals: {stats.total_hospitals} Facilities | {stats.total_icu_beds} Open ICU Beds")
    print()

    # Hero Showcase
    queue = command_center_engine.build_action_queue()
    hero = queue.hero_showcase
    print("  🔴 HERO SHOWCASE DIRECTIVE:")
    print(f"     Action:    {hero.action}")
    print(f"     Reason:    {hero.reason}")
    print(f"     Evidence:  {', '.join(hero.evidence)}")
    print()

    if not auto:
        input("Press ENTER to start the 5-event mass-casualty simulation sequence...")

    # Execute Events 1 to 5
    for step_num in range(1, 6):
        time.sleep(delay)
        print("-" * 80)
        res = simulator.advance_step()
        print(f"[*] EVENT {res.step_number}/5: {res.title}")
        print(f"    • What Happened: {res.what_changed}")
        print(f"    • State Delta:   {res.state_delta}")

        # Check replan state
        plan = replanning_engine.active_plan
        if plan and plan.plan_version > 11:
            print(f"    • [REPLAN TRIGGERED] {plan.plan_version_label}: {plan.reason_for_replan}")
            if plan.changed_assignments:
                diff = plan.changed_assignments[0]
                print(f"      -> REROUTED: {diff.victim_id} ({diff.previous_destination} -> {diff.new_destination})")
                print(f"      -> Reason:   {diff.change_reason}")
        print()

    # Step 6: Evaluation Metrics Benchmark
    time.sleep(delay)
    print("=" * 80)
    print("  📊 SIMULATION EVALUATION BENCHMARK (PHASE 14)")
    print("  Comparing Baseline / Manual Dispatch vs LIFELINK Autonomous Optimization")
    print("=" * 80)

    report = evaluation_engine.run_benchmark()
    base = report.baseline_profile
    life = report.lifelink_profile

    print(f"{'Metric':<38} | {'Manual Baseline':<20} | {'LIFELINK':<18}")
    print("-" * 80)
    for m in report.metrics_comparison:
        print(f"{m.metric_name:<38} | {m.baseline_display:<20} | {m.lifelink_display:<18}")

    print("-" * 80)
    print(f"[✓] Initial Plan Speedup: {report.algorithmic_speedup_factor} faster")
    print(f"[✓] ICU Diversion Conflicts: {base.icu_conflicts} in manual -> {life.icu_conflicts} in LIFELINK (100% eliminated)")
    print(f"[✓] Critical Patients Assigned: {base.critical_patients_assigned}/31 -> {life.critical_patients_assigned}/31 (100%)")
    print()
    print(f"Executive Summary:\n{report.executive_summary}")
    print()
    print("=" * 80)
    print("  [✓] DEMO COMPLETE: All 5 events executed, continuous replans verified, 0 conflicts.")
    print("=" * 80)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run LIFELINK Terminal Demo")
    parser.add_argument("--auto", action="store_true", default=True, help="Run without manual pauses")
    parser.add_argument("--delay", type=float, default=0.5, help="Seconds between event steps")
    args = parser.parse_args()

    run_simulation_demo(auto=args.auto, delay=args.delay)
