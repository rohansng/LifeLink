/**
 * Client-Side Autonomous Simulation & Fallback Engine
 * Enables 100% interactive standalone deployment on Vercel/Static hosting
 * when the Python FastAPI backend is not locally accessible.
 */

import seedDashboard from './seedDashboard.json';
import seedCommandCenter from './seedCommandCenter.json';
import seedBenchmark from './seedBenchmark.json';
import seedReplanning from './seedReplanning.json';

class MockSimulator {
  constructor() {
    this.reset();
  }

  reset() {
    this.step = 0;
    this.dashboard = JSON.parse(JSON.stringify(seedDashboard));
    this.commandCenter = JSON.parse(JSON.stringify(seedCommandCenter));
    this.benchmark = JSON.parse(JSON.stringify(seedBenchmark));
    this.replanning = JSON.parse(JSON.stringify(seedReplanning));
    this.executedActions = {};
  }

  getDashboard() {
    return this.dashboard;
  }

  getCommandCenter() {
    return this.commandCenter;
  }

  getBenchmark() {
    return this.benchmark;
  }

  getReplanning() {
    return this.replanning;
  }

  getSimulationStatus() {
    return {
      current_step: this.step,
      total_steps: 5,
      scenario_codename: 'CENTRAL FREIGHT DERAILMENT & CHEMICAL TANKER RUPTURE',
      total_victims: this.dashboard.statistics.total_victims,
      critical_victims: this.dashboard.statistics.critical,
      active_ambulances: this.dashboard.statistics.active_ambulances,
      total_icu_beds: this.dashboard.statistics.total_icu_beds,
      is_complete: this.step >= 5,
    };
  }

  simulateNextEvent() {
    if (this.step >= 5) {
      return {
        event_number: 5,
        title: 'Simulation Complete',
        description: 'All 5 crisis events executed. Regional capacity stabilized.',
        state_delta: {},
        is_final: true,
      };
    }

    this.step += 1;

    switch (this.step) {
      case 1: {
        // Event 1: Responder evidence: +17 victims (+5 critical)
        this.dashboard.statistics.total_victims += 17;
        this.dashboard.statistics.critical += 5;
        this.dashboard.incident.summary =
          'Drone reconnaissance confirms +17 additional casualties in Sector Alpha rubble. 5 acute crush victims requiring immediate ALS dispatch.';
        this.dashboard.events.unshift({
          id: `EVT-SIM-01`,
          timestamp: '11:55:00',
          category: 'TRIAGE',
          title: 'Drone Recon: +17 Casualties (+5 Critical)',
          detail: 'Sector Alpha collapse perimeter expanded. +5 critical red casualties detected in Warehouse B.',
          severity: 'CRITICAL',
        });
        return {
          event_number: 1,
          title: 'Responder Evidence: +17 Victims (+5 Critical)',
          description: '+17 casualties identified in Sector Alpha. Total victims: 214 -> 231. Critical: 31 -> 36.',
          state_delta: { victims_added: 17, critical_added: 5, total_victims: 231, critical: 36 },
        };
      }

      case 2: {
        // Event 2: Hospital B ICU 2 -> 1
        const hospB = this.dashboard.hospitals.find((h) => h.id === 'H-B');
        if (hospB) hospB.icu = 1;
        this.dashboard.statistics.total_icu_beds = 3;
        this.replanning.plan_version = 'v12';
        this.replanning.trigger_reason = 'Hospital B ICU capacity decreased from 2 to 1.';
        this.replanning.changed_assignments = [
          { victim_id: 'V129', previous_hospital: 'Hospital B', new_hospital: 'Hospital C', reason: 'Hospital C provides feasible ICU bed.' },
        ];
        this.dashboard.events.unshift({
          id: `EVT-SIM-02`,
          timestamp: '11:57:30',
          category: 'HOSPITAL',
          title: 'Hospital B ICU Shock (2 -> 1 Bed)',
          detail: 'St. Jude Regional emergency laparotomy admitted. Continuous replan v12 reroutes V129 to Hospital C.',
          severity: 'CRITICAL',
        });
        return {
          event_number: 2,
          title: 'Hospital B ICU Capacity Shock: 2 -> 1',
          description: 'St. Jude ICU beds dropped from 2 to 1. Continuous replanning engine executed PLAN v12.',
          state_delta: { hospital_b_icu: '2 -> 1', total_icu: 3, plan: 'v12' },
        };
      }

      case 3: {
        // Event 3: Road A 11 min -> 27 min
        const roadA = this.dashboard.roads.find((r) => r.id === 'ROAD-01' || r.name.includes('101'));
        if (roadA) {
          roadA.status = 'BLOCKED';
          roadA.detour_penalty_minutes = 16.0;
        }
        this.dashboard.events.unshift({
          id: `EVT-SIM-03`,
          timestamp: '11:59:15',
          category: 'OBSTACLE',
          title: 'Highway 101 Southbound Severed (11m -> 27m)',
          detail: 'Overturned fuel tanker fire at Overpass 4. Transit time increased by +16m. Ambulances rerouted via Grand Ave Corridor B.',
          severity: 'WARNING',
        });
        return {
          event_number: 3,
          title: 'Roadway Severed: Route A Detour (+16 min)',
          description: 'Hwy 101 transit time jumped from 11 min to 27 min. Routing Agent rerouted Medic-02 via Corridor B.',
          state_delta: { route_a: 'BLOCKED', transit_time: '11m -> 27m', detour: '+16m' },
        };
      }

      case 4: {
        // Event 4: Hospital B O- blood 18 -> 3
        const hospA = this.dashboard.hospitals.find((h) => h.id === 'H-A');
        if (hospA && hospA.blood) hospA.blood.O_negative = 3;
        this.dashboard.events.unshift({
          id: `EVT-SIM-04`,
          timestamp: '12:01:00',
          category: 'ALERT',
          title: 'Universal Donor O- Blood Depletion (18 -> 3 Units)',
          detail: 'Simultaneous massive hemorrhage resuscitation at Metro Trauma. Emergency blood convoy ordered from regional reserve.',
          severity: 'CRITICAL',
        });
        return {
          event_number: 4,
          title: 'O-Negative Blood Shortage: 18 -> 3 Units',
          description: 'Universal donor O- blood inventory plunged to 3 units. Resource Agent triggered priority blood convoy.',
          state_delta: { blood_type: 'O-', units_previous: 18, units_current: 3, deficit: -15 },
        };
      }

      case 5: {
        // Event 5: Hospital C trauma team available
        const hospC = this.dashboard.hospitals.find((h) => h.id === 'H-C');
        if (hospC) {
          hospC.icu = 3;
          hospC.trauma_available = true;
          hospC.operating_rooms_open = 3;
        }
        this.dashboard.statistics.total_icu_beds = 5;
        this.dashboard.events.unshift({
          id: `EVT-SIM-05`,
          timestamp: '12:03:40',
          category: 'DISPATCH',
          title: 'Hospital C Mobilization: Trauma Team Active',
          detail: 'Harborview Memorial Medical fully mobilized: +2 ICU beds, +2 operating suites. On-call trauma team active.',
          severity: 'INFO',
        });
        return {
          event_number: 5,
          title: 'Hospital C Trauma Surgical Team Mobilized',
          description: 'Harborview Memorial ready: +2 ICU beds, +2 operating suites. Absorbs remaining acute surgical backlog.',
          state_delta: { hospital_c_icu: '1 -> 3', or_suites: '1 -> 3', trauma_team: 'ACTIVE', total_icu: 5 },
          is_final: true,
        };
      }

      default:
        return { event_number: this.step, title: 'Event Applied', description: 'Scenario state updated.', state_delta: {} };
    }
  }

  executeAction(actionId) {
    this.executedActions[actionId] = true;
    if (this.commandCenter?.queue) {
      this.commandCenter.queue = this.commandCenter.queue.map((act) =>
        act.id === actionId ? { ...act, status: 'EXECUTED' } : act
      );
    }
    return { status: 'EXECUTED', action_id: actionId };
  }

  executeAllActions() {
    if (this.commandCenter?.queue) {
      this.commandCenter.queue = this.commandCenter.queue.map((act) => ({
        ...act,
        status: 'EXECUTED',
      }));
    }
    return { status: 'SUCCESS', count: this.commandCenter?.queue?.length || 0 };
  }
}

export const mockSimulator = new MockSimulator();
