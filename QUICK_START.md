# Quick Start - Running Frontend and Backend Separately

## Prerequisites

- Node.js 16+ installed
- SQL Server instance running
- Two terminal windows

## Step 1: Setup Backend

### Terminal 1 - Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
# Update DB_SERVER, DB_USER, DB_PASSWORD, DB_DATABASE
nano .env  # or use your favorite editor
```

### Create Database (One-time)

Run in SQL Server Management Studio or sqlcmd:
```sql
CREATE DATABASE ComplaintManagement;
```

### Start Backend

```bash
# From backend directory
npm run dev
```

Expected output:
```
Backend server running on http://localhost:5000
CORS enabled for: http://localhost:3000
Health check available at: http://localhost:5000/health
```

Test the backend: Visit `http://localhost:5000/health` in your browser

## Step 2: Setup Frontend

### Terminal 2 - Frontend Setup

```bash
# Navigate to root directory (where package.json is)
cd ..

# Install dependencies (if not already done)
npm install

# Ensure .env.local has the correct backend URL
# Check that NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### Start Frontend

```bash
# From root directory
npm run dev
```

Expected output:
```
  ▲ Next.js 15.2.4
  - Local:        http://localhost:3000
  - Environments: .env.local
```

## Step 3: Access Application

Open your browser and go to: `http://localhost:3000`

## Architecture Overview

```
┌─────────────────────────────────────────┐
│     Your Browser                        │
│     http://localhost:3000               │
│  (Next.js Frontend + React UI)          │
└────────────────┬────────────────────────┘
                 │ HTTP Requests
                 │ + JWT Token Header
                 ▼
┌─────────────────────────────────────────┐
│     Express Backend                     │
│     http://localhost:5000               │
│  (REST API + Business Logic)            │
└────────────────┬────────────────────────┘
                 │ SQL Queries
                 ▼
┌─────────────────────────────────────────┐
│     SQL Server Database                 │
│     localhost:1433                      │
│  (ComplaintManagement)                  │
└─────────────────────────────────────────┘
```

## Testing the Setup

### 1. Test Backend Health

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Backend server is running",
  "timestamp": "2024-01-20T10:30:00Z",
  "uptime": 123.45
}
```

### 2. Test Frontend Access

Open `http://localhost:3000` in your browser - you should see the application UI

### 3. Test Login

1. Go to login page
2. Try logging in with test credentials (created by seed script)
3. Check browser console for any errors
4. Check Network tab to see API requests going to `http://localhost:5000/api/auth/login`

## Common Issues & Solutions

### Backend Won't Start

**Issue**: `Cannot find module 'mssql'`
**Solution**: Run `npm install` in backend directory

**Issue**: `Error: connect ECONNREFUSED 127.0.0.1:1433`
**Solution**: 
- Verify SQL Server is running
- Check DB_SERVER in .env
- Check DB_PORT is correct (default 1433)

**Issue**: Port 5000 already in use
**Solution**: 
```bash
# Kill process using port 5000
# Windows: netstat -ano | findstr :5000, then taskkill /PID <PID> /F
# Mac/Linux: lsof -ti:5000 | xargs kill -9

# Or use different port in .env: PORT=5001
```

### Frontend Won't Connect to Backend

**Issue**: CORS errors in browser console
**Solution**:
- Verify backend is running on port 5000
- Check `CORS_ORIGIN=http://localhost:3000` in backend `.env`
- Clear browser cache
- Try in incognito mode

**Issue**: `Failed to fetch from API` errors
**Solution**:
- Verify `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api` in frontend `.env.local`
- Check that backend is responding: `curl http://localhost:5000/health`
- Check browser Network tab to see actual request URL

### Database Connection Issues

**Issue**: `Connection timeout`
**Solution**:
- Verify SQL Server service is running
- Check connection string in `.env`
- Verify firewall isn't blocking port 1433
- For SQL Server Express, connection string may need `.\SQLEXPRESS`

### JWT/Authentication Issues

**Issue**: `Invalid token` or `Unauthorized` errors
**Solution**:
- Verify JWT_SECRET is set in backend `.env`
- Check token is being sent in Authorization header
- Verify token hasn't expired (check JWT_EXPIRY)

## Stopping the Servers

### Backend
- In Terminal 1: Press `Ctrl+C`

### Frontend
- In Terminal 2: Press `Ctrl+C`

## Restarting After Changes

### Backend Changes
1. Backend will auto-reload if using `npm run dev`
2. Or manually restart: `Ctrl+C` then `npm run dev`

### Frontend Changes
1. Frontend will auto-reload if using `npm run dev`
2. Or manually restart: `Ctrl+C` then `npm run dev`

### Database Changes
1. Run migrations: `npm run db:migrate`
2. Seed data: `npm run db:seed`
3. Restart backend server

## Useful Commands

```bash
# Check if ports are in use
# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :5000
lsof -i :3000

# Test backend API endpoints
curl http://localhost:5000/health
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/masters/users

# View backend logs
tail -f backend/.env

# Database migration
npm run db:migrate

# Seed sample data
npm run db:seed
```

## Next Steps

1. **Test API endpoints**: Use the API documentation in `backend/docs/` or Postman
2. **Create test user**: Use database seed or register through frontend
3. **Test login flow**: Login with test credentials
4. **Explore application**: Navigate through complaint management features
5. **Check user roles**: Verify permission-based UI is working

## Development Workflow

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Backend auto-reloads on file changes

# Terminal 2 - Frontend
npm run dev
# Frontend auto-reloads on file changes

# Make changes to either frontend or backend
# Changes auto-reload in respective servers
# Test in browser at http://localhost:3000
```

## Production Deployment

When ready to deploy:

1. **Backend**: Deploy to cloud service (Heroku, Azure, AWS)
2. **Frontend**: Deploy to Vercel or similar
3. **Database**: Use cloud database (Azure SQL, AWS RDS)
4. **Update URLs**: Point frontend to deployed backend URL
5. **Set environment variables**: Update JWT_SECRET, CORS_ORIGIN for production

See `BACKEND_SETUP.md` for detailed deployment instructions.
