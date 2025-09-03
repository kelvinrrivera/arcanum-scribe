import { Pool } from 'pg';
import MonitoringService from '../server/monitoring-service';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

class ReportGenerator {
  private pool: Pool;
  private monitoringService: MonitoringService;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.monitoringService = new MonitoringService(this.pool);
  }

  async generateReport(hours: number = 24, outputFile?: string): Promise<void> {
    console.log(`📊 Generating monitoring report for the last ${hours} hours...`);

    try {
      // Generate the report
      const report = await this.monitoringService.generateReport(hours);
      
      // Output to console
      console.log('\n' + report);

      // Save to file if specified
      if (outputFile) {
        const fullPath = path.resolve(outputFile);
        await fs.writeFile(fullPath, report);
        console.log(`\n💾 Report saved to: ${fullPath}`);
      }

      // Also save with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const timestampedFile = `monitoring-report-${timestamp}.md`;
      await fs.writeFile(timestampedFile, report);
      console.log(`💾 Report saved to: ${timestampedFile}`);

      // Generate summary metrics
      await this.generateSummaryMetrics(hours);

    } catch (error) {
      console.error('❌ Error generating report:', error);
      throw error;
    } finally {
      await this.pool.end();
    }
  }

  private async generateSummaryMetrics(hours: number): Promise<void> {
    console.log('\n📈 Summary Metrics:');

    try {
      // Get latest metrics
      const metrics = await this.monitoringService.getMetricsHistory(1);
      if (metrics.length === 0) {
        console.log('No metrics data available');
        return;
      }

      const latest = metrics[0];
      const conversion = latest.conversion_metrics;
      const usage = latest.usage_metrics;
      const performance = latest.performance_metrics;
      const business = latest.business_metrics;

      // Conversion metrics
      console.log('\n🔄 Conversion Rates:');
      console.log(`   Explorer → Creator: ${conversion.explorerToCreator}%`);
      console.log(`   Creator → Master: ${conversion.creatorToMaster}%`);
      
      // Usage metrics
      console.log('\n📊 Usage Statistics:');
      console.log(`   Total Generations: ${usage.totalGenerations.toLocaleString()}`);
      console.log(`   Avg per User: ${usage.averageGenerationsPerUser.toFixed(2)}`);
      console.log(`   Gallery Views: ${usage.galleryViews.toLocaleString()}`);
      
      // Performance metrics
      console.log('\n⚡ Performance:');
      console.log(`   Response Time: ${performance.averageResponseTime}ms`);
      console.log(`   Error Rate: ${(performance.errorRate * 100).toFixed(3)}%`);
      console.log(`   Cache Hit Rate: ${(performance.cacheHitRate * 100).toFixed(1)}%`);
      
      // Business metrics
      console.log('\n💰 Business:');
      console.log(`   MRR: $${(business.monthlyRecurringRevenue / 100).toLocaleString()}`);
      console.log(`   Churn Rate: ${(business.churnRate * 100).toFixed(2)}%`);
      console.log(`   ARPU: $${(business.averageRevenuePerUser / 100).toFixed(2)}`);

      // Health check
      console.log('\n🏥 System Health:');
      const healthScore = this.calculateHealthScore(performance, conversion, business);
      console.log(`   Overall Health: ${healthScore}/100`);
      
      if (healthScore >= 90) {
        console.log('   Status: 🟢 Excellent');
      } else if (healthScore >= 75) {
        console.log('   Status: 🟡 Good');
      } else if (healthScore >= 60) {
        console.log('   Status: 🟠 Fair');
      } else {
        console.log('   Status: 🔴 Needs Attention');
      }

      // Active alerts
      const alerts = await this.monitoringService.getActiveAlerts();
      console.log(`\n🚨 Active Alerts: ${alerts.length}`);
      if (alerts.length > 0) {
        alerts.slice(0, 5).forEach(alert => {
          console.log(`   ${alert.severity.toUpperCase()}: ${alert.message}`);
        });
      }

    } catch (error) {
      console.error('❌ Error generating summary metrics:', error);
    }
  }

  private calculateHealthScore(performance: any, conversion: any, business: any): number {
    let score = 100;

    // Performance penalties
    if (performance.errorRate > 0.01) score -= 20; // > 1% error rate
    if (performance.averageResponseTime > 2000) score -= 15; // > 2s response time
    if (performance.cacheHitRate < 0.8) score -= 10; // < 80% cache hit rate

    // Conversion penalties
    if (conversion.explorerToCreator < 5) score -= 15; // < 5% conversion
    if (conversion.creatorToMaster < 20) score -= 10; // < 20% upgrade rate

    // Business penalties
    if (business.churnRate > 0.1) score -= 20; // > 10% churn
    if (business.monthlyRecurringRevenue < 10000) score -= 10; // < $100 MRR

    return Math.max(0, score);
  }
}

// CLI execution
if (require.main === module) {
  const hours = parseInt(process.argv[2]) || 24;
  const outputFile = process.argv[3];

  const generator = new ReportGenerator();
  
  generator.generateReport(hours, outputFile)
    .then(() => {
      console.log('\n✅ Report generation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Report generation failed:', error);
      process.exit(1);
    });
}

export default ReportGenerator;