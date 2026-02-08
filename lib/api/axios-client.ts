'use client';

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = typeof window !== 'undefined' 
  ? process.env.NEXT_PUBLIC_API_BASE_URL || '/api'
  : '/api';

interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

interface ApiError {
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;

  private constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<any>) => {
        if (error.response?.status === 401) {
          // Clear token and redirect to login on unauthorized
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(this.formatError(error));
      }
    );
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Get JWT token from localStorage
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Set JWT token in localStorage
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Clear JWT token from localStorage
   */
  clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  /**
   * Format error response
   */
  private formatError(error: AxiosError<any>): ApiError {
    const response = error.response?.data;
    return {
      message: response?.message || error.message || 'An error occurred',
      statusCode: error.response?.status || 500,
      details: response?.error || response?.errors,
    };
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.client.get<{ data: T }>(url, { params });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: Record<string, any>): Promise<T> {
    try {
      const response = await this.client.post<{ data: T }>(url, data);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: Record<string, any>): Promise<T> {
    try {
      const response = await this.client.patch<{ data: T }>(url, data);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string): Promise<T> {
    try {
      const response = await this.client.delete<{ data: T }>(url);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get raw response (useful for checking success flag)
   */
  async getRaw<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.client.get<T>(url, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST raw response
   */
  async postRaw<T = any>(url: string, data?: Record<string, any>): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const apiClient = ApiClient.getInstance();
export type { ApiError };
