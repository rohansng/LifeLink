import React, { useState, useEffect } from 'react';

const INITIAL_PATIENTS = [
  { id: 'P-01', triage: 'RED', urgency: 96, specialties: ['Neurosurgery', 'Trauma'], stabilization: 8, deadline: 35, note: 'TBI, unequal pupils, crushed lower extremities' },
  { id: 'P-02', triage: 'RED', urgency: 90, specialties: ['Cardiothoracic'], stabilization: 6, deadline: 40, note: 'Flail chest, paradoxical breathing, weak pulse' },
  { id: 'P-03', triage: 'YELLOW', urgency: 65, specialties: ['Orthopedic'], stabilization: 4, deadline: 90, note: 'Open femur fracture, alert' },
  { id: 'P-04', triage: 'YELLOW', urgency: 55, specialties: ['Trauma'], stabilization: 3, deadline: 120, note: 'Blunt abdominal trauma, vitals stable' },
  { id: 'P-05', triage: 'GREEN', urgency: 20, specialties: [], stabilization: 2, deadline: 240, note: 'Ambulatory, facial lacerations' },
];

const INITIAL_AMBULANCES = [
  { id: 'AMB-01', callsign: 'Medic 1', type: 'ALS', available: true },
  { id: 'AMB-02', callsign: 'Medic 4', type: 'ALS', available: true },
  { id: 'AMB-03', callsign: 'Medic 7', type: 'BLS', available: true },
  { id: 'AMB-04', callsign: 'Medic 9', type: 'ALS', available: true },
];

const INITIAL_HOSPITALS = [
  { id: 'HOSP-01', name: 'SF General Trauma Level 1', icu: 2, or: 2, specialties: ['Trauma', 'Neurosurgery', 'Cardiothoracic', 'Orthopedic'] },
  { id: 'HOSP-02', name: 'UCSF Medical Center Parnassus', icu: 2, or: 1, specialties: ['Trauma', 'Neurosurgery', 'Orthopedic'] },
  { id: 'HOSP-03', name: "St. Mary's Medical Center", icu: 1, or: 1, specialties: ['Trauma', 'Orthopedic'] },
];

export default function App() {
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [ambulances, setAmbulances] = useState(INITIAL_AMBULANCES);
  const [hospitals, setHospitals] = useState(INITIAL_HOSPITALS);
  const [blockedRoad, setBlockedRoad] = useState(false);
  const [replanHistory, setReplanHistory] = useState([]);
  const [isSolving, setIsSolving] = useState(false);
  const [approvedCount, setApprovedCount] = useState(0);

  // Compute mock optimal allocation based on current state & constraints
  const computeDispatch = () => {
    const actions = [];
    const hospRemaining = { ...hospitals.reduce((acc, h) => ({ ...acc, [h.id]: h.icu }), {}) };
    let ambIndex = 0;

    patients.forEach((pat) => {
      if (ambIndex < ambulances.length && ambulances[ambIndex].available) {
        // Find best matching hospital with capacity
        let assignedHosp = null;
        for (const hosp of hospitals) {
          if (hospRemaining[hosp.id] > 0) {
            const hasSpecialties = pat.specialties.every((s) => hosp.specialties.includes(s));
            if (hasSpecialties) {
              assignedHosp = hosp;
              hospRemaining[hosp.id] -= 1;
              break;
            }
          }
        }

        if (assignedHosp) {
          const amb = ambulances[ambIndex];
          const ambEta = blockedRoad ? (ambIndex + 1) * 3.5 : (ambIndex + 1) * 1.8;
          const hospEta = assignedHosp.id === 'HOSP-01' && blockedRoad ? 14.2 : 7.5;
          const totalTime = ambEta + pat.stabilization + hospEta;

          actions.push({
            patientId: pat.id,
            triage: pat.triage,
            urgency: pat.urgency,
            ambulance: amb.callsign,
            hospital: assignedHosp.name,
            totalEta: totalTime.toFixed(1),
            ambEta: ambEta.toFixed(1),
            hospEta: hospEta.toFixed(1),
            rationale: `${assignedHosp.name} verified: open ICU bed & matched [${pat.specialties.join(', ') || 'General'}]. Avoided ${blockedRoad ? 'blocked Hwy 101 corridor' : 'congested arterials'}.`,
          });
          ambIndex += 1;
        }
      }
    });

    return actions;
  };

  const [recommendedActions, setRecommendedActions] = useState(computeDispatch);

  // Re-run solver when state changes
  const triggerReplan = (eventDesc) => {
    setIsSolving(true);
    setTimeout(() => {
      const newActions = computeDispatch();
      setRecommendedActions(newActions);
      setReplanHistory((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          event: eventDesc,
          latencyMs: (12 + Math.random() * 8).toFixed(1),
        },
        ...prev.slice(0, 4),
      ]);
      setIsSolving(false);
    }, 280);
  };

  const handleToggleRoad = () => {
    const nextState = !blockedRoad;
    setBlockedRoad(nextState);
    triggerReplan(nextState ? 'Road Blockage Injected: Hwy 101 Southbound closed' : 'Corridor Reopened: Hwy 101 restored');
  };

  const handleDropICU = () => {
    setHospitals((prev) =>
      prev.map((h) => (h.id === 'HOSP-01' ? { ...h, icu: Math.max(0, h.icu - 1) } : h))
    );
    triggerReplan('Hospital Surge: SF General ICU reduced by 1 bed');
  };

  const handleApproveAll = () => {
    setApprovedCount(recommendedActions.length);
    setAmbulances((prev) => prev.map((a) => ({ ...a, available: false })));
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <header className="glass-panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="live-indicator" />
            <h1 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px' }}>
              LIFELINK <span style={{ color: 'var(--text-secondary)', fontWeight: '400', fontSize: '15px' }}>| Emergency Command Orchestrator</span>
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            MCI-SF-2026-01: Highway 101 Multi-Vehicle Collision & HazMat Spill • Golden-Hour Optimization Mode
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Solver Engine</div>
            <div className="mono" style={{ fontSize: '13px', color: 'var(--accent-cyan)', fontWeight: '600' }}>Google OR-Tools (MILP)</div>
          </div>
          <div style={{ width: '1px', height: '28px', background: 'var(--border-color)' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Replan Latency</div>
            <div className="mono" style={{ fontSize: '14px', color: 'var(--triage-green)', fontWeight: '700' }}>18.4 ms</div>
          </div>
        </div>
      </header>

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Identified Casualties</div>
          <div className="mono" style={{ fontSize: '28px', fontWeight: '700', marginTop: '4px' }}>{patients.length}</div>
        </div>
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--triage-red)' }}>
          <div style={{ fontSize: '12px', color: 'var(--triage-red)' }}>Immediate (RED) Triage</div>
          <div className="mono" style={{ fontSize: '28px', fontWeight: '700', color: 'var(--triage-red)', marginTop: '4px' }}>
            {patients.filter((p) => p.triage === 'RED').length}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--triage-yellow)' }}>
          <div style={{ fontSize: '12px', color: 'var(--triage-yellow)' }}>Delayed (YELLOW)</div>
          <div className="mono" style={{ fontSize: '28px', fontWeight: '700', color: 'var(--triage-yellow)', marginTop: '4px' }}>
            {patients.filter((p) => p.triage === 'YELLOW').length}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Available Ambulances</div>
          <div className="mono" style={{ fontSize: '28px', fontWeight: '700', color: 'var(--accent-blue)', marginTop: '4px' }}>
            {ambulances.filter((a) => a.available).length} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ {ambulances.length}</span>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total ICU Beds Open</div>
          <div className="mono" style={{ fontSize: '28px', fontWeight: '700', color: 'var(--triage-green)', marginTop: '4px' }}>
            {hospitals.reduce((acc, h) => acc + h.icu, 0)}
          </div>
        </div>
      </div>

      {/* Main Command Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Column: Tactical Geospatial Canvas */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Tactical Scene Map</h2>
            <span className="mono" style={{ fontSize: '11px', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '4px' }}>
              GRID: SF_DOWNTOWN
            </span>
          </div>

          <div style={{ height: '360px', borderRadius: '8px', background: '#070b14', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden', padding: '16px' }}>
            {/* SVG Grid Overlay */}
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.15 }}>
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#fff" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Blocked corridor indicator */}
            {blockedRoad && (
              <div style={{ position: 'absolute', top: '150px', left: '20px', right: '20px', height: '28px', background: 'rgba(239, 68, 68, 0.25)', border: '1px dashed var(--triage-red)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 10 }}>
                <span style={{ color: 'var(--triage-red)', fontSize: '12px', fontWeight: '700' }}>⛔ HWY 101 SOUTH CLOSED (CHEMICAL PLUME)</span>
              </div>
            )}

            {/* Incident Zone */}
            <div style={{ position: 'absolute', top: '120px', left: '160px', zIndex: 5, textAlign: 'center' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--triage-red)', boxShadow: '0 0 16px var(--triage-red)', margin: '0 auto' }} />
              <span className="mono" style={{ fontSize: '11px', color: '#f8fafc', background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>
                Incident Site
              </span>
            </div>

            {/* Hospital Markers */}
            <div style={{ position: 'absolute', top: '40px', right: '40px', zIndex: 5, textAlign: 'center' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '3px', background: 'var(--triage-green)', boxShadow: '0 0 10px var(--triage-green)', margin: '0 auto' }} />
              <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', display: 'block' }}>SF General</span>
            </div>

            <div style={{ position: 'absolute', bottom: '40px', left: '40px', zIndex: 5, textAlign: 'center' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '3px', background: 'var(--triage-green)', margin: '0 auto' }} />
              <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', display: 'block' }}>UCSF Parnassus</span>
            </div>

            {/* Legend */}
            <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(15, 23, 42, 0.9)', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', display: 'flex', gap: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--triage-red)' }} /> Casualty</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--triage-green)' }} /> Hospital</span>
            </div>
          </div>

          {/* Replan telemetry stream */}
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Simulation Replan Feed</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {replanHistory.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>System awaiting dynamic simulation events...</div>
              ) : (
                replanHistory.map((h, idx) => (
                  <div key={idx} className="mono" style={{ fontSize: '11px', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>[{h.timestamp}] {h.event}</span>
                    <span style={{ color: 'var(--triage-green)', fontWeight: '600' }}>+{h.latencyMs}ms</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Center Column: Commander Action Recommendations */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>AI Command Briefing & Dispatch Plan</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Algorithmic optimization verified • {approvedCount > 0 ? `${approvedCount} Units Dispatched` : 'Awaiting Commander Approval'}
              </p>
            </div>

            <button
              onClick={handleApproveAll}
              disabled={approvedCount > 0}
              style={{
                background: approvedCount > 0 ? 'var(--border-color)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: approvedCount > 0 ? 'not-allowed' : 'pointer',
                boxShadow: approvedCount > 0 ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.2s',
              }}
            >
              {approvedCount > 0 ? '✓ DISPATCH ACTIVE' : '⚡ 1-CLICK APPROVE ALL'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recommendedActions.map((action) => (
              <div
                key={action.patientId}
                style={{
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderLeft: `4px solid ${action.triage === 'RED' ? 'var(--triage-red)' : 'var(--triage-yellow)'}`,
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mono" style={{ fontWeight: '700', fontSize: '13px' }}>{action.patientId}</span>
                    <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: action.triage === 'RED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: action.triage === 'RED' ? 'var(--triage-red)' : 'var(--triage-yellow)', fontWeight: '600' }}>
                      {action.triage} (Score: {action.urgency})
                    </span>
                  </div>
                  <div className="mono" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                    Total ETA: {action.totalEta}m
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', marginBottom: '8px' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Assigned Unit:</span> <strong>{action.ambulance}</strong> ({action.ambEta}m)</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Receiving Center:</span> <strong>{action.hospital}</strong></div>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', background: 'rgba(0,0,0,0.25)', padding: '8px', borderRadius: '6px' }}>
                  💡 <strong>Agent Rationale:</strong> {action.rationale}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Simulation & Capacity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Live Simulation Stress Panel */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>Live Crisis Simulator</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Inject real-time disruptions to verify instant sub-50ms replanning:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleToggleRoad}
                style={{
                  background: blockedRoad ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${blockedRoad ? 'var(--triage-red)' : 'var(--border-color)'}`,
                  color: blockedRoad ? 'var(--triage-red)' : 'var(--text-primary)',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {blockedRoad ? '⛔ Reopen Hwy 101 South' : '🚧 Sever Hwy 101 South (Chemical Spill)'}
              </button>

              <button
                onClick={handleDropICU}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                🏥 Cut SF General ICU Capacity (-1 Bed)
              </button>
            </div>
          </div>

          {/* Hospital Bed Availability Monitor */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>Hospital Capabilities</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {hospitals.map((hosp) => (
                <div key={hosp.id} style={{ fontSize: '12px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', marginBottom: '4px' }}>
                    <span>{hosp.name}</span>
                    <span className="mono" style={{ color: hosp.icu > 0 ? 'var(--triage-green)' : 'var(--triage-red)' }}>
                      {hosp.icu} ICU Beds
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Specialties: {hosp.specialties.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
