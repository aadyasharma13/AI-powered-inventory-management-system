'use client'

import { 
  CacheEntry, 
  CacheOptions, 
  CacheKey, 
  CacheResult, 
  CacheStats, 
  CacheConfig,
  CacheEvent,
  CacheError,
  CachePerformance
} from './types';

class IndexedDBCache {
  private dbName = 'SupabaseCache';
  private version = 1;
  private db: IDBDatabase | null = null;
  private config: CacheConfig;
  private stats: CacheStats;
  private performance: CachePerformance;
  private eventListeners: Map<string, (event: CacheEvent) => void>;
  private cleanupInterval: NodeJS.Timeout | null;
  private isInitialized = false;

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000,
      cleanupInterval: 60 * 1000, // 1 minute
      enableLogging: process.env.NODE_ENV === 'development',
      enableMetrics: true,
      ...config
    };

    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      lastCleanup: Date.now()
    };

    this.performance = {
      averageResponseTime: 0,
      hitRate: 0,
      memoryUsage: 0,
      lastOptimization: Date.now()
    };

    this.eventListeners = new Map();
    this.cleanupInterval = null;

    this.initDatabase();
  }

  /**
   * Initialize IndexedDB database
   */
  private async initDatabase(): Promise<void> {
    if (typeof window === 'undefined') return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        this.log('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        this.startCleanupInterval();
        this.loadStats();
        this.log('IndexedDB cache initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
          cacheStore.createIndex('table', 'table', { unique: false });
        }

        if (!db.objectStoreNames.contains('stats')) {
          db.createObjectStore('stats', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('performance')) {
          db.createObjectStore('performance', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Wait for database initialization
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initDatabase();
    }
  }

  /**
   * Generate a cache key from table, operation, and filters
   */
  private generateKey(cacheKey: CacheKey): string {
    const { table, operation, filters, userId, customKey } = cacheKey;
    
    if (customKey) {
      return `custom:${customKey}`;
    }

    const filterString = filters ? JSON.stringify(filters) : '';
    const userString = userId ? `:user:${userId}` : '';
    
    return `${table}:${operation}${userString}:${filterString}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Save stats to IndexedDB
   */
  private async saveStats(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['stats'], 'readwrite');
    const store = transaction.objectStore('stats');
    
    await store.put({
      id: 'current',
      ...this.stats,
      timestamp: Date.now()
    });
  }

  /**
   * Load stats from IndexedDB
   */
  private async loadStats(): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['stats'], 'readonly');
      const store = transaction.objectStore('stats');
      const request = store.get('current');

      request.onsuccess = () => {
        if (request.result) {
          this.stats = { ...this.stats, ...request.result };
        }
      };
    } catch (error) {
      this.log('Error loading stats:', error);
    }
  }

  /**
   * Save performance metrics to IndexedDB
   */
  private async savePerformance(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['performance'], 'readwrite');
    const store = transaction.objectStore('performance');
    
    await store.put({
      id: 'current',
      ...this.performance,
      timestamp: Date.now()
    });
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Clean up expired entries and maintain cache size
   */
  private async cleanup(): Promise<void> {
    if (!this.db) return;

    const startTime = Date.now();
    let expiredCount = 0;
    let sizeReduction = 0;

    try {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const timestampIndex = store.index('timestamp');

      // Remove expired entries
      const expiredRequest = timestampIndex.openCursor();
      
      expiredRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const entry = cursor.value;
          if (this.isExpired(entry)) {
            cursor.delete();
            expiredCount++;
          }
          cursor.continue();
        } else {
          // Check cache size after removing expired entries
          this.checkCacheSize();
        }
      };

      this.stats.lastCleanup = Date.now();
      this.saveStats();

      if (this.config.enableLogging && expiredCount > 0) {
        this.log(`Cache cleanup: ${expiredCount} expired entries removed`);
      }
    } catch (error) {
      this.log('Error during cleanup:', error);
    }
  }

  /**
   * Check and maintain cache size
   */
  private async checkCacheSize(): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        const currentSize = countRequest.result;
        this.stats.size = currentSize;

        if (currentSize > this.config.maxSize) {
          // Remove oldest entries
          const timestampIndex = store.index('timestamp');
          const cursorRequest = timestampIndex.openCursor();
          let removedCount = 0;

          cursorRequest.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor && removedCount < (currentSize - this.config.maxSize)) {
              cursor.delete();
              removedCount++;
              cursor.continue();
            }
          };
        }
      };
    } catch (error) {
      this.log('Error checking cache size:', error);
    }
  }

  /**
   * Log cache operations
   */
  private log(message: string, ...args: unknown[]): void {
    if (this.config.enableLogging) {
      console.log(`[IndexedDBCache] ${message}`, ...args);
    }
  }

  /**
   * Emit cache events
   */
  private emitEvent(event: CacheEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        this.log('Error in event listener:', error);
      }
    });
  }

  /**
   * Get cached data
   */
  async get<T>(cacheKey: CacheKey, options?: CacheOptions): Promise<CacheResult<T> | null> {
    await this.ensureInitialized();
    
    const startTime = Date.now();
    const key = this.generateKey(cacheKey);
    
    // Force refresh if requested
    if (options?.forceRefresh) {
      this.log(`Force refresh requested for key: ${key}`);
      return null;
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onerror = () => {
        this.stats.misses++;
        this.emitEvent({ type: 'miss', key, timestamp: Date.now() });
        this.log(`Cache miss for key: ${key}`);
        resolve(null);
      };

      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined;

        if (!entry) {
          this.stats.misses++;
          this.emitEvent({ type: 'miss', key, timestamp: Date.now() });
          this.log(`Cache miss for key: ${key}`);
          resolve(null);
          return;
        }

        if (this.isExpired(entry)) {
          // Remove expired entry
          const deleteTransaction = this.db!.transaction(['cache'], 'readwrite');
          const deleteStore = deleteTransaction.objectStore('cache');
          deleteStore.delete(key);
          
          this.stats.misses++;
          this.emitEvent({ type: 'miss', key, timestamp: Date.now() });
          this.log(`Cache expired for key: ${key}`);
          resolve(null);
          return;
        }

        this.stats.hits++;
        this.emitEvent({ type: 'hit', key, timestamp: Date.now() });
        
        const responseTime = Date.now() - startTime;
        this.updatePerformance(responseTime);

        this.log(`Cache hit for key: ${key} (${responseTime}ms)`);
        
        resolve({
          data: entry.data,
          fromCache: true,
          timestamp: entry.timestamp
        });
      };
    });
  }

  /**
   * Set cached data
   */
  async set<T>(cacheKey: CacheKey, data: T, options?: CacheOptions): Promise<void> {
    await this.ensureInitialized();
    
    const key = this.generateKey(cacheKey);
    const ttl = options?.ttl || this.config.defaultTTL;
    const version = options?.version || '1.0';

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version
    };

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put({
        key,
        table: cacheKey.table,
        ...entry
      });

      request.onerror = () => {
        this.log('Error setting cache:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.emitEvent({ type: 'set', key, timestamp: Date.now() });
        this.log(`Cache set for key: ${key}`);
        this.checkCacheSize();
        resolve();
      };
    });
  }

  /**
   * Delete cached data
   */
  async delete(cacheKey: CacheKey): Promise<void> {
    await this.ensureInitialized();
    
    const key = this.generateKey(cacheKey);

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.delete(key);

      request.onerror = () => {
        this.log('Error deleting cache:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.emitEvent({ type: 'delete', key, timestamp: Date.now() });
        this.log(`Cache deleted for key: ${key}`);
        this.checkCacheSize();
        resolve();
      };
    });
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidate(pattern: string): Promise<number> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const tableIndex = store.index('table');
      const request = tableIndex.openCursor();

      let deletedCount = 0;

      request.onerror = () => {
        this.log('Error invalidating cache:', request.error);
        reject(request.error);
      };

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const entry = cursor.value;
          if (entry.key.includes(pattern)) {
            cursor.delete();
            deletedCount++;
          }
          cursor.continue();
        } else {
          if (deletedCount > 0) {
            this.log(`Invalidated ${deletedCount} cache entries for pattern: ${pattern}`);
            this.checkCacheSize();
          }
          resolve(deletedCount);
        }
      };
    });
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.clear();

      request.onerror = () => {
        this.log('Error clearing cache:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.stats.size = 0;
        this.emitEvent({ type: 'clear', key: 'all', timestamp: Date.now() });
        this.log('Cache cleared');
        this.saveStats();
        resolve();
      };
    });
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get performance metrics
   */
  getPerformance(): CachePerformance {
    return { ...this.performance };
  }

  /**
   * Update performance metrics
   */
  private updatePerformance(responseTime: number): void {
    const { averageResponseTime } = this.performance;
    const totalRequests = this.stats.hits + this.stats.misses;
    
    this.performance.averageResponseTime = 
      (averageResponseTime * (totalRequests - 1) + responseTime) / totalRequests;
    
    this.performance.hitRate = this.stats.hits / totalRequests;
    this.performance.memoryUsage = this.stats.size;
    this.performance.lastOptimization = Date.now();

    this.savePerformance();
  }

  /**
   * Add event listener
   */
  on(event: string, listener: (event: CacheEvent) => void): void {
    this.eventListeners.set(event, listener);
  }

  /**
   * Remove event listener
   */
  off(event: string): void {
    this.eventListeners.delete(event);
  }

  /**
   * Get cache size
   */
  getSize(): number {
    return this.stats.size;
  }

  /**
   * Check if cache has key
   */
  async has(cacheKey: CacheKey): Promise<boolean> {
    const result = await this.get(cacheKey);
    return result !== null;
  }

  /**
   * Get all cache keys
   */
  async getKeys(): Promise<string[]> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.getAllKeys();

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result as string[]);
      };
    });
  }

  /**
   * Optimize cache performance
   */
  async optimize(): Promise<void> {
    await this.cleanup();
    this.performance.lastOptimization = Date.now();
    this.savePerformance();
    this.log('Cache optimization completed');
  }

  /**
   * Destroy cache instance
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.eventListeners.clear();
    this.log('Cache instance destroyed');
  }
}

// Create singleton instance
const cacheInstance = new IndexedDBCache();

export default cacheInstance;
export { IndexedDBCache }; 