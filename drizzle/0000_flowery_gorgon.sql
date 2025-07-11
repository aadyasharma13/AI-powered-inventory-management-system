CREATE TABLE "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar(50),
	"alert_type" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"severity" varchar(20) DEFAULT 'info',
	"triggered_at" timestamp NOT NULL,
	"resolved" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "data_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar(50) NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"quantity_sold" integer NOT NULL,
	"stock_level" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"expiry_date" date NOT NULL,
	"weather" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demand_predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar(50) NOT NULL,
	"forecast_date" date NOT NULL,
	"predicted_demand" integer NOT NULL,
	"confidence" numeric(4, 2),
	"model_version" varchar(20),
	"generated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar(50) NOT NULL,
	"stock_level" integer NOT NULL,
	"freshness_score" numeric(4, 2),
	"expiry_date" date NOT NULL,
	"recorded_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_strategies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar(50),
	"effective_from" timestamp NOT NULL,
	"base_price" numeric(10, 2) NOT NULL,
	"discount_percentage" numeric(4, 2),
	"final_price" numeric(10, 2) NOT NULL,
	"trigger_reason" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(100),
	"unit" varchar(20),
	"shelf_life_days" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar(50) NOT NULL,
	"supplier_id" uuid,
	"order_quantity" integer NOT NULL,
	"order_status" varchar(50) DEFAULT 'pending',
	"ordered_at" timestamp NOT NULL,
	"expected_delivery" timestamp,
	"auto_generated" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar(50) NOT NULL,
	"quantity_sold" integer NOT NULL,
	"sale_time" timestamp NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"channel" varchar(50) DEFAULT 'store'
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"contact_email" varchar(255),
	"contact_phone" varchar(20),
	"preferred_products" text
);
--> statement-breakpoint
CREATE TABLE "weather_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location" varchar(100),
	"temperature" numeric(5, 2),
	"humidity" numeric(5, 2),
	"condition" varchar(50),
	"recorded_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_points" ADD CONSTRAINT "data_points_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_predictions" ADD CONSTRAINT "demand_predictions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_snapshots" ADD CONSTRAINT "inventory_snapshots_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_strategies" ADD CONSTRAINT "pricing_strategies_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;