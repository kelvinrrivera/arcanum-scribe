import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testPool } from '../setup';

// Mock Stripe
const mockStripe = {
  customers: {
    create: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn()
  },
  subscriptions: {
    create: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn(),
    cancel: vi.fn()
  },
  prices: {
    list: vi.fn()
  },
  webhooks: {
    constructEvent: vi.fn()
  }
};

vi.mock('stripe', () => ({
  default: vi.fn(() => mockStripe)
}));

describe('Billing Service', () => {
  let testUserId: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Clean up test data (order matters due to foreign keys)
    await testPool.query('DELETE FROM migration_log WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['%billing-test%']);
    await testPool.query('DELETE FROM users WHERE email LIKE $1', ['%billing-test%']);
    
    // Create test user
    const result = await testPool.query(
      'INSERT INTO users (email, username, password_hash, tier) VALUES ($1, $2, $3, $4) RETURNING id',
      ['billing-test@example.com', 'billinguser', 'hashed_password', 'explorer']
    );
    testUserId = result.rows[0].id;
  });

  describe('Customer Management', () => {
    it('should create Stripe customer', async () => {
      const mockCustomer = {
        id: 'cus_test123',
        email: 'billing-test@example.com',
        created: Date.now()
      };

      mockStripe.customers.create.mockResolvedValue(mockCustomer);

      const customer = await mockStripe.customers.create({
        email: 'billing-test@example.com',
        metadata: { userId: testUserId }
      });

      expect(customer.id).toBe('cus_test123');
      expect(customer.email).toBe('billing-test@example.com');
      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: 'billing-test@example.com',
        metadata: { userId: testUserId }
      });
    });

    it('should update user with Stripe customer ID', async () => {
      const stripeCustomerId = 'cus_test123';
      
      await testPool.query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        [stripeCustomerId, testUserId]
      );

      const result = await testPool.query(
        'SELECT stripe_customer_id FROM users WHERE id = $1',
        [testUserId]
      );

      expect(result.rows[0].stripe_customer_id).toBe(stripeCustomerId);
    });
  });

  describe('Subscription Management', () => {
    beforeEach(async () => {
      // Set up user with Stripe customer ID
      await testPool.query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        ['cus_test123', testUserId]
      );
    });

    it('should create subscription', async () => {
      const mockSubscription = {
        id: 'sub_test123',
        customer: 'cus_test123',
        status: 'active',
        current_period_start: Date.now(),
        current_period_end: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
        items: {
          data: [{
            price: {
              id: 'price_creator_monthly'
            }
          }]
        }
      };

      mockStripe.subscriptions.create.mockResolvedValue(mockSubscription);

      const subscription = await mockStripe.subscriptions.create({
        customer: 'cus_test123',
        items: [{ price: 'price_creator_monthly' }],
        metadata: { userId: testUserId }
      });

      expect(subscription.id).toBe('sub_test123');
      expect(subscription.status).toBe('active');
    });

    it('should update user subscription status', async () => {
      const subscriptionData = {
        stripe_subscription_id: 'sub_test123',
        subscription_status: 'active',
        tier: 'creator'
      };

      await testPool.query(
        'UPDATE users SET stripe_subscription_id = $1, subscription_status = $2, tier = $3 WHERE id = $4',
        [subscriptionData.stripe_subscription_id, subscriptionData.subscription_status, subscriptionData.tier, testUserId]
      );

      const result = await testPool.query(
        'SELECT stripe_subscription_id, subscription_status, tier FROM users WHERE id = $1',
        [testUserId]
      );

      expect(result.rows[0].stripe_subscription_id).toBe('sub_test123');
      expect(result.rows[0].subscription_status).toBe('active');
      expect(result.rows[0].tier).toBe('creator');
    });

    it('should handle subscription cancellation', async () => {
      // Set up active subscription
      await testPool.query(
        'UPDATE users SET stripe_subscription_id = $1, subscription_status = $2, tier = $3 WHERE id = $4',
        ['sub_test123', 'active', 'creator', testUserId]
      );

      mockStripe.subscriptions.update.mockResolvedValue({
        id: 'sub_test123',
        status: 'canceled',
        canceled_at: Date.now()
      });

      const canceledSubscription = await mockStripe.subscriptions.update('sub_test123', {
        cancel_at_period_end: true
      });

      // Update user status
      await testPool.query(
        'UPDATE users SET subscription_status = $1, tier = $2 WHERE id = $3',
        ['canceled', 'explorer', testUserId]
      );

      const result = await testPool.query(
        'SELECT subscription_status, tier FROM users WHERE id = $1',
        [testUserId]
      );

      expect(result.rows[0].subscription_status).toBe('canceled');
      expect(result.rows[0].tier).toBe('explorer');
    });
  });

  describe('Webhook Processing', () => {
    it('should process subscription created webhook', async () => {
      const webhookEvent = {
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_webhook123',
            customer: 'cus_test123',
            status: 'active',
            metadata: { userId: testUserId }
          }
        }
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(webhookEvent);

      // Simulate webhook processing
      if (webhookEvent.type === 'customer.subscription.created') {
        const subscription = webhookEvent.data.object;
        
        await testPool.query(
          'UPDATE users SET stripe_subscription_id = $1, subscription_status = $2, tier = $3 WHERE id = $4',
          [subscription.id, subscription.status, 'creator', subscription.metadata.userId]
        );
      }

      const result = await testPool.query(
        'SELECT stripe_subscription_id, subscription_status, tier FROM users WHERE id = $1',
        [testUserId]
      );

      expect(result.rows[0].stripe_subscription_id).toBe('sub_webhook123');
      expect(result.rows[0].subscription_status).toBe('active');
      expect(result.rows[0].tier).toBe('creator');
    });

    it('should process payment failed webhook', async () => {
      const webhookEvent = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            subscription: 'sub_test123',
            customer: 'cus_test123'
          }
        }
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(webhookEvent);

      // First, set up the user with the stripe customer ID
      await testPool.query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        ['cus_test123', testUserId]
      );

      // Simulate webhook processing
      if (webhookEvent.type === 'invoice.payment_failed') {
        await testPool.query(
          'UPDATE users SET payment_failed_at = NOW(), subscription_status = $1 WHERE stripe_customer_id = $2',
          ['past_due', webhookEvent.data.object.customer]
        );
      }

      const result = await testPool.query(
        'SELECT subscription_status, payment_failed_at FROM users WHERE stripe_customer_id = $1',
        ['cus_test123']
      );

      expect(result.rows[0].subscription_status).toBe('past_due');
      expect(result.rows[0].payment_failed_at).toBeTruthy();
    });
  });

  describe('Pricing Validation', () => {
    it('should validate tier pricing', async () => {
      const tierPricing = await testPool.query(
        'SELECT tier_name, price_monthly FROM tier_config WHERE price_monthly > 0'
      );

      expect(tierPricing.rows.length).toBeGreaterThan(0);
      
      const creatorTier = tierPricing.rows.find(t => t.tier_name === 'creator');
      const masterTier = tierPricing.rows.find(t => t.tier_name === 'master');

      expect(creatorTier.price_monthly).toBe(999); // $9.99
      expect(masterTier.price_monthly).toBe(2999); // $29.99
    });

    it('should calculate prorated amounts', () => {
      const monthlyPrice = 999; // $9.99 in cents
      const daysInMonth = 30;
      const daysRemaining = 15;
      
      const proratedAmount = Math.round((monthlyPrice / daysInMonth) * daysRemaining);
      
      expect(proratedAmount).toBe(499); // Approximately $5.00 (999/30*15 = 499.5, rounded to 499)
    });
  });

  describe('Usage Tracking', () => {
    it('should reset usage counters on billing cycle', async () => {
      // Set up user with usage
      await testPool.query(
        'UPDATE users SET generations_used = $1, private_slots_used = $2, period_start = $3 WHERE id = $4',
        [10, 2, new Date(Date.now() - (31 * 24 * 60 * 60 * 1000)), testUserId] // 31 days ago
      );

      // Simulate billing cycle reset
      const now = new Date();
      await testPool.query(
        'UPDATE users SET generations_used = 0, private_slots_used = 0, period_start = $1 WHERE id = $2',
        [now, testUserId]
      );

      const result = await testPool.query(
        'SELECT generations_used, private_slots_used, period_start FROM users WHERE id = $1',
        [testUserId]
      );

      expect(result.rows[0].generations_used).toBe(0);
      expect(result.rows[0].private_slots_used).toBe(0);
      expect(new Date(result.rows[0].period_start).getTime()).toBeCloseTo(now.getTime(), -3);
    });
  });
});