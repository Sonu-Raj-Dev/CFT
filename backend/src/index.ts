import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'express-async-errors';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/masters/users.routes';
import rolesRoutes from './routes/masters/roles.routes';
import permissionsRoutes from './routes/masters/permissions.routes';
import rolePermissionsRoutes from './routes/masters/role-permissions.routes';
import userRolesRoutes from './routes/masters/user-roles.routes';
import customersRoutes from './routes/masters/customers.routes';
import engineersRoutes from './routes/masters/engineers.routes';
import statusesRoutes from './routes/masters/statuses.routes';
import complaintsRoutes from './routes/complaints.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('combined'));
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
