import { boolean, date, integer, numeric, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // This should be the user's ID from Supabase auth
  name: varchar('name', { length: 255 }).notNull(),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }),
  unit: varchar('unit', { length: 20 }),
  shelf_life_days: integer('shelf_life_days'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const dataPoints = pgTable('data_points', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: varchar('product_id', { length: 50 }).notNull().references(() => products.id),
  product_name: varchar('product_name', { length: 255 }).notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
  quantity_sold: integer('quantity_sold').notNull(),
  stock_level: integer('stock_level').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  expiry_date: date('expiry_date').notNull(),
  weather: varchar('weather', { length: 50 }).notNull(),
});

export const sales = pgTable('sales', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: varchar('product_id', { length: 50 }).notNull().references(() => products.id),
  quantity_sold: integer('quantity_sold').notNull(),
  sale_time: timestamp('sale_time').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  channel: varchar('channel', { length: 50 }).default('store'),
});

export const inventorySnapshots = pgTable('inventory_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: varchar('product_id', { length: 50 }).notNull().references(() => products.id),
  stock_level: integer('stock_level').notNull(),
  freshness_score: numeric('freshness_score', { precision: 4, scale: 2 }),
  expiry_date: date('expiry_date').notNull(),
  recorded_at: timestamp('recorded_at').notNull(),
});

export const weatherSnapshots = pgTable('weather_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  location: varchar('location', { length: 100 }),
  temperature: numeric('temperature', { precision: 5, scale: 2 }),
  humidity: numeric('humidity', { precision: 5, scale: 2 }),
  condition: varchar('condition', { length: 50 }), // e.g., 'Hot', 'Rainy'
  recorded_at: timestamp('recorded_at').notNull(),
});

export const demandPredictions = pgTable('demand_predictions', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: varchar('product_id', { length: 50 }).notNull().references(() => products.id),
  forecast_date: date('forecast_date').notNull(),
  predicted_demand: integer('predicted_demand').notNull(),
  confidence: numeric('confidence', { precision: 4, scale: 2 }),
  model_version: varchar('model_version', { length: 20 }),
  generated_at: timestamp('generated_at').notNull(),
});

export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: varchar('product_id', { length: 50 }).references(() => products.id),
  alert_type: varchar('alert_type', { length: 50 }).notNull(), // low_stock, near_expiry, overstock, demand_spike
  message: text('message').notNull(),
  severity: varchar('severity', { length: 20 }).default('info'), // info, warning, critical
  triggered_at: timestamp('triggered_at').notNull(),
  resolved: boolean('resolved').default(false),
});

export const pricingStrategies = pgTable('pricing_strategies', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: varchar('product_id', { length: 50 }).references(() => products.id),
  effective_from: timestamp('effective_from').notNull(),
  base_price: numeric('base_price', { precision: 10, scale: 2 }).notNull(),
  discount_percentage: numeric('discount_percentage', { precision: 4, scale: 2 }),
  final_price: numeric('final_price', { precision: 10, scale: 2 }).notNull(),
  trigger_reason: varchar('trigger_reason', { length: 100 }),
});

export const suppliers = pgTable('suppliers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  contact_email: varchar('contact_email', { length: 255 }),
  contact_phone: varchar('contact_phone', { length: 20 }),
  preferred_products: text('preferred_products'), // Comma-separated or JSON string
});

export const purchaseOrders = pgTable('purchase_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: varchar('product_id', { length: 50 }).notNull().references(() => products.id),
  supplier_id: uuid('supplier_id').references(() => suppliers.id),
  order_quantity: integer('order_quantity').notNull(),
  order_status: varchar('order_status', { length: 50 }).default('pending'), // pending, shipped, received
  ordered_at: timestamp('ordered_at').notNull(),
  expected_delivery: timestamp('expected_delivery'),
  auto_generated: boolean('auto_generated').default(true),
});


export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type DataPoint = typeof dataPoints.$inferSelect;
export type NewDataPoint = typeof dataPoints.$inferInsert;
export type Sale = typeof sales.$inferSelect;
export type NewSale = typeof sales.$inferInsert;
export type InventorySnapshot = typeof inventorySnapshots.$inferSelect;
export type NewInventorySnapshot = typeof inventorySnapshots.$inferInsert;
export type WeatherSnapshot = typeof weatherSnapshots.$inferSelect;
export type NewWeatherSnapshot = typeof weatherSnapshots.$inferInsert;
export type DemandPrediction = typeof demandPredictions.$inferSelect;
export type NewDemandPrediction = typeof demandPredictions.$inferInsert;
export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;
export type PricingStrategy = typeof pricingStrategies.$inferSelect;
export type NewPricingStrategy = typeof pricingStrategies.$inferInsert;
export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type NewPurchaseOrder = typeof purchaseOrders.$inferInsert;