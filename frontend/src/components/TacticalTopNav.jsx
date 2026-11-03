import React, { useState, useEffect } from 'react';
import { LayoutGrid, Map, ListChecks, Database, Activity, BarChart2, RotateCcw, Play, Zap, RefreshCw } from 'lucide-react';

export default function TacticalTopNav({
  activeTab = 'Dashboard',
  onSelectTab,
  onOpenEvaluation,
  onResetScenario,
  onRunDemo,
  onToggleDirectives,
  showDirectives = false,
  isSimulating = false,
  simulationStep = 0,
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
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '46px',
        color: '#E2E8F0',
        userSelect: 'none',
        flexWrap: 'nowrap',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Monospace Clock */}
        <div className="mono" style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#E2E8F0', fontWeight: '700' }}>{utcTime || '01:35:00 UTC'}</span>
          <span style={{ color: '#475569', fontSize: '10px' }}>UTC/LOCAL</span>
        </div>

        {/* View Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
                  gap: '5px',
                  fontSize: '12px',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#FFFFFF' : '#8A99AD',
                  paddingBottom: '3px',
                  position: 'relative',
                  borderBottom: isActive ? '2px solid #E2E8F0' : '2px solid transparent',
                  background: 'transparent',
                }}
              >
                <Icon size={13} color={isActive ? '#FFFFFF' : '#8A99AD'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Actions (Demo Runner + Directives + Benchmark + Reset) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderLeft: '1px solid #232B36', paddingLeft: '10px' }}>
          {/* 5-Step Demo Simulation Runner */}
          <button
            onClick={onRunDemo}
            disabled={isSimulating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: isSimulating ? '#1E293B' : '#DC2626',
              color: '#FFFFFF',
              border: '1px solid',
              borderColor: isSimulating ? '#334155' : '#EF4444',
              borderRadius: '4px',
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: isSimulating ? 'not-allowed' : 'pointer',
            }}
            title="Advance Scenario (Event 1 through 5)"
          >
            {isSimulating ? <RefreshCw size={11} className="spin" /> : <Play size={11} fill="#FFFFFF" />}
            <span>{simulationStep > 0 ? `Step ${simulationStep}/5` : 'Run 5-Step Demo'}</span>
          </button>

          {/* Commander Directives Drawer Toggle */}
          <button
            onClick={onToggleDirectives}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: showDirectives ? '#2563EB' : '#1A2332',
              color: showDirectives ? '#FFFFFF' : '#93C5FD',
              border: '1px solid',
              borderColor: showDirectives ? '#3B82F6' : '#2B3A50',
              borderRadius: '4px',
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: '600',
            }}
            title="Toggle OR-Tools MILP Directives & Replanning Loop"
          >
            <Zap size={11} />
            <span>Directives</span>
          </button>

          {/* Evaluation Benchmark */}
          <button
            onClick={onOpenEvaluation}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
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
            <BarChart2 size={11} color="#60A5FA" />
            <span>Benchmark</span>
          </button>

          {/* Reset Scenario Button */}
          <button
            onClick={onResetScenario}
            style={{
              background: '#18202A',
              border: '1px solid #232B36',
              borderRadius: '4px',
              padding: '3px 6px',
              color: '#94A3B8',
            }}
            title="Reset Scenario to Initial Seed"
          >
            <RotateCcw size={11} />
          </button>
        </div>
      </div>
    </header>
  );
}
