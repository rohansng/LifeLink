import React from 'react';
import { Building2, Bed, Scissors, Droplet, Clock } from 'lucide-react';

export default function HospitalsPanel({ hospitals, onSelectHospital }) {
  const totalIcuOpen = hospitals.reduce((sum, h) => sum + h.icuBedsAvailable, 0);

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={18} color="var(--accent-blue)" />
          <h2 style={{ fontSize: '15px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
            Receiving Hospitals (3)
          </h2>
        </div>
        <div className="mono" style={{ fontSize: '12px', color: 'var(--triage-red)', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
          TOTAL ICU OPEN: {totalIcuOpen} / 62
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {hospitals.map((hosp) => (
          <div
            key={hosp.id}
            onClick={() => onSelectHospital && onSelectHospital(hosp)}
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.5)';
              e.currentTarget.style.background = 'rgba(56, 189, 248, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
            }}
          >
            {/* Hospital Title & Type */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc' }}>
                  {hosp.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {hosp.type} • {hosp.distanceKm} km
                </div>
              </div>

              {/* ICU Badge */}
              <div style={{ textAlign: 'right' }}>
                <span className="mono" style={{
                  fontSize: '13px',
                  fontWeight: '800',
                  color: hosp.icuBedsAvailable > 1 ? 'var(--triage-green)' : 'var(--triage-red)',
                  background: hosp.icuBedsAvailable > 1 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${hosp.icuBedsAvailable > 1 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  padding: '3px 8px',
                  borderRadius: '4px',
                }}>
                  {hosp.icuBedsAvailable} ICU OPEN
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', fontSize: '11px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Bed size={13} color="var(--text-muted)" />
                <span>Total ICU: <strong>{hosp.icuTotalBeds}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Scissors size={13} color="var(--text-muted)" />
                <span>OR Suites: <strong>{hosp.operatingRoomsOpen}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Droplet size={13} color="var(--triage-red)" />
                <span>O-Neg: <strong>{hosp.bloodUnitsONeg} units</strong></span>
              </div>
            </div>

            {/* Specialties & ETA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Specialties:</span> {hosp.specialties.join(', ')}
              </div>
              <div className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} />
                <span>ETA: {hosp.etaMinutes}m</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
