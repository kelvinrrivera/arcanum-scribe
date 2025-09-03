import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

interface MigrationResult {
  totalUsers: number;
  migratedUsers: number;
  errors: Array<{ userId: string; error: string }>;
  tierMapping: { [key: string]: number };
}

class MagicCreditsMigration {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  // Main migration function
  async migrateToMagicCredits(): Promise<MigrationResult> {
    console.log('🪄 Starting migration to Magic Credits system...');
    
    const result: MigrationResult = {
      totalUsers: 0,
      migratedUsers: 0,
      errors: [],
      tierMapping: { reader: 0, creator: 0, architect: 0 }
    };

    try {
      // First, create new database schema
      await this.createNewSchema();

      // Get all existing users
      const users = await this.getExistingUsers();
      result.totalUsers = users.length;

      console.log(`📊 Found ${users.length} users to migrate`);

      // Migrate users in batches
      const batchSize = 100;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        await this.migrateBatch(batch, result);
        
        console.log(`✅ Migrated batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(users.length / batchSize)}`);
      }

      // Update tier configurations
      await this.updateTierConfigurations();

      // Send migration notifications
      await this.sendMigrationNotifications();

      console.log('🎉 Magic Credits migration completed successfully!');
      console.log(`📈 Migration Summary:
        - Total Users: ${result.totalUsers}
        - Successfully Migrated: ${result.migratedUsers}
        - Errors: ${result.errors.length}
        - Reader Tier: ${result.tierMapping.reader}
        - Creator Tier: ${result.tierMapping.creator}
        - Architect Tier: ${result.tierMapping.architect}
      `);

      return result;

    } catch (error) {
      console.error('❌ Magic Credits migration failed:', error);
      throw error;
    }
  }

  // Create new database schema for Magic Credits system
  private async createNewSchema(): Promise<void> {
    console.log('🏗️  Creating new database schema...');

    const schemaQueries = [
      // Update users table with new columns
      `ALTER TABLE users 
       ADD COLUMN IF NOT EXISTS magic_credits INTEGER DEFAULT 0,
       ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0,
       ADD COLUMN IF NOT EXISTS downloads_used INTEGER DEFAULT 0`,

      // Update tier column to use new tier names
      `ALTER TABLE users 
       ADD COLUMN IF NOT EXISTS new_tier VARCHAR(20)`,

      // Create credit transactions table
      `CREATE TABLE IF NOT EXISTS credit_transactions (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        transaction_type VARCHAR(50) NOT NULL, -- 'credit_usage', 'credit_purchase', 'credit_grant'
        action_type VARCHAR(50), -- 'fullAdventure', 'individualMonster', etc.
        amount INTEGER NOT NULL, -- negative for usage, positive for additions
        reason TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      // Create download logs table
      `CREATE TABLE IF NOT EXISTS download_logs (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        adventure_id UUID REFERENCES adventures(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      // Create tier changes table
      `CREATE TABLE IF NOT EXISTS tier_changes (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        previous_tier VARCHAR(20),
        new_tier VARCHAR(20) NOT NULL,
        change_reason VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      // Create indexes
      `CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_download_logs_user_id ON download_logs(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_download_logs_adventure_id ON download_logs(adventure_id)`,
      `CREATE INDEX IF NOT EXISTS idx_tier_changes_user_id ON tier_changes(user_id)`,
    ];

    for (const query of schemaQueries) {
      try {
        await this.pool.query(query);
      } catch (error) {
        console.error('Error executing schema query:', error);
        throw error;
      }
    }

    console.log('✅ Database schema updated');
  }

  // Get all existing users
  private async getExistingUsers(): Promise<any[]> {
    const query = `
      SELECT 
        id,
        email,
        username,
        tier,
        generations_used,
        private_slots_used,
        period_start,
        subscription_status,
        created_at
      FROM users
      ORDER BY created_at ASC
    `;

    const result = await this.pool.query(query);
    return result.rows;
  }

  // Migrate a batch of users
  private async migrateBatch(users: any[], result: MigrationResult): Promise<void> {
    for (const user of users) {
      try {
        const newTier = this.mapUserToNewTier(user);
        const magicCredits = this.calculateInitialCredits(user, newTier);
        
        await this.migrateUser(user, newTier, magicCredits);
        
        result.migratedUsers++;
        result.tierMapping[newTier]++;
        
      } catch (error) {
        console.error(`❌ Error migrating user ${user.id}:`, error);
        result.errors.push({
          userId: user.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  // Map existing tier to new Magic Credits tier
  private mapUserToNewTier(user: any): 'reader' | 'creator' | 'architect' {
    // Map based on existing tier and subscription status
    if (user.subscription_status === 'active') {
      switch (user.tier?.toLowerCase()) {
        case 'master':
        case 'premium':
        case 'professional':
          return 'architect';
        case 'creator':
        case 'basic':
        case 'standard':
          return 'creator';
        default:
          // If they had an active subscription but unclear tier, default to creator
          return 'creator';
      }
    }

    // Free users or inactive subscriptions
    if (user.generations_used > 0 || user.private_slots_used > 0) {
      // Users who have used the system get creator tier initially
      return 'creator';
    }

    // Default to reader (free tier)
    return 'reader';
  }

  // Calculate initial magic credits based on previous usage
  private calculateInitialCredits(user: any, newTier: 'reader' | 'creator' | 'architect'): number {
    const tierCredits = {
      reader: 0,
      creator: 10,
      architect: 30
    };

    let baseCredits = tierCredits[newTier];

    // If user had remaining generations, convert them to credits
    if (user.tier === 'creator' && user.generations_used < 15) {
      const remainingGenerations = 15 - user.generations_used;
      // Convert remaining generations to credits (roughly 1 generation = 3 credits for full adventure)
      baseCredits += Math.floor(remainingGenerations * 2.5);
    } else if (user.tier === 'master' && user.generations_used < 50) {
      const remainingGenerations = 50 - user.generations_used;
      baseCredits += Math.floor(remainingGenerations * 2.5);
    }

    return Math.min(baseCredits, tierCredits[newTier] * 2); // Cap at 2x monthly allowance
  }

  // Migrate individual user
  private async migrateUser(user: any, newTier: string, magicCredits: number): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Update user with new tier and credits
      await client.query(`
        UPDATE users 
        SET 
          new_tier = $1,
          magic_credits = $2,
          credits_used = 0,
          downloads_used = 0,
          period_start = COALESCE(period_start, NOW()),
          migrated_to_credits_at = NOW(),
          migration_notes = $3
        WHERE id = $4
      `, [
        newTier,
        magicCredits,
        `Migrated from ${user.tier || 'free'} (${user.subscription_status || 'inactive'}) with ${magicCredits} initial credits`,
        user.id
      ]);

      // Record tier change
      await client.query(`
        INSERT INTO tier_changes (
          user_id, previous_tier, new_tier, change_reason, created_at
        ) VALUES ($1, $2, $3, 'magic_credits_migration', NOW())
      `, [user.id, user.tier || 'free', newTier]);

      // If user had previous usage, create credit transactions for history
      if (user.generations_used > 0) {
        await client.query(`
          INSERT INTO credit_transactions (
            user_id, transaction_type, action_type, amount, reason, created_at
          ) VALUES ($1, 'credit_usage', 'migration_history', $2, 'Previous generation usage', NOW())
        `, [user.id, -(user.generations_used * 3)]); // Assume 3 credits per generation
      }

      await client.query('COMMIT');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Update tier configurations in database
  private async updateTierConfigurations(): Promise<void> {
    console.log('⚙️  Updating tier configurations...');

    const tierConfigs = [
      {
        name: 'reader',
        display_name: 'The Reader',
        price_monthly: 0,
        magic_credits_per_month: 0,
        download_limit: 3,
        private_creations: false,
        priority_queue: false,
        advanced_features: false,
        watermark_free: false,
        additional_credit_price: 0,
        features: JSON.stringify({
          gallery_access: true,
          rating: true,
          bookmarks: true,
          limited_downloads: true
        })
      },
      {
        name: 'creator',
        display_name: 'The Creator',
        price_monthly: 1200, // €12 in cents
        magic_credits_per_month: 10,
        download_limit: -1,
        private_creations: false,
        priority_queue: false,
        advanced_features: false,
        watermark_free: true,
        additional_credit_price: 700, // €7 for 5 credits
        features: JSON.stringify({
          generation: true,
          unlimited_downloads: true,
          public_sharing: true,
          credit_purchases: true
        })
      },
      {
        name: 'architect',
        display_name: 'The Architect',
        price_monthly: 2900, // €29 in cents
        magic_credits_per_month: 30,
        download_limit: -1,
        private_creations: true,
        priority_queue: true,
        advanced_features: true,
        watermark_free: true,
        additional_credit_price: 700, // €7 for 5 credits
        features: JSON.stringify({
          generation: true,
          unlimited_downloads: true,
          private_by_default: true,
          adventure_forge: true,
          advanced_exports: true,
          priority_queue: true,
          multiple_game_systems: true
        })
      }
    ];

    // Create new tier config table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS magic_tier_configs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(20) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        price_monthly INTEGER NOT NULL,
        magic_credits_per_month INTEGER NOT NULL,
        download_limit INTEGER NOT NULL, -- -1 for unlimited
        private_creations BOOLEAN DEFAULT FALSE,
        priority_queue BOOLEAN DEFAULT FALSE,
        advanced_features BOOLEAN DEFAULT FALSE,
        watermark_free BOOLEAN DEFAULT FALSE,
        additional_credit_price INTEGER DEFAULT 0,
        features JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Insert tier configurations
    for (const config of tierConfigs) {
      await this.pool.query(`
        INSERT INTO magic_tier_configs (
          name, display_name, price_monthly, magic_credits_per_month,
          download_limit, private_creations, priority_queue, advanced_features,
          watermark_free, additional_credit_price, features
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (name) DO UPDATE SET
          display_name = EXCLUDED.display_name,
          price_monthly = EXCLUDED.price_monthly,
          magic_credits_per_month = EXCLUDED.magic_credits_per_month,
          download_limit = EXCLUDED.download_limit,
          private_creations = EXCLUDED.private_creations,
          priority_queue = EXCLUDED.priority_queue,
          advanced_features = EXCLUDED.advanced_features,
          watermark_free = EXCLUDED.watermark_free,
          additional_credit_price = EXCLUDED.additional_credit_price,
          features = EXCLUDED.features
      `, [
        config.name,
        config.display_name,
        config.price_monthly,
        config.magic_credits_per_month,
        config.download_limit,
        config.private_creations,
        config.priority_queue,
        config.advanced_features,
        config.watermark_free,
        config.additional_credit_price,
        config.features
      ]);
    }

    console.log('✅ Tier configurations updated');
  }

  // Send migration notification emails
  private async sendMigrationNotifications(): Promise<void> {
    console.log('📧 Sending Magic Credits migration notifications...');

    const users = await this.pool.query(`
      SELECT 
        u.id,
        u.email,
        u.username,
        u.new_tier,
        u.magic_credits,
        u.migration_notes
      FROM users u
      WHERE u.migrated_to_credits_at IS NOT NULL
      AND u.credits_migration_notification_sent IS NULL
    `);

    for (const user of users.rows) {
      try {
        await this.sendMigrationEmail(user);
        
        // Mark notification as sent
        await this.pool.query(`
          UPDATE users 
          SET credits_migration_notification_sent = NOW() 
          WHERE id = $1
        `, [user.id]);
        
      } catch (error) {
        console.error(`❌ Error sending notification to ${user.email}:`, error);
      }
    }

    console.log('✅ Migration notifications sent');
  }

  // Send individual migration email
  private async sendMigrationEmail(user: any): Promise<void> {
    const emailContent = this.generateMigrationEmailContent(user);
    
    console.log(`📧 Email for ${user.email}:`);
    console.log(emailContent);
    
    // TODO: Integrate with actual email service
    // await emailService.send({
    //   to: user.email,
    //   subject: 'Welcome to the Magic Credits System! ✨',
    //   html: emailContent
    // });
  }

  // Generate migration email content
  private generateMigrationEmailContent(user: any): string {
    const tierInfo = {
      reader: {
        title: 'The Reader',
        description: 'Explore a universe of legends created by our community',
        benefits: [
          'Unlimited access to the Public Legend Library',
          '3 PDF downloads per month',
          'Rate and bookmark adventures',
          'Search and filter content'
        ]
      },
      creator: {
        title: 'The Creator',
        description: 'Forge your own legends and share them with the world',
        benefits: [
          '10 Magic Credits ✨ per month',
          'Generate full adventures and individual components',
          'Unlimited downloads of your creations',
          'Watermark-free exports',
          'Option to purchase additional credits'
        ]
      },
      architect: {
        title: 'The Architect',
        description: 'Design your worlds in secret with master tools',
        benefits: [
          '30 Magic Credits ✨ per month',
          'Private creations by default',
          'Access to Adventure Forge (node builder)',
          'Advanced stat blocks for multiple systems',
          'Priority generation queue',
          'Professional PDF templates'
        ]
      }
    };

    const tier = tierInfo[user.new_tier as keyof typeof tierInfo];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Magic Credits! ✨</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8B5CF6;">✨ Welcome to the Magic Credits System!</h1>
        
        <p>Hi ${user.username},</p>
        
        <p>We're excited to introduce our revolutionary new <strong>Magic Credits</strong> system! This new approach gives you more control and flexibility over your creative power.</p>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: white;">Your New Tier: ${tier.title}</h2>
          <p style="font-size: 16px; margin-bottom: 0;">${tier.description}</p>
        </div>
        
        <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B5CF6;">
          <h3 style="color: #374151; margin-top: 0;">Your Magic Credits ✨</h3>
          <p style="font-size: 18px; font-weight: bold; color: #8B5CF6; margin: 10px 0;">
            ${user.magic_credits} Magic Credits
          </p>
          <p style="color: #6B7280; margin-bottom: 0;">
            These credits refresh monthly and can be used for all creation activities.
          </p>
        </div>
        
        <h3>What You Can Create:</h3>
        <ul style="color: #374151;">
          <li><strong>Full Adventure</strong> - 3 ✨ credits</li>
          <li><strong>Individual Monster</strong> - 1 ✨ credit</li>
          <li><strong>Individual NPC</strong> - 1 ✨ credit</li>
          <li><strong>Magic Item</strong> - 1 ✨ credit</li>
          <li><strong>Puzzle</strong> - 1 ✨ credit</li>
          <li><strong>Regenerate Section</strong> - 1 ✨ credit</li>
        </ul>
        
        <h3>Your Tier Benefits:</h3>
        <ul style="color: #374151;">
          ${tier.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
        </ul>
        
        <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #92400E; margin-top: 0;">💡 Pro Tip</h4>
          <p style="color: #92400E; margin-bottom: 0;">
            Plan your creations strategically! You can generate 3 full adventures and still have 1 credit left for individual components, or create 10 individual monsters/NPCs/items.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Start Creating with Magic Credits ✨
          </a>
        </div>
        
        <h3>What's New?</h3>
        <ul style="color: #374151;">
          <li><strong>Unified Credit System</strong>: Everything uses Magic Credits ✨</li>
          <li><strong>More Flexibility</strong>: Choose what to create based on your needs</li>
          <li><strong>Better Value</strong>: More control over your creative resources</li>
          <li><strong>Transparent Costs</strong>: Know exactly what each creation costs</li>
        </ul>
        
        <p>If you have any questions about the new Magic Credits system, please don't hesitate to reach out to our support team.</p>
        
        <p>Happy creating!<br>
        The Arcanum Scribe Team ✨</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="font-size: 12px; color: #9CA3AF;">
          Migration completed on ${new Date().toLocaleDateString()}<br>
          ${user.migration_notes}
        </p>
      </body>
      </html>
    `;
  }

  // Finalize migration by switching to new tier column
  async finalizeMigration(): Promise<void> {
    console.log('🔄 Finalizing Magic Credits migration...');

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Copy new_tier to tier column
      await client.query(`
        UPDATE users 
        SET tier = new_tier 
        WHERE new_tier IS NOT NULL
      `);

      // Drop old columns (optional, can be kept for rollback)
      // await client.query(`
      //   ALTER TABLE users 
      //   DROP COLUMN IF EXISTS generations_used,
      //   DROP COLUMN IF EXISTS private_slots_used,
      //   DROP COLUMN IF EXISTS new_tier
      // `);

      await client.query('COMMIT');
      console.log('✅ Migration finalized');
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Finalization failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }
}

// CLI execution
async function main() {
  const migration = new MagicCreditsMigration();
  
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'migrate':
        await migration.migrateToMagicCredits();
        process.exit(0);
        break;
        
      case 'finalize':
        await migration.finalizeMigration();
        process.exit(0);
        break;
        
      default:
        console.log(`
Usage: tsx scripts/migrate-to-magic-credits.ts <command>

Commands:
  migrate    Run the Magic Credits migration
  finalize   Finalize the migration (switch to new tier column)
        `);
        process.exit(1);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default MagicCreditsMigration;