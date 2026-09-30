const PLANS = {
  FREE: 'free',
  PRO: 'pro',
  INSTITUTION: 'institution'
};

const FEATURES = {
  BASIC_PROFILE: 'basic_profile',
  LIMITED_OPPORTUNITIES: 'limited_opportunities',
  BASIC_TRACKER: 'basic_tracker',
  ADVANCED_MATCHING: 'advanced_matching',
  RESUME_INTELLIGENCE: 'resume_intelligence',
  CAREER_ROADMAP: 'career_roadmap',
  SKILL_GAP_ANALYSIS: 'skill_gap_analysis',
  APPLICATION_INTELLIGENCE: 'application_intelligence',
  STUDENT_MANAGEMENT: 'student_management',
  INSTITUTION_DASHBOARD: 'institution_dashboard'
};

const PLAN_ENTITLEMENTS = {
  [PLANS.FREE]: {
    features: [
      FEATURES.BASIC_PROFILE,
      FEATURES.LIMITED_OPPORTUNITIES,
      FEATURES.BASIC_TRACKER
    ],
    limits: {
      ai_usage: 10, // 10 AI actions max
      tracked_opportunities: 5
    }
  },
  [PLANS.PRO]: {
    features: [
      FEATURES.BASIC_PROFILE,
      FEATURES.LIMITED_OPPORTUNITIES,
      FEATURES.BASIC_TRACKER,
      FEATURES.ADVANCED_MATCHING,
      FEATURES.RESUME_INTELLIGENCE,
      FEATURES.CAREER_ROADMAP,
      FEATURES.SKILL_GAP_ANALYSIS,
      FEATURES.APPLICATION_INTELLIGENCE
    ],
    limits: {
      ai_usage: 500,
      tracked_opportunities: 500
    }
  },
  [PLANS.INSTITUTION]: {
    features: [
      FEATURES.BASIC_PROFILE,
      FEATURES.LIMITED_OPPORTUNITIES,
      FEATURES.BASIC_TRACKER,
      FEATURES.ADVANCED_MATCHING,
      FEATURES.RESUME_INTELLIGENCE,
      FEATURES.CAREER_ROADMAP,
      FEATURES.SKILL_GAP_ANALYSIS,
      FEATURES.APPLICATION_INTELLIGENCE,
      FEATURES.STUDENT_MANAGEMENT,
      FEATURES.INSTITUTION_DASHBOARD
    ],
    limits: {
      ai_usage: 5000,
      tracked_opportunities: 5000
    }
  }
};

const getPlan = (planName) => {
  const plan = PLAN_ENTITLEMENTS[planName?.toLowerCase()] || PLAN_ENTITLEMENTS[PLANS.FREE];
  return {
    id: planName?.toLowerCase() || PLANS.FREE,
    ...plan
  };
};

module.exports = {
  PLANS,
  FEATURES,
  PLAN_ENTITLEMENTS,
  getPlan
};
