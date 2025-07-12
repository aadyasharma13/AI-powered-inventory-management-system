'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import dataService from '@/lib/data-service';
import { 
  QueryFilters, 
  QueryOptions, 
  CacheOptions, 
  MutationOptions 
} from '@/lib/types';

interface UseDataOptions<T> {
  table: string;
  filters?: QueryFilters;
  queryOptions?: QueryOptions;
  cacheOptions?: CacheOptions;
  autoFetch?: boolean;
  transform?: (data: T[]) => T[];
}

interface UseDataResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  update: (id: string, data: Partial<T>) => Promise<T>;
}

interface UseDataByIdOptions<T> {
  table: string;
  id: string;
  cacheOptions?: CacheOptions;
  autoFetch?: boolean;
  transform?: (data: T) => T;
}

interface UseDataByIdResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  update: (data: Partial<T>) => Promise<T>;
  delete: () => Promise<void>;
}

/**
 * Hook for fetching multiple records with caching
 */
export function useData<T>(options: UseDataOptions<T>): UseDataResult<T> {
  const { table, filters, queryOptions, cacheOptions, autoFetch = true, transform } = options;
  const { user } = useAuth();
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => ({
    filters,
    queryOptions,
    cacheOptions
  }), [filters, queryOptions, cacheOptions]);

  // Set user ID for cache key generation
  useEffect(() => {
    if (user?.id) {
      dataService.setUserId(user.id);
    }
  }, [user?.id]);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const result = await dataService.query<T>(
        table,
        memoizedOptions.filters,
        { ...memoizedOptions.queryOptions, ...memoizedOptions.cacheOptions }
      );

      if (!abortControllerRef.current.signal.aborted) {
        const transformedData = transform ? transform(result) : result;
        setData(transformedData as T[]);
      }
    } catch (err) {
      if (!abortControllerRef.current.signal.aborted) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        console.error(`[useData] Error fetching ${table}:`, err);
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, [table, user?.id, transform, memoizedOptions]);

  // Auto-fetch when dependencies change
  useEffect(() => {
    if (autoFetch && user?.id) {
      fetchData();
    }
  }, [fetchData, autoFetch, user?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const mutate = useCallback(async (newData: Partial<T>): Promise<T> => {
    try {
      const result = await dataService.insert<T>(table, newData);
      await fetchData(); // Refetch to update cache
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create record';
      setError(errorMessage);
      throw err;
    }
  }, [table, fetchData]);

  const update = useCallback(async (id: string, updateData: Partial<T>): Promise<T> => {
    try {
      const result = await dataService.update<T>(table, id, updateData);
      await fetchData(); // Refetch to update cache
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update record';
      setError(errorMessage);
      throw err;
    }
  }, [table, fetchData]);

  const deleteRecord = useCallback(async (id: string): Promise<void> => {
    try {
      await dataService.delete(table, id);
      await fetchData(); // Refetch to update cache
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete record';
      setError(errorMessage);
      throw err;
    }
  }, [table, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate,
    delete: deleteRecord,
    update
  };
}

/**
 * Hook for fetching single record by ID with caching
 */
export function useDataById<T>(options: UseDataByIdOptions<T>): UseDataByIdResult<T> {
  const { table, id, cacheOptions, autoFetch = true, transform } = options;
  const { user } = useAuth();
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoize cacheOptions to prevent unnecessary re-renders
  const memoizedCacheOptions = useMemo(() => cacheOptions, [cacheOptions]);

  // Set user ID for cache key generation
  useEffect(() => {
    if (user?.id) {
      dataService.setUserId(user.id);
    }
  }, [user?.id]);

  const fetchData = useCallback(async () => {
    if (!user?.id || !id) return;

    setLoading(true);
    setError(null);

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const result = await dataService.getById<T>(table, id, memoizedCacheOptions);

      if (!abortControllerRef.current.signal.aborted) {
        const transformedData = result && transform ? transform(result) : result;
        setData(transformedData);
      }
    } catch (err) {
      if (!abortControllerRef.current.signal.aborted) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        console.error(`[useDataById] Error fetching ${table} with id ${id}:`, err);
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, [table, id, user?.id, transform, memoizedCacheOptions]);

  // Auto-fetch when dependencies change
  useEffect(() => {
    if (autoFetch && user?.id && id) {
      fetchData();
    }
  }, [fetchData, autoFetch, user?.id, id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const update = useCallback(async (updateData: Partial<T>): Promise<T> => {
    if (!id) throw new Error('No ID provided for update');
    
    try {
      const result = await dataService.update<T>(table, id, updateData);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update record';
      setError(errorMessage);
      throw err;
    }
  }, [table, id]);

  const deleteRecord = useCallback(async (): Promise<void> => {
    if (!id) throw new Error('No ID provided for delete');
    
    try {
      await dataService.delete(table, id);
      setData(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete record';
      setError(errorMessage);
      throw err;
    }
  }, [table, id]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    update,
    delete: deleteRecord
  };
}

/**
 * Hook for specific entity types with type safety
 */
export function useProducts(filters?: QueryFilters, options?: QueryOptions & CacheOptions) {
  return useData({
    table: 'products',
    filters,
    queryOptions: options,
    cacheOptions: options
  });
}

export function useProduct(id: string, options?: CacheOptions) {
  return useDataById({
    table: 'products',
    id,
    cacheOptions: options
  });
}

export function useSales(filters?: QueryFilters, options?: QueryOptions & CacheOptions) {
  return useData({
    table: 'sales',
    filters,
    queryOptions: options,
    cacheOptions: options
  });
}

export function useSale(id: string, options?: CacheOptions) {
  return useDataById({
    table: 'sales',
    id,
    cacheOptions: options
  });
}

export function useAlerts(filters?: QueryFilters, options?: QueryOptions & CacheOptions) {
  return useData({
    table: 'alerts',
    filters,
    queryOptions: options,
    cacheOptions: options
  });
}

export function useAlert(id: string, options?: CacheOptions) {
  return useDataById({
    table: 'alerts',
    id,
    cacheOptions: options
  });
}

export function useInventorySnapshots(filters?: QueryFilters, options?: QueryOptions & CacheOptions) {
  return useData({
    table: 'inventory_snapshots',
    filters,
    queryOptions: options,
    cacheOptions: options
  });
}

export function useInventorySnapshot(id: string, options?: CacheOptions) {
  return useDataById({
    table: 'inventory_snapshots',
    id,
    cacheOptions: options
  });
}

export function useSuppliers(filters?: QueryFilters, options?: QueryOptions & CacheOptions) {
  return useData({
    table: 'suppliers',
    filters,
    queryOptions: options,
    cacheOptions: options
  });
}

export function useSupplier(id: string, options?: CacheOptions) {
  return useDataById({
    table: 'suppliers',
    id,
    cacheOptions: options
  });
}

export function usePurchaseOrders(filters?: QueryFilters, options?: QueryOptions & CacheOptions) {
  return useData({
    table: 'purchase_orders',
    filters,
    queryOptions: options,
    cacheOptions: options
  });
}

export function usePurchaseOrder(id: string, options?: CacheOptions) {
  return useDataById({
    table: 'purchase_orders',
    id,
    cacheOptions: options
  });
}

export function useProfile(userId: string, options?: CacheOptions) {
  return useDataById({
    table: 'profiles',
    id: userId,
    cacheOptions: options
  });
}

/**
 * Hook for cache management
 */
export function useCache() {
  const [stats, setStats] = useState(dataService.getCacheStats());
  const [performance, setPerformance] = useState(dataService.getCachePerformance());

  const refreshStats = useCallback(() => {
    setStats(dataService.getCacheStats());
    setPerformance(dataService.getCachePerformance());
  }, []);

  const clearCache = useCallback(async () => {
    await dataService.clearCache();
    refreshStats();
  }, [refreshStats]);

  const optimizeCache = useCallback(() => {
    dataService.optimizeCache();
    refreshStats();
  }, [refreshStats]);

  return {
    stats,
    performance,
    refreshStats,
    clearCache,
    optimizeCache
  };
} 