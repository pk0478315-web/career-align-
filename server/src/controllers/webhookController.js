const dbStore = require('../data/dbStore');
const { sendSuccess, sendError } = require('../utils/response');

const handlePaymentWebhook = async (req, res, next) => {
  try {
    // 1. Verify webhook signature
    // In production, we would use stripe.webhooks.constructEvent(req.rawBody, signature, secret)
    // Here we use a simpler secret check for modularity/mocking
    const signature = req.headers['x-payment-signature'];
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;

    if (!webhookSecret) {
      // Development mode behavior
      console.warn('PAYMENT_WEBHOOK_SECRET is not configured. Treating webhook as development mode.');
    } else if (signature !== webhookSecret) {
      return sendError(res, 'Invalid webhook signature', 400, 'INVALID_SIGNATURE');
    }

    const event = req.body;
    
    // Log billing event
    const userId = event.data?.metadata?.userId || event.data?.userId || null;
    if (userId) {
      await dbStore.logBillingEvent(userId, event.type, event);
    }

    // Handle subscription states
    switch (event.type) {
      case 'checkout.session.completed':
      case 'invoice.payment_succeeded':
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        if (!userId) break;
        const subData = {
          plan_id: event.data.plan_id || 'pro',
          status: event.data.status || 'active', // active, trialing, past_due
          provider_subscription_id: event.data.subscription_id || 'mock_sub_123',
          current_period_end: event.data.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: event.data.cancel_at_period_end || false
        };
        await dbStore.upsertSubscription(userId, subData);
        break;
      }
      
      case 'customer.subscription.deleted':
      case 'customer.subscription.expired': {
        if (!userId) break;
        await dbStore.upsertSubscription(userId, { status: 'expired' });
        break;
      }
      
      case 'customer.subscription.cancelled': {
        if (!userId) break;
        await dbStore.upsertSubscription(userId, { status: 'cancelled' });
        break;
      }
    }

    sendSuccess(res, { received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    sendError(res, 'Webhook processing failed', 500, 'WEBHOOK_ERROR');
  }
};

module.exports = {
  handlePaymentWebhook
};
