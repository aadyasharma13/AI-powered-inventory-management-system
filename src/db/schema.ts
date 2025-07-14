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



export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type DataPoint = typeof dataPoints.$inferSelect;
export type NewDataPoint = typeof dataPoints.$inferInsert;
export type DemandPrediction = typeof demandPredictions.$inferSelect;
export type NewDemandPrediction = typeof demandPredictions.$inferInsert;
export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;