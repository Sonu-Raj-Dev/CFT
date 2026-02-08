import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { authMiddleware, permissionMiddleware } from '../../middleware/auth.js';
import { getDatabase, sql } from '../../config/database.js';
import { HttpException } from '../../middleware/error-handler.js';
import { logger } from '../../utils/logger.js';

const router = Router();

// GET all users
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const pool = await getDatabase();
    const result = await pool.request().query(`
      SELECT u.user_id, u.email, u.first_name, u.last_name, u.is_active, u.created_at
      FROM users u
      WHERE u.is_deleted = 0
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      data: result.recordset,
      count: result.recordset.length,
    });
  } catch (error) {
    logger.error('Get users error:', error);
    throw error;
  }
});

// GET user by id
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = await getDatabase();
    
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT u.user_id, u.email, u.first_name, u.last_name, u.is_active,
               STRING_AGG(r.role_name, ',') as roles
        FROM users u
        LEFT JOIN user_role_mappings urm ON u.user_id = urm.user_id
        LEFT JOIN roles r ON urm.role_id = r.role_id
        WHERE u.user_id = @id AND u.is_deleted = 0
        GROUP BY u.user_id, u.email, u.first_name, u.last_name, u.is_active
      `);

    if (result.recordset.length === 0) {
      throw new HttpException(404, 'User not found', 'USER_NOT_FOUND');
    }

    res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    logger.error('Get user error:', error);
    throw error;
  }
});

// POST create user
router.post('/', authMiddleware, permissionMiddleware('create_user'), async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    if (!email || !firstName || !lastName || !password) {
      throw new HttpException(400, 'All fields are required', 'VALIDATION_ERROR');
    }

    const pool = await getDatabase();
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool
      .request()
      .input('email', sql.VarChar, email)
      .input('password_hash', sql.VarChar, hashedPassword)
      .input('first_name', sql.VarChar, firstName)
      .input('last_name', sql.VarChar, lastName)
      .query(`
        INSERT INTO users (email, password_hash, first_name, last_name, is_active, created_at, is_deleted)
        VALUES (@email, @password_hash, @first_name, @last_name, 1, GETUTCDATE(), 0);
        SELECT SCOPE_IDENTITY() as user_id;
      `);

    logger.info('User created', { userId: result.recordset[0].user_id, email });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { userId: result.recordset[0].user_id, email, firstName, lastName },
    });
  } catch (error) {
    logger.error('Create user error:', error);
    throw error;
  }
});

// PATCH update user
router.patch('/:id', authMiddleware, permissionMiddleware('update_user'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, isActive } = req.body;

    const pool = await getDatabase();

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('first_name', sql.VarChar, firstName)
      .input('last_name', sql.VarChar, lastName)
      .input('is_active', sql.Bit, isActive)
      .query(`
        UPDATE users
        SET first_name = @first_name, last_name = @last_name, is_active = @is_active
        WHERE user_id = @id AND is_deleted = 0
      `);

    logger.info('User updated', { userId: id });

    res.json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    logger.error('Update user error:', error);
    throw error;
  }
});

// DELETE user
router.delete('/:id', authMiddleware, permissionMiddleware('delete_user'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = await getDatabase();

    await pool
      .request()
      .input('id', sql.Int, id)
      .query('UPDATE users SET is_deleted = 1 WHERE user_id = @id');

    logger.info('User deleted', { userId: id });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    throw error;
  }
});

export default router;
