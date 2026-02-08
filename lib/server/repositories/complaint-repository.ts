import { executeQuery, executeNonQuery } from '../db';
import { Complaint } from '../types';

export interface ComplaintDetails extends Complaint {
  customerName?: string;
  customerEmail?: string;
  engineerName?: string;
  statusName?: string;
  mobileNumber?: number;
  address?: string;
}

export class ComplaintRepository {
  /**
   * Create a new complaint
   */
  static async createComplaint(
    customerId: number,
    natureOfComplaint: string,
    complaintDetails: string,
    statusId: number,
    createdBy: number,
    engineerId?: number
  ): Promise<Complaint> {
    const query = `
      INSERT INTO [dbo].[ComplaintMaster] 
      ([CustomerId], [NatureOfComplaint], [ComplaintDetails], [EngineerId], [StatusId], [IsActive], [CreatedBy], [CreatedDate])
      VALUES (@customerId, @natureOfComplaint, @complaintDetails, @engineerId, @statusId, 1, @createdBy, GETDATE())
      
      SELECT SCOPE_IDENTITY() as id
    `;

    const result = await executeQuery<{ id: number }>(query, {
      customerId,
      natureOfComplaint,
      complaintDetails,
      engineerId: engineerId || null,
      statusId,
      createdBy,
    });

    if (!result.length) {
      throw new Error('Failed to create complaint');
    }

    return this.getComplaintById(result[0].id);
  }

  /**
   * Get complaint by ID
   */
  static async getComplaintById(complaintId: number): Promise<Complaint> {
    const query = `SELECT * FROM [dbo].[ComplaintMaster] WHERE [Id] = @complaintId AND [IsActive] = 1`;
    const result = await executeQuery<Complaint>(query, { complaintId });

    if (!result.length) {
      throw new Error(`Complaint with ID ${complaintId} not found`);
    }

    return result[0];
  }

  /**
   * Get complaint with details (joins with customer, engineer, status)
   */
  static async getComplaintWithDetails(complaintId: number): Promise<ComplaintDetails> {
    const query = `
      SELECT 
        cm.*,
        c.CustomerName,
        c.EmailId as CustomerEmail,
        c.MobileNumber,
        c.Address,
        em.Name as EngineerName,
        s.StatusName
      FROM [dbo].[ComplaintMaster] cm
      LEFT JOIN [dbo].[CustomerMaster] c ON cm.CustomerId = c.Id AND c.IsActive = 1
      LEFT JOIN [dbo].[EngineerMaster] em ON cm.EngineerId = em.Id AND em.IsActive = 1
      LEFT JOIN [dbo].[StatusMaster] s ON cm.StatusId = s.Id AND s.IsActive = 1
      WHERE cm.Id = @complaintId AND cm.IsActive = 1
    `;

    const result = await executeQuery<ComplaintDetails>(query, { complaintId });

    if (!result.length) {
      throw new Error(`Complaint with ID ${complaintId} not found`);
    }

    return result[0];
  }

  /**
   * Get all complaints with filtering by engineer
   * Business logic: If user is Engineer (roleId=2), show only complaints assigned to that engineer
   * Else show all complaints
   */
  static async getAllComplaints(
    page: number = 1,
    limit: number = 10,
    userId?: number,
    roleId?: number,
    searchTerm?: string
  ): Promise<{ complaints: ComplaintDetails[]; total: number }> {
    const offset = (page - 1) * limit;

    // Engineer role filtering logic
    const engineerFilter = roleId === 2 ? 'AND cm.EngineerId = @userId' : '';

    const countQuery = `
      SELECT COUNT(*) as total FROM [dbo].[ComplaintMaster] cm
      WHERE cm.IsActive = 1 ${engineerFilter}
      ${searchTerm ? "AND (c.CustomerName LIKE @search OR cm.NatureOfComplaint LIKE @search)" : ''}
    `;

    const dataQuery = `
      SELECT 
        cm.*,
        c.CustomerName,
        c.EmailId as CustomerEmail,
        c.MobileNumber,
        c.Address,
        em.Name as EngineerName,
        s.StatusName
      FROM [dbo].[ComplaintMaster] cm
      LEFT JOIN [dbo].[CustomerMaster] c ON cm.CustomerId = c.Id AND c.IsActive = 1
      LEFT JOIN [dbo].[EngineerMaster] em ON cm.EngineerId = em.Id AND em.IsActive = 1
      LEFT JOIN [dbo].[StatusMaster] s ON cm.StatusId = s.Id AND s.IsActive = 1
      WHERE cm.IsActive = 1 ${engineerFilter}
      ${searchTerm ? "AND (c.CustomerName LIKE @search OR cm.NatureOfComplaint LIKE @search)" : ''}
      ORDER BY cm.CreatedDate DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const params: Record<string, any> = { offset, limit };
    if (roleId === 2 && userId) params.userId = userId;
    if (searchTerm) params.search = `%${searchTerm}%`;

    const [countResult, dataResult] = await Promise.all([
      executeQuery<{ total: number }>(countQuery, params),
      executeQuery<ComplaintDetails>(dataQuery, params),
    ]);

    return {
      complaints: dataResult,
      total: countResult[0]?.total || 0,
    };
  }

  /**
   * Update complaint
   */
  static async updateComplaint(
    complaintId: number,
    updates: Partial<{
      customerId: number;
      natureOfComplaint: string;
      complaintDetails: string;
      engineerId: number | null;
      statusId: number;
      isActive: boolean;
    }>,
    modifiedBy: number
  ): Promise<void> {
    const setClauses = [];
    const params: Record<string, any> = { complaintId, modifiedBy };

    if (updates.customerId !== undefined) {
      setClauses.push('[CustomerId] = @customerId');
      params.customerId = updates.customerId;
    }

    if (updates.natureOfComplaint !== undefined) {
      setClauses.push('[NatureOfComplaint] = @natureOfComplaint');
      params.natureOfComplaint = updates.natureOfComplaint;
    }

    if (updates.complaintDetails !== undefined) {
      setClauses.push('[ComplaintDetails] = @complaintDetails');
      params.complaintDetails = updates.complaintDetails;
    }

    if (updates.engineerId !== undefined) {
      setClauses.push('[EngineerId] = @engineerId');
      params.engineerId = updates.engineerId;
    }

    if (updates.statusId !== undefined) {
      setClauses.push('[StatusId] = @statusId');
      params.statusId = updates.statusId;
    }

    if (updates.isActive !== undefined) {
      setClauses.push('[IsActive] = @isActive');
      params.isActive = updates.isActive;
    }

    if (!setClauses.length) return;

    setClauses.push('[ModifiedDate] = GETDATE()');
    setClauses.push('[ModifiedBy] = @modifiedBy');

    const query = `
      UPDATE [dbo].[ComplaintMaster]
      SET ${setClauses.join(', ')}
      WHERE [Id] = @complaintId
    `;

    await executeNonQuery(query, params);
  }

  /**
   * Assign engineer to complaint
   */
  static async assignEngineer(
    complaintId: number,
    engineerId: number,
    modifiedBy: number
  ): Promise<void> {
    const query = `
      UPDATE [dbo].[ComplaintMaster]
      SET [EngineerId] = @engineerId, [ModifiedDate] = GETDATE(), [ModifiedBy] = @modifiedBy
      WHERE [Id] = @complaintId
    `;

    await executeNonQuery(query, { complaintId, engineerId, modifiedBy });
  }

  /**
   * Update complaint status
   */
  static async updateStatus(
    complaintId: number,
    statusId: number,
    modifiedBy: number
  ): Promise<void> {
    const query = `
      UPDATE [dbo].[ComplaintMaster]
      SET [StatusId] = @statusId, [ModifiedDate] = GETDATE(), [ModifiedBy] = @modifiedBy
      WHERE [Id] = @complaintId
    `;

    await executeNonQuery(query, { complaintId, statusId, modifiedBy });
  }

  /**
   * Deactivate complaint (soft delete)
   */
  static async deactivateComplaint(complaintId: number, modifiedBy: number): Promise<void> {
    const query = `
      UPDATE [dbo].[ComplaintMaster]
      SET [IsActive] = 0, [ModifiedDate] = GETDATE(), [ModifiedBy] = @modifiedBy
      WHERE [Id] = @complaintId
    `;

    await executeNonQuery(query, { complaintId, modifiedBy });
  }
}
