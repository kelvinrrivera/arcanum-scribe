/**
 * Error Notification System Component
 * 
 * Displays user-friendly error notifications and feedback for professional mode
 * with actionable recovery options and status indicators.
 */

import React, { useState, useEffect } from 'react';
import type { UserNotification, NotificationAction } from '../../lib/error-handling/professional-error-handler';

interface ErrorNotificationSystemProps {
  notifications: UserNotification[];
  onActionClick: (action: NotificationAction, notificationId: string) => void;
  onDismiss: (notificationId: string) => void;
}

export const ErrorNotificationSystem: React.FC<ErrorNotificationSystemProps> = ({
  notifications,
  onActionClick,
  onDismiss
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<UserNotification[]>([]);

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  const handleDismiss = (notificationId: string) => {
    setVisibleNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
    onDismiss(notificationId);
  };

  const getNotificationIcon = (type: UserNotification['type']) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getNotificationStyles = (type: UserNotification['type']) => {
    const baseStyles = 'border-l-4 p-4 mb-3 rounded-r-lg shadow-sm';
    
    switch (type) {
      case 'error':
        return `${baseStyles} bg-red-50 border-red-400 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`;
      case 'success':
        return `${baseStyles} bg-green-50 border-green-400 text-green-800`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`;
    }
  };

  const getActionButtonStyles = (action: NotificationAction['action']) => {
    const baseStyles = 'px-3 py-1 text-sm rounded-md font-medium transition-colors';
    
    switch (action) {
      case 'retry':
        return `${baseStyles} bg-blue-100 text-blue-700 hover:bg-blue-200`;
      case 'fallback':
        return `${baseStyles} bg-gray-100 text-gray-700 hover:bg-gray-200`;
      case 'configure':
        return `${baseStyles} bg-purple-100 text-purple-700 hover:bg-purple-200`;
      case 'help':
        return `${baseStyles} bg-indigo-100 text-indigo-700 hover:bg-indigo-200`;
      case 'dismiss':
      default:
        return `${baseStyles} bg-gray-100 text-gray-600 hover:bg-gray-200`;
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="error-notification-system space-y-3 mb-6">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={getNotificationStyles(notification.type)}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 text-lg mr-3">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1">
                {notification.title}
              </h4>
              
              <p className="text-sm opacity-90 mb-3">
                {notification.message}
              </p>
              
              {notification.actions && notification.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => onActionClick(action, notification.id)}
                      className={getActionButtonStyles(action.action)}
                      aria-label={`${action.label} for ${notification.title}`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {notification.dismissible && (
              <button
                onClick={() => handleDismiss(notification.id)}
                className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss notification"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Feature Availability Indicator Component
 */
interface FeatureAvailabilityProps {
  availableFeatures: string[];
  unavailableFeatures: string[];
  partialFeatures: string[];
}

export const FeatureAvailabilityIndicator: React.FC<FeatureAvailabilityProps> = ({
  availableFeatures,
  unavailableFeatures,
  partialFeatures
}) => {
  const featureDisplayNames = {
    enhancedPromptAnalysis: 'Enhanced Prompts',
    multiSolutionPuzzles: 'Multi-Solution Puzzles',
    professionalLayout: 'Professional Layout',
    enhancedNPCs: 'Enhanced NPCs',
    tacticalCombat: 'Tactical Combat',
    editorialExcellence: 'Editorial Excellence',
    accessibilityFeatures: 'Accessibility',
    mathematicalValidation: 'Math Validation'
  };

  const getFeatureStatus = (featureName: string) => {
    if (availableFeatures.includes(featureName)) {
      return { status: 'available', icon: '✅', color: 'text-green-600' };
    } else if (partialFeatures.includes(featureName)) {
      return { status: 'partial', icon: '⚠️', color: 'text-yellow-600' };
    } else if (unavailableFeatures.includes(featureName)) {
      return { status: 'unavailable', icon: '❌', color: 'text-red-600' };
    } else {
      return { status: 'unknown', icon: '❓', color: 'text-gray-600' };
    }
  };

  const allFeatures = Object.keys(featureDisplayNames);
  const hasIssues = unavailableFeatures.length > 0 || partialFeatures.length > 0;

  if (!hasIssues && availableFeatures.length === 0) {
    return null; // Don't show if no status to report
  }

  return (
    <div className="feature-availability-indicator bg-gray-50 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <span className="mr-2">🔧</span>
        Professional Features Status
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {allFeatures.map((featureName) => {
          const displayName = featureDisplayNames[featureName as keyof typeof featureDisplayNames];
          const { status, icon, color } = getFeatureStatus(featureName);
          
          return (
            <div
              key={featureName}
              className="flex items-center text-xs"
              title={`${displayName}: ${status}`}
            >
              <span className="mr-1">{icon}</span>
              <span className={`${color} truncate`}>
                {displayName}
              </span>
            </div>
          );
        })}
      </div>
      
      {hasIssues && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            {unavailableFeatures.length > 0 && (
              <span className="text-red-600">
                {unavailableFeatures.length} feature{unavailableFeatures.length !== 1 ? 's' : ''} unavailable
              </span>
            )}
            {unavailableFeatures.length > 0 && partialFeatures.length > 0 && ', '}
            {partialFeatures.length > 0 && (
              <span className="text-yellow-600">
                {partialFeatures.length} feature{partialFeatures.length !== 1 ? 's' : ''} with reduced functionality
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Professional Mode Status Banner
 */
interface StatusBannerProps {
  mode: 'standard' | 'professional' | 'fallback' | 'partial';
  message?: string;
}

export const ProfessionalModeStatusBanner: React.FC<StatusBannerProps> = ({
  mode,
  message
}) => {
  const getStatusConfig = () => {
    switch (mode) {
      case 'professional':
        return {
          icon: '🦄',
          title: 'Professional Mode Active',
          message: message || 'All professional features are active and ready.',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-800'
        };
      case 'partial':
        return {
          icon: '⚡',
          title: 'Partial Professional Mode',
          message: message || 'Some professional features are active with reduced functionality.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        };
      case 'fallback':
        return {
          icon: '🔄',
          title: 'Standard Mode (Fallback)',
          message: message || 'Professional features unavailable. Using standard processing.',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800'
        };
      case 'standard':
      default:
        return {
          icon: '📝',
          title: 'Standard Mode',
          message: message || 'Using standard adventure generation.',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`${config.bgColor} ${config.borderColor} ${config.textColor} border rounded-lg p-3 mb-4`}>
      <div className="flex items-center">
        <span className="text-lg mr-2">{config.icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{config.title}</h3>
          <p className="text-xs opacity-90 mt-1">{config.message}</p>
        </div>
      </div>
    </div>
  );
};