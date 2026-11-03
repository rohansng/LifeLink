import React, { useState } from 'react';
import { Building2, Truck, Droplet, Activity, MoreHorizontal, Sparkles } from 'lucide-react';

export default function HospitalFleetPanel({ hospitals = [], ambulances = [] }) {
  const [capacityTab, setCapacityTab] = useState('ICU_OR'); // 'ICU_OR' | 'BLOOD'

  const defaultHospitals = [
    {
      id: 'H-A',
      name: 'METRO GENERAL',
      icuLeft: 0,
      icuTotal: 28,
      orStatus: '0/4 Active',
      bloodSupply: '18 Units (O-)',
      criticalSurge: true,
    },
    {
      id: 'H-B',
      name: 'ST. JUDE REGIONAL',
      icuLeft: 1,
      icuTotal: 18,
      orStatus: '1/3 Active',
      bloodSupply: '3 Units (O- Deficit)',
      criticalSurge: false,
    },
    {
      id: 'H-C',
      name: 'HARBORVIEW MEMORIAL',
      icuLeft: 3,
      icuTotal: 20,
      orStatus: '3/3 Ready',
      bloodSupply: '25 Units (O- Reserve)',
      criticalSurge: false,
    },
  ];

  const defaultAmbulances = [
    { callsign: 'Ambulance Dispatch 1', unit: 'Medic 1 (ALS)', status: 'Queued', dest: 'Sector Alpha' },
    { callsign: 'Ambulance Dispatch 2', unit: 'Medic 2 (ALS)', status: 'Queued', dest: 'Sector Bravo' },
    { callsign: 'Ambulance Dispatch 3', unit: 'Medic 3 (BLS)', status: 'Queued', dest: 'Sector Charlie' },
    { callsign: 'Ambulance Dispatch 4', unit: 'Medic 4 (ALS)', status: 'In Transit', dest: 'St. Jude (V083)' },
  ];

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
      {/* Top Header */}
      <div className="defense-card-header">
        <span>Hospital Status & Transport Fleet</span>
        <span className="mono" style={{ fontSize: '10px', color: '#64748B' }}>
          3 HOSPITALS • 5 AMB
        </span>
      </div>

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
        {/* Card 1: Hospital Capacity */}
        <div className="defense-card" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#E2E8F0' }}>Hospital Capacity</span>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', background: '#0B0E13', borderRadius: '3px', padding: '1px', border: '1px solid #2B323D' }}>
              <button
                onClick={() => setCapacityTab('ICU_OR')}
                style={{
                  background: capacityTab === 'ICU_OR' ? '#1A202C' : 'transparent',
                  color: capacityTab === 'ICU_OR' ? '#E2E8F0' : '#64748B',
                  fontSize: '9px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '2px',
                }}
              >
                ICU beds, OR
              </button>
              <button
                onClick={() => setCapacityTab('BLOOD')}
                style={{
                  background: capacityTab === 'BLOOD' ? '#1A202C' : 'transparent',
                  color: capacityTab === 'BLOOD' ? '#E2E8F0' : '#64748B',
                  fontSize: '9px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '2px',
                }}
              >
                Blood supply
              </button>
            </div>
          </div>

          {/* Hospital rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {defaultHospitals.map((h) => (
              <div
                key={h.id}
                style={{
                  background: '#0B0E13',
                  border: '1px solid #2B323D',
                  borderRadius: '4px',
                  padding: '7px 9px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#E2E8F0' }}>
                    {h.name} — <span style={{ color: h.icuLeft > 0 ? '#4ADE80' : '#F87171' }}>ICU: {h.icuLeft} left</span>
                  </span>
                  <Building2 size={12} color="#94A3B8" />
                </div>

                <div
                  className="mono"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    fontSize: '9px',
                    color: '#94A3B8',
                    gap: '4px',
                    marginTop: '2px',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748B' }}>ICU beds: </span>
                    <strong style={{ color: h.icuLeft > 0 ? '#E2E8F0' : '#F87171' }}>{h.icuLeft}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>OR status: </span>
                    <strong style={{ color: '#E2E8F0' }}>{h.orStatus.split(' ')[0]}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Blood: </span>
                    <strong style={{ color: h.criticalSurge ? '#FBBF24' : '#E2E8F0' }}>{h.bloodSupply.split(' ')[0]}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Ambulance / Air Transport Dispatch */}
        <div className="defense-card" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#E2E8F0' }}>Ambulance/Air Transport Dispatch</span>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <span className="badge-queued" style={{ fontSize: '8px', padding: '1px 4px' }}>Status</span>
              <MoreHorizontal size={13} color="#64748B" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {defaultAmbulances.map((amb, idx) => (
              <div
                key={idx}
                style={{
                  background: '#0B0E13',
                  border: '1px solid #2B323D',
                  borderRadius: '4px',
                  padding: '6px 9px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#E2E8F0' }}>{amb.callsign}</span>
                  <span style={{ fontSize: '9px', color: '#64748B' }}>{amb.unit} • {amb.dest}</span>
                </div>
                <span
                  className={amb.status === 'In Transit' ? 'badge-tactical' : 'badge-queued'}
                  style={{
                    background: amb.status === 'In Transit' ? '#1E3A8A' : '#1E293B',
                    color: amb.status === 'In Transit' ? '#60A5FA' : '#94A3B8',
                    border: '1px solid #334155',
                    fontSize: '9px',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontWeight: '700',
                  }}
                >
                  {amb.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Queuing Queues */}
        <div className="defense-card" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#E2E8F0' }}>Queuing Queues</span>
            <Sparkles size={13} color="#38BDF8" />
          </div>

          <div
            className="mono"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              color: '#64748B',
              borderBottom: '1px solid #2B323D',
              paddingBottom: '4px',
            }}
          >
            <span>Patient ID / Facility</span>
            <span>Status</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
              <span style={{ color: '#CBD5E1' }}>METRO GENERAL - ICU: 0 left</span>
              <span className="mono" style={{ color: '#F87171', fontWeight: '700' }}>5/18 (QUEUE)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
              <span style={{ color: '#CBD5E1' }}>ST. JUDE - ICU: 1 left</span>
              <span className="mono" style={{ color: '#FBBF24', fontWeight: '700' }}>5/12 (QUEUE)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
              <span style={{ color: '#CBD5E1' }}>HARBORVIEW - ICU: 3 left</span>
              <span className="mono" style={{ color: '#4ADE80', fontWeight: '700' }}>2/20 (ADMITTING)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
