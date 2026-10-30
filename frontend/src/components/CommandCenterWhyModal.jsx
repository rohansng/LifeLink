import React from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
  Hospital,
  Truck,
  Navigation,
  ShieldCheck,
  PackageCheck,
} from 'lucide-react';

export default function CommandCenterWhyModal({ action, onClose }) {
  if (!action) return null;

  const why = action.why_breakdown || {};
  const criteria = why.selection_criteria || action.evidence || [];
  const rejected = why.rejected_alternatives || [];
  const allocated = why.allocated_resources || [];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(7, 10, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '14px',
          boxShadow: '0 0 35px rgba(56, 189, 248, 0.25)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(56, 189, 248, 0.4)',
            }}>
              <HelpCircle size={22} color="#070a12" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  background: action.priority === 'P1' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: action.priority === 'P1' ? '#f87171' : '#fbbf24',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${action.priority === 'P1' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                }}>
                  {action.priority} DIRECTIVE
                </span>
                <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {action.id}
                </span>
              </div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#fff', margin: '4px 0 0 0' }}>
                WHY WAS THIS ACTION RECOMMENDED?
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Title Banner */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '8px',
          padding: '12px 14px',
          fontSize: '12px',
          color: '#e0f2fe',
          lineHeight: 1.4,
        }}>
          <strong style={{ color: '#fff' }}>ACTION DIRECTIVE:</strong> {action.action}
        </div>

        {/* Selected Criteria (The 4 Hero Checkmarks) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} />
            <span>CRITICAL SELECTION CRITERIA SATISFIED ({why.chosen_entity_name || 'Selected Entity'}):</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '8px',
          }}>
            {criteria.map((crit, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  fontSize: '12px',
                  color: '#f0fdf4',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600',
                }}
              >
                <CheckCircle2 size={16} color="#4ade80" style={{ flexShrink: 0 }} />
                <span>{crit.replace(/^✓\s*/, '')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rejected Alternatives Matrix */}
        {rejected.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <XCircle size={16} />
              <span>REJECTED ALTERNATIVES & BOTTLENECK RATIONALE:</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rejected.map((alt, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '13px', color: '#fff' }}>
                      {alt.name}
                    </strong>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#f87171',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}>
                      REJECTED
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '2px' }}>
                    {(alt.reasons || []).map((reason, rIdx) => (
                      <span
                        key={rIdx}
                        style={{
                          fontSize: '11px',
                          color: '#cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {reason.includes('✓') ? (
                          <CheckCircle2 size={12} color="#4ade80" />
                        ) : (
                          <XCircle size={12} color="#f87171" />
                        )}
                        <span>{reason}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Allocated Resource Bundle */}
        {allocated.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PackageCheck size={14} color="var(--accent-blue)" />
              <span>ALLOCATED CRITICAL CARE ASSET BUNDLE:</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {allocated.map((res, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '11px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    color: '#e2e8f0',
                  }}
                >
                  ✓ {res}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Corridor Decision */}
        {why.corridor_decision && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '6px',
            padding: '10px 12px',
            fontSize: '11px',
            color: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Navigation size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
            <span><strong>CORRIDOR LOGISTICS:</strong> {why.corridor_decision}</span>
          </div>
        )}

        {/* Clinical Tradeoff Summary */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '12px 14px',
          fontSize: '12px',
          color: '#94a3b8',
          lineHeight: 1.5,
        }}>
          <strong style={{ color: '#fff' }}>EXECUTIVE CLINICAL JUSTIFICATION:</strong><br />
          {why.clinical_tradeoff_summary || action.reason}
        </div>

        {/* Dismiss Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              color: '#070a12',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
            }}
          >
            Dismiss WHY Analysis
          </button>
        </div>
      </div>
    </div>
  );
}

