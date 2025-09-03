import express from 'express';
import { Pool } from 'pg';
import AdminService from './admin-service';

const router = express.Router();

// Middleware to check admin access
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || (req.user.subscription_tier !== 'admin' && req.user.tier !== 'admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export function createAdminRoutes(pool: Pool) {
  const adminService = new AdminService(pool);

  // Initialize database tables
  router.post('/initialize', requireAdmin, async (req, res) => {
    try {
      await adminService.initializeTables();
      res.json({ success: true, message: 'Database tables initialized' });
    } catch (error) {
      console.error('Error initializing tables:', error);
      res.status(500).json({ error: 'Failed to initialize tables' });
    }
  });

  // LLM Providers
  router.get('/llm-providers', requireAdmin, async (req, res) => {
    try {
      const providers = await adminService.getLLMProviders();
      res.json(providers);
    } catch (error) {
      console.error('Error fetching LLM providers:', error);
      res.status(500).json({ error: 'Failed to fetch LLM providers' });
    }
  });

  router.post('/llm-providers', requireAdmin, async (req, res) => {
    try {
      const provider = await adminService.createLLMProvider(req.body);
      res.json(provider);
    } catch (error) {
      console.error('Error creating LLM provider:', error);
      res.status(500).json({ error: 'Failed to create LLM provider' });
    }
  });

  router.put('/llm-providers/:id', requireAdmin, async (req, res) => {
    try {
      const provider = await adminService.updateLLMProvider(req.params.id, req.body);
      res.json(provider);
    } catch (error) {
      console.error('Error updating LLM provider:', error);
      res.status(500).json({ error: 'Failed to update LLM provider' });
    }
  });

  router.delete('/llm-providers/:id', requireAdmin, async (req, res) => {
    try {
      await adminService.deleteLLMProvider(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting LLM provider:', error);
      res.status(500).json({ error: 'Failed to delete LLM provider' });
    }
  });

  router.post('/llm-providers/:id/test', requireAdmin, async (req, res) => {
    try {
      const result = await adminService.testProviderConnection(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Error testing provider connection:', error);
      res.status(500).json({ error: 'Failed to test provider connection' });
    }
  });

  // LLM Models
  router.get('/llm-models', requireAdmin, async (req, res) => {
    try {
      const models = await adminService.getLLMModels();
      res.json(models);
    } catch (error) {
      console.error('Error fetching LLM models:', error);
      res.status(500).json({ error: 'Failed to fetch LLM models' });
    }
  });

  router.post('/llm-models', requireAdmin, async (req, res) => {
    try {
      const model = await adminService.createLLMModel(req.body);
      res.json(model);
    } catch (error) {
      console.error('Error creating LLM model:', error);
      res.status(500).json({ error: 'Failed to create LLM model' });
    }
  });

  router.put('/llm-models/:id', requireAdmin, async (req, res) => {
    try {
      const model = await adminService.updateLLMModel(req.params.id, req.body);
      res.json(model);
    } catch (error) {
      console.error('Error updating LLM model:', error);
      res.status(500).json({ error: 'Failed to update LLM model' });
    }
  });

  router.delete('/llm-models/:id', requireAdmin, async (req, res) => {
    try {
      await adminService.deleteLLMModel(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting LLM model:', error);
      res.status(500).json({ error: 'Failed to delete LLM model' });
    }
  });

  // Image Providers
  router.get('/image-providers', requireAdmin, async (req, res) => {
    try {
      const providers = await adminService.getImageProviders();
      res.json(providers);
    } catch (error) {
      console.error('Error fetching image providers:', error);
      res.status(500).json({ error: 'Failed to fetch image providers' });
    }
  });

  router.post('/image-providers', requireAdmin, async (req, res) => {
    try {
      const provider = await adminService.createImageProvider(req.body);
      res.json(provider);
    } catch (error) {
      console.error('Error creating image provider:', error);
      res.status(500).json({ error: 'Failed to create image provider' });
    }
  });

  router.put('/image-providers/:id', requireAdmin, async (req, res) => {
    try {
      const provider = await adminService.updateImageProvider(req.params.id, req.body);
      res.json(provider);
    } catch (error) {
      console.error('Error updating image provider:', error);
      res.status(500).json({ error: 'Failed to update image provider' });
    }
  });

  router.delete('/image-providers/:id', requireAdmin, async (req, res) => {
    try {
      await adminService.deleteImageProvider(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting image provider:', error);
      res.status(500).json({ error: 'Failed to delete image provider' });
    }
  });

  // Image Models
  router.get('/image-models', requireAdmin, async (req, res) => {
    try {
      const models = await adminService.getImageModels();
      res.json(models);
    } catch (error) {
      console.error('Error fetching image models:', error);
      res.status(500).json({ error: 'Failed to fetch image models' });
    }
  });

  router.post('/image-models', requireAdmin, async (req, res) => {
    try {
      const model = await adminService.createImageModel(req.body);
      res.json(model);
    } catch (error) {
      console.error('Error creating image model:', error);
      res.status(500).json({ error: 'Failed to create image model' });
    }
  });

  router.put('/image-models/:id', requireAdmin, async (req, res) => {
    try {
      const model = await adminService.updateImageModel(req.params.id, req.body);
      res.json(model);
    } catch (error) {
      console.error('Error updating image model:', error);
      res.status(500).json({ error: 'Failed to update image model' });
    }
  });

  router.delete('/image-models/:id', requireAdmin, async (req, res) => {
    try {
      await adminService.deleteImageModel(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting image model:', error);
      res.status(500).json({ error: 'Failed to delete image model' });
    }
  });

  // Prompt Logs
  router.get('/prompt-logs', requireAdmin, async (req, res) => {
    try {
      const { limit = 100, offset = 0, ...filters } = req.query;
      const result = await adminService.getPromptLogs(
        parseInt(limit as string),
        parseInt(offset as string),
        filters
      );
      res.json(result);
    } catch (error) {
      console.error('Error fetching prompt logs:', error);
      res.status(500).json({ error: 'Failed to fetch prompt logs' });
    }
  });

  // System Configuration
  router.get('/system-configs', requireAdmin, async (req, res) => {
    try {
      const { category } = req.query;
      const configs = await adminService.getSystemConfigs(category as string);
      res.json(configs);
    } catch (error) {
      console.error('Error fetching system configs:', error);
      res.status(500).json({ error: 'Failed to fetch system configs' });
    }
  });

  router.put('/system-configs/:key', requireAdmin, async (req, res) => {
    try {
      const { value } = req.body;
      const config = await adminService.updateSystemConfig(
        req.params.key,
        value,
        req.user.email
      );
      res.json(config);
    } catch (error) {
      console.error('Error updating system config:', error);
      res.status(500).json({ error: 'Failed to update system config' });
    }
  });

  // Analytics and Statistics
  router.get('/stats/usage', requireAdmin, async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const stats = await adminService.getUsageStats(parseInt(days as string));
      res.json(stats);
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      res.status(500).json({ error: 'Failed to fetch usage stats' });
    }
  });

  router.get('/stats/providers', requireAdmin, async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const stats = await adminService.getProviderStats(parseInt(days as string));
      res.json(stats);
    } catch (error) {
      console.error('Error fetching provider stats:', error);
      res.status(500).json({ error: 'Failed to fetch provider stats' });
    }
  });

  // Bulk operations
  router.post('/bulk/activate-providers', requireAdmin, async (req, res) => {
    try {
      const { providerIds } = req.body;
      const promises = providerIds.map((id: string) => 
        adminService.updateLLMProvider(id, { is_active: true })
      );
      await Promise.all(promises);
      res.json({ success: true, message: `Activated ${providerIds.length} providers` });
    } catch (error) {
      console.error('Error activating providers:', error);
      res.status(500).json({ error: 'Failed to activate providers' });
    }
  });

  router.post('/bulk/deactivate-providers', requireAdmin, async (req, res) => {
    try {
      const { providerIds } = req.body;
      const promises = providerIds.map((id: string) => 
        adminService.updateLLMProvider(id, { is_active: false })
      );
      await Promise.all(promises);
      res.json({ success: true, message: `Deactivated ${providerIds.length} providers` });
    } catch (error) {
      console.error('Error deactivating providers:', error);
      res.status(500).json({ error: 'Failed to deactivate providers' });
    }
  });

  router.post('/bulk/activate-models', requireAdmin, async (req, res) => {
    try {
      const { modelIds } = req.body;
      const promises = modelIds.map((id: string) => 
        adminService.updateLLMModel(id, { is_active: true })
      );
      await Promise.all(promises);
      res.json({ success: true, message: `Activated ${modelIds.length} models` });
    } catch (error) {
      console.error('Error activating models:', error);
      res.status(500).json({ error: 'Failed to activate models' });
    }
  });

  router.post('/bulk/deactivate-models', requireAdmin, async (req, res) => {
    try {
      const { modelIds } = req.body;
      const promises = modelIds.map((id: string) => 
        adminService.updateLLMModel(id, { is_active: false })
      );
      await Promise.all(promises);
      res.json({ success: true, message: `Deactivated ${modelIds.length} models` });
    } catch (error) {
      console.error('Error deactivating models:', error);
      res.status(500).json({ error: 'Failed to deactivate models' });
    }
  });

  // Users Management
  router.get('/users', requireAdmin, async (req, res) => {
    try {
      const { limit = 100, offset = 0 } = req.query;
      const users = await adminService.getUsers(Number(limit), Number(offset));
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  router.put('/users/:id', requireAdmin, async (req, res) => {
    try {
      const user = await adminService.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  // Invite Codes
  router.get('/invite-codes', requireAdmin, async (req, res) => {
    try {
      const codes = await adminService.getInviteCodes();
      res.json(codes);
    } catch (error) {
      console.error('Error fetching invite codes:', error);
      res.status(500).json({ error: 'Failed to fetch invite codes' });
    }
  });

  router.post('/invite-codes', requireAdmin, async (req, res) => {
    try {
      const { code } = req.body;
      console.log('Creating invite code:', { code, user: req.user });
      
      if (!req.user || !req.user.id) {
        return res.status(400).json({ error: 'User information not available' });
      }
      
      const createdBy = req.user.id; // Use user ID (UUID) instead of email
      const inviteCode = await adminService.createInviteCode(code, createdBy);
      res.json(inviteCode);
    } catch (error) {
      console.error('Error creating invite code:', error);
      res.status(500).json({ error: 'Failed to create invite code', details: error.message });
    }
  });

  router.delete('/invite-codes/:id', requireAdmin, async (req, res) => {
    try {
      await adminService.deleteInviteCode(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting invite code:', error);
      res.status(500).json({ error: 'Failed to delete invite code' });
    }
  });

  // API Logs
  router.get('/api-logs', requireAdmin, async (req, res) => {
    try {
      const { limit = 100, offset = 0 } = req.query;
      const logs = await adminService.getApiLogs(Number(limit), Number(offset));
      res.json(logs);
    } catch (error) {
      console.error('Error fetching API logs:', error);
      res.status(500).json({ error: 'Failed to fetch API logs' });
    }
  });

  // Prompt Analysis
  router.get('/prompt-analysis', requireAdmin, async (req, res) => {
    try {
      const analysis = await adminService.getPromptAnalysis();
      res.json(analysis);
    } catch (error) {
      console.error('Error fetching prompt analysis:', error);
      res.status(500).json({ error: 'Failed to fetch prompt analysis' });
    }
  });

  // Prompt Templates
  router.get('/prompt-templates', requireAdmin, async (req, res) => {
    try {
      const templates = await adminService.getPromptTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Error fetching prompt templates:', error);
      res.status(500).json({ error: 'Failed to fetch prompt templates' });
    }
  });

  router.put('/prompt-templates/:id', requireAdmin, async (req, res) => {
    try {
      const template = await adminService.updatePromptTemplate(req.params.id, req.body);
      res.json(template);
    } catch (error) {
      console.error('Error updating prompt template:', error);
      res.status(500).json({ error: 'Failed to update prompt template' });
    }
  });

  // Live API endpoints
  router.get('/openrouter/models', requireAdmin, async (req, res) => {
    try {
      const models = await adminService.getOpenRouterModels();
      res.json(models);
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      res.status(500).json({ error: 'Failed to fetch OpenRouter models' });
    }
  });

  router.get('/fal/models', requireAdmin, async (req, res) => {
    try {
      const models = await adminService.getFalModels();
      res.json(models);
    } catch (error) {
      console.error('Error fetching Fal models:', error);
      res.status(500).json({ error: 'Failed to fetch Fal models' });
    }
  });

  return router;
}

export default createAdminRoutes;