import Stripe from 'stripe';
import { Pool } from 'pg';

interface TierPricing {
  reader: { priceId: string; amount: 0 };
  creator: { priceId: string; amount: number };
  architect: { priceId: string; amount: number };
}

interface BillingConfig {
  stripeSecretKey: string;
  webhookSecret: string;
  pricing: TierPricing;
}

interface SubscriptionChange {
  userId: string;
  fromTier: string;
  toTier: string;
  prorationAmount?: number;
  effectiveDate: Date;
}

class BillingService {
  private stripe: Stripe;
  private pool: Pool;
  private config: BillingConfig;

  constructor(config: BillingConfig, pool: Pool) {
    this.stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
    this.pool = pool;
    this.config = config;
  }

  // Create or update customer subscription
  async createOrUpdateSubscription(
    userId: string,
    newTier: 'reader' | 'creator' | 'architect',
    paymentMethodId?: string
  ): Promise<{ subscriptionId: string; clientSecret?: string }> {
    const user = await this.getUser(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    let customerId = user.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.username,
        metadata: {
          userId: userId,
        },
      });
      
      customerId = customer.id;
      
      // Update user with customer ID
      await this.pool.query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        [customerId, userId]
      );
    }

    // Handle tier changes
    if (user.tier && user.tier !== newTier) {
      return await this.changeTier(userId, user.tier, newTier, paymentMethodId);
    }

    // Create new subscription
    return await this.createNewSubscription(customerId, newTier, paymentMethodId);
  }

  // Create new subscription
  private async createNewSubscription(
    customerId: string,
    tier: 'reader' | 'creator' | 'architect',
    paymentMethodId?: string
  ): Promise<{ subscriptionId: string; clientSecret?: string }> {
    
    if (tier === 'reader') {
      // Free tier - no subscription needed
      return { subscriptionId: 'free' };
    }

    const priceId = this.config.pricing[tier].priceId;

    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        tier: tier,
      },
    };

    if (paymentMethodId) {
      subscriptionParams.default_payment_method = paymentMethodId;
    }

    const subscription = await this.stripe.subscriptions.create(subscriptionParams);

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret || undefined,
    };
  }

  // Change user tier with prorated billing
  async changeTier(
    userId: string,
    fromTier: string,
    toTier: 'reader' | 'creator' | 'architect',
    paymentMethodId?: string
  ): Promise<{ subscriptionId: string; clientSecret?: string; prorationAmount?: number }> {
    
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    // Handle downgrade to free tier
    if (toTier === 'reader') {
      return await this.downgradeToFree(userId);
    }

    // Handle upgrade from free tier
    if (fromTier === 'reader') {
      return await this.createNewSubscription(user.stripe_customer_id, toTier, paymentMethodId);
    }

    // Handle tier change between paid tiers
    return await this.changePaidTier(userId, fromTier, toTier);
  }

  // Change between paid tiers
  private async changePaidTier(
    userId: string,
    fromTier: string,
    toTier: 'creator' | 'architect'
  ): Promise<{ subscriptionId: string; prorationAmount?: number }> {
    
    const user = await this.getUser(userId);
    if (!user?.stripe_subscription_id) {
      throw new Error('No active subscription found');
    }

    const subscription = await this.stripe.subscriptions.retrieve(user.stripe_subscription_id);
    const newPriceId = this.config.pricing[toTier].priceId;

    // Calculate proration
    const prorationAmount = await this.calculateProration(
      subscription,
      fromTier,
      toTier
    );

    // Update subscription
    const updatedSubscription = await this.stripe.subscriptions.update(
      subscription.id,
      {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId,
        }],
        proration_behavior: 'create_prorations',
        metadata: {
          tier: toTier,
          previousTier: fromTier,
        },
      }
    );

    // Update user tier in database
    await this.updateUserTier(userId, toTier);

    return {
      subscriptionId: updatedSubscription.id,
      prorationAmount,
    };
  }

  // Downgrade to free tier
  private async downgradeToFree(userId: string): Promise<{ subscriptionId: string }> {
    const user = await this.getUser(userId);
    
    if (user?.stripe_subscription_id) {
      // Cancel subscription at period end
      await this.stripe.subscriptions.update(user.stripe_subscription_id, {
        cancel_at_period_end: true,
        metadata: {
          downgradeTo: 'explorer',
        },
      });
    }

    // Update user tier immediately (they keep paid features until period end)
    await this.pool.query(`
      UPDATE users 
      SET 
        tier = 'reader',
        tier_change_effective_date = (
          SELECT period_end 
          FROM stripe_subscriptions 
          WHERE subscription_id = $1
        )
      WHERE id = $2
    `, [user?.stripe_subscription_id, userId]);

    return { subscriptionId: 'cancelled' };
  }

  // Calculate proration amount
  private async calculateProration(
    subscription: Stripe.Subscription,
    fromTier: string,
    toTier: string
  ): Promise<number> {
    
    const fromPrice = this.config.pricing[fromTier as keyof TierPricing]?.amount || 0;
    const toPrice = this.config.pricing[toTier as keyof TierPricing]?.amount || 0;
    
    const periodStart = subscription.current_period_start;
    const periodEnd = subscription.current_period_end;
    const now = Math.floor(Date.now() / 1000);
    
    const totalPeriod = periodEnd - periodStart;
    const remainingPeriod = periodEnd - now;
    const remainingRatio = remainingPeriod / totalPeriod;
    
    const priceDifference = toPrice - fromPrice;
    const prorationAmount = Math.round(priceDifference * remainingRatio);
    
    return prorationAmount;
  }

  // Handle failed payments
  async handleFailedPayment(subscriptionId: string): Promise<void> {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    const customerId = subscription.customer as string;
    
    // Get user from customer ID
    const userResult = await this.pool.query(
      'SELECT id, email, tier FROM users WHERE stripe_customer_id = $1',
      [customerId]
    );
    
    if (userResult.rows.length === 0) return;
    
    const user = userResult.rows[0];
    
    // Downgrade user to reader tier after grace period
    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3); // 3-day grace period
    
    await this.pool.query(`
      UPDATE users 
      SET 
        tier = 'reader',
        tier_change_effective_date = $1,
        payment_failed_at = NOW(),
        subscription_status = 'past_due'
      WHERE id = $2
    `, [gracePeriodEnd, user.id]);
    
    // Send payment failure notification
    await this.sendPaymentFailureNotification(user);
  }

  // Handle successful payment
  async handleSuccessfulPayment(subscriptionId: string): Promise<void> {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    const customerId = subscription.customer as string;
    const tier = subscription.metadata.tier;
    
    // Get user from customer ID
    const userResult = await this.pool.query(
      'SELECT id FROM users WHERE stripe_customer_id = $1',
      [customerId]
    );
    
    if (userResult.rows.length === 0) return;
    
    const user = userResult.rows[0];
    
    // Update user status
    await this.pool.query(`
      UPDATE users 
      SET 
        tier = $1,
        subscription_status = 'active',
        payment_failed_at = NULL,
        tier_change_effective_date = NULL,
        period_start = NOW()
      WHERE id = $2
    `, [tier, user.id]);
    
    // Reset usage counters for new billing period
    await this.resetUsageCounters(user.id);
  }

  // Reset usage counters
  private async resetUsageCounters(userId: string): Promise<void> {
    await this.pool.query(`
      UPDATE users 
      SET 
        generations_used = 0,
        private_slots_used = 0,
        period_start = NOW()
      WHERE id = $1
    `, [userId]);
  }

  // Get user billing information
  async getUserBillingInfo(userId: string): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    let subscriptionInfo = null;
    let paymentMethods = [];
    
    if (user.stripe_customer_id) {
      // Get subscription info
      if (user.stripe_subscription_id) {
        const subscription = await this.stripe.subscriptions.retrieve(user.stripe_subscription_id);
        subscriptionInfo = {
          id: subscription.id,
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        };
      }
      
      // Get payment methods
      const paymentMethodsResponse = await this.stripe.paymentMethods.list({
        customer: user.stripe_customer_id,
        type: 'card',
      });
      
      paymentMethods = paymentMethodsResponse.data.map(pm => ({
        id: pm.id,
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
      }));
    }
    
    return {
      tier: user.tier,
      subscriptionStatus: user.subscription_status,
      subscription: subscriptionInfo,
      paymentMethods,
      usageInfo: {
        generationsUsed: user.generations_used,
        privateSlots: user.private_slots_used,
        periodStart: user.period_start,
      },
    };
  }

  // Create billing portal session
  async createBillingPortalSession(userId: string, returnUrl: string): Promise<string> {
    const user = await this.getUser(userId);
    if (!user?.stripe_customer_id) {
      throw new Error('No billing information found');
    }
    
    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: returnUrl,
    });
    
    return session.url;
  }

  // Webhook handler
  async handleWebhook(body: string, signature: string): Promise<void> {
    const event = this.stripe.webhooks.constructEvent(
      body,
      signature,
      this.config.webhookSecret
    );
    
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await this.handleSuccessfulPayment(event.data.object.subscription as string);
        break;
        
      case 'invoice.payment_failed':
        await this.handleFailedPayment(event.data.object.subscription as string);
        break;
        
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCancelled(event.data.object.id);
        break;
        
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  // Handle subscription cancellation
  private async handleSubscriptionCancelled(subscriptionId: string): Promise<void> {
    await this.pool.query(`
      UPDATE users 
      SET 
        tier = 'explorer',
        subscription_status = 'cancelled',
        stripe_subscription_id = NULL
      WHERE stripe_subscription_id = $1
    `, [subscriptionId]);
  }

  // Handle subscription updates
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const tier = subscription.metadata.tier;
    const customerId = subscription.customer as string;
    
    await this.pool.query(`
      UPDATE users 
      SET 
        tier = $1,
        subscription_status = $2
      WHERE stripe_customer_id = $3
    `, [tier, subscription.status, customerId]);
  }

  // Update user tier
  private async updateUserTier(userId: string, tier: string): Promise<void> {
    await this.pool.query(`
      UPDATE users 
      SET 
        tier = $1,
        generations_used = 0,
        private_slots_used = 0,
        period_start = NOW()
      WHERE id = $2
    `, [tier, userId]);
  }

  // Get user information
  private async getUser(userId: string): Promise<any> {
    const result = await this.pool.query(`
      SELECT 
        id, email, username, tier, 
        stripe_customer_id, stripe_subscription_id,
        subscription_status, generations_used,
        private_slots_used, period_start
      FROM users 
      WHERE id = $1
    `, [userId]);
    
    return result.rows[0];
  }

  // Send payment failure notification
  private async sendPaymentFailureNotification(user: any): Promise<void> {
    // TODO: Integrate with email service
    console.log(`Payment failed for user ${user.email} - sending notification`);
  }
}

export default BillingService;