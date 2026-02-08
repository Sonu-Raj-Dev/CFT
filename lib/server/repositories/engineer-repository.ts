import { executeQuery, executeNonQuery } from '../db';
import { Engineer } from '../types';

export class EngineerRepository {
  /**
   * Create a new engineer
   */
  static async createEngineer(
    name: string,
    email: string,
    mobileNumber: number,
    createdBy: number
  ): Promise<Engineer> {
    const query = `
      INSERT INTO [dbo].[EngineerMaster] 
      ([Name], [Email], [MobileNumber], [IsActive], [CreatedBy], [CreatedDate])
      VALUES (@name, @email, @mobileNumber, 1, @createdBy, GETDATE())
      
      SELECT SCOPE_IDENTITY() as id
    `;

    const result = await executeQuery<{ id: number }>(query, {
      name,
      email,
      mobileNumber,
      createdBy,
    });

    if (!result.length) {
      throw new Error('Failed to create engineer');
    }

    return this.getEngineerById(result[0].id);
  }

  /**
   * Get engineer by ID
   */
  static async getEngineerById(engineerId: number): Promise<Engineer> {
    const query = `SELECT * FROM [dbo].[EngineerMaster] WHERE [Id] = @engineerId AND [IsActive] = 1`;
    const result = await executeQuery<Engineer>(query, { engineerId });

    if (!result.length) {
      throw new Error(`Engineer with ID ${engineerId} not found`);
    }

    return result[0];
  }

  /**
   * Get all engineers
   */
  static async getAllEngineers(
    page: number = 1,
    limit: number = 10,
    searchTerm?: string
  ): Promise<{ engineers: Engineer[]; total: number }> {
    const offset = (page - 1) * limit;

    const countQuery = `
      SELECT COUNT(*) as total FROM [dbo].[EngineerMaster]
      WHERE [IsActive] = 1
      ${searchTerm ? "AND ([Name] LIKE @search OR [Email] LIKE @search)" : ''}
    `;

    const dataQuery = `
      SELECT * FROM [dbo].[EngineerMaster]
      WHERE [IsActive] = 1
      ${searchTerm ? "AND ([Name] LIKE @search OR [Email] LIKE @search)" : ''}
      ORDER BY [CreatedDate] DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const params: Record<string, any> = { offset, limit };
    if (searchTerm) params.search = `%${searchTerm}%`;

    const [countResult, dataResult] = await Promise.all([
      executeQuery<{ total: number }>(countQuery, params),
      executeQuery<Engineer>(dataQuery, params),
    ]);

    return {
      engineers: dataResult,
      total: countResult[0]?.total || 0,
    };
  }

  /**
   * Update engineer
   */
  static async updateEngineer(
    engineerId: number,
    updates: Partial<{
      name: string;
      email: string;
      mobileNumber: number;
      isActive: boolean;
    }>,
    modifiedBy: number
  ): Promise<void> {
    const setClauses = [];
    const params: Record<string, any> = { engineerId, modifiedBy };

    if (updates.name !== undefined) {
      setClauses.push('[Name] = @name');
      params.name = updates.name;
    }

    if (updates.email !== undefined) {
      setClauses.push('[Email] = @email');
      params.email = updates.email;
    }

    if (updates.mobileNumber !== undefined) {
      setClauses.push('[MobileNumber] = @mobileNumber');
      params.mobileNumber = updates.mobileNumber;
    }

    if (updates.isActive !== undefined) {
      setClauses.push('[IsActive] = @isActive');
      params.isActive = updates.isActive;
    }

    if (!setClauses.length) return;

    setClauses.push('[ModifiedDate] = GETDATE()');
    setClauses.push('[ModifiedBy] = @modifiedBy');

    const query = `
      UPDATE [dbo].[EngineerMaster]
      SET ${setClauses.join(', ')}
      WHERE [Id] = @engineerId
    `;

    await executeNonQuery(query, params);
  }

  /**
   * Deactivate engineer
   */
  static async deactivateEngineer(engineerId: number, modifiedBy: number): Promise<void> {
    const query = `
      UPDATE [dbo].[EngineerMaster]
      SET [IsActive] = 0, [ModifiedDate] = GETDATE(), [ModifiedBy] = @modifiedBy
      WHERE [Id] = @engineerId
    `;

    await executeNonQuery(query, { engineerId, modifiedBy });
  }
}
