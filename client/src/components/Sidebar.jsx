import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  ChevronRight,
  LayoutDashboard,
  Map
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAuthenticated, logout, theme, selectTheme, themes } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const themeRef = useRef(null);

  const isActive = (path) => location.pathname === path;
  const currentThemeObj = (themes || []).find(t => t.id === theme) || themes?.[0];

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setThemeOpen(false);
      }
    };
    if (themeOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [themeOpen]);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/discover', label: 'Discover Opportunities', icon: Compass },
    { path: '/tracker', label: 'My Tracker', icon: BookmarkCheck },
    { path: '/roadmap', label: 'Career Roadmap', icon: Map },
    { path: '/ai-copilot', label: 'AI Assistant', icon: Bot },
    { path: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Top Sticky Bar (< 768px) */}
      <div className="sidebar-mobile-bar">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <img src="/logo.png" alt="CareerAlign Logo" style={{ height: '32px', width: 'auto' }} />
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>
            Career<span style={{ color: 'var(--accent-primary)' }}>Align</span>
          </span>
        </Link>

        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          className="btn btn-secondary btn-sm" 
          style={{ padding: '6px 10px' }}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Main Left Sidebar */}
      <aside className={`app-sidebar ${mobileOpen ? 'mobile-expanded' : ''}`}>
        {/* Brand Header */}
        <div style={{ padding: '20px 18px 16px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/logo.png" alt="CareerAlign Logo" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', display: 'block', lineHeight: 1, letterSpacing: '-0.02em' }}>
                Career<span style={{ color: 'var(--accent-primary)', transition: 'color 0.3s ease' }}>Align</span>
              </span>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.06em' }}>WORKSPACE</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 8px', letterSpacing: '0.06em' }}>
            Main Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`sidebar-link ${active ? 'active' : ''}`}
              >
                <Icon size={18} color={active ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <ChevronRight size={14} color="var(--accent-primary)" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Theme & User Info */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Theme Selector Dropdown */}
          <div style={{ position: 'relative' }} ref={themeRef}>
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '10px' }}
              title="Select Workspace Theme"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: currentThemeObj?.color, boxShadow: `0 0 6px ${currentThemeObj?.color}` }} />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{currentThemeObj?.name}</span>
              </div>
              <Palette size={14} style={{ opacity: 0.7 }} />
            </button>

            {themeOpen && (
              <div 
                className="glass-panel"
                style={{ 
                  position: 'absolute', 
                  bottom: 'calc(100% + 8px)', 
                  left: 0, 
                  right: 0, 
                  padding: '8px', 
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  animation: 'fadeIn 0.2s ease'
                }}
              >
                <div style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Workspace Theme
                </div>
                {(themes || []).map((t) => {
                  const isSel = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => { selectTheme(t.id); setThemeOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: isSel ? `1.5px solid ${t.color}` : '1.5px solid transparent',
                        background: isSel ? 'var(--accent-light)' : 'transparent',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        width: '100%'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.color }} />
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{t.name}</span>
                      </div>
                      {isSel && <Check size={14} color={t.color} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Account Bar */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-tertiary)', padding: '8px 10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div 
                onClick={() => navigate('/settings')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', cursor: 'pointer', flex: 1 }}
                title="View Profile Settings"
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.displayName || 'Student Profile'}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.email || 'Logged In'}
                  </div>
                </div>
              </div>

              <button onClick={logout} className="btn btn-secondary btn-sm" style={{ padding: '6px', borderRadius: '6px' }} title="Log Out">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '6px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ flex: 1 }}>Register</Link>
            </div>
          )}

        </div>
      </aside>
    </>
  );
};
