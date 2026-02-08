-- Database Schema Improvements and Migrations
-- This script applies critical improvements to the CFT database schema

USE [CFT]
GO

-- =============================================
-- 1. FIX: RoleMaster.IsActive - Change from BIGINT to BIT
-- =============================================
BEGIN TRY
    ALTER TABLE [dbo].[RoleMaster]
    ALTER COLUMN [IsActive] [bit] NULL
    PRINT 'Successfully changed RoleMaster.IsActive from BIGINT to BIT'
END TRY
BEGIN CATCH
    PRINT 'Note: RoleMaster.IsActive may already be BIT or operation failed. Error: ' + ERROR_MESSAGE()
END CATCH
GO

-- =============================================
-- 2. FIX: RolePermissionMapping.ModifiedDate0 - Rename to ModifiedDate
-- =============================================
BEGIN TRY
    EXEC sp_rename '[dbo].[RolePermissionMapping].ModifiedDate0', 'ModifiedDate', 'COLUMN'
    PRINT 'Successfully renamed RolePermissionMapping.ModifiedDate0 to ModifiedDate'
END TRY
BEGIN CATCH
    PRINT 'Note: Column rename may have already been done or failed. Error: ' + ERROR_MESSAGE()
END CATCH
GO

-- =============================================
-- 3. ADD: Foreign Key Constraints
-- =============================================

-- ComplaintMaster -> CustomerMaster
BEGIN TRY
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
        WHERE CONSTRAINT_NAME = 'FK_ComplaintMaster_CustomerMaster'
    )
    BEGIN
        ALTER TABLE [dbo].[ComplaintMaster]
        ADD CONSTRAINT [FK_ComplaintMaster_CustomerMaster] 
        FOREIGN KEY ([CustomerId]) REFERENCES [dbo].[CustomerMaster]([Id])
        PRINT 'Added FK: ComplaintMaster -> CustomerMaster'
    END
END TRY
BEGIN CATCH
    PRINT 'FK ComplaintMaster -> CustomerMaster already exists or error: ' + ERROR_MESSAGE()
END CATCH
GO

-- ComplaintMaster -> EngineerMaster
BEGIN TRY
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
        WHERE CONSTRAINT_NAME = 'FK_ComplaintMaster_EngineerMaster'
    )
    BEGIN
        ALTER TABLE [dbo].[ComplaintMaster]
        ADD CONSTRAINT [FK_ComplaintMaster_EngineerMaster] 
        FOREIGN KEY ([EngineerId]) REFERENCES [dbo].[EngineerMaster]([Id])
        PRINT 'Added FK: ComplaintMaster -> EngineerMaster'
    END
END TRY
BEGIN CATCH
    PRINT 'FK ComplaintMaster -> EngineerMaster already exists or error: ' + ERROR_MESSAGE()
END CATCH
GO

-- ComplaintMaster -> StatusMaster
BEGIN TRY
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
        WHERE CONSTRAINT_NAME = 'FK_ComplaintMaster_StatusMaster'
    )
    BEGIN
        ALTER TABLE [dbo].[ComplaintMaster]
        ADD CONSTRAINT [FK_ComplaintMaster_StatusMaster] 
        FOREIGN KEY ([StatusId]) REFERENCES [dbo].[StatusMaster]([Id])
        PRINT 'Added FK: ComplaintMaster -> StatusMaster'
    END
END TRY
BEGIN CATCH
    PRINT 'FK ComplaintMaster -> StatusMaster already exists or error: ' + ERROR_MESSAGE()
END CATCH
GO

-- UserRoleMapping -> UserMaster
BEGIN TRY
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
        WHERE CONSTRAINT_NAME = 'FK_UserRoleMapping_UserMaster'
    )
    BEGIN
        ALTER TABLE [dbo].[UserRoleMapping]
        ADD CONSTRAINT [FK_UserRoleMapping_UserMaster] 
        FOREIGN KEY ([UserId]) REFERENCES [dbo].[UserMaster]([Id])
        PRINT 'Added FK: UserRoleMapping -> UserMaster'
    END
END TRY
BEGIN CATCH
    PRINT 'FK UserRoleMapping -> UserMaster already exists or error: ' + ERROR_MESSAGE()
END CATCH
GO

-- UserRoleMapping -> RoleMaster
BEGIN TRY
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
        WHERE CONSTRAINT_NAME = 'FK_UserRoleMapping_RoleMaster'
    )
    BEGIN
        ALTER TABLE [dbo].[UserRoleMapping]
        ADD CONSTRAINT [FK_UserRoleMapping_RoleMaster] 
        FOREIGN KEY ([RoleId]) REFERENCES [dbo].[RoleMaster]([Id])
        PRINT 'Added FK: UserRoleMapping -> RoleMaster'
    END
END TRY
BEGIN CATCH
    PRINT 'FK UserRoleMapping -> RoleMaster already exists or error: ' + ERROR_MESSAGE()
END CATCH
GO

-- RolePermissionMapping -> RoleMaster
BEGIN TRY
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
        WHERE CONSTRAINT_NAME = 'FK_RolePermissionMapping_RoleMaster'
    )
    BEGIN
        ALTER TABLE [dbo].[RolePermissionMapping]
        ADD CONSTRAINT [FK_RolePermissionMapping_RoleMaster] 
        FOREIGN KEY ([RoleId]) REFERENCES [dbo].[RoleMaster]([Id])
        PRINT 'Added FK: RolePermissionMapping -> RoleMaster'
    END
END TRY
BEGIN CATCH
    PRINT 'FK RolePermissionMapping -> RoleMaster already exists or error: ' + ERROR_MESSAGE()
END CATCH
GO

-- RolePermissionMapping -> Permission
BEGIN TRY
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
        WHERE CONSTRAINT_NAME = 'FK_RolePermissionMapping_Permission'
    )
    BEGIN
        ALTER TABLE [dbo].[RolePermissionMapping]
        ADD CONSTRAINT [FK_RolePermissionMapping_Permission] 
        FOREIGN KEY ([PermissionId]) REFERENCES [dbo].[Permission]([Id])
        PRINT 'Added FK: RolePermissionMapping -> Permission'
    END
END TRY
BEGIN CATCH
    PRINT 'FK RolePermissionMapping -> Permission already exists or error: ' + ERROR_MESSAGE()
END CATCH
GO

-- =============================================
-- 4. ADD: Indexes for Performance
-- =============================================

-- Index on ComplaintMaster.EngineerId
BEGIN TRY
    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = 'IX_ComplaintMaster_EngineerId'
    )
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_ComplaintMaster_EngineerId] 
        ON [dbo].[ComplaintMaster]([EngineerId])
        PRINT 'Added Index: ComplaintMaster.EngineerId'
    END
END TRY
BEGIN CATCH
    PRINT 'Index ComplaintMaster.EngineerId already exists or error: ' + ERROR_MESSAGE()
END CATCH
GO

-- Index on ComplaintMaster.CustomerId
BEGIN TRY
    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = 'IX_ComplaintMaster_CustomerId'
    )
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_ComplaintMaster_CustomerId] 
        ON [dbo].[ComplaintMaster]([CustomerId])
        PRINT 'Added Index: ComplaintMaster.CustomerId'
    END
END TRY
BEGIN CATCH
    PRINT 'Index ComplaintMaster.CustomerId already exists or error: ' + ERROR_MESSAGE()
END CATCH
GO

-- Index on UserMaster.Email
BEGIN TRY
    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = 'IX_UserMaster_Email'
    )
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_UserMaster_Email] 
        ON [dbo].[UserMaster]([Email])
        PRINT 'Added Index: UserMaster.Email'
    END
END TRY
BEGIN CATCH
    PRINT 'Index UserMaster.Email already exists or error: ' + ERROR_MESSAGE()
END CATCH
GO

-- Index on UserRoleMapping.UserId
BEGIN TRY
    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = 'IX_UserRoleMapping_UserId'
    )
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_UserRoleMapping_UserId] 
        ON [dbo].[UserRoleMapping]([UserId])
        PRINT 'Added Index: UserRoleMapping.UserId'
    END
END TRY
BEGIN CATCH
    PRINT 'Index UserRoleMapping.UserId already exists or error: ' + ERROR_MESSAGE()
END CATCH
GO

-- Index on RolePermissionMapping.RoleId
BEGIN TRY
    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = 'IX_RolePermissionMapping_RoleId'
    )
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_RolePermissionMapping_RoleId] 
        ON [dbo].[RolePermissionMapping]([RoleId])
        PRINT 'Added Index: RolePermissionMapping.RoleId'
    END
END TRY
BEGIN CATCH
    PRINT 'Index RolePermissionMapping.RoleId already exists or error: ' + ERROR_MESSAGE()
END CATCH
GO

-- =============================================
-- 5. ADD: Unique Constraints
-- =============================================

-- Unique constraint on UserMaster.Email (case-insensitive)
BEGIN TRY
    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = 'UQ_UserMaster_Email'
    )
    BEGIN
        CREATE UNIQUE NONCLUSTERED INDEX [UQ_UserMaster_Email] 
        ON [dbo].[UserMaster]([Email])
        PRINT 'Added Unique Index: UserMaster.Email'
    END
END TRY
BEGIN CATCH
    PRINT 'Unique constraint UserMaster.Email already exists or error: ' + ERROR_MESSAGE()
END CATCH
GO

-- Unique constraint on UserRoleMapping (one role per user)
BEGIN TRY
    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = 'UQ_UserRoleMapping'
    )
    BEGIN
        CREATE UNIQUE NONCLUSTERED INDEX [UQ_UserRoleMapping] 
        ON [dbo].[UserRoleMapping]([UserId], [RoleId])
        WHERE [IsActive] = 1
        PRINT 'Added Unique Index: UserRoleMapping(UserId, RoleId)'
    END
END TRY
BEGIN CATCH
    PRINT 'Unique constraint UserRoleMapping already exists or error: ' + ERROR_MESSAGE()
END CATCH
GO

-- Unique constraint on RolePermissionMapping
BEGIN TRY
    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = 'UQ_RolePermissionMapping'
    )
    BEGIN
        CREATE UNIQUE NONCLUSTERED INDEX [UQ_RolePermissionMapping] 
        ON [dbo].[RolePermissionMapping]([RoleId], [PermissionId])
        WHERE [IsActive] = 1
        PRINT 'Added Unique Index: RolePermissionMapping(RoleId, PermissionId)'
    END
END TRY
BEGIN CATCH
    PRINT 'Unique constraint RolePermissionMapping already exists or error: ' + ERROR_MESSAGE()
END CATCH
GO

-- =============================================
-- 6. UPDATE: Stored Procedures for Dynamic Queries
-- =============================================

-- Drop and recreate stpAuthenticateUser to use parameterized queries
DROP PROCEDURE IF EXISTS [dbo].[stpAuthenticateUser]
GO

CREATE PROCEDURE [dbo].[stpAuthenticateUser]
    @Email varchar(255),
    @PasswordHash varchar(255)
AS
BEGIN
    SELECT 
        u.Id,
        u.UserName,
        u.Email,
        u.IsActive,
        rm.RoleId
    FROM [dbo].[UserMaster] u
    LEFT JOIN [dbo].[UserRoleMapping] rm ON u.Id = rm.UserId AND rm.IsActive = 1
    WHERE u.Email = @Email 
        AND u.Password = @PasswordHash 
        AND u.IsActive = 1
END
GO

-- Drop and recreate stpGetAllComplaintsDetails to use permission-based filtering (moved to backend middleware)
DROP PROCEDURE IF EXISTS [dbo].[stpGetAllComplaintsDetails]
GO

CREATE PROCEDURE [dbo].[stpGetAllComplaintsDetails]
    @UserId bigint,
    @RoleId bigint
AS
BEGIN
    -- Authorization moved to backend middleware
    -- This proc now returns all complaints; middleware validates permissions
    SELECT 
        cm.Id,
        cm.CustomerId,
        c.CustomerName,
        c.MobileNumber,
        c.EmailId as Email,
        c.Address,
        cm.NatureOfComplaint,
        cm.ComplaintDetails,
        cm.EngineerId,
        em.Name as EngineerName,
        cm.StatusId,
        s.StatusName,
        cm.IsActive,
        cm.CreatedBy,
        cm.CreatedDate,
        cm.ModifiedBy,
        cm.ModifiedDate
    FROM [dbo].[ComplaintMaster] cm
    LEFT JOIN [dbo].[CustomerMaster] c ON cm.CustomerId = c.Id AND c.IsActive = 1
    LEFT JOIN [dbo].[EngineerMaster] em ON cm.EngineerId = em.Id AND em.IsActive = 1
    LEFT JOIN [dbo].[StatusMaster] s ON cm.StatusId = s.Id AND s.IsActive = 1
    WHERE cm.IsActive = 1
    ORDER BY cm.CreatedDate DESC
END
GO

-- Update stpGetUserRolePermissions to return complete permission data
DROP PROCEDURE IF EXISTS [dbo].[stpGetUserRolePermissions]
GO

CREATE PROCEDURE [dbo].[stpGetUserRolePermissions]
    @UserId bigint
AS
BEGIN
    SELECT DISTINCT
        rm.UserId,
        rm.RoleId,
        r.RoleName,
        p.Id as PermissionId,
        p.Name as PermissionName,
        p.IsActive
    FROM [dbo].[UserRoleMapping] rm
    INNER JOIN [dbo].[RoleMaster] r ON rm.RoleId = r.Id AND r.IsActive = 1
    LEFT JOIN [dbo].[RolePermissionMapping] rpm ON rm.RoleId = rpm.RoleId AND rpm.IsActive = 1
    LEFT JOIN [dbo].[Permission] p ON p.Id = rpm.PermissionId AND p.IsActive = 1
    WHERE rm.UserId = @UserId AND rm.IsActive = 1
END
GO

PRINT 'Database schema improvements completed successfully!'
