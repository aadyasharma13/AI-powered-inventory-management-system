'use client'

import { supabaseClient } from './auth-client';
import cache from './cache';
import { 
  CacheKey, 
  CacheOptions, 
  QueryFilters, 
  QueryOptions, 
  MutationOptions,
  Product,
  DataPoint,
  Sale,
  InventorySnapshot,
  Alert,
  DemandPrediction,
  PricingStrategy,
  Supplier,
  PurchaseOrder,
  WeatherSnapshot,
  Profile
} from './types';

class DataService {
  private userId?: string;

  constructor() {
    // Set up real-time subscriptions for cache invalidation
    this.setupRealtimeSubscriptions();
  }

  /**
   * Set current user ID for cache key generation
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Get current user ID
   */
  getUserId(): string | undefined {
    return this.userId;
  }

  /**
   * Setup real-time subscriptions for automatic cache invalidation
   */
  private setupRealtimeSubscriptions(): void {
    const tables = [
      'products', 'data_points', 'sales', 'inventory_snapshots',
      'alerts', 'demand_predictions', 'pricing_strategies',
      'suppliers', 'purchase_orders', 'weather_snapshots', 'profiles'
    ];

    tables.forEach(table => {
      supabaseClient
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table
          },
          (payload) => {
            this.handleRealtimeChange(table, payload);
          }
        )
        .subscribe();
    });
  }

  /**
   * Handle real-time changes and invalidate relevant cache
   */
  private async handleRealtimeChange(table: string, payload: unknown): Promise<void> {
    try {
      // Invalidate all cache entries for this table
      await cache.invalidate(table);
      
      // Log the change
      console.log(`[DataService] Cache invalidated for table: ${table}`, payload);
    } catch (error) {
      console.error(`[DataService] Error invalidating cache for table ${table}:`, error);
    }
  }

  /**
   * Generic query method with caching
   */
  async query<T>(
    table: string,
    filters?: QueryFilters,
    options?: QueryOptions & CacheOptions
  ): Promise<T[]> {
    const cacheKey: CacheKey = {
      table,
      operation: 'select',
      filters,
      userId: this.userId
    };

    // Try to get from cache first
    const cached = await cache.get<T[]>(cacheKey, options);
    if (cached) {
      return cached.data;
    }

    // Build query
    let query = supabaseClient.from(table).select('*');

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    // Apply options
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 100) - 1);
    }
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.direction === 'asc' 
      });
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      throw new Error(`Query failed: ${error.message}`);
    }

    // Cache the result
    await cache.set(cacheKey, data || [], options);

    return data || [];
  }

  /**
   * Get single record by ID
   */
  async getById<T>(table: string, id: string, options?: CacheOptions): Promise<T | null> {
    const cacheKey: CacheKey = {
      table,
      operation: 'select',
      filters: { id },
      userId: this.userId
    };

    // Try cache first
    const cached = await cache.get<T>(cacheKey, options);
    if (cached) {
      return cached.data;
    }

    // Fetch from database
    const { data, error } = await supabaseClient
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Get by ID failed: ${error.message}`);
    }

    // Cache the result
    await cache.set(cacheKey, data, options);

    return data;
  }

  /**
   * Insert new record
   */
  async insert<T>(table: string, data: Partial<T>, options?: MutationOptions): Promise<T> {
    const { data: result, error } = await supabaseClient
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Insert failed: ${error.message}`);
    }

    // Invalidate cache for this table
    if (options?.invalidateCache !== false) {
      try {
        await cache.invalidate(table);
      } catch (error) {
        console.error(`[DataService] Error invalidating cache for table ${table}:`, error);
      }
    }

    return result;
  }

  /**
   * Update record
   */
  async update<T>(table: string, id: string, data: Partial<T>, options?: MutationOptions): Promise<T> {
    const { data: result, error } = await supabaseClient
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Update failed: ${error.message}`);
    }

    // Invalidate cache for this table
    if (options?.invalidateCache !== false) {
      try {
        await cache.invalidate(table);
      } catch (error) {
        console.error(`[DataService] Error invalidating cache for table ${table}:`, error);
      }
    }

    return result;
  }

  /**
   * Delete record
   */
  async delete(table: string, id: string, options?: MutationOptions): Promise<void> {
    const { error } = await supabaseClient
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }

    // Invalidate cache for this table
    if (options?.invalidateCache !== false) {
      try {
        await cache.invalidate(table);
      } catch (error) {
        console.error(`[DataService] Error invalidating cache for table ${table}:`, error);
      }
    }
  }

  /**
   * Upsert record (insert or update)
   */
  async upsert<T>(table: string, data: Partial<T>, options?: MutationOptions): Promise<T> {
    const { data: result, error } = await supabaseClient
      .from(table)
      .upsert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Upsert failed: ${error.message}`);
    }

    // Invalidate cache for this table
    if (options?.invalidateCache !== false) {
      try {
        await cache.invalidate(table);
      } catch (error) {
        console.error(`[DataService] Error invalidating cache for table ${table}:`, error);
      }
    }

    return result;
  }

  // Product-specific methods
  async getProducts(filters?: QueryFilters, options?: QueryOptions & CacheOptions): Promise<Product[]> {
    return this.query<Product>('products', filters, options);
  }

  async getProduct(id: string, options?: CacheOptions): Promise<Product | null> {
    return this.getById<Product>('products', id, options);
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    return this.insert<Product>('products', data);
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return this.update<Product>('products', id, data);
  }

  async deleteProduct(id: string): Promise<void> {
    return this.delete('products', id);
  }

  // Data Points methods
  async getDataPoints(filters?: QueryFilters, options?: QueryOptions & CacheOptions): Promise<DataPoint[]> {
    return this.query<DataPoint>('data_points', filters, options);
  }

  async getDataPoint(id: string, options?: CacheOptions): Promise<DataPoint | null> {
    return this.getById<DataPoint>('data_points', id, options);
  }

  async createDataPoint(data: Partial<DataPoint>): Promise<DataPoint> {
    return this.insert<DataPoint>('data_points', data);
  }

  // Sales methods
  async getSales(filters?: QueryFilters, options?: QueryOptions & CacheOptions): Promise<Sale[]> {
    return this.query<Sale>('sales', filters, options);
  }

  async getSale(id: string, options?: CacheOptions): Promise<Sale | null> {
    return this.getById<Sale>('sales', id, options);
  }

  async createSale(data: Partial<Sale>): Promise<Sale> {
    return this.insert<Sale>('sales', data);
  }

  // Inventory Snapshots methods
  async getInventorySnapshots(filters?: QueryFilters, options?: QueryOptions & CacheOptions): Promise<InventorySnapshot[]> {
    return this.query<InventorySnapshot>('inventory_snapshots', filters, options);
  }

  async getInventorySnapshot(id: string, options?: CacheOptions): Promise<InventorySnapshot | null> {
    return this.getById<InventorySnapshot>('inventory_snapshots', id, options);
  }

  async createInventorySnapshot(data: Partial<InventorySnapshot>): Promise<InventorySnapshot> {
    return this.insert<InventorySnapshot>('inventory_snapshots', data);
  }

  // Alerts methods
  async getAlerts(filters?: QueryFilters, options?: QueryOptions & CacheOptions): Promise<Alert[]> {
    return this.query<Alert>('alerts', filters, options);
  }

  async getAlert(id: string, options?: CacheOptions): Promise<Alert | null> {
    return this.getById<Alert>('alerts', id, options);
  }

  async createAlert(data: Partial<Alert>): Promise<Alert> {
    return this.insert<Alert>('alerts', data);
  }

  async updateAlert(id: string, data: Partial<Alert>): Promise<Alert> {
    return this.update<Alert>('alerts', id, data);
  }

  // Demand Predictions methods
  async getDemandPredictions(filters?: QueryFilters, options?: QueryOptions & CacheOptions): Promise<DemandPrediction[]> {
    return this.query<DemandPrediction>('demand_predictions', filters, options);
  }

  async getDemandPrediction(id: string, options?: CacheOptions): Promise<DemandPrediction | null> {
    return this.getById<DemandPrediction>('demand_predictions', id, options);
  }

  async createDemandPrediction(data: Partial<DemandPrediction>): Promise<DemandPrediction> {
    return this.insert<DemandPrediction>('demand_predictions', data);
  }

  // Pricing Strategies methods
  async getPricingStrategies(filters?: QueryFilters, options?: QueryOptions & CacheOptions): Promise<PricingStrategy[]> {
    return this.query<PricingStrategy>('pricing_strategies', filters, options);
  }

  async getPricingStrategy(id: string, options?: CacheOptions): Promise<PricingStrategy | null> {
    return this.getById<PricingStrategy>('pricing_strategies', id, options);
  }

  async createPricingStrategy(data: Partial<PricingStrategy>): Promise<PricingStrategy> {
    return this.insert<PricingStrategy>('pricing_strategies', data);
  }

  // Suppliers methods
  async getSuppliers(filters?: QueryFilters, options?: QueryOptions & CacheOptions): Promise<Supplier[]> {
    return this.query<Supplier>('suppliers', filters, options);
  }

  async getSupplier(id: string, options?: CacheOptions): Promise<Supplier | null> {
    return this.getById<Supplier>('suppliers', id, options);
  }

  async createSupplier(data: Partial<Supplier>): Promise<Supplier> {
    return this.insert<Supplier>('suppliers', data);
  }

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    return this.update<Supplier>('suppliers', id, data);
  }

  async deleteSupplier(id: string): Promise<void> {
    return this.delete('suppliers', id);
  }

  // Purchase Orders methods
  async getPurchaseOrders(filters?: QueryFilters, options?: QueryOptions & CacheOptions): Promise<PurchaseOrder[]> {
    return this.query<PurchaseOrder>('purchase_orders', filters, options);
  }

  async getPurchaseOrder(id: string, options?: CacheOptions): Promise<PurchaseOrder | null> {
    return this.getById<PurchaseOrder>('purchase_orders', id, options);
  }

  async createPurchaseOrder(data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    return this.insert<PurchaseOrder>('purchase_orders', data);
  }

  async updatePurchaseOrder(id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    return this.update<PurchaseOrder>('purchase_orders', id, data);
  }

  // Weather Snapshots methods
  async getWeatherSnapshots(filters?: QueryFilters, options?: QueryOptions & CacheOptions): Promise<WeatherSnapshot[]> {
    return this.query<WeatherSnapshot>('weather_snapshots', filters, options);
  }

  async getWeatherSnapshot(id: string, options?: CacheOptions): Promise<WeatherSnapshot | null> {
    return this.getById<WeatherSnapshot>('weather_snapshots', id, options);
  }

  async createWeatherSnapshot(data: Partial<WeatherSnapshot>): Promise<WeatherSnapshot> {
    return this.insert<WeatherSnapshot>('weather_snapshots', data);
  }

  // Profile methods
  async getProfile(userId: string, options?: CacheOptions): Promise<Profile | null> {
    return this.getById<Profile>('profiles', userId, options);
  }

  async updateProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
    return this.upsert<Profile>('profiles', { id: userId, ...data });
  }

  // Cache management methods
  async clearCache(): Promise<void> {
    await cache.clear();
  }

  async getCacheStats() {
    return cache.getStats();
  }

  async getCachePerformance() {
    return cache.getPerformance();
  }

  async optimizeCache(): Promise<void> {
    cache.optimize();
  }
}

// Create singleton instance
const dataService = new DataService();

export default dataService;
export { DataService }; 