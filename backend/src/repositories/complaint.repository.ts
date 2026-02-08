import { getDatabase, sql } from '../config/database';
import { logger } from '../utils/logger';

export interface Complaint {
  complaintId: number;
  title: string;
  description: string;
  customerId: number;
  assignedEngineerId?: number;
  statusId: number;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface CreateComplaintInput {
  title: string;
  description: string;
  customerId: number;
  statusId: number;
  priority: string;
}

export interface UpdateComplaintInput {
  title?: string;
  description?: string;
  statusId?: number;
  assignedEngineerId?: number | null;
  priority?: string;
}

export class ComplaintRepository {
  async findAll(page: number = 1, pageSize: number = 10) {
    try {
      const pool = await getDatabase();
      const offset = (page - 1) * pageSize;

      const result = await pool
        .request()
        .input('offset', sql.Int, offset)
        .input('pageSize', sql.Int, pageSize)
        .query(`
          SELECT 
            c.*,
            cust.FirstName as CustomerFirstName,
            cust.LastName as CustomerLastName,
            eng.FirstName as EngineerFirstName,
            eng.LastName as EngineerLastName,
            s.Name as StatusName
          FROM Complaints c
          LEFT JOIN Customers cust ON c.CustomerId = cust.CustomerId
          LEFT JOIN Engineers eng ON c.AssignedEngineerId = eng.EngineerId
          LEFT JOIN Statuses s ON c.StatusId = s.StatusId
          WHERE c.DeletedAt IS NULL
          ORDER BY c.CreatedAt DESC
          OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;

          SELECT COUNT(*) as Total FROM Complaints WHERE DeletedAt IS NULL;
        `);

      return {
        data: result.recordsets[0],
        total: result.recordsets[1][0].Total,
      };
    } catch (error) {
      logger.error('Error fetching complaints:', error);
      throw error;
    }
  }

  async findById(complaintId: number) {
    try {
      const pool = await getDatabase();
      const result = await pool
        .request()
        .input('complaintId', sql.Int, complaintId)
        .query(`
          SELECT 
            c.*,
            cust.FirstName as CustomerFirstName,
            cust.LastName as CustomerLastName,
            eng.FirstName as EngineerFirstName,
            eng.LastName as EngineerLastName,
            s.Name as StatusName
          FROM Complaints c
          LEFT JOIN Customers cust ON c.CustomerId = cust.CustomerId
          LEFT JOIN Engineers eng ON c.AssignedEngineerId = eng.EngineerId
          LEFT JOIN Statuses s ON c.StatusId = s.StatusId
          WHERE c.ComplaintId = @complaintId AND c.DeletedAt IS NULL
        `);

      return result.recordset[0] || null;
    } catch (error) {
      logger.error('Error fetching complaint by id:', error);
      throw error;
    }
  }

  async findByCustomerId(customerId: number, page: number = 1, pageSize: number = 10) {
    try {
      const pool = await getDatabase();
      const offset = (page - 1) * pageSize;

      const result = await pool
        .request()
        .input('customerId', sql.Int, customerId)
        .input('offset', sql.Int, offset)
        .input('pageSize', sql.Int, pageSize)
        .query(`
          SELECT * FROM Complaints 
          WHERE CustomerId = @customerId AND DeletedAt IS NULL
          ORDER BY CreatedAt DESC
          OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;

          SELECT COUNT(*) as Total FROM Complaints 
          WHERE CustomerId = @customerId AND DeletedAt IS NULL;
        `);

      return {
        data: result.recordsets[0],
        total: result.recordsets[1][0].Total,
      };
    } catch (error) {
      logger.error('Error fetching complaints by customer:', error);
      throw error;
    }
  }

  async findByEngineerId(engineerId: number, page: number = 1, pageSize: number = 10) {
    try {
      const pool = await getDatabase();
      const offset = (page - 1) * pageSize;

      const result = await pool
        .request()
        .input('engineerId', sql.Int, engineerId)
        .input('offset', sql.Int, offset)
        .input('pageSize', sql.Int, pageSize)
        .query(`
          SELECT * FROM Complaints 
          WHERE AssignedEngineerId = @engineerId AND DeletedAt IS NULL
          ORDER BY CreatedAt DESC
          OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;

          SELECT COUNT(*) as Total FROM Complaints 
          WHERE AssignedEngineerId = @engineerId AND DeletedAt IS NULL;
        `);

      return {
        data: result.recordsets[0],
        total: result.recordsets[1][0].Total,
      };
    } catch (error) {
      logger.error('Error fetching complaints by engineer:', error);
      throw error;
    }
  }

  async create(input: CreateComplaintInput): Promise<Complaint> {
    try {
      const pool = await getDatabase();
      const result = await pool
        .request()
        .input('title', sql.VarChar(255), input.title)
        .input('description', sql.VarChar(sql.MAX), input.description)
        .input('customerId', sql.Int, input.customerId)
        .input('statusId', sql.Int, input.statusId)
        .input('priority', sql.VarChar(50), input.priority)
        .query(`
          INSERT INTO Complaints (Title, Description, CustomerId, StatusId, Priority, CreatedAt, UpdatedAt)
          VALUES (@title, @description, @customerId, @statusId, @priority, GETUTCDATE(), GETUTCDATE());
          
          SELECT * FROM Complaints WHERE ComplaintId = SCOPE_IDENTITY();
        `);

      return result.recordset[0];
    } catch (error) {
      logger.error('Error creating complaint:', error);
      throw error;
    }
  }

  async update(complaintId: number, input: UpdateComplaintInput): Promise<Complaint | null> {
    try {
      const pool = await getDatabase();

      let query = 'UPDATE Complaints SET UpdatedAt = GETUTCDATE()';
      const request = pool.request().input('complaintId', sql.Int, complaintId);

      if (input.title !== undefined) {
        query += ', Title = @title';
        request.input('title', sql.VarChar(255), input.title);
      }
      if (input.description !== undefined) {
        query += ', Description = @description';
        request.input('description', sql.VarChar(sql.MAX), input.description);
      }
      if (input.statusId !== undefined) {
        query += ', StatusId = @statusId';
        request.input('statusId', sql.Int, input.statusId);
      }
      if (input.assignedEngineerId !== undefined) {
        query += ', AssignedEngineerId = @assignedEngineerId';
        request.input('assignedEngineerId', sql.Int, input.assignedEngineerId);
      }
      if (input.priority !== undefined) {
        query += ', Priority = @priority';
        request.input('priority', sql.VarChar(50), input.priority);
      }

      query += ' WHERE ComplaintId = @complaintId AND DeletedAt IS NULL';
      query += '; SELECT * FROM Complaints WHERE ComplaintId = @complaintId;';

      const result = await request.query(query);
      return result.recordset[0] || null;
    } catch (error) {
      logger.error('Error updating complaint:', error);
      throw error;
    }
  }

  async assignEngineer(complaintId: number, engineerId: number): Promise<Complaint | null> {
    try {
      const pool = await getDatabase();
      const result = await pool
        .request()
        .input('complaintId', sql.Int, complaintId)
        .input('engineerId', sql.Int, engineerId)
        .query(`
          UPDATE Complaints 
          SET AssignedEngineerId = @engineerId, UpdatedAt = GETUTCDATE()
          WHERE ComplaintId = @complaintId AND DeletedAt IS NULL;
          
          SELECT * FROM Complaints WHERE ComplaintId = @complaintId;
        `);

      return result.recordset[0] || null;
    } catch (error) {
      logger.error('Error assigning engineer:', error);
      throw error;
    }
  }

  async delete(complaintId: number): Promise<boolean> {
    try {
      const pool = await getDatabase();
      const result = await pool
        .request()
        .input('complaintId', sql.Int, complaintId)
        .query(
          'UPDATE Complaints SET DeletedAt = GETUTCDATE(), UpdatedAt = GETUTCDATE() WHERE ComplaintId = @complaintId',
        );

      return result.rowsAffected[0] > 0;
    } catch (error) {
      logger.error('Error deleting complaint:', error);
      throw error;
    }
  }

  async search(query: string, page: number = 1, pageSize: number = 10) {
    try {
      const pool = await getDatabase();
      const offset = (page - 1) * pageSize;
      const searchTerm = `%${query}%`;

      const result = await pool
        .request()
        .input('searchTerm', sql.VarChar(255), searchTerm)
        .input('offset', sql.Int, offset)
        .input('pageSize', sql.Int, pageSize)
        .query(`
          SELECT * FROM Complaints 
          WHERE DeletedAt IS NULL 
          AND (Title LIKE @searchTerm OR Description LIKE @searchTerm)
          ORDER BY CreatedAt DESC
          OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;

          SELECT COUNT(*) as Total FROM Complaints 
          WHERE DeletedAt IS NULL 
          AND (Title LIKE @searchTerm OR Description LIKE @searchTerm);
        `);

      return {
        data: result.recordsets[0],
        total: result.recordsets[1][0].Total,
      };
    } catch (error) {
      logger.error('Error searching complaints:', error);
      throw error;
    }
  }
}

export const complaintRepository = new ComplaintRepository();
