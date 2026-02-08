# Complaint Management System - Separated Frontend & Backend

A professional-grade complaint management system with a separated architecture where the frontend (Next.js) and backend (Express) run on different ports.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                          Browser                            │
└────────────────────────────┬────────────────────────────────┘
                             │
                ┌────────────▼─────────────┐
                │   Frontend (Next.js)     │
                │   Port: 3000             │
                │   • React UI             │
                │   • Auth Context         │
                │   • API Client           │
                └────────────┬─────────────┘
                             │ HTTP/REST
                ┌────────────▼─────────────────┐
                │  Backend (Express)           │
                │  Port: 5000                  │
                │  • REST API                  │
                │  • Authentication            │
                │  • Authorization             │
                │  • Business Logic            │
                └────────────┬─────────────────┘
                             │ SQL
                ┌────────────▼─────────────┐
                │  Database (SQL Server)   │
                │  Port: 1433              │
                │  • Users                 │
                │  • Roles & Permissions   │
                │  • Complaints            │
                └──────────────────────────┘
```

## Quick Start

### Prerequisites
- Node.js 16+
- SQL Server (local or remote)
- npm or yarn

### Setup (5 minutes)

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```

2. **Frontend Setup** (in new terminal)
   ```bash
   npm install
   npm run dev
   ```

3. **Access Application**
   - Open http://localhost:3000 in your browser
   - Login with credentials from seed data

## Documentation

Start with one of these based on your needs:

### For Quick Setup
👉 **[QUICK_START.md](./QUICK_START.md)** - Get running in 5 minutes

### For Detailed Setup
👉 **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Step-by-step verification checklist

### For Backend Development
👉 **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Complete backend configuration guide
👉 **[BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md)** - How the backend works

### For Understanding the System
👉 **[SEPARATED_ARCHITECTURE_SUMMARY.md](./SEPARATED_ARCHITECTURE_SUMMARY.md)** - Overall architecture overview

### For Implementation Status
👉 **[IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)** - What's been completed and what remains

## Project Structure

```
project-root/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── middleware/      # Express middleware (auth, error handling)
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Helpers (logger, validation, auth)
│   │   └── index.ts         # Express app entry
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── app/                     # Next.js pages
├── components/              # React components
├── lib/
│   ├── auth-context.tsx     # Authentication state
│   ├── api/                 # API client layer
│   └── ...
│
├── Documentation files (*.md)
├── .env.local              # Frontend env vars
├── package.json
└── tsconfig.json
```

## Running the Servers

### Development Mode

Terminal 1 (Backend):
```bash
npm run backend:dev
# Or: cd backend && npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### Production Mode

Backend:
```bash
cd backend
npm run build
npm start
```

Frontend:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user

### Master Data
- `/api/masters/users` - User management
- `/api/masters/roles` - Role management
- `/api/masters/permissions` - Permission management
- `/api/masters/customers` - Customer management
- `/api/masters/engineers` - Engineer management
- `/api/masters/statuses` - Status management

### Complaints
- `GET /api/complaints` - List complaints
- `POST /api/complaints` - Create complaint
- `GET /api/complaints/:id` - Get complaint
- `PATCH /api/complaints/:id` - Update complaint
- `DELETE /api/complaints/:id` - Delete complaint
- `PATCH /api/complaints/:id/assign-engineer` - Assign engineer

## Key Features

✅ **Separated Architecture** - Frontend and backend on different ports for scalability
✅ **JWT Authentication** - Secure token-based authentication
✅ **Role-Based Access** - User roles and permission management
✅ **Database Migrations** - Automated schema setup
✅ **Error Handling** - Comprehensive error handling and logging
✅ **CORS Enabled** - Cross-origin requests properly configured
✅ **Type Safety** - Full TypeScript support
✅ **Hot Reload** - Auto-reload on file changes during development

## Environment Configuration

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=your_password
DB_DATABASE=ComplaintManagement
JWT_SECRET=your_secret_key
JWT_EXPIRY=24h
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

## Database Setup

Create database in SQL Server:
```sql
CREATE DATABASE ComplaintManagement;
```

Run migrations:
```bash
npm run backend:migrate
npm run backend:seed
```

## Troubleshooting

### Backend won't connect to database
- Verify SQL Server is running
- Check credentials in `backend/.env`
- Ensure database exists

### Frontend can't reach backend
- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Check CORS settings in `backend/.env`

### Authentication issues
- Verify `JWT_SECRET` is set
- Check token in browser Network tab
- Look for Authorization header

See detailed troubleshooting in individual documentation files.

## Deployment

### Backend Deployment
Deploy `backend/` directory to a cloud service:
- Heroku
- Azure
- AWS
- Railway
- Render

### Frontend Deployment
Deploy root directory to:
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify

Update `NEXT_PUBLIC_API_BASE_URL` to point to deployed backend.

## Technology Stack

**Frontend**
- Next.js 15
- React 19
- Tailwind CSS
- Shadcn UI
- Axios

**Backend**
- Express.js
- TypeScript
- JWT
- Bcrypt
- Joi validation
- Morgan logging

**Database**
- SQL Server
- T-SQL

## Commands Reference

```bash
# Backend
npm run backend:dev       # Development mode
npm run backend:build     # Build for production
npm run backend:start     # Start production
npm run backend:migrate   # Run migrations
npm run backend:seed      # Seed data

# Frontend
npm run dev              # Development mode
npm run build            # Build for production
npm run start            # Start production
npm run lint             # Run linter
```

## Architecture Highlights

### Separation of Concerns
- Frontend handles UI/UX
- Backend handles business logic and data access
- Database handles persistence

### Security
- JWT tokens for authentication
- Bcrypt for password hashing
- Parameterized SQL queries
- CORS configuration
- Permission-based authorization

### Scalability
- Independent frontend/backend deployment
- Connection pooling for database
- Stateless API design
- Can scale each component separately

### Developer Experience
- Hot module reloading
- Comprehensive logging
- Type safety with TypeScript
- Clear error messages
- Middleware architecture

## Documentation Index

| File | Purpose |
|------|---------|
| [QUICK_START.md](./QUICK_START.md) | 5-minute setup guide |
| [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) | Step-by-step checklist |
| [BACKEND_SETUP.md](./BACKEND_SETUP.md) | Backend configuration |
| [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) | Backend details |
| [SEPARATED_ARCHITECTURE_SUMMARY.md](./SEPARATED_ARCHITECTURE_SUMMARY.md) | Architecture overview |
| [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) | Implementation status |
| [README_ARCHITECTURE.md](./README_ARCHITECTURE.md) | This file |

## Support

- Check documentation files above
- Review code comments
- Check backend/frontend console logs
- Use browser DevTools Network tab for API debugging

## License

MIT

## Getting Started

1. **Read**: [QUICK_START.md](./QUICK_START.md)
2. **Setup**: Follow setup steps for backend and frontend
3. **Test**: Use [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)
4. **Develop**: Reference [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md)
5. **Deploy**: Follow deployment sections in docs

---

**Last Updated**: 2024
**System Status**: ✅ Fully Separated Architecture Ready
