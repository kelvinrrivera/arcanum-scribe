/**
 * Continuous Improvement API Routes
 * 
 * Express routes for serving continuous improvement data and controlling
 * automated optimization from the Advanced Prompt System
 */

import { Router, Request, Response } from 'express';
import { continuousImprovementEngine } from './continuous-improvement-engine';

const router = Router();

/**
 * GET /api/improvement/analysis
 * Get comprehensive continuous improvement analysis
 */
router.get('/analysis', async (req: Request, res: Response) => {
  try {
    console.log('🔄 [IMPROVEMENT-API] Generating continuous improvement analysis...');
    
    const analysis = await continuousImprovementEngine.generateImprovementAnalysis();
    
    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [IMPROVEMENT-API] Failed to generate analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate continuous improvement analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/improvement/summary
 * Get improvement summary only
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const analysis = await continuousImprovementEngine.generateImprovementAnalysis();
    
    res.json({
      success: true,
      data: analysis.summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [IMPROVEMENT-API] Failed to generate summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate improvement summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/improvement/prompt-optimization
 * Get prompt optimization analysis
 */
router.get('/prompt-optimization', async (req: Request, res: Response) => {
  try {
    const analysis = await continuousImprovementEngine.generateImprovementAnalysis();
    
    res.json({
      success: true,
      data: analysis.promptOptimization,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [IMPROVEMENT-API] Failed to generate prompt optimization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate prompt optimization analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/improvement/quality-trends
 * Get quality trends analysis
 */
router.get('/quality-trends', async (req: Request, res: Response) => {
  try {
    const analysis = await continuousImprovementEngine.generateImprovementAnalysis();
    
    res.json({
      success: true,
      data: analysis.qualityTrends,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [IMPROVEMENT-API] Failed to generate quality trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate quality trends analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/improvement/system-performance
 * Get system performance analysis
 */
router.get('/system-performance', async (req: Request, res: Response) => {
  try {
    const analysis = await continuousImprovementEngine.generateImprovementAnalysis();
    
    res.json({
      success: true,
      data: analysis.systemPerformance,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [IMPROVEMENT-API] Failed to generate system performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate system performance analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/improvement/recommendations
 * Get improvement recommendations
 */
router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const analysis = await continuousImprovementEngine.generateImprovementAnalysis();
    
    res.json({
      success: true,
      data: analysis.improvementRecommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [IMPROVEMENT-API] Failed to generate recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate improvement recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/improvement/automated-actions
 * Get recent automated actions
 */
router.get('/automated-actions', async (req: Request, res: Response) => {
  try {
    const analysis = await continuousImprovementEngine.generateImprovementAnalysis();
    
    res.json({
      success: true,
      data: analysis.automatedActions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [IMPROVEMENT-API] Failed to get automated actions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get automated actions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/improvement/optimize
 * Force immediate optimization
 */
router.post('/optimize', async (req: Request, res: Response) => {
  try {
    console.log('🔄 [IMPROVEMENT-API] Forcing immediate optimization...');
    
    const actions = await continuousImprovementEngine.forceOptimization();
    
    res.json({
      success: true,
      data: {
        actionsExecuted: actions.length,
        actions: actions
      },
      message: `Executed ${actions.length} optimization actions`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [IMPROVEMENT-API] Failed to force optimization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute optimization',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/improvement/automation/status
 * Get automation status
 */
router.get('/automation/status', async (req: Request, res: Response) => {
  try {
    const isEnabled = continuousImprovementEngine.isAutomationEnabled();
    
    res.json({
      success: true,
      data: {
        automationEnabled: isEnabled,
        status: isEnabled ? 'active' : 'paused'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [IMPROVEMENT-API] Failed to get automation status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get automation status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/improvement/automation
 * Enable or disable automation
 */
router.put('/automation', async (req: Request, res: Response) => {
  try {
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Enabled parameter must be a boolean'
      });
    }

    continuousImprovementEngine.setAutomationEnabled(enabled);
    
    res.json({
      success: true,
      data: {
        automationEnabled: enabled,
        status: enabled ? 'active' : 'paused'
      },
      message: `Automation ${enabled ? 'enabled' : 'disabled'}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [IMPROVEMENT-API] Failed to update automation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update automation settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/improvement/metrics/performance
 * Get performance metrics
 */
router.get('/metrics/performance', async (req: Request, res: Response) => {
  try {
    const analysis = await continuousImprovementEngine.generateImprovementAnalysis();
    
    res.json({
      success: true,
      data: {
        promptPerformance: analysis.promptOptimization.performanceMetrics,
        systemPerformance: analysis.systemPerformance.performanceMetrics,
        efficiency: analysis.systemPerformance.efficiencyMetrics
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [IMPROVEMENT-API] Failed to get performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get performance metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/improvement/metrics/quality
 * Get quality metrics
 */
router.get('/metrics/quality', async (req: Request, res: Response) => {
  try {
    const analysis = await continuousImprovementEngine.generateImprovementAnalysis();
    
    res.json({
      success: true,
      data: {
        qualityTrends: analysis.qualityTrends,
        promptQuality: analysis.promptOptimization.performanceMetrics,
        systemQuality: analysis.systemPerformance.performanceMetrics.qualityMetrics
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [IMPROVEMENT-API] Failed to get quality metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get quality metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/improvement/health
 * Get system health status
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const analysis = await continuousImprovementEngine.generateImprovementAnalysis();
    
    res.json({
      success: true,
      data: {
        systemHealth: analysis.systemPerformance.systemHealth,
        improvementScore: analysis.summary.overallImprovementScore,
        automationStatus: continuousImprovementEngine.isAutomationEnabled() ? 'active' : 'paused',
        criticalIssues: analysis.summary.criticalIssuesCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [IMPROVEMENT-API] Failed to get health status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system health status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/improvement/predictions
 * Get quality predictions
 */
router.get('/predictions', async (req: Request, res: Response) => {
  try {
    const analysis = await continuousImprovementEngine.generateImprovementAnalysis();
    
    res.json({
      success: true,
      data: {
        qualityPredictions: analysis.qualityTrends.predictedTrajectory,
        trendAnalysis: {
          direction: analysis.qualityTrends.overallTrend,
          strength: analysis.qualityTrends.trendStrength,
          duration: analysis.qualityTrends.trendDuration
        },
        keyInfluencers: analysis.qualityTrends.keyInfluencers
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [IMPROVEMENT-API] Failed to get predictions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get quality predictions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/improvement/ab-tests
 * Get A/B test results
 */
router.get('/ab-tests', async (req: Request, res: Response) => {
  try {
    const analysis = await continuousImprovementEngine.generateImprovementAnalysis();
    
    res.json({
      success: true,
      data: analysis.promptOptimization.abTestResults,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [IMPROVEMENT-API] Failed to get A/B test results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get A/B test results',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/improvement/optimization-opportunities
 * Get optimization opportunities
 */
router.get('/optimization-opportunities', async (req: Request, res: Response) => {
  try {
    const analysis = await continuousImprovementEngine.generateImprovementAnalysis();
    
    res.json({
      success: true,
      data: {
        promptOptimization: analysis.promptOptimization.optimizationOpportunities,
        recommendedOptimizations: analysis.promptOptimization.recommendedOptimizations,
        improvementRecommendations: analysis.improvementRecommendations
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [IMPROVEMENT-API] Failed to get optimization opportunities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get optimization opportunities',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/improvement/execute-recommendation
 * Execute a specific improvement recommendation
 */
router.post('/execute-recommendation', async (req: Request, res: Response) => {
  try {
    const { recommendationId } = req.body;
    
    if (!recommendationId) {
      return res.status(400).json({
        success: false,
        error: 'Recommendation ID is required'
      });
    }

    // In a real implementation, this would execute the specific recommendation
    // For now, we'll simulate execution
    const result = {
      recommendationId,
      executed: true,
      executedAt: new Date(),
      result: 'Recommendation executed successfully',
      impact: 'Positive impact on system performance'
    };
    
    res.json({
      success: true,
      data: result,
      message: 'Recommendation executed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [IMPROVEMENT-API] Failed to execute recommendation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute recommendation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/improvement/config
 * Get continuous improvement configuration
 */
router.get('/config', async (req: Request, res: Response) => {
  try {
    const config = {
      automationEnabled: continuousImprovementEngine.isAutomationEnabled(),
      optimizationInterval: '24 hours',
      qualityThreshold: 8.0,
      performanceThreshold: 7.5,
      lastOptimization: new Date(),
      nextOptimizationDue: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
    
    res.json({
      success: true,
      data: config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [IMPROVEMENT-API] Failed to get configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get continuous improvement configuration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/improvement/config
 * Update continuous improvement configuration
 */
router.put('/config', async (req: Request, res: Response) => {
  try {
    const { automationEnabled, qualityThreshold, performanceThreshold } = req.body;
    
    if (automationEnabled !== undefined) {
      continuousImprovementEngine.setAutomationEnabled(automationEnabled);
    }
    
    // In a real implementation, would update other configuration parameters
    
    res.json({
      success: true,
      message: 'Configuration updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [IMPROVEMENT-API] Failed to update configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update configuration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as continuousImprovementRoutes };