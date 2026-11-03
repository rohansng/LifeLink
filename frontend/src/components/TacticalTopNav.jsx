import React, { useState, useEffect } from 'react';
import { LayoutGrid, Map, ListChecks, Database, Activity, BarChart2, RotateCcw } from 'lucide-react';

export default function TacticalTopNav({
  activeTab = 'Dashboard',
  onSelectTab,
  onOpenEvaluation,
  onResetScenario,
}) {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'GIS Map', label: 'GIS Map', icon: Map },
    { id: 'Triage', label: 'Triage', icon: ListChecks },
    { id: 'Resources', label: 'Resources', icon: Database },
  ];

  return (
    <header
      style={{
        background: '#101419',
        borderBottom: '1px solid #232B36',
        padding: '8px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '46px',
        color: '#E2E8F0',
        userSelect: 'none',
      }}
    >
      {/* Left: System Title & Tactical Emblem */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 6px)',
            gap: '2px',
            opacity: 0.85,
          }}
        >
          <div style={{ width: '6px', height: '6px', background: '#94A3B8' }} />
          <div style={{ width: '6px', height: '6px', background: '#94A3B8' }} />
          <div style={{ width: '6px', height: '6px', background: '#94A3B8' }} />
          <div style={{ width: '6px', height: '6px', background: '#94A3B8' }} />
        </div>
        <div style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
          LIFELINK <span style={{ color: '#64748B', fontWeight: '400', margin: '0 4px' }}>-</span> MASS CASUALTY INCIDENT COMMAND
        </div>
      </div>

      {/* Center: Threat Level Status Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          background: '#14201A',
          border: '1px solid #1C3829',
          borderRadius: '16px',
          padding: '3px 12px',
          fontSize: '11px',
          fontWeight: '700',
          color: '#34D399',
          letterSpacing: '0.6px',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
        <span>LEVEL 1 MCI ACTIVE - METRO BENGALURU</span>
      </div>

      {/* Right: Time, Nav Tabs, and Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* Monospace Clock */}
        <div className="mono" style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#E2E8F0', fontWeight: '700' }}>{utcTime || '01:35:00 UTC'}</span>
          <span style={{ color: '#475569', fontSize: '10px' }}>UTC/LOCAL</span>
        </div>

        {/* View Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab && onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#FFFFFF' : '#8A99AD',
                  paddingBottom: '3px',
                  position: 'relative',
                  borderBottom: isActive ? '2px solid #E2E8F0' : '2px solid transparent',
                  background: 'transparent',
                }}
              >
                <Icon size={14} color={isActive ? '#FFFFFF' : '#8A99AD'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Evaluation Metrics & Reset Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid #232B36', paddingLeft: '12px' }}>
          <button
            onClick={onOpenEvaluation}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: '#1A2332',
              border: '1px solid #2B3A50',
              borderRadius: '4px',
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#93C5FD',
            }}
            title="Open Simulation Evaluation Benchmark"
          >
            <BarChart2 size={12} color="#60A5FA" />
            <span>Benchmark</span>
          </button>

          <button
            onClick={onResetScenario}
            style={{
              background: '#18202A',
              border: '1px solid #232B36',
              borderRadius: '4px',
              padding: '3px 6px',
              color: '#94A3B8',
            }}
            title="Reset Scenario to Initial State"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>
    </header>
  );
}
