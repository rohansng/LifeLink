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

  // Recommendations
  async getRecommendations() {
    const res = await fetch(`${API_BASE}/recommendations`);
    return handleResponse(res);
  },

  async executeRecommendation(id) {
    const res = await fetch(`${API_BASE}/recommendations/${id}/execute`, { method: 'POST' });
    return handleResponse(res);
  },
};
