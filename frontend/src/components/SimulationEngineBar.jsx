import React, { useState } from 'react';
import { Play, RotateCcw, AlertTriangle, ShieldCheck, Zap, ArrowRight, X } from 'lucide-react';

export default function SimulationEngineBar({
  simulationStatus,
  lastEventResult,
  onSimulateNext,
  onResetSimulation,
  isSimulating,
  onDismissEventCard,
}) {
  const currentStep = simulationStatus?.current_step ?? 0;
  const totalSteps = simulationStatus?.total_steps ?? 5;
  const nextEventName = simulationStatus?.next_event_name ?? 'Event 1: NEW_RESPONDER_IMAGE';
  const isFinished = currentStep >= totalSteps;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Simulation Control Ribbon */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Left: Progression & Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(2, 132, 199, 0.5)',
          }}>
            <Zap size={16} color="#fff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.8px', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                INCIDENT SIMULATION ENGINE
              </span>
              <span className="mono" style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '1px 6px',
                borderRadius: '4px',
                background: isFinished ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: isFinished ? 'var(--triage-green)' : 'var(--triage-yellow)',
                border: `1px solid ${isFinished ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
              }}>
                {isFinished ? 'DEMO COMPLETE (5/5)' : `STEP ${currentStep} / ${totalSteps}`}
              </span>
            </div>

            <div style={{ fontSize: '13px', color: '#f8fafc', fontWeight: '600', marginTop: '2px' }}>
              {isFinished ? (
                <span style={{ color: 'var(--triage-green)' }}>All 5 crisis disruption events executed successfully.</span>
              ) : (
                <span>Next Up: <strong style={{ color: '#38bdf8' }}>{nextEventName}</strong></span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onResetSimulation}
            disabled={isSimulating}
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
            <span>Reset Demo</span>
          </button>

          <button
            onClick={onSimulateNext}
            disabled={isSimulating}
            style={{
              background: isFinished
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none',
              color: '#fff',
              padding: '9px 18px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '0.5px',
              cursor: isSimulating ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isFinished
                ? '0 0 16px rgba(16, 185, 129, 0.4)'
                : '0 0 20px rgba(239, 68, 68, 0.5)',
              transition: 'all 0.2s ease',
            }}
          >
            <Play size={14} fill="#fff" />
            <span>{isSimulating ? 'RECALCULATING...' : isFinished ? 'RE-RUN SEQUENCE' : '⚡ SIMULATE NEXT EVENT'}</span>
          </button>
        </div>
      </div>

      {/* Live Event Impact Delta Banner (Shows what changed, affected entities, and resulting recommendations) */}
      {lastEventResult && (
        <div
          className="glass-panel"
          style={{
            padding: '16px 20px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderLeft: '5px solid var(--triage-red)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'fadeIn 0.3s ease-out',
            boxShadow: '0 8px 30px rgba(239, 68, 68, 0.15)',
          }}
        >
          {/* Delta Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="live-indicator" style={{ width: '10px', height: '10px' }} />
              <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1px', color: 'var(--triage-red)', textTransform: 'uppercase' }}>
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
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--triage-red)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '4px' }}>
                🚨 WHAT CHANGED (SYSTEM STATE DELTA)
              </div>
              <div style={{ fontSize: '12px', color: '#f8fafc', lineHeight: '1.4' }}>
                {lastEventResult.what_changed}
              </div>
            </div>

            {/* 2. Affected Entities */}
            <div style={{ background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.25)', borderRadius: '6px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--accent-cyan)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '6px' }}>
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
            <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '6px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--accent-violet)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '4px' }}>
                💡 RESULTING RECOMMENDATION (DETERMINISTIC REPLAN)
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
    </div>
  );
}
