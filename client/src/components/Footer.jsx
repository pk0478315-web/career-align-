import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, FileSpreadsheet } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', marginTop: '40px', padding: '36px 20px 24px 20px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '24px' }}>
        
        <div style={{ maxWidth: '360px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Sparkles size={20} color="var(--accent-primary)" />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '18px' }}>
              Student Opportunity AI
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Empowering university students to discover personalized scholarships, internships, research fellowships, and hackathons with grounded AI eligibility analysis.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
          <div>
            <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-primary)' }}>Discovery</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <li><Link to="/discover?category=scholarship">Scholarships</Link></li>
              <li><Link to="/discover?category=internship">Internships</Link></li>
              <li><Link to="/discover?category=hackathon">Hackathons</Link></li>
              <li><Link to="/discover?category=fellowship">Fellowships & Research</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-primary)' }}>Platform</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/tracker">Application Tracker</Link></li>
              <li><Link to="/ai-copilot">AI Opportunity Copilot</Link></li>
              <li><Link to="/settings">Data Export & Backup</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-primary)' }}>Trust & Privacy</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="var(--accent-secondary)" /> Strict Grounded AI Output
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileSpreadsheet size={14} color="var(--accent-primary)" /> Portable Student Data
              </span>
              <span style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                Built for Hackathon 2026. Official source links preserved.
              </span>
            </div>
          </div>
        </div>

      </div>

      <div style={{ maxWidth: '1280px', margin: '24px auto 0 auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
        <span>© 2026 Student Opportunity AI. All rights reserved.</span>
        <span>Built by Aayush, Piyush, Shree, Anushka & Rahul</span>
      </div>
    </footer>
  );
};
