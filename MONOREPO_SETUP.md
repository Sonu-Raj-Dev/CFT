# Monorepo Setup Guide - Frontend & Separate Backend

This project is organized as a monorepo with a Next.js frontend and a separate Express backend server.

## Project Structure

```
root/
├── frontend/                  # Next.js frontend (port 3000)
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   └── ...
├── backend/                   # Express backend (port 5000)
│   ├── src/
│   ├── package.json
│   └── ...
├── scripts/                   # SQL migration scripts
├── docker-compose.yml         # Orchestrate both services
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- SQL Server (local or Docker)
- npm or yarn

### Setup Both Services

#### Step 1: Install Frontend Dependencies
```bash
# From root directory
npm install
# or
yarn install
```

#### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
# or
yarn install
cd ..
```

#### Step 3: Configure Environment Variables

**Frontend (.env.local)**
```bash
cp .env.example .env.local
```

Update `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

**Backend (backend/.env)**
```bash
cd backend
cp .env.example .env
```

Update `backend/.env` with your database credentials:
```
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=YourPassword@123
DB_DATABASE=ComplaintManagement
JWT_SECRET=your-super-secret-key
CORS_ORIGIN=http://localhost:3000
```

#### Step 4: Database Setup

If using SQL Server locally:

```bash
# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

#### Step 5: Run Both Services

**Option A: Terminal 1 (Frontend)**
```bash
npm run dev
# Frontend runs on http://localhost:3000
```

**Option B: Terminal 2 (Backend)**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5000
```

**Option C: Run All with Docker Compose**
```bash
docker-compose up
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## Running Services Separately

### Frontend Only
```bash
# Terminal 1
npm run dev

# Access at http://localhost:3000
# API requests go to NEXT_PUBLIC_API_BASE_URL
```

### Backend Only
```bash
# Terminal 1
cd backend
npm run dev

# API runs at http://localhost:5000
# Test at http://localhost:5000/health
```

## API Communication

The frontend makes API calls to the backend via the `NEXT_PUBLIC_API_BASE_URL` environment variable.

**Axios Configuration** (`lib/api/axios-client.ts`):
```typescript
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Token Management**:
- Tokens are stored in localStorage
- Automatically added to all requests via Authorization header
- Interceptors handle 401 responses (redirect to login)

## Development Workflow

### Adding New Features

1. **Frontend Change**:
   - Create/update component in `components/`
   - Use existing API services in `lib/api/services.ts`
   - Update endpoint in `lib/api/endpoints.ts` if needed

2. **Backend Change**:
   - Add repository method in `backend/src/repositories/`
   - Create/update route in `backend/src/routes/`
   - Add validation schema if needed
   - Test endpoint with Postman/Insomnia

3. **Connect Frontend to Backend**:
   - Use axios client with configured base URL
   - Include JWT token in Authorization header
   - Handle errors with standardized response format

### Testing Endpoints

Using Postman/Insomnia:

1. **Login to get token**:
   - POST `http://localhost:5000/api/auth/login`
   - Body: `{ "email": "user@example.com", "password": "password" }`
   - Copy token from response

2. **Use token in headers**:
   - Authorization: `Bearer <token>`
   - Make requests to backend endpoints

3. **Test from frontend**:
   - Ensure backend is running on port 5000
   - Ensure NEXT_PUBLIC_API_BASE_URL points to `http://localhost:5000`
   - Use browser dev tools to see API calls

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Complaint Management System
```

### Backend (backend/.env)
```
NODE_ENV=development
PORT=5000
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=YourPassword@123
DB_DATABASE=ComplaintManagement
DB_PORT=1433
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

## Production Deployment

### Frontend (Vercel)
```bash
# Push to GitHub, Vercel auto-deploys
# Set NEXT_PUBLIC_API_BASE_URL in Vercel dashboard
NEXT_PUBLIC_API_BASE_URL=https://api.youromain.com
```

### Backend (Azure, AWS, Heroku, etc.)
```bash
# Build
npm run build

# Start
npm start

# Or use Docker:
docker build -t complaint-backend .
docker run -p 5000:5000 complaint-backend
```

## CORS Configuration

Frontend (port 3000) communicates with Backend (port 5000):
- Backend allows CORS from `CORS_ORIGIN=http://localhost:3000`
- Update for production: `CORS_ORIGIN=https://yourdomain.com`

## Troubleshooting

### "Cannot reach backend" error
- Check backend is running on port 5000
- Verify NEXT_PUBLIC_API_BASE_URL is correct
- Check CORS_ORIGIN allows frontend URL

### Database connection failed
- Ensure SQL Server is running
- Check credentials in backend/.env
- Verify database exists

### CORS errors in browser
- Backend CORS_ORIGIN must match frontend URL
- Clear browser cache and cookies
- Restart both services

### Port already in use
```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9
```

## Architecture Benefits

1. **Separation of Concerns**: Frontend and backend develop independently
2. **Scalability**: Backend can scale separately from frontend
3. **Security**: API running on different port with auth middleware
4. **Flexibility**: Easy to use backend with other frontend frameworks
5. **Testing**: Each service can be tested independently
6. **Deployment**: Deploy frontend to CDN, backend to application server

## Next Steps

1. Install dependencies for both frontend and backend
2. Configure SQL Server database
3. Update .env files with your settings
4. Run migrations and seed data
5. Start frontend and backend servers
6. Test authentication flow
7. Begin implementing API routes following the patterns established
