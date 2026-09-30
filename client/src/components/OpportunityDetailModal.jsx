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
  Check,
  Target
} from 'lucide-react';

export const OpportunityDetailModal = ({ opportunity, onClose, onTrack, isTracked, currentStatus }) => {
  const [aiSummary, setAiSummary] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [alignment, setAlignment] = useState(null);
  const [resumeAlignment, setResumeAlignment] = useState(null);
  const [improvedResume, setImprovedResume] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'ai' | 'alignment' | 'resume'

  if (!opportunity) return null;

  const handleAlignCareer = async () => {
    setLoadingAi(true);
    try {
      const res = await api.alignCareer(opportunity.id);
      if (res.success) setAlignment(res.data);
    } catch (err) {
      console.error('Failed to calculate alignment:', err);
    } finally {
      setLoadingAi(false);
    }
  };

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

  const handleAlignResume = async () => {
    setLoadingAi(true);
    try {
      const res = await api.alignResume(opportunity.id);
      if (res.success) setResumeAlignment(res.data);
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to align resume. Do you have a resume uploaded?');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleImproveResume = async () => {
    setLoadingAi(true);
    try {
      const res = await api.improveResume(opportunity.id);
      if (res.success) {
        setImprovedResume(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to improve resume.');
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
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px', paddingBottom: '8px', overflowX: 'auto' }}>
          <button 
            onClick={() => setActiveTab('details')}
            className={`btn btn-sm ${activeTab === 'details' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Overview & Requirements
          </button>
          <button 
            onClick={() => {
              setActiveTab('alignment');
              if (!alignment) handleAlignCareer();
            }}
            className={`btn btn-sm ${activeTab === 'alignment' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Target size={16} /> Career Alignment
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
          <button 
            onClick={() => {
              setActiveTab('resume');
              if (!resumeAlignment) handleAlignResume();
            }}
            className={`btn btn-sm ${activeTab === 'resume' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ListChecks size={16} /> Resume Match
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

        {/* TAB 2: ALIGNMENT */}
        {activeTab === 'alignment' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Target size={18} color="var(--accent-secondary)" />
                Career Alignment Engine
              </h4>
              <button onClick={handleAlignCareer} className="btn btn-secondary btn-sm" disabled={loadingAi}>
                Recalculate
              </button>
            </div>

            {loadingAi && !alignment && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Analyzing your profile against this opportunity...</p>}

            {alignment && (
              <>
                {/* Overall Score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ 
                    width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent-primary)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800' 
                  }}>
                    {alignment.overallScore}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>Alignment Score</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Based on skills, education, and career goals.</p>
                  </div>
                </div>

                {/* Sub-scores */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {[
                    { label: 'Skills', data: alignment.skillAlignment },
                    { label: 'Education', data: alignment.educationAlignment },
                    { label: 'Experience', data: alignment.experienceAlignment },
                    { label: 'Goals', data: alignment.careerGoalAlignment },
                    { label: 'Interests', data: alignment.interestAlignment },
                    { label: 'Location', data: alignment.locationAlignment }
                  ].map((sub, i) => (
                    <div key={i} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600' }}>{sub.label}</span>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: sub.data?.score >= 70 ? 'var(--status-offered)' : 'var(--text-primary)' }}>
                          {sub.data?.score}/100
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>{sub.data?.explanation}</p>
                    </div>
                  ))}
                </div>

                {/* Narrative Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: 'var(--accent-primary)' }}>Why this matches you</strong>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)' }}>{alignment.whyItMatches}</p>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: 'var(--status-offered)' }}>What you already have</strong>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)' }}>{alignment.whatYouHave}</p>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: 'var(--status-rejected)' }}>What may be missing</strong>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)' }}>{alignment.whatIsMissing}</p>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                    <strong style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Recommended Next Action</strong>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{alignment.recommendedNextAction}</p>
                  </div>
                </div>

                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                  {alignment.disclaimer}
                </p>
              </>
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

        {/* TAB 4: RESUME ALIGNMENT */}
        {activeTab === 'resume' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ListChecks size={18} color="var(--accent-primary)" />
                Resume Intelligence Engine
              </h4>
              <button onClick={handleAlignResume} className="btn btn-secondary btn-sm" disabled={loadingAi}>
                Recalculate Match
              </button>
            </div>

            {loadingAi && !resumeAlignment && !improvedResume && (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Analyzing your uploaded resume against this opportunity...</p>
            )}

            {resumeAlignment && !improvedResume && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <strong style={{ color: 'var(--status-offered)', display: 'block', marginBottom: '8px' }}>Matching Skills & Experience</strong>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {resumeAlignment.matchingSkills?.map((s, i) => <li key={i}>{s}</li>)}
                      {resumeAlignment.relevantExperience?.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                  
                  <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <strong style={{ color: 'var(--status-rejected)', display: 'block', marginBottom: '8px' }}>Missing Skills & Experience</strong>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {resumeAlignment.missingSkills?.map((s, i) => <li key={i}>{s}</li>)}
                      {resumeAlignment.missingExperience?.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--accent-primary)' }}>Improvement Suggestions</strong>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {resumeAlignment.improvementSuggestions?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                  
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--border-color)' }}>
                    <button onClick={handleImproveResume} className="btn btn-primary" disabled={loadingAi} style={{ width: '100%' }}>
                      <Sparkles size={16} /> Improve My Resume For This Opportunity
                    </button>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
                      AI will strictly improve phrasing without inventing facts.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {improvedResume && (
              <div style={{ background: 'var(--accent-light)', padding: '20px', borderRadius: '8px', border: '1px solid var(--accent-primary)' }}>
                <h4 style={{ fontSize: '16px', color: 'var(--accent-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={18} /> Optimized Resume Draft
                </h4>
                <p style={{ fontSize: '13px', marginBottom: '16px' }}>Your resume has been rewritten to better highlight keywords for this role.</p>
                
                <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '6px', fontSize: '13px', maxHeight: '300px', overflowY: 'auto' }}>
                  <strong>Improved Experience Descriptions:</strong>
                  <ul style={{ paddingLeft: '16px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {improvedResume.experience?.map((exp, i) => (
                      <li key={i}>
                        <em>{exp.role} at {exp.company}</em><br/>
                        {exp.description}
                      </li>
                    ))}
                  </ul>
                  
                  <strong style={{ display: 'block', marginTop: '12px' }}>Improved Project Descriptions:</strong>
                  <ul style={{ paddingLeft: '16px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {improvedResume.projects?.map((proj, i) => (
                      <li key={i}>
                        <em>{proj.name}</em><br/>
                        {proj.description}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button className="btn btn-primary" onClick={() => {
                    const blob = new Blob([JSON.stringify(improvedResume, null, 2)], { type: 'application/json' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `improved-resume-${opportunity.id}.json`;
                    a.click();
                  }}>
                    Download Improved JSON
                  </button>
                  <button onClick={() => setImprovedResume(null)} className="btn btn-secondary">
                    Back to Analysis
                  </button>
                </div>
              </div>
            )}
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
