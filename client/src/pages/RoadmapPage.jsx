import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Map, 
  Target, 
  CheckCircle2, 
  Circle,
  Briefcase,
  BookOpen,
  Code,
  RefreshCw,
  Award
} from 'lucide-react';

const RoadmapPage = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await api.getRoadmap();
      if (res.success && res.data) {
        setRoadmap(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      const res = await api.generateRoadmap();
      if (res.success) {
        setRoadmap(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate roadmap. Please ensure your profile is complete.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleMilestone = async (id) => {
    if (!roadmap) return;
    const updatedMilestones = roadmap.milestones.map(m => 
      m.id === id ? { ...m, status: m.status === 'completed' ? 'pending' : 'completed' } : m
    );
    
    const completedCount = updatedMilestones.filter(m => m.status === 'completed').length;
    const newProgress = updatedMilestones.length > 0 
      ? Math.round((completedCount / updatedMilestones.length) * 100) 
      : 0;

    const optimisticRoadmap = { ...roadmap, milestones: updatedMilestones, progress: newProgress };
    setRoadmap(optimisticRoadmap);

    try {
      await api.updateRoadmapProgress({
        milestones: updatedMilestones,
        progress: newProgress
      });
    } catch (err) {
      console.error('Failed to update progress', err);
      // Revert on failure
      setRoadmap(roadmap);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <RefreshCw className="spin" size={32} style={{ color: 'var(--accent-primary)', marginBottom: '16px' }} />
        <h2>Loading your roadmap...</h2>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="container" style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <Map size={48} style={{ color: 'var(--accent-primary)', marginBottom: '20px' }} />
          <h2>AI Career Roadmap</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
            Generate a personalized, step-by-step career roadmap based on your current profile, skills, and career goals.
          </p>
          {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}
          <button 
            className="btn btn-primary" 
            onClick={handleGenerate} 
            disabled={generating}
            style={{ width: '100%', padding: '12px' }}
          >
            {generating ? <><RefreshCw className="spin" size={18} /> Generating Roadmap...</> : <><Target size={18} /> Generate My Roadmap</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '28px', margin: 0 }}>
            <Map color="var(--accent-primary)" /> Career Roadmap
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0 0' }}>Target: <strong>{roadmap.targetCareer}</strong></p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleGenerate} disabled={generating}>
          {generating ? <RefreshCw className="spin" size={16} /> : <RefreshCw size={16} />} 
          Regenerate
        </button>
      </div>

      {/* Progress Bar */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontWeight: '600' }}>Overall Progress</span>
          <span style={{ fontWeight: '800', color: 'var(--accent-primary)' }}>{roadmap.progress}%</span>
        </div>
        <div style={{ height: '10px', background: 'var(--bg-tertiary)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${roadmap.progress}%`, background: 'var(--accent-primary)', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
        
        {/* Left Column: Milestones */}
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={20} /> Actionable Milestones
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {roadmap.milestones.map((milestone, idx) => (
              <div 
                key={milestone.id} 
                onClick={() => toggleMilestone(milestone.id)}
                style={{ 
                  display: 'flex', gap: '16px', background: 'var(--bg-secondary)', padding: '20px', 
                  borderRadius: 'var(--radius-md)', border: '1px solid', 
                  borderColor: milestone.status === 'completed' ? 'var(--status-offered)' : 'var(--border-color)',
                  cursor: 'pointer', transition: 'all 0.2s',
                  opacity: milestone.status === 'completed' ? 0.7 : 1
                }}
              >
                <div style={{ marginTop: '2px' }}>
                  {milestone.status === 'completed' 
                    ? <CheckCircle2 size={24} color="var(--status-offered)" /> 
                    : <Circle size={24} color="var(--text-muted)" />
                  }
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', textDecoration: milestone.status === 'completed' ? 'line-through' : 'none' }}>
                    {idx + 1}. {milestone.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Current State */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={16} /> Current State
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>{roadmap.currentState}</p>
          </div>

          {/* Missing Skills */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={16} /> Skills to Acquire
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {roadmap.missingSkills.map((skill, i) => (
                <span key={i} style={{ background: 'var(--status-rejected-bg, #fee2e2)', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Learning Priorities */}
          {roadmap.learningPriorities && roadmap.learningPriorities.length > 0 && (
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={16} /> Learning Priorities
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {roadmap.learningPriorities.map((lp, i) => (
                  <li key={i}>
                    <strong style={{ color: 'var(--text-primary)' }}>{lp.topic}</strong>: {lp.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Projects */}
          {roadmap.suggestedProjects && roadmap.suggestedProjects.length > 0 && (
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Code size={16} /> Suggested Projects
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {roadmap.suggestedProjects.map((proj, i) => (
                  <div key={i} style={{ borderLeft: '3px solid var(--accent-primary)', paddingLeft: '10px' }}>
                    <strong style={{ fontSize: '14px', display: 'block' }}>{proj.title}</strong>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0' }}>{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
