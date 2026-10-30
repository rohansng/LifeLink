import React from 'react';
import { Users, AlertCircle, Truck, Building2, BedDouble, UserX } from 'lucide-react';

export default function TopStats({ stats = {} }) {
  const totalVictims = stats.total_victims ?? stats.totalVictims ?? 214;
  const critical = stats.critical ?? 31;
  const totalAmbulances = stats.total_ambulances ?? stats.totalAmbulances ?? 5;
  const activeAmbulances = stats.active_ambulances ?? stats.activeAmbulances ?? 5;
  const totalHospitals = stats.total_hospitals ?? stats.totalHospitals ?? 3;
  const totalIcuBeds = stats.total_icu_beds ?? stats.totalIcuBeds ?? 4;
  const unassignedCritical = stats.unassigned_critical ?? stats.unassignedCritical ?? 27;

  const statCards = [
    {
      label: 'VICTIMS TRACKED',
      value: totalVictims,
      subtext: 'Accounted in disaster grid',
      icon: Users,
      color: 'var(--accent-cyan-bright)',
      badge: 'CENSUS',
      badgeBg: 'rgba(56, 189, 248, 0.15)',
      badgeColor: '#38bdf8',
      pulse: false,
    },
    {
      label: 'CRITICAL (RED)',
      value: critical,
      subtext: 'Immediate life threat (START)',
      icon: AlertCircle,
      color: 'var(--triage-red-bright)',
      badge: 'IMMEDIATE',
      badgeBg: 'rgba(239, 68, 68, 0.2)',
      badgeColor: '#f87171',
      pulse: true,
      highlight: true,
    },
    {
      label: 'AMBULANCES ACTIVE',
      value: `${activeAmbulances} / ${totalAmbulances}`,
      subtext: '100% of fleet deployed',
      icon: Truck,
      color: '#38bdf8',
      badge: 'FLEET',
      badgeBg: 'rgba(56, 189, 248, 0.15)',
      badgeColor: '#38bdf8',
      pulse: false,
    },
    {
      label: 'RECEIVING HOSPITALS',
      value: totalHospitals,
      subtext: 'Regional trauma network',
      icon: Building2,
      color: 'var(--accent-violet)',
      badge: 'FACILITIES',
      badgeBg: 'rgba(139, 92, 246, 0.15)',
      badgeColor: '#c4b5fd',
      pulse: false,
    },
    {
      label: 'AVAILABLE ICU BEDS',
      value: totalIcuBeds,
      subtext: 'Regional surge shortage',
      icon: BedDouble,
      color: totalIcuBeds <= 4 ? '#ef4444' : '#10b981',
      badge: totalIcuBeds <= 4 ? 'DEFICIT' : 'STABLE',
      badgeBg: totalIcuBeds <= 4 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
      badgeColor: totalIcuBeds <= 4 ? '#f87171' : '#34d399',
      pulse: totalIcuBeds <= 4,
      highlight: totalIcuBeds <= 4,
    },
    {
      label: 'UNASSIGNED CRITICAL',
      value: unassignedCritical,
      subtext: 'Awaiting transport triage',
      icon: UserX,
      color: '#f87171',
      badge: 'BOTTLENECK',
      badgeBg: 'rgba(239, 68, 68, 0.25)',
      badgeColor: '#fca5a5',
      pulse: true,
      highlight: true,
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
      {statCards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: '14px 16px',
              background: card.highlight
                ? 'linear-gradient(135deg, rgba(30, 20, 25, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
                : 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(20, 28, 48, 0.85) 100%)',
              border: card.highlight
                ? '1px solid rgba(239, 68, 68, 0.45)'
                : '1px solid var(--border-color)',
              boxShadow: card.highlight
                ? '0 4px 20px rgba(239, 68, 68, 0.15)'
                : '0 4px 16px rgba(0, 0, 0, 0.4)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Top row with icon & badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconComponent size={16} color={card.color} />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.6px',
                    textTransform: 'uppercase',
                  }}
                >
                  {card.label}
                </span>
              </div>

              <span
                className="mono"
                style={{
                  fontSize: '9px',
                  fontWeight: '800',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  background: card.badgeBg,
                  color: card.badgeColor,
                  border: `1px solid ${card.badgeColor}33`,
                }}
              >
                {card.badge}
              </span>
            </div>

            {/* Big Figure */}
            <div
              className="mono"
              style={{
                fontSize: '28px',
                fontWeight: '900',
                color: card.highlight ? card.color : '#f8fafc',
                margin: '8px 0 2px 0',
                letterSpacing: '-0.5px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '6px',
              }}
            >
              {card.value}
              {card.pulse && (
                <span className="live-indicator" style={{ width: '7px', height: '7px', transform: 'translateY(-6px)' }} />
              )}
            </div>

            {/* Subtext */}
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
