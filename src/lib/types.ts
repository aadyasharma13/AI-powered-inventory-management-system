// Types and enums for dashboard components (shadcn + recharts)

export interface PosFormData {
  product_id: string;
  product_name: string;
  timestamp: string;
  quantity_sold: string;
  stock_level: string;
  price: string;
  expiry_date: string;
  weather: WeatherType;
}

export type WeatherType = 'Clear' | 'Rain' | 'Cloudy' | 'Sunny' | 'Storm' | 'Snow';

export type ModelType = 'Random Forest' | 'Previous Day Sales';

export interface DemandResult {
  predicted: number;
}

export interface AlertResult {
  alert: string;
}

export interface AlertProduct {
  id: string;
  product_id: string;
  product_name: string;
  stock_level: number;
  expiry_date: string;
  alertType: string;
}

export interface AnalyticsData {
  totalSales: number;
  totalProducts: number;
  mostSoldProduct: string;
  mostStockProduct: string;
  expiringSoon: number;
  weatherStats: Record<WeatherType, number>;
  salesByWeek: { week: string; sales: number }[];
  salesByMonth: { month: string; sales: number }[];
  salesByYear: { year: string; sales: number }[];
  productSales: { product: string; sales: number }[];
  productStock: { product: string; stock: number }[];
} 