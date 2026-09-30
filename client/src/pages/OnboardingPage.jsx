import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Check } from 'lucide-react';

export const OnboardingPage = () => {
  const { profile, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [university, setUniversity] = useState(profile?.university || 'State University');
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
  
  const [remotePref, setRemotePref] = useState(profile?.remotePreference || 'flexible');
  const [saving, setSaving] = useState(false);

  // Curated Options
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

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateUserProfile({
        university,
        educationLevel,
        major,
        graduationYear: Number(graduationYear),
        skills: selectedSkills,
        interests: selectedInterests,
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
    <div style={{ maxWidth: '680px', margin: '40px auto', width: '100%' }}>
      <div className="card glass-panel" style={{ padding: '36px' }}>
        
        {/* Progress indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)', letterSpacing: '0.05em' }}>STEP {step} OF 3</span>
            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>
              {step === 1 && 'Education & University'}
              {step === 2 && 'Technical Skills Selection'}
              {step === 3 && 'Interests & Preferences'}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '32px', height: '6px', borderRadius: '3px', background: step >= 1 ? 'var(--accent-primary)' : 'var(--border-color)' }}></div>
            <div style={{ width: '32px', height: '6px', borderRadius: '3px', background: step >= 2 ? 'var(--accent-primary)' : 'var(--border-color)' }}></div>
            <div style={{ width: '32px', height: '6px', borderRadius: '3px', background: step >= 3 ? 'var(--accent-primary)' : 'var(--border-color)' }}></div>
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">University / College Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. National Institute of Technology / MIT"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
              />
            </div>

            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Education Level</label>
                <select className="form-select" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}>
                  <option value="Undergraduate">Undergraduate (B.Tech / B.S.)</option>
                  <option value="Graduate">Graduate (M.S. / Ph.D.)</option>
                  <option value="High School">High School Student</option>
                  <option value="Bootcamp">Bootcamp / Independent Learner</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Expected Graduation Year</label>
                <select className="form-select" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)}>
                  {yearOptions.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Major / Field of Study</label>
              <select className="form-select" value={major} onChange={(e) => setMajor(e.target.value)}>
                {majorOptions.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <button onClick={() => setStep(2)} className="btn btn-primary" style={{ marginTop: '12px' }}>
              Next: Select Technical Skills <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                Select Your Key Technical Skills (Click to toggle)
              </label>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
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
              
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {selectedSkills.length} skills selected for AI opportunity matching.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={() => setStep(1)} className="btn btn-secondary">Back</button>
              <button onClick={() => setStep(3)} className="btn btn-primary" style={{ flex: 1 }}>
                Next: Select Interests <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                Select Your Opportunity Interests
              </label>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
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

            <div className="form-group">
              <label className="form-label">Location / Format Preference</label>
              <select className="form-select" value={remotePref} onChange={(e) => setRemotePref(e.target.value)}>
                <option value="flexible">Flexible (Both Remote and Onsite)</option>
                <option value="remote">Remote Only</option>
                <option value="onsite">Onsite / Hybrid Only</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={() => setStep(2)} className="btn btn-secondary">Back</button>
              <button onClick={handleSaveProfile} className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                <Check size={18} /> {saving ? 'Saving Profile...' : 'Complete Profile & Launch Dashboard'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
