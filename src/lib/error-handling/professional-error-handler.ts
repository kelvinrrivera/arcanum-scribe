/**
 * Professional Mode Error Handling System
 * 
 * Comprehensive error handling for professional mode failures with user-friendly messages,
 * partial functionality support, and graceful fallback mechanisms.
 */

export interface ProfessionalError {
  id: string;
  type: 'feature_failure' | 'partial_failure' | 'system_error' | 'configuration_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  featureName?: string;
  message: string;
  userMessage: string;
  technicalDetails: string;
  timestamp: number;
  sessionId: string;
  recoverable: boolean;
  fallbackAvailable: boolean;
  suggestedActions: string[];
}

export interface ErrorHandlingResult {
  success: boolean;
  errors: ProfessionalError[];
  warnings: ProfessionalError[];
  fallbackApplied: boolean;
  partialFunctionality: boolean;
  availableFeatures: string[];
  unavailableFeatures: string[];
  userNotifications: UserNotification[];
}

export interface UserNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  actions?: NotificationAction[];
  dismissible: boolean;
  persistent: boolean;
  timestamp: number;
}

export interface NotificationAction {
  label: string;
  action: 'retry' | 'fallback' | 'configure' | 'dismiss' | 'help';
  data?: any;
}

export class ProfessionalErrorHandler {
  private errors: ProfessionalError[] = [];
  private notifications: UserNotification[] = [];

  /**
   * Handle professional mode errors with comprehensive recovery
   */
  async handleError(
    error: Error | ProfessionalError,
    context: {
      sessionId: string;
      featureName?: string;
      operation?: string;
      config?: any;
    }
  ): Promise<ErrorHandlingResult> {
    console.log('🚨 [ERROR-HANDLER] Processing professional mode error...');

    try {
      // Convert Error to ProfessionalError if needed
      const professionalError = this.normalizeToProfessionalError(error, context);
      
      // Log the error
      this.logError(professionalError);
      
      // Determine recovery strategy
      const recoveryStrategy = this.determineRecoveryStrategy(professionalError);
      
      // Apply recovery
      const recoveryResult = await this.applyRecovery(professionalError, recoveryStrategy, context);
      
      // Generate user notifications
      const userNotifications = this.generateUserNotifications(professionalError, recoveryResult);
      
      // Update error tracking
      this.errors.push(professionalError);
      this.notifications.push(...userNotifications);

      console.log(`🚨 [ERROR-HANDLER] Error handled with strategy: ${recoveryStrategy.type}`);
      
      return {
        success: recoveryResult.success,
        errors: [professionalError],
        warnings: recoveryResult.warnings || [],
        fallbackApplied: recoveryStrategy.type === 'fallback',
        partialFunctionality: recoveryStrategy.type === 'partial',
        availableFeatures: recoveryResult.availableFeatures || [],
        unavailableFeatures: recoveryResult.unavailableFeatures || [],
        userNotifications
      };

    } catch (handlingError) {
      console.error('💥 [ERROR-HANDLER] Error handler itself failed:', handlingError);
      
      // Create critical error notification
      const criticalNotification: UserNotification = {
        id: `critical_${Date.now()}`,
        type: 'error',
        title: 'System Error',
        message: 'Professional mode encountered a critical error. Switching to standard mode.',
        dismissible: false,
        persistent: true,
        timestamp: Date.now()
      };

      return {
        success: false,
        errors: [],
        warnings: [],
        fallbackApplied: true,
        partialFunctionality: false,
        availableFeatures: [],
        unavailableFeatures: ['all'],
        userNotifications: [criticalNotification]
      };
    }
  }

  /**
   * Handle multiple errors from pipeline processing
   */
  async handlePipelineErrors(
    errors: (Error | ProfessionalError)[],
    context: { sessionId: string; config: any }
  ): Promise<ErrorHandlingResult> {
    console.log(`🚨 [ERROR-HANDLER] Processing ${errors.length} pipeline errors...`);

    const allErrors: ProfessionalError[] = [];
    const allWarnings: ProfessionalError[] = [];
    const allNotifications: UserNotification[] = [];
    const availableFeatures: string[] = [];
    const unavailableFeatures: string[] = [];

    let fallbackApplied = false;
    let partialFunctionality = false;

    for (const error of errors) {
      const result = await this.handleError(error, context);
      
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
      allNotifications.push(...result.userNotifications);
      
      if (result.fallbackApplied) fallbackApplied = true;
      if (result.partialFunctionality) partialFunctionality = true;
      
      availableFeatures.push(...result.availableFeatures);
      unavailableFeatures.push(...result.unavailableFeatures);
    }

    // Generate summary notification
    const summaryNotification = this.generateSummaryNotification(
      allErrors,
      allWarnings,
      fallbackApplied,
      partialFunctionality
    );
    
    if (summaryNotification) {
      allNotifications.push(summaryNotification);
    }

    const success = allErrors.filter(e => e.severity === 'critical').length === 0;

    console.log(`🚨 [ERROR-HANDLER] Pipeline error handling complete - Success: ${success}`);

    return {
      success,
      errors: allErrors,
      warnings: allWarnings,
      fallbackApplied,
      partialFunctionality,
      availableFeatures: [...new Set(availableFeatures)],
      unavailableFeatures: [...new Set(unavailableFeatures)],
      userNotifications: allNotifications
    };
  }

  /**
   * Get feature availability status
   */
  getFeatureAvailability(): {
    available: string[];
    unavailable: string[];
    partial: string[];
    recommendations: string[];
  } {
    const featureStatus = {
      available: [] as string[],
      unavailable: [] as string[],
      partial: [] as string[],
      recommendations: [] as string[]
    };

    // Analyze recent errors to determine feature status
    const recentErrors = this.errors.filter(e => 
      Date.now() - e.timestamp < 5 * 60 * 1000 // Last 5 minutes
    );

    const features = [
      'enhancedPromptAnalysis',
      'multiSolutionPuzzles',
      'professionalLayout',
      'enhancedNPCs',
      'tacticalCombat',
      'editorialExcellence',
      'accessibilityFeatures',
      'mathematicalValidation'
    ];

    features.forEach(feature => {
      const featureErrors = recentErrors.filter(e => e.featureName === feature);
      
      if (featureErrors.length === 0) {
        featureStatus.available.push(feature);
      } else {
        const criticalErrors = featureErrors.filter(e => e.severity === 'critical');
        if (criticalErrors.length > 0) {
          featureStatus.unavailable.push(feature);
          featureStatus.recommendations.push(`Check ${feature} configuration`);
        } else {
          featureStatus.partial.push(feature);
          featureStatus.recommendations.push(`${feature} may have reduced functionality`);
        }
      }
    });

    return featureStatus;
  }

  /**
   * Clear old errors and notifications
   */
  cleanup(maxAge: number = 30 * 60 * 1000): void { // 30 minutes default
    const cutoff = Date.now() - maxAge;
    
    this.errors = this.errors.filter(e => e.timestamp > cutoff);
    this.notifications = this.notifications.filter(n => n.timestamp > cutoff);
    
    console.log('🧹 [ERROR-HANDLER] Cleaned up old errors and notifications');
  }

  private normalizeToProfessionalError(
    error: Error | ProfessionalError,
    context: any
  ): ProfessionalError {
    if ('type' in error && 'severity' in error) {
      return error as ProfessionalError;
    }

    const baseError = error as Error;
    
    return {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: this.classifyErrorType(baseError, context),
      severity: this.determineSeverity(baseError, context),
      featureName: context.featureName,
      message: baseError.message,
      userMessage: this.generateUserMessage(baseError, context),
      technicalDetails: baseError.stack || baseError.message,
      timestamp: Date.now(),
      sessionId: context.sessionId,
      recoverable: this.isRecoverable(baseError, context),
      fallbackAvailable: this.hasFallback(baseError, context),
      suggestedActions: this.generateSuggestedActions(baseError, context)
    };
  }

  private classifyErrorType(error: Error, context: any): ProfessionalError['type'] {
    const message = error.message.toLowerCase();
    
    if (message.includes('configuration') || message.includes('config')) {
      return 'configuration_error';
    } else if (message.includes('not available') || message.includes('adapter not found')) {
      return 'feature_failure';
    } else if (message.includes('partial') || message.includes('some features')) {
      return 'partial_failure';
    } else {
      return 'system_error';
    }
  }

  private determineSeverity(error: Error, context: any): ProfessionalError['severity'] {
    const message = error.message.toLowerCase();
    
    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical';
    } else if (message.includes('adapter not found') || message.includes('not available')) {
      return 'high';
    } else if (message.includes('partial') || message.includes('warning')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private generateUserMessage(error: Error, context: any): string {
    const featureName = context.featureName || 'Professional feature';
    const message = error.message.toLowerCase();
    
    if (message.includes('not available')) {
      return `${featureName} is currently unavailable. We'll use standard processing instead.`;
    } else if (message.includes('configuration')) {
      return `There's a configuration issue with ${featureName}. Please check your settings.`;
    } else if (message.includes('timeout')) {
      return `${featureName} is taking longer than expected. We'll continue with available features.`;
    } else {
      return `${featureName} encountered an issue, but we'll continue processing your request.`;
    }
  }

  private isRecoverable(error: Error, context: any): boolean {
    const message = error.message.toLowerCase();
    return !message.includes('critical') && !message.includes('fatal');
  }

  private hasFallback(error: Error, context: any): boolean {
    // Most professional features have standard mode fallbacks
    return context.featureName !== undefined;
  }

  private generateSuggestedActions(error: Error, context: any): string[] {
    const actions: string[] = [];
    const message = error.message.toLowerCase();
    
    if (message.includes('configuration')) {
      actions.push('Check professional mode configuration');
      actions.push('Reset to default settings');
    } else if (message.includes('not available')) {
      actions.push('Try again later');
      actions.push('Use standard mode');
    } else if (message.includes('timeout')) {
      actions.push('Reduce feature complexity');
      actions.push('Try speed-optimized mode');
    } else {
      actions.push('Retry the operation');
      actions.push('Contact support if issue persists');
    }
    
    return actions;
  }

  private logError(error: ProfessionalError): void {
    const logLevel = error.severity === 'critical' ? 'error' : 
                    error.severity === 'high' ? 'warn' : 'info';
    
    console[logLevel](`🚨 [ERROR-HANDLER] ${error.type.toUpperCase()}: ${error.message}`, {
      id: error.id,
      featureName: error.featureName,
      sessionId: error.sessionId,
      recoverable: error.recoverable,
      technicalDetails: error.technicalDetails
    });
  }

  private determineRecoveryStrategy(error: ProfessionalError): {
    type: 'retry' | 'fallback' | 'partial' | 'abort';
    reason: string;
  } {
    if (error.severity === 'critical') {
      return { type: 'abort', reason: 'Critical error requires full fallback' };
    } else if (error.fallbackAvailable && error.severity === 'high') {
      return { type: 'fallback', reason: 'High severity error with fallback available' };
    } else if (error.recoverable && error.severity === 'medium') {
      return { type: 'partial', reason: 'Recoverable error allows partial functionality' };
    } else {
      return { type: 'retry', reason: 'Low severity error can be retried' };
    }
  }

  private async applyRecovery(
    error: ProfessionalError,
    strategy: { type: string; reason: string },
    context: any
  ): Promise<{
    success: boolean;
    warnings?: ProfessionalError[];
    availableFeatures?: string[];
    unavailableFeatures?: string[];
  }> {
    console.log(`🔧 [ERROR-HANDLER] Applying recovery strategy: ${strategy.type}`);

    switch (strategy.type) {
      case 'fallback':
        return {
          success: true,
          availableFeatures: [],
          unavailableFeatures: [error.featureName || 'unknown']
        };

      case 'partial':
        return {
          success: true,
          warnings: [{
            ...error,
            severity: 'low' as const,
            userMessage: `${error.featureName} is running with reduced functionality`
          }],
          availableFeatures: [error.featureName || 'unknown'],
          unavailableFeatures: []
        };

      case 'retry':
        // Simulate retry logic
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          success: Math.random() > 0.3, // 70% success rate on retry
          availableFeatures: [error.featureName || 'unknown'],
          unavailableFeatures: []
        };

      case 'abort':
      default:
        return {
          success: false,
          availableFeatures: [],
          unavailableFeatures: ['all']
        };
    }
  }

  private generateUserNotifications(
    error: ProfessionalError,
    recoveryResult: any
  ): UserNotification[] {
    const notifications: UserNotification[] = [];

    // Main error notification
    notifications.push({
      id: `notification_${error.id}`,
      type: error.severity === 'critical' ? 'error' : 
            error.severity === 'high' ? 'warning' : 'info',
      title: this.getNotificationTitle(error),
      message: error.userMessage,
      actions: this.generateNotificationActions(error),
      dismissible: error.severity !== 'critical',
      persistent: error.severity === 'critical',
      timestamp: Date.now()
    });

    // Recovery notification if applicable
    if (recoveryResult.success && error.severity !== 'low') {
      notifications.push({
        id: `recovery_${error.id}`,
        type: 'success',
        title: 'Issue Resolved',
        message: 'We\'ve resolved the issue and your request is continuing to process.',
        dismissible: true,
        persistent: false,
        timestamp: Date.now()
      });
    }

    return notifications;
  }

  private getNotificationTitle(error: ProfessionalError): string {
    switch (error.type) {
      case 'feature_failure':
        return 'Feature Unavailable';
      case 'partial_failure':
        return 'Reduced Functionality';
      case 'configuration_error':
        return 'Configuration Issue';
      case 'system_error':
      default:
        return 'System Notice';
    }
  }

  private generateNotificationActions(error: ProfessionalError): NotificationAction[] {
    const actions: NotificationAction[] = [];

    if (error.recoverable) {
      actions.push({
        label: 'Retry',
        action: 'retry',
        data: { errorId: error.id }
      });
    }

    if (error.fallbackAvailable) {
      actions.push({
        label: 'Use Standard Mode',
        action: 'fallback',
        data: { errorId: error.id }
      });
    }

    if (error.type === 'configuration_error') {
      actions.push({
        label: 'Check Settings',
        action: 'configure',
        data: { feature: error.featureName }
      });
    }

    actions.push({
      label: 'Get Help',
      action: 'help',
      data: { errorType: error.type }
    });

    return actions;
  }

  private generateSummaryNotification(
    errors: ProfessionalError[],
    warnings: ProfessionalError[],
    fallbackApplied: boolean,
    partialFunctionality: boolean
  ): UserNotification | null {
    if (errors.length === 0 && warnings.length === 0) {
      return null;
    }

    let title = 'Professional Mode Status';
    let message = '';
    let type: UserNotification['type'] = 'info';

    if (fallbackApplied) {
      title = 'Using Standard Mode';
      message = 'Some professional features are unavailable. We\'ve switched to standard mode to ensure your request completes successfully.';
      type = 'warning';
    } else if (partialFunctionality) {
      title = 'Partial Professional Mode';
      message = 'Some professional features are running with reduced functionality, but your request is processing normally.';
      type = 'info';
    } else if (warnings.length > 0) {
      title = 'Professional Mode Active';
      message = 'Professional mode is active with minor adjustments for optimal performance.';
      type = 'success';
    }

    return {
      id: `summary_${Date.now()}`,
      type,
      title,
      message,
      dismissible: true,
      persistent: false,
      timestamp: Date.now()
    };
  }
}

export const professionalErrorHandler = new ProfessionalErrorHandler();