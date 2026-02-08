import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

export const sendSuccess = <T = any>(
  res: Response,
  data: T | null,
  message: string = 'Success',
  statusCode: number = 200,
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  code?: string,
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    code: code || 'ERROR',
    timestamp: new Date().toISOString(),
  });
};

export const sendPaginated = <T = any>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  pageSize: number,
  message: string = 'Success',
): Response => {
  const totalPages = Math.ceil(total / pageSize);
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    timestamp: new Date().toISOString(),
  });
};
