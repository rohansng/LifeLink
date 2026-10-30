import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, ShieldAlert, Activity } from 'lucide-react';

export default function Header({ incident }) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="glass-panel" style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Top Banner Disclaimer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <ShieldAlert size={14} color="#f59e0b" />
          <span style={{ fontWeight: '600', color: '#f59e0b', letterSpacing: '0.5px' }}>SIMULATION ENVIRONMENT</span>
          <span>•</span>
          <span>SYNTHETIC EMERGENCY RESPONSE DATA ONLY</span>
          <span>•</span>
          <span>DECISION SUPPORT ONLY — NO REAL MEDICAL DIAGNOSIS</span>
        </div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          LOCAL SYSTEM TIME: <strong>{currentTime}</strong>
        </div>
      </div>

      {/* Main Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Logo / Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
              fontWeight: '900',
              fontSize: '20px',
              color: '#fff',
              letterSpacing: '-1px'
            }}>
              ⚡
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff' }}>
                  LIFELINK
                </h1>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  letterSpacing: '1px',
                  color: 'var(--accent-cyan)',
                  background: 'rgba(6, 182, 212, 0.12)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}>
                  ORCHESTRATOR
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                MASS-CASUALTY COMMAND
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '36px', background: 'var(--border-color)', margin: '0 4px' }} />

          {/* Active Incident Badge & Name */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="live-indicator" />
              <span style={{
                color: 'var(--triage-red)',
                fontSize: '12px',
                fontWeight: '800',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                ACTIVE INCIDENT
              </span>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                #{incident.incidentId}
              </span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc', marginTop: '2px' }}>
              {incident.codename}
            </div>
          </div>
        </div>

        {/* Right Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Incident Severity Tag */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '6px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={18} color="#ef4444" />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--triage-red)', fontWeight: '700', textTransform: 'uppercase' }}>Severity Tier</div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#fff' }}>MCI LEVEL 3 (CODE BLACK)</div>
            </div>
          </div>

          {/* Elapsed Timer */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Clock size={16} color="var(--accent-blue)" />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Elapsed Time</div>
              <div className="mono" style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>
                T+ 00:{incident.elapsedMinutes}:18
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
