import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Droplet,
  HeartPulse,
  Hospital,
  Info,
  Layers,
  MapPin,
  Route,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  X,
  XCircle,
} from 'lucide-react';
import { api } from '../services/api';

export default function HospitalMatchModal({
  victimId,
  victimData,
  onClose,
  onHospitalAssigned,
}) {
  const [loading, setLoading] = useState(true);
  const [matchResult, setMatchResult] = useState(null);
  const [error, setError] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchMatch() {
      if (!victimId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await api.getHospitalMatch(victimId);
        if (isMounted) setMatchResult(data);
      } catch (err) {
        console.error('Failed to fetch hospital match for victim:', err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchMatch();
    return () => {
      isMounted = false;
    };
  }, [victimId]);

  const handleAssign = async (hospitalId) => {
    try {
      setAssigning(true);
      const res = await api.assignHospital(victimId, hospitalId);
      setAssignmentSuccess(res.hospital_name || hospitalId);
      if (onHospitalAssigned) onHospitalAssigned(res);
      setTimeout(() => {
        if (onClose) onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to assign hospital:', err);
      setError(err.message);
    } finally {
      setAssigning(false);
    }
  };

  if (!victimId) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 8, 16, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '880px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'rgba(11, 17, 33, 0.96)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '12px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.75), 0 0 30px rgba(56, 189, 248, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '22px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(56, 189, 248, 0.2))',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Hospital size={20} color="var(--triage-green)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: '800', letterSpacing: '0.2px', color: '#f8fafc' }}>
                  HOSPITAL DESTINATION MATCHING & "WHY?" RATIONALE
                </h2>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.18)',
                    color: 'var(--triage-red)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                  }}
                >
                  {victimId} • {matchResult?.victim_priority || victimData?.priority || 'P1'}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Deterministic evaluation using: <strong>Capability + Capacity + Resources + ETA</strong> (Nearest Hospital Rule Overridden)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--accent-cyan)' }}>
            <div className="live-indicator" style={{ margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: '13px', fontWeight: '700' }}>Evaluating Receiving Facilities & Road Disruption Detours...</div>
          </div>
        )}

        {error && (
          <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--triage-red)', borderRadius: '8px', color: 'var(--triage-red)', fontSize: '12px' }}>
            {error}
          </div>
        )}

        {assignmentSuccess && (
          <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--triage-green)', borderRadius: '8px', color: 'var(--triage-green)', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            Destination successfully assigned to {assignmentSuccess}! Updating fleet dispatch...
          </div>
        )}

        {matchResult && (
          <>
            {/* The Signature "WHY?" Rationale Card */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                  <Sparkles size={15} />
                  <span>DETERMINISTIC DECISION RATIONALE ("WHY?" EXPLANATION)</span>
                </div>
                <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Strict Algorithmic Rules • Non-LLM
                </span>
              </div>

              {/* Exact format from prompt:
                  Hospital B selected:
                  ✓ ICU available
                  ✓ Trauma available
                  ✓ Required blood available
                  ✓ 13 minute ETA

                  Hospital A rejected:
                  ✗ ICU unavailable
                  ✗ Trauma occupied

                  Hospital C:
                  ✓ ICU available
                  ✗ ETA too high
              */}
              <div
                className="mono"
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  padding: '14px 18px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '12px',
                  lineHeight: '1.65',
                  color: '#f1f5f9',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {matchResult.why_explanation}
              </div>
            </div>

            {/* Evaluated Hospital Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                CANDIDATE HOSPITAL EVALUATION CARDS
              </div>

              {matchResult.all_evaluations.map((hosp) => {
                const isSelected = hosp.is_recommended;
                return (
                  <div
                    key={hosp.hospital_id}
                    style={{
                      padding: '14px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(16, 185, 129, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${isSelected ? 'rgba(16, 185, 129, 0.5)' : 'var(--border-color)'}`,
                      boxShadow: isSelected ? '0 0 16px rgba(16, 185, 129, 0.2)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '900',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.16)',
                            color: isSelected ? 'var(--triage-green)' : 'var(--triage-red)',
                            border: `1px solid ${isSelected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                          }}
                        >
                          {isSelected ? 'SELECTED (RANK #1)' : `REJECTED (RANK #${hosp.rank})`}
                        </span>
                        <strong style={{ fontSize: '14px', color: '#fff' }}>{hosp.hospital_name}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({hosp.hospital_type})</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span className="mono" style={{ fontSize: '13px', fontWeight: '800', color: isSelected ? 'var(--triage-green)' : 'var(--text-muted)' }}>
                            {hosp.suitability_score} pts
                          </span>
                          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Suitability Score</div>
                        </div>

                        {isSelected && (
                          <button
                            onClick={() => handleAssign(hosp.hospital_id)}
                            disabled={assigning}
                            style={{
                              background: 'var(--triage-green)',
                              color: '#070a12',
                              border: 'none',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              transition: 'opacity 0.15s ease',
                            }}
                          >
                            {assigning ? 'Assigning...' : 'Confirm Assignment'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Criteria Badges */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {hosp.criteria_checks.map((crit, cIdx) => {
                        const isPass = crit.status === 'PASS';
                        const isFail = crit.status === 'FAIL';
                        return (
                          <div
                            key={cIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '11px',
                              fontWeight: '700',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              background: isPass
                                ? 'rgba(16, 185, 129, 0.12)'
                                : isFail
                                ? 'rgba(239, 68, 68, 0.12)'
                                : 'rgba(245, 158, 11, 0.12)',
                              color: isPass
                                ? 'var(--triage-green)'
                                : isFail
                                ? 'var(--triage-red)'
                                : 'var(--triage-yellow)',
                              border: `1px solid ${
                                isPass
                                  ? 'rgba(16, 185, 129, 0.3)'
                                  : isFail
                                  ? 'rgba(239, 68, 68, 0.3)'
                                  : 'rgba(245, 158, 11, 0.3)'
                              }`,
                            }}
                            title={crit.detail}
                          >
                            <span>{crit.icon}</span>
                            <span>{crit.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Operational Details Line */}
                    <div className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span>Travel Time: <strong>{hosp.travel_time_minutes} min</strong></span>
                      <span>ICU Beds Open: <strong>{hosp.icu_beds_available}</strong></span>
                      <span>Trauma ORs: <strong>{hosp.operating_rooms_open}</strong></span>
                      <span>O- Blood Units: <strong>{hosp.blood_units_o_neg}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Side-by-side Matrix Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                MULTI-FACILITY COMPARISON MATRIX
              </div>

              <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px 10px' }}>Hospital</th>
                      <th style={{ padding: '8px 10px' }}>Travel Time (ETA)</th>
                      <th style={{ padding: '8px 10px' }}>ICU Beds</th>
                      <th style={{ padding: '8px 10px' }}>Trauma ORs</th>
                      <th style={{ padding: '8px 10px' }}>Blood (O-)</th>
                      <th style={{ padding: '8px 10px' }}>Score</th>
                      <th style={{ padding: '8px 10px' }}>Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchResult.all_evaluations.map((h) => (
                      <tr
                        key={h.hospital_id}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background: h.is_recommended ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '8px 10px', fontWeight: '700', color: h.is_recommended ? 'var(--triage-green)' : '#fff' }}>
                          {h.hospital_name}
                        </td>
                        <td className="mono" style={{ padding: '8px 10px' }}>{h.travel_time_minutes} min</td>
                        <td className="mono" style={{ padding: '8px 10px', color: h.icu_beds_available > 0 ? 'var(--triage-green)' : 'var(--triage-red)' }}>
                          {h.icu_beds_available} beds
                        </td>
                        <td className="mono" style={{ padding: '8px 10px', color: h.operating_rooms_open > 0 ? 'var(--triage-green)' : 'var(--triage-red)' }}>
                          {h.operating_rooms_open} open
                        </td>
                        <td className="mono" style={{ padding: '8px 10px' }}>{h.blood_units_o_neg} units</td>
                        <td className="mono" style={{ padding: '8px 10px', fontWeight: '800', color: h.is_recommended ? 'var(--triage-green)' : 'var(--text-muted)' }}>
                          {h.suitability_score}
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <span
                            style={{
                              fontSize: '9px',
                              fontWeight: '800',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: h.is_recommended ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: h.is_recommended ? 'var(--triage-green)' : 'var(--triage-red)',
                            }}
                          >
                            {h.decision}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

