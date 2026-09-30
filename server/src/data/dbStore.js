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
          updated_at: o.updatedAt || new Date().toISOString()
        })));
      }
    } catch (e) {
      console.warn('[dbStore] Failed to seed DB', e.message);
    }
  })();
}

const dbStore = {
  // --- USERS ---
  async findUserByEmail(email) {
    if (useDb()) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      return !error && data ? data : null;
    }
    return usersTable.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    if (useDb()) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      return !error && data ? data : null;
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

    if (useDb()) {
      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();
      if (error) throw error;
      
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
      const dbClient = getClient(data.id);
      await dbClient.from('student_profiles').insert([newProfile]);
      return data;
    }

    usersTable.push(newUser);
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
    if (useDb()) {
      const dbClient = getClient(userId);
      const { data, error } = await dbClient
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

      const { data, error } = await dbClient
        .from('student_profiles')
        .update(dbUpdates)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return this.getProfile(userId);
    }

    const existing = await this.getProfile(userId);
    const updated = { ...existing, ...updates, userId, updatedAt: new Date().toISOString() };
    const index = profilesTable.findIndex(p => p.userId === userId);
    if (index >= 0) profilesTable[index] = updated;
    else profilesTable.push(updated);
    return updated;
  },

  // --- OPPORTUNITIES ---
  async getOpportunities({ search, category, remote, sort } = {}) {
    if (useDb()) {
      let query = supabase.from('opportunities').select('*');
      
      if (category && category !== 'all') {
        query = query.eq('category', category.toLowerCase());
      }
      if (remote !== undefined && remote !== null && remote !== '') {
        query = query.eq('is_remote', String(remote) === 'true');
      }

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

      if (sort === 'deadline') {
        items.sort((a, b) => new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31'));
      } else if (sort === 'title') {
        items.sort((a, b) => a.title.localeCompare(b.title));
      } else {
        items.sort((a, b) => new Date(b.freshness_date || 0) - new Date(a.freshness_date || 0));
      }

      return items.map(o => ({
        ...o,
        isRemote: o.is_remote,
        sourceUrl: o.source_url,
        applicationUrl: o.application_url,
        skillsRequired: o.skills_required,
        fundingCompensation: o.funding_compensation,
        sourceType: o.source_type,
        freshnessDate: o.freshness_date,
        extractionStatus: o.extraction_status,
        createdAt: o.created_at,
        updatedAt: o.updated_at
      }));
    }

    let items = [...opportunitiesTable];
    if (category && category !== 'all') items = items.filter(o => o.category.toLowerCase() === category.toLowerCase());
    if (remote !== undefined && remote !== null && remote !== '') items = items.filter(o => o.isRemote === (String(remote) === 'true'));
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
    if (sort === 'deadline') items.sort((a, b) => new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31'));
    else if (sort === 'title') items.sort((a, b) => a.title.localeCompare(b.title));
    else items.sort((a, b) => new Date(b.freshnessDate || 0) - new Date(a.freshnessDate || 0));
    return items;
  },

  async getOpportunityById(id) {
    if (useDb()) {
      const { data, error } = await supabase.from('opportunities').select('*').eq('id', id).single();
      if (error || !data) return null;
      return {
        ...data,
        isRemote: data.is_remote,
        sourceUrl: data.source_url,
        applicationUrl: data.application_url,
        skillsRequired: data.skills_required,
        fundingCompensation: data.funding_compensation,
        sourceType: data.source_type,
        freshnessDate: data.freshness_date,
        extractionStatus: data.extraction_status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    }
    return opportunitiesTable.find(o => o.id === id) || null;
  },

  async createOpportunity(data) {
    if (useDb()) {
      const newOpp = {
        id: generateId('opp'),
        title: data.title,
        organization: data.organization,
        category: data.category || 'internship',
        description: data.description || '',
        source_url: data.sourceUrl || '',
        application_url: data.applicationUrl || data.sourceUrl || '',
        deadline: data.deadline || null,
        location: data.location || (data.isRemote ? 'Remote' : 'Location Not Specified'),
        is_remote: Boolean(data.isRemote),
        requirements: Array.isArray(data.requirements) ? data.requirements : [],
        skills_required: Array.isArray(data.skillsRequired) ? data.skillsRequired : [],
        funding_compensation: data.fundingCompensation || 'Not specified',
        source_type: data.sourceType || 'manual',
        freshness_date: new Date().toISOString(),
        extraction_status: data.extractionStatus || 'verified'
      };
      const { data: dbData, error } = await supabase.from('opportunities').insert([newOpp]).select().single();
      if (error) throw error;
      return this.getOpportunityById(dbData.id);
    }
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
    if (useDb()) {
      const dbClient = getClient(userId);
      let query = dbClient.from('user_opportunities').select('*, opportunities(*)').eq('user_id', userId);
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter.toLowerCase());
      }
      const { data, error } = await query;
      if (error) throw error;

      const items = (data || []).map(r => ({
        id: r.id,
        userId: r.user_id,
        opportunityId: r.opportunity_id,
        status: r.status,
        notes: r.notes,
        checklist: r.checklist,
        reminders: r.reminders,
        appliedDate: r.applied_date,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        opportunity: r.opportunities ? {
          ...r.opportunities,
          isRemote: r.opportunities.is_remote,
          sourceUrl: r.opportunities.source_url,
          applicationUrl: r.opportunities.application_url,
          skillsRequired: r.opportunities.skills_required,
          fundingCompensation: r.opportunities.funding_compensation,
          sourceType: r.opportunities.source_type,
          freshnessDate: r.opportunities.freshness_date,
          extractionStatus: r.opportunities.extraction_status,
        } : null
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
    if (statusFilter && statusFilter !== 'all') {
      records = records.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
    }
    const items = records.map(r => ({ ...r, opportunity: opportunitiesTable.find(o => o.id === r.opportunityId) || null }));
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
    if (useDb()) {
      const dbClient = getClient(userId);
      const now = new Date().toISOString();
      const { data: existing } = await dbClient.from('user_opportunities')
        .select('*')
        .eq('user_id', userId)
        .eq('opportunity_id', opportunityId)
        .single();
        
      if (existing) {
        const { data: updated, error } = await dbClient.from('user_opportunities')
          .update({
            status,
            notes: notes !== undefined ? notes : existing.notes,
            checklist: checklist.length ? checklist : existing.checklist,
            reminders: reminders.length ? reminders : existing.reminders,
            applied_date: appliedDate || existing.applied_date,
            updated_at: now
          })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        const opp = await this.getOpportunityById(opportunityId);
        return {
          id: updated.id,
          userId: updated.user_id,
          opportunityId: updated.opportunity_id,
          status: updated.status,
          notes: updated.notes,
          checklist: updated.checklist,
          reminders: updated.reminders,
          appliedDate: updated.applied_date,
          createdAt: updated.created_at,
          updatedAt: updated.updated_at,
          opportunity: opp
        };
      }

      const defaultChecklist = [
        { id: 'chk-1', item: 'Check eligibility criteria', completed: true },
        { id: 'chk-2', item: 'Update CV / Resume', completed: false },
        { id: 'chk-3', item: 'Submit application before deadline', completed: false }
      ];

      const newRecord = {
        id: generateId('track'),
        user_id: userId,
        opportunity_id: opportunityId,
        status,
        notes,
        checklist: checklist && checklist.length > 0 ? checklist : defaultChecklist,
        reminders,
        applied_date: appliedDate,
        created_at: now,
        updated_at: now
      };

      const { data, error } = await dbClient.from('user_opportunities').insert([newRecord]).select().single();
      if (error) throw error;
      const opp = await this.getOpportunityById(opportunityId);
      return {
          id: data.id,
          userId: data.user_id,
          opportunityId: data.opportunity_id,
          status: data.status,
          notes: data.notes,
          checklist: data.checklist,
          reminders: data.reminders,
          appliedDate: data.applied_date,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          opportunity: opp
      };
    }

    const existingIndex = userOpportunitiesTable.findIndex(r => r.userId === userId && r.opportunityId === opportunityId);
    const now = new Date().toISOString();
    if (existingIndex >= 0) {
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
    const newRecord = { id: generateId('track'), userId, opportunityId, status, notes, checklist: checklist && checklist.length > 0 ? checklist : defaultChecklist, reminders, appliedDate, createdAt: now, updatedAt: now };
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
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error } = await dbClient
        .from('user_opportunities')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error || !data) return null;
      const opp = await this.getOpportunityById(data.opportunity_id);
      return {
          id: data.id,
          userId: data.user_id,
          opportunityId: data.opportunity_id,
          status: data.status,
          notes: data.notes,
          checklist: data.checklist,
          reminders: data.reminders,
          appliedDate: data.applied_date,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          opportunity: opp
      };
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
      const record = {
        id: generateId('ai-log'),
        user_id: userId || null,
        opportunity_id: opportunityId || null,
        interaction_type: interactionType,
        request_data: requestData,
        response_data: responseData,
        created_at: new Date().toISOString()
      };
      await dbClient.from('ai_interactions').insert([record]);
      return {
        id: record.id,
        userId: record.user_id,
        opportunityId: record.opportunity_id,
        interactionType: record.interaction_type,
        requestData: record.request_data,
        responseData: record.response_data,
        createdAt: record.created_at
      };
    }
    const record = { id: generateId('ai-log'), userId: userId || null, opportunityId: opportunityId || null, interactionType, requestData, responseData, createdAt: new Date().toISOString() };
    aiInteractionsTable.push(record);
    return record;
  }
};

module.exports = dbStore;
