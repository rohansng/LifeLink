import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Filter, Check, ExternalLink } from 'lucide-react';

export default function CasualtyQueueTable({
  victims = [],
  onSelectVictim,
  onMatchHospital,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, RED, YELLOW, GREEN, DECEASED
  const [selectedIds, setSelectedIds] = useState({});
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Reference-spec sample rows matching the exact tags from the reference image
  const defaultSampleRows = useMemo(() => [
    { id: '#4A5551', alias: 'V000', triage: 'Deceased', type: 'DECEASED', eta: '21h 17s', dest: 'Matched', hosp: 'Morgue Facility', injury: 'Traumatic arrest / non-salvageable' },
    { id: '#4A5567', alias: 'V000', triage: 'Deceased', type: 'DECEASED', eta: '21h 12s', dest: 'Matched', hosp: 'Morgue Facility', injury: 'Crush decapitation / lethal' },
    { id: '#5C2626', alias: 'V083', triage: '#DC2626', type: 'RED', eta: '21h 20s', dest: 'Matched', hosp: 'Victoria Hospital Fort', injury: 'Severe crush trauma / unequal pupils' },
    { id: '#445520', alias: 'V041', triage: '#DC2626', type: 'RED', eta: '21h 20s', dest: 'Matched', hosp: 'St. Martha\'s Emergency', injury: 'Ammonia vapor inhalation pneumonitis' },
    { id: '#4A5531', alias: 'V001', triage: '#DC2626', type: 'RED', eta: '21h 20s', dest: 'Matched', hosp: 'Bowring & Lady Curzon', injury: 'Hemorrhagic pelvic shear fracture' },
    { id: '#187038', alias: 'V112', triage: '#DD97706', type: 'YELLOW', eta: '21h 30s', dest: 'Matched', hosp: 'Victoria Hospital Fort', injury: 'Open compound femur fracture' },
    { id: '#197036', alias: 'V035', triage: '#DD97706', type: 'YELLOW', eta: '21h 30s', dest: 'Matched', hosp: 'St. Martha\'s Emergency', injury: 'Second-degree facial & corneal burns' },
    { id: '#193037', alias: 'V044', triage: '#DD97706', type: 'YELLOW', eta: '21h 30s', dest: 'Matched', hosp: 'Bowring & Lady Curzon', injury: 'Blunt abdominal trauma, hemoperitoneum' },
    { id: '#156539', alias: 'V052', triage: '#DD97706', type: 'YELLOW', eta: '21h 40s', dest: 'Matched', hosp: 'St. Martha\'s Emergency', injury: 'Bilateral humerus fracture' },
    { id: '#158038', alias: 'V099', triage: '#15803D', type: 'GREEN', eta: '21h 40s', dest: 'Matched', hosp: 'Sector Charlie Staging', injury: 'Superficial glass lacerations' },
    { id: '#158030', alias: 'V102', triage: '#15803D', type: 'GREEN', eta: '21h 40s', dest: 'Matched', hosp: 'Sector Charlie Staging', injury: 'Ankle sprain & mild smoke cough' },
    { id: '#158038', alias: 'V105', triage: '#15803D', type: 'GREEN', eta: '21h 40s', dest: 'Matched', hosp: 'Sector Charlie Staging', injury: 'Forearm abrasion' },
    { id: '#158036', alias: 'V108', triage: '#15803D', type: 'GREEN', eta: '21h 40s', dest: 'Matched', hosp: 'Sector Charlie Staging', injury: 'Minor contusion' },
    { id: '#158039', alias: 'V110', triage: '#15803D', type: 'GREEN', eta: '21h 46s', dest: 'Matched', hosp: 'Sector Charlie Staging', injury: 'Ambulatory anxiety' },
    { id: '#B97707', alias: 'V065', triage: '#DD97706', type: 'YELLOW', eta: '21h 40s', dest: 'Matched', hosp: 'Victoria Hospital Fort', injury: 'Closed head injury without focal deficit' },
    { id: '#E97776', alias: 'V072', triage: '#DD97706', type: 'YELLOW', eta: '21h 40s', dest: 'Matched', hosp: 'Bowring & Lady Curzon', injury: 'Lumbar compression wedge fracture' },
    { id: '#158038', alias: 'V115', triage: '#15803D', type: 'GREEN', eta: '21h 40s', dest: 'Matched', hosp: 'Sector Charlie Staging', injury: 'Mild particulate eye irritation' },
    { id: '#158030', alias: 'V118', triage: '#15803D', type: 'GREEN', eta: '21h 40s', dest: 'Matched', hosp: 'Sector Charlie Staging', injury: 'Minor soft tissue bruise' },
    { id: '#158030', alias: 'V121', triage: '#15803D', type: 'GREEN', eta: '21h 40s', dest: 'Matched', hosp: 'Sector Charlie Staging', injury: 'Ambulatory walking wounded' },
  ], []);

  // Filter rows
  const filteredRows = useMemo(() => {
    return defaultSampleRows.filter((r) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesId = r.id.toLowerCase().includes(query);
        const matchesAlias = r.alias.toLowerCase().includes(query);
        const matchesHosp = r.hosp.toLowerCase().includes(query);
        if (!matchesId && !matchesAlias && !matchesHosp) return false;
      }
      if (filterType !== 'ALL' && r.type !== filterType) {
        return false;
      }
      return true;
    });
  }, [defaultSampleRows, searchQuery, filterType]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelectAll = () => {
    const allSelected = filteredRows.every((r) => selectedIds[r.id]);
    const next = {};
    if (!allSelected) {
      filteredRows.forEach((r) => { next[r.id] = true; });
    }
    setSelectedIds(next);
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

  const handleRowClick = (item) => {
    if (onMatchHospital) {
      onMatchHospital(item.alias);
    } else if (onSelectVictim) {
      onSelectVictim(item);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
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
            position: 'relative',
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
              borderRadius: '3px',
              padding: '3px 8px',
            }}
          >
            <Search size={12} color="#64748B" />
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
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: filterType !== 'ALL' ? '#1E293B' : '#0D1117',
              border: '1px solid',
              borderColor: filterType !== 'ALL' ? '#3B82F6' : '#1E2532',
              borderRadius: '3px',
              padding: '3px 8px',
              fontSize: '10.5px',
              fontWeight: '600',
              color: filterType !== 'ALL' ? '#93C5FD' : '#8A99AD',
            }}
          >
            <SlidersHorizontal size={11} />
            <span>Filter chips</span>
          </button>

          {/* Filter Dropdown Menu */}
          {showFilterDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '38px',
                right: '10px',
                zIndex: 100,
                background: '#11151C',
                border: '1px solid #232B36',
                borderRadius: '4px',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                boxShadow: '0 6px 18px rgba(0,0,0,0.7)',
                minWidth: '130px',
              }}
            >
              {[
                { id: 'ALL', label: 'All Triage' },
                { id: 'RED', label: 'Immediate (Red)' },
                { id: 'YELLOW', label: 'Delayed (Yellow)' },
                { id: 'GREEN', label: 'Minor (Green)' },
                { id: 'DECEASED', label: 'Deceased (Black)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setFilterType(opt.id);
                    setShowFilterDropdown(false);
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '4px 8px',
                    fontSize: '11px',
                    borderRadius: '3px',
                    color: filterType === opt.id ? '#FFFFFF' : '#94A3B8',
                    background: filterType === opt.id ? '#2563EB' : 'transparent',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tabular Header */}
        <div
          className="mono"
          style={{
            display: 'grid',
            gridTemplateColumns: '26px 85px 85px 75px 1fr',
            padding: '6px 10px',
            borderBottom: '1px solid #1E2532',
            fontSize: '9.5px',
            color: '#64748B',
            textTransform: 'uppercase',
            fontWeight: '700',
            alignItems: 'center',
            background: '#0D1117',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={filteredRows.length > 0 && filteredRows.every((r) => selectedIds[r.id])}
              onChange={toggleSelectAll}
              style={{ cursor: 'pointer', accentColor: '#2563EB' }}
            />
          </div>
          <div>Patient ID</div>
          <div>Triage</div>
          <div>Transport ETA</div>
          <div>Matched Destination</div>
        </div>

        {/* Tabular Rows (Scrollable) */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 190px)',
          }}
        >
          {filteredRows.map((row) => {
            const isSelected = !!selectedIds[row.id];
            return (
              <div
                key={row.id + row.alias}
                onClick={() => handleRowClick(row)}
                className="mono"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '26px 85px 85px 75px 1fr',
                  padding: '5.5px 10px',
                  borderBottom: '1px solid #141A24',
                  fontSize: '10.5px',
                  alignItems: 'center',
                  background: isSelected ? '#162032' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#111620';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
                title={`${row.alias}: ${row.injury} -> ${row.hosp} (Click to inspect WHY matching matrix)`}
              >
                {/* Checkbox */}
                <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(row.id)}
                    style={{ cursor: 'pointer', accentColor: '#2563EB' }}
                  />
                </div>

                {/* Patient ID */}
                <div style={{ color: '#E2E8F0', fontWeight: '600' }}>
                  {row.id}
                </div>

                {/* Triage Tag */}
                <div>
                  {getTriagePill(row.type, row.triage)}
                </div>

                {/* Transport ETA */}
                <div style={{ color: '#8A99AD', fontSize: '10px' }}>
                  {row.eta}
                </div>

                {/* Matched Destination */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                  <span className="destination-tag-matched">
                    {row.dest}
                  </span>
                  <span style={{ fontSize: '9.5px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {row.hosp.split(' ')[0]}
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
