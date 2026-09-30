const dbStore = require('../data/dbStore');
const { getPlan, PLANS } = require('../config/entitlements');
const { sendSuccess } = require('../utils/response');

const getMyPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const usage = await dbStore.getUserPlanAndUsage(userId);
    const planConfig = getPlan(usage.plan_type);

    return sendSuccess(res, {
      planType: usage.plan_type,
      features: planConfig.features,
      limits: planConfig.limits,
      usage: {
        ai_usage_count: usage.ai_usage_count
      }
    });
  } catch (err) {
    next(err);
  }
};

const upgradePlanTestOnly = async (req, res, next) => {
  try {
    // This is ONLY for testing/mocking upgrades in the app.
    // Real commercialization would use Stripe/Paddle webhooks
    const userId = req.user.id;
    const { targetPlan } = req.body;

    if (!Object.values(PLANS).includes(targetPlan)) {
      throw new Error('Invalid plan selection');
    }

    await dbStore.adminUpdateUserPlan(userId, targetPlan);

    const updatedUsage = await dbStore.getUserPlanAndUsage(userId);
    const updatedConfig = getPlan(updatedUsage.plan_type);

    return sendSuccess(res, {
      message: `Successfully upgraded to ${targetPlan.toUpperCase()}!`,
      planType: updatedUsage.plan_type,
      features: updatedConfig.features,
      limits: updatedConfig.limits
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyPlan,
  upgradePlanTestOnly
};
