import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  RotateCcw,
  Zap,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  History,
  CheckCircle2,
  Layers,
  ChevronDown,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function ContinuousReplanningBanner({ onPlanUpdated }) {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const [plan, hist] = await Promise.all([
        api.getCurrentPlan(),
        api.getReplanningHistory(),
      ]);
      setCurrentPlan(plan);
      setHistory(hist);
    } catch (err) {
      console.error('Failed to load replanning state:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  const handleTriggerShowcase = async () => {
    try {
      setLoading(true);
      setError(null);
      const newPlan = await api.triggerDemoReplanEvent();
      setCurrentPlan(newPlan);
      await loadPlan();
      if (onPlanUpdated) onPlanUpdated(newPlan);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loopSteps = [
    { label: 'EVENT', icon: '🚨' },
    { label: 'UNDERSTAND', icon: '🧠' },
    { label: 'PRIORITIZE', icon: '🩺' },
    { label: 'OPTIMIZE', icon: '⚡' },
    { label: 'ASSIGN', icon: '🚑' },
    { label: 'EXPLAIN', icon: '💡' },
    { label: 'COMMANDER', icon: '🎖️' },
    { label: 'REPLAN', icon: '🔄' },
  ];

  return (
    <div className="glass-panel" style={{
      padding: '16px 20px',
      background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95), rgba(15, 23, 42, 0.95))',
      border: '1px solid rgba(129, 140, 248, 0.4)',
      boxShadow: '0 0 25px rgba(129, 140, 248, 0.15)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    }}>
      {/* Top Status & Loop Diagram */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 14px rgba(99, 102, 241, 0.4)',
          }}>
            <RefreshCw size={20} color="#fff" className={loading ? 'spin' : ''} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', letterSpacing: '0.5px', margin: 0 }}>
                CONTINUOUS REPLANNING ENGINE
              </h2>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                background: 'rgba(99, 102, 241, 0.25)',
                color: '#a5b4fc',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(99, 102, 241, 0.5)',
              }}>
                CLOSED-LOOP CONTROL
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Autonomous 8-stage replanning loop dynamically updating allocations on every hospital, corridor, or casualty change
            </p>
          </div>
        </div>

        {/* Trigger Button & History Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <History size={13} />
            Plan Lineage ({history.length})
            <ChevronDown size={13} />
          </button>

          <button
            onClick={handleTriggerShowcase}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '800',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)',
            }}
          >
            <Zap size={13} />
            {loading ? 'Replanning...' : '⚡ Trigger Replan: Hospital B ICU 2 → 1'}
          </button>
        </div>
      </div>

      {/* The Visual 8-Stage Replanning Loop */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0, 0, 0, 0.35)',
        padding: '8px 14px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        overflowX: 'auto',
      }}>
        {loopSteps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '11px' }}>{step.icon}</span>
              <span className="mono" style={{ fontSize: '10px', fontWeight: '800', color: '#c7d2fe' }}>
                {step.label}
              </span>
            </div>
            {idx < loopSteps.length - 1 && (
              <span style={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: '10px', margin: '0 4px' }}>↓</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Active Plan Showcase Box (e.g. PLAN v12) */}
      {currentPlan && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(129, 140, 248, 0.35)',
          borderRadius: '8px',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          {/* Version Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="mono" style={{
                fontSize: '16px',
                fontWeight: '900',
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                padding: '3px 10px',
                borderRadius: '6px',
                letterSpacing: '0.5px',
              }}>
                {currentPlan.plan_version_label}
              </span>

              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>
                  Reason for Replan: <span style={{ color: '#fbbf24' }}>{currentPlan.reason_for_replan}</span>
                </div>
                <div className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Trigger Event: {currentPlan.trigger_event} • Generated {currentPlan.timestamp?.slice(11, 19)} UTC
                </div>
              </div>
            </div>

            <span style={{
              fontSize: '10px',
              fontWeight: '800',
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#4ade80',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}>
              ✓ TIMELINE UPDATED ({currentPlan.audit_timeline_event_id})
            </span>
          </div>

          {/* Changed Assignments (The Exact Showcase V129 Hospital B -> Hospital C) */}
          {currentPlan.changed_assignments?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#f87171', letterSpacing: '0.5px' }}>
                CHANGED ALLOCATIONS:
              </div>

              {currentPlan.changed_assignments.map((diff, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong className="mono" style={{ fontSize: '14px', color: '#fff' }}>
                        {diff.victim_id}
                      </strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        ({diff.victim_condition})
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="mono" style={{
                        fontSize: '11px',
                        color: '#f87171',
                        textDecoration: 'line-through',
                        background: 'rgba(239, 68, 68, 0.15)',
                        padding: '2px 6px',
                        borderRadius: '3px',
                      }}>
                        {diff.previous_destination}
                      </span>
                      <ArrowRight size={14} color="#38bdf8" />
                      <span className="mono" style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        color: '#4ade80',
                        background: 'rgba(34, 197, 94, 0.15)',
                        padding: '2px 6px',
                        borderRadius: '3px',
                      }}>
                        {diff.new_destination}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                    <strong style={{ color: '#38bdf8' }}>Reason:</strong> {diff.change_reason}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Affected Victims & Affected Resources Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <div>
              <strong>Affected Victims:</strong>{' '}
              {currentPlan.affected_victims?.map((v, i) => (
                <span key={i} className="mono" style={{ color: '#fff', marginRight: '6px' }}>{v}</span>
              ))}
            </div>

            <div>
              <strong>Affected Resources:</strong>{' '}
              {currentPlan.affected_resources?.map((r, i) => (
                <span key={i} style={{ color: '#cbd5e1', marginRight: '6px' }}>• {r}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Accordion */}
      {showHistory && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '220px',
          overflowY: 'auto',
        }}>
          <strong style={{ fontSize: '12px', color: '#fff' }}>Plan Lineage History:</strong>
          {history.map((h, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="mono" style={{ fontWeight: '800', color: '#38bdf8' }}>
                  {h.plan_version_label}
                </span>
                <span style={{ color: '#cbd5e1' }}>{h.reason_for_replan}</span>
              </div>
              <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {h.timestamp?.slice(11, 19)} UTC
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

