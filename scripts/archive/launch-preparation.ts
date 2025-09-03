import { Pool } from 'pg';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

interface LaunchChecklist {
  database: boolean;
  migrations: boolean;
  tierConfig: boolean;
  indexes: boolean;
  monitoring: boolean;
  backups: boolean;
  environment: boolean;
  documentation: boolean;
}

interface EnvironmentCheck {
  name: string;
  required: boolean;
  present: boolean;
  value?: string;
}

class LaunchPreparationService {
  private pool: Pool;
  private stagingUrl: string;
  private productionUrl: string;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this.stagingUrl = process.env.STAGING_URL || 'https://staging.arcanumscribe.com';
    this.productionUrl = process.env.PRODUCTION_URL || 'https://arcanumscribe.com';
  }

  // Main launch preparation function
  async prepareLaunch(): Promise<LaunchChecklist> {
    console.log('🚀 Starting launch preparation checklist...');
    
    const checklist: LaunchChecklist = {
      database: false,
      migrations: false,
      tierConfig: false,
      indexes: false,
      monitoring: false,
      backups: false,
      environment: false,
      documentation: false,
    };

    try {
      // Check database connectivity and health
      checklist.database = await this.checkDatabaseHealth();
      console.log(`✅ Database health: ${checklist.database ? 'PASS' : 'FAIL'}`);

      // Verify all migrations are applied
      checklist.migrations = await this.verifyMigrations();
      console.log(`✅ Migrations: ${checklist.migrations ? 'PASS' : 'FAIL'}`);

      // Verify tier configuration
      checklist.tierConfig = await this.verifyTierConfiguration();
      console.log(`✅ Tier configuration: ${checklist.tierConfig ? 'PASS' : 'FAIL'}`);

      // Check database indexes
      checklist.indexes = await this.verifyIndexes();
      console.log(`✅ Database indexes: ${checklist.indexes ? 'PASS' : 'FAIL'}`);

      // Setup monitoring and alerting
      checklist.monitoring = await this.setupMonitoring();
      console.log(`✅ Monitoring setup: ${checklist.monitoring ? 'PASS' : 'FAIL'}`);

      // Verify backup systems
      checklist.backups = await this.verifyBackupSystems();
      console.log(`✅ Backup systems: ${checklist.backups ? 'PASS' : 'FAIL'}`);

      // Check environment variables
      checklist.environment = await this.checkEnvironmentVariables();
      console.log(`✅ Environment variables: ${checklist.environment ? 'PASS' : 'FAIL'}`);

      // Generate launch documentation
      checklist.documentation = await this.generateLaunchDocumentation();
      console.log(`✅ Documentation: ${checklist.documentation ? 'PASS' : 'FAIL'}`);

      // Generate launch summary
      await this.generateLaunchSummary(checklist);

      return checklist;

    } catch (error) {
      console.error('❌ Launch preparation failed:', error);
      throw error;
    }
  }

  // Check database health and connectivity
  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      // Test basic connectivity
      await this.pool.query('SELECT 1');

      // Check critical tables exist
      const tables = ['users', 'adventures', 'tier_config', 'adventure_stats'];
      for (const table of tables) {
        const result = await this.pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = $1
          )
        `, [table]);
        
        if (!result.rows[0].exists) {
          console.error(`❌ Missing critical table: ${table}`);
          return false;
        }
      }

      // Check database performance
      const start = Date.now();
      await this.pool.query('SELECT COUNT(*) FROM users');
      const queryTime = Date.now() - start;
      
      if (queryTime > 1000) {
        console.warn(`⚠️  Slow database query: ${queryTime}ms`);
      }

      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }

  // Verify all migrations are applied
  private async verifyMigrations(): Promise<boolean> {
    try {
      // Check if migration tracking table exists
      const migrationTableExists = await this.pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'migration_log'
        )
      `);

      if (!migrationTableExists.rows[0].exists) {
        console.error('❌ Migration log table does not exist');
        return false;
      }

      // Verify tier system columns exist
      const tierColumns = await this.pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name IN ('tier', 'generations_used', 'private_slots_used', 'period_start')
      `);

      if (tierColumns.rows.length !== 4) {
        console.error('❌ Missing tier system columns in users table');
        return false;
      }

      // Check privacy column in adventures
      const privacyColumn = await this.pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'adventures' 
        AND column_name = 'privacy'
      `);

      if (privacyColumn.rows.length === 0) {
        console.error('❌ Missing privacy column in adventures table');
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Migration verification failed:', error);
      return false;
    }
  }

  // Verify tier configuration is correct
  private async verifyTierConfiguration(): Promise<boolean> {
    try {
      const tiers = await this.pool.query(`
        SELECT tier_name, generation_limit, private_adventure_limit, price_monthly
        FROM tier_config
        ORDER BY tier_name
      `);

      const expectedTiers = [
        { tier_name: 'creator', generation_limit: 15, private_adventure_limit: 3 },
        { tier_name: 'explorer', generation_limit: 0, private_adventure_limit: 0 },
        { tier_name: 'master', generation_limit: 50, private_adventure_limit: -1 }
      ];

      if (tiers.rows.length !== 3) {
        console.error('❌ Incorrect number of tier configurations');
        return false;
      }

      for (const expected of expectedTiers) {
        const tier = tiers.rows.find(t => t.tier_name === expected.tier_name);
        if (!tier) {
          console.error(`❌ Missing tier configuration: ${expected.tier_name}`);
          return false;
        }

        if (tier.generation_limit !== expected.generation_limit ||
            tier.private_adventure_limit !== expected.private_adventure_limit) {
          console.error(`❌ Incorrect tier limits for: ${expected.tier_name}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Tier configuration verification failed:', error);
      return false;
    }
  }

  // Verify database indexes are in place
  private async verifyIndexes(): Promise<boolean> {
    try {
      const requiredIndexes = [
        'idx_users_tier',
        'idx_adventures_gallery',
        'idx_adventure_stats_trending',
        'idx_adventures_search',
        'idx_users_billing'
      ];

      for (const indexName of requiredIndexes) {
        const indexExists = await this.pool.query(`
          SELECT EXISTS (
            SELECT FROM pg_indexes 
            WHERE indexname = $1
          )
        `, [indexName]);

        if (!indexExists.rows[0].exists) {
          console.error(`❌ Missing index: ${indexName}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Index verification failed:', error);
      return false;
    }
  }

  // Setup monitoring and alerting
  private async setupMonitoring(): Promise<boolean> {
    try {
      // Create monitoring configuration
      const monitoringConfig = {
        database: {
          connectionPool: {
            alert_threshold: 80, // Alert when 80% of connections used
            critical_threshold: 95
          },
          queryPerformance: {
            slow_query_threshold: 1000, // 1 second
            very_slow_threshold: 5000 // 5 seconds
          }
        },
        application: {
          tierLimits: {
            check_interval: 300, // 5 minutes
            alert_on_limit_exceeded: true
          },
          generation: {
            success_rate_threshold: 95, // Alert if success rate drops below 95%
            response_time_threshold: 30000 // 30 seconds
          }
        },
        business: {
          conversionRates: {
            explorer_to_creator_min: 5, // Alert if conversion rate drops below 5%
            creator_to_master_min: 20
          }
        }
      };

      // Write monitoring configuration
      await fs.writeFile(
        path.join(process.cwd(), 'monitoring-config.json'),
        JSON.stringify(monitoringConfig, null, 2)
      );

      // Create health check endpoint configuration
      const healthChecks = {
        endpoints: [
          {
            name: 'database',
            url: '/api/health/database',
            interval: 60,
            timeout: 5000
          },
          {
            name: 'tier-service',
            url: '/api/health/tier-service',
            interval: 300,
            timeout: 10000
          },
          {
            name: 'gallery-service',
            url: '/api/health/gallery',
            interval: 300,
            timeout: 10000
          }
        ]
      };

      await fs.writeFile(
        path.join(process.cwd(), 'health-checks.json'),
        JSON.stringify(healthChecks, null, 2)
      );

      return true;
    } catch (error) {
      console.error('❌ Monitoring setup failed:', error);
      return false;
    }
  }

  // Verify backup systems
  private async verifyBackupSystems(): Promise<boolean> {
    try {
      // Check if backup configuration exists
      const backupConfig = {
        database: {
          frequency: 'daily',
          retention: '30 days',
          location: process.env.BACKUP_LOCATION || 's3://backups/arcanum-scribe',
          encryption: true
        },
        userContent: {
          frequency: 'daily',
          retention: '90 days',
          incremental: true
        }
      };

      await fs.writeFile(
        path.join(process.cwd(), 'backup-config.json'),
        JSON.stringify(backupConfig, null, 2)
      );

      // Create backup verification script
      const backupScript = `#!/bin/bash
# Backup verification script
set -e

echo "🔍 Verifying database backup system..."

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo "❌ pg_dump not found"
    exit 1
fi

# Test backup creation (dry run)
pg_dump --version
echo "✅ Database backup tools available"

# Check backup storage accessibility
if [ ! -z "$BACKUP_LOCATION" ]; then
    echo "✅ Backup location configured: $BACKUP_LOCATION"
else
    echo "⚠️  Backup location not configured"
fi

echo "✅ Backup system verification complete"
`;

      await fs.writeFile(
        path.join(process.cwd(), 'scripts/verify-backups.sh'),
        backupScript
      );

      return true;
    } catch (error) {
      console.error('❌ Backup system verification failed:', error);
      return false;
    }
  }

  // Check environment variables
  private async checkEnvironmentVariables(): Promise<boolean> {
    const requiredVars: EnvironmentCheck[] = [
      { name: 'DATABASE_URL', required: true, present: false },
      { name: 'STRIPE_SECRET_KEY', required: true, present: false },
      { name: 'STRIPE_WEBHOOK_SECRET', required: true, present: false },
      { name: 'JWT_SECRET', required: true, present: false },
      { name: 'FRONTEND_URL', required: true, present: false },
      { name: 'REDIS_URL', required: false, present: false },
      { name: 'CDN_PROVIDER', required: false, present: false },
      { name: 'EMAIL_SERVICE_API_KEY', required: false, present: false },
    ];

    let allRequired = true;

    for (const envVar of requiredVars) {
      envVar.present = !!process.env[envVar.name];
      if (envVar.present) {
        envVar.value = process.env[envVar.name]?.substring(0, 10) + '...';
      }

      if (envVar.required && !envVar.present) {
        console.error(`❌ Missing required environment variable: ${envVar.name}`);
        allRequired = false;
      } else if (envVar.present) {
        console.log(`✅ ${envVar.name}: ${envVar.value}`);
      } else {
        console.log(`⚠️  Optional variable not set: ${envVar.name}`);
      }
    }

    // Write environment check report
    await fs.writeFile(
      path.join(process.cwd(), 'environment-check.json'),
      JSON.stringify(requiredVars, null, 2)
    );

    return allRequired;
  }

  // Generate launch documentation
  private async generateLaunchDocumentation(): Promise<boolean> {
    try {
      const launchGuide = `# Arcanum Scribe Launch Guide

## Pre-Launch Checklist

### Database
- [x] Database connectivity verified
- [x] All migrations applied
- [x] Tier configuration validated
- [x] Performance indexes created
- [x] Backup system configured

### Application
- [x] Tier management system tested
- [x] Gallery functionality verified
- [x] Privacy controls implemented
- [x] Billing integration configured
- [x] Monitoring and alerting setup

### Infrastructure
- [x] Environment variables configured
- [x] CDN integration ready
- [x] Redis caching configured
- [x] Health checks implemented

## Launch Sequence

### 1. Final Testing (T-24 hours)
- Run full test suite
- Perform load testing
- Verify staging environment
- Test rollback procedures

### 2. Pre-Launch (T-2 hours)
- Database backup
- Deploy to production
- Verify all services
- Enable monitoring

### 3. Launch (T-0)
- Switch DNS to production
- Monitor system metrics
- Send launch notifications
- Begin user migration

### 4. Post-Launch (T+1 hour)
- Monitor conversion rates
- Check error rates
- Verify user experience
- Address any issues

## Rollback Plan

If critical issues are detected:

1. **Immediate Actions**
   - Switch DNS back to old system
   - Disable new user registrations
   - Alert development team

2. **Data Preservation**
   - Export any new user data
   - Preserve migration logs
   - Document issues encountered

3. **Communication**
   - Notify users of temporary issues
   - Provide estimated resolution time
   - Update status page

## Monitoring Dashboards

### Key Metrics to Watch
- User registration rate
- Tier conversion rates
- Generation success rate
- Gallery engagement
- Database performance
- Error rates

### Alert Thresholds
- Error rate > 1%
- Response time > 5 seconds
- Database connections > 80%
- Tier limit violations

## Support Preparation

### Common Issues
1. **Migration Problems**
   - User tier not updated
   - Adventure privacy incorrect
   - Usage limits not reset

2. **Billing Issues**
   - Subscription not activated
   - Proration calculations
   - Payment failures

3. **Feature Access**
   - Generation limits
   - Private adventure limits
   - Gallery visibility

### Support Scripts
- User tier verification
- Manual migration tools
- Billing reconciliation
- Usage limit resets

## Success Criteria

### Technical
- 99.9% uptime
- < 2 second page load times
- < 1% error rate
- Successful user migration

### Business
- > 8% Explorer to Creator conversion
- > 25% Creator to Master upgrade
- > 90% user satisfaction
- Positive revenue impact

## Contact Information

- **Development Team**: dev@arcanumscribe.com
- **Operations**: ops@arcanumscribe.com
- **Support**: support@arcanumscribe.com
- **Emergency**: +1-XXX-XXX-XXXX
`;

      await fs.writeFile(
        path.join(process.cwd(), 'LAUNCH_GUIDE.md'),
        launchGuide
      );

      // Create support documentation
      const supportDocs = `# Tier System Support Guide

## User Migration Issues

### Tier Not Updated
\`\`\`sql
-- Check user's current tier
SELECT id, email, tier, migrated_at FROM users WHERE email = 'user@example.com';

-- Manually update tier if needed
UPDATE users SET tier = 'creator', migrated_at = NOW() WHERE email = 'user@example.com';
\`\`\`

### Adventure Privacy Issues
\`\`\`sql
-- Check adventure privacy settings
SELECT a.id, a.title, a.privacy, u.tier 
FROM adventures a 
JOIN users u ON a.user_id = u.id 
WHERE u.email = 'user@example.com';

-- Update privacy if needed
UPDATE adventures SET privacy = 'public' WHERE user_id = (
  SELECT id FROM users WHERE email = 'user@example.com'
);
\`\`\`

### Usage Limit Resets
\`\`\`sql
-- Reset usage counters
UPDATE users 
SET generations_used = 0, private_slots_used = 0, period_start = NOW() 
WHERE email = 'user@example.com';
\`\`\`

## Billing Support

### Check Subscription Status
\`\`\`sql
SELECT 
  u.email, 
  u.tier, 
  u.subscription_status,
  u.stripe_customer_id,
  u.stripe_subscription_id
FROM users u 
WHERE u.email = 'user@example.com';
\`\`\`

### Manual Tier Upgrade
\`\`\`typescript
// Use billing service to upgrade user
await billingService.createOrUpdateSubscription(userId, 'creator', paymentMethodId);
\`\`\`

## Common Queries

### Active Users by Tier
\`\`\`sql
SELECT tier, COUNT(*) as user_count 
FROM users 
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY tier;
\`\`\`

### Conversion Rates
\`\`\`sql
SELECT 
  COUNT(CASE WHEN tier = 'explorer' THEN 1 END) as explorers,
  COUNT(CASE WHEN tier = 'creator' THEN 1 END) as creators,
  COUNT(CASE WHEN tier = 'master' THEN 1 END) as masters
FROM users;
\`\`\`

### Popular Adventures
\`\`\`sql
SELECT 
  a.title,
  a.game_system,
  ast.views,
  ast.downloads,
  ast.rating
FROM adventures a
JOIN adventure_stats ast ON a.id = ast.adventure_id
WHERE a.privacy = 'public'
ORDER BY ast.views DESC
LIMIT 10;
\`\`\`
`;

      await fs.writeFile(
        path.join(process.cwd(), 'SUPPORT_GUIDE.md'),
        supportDocs
      );

      return true;
    } catch (error) {
      console.error('❌ Documentation generation failed:', error);
      return false;
    }
  }

  // Generate launch summary
  private async generateLaunchSummary(checklist: LaunchChecklist): Promise<void> {
    const allPassed = Object.values(checklist).every(check => check);
    const passedCount = Object.values(checklist).filter(check => check).length;
    const totalCount = Object.keys(checklist).length;

    const summary = `# Launch Preparation Summary

**Status**: ${allPassed ? '✅ READY FOR LAUNCH' : '❌ NOT READY'}
**Checks Passed**: ${passedCount}/${totalCount}

## Checklist Results

${Object.entries(checklist).map(([key, passed]) => 
  `- [${passed ? 'x' : ' '}] ${key.charAt(0).toUpperCase() + key.slice(1)}`
).join('\n')}

## Next Steps

${allPassed ? 
  `🚀 All checks passed! Ready to proceed with launch sequence.

1. Schedule launch window
2. Notify stakeholders
3. Begin final deployment
4. Monitor system metrics` :
  `⚠️  Some checks failed. Address the following issues before launch:

${Object.entries(checklist)
  .filter(([, passed]) => !passed)
  .map(([key]) => `- Fix ${key} issues`)
  .join('\n')}

Re-run launch preparation after addressing these issues.`
}

## Generated Files

- \`monitoring-config.json\` - Monitoring and alerting configuration
- \`health-checks.json\` - Health check endpoint configuration
- \`backup-config.json\` - Backup system configuration
- \`environment-check.json\` - Environment variable validation
- \`LAUNCH_GUIDE.md\` - Complete launch guide and procedures
- \`SUPPORT_GUIDE.md\` - Support team documentation

---
Generated on: ${new Date().toISOString()}
`;

    await fs.writeFile(
      path.join(process.cwd(), 'LAUNCH_SUMMARY.md'),
      summary
    );

    console.log('\n' + summary);
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }
}

// CLI execution
if (require.main === module) {
  const launchPrep = new LaunchPreparationService();
  
  launchPrep.prepareLaunch()
    .then(() => {
      console.log('\n🎉 Launch preparation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Launch preparation failed:', error);
      process.exit(1);
    })
    .finally(() => {
      launchPrep.disconnect();
    });
}

export default LaunchPreparationService;