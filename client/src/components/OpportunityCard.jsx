import React from 'react';
import { 
  Building2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Sparkles, 
  Bookmark, 
  Check, 
  ArrowUpRight 
} from 'lucide-react';

export const OpportunityCard = ({ opportunity, isTracked, onSelect, onTrack, currentStatus }) => {
  const getBadgeClass = (category) => {
    switch (category?.toLowerCase()) {
      case 'scholarship': return 'badge-scholarship';
      case 'internship': return 'badge-internship';
      case 'hackathon': return 'badge-hackathon';
      case 'fellowship': return 'badge-fellowship';
      case 'research': return 'badge-research';
      case 'competition': return 'badge-competition';
      default: return 'badge-research';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Rolling Basis';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
      <div>
        
        {/* Top bar: Category + Quick Save */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span className={`badge ${getBadgeClass(opportunity.category)}`}>
            {opportunity.category}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onTrack(opportunity);
            }}
            className={`btn btn-sm ${isTracked ? 'btn-secondary' : 'btn-outline'}`}
            style={{ padding: '4px 10px', fontSize: '12px' }}
          >
            {isTracked ? (
              <>
                <Check size={14} color="var(--accent-secondary)" />
                <span style={{ textTransform: 'capitalize' }}>{currentStatus || 'Saved'}</span>
              </>
            ) : (
              <>
                <Bookmark size={14} />
                <span>Save</span>
              </>
            )}
          </button>
        </div>

        {/* Title & Organization */}
        <h3 
          onClick={() => onSelect(opportunity)}
          style={{ fontSize: '17px', fontWeight: '700', marginBottom: '6px', cursor: 'pointer', lineHeight: '1.3' }}
        >
          {opportunity.title}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          <Building2 size={15} color="var(--text-muted)" />
          <span>{opportunity.organization}</span>
        </div>

        {/* Personalized Match Explanation Pill */}
        {opportunity.matchExplanation && (
          <div style={{ background: 'var(--accent-light)', color: 'var(--accent-primary)', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Sparkles size={14} />
            <span>{opportunity.matchExplanation}</span>
          </div>
        )}

        {/* Key Attributes */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} color="var(--text-muted)" />
            {formatDate(opportunity.deadline)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={14} color="var(--text-muted)" />
            {opportunity.isRemote ? 'Remote' : (opportunity.location || 'Onsite')}
          </span>
          {opportunity.fundingCompensation && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: 'var(--text-primary)' }}>
              <DollarSign size={14} color="var(--accent-secondary)" />
              {opportunity.fundingCompensation}
            </span>
          )}
        </div>

      </div>

      {/* Bottom Action bar */}
      <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {(opportunity.skillsRequired || []).slice(0, 3).map((skill, idx) => (
            <span key={idx} style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
              {skill}
            </span>
          ))}
        </div>

        <button 
          onClick={() => onSelect(opportunity)} 
          className="btn btn-secondary btn-sm"
          style={{ gap: '4px' }}
        >
          Details <ArrowUpRight size={14} />
        </button>
      </div>

    </div>
  );
};
