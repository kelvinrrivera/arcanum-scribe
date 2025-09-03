import pino from 'pino';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Create logger instance
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined,
  base: {
    service: 'arcanum-scribe',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  }
});

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = uuidv4();
  const startTime = Date.now();
  
  // Add request ID to request object
  (req as any).requestId = requestId;
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);
  
  // Log request start
  logger.info({
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: (req as any).user?.id
  }, 'Request started');
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - startTime;
    
    logger.info({
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userId: (req as any).user?.id,
      contentLength: res.get('Content-Length')
    }, 'Request completed');
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
}

// Error logging middleware
export function errorLogger(error: Error, req: Request, res: Response, next: NextFunction) {
  const requestId = (req as any).requestId;
  
  logger.error({
    requestId,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    method: req.method,
    url: req.url,
    userId: (req as any).user?.id
  }, 'Request error');
  
  next(error);
}

// LLM call logging
export function logLLMCall(params: {
  requestId: string;
  userId: string;
  provider: string;
  model: string;
  promptType: string;
  tokensUsed?: number;
  cost?: number;
  duration: number;
  success: boolean;
  error?: string;
}) {
  logger.info({
    ...params,
    type: 'llm_call'
  }, `LLM call ${params.success ? 'succeeded' : 'failed'}`);
}

// Image generation logging
export function logImageGeneration(params: {
  requestId: string;
  userId: string;
  provider: string;
  model: string;
  imageCount: number;
  cost?: number;
  duration: number;
  success: boolean;
  error?: string;
}) {
  logger.info({
    ...params,
    type: 'image_generation'
  }, `Image generation ${params.success ? 'succeeded' : 'failed'}`);
}

// Credit transaction logging
export function logCreditTransaction(params: {
  requestId?: string;
  userId: string;
  transactionType: 'credit_usage' | 'credit_purchase' | 'credit_grant';
  actionType?: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reason?: string;
}) {
  logger.info({
    ...params,
    type: 'credit_transaction'
  }, `Credit transaction: ${params.transactionType}`);
}

// Performance metrics logging
export function logPerformanceMetric(params: {
  requestId?: string;
  metric: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
}) {
  logger.info({
    ...params,
    type: 'performance_metric'
  }, `Performance metric: ${params.metric}`);
}

// Business event logging
export function logBusinessEvent(params: {
  requestId?: string;
  userId?: string;
  event: string;
  data?: Record<string, any>;
}) {
  logger.info({
    ...params,
    type: 'business_event'
  }, `Business event: ${params.event}`);
}