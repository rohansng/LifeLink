import React, { useState, useEffect } from 'react';
import { AlertTriangle, Radio, Wind, MoreHorizontal, Activity, Clock, Flame } from 'lucide-react';

export default function IncidentBriefHazmatPanel({ incident, statistics }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(3018); // 00:50:18 elapsed

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (sec) => {
    const hrs = String(Math.floor(sec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const secs = String(sec % 60).padStart(2, '0');
    return `00:${hrs}:${mins}:${secs}`;
  };

  return (
    <div
      className="defense-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '680px',
        overflow: 'hidden',
      }}
    >
      {/* Top Column Header */}
      <div className="defense-card-header">
        <span>Incident Brief & HazMat</span>
        <span className="mono" style={{ fontSize: '10px', color: '#64748B' }}>
          SEC-7 METRO
        </span>
      </div>

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
        {/* Card 1: Active Telemetry & Audio Transcript Waveform */}
        <div className="defense-card" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#E2E8F0' }}>Active Telemetry</span>
            <span className="mono" style={{ fontSize: '11px', color: '#94A3B8' }}>
              {formatElapsed(elapsedSeconds)}
            </span>
          </div>

          <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0, lineHeight: '1.4' }}>
            Incident dispatch audio transcript timeline. HAZMAT NH3 plume vector alerts.
            <br />
            <span style={{ color: '#64748B' }}>Incident coordinator notes: #freight_derailment_ammonia</span>
          </p>

          {/* Waveform Graphic */}
          <div
            style={{
              background: '#0B0E13',
              border: '1px solid #2B323D',
              borderRadius: '4px',
              padding: '6px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <svg viewBox="0 0 240 40" style={{ width: '100%', height: '36px' }}>
              {/* Audio waveform bars */}
              {Array.from({ length: 48 }).map((_, i) => {
                const height = Math.sin(i * 0.4) * 14 + 16 + (i % 5 === 0 ? 8 : 0);
                const y = (40 - height) / 2;
                const isHighlight = i >= 18 && i <= 24;
                return (
                  <rect
                    key={i}
                    x={i * 5}
                    y={y}
                    width={2.5}
                    height={height}
                    fill={isHighlight ? '#F59E0B' : '#334155'}
                    rx={1}
                  />
                );
              })}
              {/* Scrub line indicator */}
              <line x1="105" y1="2" x2="105" y2="38" stroke="#F59E0B" strokeWidth="1.5" />
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748B', fontFamily: 'monospace' }}>
              <span>00:00</span>
              <span style={{ color: '#F59E0B' }}>03:32 (ACTIVE)</span>
              <span>08:05</span>
            </div>
          </div>

          {/* Timers & Counters Dual Stat Box */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '2px' }}>
            <div
              style={{
                background: '#0B0E13',
                border: '1px solid #2B323D',
                borderRadius: '4px',
                padding: '6px 10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase' }}>Timers</div>
              <div className="mono" style={{ fontSize: '15px', fontWeight: '800', color: '#E2E8F0', marginTop: '2px' }}>
                21 h
              </div>
            </div>

            <div
              style={{
                background: '#0B0E13',
                border: '1px solid #2B323D',
                borderRadius: '4px',
                padding: '6px 10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase' }}>Counters</div>
              <div className="mono" style={{ fontSize: '15px', fontWeight: '800', color: '#38BDF8', marginTop: '2px' }}>
                6.3 as
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: HAZMAT NH3 Plume Vector Alerts */}
        <div
          className="defense-card"
          style={{
            padding: '10px',
            borderLeft: '3px solid #D97706',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '6px' }}>
              HAZMAT NH3 Plume Vector Alerts
            </span>
            <AlertTriangle size={14} color="#F59E0B" />
          </div>

          <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0, lineHeight: '1.4' }}>
            Incident dispatch audio transcript timeline new alerts. HAZMAT NH3 plume vector active:
          </p>

          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#CBD5E1', lineHeight: '1.5' }}>
            <li>
              <strong>Chemical Agent:</strong> Anhydrous Ammonia (UN 1005)
            </li>
            <li>
              <strong>Plume Dispersion:</strong> Surface wind 14 kts WNW → Sector Bravo
            </li>
            <li>
              <strong>Evacuation Zone:</strong> 800m downwind cordon active
            </li>
          </ul>

          <a
            href="#hazmat"
            onClick={(e) => e.preventDefault()}
            style={{ fontSize: '11px', color: '#38BDF8', textDecoration: 'none', fontWeight: '600' }}
          >
            Learn more →
          </a>
        </div>

        {/* Card 3: Incident Coordinator Notes */}
        <div className="defense-card" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#E2E8F0' }}>Incident Coordinator Notes</span>
            <MoreHorizontal size={14} color="#64748B" style={{ cursor: 'pointer' }} />
          </div>

          <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0, lineHeight: '1.4' }}>
            Incident coordinator notes for emergency response: Code Black active across Sector Alpha.
            Highway 101 severed at Overpass 4 due to tanker rupture (+14 min delay).
            All EMS dispatch units routed via Grand Ave Western Arterial (Route B contraflow).
          </p>
        </div>
      </div>
    </div>
  );
}
