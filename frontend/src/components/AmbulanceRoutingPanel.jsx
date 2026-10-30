import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  CornerDownRight,
  Flame,
  Hospital,
  MapPin,
  RefreshCw,
  Route,
  ShieldAlert,
  Siren,
  Sparkles,
  Stethoscope,
  XCircle,
} from 'lucide-react';
import { api } from '../services/api';

export default function AmbulanceRoutingPanel({
  routingSummary,
  onRefresh,
  className = '',
}) {
  const [chains, setChains] = useState(routingSummary?.chains || []);
  const [exemplar, setExemplar] = useState(routingSummary?.exemplar_chain || null);
  const [isRoadBlocked, setIsRoadBlocked] = useState(true);
  const [togglingRoad, setTogglingRoad] = useState(false);
  const [lastEventMsg, setLastEventMsg] = useState(null);

  // Sync with prop updates
  useEffect(() => {
    if (routingSummary?.chains) setChains(routingSummary.chains);
    if (routingSummary?.exemplar_chain) setExemplar(routingSummary.exemplar_chain);
  }, [routingSummary]);

  const fetchChains = async () => {
    try {
      const data = await api.getDispatchChains();
      if (data.chains) {
        setChains(data.chains);
        if (data.chains.length > 0) setExemplar(data.chains[0]);
      }
    } catch (err) {
      console.error('Failed to fetch routing chains:', err);
    }
  };

  const handleToggleRoad = async (shouldBlock) => {
    try {
      setTogglingRoad(true);
      let res;
      if (shouldBlock) {
        res = await api.triggerRoadBlock(
          'ROAD-01',
          'closed',
          'Overturned 10,000-gal fuel tanker & structural collapse at Overpass 4'
        );
        setIsRoadBlocked(true);
        setLastEventMsg('ROAD BLOCKED: Highway 101 severed! AMB-04 rerouted: Route A ❌ → Route B ✓ (13 min)');
      } else {
        res = await api.clearRoadBlock('ROAD-01');
        setIsRoadBlocked(false);
        setLastEventMsg('ROAD CLEARED: Highway 101 restored. Route A is now accessible.');
      }
      await fetchChains();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to toggle road state:', err);
    } finally {
      setTogglingRoad(false);
    }
  };

  return (
    <div
      className={`glass-panel ${className}`}
      style={{
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        border: '1px solid rgba(56, 189, 248, 0.25)',
      }}
    >
      {/* 1. Header with Title & Chain Paradigm */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(56, 189, 248, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(245, 158, 11, 0.4)',
            }}
          >
            <Route size={18} color="var(--triage-yellow)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.3px', color: '#f8fafc' }}>
                Ambulance Assignment & Simulated Routing Engine
              </h2>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '2px 7px',
                  borderRadius: '12px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                Offline Synthetic Road Graph
              </span>
            </div>
            <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#fff', fontWeight: '700' }}>Dispatch Paradigm:</span>
              <span>Victim</span>
              <ArrowRight size={11} color="var(--accent-cyan)" />
              <span>Ambulance</span>
              <ArrowRight size={11} color="var(--accent-cyan)" />
              <span>Hospital</span>
              <ArrowRight size={11} color="var(--accent-cyan)" />
              <span>Route</span>
              <ArrowRight size={11} color="var(--accent-cyan)" />
              <strong style={{ color: 'var(--triage-green)' }}>ETA</strong>
            </div>
          </div>
        </div>

        {/* Road Disruption Simulation Controller */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => handleToggleRoad(!isRoadBlocked)}
            disabled={togglingRoad}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: isRoadBlocked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              border: `1px solid ${isRoadBlocked ? 'var(--triage-red)' : 'var(--triage-green)'}`,
              color: isRoadBlocked ? 'var(--triage-red)' : 'var(--triage-green)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isRoadBlocked ? <AlertOctagon size={13} /> : <CheckCircle2 size={13} />}
            <span>{isRoadBlocked ? 'ROAD BLOCKED (Route A ❌)' : 'ROAD OPEN (Route A ✓)'}</span>
            <span style={{ fontSize: '9px', opacity: 0.8 }}>(Toggle)</span>
          </button>
        </div>
      </div>

      {lastEventMsg && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            background: isRoadBlocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${isRoadBlocked ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            fontSize: '11px',
            color: isRoadBlocked ? '#fca5a5' : '#86efac',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Siren size={14} />
            <span>{lastEventMsg}</span>
          </div>
          <button
            onClick={() => setLastEventMsg(null)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '11px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Signature Showcase Card (V083 → AMB-04 → Hospital B → Route B → 13 min) */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.35)',
          borderRadius: '8px',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
            <Sparkles size={13} />
            <span>EXEMPLAR DISPATCH & REROUTE CHAIN (Target Output)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '4px',
                background: isRoadBlocked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: isRoadBlocked ? 'var(--triage-red)' : 'var(--triage-green)',
                border: `1px solid ${isRoadBlocked ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
              }}
            >
              {isRoadBlocked ? 'DETOUR ACTIVE: ROUTE A BLOCKED' : 'NORMAL ARTERIAL ROUTING'}
            </span>
          </div>
        </div>

        {/* Connected Vertical Chain Visualization */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '8px',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.65)',
            padding: '14px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {/* 1. Victim */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>1. VICTIM</span>
            <div className="mono" style={{ fontSize: '16px', fontWeight: '900', color: 'var(--triage-red)' }}>
              V083
            </div>
            <span style={{ fontSize: '10px', color: '#f8fafc' }}>Critical bleeding</span>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>P1 • Trauma + ICU</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowRight size={18} color="var(--accent-cyan)" />
          </div>

          {/* 2. Ambulance */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>2. AMBULANCE</span>
            <div className="mono" style={{ fontSize: '16px', fontWeight: '900', color: 'var(--accent-cyan)' }}>
              AMB-04
            </div>
            <span style={{ fontSize: '10px', color: '#f8fafc' }}>Medic 4 (ALS)</span>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Paramedic J. Morales</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowRight size={18} color="var(--accent-cyan)" />
          </div>

          {/* 3. Hospital */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>3. HOSPITAL</span>
            <div className="mono" style={{ fontSize: '16px', fontWeight: '900', color: 'var(--triage-green)' }}>
              Hospital B
            </div>
            <span style={{ fontSize: '10px', color: '#f8fafc' }}>St. Jude Regional</span>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>2 ICU • 1 OR Ready</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowRight size={18} color="var(--accent-cyan)" />
          </div>

          {/* 4. Route */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>4. ROUTE</span>
            <div className="mono" style={{ fontSize: '16px', fontWeight: '900', color: 'var(--triage-yellow)' }}>
              Route B
            </div>
            <span style={{ fontSize: '10px', color: '#f8fafc' }}>Grand Ave Arterial</span>
            <span style={{ fontSize: '9px', color: 'var(--triage-green)' }}>Route B ✓ (Active)</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowRight size={18} color="var(--accent-cyan)" />
          </div>

          {/* 5. ETA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>5. SIMULATED ETA</span>
            <div className="mono" style={{ fontSize: '18px', fontWeight: '900', color: 'var(--triage-green)' }}>
              13 min
            </div>
            <span style={{ fontSize: '10px', color: '#f8fafc' }}>Golden Hour Safe</span>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>6.8 km transit</span>
          </div>
        </div>

        {/* Dynamic Road Block Indicator Block */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '6px',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="mono" style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
              AMB-04 Active Corridors:
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: isRoadBlocked ? 'rgba(239, 68, 68, 0.18)' : 'rgba(16, 185, 129, 0.18)',
                  color: isRoadBlocked ? 'var(--triage-red)' : 'var(--triage-green)',
                  border: `1px solid ${isRoadBlocked ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                }}
              >
                Route A {isRoadBlocked ? '❌ (Highway 101 Severed)' : '✓ (Open)'}
              </span>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: 'rgba(16, 185, 129, 0.22)',
                  color: 'var(--triage-green)',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                }}
              >
                Route B ✓ (Grand Ave Western Arterial • 13 min)
              </span>
            </div>
          </div>

          <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            V083 → AMB-04 → Hospital B → Route B → 13 min
          </div>
        </div>
      </div>

      {/* 3. Active Dispatch Chains Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
            ACTIVE DETERMINISTIC DISPATCH CHAINS
          </span>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Continuous Route Recalculation Active
          </span>
        </div>

        <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px 10px' }}>Victim</th>
                <th style={{ padding: '8px 10px' }}>Condition / Triage</th>
                <th style={{ padding: '8px 10px' }}>Assigned Ambulance</th>
                <th style={{ padding: '8px 10px' }}>Destination Hospital</th>
                <th style={{ padding: '8px 10px' }}>Corridor Evaluation</th>
                <th style={{ padding: '8px 10px' }}>Active Route</th>
                <th style={{ padding: '8px 10px' }}>ETA</th>
              </tr>
            </thead>
            <tbody>
              {chains.map((chain) => {
                const routeA = chain.route_options?.find((r) => r.route_id === 'ROUTE-A');
                const routeB = chain.route_options?.find((r) => r.route_id === 'ROUTE-B');

                return (
                  <tr
                    key={chain.victim_id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: chain.victim_id === 'V083' ? 'rgba(56, 189, 248, 0.04)' : 'transparent',
                    }}
                  >
                    <td className="mono" style={{ padding: '8px 10px', fontWeight: '800', color: '#fff' }}>
                      {chain.victim_id}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: '800',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          background: chain.victim_priority === 'P1' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                          color: chain.victim_priority === 'P1' ? 'var(--triage-red)' : 'var(--triage-yellow)',
                          marginRight: '6px',
                        }}
                      >
                        {chain.victim_priority}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{chain.victim_condition}</span>
                    </td>
                    <td className="mono" style={{ padding: '8px 10px', color: 'var(--accent-cyan)' }}>
                      <strong>{chain.ambulance_id}</strong> ({chain.ambulance_callsign})
                    </td>
                    <td style={{ padding: '8px 10px', color: '#fff' }}>
                      <strong>{chain.hospital_name}</strong>
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <span style={{ color: routeA?.is_blocked ? 'var(--triage-red)' : 'var(--triage-green)', fontWeight: '700' }}>
                          Route A {routeA?.is_blocked ? '❌' : '✓'}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>|</span>
                        <span style={{ color: 'var(--triage-green)', fontWeight: '700' }}>
                          Route B ✓
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '8px 10px', fontWeight: '700', color: 'var(--triage-yellow)' }}>
                      {chain.active_route_name}
                    </td>
                    <td className="mono" style={{ padding: '8px 10px', fontWeight: '800', color: 'var(--triage-green)' }}>
                      {chain.eta_minutes} min
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

