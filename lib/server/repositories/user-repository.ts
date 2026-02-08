import { executeQuery, executeNonQuery, executeStoredProcedure } from '../db';
import { User, UserDetails } from '../types';
import { hashPassword, verifyPassword } from '../auth';

export class UserRepository {
  /**
   * Create a new user
   */
  static async createUser(
    username: string,
    email: string,
    password: string,
    createdBy: number
  ): Promise<User> {
    try {
      const hashedPassword = await hashPassword(password);

      const query = `
        INSERT INTO [dbo].[UserMaster] 
        ([UserName], [Email], [Password], [IsActive], [CreatedBy], [CreatedDate])
        VALUES (@username, @email, @password, 1, @createdBy, GETDATE())
        
        SELECT SCOPE_IDENTITY() as id
      `;

      const result = await executeQuery<{ id: number }>(query, {
        username,
        email,
        password: hashedPassword,
        createdBy,
      });

      if (!result.length) {
        throw new Error('Failed to create user');
      }

      return this.getUserById(result[0].id);
    } catch (error) {
      console.error('[UserRepository] Create error:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: number): Promise<User> {
    const query = `SELECT * FROM [dbo].[UserMaster] WHERE [Id] = @userId`;
    const result = await executeQuery<User>(query, { userId });

    if (!result.length) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return result[0];
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    const query = `SELECT * FROM [dbo].[UserMaster] WHERE [Email] = @email`;
    const result = await executeQuery<User>(query, { email });

    return result.length ? result[0] : null;
  }

  /**
   * Authenticate user (login)
   */
  static async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.getUserByEmail(email);

      if (!user || !user.isActive) {
        return null;
      }

      // Verify password against hash
      const isPasswordValid = await verifyPassword(password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('[UserRepository] Authentication error:', error);
      return null;
    }
  }

  /**
   * Get all users with pagination
   */
  static async getAllUsers(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = ''
  ): Promise<{ users: UserDetails[]; total: number }> {
    const offset = (page - 1) * limit;

    const countQuery = `
      SELECT COUNT(*) as total FROM [dbo].[UserMaster]
      WHERE [IsActive] = 1 
        ${searchTerm ? "AND ([UserName] LIKE @search OR [Email] LIKE @search)" : ''}
    `;

    const dataQuery = `
      SELECT [Id], [UserName], [Email], [IsActive], [CreatedDate], [ModifiedDate]
      FROM [dbo].[UserMaster]
      WHERE [IsActive] = 1
        ${searchTerm ? "AND ([UserName] LIKE @search OR [Email] LIKE @search)" : ''}
      ORDER BY [CreatedDate] DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const params = {
      ...(searchTerm && { search: `%${searchTerm}%` }),
      offset,
      limit,
    };

    const [countResult, dataResult] = await Promise.all([
      executeQuery<{ total: number }>(countQuery, params),
      executeQuery<UserDetails>(dataQuery, params),
    ]);

    return {
      users: dataResult,
      total: countResult[0]?.total || 0,
    };
  }

  /**
   * Update user
   */
  static async updateUser(
    userId: number,
    updates: Partial<{ username: string; email: string; isActive: boolean }>,
    modifiedBy: number
  ): Promise<void> {
    const setClauses = [];
    const params: Record<string, any> = { userId, modifiedBy };

    if (updates.username !== undefined) {
      setClauses.push('[UserName] = @username');
      params.username = updates.username;
    }

    if (updates.email !== undefined) {
      setClauses.push('[Email] = @email');
      params.email = updates.email;
    }

    if (updates.isActive !== undefined) {
      setClauses.push('[IsActive] = @isActive');
      params.isActive = updates.isActive;
    }

    if (!setClauses.length) {
      return; // Nothing to update
    }

    setClauses.push('[ModifiedDate] = GETDATE()');
    setClauses.push('[ModifiedBy] = @modifiedBy');

    const query = `
      UPDATE [dbo].[UserMaster]
      SET ${setClauses.join(', ')}
      WHERE [Id] = @userId
    `;

    await executeNonQuery(query, params);
  }

  /**
   * Deactivate user (soft delete)
   */
  static async deactivateUser(userId: number, modifiedBy: number): Promise<void> {
    const query = `
      UPDATE [dbo].[UserMaster]
      SET [IsActive] = 0, [ModifiedDate] = GETDATE(), [ModifiedBy] = @modifiedBy
      WHERE [Id] = @userId
    `;

    await executeNonQuery(query, { userId, modifiedBy });
  }

  /**
   * Change user password
   */
  static async changePassword(userId: number, newPassword: string, modifiedBy: number): Promise<void> {
    const hashedPassword = await hashPassword(newPassword);

    const query = `
      UPDATE [dbo].[UserMaster]
      SET [Password] = @password, [ModifiedDate] = GETDATE(), [ModifiedBy] = @modifiedBy
      WHERE [Id] = @userId
    `;

    await executeNonQuery(query, {
      userId,
      password: hashedPassword,
      modifiedBy,
    });
  }
}
