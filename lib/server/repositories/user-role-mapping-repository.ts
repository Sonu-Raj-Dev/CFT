import { executeQuery, executeNonQuery } from '../db';
import { UserRoleMapping } from '../types';

export class UserRoleMappingRepository {
  /**
   * Assign role to user
   */
  static async assignRoleToUser(userId: number, roleId: number, createdBy: number): Promise<void> {
    // Check if mapping already exists
    const existing = await executeQuery<any>(
      `SELECT Id FROM [dbo].[UserRoleMapping] WHERE UserId = @userId AND RoleId = @roleId`,
      { userId, roleId }
    );

    if (existing.length) {
      // Reactivate if it exists
      await executeNonQuery(
        `UPDATE [dbo].[UserRoleMapping] SET IsActive = 1 WHERE UserId = @userId AND RoleId = @roleId`,
        { userId, roleId }
      );
      return;
    }

    // Create new mapping
    const query = `
      INSERT INTO [dbo].[UserRoleMapping] ([UserId], [RoleId], [IsActive], [CreatedBy], [CreatedDate])
      VALUES (@userId, @roleId, 1, @createdBy, GETDATE())
    `;

    await executeNonQuery(query, { userId, roleId, createdBy });
  }

  /**
   * Remove role from user
   */
  static async removeRoleFromUser(userId: number, roleId: number, modifiedBy: number): Promise<void> {
    const query = `
      UPDATE [dbo].[UserRoleMapping]
      SET IsActive = 0, ModifiedDate = GETDATE(), ModifiedBy = @modifiedBy
      WHERE UserId = @userId AND RoleId = @roleId
    `;

    await executeNonQuery(query, { userId, roleId, modifiedBy });
  }

  /**
   * Get all roles for a user
   */
  static async getRolesByUser(userId: number): Promise<UserRoleMapping[]> {
    const query = `
      SELECT * FROM [dbo].[UserRoleMapping]
      WHERE UserId = @userId AND IsActive = 1
    `;

    return executeQuery<UserRoleMapping>(query, { userId });
  }

  /**
   * Get all users with a specific role
   */
  static async getUsersByRole(roleId: number): Promise<UserRoleMapping[]> {
    const query = `
      SELECT * FROM [dbo].[UserRoleMapping]
      WHERE RoleId = @roleId AND IsActive = 1
    `;

    return executeQuery<UserRoleMapping>(query, { roleId });
  }
}
