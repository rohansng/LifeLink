import React, { useState } from 'react';
import { Search, SlidersHorizontal, Filter, Check } from 'lucide-react';

export default function CasualtyQueueTable({ victims = [], onSelectVictim }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, RED, YELLOW, GREEN, DECEASED
  const [selectedIds, setSelectedIds] = useState({});

  // Generate 18 high-density rows matching the exact IDs and color badges in the reference image
  const defaultSampleRows = [
    { id: '#4A5551', alias: 'V000', triage: 'Deceased', type: 'DECEASED', eta: '21h 17s', dest: 'Matched', hosp: 'Morgue Facility' },
    { id: '#4A5567', alias: 'V000', triage: 'Deceased', type: 'DECEASED', eta: '21h 12s', dest: 'Matched', hosp: 'Morgue Facility' },
    { id: '#5C2626', alias: 'V083', triage: '#DC2626', type: 'RED', eta: '21h 20s', dest: 'Matched', hosp: 'St. Jude Regional' },
    { id: '#445520', alias: 'V041', triage: '#DC2626', type: 'RED', eta: '21h 20s', dest: 'Matched', hosp: 'Metro Trauma Center' },
    { id: '#4A5531', alias: 'V001', triage: '#DC2626', type: 'RED', eta: '21h 20s', dest: 'Matched', hosp: 'Harborview Medical' },
    { id: '#187038', alias: 'V112', triage: '#DD97706', type: 'YELLOW', eta: '21h 30s', dest: 'Matched', hosp: 'St. Jude Regional' },
    { id: '#197036', alias: 'V035', triage: '#DD97706', type: 'YELLOW', eta: '21h 30s', dest: 'Matched', hosp: 'Metro Trauma Center' },
    { id: '#193037', alias: 'V044', triage: '#DD97706', type: 'YELLOW', eta: '21h 30s', dest: 'Matched', hosp: 'Harborview Medical' },
    { id: '#156539', alias: 'V052', triage: '#DD97706', type: 'YELLOW', eta: '21h 40s', dest: 'Matched', hosp: 'St. Jude Regional' },
    { id: '#158038', alias: 'V099', triage: '#15803D', type: 'GREEN', eta: '21h 40s', dest: 'Matched', hosp: 'Field Triage Staging' },
    { id: '#158030', alias: 'V102', triage: '#15803D', type: 'GREEN', eta: '21h 40s', dest: 'Matched', hosp: 'Field Triage Staging' },
    { id: '#158038', alias: 'V105', triage: '#15803D', type: 'GREEN', eta: '21h 40s', dest: 'Matched', hosp: 'Field Triage Staging' },
    { id: '#158036', alias: 'V108', triage: '#15803D', type: 'GREEN', eta: '21h 40s', dest: 'Matched', hosp: 'Field Triage Staging' },
    { id: '#158039', alias: 'V110', triage: '#15803D', type: 'GREEN', eta: '21h 46s', dest: 'Matched', hosp: 'Field Triage Staging' },
    { id: '#B97707', alias: 'V065', triage: '#DD97706', type: 'YELLOW', eta: '21h 40s', dest: 'Matched', hosp: 'Metro Trauma Center' },
    { id: '#E97776', alias: 'V072', triage: '#DD97706', type: 'YELLOW', eta: '21h 40s', dest: 'Matched', hosp: 'Harborview Medical' },
    { id: '#158038', alias: 'V115', triage: '#15803D', type: 'GREEN', eta: '21h 40s', dest: 'Matched', hosp: 'Field Triage Staging' },
    { id: '#158030', alias: 'V118', triage: '#15803D', type: 'GREEN', eta: '21h 40s', dest: 'Matched', hosp: 'Field Triage Staging' },
    { id: '#158030', alias: 'V121', triage: '#15803D', type: 'GREEN', eta: '21h 40s', dest: 'Matched', hosp: 'Field Triage Staging' },
  ];

  const filteredRows = defaultSampleRows.filter((r) => {
    if (searchQuery && !r.id.toLowerCase().includes(searchQuery.toLowerCase()) && !r.alias.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterType !== 'ALL' && r.type !== filterType) {
      return false;
    }
    return true;
  });

  const toggleSelect = (id) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getTriagePill = (type, label) => {
    if (type === 'DECEASED') {
      return <span className="triage-tag-deceased">{label}</span>;
    }
    if (type === 'RED') {
      return <span className="triage-tag-red">{label}</span>;
    }
    if (type === 'YELLOW') {
      return <span className="triage-tag-yellow">{label}</span>;
    }
    return <span className="triage-tag-green">{label}</span>;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        height: '100%',
        minWidth: '310px',
      }}
    >
      {/* Header Label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#E2E8F0', letterSpacing: '-0.2px', margin: 0 }}>
          Casualty Queue
        </h3>
        <span className="mono" style={{ fontSize: '11px', color: '#64748B' }}>
          214 CASUALTIES TRACKED
        </span>
      </div>

      {/* Container Card */}
      <div
        className="tactical-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden',
          minHeight: '520px',
        }}
      >
        {/* Search & Filter Toolbar */}
        <div
          style={{
            padding: '8px 10px',
            borderBottom: '1px solid #1E2532',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {/* Search Box */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#0D1117',
              border: '1px solid #1E2532',
              borderRadius: '4px',
              padding: '4px 8px',
            }}
          >
            <Search size={13} color="#64748B" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '11px',
                color: '#E2E8F0',
                width: '100%',
              }}
            />
          </div>

          {/* Filter Chips Button */}
          <button
            onClick={() => {
              const types = ['ALL', 'RED', 'YELLOW', 'GREEN', 'DECEASED'];
              const next = types[(types.indexOf(filterType) + 1) % types.length];
              setFilterType(next);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: '#1A222D',
              border: '1px solid #283344',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '11px',
              color: filterType === 'ALL' ? '#94A3B8' : '#38BDF8',
              fontWeight: '600',
            }}
          >
            <SlidersHorizontal size={12} />
            <span>{filterType === 'ALL' ? 'Filter chips' : `Filter: ${filterType}`}</span>
          </button>

          <button
            style={{
              background: '#1A222D',
              border: '1px solid #283344',
              borderRadius: '4px',
              padding: '4px 6px',
              color: '#94A3B8',
            }}
          >
            <Filter size={12} />
          </button>
        </div>

        {/* Tabular Header */}
        <div
          className="mono"
          style={{
            display: 'grid',
            gridTemplateColumns: '26px 1fr 1fr 1fr 1fr',
            padding: '6px 10px',
            fontSize: '10px',
            fontWeight: '700',
            color: '#64748B',
            borderBottom: '1px solid #1E2532',
            background: '#11151C',
            textTransform: 'uppercase',
            alignItems: 'center',
          }}
        >
          <div>
            <input type="checkbox" style={{ accentColor: '#3B82F6', cursor: 'pointer' }} />
          </div>
          <div>Patient ID</div>
          <div>Triage</div>
          <div>Transport ETA</div>
          <div style={{ textAlign: 'right' }}>Matched Destination</div>
        </div>

        {/* Scrollable Table Rows */}
        <div
          style={{
            overflowY: 'auto',
            maxHeight: '460px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {filteredRows.map((row, idx) => {
            const isChecked = !!selectedIds[row.id];
            return (
              <div
                key={idx}
                onClick={() => onSelectVictim && onSelectVictim(row)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '26px 1fr 1fr 1fr 1fr',
                  padding: '5px 10px',
                  alignItems: 'center',
                  fontSize: '11px',
                  borderBottom: '1px solid #161C26',
                  background: isChecked ? '#182435' : (idx % 2 === 0 ? '#11151C' : '#0D1117'),
                  cursor: 'pointer',
                  transition: 'background 0.1s ease',
                }}
              >
                <div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelect(row.id);
                    }}
                    style={{ accentColor: '#3B82F6', cursor: 'pointer' }}
                  />
                </div>

                <div className="mono" style={{ color: '#CBD5E1', fontWeight: '600', fontSize: '10.5px' }}>
                  {row.id}
                </div>

                <div>
                  {getTriagePill(row.type, row.triage)}
                </div>

                <div className="mono" style={{ color: '#94A3B8', fontSize: '10.5px' }}>
                  {row.eta}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="destination-tag-matched">
                    {row.dest}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
