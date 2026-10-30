import React from 'react';
import { Truck, Clock, ShieldCheck, Activity } from 'lucide-react';

export default function AmbulancesPanel({ ambulances, onSelectAmbulance }) {
  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={18} color="#38bdf8" />
          <h2 style={{ fontSize: '15px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
            EMS Ambulances (5 Active)
          </h2>
        </div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
          100% DEPLOYED
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {ambulances.map((amb) => {
          const isALS = amb.type.includes('ALS');
          const isTransporting = amb.status === 'TRANSPORTING';

          return (
            <div
              key={amb.id}
              onClick={() => onSelectAmbulance && onSelectAmbulance(amb)}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = isALS ? 'rgba(139, 92, 246, 0.6)' : 'rgba(56, 189, 248, 0.6)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="mono" style={{ fontSize: '14px', fontWeight: '800', color: '#f8fafc' }}>
                    {amb.callsign}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: isALS ? 'rgba(139, 92, 246, 0.2)' : 'rgba(13, 148, 136, 0.2)',
                    color: isALS ? 'var(--accent-violet)' : '#2dd4bf',
                    border: `1px solid ${isALS ? 'rgba(139, 92, 246, 0.4)' : 'rgba(13, 148, 136, 0.4)'}`,
                  }}>
                    {amb.type}
                  </span>
                </div>

                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: isTransporting ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                  color: isTransporting ? '#fbbf24' : '#38bdf8',
                }}>
                  {amb.status}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target:</span> <strong>{amb.assignedTo}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>Lead: {amb.crewLead}</span>
                <span className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>
                  ETA: {amb.etaSceneMinutes !== undefined ? `${amb.etaSceneMinutes}m to scene` : `${amb.etaHospitalMinutes}m to hosp`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
