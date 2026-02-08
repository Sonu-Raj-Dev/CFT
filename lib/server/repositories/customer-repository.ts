import { executeQuery, executeNonQuery } from '../db';
import { Customer } from '../types';

export class CustomerRepository {
  /**
   * Create a new customer
   */
  static async createCustomer(
    customerName: string,
    mobileNumber: number,
    emailId: string,
    address: string,
    createdBy: number
  ): Promise<Customer> {
    const query = `
      INSERT INTO [dbo].[CustomerMaster] 
      ([CustomerName], [MobileNumber], [EmailId], [Address], [IsActive], [CreatedBy], [CreatedDate])
      VALUES (@customerName, @mobileNumber, @emailId, @address, 1, @createdBy, GETDATE())
      
      SELECT SCOPE_IDENTITY() as id
    `;

    const result = await executeQuery<{ id: number }>(query, {
      customerName,
      mobileNumber,
      emailId,
      address,
      createdBy,
    });

    if (!result.length) {
      throw new Error('Failed to create customer');
    }

    return this.getCustomerById(result[0].id);
  }

  /**
   * Get customer by ID
   */
  static async getCustomerById(customerId: number): Promise<Customer> {
    const query = `SELECT * FROM [dbo].[CustomerMaster] WHERE [Id] = @customerId AND [IsActive] = 1`;
    const result = await executeQuery<Customer>(query, { customerId });

    if (!result.length) {
      throw new Error(`Customer with ID ${customerId} not found`);
    }

    return result[0];
  }

  /**
   * Get all customers
   */
  static async getAllCustomers(
    page: number = 1,
    limit: number = 10,
    searchTerm?: string
  ): Promise<{ customers: Customer[]; total: number }> {
    const offset = (page - 1) * limit;

    const countQuery = `
      SELECT COUNT(*) as total FROM [dbo].[CustomerMaster]
      WHERE [IsActive] = 1
      ${searchTerm ? "AND ([CustomerName] LIKE @search OR [EmailId] LIKE @search)" : ''}
    `;

    const dataQuery = `
      SELECT * FROM [dbo].[CustomerMaster]
      WHERE [IsActive] = 1
      ${searchTerm ? "AND ([CustomerName] LIKE @search OR [EmailId] LIKE @search)" : ''}
      ORDER BY [CreatedDate] DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const params: Record<string, any> = { offset, limit };
    if (searchTerm) params.search = `%${searchTerm}%`;

    const [countResult, dataResult] = await Promise.all([
      executeQuery<{ total: number }>(countQuery, params),
      executeQuery<Customer>(dataQuery, params),
    ]);

    return {
      customers: dataResult,
      total: countResult[0]?.total || 0,
    };
  }

  /**
   * Update customer
   */
  static async updateCustomer(
    customerId: number,
    updates: Partial<{
      customerName: string;
      mobileNumber: number;
      emailId: string;
      address: string;
      isActive: boolean;
    }>,
    modifiedBy: number
  ): Promise<void> {
    const setClauses = [];
    const params: Record<string, any> = { customerId, modifiedBy };

    if (updates.customerName !== undefined) {
      setClauses.push('[CustomerName] = @customerName');
      params.customerName = updates.customerName;
    }

    if (updates.mobileNumber !== undefined) {
      setClauses.push('[MobileNumber] = @mobileNumber');
      params.mobileNumber = updates.mobileNumber;
    }

    if (updates.emailId !== undefined) {
      setClauses.push('[EmailId] = @emailId');
      params.emailId = updates.emailId;
    }

    if (updates.address !== undefined) {
      setClauses.push('[Address] = @address');
      params.address = updates.address;
    }

    if (updates.isActive !== undefined) {
      setClauses.push('[IsActive] = @isActive');
      params.isActive = updates.isActive;
    }

    if (!setClauses.length) return;

    setClauses.push('[ModifiedDate] = GETDATE()');
    setClauses.push('[ModifiedBy] = @modifiedBy');

    const query = `
      UPDATE [dbo].[CustomerMaster]
      SET ${setClauses.join(', ')}
      WHERE [Id] = @customerId
    `;

    await executeNonQuery(query, params);
  }

  /**
   * Deactivate customer
   */
  static async deactivateCustomer(customerId: number, modifiedBy: number): Promise<void> {
    const query = `
      UPDATE [dbo].[CustomerMaster]
      SET [IsActive] = 0, [ModifiedDate] = GETDATE(), [ModifiedBy] = @modifiedBy
      WHERE [Id] = @customerId
    `;

    await executeNonQuery(query, { customerId, modifiedBy });
  }
}
