import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { OpportunityDetailModal } from '../components/OpportunityDetailModal';
import { 
  BookmarkCheck, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  ExternalLink, 
  Calendar, 
  Building2, 
  FileText 
} from 'lucide-react';

export const MyOpportunitiesPage = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [trackedItems, setTrackedItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState(null);

  // Notes editing state
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [notesInput, setNotesInput] = useState('');

  const fetchTrackedData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getMyOpportunities({ status: statusFilter });
      if (res.success) {
        setTrackedItems(res.data.items);
        setCounts(res.data.counts);
      }
    } catch (err) {
      console.error('Failed to load tracker data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackedData();
  }, [statusFilter, user]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateTrackedOpportunity(id, { status: newStatus });
      fetchTrackedData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSaveNotes = async (id) => {
    try {
      await api.updateTrackedOpportunity(id, { notes: notesInput });
      setEditingNotesId(null);
      fetchTrackedData();
    } catch (err) {
      console.error('Failed to update notes:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this opportunity from your tracker?')) return;
    try {
      await api.deleteTrackedOpportunity(id);
      fetchTrackedData();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const statuses = [
    { id: 'all', label: 'All Items' },
    { id: 'saved', label: 'Saved' },
    { id: 'planned', label: 'Planned' },
    { id: 'applied', label: 'Applied' },
    { id: 'shortlisted', label: 'Shortlisted' },
    { id: 'interview', label: 'Interview' },
    { id: 'offered', label: 'Offered' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'archived', label: 'Archived' }
  ];

  if (!user) {
    return (
      <div className="card glass-panel" style={{ textAlign: 'center', padding: '48px 20px', maxWidth: '500px', margin: '40px auto' }}>
        <BookmarkCheck size={40} color="var(--accent-primary)" style={{ marginBottom: '12px' }} />
        <h2>Sign In Required</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          Please sign in to track your saved opportunities and application statuses.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '4px' }}>My Opportunities Tracker</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Manage your application pipeline, deadlines, notes, and preparation checklists.
        </p>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', marginTop: '16px' }}>
          {statuses.map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`btn btn-sm ${statusFilter === st.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '9999px', fontSize: '12px' }}
            >
              {st.label} {counts[st.id] !== undefined ? `(${counts[st.id]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Tracked Items Table / Cards */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', padding: '20px' }}>Loading tracker...</p>
      ) : trackedItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <BookmarkCheck size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
          <h3>No Tracked Items in this View</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Discover opportunities and click "Save" to add them to your tracking board.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {trackedItems.map(item => {
            const opp = item.opportunity || {};
            return (
              <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <span className="badge badge-scholarship" style={{ marginBottom: '6px' }}>
                      {opp.category || 'Opportunity'}
                    </span>
                    <h3 
                      onClick={() => setSelectedOpp(opp)} 
                      style={{ fontSize: '18px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      {opp.title || 'Opportunity Title'}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      <Building2 size={14} />
                      <span>{opp.organization}</span>
                      <span>•</span>
                      <Calendar size={14} />
                      <span>Deadline: {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'Rolling'}</span>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select
                      className="form-select"
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      style={{ fontWeight: '700', textTransform: 'capitalize', width: 'auto' }}
                    >
                      <option value="saved">Saved</option>
                      <option value="planned">Planned</option>
                      <option value="applied">Applied</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview">Interview</option>
                      <option value="offered">Offered 🎉</option>
                      <option value="rejected">Rejected</option>
                      <option value="archived">Archived</option>
                    </select>

                    <button onClick={() => handleDelete(item.id)} className="btn btn-outline btn-sm" title="Remove from Tracker" style={{ color: 'var(--status-rejected)', borderColor: 'var(--status-rejected)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Notes Section */}
                <div style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={14} color="var(--accent-primary)" /> Application Notes
                    </strong>
                    {editingNotesId !== item.id && (
                      <button 
                        onClick={() => {
                          setEditingNotesId(item.id);
                          setNotesInput(item.notes || '');
                        }} 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 8px', fontSize: '11px' }}
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                    )}
                  </div>

                  {editingNotesId === item.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                      <textarea
                        className="form-textarea"
                        rows={2}
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                      />
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditingNotesId(null)} className="btn btn-secondary btn-sm">Cancel</button>
                        <button onClick={() => handleSaveNotes(item.id)} className="btn btn-primary btn-sm">Save Notes</button>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {item.notes || 'No custom notes added. Click edit to record application details, transcripts sent, or portal links.'}
                    </p>
                  )}
                </div>

                {/* Action Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
                  <button onClick={() => setSelectedOpp(opp)} className="btn btn-secondary btn-sm">
                    View Details & AI Checklist
                  </button>
                  <a href={opp.applicationUrl || opp.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                    Portal Link <ExternalLink size={14} />
                  </a>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal View */}
      {selectedOpp && (
        <OpportunityDetailModal
          opportunity={selectedOpp}
          onClose={() => setSelectedOpp(null)}
          onTrack={() => {}}
          isTracked={true}
        />
      )}

    </div>
  );
};
