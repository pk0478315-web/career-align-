import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, GraduationCap, Code, Compass, ArrowRight, Check } from 'lucide-react';

export const OnboardingPage = () => {
  const { profile, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [university, setUniversity] = useState(profile?.university || '');
  const [educationLevel, setEducationLevel] = useState(profile?.educationLevel || 'Undergraduate');
  const [major, setMajor] = useState(profile?.major || 'Computer Science');
  const [graduationYear, setGraduationYear] = useState(profile?.graduationYear || 2026);
  const [skillsInput, setSkillsInput] = useState((profile?.skills || ['Python', 'React', 'Git']).join(', '));
  const [interestsInput, setInterestsInput] = useState((profile?.interests || ['Web Development', 'AI Research', 'Open Source']).join(', '));
  const [remotePref, setRemotePref] = useState(profile?.remotePreference || 'flexible');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const skillsArray = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
      const interestsArray = interestsInput.split(',').map(i => i.trim()).filter(Boolean);

      await updateUserProfile({
        university,
        educationLevel,
        major,
        graduationYear: Number(graduationYear),
        skills: skillsArray,
        interests: interestsArray,
        remotePreference: remotePref
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto', width: '100%' }}>
      <div className="card glass-panel" style={{ padding: '36px' }}>
        
        {/* Progress indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)', letterSpacing: '0.05em' }}>STEP {step} OF 3</span>
            <h2 style={{ fontSize: '22px', fontWeight: '800' }}>
              {step === 1 && 'Education & University'}
              {step === 2 && 'Skills & Technical Areas'}
              {step === 3 && 'Interests & Preferences'}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '28px', height: '6px', borderRadius: '3px', background: step >= 1 ? 'var(--accent-primary)' : 'var(--border-color)' }}></div>
            <div style={{ width: '28px', height: '6px', borderRadius: '3px', background: step >= 2 ? 'var(--accent-primary)' : 'var(--border-color)' }}></div>
            <div style={{ width: '28px', height: '6px', borderRadius: '3px', background: step >= 3 ? 'var(--accent-primary)' : 'var(--border-color)' }}></div>
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">University / College</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. State University / MIT"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Education Level</label>
              <select className="form-select" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}>
                <option value="Undergraduate">Undergraduate (B.Tech / B.S. / B.A.)</option>
                <option value="Graduate">Graduate (M.S. / M.Tech / Ph.D.)</option>
                <option value="High School">High School Student</option>
                <option value="Bootcamp">Bootcamp / Independent Learner</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Major / Field of Study</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Computer Science / Electrical Eng"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Expected Graduation Year</label>
              <input
                type="number"
                className="form-input"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
              />
            </div>

            <button onClick={() => setStep(2)} className="btn btn-primary" style={{ marginTop: '12px' }}>
              Next: Skills & Tools <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Technical & Core Skills (comma-separated)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Python, React, Node.js, C++, Machine Learning, Data Structures"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
              />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                These skills are used to match opportunity requirements and calculate eligibility gaps.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button onClick={() => setStep(1)} className="btn btn-secondary">
                Back
              </button>
              <button onClick={() => setStep(3)} className="btn btn-primary" style={{ flex: 1 }}>
                Next: Interests & Goals <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Interests & Preferred Categories (comma-separated)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Web Development, AI Research, Open Source, Hackathons, Quantum Computing"
                value={interestsInput}
                onChange={(e) => setInterestsInput(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location / Remote Preference</label>
              <select className="form-select" value={remotePref} onChange={(e) => setRemotePref(e.target.value)}>
                <option value="flexible">Flexible (Both Remote and Onsite)</option>
                <option value="remote">Remote Only</option>
                <option value="onsite">Onsite / Hybrid Only</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button onClick={() => setStep(2)} className="btn btn-secondary">
                Back
              </button>
              <button onClick={handleSaveProfile} className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                <Check size={18} /> {saving ? 'Saving Profile...' : 'Complete Setup & Launch Dashboard'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
