import { Pool } from 'pg';
import MonitoringService from '../server/monitoring-service';
import dotenv from 'dotenv';

dotenv.config();

class MonitoringRunner {
  private pool: Pool;
  private monitoringService: MonitoringService;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.monitoringService = new MonitoringService(this.pool);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Handle metrics events
    this.monitoringService.on('metrics', (data) => {
      console.log(`📊 Metrics collected at ${data.timestamp}`);
      console.log(`   Conversions: ${data.conversion.totalConversions}`);
      console.log(`   Generations: ${data.usage.totalGenerations}`);
      console.log(`   Error Rate: ${(data.performance.errorRate * 100).toFixed(2)}%`);
      console.log(`   MRR: $${(data.business.monthlyRecurringRevenue / 100).toFixed(2)}`);
    });

    // Handle alerts
    this.monitoringService.on('alert', (alert) => {
      console.log(`🚨 ${alert.severity.toUpperCase()} ALERT: ${alert.message}`);
      
      // Here you could integrate with external alerting systems
      // await this.sendToSlack(alert);
      // await this.sendToPagerDuty(alert);
    });

    // Handle errors
    this.monitoringService.on('error', (error) => {
      console.error('❌ Monitoring error:', error);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down monitoring service...');
      this.shutdown();
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down monitoring service...');
      this.shutdown();
    });
  }

  async start(): Promise<void> {
    console.log('🚀 Starting Arcanum Scribe monitoring service...');
    
    try {
      // Test database connection
      await this.pool.query('SELECT 1');
      console.log('✅ Database connection established');

      // Start monitoring with 5-minute intervals
      this.monitoringService.startMonitoring(300000);
      console.log('✅ Monitoring service started (5-minute intervals)');

      // Generate initial report
      const report = await this.monitoringService.generateReport(24);
      console.log('\n📋 Initial 24-hour report:');
      console.log(report);

    } catch (error) {
      console.error('❌ Failed to start monitoring service:', error);
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    try {
      this.monitoringService.stopMonitoring();
      await this.pool.end();
      console.log('✅ Monitoring service stopped gracefully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Start monitoring if this script is run directly
if (require.main === module) {
  const runner = new MonitoringRunner();
  runner.start().catch((error) => {
    console.error('❌ Failed to start monitoring:', error);
    process.exit(1);
  });
}

export default MonitoringRunner;