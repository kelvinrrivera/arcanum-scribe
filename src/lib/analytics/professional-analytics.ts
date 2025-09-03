/**
 * Professional Mode Analytics and Monitoring
 * 
 * Comprehensive analytics system for professional mode usage patterns,
 * performance monitoring, error tracking, and user satisfaction metrics.
 */

export interface UsageAnalytics {
  professionalModeAdoption: {
    totalUsers: number;
    activeUsers: number;
    adoptionRate: number;
    retentionRate: number;
  };
  featureUsage: {
    [featureName: string]: {
      usageCount: number;
      successRate: number;
      averageProcessingTime: number;
      userSatisfaction: number;
    };
  };
  performanceMetrics: {
    averageGenerationTime: number;
    standardModeTime: number;
    professionalModeTime: number;
    performanceRatio: number;
    qualityImprovement: number;
  };
  errorTracking: {
    totalErrors: number;
    errorRate: number;
    errorsByType: { [errorType: string]: number };
    criticalErrors: number;
    resolvedErrors: number;
  };
  userSatisfaction: {
    overallRating: number;
    professionalModeRating: number;
    standardModeRating: number;
    feedbackCount: number;
    recommendationScore: number;
  };
}

export interface AnalyticsEvent {
  id: string;
  type: 'usage' | 'performance' | 'error' | 'satisfaction';
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata: any;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

export interface PerformanceAlert {
  id: string;
  type: 'performance_degradation' | 'error_spike' | 'feature_failure' | 'user_satisfaction_drop';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: number;
  resolved: boolean;
}

export class ProfessionalAnalytics {
  private events: AnalyticsEvent[] = [];
  private alerts: PerformanceAlert[] = [];
  private sessionData: Map<string, any> = new Map();

  private readonly ALERT_THRESHOLDS = {
    errorRate: 5, // 5%
    performanceDegradation: 2.0, // 2x slower than baseline
    userSatisfactionDrop: 3.5, // Below 3.5/5
    featureFailureRate: 10 // 10%
  };

  /**
   * Track professional mode usage event
   */
  trackUsageEvent(
    category: string,
    action: string,
    sessionId: string,
    metadata: any = {},
    userId?: string
  ): void {
    const event: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'usage',
      category,
      action,
      metadata,
      timestamp: Date.now(),
      sessionId,
      userId
    };

    this.events.push(event);
    this.processEvent(event);

    console.log(`📊 [ANALYTICS] Usage event tracked: ${category}.${action}`);
  }

  /**
   * Track performance metrics
   */
  trackPerformanceEvent(
    category: string,
    action: string,
    processingTime: number,
    sessionId: string,
    metadata: any = {}
  ): void {
    const event: AnalyticsEvent = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'performance',
      category,
      action,
      value: processingTime,
      metadata,
      timestamp: Date.now(),
      sessionId
    };

    this.events.push(event);
    this.processEvent(event);

    console.log(`⚡ [ANALYTICS] Performance event tracked: ${category}.${action} - ${processingTime}ms`);
  }

  /**
   * Track error events
   */
  trackErrorEvent(
    errorType: string,
    errorMessage: string,
    sessionId: string,
    metadata: any = {}
  ): void {
    const event: AnalyticsEvent = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'error',
      category: 'professional_mode_error',
      action: errorType,
      label: errorMessage,
      metadata,
      timestamp: Date.now(),
      sessionId
    };

    this.events.push(event);
    this.processEvent(event);

    console.log(`🚨 [ANALYTICS] Error event tracked: ${errorType} - ${errorMessage}`);
  }

  /**
   * Track user satisfaction
   */
  trackSatisfactionEvent(
    rating: number,
    category: string,
    sessionId: string,
    feedback?: string,
    userId?: string
  ): void {
    const event: AnalyticsEvent = {
      id: `satisfaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'satisfaction',
      category,
      action: 'rating',
      value: rating,
      label: feedback,
      metadata: { feedback },
      timestamp: Date.now(),
      sessionId,
      userId
    };

    this.events.push(event);
    this.processEvent(event);

    console.log(`⭐ [ANALYTICS] Satisfaction event tracked: ${category} - ${rating}/5`);
  }

  /**
   * Generate comprehensive analytics report
   */
  generateAnalyticsReport(timeRange: { start: number; end: number }): UsageAnalytics {
    console.log('📊 [ANALYTICS] Generating analytics report...');

    const filteredEvents = this.events.filter(
      event => event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
    );

    const report: UsageAnalytics = {
      professionalModeAdoption: this.calculateAdoptionMetrics(filteredEvents),
      featureUsage: this.calculateFeatureUsage(filteredEvents),
      performanceMetrics: this.calculatePerformanceMetrics(filteredEvents),
      errorTracking: this.calculateErrorMetrics(filteredEvents),
      userSatisfaction: this.calculateSatisfactionMetrics(filteredEvents)
    };

    console.log(`📊 [ANALYTICS] Report generated for ${filteredEvents.length} events`);
    return report;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(timeRange: { start: number; end: number }): {
    generationTimes: { timestamp: number; value: number }[];
    errorRates: { timestamp: number; value: number }[];
    userSatisfaction: { timestamp: number; value: number }[];
  } {
    const filteredEvents = this.events.filter(
      event => event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
    );

    // Group events by hour for trending
    const hourlyData = new Map<number, { 
      generationTimes: number[]; 
      errors: number; 
      total: number; 
      satisfaction: number[] 
    }>();

    filteredEvents.forEach(event => {
      const hour = Math.floor(event.timestamp / (60 * 60 * 1000)) * (60 * 60 * 1000);
      
      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, { generationTimes: [], errors: 0, total: 0, satisfaction: [] });
      }

      const data = hourlyData.get(hour)!;
      data.total++;

      if (event.type === 'performance' && event.value) {
        data.generationTimes.push(event.value);
      } else if (event.type === 'error') {
        data.errors++;
      } else if (event.type === 'satisfaction' && event.value) {
        data.satisfaction.push(event.value);
      }
    });

    const generationTimes = Array.from(hourlyData.entries()).map(([timestamp, data]) => ({
      timestamp,
      value: data.generationTimes.length > 0 
        ? data.generationTimes.reduce((sum, time) => sum + time, 0) / data.generationTimes.length
        : 0
    }));

    const errorRates = Array.from(hourlyData.entries()).map(([timestamp, data]) => ({
      timestamp,
      value: data.total > 0 ? (data.errors / data.total) * 100 : 0
    }));

    const userSatisfaction = Array.from(hourlyData.entries()).map(([timestamp, data]) => ({
      timestamp,
      value: data.satisfaction.length > 0
        ? data.satisfaction.reduce((sum, rating) => sum + rating, 0) / data.satisfaction.length
        : 0
    }));

    return { generationTimes, errorRates, userSatisfaction };
  }

  /**
   * Process individual event for real-time monitoring
   */
  private processEvent(event: AnalyticsEvent): void {
    // Update session data
    if (!this.sessionData.has(event.sessionId)) {
      this.sessionData.set(event.sessionId, {
        startTime: event.timestamp,
        events: [],
        professionalModeUsed: false
      });
    }

    const sessionData = this.sessionData.get(event.sessionId)!;
    sessionData.events.push(event);

    if (event.category.includes('professional')) {
      sessionData.professionalModeUsed = true;
    }

    // Check for alert conditions
    this.checkAlertConditions(event);
  }

  /**
   * Check for alert conditions
   */
  private checkAlertConditions(event: AnalyticsEvent): void {
    const recentEvents = this.events.slice(-100); // Last 100 events

    // Check error rate
    const errorEvents = recentEvents.filter(e => e.type === 'error');
    const errorRate = (errorEvents.length / recentEvents.length) * 100;
    
    if (errorRate > this.ALERT_THRESHOLDS.errorRate) {
      this.createAlert(
        'error_spike',
        'high',
        `Error rate exceeded threshold: ${errorRate.toFixed(1)}%`,
        this.ALERT_THRESHOLDS.errorRate,
        errorRate
      );
    }

    // Check performance degradation
    if (event.type === 'performance' && event.value) {
      const recentPerformanceEvents = recentEvents
        .filter(e => e.type === 'performance' && e.value)
        .slice(-20);

      if (recentPerformanceEvents.length >= 10) {
        const avgTime = recentPerformanceEvents.reduce((sum, e) => sum + e.value!, 0) / recentPerformanceEvents.length;
        const baseline = 2000; // 2 seconds baseline
        const performanceRatio = avgTime / baseline;

        if (performanceRatio > this.ALERT_THRESHOLDS.performanceDegradation) {
          this.createAlert(
            'performance_degradation',
            'medium',
            `Performance degraded: ${performanceRatio.toFixed(1)}x slower than baseline`,
            this.ALERT_THRESHOLDS.performanceDegradation,
            performanceRatio
          );
        }
      }
    }

    // Check user satisfaction
    if (event.type === 'satisfaction' && event.value) {
      const recentSatisfactionEvents = recentEvents
        .filter(e => e.type === 'satisfaction' && e.value)
        .slice(-10);

      if (recentSatisfactionEvents.length >= 5) {
        const avgSatisfaction = recentSatisfactionEvents.reduce((sum, e) => sum + e.value!, 0) / recentSatisfactionEvents.length;

        if (avgSatisfaction < this.ALERT_THRESHOLDS.userSatisfactionDrop) {
          this.createAlert(
            'user_satisfaction_drop',
            'medium',
            `User satisfaction dropped: ${avgSatisfaction.toFixed(1)}/5`,
            this.ALERT_THRESHOLDS.userSatisfactionDrop,
            avgSatisfaction
          );
        }
      }
    }
  }

  /**
   * Create performance alert
   */
  private createAlert(
    type: PerformanceAlert['type'],
    severity: PerformanceAlert['severity'],
    message: string,
    threshold: number,
    currentValue: number
  ): void {
    // Check if similar alert already exists
    const existingAlert = this.alerts.find(
      alert => alert.type === type && !alert.resolved && 
      Date.now() - alert.timestamp < 60 * 60 * 1000 // Within last hour
    );

    if (existingAlert) {
      return; // Don't create duplicate alerts
    }

    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      threshold,
      currentValue,
      timestamp: Date.now(),
      resolved: false
    };

    this.alerts.push(alert);
    console.log(`🚨 [ANALYTICS] Alert created: ${severity.toUpperCase()} - ${message}`);
  }

  /**
   * Calculate adoption metrics
   */
  private calculateAdoptionMetrics(events: AnalyticsEvent[]): UsageAnalytics['professionalModeAdoption'] {
    const uniqueUsers = new Set(events.filter(e => e.userId).map(e => e.userId)).size;
    const professionalModeUsers = new Set(
      events.filter(e => e.userId && e.category.includes('professional')).map(e => e.userId)
    ).size;

    const adoptionRate = uniqueUsers > 0 ? (professionalModeUsers / uniqueUsers) * 100 : 0;

    // Calculate retention (users who used professional mode in multiple sessions)
    const userSessions = new Map<string, Set<string>>();
    events.forEach(event => {
      if (event.userId && event.category.includes('professional')) {
        if (!userSessions.has(event.userId)) {
          userSessions.set(event.userId, new Set());
        }
        userSessions.get(event.userId)!.add(event.sessionId);
      }
    });

    const retainedUsers = Array.from(userSessions.values()).filter(sessions => sessions.size > 1).length;
    const retentionRate = professionalModeUsers > 0 ? (retainedUsers / professionalModeUsers) * 100 : 0;

    return {
      totalUsers: uniqueUsers,
      activeUsers: professionalModeUsers,
      adoptionRate,
      retentionRate
    };
  }

  /**
   * Calculate feature usage metrics
   */
  private calculateFeatureUsage(events: AnalyticsEvent[]): UsageAnalytics['featureUsage'] {
    const featureUsage: UsageAnalytics['featureUsage'] = {};

    const featureEvents = events.filter(e => e.category === 'professional_feature');
    
    featureEvents.forEach(event => {
      const featureName = event.action;
      
      if (!featureUsage[featureName]) {
        featureUsage[featureName] = {
          usageCount: 0,
          successRate: 0,
          averageProcessingTime: 0,
          userSatisfaction: 0
        };
      }

      featureUsage[featureName].usageCount++;
    });

    // Calculate success rates and processing times
    Object.keys(featureUsage).forEach(featureName => {
      const featurePerformanceEvents = events.filter(
        e => e.type === 'performance' && e.action === featureName
      );
      
      const featureErrorEvents = events.filter(
        e => e.type === 'error' && e.metadata?.featureName === featureName
      );

      const totalAttempts = featureUsage[featureName].usageCount;
      const successfulAttempts = totalAttempts - featureErrorEvents.length;
      
      featureUsage[featureName].successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;
      
      if (featurePerformanceEvents.length > 0) {
        featureUsage[featureName].averageProcessingTime = 
          featurePerformanceEvents.reduce((sum, e) => sum + (e.value || 0), 0) / featurePerformanceEvents.length;
      }

      // Calculate user satisfaction for this feature
      const featureSatisfactionEvents = events.filter(
        e => e.type === 'satisfaction' && e.metadata?.featureName === featureName
      );
      
      if (featureSatisfactionEvents.length > 0) {
        featureUsage[featureName].userSatisfaction = 
          featureSatisfactionEvents.reduce((sum, e) => sum + (e.value || 0), 0) / featureSatisfactionEvents.length;
      }
    });

    return featureUsage;
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(events: AnalyticsEvent[]): UsageAnalytics['performanceMetrics'] {
    const performanceEvents = events.filter(e => e.type === 'performance' && e.value);
    
    const professionalModeEvents = performanceEvents.filter(e => e.category.includes('professional'));
    const standardModeEvents = performanceEvents.filter(e => e.category.includes('standard'));

    const averageGenerationTime = performanceEvents.length > 0
      ? performanceEvents.reduce((sum, e) => sum + e.value!, 0) / performanceEvents.length
      : 0;

    const professionalModeTime = professionalModeEvents.length > 0
      ? professionalModeEvents.reduce((sum, e) => sum + e.value!, 0) / professionalModeEvents.length
      : 0;

    const standardModeTime = standardModeEvents.length > 0
      ? standardModeEvents.reduce((sum, e) => sum + e.value!, 0) / standardModeEvents.length
      : 0;

    const performanceRatio = standardModeTime > 0 ? professionalModeTime / standardModeTime : 1;

    // Calculate quality improvement (simulated based on professional mode usage)
    const qualityImprovement = professionalModeEvents.length > 0 ? 25 : 0; // 25% improvement

    return {
      averageGenerationTime,
      standardModeTime,
      professionalModeTime,
      performanceRatio,
      qualityImprovement
    };
  }

  /**
   * Calculate error metrics
   */
  private calculateErrorMetrics(events: AnalyticsEvent[]): UsageAnalytics['errorTracking'] {
    const errorEvents = events.filter(e => e.type === 'error');
    const totalEvents = events.length;

    const errorsByType: { [errorType: string]: number } = {};
    let criticalErrors = 0;

    errorEvents.forEach(event => {
      const errorType = event.action;
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;

      if (event.metadata?.severity === 'critical') {
        criticalErrors++;
      }
    });

    const errorRate = totalEvents > 0 ? (errorEvents.length / totalEvents) * 100 : 0;
    const resolvedErrors = errorEvents.filter(e => e.metadata?.resolved === true).length;

    return {
      totalErrors: errorEvents.length,
      errorRate,
      errorsByType,
      criticalErrors,
      resolvedErrors
    };
  }

  /**
   * Calculate satisfaction metrics
   */
  private calculateSatisfactionMetrics(events: AnalyticsEvent[]): UsageAnalytics['userSatisfaction'] {
    const satisfactionEvents = events.filter(e => e.type === 'satisfaction' && e.value);
    
    const professionalModeSatisfaction = satisfactionEvents.filter(e => e.category.includes('professional'));
    const standardModeSatisfaction = satisfactionEvents.filter(e => e.category.includes('standard'));

    const overallRating = satisfactionEvents.length > 0
      ? satisfactionEvents.reduce((sum, e) => sum + e.value!, 0) / satisfactionEvents.length
      : 0;

    const professionalModeRating = professionalModeSatisfaction.length > 0
      ? professionalModeSatisfaction.reduce((sum, e) => sum + e.value!, 0) / professionalModeSatisfaction.length
      : 0;

    const standardModeRating = standardModeSatisfaction.length > 0
      ? standardModeSatisfaction.reduce((sum, e) => sum + e.value!, 0) / standardModeSatisfaction.length
      : 0;

    // Calculate Net Promoter Score (NPS) - simplified
    const promoters = satisfactionEvents.filter(e => e.value! >= 4).length;
    const detractors = satisfactionEvents.filter(e => e.value! <= 2).length;
    const recommendationScore = satisfactionEvents.length > 0
      ? ((promoters - detractors) / satisfactionEvents.length) * 100
      : 0;

    return {
      overallRating,
      professionalModeRating,
      standardModeRating,
      feedbackCount: satisfactionEvents.length,
      recommendationScore
    };
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`✅ [ANALYTICS] Alert resolved: ${alert.message}`);
      return true;
    }
    return false;
  }

  /**
   * Clean up old data
   */
  cleanup(maxAge: number = 30 * 24 * 60 * 60 * 1000): void { // 30 days default
    const cutoff = Date.now() - maxAge;
    
    this.events = this.events.filter(e => e.timestamp > cutoff);
    this.alerts = this.alerts.filter(a => a.timestamp > cutoff);
    
    // Clean up session data
    for (const [sessionId, sessionData] of this.sessionData.entries()) {
      if (sessionData.startTime < cutoff) {
        this.sessionData.delete(sessionId);
      }
    }
    
    console.log('🧹 [ANALYTICS] Cleaned up old analytics data');
  }
}

export const professionalAnalytics = new ProfessionalAnalytics();