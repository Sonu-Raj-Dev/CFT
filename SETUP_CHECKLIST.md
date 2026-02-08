# Complete Setup Checklist

Follow this checklist to get your separated frontend and backend running.

## Prerequisites

- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm or yarn installed
- [ ] SQL Server installed and running (local or remote)
- [ ] Access to SQL Server management tools (Management Studio or sqlcmd)
- [ ] Two terminal windows open
- [ ] Code editor/IDE installed (VS Code recommended)

## Database Setup (One-time)

### Create Database

- [ ] Open SQL Server Management Studio or sqlcmd
- [ ] Run:
  ```sql
  CREATE DATABASE ComplaintManagement;
  ```
- [ ] Verify database was created

## Backend Setup

### Initial Setup

- [ ] Navigate to backend directory:
  ```bash
  cd backend
  ```

- [ ] Install dependencies:
  ```bash
  npm install
  ```
  - This installs: express, mssql, bcrypt, jwt, cors, etc.
  - Wait for completion (may take 1-2 minutes)

- [ ] Copy environment template:
  ```bash
  cp .env.example .env
  ```
  - Creates `backend/.env` file

### Configure Backend

- [ ] Edit `backend/.env`:
  ```
  PORT=5000                          ← Port for backend
  NODE_ENV=development
  
  DB_SERVER=localhost                ← Your SQL Server address
  DB_PORT=1433                       ← SQL Server port (default 1433)
  DB_USER=sa                         ← SQL Server username
  DB_PASSWORD=YourPassword           ← SQL Server password
  DB_DATABASE=ComplaintManagement    ← Database name (must match above)
  DB_ENCRYPT=true
  DB_TRUST_SERVER_CERTIFICATE=true
  
  JWT_SECRET=your_secret_jwt_key_change_this_in_production
  JWT_EXPIRY=24h
  
  CORS_ORIGIN=http://localhost:3000  ← Frontend URL
  LOG_LEVEL=debug
  ```

- [ ] Verify database connection by checking these values:
  - [ ] DB_SERVER matches your SQL Server (use `localhost` for local)
  - [ ] DB_USER has access to database
  - [ ] DB_PASSWORD is correct
  - [ ] DB_DATABASE is `ComplaintManagement`

### Database Migrations

- [ ] From root directory, run migrations:
  ```bash
  npm run backend:migrate
  ```
  - This creates all tables in the database
  - Should complete without errors

- [ ] Seed sample data:
  ```bash
  npm run backend:seed
  ```
  - Creates sample users, roles, permissions
  - Should complete without errors

- [ ] Verify in SQL Server:
  ```sql
  USE ComplaintManagement;
  SELECT * FROM users;
  SELECT * FROM roles;
  SELECT * FROM permissions;
  ```
  - Should see sample data

### Start Backend Server

- [ ] In Terminal 1, run:
  ```bash
  npm run backend:dev
  ```
  - Or from backend directory: `npm run dev`

- [ ] Verify output shows:
  ```
  Backend server running on http://localhost:5000
  Environment: development
  CORS enabled for: http://localhost:3000
  ```

- [ ] Test health endpoint (in browser or curl):
  ```
  http://localhost:5000/health
  ```
  - Should return JSON with status "ok"

- [ ] Keep backend running and move to next step

## Frontend Setup

### Initial Setup

- [ ] In new terminal, navigate to root directory (leave backend running)

- [ ] Install dependencies:
  ```bash
  npm install
  ```
  - Wait for completion

- [ ] Create/verify `.env.local`:
  ```
  NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
  ```

- [ ] Verify file exists:
  ```bash
  cat .env.local  # Mac/Linux
  type .env.local # Windows
  ```

### Start Frontend Server

- [ ] In Terminal 2, run:
  ```bash
  npm run dev
  ```

- [ ] Verify output shows:
  ```
  ▲ Next.js 15.2.4
  - Local:        http://localhost:3000
  ```

- [ ] Keep frontend running

## Verification & Testing

### Access Application

- [ ] Open browser and go to:
  ```
  http://localhost:3000
  ```
  - Should see application UI

- [ ] No errors in browser console:
  - [ ] Press F12 to open DevTools
  - [ ] Go to Console tab
  - [ ] Should be empty or have minimal warnings

### Test Backend API

- [ ] Test health check:
  ```bash
  curl http://localhost:5000/health
  ```
  - Should return JSON response

- [ ] Test login endpoint:
  ```bash
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"password123"}'
  ```
  - Should return token or error message
  - (Use actual credentials from seed data)

### Test Frontend-Backend Communication

- [ ] In browser at http://localhost:3000, check Network tab:
  - [ ] Press F12
  - [ ] Go to Network tab
  - [ ] Try logging in
  - [ ] Should see request to `http://localhost:5000/api/auth/login`
  - [ ] Request should complete with 200 status

### Test Authentication Flow

- [ ] Try logging in with test credentials:
  - Email: `admin@example.com` (or from seed data)
  - Password: `password123` (or from seed data)

- [ ] Successful login shows:
  - [ ] Redirects to dashboard
  - [ ] User info displayed
  - [ ] No errors in console

- [ ] Verify token is stored:
  - [ ] Open browser DevTools
  - [ ] Go to Application → Local Storage
  - [ ] Should see token stored

### Test Protected Routes

- [ ] Create new user/complaint/etc (if UI implemented):
  - [ ] Should show success message
  - [ ] Check Network tab - request should have Authorization header
  - [ ] Check backend console - should see operation logged

- [ ] Try unauthorized actions:
  - [ ] Attempt to access admin features without permission
  - [ ] Should see error message or redirect

## Troubleshooting Checklist

### Backend Won't Start

- [ ] Check Node.js version:
  ```bash
  node --version  # Should be 16+
  ```

- [ ] Check dependencies installed:
  ```bash
  cd backend && npm list mssql  # Should show version
  ```

- [ ] Check database connection:
  - [ ] Verify SQL Server is running
  - [ ] Test connection from SQL Server Management Studio
  - [ ] Verify credentials in `.env`

- [ ] Check port availability:
  ```bash
  # Windows: netstat -ano | findstr :5000
  # Mac/Linux: lsof -i :5000
  ```
  - If in use, change PORT in `.env` to 5001

- [ ] Check logs:
  - [ ] Look at error message in terminal
  - [ ] Search error message in this file or docs

### Frontend Won't Start

- [ ] Check Node.js version:
  ```bash
  node --version
  ```

- [ ] Verify `.env.local` exists and has correct URL

- [ ] Check port availability:
  ```bash
  # Windows: netstat -ano | findstr :3000
  # Mac/Linux: lsof -i :3000
  ```

- [ ] Clear cache:
  ```bash
  rm -rf .next
  npm run dev
  ```

### Can't Connect Frontend to Backend

- [ ] Verify both servers running:
  - [ ] Backend: `http://localhost:5000/health` returns JSON
  - [ ] Frontend: `http://localhost:3000` loads UI

- [ ] Check CORS settings:
  - [ ] Backend `.env` has: `CORS_ORIGIN=http://localhost:3000`
  - [ ] Restart backend after changing

- [ ] Check API URL:
  - [ ] Frontend `.env.local` has: `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api`
  - [ ] Restart frontend after changing

- [ ] Check browser Network tab:
  - [ ] See request going to correct URL
  - [ ] Check response status (should be 200 for success)
  - [ ] Check response headers for CORS headers

### Login Fails

- [ ] Verify test credentials exist:
  ```sql
  SELECT * FROM users;
  ```

- [ ] Check password hashing:
  - [ ] Backend logs should show password validation
  - [ ] Check email is exact match (case-sensitive)

- [ ] Verify JWT_SECRET in backend `.env`:
  - [ ] Should not be empty
  - [ ] Should be at least 10 characters

- [ ] Check token expiry:
  - [ ] `JWT_EXPIRY` in backend `.env` should be valid (e.g., "24h")

### API Request Returns 401/403

- [ ] Check authorization header:
  - [ ] Browser DevTools → Network tab
  - [ ] Look for `Authorization: Bearer <token>`
  - [ ] Token should be present

- [ ] Check token validity:
  - [ ] Token should not be expired
  - [ ] Token should be properly formatted

- [ ] Check permissions:
  - [ ] User's role should have required permission
  - [ ] Backend logs should show permission check

### Database Errors

- [ ] Verify tables exist:
  ```sql
  USE ComplaintManagement;
  SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;
  ```

- [ ] Check data:
  ```sql
  SELECT * FROM users;
  SELECT * FROM roles;
  SELECT * FROM permissions;
  ```

- [ ] Verify migrations ran:
  - [ ] Check if `001-schema-improvements.sql` was executed
  - [ ] Check if tables and relationships exist

- [ ] Re-run migrations:
  ```bash
  npm run backend:migrate
  npm run backend:seed
  ```

## Performance Checks

- [ ] Both servers show no error messages:
  - [ ] Backend console clean
  - [ ] Frontend console clean

- [ ] Network requests complete quickly:
  - [ ] API responses < 500ms
  - [ ] No 5xx errors in Network tab

- [ ] No memory leaks:
  - [ ] Terminal shows stable memory usage
  - [ ] No warnings about connection pools

## Security Checks

- [ ] Never commit `.env` files:
  - [ ] `.env` files in `.gitignore`
  - [ ] `.env.local` in `.gitignore`

- [ ] Change JWT_SECRET before production:
  - [ ] Generate secure random string
  - [ ] Use at least 32 characters
  - [ ] Never use default from example

- [ ] Database password is strong:
  - [ ] Not "password" or "sa"
  - [ ] Contains mixed case, numbers, special chars
  - [ ] At least 12 characters

## Final Checklist

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] Both servers show no errors
- [ ] Can navigate to http://localhost:3000 in browser
- [ ] Network tab shows requests going to `http://localhost:5000/api`
- [ ] Login works with test credentials
- [ ] After login, authenticated requests work
- [ ] No console errors in browser
- [ ] No console errors in backend terminal

## You're All Set! 

If all checkboxes above are checked, your system is properly configured and ready to use!

### Next Steps

1. **Explore the application** - Try creating complaints, managing users, etc.
2. **Test features** - Test different user roles and permissions
3. **Review code** - Understand how frontend and backend communicate
4. **Make changes** - Both servers auto-reload on file changes
5. **Read documentation** - Check other docs for architecture details

### Useful Commands While Running

```bash
# View backend logs
# Terminal 1 is already showing logs

# View frontend logs
# Terminal 2 is already showing logs

# Test backend API
curl http://localhost:5000/health

# Database management
# Use SQL Server Management Studio

# Kill a process on a port
# Windows: netstat -ano | findstr :5000, then taskkill /PID <PID> /F
# Mac/Linux: lsof -ti:5000 | xargs kill -9
```

### Stopping the Servers

To stop development:

```bash
# Terminal 1 (Backend)
Ctrl+C

# Terminal 2 (Frontend)
Ctrl+C
```

To restart:

```bash
# Terminal 1
npm run backend:dev

# Terminal 2
npm run dev
```

## Support

If you run into issues not covered here:

1. Check `QUICK_START.md` - Quick start guide
2. Check `BACKEND_SETUP.md` - Detailed backend setup
3. Check `BACKEND_ARCHITECTURE.md` - How backend works
4. Check `SEPARATED_ARCHITECTURE_SUMMARY.md` - Overall architecture

All major files are documented with examples and troubleshooting tips!
