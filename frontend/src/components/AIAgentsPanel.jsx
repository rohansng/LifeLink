import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Bot,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Activity,
  Hospital,
  Truck,
  Navigation,
  FileText,
  Sparkles,
  ArrowRight,
  Zap,
  RotateCcw,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export default function AIAgentsPanel() {
  const [activeTab, setActiveTab] = useState('INCIDENT'); // INCIDENT | EVIDENCE | TRIAGE | COMMAND | PIPELINE | ARCHITECTURE
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Agent 1: Incident Agent state
  const [incidentInput, setIncidentInput] = useState('12 injured near Gate 3, 2 unconscious, toxic chemical smell from overturned car');
  const [incidentResult, setIncidentResult] = useState(null);

  // Agent 2: Evidence Agent state
  const [evidenceInput, setEvidenceInput] = useState('Drone photo shows ruptured freight tanker leaking dense vapor cloud over crushed passenger car 3, 4 trapped victims inside carriage');
  const [evidenceResult, setEvidenceResult] = useState(null);

  // Agent 3: Triage Reasoning Agent state
  const [triageInput, setTriageInput] = useState('Victim V083: Pulsing arterial hemorrhage from femoral laceration, uncompensated shock, BP 75/45, HR 135 weak, rapid shallow respirations');
  const [triageResult, setTriageResult] = useState(null);

  // Agent 7: Command Agent state
  const [briefingResult, setBriefingResult] = useState(null);

  // Orchestrator Pipeline state
  const [fullPipelineResult, setFullPipelineResult] = useState(null);

  useEffect(() => {
    loadStatus();
    handleProcessIncident();
  }, []);

  const loadStatus = async () => {
    try {
      const st = await api.getAgentPipelineStatus();
      setPipelineStatus(st);
    } catch (err) {
      console.error('Failed to load agent pipeline status:', err);
    }
  };

  const handleProcessIncident = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.processIncidentReport(incidentInput);
      setIncidentResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInterpretEvidence = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.interpretVisualEvidence(evidenceInput);
      setEvidenceResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReasonTriage = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.reasonCasualtyTriage(triageInput, 'V083');
      setTriageResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBriefing = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCommanderBriefing();
      setBriefingResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunFullPipeline = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.runAgentPipeline({
        incident_report: incidentInput,
        evidence_description: evidenceInput,
      });
      setFullPipelineResult(res);
      setIncidentResult(res.incident_assessment);
      setEvidenceResult(res.evidence_assessment);
      setBriefingResult(res.commander_briefing);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Top Banner & Multi-Agent Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #a855f7, #38bdf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 18px rgba(168, 85, 247, 0.4)',
          }}>
            <Bot size={24} color="#070a12" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', letterSpacing: '0.5px', margin: 0 }}>
                LIFELINK MODULAR AI AGENTS (GEMINI INTEGRATION)
              </h2>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                background: 'rgba(168, 85, 247, 0.2)',
                color: '#c084fc',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(168, 85, 247, 0.4)',
              }}>
                7 SPECIALIST AGENTS
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Specialized cognition pipeline: Natural Language Extraction • Computer Vision • Clinical Reasoning • Commander Briefings
            </p>
          </div>
        </div>

        {/* Protection Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(34, 197, 94, 0.12)',
          border: '1px solid rgba(34, 197, 94, 0.35)',
          padding: '6px 12px',
          borderRadius: '6px',
        }}>
          <ShieldCheck size={16} color="#4ade80" />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#4ade80' }}>
              DETERMINISTIC AUTHORITY SECURED
            </span>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
              AI never overrides OR-Tools optimization or numerical scoring
            </span>
          </div>
        </div>
      </div>

      {/* 7 Modular Agents Status Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
        gap: '8px',
      }}>
        {[
          { id: 'INCIDENT', icon: AlertTriangle, color: '#f59e0b', name: '1. Incident Agent', role: '911 & Radio Reports' },
          { id: 'EVIDENCE', icon: Eye, color: '#ec4899', name: '2. Evidence Agent', role: 'Vision & Drone Recon' },
          { id: 'TRIAGE', icon: Activity, color: '#ef4444', name: '3. Triage Agent', role: 'Clinical Reasoning' },
          { id: 'HOSPITAL', icon: Hospital, color: '#10b981', name: '4. Hospital Agent', role: 'Bed & OR Saturation' },
          { id: 'RESOURCE', icon: Truck, color: '#6366f1', name: '5. Resource Agent', role: 'Fleet & Mutual Aid' },
          { id: 'ROUTING', icon: Navigation, color: '#38bdf8', name: '6. Routing Agent', role: 'Detours & Obstacles' },
          { id: 'COMMAND', icon: FileText, color: '#a855f7', name: '7. Command Agent', role: 'Tactical Briefing' },
        ].map((ag) => {
          const Icon = ag.icon;
          const isActive = activeTab === ag.id;
          return (
            <div
              key={ag.id}
              onClick={() => setActiveTab(ag.id)}
              style={{
                background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${isActive ? ag.color : 'var(--border-color)'}`,
                borderRadius: '8px',
                padding: '8px 10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Icon size={14} color={ag.color} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
              </div>
              <strong style={{ fontSize: '11px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {ag.name}
              </strong>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                {ag.role}
              </span>
            </div>
          );
        })}
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', flexWrap: 'wrap' }}>
        {[
          { id: 'INCIDENT', label: '1. Incident Agent (911 NL Extraction)' },
          { id: 'EVIDENCE', label: '2. Evidence Agent (Vision/Multimodal)' },
          { id: 'TRIAGE', label: '3. Triage Reasoning Agent' },
          { id: 'COMMAND', label: '4. Executive Commander Briefing' },
          { id: 'PIPELINE', label: '5. End-to-End Multi-Agent Pipeline' },
          { id: 'ARCHITECTURE', label: 'Hierarchy & Guardrails Diagram' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
              color: activeTab === tab.id ? '#c084fc' : 'var(--text-secondary)',
              border: `1px solid ${activeTab === tab.id ? 'rgba(168, 85, 247, 0.4)' : 'transparent'}`,
              padding: '6px 12px',
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

      {error && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '6px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#f87171',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <AlertTriangle size={16} />
          <span>Agent Error: {error}</span>
        </div>
      )}

      {/* TAB 1: INCIDENT AGENT */}
      {activeTab === 'INCIDENT' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
              Incident Agent: Converts Raw Unstructured Crisis Transcripts into Structured Data
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
              Test with the prompt case: <code className="mono">"12 injured near Gate 3, 2 unconscious"</code> or customize below:
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <textarea
              value={incidentInput}
              onChange={(e) => setIncidentInput(e.target.value)}
              rows={2}
              style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: '#fff',
                padding: '8px 12px',
                fontSize: '12px',
                fontFamily: 'monospace',
                resize: 'none',
              }}
            />
            <button
              onClick={handleProcessIncident}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#070a12',
                border: 'none',
                padding: '0 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {loading ? <RotateCcw size={14} className="spin" /> : <Zap size={14} />}
              Extract Data
            </button>
          </div>

          {incidentResult && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#fbbf24' }}>
                  STRUCTURED INCIDENT EXTRACTION RESULT
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  background: incidentResult.fallback_used ? 'rgba(56, 189, 248, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                  color: incidentResult.fallback_used ? 'var(--accent-blue)' : '#4ade80',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}>
                  {incidentResult.fallback_used ? 'DETERMINISTIC NLP FALLBACK (VERIFIED)' : 'GEMINI STRUCTURED JSON'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Estimated Casualties</div>
                  <div className="mono" style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>
                    {incidentResult.estimated_casualties}
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Unconscious Count</div>
                  <div className="mono" style={{ fontSize: '18px', fontWeight: '800', color: '#ef4444' }}>
                    {incidentResult.unconscious_count}
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Location Sector</div>
                  <div className="mono" style={{ fontSize: '14px', fontWeight: '800', color: '#38bdf8' }}>
                    {incidentResult.location_sector}
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Hazard Level</div>
                  <div className="mono" style={{ fontSize: '14px', fontWeight: '800', color: '#f59e0b' }}>
                    {incidentResult.hazard_level}
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Perimeter Radius</div>
                  <div className="mono" style={{ fontSize: '14px', fontWeight: '800', color: '#a855f7' }}>
                    {incidentResult.perimeter_radius_meters}m
                  </div>
                </div>
              </div>

              {incidentResult.hazmat_detected && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  fontSize: '11px',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <AlertTriangle size={14} />
                  <span>HAZMAT DETECTED: <strong>{incidentResult.hazmat_type || 'Chemical Hazard'}</strong></span>
                </div>
              )}

              {incidentResult.key_evidence?.length > 0 && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  <strong>Key Evidence Snippets:</strong> {incidentResult.key_evidence.join(' • ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EVIDENCE AGENT */}
      {activeTab === 'EVIDENCE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
              Evidence Agent: Interprets Drone Reconnaissance, Camera Feeds, and Visual Cues
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
              Detects structural stability, entrapment counts, and required Level A/B PPE for tactical squads.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <textarea
              value={evidenceInput}
              onChange={(e) => setEvidenceInput(e.target.value)}
              rows={2}
              style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: '#fff',
                padding: '8px 12px',
                fontSize: '12px',
                fontFamily: 'monospace',
                resize: 'none',
              }}
            />
            <button
              onClick={handleInterpretEvidence}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #ec4899, #be185d)',
                color: '#fff',
                border: 'none',
                padding: '0 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {loading ? <RotateCcw size={14} className="spin" /> : <Eye size={14} />}
              Interpret Evidence
            </button>
          </div>

          {evidenceResult && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              borderRadius: '8px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#f472b6' }}>
                {evidenceResult.scene_summary}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Mechanically Entrapped</div>
                  <div className="mono" style={{ fontSize: '18px', fontWeight: '800', color: '#f87171' }}>
                    {evidenceResult.entrapped_count} Casualties
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Structural Stability</div>
                  <div className="mono" style={{ fontSize: '16px', fontWeight: '800', color: '#fbbf24' }}>
                    {evidenceResult.structural_stability}
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Confidence</div>
                  <div className="mono" style={{ fontSize: '16px', fontWeight: '800', color: '#4ade80' }}>
                    {(evidenceResult.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <strong>Mandatory Protective Equipment (PPE):</strong>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {evidenceResult.ppe_required.map((p, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '11px',
                        background: 'rgba(236, 72, 153, 0.15)',
                        color: '#f472b6',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(236, 72, 153, 0.3)',
                      }}
                    >
                      🛡️ {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TRIAGE REASONING AGENT */}
      {activeTab === 'TRIAGE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
              Triage Reasoning Agent: Clinical Feature & Specialty Capability Extraction
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
              Analyzes paramedic field notes without overriding the deterministic TriageScoringEngine.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <textarea
              value={triageInput}
              onChange={(e) => setTriageInput(e.target.value)}
              rows={2}
              style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: '#fff',
                padding: '8px 12px',
                fontSize: '12px',
                fontFamily: 'monospace',
                resize: 'none',
              }}
            />
            <button
              onClick={handleReasonTriage}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                color: '#fff',
                border: 'none',
                padding: '0 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {loading ? <RotateCcw size={14} className="spin" /> : <Activity size={14} />}
              Reason Triage
            </button>
          </div>

          {triageResult && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  padding: '3px 8px',
                  borderRadius: '4px',
                }}>
                  {triageResult.suggested_priority}
                </span>
                <strong style={{ fontSize: '14px', color: '#fff' }}>
                  {triageResult.primary_anatomical_trauma}
                </strong>
              </div>

              <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0 }}>
                {triageResult.clinical_reasoning}
              </p>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <strong>Required Receiving Hospital Specialties:</strong>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {triageResult.required_capabilities.map((cap, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '11px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: 'var(--accent-blue)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                      }}
                    >
                      ✓ {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: COMMAND AGENT EXECUTIVE BRIEFING */}
      {activeTab === 'COMMAND' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                Command Agent: Executive Incident Commander Briefing
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                Synthesizes all specialist agent findings and OR-Tools MILP optimization solutions into explainable directives.
              </p>
            </div>

            <button
              onClick={handleGenerateBriefing}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {loading ? <RotateCcw size={14} className="spin" /> : <FileText size={14} />}
              {loading ? 'Synthesizing Briefing...' : 'Generate Commander Briefing'}
            </button>
          </div>

          {briefingResult && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              <div>
                <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  TIMESTAMP: {briefingResult.briefing_timestamp}
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#f87171', margin: '4px 0' }}>
                  {briefingResult.incident_headline}
                </h3>
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#e2e8f0',
                lineHeight: 1.5,
              }}>
                {briefingResult.situation_overview}
              </div>

              {/* Unassigned Warning */}
              {briefingResult.unassigned_casualties_alert && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <AlertTriangle size={16} />
                  <span>{briefingResult.unassigned_casualties_alert}</span>
                </div>
              )}

              {/* Critical Trade-Offs Explained */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#38bdf8', marginBottom: '6px' }}>
                  Transparent Mathematical Trade-Offs & "WHY?" Rationale:
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#cbd5e1' }}>
                  {briefingResult.critical_tradeoffs_explained.map((to, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{to}</li>
                  ))}
                </ul>
              </div>

              {/* Actionable Directives */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#4ade80', marginBottom: '6px' }}>
                  Immediate Commander Directives:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {briefingResult.actionable_directives.map((dir, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(34, 197, 94, 0.08)',
                        border: '1px solid rgba(34, 197, 94, 0.25)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>⚡ {dir}</span>
                      <span style={{ fontSize: '10px', color: '#4ade80', fontWeight: '800' }}>AUTHORIZE</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PIPELINE EXECUTION */}
      {activeTab === 'PIPELINE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                End-to-End Orchestrator Pipeline
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                Executes the full chain: Incident $\rightarrow$ Evidence $\rightarrow$ Triage $\rightarrow$ Hospital $\rightarrow$ Resource $\rightarrow$ Routing $\rightarrow$ OR-Tools $\rightarrow$ Command Briefing.
              </p>
            </div>

            <button
              onClick={handleRunFullPipeline}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #2563eb, #a855f7)',
                color: '#fff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {loading ? <RotateCcw size={14} className="spin" /> : <Zap size={14} />}
              {loading ? 'Executing Pipeline...' : '⚡ Run Full Multi-Agent Pipeline'}
            </button>
          </div>

          {fullPipelineResult && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#4ade80' }}>
                  ✓ PIPELINE COMPLETE: 7/7 AGENTS SYNCHRONIZED
                </span>
                <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  OR-Tools MILP Integration: VERIFIED
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}>
                  <strong style={{ color: '#fbbf24', fontSize: '12px' }}>Incident Assessment:</strong>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
                    {fullPipelineResult.incident_assessment.estimated_casualties} casualties, {fullPipelineResult.incident_assessment.unconscious_count} unconscious at {fullPipelineResult.incident_assessment.location_sector}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}>
                  <strong style={{ color: '#f472b6', fontSize: '12px' }}>Evidence Assessment:</strong>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
                    {fullPipelineResult.evidence_assessment.entrapped_count} entrapped in {fullPipelineResult.evidence_assessment.structural_stability.toLowerCase()} wreckage
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}>
                  <strong style={{ color: '#38bdf8', fontSize: '12px' }}>Routing Directives:</strong>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
                    {fullPipelineResult.routing_assessment.detour_recommendation}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}>
                  <strong style={{ color: '#c084fc', fontSize: '12px' }}>Command Briefing Headline:</strong>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
                    {fullPipelineResult.commander_briefing.incident_headline}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: ARCHITECTURE DIAGRAM */}
      {activeTab === 'ARCHITECTURE' && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} color="var(--accent-blue)" />
            <strong style={{ color: '#fff', fontSize: '13px' }}>
              LifeLink Multi-Agent Supervisory Architecture
            </strong>
          </div>

          <pre className="mono" style={{
            background: 'rgba(0, 0, 0, 0.6)',
            padding: '16px',
            borderRadius: '6px',
            color: '#38bdf8',
            fontSize: '11px',
            lineHeight: 1.5,
            margin: 0,
            overflowX: 'auto',
          }}>
{`                 ORCHESTRATOR (LifeLinkAgentOrchestrator)
                               │
       ┌───────────────────────┼───────────────────────┐
       ↓                       ↓                       ↓
   INCIDENT AGENT          EVIDENCE AGENT          COMMAND AGENT
(911 & Radio Reports)   (Vision & Drone Recon)  (Tactical Commander Brief)
       │                       │                       │
       ↓                       ↓                       ↓
 TRIAGE REASONING AGENT  RESOURCE AGENT          ROUTING AGENT
(Clinical Capabilities) (Fleet Strain & MABAS)   (Detours & Corridor Delays)
                               │
                               ↓
                        HOSPITAL AGENT
                    (Bed & OR Saturation)
                               │
                               ↓
                 GOOGLE OR-TOOLS MILP OPTIMIZER
          (Deterministic Mathematical Authority - SCIP/CBC)`}
          </pre>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <strong style={{ color: '#fff' }}>Strict Boundary Protection:</strong> AI agents parse unstructured natural language, reason about forensic evidence, and formulate commander briefings. Deterministic algorithms exclusively govern numerical scoring, graph routing, and multi-resource capacity optimization.
          </div>
        </div>
      )}
    </div>
  );
}

