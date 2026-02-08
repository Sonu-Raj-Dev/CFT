import { Router, Request, Response } from 'express';
import { authMiddleware, permissionMiddleware } from '../../middleware/auth.js';
import { getDatabase, sql } from '../../config/database.js';
import { HttpException } from '../../middleware/error-handler.js';
import { logger } from '../../utils/logger.js';

const router = Router();

// GET all roles
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const pool = await getDatabase();
    const result = await pool.request().query(`
      SELECT r.role_id, r.role_name, r.description, r.created_at
      FROM roles r
      WHERE r.is_deleted = 0
      ORDER BY r.created_at DESC
    `);

    res.json({
      success: true,
      data: result.recordset,
      count: result.recordset.length,
    });
  } catch (error) {
    logger.error('Get roles error:', error);
    throw error;
  }
});

// GET role by id
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = await getDatabase();
    
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT r.role_id, r.role_name, r.description,
               STRING_AGG(p.permission_name, ',') as permissions
        FROM roles r
        LEFT JOIN role_permission_mappings rpm ON r.role_id = rpm.role_id
        LEFT JOIN permissions p ON rpm.permission_id = p.permission_id
        WHERE r.role_id = @id AND r.is_deleted = 0
        GROUP BY r.role_id, r.role_name, r.description
      `);

    if (result.recordset.length === 0) {
      throw new HttpException(404, 'Role not found', 'ROLE_NOT_FOUND');
    }

    res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    logger.error('Get role error:', error);
    throw error;
  }
});

// POST create role
router.post('/', authMiddleware, permissionMiddleware('create_role'), async (req: Request, res: Response) => {
  try {
    const { roleName, description } = req.body;

    if (!roleName) {
      throw new HttpException(400, 'Role name is required', 'VALIDATION_ERROR');
    }

    const pool = await getDatabase();

    const result = await pool
      .request()
      .input('role_name', sql.VarChar, roleName)
      .input('description', sql.VarChar, description || null)
      .query(`
        INSERT INTO roles (role_name, description, is_deleted)
        VALUES (@role_name, @description, 0);
        SELECT SCOPE_IDENTITY() as role_id;
      `);

    logger.info('Role created', { roleId: result.recordset[0].role_id, roleName });

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: { roleId: result.recordset[0].role_id, roleName, description },
    });
  } catch (error) {
    logger.error('Create role error:', error);
    throw error;
  }
});

// PATCH update role
router.patch('/:id', authMiddleware, permissionMiddleware('update_role'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { roleName, description } = req.body;

    const pool = await getDatabase();

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('role_name', sql.VarChar, roleName)
      .input('description', sql.VarChar, description)
      .query(`
        UPDATE roles
        SET role_name = @role_name, description = @description
        WHERE role_id = @id AND is_deleted = 0
      `);

    logger.info('Role updated', { roleId: id });

    res.json({
      success: true,
      message: 'Role updated successfully',
    });
  } catch (error) {
    logger.error('Update role error:', error);
    throw error;
  }
});

// DELETE role
router.delete('/:id', authMiddleware, permissionMiddleware('delete_role'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = await getDatabase();

    await pool
      .request()
      .input('id', sql.Int, id)
      .query('UPDATE roles SET is_deleted = 1 WHERE role_id = @id');

    logger.info('Role deleted', { roleId: id });

    res.json({
      success: true,
      message: 'Role deleted successfully',
    });
  } catch (error) {
    logger.error('Delete role error:', error);
    throw error;
  }
});

export default router;
