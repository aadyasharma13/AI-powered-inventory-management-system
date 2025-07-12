// ============================================================================
// CACHE TYPES
// ============================================================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

export interface CacheOptions {
  ttl?: number;
  version?: string;
  forceRefresh?: boolean;
}

export interface CacheKey {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert' | 'custom';
  filters?: Record<string, unknown>;
  userId?: string;
  customKey?: string;
}

export interface CacheResult<T> {
  data: T;
  fromCache: boolean;
  timestamp: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  lastCleanup: number;
}

export interface CacheEvent {
  type: 'hit' | 'miss' | 'set' | 'delete' | 'clear';
  key: string;
  timestamp: number;
  userId?: string;
}

export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  cleanupInterval: number;
  enableLogging: boolean;
  enableMetrics: boolean;
}

export interface CacheError {
  code: string;
  message: string;
  details?: unknown;
}

export interface CachePerformance {
  averageResponseTime: number;
  hitRate: number;
  memoryUsage: number;
  lastOptimization: number;
}

// ============================================================================
// DATABASE ENTITY TYPES
// ============================================================================

export interface Product {
  id: string;
  name: string;
  category?: string;
  unit?: string;
  shelf_life_days?: number;
  created_at: Date;
}

export interface DataPoint {
  id: string;
  product_id: string;
  product_name: string;
  timestamp: Date;
  quantity_sold: number;
  stock_level: number;
  price: number;
  expiry_date: Date;
  weather: string;
}

export interface Sale {
  id: string;
  product_id: string;
  quantity_sold: number;
  sale_time: Date;
  price: number;
  channel: string;
}

export interface InventorySnapshot {
  id: string;
  product_id: string;
  stock_level: number;
  freshness_score?: number;
  expiry_date: Date;
  recorded_at: Date;
}

export interface Alert {
  id: string;
  product_id?: string;
  alert_type: string;
  message: string;
  severity: string;
  triggered_at: Date;
  resolved: boolean;
}

export interface DemandPrediction {
  id: string;
  product_id: string;
  forecast_date: Date;
  predicted_demand: number;
  confidence?: number;
  model_version?: string;
  generated_at: Date;
}

export interface PricingStrategy {
  id: string;
  product_id?: string;
  effective_from: Date;
  base_price: number;
  discount_percentage?: number;
  final_price: number;
  trigger_reason?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_email?: string;
  contact_phone?: string;
  preferred_products?: string;
}

export interface PurchaseOrder {
  id: string;
  product_id: string;
  supplier_id?: string;
  order_quantity: number;
  order_status: string;
  ordered_at: Date;
  expected_delivery?: Date;
  auto_generated: boolean;
}

export interface WeatherSnapshot {
  id: string;
  location?: string;
  temperature?: number;
  humidity?: number;
  condition?: string;
  recorded_at: Date;
}

export interface Profile {
  id: string;
  name: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// QUERY & MUTATION TYPES
// ============================================================================

export interface QueryFilters {
  [key: string]: unknown;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: {
    column: string;
    direction: 'asc' | 'desc';
  };
  select?: string[];
}

export interface MutationOptions {
  invalidateCache?: boolean;
  cacheKey?: string;
  optimisticUpdate?: boolean;
}

// ============================================================================
// REAL-TIME TYPES
// ============================================================================

export interface RealtimeSubscription {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;
  callback: (payload: unknown) => void;
}

// ============================================================================
// DASHBOARD & UI TYPES
// ============================================================================

export interface AgentStatus {
  agent: string;
  status: 'online' | 'offline' | 'error';
  lastUpdate: string;
  dataQuality?: {
    completeness: number;
    accuracy: number;
    timeliness: number;
    overall: number;
  };
  sources?: {
    sales: number;
    weather: number;
    inventory: number;
    iot: number;
  };
  summary?: unknown;
}

export interface BusinessMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  target?: string;
  status: 'good' | 'warning' | 'critical';
}

export interface StoreStatus {
  id: string;
  name: string;
  location: string;
  status: 'operational' | 'warning' | 'critical' | 'offline';
  inventoryAccuracy: number;
  lastUpdate: string;
  alerts: number;
  criticalAlerts: number;
  salesToday: number;
  revenueToday: number;
  stockLevel: number;
  lowStockItems: number;
  expiringItems: number;
  weatherCondition: string;
  temperature: number;
  humidity: number;
  connectivity: 'online' | 'offline';
  lastSync: string;
  performance: {
    orderFillRate: number;
    stockoutRate: number;
    wastePercentage: number;
    customerSatisfaction: number;
  };
}

export interface StoreMetrics {
  totalStores: number;
  operational: number;
  warning: number;
  critical: number;
  offline: number;
  averageInventoryAccuracy: number;
  totalAlerts: number;
  totalRevenue: number;
}

export interface AlertStats {
  total: number;
  critical: number;
  warning: number;
  info: number;
  resolved: number;
  unresolved: number;
  byType: Record<string, number>;
  byStore: Record<string, number>;
}

export interface AnalyticsMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  target?: string;
  status: 'good' | 'warning' | 'critical';
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
}

export interface InventoryData {
  product: string;
  stockLevel: number;
  demand: number;
  turnover: number;
  waste: number;
}

export interface DemandForecast {
  product_id: string;
  product_name: string;
  current_demand: number;
  predicted_demand: number;
  confidence: number;
  forecast_date: string;
  factors: {
    weather: number;
    seasonality: number;
    trends: number;
    events: number;
  };
}

export interface WeatherForecast {
  date: string;
  temperature: number;
  humidity: number;
  condition: string;
  impact_score: number;
  affected_products: string[];
}

export interface SeasonalTrend {
  month: string;
  demand_multiplier: number;
  top_products: string[];
  recommendations: string[];
}

export interface SupplierPerformance {
  onTimeDelivery: number;
  qualityScore: number;
  responseTime: number;
  costCompetitiveness: number;
}

export interface SupplierOrders {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
}

export interface ExtendedSupplier extends Supplier {
  location: string;
  rating: number;
  status: 'active' | 'inactive' | 'suspended';
  preferred_products: string; // Changed from string[] to string to match Supplier interface
  performance: SupplierPerformance;
  orders: SupplierOrders;
  lastOrder: string;
  averageLeadTime: number;
}

export interface ExtendedPurchaseOrder extends PurchaseOrder {
  product_name: string;
  supplier_name: string;
  price: number;
  actual_delivery?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface DataCollectorResponse {
  agent: string;
  status: string;
  lastUpdate: string;
  totalDataPoints: number;
  sources: {
    sales: number;
    inventory: number;
    weather: number;
    iot: number;
  };
  dataQuality: {
    completeness: number;
    accuracy: number;
    timeliness: number;
    overall: number;
  };
  iotData?: {
    temperature_sensors: Array<{
      sensor_id: string;
      location: string;
      temperature: number;
      humidity: number;
      timestamp: string;
    }>;
    rfid_readers: Array<{
      reader_id: string;
      location: string;
      products_scanned: number;
      last_scan: string;
    }>;
  };
}

export interface AlertManagerResponse {
  agent: string;
  status: string;
  lastUpdate: string;
  alerts: Alert[];
  stats: {
    total: number;
    critical: number;
    warning: number;
    info: number;
    resolved: number;
    unresolved: number;
  };
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}

// ============================================================================
// THEME TYPES
// ============================================================================

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
}

export interface ProfileFormData {
  name: string;
  avatar_url?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface SalesAnalyticsData {
  totalRevenue?: number;
  totalOrders?: number;
  revenueGrowth?: number;
  topProducts?: Array<{
    id: string;
    name: string;
    category: string;
    revenue?: number;
  }>;
}

export interface InventoryAnalyticsData {
  totalItems?: number;
  lowStockItems?: number;
  outOfStockItems?: number;
  turnoverRate?: number;
  topProducts?: Array<{
    id: string;
    name: string;
    stockLevel?: number;
    turnover?: number;
  }>;
}

export interface PerformanceAnalyticsData {
  systemUptime?: number;
  responseTime?: number;
  errorRate?: number;
  activeUsers?: number;
  metrics?: Array<{
    name: string;
    value: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
  }>;
}

// ============================================================================
// FORECASTING TYPES
// ============================================================================

export interface DemandForecastData {
  predictedDemand?: number;
  confidenceLevel?: number;
  trendDirection?: 'up' | 'down' | 'stable';
  seasonalFactor?: number;
  forecasts?: Array<{
    date: string;
    demand: number;
    confidence: number;
  }>;
}

export interface WeatherForecastData {
  temperature?: number;
  precipitation?: number;
  windSpeed?: number;
  impactScore?: number;
  forecast?: Array<{
    date: string;
    temperature: number;
    condition: string;
    impact: number;
  }>;
}

export interface SeasonalForecastData {
  springTrend?: number;
  summerTrend?: number;
  fallTrend?: number;
  winterTrend?: number;
  seasonalData?: Array<{
    season: string;
    trend: number;
    topProducts: string[];
  }>;
} 