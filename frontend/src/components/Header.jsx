import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, ShieldAlert, Activity, Sparkles, Terminal, BarChart2 } from 'lucide-react';

export default function Header({ incident = {}, onOpenEvaluation }) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      className="glass-panel"
      style={{
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: 'linear-gradient(135deg, rgba(13, 19, 34, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Top Banner: Defense Status & Tactical Doctrine */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '8px',
          fontSize: '11px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
          <span className="live-indicator" style={{ width: '6px', height: '6px' }} />
          <span style={{ fontWeight: '800', color: 'var(--accent-cyan-bright)', letterSpacing: '0.8px' }}>
            LIFELINK AUTONOMOUS EMERGENCY DISPATCH ARCHITECTURE
          </span>
          <span>•</span>
          <span className="mono" style={{ color: '#cbd5e1' }}>
            OPERATIONAL DOCTRINE: <strong style={{ color: '#38bdf8' }}>CHAOS</strong> → <strong style={{ color: '#a78bfa' }}>INTELLIGENCE</strong> → <strong style={{ color: '#f87171' }}>ACTION</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            SIMULATION MODE • SYNTHETIC CASUALTY GRAPH
          </div>
          <div
            className="mono"
            style={{
              fontSize: '11px',
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.1)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(56, 189, 248, 0.25)',
            }}
          >
            SYS TIME: <strong>{currentTime}</strong>
          </div>
        </div>
      </div>

      {/* Clinical Decision Support & Synthetic Simulation Notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(56, 189, 248, 0.22)',
          borderRadius: '7px',
          padding: '6px 14px',
          fontSize: '11px',
          color: '#cbd5e1',
          lineHeight: 1.4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '9px',
              fontWeight: '900',
              letterSpacing: '0.6px',
              background: 'rgba(56, 189, 248, 0.2)',
              color: 'var(--accent-cyan-bright)',
              padding: '2px 7px',
              borderRadius: '4px',
              border: '1px solid rgba(56, 189, 248, 0.45)',
              whiteSpace: 'nowrap',
            }}
          >
            DECISION-SUPPORT NOTICE
          </span>
          <span>
            <strong>DEMO / SIMULATION:</strong> LIFELINK provides decision-support recommendations using synthetic data. It does not provide medical diagnosis, replace emergency professionals, or autonomously make clinical decisions.
          </span>
        </div>
        <span
          className="mono"
          style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          HUMAN-IN-THE-LOOP COMMAND MANDATORY
        </span>
      </div>

      {/* Main Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          {/* Logo / Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 24px rgba(239, 68, 68, 0.45)',
                fontWeight: '900',
                fontSize: '22px',
                color: '#fff',
                letterSpacing: '-1px',
              }}
            >
              ⚡
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.5px', color: '#fff', margin: 0 }}>
                  LIFELINK
                </h1>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    letterSpacing: '1px',
                    color: 'var(--accent-cyan-bright)',
                    background: 'rgba(6, 182, 212, 0.15)',
                    border: '1px solid rgba(6, 182, 212, 0.35)',
                    padding: '2px 7px',
                    borderRadius: '4px',
                  }}
                >
                  COMMAND CENTER
                </span>
              </div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'var(--text-secondary)',
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                }}
              >
                MASS-CASUALTY ORCHESTRATION & OPTIMIZATION SYSTEM
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '38px', background: 'var(--border-color)', margin: '0 4px' }} />

          {/* Active Incident Badge & Name */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="live-indicator" />
              <span
                style={{
                  color: 'var(--triage-red-bright)',
                  fontSize: '11px',
                  fontWeight: '900',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                MASS-CASUALTY INCIDENT (MCI ACTIVE)
              </span>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                #{incident.incidentId || 'MCI-2026-0941'}
              </span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#f8fafc', marginTop: '2px' }}>
              {incident.codename || 'Train Derailment with Hazardous Material Release'}
            </div>
          </div>
        </div>

        {/* Right Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Incident Severity Tag */}
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              borderRadius: '8px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.15)',
            }}
          >
            <AlertTriangle size={20} color="#f87171" />
            <div>
              <div style={{ fontSize: '10px', color: '#fca5a5', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                TRIAGE CLASSIFICATION
              </div>
              <div style={{ fontSize: '12px', fontWeight: '900', color: '#fff' }}>
                CODE BLACK (CRISIS TIER 3)
              </div>
            </div>
          </div>

          {/* Elapsed Timer */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Clock size={18} color="var(--accent-cyan-bright)" />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                INCIDENT ELAPSED
              </div>
              <div className="mono" style={{ fontSize: '13px', fontWeight: '800', color: '#f8fafc' }}>
                T+ 00:{incident.elapsedMinutes || 24}:18
              </div>
            </div>
          </div>

          {/* Evaluation Metrics Benchmark Trigger */}
          <button
            onClick={onOpenEvaluation}
            style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.18) 0%, rgba(14, 165, 233, 0.3) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.65)',
              color: '#38bdf8',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: '900',
              letterSpacing: '0.5px',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            <BarChart2 size={16} />
            <span>BENCHMARK METRICS</span>
            <span
              style={{
                fontSize: '9px',
                background: 'rgba(56, 189, 248, 0.35)',
                color: '#fff',
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.4px',
              }}
            >
              PHASE 14
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
