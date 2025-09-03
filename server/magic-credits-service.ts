import { Pool } from 'pg';

export interface TierConfig {
  name: 'reader' | 'creator' | 'architect' | 'admin';
  displayName: string;
  priceMonthly: number;
  magicCreditsPerMonth: number;
  downloadLimit: number; // -1 for unlimited
  privateCreations: boolean;
  priorityQueue: boolean;
  advancedFeatures: boolean;
  watermarkFree: boolean;
  additionalCreditPrice: number; // Price for 5 additional credits
}

export interface CreditCosts {
  fullAdventure: number;
  individualMonster: number;
  individualNPC: number;
  magicItem: number;
  puzzle: number;
  regenerateSection: number;
}

export interface UserCredits {
  magicCredits: number;
  creditsUsed: number;
  creditsRemaining: number;
  downloadLimit: number;
  downloadsUsed: number;
  downloadsRemaining: number;
  periodStart: Date;
  canCreatePrivate: boolean;
  hasPriorityQueue: boolean;
  hasAdvancedFeatures: boolean;
}

export interface UserTierInfo {
  userId: string;
  tier: TierConfig;
  credits: UserCredits;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export class MagicCreditsService {
  private pool: Pool;
  private tierConfigs: Map<string, TierConfig> = new Map();
  private creditCosts: CreditCosts;

  constructor(pool: Pool) {
    this.pool = pool;
    this.creditCosts = {
      fullAdventure: 3,
      individualMonster: 1,
      individualNPC: 1,
      magicItem: 1,
      puzzle: 1,
      regenerateSection: 1,
    };
    this.initializeTierConfigs();
  }

  private initializeTierConfigs(): void {
    const configs: TierConfig[] = [
      {
        name: 'reader',
        displayName: 'The Reader',
        priceMonthly: 0,
        magicCreditsPerMonth: 0,
        downloadLimit: 3,
        privateCreations: false,
        priorityQueue: false,
        advancedFeatures: false,
        watermarkFree: false,
        additionalCreditPrice: 0,
      },
      {
        name: 'creator',
        displayName: 'The Creator',
        priceMonthly: 12,
        magicCreditsPerMonth: 10,
        downloadLimit: -1, // unlimited
        privateCreations: false, // public by default
        priorityQueue: false,
        advancedFeatures: false,
        watermarkFree: true,
        additionalCreditPrice: 7, // 5 credits for €7
      },
      {
        name: 'architect',
        displayName: 'The Architect',
        priceMonthly: 29,
        magicCreditsPerMonth: 30,
        downloadLimit: -1, // unlimited
        privateCreations: true, // private by default
        priorityQueue: true,
        advancedFeatures: true,
        watermarkFree: true,
        additionalCreditPrice: 7, // 5 credits for €7
      },
      {
        name: 'admin',
        displayName: 'Administrator',
        priceMonthly: 0,
        magicCreditsPerMonth: 1000, // Unlimited for testing
        downloadLimit: -1, // unlimited
        privateCreations: true,
        priorityQueue: true,
        advancedFeatures: true,
        watermarkFree: true,
        additionalCreditPrice: 0,
      },
    ];

    configs.forEach(config => {
      this.tierConfigs.set(config.name, config);
    });
  }

  getTierConfig(tierName: string): TierConfig | null {
    return this.tierConfigs.get(tierName) || null;
  }

  getAllTierConfigs(): TierConfig[] {
    return Array.from(this.tierConfigs.values());
  }

  getCreditCosts(): CreditCosts {
    return { ...this.creditCosts };
  }

  // Get user's current tier and credit information
  async getUserTierInfo(userId: string): Promise<UserTierInfo | null> {
    try {
      console.log(`[MAGIC-CREDITS] Getting tier info for user: ${userId}`);
      
      const result = await this.pool.query(`
        SELECT 
          u.id,
          u.email,
          COALESCE(u.subscription_tier, u.tier, 'reader') as tier,
          u.magic_credits,
          u.credits_used,
          u.downloads_used,
          u.period_start,
          u.stripe_customer_id,
          u.stripe_subscription_id
        FROM users u
        WHERE u.id = $1
      `, [userId]);

      console.log(`[MAGIC-CREDITS] Query returned ${result.rows.length} rows`);
      
      if (result.rows.length === 0) {
        console.log(`[MAGIC-CREDITS] No user found with ID: ${userId}`);
        return null;
      }

      const user = result.rows[0];
      console.log(`[MAGIC-CREDITS] User found: ${user.email}, tier: ${user.tier}`);
      
      const tierConfig = this.getTierConfig(user.tier);
      
      if (!tierConfig) {
        console.error(`[MAGIC-CREDITS] Invalid tier for user ${userId}: ${user.tier}`);
        console.log(`[MAGIC-CREDITS] Available tiers: ${Array.from(this.tierConfigs.keys()).join(', ')}`);
        return null;
      }
      
      console.log(`[MAGIC-CREDITS] Tier config found: ${tierConfig.displayName}`);

      // Check if usage period needs reset
      const periodStart = new Date(user.period_start);
      const now = new Date();
      const daysSincePeriodStart = (now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24);

      let creditsUsed = user.credits_used;
      let downloadsUsed = user.downloads_used;

      // Reset monthly usage if period has passed (30 days)
      if (daysSincePeriodStart >= 30) {
        await this.resetUserUsage(userId);
        creditsUsed = 0;
        downloadsUsed = 0;
      }

      // Calculate total available credits: tier credits + additional purchased credits
      const totalAvailableCredits = user.magic_credits;
      
      const credits: UserCredits = {
        magicCredits: totalAvailableCredits,
        creditsUsed,
        creditsRemaining: Math.max(0, totalAvailableCredits - creditsUsed),
        downloadLimit: tierConfig.downloadLimit,
        downloadsUsed,
        downloadsRemaining: tierConfig.downloadLimit === -1 ? -1 : Math.max(0, tierConfig.downloadLimit - downloadsUsed),
        periodStart,
        canCreatePrivate: tierConfig.privateCreations,
        hasPriorityQueue: tierConfig.priorityQueue,
        hasAdvancedFeatures: tierConfig.advancedFeatures,
      };

      return {
        userId,
        tier: tierConfig,
        credits,
        stripeCustomerId: user.stripe_customer_id,
        stripeSubscriptionId: user.stripe_subscription_id,
      };
    } catch (error) {
      console.error('Error getting user tier info:', error);
      return null;
    }
  }

  // Check if user can perform an action that costs credits
  async canUserAffordAction(userId: string, actionType: keyof CreditCosts): Promise<boolean> {
    const tierInfo = await this.getUserTierInfo(userId);
    if (!tierInfo) {
      console.log(`[MAGIC-CREDITS] canUserAffordAction: No tier info for user ${userId}`);
      return false;
    }

    const cost = this.creditCosts[actionType];
    const canAfford = tierInfo.credits.creditsRemaining >= cost;
    
    console.log(`[MAGIC-CREDITS] canUserAffordAction: User ${userId}, Action: ${actionType}, Cost: ${cost}, Remaining: ${tierInfo.credits.creditsRemaining}, Can afford: ${canAfford}`);
    
    return canAfford;
  }

  // Check if user can download (for Reader tier)
  async canUserDownload(userId: string): Promise<boolean> {
    const tierInfo = await this.getUserTierInfo(userId);
    if (!tierInfo) return false;

    // Unlimited downloads for paid tiers
    if (tierInfo.tier.downloadLimit === -1) return true;

    // Check download limit for Reader tier
    return tierInfo.credits.downloadsRemaining > 0;
  }

  // Consume credits for an action
  async consumeCredits(userId: string, actionType: keyof CreditCosts, metadata?: any): Promise<boolean> {
    try {
      const canAfford = await this.canUserAffordAction(userId, actionType);
      if (!canAfford) return false;

      const cost = this.creditCosts[actionType];

      await this.pool.query(`
        UPDATE users 
        SET credits_used = credits_used + $1
        WHERE id = $2
      `, [cost, userId]);

      // Log the credit transaction
      await this.logCreditTransaction(userId, actionType, cost, metadata);

      console.log(`Credits consumed: User ${userId}, Action: ${actionType}, Cost: ${cost}`);
      return true;
    } catch (error) {
      console.error('Error consuming credits:', error);
      return false;
    }
  }

  // Consume download for Reader tier
  async consumeDownload(userId: string, adventureId: string): Promise<boolean> {
    try {
      const canDownload = await this.canUserDownload(userId);
      if (!canDownload) return false;

      const tierInfo = await this.getUserTierInfo(userId);
      if (!tierInfo) return false;

      // Only track downloads for Reader tier
      if (tierInfo.tier.downloadLimit !== -1) {
        await this.pool.query(`
          UPDATE users 
          SET downloads_used = downloads_used + 1
          WHERE id = $1
        `, [userId]);

        // Log the download
        await this.logDownload(userId, adventureId);
      }

      console.log(`Download consumed: User ${userId}, Adventure: ${adventureId}`);
      return true;
    } catch (error) {
      console.error('Error consuming download:', error);
      return false;
    }
  }

  // Add credits to user (for purchases or admin actions)
  async addCredits(userId: string, amount: number, reason: string): Promise<boolean> {
    try {
      await this.pool.query(`
        UPDATE users 
        SET magic_credits = magic_credits + $1
        WHERE id = $2
      `, [amount, userId]);

      // Log the credit addition
      await this.pool.query(`
        INSERT INTO credit_transactions (
          user_id, transaction_type, amount, reason, created_at
        ) VALUES ($1, 'credit_purchase', $2, $3, NOW())
      `, [userId, amount, reason]);

      console.log(`Credits added: User ${userId}, Amount: ${amount}, Reason: ${reason}`);
      return true;
    } catch (error) {
      console.error('Error adding credits:', error);
      return false;
    }
  }

  // Update user tier and reset credits
  async updateUserTier(userId: string, newTierName: string, stripeSubscriptionId?: string): Promise<boolean> {
    try {
      const newTier = this.getTierConfig(newTierName);
      if (!newTier) {
        console.error(`Invalid tier name: ${newTierName}`);
        return false;
      }

      const client = await this.pool.connect();
      
      try {
        await client.query('BEGIN');

        // Get current tier and credits for history
        const currentResult = await client.query(`
          SELECT tier, magic_credits FROM users WHERE id = $1
        `, [userId]);

        const previousTier = currentResult.rows[0]?.tier;
        const currentCredits = currentResult.rows[0]?.magic_credits || 0;

        // Calculate new credits: preserve additional credits beyond the previous tier's monthly allowance
        const previousTierConfig = this.getTierConfig(previousTier);
        const previousTierCredits = previousTierConfig?.magicCreditsPerMonth || 0;
        const additionalCredits = Math.max(0, currentCredits - previousTierCredits);
        const newTotalCredits = newTier.magicCreditsPerMonth + additionalCredits;

        // Update user tier and reset usage, preserving additional credits
        await client.query(`
          UPDATE users 
          SET 
            tier = $1,
            magic_credits = $2,
            credits_used = 0,
            downloads_used = 0,
            period_start = NOW(),
            stripe_subscription_id = COALESCE($3, stripe_subscription_id),
            updated_at = NOW()
          WHERE id = $4
        `, [newTierName, newTotalCredits, stripeSubscriptionId, userId]);

        // Record tier change in history
        await client.query(`
          INSERT INTO tier_changes (
            user_id, previous_tier, new_tier, change_reason, created_at
          ) VALUES ($1, $2, $3, 'subscription_change', NOW())
        `, [userId, previousTier, newTierName]);

        await client.query('COMMIT');
        console.log(`User ${userId} tier updated to ${newTierName}`);
        return true;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating user tier:', error);
      return false;
    }
  }

  // Reset user's monthly usage
  async resetUserUsage(userId: string): Promise<boolean> {
    try {
      const tierInfo = await this.getUserTierInfo(userId);
      if (!tierInfo) return false;

      await this.pool.query(`
        UPDATE users 
        SET 
          credits_used = 0,
          downloads_used = 0,
          period_start = NOW()
        WHERE id = $1
      `, [userId]);

      console.log(`Usage reset for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error resetting user usage:', error);
      return false;
    }
  }

  // Get upgrade suggestions based on current limitations
  getUpgradePrompt(currentTier: string, limitType: 'credits' | 'downloads' | 'privacy'): any {
    const current = this.getTierConfig(currentTier);
    if (!current) return null;

    const suggestions = [];

    if (currentTier === 'reader') {
      suggestions.push({
        tier: 'creator',
        title: 'Upgrade to The Creator',
        description: 'Forge your own legends and share them with the world',
        price: '€12/month',
        benefits: [
          '10 Magic Credits ✨ per month',
          'Generate full adventures and individual components',
          'Unlimited downloads',
          'Watermark-free exports',
          'Option to buy additional credits'
        ]
      });
    }

    if (currentTier === 'creator') {
      suggestions.push({
        tier: 'architect',
        title: 'Upgrade to The Architect',
        description: 'Design your worlds in secret with master tools',
        price: '€29/month',
        benefits: [
          '30 Magic Credits ✨ per month',
          'Private creations by default',
          'Access to Adventure Forge (node builder)',
          'Advanced stat blocks for multiple systems',
          'Priority generation queue',
          'Professional PDF templates'
        ]
      });
    }

    const messages = {
      credits: 'You\'ve used all your Magic Credits ✨ for this month',
      downloads: 'You\'ve reached your download limit for this month',
      privacy: 'Private creations are available with The Architect tier'
    };

    return {
      currentTier: current,
      limitType,
      suggestions,
      message: messages[limitType],
      resetDate: this.getNextResetDate()
    };
  }

  private getNextResetDate(): Date {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return nextMonth;
  }

  // Log credit transactions
  private async logCreditTransaction(userId: string, actionType: string, cost: number, metadata?: any): Promise<void> {
    try {
      await this.pool.query(`
        INSERT INTO credit_transactions (
          user_id, transaction_type, action_type, amount, metadata, created_at
        ) VALUES ($1, 'credit_usage', $2, $3, $4, NOW())
      `, [userId, actionType, -cost, JSON.stringify(metadata || {})]);
    } catch (error) {
      console.error('Error logging credit transaction:', error);
    }
  }

  // Log downloads
  private async logDownload(userId: string, adventureId: string): Promise<void> {
    try {
      await this.pool.query(`
        INSERT INTO download_logs (
          user_id, adventure_id, created_at
        ) VALUES ($1, $2, NOW())
      `, [userId, adventureId]);
    } catch (error) {
      console.error('Error logging download:', error);
    }
  }

  // Get user's credit history
  async getCreditHistory(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const result = await this.pool.query(`
        SELECT 
          transaction_type,
          action_type,
          amount,
          reason,
          metadata,
          created_at
        FROM credit_transactions
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [userId, limit]);

      return result.rows;
    } catch (error) {
      console.error('Error getting credit history:', error);
      return [];
    }
  }

  // Admin function: Reset all users' monthly usage
  async resetAllMonthlyUsage(): Promise<void> {
    try {
      const result = await this.pool.query(`
        UPDATE users 
        SET 
          credits_used = 0,
          downloads_used = 0,
          period_start = NOW()
        WHERE period_start < NOW() - INTERVAL '30 days'
        RETURNING id, tier
      `);

      console.log(`Monthly usage reset for ${result.rows.length} users`);
    } catch (error) {
      console.error('Error resetting monthly usage:', error);
    }
  }

  // Get system-wide credit usage statistics
  async getCreditUsageStats(): Promise<any> {
    try {
      const result = await this.pool.query(`
        SELECT 
          u.tier,
          COUNT(*) as user_count,
          AVG(u.credits_used) as avg_credits_used,
          SUM(u.credits_used) as total_credits_used,
          AVG(u.downloads_used) as avg_downloads_used
        FROM users u
        WHERE u.period_start > NOW() - INTERVAL '30 days'
        GROUP BY u.tier
      `);

      const actionStats = await this.pool.query(`
        SELECT 
          action_type,
          COUNT(*) as usage_count,
          SUM(ABS(amount)) as total_credits
        FROM credit_transactions
        WHERE transaction_type = 'credit_usage'
        AND created_at > NOW() - INTERVAL '30 days'
        GROUP BY action_type
        ORDER BY total_credits DESC
      `);

      return {
        tierStats: result.rows,
        actionStats: actionStats.rows
      };
    } catch (error) {
      console.error('Error getting credit usage stats:', error);
      return { tierStats: [], actionStats: [] };
    }
  }
}

export default MagicCreditsService;