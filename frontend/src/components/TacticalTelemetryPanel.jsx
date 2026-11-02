import React from 'react';
import { Radio, Wind, AlertOctagon, ShieldCheck, Activity, Terminal, Waves, Flame } from 'lucide-react';

export default function TacticalTelemetryPanel() {
  const radioLogs = [
    {
      time: '11:54:12',
      unit: 'Medic 4',
      dest: 'St. Jude Regional',
      color: '#38bdf8',
      message: 'Patient V083 loaded. Severe pelvic crush + arterial bleed. ETA 13 min via Grand Ave contraflow.',
    },
    {
      time: '11:51:40',
      unit: 'Incident Commander',
      dest: 'All Response Units',
      color: '#ef4444',
      message: 'Overpass 4 fuel tanker explosion confirmed. Route A severed. All units divert to Corridor B.',
    },
    {
      time: '11:48:22',
      unit: 'Alpha Heavy Rescue',
      dest: 'Field Triage Staging',
      color: '#fbbf24',
      message: 'Extrication team deploying hydraulic spreaders in Warehouse B collapsed machinery sector.',
    },
    {
      time: '11:45:08',
      unit: 'Harborview Medical',
      dest: 'Regional Dispatch',
      color: '#34d399',
      message: 'On-call Level 1 trauma team fully assembled. Operating suite 3 & ICU bed ready for surge.',
    },
  ];

  return (
    <div
      className="glass-panel"
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        background: 'linear-gradient(180deg, rgba(13, 19, 34, 0.95) 0%, rgba(9, 13, 24, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={17} color="var(--accent-cyan-bright)" />
          <h2 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '-0.3px', margin: 0 }}>
            On-Scene Crisis Telemetry & Dispatch Wire
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="live-indicator-cyan" style={{ width: '6px', height: '6px' }} />
          <span className="mono" style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700' }}>
            HAZMAT LEVEL B • SENSORS LIVE
          </span>
        </div>
      </div>

      {/* Atmospheric & Hazard Plume Sensors */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
        }}
      >
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '6px',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
            <Flame size={12} color="#ef4444" />
            <span>Hazard Type</span>
          </div>
          <div className="mono" style={{ fontSize: '12px', fontWeight: '800', color: '#f87171' }}>
            NH₃ Ammonia Vapor
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>UN 1005 (Pressurized)</span>
        </div>

        <div
          style={{
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '6px',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
            <Wind size={12} color="#38bdf8" />
            <span>Surface Wind</span>
          </div>
          <div className="mono" style={{ fontSize: '12px', fontWeight: '800', color: '#38bdf8' }}>
            14 kts WNW
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Plume Vector → Bravo</span>
        </div>

        <div
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '6px',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
            <AlertOctagon size={12} color="#f59e0b" />
            <span>Hazard Perimeter</span>
          </div>
          <div className="mono" style={{ fontSize: '12px', fontWeight: '800', color: '#fbbf24' }}>
            800m Exclusion
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Hot Zone Cordoned</span>
        </div>

        <div
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '6px',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
            <ShieldCheck size={12} color="#34d399" />
            <span>Doctrine Active</span>
          </div>
          <div className="mono" style={{ fontSize: '12px', fontWeight: '800', color: '#34d399' }}>
            START + MILP
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Definitive Care Lock</span>
        </div>
      </div>

      {/* Real-Time Radio Intercepts / Operational Wire */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Terminal size={12} color="var(--accent-cyan-bright)" />
          <span>Real-Time Incident Dispatch Audio Wire</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {radioLogs.map((log, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '6px',
                padding: '7px 10px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '11px',
              }}
            >
              <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }}>
                {log.time}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: '800', color: log.color, fontSize: '11px' }}>
                    {log.unit}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>──►</span>
                  <span className="mono" style={{ fontSize: '10px', color: '#94a3b8' }}>
                    {log.dest}
                  </span>
                </div>
                <p style={{ margin: 0, color: '#cbd5e1', lineHeight: '1.35', fontSize: '11px' }}>
                  {log.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

