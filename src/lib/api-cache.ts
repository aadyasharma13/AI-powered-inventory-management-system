'use client'

import cache from './cache';
import { CacheKey, CacheOptions } from './types';

interface ApiCacheOptions extends CacheOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  invalidateOnSuccess?: boolean;
  cacheKey?: string;
}

interface ApiResponse<T = any> {
  data: T;
  error?: string;
  status: number;
}

class ApiCacheService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Generate cache key for API endpoint
   */
  private generateCacheKey(endpoint: string, options?: ApiCacheOptions): CacheKey {
    const { method = 'GET', body, cacheKey } = options || {};
    
    if (cacheKey) {
      return {
        table: 'api',
        operation: 'custom',
        customKey: cacheKey
      };
    }

    // For GET requests, include query params in cache key
    let key = `api:${method}:${endpoint}`;
    
    // For POST/PUT/PATCH requests with body, include body hash
    if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
      const bodyHash = JSON.stringify(body);
      key += `:${this.hashString(bodyHash)}`;
    }

    return {
      table: 'api',
      operation: 'custom',
      customKey: key
    };
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Cached GET request
   */
  async get<T = any>(
    endpoint: string, 
    options?: Omit<ApiCacheOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET'
    });
  }

  /**
   * Cached POST request
   */
  async post<T = any>(
    endpoint: string, 
    body?: any,
    options?: Omit<ApiCacheOptions, 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body
    });
  }

  /**
   * Cached PUT request
   */
  async put<T = any>(
    endpoint: string, 
    body?: any,
    options?: Omit<ApiCacheOptions, 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body
    });
  }

  /**
   * Cached PATCH request
   */
  async patch<T = any>(
    endpoint: string, 
    body?: any,
    options?: Omit<ApiCacheOptions, 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body
    });
  }

  /**
   * Cached DELETE request
   */
  async delete<T = any>(
    endpoint: string, 
    options?: Omit<ApiCacheOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE'
    });
  }

  /**
   * Main request method with caching
   */
  private async request<T = any>(
    endpoint: string, 
    options: ApiCacheOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      ttl = 5 * 60 * 1000, // 5 minutes default
      invalidateOnSuccess = true,
      cacheKey
    } = options;

    const fullUrl = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const cacheKeyObj = this.generateCacheKey(endpoint, options);

    // For GET requests, try cache first
    if (method === 'GET') {
      try {
        const cached = await cache.get<T>(cacheKeyObj, { ttl });
        if (cached) {
          return {
            data: cached.data,
            status: 200
          };
        }
      } catch (error) {
        console.warn('Cache get failed:', error);
      }
    }

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers
      }
    };

    // Add body for non-GET requests
    if (method !== 'GET' && body) {
      fetchOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(fullUrl, fetchOptions);
      const responseData = await response.json();

      const result: ApiResponse<T> = {
        data: responseData.data || responseData,
        error: responseData.error,
        status: response.status
      };

      // Cache successful GET responses
      if (method === 'GET' && response.ok) {
        try {
          await cache.set(cacheKeyObj, result.data, { ttl });
        } catch (error) {
          console.warn('Cache set failed:', error);
        }
      }

      // Invalidate cache for successful mutations
      if (method !== 'GET' && response.ok && invalidateOnSuccess) {
        try {
          // Invalidate related cache entries based on endpoint
          await this.invalidateRelatedCache(endpoint);
        } catch (error) {
          console.warn('Cache invalidation failed:', error);
        }
      }

      return result;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        data: null as T,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500
      };
    }
  }

  /**
   * Invalidate related cache entries based on endpoint
   */
  private async invalidateRelatedCache(endpoint: string): Promise<void> {
    // Invalidate specific patterns based on endpoint
    const patterns: string[] = [];

    if (endpoint.includes('/api/agents/')) {
      patterns.push('api:get:/api/agents/');
    }

    if (endpoint.includes('/api/analytics')) {
      patterns.push('api:get:/api/analytics');
    }

    if (endpoint.includes('/api/alerts')) {
      patterns.push('api:get:/api/alerts');
    }

    if (endpoint.includes('/api/forecasting')) {
      patterns.push('api:get:/api/forecasting');
    }

    if (endpoint.includes('/api/suppliers')) {
      patterns.push('api:get:/api/suppliers');
    }

    if (endpoint.includes('/api/store-status')) {
      patterns.push('api:get:/api/store-status');
    }

    // Invalidate all patterns
    for (const pattern of patterns) {
      try {
        await cache.invalidate(pattern);
      } catch (error) {
        console.warn(`Failed to invalidate cache pattern ${pattern}:`, error);
      }
    }
  }

  /**
   * Clear all API cache
   */
  async clearApiCache(): Promise<void> {
    try {
      await cache.invalidate('api:');
    } catch (error) {
      console.error('Failed to clear API cache:', error);
    }
  }

  /**
   * Get cache stats for API calls
   */
  getApiCacheStats() {
    return cache.getStats();
  }
}

// Create singleton instance
const apiCache = new ApiCacheService();

export default apiCache; 