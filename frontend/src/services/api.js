/**
 * API Service for LifeLink Frontend
 * Connects frontend dashboard directly to FastAPI backend endpoints.
 */

const API_BASE = 'http://localhost:8000/api/v1';

async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }
  return response.json();
}

export const api = {
  // Consolidated Dashboard State
  async getDashboardState() {
    const res = await fetch(`${API_BASE}/dashboard`);
    return handleResponse(res);
  },

  // Reset to initial Train Derailment seed data
  async resetScenario() {
    const res = await fetch(`${API_BASE}/dashboard/reset`, { method: 'POST' });
    return handleResponse(res);
  },

  // Incident & Statistics
  async getIncident() {
    const res = await fetch(`${API_BASE}/incidents`);
    return handleResponse(res);
  },

  async getIncidentStatistics() {
    const res = await fetch(`${API_BASE}/incidents/statistics`);
    return handleResponse(res);
  },

  // Victims
  async getVictims(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/victims?${query}` : `${API_BASE}/victims`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async getVictim(id) {
    const res = await fetch(`${API_BASE}/victims/${id}`);
    return handleResponse(res);
  },

  // Ambulances
  async getAmbulances() {
    const res = await fetch(`${API_BASE}/ambulances`);
    return handleResponse(res);
  },

  async getAmbulance(id) {
    const res = await fetch(`${API_BASE}/ambulances/${id}`);
    return handleResponse(res);
  },

  // Hospitals
  async getHospitals() {
    const res = await fetch(`${API_BASE}/hospitals`);
    return handleResponse(res);
  },

  async getHospital(id) {
    const res = await fetch(`${API_BASE}/hospitals/${id}`);
    return handleResponse(res);
  },

  // Resources
  async getResources() {
    const res = await fetch(`${API_BASE}/resources`);
    return handleResponse(res);
  },

  // Roads
  async getRoads() {
    const res = await fetch(`${API_BASE}/roads`);
    return handleResponse(res);
  },

  // Responders
  async getResponders() {
    const res = await fetch(`${API_BASE}/responders`);
    return handleResponse(res);
  },

  // Events / Timeline
  async getEvents() {
    const res = await fetch(`${API_BASE}/events`);
    return handleResponse(res);
  },

  // Deterministic Triage & Priority Engine (Phase 4)
  async getTriageQueue(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/triage/queue?${query}` : `${API_BASE}/triage/queue`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async getVictimPriority(id) {
    const res = await fetch(`${API_BASE}/triage/queue/${id}`);
    return handleResponse(res);
  },

  // Deterministic Hospital Matching Engine (Phase 5)
  async getHospitalMatch(victimId) {
    const res = await fetch(`${API_BASE}/matching/hospital/${victimId}`);
    return handleResponse(res);
  },

  async getHospitalMatchesQueue(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/matching/queue?${query}` : `${API_BASE}/matching/queue`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async assignHospital(victimId, hospitalId = null) {
    const url = hospitalId
      ? `${API_BASE}/matching/hospital/${victimId}/assign?hospital_id=${encodeURIComponent(hospitalId)}`
      : `${API_BASE}/matching/hospital/${victimId}/assign`;
    const res = await fetch(url, { method: 'POST' });
    return handleResponse(res);
  },

  // Deterministic Ambulance Assignment & Routing Engine (Phase 6)
  async getDispatchChain(victimId) {
    const res = await fetch(`${API_BASE}/routing/chain/${victimId}`);
    return handleResponse(res);
  },

  async getDispatchChains() {
    const res = await fetch(`${API_BASE}/routing/chains`);
    return handleResponse(res);
  },

  async triggerRoadBlock(roadId = 'ROAD-01', status = 'closed', reason = 'Overturned fuel tanker & structural collapse') {
    const res = await fetch(`${API_BASE}/routing/road-block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ road_id: roadId, status, reason, detour_penalty_minutes: 14.0 }),
    });
    return handleResponse(res);
  },

  async clearRoadBlock(roadId = 'ROAD-01') {
    const res = await fetch(`${API_BASE}/routing/road-unblock?road_id=${encodeURIComponent(roadId)}`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  // Resource Optimization Engine (Phase 7 - Google OR-Tools)
  async solveResourceOptimization(maxSeconds = 3.0) {
    const res = await fetch(`${API_BASE}/optimization/solve?max_seconds=${maxSeconds}`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async getTrackedResources() {
    const res = await fetch(`${API_BASE}/optimization/resources`);
    return handleResponse(res);
  },

  // Modular AI Agents (Phase 8 - Gemini & Multi-Agent Architecture)
  async processIncidentReport(report) {
    const res = await fetch(`${API_BASE}/agents/incident/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report }),
    });
    return handleResponse(res);
  },

  async interpretVisualEvidence(image_description, metadata = null) {
    const res = await fetch(`${API_BASE}/agents/evidence/interpret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_description, metadata }),
    });
    return handleResponse(res);
  },

  async reasonCasualtyTriage(notes, victim_id = null, vitals = null) {
    const res = await fetch(`${API_BASE}/agents/triage/reason`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, victim_id, vitals }),
    });
    return handleResponse(res);
  },

  async getCommanderBriefing(intent = null) {
    const query = intent ? `?intent=${encodeURIComponent(intent)}` : '';
    const res = await fetch(`${API_BASE}/agents/command/briefing${query}`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async runAgentPipeline(payload = {}) {
    const res = await fetch(`${API_BASE}/agents/pipeline/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getAgentPipelineStatus() {
    const res = await fetch(`${API_BASE}/agents/pipeline/status`);
    return handleResponse(res);
  },

  // Command Center & Hero Action Queue (Phase 9)
  async getCommandCenterQueue() {
    const res = await fetch(`${API_BASE}/command-center/queue`);
    return handleResponse(res);
  },

  async getActionWhyBreakdown(actionId) {
    const res = await fetch(`${API_BASE}/command-center/actions/${encodeURIComponent(actionId)}/why`);
    return handleResponse(res);
  },

  async executeCommandCenterAction(actionId) {
    const res = await fetch(`${API_BASE}/command-center/actions/${encodeURIComponent(actionId)}/execute`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async executeAllCommandActions() {
    const res = await fetch(`${API_BASE}/command-center/actions/execute-all`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  // Continuous Replanning Engine (Phase 10)
  async getCurrentPlan() {
    const res = await fetch(`${API_BASE}/replanning/current`);
    return handleResponse(res);
  },

  async getReplanningHistory() {
    const res = await fetch(`${API_BASE}/replanning/history`);
    return handleResponse(res);
  },

  async triggerReplan(payload = {}) {
    const res = await fetch(`${API_BASE}/replanning/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async triggerDemoReplanEvent() {
    const res = await fetch(`${API_BASE}/replanning/demo-event`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  // Recommendations
  async getRecommendations() {
    const res = await fetch(`${API_BASE}/recommendations`);
    return handleResponse(res);
  },

  async executeRecommendation(id) {
    const res = await fetch(`${API_BASE}/recommendations/${id}/execute`, { method: 'POST' });
    return handleResponse(res);
  },

  // Incident Simulation Engine (Phase 3)
  async getSimulationStatus() {
    const res = await fetch(`${API_BASE}/simulation/status`);
    return handleResponse(res);
  },

  async simulateNextEvent() {
    const res = await fetch(`${API_BASE}/simulation/next`, { method: 'POST' });
    return handleResponse(res);
  },

  async resetSimulation() {
    const res = await fetch(`${API_BASE}/simulation/reset`, { method: 'POST' });
    return handleResponse(res);
  },

  async getSimulationSummary() {
    const res = await fetch(`${API_BASE}/simulation/summary`);
    return handleResponse(res);
  },

  // Evaluation Metrics & Simulation Benchmark (Phase 14)
  async getEvaluationBenchmark() {
    const res = await fetch(`${API_BASE}/evaluation/benchmark`);
    return handleResponse(res);
  },

  async runEvaluationBenchmark() {
    const res = await fetch(`${API_BASE}/evaluation/run`, { method: 'POST' });
    return handleResponse(res);
  },
};
