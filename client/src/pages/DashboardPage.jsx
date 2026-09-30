import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { OpportunityCard } from '../components/OpportunityCard';
import { OpportunityDetailModal } from '../components/OpportunityDetailModal';
import { 
  Sparkles, 
  BookmarkCheck, 
  Send, 
  CheckCircle, 
  Clock, 
  Plus, 
  LinkIcon, 
  Compass, 
  AlertCircle,
  Map 
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, profile } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [trackedItems, setTrackedItems] = useState([]);
  const [counts, setCounts] = useState({ saved: 0, applied: 0, interview: 0, offered: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  
  // Quick URL capture state
  const [captureUrlInput, setCaptureUrlInput] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [captureNotice, setCaptureNotice] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch recommended opportunities
      const oppRes = await api.listOpportunities();
      if (oppRes.success) setOpportunities(oppRes.data.items);

      // 2. Fetch user tracked pipeline
      if (user) {
        const trackRes = await api.getMyOpportunities();
        if (trackRes.success) {
          setTrackedItems(trackRes.data.items);
          setCounts(trackRes.data.counts);
        }

        // 3. Fetch roadmap
        const roadmapRes = await api.getRoadmap();
        if (roadmapRes.success) {
          setRoadmap(roadmapRes.data);
        }
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

  const isTracked = (oppId) => {
    return trackedItems.some(item => item.opportunityId === oppId);
  };

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
        setCaptureNotice(`Extracted draft: "${res.data.extracted.title}". Opening details...`);
        setSelectedOpp(res.data.extracted);
        setCaptureUrlInput('');
      }
    } catch (err) {
      setCaptureNotice(err.message || 'Failed to capture URL.');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{ padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Sparkles size={20} color="var(--accent-primary)" />
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-primary)' }}>PERSONALIZED DASHBOARD</span>
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

      {/* Stats Overview */}
      <div className="grid-cols-4">
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#dbeafe', color: '#1e40af', padding: '12px', borderRadius: '12px' }}>
            <BookmarkCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>SAVED</span>
            <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{counts.saved || 0}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#f3e8ff', color: '#6b21a8', padding: '12px', borderRadius: '12px' }}>
            <Send size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>APPLIED</span>
            <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{counts.applied || 0}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#fef3c7', color: '#92400e', padding: '12px', borderRadius: '12px' }}>
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>INTERVIEW</span>
            <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{counts.interview || 0}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '12px' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>OFFERED</span>
            <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{counts.offered || 0}</h3>
          </div>
        </div>

      </div>

      {/* Career Roadmap Widget */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Map size={20} color="var(--accent-primary)" /> AI Career Roadmap
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
              {roadmap ? `Target: ${roadmap.targetCareer}` : 'Create your personalized career roadmap.'}
            </p>
          </div>
          <Link to="/roadmap" className="btn btn-primary btn-sm">
            {roadmap ? 'View Roadmap' : 'Generate Roadmap'}
          </Link>
        </div>

        {roadmap && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
              <span>Progress</span>
              <span style={{ color: 'var(--accent-primary)' }}>{roadmap.progress}%</span>
            </div>
            <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${roadmap.progress}%`, background: 'var(--accent-primary)', transition: 'width 0.3s' }}></div>
            </div>
          </div>
        )}
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
                onSelect={(selected) => setSelectedOpp(selected)}
                onTrack={handleTrackOpportunity}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOpp && (
        <OpportunityDetailModal
          opportunity={selectedOpp}
          onClose={() => setSelectedOpp(null)}
          onTrack={handleTrackOpportunity}
          isTracked={isTracked(selectedOpp.id)}
          currentStatus={getTrackedStatus(selectedOpp.id)}
        />
      )}

    </div>
  );
};
