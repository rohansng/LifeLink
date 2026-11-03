import React, { useState } from 'react';
import { Bed, Droplet, MoreHorizontal, ChevronDown, Sparkles } from 'lucide-react';

export default function HospitalFleetPanel({ hospitals = [], ambulances = [], onSelectHospital }) {
  const [filterMode, setFilterMode] = useState('ICU'); // 'ICU' | 'BLOOD'

  const sampleHospitals = [
    {
      name: 'METRO GENERAL - ICU: 2 left',
      alias: 'MANIPAL APEX HAL',
      type: 'bed',
      col1: { icu: 1, or: 1, blood: 0 },
      col2: { icu: 2, or: 1, blood: 1 },
      col3: { icu: 60, or: 1, blood: 1 },
    },
    {
      name: 'METRO GENERAL - ICU: 2 left',
      alias: 'APOLLO REGIONAL',
      type: 'bed',
      col1: { icu: 0, or: 1, blood: 0 },
      col2: { icu: 2, or: 1, blood: 1 },
      col3: { icu: 60, or: 1, blood: 1 },
    },
    {
      name: 'METRO GENERAL - ICU: 2 left',
      alias: 'VICTORIA SPECIALIZED',
      type: 'blood',
      col1: { icu: 0, or: 1, blood: 0 },
      col2: { icu: 0, or: 1, blood: 1 },
      col3: { icu: 30, or: 1, blood: 1 },
    },
  ];

  const dispatchList = [
    { name: 'Ambulance Dispatch 1', callsign: 'Medic 1 (ALS)', status: 'Queued' },
    { name: 'Ambulance Dispatch 2', callsign: 'Medic 2 (ALS)', status: 'Queued' },
    { name: 'Ambulance Dispatch 3', callsign: 'Medic 3 (BLS)', status: 'Queued' },
    { name: 'Ambulance Dispatch 4', callsign: 'Medic 4 (ALS)', status: 'Queued' },
  ];

  const queueRatios = [
    { name: 'METRO GENERAL - ICU: 1 left', subtitle: 'Queuing queue', ratio: '5/18' },
    { name: 'METRO GENERAL - ICU: 1 left', subtitle: 'Queuing queue', ratio: '5/12' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        height: '100%',
        minWidth: '270px',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#E2E8F0', letterSpacing: '-0.2px', margin: 0 }}>
          Hospital Status & Transport Fleet
        </h3>
      </div>

      {/* 1. Hospital Capacity Section */}
      <div
        className="tactical-card"
        style={{
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#CBD5E1' }}>Hospital Capacity</span>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setFilterMode('ICU')}
              style={{
                background: filterMode === 'ICU' ? '#1E293B' : 'transparent',
                border: '1px solid',
                borderColor: filterMode === 'ICU' ? '#3B82F6' : '#232B36',
                borderRadius: '3px',
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: '600',
                color: filterMode === 'ICU' ? '#93C5FD' : '#64748B',
              }}
            >
              ICU beds, OR
            </button>
            <button
              onClick={() => setFilterMode('BLOOD')}
              style={{
                background: filterMode === 'BLOOD' ? '#1E293B' : 'transparent',
                border: '1px solid',
                borderColor: filterMode === 'BLOOD' ? '#3B82F6' : '#232B36',
                borderRadius: '3px',
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: '600',
                color: filterMode === 'BLOOD' ? '#93C5FD' : '#64748B',
              }}
            >
              Blood supply
            </button>
          </div>
        </div>

        {/* Hospital Mini-Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {sampleHospitals.map((hosp, idx) => (
            <div
              key={idx}
              onClick={() => onSelectHospital && onSelectHospital(hosp)}
              style={{
                background: '#0D1117',
                border: '1px solid #1C2330',
                borderRadius: '4px',
                padding: '7px 9px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span className="mono" style={{ fontSize: '10.5px', fontWeight: '700', color: '#CBD5E1' }}>
                  {hosp.name}
                </span>
                {hosp.type === 'bed' ? (
                  <Bed size={12} color="#64748B" />
                ) : (
                  <Droplet size={12} color="#DC2626" fill="#DC2626" />
                )}
              </div>

              {/* 3-Column Metrics Row */}
              <div
                className="mono"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '6px',
                  fontSize: '9.5px',
                  color: '#8A99AD',
                  lineHeight: '1.35',
                }}
              >
                <div>
                  <div>ICU beds: {hosp.col1.icu}</div>
                  <div>OR status: {hosp.col1.or}</div>
                  <div>Blood supply: {hosp.col1.blood}</div>
                </div>
                <div>
                  <div>ICU beds: {hosp.col2.icu}</div>
                  <div>OR status: {hosp.col2.or}</div>
                  <div>Blood supply: {hosp.col2.blood}</div>
                </div>
                <div>
                  <div>ICU beds: {hosp.col3.icu}</div>
                  <div>OR status: {hosp.col3.or}</div>
                  <div>Blood supply: {hosp.col3.blood}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Ambulance / Air Transport Dispatch */}
      <div
        className="tactical-card"
        style={{
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#CBD5E1' }}>
            Ambulance/Air Transport Dispatch
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '2px' }}>
              Status <ChevronDown size={10} />
            </span>
            <MoreHorizontal size={12} color="#64748B" />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {dispatchList.map((amb, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 6px',
                background: '#0D1117',
                border: '1px solid #161D27',
                borderRadius: '3px',
                fontSize: '11px',
              }}
            >
              <span style={{ color: '#CBD5E1', fontSize: '10.5px' }}>{amb.name}</span>
              <span
                className="mono"
                style={{
                  fontSize: '9.5px',
                  fontWeight: '700',
                  color: '#94A3B8',
                  background: '#18202A',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  border: '1px solid #232B36',
                }}
              >
                {amb.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Queuing Queues */}
      <div
        className="tactical-card"
        style={{
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flex: 1,
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#CBD5E1' }}>
          Queuing Queues
        </div>

        <div
          className="mono"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '9.5px',
            color: '#64748B',
            textTransform: 'uppercase',
            fontWeight: '700',
            borderBottom: '1px solid #1E2532',
            paddingBottom: '4px',
          }}
        >
          <span>Patient ID</span>
          <span>Status</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {queueRatios.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 6px',
                background: '#0D1117',
                border: '1px solid #161D27',
                borderRadius: '3px',
                fontSize: '11px',
              }}
            >
              <div>
                <div className="mono" style={{ fontSize: '10px', color: '#CBD5E1', fontWeight: '600' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '9px', color: '#64748B' }}>{item.subtitle}</div>
              </div>

              <span className="mono" style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8' }}>
                {item.ratio}
              </span>
            </div>
          ))}
        </div>

        {/* Tactical 4-Point Star Emblem */}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
          <Sparkles size={16} color="#475569" style={{ opacity: 0.6 }} />
        </div>
      </div>
    </div>
  );
}
