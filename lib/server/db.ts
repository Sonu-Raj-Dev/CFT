import sql from 'mssql';

// Database configuration from environment variables
const dbConfig: sql.config = {
  server: process.env.DB_SERVER || '',
  database: process.env.DB_NAME || 'CFT',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER || '',
      password: process.env.DB_PASSWORD || '',
    },
  },
  options: {
    encrypt: process.env.DB_ENCRYPT !== 'false', // Default true for Azure
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
    connectionTimeout: 30000,
    requestTimeout: 30000,
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 30000,
    },
  },
};

let connection: sql.ConnectionPool | null = null;

/**
 * Get or create database connection pool
 */
export async function getConnection(): Promise<sql.ConnectionPool> {
  if (connection && connection.connected) {
    return connection;
  }

  try {
    connection = new sql.ConnectionPool(dbConfig);
    await connection.connect();
    console.log('[DB] Connection pool established');
    return connection;
  } catch (error) {
    console.error('[DB] Connection error:', error);
    throw new Error('Failed to connect to database');
  }
}

/**
 * Execute query and return results
 */
export async function executeQuery<T>(query: string, inputs?: Record<string, any>): Promise<T[]> {
  const conn = await getConnection();
  const request = conn.request();

  // Add input parameters if provided
  if (inputs) {
    Object.entries(inputs).forEach(([key, value]) => {
      request.input(key, value);
    });
  }

  try {
    const result = await request.query(query);
    return result.recordset as T[];
  } catch (error) {
    console.error('[DB] Query error:', error);
    throw error;
  }
}

/**
 * Execute stored procedure and return results
 */
export async function executeStoredProcedure<T>(
  procName: string,
  inputs?: Record<string, any>
): Promise<T[]> {
  const conn = await getConnection();
  const request = conn.request();

  // Add input parameters if provided
  if (inputs) {
    Object.entries(inputs).forEach(([key, value]) => {
      request.input(key, value);
    });
  }

  try {
    const result = await request.execute(procName);
    return result.recordset as T[];
  } catch (error) {
    console.error(`[DB] Procedure ${procName} error:`, error);
    throw error;
  }
}

/**
 * Execute insert/update/delete and return affected rows
 */
export async function executeNonQuery(
  query: string,
  inputs?: Record<string, any>
): Promise<number> {
  const conn = await getConnection();
  const request = conn.request();

  // Add input parameters if provided
  if (inputs) {
    Object.entries(inputs).forEach(([key, value]) => {
      request.input(key, value);
    });
  }

  try {
    const result = await request.query(query);
    return result.rowsAffected[0] || 0;
  } catch (error) {
    console.error('[DB] Non-query error:', error);
    throw error;
  }
}

/**
 * Close database connection pool
 */
export async function closeConnection(): Promise<void> {
  if (connection && connection.connected) {
    await connection.close();
    connection = null;
    console.log('[DB] Connection pool closed');
  }
}

// Handle graceful shutdown
process.on('exit', async () => {
  await closeConnection();
});
