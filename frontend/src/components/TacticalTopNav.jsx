import React, { useState, useEffect } from 'react';
import { LayoutGrid, Map, Users, Building2, Play, BarChart2, ShieldAlert } from 'lucide-react';

export default function TacticalTopNav({
  activeNavTab = 'Dashboard',
  onSelectNavTab,
  onOpenSimulation,
  onOpenEvaluation,
}) {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcString = now.toUTCString().split(' ')[4] + ' UTC';
      setUtcTime(utcString);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'GIS Map', label: 'GIS Map', icon: Map },
    { id: 'Triage', label: 'Triage', icon: Users },
    { id: 'Resources', label: 'Resources', icon: Building2 },
  ];

  return (
    <header
      style={{
        background: '#111418',
        borderBottom: '1px solid #2B323D',
        padding: '0 16px',
        height: '46px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        userSelect: 'none',
      }}
    >
      {/* Left Title & System Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '18px',
              height: '18px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '2px',
            }}
          >
            <span style={{ background: '#E2E8F0', borderRadius: '1px' }} />
            <span style={{ background: '#E2E8F0', borderRadius: '1px' }} />
            <span style={{ background: '#E2E8F0', borderRadius: '1px' }} />
            <span style={{ background: '#E2E8F0', borderRadius: '1px' }} />
          </div>
          <span
            style={{
              fontSize: '13px',
              fontWeight: '800',
              letterSpacing: '0.6px',
              color: '#E2E8F0',
              textTransform: 'uppercase',
            }}
          >
            LIFELINK — MASS CASUALTY INCIDENT COMMAND
          </span>
        </div>

        {/* Threat Level Badge */}
        <div
          style={{
            background: 'rgba(22, 101, 52, 0.25)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            borderRadius: '12px',
            padding: '2px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: '700',
            color: '#4ADE80',
            letterSpacing: '0.4px',
          }}
        >
          <span className="live-dot" />
          <span>LEVEL 1 MCI ACTIVE - METRO AREA</span>
        </div>
      </div>

      {/* Right Controls: Clock, Navigation Tabs & Direct Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* UTC / Local Clock */}
        <div
          className="mono"
          style={{
            fontSize: '11px',
            color: '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderRight: '1px solid #2B323D',
            paddingRight: '16px',
          }}
        >
          <span style={{ color: '#E2E8F0', fontWeight: '700' }}>{utcTime || '01:35:12 UTC'}</span>
          <span style={{ fontSize: '10px', color: '#64748B' }}>UTC/LOCAL</span>
        </div>

        {/* View Switcher Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', height: '46px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNavTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectNavTab && onSelectNavTab(item.id)}
                style={{
                  height: '46px',
                  padding: '0 14px',
                  background: 'transparent',
                  color: isActive ? '#E2E8F0' : '#94A3B8',
                  fontSize: '12px',
                  fontWeight: isActive ? '700' : '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderBottom: isActive ? '2px solid #2563EB' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                }}
              >
                <Icon size={14} color={isActive ? '#38BDF8' : '#94A3B8'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onOpenSimulation}
            style={{
              background: '#1A202C',
              border: '1px solid #2B323D',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: '700',
              color: '#38BDF8',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
            title="Execute 5-Event Disruption Simulation"
          >
            <Play size={12} fill="#38BDF8" />
            <span>Simulation Suite</span>
          </button>

          <button
            onClick={onOpenEvaluation}
            style={{
              background: '#1A202C',
              border: '1px solid #2B323D',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: '700',
              color: '#4ADE80',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
            title="View Simulation Evaluation Benchmark Metrics"
          >
            <BarChart2 size={12} />
            <span>Metrics</span>
          </button>
        </div>
      </div>
    </header>
  );
}
