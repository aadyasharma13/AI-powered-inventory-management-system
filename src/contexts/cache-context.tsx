'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './auth-context';
import dataService from '@/lib/data-service';
import cache from '@/lib/cache';
import { CacheStats, CachePerformance, CacheEvent } from '@/lib/types';

interface CacheContextType {
  stats: CacheStats;
  performance: CachePerformance;
  clearCache: () => Promise<void>;
  optimizeCache: () => void;
  refreshStats: () => void;
  isInitialized: boolean;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

export function CacheProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<CacheStats>(cache.getStats());
  const [performance, setPerformance] = useState<CachePerformance>(cache.getPerformance());
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize the cache event handler to prevent infinite loops
  const handleCacheEvent = useCallback((event: CacheEvent) => {
    // Only update on specific events to reduce frequency
    if (event.type === 'set' || event.type === 'delete' || event.type === 'clear') {
      // Use requestAnimationFrame to batch updates
      requestAnimationFrame(() => {
        setStats(cache.getStats());
        setPerformance(cache.getPerformance());
      });
    }
  }, []);

  // Set up cache event listeners
  useEffect(() => {
    // Listen to all cache events
    cache.on('cache-event', handleCacheEvent);

    return () => {
      cache.off('cache-event');
    };
  }, [handleCacheEvent]);

  // Set user ID in data service when user changes
  useEffect(() => {
    if (user?.id) {
      dataService.setUserId(user.id);
      setIsInitialized(true);
    } else {
      setIsInitialized(false);
    }
  }, [user?.id]);

  // Periodic stats refresh - disabled to prevent infinite loops
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setStats(cache.getStats());
  //     setPerformance(cache.getPerformance());
  //   }, 5000); // Refresh every 5 seconds

  //   return () => clearInterval(interval);
  // }, []);

  const clearCache = useCallback(async () => {
    await dataService.clearCache();
    setStats(cache.getStats());
    setPerformance(cache.getPerformance());
  }, []);

  const optimizeCache = useCallback(() => {
    dataService.optimizeCache();
    setStats(cache.getStats());
    setPerformance(cache.getPerformance());
  }, []);

  const refreshStats = useCallback(() => {
    setStats(cache.getStats());
    setPerformance(cache.getPerformance());
  }, []);

  const value: CacheContextType = useMemo(() => ({
    stats,
    performance,
    clearCache,
    optimizeCache,
    refreshStats,
    isInitialized
  }), [stats, performance, clearCache, optimizeCache, refreshStats, isInitialized]);

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
}

export function useCache() {
  const context = useContext(CacheContext);
  if (context === undefined) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
} 