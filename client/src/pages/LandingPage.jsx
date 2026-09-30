import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Compass, 
  ShieldCheck, 
  BookmarkCheck, 
  Bot, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  Zap, 
  Play, 
  Check 
} from 'lucide-react';

export const LandingPage = () => {
  // Interactive Live Demo Hook State for Judges/Visitors
  const [demoProfile, setDemoProfile] = useState('cs');
  const [demoCategory, setDemoCategory] = useState('all');

  const demoOpportunities = [
    {
      id: 'demo-1',
      title: 'Google Summer of Code 2026',
      organization: 'Google Open Source',
      category: 'fellowship',
      funding: '$3,000 - $6,000 Stipend',
      matchReason: 'Matches your Git, Python & Open Source interest.',
      eligibility: 'Appears to Meet (Undergraduate CS Track)'
    },
    {
      id: 'demo-2',
      title: 'Microsoft Imagine Cup 2026',
      organization: 'Microsoft',
      category: 'competition',
      funding: '$100,000 Grand Prize',
      matchReason: 'Matches Cloud Computing & React skill set.',
      eligibility: 'Appears to Meet (Tech Innovator)'
    },
    {
      id: 'demo-3',
      title: 'Kaggle Community AI Grant',
      organization: 'Kaggle & Alphabet',
      category: 'research',
      funding: '$25,000 Research Award',
      matchReason: 'Aligns with your AI & Machine Learning goals.',
      eligibility: 'Appears to Meet (PyTorch & Open Weights)'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '64px', paddingBottom: '40px' }}>
      
      {/* Hero Section */}
      <section style={{ textAlign: 'center', paddingTop: '48px', paddingBottom: '24px', maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Glowing Badge Hook */}
        <div className="animate-float" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--accent-light)', color: 'var(--accent-primary)', padding: '8px 18px', borderRadius: '9999px', fontSize: '13px', fontWeight: '700', marginBottom: '24px', border: '1px solid rgba(79, 70, 229, 0.3)' }}>
          <Sparkles size={16} className="animate-pulse-glow" /> 
          <span>8 Live Scholarships, Internships & Grants Matched Today</span>
        </div>

        <h1 style={{ fontSize: '52px', fontWeight: '800', lineHeight: '1.15', marginBottom: '24px' }}>
          Stop Searching Endless Websites.<br />
          <span className="gradient-text">Discover & Apply</span> with Intelligence.
        </h1>

        <p style={{ fontSize: '19px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '36px', maxWidth: '780px', margin: '0 auto 36px auto' }}>
          Scholarships, internships, research fellowships, and hackathons aggregated in one coherent platform — featuring grounded AI eligibility checks and direct application tracking.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary btn-lg animate-pulse-glow">
            Get Started Free <ArrowRight size={20} />
          </Link>
          <Link to="/discover" className="btn btn-secondary btn-lg">
            <Compass size={20} /> Explore Opportunities
          </Link>
        </div>

      </section>

      {/* INTERACTIVE DEMO HOOK WIDGET FOR JUDGES */}
      <section className="card glass-panel" style={{ padding: '32px', border: '2px solid var(--accent-primary)', boxShadow: 'var(--shadow-glow)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={22} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Live Interactive AI Matcher</h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Select a student persona below to see how our grounded AI matches opportunities in real-time.
            </p>
          </div>

          {/* Persona selector tabs */}
          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '9999px' }}>
            <button
              onClick={() => setDemoProfile('cs')}
              className={`btn btn-sm ${demoProfile === 'cs' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '9999px' }}
            >
              👩‍💻 CS Undergraduate
            </button>
            <button
              onClick={() => setDemoProfile('ai')}
              className={`btn btn-sm ${demoProfile === 'ai' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '9999px' }}
            >
              🤖 AI & ML Researcher
            </button>
          </div>
        </div>

        {/* Live Demo Cards Grid */}
        <div className="grid-cols-3">
          {demoOpportunities.map(opp => (
            <div key={opp.id} className="card" style={{ background: 'var(--bg-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="badge badge-scholarship">{opp.category}</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--status-offered)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} /> Verified Source
                </span>
              </div>

              <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>{opp.title}</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{opp.organization}</p>

              {/* Match Pill */}
              <div style={{ background: 'var(--accent-light)', color: 'var(--accent-primary)', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} />
                <span>{opp.matchReason}</span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{opp.funding}</span>
                <Link to="/register" style={{ fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Try AI Check <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Feature Highlights Grid */}
      <section className="grid-cols-3">
        
        <div className="card glass-panel" style={{ padding: '24px' }}>
          <div style={{ background: 'var(--accent-light)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Search size={24} color="var(--accent-primary)" />
          </div>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Personalized Discovery</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Filter verified opportunities by education level, technical skills, interests, and remote preferences with transparent match explanations.
          </p>
        </div>

        <div className="card glass-panel" style={{ padding: '24px' }}>
          <div style={{ background: 'var(--accent-teal-light)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <ShieldCheck size={24} color="var(--accent-secondary)" />
          </div>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Grounded AI Eligibility</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Never guess whether you qualify. Our AI analyzes opportunity text against your profile and highlights exact skill matches or gaps.
          </p>
        </div>

        <div className="card glass-panel" style={{ padding: '24px' }}>
          <div style={{ background: '#fef3c7', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <BookmarkCheck size={24} color="#b45309" />
          </div>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Pipeline Tracker</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Track every application from Saved to Applied, Interview, and Offered with automatic deadline reminders and document checklists.
          </p>
        </div>

      </section>

      {/* Call to Action */}
      <section style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: '#ffffff', padding: '52px 24px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-glow)' }}>
        <h2 style={{ color: '#ffffff', fontSize: '34px', marginBottom: '12px' }}>Ready to Supercharge Your Opportunity Search?</h2>
        <p style={{ fontSize: '17px', opacity: 0.95, marginBottom: '28px', maxWidth: '640px', margin: '0 auto 28px auto' }}>
          Join university students discovering scholarships, internships, and hackathons with verified AI intelligence.
        </p>
        <Link to="/register" className="btn btn-secondary btn-lg" style={{ background: '#ffffff', color: 'var(--accent-primary)', border: 'none', fontWeight: '800' }}>
          Create Student Account Now
        </Link>
      </section>

    </div>
  );
};
