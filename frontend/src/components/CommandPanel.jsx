import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, ChevronRight, Zap } from 'lucide-react';

export default function CommandPanel({ priorityActions, alerts }) {
  const [activeActions, setActiveActions] = useState(priorityActions);
  const [completedActionIds, setCompletedActionIds] = useState([]);
  const [selectedTab, setSelectedTab] = useState('ACTIONS'); // 'ACTIONS', 'ALERTS', 'RECOMMENDATIONS'

  const handleExecuteAction = (actionId) => {
    setCompletedActionIds((prev) => [...prev, actionId]);
  };

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      {/* Header and Tab Toggles */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '15px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
            Command Control Panel
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { id: 'ACTIONS', label: `Actions (${priorityActions.length})` },
            { id: 'ALERTS', label: `Alerts (${alerts.length})` },
            { id: 'RECOMMENDATIONS', label: 'Tactical Directives' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              style={{
                background: selectedTab === tab.id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.03)',
                color: selectedTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: `1px solid ${selectedTab === tab.id ? 'rgba(6, 182, 212, 0.4)' : 'var(--border-color)'}`,
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content 1: Priority Actions */}
      {selectedTab === 'ACTIONS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeActions.map((action) => {
            const isCompleted = completedActionIds.includes(action.id);
            const isCritical = action.severity === 'CRITICAL';

            return (
              <div
                key={action.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: isCompleted ? 'rgba(16, 185, 129, 0.05)' : isCritical ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.4)' : isCritical ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-color)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: isCompleted ? 'rgba(16, 185, 129, 0.2)' : isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: isCompleted ? 'var(--triage-green)' : isCritical ? 'var(--triage-red)' : 'var(--triage-yellow)',
                    }}>
                      {isCompleted ? '✓ EXECUTED' : action.badge}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>
                      {action.title}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                  {action.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleExecuteAction(action.id)}
                    disabled={isCompleted}
                    style={{
                      background: isCompleted ? 'rgba(255, 255, 255, 0.06)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: isCompleted ? 'var(--text-muted)' : '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: isCompleted ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle size={13} color="var(--triage-green)" />
                        <span>Directive Active</span>
                      </>
                    ) : (
                      <>
                        <span>{action.suggestedAction}</span>
                        <ChevronRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Content 2: Operational Alerts */}
      {selectedTab === 'ALERTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                gap: '10px',
              }}
            >
              <AlertTriangle size={18} color="var(--triage-red)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--triage-red)' }}>
                    {alert.title}
                  </span>
                  <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {alert.timestamp}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 3: Recommendations */}
      {selectedTab === 'RECOMMENDATIONS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: '700', color: '#f8fafc', marginBottom: '4px' }}>
              1. Triage Acuity Divergence Management
            </div>
            <p style={{ fontSize: '11px', margin: 0 }}>
              With 31 critical casualties and only 4 regional ICU beds, triage category RED must be sub-stratified by salvageability index. Direct non-operable trauma to secondary palliative comfort posts.
            </p>
          </div>

          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: '700', color: '#f8fafc', marginBottom: '4px' }}>
              2. Fleet Turnaround Optimization
            </div>
            <p style={{ fontSize: '11px', margin: 0 }}>
              Establish offload nursing reception teams at Metro Trauma Center entrance to achieve sub-4 minute ambulance turnaround times and return Medic 1 & Medic 2 to Zone Alpha immediately.
            </p>
          </div>

          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: '700', color: '#f8fafc', marginBottom: '4px' }}>
              3. Staging Post Alpha Decontamination
            </div>
            <p style={{ fontSize: '11px', margin: 0 }}>
              Prevent secondary contamination of hospital emergency departments by requiring gross HazMat decontam prior to hospital loading.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
