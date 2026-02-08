# Complaint Management System - Full Stack Implementation

A complete Node.js + React full-stack application with dynamic role-based access control (RBAC) and permission-based access control (PBAC). This system manages complaints with secure authentication, dynamic permissions, and role-specific features.

## 🎯 Key Features

- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Dynamic Permissions**: Permissions fully managed from database, no hardcoded roles/permissions
- **Role-Based Access Control**: Multiple roles with flexible permission assignments
- **Engineer Role Logic**: Engineers see only complaints assigned to them
- **Complaint Management**: Full CRUD with status tracking and engineer assignment
- **Master Data Management**: Users, Roles, Permissions, Customers, Engineers, Statuses
- **Audit Trail**: Soft deletes with CreatedBy/ModifiedBy tracking
- **API Documentation**: Complete API guide with examples
- **Permission-Aware UI**: React components that render based on user permissions

## 📋 Project Structure

```
/app
  /api
    /auth              # Authentication endpoints
    /masters          # Master data CRUD endpoints
    /complaints       # Complaint endpoints
  /dashboard          # Protected dashboard page
  /login             # Login page
  layout.tsx         # Main layout

/lib
  /api
    axios-client.ts    # Axios HTTP client with JWT
    endpoints.ts       # API endpoint definitions
    services.ts        # API service layer
  /server
    auth.ts           # JWT & bcrypt utilities
    db.ts             # Database connection pooling
    logger.ts         # Logging utility
    middleware.ts     # Auth & permission middleware
    responses.ts      # Standardized API responses
    validation.ts     # Joi validation schemas
    types.ts          # TypeScript type definitions
    /repositories     # Database access layer
      user-repository.ts
      role-repository.ts
      permission-repository.ts
      complaint-repository.ts
      customer-repository.ts
      engineer-repository.ts
      status-repository.ts
      user-role-mapping-repository.ts
      role-permission-mapping-repository.ts
  auth-context.tsx    # Frontend auth state management

/components
  navbar.tsx         # Navigation with permission guards
  permission-guard.tsx # Permission-based rendering
  protected-route.tsx  # Protected route wrapper

/scripts
  001-schema-improvements.sql  # Database schema fixes
  002-seed-initial-data.sql    # Initial data

/public/api          # API documentation

README.md            # This file
API_IMPLEMENTATION_GUIDE.md    # Detailed API implementation guide
IMPLEMENTATION_SUMMARY.md      # Complete feature checklist
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- SQL Server database
- npm or yarn

### Installation

1. **Clone and setup**
   ```bash
   git clone <repo-url>
   cd project
   npm install
   ```

2. **Configure environment variables**
   Create `.env.local`:
   ```env
   # API Base URL
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

   # Database Configuration
   DB_SERVER=your-database-server
   DB_NAME=CFT
   DB_USER=your-username
   DB_PASSWORD=your-password
   DB_ENCRYPT=true
   DB_TRUST_CERT=false

   # JWT Configuration
   JWT_SECRET=your-secret-key-min-32-chars
   JWT_EXPIRES_IN=24h
   ```

3. **Run database migrations**
   ```bash
   # Execute these scripts in SQL Server Management Studio or sqlcmd
   sqlcmd -S your-server -d CFT -i scripts/001-schema-improvements.sql
   sqlcmd -S your-server -d CFT -i scripts/002-seed-initial-data.sql
   ```

4. **Start development server**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

## 🔐 Authentication & Permissions

### Login Flow
```
User Credentials → Backend Validation → Password Check → JWT Generation → Return Token + Permissions
```

The login response includes:
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "userName": "admin",
    "email": "admin@example.com",
    "roleIds": [1],
    "permissionNames": ["Complaint.View", "Complaint.Create", ...],
    "token": "eyJhbGci..."
  }
}
```

### Permission Checking

**In Frontend (React)**:
```tsx
import { useAuth } from '@/lib/auth-context';

function MyComponent() {
  const { hasPermission, hasRole } = useAuth();

  if (!hasPermission('Complaint.View')) {
    return <div>No access</div>;
  }

  return <ComplaintList />;
}
```

**In Backend (API Routes)**:
```typescript
import { withPermission } from '@/lib/server/middleware';

export async function POST(req: NextRequest) {
  return withPermission(req, 'Complaint.Create', async (user) => {
    // user object contains: userId, email, roleIds, permissionNames
    const complaint = await ComplaintRepository.createComplaint(...);
    return successResponse(complaint, 'Complaint created', 201);
  });
}
```

### Role IDs Reference
- **1**: Admin - Full access to all features
- **2**: Engineer - Can view/update assigned complaints
- **3**: Customer - Can create and view own complaints

## 📦 Database Schema

### Core Tables
- **UserMaster**: User credentials (stored as bcrypt hash)
- **RoleMaster**: Available roles
- **Permission**: Available permissions
- **UserRoleMapping**: User-to-role assignments
- **RolePermissionMapping**: Role-to-permission mappings
- **ComplaintMaster**: Complaint records with engineer assignment
- **CustomerMaster**: Customer information
- **EngineerMaster**: Engineer team members
- **StatusMaster**: Complaint status options

### Key Features
- **Soft Deletes**: IsActive bit column on all tables
- **Audit Trail**: CreatedBy, CreatedDate, ModifiedBy, ModifiedDate
- **Foreign Keys**: Enforced referential integrity
- **Indexes**: Performance optimized for common queries

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with JWT token return
- `POST /api/auth/register` - Create new user account
- `GET /api/auth/me` - Get current user details

### Complaints (Main Feature)
- `GET /api/complaints` - List complaints (engineers see only assigned)
- `POST /api/complaints` - Create new complaint
- `GET /api/complaints/[id]` - Get complaint details
- `PATCH /api/complaints/[id]` - Update complaint
- `DELETE /api/complaints/[id]` - Soft delete complaint
- `POST /api/complaints/[id]/assign-engineer` - Assign engineer
- `PATCH /api/complaints/[id]/status` - Update status

### Master Data
- Users: `GET|POST /api/masters/users`
- Roles: `GET|POST /api/masters/roles`
- Permissions: `GET|POST /api/masters/permissions`
- Customers: `GET|POST /api/masters/customers`
- Engineers: `GET|POST /api/masters/engineers`
- Statuses: `GET /api/masters/statuses`

See **API_IMPLEMENTATION_GUIDE.md** for complete endpoint documentation.

## 🛠️ Frontend Components

### Protected Route
```tsx
<ProtectedRoute requiredPermission="Complaint.View">
  <ComplaintPage />
</ProtectedRoute>
```

### Permission Guard
```tsx
<PermissionGuard permission="Complaint.Create">
  <CreateButton />
</PermissionGuard>
```

### Role Guard
```tsx
<RoleGuard roleId={2}>
  <EngineerOnlyContent />
</RoleGuard>
```

## 📝 API Service Layer

Pre-built services for all entities:

```typescript
import { complaintService, userService, roleService } from '@/lib/api/services';

// Complaints
const complaints = await complaintService.getAllComplaints(page, limit, search);
await complaintService.createComplaint(data);
await complaintService.assignEngineer(complaintId, engineerId);
await complaintService.updateStatus(complaintId, statusId);

// Users
const users = await userService.getAllUsers(page, limit, search);
await userService.createUser(data);

// Roles
const roles = await roleService.getAllRoles();
await roleService.assignPermission(roleId, permissionId);
```

## 🧪 Testing Authentication

Using curl:
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Get complaints with token
curl -X GET http://localhost:3000/api/complaints \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## ⚙️ Configuration & Customization

### Add New Permission
1. Insert into Permission table
2. Assign to role via RolePermissionMapping
3. Use in middleware: `withPermission(req, 'Module.Action', ...)`

### Add New Role
1. Insert into RoleMaster
2. Add permissions via RolePermissionMapping
3. Reference by roleId in middleware

### Add New Entity
1. Create table with audit columns
2. Create repository in `/lib/server/repositories/`
3. Create API route(s) in `/app/api/`
4. Add validation schema in `/lib/server/validation.ts`
5. Create service in `/lib/api/services.ts`

## 🔒 Security Considerations

- **Passwords**: Bcrypt hashing with 10 rounds
- **Tokens**: JWT with 24-hour expiration (configurable)
- **Database**: Parameterized queries prevent SQL injection
- **Input**: Joi validation on all endpoints
- **Audit**: CreatedBy/ModifiedBy tracking
- **Storage**: LocalStorage for tokens (consider HttpOnly in production)
- **CORS**: Configure appropriately for production

### Production Checklist
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Use HTTPS only
- [ ] Configure CORS properly
- [ ] Enable database encryption
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Set up monitoring/alerts
- [ ] Regular security audits
- [ ] Implement token refresh strategy
- [ ] Use HttpOnly cookies for tokens

## 🐛 Debugging

Enable detailed logging in development:
```typescript
import { logger } from '@/lib/server/logger';

logger.debug('Debug message', { data });
logger.error('Error occurred', error);
logger.logAuthAttempt('user@email.com', true);
logger.logPermissionCheck(userId, 'Complaint.View', granted);
```

## 📚 Documentation

- **API Implementation**: See `API_IMPLEMENTATION_GUIDE.md`
- **Feature Checklist**: See `IMPLEMENTATION_SUMMARY.md`
- **Database Schema**: See migration scripts in `/scripts`
- **Type Definitions**: See `lib/server/types.ts`

## 🤝 Contributing

1. Follow existing code patterns
2. Add proper error handling
3. Write validation schemas
4. Use middleware for auth/permissions
5. Update documentation

## 📄 License

[Your License Here]

## 🆘 Support

For issues or questions:
1. Check documentation in `/API_IMPLEMENTATION_GUIDE.md`
2. Review example implementations in repository files
3. Check database schema in migration scripts
4. Verify environment variables are set correctly

## 🗺️ Roadmap

- [ ] Implement remaining API routes
- [ ] Build frontend pages
- [ ] Add pagination UI
- [ ] Add search/filter UI
- [ ] Add export to CSV/PDF
- [ ] Add email notifications
- [ ] Add audit log viewer
- [ ] Add API rate limiting
- [ ] Add request caching
- [ ] Add WebSocket for real-time updates

---

**Last Updated**: 2026-02-08
**Version**: 1.0.0
**Status**: Foundation Complete, API Routes & Frontend Pages TBD
