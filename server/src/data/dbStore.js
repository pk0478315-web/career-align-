const crypto = require('crypto');
const supabase = require('../config/supabase');
const seedOpportunities = require('./seedOpportunities');

// In-Memory Storage Tables (resilient local layer)
let usersTable = [];
let profilesTable = [];
let opportunitiesTable = [...seedOpportunities];
let userOpportunitiesTable = [];
let aiInteractionsTable = [];

// Helper to generate IDs
const generateId = (prefix = 'id') => `${prefix}-${crypto.randomUUID()}`;

const dbStore = {
  // --- USERS ---
  async findUserByEmail(email) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email.toLowerCase())
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[dbStore] Supabase findUserByEmail fallback:', err.message);
      }
    }
    return usersTable.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[dbStore] Supabase findUserById fallback:', err.message);
      }
    }
    return usersTable.find(u => u.id === id) || null;
  },

  async createUser({ email, passwordHash, displayName }) {
    const newUser = {
      id: generateId('usr'),
      email: email.toLowerCase(),
      password_hash: passwordHash,
      display_name: displayName || email.split('@')[0],
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();
        if (!error && data) {
          // Initialize default profile in Supabase
          const newProfile = {
            id: generateId('prof'),
            user_id: data.id,
            display_name: data.display_name,
            university: '',
            education_level: 'Undergraduate',
            major: '',
            graduation_year: new Date().getFullYear() + 2,
            skills: ['Python', 'JavaScript', 'React'],
            interests: ['Web Development', 'AI Research', 'Open Source'],
            career_goals: 'Aspiring Software Engineer',
            preferred_location: 'Remote',
            remote_preference: 'flexible',
            theme_preference: 'light',
            updated_at: new Date().toISOString()
          };
          await supabase.from('student_profiles').insert([newProfile]);
          return data;
        }
      } catch (err) {
        console.warn('[dbStore] Supabase createUser fallback:', err.message);
      }
    }

    usersTable.push(newUser);

    // Create matching initial student profile
    const profile = {
      id: generateId('prof'),
      userId: newUser.id,
      displayName: newUser.display_name,
      university: 'Tech University',
      educationLevel: 'Undergraduate',
      major: 'Computer Science',
      graduationYear: new Date().getFullYear() + 2,
      skills: ['Python', 'JavaScript', 'React'],
      interests: ['Web Development', 'AI Research', 'Open Source'],
      careerGoals: 'Aspiring Software Engineer & Tech Innovator',
      preferredLocation: 'Remote',
      remotePreference: 'flexible',
      themePreference: 'light',
      updatedAt: new Date().toISOString()
    };
    profilesTable.push(profile);

    return newUser;
  },

  // --- PROFILES ---
  async getProfile(userId) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (!error && data) {
          return {
            id: data.id,
            userId: data.user_id,
            displayName: data.display_name,
            university: data.university,
            educationLevel: data.education_level,
            major: data.major,
            graduationYear: data.graduation_year,
            skills: data.skills || [],
            interests: data.interests || [],
            careerGoals: data.career_goals,
            preferredLocation: data.preferred_location,
            remotePreference: data.remote_preference,
            themePreference: data.theme_preference,
            updatedAt: data.updated_at
          };
        }
      } catch (err) {
        console.warn('[dbStore] Supabase getProfile fallback:', err.message);
      }
    }
    return profilesTable.find(p => p.userId === userId) || null;
  },

  async updateProfile(userId, updates) {
    const existing = await this.getProfile(userId);
    const updated = {
      ...existing,
      ...updates,
      userId,
      updatedAt: new Date().toISOString()
    };

    if (supabase) {
      try {
        const dbUpdates = {
          display_name: updated.displayName,
          university: updated.university,
          education_level: updated.educationLevel,
          major: updated.major,
          graduation_year: updated.graduationYear,
          skills: updated.skills,
          interests: updated.interests,
          career_goals: updated.careerGoals,
          preferred_location: updated.preferredLocation,
          remote_preference: updated.remotePreference,
          theme_preference: updated.themePreference,
          updated_at: updated.updatedAt
        };
        const { data, error } = await supabase
          .from('student_profiles')
          .update(dbUpdates)
          .eq('user_id', userId)
          .select()
          .single();
        if (!error && data) return updated;
      } catch (err) {
        console.warn('[dbStore] Supabase updateProfile fallback:', err.message);
      }
    }

    const index = profilesTable.findIndex(p => p.userId === userId);
    if (index >= 0) {
      profilesTable[index] = updated;
    } else {
      profilesTable.push(updated);
    }
    return updated;
  },

  // --- OPPORTUNITIES ---
  async getOpportunities({ search, category, remote, sort } = {}) {
    let items = [...opportunitiesTable];

    if (category && category !== 'all') {
      items = items.filter(o => o.category.toLowerCase() === category.toLowerCase());
    }

    if (remote !== undefined && remote !== null && remote !== '') {
      const isRemote = String(remote) === 'true';
      items = items.filter(o => o.isRemote === isRemote);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter(o => {
        const inTitle = (o.title || '').toLowerCase().includes(q);
        const inOrg = (o.organization || '').toLowerCase().includes(q);
        const inDesc = (o.description || '').toLowerCase().includes(q);
        const inSkills = Array.isArray(o.skillsRequired) && o.skillsRequired.some(s => s.toLowerCase().includes(q));
        return inTitle || inOrg || inDesc || inSkills;
      });
    }

    if (sort === 'deadline') {
      items.sort((a, b) => new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31'));
    } else if (sort === 'title') {
      items.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // freshness / newest default
      items.sort((a, b) => new Date(b.freshnessDate || 0) - new Date(a.freshnessDate || 0));
    }

    return items;
  },

  async getOpportunityById(id) {
    return opportunitiesTable.find(o => o.id === id) || null;
  },

  async createOpportunity(data) {
    const newOpp = {
      id: generateId('opp'),
      title: data.title,
      organization: data.organization,
      category: data.category || 'internship',
      description: data.description || '',
      sourceUrl: data.sourceUrl || '',
      applicationUrl: data.applicationUrl || data.sourceUrl || '',
      deadline: data.deadline || null,
      location: data.location || (data.isRemote ? 'Remote' : 'Location Not Specified'),
      isRemote: Boolean(data.isRemote),
      requirements: Array.isArray(data.requirements) ? data.requirements : [],
      skillsRequired: Array.isArray(data.skillsRequired) ? data.skillsRequired : [],
      fundingCompensation: data.fundingCompensation || 'Not specified',
      sourceType: data.sourceType || 'manual',
      freshnessDate: new Date().toISOString(),
      extractionStatus: data.extractionStatus || 'verified'
    };

    opportunitiesTable.unshift(newOpp);
    return newOpp;
  },

  // --- USER TRACKED OPPORTUNITIES (MY OPPORTUNITIES) ---
  async getUserOpportunities(userId, statusFilter) {
    let records = userOpportunitiesTable.filter(u => u.userId === userId);

    if (statusFilter && statusFilter !== 'all') {
      records = records.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Attach full opportunity detail to each tracked record
    const items = records.map(r => {
      const opp = opportunitiesTable.find(o => o.id === r.opportunityId) || null;
      return {
        ...r,
        opportunity: opp
      };
    });

    // Compute status counts for dashboard
    const allUserRecords = userOpportunitiesTable.filter(u => u.userId === userId);
    const counts = {
      all: allUserRecords.length,
      saved: allUserRecords.filter(r => r.status === 'saved').length,
      planned: allUserRecords.filter(r => r.status === 'planned').length,
      applied: allUserRecords.filter(r => r.status === 'applied').length,
      shortlisted: allUserRecords.filter(r => r.status === 'shortlisted').length,
      interview: allUserRecords.filter(r => r.status === 'interview').length,
      offered: allUserRecords.filter(r => r.status === 'offered').length,
      rejected: allUserRecords.filter(r => r.status === 'rejected').length,
      completed: allUserRecords.filter(r => r.status === 'completed').length,
      archived: allUserRecords.filter(r => r.status === 'archived').length
    };

    return { counts, items };
  },

  async trackOpportunity(userId, { opportunityId, status = 'saved', notes = '', checklist = [], reminders = [], appliedDate = null }) {
    const existingIndex = userOpportunitiesTable.findIndex(
      r => r.userId === userId && r.opportunityId === opportunityId
    );

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      // Update existing
      userOpportunitiesTable[existingIndex] = {
        ...userOpportunitiesTable[existingIndex],
        status,
        notes: notes !== undefined ? notes : userOpportunitiesTable[existingIndex].notes,
        checklist: checklist.length ? checklist : userOpportunitiesTable[existingIndex].checklist,
        reminders: reminders.length ? reminders : userOpportunitiesTable[existingIndex].reminders,
        appliedDate: appliedDate || userOpportunitiesTable[existingIndex].appliedDate,
        updatedAt: now
      };
      const opp = opportunitiesTable.find(o => o.id === opportunityId);
      return { ...userOpportunitiesTable[existingIndex], opportunity: opp };
    }

    const defaultChecklist = [
      { id: 'chk-1', item: 'Check eligibility criteria', completed: true },
      { id: 'chk-2', item: 'Update CV / Resume', completed: false },
      { id: 'chk-3', item: 'Submit application before deadline', completed: false }
    ];

    const newRecord = {
      id: generateId('track'),
      userId,
      opportunityId,
      status,
      notes,
      checklist: checklist && checklist.length > 0 ? checklist : defaultChecklist,
      reminders,
      appliedDate,
      createdAt: now,
      updatedAt: now
    };

    userOpportunitiesTable.push(newRecord);
    const opp = opportunitiesTable.find(o => o.id === opportunityId);
    return { ...newRecord, opportunity: opp };
  },

  async updateUserOpportunity(userId, id, updates) {
    const index = userOpportunitiesTable.findIndex(
      r => r.id === id && r.userId === userId
    );
    if (index === -1) return null;

    userOpportunitiesTable[index] = {
      ...userOpportunitiesTable[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const opp = opportunitiesTable.find(o => o.id === userOpportunitiesTable[index].opportunityId);
    return { ...userOpportunitiesTable[index], opportunity: opp };
  },

  async deleteUserOpportunity(userId, id) {
    const index = userOpportunitiesTable.findIndex(
      r => r.id === id && r.userId === userId
    );
    if (index === -1) return false;

    userOpportunitiesTable.splice(index, 1);
    return true;
  },

  // --- AUDIT / AI INTERACTIONS ---
  async logAiInteraction(userId, opportunityId, interactionType, requestData, responseData) {
    const record = {
      id: generateId('ai-log'),
      userId: userId || null,
      opportunityId: opportunityId || null,
      interactionType,
      requestData,
      responseData,
      createdAt: new Date().toISOString()
    };
    aiInteractionsTable.push(record);
    return record;
  }
};

module.exports = dbStore;
