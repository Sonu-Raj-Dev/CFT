import { executeQuery, executeNonQuery } from '../db';
import { Permission } from '../types';

export class PermissionRepository {
  /**
   * Create a new permission
   */
  static async createPermission(name: string, createdBy: number): Promise<Permission> {
    const query = `
      INSERT INTO [dbo].[Permission] ([Name], [IsActive], [CreatedBy], [CreatedDate])
      VALUES (@name, 1, @createdBy, GETDATE())
      
      SELECT SCOPE_IDENTITY() as id
    `;

    const result = await executeQuery<{ id: number }>(query, { name, createdBy });

    if (!result.length) {
      throw new Error('Failed to create permission');
    }

    return this.getPermissionById(result[0].id);
  }

  /**
   * Get permission by ID
   */
  static async getPermissionById(permissionId: number): Promise<Permission> {
    const query = `SELECT * FROM [dbo].[Permission] WHERE [Id] = @permissionId`;
    const result = await executeQuery<Permission>(query, { permissionId });

    if (!result.length) {
      throw new Error(`Permission with ID ${permissionId} not found`);
    }

    return result[0];
  }

  /**
   * Get permission by name
   */
  static async getPermissionByName(name: string): Promise<Permission | null> {
    const query = `SELECT * FROM [dbo].[Permission] WHERE [Name] = @name AND [IsActive] = 1`;
    const result = await executeQuery<Permission>(query, { name });

    return result.length ? result[0] : null;
  }

  /**
   * Get all permissions
   */
  static async getAllPermissions(page: number = 1, limit: number = 10): Promise<{ permissions: Permission[]; total: number }> {
    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*) as total FROM [dbo].[Permission]`;

    const dataQuery = `
      SELECT * FROM [dbo].[Permission]
      ORDER BY [CreatedDate] DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const [countResult, dataResult] = await Promise.all([
      executeQuery<{ total: number }>(countQuery),
      executeQuery<Permission>(dataQuery, { offset, limit }),
    ]);

    return {
      permissions: dataResult,
      total: countResult[0]?.total || 0,
    };
  }

  /**
   * Get active permissions for a role
   */
  static async getPermissionsByRole(roleId: number): Promise<Permission[]> {
    const query = `
      SELECT p.* FROM [dbo].[Permission] p
      INNER JOIN [dbo].[RolePermissionMapping] rpm ON p.Id = rpm.PermissionId
      WHERE rpm.RoleId = @roleId AND rpm.IsActive = 1 AND p.IsActive = 1
      ORDER BY p.Name ASC
    `;

    return executeQuery<Permission>(query, { roleId });
  }

  /**
   * Get active permissions for a user
   */
  static async getPermissionsByUser(userId: number): Promise<Permission[]> {
    const query = `
      SELECT DISTINCT p.* FROM [dbo].[Permission] p
      INNER JOIN [dbo].[RolePermissionMapping] rpm ON p.Id = rpm.PermissionId
      INNER JOIN [dbo].[UserRoleMapping] urm ON rpm.RoleId = urm.RoleId
      WHERE urm.UserId = @userId 
        AND urm.IsActive = 1 
        AND rpm.IsActive = 1 
        AND p.IsActive = 1
      ORDER BY p.Name ASC
    `;

    return executeQuery<Permission>(query, { userId });
  }

  /**
   * Update permission
   */
  static async updatePermission(
    permissionId: number,
    updates: Partial<{ name: string; isActive: boolean }>,
    modifiedBy: number
  ): Promise<void> {
    const setClauses = [];
    const params: Record<string, any> = { permissionId, modifiedBy };

    if (updates.name !== undefined) {
      setClauses.push('[Name] = @name');
      params.name = updates.name;
    }

    if (updates.isActive !== undefined) {
      setClauses.push('[IsActive] = @isActive');
      params.isActive = updates.isActive;
    }

    if (!setClauses.length) return;

    setClauses.push('[ModifiedDate] = GETDATE()');
    setClauses.push('[ModifiedBy] = @modifiedBy');

    const query = `
      UPDATE [dbo].[Permission]
      SET ${setClauses.join(', ')}
      WHERE [Id] = @permissionId
    `;

    await executeNonQuery(query, params);
  }

  /**
   * Deactivate permission
   */
  static async deactivatePermission(permissionId: number, modifiedBy: number): Promise<void> {
    const query = `
      UPDATE [dbo].[Permission]
      SET [IsActive] = 0, [ModifiedDate] = GETDATE(), [ModifiedBy] = @modifiedBy
      WHERE [Id] = @permissionId
    `;

    await executeNonQuery(query, { permissionId, modifiedBy });
  }
}
