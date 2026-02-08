# Separated Architecture Summary

## Overview

Your Complaint Management System is now split into two independent servers:

1. **Frontend Server** (Next.js) - Running on port 3000
2. **Backend Server** (Express API) - Running on port 5000
3. **Database** (SQL Server) - Running on port 1433

This separation provides better scalability, independent deployment, and cleaner code organization.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Your Browser                           │
└──────────────────────────────┬──────────────────────────────┘
                               │
                ┌──────────────▼──────────────┐
                │   FRONTEND SERVER           │
                │   (Next.js - Port 3000)     │
                │                             │
                │  • React Components         │
                │  • UI/UX Logic              │
                │  • Authentication Context   │
                │  • Permission Guards        │
                │  • API Client Layer         │
                └──────────────┬──────────────┘
                               │
                  HTTP/REST    │    (with JWT Token)
              (CORS enabled)   │
                               │
                ┌──────────────▼──────────────┐
                │   BACKEND SERVER            │
                │   (Express - Port 5000)     │
                │                             │
                │  • REST API Endpoints       │
                │  • Authentication Logic     │
                │  • Authorization Rules      │
                │  • Business Logic           │
                │  • Data Validation          │
                │  • Error Handling           │
                └──────────────┬──────────────┘
                               │
                   SQL Queries │
                               │
                ┌──────────────▼──────────────┐
                │   DATABASE                  │
                │   (SQL Server - Port 1433)  │
                │                             │
                │  • Users                    │
                │  • Roles & Permissions      │
                │  • Complaints               │
                │  • Customers & Engineers    │
                └─────────────────────────────┘
```

## What Goes Where

### Frontend (Next.js - Port 3000)

**Responsibilities:**
- Render UI components
- Manage client-side state (auth context, UI state)
- Handle user interactions
- Display data to users
- Manage browser history/routing
- Handle form validation (client-side)
- Manage loading states and error display

**Does NOT do:**
- Database queries
- Business logic calculations
- Permission checks (only UI conditionals)
- Password hashing
- Token validation (trusts backend)

**Key Files:**
- `app/page.tsx` - Main pages
- `components/` - React components
- `lib/auth-context.tsx` - Authentication state
- `lib/api/axios-client.ts` - HTTP client
- `lib/api/services.ts` - API wrapper functions

### Backend (Express - Port 5000)

**Responsibilities:**
- Handle all HTTP requests
- Authenticate users (verify JWT tokens)
- Check user permissions
- Execute business logic
- Query database
- Validate all input
- Return data in consistent format
- Log all operations
- Handle all errors

**Does NOT do:**
- Render HTML (only JSON responses)
- Direct browser manipulation
- Store state between requests (stateless)
- Client-side validation only

**Key Files:**
- `backend/src/index.ts` - Express app setup
- `backend/src/routes/` - API endpoints
- `backend/src/middleware/` - Request processing
- `backend/src/config/database.ts` - DB connection
- `backend/src/utils/` - Helper functions

### Database (SQL Server - Port 1433)

**Responsibilities:**
- Store all persistent data
- Enforce data integrity
- Handle concurrent requests

**Key Tables:**
- `users` - User accounts
- `roles` - User roles
- `permissions` - Available permissions
- `user_role_mappings` - User-role associations
- `role_permission_mappings` - Role-permission associations
- `complaints` - Customer complaints
- `customers` - Customer information
- `engineers` - Engineer information
- `statuses` - Complaint statuses

## Communication Flow

### User Login Flow

```
1. User enters email/password in browser
                ↓
2. Frontend validates input (client-side)
                ↓
3. Frontend sends POST to /api/auth/login
                ↓
4. Backend validates email/password format
                ↓
5. Backend queries database for user
                ↓
6. Backend compares passwords with bcrypt
                ↓
7. Backend generates JWT token
                ↓
8. Backend returns token to frontend
                ↓
9. Frontend stores token in context/localStorage
                ↓
10. Frontend redirects to dashboard
```

### Protected API Request Flow

```
1. Frontend needs data (e.g., list complaints)
                ↓
2. Frontend includes JWT token in header:
   Authorization: Bearer <token>
                ↓
3. Backend receives request
                ↓
4. Backend middleware validates token
                ↓
5. Backend adds req.user with decoded token data
                ↓
6. Backend checks permissions middleware
                ↓
7. Backend executes endpoint logic
                ↓
8. Backend queries database
                ↓
9. Backend returns data as JSON
                ↓
10. Frontend processes response
                ↓
11. Frontend updates UI with data
```

## Running the Servers

### Option 1: Run in Separate Terminals (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
# Backend running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
# Frontend running on http://localhost:3000
```

### Option 2: Using NPM Scripts from Root

From the root directory:

```bash
# Backend only
npm run backend:dev

# Frontend only
npm run dev

# Both together (requires running in separate terminals or using a tool like concurrently)
```

### Database Setup (One-time)

```bash
# Create database in SQL Server
CREATE DATABASE ComplaintManagement;

# Run migrations from root
npm run backend:migrate

# Seed sample data
npm run backend:seed
```

## Environment Configuration

### Backend `.env` (backend/.env)

```
PORT=5000
NODE_ENV=development
DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=YourPassword
DB_DATABASE=ComplaintManagement
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=24h
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

### Frontend `.env.local` (root/.env.local)

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

## Key Differences from Monolithic Setup

### Before (Monolithic)
- All code in `/app/api` routes
- Frontend and API in same Next.js server
- Single port (3000)
- Mixed concerns

### After (Separated)
- Frontend in root `/app` and `/components`
- Backend in `/backend` directory
- Two ports (3000 and 5000)
- Clear separation of concerns

## Benefits of This Setup

1. **Independent Scaling** - Scale frontend and backend separately
2. **Independent Deployment** - Deploy each service independently
3. **Clear Responsibilities** - Each service has distinct role
4. **Better Testing** - Test frontend and backend independently
5. **Framework Flexibility** - Backend could be replaced with different framework
6. **Team Separation** - Frontend and backend teams can work independently
7. **Performance** - Lightweight frontend server, dedicated API server
8. **Reusability** - Backend API can be consumed by mobile apps, desktop clients

## API Endpoints Structure

All backend endpoints follow this pattern:

```
Base URL: http://localhost:5000/api

Authentication:
POST   /auth/login              - Login with email/password
POST   /auth/register           - Register new user
GET    /auth/me                 - Get current user

Users:
GET    /masters/users           - List all users
POST   /masters/users           - Create user
GET    /masters/users/:id       - Get user by ID
PATCH  /masters/users/:id       - Update user
DELETE /masters/users/:id       - Delete user

Roles:
GET    /masters/roles           - List all roles
POST   /masters/roles           - Create role
GET    /masters/roles/:id       - Get role
PATCH  /masters/roles/:id       - Update role
DELETE /masters/roles/:id       - Delete role

Permissions:
GET    /masters/permissions     - List permissions
POST   /masters/permissions     - Create permission

Complaints:
GET    /api/complaints          - List complaints
POST   /api/complaints          - Create complaint
GET    /api/complaints/:id      - Get complaint
PATCH  /api/complaints/:id      - Update complaint
DELETE /api/complaints/:id      - Delete complaint
PATCH  /api/complaints/:id/assign-engineer - Assign engineer

Customers:
GET    /masters/customers       - List customers
POST   /masters/customers       - Create customer

Engineers:
GET    /masters/engineers       - List engineers
POST   /masters/engineers       - Create engineer

Statuses:
GET    /masters/statuses        - List statuses
```

## Authentication & Authorization

### Token Format

JWT token contains:
```json
{
  "userId": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["admin", "engineer"],
  "permissions": ["create_user", "delete_user", "view_reports"]
}
```

### Request with Token

```
GET /api/masters/users HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Permission Checking

Backend checks permissions on every protected route:

```typescript
// Only users with "create_user" permission can call this
router.post('/create', 
  authMiddleware,                    // Verify token
  permissionMiddleware('create_user'), // Check permission
  createHandler
);
```

## Error Handling

### Backend Error Response

```json
{
  "success": false,
  "message": "User not found",
  "code": "USER_NOT_FOUND",
  "timestamp": "2024-01-20T10:30:00Z"
}
```

### Frontend Error Handling

Frontend's Axios client automatically:
- Redirects to login on 401 (Unauthorized)
- Shows error toast on 4xx/5xx errors
- Logs errors for debugging

## Database Interactions

### From Frontend
- Frontend NEVER queries database directly
- Frontend ONLY calls backend API endpoints
- Backend validates, authorizes, then queries database

### From Backend
```typescript
// Example: Getting user data
const pool = await getDatabase();
const result = await pool
  .request()
  .input('id', sql.Int, userId)
  .query('SELECT * FROM users WHERE user_id = @id');
```

## Deployment Strategy

### Backend Deployment (to Heroku, Azure, AWS)
1. Push `backend/` to repository
2. Deploy backend with Node.js buildpack
3. Set environment variables (DB_SERVER, JWT_SECRET, etc.)
4. Database must be accessible from cloud
5. Backend running on cloud domain (e.g., api.example.com)

### Frontend Deployment (to Vercel, Netlify)
1. Push root repository to GitHub
2. Deploy frontend (Vercel recommended for Next.js)
3. Update `NEXT_PUBLIC_API_BASE_URL` to deployed backend URL
4. Frontend accessible at your domain

### Example Deployment URLs
- Frontend: `https://app.example.com`
- Backend: `https://api.example.com`
- Database: Cloud SQL Server instance

Frontend `.env.local` would then have:
```
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api
```

## Development Best Practices

1. **Keep both servers running** - Don't stop backend while testing frontend
2. **Check console logs** - Backend console shows query errors, frontend console shows request errors
3. **Use API tools** - Use Postman or similar to test backend independently
4. **Test permissions** - Login as different users to test permission logic
5. **Monitor database** - Check database for data consistency
6. **Version your API** - Consider API versioning for future changes
7. **Document changes** - Keep README updated with new endpoints

## Troubleshooting

### Frontend can't reach backend
- Verify backend running on 5000: `http://localhost:5000/health`
- Check CORS_ORIGIN in backend .env matches frontend URL
- Check NEXT_PUBLIC_API_BASE_URL in frontend .env.local
- Check browser Network tab for actual request URL

### Backend won't start
- Check `npm install` in backend directory
- Verify SQL Server is running
- Check DB credentials in .env
- Check port 5000 isn't in use

### Authentication issues
- Verify JWT_SECRET is set and consistent
- Check token expiration (JWT_EXPIRY)
- Verify Authorization header format: `Bearer <token>`
- Check browser Network tab to see token in requests

## Next Steps

1. Start both servers (follow "Running the Servers" section)
2. Test login flow - use test credentials
3. Test creating/viewing/updating data
4. Test permission-based features
5. Check frontend and backend logs for any issues
6. Read detailed docs: QUICK_START.md, BACKEND_SETUP.md, BACKEND_ARCHITECTURE.md

## File Structure Reference

```
project-root/
├── app/                         # Frontend Next.js app
├── components/                  # Frontend React components
├── lib/
│   ├── auth-context.tsx        # Auth state management
│   ├── api/                    # API client layer
│   │   ├── endpoints.ts        # API URL definitions
│   │   ├── axios-client.ts     # HTTP client
│   │   └── services.ts         # API wrappers
├── backend/                     # Express backend
│   ├── src/
│   │   ├── config/             # Configuration
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API routes
│   │   ├── utils/              # Helper utilities
│   │   └── index.ts            # Express app entry
│   ├── .env                    # Backend environment vars
│   └── package.json
├── .env.local                  # Frontend environment vars
├── package.json                # Frontend scripts
├── QUICK_START.md              # Quick start guide
├── BACKEND_SETUP.md            # Backend setup guide
└── BACKEND_ARCHITECTURE.md     # Architecture details
```

This separation provides a professional, scalable architecture ready for production deployment!
