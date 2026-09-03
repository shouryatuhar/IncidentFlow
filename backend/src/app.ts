import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import servicesRoutes from './modules/services/services.routes';
import incidentsRoutes from './modules/incidents/incidents.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import webhooksRoutes from './modules/webhooks/webhooks.routes';
import { errorHandler } from './middleware/errorHandler';
import { NotFoundError } from './utils/errors';

export const createApp = () => {
  const app = express();

  // Security Headers via Helmet
  app.use(helmet({ contentSecurityPolicy: false }));

  // CORS Configuration
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-webhook-secret'],
    })
  );

  app.use(express.json());

  // General API Rate Limiter: 120 requests per minute
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { message: 'Too many requests, please slow down.' },
    },
  });

  // Strict Auth Rate Limiter to prevent brute force: 30 attempts per 15 minutes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { message: 'Too many authentication attempts, please try again later.' },
    },
  });

  // Apply rate limiters
  app.use('/api', apiLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // Health check (bypasses heavy logic)
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Swagger / OpenAPI Interactive Documentation
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'IncidentFlow API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
    })
  );
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerSpec);
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/services', servicesRoutes);
  app.use('/api/incidents', incidentsRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/webhooks', webhooksRoutes);

  // 404 Route handler
  app.use((_req, _res, next) => {
    next(new NotFoundError('API endpoint not found'));
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
};
