import React from 'react';
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
  Layers 
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '60px', paddingBottom: '40px' }}>
      
      {/* Hero Section */}
      <section style={{ textAlign: 'center', paddingTop: '40px', paddingBottom: '20px', maxWidth: '860px', margin: '0 auto' }}>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--accent-light)', color: 'var(--accent-primary)', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: '700', marginBottom: '20px' }}>
          <Sparkles size={16} /> AI-POWERED STUDENT OPPORTUNITY HUB
        </div>

        <h1 style={{ fontSize: '48px', fontWeight: '800', lineHeight: '1.15', marginBottom: '20px' }}>
          Stop Searching Endless Websites.<br />
          <span style={{ color: 'var(--accent-primary)' }}>Discover & Apply</span> with Intelligence.
        </h1>

        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '32px' }}>
          Scholarships, internships, research fellowships, and hackathons aggregated in one coherent platform — featuring grounded AI eligibility checks and direct application tracking.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started Free <ArrowRight size={18} />
          </Link>
          <Link to="/discover" className="btn btn-secondary btn-lg">
            <Compass size={18} /> Explore Opportunities
          </Link>
        </div>

      </section>

      {/* Feature Highlights Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        
        <div className="card glass-panel" style={{ padding: '24px' }}>
          <div style={{ background: 'var(--accent-light)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Search size={24} color="var(--accent-primary)" />
          </div>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Personalized Discovery</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Filter verified opportunities by education level, technical skills, interests, and remote preferences with transparent match explanations.
          </p>
        </div>

        <div className="card glass-panel" style={{ padding: '24px' }}>
          <div style={{ background: 'var(--accent-teal-light)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <ShieldCheck size={24} color="var(--accent-secondary)" />
          </div>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Grounded AI Eligibility</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Never guess whether you qualify. Our AI analyzes opportunity text against your profile and highlights exact skill matches or gaps.
          </p>
        </div>

        <div className="card glass-panel" style={{ padding: '24px' }}>
          <div style={{ background: '#fef3c7', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <BookmarkCheck size={24} color="#b45309" />
          </div>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Pipeline Tracker</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Track every application from Saved to Applied, Interview, and Offered with automatic deadline reminders and document checklists.
          </p>
        </div>

      </section>

      {/* How it Works */}
      <section style={{ background: 'var(--bg-secondary)', padding: '40px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', marginBottom: '32px' }}>How Student Opportunity AI Works</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-primary)', marginBottom: '8px' }}>01</div>
            <h4 style={{ fontSize: '16px', marginBottom: '6px' }}>Build Profile</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Specify major, graduation year, skills, and goals.</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-primary)', marginBottom: '8px' }}>02</div>
            <h4 style={{ fontSize: '16px', marginBottom: '6px' }}>Discover & Capture</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Browse curated listings or capture links directly.</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-primary)', marginBottom: '8px' }}>03</div>
            <h4 style={{ fontSize: '16px', marginBottom: '6px' }}>AI Gap Analysis</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Get transparent "appears to meet" or "gap" criteria.</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-primary)', marginBottom: '8px' }}>04</div>
            <h4 style={{ fontSize: '16px', marginBottom: '6px' }}>Track & Export</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Organize applications and export CSV/JSON backups.</p>
          </div>

        </div>
      </section>

      {/* Call to Action */}
      <section style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: '#ffffff', padding: '48px 24px', borderRadius: 'var(--radius-xl)' }}>
        <h2 style={{ color: '#ffffff', fontSize: '32px', marginBottom: '12px' }}>Ready to Supercharge Your Opportunity Search?</h2>
        <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px auto' }}>
          Join thousands of university students discovering scholarships, internships, and hackathons with verified AI intelligence.
        </p>
        <Link to="/register" className="btn btn-secondary btn-lg" style={{ background: '#ffffff', color: 'var(--accent-primary)', border: 'none' }}>
          Create Student Account Now
        </Link>
      </section>

    </div>
  );
};
