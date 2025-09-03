import { useAuth } from './useAuth';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
}

export function useAnalytics() {
  const { user } = useAuth();

  const track = async (event: string, properties?: Record<string, any>) => {
    try {
      const analyticsEvent: AnalyticsEvent = {
        event,
        properties: {
          ...properties,
          user_id: user?.id,
          user_email: user?.email,
          timestamp: Date.now(),
          url: window.location.href,
          user_agent: navigator.userAgent,
        },
        userId: user?.id,
        timestamp: Date.now(),
      };

      // Log to console in development
      if (import.meta.env.DEV) {
        console.log('📊 Analytics Event:', analyticsEvent);
      }

      // Send to backend for storage
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsEvent),
      }).catch(() => ({ ok: false, error: 'Network error' }));

      if (!response.ok) {
        console.error('Analytics error:', response.statusText);
      }
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  };

  const trackPageView = (page: string) => {
    track('page_view', { page });
  };

  const trackAdventureGenerated = (gameSystem: string, promptLength: number) => {
    track('adventure_generated', {
      game_system: gameSystem,
      prompt_length: promptLength,
    });
  };

  const trackAdventureViewed = (adventureId: string) => {
    track('adventure_viewed', {
      adventure_id: adventureId,
    });
  };

  const trackAdventureExported = (adventureId: string, exportType: string) => {
    track('adventure_exported', {
      adventure_id: adventureId,
      export_type: exportType,
    });
  };

  const trackUserSignUp = (method: string) => {
    track('user_signup', {
      method,
    });
  };

  const trackUserSignIn = (method: string) => {
    track('user_signin', {
      method,
    });
  };

  const trackPlanUpgrade = (plan: string) => {
    track('plan_upgrade', {
      plan,
    });
  };

  const trackInviteCodeGenerated = (maxUses: number) => {
    track('invite_code_generated', {
      max_uses: maxUses,
    });
  };

  const trackInviteCodeUsed = (code: string) => {
    track('invite_code_used', {
      code,
    });
  };

  return {
    track,
    trackPageView,
    trackAdventureGenerated,
    trackAdventureViewed,
    trackAdventureExported,
    trackUserSignUp,
    trackUserSignIn,
    trackPlanUpgrade,
    trackInviteCodeGenerated,
    trackInviteCodeUsed,
  };
} 