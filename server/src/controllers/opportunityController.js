const dbStore = require('../data/dbStore');
const scraperService = require('../services/scraperService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Generate a deterministic, grounded match explanation for an opportunity
 * based on student's actual profile skills and interests.
 */
const computeMatchExplanation = (opportunity, profile) => {
  if (!profile) return null;

  const profileSkills = (profile.skills || []).map(s => s.toLowerCase());
  const profileInterests = (profile.interests || []).map(i => i.toLowerCase());

  const matchedSkills = (opportunity.skillsRequired || []).filter(s =>
    profileSkills.some(ps => ps.includes(s.toLowerCase()) || s.toLowerCase().includes(ps))
  );

  const matchedInterests = profileInterests.filter(i =>
    (opportunity.category && opportunity.category.toLowerCase().includes(i)) ||
    (opportunity.title && opportunity.title.toLowerCase().includes(i)) ||
    (opportunity.description && opportunity.description.toLowerCase().includes(i))
  );

  if (matchedSkills.length > 0 && matchedInterests.length > 0) {
    return `Matches your interest in ${matchedInterests[0]} and skills in ${matchedSkills.join(', ')}.`;
  } else if (matchedSkills.length > 0) {
    return `Aligns with your technical skills: ${matchedSkills.join(', ')}.`;
  } else if (matchedInterests.length > 0) {
    return `Connects directly to your learning goals in ${matchedInterests.join(', ')}.`;
  } else if (opportunity.isRemote && profile.remotePreference === 'remote') {
    return 'Matches your preference for remote opportunities.';
  }

  return 'Relevant to university students in STEM and engineering tracks.';
};

const listOpportunities = async (req, res, next) => {
  try {
    const { search, category, remote, sort } = req.query;
    const opportunities = await dbStore.getOpportunities({ search, category, remote, sort });

    // If user is authenticated, compute personalized match explanations
    let studentProfile = null;
    if (req.user) {
      studentProfile = await dbStore.getProfile(req.user.id);
    }

    const items = opportunities.map(opp => ({
      ...opp,
      matchExplanation: computeMatchExplanation(opp, studentProfile)
    }));

    return sendSuccess(res, {
      total: items.length,
      items
    });
  } catch (err) {
    next(err);
  }
};

const getOpportunityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const opportunity = await dbStore.getOpportunityById(id);

    if (!opportunity) {
      return sendError(res, 'Opportunity not found', 404, 'NOT_FOUND');
    }

    let matchExplanation = null;
    if (req.user) {
      const studentProfile = await dbStore.getProfile(req.user.id);
      matchExplanation = computeMatchExplanation(opportunity, studentProfile);
    }

    return sendSuccess(res, {
      ...opportunity,
      matchExplanation
    });
  } catch (err) {
    next(err);
  }
};

const createOpportunity = async (req, res, next) => {
  try {
    const {
      title,
      organization,
      category,
      description,
      sourceUrl,
      applicationUrl,
      deadline,
      location,
      isRemote,
      requirements,
      skillsRequired,
      fundingCompensation
    } = req.body;

    if (!title || !organization || !category) {
      return sendError(res, 'Title, organization, and category are required', 400, 'VALIDATION_ERROR');
    }

    const newOpp = await dbStore.createOpportunity({
      title,
      organization,
      category,
      description,
      sourceUrl,
      applicationUrl,
      deadline,
      location,
      isRemote,
      requirements,
      skillsRequired,
      fundingCompensation,
      sourceType: 'manual'
    });

    return sendSuccess(res, newOpp, 201);
  } catch (err) {
    next(err);
  }
};

const captureUrl = async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url) {
      return sendError(res, 'URL is required for opportunity capture', 400, 'VALIDATION_ERROR');
    }

    const result = await scraperService.extractOpportunityFromUrl(url);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listOpportunities,
  getOpportunityById,
  createOpportunity,
  captureUrl
};
