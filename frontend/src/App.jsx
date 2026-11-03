import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import TacticalTopNav from './components/TacticalTopNav';
import IncidentBriefHazmatPanel from './components/IncidentBriefHazmatPanel';
import IncidentMap from './components/IncidentMap';
import CasualtyQueueTable from './components/CasualtyQueueTable';
import HospitalFleetPanel from './components/HospitalFleetPanel';
import CommandCenterHero from './components/CommandCenterHero';
import ContinuousReplanningBanner from './components/ContinuousReplanningBanner';
import SimulationEngineBar from './components/SimulationEngineBar';
import PriorityQueuePanel from './components/PriorityQueuePanel';
import AmbulanceRoutingPanel from './components/AmbulanceRoutingPanel';
import ResourceOptimizationPanel from './components/ResourceOptimizationPanel';
import AIAgentsPanel from './components/AIAgentsPanel';
import TimelinePanel from './components/TimelinePanel';
import HospitalMatchModal from './components/HospitalMatchModal';
import SimulationEvaluationModal from './components/SimulationEvaluationModal';
import CommandCenterWhyModal from './components/CommandCenterWhyModal';
import { ShieldAlert, Activity, RotateCcw, AlertTriangle, ChevronDown, ChevronUp, Zap } from 'lucide-react';

export default function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [matchModalVictimId, setMatchModalVictimId] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard'); // 'Dashboard' | 'GIS Map' | 'Triage' | 'Resources'
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showDirectivesDrawer, setShowDirectivesDrawer] = useState(false);

  // Simulation Engine State
  const [simulationStatus, setSimulationStatus] = useState(null);
  const [lastEventResult, setLastEventResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Load live state from FastAPI backend or seamless client-side simulator
  const loadDashboard = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const [dash, sim] = await Promise.all([
        api.getDashboardState(),
        api.getSimulationStatus ? api.getSimulationStatus().catch(() => null) : null,
      ]);
      setDashboardData(dash);
      if (sim) setSimulationStatus(sim);
    } catch (err) {
      console.warn('Dashboard fetch notice:', err.message);
      // Try fallback from API service
      try {
        const dash = await api.getDashboardState();
        setDashboardData(dash);
      } catch (fallbackErr) {
        setError(fallbackErr.message);
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(true);
  }, []);

  // Handle Step Advancement (5-Step Demo Scenario)
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
  // Loading State
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
          background: '#0B0E13',
          color: '#E2E8F0',
          gap: '14px',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <RotateCcw size={18} className="spin" color="#3B82F6" />
          <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.8px' }}>
            INITIALIZING LIFELINK TACTICAL C2 // BENGALURU SECTOR 7...
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#64748B' }}>
          Hydrating OR-Tools MILP solver engine, hospital inventories, and casualty priority queue.
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Fallback Error State
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
          background: '#0B0E13',
          color: '#E2E8F0',
          gap: '16px',
          padding: '24px',
        }}
      >
        <div
          style={{
            background: '#1F1416',
            border: '1px solid #7F1D1D',
            borderRadius: '6px',
            padding: '20px 28px',
            maxWidth: '520px',
            textAlign: 'center',
          }}
        >
          <AlertTriangle size={28} color="#EF4444" style={{ marginBottom: '10px' }} />
          <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#F87171', margin: '0 0 8px 0' }}>
            BACKEND TELEMETRY RECONNECTING
          </h2>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 16px 0', lineHeight: '1.4' }}>
            {error}
          </p>
          <button
            onClick={() => loadDashboard(true)}
            style={{
              background: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const {
    incident = {},
    sectors = [],
    hospitals = [],
    ambulances = [],
    roads = [],
    events = [],
    statistics = {},
    victims = [],
  } = dashboardData || {};

  const currentStep = simulationStatus?.current_event_index ?? 0;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0E13',
        color: '#E2E8F0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 1. Global Tactical Navigation Top Bar */}
      <TacticalTopNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenEvaluation={() => setShowEvaluationModal(true)}
        onResetScenario={handleResetSimulation}
        onRunDemo={handleSimulateNextEvent}
        onToggleDirectives={() => setShowDirectivesDrawer(!showDirectivesDrawer)}
        showDirectives={showDirectivesDrawer}
        isSimulating={isSimulating}
        simulationStep={currentStep}
      />

      {/* 2. Tactical Telemetry Ribbon */}
      <div
        style={{
          background: '#11151C',
          borderBottom: '1px solid #1E2532',
          padding: '4px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6', display: 'inline-block' }} />
          <span className="mono" style={{ color: '#94A3B8', fontWeight: '600' }}>
            BENGALURU CENTRAL CORRIDOR // ANHYDROUS AMMONIA PLUME // START TRIAGE + OR-TOOLS MILP ACTIVE
          </span>
        </div>

        <button
          onClick={() => setShowDirectivesDrawer(!showDirectivesDrawer)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: showDirectivesDrawer ? '#1E293B' : 'transparent',
            border: '1px solid #232B36',
            borderRadius: '4px',
            padding: '2px 8px',
            color: showDirectivesDrawer ? '#38BDF8' : '#8A99AD',
            fontSize: '10.5px',
            fontWeight: '600',
          }}
        >
          <Zap size={11} color={showDirectivesDrawer ? '#38BDF8' : '#64748B'} />
          <span>{showDirectivesDrawer ? 'Hide Directives & Replanning' : 'Show 10 Optimal Directives & Replanning Loop'}</span>
          {showDirectivesDrawer ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* 3. Commander Directives Drawer (Hero Action + Replanning Banner + Simulation Bar) */}
      {showDirectivesDrawer && (
        <div
          style={{
            background: '#131924',
            borderBottom: '1px solid #232B36',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <CommandCenterHero onActionExecuted={() => loadDashboard(false)} />
          <ContinuousReplanningBanner onPlanUpdated={() => loadDashboard(false)} />
          <SimulationEngineBar
            status={simulationStatus}
            lastEvent={lastEventResult}
            onSimulateNext={handleSimulateNextEvent}
            onReset={handleResetSimulation}
            disabled={isSimulating}
          />
        </div>
      )}

      {/* 4. MAIN OPERATIONAL WORKSPACE (Reference 4-Column Layout) */}
      {activeTab === 'Dashboard' && (
        <main
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1.05fr 1.65fr 1.35fr 1.15fr',
            gap: '10px',
            padding: '10px 14px',
            boxSizing: 'border-box',
            alignItems: 'stretch',
          }}
        >
          {/* Column 1: Left Rail (Incident Brief & HazMat) */}
          <IncidentBriefHazmatPanel incident={incident} />

          {/* Column 2: Center-Left (Tactical Map - Bengaluru) */}
          <IncidentMap
            incident={incident}
            victimZones={sectors}
            hospitals={hospitals}
            ambulances={ambulances}
            roadDisruptions={roads}
            onSelectEntity={setSelectedEntity}
          />

          {/* Column 3: Center-Right (Casualty Queue) */}
          <CasualtyQueueTable
            victims={victims}
            onSelectVictim={(v) => setSelectedEntity({ type: 'VICTIM', data: v })}
            onMatchHospital={(vId) => setMatchModalVictimId(vId)}
          />

          {/* Column 4: Right Rail (Hospital Status & Transport Fleet) */}
          <HospitalFleetPanel
            hospitals={hospitals}
            ambulances={ambulances}
            onSelectHospital={(h) => setSelectedEntity({ type: 'HOSPITAL', data: h })}
            onSelectAmbulance={(a) => setSelectedEntity({ type: 'AMBULANCE', data: a })}
          />
        </main>
      )}

      {/* Alternative View: Full Tactical GIS Map */}
      {activeTab === 'GIS Map' && (
        <main style={{ flex: 1, padding: '12px 16px' }}>
          <IncidentMap
            incident={incident}
            victimZones={sectors}
            hospitals={hospitals}
            ambulances={ambulances}
            roadDisruptions={roads}
            onSelectEntity={setSelectedEntity}
          />
        </main>
      )}

      {/* Alternative View: Triage Deep-Dive */}
      {activeTab === 'Triage' && (
        <main style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <PriorityQueuePanel
            triageSummary={dashboardData?.triage_summary}
            onMatchHospital={(vId) => setMatchModalVictimId(vId)}
            onSelectVictim={(v) => setSelectedEntity({ type: 'VICTIM', data: v })}
          />
        </main>
      )}

      {/* Alternative View: Resources Grid */}
      {activeTab === 'Resources' && (
        <main style={{ flex: 1, padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <ResourceOptimizationPanel onRefresh={() => loadDashboard(false)} />
          <AmbulanceRoutingPanel
            routingSummary={dashboardData?.routing_summary}
            onRefresh={() => loadDashboard(false)}
          />
        </main>
      )}

      {/* Tactical Clinical Decision Support Notice Footer */}
      <footer
        style={{
          padding: '8px 16px',
          fontSize: '10.5px',
          color: '#64748B',
          borderTop: '1px solid #1E2532',
          background: '#0B0E13',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div className="mono">
          LIFELINK C2 // Operational Doctrine: <strong>CHAOS &rarr; INTELLIGENCE &rarr; ACTION</strong> // Bengaluru Sector 7
        </div>
        <div style={{ color: '#8A99AD' }}>
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

      {/* Phase 14 Evaluation Metrics & Benchmark Modal */}
      {showEvaluationModal && (
        <SimulationEvaluationModal onClose={() => setShowEvaluationModal(false)} />
      )}

      {/* Phase 15 Explainability Why Modal */}
      {selectedEntity?.type === 'WHY' && (
        <CommandCenterWhyModal
          action={selectedEntity.data}
          onClose={() => setSelectedEntity(null)}
        />
      )}
    </div>
  );
}
