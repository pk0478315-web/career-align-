const crypto = require('crypto');
const env = require('../config/env');
const { createClient } = require('@supabase/supabase-js');
const seedOpportunities = require('./seedOpportunities');

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const getClient = (userId) => {
  if (!supabase) return null;
  if (!userId) return supabase;
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { 'x-user-id': userId } }
  });
};

// In-Memory Storage Tables (resilient local layer)
let usersTable = [];
let profilesTable = [];
let opportunitiesTable = [...seedOpportunities];
let userOpportunitiesTable = [];
let aiInteractionsTable = [];

// Helper to generate IDs
const generateId = () => crypto.randomUUID();

const useDb = () => {
  if (supabase) return true;
  if (env.NODE_ENV === 'production') {
    throw new Error("Production mode MUST NOT silently fall back to memory.");
  }
  return false;
};

// Seed opportunities on startup if empty
if (supabase) {
  (async () => {
    try {
      const { data, error } = await supabase.from('opportunities').select('id').limit(1);
      if (!error && data && data.length === 0) {
        console.log('[dbStore] Seeding database with initial opportunities...');
        await supabase.from('opportunities').insert(seedOpportunities.map(({ id, ...o }) => ({
          ...o,
          is_remote: o.isRemote,
          source_url: o.sourceUrl,
          application_url: o.applicationUrl,
          skills_required: o.skillsRequired,
          funding_compensation: o.fundingCompensation,
          source_type: o.sourceType,
          freshness_date: o.freshnessDate,
          extraction_status: o.extractionStatus,
          created_at: o.createdAt || new Date().toISOString(),
          updated_at: o.updatedAt || new Date().toISOString(),
          eligibility: [],
          education_requirements: [],
          experience_requirements: [],
          source_name: o.sourceUrl ? new URL(o.sourceUrl).hostname : 'Unknown',
          freshness_status: 'active',
          verification_status: 'verified'
        })));
      }
    } catch (e) {
      console.warn('[dbStore] Failed to seed DB', e.message);
    }
  })();
}

const mapOppFromDb = (o) => ({
  ...o,
  isRemote: o.is_remote,
  sourceUrl: o.source_url,
  applicationUrl: o.application_url,
  skillsRequired: o.skills_required,
  eligibility: o.eligibility || [],
  educationRequirements: o.education_requirements || [],
  experienceRequirements: o.experience_requirements || [],
  sourceName: o.source_name,
  postedDate: o.posted_date,
  lastVerifiedDate: o.last_verified_date,
  freshnessStatus: o.freshness_status,
  verificationStatus: o.verification_status,
  fundingCompensation: o.funding_compensation,
  sourceType: o.source_type,
  freshnessDate: o.freshness_date,
  extractionStatus: o.extraction_status,
  createdAt: o.created_at,
  updatedAt: o.updated_at
});

const dbStore = {
  // --- USERS ---
  async findUserByEmail(email) {
    if (useDb()) {
      const { data, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).single();
      return !error && data ? data : null;
    }
    return usersTable.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    if (useDb()) {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
      return !error && data ? data : null;
    }
    return usersTable.find(u => u.id === id) || null;
  },

  async createUser({ email, passwordHash, displayName }) {
    const newUser = {
      id: generateId(),
      email: email.toLowerCase(),
      password_hash: passwordHash,
      display_name: displayName || email.split('@')[0],
      created_at: new Date().toISOString()
    };

    if (useDb()) {
      const { data, error } = await supabase.from('users').insert([newUser]).select().single();
      if (error) throw error;
      
      const newProfile = {
        id: generateId(),
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
      const dbClient = getClient(data.id);
      await dbClient.from('student_profiles').insert([newProfile]);
      return data;
    }

    usersTable.push(newUser);
    const profile = {
      id: generateId(), userId: newUser.id, displayName: newUser.display_name,
      university: 'Tech University', educationLevel: 'Undergraduate', major: 'Computer Science',
      graduationYear: new Date().getFullYear() + 2, skills: ['Python', 'JavaScript', 'React'],
      interests: ['Web Development', 'AI Research', 'Open Source'], careerGoals: 'Aspiring Software Engineer & Tech Innovator',
      preferredLocation: 'Remote', remotePreference: 'flexible', themePreference: 'light', updatedAt: new Date().toISOString()
    };
    profilesTable.push(profile);
    return newUser;
  },

  // --- PROFILES ---
  async getProfile(userId) {
    if (useDb()) {
      const dbClient = getClient(userId);
      const { data, error } = await dbClient.from('student_profiles').select('*').eq('user_id', userId).single();
      if (!error && data) {
        return {
          id: data.id, userId: data.user_id, displayName: data.display_name, university: data.university,
          educationLevel: data.education_level, major: data.major, graduationYear: data.graduation_year,
          skills: data.skills || [], interests: data.interests || [], careerGoals: data.career_goals,
          preferredLocation: data.preferred_location, remotePreference: data.remote_preference,
          themePreference: data.theme_preference, updatedAt: data.updated_at
        };
      }
      return null;
    }
    return profilesTable.find(p => p.userId === userId) || null;
  },

  async updateProfile(userId, updates) {
    if (useDb()) {
      const dbClient = getClient(userId);
      const dbUpdates = {};
      if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
      if (updates.university !== undefined) dbUpdates.university = updates.university;
      if (updates.educationLevel !== undefined) dbUpdates.education_level = updates.educationLevel;
      if (updates.major !== undefined) dbUpdates.major = updates.major;
      if (updates.graduationYear !== undefined) dbUpdates.graduation_year = updates.graduationYear;
      if (updates.skills !== undefined) dbUpdates.skills = updates.skills;
      if (updates.interests !== undefined) dbUpdates.interests = updates.interests;
      if (updates.careerGoals !== undefined) dbUpdates.career_goals = updates.careerGoals;
      if (updates.preferredLocation !== undefined) dbUpdates.preferred_location = updates.preferredLocation;
      if (updates.remotePreference !== undefined) dbUpdates.remote_preference = updates.remotePreference;
      if (updates.themePreference !== undefined) dbUpdates.theme_preference = updates.themePreference;
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error } = await dbClient.from('student_profiles').update(dbUpdates).eq('user_id', userId).select().single();
      if (error) throw error;
      return this.getProfile(userId);
    }
    const existing = await this.getProfile(userId);
    const updated = { ...existing, ...updates, userId, updatedAt: new Date().toISOString() };
    const index = profilesTable.findIndex(p => p.userId === userId);
    if (index >= 0) profilesTable[index] = updated; else profilesTable.push(updated);
    return updated;
  },

  // --- OPPORTUNITIES ---
  async getOpportunities({ search, category, skills, location, remote, deadline, organization, freshness, sort } = {}) {
    if (useDb()) {
      let query = supabase.from('opportunities').select('*');
      
      if (category && category !== 'all') query = query.eq('category', category.toLowerCase());
      if (remote !== undefined && remote !== null && remote !== '') query = query.eq('is_remote', String(remote) === 'true');
      if (organization) query = query.ilike('organization', `%${organization}%`);
      if (location) query = query.ilike('location', `%${location}%`);
      if (freshness) query = query.eq('freshness_status', freshness);
      
      const { data, error } = await query;
      if (error) throw error;
      let items = data || [];

      if (search && search.trim()) {
        const q = search.toLowerCase().trim();
        items = items.filter(o => {
          const inTitle = (o.title || '').toLowerCase().includes(q);
          const inOrg = (o.organization || '').toLowerCase().includes(q);
          const inDesc = (o.description || '').toLowerCase().includes(q);
          const inSkills = Array.isArray(o.skills_required) && o.skills_required.some(s => s.toLowerCase().includes(q));
          return inTitle || inOrg || inDesc || inSkills;
        });
      }

      if (skills && skills.trim()) {
        const skillList = skills.toLowerCase().split(',').map(s => s.trim());
        items = items.filter(o => {
          if (!Array.isArray(o.skills_required)) return false;
          return skillList.some(skill => o.skills_required.some(s => s.toLowerCase().includes(skill)));
        });
      }

      if (deadline === 'upcoming') {
        const now = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(now.getMonth() + 1);
        items = items.filter(o => o.deadline && new Date(o.deadline) >= now && new Date(o.deadline) <= nextMonth);
      } else if (deadline === 'active') {
        const now = new Date();
        items = items.filter(o => !o.deadline || new Date(o.deadline) >= now);
      }

      if (sort === 'deadline') items.sort((a, b) => new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31'));
      else if (sort === 'title') items.sort((a, b) => a.title.localeCompare(b.title));
      else items.sort((a, b) => new Date(b.freshness_date || 0) - new Date(a.freshness_date || 0));

      return items.map(mapOppFromDb);
    }

    let items = [...opportunitiesTable];
    if (category && category !== 'all') items = items.filter(o => o.category.toLowerCase() === category.toLowerCase());
    if (remote !== undefined && remote !== null && remote !== '') items = items.filter(o => o.isRemote === (String(remote) === 'true'));
    if (organization) items = items.filter(o => (o.organization || '').toLowerCase().includes(organization.toLowerCase()));
    if (location) items = items.filter(o => (o.location || '').toLowerCase().includes(location.toLowerCase()));
    if (freshness) items = items.filter(o => (o.freshnessStatus || 'unknown') === freshness);
    
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

    if (skills && skills.trim()) {
      const skillList = skills.toLowerCase().split(',').map(s => s.trim());
      items = items.filter(o => {
        if (!Array.isArray(o.skillsRequired)) return false;
        return skillList.some(skill => o.skillsRequired.some(s => s.toLowerCase().includes(skill)));
      });
    }

    if (deadline === 'upcoming') {
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(now.getMonth() + 1);
      items = items.filter(o => o.deadline && new Date(o.deadline) >= now && new Date(o.deadline) <= nextMonth);
    } else if (deadline === 'active') {
      const now = new Date();
      items = items.filter(o => !o.deadline || new Date(o.deadline) >= now);
    }

    if (sort === 'deadline') items.sort((a, b) => new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31'));
    else if (sort === 'title') items.sort((a, b) => a.title.localeCompare(b.title));
    else items.sort((a, b) => new Date(b.freshnessDate || 0) - new Date(a.freshnessDate || 0));
    return items;
  },

  async getOpportunityById(id) {
    if (useDb()) {
      const { data, error } = await supabase.from('opportunities').select('*').eq('id', id).single();
      if (error || !data) return null;
      return mapOppFromDb(data);
    }
    return opportunitiesTable.find(o => o.id === id) || null;
  },

  async createOpportunity(data) {
    if (useDb()) {
      // Direct insertion from pipeline, expects snake_case if already processed, but we handle both
      const newOpp = {
        id: generateId(),
        title: data.title,
        organization: data.organization,
        category: data.category || data.category || 'other',
        description: data.description || '',
        source_url: data.source_url || data.sourceUrl || null,
        application_url: data.application_url || data.applicationUrl || null,
        deadline: data.deadline || null,
        location: data.location || (data.isRemote || data.is_remote ? 'Remote' : 'Location Not Specified'),
        is_remote: data.is_remote !== undefined ? Boolean(data.is_remote) : Boolean(data.isRemote),
        requirements: Array.isArray(data.requirements) ? data.requirements : [],
        skills_required: Array.isArray(data.skills_required || data.skillsRequired) ? (data.skills_required || data.skillsRequired) : [],
        eligibility: Array.isArray(data.eligibility) ? data.eligibility : [],
        education_requirements: Array.isArray(data.education_requirements || data.educationRequirements) ? (data.education_requirements || data.educationRequirements) : [],
        experience_requirements: Array.isArray(data.experience_requirements || data.experienceRequirements) ? (data.experience_requirements || data.experienceRequirements) : [],
        funding_compensation: data.funding_compensation || data.fundingCompensation || 'Not specified',
        source_type: data.source_type || data.sourceType || 'manual',
        source_name: data.source_name || data.sourceName || 'Unknown',
        posted_date: data.posted_date || data.postedDate || null,
        last_verified_date: data.last_verified_date || data.lastVerifiedDate || new Date().toISOString(),
        freshness_status: data.freshness_status || data.freshnessStatus || 'active',
        verification_status: data.verification_status || data.verificationStatus || 'unverified',
        freshness_date: new Date().toISOString(),
        extraction_status: data.extraction_status || data.extractionStatus || 'verified'
      };
      const { data: dbData, error } = await supabase.from('opportunities').insert([newOpp]).select().single();
      if (error) throw error;
      return this.getOpportunityById(dbData.id);
    }
    
    // In-memory fallback
    const newOpp = {
      id: generateId(),
      title: data.title, organization: data.organization, category: data.category || 'other',
      description: data.description || '', sourceUrl: data.source_url || data.sourceUrl || null,
      applicationUrl: data.application_url || data.applicationUrl || null, deadline: data.deadline || null,
      location: data.location || 'Location Not Specified', isRemote: Boolean(data.is_remote || data.isRemote),
      requirements: Array.isArray(data.requirements) ? data.requirements : [],
      skillsRequired: Array.isArray(data.skills_required || data.skillsRequired) ? (data.skills_required || data.skillsRequired) : [],
      eligibility: Array.isArray(data.eligibility) ? data.eligibility : [],
      educationRequirements: Array.isArray(data.education_requirements || data.educationRequirements) ? (data.education_requirements || data.educationRequirements) : [],
      experienceRequirements: Array.isArray(data.experience_requirements || data.experienceRequirements) ? (data.experience_requirements || data.experienceRequirements) : [],
      fundingCompensation: data.funding_compensation || data.fundingCompensation || 'Not specified',
      sourceType: data.source_type || data.sourceType || 'manual',
      sourceName: data.source_name || data.sourceName || 'Unknown',
      postedDate: data.posted_date || data.postedDate || null,
      lastVerifiedDate: data.last_verified_date || data.lastVerifiedDate || new Date().toISOString(),
      freshnessStatus: data.freshness_status || data.freshnessStatus || 'active',
      verificationStatus: data.verification_status || data.verificationStatus || 'unverified',
      freshnessDate: new Date().toISOString(),
      extractionStatus: data.extraction_status || data.extractionStatus || 'verified'
    };
    opportunitiesTable.unshift(newOpp);
    return newOpp;
  },

  // --- USER TRACKED OPPORTUNITIES (MY OPPORTUNITIES) ---
  async getUserOpportunities(userId, statusFilter) {
    if (useDb()) {
      const dbClient = getClient(userId);
      let query = dbClient.from('user_opportunities').select('*, opportunities(*)').eq('user_id', userId);
      if (statusFilter && statusFilter !== 'all') query = query.eq('status', statusFilter.toLowerCase());
      const { data, error } = await query;
      if (error) throw error;

      const items = (data || []).map(r => ({
        id: r.id, userId: r.user_id, opportunityId: r.opportunity_id, status: r.status,
        notes: r.notes, checklist: r.checklist, reminders: r.reminders, appliedDate: r.applied_date,
        resumeId: r.resume_id, aiPreparation: r.ai_preparation, interviewPreparation: r.interview_preparation, activityHistory: r.activity_history,
        createdAt: r.created_at, updatedAt: r.updated_at,
        opportunity: r.opportunities ? mapOppFromDb(r.opportunities) : null
      }));

      const { data: allData } = await dbClient.from('user_opportunities').select('status').eq('user_id', userId);
      const allUserRecords = allData || [];
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
    }

    let records = userOpportunitiesTable.filter(u => u.userId === userId);
    if (statusFilter && statusFilter !== 'all') records = records.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
    const items = records.map(r => ({ ...r, opportunity: opportunitiesTable.find(o => o.id === r.opportunityId) || null }));
    const allUserRecords = userOpportunitiesTable.filter(u => u.userId === userId);
    const counts = {
      all: allUserRecords.length, saved: allUserRecords.filter(r => r.status === 'saved').length,
      planned: allUserRecords.filter(r => r.status === 'planned').length, applied: allUserRecords.filter(r => r.status === 'applied').length,
      shortlisted: allUserRecords.filter(r => r.status === 'shortlisted').length, interview: allUserRecords.filter(r => r.status === 'interview').length,
      offered: allUserRecords.filter(r => r.status === 'offered').length, rejected: allUserRecords.filter(r => r.status === 'rejected').length,
      completed: allUserRecords.filter(r => r.status === 'completed').length, archived: allUserRecords.filter(r => r.status === 'archived').length
    };
    return { counts, items };
  },

  async trackOpportunity(userId, { opportunityId, status = 'saved', notes = '', checklist = [], reminders = [], appliedDate = null }) {
    if (useDb()) {
      const dbClient = getClient(userId);
      const now = new Date().toISOString();
      const { data: existing } = await dbClient.from('user_opportunities').select('*').eq('user_id', userId).eq('opportunity_id', opportunityId).single();
        
      if (existing) {
        const { data: updated, error } = await dbClient.from('user_opportunities')
          .update({ status, notes: notes !== undefined ? notes : existing.notes, checklist: checklist.length ? checklist : existing.checklist, reminders: reminders.length ? reminders : existing.reminders, applied_date: appliedDate || existing.applied_date, updated_at: now })
          .eq('id', existing.id).select().single();
        if (error) throw error;
        const opp = await this.getOpportunityById(opportunityId);
        return { id: updated.id, userId: updated.user_id, opportunityId: updated.opportunity_id, status: updated.status, notes: updated.notes, checklist: updated.checklist, reminders: updated.reminders, appliedDate: updated.applied_date, createdAt: updated.created_at, updatedAt: updated.updated_at, opportunity: opp };
      }

      const defaultChecklist = [ { id: 'chk-1', item: 'Check eligibility criteria', completed: true }, { id: 'chk-2', item: 'Update CV / Resume', completed: false }, { id: 'chk-3', item: 'Submit application before deadline', completed: false } ];
      const newRecord = { id: generateId(), user_id: userId, opportunity_id: opportunityId, status, notes, checklist: checklist && checklist.length > 0 ? checklist : defaultChecklist, reminders, applied_date: appliedDate, created_at: now, updated_at: now };
      const { data, error } = await dbClient.from('user_opportunities').insert([newRecord]).select().single();
      if (error) throw error;
      const opp = await this.getOpportunityById(opportunityId);
      return { id: data.id, userId: data.user_id, opportunityId: data.opportunity_id, status: data.status, notes: data.notes, checklist: data.checklist, reminders: data.reminders, appliedDate: data.applied_date, createdAt: data.created_at, updatedAt: data.updated_at, opportunity: opp };
    }

    const existingIndex = userOpportunitiesTable.findIndex(r => r.userId === userId && r.opportunityId === opportunityId);
    const now = new Date().toISOString();
    if (existingIndex >= 0) {
      userOpportunitiesTable[existingIndex] = { ...userOpportunitiesTable[existingIndex], status, notes: notes !== undefined ? notes : userOpportunitiesTable[existingIndex].notes, checklist: checklist.length ? checklist : userOpportunitiesTable[existingIndex].checklist, reminders: reminders.length ? reminders : userOpportunitiesTable[existingIndex].reminders, appliedDate: appliedDate || userOpportunitiesTable[existingIndex].appliedDate, updatedAt: now };
      const opp = opportunitiesTable.find(o => o.id === opportunityId);
      return { ...userOpportunitiesTable[existingIndex], opportunity: opp };
    }
    const defaultChecklist = [ { id: 'chk-1', item: 'Check eligibility criteria', completed: true }, { id: 'chk-2', item: 'Update CV / Resume', completed: false }, { id: 'chk-3', item: 'Submit application before deadline', completed: false } ];
    const newRecord = { id: generateId(), userId, opportunityId, status, notes, checklist: checklist && checklist.length > 0 ? checklist : defaultChecklist, reminders, appliedDate, createdAt: now, updatedAt: now };
    userOpportunitiesTable.push(newRecord);
    return { ...newRecord, opportunity: opportunitiesTable.find(o => o.id === opportunityId) };
  },

  async updateUserOpportunity(userId, id, updates) {
    if (useDb()) {
      const dbClient = getClient(userId);
      const dbUpdates = {};
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.checklist !== undefined) dbUpdates.checklist = updates.checklist;
      if (updates.reminders !== undefined) dbUpdates.reminders = updates.reminders;
      if (updates.appliedDate !== undefined) dbUpdates.applied_date = updates.appliedDate;
      if (updates.resumeId !== undefined) dbUpdates.resume_id = updates.resumeId;
      if (updates.aiPreparation !== undefined) dbUpdates.ai_preparation = updates.aiPreparation;
      if (updates.interviewPreparation !== undefined) dbUpdates.interview_preparation = updates.interviewPreparation;
      if (updates.activityHistory !== undefined) dbUpdates.activity_history = updates.activityHistory;
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error } = await dbClient.from('user_opportunities').update(dbUpdates).eq('id', id).eq('user_id', userId).select().single();
      if (error || !data) return null;
      const opp = await this.getOpportunityById(data.opportunity_id);
      return { id: data.id, userId: data.user_id, opportunityId: data.opportunity_id, status: data.status, notes: data.notes, checklist: data.checklist, reminders: data.reminders, appliedDate: data.applied_date, resumeId: data.resume_id, aiPreparation: data.ai_preparation, interviewPreparation: data.interview_preparation, activityHistory: data.activity_history, createdAt: data.created_at, updatedAt: data.updated_at, opportunity: opp };
    }
    const index = userOpportunitiesTable.findIndex(r => r.id === id && r.userId === userId);
    if (index === -1) return null;
    userOpportunitiesTable[index] = { ...userOpportunitiesTable[index], ...updates, updatedAt: new Date().toISOString() };
    return { ...userOpportunitiesTable[index], opportunity: opportunitiesTable.find(o => o.id === userOpportunitiesTable[index].opportunityId) };
  },

  async deleteUserOpportunity(userId, id) {
    if (useDb()) {
      const dbClient = getClient(userId);
      const { error } = await dbClient.from('user_opportunities').delete().eq('id', id).eq('user_id', userId);
      return !error;
    }
    const index = userOpportunitiesTable.findIndex(r => r.id === id && r.userId === userId);
    if (index === -1) return false;
    userOpportunitiesTable.splice(index, 1);
    return true;
  },

  // --- AUDIT / AI INTERACTIONS ---
  async logAiInteraction(userId, opportunityId, interactionType, requestData, responseData) {
    if (useDb()) {
      const dbClient = getClient(userId);
      const record = { id: generateId(), user_id: userId || null, opportunity_id: opportunityId || null, interaction_type: interactionType, request_data: requestData, response_data: responseData, created_at: new Date().toISOString() };
      await dbClient.from('ai_interactions').insert([record]);
      return { id: record.id, userId: record.user_id, opportunityId: record.opportunity_id, interactionType: record.interaction_type, requestData: record.request_data, responseData: record.response_data, createdAt: record.created_at };
    }
    const record = { id: generateId(), userId: userId || null, opportunityId: opportunityId || null, interactionType, requestData, responseData, createdAt: new Date().toISOString() };
    aiInteractionsTable.push(record);
    return record;
  },

  // --- CAREER ROADMAP ---
  async getRoadmap(userId) {
    if (useDb()) {
      const dbClient = getClient(userId);
      const { data, error } = await dbClient.from('career_roadmaps').select('*').eq('user_id', userId).single();
      if (error || !data) return null;
      return {
        id: data.id,
        userId: data.user_id,
        targetCareer: data.target_career,
        currentState: data.current_state,
        currentSkills: data.current_skills,
        missingSkills: data.missing_skills,
        learningPriorities: data.learning_priorities,
        suggestedProjects: data.suggested_projects,
        milestones: data.milestones,
        progress: data.progress,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    }
    // Fallback if not using DB (for testing/local)
    this.roadmapsTable = this.roadmapsTable || [];
    return this.roadmapsTable.find(r => r.userId === userId) || null;
  },

  async saveRoadmap(userId, roadmapData) {
    if (useDb()) {
      const dbClient = getClient(userId);
      const newRecord = {
        user_id: userId,
        target_career: roadmapData.targetCareer,
        current_state: roadmapData.currentState,
        current_skills: roadmapData.currentSkills || [],
        missing_skills: roadmapData.missingSkills || [],
        learning_priorities: roadmapData.learningPriorities || [],
        suggested_projects: roadmapData.suggestedProjects || [],
        milestones: roadmapData.milestones || [],
        progress: roadmapData.progress || 0,
        updated_at: new Date().toISOString()
      };

      // Upsert
      const existing = await this.getRoadmap(userId);
      if (existing) {
        const { data, error } = await dbClient.from('career_roadmaps')
          .update(newRecord)
          .eq('user_id', userId)
          .select()
          .single();
        if (error) throw error;
        return this.getRoadmap(userId);
      } else {
        const { data, error } = await dbClient.from('career_roadmaps')
          .insert([newRecord])
          .select()
          .single();
        if (error) throw error;
        return this.getRoadmap(userId);
      }
    }
    
    this.roadmapsTable = this.roadmapsTable || [];
    const index = this.roadmapsTable.findIndex(r => r.userId === userId);
    const newRoadmap = { id: generateId(), userId, ...roadmapData, updatedAt: new Date().toISOString() };
    if (index >= 0) {
      this.roadmapsTable[index] = { ...this.roadmapsTable[index], ...newRoadmap };
    } else {
      this.roadmapsTable.push(newRoadmap);
    }
    return this.roadmapsTable.find(r => r.userId === userId);
  },

  async updateRoadmapProgress(userId, progressData) {
    // Allows updating milestones status directly
    if (useDb()) {
      const dbClient = getClient(userId);
      const updates = {
        milestones: progressData.milestones,
        progress: progressData.progress,
        updated_at: new Date().toISOString()
      };
      await dbClient.from('career_roadmaps').update(updates).eq('user_id', userId);
      return this.getRoadmap(userId);
    }
    
    this.roadmapsTable = this.roadmapsTable || [];
    const index = this.roadmapsTable.findIndex(r => r.userId === userId);
    if (index >= 0) {
      this.roadmapsTable[index].milestones = progressData.milestones;
      this.roadmapsTable[index].progress = progressData.progress;
      this.roadmapsTable[index].updatedAt = new Date().toISOString();
      return this.roadmapsTable[index];
    }
    return null;
  },

  // --- USER RESUMES ---
  async getResume(userId) {
    if (useDb()) {
      const dbClient = getClient(userId);
      const { data, error } = await dbClient.from('user_resumes').select('*').eq('user_id', userId).single();
      if (error || !data) return null;
      return {
        id: data.id,
        userId: data.user_id,
        fileName: data.file_name,
        fileType: data.file_type,
        fileSize: data.file_size,
        parsedContent: data.parsed_content,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    }
    this.resumesTable = this.resumesTable || [];
    return this.resumesTable.find(r => r.userId === userId) || null;
  },

  async saveResume(userId, resumeData) {
    if (useDb()) {
      const dbClient = getClient(userId);
      const newRecord = {
        user_id: userId,
        file_name: resumeData.fileName,
        file_type: resumeData.fileType,
        file_size: resumeData.fileSize,
        parsed_content: resumeData.parsedContent,
        updated_at: new Date().toISOString()
      };

      const existing = await this.getResume(userId);
      if (existing) {
        const { error } = await dbClient.from('user_resumes').update(newRecord).eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await dbClient.from('user_resumes').insert([newRecord]);
        if (error) throw error;
      }
      return this.getResume(userId);
    }
    
    this.resumesTable = this.resumesTable || [];
    const index = this.resumesTable.findIndex(r => r.userId === userId);
    const newResume = { id: generateId(), userId, ...resumeData, updatedAt: new Date().toISOString() };
    if (index >= 0) {
      this.resumesTable[index] = { ...this.resumesTable[index], ...newResume };
    } else {
      this.resumesTable.push(newResume);
    }
    return this.resumesTable.find(r => r.userId === userId);
  },

  // --- NOTIFICATIONS & PREFERENCES ---
  async getNotificationPreferences(userId) {
    if (useDb()) {
      const dbClient = getClient(userId);
      const { data, error } = await dbClient.from('notification_preferences').select('*').eq('user_id', userId).single();
      if (error || !data) {
        // Return default preferences
        return {
          userId,
          inAppEnabled: true,
          emailEnabled: false,
          deadlineReminders: true,
          applicationReminders: true,
          roadmapReminders: true
        };
      }
      return {
        userId: data.user_id,
        inAppEnabled: data.in_app_enabled,
        emailEnabled: data.email_enabled,
        deadlineReminders: data.deadline_reminders,
        applicationReminders: data.application_reminders,
        roadmapReminders: data.roadmap_reminders
      };
    }
    this.notificationPrefsTable = this.notificationPrefsTable || [];
    const prefs = this.notificationPrefsTable.find(p => p.userId === userId);
    return prefs || { userId, inAppEnabled: true, emailEnabled: false, deadlineReminders: true, applicationReminders: true, roadmapReminders: true };
  },

  async updateNotificationPreferences(userId, prefs) {
    if (useDb()) {
      const dbClient = getClient(userId);
      const updates = {
        in_app_enabled: prefs.inAppEnabled,
        email_enabled: prefs.emailEnabled,
        deadline_reminders: prefs.deadlineReminders,
        application_reminders: prefs.applicationReminders,
        roadmap_reminders: prefs.roadmapReminders,
        updated_at: new Date().toISOString()
      };
      
      const { data: existing } = await dbClient.from('notification_preferences').select('user_id').eq('user_id', userId).single();
      if (existing) {
        await dbClient.from('notification_preferences').update(updates).eq('user_id', userId);
      } else {
        await dbClient.from('notification_preferences').insert([{ user_id: userId, ...updates }]);
      }
      return this.getNotificationPreferences(userId);
    }
    this.notificationPrefsTable = this.notificationPrefsTable || [];
    const index = this.notificationPrefsTable.findIndex(p => p.userId === userId);
    const updated = { userId, ...prefs, updatedAt: new Date().toISOString() };
    if (index >= 0) this.notificationPrefsTable[index] = updated;
    else this.notificationPrefsTable.push(updated);
    return updated;
  },

  async getNotifications(userId) {
    if (useDb()) {
      const dbClient = getClient(userId);
      const { data, error } = await dbClient.from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []).map(n => ({
        id: n.id,
        userId: n.user_id,
        title: n.title,
        message: n.message,
        type: n.type,
        linkUrl: n.link_url,
        isRead: n.is_read,
        relatedEntityId: n.related_entity_id,
        deduplicationKey: n.deduplication_key,
        createdAt: n.created_at
      }));
    }
    this.notificationsTable = this.notificationsTable || [];
    return this.notificationsTable
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50);
  },

  async createNotification(notification) {
    const { userId, title, message, type, linkUrl, relatedEntityId, deduplicationKey } = notification;
    if (useDb()) {
      const dbClient = getClient(userId);
      
      // Check deduplication
      if (deduplicationKey) {
        const { data: existing } = await dbClient.from('notifications').select('id').eq('deduplication_key', deduplicationKey).single();
        if (existing) return existing; // Skip duplicate
      }
      
      const newNotif = {
        user_id: userId,
        title, message, type,
        link_url: linkUrl || null,
        related_entity_id: relatedEntityId || null,
        deduplication_key: deduplicationKey || null,
        is_read: false
      };
      
      const { data, error } = await dbClient.from('notifications').insert([newNotif]).select().single();
      if (error) {
        if (error.code === '23505') return null; // Unique violation, ignore duplicate
        throw error;
      }
      return data;
    }
    
    this.notificationsTable = this.notificationsTable || [];
    if (deduplicationKey && this.notificationsTable.find(n => n.deduplicationKey === deduplicationKey)) {
      return null; // Skip duplicate
    }
    
    const newNotif = {
      id: generateId(),
      userId, title, message, type, linkUrl, relatedEntityId, deduplicationKey,
      isRead: false, createdAt: new Date().toISOString()
    };
    this.notificationsTable.push(newNotif);
    return newNotif;
  },

  async markNotificationRead(userId, notificationId) {
    if (useDb()) {
      const dbClient = getClient(userId);
      const { data, error } = await dbClient.from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select().single();
      return !error && !!data;
    }
    this.notificationsTable = this.notificationsTable || [];
    const n = this.notificationsTable.find(n => n.id === notificationId && n.userId === userId);
    if (n) { n.isRead = true; return true; }
    return false;
  },

  async markAllNotificationsRead(userId) {
    if (useDb()) {
      const dbClient = getClient(userId);
      const { error } = await dbClient.from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false);
      return !error;
    }
    this.notificationsTable = this.notificationsTable || [];
    this.notificationsTable.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
    return true;
  },

  async adminUpdateUserRole(userId, role) {
    if (useDb()) {
      const dbClient = supabase;
      if (!dbClient) return null;
      const { data, error } = await dbClient.from('users').update({ role }).eq('id', userId).select().single();
      return !error && data ? data : null;
    }
    const user = usersTable.find(u => u.id === userId);
    if (user) {
      user.role = role;
      return user;
    }
    return null;
  },

  async adminUpdateUserPlan(userId, plan) {
    if (useDb()) {
      const dbClient = supabase;
      if (!dbClient) return null;
      const { data, error } = await dbClient.from('users').update({ plan_type: plan }).eq('id', userId).select().single();
      return !error && data ? data : null;
    }
    const user = usersTable.find(u => u.id === userId);
    if (user) {
      user.plan_type = plan;
      return user;
    }
    return null;
  },

  async incrementAiUsage(userId) {
    if (useDb()) {
      const dbClient = supabase;
      if (!dbClient) return;
      const { data } = await dbClient.from('users').select('ai_usage_count').eq('id', userId).single();
      if (data) {
        await dbClient.from('users').update({ ai_usage_count: (data.ai_usage_count || 0) + 1 }).eq('id', userId);
      }
    } else {
      const u = usersTable.find(u => u.id === userId);
      if (u) u.ai_usage_count = (u.ai_usage_count || 0) + 1;
    }
  },

  async getSubscription(userId) {
    if (useDb()) {
      const dbClient = supabase;
      if (!dbClient) return null;
      const { data, error } = await dbClient.from('subscriptions').select('*').eq('user_id', userId).single();
      if (error && error.code !== 'PGRST116') {
        console.error('Supabase select subscription error:', error);
      }
      return data;
    }
    this.subscriptionsTable = this.subscriptionsTable || [];
    return this.subscriptionsTable.find(s => s.user_id === userId);
  },

  async upsertSubscription(userId, subData) {
    if (useDb()) {
      const dbClient = supabase;
      if (!dbClient) return null;
      // Check if exists
      const existing = await this.getSubscription(userId);
      if (existing) {
        const { data, error } = await dbClient.from('subscriptions').update({ ...subData, updated_at: new Date().toISOString() }).eq('user_id', userId).select().single();
        if (error) console.error('Supabase update subscription error:', error);
        return !error ? data : null;
      } else {
        const { data, error } = await dbClient.from('subscriptions').insert({ user_id: userId, ...subData }).select().single();
        if (error) console.error('Supabase insert subscription error:', error);
        return !error ? data : null;
      }
    }
    this.subscriptionsTable = this.subscriptionsTable || [];
    let sub = this.subscriptionsTable.find(s => s.user_id === userId);
    if (sub) {
      Object.assign(sub, subData, { updated_at: new Date().toISOString() });
    } else {
      sub = { id: crypto.randomUUID(), user_id: userId, created_at: new Date().toISOString(), ...subData };
      this.subscriptionsTable.push(sub);
    }
    return sub;
  },

  async logBillingEvent(userId, eventType, payload) {
    if (useDb()) {
      const dbClient = supabase;
      if (dbClient) {
        await dbClient.from('billing_events').insert({ user_id: userId, event_type: eventType, payload });
      }
      return;
    }
    this.billingEventsTable = this.billingEventsTable || [];
    this.billingEventsTable.push({ id: crypto.randomUUID(), user_id: userId, event_type: eventType, payload, created_at: new Date().toISOString() });
  },

  async getUserPlanAndUsage(userId) {
    let baseData = { plan_type: 'free', ai_usage_count: 0 };
    
    if (useDb()) {
      const dbClient = supabase;
      if (dbClient) {
        const { data } = await dbClient.from('users').select('plan_type, ai_usage_count').eq('id', userId).single();
        if (data) baseData = data;
      }
    } else {
      const u = usersTable.find(u => u.id === userId);
      if (u) {
        baseData.plan_type = u.plan_type || 'free';
        baseData.ai_usage_count = u.ai_usage_count || 0;
      }
    }

    // Now resolve actual plan with subscription
    const sub = await this.getSubscription(userId);
    let resolvedPlan = 'free';

    if (sub && (sub.status === 'active' || sub.status === 'trialing')) {
      resolvedPlan = sub.plan_id;
    } else if (baseData.plan_type && baseData.plan_type !== 'free') {
      // For backwards compatibility before subscriptions table existed, fallback to users table
      // If we strictly enforce subscriptions, we could ignore users.plan_type.
      // But we will respect users.plan_type if no subscription row exists to avoid breaking existing users.
      if (!sub) {
        resolvedPlan = baseData.plan_type;
      } else {
        resolvedPlan = 'free'; // Sub exists but is expired/cancelled
      }
    }

    return {
      plan_type: resolvedPlan,
      ai_usage_count: baseData.ai_usage_count,
      subscription_status: sub ? sub.status : null
    };
  }
};

module.exports = dbStore;
