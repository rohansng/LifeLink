import React from 'react';
import { Clock, Radio, Activity, ShieldAlert, Truck, Building2 } from 'lucide-react';

export default function TimelinePanel({ timeline }) {
  const getCategoryBadge = (category) => {
    switch (category) {
      case 'DISPATCH':
        return { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', icon: Truck };
      case 'COMMAND':
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: Radio };
      case 'TRIAGE':
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: Activity };
      case 'HOSPITAL':
        return { color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', icon: Building2 };
      case 'OBSTACLE':
        return { color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', icon: ShieldAlert };
      default:
        return { color: '#94a3b8', bg: 'rgba(255, 255, 255, 0.08)', icon: Clock };
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="var(--text-secondary)" />
          <h2 style={{ fontSize: '15px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
            Incident Operations Timeline
          </h2>
        </div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          7 LOGGED EVENTS
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '14px' }}>
        {/* Continuous vertical timeline connector line */}
        <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '19px', width: '2px', background: 'var(--border-color)', zIndex: 1 }} />

        {timeline.map((event, idx) => {
          const badge = getCategoryBadge(event.category);
          const Icon = badge.icon;

          return (
            <div key={idx} style={{ display: 'flex', gap: '14px', marginBottom: '14px', position: 'relative', zIndex: 2 }}>
              {/* Category Node Icon */}
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: badge.bg,
                border: `1.5px solid ${badge.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
              }}>
                <Icon size={12} color={badge.color} />
              </div>

              {/* Event Content */}
              <div style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '8px 12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#f8fafc' }}>
                    {event.title}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '9px', fontWeight: '700', padding: '1px 5px', borderRadius: '3px', background: badge.bg, color: badge.color }}>
                      {event.category}
                    </span>
                    <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {event.time}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                  {event.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
