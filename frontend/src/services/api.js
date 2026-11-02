/**
 * API Service for LifeLink Frontend
 * Connects frontend dashboard to FastAPI backend endpoints with
 * automatic seamless client-side simulation fallback for standalone Vercel deployments.
 */

import { mockSimulator } from './mockSimulator';

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1';

async function safeFetch(endpoint, options = {}, fallbackFn = null) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    if (!res.ok) {
      throw new Error(`API HTTP Error (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    if (fallbackFn) {
      // Graceful fallback to client-side deterministic simulator (e.g., Vercel preview)
      return fallbackFn();
    }
    throw err;
  }
}

export const api = {
  // Consolidated Dashboard State
  async getDashboardState() {
    return safeFetch('/dashboard', {}, () => mockSimulator.getDashboard());
  },

  // Reset to initial Train Derailment seed data
  async resetScenario() {
    return safeFetch('/dashboard/reset', { method: 'POST' }, () => {
      mockSimulator.reset();
      return { status: 'SUCCESS', message: 'Reset to initial seed' };
    });
  },

  // Incident & Statistics
  async getIncident() {
    return safeFetch('/incidents', {}, () => mockSimulator.getDashboard().incident);
  },

  async getIncidentStatistics() {
    return safeFetch('/incidents/statistics', {}, () => mockSimulator.getDashboard().statistics);
  },

  // Victims
  async getVictims(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/victims?${query}` : '/victims';
    return safeFetch(url, {}, () => mockSimulator.getDashboard().triage_summary.priority_queue);
  },

  async getVictim(id) {
    return safeFetch(`/victims/${id}`, {}, () => {
      const q = mockSimulator.getDashboard().triage_summary.priority_queue;
      return q.find((v) => v.victim_id === id) || q[0];
    });
  },

  // Ambulances
  async getAmbulances() {
    return safeFetch('/ambulances', {}, () => mockSimulator.getDashboard().ambulances);
  },

  async getAmbulance(id) {
    return safeFetch(`/ambulances/${id}`, {}, () => {
      return mockSimulator.getDashboard().ambulances.find((a) => a.id === id);
    });
  },

  // Hospitals
  async getHospitals() {
    return safeFetch('/hospitals', {}, () => mockSimulator.getDashboard().hospitals);
  },

  async getHospital(id) {
    return safeFetch(`/hospitals/${id}`, {}, () => {
      return mockSimulator.getDashboard().hospitals.find((h) => h.id === id);
    });
  },

  // Resources
  async getResources() {
    return safeFetch('/resources', {}, () => mockSimulator.getDashboard().resources);
  },

  // Roads
  async getRoads() {
    return safeFetch('/roads', {}, () => mockSimulator.getDashboard().roads);
  },

  // Responders
  async getResponders() {
    return safeFetch('/responders', {}, () => mockSimulator.getDashboard().responders);
  },

  // Events / Timeline
  async getEvents() {
    return safeFetch('/events', {}, () => mockSimulator.getDashboard().events);
  },

  // Deterministic Triage & Priority Engine (Phase 4)
  async getTriageQueue(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/triage/queue?${query}` : '/triage/queue';
    return safeFetch(url, {}, () => ({
      total_victims: 214,
      priority_breakdown: { P1: 31, P2: 67, P3: 82, P4: 34 },
      queue: mockSimulator.getDashboard().triage_summary.priority_queue,
    }));
  },

  async getVictimPriority(id) {
    return safeFetch(`/triage/queue/${id}`, {}, () => {
      const q = mockSimulator.getDashboard().triage_summary.priority_queue;
      return q.find((v) => v.victim_id === id) || q[0];
    });
  },

  // Deterministic Hospital Matching Engine (Phase 5)
  async getHospitalMatch(victimId) {
    return safeFetch(`/matching/hospital/${victimId}`, {}, () => ({
      victim_id: victimId,
      recommended_hospital_id: 'H-B',
      hospital_name: 'St. Jude Regional Hospital',
      match_score: 94.2,
      is_feasible: true,
      reasons: ['Trauma surgical team ready', 'ICU capacity available', 'Shortest feasible ETA via Route B'],
    }));
  },

  async getHospitalMatchesQueue(params = {}) {
    return safeFetch('/matching/queue', {}, () => []);
  },

  async assignHospital(victimId, hospitalId = null) {
    const url = hospitalId
      ? `/matching/hospital/${victimId}/assign?hospital_id=${encodeURIComponent(hospitalId)}`
      : `/matching/hospital/${victimId}/assign`;
    return safeFetch(url, { method: 'POST' }, () => ({
      status: 'ASSIGNED',
      victim_id: victimId,
      hospital_id: hospitalId || 'H-B',
    }));
  },

  // Vehicle Routing & Road Network Engine (Phase 6)
  async getExemplarRoutingChain() {
    return safeFetch('/routing/exemplar-chain', {}, () => mockSimulator.getDashboard().routing_summary.exemplar_chain);
  },

  async getVictimDispatchChain(victimId) {
    return safeFetch(`/routing/chain/${victimId}`, {}, () => mockSimulator.getDashboard().routing_summary.exemplar_chain);
  },

  async getActiveRoutingChains() {
    return safeFetch('/routing/chains', {}, () => mockSimulator.getDashboard().routing_summary.chains);
  },

  async getRoadwayStatus() {
    return safeFetch('/routing/roadways', {}, () => mockSimulator.getDashboard().roads);
  },

  // Deterministic Resource Optimization & MILP Engine (Phase 7)
  async getOptimizationAllocation() {
    return safeFetch('/optimization/allocation', {}, () => ({
      status: 'OPTIMAL',
      solver: 'Google OR-Tools MILP',
      time_ms: 50.1,
      critical_patients_assigned: 31,
      unassigned_critical_count: 0,
    }));
  },

  async getResourceConflicts() {
    return safeFetch('/optimization/conflicts', {}, () => []);
  },

  async getResourceBottlenecks() {
    return safeFetch('/optimization/bottlenecks', {}, () => []);
  },

  async getResourceSummary() {
    return safeFetch('/optimization/summary', {}, () => mockSimulator.getDashboard().optimization_summary);
  },

  // Multi-Agent AI Perception Mesh (Phase 8)
  async getMultiAgentOverview() {
    return safeFetch('/agents/overview', {}, () => ({
      total_agents: 7,
      system_status: 'ACTIVE_STANDALONE',
    }));
  },

  async runIncidentAgent(text = null) {
    return safeFetch('/agents/incident/analyze', { method: 'POST' }, () => ({
      hazard_type: 'Anhydrous Ammonia Vapor Plume',
      perimeter_meters: 800.0,
      confidence: 0.96,
    }));
  },

  async runEvidenceAgent(description = null) {
    return safeFetch('/agents/evidence/interpret', { method: 'POST' }, () => ({
      entrapment_detected: true,
      hazmat_level: 'Level B Required',
      confidence: 0.94,
    }));
  },

  async runTriageReasoningAgent(report = null, vitals = {}) {
    return safeFetch('/agents/triage/reason', { method: 'POST' }, () => ({
      suggested_priority: 'P1_CRITICAL',
      primary_anatomical_trauma: 'Pelvic Crush Fracture & Retroperitoneal Bleed',
      clinical_reasoning: 'Severe hemorrhagic shock with unstable vitals.',
    }));
  },

  async runHospitalAgent(hospitalId = 'H-B') {
    return safeFetch(`/agents/hospital/${hospitalId}/evaluate`, { method: 'POST' }, () => ({
      saturation_status: 'SURGE_MONITORED',
      surgical_bottlenecks: ['Operating Suite 1 committed'],
    }));
  },

  async runResourceAgent() {
    return safeFetch('/agents/resource/assess', { method: 'POST' }, () => ({
      fleet_status: '100% UTILIZED',
      mutual_aid_recommended: true,
    }));
  },

  async runRoutingAgent(routeId = 'ROUTE-A') {
    return safeFetch(`/agents/routing/${routeId}/analyze`, { method: 'POST' }, () => ({
      route_status: 'BLOCKED',
      detour_guidance: 'Divert south via Grand Ave Corridor B contraflow.',
    }));
  },

  async getCommanderBriefing(intent = null) {
    const query = intent ? `?intent=${encodeURIComponent(intent)}` : '';
    return safeFetch(`/agents/command/briefing${query}`, { method: 'POST' }, () => ({
      action_directive: 'PRIORITIZE CRUSH TRAUMA V083 DISPATCH TO ST. JUDE',
      clinical_rationale: 'St. Jude possesses available surgical team and O- blood units.',
    }));
  },

  async runAgentPipeline(payload = {}) {
    return safeFetch('/agents/pipeline/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, () => ({ status: 'COMPLETED', pipeline_latency_ms: 120.4 }));
  },

  async getAgentPipelineStatus() {
    return safeFetch('/agents/pipeline/status', {}, () => ({ status: 'READY' }));
  },

  // Command Center & Hero Action Queue (Phase 9)
  async getCommandCenterQueue() {
    return safeFetch('/command-center/queue', {}, () => mockSimulator.getCommandCenter());
  },

  async getActionWhyBreakdown(actionId) {
    return safeFetch(`/command-center/actions/${encodeURIComponent(actionId)}/why`, {}, () => {
      const item = mockSimulator.getCommandCenter().queue.find((a) => a.id === actionId);
      return item?.why_explanation || {
        clinical_reasoning: 'Critical red-triage casualty requiring definitive trauma surgical resuscitation.',
        route_feasibility: 'Corridor B contraflow transit time is 13 minutes.',
        hospital_capacity: 'St. Jude Regional has open trauma surgery team and reserved blood units.',
        trade_off_analysis: 'Closest hospital (Metro Trauma) is at 100% saturation; routing to St. Jude avoids critical diversion.',
      };
    });
  },

  async executeCommandCenterAction(actionId) {
    return safeFetch(`/command-center/actions/${encodeURIComponent(actionId)}/execute`, {
      method: 'POST',
    }, () => mockSimulator.executeAction(actionId));
  },

  async executeAllCommandActions() {
    return safeFetch('/command-center/actions/execute-all', {
      method: 'POST',
    }, () => mockSimulator.executeAllActions());
  },

  // Continuous Replanning Engine (Phase 10)
  async getCurrentPlan() {
    return safeFetch('/replanning/current', {}, () => mockSimulator.getReplanning());
  },

  async getReplanningHistory() {
    return safeFetch('/replanning/history', {}, () => [mockSimulator.getReplanning()]);
  },

  async triggerReplan(payload = {}) {
    return safeFetch('/replanning/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, () => mockSimulator.getReplanning());
  },

  async triggerDemoReplanEvent() {
    return safeFetch('/replanning/demo-event', { method: 'POST' }, () => mockSimulator.getReplanning());
  },

  // Recommendations
  async getRecommendations() {
    return safeFetch('/recommendations', {}, () => mockSimulator.getDashboard().recommendations);
  },

  async executeRecommendation(id) {
    return safeFetch(`/recommendations/${id}/execute`, { method: 'POST' }, () => ({
      status: 'EXECUTED',
      recommendation_id: id,
    }));
  },

  // Incident Simulation Engine (Phase 3 & 11)
  async getSimulationStatus() {
    return safeFetch('/simulation/status', {}, () => mockSimulator.getSimulationStatus());
  },

  async simulateNextEvent() {
    return safeFetch('/simulation/next', { method: 'POST' }, () => mockSimulator.simulateNextEvent());
  },

  async resetSimulation() {
    return safeFetch('/simulation/reset', { method: 'POST' }, () => {
      mockSimulator.reset();
      return { status: 'RESET', message: 'Simulation reset to baseline' };
    });
  },

  async getSimulationSummary() {
    return safeFetch('/simulation/summary', {}, () => ({
      completed: mockSimulator.step >= 5,
      total_events: 5,
    }));
  },

  // Evaluation Metrics & Simulation Benchmark (Phase 14)
  async getEvaluationBenchmark() {
    return safeFetch('/evaluation/benchmark', {}, () => mockSimulator.getBenchmark());
  },

  async runEvaluationBenchmark() {
    return safeFetch('/evaluation/run', { method: 'POST' }, () => mockSimulator.getBenchmark());
  },
};
