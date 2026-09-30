import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { OpportunityCard } from '../components/OpportunityCard';
import { 
  Sparkles, BookmarkCheck, Send, CheckCircle, Clock, LinkIcon, 
  Compass, AlertCircle, Map, PieChart, Activity, Target, Zap
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, profile } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [trackedItems, setTrackedItems] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Quick URL capture state
  const [captureUrlInput, setCaptureUrlInput] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [captureNotice, setCaptureNotice] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user) {
        const [oppRes, trackRes, anRes] = await Promise.all([
          api.listOpportunities(),
          api.getMyOpportunities(),
          api.getAnalytics()
        ]);
        
        if (oppRes.success) setOpportunities(oppRes.data.items);
        if (trackRes.success) setTrackedItems(trackRes.data.items);
        if (anRes.success) setAnalytics(anRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const isTracked = (oppId) => trackedItems.some(item => item.opportunityId === oppId);
  const getTrackedStatus = (oppId) => {
    const item = trackedItems.find(i => i.opportunityId === oppId);
    return item ? item.status : null;
  };

  const handleTrackOpportunity = async (opp) => {
    if (!user) {
      alert('Please sign in or register to save opportunities.');
      return;
    }
    try {
      await api.trackOpportunity({ opportunityId: opp.id, status: 'saved' });
      fetchData();
    } catch (err) {
      console.error('Error tracking opportunity:', err);
    }
  };

  const handleCaptureUrl = async (e) => {
    e.preventDefault();
    if (!captureUrlInput.trim()) return;
    setCapturing(true);
    setCaptureNotice(null);
    try {
      const res = await api.captureUrl(captureUrlInput.trim());
      if (res.success && res.data.extracted) {
        setCaptureNotice(`Extracted draft: "${res.data.extracted.title}". You can find it in My Opportunities.`);
        setCaptureUrlInput('');
        fetchData();
      }
    } catch (err) {
      setCaptureNotice(err.message || 'Failed to capture URL.');
    } finally {
      setCapturing(false);
    }
  };

  if (!analytics && loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Analytics...</div>;
  }

  const { applications = {}, career = {}, activity = {} } = analytics || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{ padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Sparkles size={20} color="var(--accent-primary)" />
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-primary)' }}>CAREER ALIGN DASHBOARD</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800' }}>
            Welcome back, {user?.displayName || 'Student'}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {profile?.university ? `${profile.university} • ${profile.major}` : 'Explore tailored opportunities and track your application progress.'}
          </p>
        </div>

        {/* Quick URL Capture Form */}
        <form onSubmit={handleCaptureUrl} style={{ display: 'flex', gap: '8px', maxWidth: '420px', width: '100%' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <LinkIcon size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="url"
              className="form-input"
              placeholder="Paste opportunity URL..."
              value={captureUrlInput}
              onChange={(e) => setCaptureUrlInput(e.target.value)}
              style={{ paddingLeft: '36px' }}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={capturing}>
            {capturing ? 'Extracting...' : 'Capture'}
          </button>
        </form>
      </div>

      {captureNotice && (
        <div style={{ background: 'var(--accent-light)', color: 'var(--accent-primary)', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          <span>{captureNotice}</span>
        </div>
      )}

      {/* Analytics Main Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Pipeline Analytics */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <PieChart size={20} color="var(--text-primary)" />
            <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Application Pipeline</h2>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>{applications.planned || 0}</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Planned</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-primary)' }}>{applications.applied || 0}</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Applied</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#92400e' }}>{applications.interviews || 0}</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Interview</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#065f46' }}>{applications.offers || 0}</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Offers</span>
            </div>
          </div>
          <div style={{ height: '8px', display: 'flex', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ flex: applications.planned || 1, background: 'var(--bg-tertiary)' }} />
            <div style={{ flex: applications.applied || 0, background: 'var(--accent-light)' }} />
            <div style={{ flex: applications.interviews || 0, background: '#fef3c7' }} />
            <div style={{ flex: applications.offers || 0, background: '#d1fae5' }} />
          </div>
        </div>

        {/* Career Alignment & Skills */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Target size={20} color="var(--text-primary)" />
            <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Career Alignment & Skills</h2>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Overall Alignment</span>
              <span style={{ fontWeight: '700' }}>{career.alignmentProgress || 0}%</span>
            </div>
            <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${career.alignmentProgress || 0}%`, background: 'var(--accent-primary)' }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Skill Gap Closing Progress</span>
              <span style={{ fontWeight: '700' }}>{career.skillProgress || 0}%</span>
            </div>
            <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${career.skillProgress || 0}%`, background: '#6b21a8' }}></div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              {career.skillGaps > 0 ? `${career.skillGaps} skill gaps identified to close.` : 'No major skill gaps identified.'}
            </p>
          </div>
        </div>

        {/* Roadmap Progress */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Map size={20} color="var(--text-primary)" />
            <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Roadmap Progress</h2>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--accent-primary)', lineHeight: 1 }}>
                {career.roadmapCompletion || 0}%
              </h3>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Milestones Completed</span>
            </div>
            <Link to="/roadmap" className="btn btn-secondary btn-sm">View Roadmap</Link>
          </div>
          <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '10px', overflow: 'hidden', marginTop: '16px' }}>
            <div style={{ height: '100%', width: `${career.roadmapCompletion || 0}%`, background: 'var(--accent-primary)' }}></div>
          </div>
        </div>

      </div>

      {/* Activity and Deadlines Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Recent Activity */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Activity size={20} color="var(--text-primary)" />
            <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Recent Activity</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activity.recent?.length > 0 ? activity.recent.map((act, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: i < activity.recent.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: 'var(--text-primary)' }}>{act.title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{act.action}</p>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(act.date).toLocaleDateString()}</span>
              </div>
            )) : (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>No recent activity to show.</p>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Zap size={20} color="var(--text-primary)" />
            <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Upcoming Deadlines</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activity.upcomingDeadlines?.length > 0 ? activity.upcomingDeadlines.map((dl, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: i < activity.upcomingDeadlines.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ width: '40px', textAlign: 'center' }}>
                  <p style={{ fontSize: '16px', fontWeight: '800', color: 'var(--error-color)', margin: 0 }}>{new Date(dl.deadline).getDate()}</p>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase' }}>
                    {new Date(dl.deadline).toLocaleString('default', { month: 'short' })}
                  </p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: 'var(--text-primary)' }}>{dl.title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Status: {dl.status}</p>
                </div>
              </div>
            )) : (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>No upcoming deadlines!</p>
            )}
          </div>
        </div>

      </div>

      {/* Recommended Opportunities Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Recommended For You</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Personalized using your profile skills and interests.</p>
          </div>
          <Link to="/discover" className="btn btn-secondary btn-sm">
            View All Discoveries <Compass size={16} />
          </Link>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', padding: '20px' }}>Loading opportunities...</p>
        ) : (
          <div className="grid-cols-3">
            {opportunities.slice(0, 6).map(opp => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                isTracked={isTracked(opp.id)}
                currentStatus={getTrackedStatus(opp.id)}
                onTrack={handleTrackOpportunity}
              />
            ))}
            {opportunities.length === 0 && (
              <p style={{ color: 'var(--text-muted)' }}>No matched opportunities found.</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
