import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bell, Check, Settings, X, Calendar, Map, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationCenter = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'settings'
  const [prefs, setPrefs] = useState(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      setError('Failed to load notifications.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await api.getNotificationPreferences();
      if (res.success) setPrefs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (view === 'settings' && !prefs) {
      fetchPreferences();
    }
  }, [view]);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrefChange = async (key, value) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    try {
      await api.updateNotificationPreferences(updated);
    } catch (err) {
      console.error('Failed to update prefs');
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) handleMarkRead(notif.id);
    if (notif.linkUrl) {
      navigate(notif.linkUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: '380px',
        maxWidth: '100vw',
        background: 'var(--bg-secondary)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out'
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={20} color="var(--accent-primary)" /> Notifications
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {view === 'list' ? (
            <button onClick={() => setView('settings')} className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}>
              <Settings size={16} />
            </button>
          ) : (
            <button onClick={() => setView('list')} className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}>
              Back
            </button>
          )}
          <button onClick={onClose} className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {view === 'settings' ? (
          // Settings View
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Notification Preferences</h3>
            {!prefs ? <p>Loading...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>In-App Notifications</span>
                  <input type="checkbox" checked={prefs.inAppEnabled} onChange={(e) => handlePrefChange('inAppEnabled', e.target.checked)} />
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Email Notifications (Coming Soon)</span>
                  <input type="checkbox" disabled checked={prefs.emailEnabled} onChange={(e) => handlePrefChange('emailEnabled', e.target.checked)} />
                </label>
                <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>Reminders</h4>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Deadline Reminders</span>
                  <input type="checkbox" checked={prefs.deadlineReminders} onChange={(e) => handlePrefChange('deadlineReminders', e.target.checked)} />
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Application Reminders</span>
                  <input type="checkbox" checked={prefs.applicationReminders} onChange={(e) => handlePrefChange('applicationReminders', e.target.checked)} />
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Roadmap Reminders</span>
                  <input type="checkbox" checked={prefs.roadmapReminders} onChange={(e) => handlePrefChange('roadmapReminders', e.target.checked)} />
                </label>
              </div>
            )}
          </div>
        ) : (
          // List View
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {unreadCount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm" style={{ fontSize: '11px', padding: '4px 8px' }}>
                  <Check size={14} /> Mark all as read
                </button>
              </div>
            )}
            
            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>Loading...</p>
            ) : error ? (
              <div style={{ color: 'var(--status-rejected)', background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px', display: 'flex', gap: '8px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                <Bell size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p>You're all caught up!</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    background: notif.isRead ? 'var(--bg-tertiary)' : 'var(--bg-panel)',
                    padding: '12px',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${notif.isRead ? 'transparent' : 'var(--accent-primary)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong style={{ fontSize: '14px', color: notif.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{notif.title}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{notif.message}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
