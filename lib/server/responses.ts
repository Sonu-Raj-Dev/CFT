import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp?: string;
}

/**
 * Success response
 */
export function successResponse<T>(
  data: T,
  message: string = 'Operation successful',
  statusCode: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

/**
 * Paginated success response
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Fetched successfully'
): NextResponse<PaginatedResponse<T>> {
  const totalPages = Math.ceil(total / limit);

  return NextResponse.json(
    {
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

/**
 * Error response
 */
export function errorResponse(
  message: string = 'An error occurred',
  statusCode: number = 400,
  errors?: Record<string, string> | string
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    message,
    error: typeof errors === 'string' ? errors : undefined,
    errors: typeof errors === 'object' ? errors : undefined,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
  return errorResponse(message, 401);
}

/**
 * Forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden'): NextResponse<ApiResponse> {
  return errorResponse(message, 403);
}

/**
 * Not found response
 */
export function notFoundResponse(message: string = 'Resource not found'): NextResponse<ApiResponse> {
  return errorResponse(message, 404);
}

/**
 * Validation error response
 */
export function validationErrorResponse(
  message: string = 'Validation failed',
  errors?: Record<string, string> | string
): NextResponse<ApiResponse> {
  return errorResponse(message, 422, errors);
}

/**
 * Internal server error response
 */
export function serverErrorResponse(message: string = 'Internal server error'): NextResponse<ApiResponse> {
  console.error('[API] Server error:', message);
  return errorResponse(message, 500);
}

/**
 * Created response (201)
 */
export function createdResponse<T>(
  data: T,
  message: string = 'Created successfully'
): NextResponse<ApiResponse<T>> {
  return successResponse(data, message, 201);
}

/**
 * No content response (204)
 */
export function noContentResponse(): NextResponse<void> {
  return new NextResponse(null, { status: 204 });
}
