const { getPlan } = require('../config/entitlements');
const { sendError } = require('../utils/response');

const requireFeature = (featureName) => {
  return (req, res, next) => {
    const userPlan = req.user?.plan_type || 'free';
    const plan = getPlan(userPlan);
    
    if (!plan.features.includes(featureName)) {
      return sendError(
        res, 
        `Access denied. The feature '${featureName}' requires a plan upgrade.`, 
        403, 
        'UPGRADE_REQUIRED'
      );
    }
    next();
  };
};

const checkAiUsageLimit = async (req, res, next) => {
  const dbStore = require('../data/dbStore');
  const userPlan = req.user?.plan_type || 'free';
  const plan = getPlan(userPlan);
  
  const usage = await dbStore.getUserPlanAndUsage(req.user.id);
  if (usage.ai_usage_count >= plan.limits.ai_usage) {
    return sendError(
      res,
      `AI usage limit reached for ${plan.id} plan. Please upgrade to continue.`,
      403,
      'LIMIT_REACHED'
    );
  }
  
  // Attach current usage and plan limits to request so controllers can increment
  req.aiUsage = usage.ai_usage_count;
  req.aiLimit = plan.limits.ai_usage;
  next();
};

module.exports = {
  requireFeature,
  checkAiUsageLimit
};
