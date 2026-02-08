/**
 * Simple logging utility for API requests and responses
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, data, error } = entry;
    let log = `[${timestamp}] [${level}] ${message}`;

    if (data) {
      log += ` | ${JSON.stringify(data)}`;
    }

    if (error) {
      log += ` | ERROR: ${error}`;
    }

    return log;
  }

  private log(level: LogLevel, message: string, data?: any, error?: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error,
    };

    const formatted = this.formatLog(entry);

    // Always log errors
    if (level === LogLevel.ERROR) {
      console.error(formatted);
      return;
    }

    // Log other levels only in development
    if (this.isDevelopment) {
      if (level === LogLevel.WARN) {
        console.warn(formatted);
      } else {
        console.log(formatted);
      }
    }
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error | string, data?: any): void {
    const errorMsg = error instanceof Error ? error.message : error;
    this.log(LogLevel.ERROR, message, data, errorMsg);
  }

  // Request logging
  logRequest(method: string, path: string, userId?: number): void {
    this.debug(`[REQUEST] ${method} ${path}`, userId ? { userId } : undefined);
  }

  // Response logging
  logResponse(method: string, path: string, statusCode: number, userId?: number): void {
    const status = statusCode >= 400 ? 'ERROR' : 'SUCCESS';
    this.debug(`[RESPONSE] ${method} ${path} - ${statusCode} (${status})`, userId ? { userId } : undefined);
  }

  // Database logging
  logQuery(query: string, params?: any): void {
    if (this.isDevelopment) {
      this.debug(`[DB] Query: ${query}`, params);
    }
  }

  logQueryError(query: string, error: Error): void {
    this.error(`[DB] Query failed: ${query}`, error);
  }

  // Auth logging
  logAuthAttempt(email: string, success: boolean): void {
    this.info(`[AUTH] Login attempt for ${email}: ${success ? 'SUCCESS' : 'FAILED'}`);
  }

  // Permission logging
  logPermissionCheck(userId: number, permission: string, granted: boolean): void {
    if (this.isDevelopment) {
      this.debug(`[PERMISSION] User ${userId} - ${permission}: ${granted ? 'GRANTED' : 'DENIED'}`);
    }
  }
}

// Export singleton instance
export const logger = new Logger();
