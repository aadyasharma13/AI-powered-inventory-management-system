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
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_points" ADD CONSTRAINT "data_points_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_predictions" ADD CONSTRAINT "demand_predictions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;