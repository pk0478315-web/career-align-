import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  BookmarkCheck, 
  Bot, 
  Settings, 
  Moon, 
  Sun, 
  LogOut, 
  LogIn,
  Menu,
  X
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, theme, toggleTheme } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo & Name */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img 
            src="/logo.png" 
            alt="CareerAlign Logo" 
            style={{ height: '42px', width: 'auto', objectFit: 'contain' }} 
          />
          <div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', display: 'block', lineHeight: 1, letterSpacing: '-0.02em' }}>
              Career<span style={{ color: '#0284c7' }}>Align</span>
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.06em' }}>OPPORTUNITY INTELLIGENCE</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="desktop-nav" style={{ display: 'flex', gap: '6px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '9999px', border: '1px solid var(--border-color)' }}>
          <Link to="/dashboard" className={`btn btn-sm ${isActive('/dashboard') ? 'btn-primary' : 'btn-secondary'}`} style={{ border: 'none', background: isActive('/dashboard') ? undefined : 'transparent' }}>
            <Compass size={16} /> Dashboard
          </Link>
          <Link to="/discover" className={`btn btn-sm ${isActive('/discover') ? 'btn-primary' : 'btn-secondary'}`} style={{ border: 'none', background: isActive('/discover') ? undefined : 'transparent' }}>
            <Compass size={16} /> Discover
          </Link>
          <Link to="/tracker" className={`btn btn-sm ${isActive('/tracker') ? 'btn-primary' : 'btn-secondary'}`} style={{ border: 'none', background: isActive('/tracker') ? undefined : 'transparent' }}>
            <BookmarkCheck size={16} /> My Tracker
          </Link>
          <Link to="/ai-copilot" className={`btn btn-sm ${isActive('/ai-copilot') ? 'btn-primary' : 'btn-secondary'}`} style={{ border: 'none', background: isActive('/ai-copilot') ? undefined : 'transparent' }}>
            <Bot size={16} /> AI Assistant
          </Link>
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={toggleTheme} className="btn btn-secondary btn-sm" title="Toggle Light/Dark Theme" style={{ padding: '8px', borderRadius: '50%' }}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {isAuthenticated ? (
            <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/settings" className="btn btn-secondary btn-sm">
                <Settings size={16} />
                <span>{user.displayName || 'Profile'}</span>
              </Link>
              <button onClick={logout} className="btn btn-outline btn-sm" title="Log Out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="desktop-nav" style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                <LogIn size={16} /> Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="mobile-toggle btn btn-secondary btn-sm"
            style={{ padding: '8px' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={`btn ${isActive('/dashboard') ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }}>
            <Compass size={18} /> Dashboard
          </Link>
          <Link to="/discover" onClick={() => setMobileMenuOpen(false)} className={`btn ${isActive('/discover') ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }}>
            <Compass size={18} /> Discover Opportunities
          </Link>
          <Link to="/tracker" onClick={() => setMobileMenuOpen(false)} className={`btn ${isActive('/tracker') ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }}>
            <BookmarkCheck size={18} /> My Tracker
          </Link>
          <Link to="/ai-copilot" onClick={() => setMobileMenuOpen(false)} className={`btn ${isActive('/ai-copilot') ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }}>
            <Bot size={18} /> AI Assistant
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <Settings size={18} /> Settings ({user.displayName})
              </Link>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="btn btn-outline" style={{ justifyContent: 'flex-start', color: 'var(--status-rejected)' }}>
                <LogOut size={18} /> Log Out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ flex: 1 }}>Get Started</Link>
            </div>
          )}
        </div>
      )}

    </header>
  );
};
