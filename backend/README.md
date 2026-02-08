# Complaint Management System - Backend Server

Express.js backend server for the complaint management application. Runs on port 5000 by default.

## Setup Instructions

### Prerequisites
- Node.js 18+
- SQL Server (local or remote)
- npm or yarn

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```
NODE_ENV=development
PORT=5000
API_BASE_URL=http://localhost:5000

DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=YourPassword@123
DB_DATABASE=ComplaintManagement
DB_PORT=1433
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=24h

CORS_ORIGIN=http://localhost:3000

LOG_LEVEL=debug
```

### Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production build and start:
```bash
npm run build
npm start
```

### Database Setup

Run migrations:
```bash
npm run db:migrate
```

Seed initial data:
```bash
npm run db:seed
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current authenticated user

### Masters (User Management)
- `GET /api/masters/users` - Get all users
- `GET /api/masters/users/:id` - Get user by ID
- `POST /api/masters/users` - Create new user
- `PATCH /api/masters/users/:id` - Update user
- `DELETE /api/masters/users/:id` - Delete user

### Roles
- `GET /api/masters/roles` - Get all roles
- `GET /api/masters/roles/:id` - Get role by ID
- `POST /api/masters/roles` - Create role
- `PATCH /api/masters/roles/:id` - Update role
- `DELETE /api/masters/roles/:id` - Delete role

### Permissions
- `GET /api/masters/permissions` - Get all permissions
- `GET /api/masters/permissions/:id` - Get permission by ID
- `POST /api/masters/permissions` - Create permission
- `PATCH /api/masters/permissions/:id` - Update permission
- `DELETE /api/masters/permissions/:id` - Delete permission

### Role-Permission Mapping
- `GET /api/masters/role-permissions` - Get all role permissions
- `GET /api/masters/role-permissions/:roleId` - Get permissions for a role
- `POST /api/masters/role-permissions` - Assign permissions to role
- `PATCH /api/masters/role-permissions/:roleId` - Update role permissions
- `DELETE /api/masters/role-permissions/:roleId/:permissionId` - Remove permission from role

### User-Role Mapping
- `GET /api/masters/user-roles` - Get all user roles
- `GET /api/masters/user-roles/:userId` - Get roles for a user
- `POST /api/masters/user-roles` - Assign role to user
- `PATCH /api/masters/user-roles/:userId` - Update user roles
- `DELETE /api/masters/user-roles/:userId/:roleId` - Remove role from user

### Customers
- `GET /api/masters/customers` - Get all customers
- `GET /api/masters/customers/:id` - Get customer by ID
- `POST /api/masters/customers` - Create customer
- `PATCH /api/masters/customers/:id` - Update customer
- `DELETE /api/masters/customers/:id` - Delete customer

### Engineers
- `GET /api/masters/engineers` - Get all engineers
- `GET /api/masters/engineers/:id` - Get engineer by ID
- `POST /api/masters/engineers` - Create engineer
- `PATCH /api/masters/engineers/:id` - Update engineer
- `DELETE /api/masters/engineers/:id` - Delete engineer

### Statuses
- `GET /api/masters/statuses` - Get all statuses
- `GET /api/masters/statuses/:id` - Get status by ID
- `POST /api/masters/statuses` - Create status
- `PATCH /api/masters/statuses/:id` - Update status
- `DELETE /api/masters/statuses/:id` - Delete status

### Complaints
- `GET /api/complaints` - Get all complaints (paginated)
- `GET /api/complaints/:id` - Get complaint by ID
- `POST /api/complaints` - Create complaint
- `PATCH /api/complaints/:id` - Update complaint
- `DELETE /api/complaints/:id` - Delete complaint
- `PATCH /api/complaints/:id/assign-engineer` - Assign engineer to complaint

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Login response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "userId": 1,
      "email": "user@example.com"
    }
  }
}
```

## Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Database connection setup
│   ├── middleware/
│   │   ├── auth.ts              # Authentication and permission middleware
│   │   ├── error-handler.ts     # Global error handling
│   │   └── request-logger.ts    # Request logging
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   └── complaint.repository.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── complaints.routes.ts
│   │   └── masters/
│   │       ├── users.routes.ts
│   │       ├── roles.routes.ts
│   │       └── ... other master routes
│   ├── utils/
│   │   ├── auth.ts              # JWT and bcrypt utilities
│   │   ├── logger.ts            # Logging utility
│   │   ├── response.ts          # Response formatting
│   │   └── validation.ts        # Input validation schemas
│   └── index.ts                 # Server entry point
├── scripts/
│   ├── migrate.ts               # Database migration script
│   └── seed.ts                  # Database seed script
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Troubleshooting

### Database Connection Failed
- Check SQL Server is running
- Verify DB_SERVER, DB_USER, DB_PASSWORD in .env
- Ensure database exists or is created
- Check firewall settings allow connection to SQL Server port (1433)

### CORS Errors
- Verify CORS_ORIGIN in .env matches your frontend URL
- Check frontend is making requests to correct backend URL
- Ensure credentials are included if needed: `credentials: 'include'`

### Token Errors
- Check JWT_SECRET is set and consistent
- Verify token hasn't expired (JWT_EXPIRY)
- Ensure Authorization header format is correct: `Bearer <token>`

## Development Notes

- All routes use async/await with error handling
- Input validation using Joi schemas
- Passwords hashed with bcrypt (10 rounds)
- Soft delete implemented for audit trail
- Timestamps in UTC
- Pagination support on list endpoints (page, pageSize)

## Security

- HTTPS should be used in production
- Store JWT_SECRET in secure environment variables
- Use strong database passwords
- Enable firewall rules on SQL Server
- Validate all user inputs
- Implement rate limiting in production
- Add HTTPS/SSL certificate

## Contributing

1. Create a new branch for features
2. Follow existing code patterns
3. Test routes before committing
4. Update documentation for new endpoints
