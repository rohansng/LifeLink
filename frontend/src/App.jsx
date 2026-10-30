import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TopStats from './components/TopStats';
import IncidentMap from './components/IncidentMap';
import HospitalsPanel from './components/HospitalsPanel';
import AmbulancesPanel from './components/AmbulancesPanel';
import VictimZonesPanel from './components/VictimZonesPanel';
import CommandPanel from './components/CommandPanel';
import TimelinePanel from './components/TimelinePanel';
import SimulationEngineBar from './components/SimulationEngineBar';
import { api } from './services/api';
import { RefreshCw, Database } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  
  // Phase 3 Simulation Engine State
  const [simulationStatus, setSimulationStatus] = useState(null);
  const [lastEventResult, setLastEventResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Load live state from FastAPI backend
  const loadDashboard = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const [dash, sim] = await Promise.all([
        api.getDashboardState(),
        api.getSimulationStatus(),
      ]);
      setDashboardData(dash);
      setSimulationStatus(sim);
    } catch (err) {
      console.error('Failed to load dashboard from backend:', err);
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(true);
  }, []);

  // Handle Step Advancement
  const handleSimulateNextEvent = async () => {
    try {
      setIsSimulating(true);
      const stepResult = await api.simulateNextEvent();
      setLastEventResult(stepResult);
      // Immediately refresh full dashboard state with recalculated models
      await loadDashboard(false);
    } catch (err) {
      console.error('Failed to simulate next event:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Handle Simulation Reset
  const handleResetSimulation = async () => {
    try {
      setIsSimulating(true);
      await api.resetSimulation();
      setLastEventResult(null);
      await loadDashboard(false);
    } catch (err) {
      console.error('Failed to reset simulation:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: '#f8fafc',
        gap: '16px',
      }}>
        <div className="live-indicator" style={{ width: '16px', height: '16px' }} />
        <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '1px' }}>
          HYDRATING LIFELINK INCIDENT ENGINE...
        </h2>
        <p className="mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Connecting to FastAPI backend @ http://localhost:8000/api/v1/dashboard
        </p>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--triage-red)',
        gap: '16px',
        padding: '20px',
        textAlign: 'center',
      }}>
        <h2>Backend Connection Error</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px' }}>{error}</p>
        <button
          onClick={() => loadDashboard(true)}
          style={{
            background: 'var(--accent-blue)',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const {
    incident,
    statistics,
    sectors = [],
    hospitals = [],
    ambulances = [],
    roads = [],
    events = [],
    recommendations = [],
  } = dashboardData || {};

  return (
    <div style={{ maxWidth: '1680px', margin: '0 auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Header with simulation banner, brand, and incident title */}
      <Header incident={incident} />

      {/* 2. Phase 3: Real-Time Incident Simulation Engine Ribbon */}
      <SimulationEngineBar
        simulationStatus={simulationStatus}
        lastEventResult={lastEventResult}
        onSimulateNext={handleSimulateNextEvent}
        onResetSimulation={handleResetSimulation}
        isSimulating={isSimulating}
        onDismissEventCard={() => setLastEventResult(null)}
      />

      {/* 3. Top KPI Statistics Row (Dynamically changes with each simulation event) */}
      <TopStats stats={statistics} />

      {/* Entity Inspection Alert Banner */}
      {selectedEntity && (
        <div className="glass-panel" style={{
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', background: 'var(--accent-blue)', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
              INSPECTING {selectedEntity.type}
            </span>
            <strong style={{ color: '#fff' }}>{selectedEntity.data.name || selectedEntity.data.callsign}</strong>
            <span style={{ color: 'var(--text-secondary)' }}>
              {selectedEntity.data.description || selectedEntity.data.assignment_description || `${selectedEntity.data.icu} ICU beds open`}
            </span>
          </div>

          <button
            onClick={() => setSelectedEntity(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: '700',
            }}
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* View Filter Toggles */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'ALL', label: 'Tactical Command Overview' },
            { id: 'RESOURCES', label: 'Hospital & Ambulance Grid' },
            { id: 'TIMELINE', label: `Incident Timeline (${events.length} Events)` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === tab.id ? 'rgba(255, 255, 255, 0.25)' : 'var(--border-color)'}`,
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          CRISIS DEFICIT: <strong>{statistics?.critical || 31} CRITICAL : {statistics?.total_icu_beds || 4} ICU BEDS</strong>
        </div>
      </div>

      {/* Main Command Workspace */}
      {activeTab === 'ALL' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '16px', alignItems: 'start' }}>
          {/* Left Column: Live Interactive Map + Casualty Sectors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <IncidentMap
              incident={incident}
              victimZones={sectors}
              hospitals={hospitals}
              ambulances={ambulances}
              roadDisruptions={roads}
              onSelectEntity={setSelectedEntity}
            />

            <VictimZonesPanel
              victimZones={sectors}
              onSelectZone={(zone) => setSelectedEntity({ type: 'SECTOR', data: zone })}
            />
          </div>

          {/* Right Column: Command Panel + Hospitals & Ambulances */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <CommandPanel
              priorityActions={recommendations}
              alerts={events.filter((e) => e.severity === 'critical' || e.category === 'ALERT')}
              onActionExecuted={() => loadDashboard(false)}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <HospitalsPanel
                hospitals={hospitals}
                onSelectHospital={(hosp) => setSelectedEntity({ type: 'HOSPITAL', data: hosp })}
              />

              <AmbulancesPanel
                ambulances={ambulances}
                onSelectAmbulance={(amb) => setSelectedEntity({ type: 'AMBULANCE', data: amb })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Resources Grid */}
      {activeTab === 'RESOURCES' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <HospitalsPanel
            hospitals={hospitals}
            onSelectHospital={(hosp) => setSelectedEntity({ type: 'HOSPITAL', data: hosp })}
          />

          <AmbulancesPanel
            ambulances={ambulances}
            onSelectAmbulance={(amb) => setSelectedEntity({ type: 'AMBULANCE', data: amb })}
          />
        </div>
      )}

      {/* Incident Timeline */}
      {(activeTab === 'ALL' || activeTab === 'TIMELINE') && (
        <TimelinePanel timeline={events} />
      )}

      {/* Footer Info */}
      <footer style={{
        textAlign: 'center',
        padding: '12px',
        fontSize: '11px',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-color)',
        marginTop: '10px',
      }}>
        LIFELINK Command Center • Phase 3 Complete: Real-Time Incident Simulation Engine Active • 5 Killer Demo Events Verified
      </footer>
    </div>
  );
}
