-- Initial Seed Data for CFT Database
-- This script adds sample roles, permissions, and users for testing

USE [CFT]
GO

-- =============================================
-- 1. INSERT: Initial Roles
-- =============================================
IF NOT EXISTS (SELECT 1 FROM [dbo].[RoleMaster] WHERE [RoleName] = 'Admin')
BEGIN
    INSERT INTO [dbo].[RoleMaster] ([RoleName], [IsActive], [CreatedDate])
    VALUES ('Admin', 1, GETDATE())
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[RoleMaster] WHERE [RoleName] = 'Engineer')
BEGIN
    INSERT INTO [dbo].[RoleMaster] ([RoleName], [IsActive], [CreatedDate])
    VALUES ('Engineer', 1, GETDATE())
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[RoleMaster] WHERE [RoleName] = 'Customer')
BEGIN
    INSERT INTO [dbo].[RoleMaster] ([RoleName], [IsActive], [CreatedDate])
    VALUES ('Customer', 1, GETDATE())
END

PRINT 'Roles seeded successfully'
GO

-- =============================================
-- 2. INSERT: Initial Permissions
-- =============================================
IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'Complaint.View')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('Complaint.View', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'Complaint.Create')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('Complaint.Create', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'Complaint.Edit')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('Complaint.Edit', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'Complaint.Delete')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('Complaint.Delete', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'Complaint.AssignEngineer')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('Complaint.AssignEngineer', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'Complaint.UpdateStatus')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('Complaint.UpdateStatus', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'Customer.View')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('Customer.View', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'Customer.Create')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('Customer.Create', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'Customer.Edit')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('Customer.Edit', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'Engineer.View')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('Engineer.View', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'Engineer.Create')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('Engineer.Create', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'Engineer.Edit')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('Engineer.Edit', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'User.View')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('User.View', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'User.Create')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('User.Create', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'User.Edit')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('User.Edit', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'Role.View')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('Role.View', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'Role.Create')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('Role.Create', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'Role.Edit')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('Role.Edit', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'Permission.View')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('Permission.View', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'Permission.Create')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('Permission.Create', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[Permission] WHERE [Name] = 'Permission.Edit')
    INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedDate]) VALUES ('Permission.Edit', 1, GETDATE())

PRINT 'Permissions seeded successfully'
GO

-- =============================================
-- 3. INSERT: Sample Customers
-- =============================================
IF NOT EXISTS (SELECT 1 FROM [dbo].[CustomerMaster] WHERE [Email] = 'customer1@example.com')
BEGIN
    INSERT INTO [dbo].[CustomerMaster] 
    ([CustomerName], [MobileNumber], [EmailId], [Address], [IsActive], [CreatedDate])
    VALUES 
    ('John Doe', 9876543210, 'customer1@example.com', '123 Main Street, City', 1, GETDATE())
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[CustomerMaster] WHERE [Email] = 'customer2@example.com')
BEGIN
    INSERT INTO [dbo].[CustomerMaster] 
    ([CustomerName], [MobileNumber], [EmailId], [Address], [IsActive], [CreatedDate])
    VALUES 
    ('Jane Smith', 9876543211, 'customer2@example.com', '456 Oak Avenue, Town', 1, GETDATE())
END

PRINT 'Sample customers seeded successfully'
GO

-- =============================================
-- 4. INSERT: Sample Engineers
-- =============================================
IF NOT EXISTS (SELECT 1 FROM [dbo].[EngineerMaster] WHERE [Email] = 'engineer1@company.com')
BEGIN
    INSERT INTO [dbo].[EngineerMaster] 
    ([Name], [Email], [MobileNumber], [IsActive], [CreatedDate])
    VALUES 
    ('Bob Johnson', 'engineer1@company.com', 9111111111, 1, GETDATE())
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[EngineerMaster] WHERE [Email] = 'engineer2@company.com')
BEGIN
    INSERT INTO [dbo].[EngineerMaster] 
    ([Name], [Email], [MobileNumber], [IsActive], [CreatedDate])
    VALUES 
    ('Alice Williams', 'engineer2@company.com', 9111111112, 1, GETDATE())
END

PRINT 'Sample engineers seeded successfully'
GO

-- =============================================
-- 5. INSERT: Sample Status
-- =============================================
IF NOT EXISTS (SELECT 1 FROM [dbo].[StatusMaster] WHERE [StatusName] = 'Open')
    INSERT INTO [dbo].[StatusMaster] ([StatusName], [IsActive], [CreatedDate]) VALUES ('Open', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[StatusMaster] WHERE [StatusName] = 'In Progress')
    INSERT INTO [dbo].[StatusMaster] ([StatusName], [IsActive], [CreatedDate]) VALUES ('In Progress', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[StatusMaster] WHERE [StatusName] = 'Resolved')
    INSERT INTO [dbo].[StatusMaster] ([StatusName], [IsActive], [CreatedDate]) VALUES ('Resolved', 1, GETDATE())

IF NOT EXISTS (SELECT 1 FROM [dbo].[StatusMaster] WHERE [StatusName] = 'Closed')
    INSERT INTO [dbo].[StatusMaster] ([StatusName], [IsActive], [CreatedDate]) VALUES ('Closed', 1, GETDATE())

PRINT 'Sample status seeded successfully'
GO

-- =============================================
-- 6. ASSIGN: Permissions to Roles
-- =============================================

-- Admin gets all permissions
DECLARE @AdminRoleId bigint = (SELECT Id FROM [dbo].[RoleMaster] WHERE RoleName = 'Admin')
DECLARE @EngineerRoleId bigint = (SELECT Id FROM [dbo].[RoleMaster] WHERE RoleName = 'Engineer')
DECLARE @CustomerRoleId bigint = (SELECT Id FROM [dbo].[RoleMaster] WHERE RoleName = 'Customer')

-- Grant all permissions to Admin
INSERT INTO [dbo].[RolePermissionMapping] ([RoleId], [PermissionId], [IsActive], [CreatedDate])
SELECT @AdminRoleId, Id, 1, GETDATE() 
FROM [dbo].[Permission] 
WHERE NOT EXISTS (
    SELECT 1 FROM [dbo].[RolePermissionMapping] 
    WHERE RoleId = @AdminRoleId AND PermissionId = [Permission].Id
)

-- Grant Engineer-specific permissions
INSERT INTO [dbo].[RolePermissionMapping] ([RoleId], [PermissionId], [IsActive], [CreatedDate])
SELECT @EngineerRoleId, Id, 1, GETDATE() 
FROM [dbo].[Permission] 
WHERE [Name] IN ('Complaint.View', 'Complaint.UpdateStatus', 'Customer.View', 'Engineer.View')
  AND NOT EXISTS (
    SELECT 1 FROM [dbo].[RolePermissionMapping] 
    WHERE RoleId = @EngineerRoleId AND PermissionId = [Permission].Id
)

-- Grant Customer-specific permissions
INSERT INTO [dbo].[RolePermissionMapping] ([RoleId], [PermissionId], [IsActive], [CreatedDate])
SELECT @CustomerRoleId, Id, 1, GETDATE() 
FROM [dbo].[Permission] 
WHERE [Name] IN ('Complaint.View', 'Complaint.Create', 'Customer.View')
  AND NOT EXISTS (
    SELECT 1 FROM [dbo].[RolePermissionMapping] 
    WHERE RoleId = @CustomerRoleId AND PermissionId = [Permission].Id
)

PRINT 'Role permissions assigned successfully'
GO

PRINT 'Initial data seeding completed successfully!'
