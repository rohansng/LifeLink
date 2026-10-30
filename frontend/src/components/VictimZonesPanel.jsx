import React from 'react';
import { AlertCircle, ShieldAlert, MapPin } from 'lucide-react';

export default function VictimZonesPanel({ victimZones = [], onSelectZone }) {
  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} color="var(--triage-red)" />
          <h2 style={{ fontSize: '15px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
            Victim Sectors & Triage (214 Tracked)
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '11px', fontWeight: '600' }}>
          <span style={{ color: 'var(--triage-red)' }}>31 Red</span>
          <span>•</span>
          <span style={{ color: 'var(--triage-yellow)' }}>67 Yellow</span>
          <span>•</span>
          <span style={{ color: 'var(--triage-green)' }}>82 Green</span>
          <span>•</span>
          <span style={{ color: 'var(--text-muted)' }}>34 Unknown</span>
        </div>
      </div>

      <div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Triage Acuity Proportion (START Protocol)</span>
          <span className="mono">214 Casualties</span>
        </div>
        <div style={{ height: '8px', borderRadius: '4px', overflow: 'hidden', display: 'flex', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ width: `${(31 / 214) * 100}%`, background: 'var(--triage-red)' }} title="Critical (31)" />
          <div style={{ width: `${(67 / 214) * 100}%`, background: 'var(--triage-yellow)' }} title="Serious (67)" />
          <div style={{ width: `${(82 / 214) * 100}%`, background: 'var(--triage-green)' }} title="Moderate (82)" />
          <div style={{ width: `${(34 / 214) * 100}%`, background: 'var(--triage-black)' }} title="Unknown in Rubble (34)" />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {victimZones.map((zone) => {
          const total = zone.total_victims ?? zone.totalVictims ?? 0;
          const crit = zone.critical_count ?? zone.triage?.critical ?? 0;
          const ser = zone.serious_count ?? zone.triage?.serious ?? 0;
          const mod = zone.moderate_count ?? zone.triage?.moderate ?? 0;
          const unk = zone.unknown_count ?? zone.triage?.unknown ?? 0;
          const access = zone.access_status ?? zone.accessStatus ?? 'RESTRICTED';

          return (
            <div
              key={zone.id}
              onClick={() => onSelectZone && onSelectZone(zone)}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="var(--triage-red)" />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>
                    {zone.name}
                  </span>
                </div>
                <span className="mono" style={{ fontSize: '13px', fontWeight: '800', color: 'var(--triage-red)' }}>
                  {total} Victims
                </span>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {zone.description}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', background: 'rgba(0,0,0,0.25)', padding: '6px 10px', borderRadius: '4px', fontSize: '11px', textAlign: 'center', marginBottom: '6px' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '9px' }}>CRITICAL</div>
                  <div className="mono" style={{ color: 'var(--triage-red)', fontWeight: '800' }}>{crit}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '9px' }}>SERIOUS</div>
                  <div className="mono" style={{ color: 'var(--triage-yellow)', fontWeight: '800' }}>{ser}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '9px' }}>MODERATE</div>
                  <div className="mono" style={{ color: 'var(--triage-green)', fontWeight: '800' }}>{mod}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '9px' }}>UNKNOWN</div>
                  <div className="mono" style={{ color: 'var(--text-muted)', fontWeight: '800' }}>{unk}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
                <span style={{ color: '#fca5a5' }}>⚠️ {zone.hazard}</span>
                <span style={{ color: 'var(--text-muted)' }}>{access}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
