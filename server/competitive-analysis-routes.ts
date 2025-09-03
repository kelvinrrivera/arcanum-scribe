/**
 * Competitive Analysis API Routes
 * 
 * Express routes for serving competitive analysis data from the Advanced Prompt System
 */

import { Router, Request, Response } from 'express';
import { competitiveAnalysisSystem } from './competitive-analysis-system';
import { marketDifferentiationValidator } from './market-differentiation-validator';

const router = Router();

/**
 * GET /api/competitive/analysis
 * Get comprehensive competitive analysis
 */
router.get('/analysis', async (req: Request, res: Response) => {
  try {
    console.log('🏆 [COMPETITIVE-API] Generating competitive analysis...');
    
    const analysis = await competitiveAnalysisSystem.generateCompetitiveAnalysis();
    
    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [COMPETITIVE-API] Failed to generate analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate competitive analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/competitive/summary
 * Get competitive analysis summary only
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const analysis = await competitiveAnalysisSystem.generateCompetitiveAnalysis();
    
    res.json({
      success: true,
      data: analysis.summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [COMPETITIVE-API] Failed to generate summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate competitive summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/competitive/market-comparison
 * Get market comparison analysis
 */
router.get('/market-comparison', async (req: Request, res: Response) => {
  try {
    const analysis = await competitiveAnalysisSystem.generateCompetitiveAnalysis();
    
    res.json({
      success: true,
      data: analysis.marketComparison,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [COMPETITIVE-API] Failed to generate market comparison:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate market comparison',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/competitive/advantages
 * Get competitive advantage analysis
 */
router.get('/advantages', async (req: Request, res: Response) => {
  try {
    const analysis = await competitiveAnalysisSystem.generateCompetitiveAnalysis();
    
    res.json({
      success: true,
      data: analysis.competitiveAdvantage,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [COMPETITIVE-API] Failed to generate advantages analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate competitive advantages',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/competitive/positioning
 * Get market positioning analysis
 */
router.get('/positioning', async (req: Request, res: Response) => {
  try {
    const analysis = await competitiveAnalysisSystem.generateCompetitiveAnalysis();
    
    res.json({
      success: true,
      data: analysis.marketPositioning,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [COMPETITIVE-API] Failed to generate positioning analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate market positioning',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/competitive/benchmarks
 * Get competitive benchmarks
 */
router.get('/benchmarks', async (req: Request, res: Response) => {
  try {
    const analysis = await competitiveAnalysisSystem.generateCompetitiveAnalysis();
    
    res.json({
      success: true,
      data: analysis.benchmarks,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [COMPETITIVE-API] Failed to generate benchmarks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate competitive benchmarks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/competitive/recommendations
 * Get competitive recommendations
 */
router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const analysis = await competitiveAnalysisSystem.generateCompetitiveAnalysis();
    
    res.json({
      success: true,
      data: analysis.recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [COMPETITIVE-API] Failed to generate recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate competitive recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/competitive/competitors
 * Get competitor analysis data
 */
router.get('/competitors', async (req: Request, res: Response) => {
  try {
    const analysis = await competitiveAnalysisSystem.generateCompetitiveAnalysis();
    
    res.json({
      success: true,
      data: analysis.marketComparison.competitorAnalysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [COMPETITIVE-API] Failed to generate competitor analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate competitor analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/competitive/opportunities
 * Get market opportunities
 */
router.get('/opportunities', async (req: Request, res: Response) => {
  try {
    const analysis = await competitiveAnalysisSystem.generateCompetitiveAnalysis();
    
    res.json({
      success: true,
      data: {
        marketGaps: analysis.marketComparison.marketGaps,
        opportunityAreas: analysis.marketComparison.opportunityAreas
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [COMPETITIVE-API] Failed to generate opportunities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate market opportunities',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/competitive/validate-content
 * Validate content for market differentiation
 */
router.post('/validate-content', async (req: Request, res: Response) => {
  try {
    const { contentId, contentType, content } = req.body;
    
    if (!contentId || !contentType || !content) {
      return res.status(400).json({
        success: false,
        error: 'Content ID, type, and content are required'
      });
    }

    const validation = await marketDifferentiationValidator.validateMarketDifferentiation(
      contentId,
      contentType,
      content
    );
    
    res.json({
      success: true,
      data: validation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [COMPETITIVE-API] Failed to validate content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate content for market differentiation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/competitive/batch-validate
 * Batch validate multiple content pieces
 */
router.post('/batch-validate', async (req: Request, res: Response) => {
  try {
    const { contentItems } = req.body;
    
    if (!contentItems || !Array.isArray(contentItems)) {
      return res.status(400).json({
        success: false,
        error: 'Content items array is required'
      });
    }

    const validations = await marketDifferentiationValidator.batchValidateMarketDifferentiation(
      contentItems
    );
    
    res.json({
      success: true,
      data: validations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [COMPETITIVE-API] Failed to batch validate content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to batch validate content',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/competitive/market-differentiation-summary
 * Get market differentiation summary
 */
router.get('/market-differentiation-summary', async (req: Request, res: Response) => {
  try {
    const { contentIds } = req.query;
    
    const contentIdArray = contentIds ? 
      (Array.isArray(contentIds) ? contentIds as string[] : [contentIds as string]) : 
      undefined;

    const summary = await marketDifferentiationValidator.getMarketDifferentiationSummary(
      contentIdArray
    );
    
    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [COMPETITIVE-API] Failed to generate differentiation summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate market differentiation summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/competitive/industry-benchmarks
 * Get industry benchmark data
 */
router.get('/industry-benchmarks', async (req: Request, res: Response) => {
  try {
    const analysis = await competitiveAnalysisSystem.generateCompetitiveAnalysis();
    
    res.json({
      success: true,
      data: analysis.marketComparison.industryBenchmarks,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [COMPETITIVE-API] Failed to get industry benchmarks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get industry benchmarks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/competitive/competitive-map
 * Get competitive positioning map data
 */
router.get('/competitive-map', async (req: Request, res: Response) => {
  try {
    const analysis = await competitiveAnalysisSystem.generateCompetitiveAnalysis();
    
    res.json({
      success: true,
      data: analysis.marketPositioning.competitiveMap,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [COMPETITIVE-API] Failed to get competitive map:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get competitive positioning map',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/competitive/brand-perception
 * Get brand perception analysis
 */
router.get('/brand-perception', async (req: Request, res: Response) => {
  try {
    const analysis = await competitiveAnalysisSystem.generateCompetitiveAnalysis();
    
    res.json({
      success: true,
      data: analysis.marketPositioning.brandPerception,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [COMPETITIVE-API] Failed to get brand perception:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get brand perception analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as competitiveAnalysisRoutes };