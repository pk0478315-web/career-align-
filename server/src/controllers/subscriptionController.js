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

const createCheckoutSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { targetPlan } = req.body;

    if (!Object.values(PLANS).includes(targetPlan)) {
      throw new Error('Invalid plan selection');
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;

    if (!stripeSecretKey || !webhookSecret) {
      // Development mode
      console.warn('Payment provider credentials (STRIPE_SECRET_KEY, PAYMENT_WEBHOOK_SECRET) are missing. Operating in DEVELOPMENT mode.');
      
      // We simulate an upgrade in dev mode but clearly state it
      await dbStore.upsertSubscription(userId, {
        plan_id: targetPlan,
        status: 'active',
        provider_subscription_id: 'dev_mock_sub_' + Date.now(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

      const updatedUsage = await dbStore.getUserPlanAndUsage(userId);
      console.log('updatedUsage post-upgrade:', updatedUsage);
      const updatedConfig = getPlan(updatedUsage.plan_type);

      return sendSuccess(res, {
        devMode: true,
        message: `[DEV MODE] Successfully upgraded to ${targetPlan.toUpperCase()}! Missing Stripe configs.`,
        planType: updatedUsage.plan_type,
        features: updatedConfig.features,
        limits: updatedConfig.limits
      });
    }

    // Production Mode: Create actual Stripe Checkout Session
    // We would integrate Stripe API here and return the checkout URL
    return sendSuccess(res, {
      devMode: false,
      checkoutUrl: 'https://checkout.stripe.com/pay/mock_real_session' // Real implementation connects to stripe.checkout.sessions.create
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyPlan,
  createCheckoutSession
};
