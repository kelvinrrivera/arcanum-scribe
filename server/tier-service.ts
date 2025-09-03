import { query, transaction } from '../src/integrations/postgres/client';
import { cacheService, CacheKeys } from './cache-service';

export interface TierConfig {
  name: 'explorer' | 'creator' | 'master';
  displayName: string;
  priceMonthly: number;
  generationsPerMonth: number;
  privateAdventuresPerMonth: number;
  priorityQueue: boolean;
  advancedExports: boolean;
  analyticsAccess: boolean;
}

export interface UserUsage {
  generationsUsed: number;
  generationsRemaining: number;
  privateAdventuresUsed: number;
  privateAdventuresRemaining: number;
  usagePeriodStart: Date;
}

export interface UserTierInfo {
  userId: string;
  tier: TierConfig;
  usage: UserUsage;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export class TierService {
  private tierConfigs: Map<string, TierConfig> = new Map();

  async initialize() {
    await this.loadTierConfigs();
  }

  private async loadTierConfigs() {
    try {
      const { rows } = await query(`
        SELECT * FROM tier_configs WHERE is_active = true
      `);

      this.tierConfigs.clear();
      rows.forEach((row: any) => {
        const config: TierConfig = {
          name: row.name,
          displayName: row.display_name,
          priceMonthly: parseFloat(row.price_monthly),
          generationsPerMonth: row.generations_per_month,
          privateAdventuresPerMonth: row.private_adventures_per_month,
          priorityQueue: row.priority_queue,
          advancedExports: row.advanced_exports,
          analyticsAccess: row.analytics_access
        };
        this.tierConfigs.set(row.name, config);
      });

      console.log(`[TIER-SERVICE] Loaded ${this.tierConfigs.size} tier configurations`);
    } catch (error) {
      console.error('[TIER-SERVICE] Failed to load tier configs:', error);
      // Set default configs as fallback
      this.setDefaultConfigs();
    }
  }

  private setDefaultConfigs() {
    const defaultConfigs: TierConfig[] = [
      {
        name: 'explorer',
        displayName: 'Explorer',
        priceMonthly: 0,
        generationsPerMonth: 0,
        privateAdventuresPerMonth: 0,
        priorityQueue: false,
        advancedExports: false,
        analyticsAccess: false
      },
      {
        name: 'creator',
        displayName: 'Creator',
        priceMonthly: 12,
        generationsPerMonth: 15,
        privateAdventuresPerMonth: 3,
        priorityQueue: false,
        advancedExports: false,
        analyticsAccess: true
      },
      {
        name: 'master',
        displayName: 'Master',
        priceMonthly: 25,
        generationsPerMonth: 50,
        privateAdventuresPerMonth: 999,
        priorityQueue: true,
        advancedExports: true,
        analyticsAccess: true
      }
    ];

    defaultConfigs.forEach(config => {
      this.tierConfigs.set(config.name, config);
    });
  }

  getTierConfig(tierName: string): TierConfig | null {
    return this.tierConfigs.get(tierName) || null;
  }

  getAllTierConfigs(): TierConfig[] {
    return Array.from(this.tierConfigs.values());
  }

  async getUserTierInfo(userId: string): Promise<UserTierInfo | null> {
    try {
      // Check cache first (cache for 2 minutes)
      const cacheKey = CacheKeys.USER_TIER_INFO(userId);
      const cached = cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const { rows } = await query(`
        SELECT 
          id,
          tier_name,
          generations_used,
          private_adventures_used,
          usage_period_start,
          stripe_customer_id,
          stripe_subscription_id
        FROM profiles 
        WHERE id = $1
      `, [userId]);

      if (rows.length === 0) {
        return null;
      }

      const user = rows[0];
      const tierConfig = this.getTierConfig(user.tier_name);
      
      if (!tierConfig) {
        console.error(`[TIER-SERVICE] Invalid tier for user ${userId}: ${user.tier_name}`);
        return null;
      }

      // Check if usage period needs reset
      const periodStart = new Date(user.usage_period_start);
      const now = new Date();
      const monthsSincePeriodStart = (now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24 * 30);

      let generationsUsed = user.generations_used;
      let privateAdventuresUsed = user.private_adventures_used;

      if (monthsSincePeriodStart >= 1) {
        // Reset usage for new period
        await this.resetUserUsage(userId);
        generationsUsed = 0;
        privateAdventuresUsed = 0;
      }

      const usage: UserUsage = {
        generationsUsed,
        generationsRemaining: Math.max(0, tierConfig.generationsPerMonth - generationsUsed),
        privateAdventuresUsed,
        privateAdventuresRemaining: Math.max(0, tierConfig.privateAdventuresPerMonth - privateAdventuresUsed),
        usagePeriodStart: periodStart
      };

      const result = {
        userId,
        tier: tierConfig,
        usage,
        stripeCustomerId: user.stripe_customer_id,
        stripeSubscriptionId: user.stripe_subscription_id
      };

      // Cache for 2 minutes
      cacheService.set(cacheKey, result, 120);

      return result;
    } catch (error) {
      console.error('[TIER-SERVICE] Failed to get user tier info:', error);
      return null;
    }
  }

  async checkGenerationLimit(userId: string): Promise<boolean> {
    const tierInfo = await this.getUserTierInfo(userId);
    if (!tierInfo) return false;
    
    return tierInfo.usage.generationsRemaining > 0;
  }

  async checkPrivacyLimit(userId: string, privacy: 'public' | 'private'): Promise<boolean> {
    if (privacy === 'public') return true;

    const tierInfo = await this.getUserTierInfo(userId);
    if (!tierInfo) return false;

    // Master tier has unlimited private adventures
    if (tierInfo.tier.name === 'master') return true;

    return tierInfo.usage.privateAdventuresRemaining > 0;
  }

  async consumeGeneration(userId: string): Promise<boolean> {
    try {
      const canGenerate = await this.checkGenerationLimit(userId);
      if (!canGenerate) return false;

      await query(`
        UPDATE profiles 
        SET generations_used = generations_used + 1
        WHERE id = $1
      `, [userId]);

      // Invalidate cache
      cacheService.delete(CacheKeys.USER_TIER_INFO(userId));

      console.log(`[TIER-SERVICE] Generation consumed for user ${userId}`);
      return true;
    } catch (error) {
      console.error('[TIER-SERVICE] Failed to consume generation:', error);
      return false;
    }
  }

  async consumePrivateSlot(userId: string): Promise<boolean> {
    try {
      const tierInfo = await this.getUserTierInfo(userId);
      if (!tierInfo) return false;

      // Master tier doesn't consume private slots
      if (tierInfo.tier.name === 'master') return true;

      if (tierInfo.usage.privateAdventuresRemaining <= 0) return false;

      await query(`
        UPDATE profiles 
        SET private_adventures_used = private_adventures_used + 1
        WHERE id = $1
      `, [userId]);

      // Invalidate cache
      cacheService.delete(CacheKeys.USER_TIER_INFO(userId));

      console.log(`[TIER-SERVICE] Private slot consumed for user ${userId}`);
      return true;
    } catch (error) {
      console.error('[TIER-SERVICE] Failed to consume private slot:', error);
      return false;
    }
  }

  async releasePrivateSlot(userId: string): Promise<boolean> {
    try {
      const tierInfo = await this.getUserTierInfo(userId);
      if (!tierInfo) return false;

      // Master tier doesn't track private slots
      if (tierInfo.tier.name === 'master') return true;

      await query(`
        UPDATE profiles 
        SET private_adventures_used = GREATEST(0, private_adventures_used - 1)
        WHERE id = $1
      `, [userId]);

      console.log(`[TIER-SERVICE] Private slot released for user ${userId}`);
      return true;
    } catch (error) {
      console.error('[TIER-SERVICE] Failed to release private slot:', error);
      return false;
    }
  }

  async updateUserTier(userId: string, newTierName: string, stripeSubscriptionId?: string): Promise<boolean> {
    try {
      const newTier = this.getTierConfig(newTierName);
      if (!newTier) {
        console.error(`[TIER-SERVICE] Invalid tier name: ${newTierName}`);
        return false;
      }

      await transaction(async (client) => {
        // Get current tier for history
        const { rows: currentRows } = await client.query(`
          SELECT tier_name FROM profiles WHERE id = $1
        `, [userId]);

        const previousTier = currentRows[0]?.tier_name;

        // Update user tier
        await client.query(`
          UPDATE profiles 
          SET 
            tier_name = $1,
            stripe_subscription_id = COALESCE($2, stripe_subscription_id),
            updated_at = NOW()
          WHERE id = $3
        `, [newTierName, stripeSubscriptionId, userId]);

        // Record tier change in history
        const action = this.getTierChangeAction(previousTier, newTierName);
        await client.query(`
          INSERT INTO subscription_history (user_id, tier_name, action, previous_tier, stripe_event_id)
          VALUES ($1, $2, $3, $4, $5)
        `, [userId, newTierName, action, previousTier, stripeSubscriptionId]);
      });

      console.log(`[TIER-SERVICE] User ${userId} tier updated to ${newTierName}`);
      return true;
    } catch (error) {
      console.error('[TIER-SERVICE] Failed to update user tier:', error);
      return false;
    }
  }

  private getTierChangeAction(previousTier: string, newTier: string): string {
    const tierOrder = { 'explorer': 0, 'creator': 1, 'master': 2 };
    const prevOrder = tierOrder[previousTier as keyof typeof tierOrder] ?? 0;
    const newOrder = tierOrder[newTier as keyof typeof tierOrder] ?? 0;

    if (newOrder > prevOrder) return 'upgrade';
    if (newOrder < prevOrder) return 'downgrade';
    return 'reactivate';
  }

  async resetUserUsage(userId: string): Promise<boolean> {
    try {
      await query(`
        UPDATE profiles 
        SET 
          generations_used = 0,
          private_adventures_used = 0,
          usage_period_start = NOW()
        WHERE id = $1
      `, [userId]);

      console.log(`[TIER-SERVICE] Usage reset for user ${userId}`);
      return true;
    } catch (error) {
      console.error('[TIER-SERVICE] Failed to reset user usage:', error);
      return false;
    }
  }

  async resetAllUsage(): Promise<void> {
    try {
      await query(`
        UPDATE profiles 
        SET 
          generations_used = 0,
          private_adventures_used = 0,
          usage_period_start = NOW()
        WHERE usage_period_start < NOW() - INTERVAL '1 month'
      `);

      console.log('[TIER-SERVICE] Monthly usage reset completed');
    } catch (error) {
      console.error('[TIER-SERVICE] Failed to reset monthly usage:', error);
    }
  }

  getUpgradePrompt(currentTier: string, limitType: 'generation' | 'privacy'): any {
    const current = this.getTierConfig(currentTier);
    if (!current) return null;

    const suggestions = [];

    if (currentTier === 'explorer') {
      suggestions.push({
        tier: 'creator',
        title: 'Upgrade to Creator',
        description: 'Generate 15 professional adventures per month',
        price: '$12/month',
        benefits: ['15 generations/month', '3 private adventures', 'Creator analytics', 'Community recognition']
      });
    }

    if (currentTier === 'creator') {
      suggestions.push({
        tier: 'master',
        title: 'Upgrade to Master',
        description: 'Unlimited privacy and advanced features',
        price: '$25/month',
        benefits: ['50 generations/month', 'Unlimited private adventures', 'Priority queue', 'Advanced exports', 'Priority support']
      });
    }

    return {
      currentTier: current,
      limitType,
      suggestions,
      message: limitType === 'generation' 
        ? 'You\'ve reached your generation limit for this month'
        : 'You\'ve used all your private adventure slots'
    };
  }
}