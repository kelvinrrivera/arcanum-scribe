/**
 * Quality Analytics API Routes
 * 
 * Express routes for serving quality analytics data from the Advanced Prompt System
 */

import { Router, Request, Response } from 'express';
import { qualityAnalyticsDashboard } from './quality-analytics-dashboard';
import { automatedQualityService } from './automated-quality-service';

const router = Router();

/**
 * GET /api/quality/analytics
 * Get comprehensive quality analytics data
 */
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    console.log('📊 [ANALYTICS-API] Generating quality analytics...');
    
    const analytics = await qualityAnalyticsDashboard.generateQualityAnalytics();
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [ANALYTICS-API] Failed to generate analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate quality analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/quality/analytics/summary
 * Get quality analytics summary only
 */
router.get('/analytics/summary', async (req: Request, res: Response) => {
  try {
    const analytics = await qualityAnalyticsDashboard.generateQualityAnalytics();
    
    res.json({
      success: true,
      data: analytics.summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [ANALYTICS-API] Failed to generate summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate quality summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/quality/analytics/trends
 * Get quality trends data
 */
router.get('/analytics/trends', async (req: Request, res: Response) => {
  try {
    const trends = qualityAnalyticsDashboard.generateQualityTrends();
    
    res.json({
      success: true,
      data: trends,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [ANALYTICS-API] Failed to generate trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate quality trends',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/quality/analytics/metrics
 * Get detailed metrics analysis
 */
router.get('/analytics/metrics', async (req: Request, res: Response) => {
  try {
    const analytics = await qualityAnalyticsDashboard.generateQualityAnalytics();
    
    res.json({
      success: true,
      data: analytics.metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [ANALYTICS-API] Failed to generate metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate detailed metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/quality/analytics/improvements
 * Get improvement opportunities
 */
router.get('/analytics/improvements', async (req: Request, res: Response) => {
  try {
    const analytics = await qualityAnalyticsDashboard.generateQualityAnalytics();
    
    res.json({
      success: true,
      data: analytics.improvements,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [ANALYTICS-API] Failed to generate improvements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate improvement opportunities',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/quality/analytics/recommendations
 * Get analytics recommendations
 */
router.get('/analytics/recommendations', async (req: Request, res: Response) => {
  try {
    const analytics = await qualityAnalyticsDashboard.generateQualityAnalytics();
    
    res.json({
      success: true,
      data: analytics.recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [ANALYTICS-API] Failed to generate recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/quality/analytics/visualizations
 * Get dashboard visualizations data
 */
router.get('/analytics/visualizations', async (req: Request, res: Response) => {
  try {
    const visualizations = qualityAnalyticsDashboard.generateDashboardVisualizations();
    
    res.json({
      success: true,
      data: visualizations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [ANALYTICS-API] Failed to generate visualizations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate dashboard visualizations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/quality/analytics/record
 * Record a quality validation result for analytics
 */
router.post('/analytics/record', async (req: Request, res: Response) => {
  try {
    const { result } = req.body;
    
    if (!result) {
      return res.status(400).json({
        success: false,
        error: 'Quality result data is required'
      });
    }

    // Validate result structure
    if (!result.overallQualityScore || !result.timestamp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quality result format'
      });
    }

    qualityAnalyticsDashboard.recordQualityResult({
      ...result,
      timestamp: new Date(result.timestamp)
    });
    
    res.json({
      success: true,
      message: 'Quality result recorded successfully'
    });
  } catch (error) {
    console.error('❌ [ANALYTICS-API] Failed to record quality result:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record quality result',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/quality/analytics/history
 * Get quality validation history
 */
router.get('/analytics/history', async (req: Request, res: Response) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    const history = qualityAnalyticsDashboard.getQualityHistory();
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);
    
    const paginatedHistory = history
      .slice(offsetNum, offsetNum + limitNum)
      .map(result => ({
        ...result,
        // Remove large objects to reduce response size
        contentResult: result.contentResult ? {
          metrics: result.contentResult.metrics,
          regenerationRequired: result.contentResult.regenerationRequired
        } : undefined,
        visualResult: result.visualResult ? {
          metrics: result.visualResult.metrics,
          regenerationRequired: result.visualResult.regenerationRequired
        } : undefined
      }));
    
    res.json({
      success: true,
      data: {
        history: paginatedHistory,
        total: history.length,
        limit: limitNum,
        offset: offsetNum
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [ANALYTICS-API] Failed to get quality history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get quality history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/quality/analytics/history
 * Clear quality analytics history (for testing/reset)
 */
router.delete('/analytics/history', async (req: Request, res: Response) => {
  try {
    qualityAnalyticsDashboard.clearQualityHistory();
    
    res.json({
      success: true,
      message: 'Quality history cleared successfully'
    });
  } catch (error) {
    console.error('❌ [ANALYTICS-API] Failed to clear quality history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear quality history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/quality/analytics/config
 * Get current quality analytics configuration
 */
router.get('/analytics/config', async (req: Request, res: Response) => {
  try {
    const stats = await automatedQualityService.getQualityStatistics();
    
    res.json({
      success: true,
      data: {
        ...stats,
        historySize: qualityAnalyticsDashboard.getQualityHistory().length,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ [ANALYTICS-API] Failed to get analytics config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics configuration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/quality/analytics/config
 * Update quality analytics configuration
 */
router.put('/analytics/config', async (req: Request, res: Response) => {
  try {
    const { contentThreshold, visualThreshold } = req.body;
    
    if (contentThreshold !== undefined || visualThreshold !== undefined) {
      automatedQualityService.updateQualityThresholds(contentThreshold, visualThreshold);
    }
    
    res.json({
      success: true,
      message: 'Analytics configuration updated successfully'
    });
  } catch (error) {
    console.error('❌ [ANALYTICS-API] Failed to update analytics config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update analytics configuration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as qualityAnalyticsRoutes };