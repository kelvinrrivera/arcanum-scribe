import { Pool } from 'pg';
import { EventEmitter } from 'events';

interface MetricData {
  timestamp: Date;
  value: number;
  metadata?: any;
}

interface ConversionMetrics {
  explorerToCreator: number;
  creatorToMaster: number;
  totalConversions: number;
  period: string;
}

interface UsageMetrics {
  totalGenerations: number;
  averageGenerationsPerUser: number;
  privateAdventureUsage: number;
  galleryViews: number;
  searchQueries: number;
}

interface PerformanceMetrics {
  averageResponseTime: number;
  errorRate: number;
  databaseConnections: number;
  cacheHitRate: number;
}

interface BusinessMetrics {
  monthlyRecurringRevenue: number;
  churnRate: number;
  customerLifetimeValue: number;
  averageRevenuePerUser: number;
}

class MonitoringService extends EventEmitter {
  private pool: Pool;
  private metricsInterval: NodeJS.Timeout | null = null;
  private alertThresholds: any;

  constructor(pool: Pool) {
    super();
    this.pool = pool;
    this.alertThresholds = {
      errorRate: 0.01, // 1%
      responseTime: 5000, // 5 seconds
      conversionRate: 0.05, // 5%
      churnRate: 0.1, // 10%
    };
  }

  // Start monitoring
  startMonitoring(intervalMs: number = 300000): void { // 5 minutes default
    console.log('📊 Starting post-launch monitoring...');
    
    this.metricsInterval = setInterval(async () => {
      try {
        await this.collectAndAnalyzeMetrics();
      } catch (error) {
        console.error('❌ Error collecting metrics:', error);
        this.emit('error', error);
      }
    }, intervalMs);

    // Initial collection
    this.collectAndAnalyzeMetrics();
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    console.log('📊 Monitoring stopped');
  }

  // Collect and analyze all metrics
  private async collectAndAnalyzeMetrics(): Promise<void> {
    const timestamp = new Date();
    
    // Collect metrics
    const conversionMetrics = await this.getConversionMetrics();
    const usageMetrics = await this.getUsageMetrics();
    const performanceMetrics = await this.getPerformanceMetrics();
    const businessMetrics = await this.getBusinessMetrics();

    // Store metrics
    await this.storeMetrics(timestamp, {
      conversion: conversionMetrics,
      usage: usageMetrics,
      performance: performanceMetrics,
      business: businessMetrics,
    });

    // Check for alerts
    await this.checkAlerts(conversionMetrics, performanceMetrics, businessMetrics);

    // Emit metrics for external consumers
    this.emit('metrics', {
      timestamp,
      conversion: conversionMetrics,
      usage: usageMetrics,
      performance: performanceMetrics,
      business: businessMetrics,
    });
  }

  // Get tier conversion metrics
  async getConversionMetrics(): Promise<ConversionMetrics> {
    const period = '30 days';
    
    // Get tier changes in the last 30 days
    const conversionQuery = `
      WITH tier_changes AS (
        SELECT 
          old_tier,
          new_tier,
          COUNT(*) as change_count
        FROM migration_log 
        WHERE migration_date > NOW() - INTERVAL '30 days'
        GROUP BY old_tier, new_tier
      ),
      user_counts AS (
        SELECT 
          tier,
          COUNT(*) as user_count
        FROM users
        WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY tier
      )
      SELECT 
        COALESCE(tc.change_count, 0) as conversions,
        tc.old_tier,
        tc.new_tier,
        uc.user_count as total_users
      FROM tier_changes tc
      FULL OUTER JOIN user_counts uc ON tc.old_tier = uc.tier
      WHERE tc.old_tier IS NOT NULL AND tc.new_tier IS NOT NULL
    `;

    const result = await this.pool.query(conversionQuery);
    
    let explorerToCreator = 0;
    let creatorToMaster = 0;
    let totalConversions = 0;

    for (const row of result.rows) {
      if (row.old_tier === 'explorer' && row.new_tier === 'creator') {
        explorerToCreator = row.conversions;
      } else if (row.old_tier === 'creator' && row.new_tier === 'master') {
        creatorToMaster = row.conversions;
      }
      totalConversions += row.conversions;
    }

    return {
      explorerToCreator,
      creatorToMaster,
      totalConversions,
      period,
    };
  }

  // Get usage metrics
  async getUsageMetrics(): Promise<UsageMetrics> {
    const usageQuery = `
      SELECT 
        SUM(generations_used) as total_generations,
        AVG(generations_used) as avg_generations_per_user,
        SUM(private_slots_used) as private_adventure_usage,
        (SELECT SUM(views) FROM adventure_stats) as gallery_views,
        (SELECT COUNT(*) FROM search_stats WHERE search_date > NOW() - INTERVAL '24 hours') as search_queries
      FROM users
      WHERE period_start > NOW() - INTERVAL '30 days'
    `;

    const result = await this.pool.query(usageQuery);
    const row = result.rows[0];

    return {
      totalGenerations: parseInt(row.total_generations) || 0,
      averageGenerationsPerUser: parseFloat(row.avg_generations_per_user) || 0,
      privateAdventureUsage: parseInt(row.private_adventure_usage) || 0,
      galleryViews: parseInt(row.gallery_views) || 0,
      searchQueries: parseInt(row.search_queries) || 0,
    };
  }

  // Get performance metrics
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    // These would typically come from application monitoring tools
    // For now, we'll simulate or get basic database metrics
    
    const dbStatsQuery = `
      SELECT 
        numbackends as active_connections,
        xact_commit,
        xact_rollback,
        blks_read,
        blks_hit
      FROM pg_stat_database 
      WHERE datname = current_database()
    `;

    const result = await this.pool.query(dbStatsQuery);
    const row = result.rows[0];

    const totalTransactions = parseInt(row.xact_commit) + parseInt(row.xact_rollback);
    const errorRate = totalTransactions > 0 ? parseInt(row.xact_rollback) / totalTransactions : 0;
    const cacheHitRate = (parseInt(row.blks_hit) / (parseInt(row.blks_hit) + parseInt(row.blks_read))) || 0;

    return {
      averageResponseTime: 150, // Would come from APM tool
      errorRate: errorRate,
      databaseConnections: parseInt(row.active_connections),
      cacheHitRate: cacheHitRate,
    };
  }

  // Get business metrics
  async getBusinessMetrics(): Promise<BusinessMetrics> {
    const businessQuery = `
      WITH revenue_data AS (
        SELECT 
          u.tier,
          tc.price_monthly,
          COUNT(*) as user_count,
          COUNT(*) * tc.price_monthly as tier_revenue
        FROM users u
        JOIN tier_config tc ON u.tier = tc.tier_name
        WHERE u.subscription_status = 'active'
        GROUP BY u.tier, tc.price_monthly
      ),
      churn_data AS (
        SELECT 
          COUNT(*) as churned_users
        FROM users
        WHERE subscription_status = 'cancelled'
        AND updated_at > NOW() - INTERVAL '30 days'
      )
      SELECT 
        SUM(tier_revenue) as mrr,
        (SELECT churned_users FROM churn_data) as churned,
        COUNT(*) as total_active_users
      FROM revenue_data
    `;

    const result = await this.pool.query(businessQuery);
    const row = result.rows[0];

    const mrr = parseInt(row.mrr) || 0;
    const churned = parseInt(row.churned) || 0;
    const totalActive = parseInt(row.total_active_users) || 1;
    
    const churnRate = churned / totalActive;
    const arpu = mrr / totalActive;
    const clv = arpu / churnRate; // Simplified CLV calculation

    return {
      monthlyRecurringRevenue: mrr,
      churnRate: churnRate,
      customerLifetimeValue: clv,
      averageRevenuePerUser: arpu,
    };
  }

  // Store metrics in database
  private async storeMetrics(timestamp: Date, metrics: any): Promise<void> {
    try {
      await this.pool.query(`
        INSERT INTO monitoring_metrics (
          timestamp,
          conversion_metrics,
          usage_metrics,
          performance_metrics,
          business_metrics
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        timestamp,
        JSON.stringify(metrics.conversion),
        JSON.stringify(metrics.usage),
        JSON.stringify(metrics.performance),
        JSON.stringify(metrics.business),
      ]);
    } catch (error) {
      // Create table if it doesn't exist
      await this.createMonitoringTable();
      // Retry insert
      await this.pool.query(`
        INSERT INTO monitoring_metrics (
          timestamp,
          conversion_metrics,
          usage_metrics,
          performance_metrics,
          business_metrics
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        timestamp,
        JSON.stringify(metrics.conversion),
        JSON.stringify(metrics.usage),
        JSON.stringify(metrics.performance),
        JSON.stringify(metrics.business),
      ]);
    }
  }

  // Create monitoring table
  private async createMonitoringTable(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS monitoring_metrics (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL,
        conversion_metrics JSONB,
        usage_metrics JSONB,
        performance_metrics JSONB,
        business_metrics JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_monitoring_metrics_timestamp 
      ON monitoring_metrics(timestamp);
    `);
  }

  // Check for alerts
  private async checkAlerts(
    conversion: ConversionMetrics,
    performance: PerformanceMetrics,
    business: BusinessMetrics
  ): Promise<void> {
    const alerts = [];

    // Conversion rate alerts
    if (conversion.explorerToCreator < this.alertThresholds.conversionRate * 100) {
      alerts.push({
        type: 'conversion',
        severity: 'warning',
        message: `Explorer to Creator conversion rate is low: ${conversion.explorerToCreator}%`,
        threshold: this.alertThresholds.conversionRate * 100,
        actual: conversion.explorerToCreator,
      });
    }

    // Performance alerts
    if (performance.errorRate > this.alertThresholds.errorRate) {
      alerts.push({
        type: 'performance',
        severity: 'critical',
        message: `Error rate is high: ${(performance.errorRate * 100).toFixed(2)}%`,
        threshold: this.alertThresholds.errorRate * 100,
        actual: performance.errorRate * 100,
      });
    }

    if (performance.averageResponseTime > this.alertThresholds.responseTime) {
      alerts.push({
        type: 'performance',
        severity: 'warning',
        message: `Response time is high: ${performance.averageResponseTime}ms`,
        threshold: this.alertThresholds.responseTime,
        actual: performance.averageResponseTime,
      });
    }

    // Business alerts
    if (business.churnRate > this.alertThresholds.churnRate) {
      alerts.push({
        type: 'business',
        severity: 'warning',
        message: `Churn rate is high: ${(business.churnRate * 100).toFixed(2)}%`,
        threshold: this.alertThresholds.churnRate * 100,
        actual: business.churnRate * 100,
      });
    }

    // Send alerts
    for (const alert of alerts) {
      await this.sendAlert(alert);
    }
  }

  // Send alert
  private async sendAlert(alert: any): Promise<void> {
    console.log(`🚨 ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
    
    // Store alert in database
    try {
      await this.pool.query(`
        INSERT INTO monitoring_alerts (
          alert_type,
          severity,
          message,
          threshold_value,
          actual_value,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
      `, [
        alert.type,
        alert.severity,
        alert.message,
        alert.threshold,
        alert.actual,
      ]);
    } catch (error) {
      // Create alerts table if it doesn't exist
      await this.createAlertsTable();
      await this.pool.query(`
        INSERT INTO monitoring_alerts (
          alert_type,
          severity,
          message,
          threshold_value,
          actual_value,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
      `, [
        alert.type,
        alert.severity,
        alert.message,
        alert.threshold,
        alert.actual,
      ]);
    }

    // Emit alert event
    this.emit('alert', alert);

    // TODO: Send to external alerting system (Slack, PagerDuty, etc.)
  }

  // Create alerts table
  private async createAlertsTable(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS monitoring_alerts (
        id SERIAL PRIMARY KEY,
        alert_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        threshold_value DECIMAL,
        actual_value DECIMAL,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_type_severity 
      ON monitoring_alerts(alert_type, severity);
      
      CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_created 
      ON monitoring_alerts(created_at);
    `);
  }

  // Get metrics history
  async getMetricsHistory(hours: number = 24): Promise<any[]> {
    const result = await this.pool.query(`
      SELECT 
        timestamp,
        conversion_metrics,
        usage_metrics,
        performance_metrics,
        business_metrics
      FROM monitoring_metrics
      WHERE timestamp > NOW() - INTERVAL '${hours} hours'
      ORDER BY timestamp DESC
    `);

    return result.rows;
  }

  // Get active alerts
  async getActiveAlerts(): Promise<any[]> {
    const result = await this.pool.query(`
      SELECT 
        alert_type,
        severity,
        message,
        threshold_value,
        actual_value,
        created_at
      FROM monitoring_alerts
      WHERE resolved_at IS NULL
      ORDER BY created_at DESC
    `);

    return result.rows;
  }

  // Generate monitoring report
  async generateReport(hours: number = 24): Promise<string> {
    const metrics = await this.getMetricsHistory(hours);
    const alerts = await this.getActiveAlerts();

    if (metrics.length === 0) {
      return 'No metrics data available for the specified period.';
    }

    const latest = metrics[0];
    const conversion = latest.conversion_metrics;
    const usage = latest.usage_metrics;
    const performance = latest.performance_metrics;
    const business = latest.business_metrics;

    const report = `# Arcanum Scribe Monitoring Report

**Period**: Last ${hours} hours
**Generated**: ${new Date().toISOString()}

## Key Metrics

### Conversion Rates
- Explorer to Creator: ${conversion.explorerToCreator}%
- Creator to Master: ${conversion.creatorToMaster}%
- Total Conversions: ${conversion.totalConversions}

### Usage Statistics
- Total Generations: ${usage.totalGenerations.toLocaleString()}
- Avg Generations/User: ${usage.averageGenerationsPerUser.toFixed(2)}
- Private Adventures: ${usage.privateAdventureUsage.toLocaleString()}
- Gallery Views: ${usage.galleryViews.toLocaleString()}
- Search Queries: ${usage.searchQueries.toLocaleString()}

### Performance
- Avg Response Time: ${performance.averageResponseTime}ms
- Error Rate: ${(performance.errorRate * 100).toFixed(2)}%
- DB Connections: ${performance.databaseConnections}
- Cache Hit Rate: ${(performance.cacheHitRate * 100).toFixed(2)}%

### Business Metrics
- Monthly Recurring Revenue: $${(business.monthlyRecurringRevenue / 100).toFixed(2)}
- Churn Rate: ${(business.churnRate * 100).toFixed(2)}%
- Average Revenue Per User: $${(business.averageRevenuePerUser / 100).toFixed(2)}
- Customer Lifetime Value: $${(business.customerLifetimeValue / 100).toFixed(2)}

## Active Alerts

${alerts.length === 0 ? 'No active alerts 🎉' : 
  alerts.map(alert => 
    `- **${alert.severity.toUpperCase()}**: ${alert.message} (${alert.created_at})`
  ).join('\n')
}

## Trends

${metrics.length > 1 ? 
  `Based on ${metrics.length} data points over the last ${hours} hours:
- Conversion trend: ${this.calculateTrend(metrics, 'conversion_metrics', 'totalConversions')}
- Usage trend: ${this.calculateTrend(metrics, 'usage_metrics', 'totalGenerations')}
- Performance trend: ${this.calculateTrend(metrics, 'performance_metrics', 'averageResponseTime')}` :
  'Insufficient data for trend analysis'
}

---
*This report is automatically generated by the Arcanum Scribe monitoring system.*
`;

    return report;
  }

  // Calculate trend for a metric
  private calculateTrend(metrics: any[], category: string, field: string): string {
    if (metrics.length < 2) return 'No trend data';

    const latest = metrics[0][category][field];
    const previous = metrics[Math.floor(metrics.length / 2)][category][field];
    
    const change = ((latest - previous) / previous) * 100;
    
    if (Math.abs(change) < 1) return 'Stable';
    return change > 0 ? `Increasing (+${change.toFixed(1)}%)` : `Decreasing (${change.toFixed(1)}%)`;
  }
}

export default MonitoringService;