const dbStore = require('../data/dbStore');

/**
 * Normalizes strings by trimming, converting to lowercase, and removing common suffixes
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // remove multiple spaces
    .replace(/[.,]/g, '') // remove punctuation for matching
    .replace(/\b(inc|llc|corp|corporation|ltd|company|co)\b/gi, '') // remove common org suffixes
    .trim();
};

/**
 * Validates and safely parses URLs
 */
const validateUrl = (urlStr) => {
  if (!urlStr || typeof urlStr !== 'string') return null;
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null;
  } catch (e) {
    return null; // Invalid URL
  }
};

/**
 * Checks if a deadline is expired
 */
const checkFreshness = (deadlineStr) => {
  if (!deadlineStr) return 'unknown';
  const deadline = new Date(deadlineStr);
  if (isNaN(deadline.getTime())) return 'unknown';
  
  const now = new Date();
  if (deadline < now) {
    return 'expired';
  }
  return 'active';
};

/**
 * Process a raw opportunity through the pipeline
 */
const processOpportunity = async (rawOpp) => {
  // 1. INGESTION & EXTRACTION (Ensuring fields exist)
  const opp = { ...rawOpp };

  // 2. NORMALIZATION
  const normalizedTitle = normalizeText(opp.title);
  const normalizedOrg = normalizeText(opp.organization);
  
  // Extract Source Name from URL if not provided
  let sourceName = opp.sourceName || 'Unknown Source';
  const safeSourceUrl = validateUrl(opp.sourceUrl) || null;
  const safeAppUrl = validateUrl(opp.applicationUrl) || safeSourceUrl;
  
  if (!opp.sourceName && safeSourceUrl) {
    try {
      sourceName = new URL(safeSourceUrl).hostname.replace('www.', '');
    } catch(e) {}
  }

  // 3. VALIDATION & MISSING DATA HANDLING
  // Do not fabricate. If unavailable, mark unknown/unverified
  const validatedOpp = {
    title: opp.title ? opp.title.trim() : 'Unknown Title',
    organization: opp.organization ? opp.organization.trim() : 'Unknown Organization',
    description: opp.description ? opp.description.trim() : 'No description available.',
    category: opp.category ? opp.category.toLowerCase().trim() : 'other',
    skills_required: Array.isArray(opp.skillsRequired) ? opp.skillsRequired : [],
    requirements: Array.isArray(opp.requirements) ? opp.requirements : [],
    eligibility: Array.isArray(opp.eligibility) ? opp.eligibility : [],
    education_requirements: Array.isArray(opp.educationRequirements) ? opp.educationRequirements : [],
    experience_requirements: Array.isArray(opp.experienceRequirements) ? opp.experienceRequirements : [],
    location: opp.location ? opp.location.trim() : (opp.isRemote ? 'Remote' : 'Location Not Specified'),
    is_remote: opp.isRemote !== undefined ? Boolean(opp.isRemote) : null,
    deadline: opp.deadline && !isNaN(new Date(opp.deadline).getTime()) ? new Date(opp.deadline).toISOString() : null,
    application_url: safeAppUrl,
    source_url: safeSourceUrl,
    source_name: sourceName,
    source_type: opp.sourceType || 'manual',
    posted_date: opp.postedDate && !isNaN(new Date(opp.postedDate).getTime()) ? new Date(opp.postedDate).toISOString() : null,
    last_verified_date: new Date().toISOString(),
    funding_compensation: opp.fundingCompensation || 'Not specified',
    extraction_status: opp.extractionStatus || 'verified',
    verification_status: opp.verificationStatus || 'unverified'
  };

  // 4. FRESHNESS CHECK
  validatedOpp.freshness_status = checkFreshness(validatedOpp.deadline);

  // 5. DEDUPLICATION
  // Look for exact URL match or normalized title + org match
  // We'll query dbStore for potential duplicates.
  const existingOpps = await dbStore.getOpportunities({ search: '' }); 
  
  const isDuplicate = existingOpps.find(existing => {
    // Match by source URL if valid
    if (safeSourceUrl && existing.sourceUrl === safeSourceUrl) return true;
    
    // Match by normalized title and organization
    if (normalizeText(existing.title) === normalizedTitle && 
        normalizeText(existing.organization) === normalizedOrg) {
      return true;
    }
    return false;
  });

  if (isDuplicate) {
    // Handle duplicate: maybe update freshness or return existing
    return {
      status: 'duplicate',
      opportunity: isDuplicate
    };
  }

  // 6. DATABASE PERSISTENCE
  // Call dbStore to create the validated opportunity
  const newOpp = await dbStore.createOpportunity(validatedOpp);

  return {
    status: 'created',
    opportunity: newOpp
  };
};

module.exports = {
  processOpportunity,
  normalizeText,
  validateUrl,
  checkFreshness
};
