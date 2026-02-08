import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log incoming request
  logger.info(`Incoming ${req.method} request`, {
    path: req.path,
    method: req.method,
    query: req.query,
    ip: req.ip,
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

    logger.log(logLevel, `${req.method} ${req.path} - ${res.statusCode}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      method: req.method,
      path: req.path,
    });
  });

  next();
};
