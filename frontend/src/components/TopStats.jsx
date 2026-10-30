import React from 'react';
import { Users, AlertCircle, Truck, Building2, BedDouble, UserX } from 'lucide-react';

export default function TopStats({ stats }) {
  const statCards = [
    {
      label: "VICTIMS TRACKED",
      value: stats.totalVictims,
      subtext: "214 accounted across 3 zones",
      icon: Users,
      color: "var(--accent-blue)",
      borderLeft: "none",
      pulse: false,
    },
    {
      label: "CRITICAL (RED)",
      value: stats.critical,
      subtext: "Immediate life threat (START)",
      icon: AlertCircle,
      color: "var(--triage-red)",
      borderLeft: "4px solid var(--triage-red)",
      pulse: true,
      highlight: true,
    },
    {
      label: "AMBULANCES READY",
      value: `${stats.activeAmbulances} / ${stats.totalAmbulances}`,
      subtext: "100% fleet committed to scene",
      icon: Truck,
      color: "#38bdf8",
      borderLeft: "none",
      pulse: false,
    },
    {
      label: "RECEIVING HOSPITALS",
      value: stats.totalHospitals,
      subtext: "Trauma Centers in corridor",
      icon: Building2,
      color: "var(--accent-violet)",
      borderLeft: "none",
      pulse: false,
    },
    {
      label: "AVAILABLE ICU BEDS",
      value: stats.totalIcuBeds,
      subtext: "Critical deficit across network",
      icon: BedDouble,
      color: stats.totalIcuBeds <= 4 ? "var(--triage-red)" : "var(--triage-green)",
      borderLeft: "4px solid var(--triage-red)",
      pulse: true,
      highlight: true,
    },
    {
      label: "UNASSIGNED CRITICAL",
      value: stats.unassignedCritical,
      subtext: "Awaiting transport triage",
      icon: UserX,
      color: "#f43f5e",
      borderLeft: "4px solid #f43f5e",
      pulse: true,
      highlight: true,
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px' }}>
      {statCards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: '16px',
              borderLeft: card.borderLeft,
              background: card.highlight ? 'rgba(239, 68, 68, 0.04)' : 'var(--bg-card)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {card.pulse && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: card.color,
                  boxShadow: `0 0 8px ${card.color}`,
                  animation: 'pulseGlow 1.5s infinite ease-in-out',
                }}
              />
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <IconComponent size={16} color={card.color} />
              <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                {card.label}
              </div>
            </div>

            <div className="mono" style={{ fontSize: '26px', fontWeight: '800', color: card.color, lineHeight: '1.1' }}>
              {card.value}
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
