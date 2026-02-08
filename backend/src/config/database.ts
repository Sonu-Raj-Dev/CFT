import sql, { ConnectionPool, config as SqlConfig } from 'mssql';
import { logger } from '../utils/logger';

let pool: ConnectionPool | null = null;

const dbConfig: SqlConfig = {
  server: process.env.DB_SERVER || 'localhost',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || '',
    },
  },
  options: {
    database: process.env.DB_DATABASE || 'ComplaintManagement',
    port: parseInt(process.env.DB_PORT || '1433'),
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    connectionTimeout: 30000,
    requestTimeout: 30000,
  },
};

export async function initializeDatabase(): Promise<ConnectionPool> {
  try {
    if (pool) {
      return pool;
    }

    pool = new sql.ConnectionPool(dbConfig);
    
    pool.on('error', (err) => {
      logger.error('Database pool error:', err);
    });

    await pool.connect();
    logger.info('Database connected successfully');
    return pool;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

export async function getDatabase(): Promise<ConnectionPool> {
  if (!pool) {
    return await initializeDatabase();
  }
  return pool;
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    logger.info('Database connection closed');
  }
}

export { sql };
