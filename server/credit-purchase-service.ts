import Stripe from 'stripe';
import { Pool } from 'pg';
import MagicCreditsService from './magic-credits-service';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number; // in cents
  stripeProductId: string;
  stripePriceId: string;
  description: string;
}

interface PurchaseResult {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  error?: string;
}

class CreditPurchaseService {
  private stripe: Stripe;
  private pool: Pool;
  private magicCreditsService: MagicCreditsService;
  private creditPackages: Map<string, CreditPackage> = new Map();

  constructor(stripeSecretKey: string, pool: Pool) {
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
    this.pool = pool;
    this.magicCreditsService = new MagicCreditsService(pool);
    this.initializeCreditPackages();
  }

  private initializeCreditPackages(): void {
    const packages: CreditPackage[] = [
      {
        id: 'credits_5',
        name: '5 Magic Credits',
        credits: 5,
        price: 700, // €7.00
        stripeProductId: 'prod_credits_5',
        stripePriceId: 'price_credits_5',
        description: 'Perfect for creating 1 full adventure + extras'
      },
      {
        id: 'credits_15',
        name: '15 Magic Credits',
        credits: 15,
        price: 1900, // €19.00 (10% discount)
        stripeProductId: 'prod_credits_15',
        stripePriceId: 'price_credits_15',
        description: 'Great value pack for multiple adventures'
      },
      {
        id: 'credits_30',
        name: '30 Magic Credits',
        credits: 30,
        price: 3500, // €35.00 (17% discount)
        stripeProductId: 'prod_credits_30',
        stripePriceId: 'price_credits_30',
        description: 'Best value for power users'
      }
    ];

    packages.forEach(pkg => {
      this.creditPackages.set(pkg.id, pkg);
    });
  }

  // Get available credit packages
  getAvailablePackages(): CreditPackage[] {
    return Array.from(this.creditPackages.values());
  }

  // Get specific credit package
  getCreditPackage(packageId: string): CreditPackage | null {
    return this.creditPackages.get(packageId) || null;
  }

  // Check if user can purchase credits (only Creator and Architect tiers)
  async canUserPurchaseCredits(userId: string): Promise<boolean> {
    const tierInfo = await this.magicCreditsService.getUserTierInfo(userId);
    if (!tierInfo) return false;

    // Only Creator and Architect tiers can purchase additional credits
    return tierInfo.tier.name === 'creator' || tierInfo.tier.name === 'architect';
  }

  // Create payment intent for credit purchase
  async createCreditPurchaseIntent(
    userId: string,
    packageId: string,
    paymentMethodId?: string
  ): Promise<PurchaseResult> {
    try {
      // Verify user can purchase credits
      const canPurchase = await this.canUserPurchaseCredits(userId);
      if (!canPurchase) {
        return {
          success: false,
          error: 'Credit purchases are only available for Creator and Architect tiers'
        };
      }

      // Get credit package
      const creditPackage = this.getCreditPackage(packageId);
      if (!creditPackage) {
        return {
          success: false,
          error: 'Invalid credit package'
        };
      }

      // Get user information
      const user = await this.getUser(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Ensure user has a Stripe customer
      let customerId = user.stripe_customer_id;
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

      // Create payment intent
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount: creditPackage.price,
        currency: 'eur',
        customer: customerId,
        description: `Purchase of ${creditPackage.name} for ${user.username}`,
        metadata: {
          userId: userId,
          packageId: packageId,
          credits: creditPackage.credits.toString(),
          type: 'credit_purchase'
        },
        automatic_payment_methods: {
          enabled: true,
        },
      };

      if (paymentMethodId) {
        paymentIntentParams.payment_method = paymentMethodId;
        paymentIntentParams.confirm = true;
      }

      const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentParams);

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || undefined
      };

    } catch (error) {
      console.error('Error creating credit purchase intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Handle successful credit purchase
  async handleSuccessfulPurchase(paymentIntentId: string): Promise<boolean> {
    try {
      // Get payment intent details
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        console.error('Payment intent not succeeded:', paymentIntent.status);
        return false;
      }

      const userId = paymentIntent.metadata.userId;
      const packageId = paymentIntent.metadata.packageId;
      const credits = parseInt(paymentIntent.metadata.credits);

      if (!userId || !packageId || !credits) {
        console.error('Missing metadata in payment intent:', paymentIntent.metadata);
        return false;
      }

      // Add credits to user account
      const success = await this.magicCreditsService.addCredits(
        userId,
        credits,
        `Purchased ${packageId} - Payment Intent: ${paymentIntentId}`
      );

      if (success) {
        // Log the purchase
        await this.logCreditPurchase(userId, packageId, credits, paymentIntent.amount, paymentIntentId);
        
        // Send confirmation email
        await this.sendPurchaseConfirmation(userId, packageId, credits);
        
        console.log(`Credit purchase completed: User ${userId}, Credits: ${credits}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error handling successful purchase:', error);
      return false;
    }
  }

  // Log credit purchase
  private async logCreditPurchase(
    userId: string,
    packageId: string,
    credits: number,
    amountPaid: number,
    paymentIntentId: string
  ): Promise<void> {
    try {
      await this.pool.query(`
        INSERT INTO credit_purchases (
          user_id,
          package_id,
          credits_purchased,
          amount_paid,
          stripe_payment_intent_id,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
      `, [userId, packageId, credits, amountPaid, paymentIntentId]);
    } catch (error) {
      console.error('Error logging credit purchase:', error);
    }
  }

  // Send purchase confirmation email
  private async sendPurchaseConfirmation(userId: string, packageId: string, credits: number): Promise<void> {
    try {
      const user = await this.getUser(userId);
      const creditPackage = this.getCreditPackage(packageId);
      
      if (!user || !creditPackage) return;

      const emailContent = this.generatePurchaseConfirmationEmail(user, creditPackage);
      
      console.log(`📧 Credit purchase confirmation for ${user.email}:`);
      console.log(emailContent);
      
      // TODO: Integrate with actual email service
      // await emailService.send({
      //   to: user.email,
      //   subject: 'Magic Credits Purchase Confirmed! ✨',
      //   html: emailContent
      // });
    } catch (error) {
      console.error('Error sending purchase confirmation:', error);
    }
  }

  // Generate purchase confirmation email
  private generatePurchaseConfirmationEmail(user: any, creditPackage: CreditPackage): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Magic Credits Purchase Confirmed! ✨</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8B5CF6;">✨ Magic Credits Purchase Confirmed!</h1>
        
        <p>Hi ${user.username},</p>
        
        <p>Thank you for your purchase! Your Magic Credits have been added to your account and are ready to use.</p>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <h2 style="margin-top: 0; color: white;">Purchase Details</h2>
          <div style="font-size: 24px; font-weight: bold; margin: 10px 0;">
            ${creditPackage.credits} Magic Credits ✨
          </div>
          <div style="font-size: 16px; opacity: 0.9;">
            ${creditPackage.name}
          </div>
          <div style="font-size: 14px; opacity: 0.8; margin-top: 10px;">
            €${(creditPackage.price / 100).toFixed(2)}
          </div>
        </div>
        
        <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
          <h3 style="color: #065F46; margin-top: 0;">What You Can Create:</h3>
          <ul style="color: #065F46; margin-bottom: 0;">
            <li><strong>${Math.floor(creditPackage.credits / 3)} Full Adventures</strong> (3 ✨ each)</li>
            <li><strong>${creditPackage.credits} Individual Components</strong> (NPCs, Monsters, Items, Puzzles - 1 ✨ each)</li>
            <li><strong>Mix and Match</strong> - Create exactly what you need!</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/generate" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Start Creating Now ✨
          </a>
        </div>
        
        <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #92400E; margin-top: 0;">💡 Pro Tips</h4>
          <ul style="color: #92400E; margin-bottom: 0;">
            <li>Credits never expire - use them whenever you need</li>
            <li>Plan your creations to maximize value</li>
            <li>Individual components are great for quick additions</li>
            <li>Full adventures include everything you need to run a session</li>
          </ul>
        </div>
        
        <p>Your credits have been added to your account and are ready to use immediately. You can check your current balance in the top navigation bar.</p>
        
        <p>Happy creating!<br>
        The Arcanum Scribe Team ✨</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="font-size: 12px; color: #9CA3AF;">
          Purchase Date: ${new Date().toLocaleDateString()}<br>
          Transaction ID: ${creditPackage.id}<br>
          If you have any questions, contact support@arcanumscribe.com
        </p>
      </body>
      </html>
    `;
  }

  // Create credit purchase tables
  async createCreditPurchaseTables(): Promise<void> {
    const createTablesSQL = `
      -- Credit purchases table
      CREATE TABLE IF NOT EXISTS credit_purchases (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        package_id VARCHAR(50) NOT NULL,
        credits_purchased INTEGER NOT NULL,
        amount_paid INTEGER NOT NULL, -- in cents
        stripe_payment_intent_id VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON credit_purchases(user_id);
      CREATE INDEX IF NOT EXISTS idx_credit_purchases_created_at ON credit_purchases(created_at);
      CREATE INDEX IF NOT EXISTS idx_credit_purchases_stripe_pi ON credit_purchases(stripe_payment_intent_id);
    `;

    await this.pool.query(createTablesSQL);
    console.log('✅ Credit purchase tables created');
  }

  // Get user's purchase history
  async getUserPurchaseHistory(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const result = await this.pool.query(`
        SELECT 
          cp.package_id,
          cp.credits_purchased,
          cp.amount_paid,
          cp.created_at
        FROM credit_purchases cp
        WHERE cp.user_id = $1
        ORDER BY cp.created_at DESC
        LIMIT $2
      `, [userId, limit]);

      return result.rows.map(row => ({
        packageId: row.package_id,
        creditsPurchased: row.credits_purchased,
        amountPaid: row.amount_paid,
        createdAt: row.created_at,
        packageName: this.getCreditPackage(row.package_id)?.name || 'Unknown Package'
      }));
    } catch (error) {
      console.error('Error getting purchase history:', error);
      return [];
    }
  }

  // Get purchase statistics
  async getPurchaseStats(): Promise<any> {
    try {
      const result = await this.pool.query(`
        SELECT 
          package_id,
          COUNT(*) as purchase_count,
          SUM(credits_purchased) as total_credits_sold,
          SUM(amount_paid) as total_revenue,
          AVG(amount_paid) as avg_purchase_amount
        FROM credit_purchases
        WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY package_id
        ORDER BY total_revenue DESC
      `);

      return result.rows.map(row => ({
        packageId: row.package_id,
        packageName: this.getCreditPackage(row.package_id)?.name || 'Unknown',
        purchaseCount: parseInt(row.purchase_count),
        totalCreditsSold: parseInt(row.total_credits_sold),
        totalRevenue: parseInt(row.total_revenue),
        avgPurchaseAmount: parseFloat(row.avg_purchase_amount)
      }));
    } catch (error) {
      console.error('Error getting purchase stats:', error);
      return [];
    }
  }

  // Get user information
  private async getUser(userId: string): Promise<any> {
    const result = await this.pool.query(`
      SELECT 
        id, email, username, tier, stripe_customer_id
      FROM users 
      WHERE id = $1
    `, [userId]);
    
    return result.rows[0];
  }
}

export default CreditPurchaseService;