import { getDatabase, sql } from '../config/database';
import { logger } from '../utils/logger';

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  isActive?: boolean;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive?: boolean;
}

export class UserRepository {
  async findAll(page: number = 1, pageSize: number = 10) {
    try {
      const pool = await getDatabase();
      const offset = (page - 1) * pageSize;

      const result = await pool
        .request()
        .input('offset', sql.Int, offset)
        .input('pageSize', sql.Int, pageSize)
        .query(`
          SELECT * FROM Users 
          WHERE DeletedAt IS NULL
          ORDER BY CreatedAt DESC
          OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;

          SELECT COUNT(*) as Total FROM Users WHERE DeletedAt IS NULL;
        `);

      return {
        data: result.recordsets[0] as User[],
        total: result.recordsets[1][0].Total,
      };
    } catch (error) {
      logger.error('Error fetching users:', error);
      throw error;
    }
  }

  async findById(userId: number): Promise<User | null> {
    try {
      const pool = await getDatabase();
      const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query(
          'SELECT * FROM Users WHERE UserId = @userId AND DeletedAt IS NULL',
        );

      return result.recordset[0] || null;
    } catch (error) {
      logger.error('Error fetching user by id:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const pool = await getDatabase();
      const result = await pool
        .request()
        .input('email', sql.VarChar(255), email)
        .query(
          'SELECT * FROM Users WHERE Email = @email AND DeletedAt IS NULL',
        );

      return result.recordset[0] || null;
    } catch (error) {
      logger.error('Error fetching user by email:', error);
      throw error;
    }
  }

  async create(input: CreateUserInput): Promise<User> {
    try {
      const pool = await getDatabase();
      const result = await pool
        .request()
        .input('firstName', sql.VarChar(100), input.firstName)
        .input('lastName', sql.VarChar(100), input.lastName)
        .input('email', sql.VarChar(255), input.email)
        .input('passwordHash', sql.VarChar(sql.MAX), input.passwordHash)
        .input('isActive', sql.Bit, input.isActive ?? true)
        .query(`
          INSERT INTO Users (FirstName, LastName, Email, PasswordHash, IsActive, CreatedAt, UpdatedAt)
          VALUES (@firstName, @lastName, @email, @passwordHash, @isActive, GETUTCDATE(), GETUTCDATE());
          
          SELECT * FROM Users WHERE UserId = SCOPE_IDENTITY();
        `);

      return result.recordset[0];
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async update(userId: number, input: UpdateUserInput): Promise<User | null> {
    try {
      const pool = await getDatabase();

      let query = 'UPDATE Users SET UpdatedAt = GETUTCDATE()';
      const request = pool.request().input('userId', sql.Int, userId);

      if (input.firstName !== undefined) {
        query += ', FirstName = @firstName';
        request.input('firstName', sql.VarChar(100), input.firstName);
      }
      if (input.lastName !== undefined) {
        query += ', LastName = @lastName';
        request.input('lastName', sql.VarChar(100), input.lastName);
      }
      if (input.email !== undefined) {
        query += ', Email = @email';
        request.input('email', sql.VarChar(255), input.email);
      }
      if (input.isActive !== undefined) {
        query += ', IsActive = @isActive';
        request.input('isActive', sql.Bit, input.isActive);
      }

      query += ' WHERE UserId = @userId AND DeletedAt IS NULL';
      query += '; SELECT * FROM Users WHERE UserId = @userId;';

      const result = await request.query(query);
      return result.recordset[0] || null;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  async delete(userId: number): Promise<boolean> {
    try {
      const pool = await getDatabase();
      const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query(
          'UPDATE Users SET DeletedAt = GETUTCDATE(), UpdatedAt = GETUTCDATE() WHERE UserId = @userId',
        );

      return result.rowsAffected[0] > 0;
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  async search(query: string): Promise<User[]> {
    try {
      const pool = await getDatabase();
      const searchTerm = `%${query}%`;

      const result = await pool
        .request()
        .input('searchTerm', sql.VarChar(255), searchTerm)
        .query(
          `
          SELECT * FROM Users 
          WHERE DeletedAt IS NULL 
          AND (FirstName LIKE @searchTerm OR LastName LIKE @searchTerm OR Email LIKE @searchTerm)
          ORDER BY CreatedAt DESC
        `,
        );

      return result.recordset;
    } catch (error) {
      logger.error('Error searching users:', error);
      throw error;
    }
  }
}

export const userRepository = new UserRepository();
