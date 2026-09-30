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
  FileText,
  Clock,
  Briefcase,
  Sparkles,
  Link,
  ChevronDown,
  ChevronUp,
  Activity
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

  // Checklist editing state
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [editingChecklistId, setEditingChecklistId] = useState(null);

  // Reminders editing state
  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [editingReminderId, setEditingReminderId] = useState(null);

  // Expanded card state
  const [expandedCardId, setExpandedCardId] = useState(null);

  // Active Resume (if uploaded)
  const [activeResume, setActiveResume] = useState(null);

  const fetchTrackedData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getMyOpportunities({ status: statusFilter });
      if (res.success) {
        setTrackedItems(res.data.items);
        setCounts(res.data.counts);
      }
      const resumeRes = await api.getResume();
      if (resumeRes.success) {
        setActiveResume(resumeRes.data);
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

  const handleStatusChange = async (item, newStatus) => {
    try {
      const currentHistory = item.activityHistory || [];
      const updatedHistory = [...currentHistory, {
        date: new Date().toISOString(),
        action: `Moved from ${item.status} to ${newStatus}`
      }];
      await api.updateTrackedOpportunity(item.id, { 
        status: newStatus,
        activityHistory: updatedHistory
      });
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

  const handleToggleChecklist = async (item, checklistId) => {
    const updatedChecklist = item.checklist.map(c => 
      c.id === checklistId ? { ...c, completed: !c.completed } : c
    );
    try {
      await api.updateTrackedOpportunity(item.id, { checklist: updatedChecklist });
      fetchTrackedData();
    } catch (err) {
      console.error('Failed to toggle checklist:', err);
    }
  };

  const handleAddChecklist = async (item) => {
    if (!newChecklistItem.trim()) return;
    const newItem = { id: `chk-${Date.now()}`, item: newChecklistItem, completed: false };
    const updatedChecklist = [...(item.checklist || []), newItem];
    try {
      await api.updateTrackedOpportunity(item.id, { checklist: updatedChecklist });
      setNewChecklistItem('');
      fetchTrackedData();
    } catch (err) {
      console.error('Failed to add checklist item:', err);
    }
  };

  const handleDeleteChecklist = async (item, checklistId) => {
    const updatedChecklist = item.checklist.filter(c => c.id !== checklistId);
    try {
      await api.updateTrackedOpportunity(item.id, { checklist: updatedChecklist });
      fetchTrackedData();
    } catch (err) {
      console.error('Failed to delete checklist item:', err);
    }
  };

  const handleAddReminder = async (item) => {
    if (!newReminderText.trim() || !newReminderDate) return;
    const newReminder = { id: `rem-${Date.now()}`, text: newReminderText, date: newReminderDate };
    const updatedReminders = [...(item.reminders || []), newReminder];
    try {
      await api.updateTrackedOpportunity(item.id, { reminders: updatedReminders });
      setNewReminderText('');
      setNewReminderDate('');
      fetchTrackedData();
    } catch (err) {
      console.error('Failed to add reminder:', err);
    }
  };

  const handleDeleteReminder = async (item, remId) => {
    const updatedReminders = (item.reminders || []).filter(r => r.id !== remId);
    try {
      await api.updateTrackedOpportunity(item.id, { reminders: updatedReminders });
      fetchTrackedData();
    } catch (err) {
      console.error('Failed to delete reminder:', err);
    }
  };

  const handleLinkResume = async (item) => {
    if (!activeResume) return alert('No resume uploaded to your profile.');
    try {
      const currentHistory = item.activityHistory || [];
      const updatedHistory = [...currentHistory, {
        date: new Date().toISOString(),
        action: `Linked resume: ${activeResume.fileName}`
      }];
      await api.updateTrackedOpportunity(item.id, { 
        resumeId: activeResume.id,
        activityHistory: updatedHistory
      });
      fetchTrackedData();
    } catch (err) {
      console.error('Failed to link resume:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this opportunity from your workspace?')) return;
    try {
      await api.deleteTrackedOpportunity(id);
      fetchTrackedData();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const toggleExpanded = (id) => {
    setExpandedCardId(prev => prev === id ? null : id);
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
          Please sign in to track your applications in the Application Workspace.
        </p>
      </div>
    );
  }

  // Kanban view mapping
  const kanbanColumns = [
    { id: 'saved', label: 'Saved' },
    { id: 'planned', label: 'Planned' },
    { id: 'applied', label: 'Applied' },
    { id: 'shortlisted', label: 'Shortlisted / Interview', match: ['shortlisted', 'interview'] },
    { id: 'offered', label: 'Offered' }
  ];

  const renderCard = (item) => {
    const opp = item.opportunity || {};
    const isExpanded = expandedCardId === item.id;
    
    return (
      <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="badge badge-scholarship" style={{ marginBottom: '6px' }}>
              {opp.category || 'Opportunity'}
            </span>
            <h3 
              onClick={() => toggleExpanded(item.id)} 
              style={{ fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {opp.title || 'Opportunity Title'}
              {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              <Building2 size={12} />
              <span>{opp.organization}</span>
              <span>•</span>
              <Calendar size={12} />
              <span style={{ color: opp.deadline && new Date(opp.deadline) < new Date() ? 'var(--status-rejected)' : 'inherit' }}>
                {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'Rolling'}
              </span>
            </div>
          </div>

          {/* Status Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <select
              className="form-select"
              value={item.status}
              onChange={(e) => handleStatusChange(item, e.target.value)}
              style={{ fontWeight: '700', textTransform: 'capitalize', width: 'auto', padding: '4px 28px 4px 8px', fontSize: '12px' }}
            >
              <option value="saved">Saved</option>
              <option value="planned">Planned</option>
              <option value="applied">Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview</option>
              <option value="offered">Offered 🎉</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Progress Bar (Visual) */}
        <div style={{ width: '100%', height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            background: item.status === 'offered' ? 'var(--status-offered)' : 
                        item.status === 'rejected' ? 'var(--status-rejected)' : 
                        'var(--accent-primary)',
            width: item.status === 'saved' ? '10%' :
                   item.status === 'planned' ? '25%' :
                   item.status === 'applied' ? '50%' :
                   (item.status === 'shortlisted' || item.status === 'interview') ? '75%' :
                   item.status === 'offered' ? '100%' : '100%'
          }} />
        </div>

        {/* Quick Actions (Unexpanded) */}
        {!isExpanded && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {item.checklist?.filter(c => c.completed).length || 0}/{item.checklist?.length || 0} tasks
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setSelectedOpp(opp)} className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '11px' }}>
                <Sparkles size={12} /> AI Copilot
              </button>
            </div>
          </div>
        )}

        {/* EXPANDED VIEW: Complete Workspace */}
        {isExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            
            {/* Action Bar */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a href={opp.applicationUrl || opp.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                Apply / Portal <ExternalLink size={14} />
              </a>
              <button onClick={() => handleLinkResume(item)} className={`btn btn-sm ${item.resumeId ? 'btn-secondary' : 'btn-outline'}`} disabled={!!item.resumeId}>
                <FileText size={14} /> {item.resumeId ? 'Resume Attached' : 'Attach Profile Resume'}
              </button>
              <button onClick={() => setSelectedOpp(opp)} className="btn btn-secondary btn-sm">
                <Sparkles size={14} /> AI Preparation & Details
              </button>
            </div>

            {/* Application Notes */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Edit3 size={14} color="var(--accent-primary)" /> Application Notes
                </strong>
                {editingNotesId !== item.id && (
                  <button 
                    onClick={() => { setEditingNotesId(item.id); setNotesInput(item.notes || ''); }} 
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '2px 8px', fontSize: '11px' }}
                  >
                    Edit
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
                <p style={{ color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-line' }}>
                  {item.notes || 'No notes added. Click edit to record login details, interviewer names, etc.'}
                </p>
              )}
            </div>

            {/* Checklist & Reminders Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              
              {/* Checklist */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginBottom: '12px' }}>
                  <CheckCircle2 size={14} color="var(--accent-secondary)" /> Action Checklist
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(item.checklist || []).map(chk => (
                    <div key={chk.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px' }}>
                      <input 
                        type="checkbox" 
                        checked={chk.completed} 
                        onChange={() => handleToggleChecklist(item, chk.id)}
                        style={{ marginTop: '3px' }}
                      />
                      <span style={{ textDecoration: chk.completed ? 'line-through' : 'none', color: chk.completed ? 'var(--text-muted)' : 'var(--text-primary)', flex: 1 }}>
                        {chk.item}
                      </span>
                      <button onClick={() => handleDeleteChecklist(item, chk.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {editingChecklistId === item.id ? (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                      <input type="text" className="form-input" style={{ padding: '4px 8px', fontSize: '12px' }} placeholder="New task..." value={newChecklistItem} onChange={e => setNewChecklistItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddChecklist(item)} />
                      <button onClick={() => handleAddChecklist(item)} className="btn btn-primary btn-sm" style={{ padding: '4px 8px' }}>Add</button>
                      <button onClick={() => setEditingChecklistId(null)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>X</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingChecklistId(item.id)} className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start', padding: '2px 8px', fontSize: '11px', marginTop: '4px' }}>
                      + Add Item
                    </button>
                  )}
                </div>
              </div>

              {/* Reminders & Deadlines */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginBottom: '12px' }}>
                  <Clock size={14} color="var(--status-interview)" /> Deadlines & Reminders
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(item.reminders || []).map(rem => (
                    <div key={rem.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', background: 'var(--bg-tertiary)', padding: '6px 8px', borderRadius: '4px' }}>
                      <Calendar size={14} style={{ marginTop: '2px', color: 'var(--text-muted)' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600' }}>{new Date(rem.date).toLocaleDateString()}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>{rem.text}</div>
                      </div>
                      <button onClick={() => handleDeleteReminder(item, rem.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {editingReminderId === item.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                      <input type="text" className="form-input" style={{ padding: '4px 8px', fontSize: '12px' }} placeholder="Reminder description..." value={newReminderText} onChange={e => setNewReminderText(e.target.value)} />
                      <input type="datetime-local" className="form-input" style={{ padding: '4px 8px', fontSize: '12px' }} value={newReminderDate} onChange={e => setNewReminderDate(e.target.value)} />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleAddReminder(item)} className="btn btn-primary btn-sm" style={{ padding: '4px 8px' }}>Save</button>
                        <button onClick={() => setEditingReminderId(null)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setEditingReminderId(item.id)} className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start', padding: '2px 8px', fontSize: '11px', marginTop: '4px' }}>
                      + Add Reminder
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Activity History */}
            {item.activityHistory && item.activityHistory.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <Activity size={12} /> Activity History
                </strong>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[...item.activityHistory].reverse().slice(0, 3).map((hist, i) => (
                    <li key={i}>{new Date(hist.date).toLocaleString()} - {hist.action}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button onClick={() => handleDelete(item.id)} className="btn btn-outline btn-sm" style={{ color: 'var(--status-rejected)', borderColor: 'var(--status-rejected)' }}>
                <Trash2 size={14} /> Remove from Workspace
              </button>
            </div>
            
          </div>
        )}

      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Briefcase size={28} color="var(--accent-primary)" /> Application Workspace
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Manage your entire application pipeline, deadlines, notes, and AI-powered preparation tasks.
        </p>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', marginTop: '16px' }}>
          {statuses.map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`btn btn-sm ${statusFilter === st.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '9999px', fontSize: '12px', whiteSpace: 'nowrap' }}
            >
              {st.label} {counts[st.id] !== undefined ? `(${counts[st.id]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Tracked Items View */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', padding: '20px' }}>Loading workspace...</p>
      ) : trackedItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <BookmarkCheck size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
          <h3>Workspace Empty</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Discover opportunities and click "Save" to add them to your application pipeline.
          </p>
        </div>
      ) : (
        <>
          {statusFilter === 'all' ? (
            /* Kanban Board View */
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', minHeight: '600px' }}>
              {kanbanColumns.map(col => {
                const columnItems = trackedItems.filter(item => 
                  col.match ? col.match.includes(item.status) : item.status === col.id
                );
                return (
                  <div key={col.id} style={{ minWidth: '340px', width: '340px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                        {col.label}
                      </h4>
                      <span style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                        {columnItems.length}
                      </span>
                    </div>
                    {columnItems.map(item => renderCard(item))}
                    {columnItems.length === 0 && (
                      <div style={{ padding: '24px', textAlign: 'center', border: '2px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                        No {col.label.toLowerCase()} applications
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {trackedItems.map(item => renderCard(item))}
            </div>
          )}
        </>
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
