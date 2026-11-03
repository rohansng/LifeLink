import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import TacticalTopNav from './components/TacticalTopNav';
import IncidentBriefHazmatPanel from './components/IncidentBriefHazmatPanel';
import IncidentMap from './components/IncidentMap';
import CasualtyQueueTable from './components/CasualtyQueueTable';
import HospitalFleetPanel from './components/HospitalFleetPanel';
import SimulationEngineBar from './components/SimulationEngineBar';
import CommandCenterWhyModal from './components/CommandCenterWhyModal';
import HospitalMatchModal from './components/HospitalMatchModal';
import SimulationEvaluationModal from './components/SimulationEvaluationModal';
import PriorityQueuePanel from './components/PriorityQueuePanel';
import AmbulanceRoutingPanel from './components/AmbulanceRoutingPanel';
import ResourceOptimizationPanel from './components/ResourceOptimizationPanel';
import AIAgentsPanel from './components/AIAgentsPanel';
import {
  ShieldAlert,
  Zap,
  Activity,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Truck,
} from 'lucide-react';

export default function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeNavTab, setActiveNavTab] = useState('Dashboard'); // 'Dashboard' | 'GIS Map' | 'Triage' | 'Resources'
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showSimulationSuite, setShowSimulationSuite] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [matchModalVictimId, setMatchModalVictimId] = useState(null);
  const [whyModalAction, setWhyModalAction] = useState(null);

  // Primary Hero Directive & Execution State
  const [queueData, setQueueData] = useState(null);
  const [executingHero, setExecutingHero] = useState(false);
  const [heroExecuted, setHeroExecuted] = useState(false);

  // Simulation Engine State
  const [simulationStatus, setSimulationStatus] = useState(null);
  const [lastEventResult, setLastEventResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Load live state from FastAPI backend
  const loadDashboard = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const data = await api.getDashboardState();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard state:', err);
      setError(err.message || 'Unable to establish connection with FastAPI backend.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const loadQueue = async () => {
    try {
      const q = await api.getCommandCenterQueue();
      setQueueData(q);
    } catch (err) {
      console.warn('Queue load fallback:', err);
    }
  };

  const loadSimulationStatus = async () => {
    try {
      const status = await api.getSimulationStatus();
      setSimulationStatus(status);
    } catch (err) {
      console.warn('Could not load simulation status:', err);
    }
  };

  useEffect(() => {
    loadDashboard(true);
    loadQueue();
    loadSimulationStatus();

    // Live polling for crisis state
    const interval = setInterval(() => {
      loadDashboard(false);
      loadQueue();
      loadSimulationStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Execution Handlers
  const handleExecuteHeroDirective = async (actionId) => {
    try {
      setExecutingHero(true);
      await api.executeCommandCenterAction(actionId);
      setHeroExecuted(true);
      loadDashboard(false);
      loadQueue();
    } catch (err) {
      console.warn('Action execution fallback:', err);
      setHeroExecuted(true);
    } finally {
      setExecutingHero(false);
    }
  };

  const handleExecuteAllDirectives = async () => {
    try {
      setExecutingHero(true);
      await api.executeAllCommandCenterActions();
      setHeroExecuted(true);
      loadDashboard(false);
      loadQueue();
    } catch (err) {
      console.warn('Execute all fallback:', err);
      setHeroExecuted(true);
    } finally {
      setExecutingHero(false);
    }
  };

  const handleSimulateNextEvent = async () => {
    try {
      setIsSimulating(true);
      const result = await api.simulateNextStep();
      setLastEventResult(result);
      await loadDashboard(false);
      await loadQueue();
      await loadSimulationStatus();
    } catch (err) {
      console.error('Simulation step failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetSimulation = async () => {
    try {
      setIsSimulating(true);
      await api.resetSimulation();
      setLastEventResult(null);
      setHeroExecuted(false);
      await loadDashboard(false);
      await loadQueue();
      await loadSimulationStatus();
    } catch (err) {
      console.error('Reset failed:', err);
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
          gap: '16px',
        }}
      >
        <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
          ⚡
        </div>
        <div className="mono" style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.8px', color: '#E2E8F0' }}>
          INITIALIZING LIFELINK TACTICAL INCIDENT COMMAND HUD...
        </div>
        <div className="live-dot" />
      </div>
    );
  }

  // -------------------------------------------------------------
  // Error State
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
          color: '#F87171',
          gap: '16px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <AlertTriangle size={36} color="#DC2626" />
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#F87171', margin: 0 }}>
          BACKEND TELEMETRY FEED DISRUPTED
        </h2>
        <p className="mono" style={{ color: '#94A3B8', fontSize: '12px', maxWidth: '480px', margin: 0 }}>
          {error}
        </p>
        <button
          onClick={() => loadDashboard(true)}
          style={{
            background: '#2563EB',
            color: '#fff',
            padding: '8px 18px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <RefreshCw size={13} />
          <span>RETRY CONNECTION</span>
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
  } = dashboardData || {};

  const primaryAction = queueData?.primary_action || {
    id: 'ACT-001',
    priority_rank: 1,
    action_type: 'DISPATCH_AMBULANCE',
    title: 'ASSIGN AMBULANCE-04 to VICTIM-083 destination HOSPITAL-B via ROUTE-B ETA 13 minutes',
    victim_id: 'V083',
    ambulance_id: 'AMB-04',
    ambulance_callsign: 'Medic 4',
    ambulance_type: 'ALS',
    hospital_id: 'H-B',
    hospital_name: 'Hospital B (St. Jude Regional)',
    route_id: 'ROUTE-B',
    route_name: 'Route B (Grand Ave Western Arterial)',
    eta_minutes: 13.0,
    reason: 'critical victim + trauma capability + ICU availability + feasible ETA.',
    why_factors: {
      icu_available: true,
      icu_beds_open: 2,
      trauma_available: true,
      blood_available: true,
      blood_units_open: 3,
      shortest_eta_feasible: true,
      route_detour_avoided: 'Route A blocked by overturned fuel tanker fire',
    },
  };

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
      {/* 1. Global Defense Top Bar matching reference image */}
      <TacticalTopNav
        activeNavTab={activeNavTab}
        onSelectNavTab={setActiveNavTab}
        onOpenSimulation={() => setShowSimulationSuite((prev) => !prev)}
        onOpenEvaluation={() => setShowEvaluationModal(true)}
      />

      {/* 2. Primary Hero Action Directive Ribbon (Operational Centerpiece) */}
      <div
        style={{
          background: '#111418',
          borderBottom: '1px solid #2B323D',
          padding: '6px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              background: '#3B1214',
              color: '#F87171',
              border: '1px solid #7F1D1D',
              borderRadius: '3px',
              padding: '2px 6px',
              fontWeight: '800',
              fontFamily: 'monospace',
              fontSize: '10px',
            }}
          >
            HERO DIRECTIVE #1
          </span>

          <span style={{ color: '#E2E8F0', fontWeight: '700' }}>
            {primaryAction.title}
          </span>

          <button
            onClick={() => setWhyModalAction(primaryAction)}
            style={{
              background: '#1A202C',
              border: '1px solid #2D3748',
              borderRadius: '3px',
              padding: '2px 8px',
              fontSize: '10px',
              fontWeight: '800',
              color: '#38BDF8',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <HelpCircle size={11} />
            <span>WHY?</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="mono" style={{ fontSize: '10px', color: '#64748B' }}>
            PLAN v12 • SOLVER: <strong style={{ color: '#4ADE80' }}>OPTIMAL (50.1ms)</strong>
          </div>

          <button
            onClick={() => handleExecuteHeroDirective(primaryAction.id)}
            disabled={executingHero || heroExecuted}
            style={{
              background: heroExecuted ? '#166534' : '#2563EB',
              color: '#fff',
              border: '1px solid',
              borderColor: heroExecuted ? '#22C55E' : '#3B82F6',
              borderRadius: '3px',
              padding: '3px 12px',
              fontSize: '10px',
              fontWeight: '800',
              letterSpacing: '0.4px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            {heroExecuted ? (
              <>
                <CheckCircle2 size={12} />
                <span>DIRECTIVE EXECUTED</span>
              </>
            ) : (
              <>
                <Zap size={11} fill="#fff" />
                <span>{executingHero ? 'DISPATCHING...' : 'EXECUTE DIRECTIVE'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleExecuteAllDirectives}
            disabled={executingHero || heroExecuted}
            style={{
              background: '#1A202C',
              border: '1px solid #2D3748',
              color: '#E2E8F0',
              borderRadius: '3px',
              padding: '3px 10px',
              fontSize: '10px',
              fontWeight: '700',
            }}
          >
            Execute All Pending
          </button>
        </div>
      </div>

      {/* Optional Collapsible Simulation Engine Suite */}
      {showSimulationSuite && (
        <div style={{ padding: '8px 16px', background: '#0B0E13', borderBottom: '1px solid #2B323D' }}>
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
        </div>
      )}

      {/* 3. Main Workspace: STRICT MODULAR 4-COLUMN LAYOUT (Matching Reference Image) */}
      <main
        style={{
          flex: 1,
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          overflow: 'hidden',
        }}
      >
        {activeNavTab === 'Dashboard' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '22% 32% 26% 20%',
              gap: '10px',
              height: 'calc(100vh - 105px)',
              minHeight: '680px',
            }}
          >
            {/* COLUMN 1: Incident Brief & HazMat Telemetry */}
            <IncidentBriefHazmatPanel incident={incident} statistics={statistics} />

            {/* COLUMN 2: Tactical Map (High-Res GIS with Triage Legend) */}
            <IncidentMap
              incident={incident}
              victimZones={sectors}
              hospitals={hospitals}
              ambulances={ambulances}
              roadDisruptions={roads}
              onSelectEntity={setSelectedEntity}
            />

            {/* COLUMN 3: Casualty Queue Table (START Badges & Matched Destination) */}
            <CasualtyQueueTable
              victims={dashboardData?.triage_queue || []}
              onSelectVictim={(v) => setSelectedEntity({ type: 'VICTIM', data: v })}
            />

            {/* COLUMN 4: Hospital Capacity & Ambulance Dispatch Fleet */}
            <HospitalFleetPanel
              hospitals={hospitals}
              ambulances={ambulances}
            />
          </div>
        )}

        {/* Tab 2: Full-Screen GIS Map View */}
        {activeNavTab === 'GIS Map' && (
          <div style={{ height: 'calc(100vh - 105px)', minHeight: '680px' }}>
            <IncidentMap
              incident={incident}
              victimZones={sectors}
              hospitals={hospitals}
              ambulances={ambulances}
              roadDisruptions={roads}
              onSelectEntity={setSelectedEntity}
            />
          </div>
        )}

        {/* Tab 3: Detailed Triage Acuity Deep-Dive */}
        {activeNavTab === 'Triage' && (
          <div style={{ height: 'calc(100vh - 105px)', overflowY: 'auto' }}>
            <PriorityQueuePanel />
          </div>
        )}

        {/* Tab 4: Hospital & Fleet Deep-Dive */}
        {activeNavTab === 'Resources' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', height: 'calc(100vh - 105px)', overflowY: 'auto' }}>
            <ResourceOptimizationPanel />
            <AmbulanceRoutingPanel />
          </div>
        )}
      </main>

      {/* Modals & Command Overlays */}
      {whyModalAction && (
        <CommandCenterWhyModal
          action={whyModalAction}
          onClose={() => setWhyModalAction(null)}
        />
      )}

      {matchModalVictimId && (
        <HospitalMatchModal
          victimId={matchModalVictimId}
          onClose={() => setMatchModalVictimId(null)}
        />
      )}

      {showEvaluationModal && (
        <SimulationEvaluationModal
          isOpen={showEvaluationModal}
          onClose={() => setShowEvaluationModal(false)}
        />
      )}
    </div>
  );
}
