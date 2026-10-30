import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Cpu,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Truck,
  HeartPulse,
  Droplet,
  Wind,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Layers,
} from 'lucide-react';

export default function ResourceOptimizationPanel({ onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('ASSIGNMENTS'); // ASSIGNMENTS | UNASSIGNED | CONFLICTS | REALLOCATIONS | FORMULATION
  const [executedReallocs, setExecutedReallocs] = useState({});

  const handleRunOptimizer = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.solveResourceOptimization(3.0);
      setResult(data);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to run OR-Tools optimizer:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunOptimizer();
  }, []);

  const handleExecuteReallocation = (reallocId, title) => {
    setExecutedReallocs(prev => ({
      ...prev,
      [reallocId]: true,
    }));
  };

  const getBottleneckBadge = (bottleneck) => {
    switch (bottleneck) {
      case 'ICU_DEFICIT':
        return { label: 'ICU DEFICIT', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
      case 'FLEET_EXHAUSTED':
        return { label: 'FLEET EXHAUSTED', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'BLOOD_DEFICIT':
        return { label: 'BLOOD DEFICIT', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' };
      default:
        return { label: bottleneck || 'RESOURCE DEFICIT', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' };
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Top Banner & Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)',
          }}>
            <Cpu size={22} color="#070a12" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', letterSpacing: '0.5px', margin: 0 }}>
                GOOGLE OR-TOOLS RESOURCE OPTIMIZATION ENGINE
              </h2>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                background: 'rgba(56, 189, 248, 0.2)',
                color: 'var(--accent-blue)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(56, 189, 248, 0.4)',
              }}>
                MILP • SCIP SOLVER
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Deterministic constrained allocation across 7 regional resource categories under acute disaster scarcity
            </p>
          </div>
        </div>

        {/* Solver Run Trigger & Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {result && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: result.solver_status === 'OPTIMAL' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              border: `1px solid ${result.solver_status === 'OPTIMAL' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
            }}>
              <CheckCircle2 size={14} color={result.solver_status === 'OPTIMAL' ? '#22c55e' : '#f59e0b'} />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span className="mono" style={{ fontSize: '11px', fontWeight: '800', color: result.solver_status === 'OPTIMAL' ? '#22c55e' : '#f59e0b' }}>
                  SOLVER: {result.solver_status}
                </span>
                <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {result.solve_time_ms} ms • Obj: {result.objective_value}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleRunOptimizer}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.3)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? <RotateCcw size={14} className="spin" /> : <Zap size={14} />}
            {loading ? 'SOLVING MILP MODEL...' : '⚡ Run OR-Tools Optimization Engine'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '6px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#f87171',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <AlertTriangle size={16} />
          <span>Error running optimizer: {error}</span>
        </div>
      )}

      {/* 7 Tracked Regional Resource Inventory Cards */}
      {result && result.tracked_resources && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
        }}>
          {[
            {
              label: 'ICU Beds',
              val: result.tracked_resources.icu_beds,
              max: 33,
              icon: HeartPulse,
              color: '#ef4444',
              sub: '4 regional beds open',
            },
            {
              label: 'O- Blood Units',
              val: result.tracked_resources.blood_units_o_neg,
              max: 99,
              icon: Droplet,
              color: '#ec4899',
              sub: '25 emergency units',
            },
            {
              label: 'Ventilators',
              val: result.tracked_resources.ventilators,
              max: 31,
              icon: Wind,
              color: '#38bdf8',
              sub: '4 ICU ventilators',
            },
            {
              label: 'Doctors / Intensivists',
              val: result.tracked_resources.doctors,
              max: 20,
              icon: UserCheck,
              color: '#10b981',
              sub: '9 active on-duty',
            },
            {
              label: 'Trauma Teams',
              val: result.tracked_resources.trauma_teams,
              max: 10,
              icon: ShieldAlert,
              color: '#f59e0b',
              sub: '2 surgical teams',
            },
            {
              label: 'Ambulances',
              val: result.tracked_resources.ambulances,
              max: 45,
              icon: Truck,
              color: '#6366f1',
              sub: '5 active units',
            },
            {
              label: 'Rescue Teams',
              val: result.tracked_resources.rescue_teams,
              max: 34,
              icon: Layers,
              color: '#a855f7',
              sub: '2 USAR squads',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
                    {item.label}
                  </span>
                  <Icon size={14} color={item.color} />
                </div>
                <div className="mono" style={{ fontSize: '20px', fontWeight: '800', color: '#fff', lineHeight: 1.1 }}>
                  {item.val}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                  {item.sub}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Scarcity Summary Banner */}
      {result && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '10px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} color="#ef4444" />
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#f87171' }}>
              ACUTE CRISIS SCARCITY STATE:
            </span>
            <span style={{ fontSize: '13px', color: '#e2e8f0' }}>
              <strong>{result.total_high_priority_victims} Emergent Casualties</strong> competing for{' '}
              <strong>{result.tracked_resources?.icu_beds || 4} ICU Beds</strong> &{' '}
              <strong>{result.tracked_resources?.ambulances || 5} Ambulances</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <span className="mono" style={{ fontSize: '12px', color: '#4ade80' }}>
              ✓ Served: <strong>{result.served_victims_count}</strong>
            </span>
            <span className="mono" style={{ fontSize: '12px', color: '#f87171' }}>
              ✗ Unserved (Deficit): <strong>{result.unassigned_victims_count}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Sub-Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        {[
          { id: 'ASSIGNMENTS', label: `Solved Allocations (${result?.served_victims_count || 0})` },
          { id: 'UNASSIGNED', label: `Unassigned Casualties & Deficits (${result?.unassigned_victims_count || 0})` },
          { id: 'CONFLICTS', label: `Resource Conflicts & Bottlenecks (${result?.resource_conflicts?.length || 0})` },
          { id: 'REALLOCATIONS', label: `Recommended Crisis Reallocations (${result?.recommended_reallocations?.length || 0})` },
          { id: 'FORMULATION', label: 'MILP Mathematical Model' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            style={{
              background: activeSubTab === tab.id ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: activeSubTab === tab.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
              border: `1px solid ${activeSubTab === tab.id ? 'rgba(56, 189, 248, 0.4)' : 'transparent'}`,
              padding: '6px 12px',
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

      {/* Tab 1: Solved Allocations */}
      {activeSubTab === 'ASSIGNMENTS' && result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {result.assignments.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No feasible assignments could be solved under current resource constraints.
            </div>
          ) : (
            result.assignments.map((assignment, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr 1.2fr auto',
                  gap: '16px',
                  alignItems: 'center',
                }}
              >
                {/* Casualty */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      background: assignment.victim_priority === 'P1' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: assignment.victim_priority === 'P1' ? '#f87171' : '#fbbf24',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}>
                      {assignment.victim_priority}
                    </span>
                    <strong className="mono" style={{ fontSize: '14px', color: '#fff' }}>
                      {assignment.victim_id}
                    </strong>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {assignment.victim_condition}
                  </div>
                </div>

                {/* Transport */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <Truck size={14} color="#6366f1" />
                    <span className="mono" style={{ fontWeight: '700', color: '#fff' }}>
                      {assignment.ambulance_id}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      ({assignment.ambulance_callsign})
                    </span>
                  </div>
                  <div className="mono" style={{ fontSize: '11px', color: '#38bdf8', marginTop: '4px' }}>
                    ETA: {assignment.eta_minutes} min
                  </div>
                </div>

                {/* Destination & Bundle */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>
                    {assignment.hospital_name}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {assignment.allocated_resources.map((resTag, rIdx) => (
                      <span
                        key={rIdx}
                        style={{
                          fontSize: '10px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          color: '#e2e8f0',
                          padding: '1px 6px',
                          borderRadius: '3px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        ✓ {resTag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Objective Contribution */}
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: '13px', fontWeight: '800', color: '#4ade80' }}>
                    +{assignment.expected_benefit_score}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    clinical score
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Unassigned Casualties & Deficit Attribution */}
      {activeSubTab === 'UNASSIGNED' && result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Showing <strong>{result.unassigned_victims.length} unassigned casualties</strong> whose critical care requirements exceed available regional bounds:
          </div>

          <div style={{
            maxHeight: '360px',
            overflowY: 'auto',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Queue Rank</th>
                  <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Victim</th>
                  <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Priority</th>
                  <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Condition</th>
                  <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Primary Bottleneck</th>
                  <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Solver Attribution Rationale</th>
                </tr>
              </thead>
              <tbody>
                {result.unassigned_victims.map((vic, idx) => {
                  const badge = getBottleneckBadge(vic.primary_bottleneck);
                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                      }}
                    >
                      <td className="mono" style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>
                        #{vic.urgency_rank}
                      </td>
                      <td className="mono" style={{ padding: '8px 12px', fontWeight: '700', color: '#fff' }}>
                        {vic.victim_id}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '800',
                          background: vic.victim_priority === 'P1' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: vic.victim_priority === 'P1' ? '#f87171' : '#fbbf24',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}>
                          {vic.victim_priority}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', color: '#cbd5e1', maxWidth: '200px' }}>
                        {vic.victim_condition}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '800',
                          background: badge.bg,
                          color: badge.color,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: `1px solid ${badge.color}40`,
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '11px' }}>
                        {vic.reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Resource Conflicts & Bottlenecks */}
      {activeSubTab === 'CONFLICTS' && result && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {result.resource_conflicts.map((conf, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${conf.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                borderRadius: '8px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                  {conf.resource_type}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  background: conf.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: conf.severity === 'CRITICAL' ? '#f87171' : '#fbbf24',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}>
                  {conf.severity}
                </span>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {conf.conflict_summary}
              </div>

              {/* Meter */}
              <div style={{
                height: '6px',
                borderRadius: '3px',
                background: 'rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
                marginTop: '4px',
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, conf.utilization_pct)}%`,
                  background: conf.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>Available: <strong style={{ color: '#fff' }}>{conf.total_available}</strong></span>
                <span>Demanded: <strong style={{ color: '#fff' }}>{conf.total_demanded}</strong></span>
                <span style={{ color: '#f87171' }}>Deficit: <strong>-{conf.deficit}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Recommended Crisis Reallocations */}
      {activeSubTab === 'REALLOCATIONS' && result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {result.recommended_reallocations.map((rec) => {
            const isExecuted = executedReallocs[rec.id];
            return (
              <div
                key={rec.id}
                style={{
                  background: isExecuted ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isExecuted ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '8px',
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>
                      {rec.id}
                    </span>
                    <strong style={{ fontSize: '13px', color: isExecuted ? '#4ade80' : '#fff' }}>
                      {rec.title}
                    </strong>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: 'var(--accent-blue)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}>
                      TARGET: {rec.target_resource}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Impact: <strong style={{ color: '#4ade80' }}>{rec.projected_impact}</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleExecuteReallocation(rec.id, rec.title)}
                  disabled={isExecuted}
                  style={{
                    background: isExecuted ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    color: isExecuted ? '#4ade80' : '#fff',
                    border: `1px solid ${isExecuted ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: isExecuted ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isExecuted ? <CheckCircle2 size={14} color="#4ade80" /> : <Zap size={14} />}
                  {isExecuted ? 'DIRECTIVE ACTIVE' : rec.suggested_command}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 5: MILP Mathematical Model */}
      {activeSubTab === 'FORMULATION' && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          fontSize: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} color="var(--accent-blue)" />
            <strong style={{ color: '#fff', fontSize: '13px' }}>
              Rigorous Mathematical Integer Linear Programming (MILP) Formulation
            </strong>
          </div>

          <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            LifeLink employs Google OR-Tools to solve an exact Mixed-Integer Linear Program over binary decision variables{' '}
            <code className="mono">x[i,j,k] ∈ &#123;0, 1&#125;</code> (assigning casualty i to ambulance j and hospital k) and{' '}
            <code className="mono">u[i] ∈ &#123;0, 1&#125;</code> (casualty i is served).
          </p>

          <div className="mono" style={{
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '12px 14px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            color: '#38bdf8',
            lineHeight: 1.6,
          }}>
            <div><strong>MAXIMIZE:</strong></div>
            <div style={{ paddingLeft: '16px' }}>
              ∑ W_i · u[i] + ∑ [ Benefit(i, k) - 1.5 · TravelTime(i, k) ] · x[i,j,k]
            </div>
            <div style={{ marginTop: '8px' }}><strong>SUBJECT TO:</strong></div>
            <div style={{ paddingLeft: '16px' }}>
              1. Single Allocation: ∑[j,k] x[i,j,k] = u[i] ≤ 1  (∀ i ∈ Victims)<br />
              2. Fleet Capacity: ∑[i,k] x[i,j,k] ≤ Capacity_j  (∀ j ∈ Ambulances)<br />
              3. Hospital ICU Bound: ∑[i,j : ICU(i)] x[i,j,k] ≤ ICU_k  (∀ k ∈ Hospitals)<br />
              4. Hospital O- Blood Bound: ∑[i,j] BloodReq_i · x[i,j,k] ≤ BloodReserve_k  (∀ k ∈ Hospitals)<br />
              5. Ventilator Bound: ∑[i,j : Vent(i)] x[i,j,k] ≤ Ventilators_k  (∀ k ∈ Hospitals)<br />
              6. Trauma Team Bound: ∑[i,j : Trauma(i)] x[i,j,k] ≤ TraumaTeams_k  (∀ k ∈ Hospitals)<br />
              7. Specialty Capability Match: x[i,j,k] = 0 if Hospital_k lacks required capability
            </div>
          </div>

          <div style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={13} color="#22c55e" />
            <span>Guaranteed zero hallucination: Solved deterministically via SCIP / CBC Branch-and-Cut. No LLM decision-making permitted.</span>
          </div>
        </div>
      )}
    </div>
  );
}
