# API Implementation Guide

This guide explains how to implement the remaining API routes following the patterns established by the backend infrastructure.

## Quick Start

All API routes follow a standardized pattern using the middleware and utilities in `/lib/server/`.

### Basic Authentication Route Example

```typescript
import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/server/middleware';
import { UserRepository } from '@/lib/server/repositories';
import { successResponse, errorResponse } from '@/lib/server/responses';

export async function GET(req: NextRequest) {
  return withAuth(req, async (user) => {
    try {
      const userData = await UserRepository.getUserById(user.userId);
      return successResponse(userData, 'User fetched successfully');
    } catch (error) {
      return errorResponse((error as Error).message, 400);
    }
  });
}
```

### Permission-Protected Route Example

```typescript
import { NextRequest } from 'next/server';
import { withPermission } from '@/lib/server/middleware';
import { ComplaintRepository } from '@/lib/server/repositories';
import { successResponse } from '@/lib/server/responses';

export async function POST(req: NextRequest) {
  return withPermission(req, 'Complaint.Create', async (user) => {
    const body = await req.json();
    const complaint = await ComplaintRepository.createComplaint(
      body.customerId,
      body.natureOfComplaint,
      body.complaintDetails,
      body.statusId,
      user.userId,
      body.engineerId
    );
    return successResponse(complaint, 'Complaint created', 201);
  });
}
```

## Available Repositories

- **UserRepository** - User CRUD and authentication
- **RoleRepository** - Role management
- **PermissionRepository** - Permission management
- **ComplaintRepository** - Complaint CRUD with engineer filtering
- **CustomerRepository** - Customer management
- **EngineerRepository** - Engineer management
- **StatusRepository** - Status management
- **UserRoleMappingRepository** - User-role assignments
- **RolePermissionMappingRepository** - Role-permission assignments

## Middleware Functions

### `withAuth(req, handler)`
Protects route with JWT authentication. Passes authenticated user to handler.

```typescript
return withAuth(req, async (user) => {
  // user.userId, user.email, user.roleIds, user.permissionNames
  return successResponse(data);
});
```

### `withPermission(req, permissions, handler)`
Checks if user has at least ONE of the permissions (OR logic).

```typescript
return withPermission(req, 'Complaint.View', async (user) => {
  // User must have 'Complaint.View' permission
  return successResponse(data);
});

// Multiple permissions (user needs ANY one)
return withPermission(req, ['Complaint.View', 'Complaint.Edit'], async (user) => {
  return successResponse(data);
});
```

### `withAllPermissions(req, permissions, handler)`
Checks if user has ALL required permissions (AND logic).

```typescript
return withAllPermissions(req, ['Complaint.View', 'Complaint.Edit'], async (user) => {
  // User must have BOTH permissions
  return successResponse(data);
});
```

### `withRole(req, roleIds, handler)`
Checks if user has one of the specified roles.

```typescript
return withRole(req, 2, async (user) => {
  // User must be Engineer (roleId=2)
  return successResponse(data);
});

// Multiple roles
return withRole(req, [1, 2], async (user) => {
  // User must be Admin (1) or Engineer (2)
  return successResponse(data);
});
```

## API Routes to Implement

### Authentication
- `POST /api/auth/login` - Login (with JWT + permissions)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user details

### Users (Master Data)
- `POST /api/masters/users` - Create user (permission: User.Create)
- `GET /api/masters/users` - Get all users (permission: User.View)
- `GET /api/masters/users/[id]` - Get user by ID
- `PATCH /api/masters/users/[id]` - Update user (permission: User.Edit)
- `DELETE /api/masters/users/[id]` - Deactivate user (permission: User.Edit)

### Roles (Master Data)
- `POST /api/masters/roles` - Create role (permission: Role.Create)
- `GET /api/masters/roles` - Get all roles (permission: Role.View)
- `PATCH /api/masters/roles/[id]` - Update role (permission: Role.Edit)
- `DELETE /api/masters/roles/[id]` - Deactivate role

### Permissions (Master Data)
- `POST /api/masters/permissions` - Create permission
- `GET /api/masters/permissions` - Get all permissions
- `PATCH /api/masters/permissions/[id]` - Update permission
- `DELETE /api/masters/permissions/[id]` - Deactivate permission

### Role-Permission Mapping
- `POST /api/masters/role-permissions` - Assign permission to role
- `DELETE /api/masters/role-permissions/[roleId]/[permissionId]` - Remove permission from role
- `GET /api/masters/role-permissions/[roleId]` - Get permissions by role

### User-Role Mapping
- `POST /api/masters/user-roles` - Assign role to user
- `DELETE /api/masters/user-roles/[userId]/[roleId]` - Remove role from user
- `GET /api/masters/user-roles/[userId]` - Get roles by user

### Customers (Master Data)
- `POST /api/masters/customers` - Create customer (permission: Customer.Create)
- `GET /api/masters/customers` - Get all customers (permission: Customer.View)
- `PATCH /api/masters/customers/[id]` - Update customer (permission: Customer.Edit)
- `DELETE /api/masters/customers/[id]` - Deactivate customer

### Engineers (Master Data)
- `POST /api/masters/engineers` - Create engineer (permission: Engineer.Create)
- `GET /api/masters/engineers` - Get all engineers (permission: Engineer.View)
- `PATCH /api/masters/engineers/[id]` - Update engineer (permission: Engineer.Edit)
- `DELETE /api/masters/engineers/[id]` - Deactivate engineer

### Statuses (Master Data)
- `GET /api/masters/statuses` - Get all statuses

### Complaints (Main Business Logic)
- `POST /api/complaints` - Create complaint (permission: Complaint.Create)
- `GET /api/complaints` - Get all complaints (permission: Complaint.View) - Engineer role sees only assigned complaints
- `GET /api/complaints/[id]` - Get complaint details
- `PATCH /api/complaints/[id]` - Update complaint (permission: Complaint.Edit)
- `DELETE /api/complaints/[id]` - Deactivate complaint
- `POST /api/complaints/[id]/assign-engineer` - Assign engineer (permission: Complaint.AssignEngineer)
- `PATCH /api/complaints/[id]/status` - Update complaint status (permission: Complaint.UpdateStatus)

## Validation

Use Joi schemas from `/lib/server/validation.ts`:

```typescript
import { validateAsync, schemas } from '@/lib/server/validation';

const { value, error } = await validateAsync(body, schemas.createComplaint);
if (error) {
  return validationErrorResponse('Invalid input', error);
}
```

## Response Format

All responses follow a standardized format:

```typescript
{
  success: boolean,
  message: string,
  data?: T,
  error?: string,
  timestamp?: string,
  // For paginated responses:
  pagination?: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

## Error Handling

Use response utilities:

```typescript
import { 
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse
} from '@/lib/server/responses';

// Success
return successResponse(data, 'Success message', 200);

// Validation error (422)
return validationErrorResponse('Invalid input', errors);

// Unauthorized (401)
return unauthorizedResponse('Not logged in');

// Forbidden (403)
return forbiddenResponse('No permission');

// Not found (404)
return notFoundResponse('Resource not found');

// Server error (500)
return serverErrorResponse('Something went wrong');
```

## Database Configuration

Add these environment variables to your `.env.local`:

```
DB_SERVER=your-server
DB_NAME=CFT
DB_USER=your-user
DB_PASSWORD=your-password
DB_ENCRYPT=true
DB_TRUST_CERT=false
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

## Permission Naming Convention

Permissions follow the pattern: `Module.Action`

Examples:
- `Complaint.View` - View complaints
- `Complaint.Create` - Create new complaint
- `Complaint.Edit` - Edit complaint
- `Complaint.Delete` - Delete complaint
- `Complaint.AssignEngineer` - Assign engineer to complaint
- `Complaint.UpdateStatus` - Update complaint status

## Engineer Role Business Logic

The `ComplaintRepository.getAllComplaints()` method automatically filters complaints:
- If user is Engineer (roleId=2): Shows only complaints assigned to that engineer
- Otherwise: Shows all complaints

The middleware layer doesn't need to know about this - it's handled in the repository layer.

## Logging

The logger is available for debugging:

```typescript
import { logger } from '@/lib/server/logger';

logger.debug('Debug message', { data });
logger.info('Info message', { data });
logger.warn('Warning message', { data });
logger.error('Error message', error, { data });
logger.logAuthAttempt('user@email.com', true);
logger.logPermissionCheck(userId, 'Complaint.View', true);
```

## Testing Routes

Use curl or Postman with the Authorization header:

```bash
curl -X GET http://localhost:3000/api/complaints \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

The JWT token is returned from the login endpoint.
