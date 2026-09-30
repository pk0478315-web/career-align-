import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  X, 
  Building2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ListChecks, 
  Bookmark, 
  Check 
} from 'lucide-react';

export const OpportunityDetailModal = ({ opportunity, onClose, onTrack, isTracked, currentStatus }) => {
  const [aiSummary, setAiSummary] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'ai'

  if (!opportunity) return null;

  const handleFetchAiSummary = async () => {
    setLoadingAi(true);
    try {
      const res = await api.summarizeOpportunity({ opportunityId: opportunity.id });
      if (res.success) setAiSummary(res.data);
    } catch (err) {
      console.error('Failed to get AI summary:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCheckEligibility = async () => {
    setLoadingAi(true);
    try {
      const res = await api.checkEligibility(opportunity.id);
      if (res.success) setEligibility(res.data);
    } catch (err) {
      console.error('Failed to check eligibility:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleGenerateChecklist = async () => {
    setLoadingAi(true);
    try {
      const res = await api.generateChecklist(opportunity.id);
      if (res.success) setChecklist(res.data.checklist);
    } catch (err) {
      console.error('Failed to generate checklist:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <span className="badge badge-scholarship" style={{ marginBottom: '8px' }}>
              {opportunity.category}
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: '800' }}>{opportunity.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              <Building2 size={16} />
              <span>{opportunity.organization}</span>
            </div>
          </div>
          
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '8px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px', paddingBottom: '8px' }}>
          <button 
            onClick={() => setActiveTab('details')}
            className={`btn btn-sm ${activeTab === 'details' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Overview & Requirements
          </button>
          <button 
            onClick={() => {
              setActiveTab('ai');
              if (!eligibility) handleCheckEligibility();
            }}
            className={`btn btn-sm ${activeTab === 'ai' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Sparkles size={16} /> AI Eligibility & Insights
          </button>
        </div>

        {/* TAB 1: DETAILS */}
        {activeTab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Quick Metadata Bar */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', fontWeight: '600' }}>DEADLINE</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Calendar size={14} />
                  {opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString() : 'Rolling'}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', fontWeight: '600' }}>LOCATION</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <MapPin size={14} />
                  {opportunity.isRemote ? 'Remote' : (opportunity.location || 'Onsite')}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', fontWeight: '600' }}>FUNDING</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', color: 'var(--accent-secondary)' }}>
                  <DollarSign size={14} />
                  {opportunity.fundingCompensation || 'Specified on portal'}
                </strong>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 style={{ fontSize: '15px', marginBottom: '8px' }}>Description</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {opportunity.description}
              </p>
            </div>

            {/* Requirements */}
            {opportunity.requirements && opportunity.requirements.length > 0 && (
              <div>
                <h4 style={{ fontSize: '15px', marginBottom: '8px' }}>Eligibility Requirements</h4>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {opportunity.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {opportunity.skillsRequired && opportunity.skillsRequired.length > 0 && (
              <div>
                <h4 style={{ fontSize: '15px', marginBottom: '8px' }}>Skills Required</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {opportunity.skillsRequired.map((skill, idx) => (
                    <span key={idx} style={{ background: 'var(--accent-light)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: AI INSIGHTS */}
        {activeTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Eligibility Assessment Widget */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={18} color="var(--accent-primary)" />
                  AI Eligibility Analysis
                </h4>
                <button onClick={handleCheckEligibility} className="btn btn-secondary btn-sm" disabled={loadingAi}>
                  Re-evaluate
                </button>
              </div>

              {loadingAi && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Evaluating profile alignment...</p>}

              {eligibility && (
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Overall Assessment: </span>
                    <strong style={{ 
                      textTransform: 'capitalize', 
                      color: eligibility.overallStatus === 'appears to meet' ? 'var(--status-offered)' : 'var(--status-interview)' 
                    }}>
                      {eligibility.overallStatus}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {eligibility.factors.map((f, idx) => (
                      <div key={idx} style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>
                          {f.assessment === 'appears to meet' && <CheckCircle2 size={16} color="var(--status-offered)" />}
                          {f.assessment === 'possible gap' && <AlertCircle size={16} color="var(--status-interview)" />}
                          {f.assessment === 'not enough information' && <HelpCircle size={16} color="var(--text-muted)" />}
                          <span>{f.criterion}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{f.assessment}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{f.detail}</p>
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px', fontStyle: 'italic' }}>
                    {eligibility.disclaimer}
                  </p>
                </div>
              )}
            </div>

            {/* Checklist Generator */}
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ListChecks size={18} color="var(--accent-secondary)" />
                  Application Checklist Generator
                </h4>
                {!checklist && (
                  <button onClick={handleGenerateChecklist} className="btn btn-secondary btn-sm" disabled={loadingAi}>
                    Generate Checklist
                  </button>
                )}
              </div>

              {checklist && (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {checklist.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
                      <CheckCircle2 size={16} color="var(--accent-secondary)" />
                      <span>{item.item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        )}

        {/* Footer Action Bar */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button 
            onClick={() => onTrack(opportunity)}
            className={`btn ${isTracked ? 'btn-secondary' : 'btn-outline'}`}
          >
            {isTracked ? <><Check size={16} /> Saved ({currentStatus || 'Tracked'})</> : <><Bookmark size={16} /> Save Opportunity</>}
          </button>

          <a 
            href={opportunity.applicationUrl || opportunity.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Apply on Official Portal <ExternalLink size={16} />
          </a>
        </div>

      </div>
    </div>
  );
};
