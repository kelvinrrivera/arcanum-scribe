import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

interface LegacyUser {
  id: string;
  email: string;
  username: string;
  subscription_status: string;
  subscription_tier: string;
  created_at: Date;
  professional_mode_enabled: boolean;
}

interface MigrationResult {
  totalUsers: number;
  migratedUsers: number;
  errors: Array<{ userId: string; error: string }>;
  tierMapping: { [key: string]: number };
}

class UserMigrationService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  // Main migration function
  async migrateAllUsers(): Promise<MigrationResult> {
    console.log('🚀 Starting user migration to new tier system...');
    
    const result: MigrationResult = {
      totalUsers: 0,
      migratedUsers: 0,
      errors: [],
      tierMapping: { explorer: 0, creator: 0, master: 0 }
    };

    try {
      // Get all existing users
      const users = await this.getLegacyUsers();
      result.totalUsers = users.length;

      console.log(`📊 Found ${users.length} users to migrate`);

      // Migrate users in batches
      const batchSize = 100;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        await this.migrateBatch(batch, result);
        
        console.log(`✅ Migrated batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(users.length / batchSize)}`);
      }

      // Update adventure privacy settings
      await this.migrateAdventurePrivacy();

      // Send migration notifications
      await this.sendMigrationNotifications();

      console.log('🎉 Migration completed successfully!');
      console.log(`📈 Migration Summary:
        - Total Users: ${result.totalUsers}
        - Successfully Migrated: ${result.migratedUsers}
        - Errors: ${result.errors.length}
        - Explorer Tier: ${result.tierMapping.explorer}
        - Creator Tier: ${result.tierMapping.creator}
        - Master Tier: ${result.tierMapping.master}
      `);

      return result;

    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  // Get all legacy users
  private async getLegacyUsers(): Promise<LegacyUser[]> {
    const query = `
      SELECT 
        id,
        email,
        username,
        subscription_status,
        subscription_tier,
        created_at,
        COALESCE(professional_mode_enabled, false) as professional_mode_enabled
      FROM users
      WHERE tier IS NULL OR tier = ''
      ORDER BY created_at ASC
    `;

    const result = await this.pool.query(query);
    return result.rows;
  }

  // Migrate a batch of users
  private async migrateBatch(users: LegacyUser[], result: MigrationResult): Promise<void> {
    for (const user of users) {
      try {
        const newTier = this.mapUserToTier(user);
        await this.migrateUser(user, newTier);
        
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

  // Map legacy user to new tier system
  private mapUserToTier(user: LegacyUser): 'explorer' | 'creator' | 'master' {
    // Mapping logic based on existing subscription
    if (user.subscription_status === 'active') {
      switch (user.subscription_tier?.toLowerCase()) {
        case 'premium':
        case 'pro':
        case 'professional':
          return 'master';
        case 'basic':
        case 'standard':
          return 'creator';
        default:
          // If they had an active subscription but unclear tier, default to creator
          return 'creator';
      }
    }

    // Free users or inactive subscriptions
    if (user.professional_mode_enabled) {
      // Users who had professional mode enabled get creator tier
      return 'creator';
    }

    // Default to explorer (free tier)
    return 'explorer';
  }

  // Migrate individual user
  private async migrateUser(user: LegacyUser, newTier: 'explorer' | 'creator' | 'master'): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Update user with new tier
      await client.query(`
        UPDATE users 
        SET 
          tier = $1,
          generations_used = 0,
          private_slots_used = 0,
          period_start = NOW(),
          migrated_at = NOW(),
          migration_notes = $2
        WHERE id = $3
      `, [
        newTier,
        `Migrated from ${user.subscription_tier || 'free'} (${user.subscription_status || 'inactive'})`,
        user.id
      ]);

      // Create migration log entry
      await client.query(`
        INSERT INTO migration_log (
          user_id,
          old_tier,
          new_tier,
          migration_date,
          migration_reason
        ) VALUES ($1, $2, $3, NOW(), $4)
      `, [
        user.id,
        user.subscription_tier || 'free',
        newTier,
        'Automatic migration to unified tier system'
      ]);

      await client.query('COMMIT');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Migrate adventure privacy settings
  private async migrateAdventurePrivacy(): Promise<void> {
    console.log('🔒 Migrating adventure privacy settings...');

    // Set default privacy based on user tier
    const queries = [
      // Explorer tier users - all adventures become public (they can't create new ones anyway)
      `UPDATE adventures 
       SET privacy = 'public' 
       WHERE user_id IN (SELECT id FROM users WHERE tier = 'explorer')
       AND privacy IS NULL`,

      // Creator tier users - default to public (their model)
      `UPDATE adventures 
       SET privacy = 'public' 
       WHERE user_id IN (SELECT id FROM users WHERE tier = 'creator')
       AND privacy IS NULL`,

      // Master tier users - default to private (their model)
      `UPDATE adventures 
       SET privacy = 'private' 
       WHERE user_id IN (SELECT id FROM users WHERE tier = 'master')
       AND privacy IS NULL`,

      // Handle any remaining null privacy settings
      `UPDATE adventures 
       SET privacy = 'public' 
       WHERE privacy IS NULL`
    ];

    for (const query of queries) {
      await this.pool.query(query);
    }

    console.log('✅ Adventure privacy migration completed');
  }

  // Send migration notification emails
  private async sendMigrationNotifications(): Promise<void> {
    console.log('📧 Sending migration notification emails...');

    // Get all migrated users
    const users = await this.pool.query(`
      SELECT 
        u.id,
        u.email,
        u.username,
        u.tier,
        u.migration_notes,
        tc.generation_limit,
        tc.private_adventure_limit,
        tc.features
      FROM users u
      JOIN tier_config tc ON u.tier = tc.tier_name
      WHERE u.migrated_at IS NOT NULL
      AND u.migration_notification_sent IS NULL
    `);

    for (const user of users.rows) {
      try {
        await this.sendMigrationEmail(user);
        
        // Mark notification as sent
        await this.pool.query(`
          UPDATE users 
          SET migration_notification_sent = NOW() 
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
    // This would integrate with your email service (SendGrid, AWS SES, etc.)
    // For now, we'll just log the email content
    
    const emailContent = this.generateMigrationEmailContent(user);
    
    console.log(`📧 Email for ${user.email}:`);
    console.log(emailContent);
    
    // TODO: Integrate with actual email service
    // await emailService.send({
    //   to: user.email,
    //   subject: 'Welcome to the New Arcanum Scribe Tier System!',
    //   html: emailContent
    // });
  }

  // Generate migration email content
  private generateMigrationEmailContent(user: any): string {
    const tierBenefits = {
      explorer: {
        title: 'Explorer Tier (Free)',
        benefits: [
          'Browse unlimited public adventures',
          'Rate and review adventures',
          'Bookmark favorite content',
          'Access to community features'
        ]
      },
      creator: {
        title: 'Creator Tier',
        benefits: [
          '15 adventure generations per month',
          '3 private adventures per month',
          'Creator analytics dashboard',
          'Creator badge in gallery',
          'All Explorer benefits'
        ]
      },
      master: {
        title: 'Master Tier',
        benefits: [
          '50 adventure generations per month',
          'Unlimited private adventures',
          'Advanced export options (PDF, Roll20, FoundryVTT)',
          'Priority generation queue',
          'All Creator benefits'
        ]
      }
    };

    const tier = tierBenefits[user.tier as keyof typeof tierBenefits];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to the New Arcanum Scribe!</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8B5CF6;">🎉 Welcome to the New Arcanum Scribe!</h1>
        
        <p>Hi ${user.username},</p>
        
        <p>We're excited to announce that Arcanum Scribe has been upgraded with a new tier system designed to better serve our community of creators and adventurers!</p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #374151; margin-top: 0;">Your New Tier: ${tier.title}</h2>
          <ul style="color: #6B7280;">
            ${tier.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
          </ul>
        </div>
        
        <h3>What's New?</h3>
        <ul>
          <li><strong>Public Adventure Gallery:</strong> Discover amazing adventures created by our community</li>
          <li><strong>Enhanced Privacy Controls:</strong> Choose whether your adventures are public or private</li>
          <li><strong>Creator Recognition:</strong> Get credit for your amazing work with creator badges</li>
          <li><strong>Improved Performance:</strong> Faster generation and better user experience</li>
        </ul>
        
        <h3>Your Adventures</h3>
        <p>All your existing adventures have been preserved and their privacy settings have been configured based on your new tier. You can adjust these settings anytime in your adventure library.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Explore the New Arcanum Scribe
          </a>
        </div>
        
        <p>If you have any questions about the migration or your new tier, please don't hesitate to reach out to our support team.</p>
        
        <p>Happy adventuring!<br>
        The Arcanum Scribe Team</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="font-size: 12px; color: #9CA3AF;">
          Migration completed on ${new Date().toLocaleDateString()}<br>
          Previous tier: ${user.migration_notes}
        </p>
      </body>
      </html>
    `;
  }

  // Create migration log table
  async createMigrationLogTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS migration_log (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        old_tier VARCHAR(50),
        new_tier VARCHAR(50),
        migration_date TIMESTAMP DEFAULT NOW(),
        migration_reason TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_migration_log_user_id ON migration_log(user_id);
      CREATE INDEX IF NOT EXISTS idx_migration_log_date ON migration_log(migration_date);
    `;

    await this.pool.query(query);
  }

  // Rollback migration (emergency use only)
  async rollbackMigration(): Promise<void> {
    console.log('⚠️  Rolling back migration...');
    
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Restore original user data from migration log
      await client.query(`
        UPDATE users 
        SET 
          tier = ml.old_tier,
          generations_used = 0,
          private_slots_used = 0,
          period_start = NULL,
          migrated_at = NULL,
          migration_notes = NULL,
          migration_notification_sent = NULL
        FROM migration_log ml
        WHERE users.id = ml.user_id
      `);

      // Reset adventure privacy
      await client.query(`
        UPDATE adventures 
        SET privacy = NULL
      `);

      await client.query('COMMIT');
      console.log('✅ Migration rollback completed');
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Rollback failed:', error);
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
if (require.main === module) {
  const migration = new UserMigrationService();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'migrate':
      migration.migrateAllUsers()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'rollback':
      migration.rollbackMigration()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'create-tables':
      migration.createMigrationLogTable()
        .then(() => {
          console.log('✅ Migration tables created');
          process.exit(0);
        })
        .catch(() => process.exit(1));
      break;
      
    default:
      console.log(`
Usage: tsx scripts/user-migration.ts <command>

Commands:
  create-tables  Create migration log tables
  migrate        Run the full user migration
  rollback       Rollback the migration (emergency use only)
      `);
      process.exit(1);
  }
}

export default UserMigrationService;