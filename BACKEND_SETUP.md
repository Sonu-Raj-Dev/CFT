# Backend Server Setup Guide

This guide explains how to run the API backend separately from the Next.js frontend.

## Architecture

```
┌─────────────────────┐
│  Next.js Frontend   │
│   (Port 3000)       │
│  - UI Components    │
│  - Client Logic     │
│  - Auth Context     │
└──────────┬──────────┘
           │ HTTP Requests
           │ (with JWT tokens)
           ▼
┌─────────────────────┐
│  Express Backend    │
│   (Port 5000)       │
│  - REST API Routes  │
│  - Business Logic   │
│  - Database Access  │
│  - Auth/Validation  │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│   SQL Server DB     │
│   (Port 1433)       │
└─────────────────────┘
```

## Prerequisites

- Node.js 16+ installed
- SQL Server instance running (local or remote)
- npm or yarn package manager

## Installation

### 1. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your SQL Server connection details:

```
PORT=5000
NODE_ENV=development

# Database
DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=YourPassword@123
DB_DATABASE=ComplaintManagement
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=24h

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

### 3. Database Setup

Create the database and run migrations:

```bash
# Create database (run in SQL Server Management Studio or sqlcmd)
CREATE DATABASE ComplaintManagement;
```

Then run the migration scripts from the root directory:

```bash
npm run db:migrate
npm run db:seed
```

### 4. Start Backend Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The backend will start on `http://localhost:5000`

Health check: `http://localhost:5000/health`

## Frontend Configuration

### 1. Update Environment Variables

In the frontend `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### 2. Update API Endpoints

The frontend `lib/api/endpoints.ts` already has the correct paths configured for the backend:

```typescript
export const LOGIN_URL = "/api/auth/login";
export const USERS_URL = "/api/masters/users";
// etc...
```

### 3. Start Frontend

From the root directory:

```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user (requires auth)

### User Management
- `GET /api/masters/users` - List all users
- `POST /api/masters/users` - Create user
- `GET /api/masters/users/:id` - Get user by ID
- `PUT /api/masters/users/:id` - Update user
- `DELETE /api/masters/users/:id` - Delete user

### Roles
- `GET /api/masters/roles` - List all roles
- `POST /api/masters/roles` - Create role
- `GET /api/masters/roles/:id` - Get role by ID

### Permissions
- `GET /api/masters/permissions` - List all permissions
- `POST /api/masters/permissions` - Create permission

### Customers
- `GET /api/masters/customers` - List all customers
- `POST /api/masters/customers` - Create customer
- `GET /api/masters/customers/:id` - Get customer by ID

### Engineers
- `GET /api/masters/engineers` - List all engineers
- `POST /api/masters/engineers` - Create engineer
- `GET /api/masters/engineers/:id` - Get engineer by ID

### Complaints
- `GET /api/complaints` - List all complaints
- `POST /api/complaints` - Create complaint
- `GET /api/complaints/:id` - Get complaint by ID
- `PATCH /api/complaints/:id/assign-engineer` - Assign engineer to complaint
- `PATCH /api/complaints/:id/status` - Update complaint status
- `DELETE /api/complaints/:id` - Delete complaint

## Development Commands

```bash
# Backend commands (from backend directory)
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data

# Frontend commands (from root directory)
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm start            # Start production server
```

## Authentication Flow

1. User logs in with email/password via `POST /api/auth/login`
2. Backend returns JWT token
3. Frontend stores token in context/localStorage
4. Frontend includes token in Authorization header for subsequent requests
5. Backend validates token with auth middleware
6. Token includes user roles and permissions for authorization

## CORS Configuration

The backend has CORS enabled for the frontend URL configured in `CORS_ORIGIN` environment variable.

To allow other origins, update the backend `.env`:

```
CORS_ORIGIN=http://localhost:3000,http://another-domain.com
```

## Troubleshooting

### Database Connection Errors
- Verify SQL Server is running
- Check connection string in `.env`
- Ensure database exists
- Verify user has permissions

### CORS Errors
- Check `CORS_ORIGIN` in backend `.env`
- Ensure it matches frontend URL exactly
- Clear browser cache

### JWT Token Errors
- Verify `JWT_SECRET` is set in `.env`
- Check token expiration with `JWT_EXPIRY`
- Tokens expire by default after 24 hours

### Port Already in Use
- Change `PORT` in `.env` (default: 5000)
- Or kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:5000 | xargs kill -9
  ```

## Deployment

### Backend Deployment (e.g., Heroku, Railway)

1. Push code to repository
2. Set environment variables in deployment platform
3. Ensure SQL Server database is accessible from deployment environment
4. Deploy

### Frontend Deployment (e.g., Vercel)

1. Update `NEXT_PUBLIC_API_BASE_URL` to point to deployed backend
2. Deploy frontend

## Running Both Servers

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

Access the application at `http://localhost:3000`
