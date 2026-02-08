import { executeQuery, executeNonQuery } from '../db';
import { Role } from '../types';

export class RoleRepository {
  /**
   * Create a new role
   */
  static async createRole(roleName: string, createdBy: number): Promise<Role> {
    const query = `
      INSERT INTO [dbo].[RoleMaster] ([RoleName], [IsActive], [CreatedBy], [CreatedDate])
      VALUES (@roleName, 1, @createdBy, GETDATE())
      
      SELECT SCOPE_IDENTITY() as id
    `;

    const result = await executeQuery<{ id: number }>(query, { roleName, createdBy });

    if (!result.length) {
      throw new Error('Failed to create role');
    }

    return this.getRoleById(result[0].id);
  }

  /**
   * Get role by ID
   */
  static async getRoleById(roleId: number): Promise<Role> {
    const query = `SELECT * FROM [dbo].[RoleMaster] WHERE [Id] = @roleId`;
    const result = await executeQuery<Role>(query, { roleId });

    if (!result.length) {
      throw new Error(`Role with ID ${roleId} not found`);
    }

    return result[0];
  }

  /**
   * Get all roles
   */
  static async getAllRoles(page: number = 1, limit: number = 10): Promise<{ roles: Role[]; total: number }> {
    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*) as total FROM [dbo].[RoleMaster]`;

    const dataQuery = `
      SELECT * FROM [dbo].[RoleMaster]
      ORDER BY [CreatedDate] DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const [countResult, dataResult] = await Promise.all([
      executeQuery<{ total: number }>(countQuery),
      executeQuery<Role>(dataQuery, { offset, limit }),
    ]);

    return {
      roles: dataResult,
      total: countResult[0]?.total || 0,
    };
  }

  /**
   * Update role
   */
  static async updateRole(
    roleId: number,
    updates: Partial<{ roleName: string; isActive: boolean }>,
    modifiedBy: number
  ): Promise<void> {
    const setClauses = [];
    const params: Record<string, any> = { roleId, modifiedBy };

    if (updates.roleName !== undefined) {
      setClauses.push('[RoleName] = @roleName');
      params.roleName = updates.roleName;
    }

    if (updates.isActive !== undefined) {
      setClauses.push('[IsActive] = @isActive');
      params.isActive = updates.isActive;
    }

    if (!setClauses.length) return;

    setClauses.push('[ModifiedDate] = GETDATE()');
    setClauses.push('[ModifiedBy] = @modifiedBy');

    const query = `
      UPDATE [dbo].[RoleMaster]
      SET ${setClauses.join(', ')}
      WHERE [Id] = @roleId
    `;

    await executeNonQuery(query, params);
  }

  /**
   * Deactivate role
   */
  static async deactivateRole(roleId: number, modifiedBy: number): Promise<void> {
    const query = `
      UPDATE [dbo].[RoleMaster]
      SET [IsActive] = 0, [ModifiedDate] = GETDATE(), [ModifiedBy] = @modifiedBy
      WHERE [Id] = @roleId
    `;

    await executeNonQuery(query, { roleId, modifiedBy });
  }

  /**
   * Get role with permissions
   */
  static async getRoleWithPermissions(roleId: number): Promise<Role & { permissions: any[] }> {
    const roleQuery = `SELECT * FROM [dbo].[RoleMaster] WHERE [Id] = @roleId`;

    const permissionQuery = `
      SELECT p.* FROM [dbo].[Permission] p
      INNER JOIN [dbo].[RolePermissionMapping] rpm ON p.Id = rpm.PermissionId
      WHERE rpm.RoleId = @roleId AND rpm.IsActive = 1
    `;

    const [roleResult, permissionResult] = await Promise.all([
      executeQuery<Role>(roleQuery, { roleId }),
      executeQuery<any>(permissionQuery, { roleId }),
    ]);

    if (!roleResult.length) {
      throw new Error(`Role with ID ${roleId} not found`);
    }

    return {
      ...roleResult[0],
      permissions: permissionResult,
    };
  }
}
