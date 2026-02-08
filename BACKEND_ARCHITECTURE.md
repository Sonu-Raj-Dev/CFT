# Backend Architecture Guide

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts              # Database connection pool setup
│   ├── middleware/
│   │   ├── auth.ts                  # Authentication & Authorization middleware
│   │   ├── error-handler.ts         # Global error handler
│   │   └── request-logger.ts        # Request/Response logging
│   ├── routes/
│   │   ├── auth.routes.ts           # Authentication endpoints
│   │   ├── complaints.routes.ts     # Complaint management endpoints
│   │   └── masters/                 # Master data endpoints
│   │       ├── users.routes.ts
│   │       ├── roles.routes.ts
│   │       ├── permissions.routes.ts
│   │       ├── role-permissions.routes.ts
│   │       ├── user-roles.routes.ts
│   │       ├── customers.routes.ts
│   │       ├── engineers.routes.ts
│   │       └── statuses.routes.ts
│   ├── utils/
│   │   ├── logger.ts                # Logging utility
│   │   ├── auth.ts                  # JWT & password utilities
│   │   ├── validation.ts            # Input validation schemas
│   │   └── response.ts              # Standard response formatting
│   ├── repositories/                # Data access layer
│   │   ├── user.repository.ts
│   │   ├── role.repository.ts
│   │   ├── complaint.repository.ts
│   │   └── ...
│   ├── scripts/
│   │   ├── migrate.ts               # Database migration
│   │   └── seed.ts                  # Seed sample data
│   └── index.ts                     # Express app entry point
├── package.json
├── tsconfig.json
├── .env.example
└── .env                             # Local environment variables
```

## Key Components

### 1. Database Configuration (`config/database.ts`)

Handles SQL Server connection pooling:
- Connection pool initialization
- Query execution helpers
- Connection lifecycle management

```typescript
const pool = await getDatabase();
const result = await pool.request()
  .input('id', sql.Int, userId)
  .query('SELECT * FROM users WHERE user_id = @id');
```

### 2. Middleware

#### Auth Middleware (`middleware/auth.ts`)
- Verifies JWT tokens
- Extracts user info and permissions
- Adds `req.user` object with user data and permissions
- Handles token expiration and invalid tokens

```typescript
router.get('/protected', authMiddleware, (req, res) => {
  console.log(req.user); // { userId, email, roles, permissions }
});
```

#### Permission Middleware
- Checks if user has required permissions (OR logic)
- Checks if user has required roles

```typescript
router.post('/admin', 
  authMiddleware, 
  permissionMiddleware('admin_access'), 
  (req, res) => { ... }
);
```

#### Error Handler (`middleware/error-handler.ts`)
- Catches all errors in route handlers
- Formats error responses consistently
- Logs errors with context

#### Request Logger (`middleware/request-logger.ts`)
- Logs incoming requests and responses
- Tracks request duration
- Useful for debugging and monitoring

### 3. Routes

All routes follow a consistent pattern:

```typescript
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const pool = await getDatabase();
    // Query logic here
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error message:', error);
    throw error; // Let error handler catch it
  }
});
```

### 4. Utilities

#### Logger (`utils/logger.ts`)
```typescript
logger.info('User logged in', { userId, email });
logger.error('Database error', error);
logger.warn('High CPU usage detected');
logger.debug('Debug info', data);
```

#### Auth Utils (`utils/auth.ts`)
- `hashPassword(password)` - Hash password with bcrypt
- `comparePasswords(plain, hash)` - Compare passwords
- `generateToken(payload)` - Generate JWT token
- `verifyToken(token)` - Verify and decode JWT

#### Validation (`utils/validation.ts`)
- Joi schemas for input validation
- Middleware for automatic validation

#### Response (`utils/response.ts`)
- `sendSuccess(res, data, message, status)` - Success response
- `sendError(res, error, status)` - Error response
- `sendPaginated(res, data, total, page, pageSize)` - Paginated response

### 5. Repositories (Data Access Layer)

Each entity has a repository handling database queries:

```typescript
class UserRepository {
  async findById(id: number) { ... }
  async findAll() { ... }
  async create(data) { ... }
  async update(id, data) { ... }
  async delete(id) { ... }
}
```

## API Response Format

All successful responses:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

All error responses:
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-20T10:30:00Z"
}
```

## Authentication Flow

1. User calls `POST /api/auth/login` with credentials
2. Backend validates credentials
3. Backend generates JWT token including:
   - `userId`
   - `email`
   - `roles` (array of role names)
   - `permissions` (array of permission names)
4. Frontend stores token (usually in context or localStorage)
5. Frontend includes token in `Authorization: Bearer <token>` header
6. Backend middleware validates token and extracts user info
7. Middleware adds `req.user` to request object
8. Route handlers access `req.user` for user info and permissions

## Permission-Based Access Control

Routes can require specific permissions:

```typescript
// Single permission (OR logic)
router.post('/approve', 
  authMiddleware, 
  permissionMiddleware('approve_complaint'), 
  handler
);

// Multiple permissions (OR logic - user needs ONE)
router.post('/admin',
  authMiddleware,
  permissionMiddleware('admin_access', 'super_admin'),
  handler
);
```

## Adding New Routes

1. Create new route file in `routes/` directory
2. Import necessary utilities and middleware
3. Follow the standard pattern:

```typescript
import { Router, Request, Response } from 'express';
import { authMiddleware, permissionMiddleware } from '../middleware/auth.js';
import { getDatabase, sql } from '../config/database.js';
import { HttpException } from '../middleware/error-handler.js';
import { logger } from '../utils/logger.js';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const pool = await getDatabase();
    const result = await pool.request().query('SELECT * FROM table');
    
    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    logger.error('Error:', error);
    throw error;
  }
});

export default router;
```

4. Register route in `index.ts`:
```typescript
import myRoutes from './routes/my.routes.js';
app.use('/api/my-endpoint', myRoutes);
```

## Database Queries

Always use parameterized queries to prevent SQL injection:

```typescript
// Good - parameterized
const result = await pool
  .request()
  .input('id', sql.Int, id)
  .query('SELECT * FROM users WHERE user_id = @id');

// Bad - vulnerable to SQL injection
const result = await pool
  .request()
  .query(`SELECT * FROM users WHERE user_id = ${id}`);
```

## Error Handling

Always throw `HttpException` for API errors:

```typescript
if (!user) {
  throw new HttpException(404, 'User not found', 'USER_NOT_FOUND');
}

if (!hasPermission) {
  throw new HttpException(403, 'Insufficient permissions', 'INSUFFICIENT_PERMISSIONS');
}

if (!req.body.email) {
  throw new HttpException(400, 'Email is required', 'VALIDATION_ERROR');
}
```

The error handler middleware will catch these and format responses.

## Environment Variables

Required environment variables in `.env`:

```
# Server
PORT=5000
NODE_ENV=development

# Database
DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=password
DB_DATABASE=ComplaintManagement
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

## Running the Backend

```bash
# Install dependencies
npm install

# Development (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database migration
npm run db:migrate

# Seed sample data
npm run db:seed
```

## Best Practices

1. **Always authenticate routes** - Use `authMiddleware` on protected routes
2. **Check permissions** - Use `permissionMiddleware` for sensitive operations
3. **Log important actions** - Log successful operations and errors
4. **Parameterize queries** - Always use parameterized queries
5. **Validate input** - Use validation middleware or manual checks
6. **Handle errors gracefully** - Throw HttpException with appropriate status codes
7. **Use repositories** - Keep database queries in repository layer
8. **Document endpoints** - Add comments explaining what each endpoint does
9. **Test thoroughly** - Test all authentication and permission scenarios
10. **Secure JWT secret** - Change JWT_SECRET in production

## Troubleshooting

### Database Connection Fails
- Check DB_SERVER, DB_USER, DB_PASSWORD in .env
- Ensure SQL Server is running
- Verify database exists
- Check network connectivity

### JWT Errors
- Ensure JWT_SECRET is set
- Check token expiration (JWT_EXPIRY)
- Verify Authorization header format: `Bearer <token>`

### CORS Errors
- Check CORS_ORIGIN matches frontend URL
- Verify request includes Origin header
- Check credentials setting in frontend

### Permission Denied
- Verify user has role assigned
- Check role has required permission
- Verify permission name matches exactly
