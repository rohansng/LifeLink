import React, { useState, useMemo } from 'react';
import HospitalMatchModal from './HospitalMatchModal';
import {
  Activity,
  AlertTriangle,
  ArrowDownUp,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Filter,
  Flame,
  HeartPulse,
  Hospital,
  Layers,
  Search,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from 'lucide-react';

const TIER_CONFIG = {
  P1: {
    label: 'Critical',
    sublabel: 'Immediate / Resuscitation / Golden-Hour',
    color: 'var(--triage-red)',
    badgeBg: 'rgba(239, 68, 68, 0.16)',
    borderColor: 'rgba(239, 68, 68, 0.45)',
    glow: 'rgba(239, 68, 68, 0.3)',
    pill: 'bg-red',
  },
  P2: {
    label: 'Serious',
    sublabel: 'Urgent / Delayed Surgical Intervention',
    color: 'var(--triage-yellow)',
    badgeBg: 'rgba(245, 158, 11, 0.16)',
    borderColor: 'rgba(245, 158, 11, 0.45)',
    glow: 'rgba(245, 158, 11, 0.25)',
    pill: 'bg-yellow',
  },
  P3: {
    label: 'Moderate',
    sublabel: 'Minor / Walking Wounded',
    color: 'var(--triage-green)',
    badgeBg: 'rgba(16, 185, 129, 0.16)',
    borderColor: 'rgba(16, 185, 129, 0.45)',
    glow: 'rgba(16, 185, 129, 0.2)',
    pill: 'bg-green',
  },
  P4: {
    label: 'Unknown',
    sublabel: 'Needs Assessment / Entrapped in Rubble',
    color: 'var(--accent-violet)',
    badgeBg: 'rgba(139, 92, 246, 0.16)',
    borderColor: 'rgba(139, 92, 246, 0.45)',
    glow: 'rgba(139, 92, 246, 0.2)',
    pill: 'bg-purple',
  },
};

export default function PriorityQueuePanel({
  triageSummary,
  onSelectVictim,
  className = '',
}) {
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState('V083'); // default expand showcase
  const [matchVictimId, setMatchVictimId] = useState(null); // Phase 5: "WHY?" Hospital Matching Modal

  const counts = triageSummary?.counts || { P1: 0, P2: 0, P3: 0, P4: 0 };
  const queue = triageSummary?.priority_queue || [];
  const showcase = triageSummary?.showcase || [];

  // Filtered queue items
  const filteredQueue = useMemo(() => {
    let result = queue;
    if (selectedTier !== 'ALL') {
      result = result.filter((item) => item.priority === selectedTier);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.victim_id.toLowerCase().includes(q) ||
          item.required_capability.toLowerCase().includes(q) ||
          item.reason.toLowerCase().includes(q) ||
          (item.sector && item.sector.toLowerCase().includes(q))
      );
    }
    return result;
  }, [queue, selectedTier, searchQuery]);

  return (
    <div
      className={`glass-panel ${className}`}
      style={{
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        border: '1px solid rgba(56, 189, 248, 0.25)',
      }}
    >
      {/* 1. Header with Title & Live Formula Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(14, 165, 233, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            <BrainCircuit size={18} color="var(--accent-cyan)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.3px', color: '#f8fafc' }}>
                Deterministic Triage & Priority Queue
              </h2>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 7px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--triage-green)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                100% Deterministic • Zero LLM Drift
              </span>
            </div>
            <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Priority Score = Severity + Urgency + Capability − Transport Time + Resource Availability
            </div>
          </div>
        </div>

        {/* Real-time Tier Counters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['P1', 'P2', 'P3', 'P4'].map((tierKey) => {
            const cfg = TIER_CONFIG[tierKey];
            const count = counts[tierKey] || 0;
            const isSelected = selectedTier === tierKey;
            return (
              <button
                key={tierKey}
                onClick={() => setSelectedTier(isSelected ? 'ALL' : tierKey)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: isSelected ? cfg.badgeBg : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${isSelected ? cfg.borderColor : 'var(--border-color)'}`,
                  color: cfg.color,
                  padding: '5px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '700',
                  boxShadow: isSelected ? `0 0 12px ${cfg.glow}` : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: '900' }}>{tierKey}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>({cfg.label})</span>
                <span
                  className="mono"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    color: '#fff',
                    fontWeight: '800',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Spotlight Showcase Row (V083, V041, V112) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: 'var(--accent-cyan)' }}>
            <Sparkles size={13} />
            <span>EXEMPLAR SHOWCASE CASUALTIES (Strict Scoring Output)</span>
          </div>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Multivariate Priority Elevation Verified
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
          {showcase.map((item) => {
            const cfg = TIER_CONFIG[item.priority] || TIER_CONFIG.P1;
            const isExpanded = expandedId === item.victim_id;
            return (
              <div
                key={item.victim_id}
                onClick={() => {
                  setExpandedId(isExpanded ? null : item.victim_id);
                  if (onSelectVictim) onSelectVictim(item);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${cfg.borderColor}`,
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  boxShadow: `0 4px 16px ${cfg.glow}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: '900',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: cfg.badgeBg,
                        color: cfg.color,
                        border: `1px solid ${cfg.borderColor}`,
                      }}
                    >
                      {item.priority}
                    </span>
                    <span className="mono" style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>
                      {item.victim_id}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {item.sector || 'Incident Zone'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="mono" style={{ fontSize: '13px', fontWeight: '900', color: cfg.color }}>
                      {item.score}
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>pts</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#e2e8f0' }}>
                    {item.reason.split('—')[0]?.trim() || item.reason.split('.')[0]}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Stethoscope size={13} color="var(--accent-cyan)" />
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                      {item.required_capability}
                    </span>
                  </div>
                </div>

                {/* Phase 5: "Where should this victim go?" & "WHY?" Rationale Trigger */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMatchVictimId(item.victim_id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'rgba(16, 185, 129, 0.16)',
                      border: '1px solid rgba(16, 185, 129, 0.45)',
                      color: 'var(--triage-green)',
                      padding: '4px 10px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.28)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.16)')}
                    title="Where should this victim go? Inspect deterministic criteria and 'WHY?' explanation"
                  >
                    <Hospital size={13} />
                    <span>Where should this victim go? (WHY?)</span>
                  </button>
                </div>

                {/* Score breakdown toggle */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: '6px',
                  }}
                >
                  <span>Score Breakdown (5 Factors)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: cfg.color }}>
                    <span>{isExpanded ? 'Hide' : 'Inspect Math'}</span>
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </div>
                </div>

                {isExpanded && item.breakdown && (
                  <div
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>1. START Severity:</span>
                      <strong className="mono" style={{ color: '#fff' }}>+{item.breakdown.severity_points} pts</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>2. Urgency Acuity:</span>
                      <strong className="mono" style={{ color: 'var(--triage-red)' }}>+{item.breakdown.urgency_points} pts</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>3. Capability Need:</span>
                      <strong className="mono" style={{ color: 'var(--accent-cyan)' }}>+{item.breakdown.capability_points} pts</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>4. Transit Penalty:</span>
                      <strong className="mono" style={{ color: 'var(--triage-yellow)' }}>−{item.breakdown.transport_penalty} pts</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>5. Hospital Resources:</span>
                      <strong className="mono" style={{ color: 'var(--triage-green)' }}>+{item.breakdown.resource_availability_points} pts</strong>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderTop: '1px solid rgba(255,255,255,0.15)',
                        paddingTop: '4px',
                        marginTop: '2px',
                        fontWeight: '800',
                      }}
                    >
                      <span style={{ color: '#fff' }}>TOTAL PRIORITY SCORE:</span>
                      <strong className="mono" style={{ color: cfg.color, fontSize: '11px' }}>
                        {item.breakdown.total_score} pts
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Search & Queue Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px' }} />
            <input
              type="text"
              placeholder="Search victim ID (e.g. V083), condition, or capability..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 10px 6px 30px',
                color: '#fff',
                fontSize: '11px',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <ArrowDownUp size={13} color="var(--accent-cyan)" />
          <span>
            Showing <strong>{filteredQueue.length}</strong> casualties (Strict descending score order)
          </span>
        </div>
      </div>

      {/* 4. Full Casualty Priority Queue List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '440px',
          overflowY: 'auto',
          paddingRight: '4px',
        }}
      >
        {filteredQueue.map((casualty, idx) => {
          const cfg = TIER_CONFIG[casualty.priority] || TIER_CONFIG.P1;
          const isExpanded = expandedId === casualty.victim_id;

          return (
            <div
              key={casualty.victim_id}
              onClick={() => {
                setExpandedId(isExpanded ? null : casualty.victim_id);
                if (onSelectVictim) onSelectVictim(casualty);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '10px 12px',
                background: isExpanded ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.015)',
                border: `1px solid ${isExpanded ? cfg.borderColor : 'var(--border-color)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = cfg.borderColor;
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              }}
              onMouseLeave={(e) => {
                if (!isExpanded) {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.015)';
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Rank in Queue */}
                  <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)', width: '22px' }}>
                    #{idx + 1}
                  </span>

                  {/* Priority Tier Badge */}
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '900',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: cfg.badgeBg,
                      color: cfg.color,
                      border: `1px solid ${cfg.borderColor}`,
                      minWidth: '38px',
                      textAlign: 'center',
                    }}
                  >
                    {casualty.priority}
                  </span>

                  {/* Victim ID */}
                  <span className="mono" style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
                    {casualty.victim_id}
                  </span>

                  {/* Required Capability */}
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      background: 'rgba(56, 189, 248, 0.1)',
                      color: 'var(--accent-cyan)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                    }}
                  >
                    {casualty.required_capability}
                  </span>

                  {/* Sector */}
                  {casualty.sector && (
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {casualty.sector}
                    </span>
                  )}
                </div>

                {/* Score, WHY Match & Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMatchVictimId(casualty.victim_id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      color: 'var(--triage-green)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.12)')}
                    title="Where should this victim go? Inspect deterministic criteria and 'WHY?' explanation"
                  >
                    <Hospital size={11} />
                    <span>WHY?</span>
                  </button>

                  <div style={{ textAlign: 'right' }}>
                    <span className="mono" style={{ fontSize: '13px', fontWeight: '800', color: cfg.color }}>
                      {casualty.score}
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginLeft: '3px' }}>pts</span>
                  </div>
                  {isExpanded ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                </div>
              </div>

              {/* Clinical & Logistical Reason Line */}
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: '32px' }}>
                {casualty.reason}
              </div>

              {/* Mathematical Component Breakdown Drawer */}
              {isExpanded && casualty.breakdown && (
                <div
                  style={{
                    marginLeft: '32px',
                    marginTop: '4px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '8px',
                    fontSize: '10px',
                  }}
                >
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Severity Base</div>
                    <div className="mono" style={{ fontWeight: '700', color: '#fff' }}>
                      +{casualty.breakdown.severity_points} pts
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Urgency Acuity</div>
                    <div className="mono" style={{ fontWeight: '700', color: 'var(--triage-red)' }}>
                      +{casualty.breakdown.urgency_points} pts
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Capability Need</div>
                    <div className="mono" style={{ fontWeight: '700', color: 'var(--accent-cyan)' }}>
                      +{casualty.breakdown.capability_points} pts
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Transport Penalty</div>
                    <div className="mono" style={{ fontWeight: '700', color: 'var(--triage-yellow)' }}>
                      −{casualty.breakdown.transport_penalty} pts
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Resource Match</div>
                    <div className="mono" style={{ fontWeight: '700', color: 'var(--triage-green)' }}>
                      +{casualty.breakdown.resource_availability_points} pts
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Deterministic Total</div>
                    <div className="mono" style={{ fontWeight: '800', color: cfg.color }}>
                      = {casualty.breakdown.total_score} pts
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Phase 5: Interactive "WHY?" Hospital Matching Modal */}
      {matchVictimId && (
        <HospitalMatchModal
          victimId={matchVictimId}
          onClose={() => setMatchVictimId(null)}
        />
      )}
    </div>
  );
}

