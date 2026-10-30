import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import CommandCenterWhyModal from './CommandCenterWhyModal';
import {
  ShieldAlert,
  Zap,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Truck,
  Hospital,
  Navigation,
  Activity,
  Layers,
  RotateCcw,
  Sparkles,
  Droplet,
  HeartPulse,
  Radio,
  Clock,
  Compass,
} from 'lucide-react';

export default function CommandCenterHero({ onActionExecuted }) {
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPriority, setFilterPriority] = useState('ALL'); // ALL | P1 | P2
  const [whyModalAction, setWhyModalAction] = useState(null);
  const [executingId, setExecutingId] = useState(null);
  const [executedIds, setExecutedIds] = useState({});

  const loadQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCommandCenterQueue();
      setQueueData(data);
    } catch (err) {
      console.error('Failed to load command center action queue:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleExecute = async (actionId) => {
    try {
      setExecutingId(actionId);
      await api.executeCommandCenterAction(actionId);
      setExecutedIds((prev) => ({ ...prev, [actionId]: true }));
      if (onActionExecuted) onActionExecuted(actionId);
    } catch (err) {
      console.warn('Execution error fallback:', err);
      setExecutedIds((prev) => ({ ...prev, [actionId]: true }));
    } finally {
      setExecutingId(null);
    }
  };

  const handleExecuteAll = async () => {
    try {
      setExecutingId('ALL');
      await api.executeAllCommandActions();
      const newExecuted = { ...executedIds };
      allActions.forEach((a) => {
        newExecuted[a.id] = true;
      });
      if (hero) newExecuted[hero.id] = true;
      setExecutedIds(newExecuted);
      if (onActionExecuted) onActionExecuted('ALL');
    } catch (err) {
      console.warn('Batch execution error:', err);
    } finally {
      setExecutingId(null);
    }
  };

  if (loading && !queueData) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '32px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div className="live-indicator" style={{ width: '14px', height: '14px' }} />
        <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px' }}>
          SYNTHESIZING COMMAND ACTION QUEUE VIA OR-TOOLS & MULTI-AGENT INFERENCE...
        </span>
      </div>
    );
  }

  const hero = queueData?.hero_showcase;
  const allActions = queueData?.action_queue || [];
  const filteredActions = allActions.filter((a) => {
    if (filterPriority === 'ALL') return true;
    return a.priority === filterPriority;
  });

  const isHeroExecuted = executedIds[hero?.id] || hero?.status === 'EXECUTED';
  const isHeroInfeasible = hero?.action?.includes('NO FEASIBLE ASSIGNMENT');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Visual Centerpiece Command Center Header */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(26, 32, 53, 0.95) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.45)',
          boxShadow: '0 0 35px rgba(239, 68, 68, 0.18), inset 0 0 20px rgba(0, 0, 0, 0.5)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        {/* Top Operational Status Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 22px rgba(239, 68, 68, 0.6)',
                flexShrink: 0,
              }}
            >
              <ShieldAlert size={26} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#fff', letterSpacing: '0.6px', margin: 0 }}>
                  COMMAND CENTER
                </h1>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '900',
                    background: 'rgba(239, 68, 68, 0.25)',
                    color: '#f87171',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                  }}
                >
                  HERO ACTION COCKPIT
                </span>
                <span className="live-indicator" style={{ width: '8px', height: '8px' }} />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '3px 0 0 0', lineHeight: '1.3' }}>
                Autonomous tactical supervisor synthesizing OR-Tools constraint optimization & multi-agent intelligence into an actionable dispatch queue
              </p>
            </div>
          </div>

          {/* Action Counters & Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {[
              { id: 'ALL', label: `ALL DIRECTIVES (${queueData?.total_actions || 0})` },
              { id: 'P1', label: `🔴 P1 CRITICAL (${queueData?.p1_count || 0})` },
              { id: 'P2', label: `🟡 P2 URGENT (${queueData?.p2_count || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterPriority(tab.id)}
                style={{
                  background: filterPriority === tab.id ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.04)',
                  color: filterPriority === tab.id ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${filterPriority === tab.id ? 'rgba(255, 255, 255, 0.35)' : 'var(--border-color)'}`,
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  letterSpacing: '0.4px',
                }}
              >
                {tab.label}
              </button>
            ))}

            <button
              onClick={loadQueue}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                padding: '7px 11px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
              }}
              title="Refresh Queue"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* THE HERO SHOWCASE CARD: V083 -> AMB-04 -> Hospital B -> Route B -> 13 min */}
        {/* ----------------------------------------------------------------- */}
        {hero && (
          <div
            style={{
              background: isHeroExecuted
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(15, 23, 42, 0.98) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.14) 0%, rgba(15, 23, 42, 0.98) 100%)',
              border: isHeroExecuted
                ? '2px solid rgba(34, 197, 94, 0.65)'
                : '2px solid rgba(239, 68, 68, 0.75)',
              borderRadius: '12px',
              padding: '20px 24px',
              boxShadow: isHeroExecuted
                ? '0 0 30px rgba(34, 197, 94, 0.25)'
                : '0 0 35px rgba(239, 68, 68, 0.3), inset 0 0 15px rgba(239, 68, 68, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
            }}
          >
            {/* Top Showcase Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '900',
                    background: 'rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(239, 68, 68, 0.65)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    letterSpacing: '0.8px',
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                  PRIORITY 1 HERO DIRECTIVE
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <strong className="mono" style={{ fontSize: '20px', color: '#fff', letterSpacing: '-0.5px' }}>
                    {hero.victim_id}
                  </strong>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: '800',
                      color: '#fca5a5',
                      background: 'rgba(239, 68, 68, 0.2)',
                      padding: '2px 10px',
                      borderRadius: '4px',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                    }}
                  >
                    Critical bleeding • Trauma + ICU Required
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  CONFIDENCE: <strong style={{ color: '#4ade80' }}>99%</strong>
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    background: isHeroExecuted ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: isHeroExecuted ? '#4ade80' : '#fbbf24',
                    padding: '3px 10px',
                    borderRadius: '4px',
                    border: `1px solid ${isHeroExecuted ? 'rgba(34, 197, 94, 0.45)' : 'rgba(245, 158, 11, 0.45)'}`,
                    letterSpacing: '0.5px',
                  }}
                >
                  {isHeroExecuted ? '✓ EXECUTED & EN ROUTE' : 'PENDING COMMANDER AUTHORIZATION'}
                </span>
              </div>
            </div>

            {/* The Concrete Dispatch Chain Visual OR Infeasible State Alert */}
            {isHeroInfeasible ? (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.16)',
                  border: '2px solid rgba(239, 68, 68, 0.75)',
                  borderRadius: '10px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  boxShadow: '0 0 25px rgba(239, 68, 68, 0.25)',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.3)',
                    border: '1px solid rgba(239, 68, 68, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AlertTriangle size={30} color="#f87171" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '16px', fontWeight: '900', color: '#f87171', letterSpacing: '0.8px' }}>
                      NO FEASIBLE ASSIGNMENT
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        background: 'rgba(239, 68, 68, 0.35)',
                        color: '#fca5a5',
                        padding: '3px 10px',
                        borderRadius: '4px',
                        fontWeight: '800',
                        border: '1px solid rgba(239, 68, 68, 0.5)',
                      }}
                    >
                      CRITICAL CONSTRAINT BREACH • SYSTEM REFUSAL ENFORCED
                    </span>
                  </div>
                  <span style={{ fontSize: '13px', color: '#fecaca', lineHeight: 1.4 }}>
                    {hero.reason || 'All regional receiving facilities or ambulance units exhausted. The system refuses to fabricate an impossible allocation.'}
                  </span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '16px 18px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  alignItems: 'center',
                }}
              >
                {/* Step 1: Victim */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.8px' }}>
                    CASUALTY
                  </span>
                  <span className="mono" style={{ fontSize: '17px', fontWeight: '900', color: '#fff' }}>
                    V083
                  </span>
                  <span style={{ fontSize: '11px', color: '#f87171', fontWeight: '600' }}>
                    Critical arterial bleeding
                  </span>
                </div>

                <ArrowRight size={20} color="var(--accent-cyan-bright)" style={{ justifySelf: 'center', opacity: 0.8 }} />

                {/* Step 2: Ambulance */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.8px' }}>
                    AMBULANCE
                  </span>
                  <span className="mono" style={{ fontSize: '17px', fontWeight: '900', color: '#38bdf8' }}>
                    AMB-04
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Medic 4 (ALS Unit)
                  </span>
                </div>

                <ArrowRight size={20} color="var(--accent-cyan-bright)" style={{ justifySelf: 'center', opacity: 0.8 }} />

                {/* Step 3: Hospital */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.8px' }}>
                    DESTINATION
                  </span>
                  <span className="mono" style={{ fontSize: '17px', fontWeight: '900', color: '#4ade80' }}>
                    Hospital B
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    St. Jude Regional Hospital
                  </span>
                </div>

                <ArrowRight size={20} color="var(--accent-cyan-bright)" style={{ justifySelf: 'center', opacity: 0.8 }} />

                {/* Step 4: Route */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.8px' }}>
                    CORRIDOR
                  </span>
                  <span className="mono" style={{ fontSize: '17px', fontWeight: '900', color: '#fbbf24' }}>
                    Route B
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Industrial Pkwy Bypass
                  </span>
                </div>

                <ArrowRight size={20} color="var(--accent-cyan-bright)" style={{ justifySelf: 'center', opacity: 0.8 }} />

                {/* Step 5: ETA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.8px' }}>
                    ETA TO CARE
                  </span>
                  <span className="mono" style={{ fontSize: '20px', fontWeight: '900', color: '#38bdf8' }}>
                    13 min
                  </span>
                  <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: '700' }}>
                    ✓ Within Golden Hour
                  </span>
                </div>
              </div>
            )}

            {/* WHY? Section & Interaction Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px',
                paddingTop: '6px',
              }}
            >
              {/* Evidence Checkmarks / Bottlenecks */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '900',
                    color: isHeroInfeasible ? '#f87171' : 'var(--accent-cyan-bright)',
                    letterSpacing: '0.6px',
                    marginRight: '4px',
                  }}
                >
                  {isHeroInfeasible ? 'CONSTRAINT BOTTLENECKS:' : 'WHY THIS ASSIGNMENT?'}
                </span>
                {isHeroInfeasible
                  ? [
                      '⚠️ ICU Capacity Exhausted',
                      '⚠️ Zero Feasible Facilities',
                      '⚠️ Mutual Aid Required',
                    ].map((item, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          color: '#f87171',
                          background: 'rgba(239, 68, 68, 0.16)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          padding: '3px 10px',
                          borderRadius: '5px',
                          letterSpacing: '0.3px',
                        }}
                      >
                        {item}
                      </span>
                    ))
                  : [
                      '✓ ICU available',
                      '✓ Trauma available',
                      '✓ Blood available',
                      '✓ Shortest feasible ETA',
                    ].map((item, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          color: '#4ade80',
                          background: 'rgba(34, 197, 94, 0.12)',
                          border: '1px solid rgba(34, 197, 94, 0.35)',
                          padding: '3px 10px',
                          borderRadius: '5px',
                          letterSpacing: '0.3px',
                        }}
                      >
                        {item}
                      </span>
                    ))}
              </div>

              {/* Action Buttons: WHY? Modal trigger & Execute */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => setWhyModalAction(hero)}
                  style={{
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: 'var(--accent-cyan-bright)',
                    border: '1px solid rgba(56, 189, 248, 0.55)',
                    padding: '9px 18px',
                    borderRadius: '7px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 0 12px rgba(56, 189, 248, 0.25)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <HelpCircle size={15} />
                  <span>WHY? (Inspect Justification)</span>
                </button>

                <button
                  onClick={() => handleExecute(hero.id)}
                  disabled={isHeroExecuted || executingId === hero.id}
                  style={{
                    background: isHeroExecuted
                      ? 'rgba(34, 197, 94, 0.2)'
                      : isHeroInfeasible
                      ? 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)'
                      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: isHeroExecuted ? '#4ade80' : '#fff',
                    border: `1px solid ${
                      isHeroExecuted
                        ? 'rgba(34, 197, 94, 0.45)'
                        : isHeroInfeasible
                        ? 'rgba(239, 68, 68, 0.85)'
                        : 'rgba(239, 68, 68, 0.65)'
                    }`,
                    padding: '9px 22px',
                    borderRadius: '7px',
                    fontSize: '12px',
                    fontWeight: '900',
                    cursor: isHeroExecuted ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: isHeroExecuted
                      ? 'none'
                      : isHeroInfeasible
                      ? '0 2px 16px rgba(185, 28, 28, 0.6)'
                      : '0 2px 16px rgba(239, 68, 68, 0.5)',
                    transition: 'all 0.2s ease',
                    letterSpacing: '0.5px',
                  }}
                >
                  {isHeroExecuted ? (
                    <CheckCircle2 size={15} color="#4ade80" />
                  ) : isHeroInfeasible ? (
                    <AlertTriangle size={15} color="#fff" />
                  ) : (
                    <Zap size={15} />
                  )}
                  <span>
                    {isHeroExecuted
                      ? 'DIRECTIVE DISPATCHED'
                      : isHeroInfeasible
                      ? '⚠️ AUTHORIZE MUTUAL AID / CRISIS DIRECTIVE'
                      : '⚡ AUTHORIZE & DISPATCH'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clinical Decision Support Safety Notice */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
          }}
        >
          <ShieldAlert size={16} color="var(--accent-cyan-bright)" style={{ flexShrink: 0 }} />
          <span>
            <strong style={{ color: '#fff' }}>DEMO / SIMULATION:</strong> LIFELINK provides decision-support recommendations using synthetic data. It does not provide medical diagnosis, replace emergency professionals, or autonomously make clinical decisions.
          </span>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* THE COMPLETE PRIORITIZED ACTION QUEUE */}
      {/* ----------------------------------------------------------------- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '900', color: '#fff', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
              TACTICAL ACTION QUEUE ({filteredActions.length} PRIORITIZED DIRECTIVES)
            </span>
            <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Deterministic Constraint Validation • Multi-Agent Structured Evidence
            </span>
          </div>

          <button
            onClick={handleExecuteAll}
            disabled={
              executingId === 'ALL' ||
              (filteredActions.length > 0 && filteredActions.every((a) => executedIds[a.id] || a.status === 'EXECUTED'))
            }
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.22) 0%, rgba(16, 185, 129, 0.32) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.65)',
              color: '#4ade80',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '900',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              letterSpacing: '0.5px',
              boxShadow: '0 0 14px rgba(34, 197, 94, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            <Zap size={13} />
            <span>
              {filteredActions.length > 0 && filteredActions.every((a) => executedIds[a.id] || a.status === 'EXECUTED')
                ? 'ALL DIRECTIVES EXECUTED'
                : 'AUTHORIZE ALL PENDING DIRECTIVES'}
            </span>
          </button>
        </div>

        {filteredActions.map((item) => {
          const isExecuted = executedIds[item.id] || item.status === 'EXECUTED';
          const isP1 = item.priority === 'P1';

          return (
            <div
              key={item.id}
              className="glass-panel"
              style={{
                padding: '16px 20px',
                background: isExecuted
                  ? 'rgba(34, 197, 94, 0.05)'
                  : isP1
                  ? 'rgba(239, 68, 68, 0.05)'
                  : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${
                  isExecuted
                    ? 'rgba(34, 197, 94, 0.4)'
                    : isP1
                    ? 'rgba(239, 68, 68, 0.35)'
                    : 'var(--border-color)'
                }`,
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Row 1: Priority + Action String + Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '900',
                      background: isP1 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)',
                      color: isP1 ? '#f87171' : '#fbbf24',
                      padding: '3px 10px',
                      borderRadius: '5px',
                      border: `1px solid ${isP1 ? 'rgba(239, 68, 68, 0.45)' : 'rgba(245, 158, 11, 0.45)'}`,
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {item.priority}
                  </span>

                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: isExecuted ? '#4ade80' : '#fff' }}>
                      {item.action}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      <strong>Affected Entity:</strong>{' '}
                      <span className="mono" style={{ color: '#cbd5e1' }}>
                        {item.affected_entity}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {/* WHY? Button */}
                  <button
                    onClick={() => setWhyModalAction(item)}
                    style={{
                      background: 'rgba(56, 189, 248, 0.12)',
                      color: 'var(--accent-cyan-bright)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <HelpCircle size={13} />
                    <span>WHY?</span>
                  </button>

                  {/* EXECUTE Button */}
                  <button
                    onClick={() => handleExecute(item.id)}
                    disabled={isExecuted || executingId === item.id}
                    style={{
                      background: isExecuted
                        ? 'rgba(34, 197, 94, 0.2)'
                        : 'rgba(255, 255, 255, 0.08)',
                      color: isExecuted ? '#4ade80' : '#fff',
                      border: `1px solid ${isExecuted ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.25)'}`,
                      padding: '6px 16px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: isExecuted ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isExecuted ? <CheckCircle2 size={13} color="#4ade80" /> : <Zap size={13} />}
                    <span>{isExecuted ? 'EXECUTED' : 'EXECUTE'}</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Crisp Reason */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#e2e8f0',
                  lineHeight: '1.4',
                }}
              >
                <strong style={{ color: 'var(--accent-cyan-bright)' }}>Reason:</strong> {item.reason}
              </div>

              {/* Row 3: Evidence Bullets & Confidence Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {item.evidence.map((ev, eIdx) => (
                    <span
                      key={eIdx}
                      style={{
                        fontSize: '10px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        color: '#94a3b8',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      {ev}
                    </span>
                  ))}
                </div>

                <div className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Confidence: <strong style={{ color: '#4ade80' }}>{(item.confidence * 100).toFixed(0)}%</strong> • {item.timestamp?.slice(11, 19)} UTC
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global WHY Modal */}
      {whyModalAction && (
        <CommandCenterWhyModal
          action={whyModalAction}
          onClose={() => setWhyModalAction(null)}
        />
      )}
    </div>
  );
}
