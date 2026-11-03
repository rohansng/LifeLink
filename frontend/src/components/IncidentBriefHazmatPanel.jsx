import React, { useState } from 'react';
import { AlertTriangle, MoreHorizontal, Activity, Flame, Wind, Clock } from 'lucide-react';

export default function IncidentBriefHazmatPanel({ incident }) {
  const [notes, setNotes] = useState(
    'Unified Command established at KR Puram Junction. HazMat Level B hot zone cordoned 800m downwind. Industrial logistics collapse extrication underway in Sector Alpha.'
  );

  // Generate realistic audio waveform bars (matching the reference image)
  const waveformBars = [
    12, 18, 14, 28, 42, 65, 80, 55, 34, 48, 72, 90, 85, 45, 30, 22, 50, 78,
    95, 60, 40, 25, 35, 62, 84, 70, 45, 28, 38, 55, 48, 30, 20, 16, 24, 38,
    52, 68, 75, 40, 26, 18, 22, 35, 48, 60, 42, 28, 18, 12,
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        height: '100%',
        minWidth: '260px',
      }}
    >
      {/* Top Header Label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#E2E8F0', letterSpacing: '-0.2px', margin: 0 }}>
          Incident Brief & HazMat
        </h3>
      </div>

      {/* Card 1: Active Telemetry */}
      <div
        className="tactical-card"
        style={{
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#E2E8F0' }}>Active Telemetry</span>
          <span className="mono" style={{ fontSize: '11px', color: '#94A3B8' }}>00:50:18:39</span>
        </div>

        <p style={{ fontSize: '11px', color: '#8A99AD', lineHeight: '1.4', margin: 0 }}>
          Incident dispatch audio transcript timeline. Anhydrous ammonia vapor plume dispersion vector alerts active.
        </p>

        {/* Audio Waveform Canvas */}
        <div
          style={{
            background: '#0D1117',
            border: '1px solid #1C2330',
            borderRadius: '4px',
            padding: '10px 8px',
            position: 'relative',
          }}
        >
          {/* Waveform Bars */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '46px',
              gap: '2px',
            }}
          >
            {waveformBars.map((height, idx) => (
              <div
                key={idx}
                style={{
                  width: '3px',
                  height: `${height}%`,
                  background: idx === 18 ? '#D97706' : '#334155',
                  borderRadius: '1px',
                }}
              />
            ))}
          </div>

          {/* Yellow Needle Line */}
          <div
            style={{
              position: 'absolute',
              top: '4px',
              bottom: '4px',
              left: '37%',
              width: '1.5px',
              background: '#F59E0B',
              boxShadow: '0 0 6px rgba(245, 158, 11, 0.6)',
            }}
          />

          {/* Time Axis */}
          <div
            className="mono"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '9px',
              color: '#64748B',
              marginTop: '6px',
            }}
          >
            <span>00:00</span>
            <span>08:05</span>
          </div>
        </div>

        {/* Timers & Counters Boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div
            style={{
              background: '#0D1117',
              border: '1px solid #1E2532',
              borderRadius: '4px',
              padding: '6px 10px',
            }}
          >
            <div style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>Timers</div>
            <div className="mono" style={{ fontSize: '14px', fontWeight: '700', color: '#E2E8F0', marginTop: '2px' }}>
              21 h
            </div>
          </div>

          <div
            style={{
              background: '#0D1117',
              border: '1px solid #1E2532',
              borderRadius: '4px',
              padding: '6px 10px',
            }}
          >
            <div style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>Counters</div>
            <div className="mono" style={{ fontSize: '14px', fontWeight: '700', color: '#E2E8F0', marginTop: '2px' }}>
              6.3 as
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: HAZMAT NH3 Plume Vector Alerts */}
      <div
        className="tactical-card"
        style={{
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#E2E8F0' }}>
              HAZMAT NH3 Plume Vector Alerts
            </span>
          </div>
          <AlertTriangle size={14} color="#D97706" />
        </div>

        <p style={{ fontSize: '11px', color: '#8A99AD', lineHeight: '1.4', margin: 0 }}>
          Incident dispatch audio transcript timeline. New iterations HAZMAT NH3 plume vector alerts.
        </p>

        <ul style={{ fontSize: '11px', color: '#94A3B8', margin: '2px 0 0 16px', padding: 0, lineHeight: '1.4' }}>
          <li>Incident capnelen: HAZMAT NH3 plume vector</li>
          <li>Downwind cordon: 800m WNW @ 14 kts</li>
        </ul>

        <a
          href="#hazmat"
          onClick={(e) => e.preventDefault()}
          style={{ fontSize: '11px', color: '#3B82F6', textDecoration: 'none', fontWeight: '600', marginTop: '2px' }}
        >
          Learn more
        </a>
      </div>

      {/* Card 3: Incident Coordinator Notes */}
      <div
        className="tactical-card"
        style={{
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#E2E8F0' }}>
            Incident Coordinator Notes
          </span>
          <MoreHorizontal size={14} color="#64748B" style={{ cursor: 'pointer' }} />
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          style={{
            width: '100%',
            background: '#0D1117',
            border: '1px solid #1E2532',
            borderRadius: '4px',
            padding: '8px 10px',
            fontSize: '11px',
            color: '#CBD5E1',
            lineHeight: '1.45',
            resize: 'none',
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
}
