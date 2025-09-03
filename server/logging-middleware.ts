import { Pool } from 'pg';
import AdminService from './admin-service';

export class LoggingService {
  private adminService: AdminService;

  constructor(pool: Pool) {
    this.adminService = new AdminService(pool);
  }

  async logPromptInteraction(data: {
    user_id: string;
    provider_id?: string;
    model_id?: string;
    prompt_type: string;
    prompt_text: string;
    response_text?: string;
    tokens_used?: number;
    cost?: number;
    response_time_ms?: number;
    success: boolean;
    error_message?: string;
    metadata?: any;
  }) {
    try {
      // For now, just log to console until we implement the database logging
      console.log('[PROMPT_LOG]', {
        timestamp: new Date().toISOString(),
        ...data
      });
    } catch (error) {
      console.error('Failed to log prompt interaction:', error);
    }
  }

  // Middleware to log API calls
  createLoggingMiddleware() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();
      
      // Store original methods
      const originalSend = res.send;
      const originalJson = res.json;
      
      let responseData: any = null;
      
      // Override response methods to capture data
      res.send = function(data: any) {
        responseData = data;
        return originalSend.call(this, data);
      };
      
      res.json = function(data: any) {
        responseData = data;
        return originalJson.call(this, data);
      };
      
      // Log when response finishes
      res.on('finish', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // Only log specific endpoints
        if (this.shouldLogRequest(req)) {
          this.logAPICall({
            user_id: req.user?.id,
            method: req.method,
            path: req.path,
            query: req.query,
            body: req.body,
            response_status: res.statusCode,
            response_data: responseData,
            response_time_ms: responseTime,
            success: res.statusCode < 400,
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
          });
        }
      });
      
      next();
    };
  }
  
  private shouldLogRequest(req: any): boolean {
    // Log generation endpoints and admin actions
    const logPaths = [
      '/api/generate-adventure',
      '/api/generate-prompt',
      '/api/admin/'
    ];
    
    return logPaths.some(path => req.path.startsWith(path));
  }
  
  private async logAPICall(data: any) {
    try {
      // This could be expanded to log to a separate API calls table
      console.log('[API_LOG]', {
        timestamp: new Date().toISOString(),
        ...data
      });
    } catch (error) {
      console.error('Failed to log API call:', error);
    }
  }
}

export default LoggingService;