import { executeQuery, executeNonQuery } from '../db';
import { Status } from '../types';

export class StatusRepository {
  /**
   * Create a new status
   */
  static async createStatus(statusName: string, createdBy: number): Promise<Status> {
    const query = `
      INSERT INTO [dbo].[StatusMaster] ([StatusName], [IsActive], [CreatedBy], [CreatedDate])
      VALUES (@statusName, 1, @createdBy, GETDATE())
      
      SELECT SCOPE_IDENTITY() as id
    `;

    const result = await executeQuery<{ id: number }>(query, { statusName, createdBy });

    if (!result.length) {
      throw new Error('Failed to create status');
    }

    return this.getStatusById(result[0].id);
  }

  /**
   * Get status by ID
   */
  static async getStatusById(statusId: number): Promise<Status> {
    const query = `SELECT * FROM [dbo].[StatusMaster] WHERE [Id] = @statusId AND [IsActive] = 1`;
    const result = await executeQuery<Status>(query, { statusId });

    if (!result.length) {
      throw new Error(`Status with ID ${statusId} not found`);
    }

    return result[0];
  }

  /**
   * Get all statuses
   */
  static async getAllStatuses(page: number = 1, limit: number = 10): Promise<{ statuses: Status[]; total: number }> {
    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*) as total FROM [dbo].[StatusMaster]`;

    const dataQuery = `
      SELECT * FROM [dbo].[StatusMaster]
      ORDER BY [CreatedDate] DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const [countResult, dataResult] = await Promise.all([
      executeQuery<{ total: number }>(countQuery),
      executeQuery<Status>(dataQuery, { offset, limit }),
    ]);

    return {
      statuses: dataResult,
      total: countResult[0]?.total || 0,
    };
  }

  /**
   * Update status
   */
  static async updateStatus(
    statusId: number,
    updates: Partial<{ statusName: string; isActive: boolean }>,
    modifiedBy: number
  ): Promise<void> {
    const setClauses = [];
    const params: Record<string, any> = { statusId, modifiedBy };

    if (updates.statusName !== undefined) {
      setClauses.push('[StatusName] = @statusName');
      params.statusName = updates.statusName;
    }

    if (updates.isActive !== undefined) {
      setClauses.push('[IsActive] = @isActive');
      params.isActive = updates.isActive;
    }

    if (!setClauses.length) return;

    setClauses.push('[ModifiedDate] = GETDATE()');
    setClauses.push('[ModifiedBy] = @modifiedBy');

    const query = `
      UPDATE [dbo].[StatusMaster]
      SET ${setClauses.join(', ')}
      WHERE [Id] = @statusId
    `;

    await executeNonQuery(query, params);
  }

  /**
   * Deactivate status
   */
  static async deactivateStatus(statusId: number, modifiedBy: number): Promise<void> {
    const query = `
      UPDATE [dbo].[StatusMaster]
      SET [IsActive] = 0, [ModifiedDate] = GETDATE(), [ModifiedBy] = @modifiedBy
      WHERE [Id] = @statusId
    `;

    await executeNonQuery(query, { statusId, modifiedBy });
  }
}
