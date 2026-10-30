import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  Zap,
  ArrowRight,
  X,
  CheckCircle2,
  Activity,
  Flame,
  Truck,
  Building2,
  RefreshCw,
  Sliders,
  FileText,
  Radio,
  Siren,
  HeartCrack,
} from 'lucide-react';
import { api } from '../services/api';

export default function SimulationEngineBar({
  simulationStatus,
  lastEventResult,
  setLastEventResult,
  onSimulateNext,
  onResetSimulation,
  isSimulating,
  onDismissEventCard,
  onRefreshDashboard,
}) {
  const currentStep = simulationStatus?.current_step ?? 0;
  const totalSteps = simulationStatus?.total_steps ?? 5;
  const nextEventName = simulationStatus?.next_event_name ?? 'Event 1: NEW_RESPONDER_IMAGE';
  const isFinished = currentStep >= totalSteps;

  // Automated Killer Demo playback state
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [autoStepIndex, setAutoStepIndex] = useState(0);
  const [autoCountdown, setAutoCountdown] = useState(null);
  const [autoStatusMessage, setAutoStatusMessage] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const abortRef = useRef(false);

  // If already at step 5 on mount, allow fetching summary on demand
  const handleFetchSummary = async () => {
    try {
      const summary = await api.getSimulationSummary();
      setSummaryData(summary);
      setShowSummaryModal(true);
    } catch (e) {
      console.error('Failed to fetch summary:', e);
    }
  };

  // Start Automated Mass-Casualty Simulation
  const handleStartMassCasualtySimulation = async () => {
    if (isAutoRunning) return;
    abortRef.current = false;
    setIsAutoRunning(true);
    setShowSummaryModal(false);
    setSummaryData(null);
    if (setLastEventResult) setLastEventResult(null);

    try {
      // Step 0: Baseline Reset
      setAutoStepIndex(0);
      setAutoStatusMessage('INITIALIZING BASELINE (214 VICTIMS / 31 CRITICAL / 4 ICU BEDS)...');
      await api.resetSimulation();
      if (onRefreshDashboard) await onRefreshDashboard();

      // Brief pause to establish baseline view
      for (let c = 12; c > 0; c--) {
        if (abortRef.current) break;
        setAutoCountdown((c / 10).toFixed(1));
        await new Promise((r) => setTimeout(r, 100));
      }

      // Steps 1 to 5 sequential execution
      for (let step = 1; step <= 5; step++) {
        if (abortRef.current) break;
        setAutoStepIndex(step);

        const stepDescriptions = [
          '',
          'EVENT 1/5: Responder evidence (+17 victims, +5 critical)...',
          'EVENT 2/5: Hospital B ICU capacity drops (2 -> 1 bed)...',
          'EVENT 3/5: Route A severed (11 min -> 27 min detour)...',
          'EVENT 4/5: Hospital B O- blood inventory plunges (18 -> 3 units)...',
          'EVENT 5/5: Hospital C trauma team online (+2 ICU, +2 OR suites)...',
        ];
        setAutoStatusMessage(stepDescriptions[step] || `EVENT ${step}/5 IN PROGRESS...`);

        const result = await api.simulateNextEvent();
        if (setLastEventResult) setLastEventResult(result);
        if (onRefreshDashboard) await onRefreshDashboard();

        // Pause 2.4s between events with animated countdown
        if (step < 5) {
          for (let c = 24; c > 0; c--) {
            if (abortRef.current) break;
            setAutoCountdown((c / 10).toFixed(1));
            await new Promise((r) => setTimeout(r, 100));
          }
        }
      }

      if (!abortRef.current) {
        setAutoStatusMessage('MASS-CASUALTY SEQUENCE COMPLETED • GENERATING MISSION REPORT...');
        const summary = await api.getSimulationSummary();
        setSummaryData(summary);
        setShowSummaryModal(true);
      }
    } catch (err) {
      console.error('Mass-casualty simulation loop error:', err);
    } finally {
      setIsAutoRunning(false);
      setAutoCountdown(null);
    }
  };

  const handleStopAutoSimulation = () => {
    abortRef.current = true;
    setIsAutoRunning(false);
    setAutoCountdown(null);
    setAutoStatusMessage('Automated simulation paused.');
  };

  const handleManualReset = async () => {
    abortRef.current = true;
    setIsAutoRunning(false);
    setShowSummaryModal(false);
    setSummaryData(null);
    if (onResetSimulation) await onResetSimulation();
    if (onRefreshDashboard) await onRefreshDashboard();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Simulation Engine Control Ribbon */}
      <div
        className="glass-panel"
        style={{
          padding: '14px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          background: isAutoRunning
            ? 'linear-gradient(90deg, rgba(30, 27, 75, 0.98) 0%, rgba(15, 23, 42, 0.95) 100%)'
            : 'linear-gradient(90deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.92) 100%)',
          border: isAutoRunning
            ? '1px solid rgba(139, 92, 246, 0.6)'
            : '1px solid rgba(56, 189, 248, 0.35)',
          boxShadow: isAutoRunning
            ? '0 0 30px rgba(139, 92, 246, 0.3), inset 0 0 15px rgba(139, 92, 246, 0.1)'
            : '0 6px 24px rgba(0, 0, 0, 0.5)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle running laser indicator */}
        {isAutoRunning && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #38bdf8, #818cf8, #ef4444)',
              animation: 'pulse 1.5s infinite',
            }}
          />
        )}

        {/* Left: Progression & Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: isAutoRunning
                ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'
                : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isAutoRunning
                ? '0 0 16px rgba(124, 58, 237, 0.6)'
                : '0 0 12px rgba(2, 132, 199, 0.5)',
              flexShrink: 0,
            }}
          >
            {isAutoRunning ? (
              <RefreshCw size={20} color="#fff" className="spin-slow" />
            ) : (
              <Zap size={20} color="#fff" />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '900',
                  letterSpacing: '1px',
                  color: isAutoRunning ? '#a78bfa' : 'var(--accent-cyan)',
                  textTransform: 'uppercase',
                }}
              >
                INCIDENT SIMULATION ENGINE • KILLER DEMO
              </span>

              {/* Progress Steps Dots */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map((st) => {
                  const isPastOrCurrent = currentStep >= st;
                  const isCurrentActive = isAutoRunning && autoStepIndex === st;
                  return (
                    <div
                      key={st}
                      title={`Event ${st}`}
                      style={{
                        width: isCurrentActive ? '18px' : '8px',
                        height: '8px',
                        borderRadius: '4px',
                        background: isCurrentActive
                          ? '#a78bfa'
                          : isPastOrCurrent
                          ? '#10b981'
                          : 'rgba(255, 255, 255, 0.15)',
                        transition: 'all 0.3s ease',
                        boxShadow: isCurrentActive ? '0 0 8px #a78bfa' : 'none',
                      }}
                    />
                  );
                })}
              </div>

              <span
                className="mono"
                style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: isFinished
                    ? 'rgba(16, 185, 129, 0.2)'
                    : isAutoRunning
                    ? 'rgba(139, 92, 246, 0.25)'
                    : 'rgba(245, 158, 11, 0.2)',
                  color: isFinished
                    ? 'var(--triage-green)'
                    : isAutoRunning
                    ? '#c4b5fd'
                    : 'var(--triage-yellow)',
                  border: `1px solid ${
                    isFinished
                      ? 'rgba(16, 185, 129, 0.4)'
                      : isAutoRunning
                      ? 'rgba(139, 92, 246, 0.5)'
                      : 'rgba(245, 158, 11, 0.4)'
                  }`,
                }}
              >
                {isAutoRunning
                  ? `AUTORUN STEP ${autoStepIndex || currentStep}/5`
                  : isFinished
                  ? 'SEQUENCE COMPLETE (5/5)'
                  : `STEP ${currentStep} / ${totalSteps}`}
              </span>

              {autoCountdown && isAutoRunning && (
                <span
                  className="mono"
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    color: '#fde047',
                    background: 'rgba(234, 179, 8, 0.15)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                  }}
                >
                  NEXT IN {autoCountdown}s
                </span>
              )}
            </div>

            <div style={{ fontSize: '13px', color: '#f8fafc', fontWeight: '600', marginTop: '3px' }}>
              {isAutoRunning ? (
                <span style={{ color: '#e0e7ff' }}>
                  {autoStatusMessage || 'Executing mass-casualty disruption sequence...'}
                </span>
              ) : isFinished ? (
                <span style={{ color: 'var(--triage-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} />
                  All 5 catastrophic disruption events executed. Mission summary ready.
                </span>
              ) : (
                <span>
                  Next Up: <strong style={{ color: '#38bdf8' }}>{nextEventName}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions & Killer Demo Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* View Summary Button if finished or data available */}
          {(isFinished || summaryData) && (
            <button
              onClick={() => {
                if (summaryData) {
                  setShowSummaryModal(true);
                } else {
                  handleFetchSummary();
                }
              }}
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                color: 'var(--triage-green)',
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <FileText size={14} />
              <span>Executive Mission Report</span>
            </button>
          )}

          {/* Reset Baseline Button */}
          <button
            onClick={handleManualReset}
            disabled={isSimulating && !isAutoRunning}
            title="Reset scenario to initial baseline (214 victims, 31 critical, 4 ICU beds)"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          {/* Single Step Button (Secondary manual step) */}
          {!isAutoRunning && !isFinished && (
            <button
              onClick={onSimulateNext}
              disabled={isSimulating}
              title="Manually trigger next disruption event"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: isSimulating ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <ArrowRight size={13} />
              <span>Step</span>
            </button>
          )}

          {/* PAUSE / STOP BUTTON when autorun is active */}
          {isAutoRunning && (
            <button
              onClick={handleStopAutoSimulation}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                color: '#f87171',
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <X size={14} />
              <span>Pause Demo</span>
            </button>
          )}

          {/* HERO KILLER DEMO BUTTON: START MASS-CASUALTY SIMULATION */}
          <button
            onClick={handleStartMassCasualtySimulation}
            disabled={isAutoRunning}
            style={{
              background: isAutoRunning
                ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                : isFinished
                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              border: isAutoRunning
                ? '1px solid rgba(165, 180, 252, 0.6)'
                : '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              padding: '10px 22px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '900',
              letterSpacing: '0.6px',
              cursor: isAutoRunning ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: isAutoRunning
                ? '0 0 24px rgba(99, 102, 241, 0.6)'
                : isFinished
                ? '0 0 20px rgba(16, 185, 129, 0.5)'
                : '0 0 25px rgba(220, 38, 38, 0.65), 0 0 50px rgba(220, 38, 38, 0.25)',
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
            }}
          >
            {isAutoRunning ? (
              <>
                <RefreshCw size={15} className="spin" />
                <span>SIMULATION RUNNING ({autoStepIndex}/5)...</span>
              </>
            ) : isFinished ? (
              <>
                <RefreshCw size={15} />
                <span>RE-RUN MASS-CASUALTY SIMULATION</span>
              </>
            ) : (
              <>
                <Play size={15} fill="#fff" />
                <span>START MASS-CASUALTY SIMULATION</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Event Impact Delta Banner (Shows what changed, affected entities, and resulting recommendations) */}
      {lastEventResult && (
        <div
          className="glass-panel"
          style={{
            padding: '16px 20px',
            background: 'rgba(15, 23, 42, 0.96)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderLeft: '5px solid var(--triage-red)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'fadeIn 0.3s ease-out',
            boxShadow: '0 8px 30px rgba(239, 68, 68, 0.2)',
          }}
        >
          {/* Delta Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="live-indicator" style={{ width: '10px', height: '10px' }} />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  letterSpacing: '1px',
                  color: 'var(--triage-red)',
                  textTransform: 'uppercase',
                }}
              >
                EVENT DISRUPTION TRIGGERED • STEP {lastEventResult.step_number} of 5
              </span>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                [{lastEventResult.event_type}]
              </span>
            </div>

            {onDismissEventCard && (
              <button
                onClick={onDismissEventCard}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                title="Dismiss"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
            {lastEventResult.title}
          </div>

          {/* 3 Grid Columns: What Changed, Affected Entities, Resulting Recommendations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.5fr', gap: '14px', alignItems: 'start' }}>
            {/* 1. What Changed */}
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '6px',
                padding: '10px 12px',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  color: 'var(--triage-red)',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                🚨 WHAT CHANGED (SYSTEM STATE DELTA)
              </div>
              <div style={{ fontSize: '12px', color: '#f8fafc', lineHeight: '1.4' }}>
                {lastEventResult.what_changed}
              </div>
            </div>

            {/* 2. Affected Entities */}
            <div
              style={{
                background: 'rgba(2, 132, 199, 0.08)',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                borderRadius: '6px',
                padding: '10px 12px',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  color: 'var(--accent-cyan)',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                🎯 AFFECTED ENTITIES
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {lastEventResult.affected_entities.map((entity, idx) => (
                  <span
                    key={idx}
                    className="mono"
                    style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                    }}
                  >
                    {entity}
                  </span>
                ))}
              </div>
            </div>

            {/* 3. Resulting Recommendations */}
            <div
              style={{
                background: 'rgba(139, 92, 246, 0.08)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                borderRadius: '6px',
                padding: '10px 12px',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  color: 'var(--accent-violet)',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                💡 RESULTING RECOMMENDATION (CONTINUOUS REPLAN)
              </div>
              {lastEventResult.resulting_recommendations && lastEventResult.resulting_recommendations.length > 0 ? (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#f8fafc', marginBottom: '3px' }}>
                    {lastEventResult.resulting_recommendations[0].title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {lastEventResult.resulting_recommendations[0].explanation}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status stabilized. No new directive required.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POST-SIMULATION EXECUTIVE MISSION SUMMARY CARD */}
      {showSummaryModal && summaryData && (
        <div
          className="glass-panel"
          style={{
            padding: '24px 28px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(20, 24, 40, 0.98) 100%)',
            border: '2px solid rgba(239, 68, 68, 0.65)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8), 0 0 35px rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '900',
                    letterSpacing: '1px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: 'var(--triage-red)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    textTransform: 'uppercase',
                  }}
                >
                  MASS-CASUALTY MISSION COMPLETE • CRISIS TIER 3
                </span>
                <span className="mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  SIMULATION END-STATE REPORT
                </span>
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#f8fafc', marginTop: '6px' }}>
                POST-SIMULATION EXECUTIVE MISSION SUMMARY
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Cumulative incident evaluation across 5 catastrophic disruption events. System bottlenecks identified, optimal directives ready for Commander sign-off.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleStartMassCasualtySimulation}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RefreshCw size={13} />
                <span>Re-Run Demo</span>
              </button>

              <button
                onClick={() => setShowSummaryModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <X size={14} />
                <span>Dismiss</span>
              </button>
            </div>
          </div>

          {/* 4 Primary Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {/* Metric 1: Victims Tracked */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-cyan)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                👥 VICTIMS TRACKED
              </div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#f8fafc', marginTop: '6px', fontFamily: 'monospace' }}>
                {typeof summaryData.victims_tracked === 'number'
                  ? summaryData.victims_tracked
                  : summaryData.victims_tracked?.total || 231}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div>🔴 <strong>{summaryData.breakdown?.critical || summaryData.critical_patients_total || 36}</strong> Critical (+5 from drone)</div>
                <div>🟡 <strong>{summaryData.breakdown?.serious || 74}</strong> Serious</div>
                <div>🟢 <strong>{summaryData.breakdown?.moderate || 87}</strong> Moderate</div>
                <div>⚪ <strong>{summaryData.breakdown?.unknown || 34}</strong> Trapped / Unknown</div>
              </div>
            </div>

            {/* Metric 2: Critical Patients Assigned */}
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--triage-green)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                🚑 CRITICAL PATIENTS ASSIGNED
              </div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#10b981', marginTop: '6px', fontFamily: 'monospace' }}>
                {typeof summaryData.critical_patients_assigned === 'number'
                  ? summaryData.critical_patients_assigned
                  : summaryData.critical_patients_assigned?.assigned_count || 5}
                <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: '400' }}>
                  {' '} / {summaryData.critical_patients_total || summaryData.breakdown?.critical || 36}
                </span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#34d399', marginTop: '4px' }}>
                {summaryData.critical_patients_assigned?.fleet_status || '100% AMBULANCE FLEET COMMITTED'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                All 5 active ALS/BLS transport units actively conveying acute surgical casualties.
              </div>
            </div>

            {/* Metric 3: Unassigned Critical */}
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--triage-red)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                ⚠️ UNASSIGNED CRITICAL CASUALTIES
              </div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#ef4444', marginTop: '6px', fontFamily: 'monospace' }}>
                {typeof summaryData.unassigned_critical === 'number'
                  ? summaryData.unassigned_critical
                  : summaryData.unassigned_critical?.unassigned_count || 31}
              </div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#f87171', marginTop: '4px' }}>
                {summaryData.unassigned_critical?.status || 'IMMEDIATE EVACUATION DEFICIT'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {summaryData.unassigned_critical?.reason || 'Fleet capacity bottleneck (5 vehicles vs 36 critical)'}
              </div>
            </div>

            {/* Metric 4: ICU Conflicts */}
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--triage-yellow)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                🏥 ICU REGIONAL CONFLICTS
              </div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#f59e0b', marginTop: '6px', fontFamily: 'monospace' }}>
                {summaryData.icu_conflicts?.total_available_beds || 5}
                <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: '400' }}> / {summaryData.icu_conflicts?.total_demanding || 36} Demanded</span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#fbbf24', marginTop: '4px' }}>
                NET DEFICIT: -{summaryData.icu_conflicts?.net_deficit || 31} ICU BEDS
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Metro Trauma (0) • St. Jude (1) • Harborview (4)
              </div>
            </div>
          </div>

          {/* Two Detailed Columns: Resource Alerts & Recommended Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '16px' }}>
            {/* Column A: Active Resource Alerts */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <AlertTriangle size={16} color="var(--triage-red)" />
                <span style={{ fontSize: '12px', fontWeight: '900', letterSpacing: '0.8px', color: 'var(--triage-red)', textTransform: 'uppercase' }}>
                  ACTIVE RESOURCE ALERTS & BOTTLENECKS ({summaryData.resource_alerts?.length || 5})
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(summaryData.resource_alerts || []).map((alert, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      borderLeft: '3px solid var(--triage-red)',
                      padding: '8px 12px',
                      borderRadius: '0 6px 6px 0',
                      fontSize: '12px',
                      color: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column B: Recommended Actions (Directives for Commander) */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <ShieldCheck size={16} color="var(--accent-cyan)" />
                <span style={{ fontSize: '12px', fontWeight: '900', letterSpacing: '0.8px', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                  TACTICAL CRISIS DIRECTIVES (RECOMMENDED ACTIONS)
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(summaryData.recommended_actions || []).map((action, idx) => (
                  <div
                    key={action.id || idx}
                    style={{
                      background: 'rgba(56, 189, 248, 0.06)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                      borderRadius: '6px',
                      padding: '10px 14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="mono" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                        {action.id} • {action.type}
                      </span>
                      <span
                        className="mono"
                        style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          color: '#34d399',
                          background: 'rgba(16, 185, 129, 0.15)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        EXPECTED IMPACT
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#f8fafc', marginTop: '4px' }}>
                      {action.title}
                    </div>

                    <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '2px', fontWeight: '600' }}>
                      ⚡ {action.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Callout: Deterministic Guarantee & Repeatability */}
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}
          >
            <span>
              🔒 <strong>Deterministic Guarantee:</strong> Optimization calculated via Google OR-Tools MILP solver & deterministic scoring algorithms. Sequence can be safely re-run repeatedly with 100% reproducible outcomes.
            </span>
            <button
              onClick={handleStartMassCasualtySimulation}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              🔄 Re-Run Simulation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
