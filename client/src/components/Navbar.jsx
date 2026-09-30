import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  BookmarkCheck, 
  Bot, 
  Settings, 
  Palette,
  Check,
  LogOut, 
  LogIn,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { api } from '../services/api';
import { NotificationCenter } from './NotificationCenter';

export const Navbar = () => {
  const { user, isAuthenticated, logout, theme, selectTheme, themes } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const themeDropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (user) {
      api.getNotifications().then(res => {
        if (res.success) setUnreadCount(res.data.unreadCount);
      }).catch(() => {});
    }
  }, [user, isNotifOpen]); // Re-fetch when notif center closes/opens

  const currentThemeObj = (themes || []).find(t => t.id === theme) || themes?.[0];

  // Close theme popover when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target)) {
        setThemeDropdownOpen(false);
      }
    };
    if (themeDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [themeDropdownOpen]);

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
              Career<span style={{ color: 'var(--accent-primary)', transition: 'color 0.3s ease' }}>Align</span>
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
          
          {/* Multi-Theme Selector Popover */}
          <div style={{ position: 'relative' }} ref={themeDropdownRef}>
            <button 
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)} 
              className="btn btn-secondary btn-sm" 
              title="Select App Theme"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px', borderRadius: '9999px' }}
            >
              <span 
                style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: currentThemeObj?.color || 'var(--accent-primary)',
                  boxShadow: `0 0 8px ${currentThemeObj?.color || 'var(--accent-primary)'}`
                }} 
              />
              <span className="desktop-nav" style={{ fontSize: '13px', fontWeight: 600 }}>
                {currentThemeObj?.name || 'Theme'}
              </span>
              <Palette size={15} style={{ opacity: 0.8 }} />
            </button>

            {themeDropdownOpen && (
              <div 
                className="glass-panel" 
                style={{ 
                  position: 'absolute', 
                  top: 'calc(100% + 8px)', 
                  right: 0, 
                  width: '250px', 
                  padding: '8px', 
                  borderRadius: '14px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  animation: 'fadeIn 0.2s ease'
                }}
              >
                <div style={{ padding: '6px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Workspace Theme
                </div>
                {(themes || []).map((t) => {
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        selectTheme(t.id);
                        setThemeDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        border: isSelected ? `1.5px solid ${t.color}` : '1.5px solid transparent',
                        background: isSelected ? 'var(--accent-light)' : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        width: '100%',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div 
                          style={{ 
                            width: '22px', 
                            height: '22px', 
                            borderRadius: '50%', 
                            background: t.bg,
                            border: `2px solid ${t.color}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }} 
                        >
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.color }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>{t.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.tagline}</div>
                        </div>
                      </div>
                      {isSelected && <Check size={16} color={t.color} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={() => setIsNotifOpen(true)} 
                className="btn btn-secondary btn-sm" 
                style={{ position: 'relative', padding: '8px' }}
                title="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    background: 'var(--status-rejected)', color: 'white',
                    fontSize: '10px', fontWeight: 'bold',
                    padding: '2px 6px', borderRadius: '10px',
                    lineHeight: 1
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
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
              <button onClick={() => { setIsNotifOpen(true); setMobileMenuOpen(false); }} className="btn btn-secondary" style={{ justifyContent: 'flex-start', position: 'relative' }}>
                <Bell size={18} /> Notifications
                {unreadCount > 0 && (
                  <span className="badge badge-scholarship" style={{ background: 'var(--status-rejected)', color: 'white', marginLeft: 'auto' }}>
                    {unreadCount}
                  </span>
                )}
              </button>
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

          {/* Mobile Theme Switcher */}
          <div style={{ marginTop: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
              Select Theme
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {(themes || []).map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      selectTheme(t.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'flex-start', gap: '8px', padding: '8px 10px', fontSize: '12px', borderRadius: '8px' }}
                  >
                    <span 
                      style={{ 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '50%', 
                        background: t.color, 
                        flexShrink: 0,
                        boxShadow: `0 0 4px ${t.color}` 
                      }} 
                    />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

    </header>
  );
};
