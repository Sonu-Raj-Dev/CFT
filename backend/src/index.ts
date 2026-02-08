import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'express-async-errors';
import dotenv from 'dotenv';

import { initializeDatabase } from './config/database.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/request-logger.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/masters/users.routes.js';
import rolesRoutes from './routes/masters/roles.routes.js';
import permissionsRoutes from './routes/masters/permissions.routes.js';
import rolePermissionsRoutes from './routes/masters/role-permissions.routes.js';
import userRolesRoutes from './routes/masters/user-roles.routes.js';
import customersRoutes from './routes/masters/customers.routes.js';
import engineersRoutes from './routes/masters/engineers.routes.js';
import statusesRoutes from './routes/masters/statuses.routes.js';
import complaintsRoutes from './routes/complaints.routes.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('combined'));
app.use(requestLogger);

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/masters/users', usersRoutes);
app.use('/api/masters/roles', rolesRoutes);
app.use('/api/masters/permissions', permissionsRoutes);
app.use('/api/masters/role-permissions', rolePermissionsRoutes);
app.use('/api/masters/user-roles', userRolesRoutes);
app.use('/api/masters/customers', customersRoutes);
app.use('/api/masters/engineers', engineersRoutes);
app.use('/api/masters/statuses', statusesRoutes);
app.use('/api/complaints', complaintsRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// Global Error Handler (must be last)
app.use(errorHandler);

// Start Server
async function startServer() {
  try {
    logger.info('Initializing database connection...');
    await initializeDatabase();
    logger.info('Database connected successfully');

    app.listen(PORT, () => {
      logger.info(`Backend server running on http://localhost:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`CORS enabled for: ${CORS_ORIGIN}`);
      logger.info('Health check available at: http://localhost:${PORT}/health');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
