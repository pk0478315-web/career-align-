import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Users, Compass, Activity, Database, HeartPulse, Trash2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('system');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If not admin, redirect
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'system') {
        const res = await api.getAdminStats();
        setStats(res.data);
      } else if (activeTab === 'users') {
        const res = await api.getAdminUsers();
        setUsers(res.data.users || []);
      } else if (activeTab === 'opportunities') {
        const res = await api.getReportedOpportunities();
        setOpportunities(res.data.opportunities || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleUpdateRole = async (id, role) => {
    try {
      await api.updateUserRole(id, { role });
      setUsers(users.map(u => u.id === id ? { ...u, role } : u));
    } catch (err) {
      alert('Failed to update role');
    }
  };

  if (!user || user.role !== 'admin') {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Unauthorized</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <ShieldAlert size={32} color="var(--accent-primary)" />
        <h1 style={{ fontSize: '28px', margin: 0 }}>Admin Control Panel</h1>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {['system', 'users', 'opportunities'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize' }}
          >
            {tab === 'system' ? <Activity size={18} /> : tab === 'users' ? <Users size={18} /> : <Compass size={18} />}
            {tab}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}

      {!loading && activeTab === 'system' && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3><HeartPulse size={20} /> System Health</h3>
            <p><strong>Status:</strong> {stats.health.status}</p>
            <p><strong>Database:</strong> {stats.health.database}</p>
            <p><strong>AI Gateway:</strong> {stats.health.aiStatus}</p>
            <p><strong>Uptime:</strong> {Math.floor(stats.health.uptime / 60)} minutes</p>
          </div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3><Users size={20} /> Overview Stats</h3>
            <p><strong>Total Users:</strong> {stats.stats.totalUsers}</p>
            <p><strong>Total Opportunities:</strong> {stats.stats.totalOpportunities}</p>
            <p><strong>Tracked Applications:</strong> {stats.stats.totalApplications}</p>
          </div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3><Database size={20} /> Subscriptions & Usage</h3>
            <p><strong>Active Subs:</strong> {stats.subscriptions.active}</p>
            <p><strong>Trial Users:</strong> {stats.subscriptions.trial}</p>
            <p><strong>MRR:</strong> {stats.subscriptions.revenue}</p>
          </div>
        </div>
      )}

      {!loading && activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3>User Management</h3>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px' }}>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>{u.email}</td>
                  <td>{u.display_name}</td>
                  <td>
                    <select 
                      value={u.role || 'user'} 
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      style={{ padding: '4px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => handleDeleteUser(u.id)} className="btn btn-outline btn-sm" style={{ color: 'var(--status-rejected)' }}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && activeTab === 'opportunities' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3>Reported / Recent Opportunities</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {opportunities.map(opp => (
              <li key={opp.id} style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{opp.title}</strong>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{opp.organization} | Added: {new Date(opp.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary btn-sm"><CheckCircle2 size={16} /> Verify</button>
                  <button className="btn btn-outline btn-sm" style={{ color: 'var(--status-rejected)' }}><Trash2 size={16} /> Delete</button>
                </div>
              </li>
            ))}
            {opportunities.length === 0 && <p>No records found.</p>}
          </ul>
        </div>
      )}
    </div>
  );
};
