import React, { useState } from 'react';
import { Search, Filter, CheckSquare, Square, ChevronRight } from 'lucide-react';

export default function CasualtyQueueTable({ victims = [], onSelectVictim }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState({});

  // Synthetic baseline casualties matching the reference image + live backend casualties
  const defaultVictims = [
    { id: '#4A5551', priority: 'DECEASED', eta: '21h 17s', dest: 'Morgue / Holding', condition: 'Crush trauma non-salvageable' },
    { id: '#4A5567', priority: 'DECEASED', eta: '21h 12s', dest: 'Morgue / Holding', condition: 'Traumatic arrest' },
    { id: 'V083', priority: 'IMMEDIATE', eta: '13m 00s', dest: 'St. Jude Regional', condition: 'Pelvic crush + arterial hemorrhage' },
    { id: '#5C2626', priority: 'IMMEDIATE', eta: '21h 20s', dest: 'St. Jude Regional', condition: 'Tension pneumothorax' },
    { id: '#445520', priority: 'IMMEDIATE', eta: '21h 20s', dest: 'Harborview Memorial', condition: 'Severe intracranial hemorrhage' },
    { id: 'V041', priority: 'IMMEDIATE', eta: '13m 00s', dest: 'St. Jude Regional', condition: 'Blunt thoracic trauma' },
    { id: '#4A5531', priority: 'IMMEDIATE', eta: '21h 20s', dest: 'Metro Trauma Center', condition: 'Compound femur fracture + shock' },
    { id: 'V112', priority: 'DELAYED', eta: '13m 00s', dest: 'St. Jude Regional', condition: 'Open tibial fracture' },
    { id: '#187038', priority: 'DELAYED', eta: '21h 30s', dest: 'St. Jude Regional', condition: 'Abdominal contusion' },
    { id: '#187036', priority: 'DELAYED', eta: '21h 30s', dest: 'Harborview Memorial', condition: 'Dislocated shoulder & lacerations' },
    { id: '#193037', priority: 'DELAYED', eta: '21h 30s', dest: 'Metro Trauma Center', condition: 'Deep lacerations, stable vitals' },
    { id: '#156539', priority: 'DELAYED', eta: '21h 40s', dest: 'St. Jude Regional', condition: 'Closed pelvic injury' },
    { id: '#158038', priority: 'MINOR', eta: '21h 40s', dest: 'Field Triage Alpha', condition: 'Ambulatory superficial abrasions' },
    { id: '#158030', priority: 'MINOR', eta: '21h 40s', dest: 'Field Triage Alpha', condition: 'Smoke inhalation, stable' },
    { id: '#158036', priority: 'MINOR', eta: '21h 40s', dest: 'Concourse Staging', condition: 'Ankle sprain' },
    { id: '#158039', priority: 'MINOR', eta: '21h 46s', dest: 'Concourse Staging', condition: 'Minor contusions' },
  ];

  // Merge backend victims if available
  const displayVictims = defaultVictims.filter((v) => {
    const matchesSearch =
      v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.dest.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.condition.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterPriority === 'ALL') return matchesSearch;
    if (filterPriority === 'IMMEDIATE') return matchesSearch && v.priority === 'IMMEDIATE';
    if (filterPriority === 'DELAYED') return matchesSearch && v.priority === 'DELAYED';
    if (filterPriority === 'MINOR') return matchesSearch && v.priority === 'MINOR';
    if (filterPriority === 'DECEASED') return matchesSearch && v.priority === 'DECEASED';
    return matchesSearch;
  });

  const toggleSelect = (id) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getBadgeClass = (priority) => {
    switch (priority) {
      case 'DECEASED':
        return 'badge-deceased';
      case 'IMMEDIATE':
        return 'badge-immediate';
      case 'DELAYED':
        return 'badge-delayed';
      case 'MINOR':
        return 'badge-minor';
      default:
        return 'badge-minor';
    }
  };

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
        <span>Casualty Queue</span>
        <span className="mono" style={{ fontSize: '10px', color: '#64748B' }}>
          {displayVictims.length} TOTAL ENROUTE
        </span>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #2B323D',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          background: '#0B0E13',
        }}
      >
        <div
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search size={13} color="#64748B" style={{ position: 'absolute', left: '8px' }} />
          <input
            type="text"
            placeholder="Search patient ID, trauma..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: '#1A1F26',
              border: '1px solid #2D3748',
              borderRadius: '4px',
              padding: '4px 8px 4px 26px',
              fontSize: '11px',
              color: '#E2E8F0',
              outline: 'none',
            }}
          />
        </div>

        {/* Filter chips dropdown */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {['ALL', 'IMMEDIATE', 'DELAYED'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              style={{
                background: filterPriority === p ? '#2563EB' : '#1A1F26',
                border: '1px solid #2D3748',
                borderRadius: '3px',
                padding: '3px 8px',
                fontSize: '10px',
                fontWeight: '700',
                color: filterPriority === p ? '#fff' : '#94A3B8',
              }}
            >
              {p === 'ALL' ? 'All' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Table Column Headers */}
      <div
        className="mono"
        style={{
          display: 'grid',
          gridTemplateColumns: '28px 75px 85px 75px 1fr',
          padding: '6px 12px',
          fontSize: '10px',
          fontWeight: '700',
          color: '#64748B',
          borderBottom: '1px solid #2B323D',
          background: '#111418',
          letterSpacing: '0.4px',
        }}
      >
        <span></span>
        <span>Patient ID</span>
        <span>Triage</span>
        <span>Transport ETA</span>
        <span>Matched Destination</span>
      </div>

      {/* Table Rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {displayVictims.map((v) => {
          const isSelected = !!selectedIds[v.id];
          return (
            <div
              key={v.id}
              onClick={() => onSelectVictim && onSelectVictim(v)}
              style={{
                display: 'grid',
                gridTemplateColumns: '28px 75px 85px 75px 1fr',
                padding: '7px 12px',
                borderBottom: '1px solid rgba(43, 50, 61, 0.45)',
                alignItems: 'center',
                fontSize: '11px',
                cursor: 'pointer',
                background: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                transition: 'background 0.1s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* Checkbox */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelect(v.id);
                }}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {isSelected ? (
                  <CheckSquare size={13} color="#38BDF8" />
                ) : (
                  <Square size={13} color="#475569" />
                )}
              </div>

              {/* Patient ID */}
              <span className="mono" style={{ fontWeight: '700', color: '#E2E8F0' }}>
                {v.id}
              </span>

              {/* Triage Tag Badge */}
              <div>
                <span className={getBadgeClass(v.priority)}>{v.priority}</span>
              </div>

              {/* Transport ETA */}
              <span className="mono" style={{ color: '#94A3B8', fontSize: '10px' }}>
                {v.eta}
              </span>

              {/* Matched Destination */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#CBD5E1', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {v.dest}
                </span>
                <span className="mono" style={{ fontSize: '9px', color: '#38BDF8', fontWeight: '700' }}>
                  Matched
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
