import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Settings, 
  User, 
  Download, 
  Upload, 
  Moon, 
  Sun, 
  Check, 
  ShieldCheck, 
  FileSpreadsheet,
  Palette,
  Sparkles,
  Flame
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, profile, updateUserProfile, theme, selectTheme, toggleTheme, themes } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || '');
  const [university, setUniversity] = useState(profile?.university || '');
  const [educationLevel, setEducationLevel] = useState(profile?.educationLevel || 'Undergraduate');
  const [major, setMajor] = useState(profile?.major || 'Computer Science & Engineering');
  const [graduationYear, setGraduationYear] = useState(profile?.graduationYear || 2026);
  
  // Selected Skills array
  const [selectedSkills, setSelectedSkills] = useState(
    profile?.skills?.length ? profile.skills : ['Python', 'React', 'Git', 'JavaScript']
  );
  
  // Selected Interests array
  const [selectedInterests, setSelectedInterests] = useState(
    profile?.interests?.length ? profile.interests : ['Web Development', 'AI & ML Research', 'Open Source Fellowships']
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Export & Import states
  const [exporting, setExporting] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importNotice, setImportNotice] = useState('');

  // Options
  const majorOptions = [
    'Computer Science & Engineering',
    'Artificial Intelligence & Data Science',
    'Information Technology & Software Eng',
    'Electrical & Electronics Engineering',
    'Mechanical & Aerospace Engineering',
    'Bio-Engineering & Medical Technology',
    'Mathematics & Applied Statistics',
    'Business & Financial Technology'
  ];

  const yearOptions = [2025, 2026, 2027, 2028, 2029, 2030];

  const availableSkills = [
    'Python', 'React', 'JavaScript', 'Node.js', 'C++', 'Java', 
    'PyTorch', 'SQL', 'Git', 'Machine Learning', 'Docker', 'TypeScript', 
    'Open Source', 'Data Structures & Algorithms', 'System Design'
  ];

  const availableInterests = [
    'Web Development', 'AI & ML Research', 'Open Source Fellowships', 
    'Hackathons & Competitions', 'Cloud Computing', 'Cybersecurity', 
    'Data Science', 'Quantum Computing'
  ];

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateUserProfile({
        displayName,
        university,
        educationLevel,
        major,
        graduationYear: Number(graduationYear),
        skills: selectedSkills,
        interests: selectedInterests
      });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      if (format === 'csv') {
        const response = await fetch('/api/export?format=csv&scope=my-opportunities', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `career-align-${Date.now()}.csv`;
        a.click();
      } else {
        const res = await api.exportData('json');
        if (res.success) {
          const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `career-align-backup-${Date.now()}.json`;
          a.click();
        }
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleImportPreview = async () => {
    if (!importJson.trim()) return;
    try {
      let parsed = [];
      try {
        parsed = JSON.parse(importJson);
        if (parsed.items) parsed = parsed.items;
      } catch {
        setImportNotice('Invalid JSON payload');
        return;
      }

      const previewRes = await api.previewImport(parsed);
      if (previewRes.success) {
        setImportNotice(`Validated ${previewRes.data.validCount} valid records. Confirming import...`);
        const confirmRes = await api.confirmImport(parsed);
        if (confirmRes.success) {
          setImportNotice(`Successfully imported ${confirmRes.data.importedCount} items!`);
          setImportJson('');
        }
      }
    } catch (err) {
      setImportNotice(err.message || 'Import failed.');
    }
  };

  if (!user) {
    return <div className="card glass-panel" style={{ padding: '40px', textAlign: 'center' }}>Please sign in to access settings.</div>;
  }

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800' }}>Settings & Profile Preferences</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Manage profile settings, technical skills, visual theme palette, and data backups.
          </p>
        </div>

        <button onClick={toggleTheme} className="btn btn-secondary" title="Cycle through all 4 themes">
          <Palette size={16} /> Cycle Theme
        </button>
      </div>

      {/* Visual Theme Customizer Section */}
      <div className="card glass-panel" style={{ padding: '28px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Palette size={20} color="var(--accent-primary)" /> Workspace Appearance & Themes
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Choose a theme that suits your work style. Switches fonts, contrast, gradients, and glows in real time.
          </p>
        </div>

        <div className="grid-cols-2" style={{ gap: '16px' }}>
          {(themes || []).map((t) => {
            const isSelected = theme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => selectTheme(t.id)}
                style={{
                  background: t.cardBg,
                  borderRadius: '14px',
                  border: isSelected ? `2.5px solid ${t.color}` : '1.5px solid var(--border-color)',
                  padding: '18px',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: isSelected ? `0 0 20px ${t.color}40` : 'var(--shadow-sm)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Header with Title and Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div 
                      style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '8px', 
                        background: t.bg,
                        border: `1.5px solid ${t.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.color }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: t.id === 'light' ? '#0f172a' : '#f8fafc' }}>
                        {t.name}
                      </h4>
                      <span style={{ fontSize: '11px', color: t.id === 'light' ? '#64748b' : '#94a3b8' }}>
                        {t.tagline}
                      </span>
                    </div>
                  </div>

                  {isSelected ? (
                    <span 
                      style={{ 
                        background: t.color, 
                        color: '#ffffff', 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        padding: '4px 8px', 
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Check size={12} /> Active
                    </span>
                  ) : (
                    <span 
                      style={{ 
                        fontSize: '11px', 
                        color: t.id === 'light' ? '#94a3b8' : '#64748b',
                        fontWeight: 600
                      }}
                    >
                      Select
                    </span>
                  )}
                </div>

                {/* Theme Miniature Preview Box */}
                <div 
                  style={{ 
                    background: t.bg, 
                    borderRadius: '8px', 
                    padding: '10px', 
                    border: `1px solid ${t.id === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: t.id === 'light' ? '#0f172a' : '#f8fafc' }}>
                      Opportunity Preview
                    </span>
                    <span 
                      style={{ 
                        fontSize: '9px', 
                        fontWeight: 700, 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        background: `${t.color}25`,
                        color: t.color
                      }}
                    >
                      MATCH 98%
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div 
                      style={{ 
                        height: '6px', 
                        borderRadius: '3px', 
                        flex: 1, 
                        background: `${t.color}50` 
                      }} 
                    />
                    <div 
                      style={{ 
                        height: '6px', 
                        width: '24px', 
                        borderRadius: '3px', 
                        background: t.secondaryColor 
                      }} 
                    />
                  </div>
                </div>

                {/* Color Swatch Indicators & Description */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                  <p style={{ fontSize: '12px', color: t.id === 'light' ? '#475569' : '#cbd5e1', margin: 0, flex: 1, paddingRight: '8px' }}>
                    {t.description}
                  </p>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.color, display: 'inline-block' }} title="Accent" />
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.secondaryColor, display: 'inline-block' }} title="Secondary" />
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.bg, border: '1px solid #777', display: 'inline-block' }} title="Background" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {message && (
        <div style={{ background: 'var(--accent-teal-light)', color: 'var(--accent-secondary)', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} /> <span>{message}</span>
        </div>
      )}

      {/* Profile Setup Form */}
      <div className="card glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={20} color="var(--accent-primary)" /> Edit Student Profile
        </h3>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">University / College</label>
              <input type="text" className="form-input" value={university} onChange={(e) => setUniversity(e.target.value)} />
            </div>
          </div>

          <div className="grid-cols-3">
            <div className="form-group">
              <label className="form-label">Education Level</label>
              <select className="form-select" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Graduate">Graduate</option>
                <option value="High School">High School</option>
                <option value="Bootcamp">Bootcamp</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Major / Field of Study</label>
              <select className="form-select" value={major} onChange={(e) => setMajor(e.target.value)}>
                {majorOptions.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Graduation Year</label>
              <select className="form-select" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)}>
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Technical Skills Selection */}
          <div className="form-group">
            <label className="form-label">Technical Skills (Click to toggle)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
              {availableSkills.map(skill => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ borderRadius: '9999px', fontSize: '12px' }}
                  >
                    {isSelected && <Check size={14} />} {skill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interests Selection */}
          <div className="form-group">
            <label className="form-label">Opportunity Interests (Click to toggle)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
              {availableInterests.map(interest => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ borderRadius: '9999px', fontSize: '12px' }}
                  >
                    {isSelected && <Check size={14} />} {interest}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '8px' }} disabled={saving}>
            <Check size={16} /> {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Export & Data Portability */}
      <div className="card glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileSpreadsheet size={20} color="var(--accent-secondary)" /> Data Portability & Backup
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Export your saved opportunities, notes, and tracker data as CSV or JSON for full ownership.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => handleExport('csv')} className="btn btn-secondary" disabled={exporting}>
            <Download size={16} /> Export as CSV (Spreadsheet)
          </button>
          <button onClick={() => handleExport('json')} className="btn btn-outline" disabled={exporting}>
            <Download size={16} /> Export JSON Backup
          </button>
        </div>

        <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Import JSON Backup</h4>
        <div className="form-group">
          <textarea
            className="form-textarea"
            rows={3}
            placeholder='Paste exported JSON data string here to restore records...'
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
          />
        </div>

        {importNotice && <p style={{ fontSize: '12px', color: 'var(--accent-primary)', marginBottom: '8px' }}>{importNotice}</p>}

        <button onClick={handleImportPreview} className="btn btn-secondary btn-sm" disabled={!importJson.trim()}>
          <Upload size={14} /> Validate & Import Records
        </button>
      </div>

    </div>
  );
};
