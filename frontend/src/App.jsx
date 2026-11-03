import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import Header from './components/Header';
import TopStats from './components/TopStats';
import IncidentMap from './components/IncidentMap';
import VictimZonesPanel from './components/VictimZonesPanel';
import CommandPanel from './components/CommandPanel';
import TimelinePanel from './components/TimelinePanel';
import SimulationEngineBar from './components/SimulationEngineBar';
import PriorityQueuePanel from './components/PriorityQueuePanel';
import AmbulanceRoutingPanel from './components/AmbulanceRoutingPanel';
import ResourceOptimizationPanel from './components/ResourceOptimizationPanel';
import AIAgentsPanel from './components/AIAgentsPanel';
import CommandCenterHero from './components/CommandCenterHero';
import ContinuousReplanningBanner from './components/ContinuousReplanningBanner';
import HospitalsPanel from './components/HospitalsPanel';
import AmbulancesPanel from './components/AmbulancesPanel';
import HospitalMatchModal from './components/HospitalMatchModal';
import SimulationEvaluationModal from './components/SimulationEvaluationModal';
import TacticalTelemetryPanel from './components/TacticalTelemetryPanel';
import {
  ShieldAlert,
  Zap,
  RotateCcw,
  Activity,
  Layers,
  Terminal,
  AlertTriangle,
  Radio,
  Server,
  RefreshCw,
} from 'lucide-react';

export default function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [subsystemTab, setSubsystemTab] = useState('TRIAGE');
  const [matchModalVictimId, setMatchModalVictimId] = useState(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);

  // Simulation Engine State
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

  // -------------------------------------------------------------
  // Visual Loading State: Tactical Boot HUD
  // -------------------------------------------------------------
  if (loading && !dashboardData) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          color: '#f8fafc',
          gap: '20px',
          padding: '24px',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 35px rgba(239, 68, 68, 0.5)',
            fontSize: '32px',
          }}
        >
          ⚡
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '0.8px', color: '#fff' }}>
            HYDRATING LIFELINK INCIDENT COMMAND ENGINE...
          </h2>
          <p className="mono" style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Connecting to FastAPI Core @ http://127.0.0.1:8000/api/v1/dashboard
          </p>
        </div>

        {/* Step checklist */}
        <div
          className="mono"
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '14px 20px',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            width: '100%',
            maxWidth: '480px',
          }}
        >
          <div style={{ color: '#38bdf8' }}>[✓] Spatial Road Network & Sector Coordinates Ingested</div>
          <div style={{ color: '#38bdf8' }}>[✓] Deterministic Triage Scoring Models Ready</div>
          <div style={{ color: '#38bdf8' }}>[✓] Google OR-Tools MILP Solver Initialized</div>
          <div style={{ color: '#a78bfa' }}>[✓] Continuous Replanning Loop Active (PLAN v12)</div>
          <div style={{ color: '#4ade80' }}>[✓] Multi-Agent Inference Pipeline Synchronized</div>
        </div>

        <div className="live-indicator" style={{ width: '10px', height: '10px', marginTop: '6px' }} />
      </div>
    );
  }

  // -------------------------------------------------------------
  // Visual Error State: Defense Connection Alert
  // -------------------------------------------------------------
  if (error && !dashboardData) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--triage-red)',
          gap: '20px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '14px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AlertTriangle size={32} color="#ef4444" />
        </div>

        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#f87171' }}>
            BACKEND CONNECTION DISRUPTED
          </h2>
          <p className="mono" style={{ color: 'var(--text-secondary)', maxWidth: '520px', marginTop: '6px', fontSize: '12px' }}>
            {error}
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Ensure FastAPI backend is running via: <code style={{ color: '#38bdf8' }}>python -m uvicorn backend.app.main:app --port 8000</code>
          </p>
        </div>

        <button
          onClick={() => loadDashboard(true)}
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#fff',
            border: 'none',
            padding: '10px 22px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '800',
            fontSize: '12px',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <RefreshCw size={14} />
          <span>RETRY BACKEND CONNECTION</span>
        </button>
      </div>
    );
  }

  const {
    incident,
    statistics,
    hospitals = [],
    ambulances = [],
    sectors = [],
    roads = [],
    events = [],
    recommendations = [],
  } = dashboardData || {};

  return (
    <div style={{ maxWidth: '1720px', margin: '0 auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Header with simulation banner, brand, doctrine, and incident title */}
      <Header incident={incident} onOpenEvaluation={() => setShowEvaluationModal(true)} />

      {/* 2. Killer Demo Ribbon (Phase 11 One-Click Automated Simulation) */}
      <SimulationEngineBar
        simulationStatus={simulationStatus}
        lastEventResult={lastEventResult}
        setLastEventResult={setLastEventResult}
        onSimulateNext={handleSimulateNextEvent}
        onResetSimulation={handleResetSimulation}
        isSimulating={isSimulating}
        onDismissEventCard={() => setLastEventResult(null)}
        onRefreshDashboard={() => loadDashboard(false)}
      />

      {/* 3. Top KPI Statistics Row (Dynamically changes with each simulation event) */}
      <TopStats stats={statistics} />

      {/* Entity Inspection Alert Banner */}
      {selectedEntity && (
        <div
          className="glass-panel"
          style={{
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.45)',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.15)',
            borderRadius: '8px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: '800',
                background: 'var(--accent-blue)',
                color: '#fff',
                padding: '3px 8px',
                borderRadius: '4px',
                letterSpacing: '0.6px',
              }}
            >
              INSPECTING {selectedEntity.type}
            </span>
            <strong style={{ color: '#fff', fontSize: '14px' }}>
              {selectedEntity.data.name ||
                selectedEntity.data.callsign ||
                selectedEntity.data.victim_id ||
                selectedEntity.data.id}
            </strong>
            <span style={{ color: 'var(--text-secondary)' }}>
              {selectedEntity.data.description ||
                selectedEntity.data.assignment_description ||
                selectedEntity.data.reason ||
                `${selectedEntity.data.icu} ICU beds open`}
            </span>
            {selectedEntity.type === 'VICTIM' && (
              <button
                onClick={() => setMatchModalVictimId(selectedEntity.data.victim_id || selectedEntity.data.id)}
                style={{
                  background: 'var(--triage-green)',
                  color: '#070a12',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '5px',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  marginLeft: '8px',
                  letterSpacing: '0.4px',
                }}
              >
                Where should this victim go? (WHY?)
              </button>
            )}
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

      {/* View Filter Toggles (Presentation Navigation) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: '🎯 Tactical Command Overview' },
            { id: 'COMMAND_CENTER', label: '🔴 Command Action Queue (Hero)' },
            { id: 'REPLANNING', label: '🔄 Continuous Replanning (Loop)' },
            { id: 'AGENTS', label: '🤖 AI Agents (Gemini Cognition)' },
            { id: 'OPTIMIZATION', label: '⚡ Resource Optimization (OR-Tools)' },
            { id: 'TRIAGE', label: `🩺 Priority Queue (${dashboardData?.triage_summary?.total_assessed || 214})` },
            { id: 'ROUTING', label: '🛣️ Ambulance Routing & Detours' },
            { id: 'RESOURCES', label: '🏥 Hospital & EMS Grid' },
            { id: 'TIMELINE', label: `📜 Timeline (${events.length} Events)` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'rgba(56, 189, 248, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                color: activeTab === tab.id ? '#38bdf8' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === tab.id ? 'rgba(56, 189, 248, 0.5)' : 'var(--border-color)'}`,
                padding: '7px 15px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                letterSpacing: '0.4px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          CRISIS DEFICIT: <strong style={{ color: '#ef4444' }}>{statistics?.critical || 31} CRITICAL</strong> vs{' '}
          <strong style={{ color: '#f59e0b' }}>{statistics?.total_icu_beds || 4} ICU BEDS</strong>
        </div>
      </div>

      {/* Main Command Workspace (Default Presentation View) */}
      {activeTab === 'ALL' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Phase 9: THE DOMINANT CENTERPIECE — Command Center Hero Action Queue */}
          <CommandCenterHero onActionExecuted={() => loadDashboard(false)} />

          {/* Phase 10: Continuous Replanning Engine Ribbon */}
          <ContinuousReplanningBanner onPlanUpdated={() => loadDashboard(false)} />

          {/* Tactical Operations Grid: Left (Map + Sectors) vs Right (Hospitals + Fleet + Timeline) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '16px', alignItems: 'start' }}>
            {/* Left Column: Live Tactical Map + Casualty Sectors */}
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

              <TacticalTelemetryPanel />
            </div>

            {/* Right Column: Receiving Hospitals & Fleet Status & Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <HospitalsPanel
                  hospitals={hospitals}
                  onSelectHospital={(hosp) => setSelectedEntity({ type: 'HOSPITAL', data: hosp })}
                />

                <AmbulancesPanel
                  ambulances={ambulances}
                  onSelectAmbulance={(amb) => setSelectedEntity({ type: 'AMBULANCE', data: amb })}
                />
              </div>

              <TimelinePanel timeline={events} />
            </div>
          </div>

          {/* Subsystem Intelligence Drawer / Deep-Dive Navigator */}
          <div
            className="glass-panel"
            style={{
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="var(--accent-cyan-bright)" />
                <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
                  INTELLIGENCE SUBSYSTEMS EXPLORER
                </h3>
              </div>

              {/* Subsystem Tabs */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: 'TRIAGE', label: 'Triage Priority Queue (Phase 4)' },
                  { id: 'ROUTING', label: 'Ambulance Routing (Phase 6)' },
                  { id: 'OPTIMIZATION', label: 'OR-Tools Optimization (Phase 7)' },
                  { id: 'AGENTS', label: 'Multi-Agent AI Hub (Phase 8)' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSubsystemTab(st.id)}
                    style={{
                      background: subsystemTab === st.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      color: subsystemTab === st.id ? '#38bdf8' : 'var(--text-secondary)',
                      border: `1px solid ${subsystemTab === st.id ? 'rgba(56, 189, 248, 0.45)' : 'var(--border-color)'}`,
                      padding: '5px 12px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Subsystem Rendering */}
            {subsystemTab === 'TRIAGE' && (
              <PriorityQueuePanel
                triageSummary={dashboardData?.triage_summary}
                onSelectVictim={(v) => setSelectedEntity({ type: 'VICTIM', data: v })}
              />
            )}

            {subsystemTab === 'ROUTING' && (
              <AmbulanceRoutingPanel
                routingSummary={dashboardData?.routing_summary}
                onRefresh={() => loadDashboard(false)}
              />
            )}

            {subsystemTab === 'OPTIMIZATION' && (
              <ResourceOptimizationPanel onRefresh={() => loadDashboard(false)} />
            )}

            {subsystemTab === 'AGENTS' && (
              <AIAgentsPanel />
            )}
          </div>
        </div>
      )}

      {/* Dedicated Workspace: Command Center (Hero Action Queue) */}
      {activeTab === 'COMMAND_CENTER' && (
        <CommandCenterHero onActionExecuted={() => loadDashboard(false)} />
      )}

      {/* Dedicated Workspace: Continuous Replanning Loop */}
      {activeTab === 'REPLANNING' && (
        <ContinuousReplanningBanner onPlanUpdated={() => loadDashboard(false)} />
      )}

      {/* Dedicated Workspace: AI Agents (Gemini Multi-Agent System) */}
      {activeTab === 'AGENTS' && <AIAgentsPanel />}

      {/* Dedicated Workspace: Resource Optimization (OR-Tools) */}
      {activeTab === 'OPTIMIZATION' && (
        <ResourceOptimizationPanel onRefresh={() => loadDashboard(false)} />
      )}

      {/* Dedicated Workspace: Triage Priority Queue */}
      {activeTab === 'TRIAGE' && (
        <PriorityQueuePanel
          triageSummary={dashboardData?.triage_summary}
          onSelectVictim={(v) => setSelectedEntity({ type: 'VICTIM', data: v })}
        />
      )}

      {/* Dedicated Workspace: Ambulance Routing & Road Detours */}
      {activeTab === 'ROUTING' && (
        <AmbulanceRoutingPanel
          routingSummary={dashboardData?.routing_summary}
          onRefresh={() => loadDashboard(false)}
        />
      )}

      {/* Dedicated Workspace: Hospital & Ambulance Fleet Grid */}
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

      {/* Dedicated Workspace: Incident Operations Timeline */}
      {activeTab === 'TIMELINE' && <TimelinePanel timeline={events} />}

      {/* Tactical Footer with Clinical Decision Support Notice */}
      <footer
        style={{
          padding: '16px 20px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-color)',
          marginTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          background: 'rgba(10, 14, 26, 0.7)',
          borderRadius: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span className="mono">
            LIFELINK Command Center • Operational Doctrine: <strong>CHAOS → INTELLIGENCE → ACTION</strong>
          </span>
          <span className="mono" style={{ color: '#38bdf8' }}>
            Deterministic Triage & Matching + Google OR-Tools MILP + Gemini AI Agents
          </span>
          <span className="mono">
            PLAN v12 • Continuous Closed-Loop Replanning Active
          </span>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: '8px',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '11px',
            lineHeight: 1.4,
          }}
        >
          <strong>DEMO / SIMULATION:</strong> LIFELINK provides decision-support recommendations using synthetic data. It does not provide medical diagnosis, replace emergency professionals, or autonomously make clinical decisions.
        </div>
      </footer>

      {/* Phase 5 Global "WHY?" Hospital Matching Modal */}
      {matchModalVictimId && (
        <HospitalMatchModal
          victimId={matchModalVictimId}
          onClose={() => setMatchModalVictimId(null)}
          onHospitalAssigned={() => loadDashboard(false)}
        />
      )}

      {/* Phase 14 Evaluation Metrics & Simulation Benchmark Modal */}
      {showEvaluationModal && (
        <SimulationEvaluationModal onClose={() => setShowEvaluationModal(false)} />
      )}
    </div>
  );
}
