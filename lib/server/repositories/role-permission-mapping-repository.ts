import { executeQuery, executeNonQuery } from '../db';
import { RolePermissionMapping } from '../types';

export class RolePermissionMappingRepository {
  /**
   * Assign permission to role
   */
  static async assignPermissionToRole(
    roleId: number,
    permissionId: number,
    createdBy: number
  ): Promise<void> {
    // Check if mapping already exists
    const existing = await executeQuery<any>(
      `SELECT Id FROM [dbo].[RolePermissionMapping] WHERE RoleId = @roleId AND PermissionId = @permissionId`,
      { roleId, permissionId }
    );

    if (existing.length) {
      // Reactivate if it exists
      await executeNonQuery(
        `UPDATE [dbo].[RolePermissionMapping] SET IsActive = 1 WHERE RoleId = @roleId AND PermissionId = @permissionId`,
        { roleId, permissionId }
      );
      return;
    }

    // Create new mapping
    const query = `
      INSERT INTO [dbo].[RolePermissionMapping] ([RoleId], [PermissionId], [IsActive], [CreatedBy], [CreatedDate])
      VALUES (@roleId, @permissionId, 1, @createdBy, GETDATE())
    `;

    await executeNonQuery(query, { roleId, permissionId, createdBy });
  }

  /**
   * Remove permission from role
   */
  static async removePermissionFromRole(
    roleId: number,
    permissionId: number,
    modifiedBy: number
  ): Promise<void> {
    const query = `
      UPDATE [dbo].[RolePermissionMapping]
      SET IsActive = 0, ModifiedDate = GETDATE(), ModifiedBy = @modifiedBy
      WHERE RoleId = @roleId AND PermissionId = @permissionId
    `;

    await executeNonQuery(query, { roleId, permissionId, modifiedBy });
  }

  /**
   * Get all permissions for a role
   */
  static async getPermissionsByRole(roleId: number): Promise<RolePermissionMapping[]> {
    const query = `
      SELECT * FROM [dbo].[RolePermissionMapping]
      WHERE RoleId = @roleId AND IsActive = 1
    `;

    return executeQuery<RolePermissionMapping>(query, { roleId });
  }

  /**
   * Get all roles with a specific permission
   */
  static async getRolesByPermission(permissionId: number): Promise<RolePermissionMapping[]> {
    const query = `
      SELECT * FROM [dbo].[RolePermissionMapping]
      WHERE PermissionId = @permissionId AND IsActive = 1
    `;

    return executeQuery<RolePermissionMapping>(query, { permissionId });
  }

  /**
   * Get user permissions (through role mappings)
   */
  static async getUserPermissionNames(userId: number): Promise<string[]> {
    const query = `
      SELECT DISTINCT p.Name
      FROM [dbo].[Permission] p
      INNER JOIN [dbo].[RolePermissionMapping] rpm ON p.Id = rpm.PermissionId
      INNER JOIN [dbo].[UserRoleMapping] urm ON rpm.RoleId = urm.RoleId
      WHERE urm.UserId = @userId 
        AND urm.IsActive = 1 
        AND rpm.IsActive = 1 
        AND p.IsActive = 1
      ORDER BY p.Name ASC
    `;

    const result = await executeQuery<{ Name: string }>(query, { userId });
    return result.map(r => r.Name);
  }

  /**
   * Get user role IDs
   */
  static async getUserRoleIds(userId: number): Promise<number[]> {
    const query = `
      SELECT RoleId
      FROM [dbo].[UserRoleMapping]
      WHERE UserId = @userId AND IsActive = 1
    `;

    const result = await executeQuery<{ RoleId: number }>(query, { userId });
    return result.map(r => r.RoleId);
  }
}
