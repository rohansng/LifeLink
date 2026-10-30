import React, { useState } from 'react';
import Header from './components/Header';
import TopStats from './components/TopStats';
import IncidentMap from './components/IncidentMap';
import HospitalsPanel from './components/HospitalsPanel';
import AmbulancesPanel from './components/AmbulancesPanel';
import VictimZonesPanel from './components/VictimZonesPanel';
import CommandPanel from './components/CommandPanel';
import TimelinePanel from './components/TimelinePanel';
import { SYNTHETIC_INCIDENT } from './data/syntheticCrisis';

export default function App() {
  const [incident] = useState(SYNTHETIC_INCIDENT);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'RESOURCES', 'TIMELINE'

  return (
    <div style={{ maxWidth: '1680px', margin: '0 auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Header with simulation banner, brand, and incident title */}
      <Header incident={incident} />

      {/* 2. Top KPI Statistics Row (Victims 214, Critical 31, Ambulances 5, Hospitals 3, Available ICU 4, Unassigned 27) */}
      <TopStats stats={incident.statistics} />

      {/* Entity Inspection Alert Banner (if entity is clicked on map or panel) */}
      {selectedEntity && (
        <div className="glass-panel" style={{
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', background: 'var(--accent-blue)', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
              INSPECTING {selectedEntity.type}
            </span>
            <strong style={{ color: '#fff' }}>{selectedEntity.data.name || selectedEntity.data.callsign}</strong>
            <span style={{ color: 'var(--text-secondary)' }}>
              {selectedEntity.data.description || selectedEntity.data.assignedTo || `${selectedEntity.data.icuBedsAvailable} ICU beds open`}
            </span>
          </div>

          <button
            onClick={() => setSelectedEntity(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: '700',
            }}
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* View Filter Toggles */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'ALL', label: 'Tactical Command Overview' },
            { id: 'RESOURCES', label: 'Hospital & Ambulance Grid' },
            { id: 'TIMELINE', label: 'Full Incident Timeline' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === tab.id ? 'rgba(255, 255, 255, 0.25)' : 'var(--border-color)'}`,
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          CRISIS RATIO: <strong>31 CRITICAL : 4 ICU BEDS (7.75x DEFICIT)</strong>
        </div>
      </div>

      {/* Main Command Workspace */}
      {activeTab === 'ALL' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '16px', alignItems: 'start' }}>
          {/* Left Column: Live Interactive Map + Casualty Sectors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <IncidentMap
              incident={incident}
              victimZones={incident.victimZones}
              hospitals={incident.hospitals}
              ambulances={incident.ambulances}
              roadDisruptions={incident.roadDisruptions}
              onSelectEntity={setSelectedEntity}
            />

            <VictimZonesPanel
              victimZones={incident.victimZones}
              onSelectZone={(zone) => setSelectedEntity({ type: 'SECTOR', data: zone })}
            />
          </div>

          {/* Right Column: Command Panel + Hospitals & Ambulances */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <CommandPanel
              priorityActions={incident.priorityActions}
              alerts={incident.alerts}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <HospitalsPanel
                hospitals={incident.hospitals}
                onSelectHospital={(hosp) => setSelectedEntity({ type: 'HOSPITAL', data: hosp })}
              />

              <AmbulancesPanel
                ambulances={incident.ambulances}
                onSelectAmbulance={(amb) => setSelectedEntity({ type: 'AMBULANCE', data: amb })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Alternative View: Dedicated Resources Grid */}
      {activeTab === 'RESOURCES' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <HospitalsPanel
            hospitals={incident.hospitals}
            onSelectHospital={(hosp) => setSelectedEntity({ type: 'HOSPITAL', data: hosp })}
          />

          <AmbulancesPanel
            ambulances={incident.ambulances}
            onSelectAmbulance={(amb) => setSelectedEntity({ type: 'AMBULANCE', data: amb })}
          />
        </div>
      )}

      {/* Alternative View or Bottom Section: Incident Timeline */}
      {(activeTab === 'ALL' || activeTab === 'TIMELINE') && (
        <TimelinePanel timeline={incident.timeline} />
      )}

      {/* Footer Info */}
      <footer style={{
        textAlign: 'center',
        padding: '12px',
        fontSize: '11px',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-color)',
        marginTop: '10px',
      }}>
        LIFELINK Command Center • Simulation Environment • Built for Hackathon Demonstration • North-Star Metric: Time to Actionable, Feasible Plan
      </footer>
    </div>
  );
}
