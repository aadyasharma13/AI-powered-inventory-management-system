-- Enable Row Level Security on tables

-- 0. Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- 1. Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view products" ON products
    FOR SELECT USING (true);
CREATE POLICY "Users can insert products" ON products
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update products" ON products
    FOR UPDATE USING (true);
CREATE POLICY "Users can delete products" ON products
    FOR DELETE USING (true);

-- 2. Data Points
ALTER TABLE data_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view data points" ON data_points
    FOR SELECT USING (true);
CREATE POLICY "Users can insert data points" ON data_points
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update data points" ON data_points
    FOR UPDATE USING (true);
CREATE POLICY "Users can delete data points" ON data_points
    FOR DELETE USING (true);

-- 3. Sales
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view sales" ON sales
    FOR SELECT USING (true);
CREATE POLICY "Users can insert sales" ON sales
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update sales" ON sales
    FOR UPDATE USING (true);
CREATE POLICY "Users can delete sales" ON sales
    FOR DELETE USING (true);

-- 4. Inventory Snapshots
ALTER TABLE inventory_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view inventory snapshots" ON inventory_snapshots
    FOR SELECT USING (true);
CREATE POLICY "Users can insert inventory snapshots" ON inventory_snapshots
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update inventory snapshots" ON inventory_snapshots
    FOR UPDATE USING (true);
CREATE POLICY "Users can delete inventory snapshots" ON inventory_snapshots
    FOR DELETE USING (true);

-- 5. Weather Snapshots
ALTER TABLE weather_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view weather snapshots" ON weather_snapshots
    FOR SELECT USING (true);
CREATE POLICY "Users can insert weather snapshots" ON weather_snapshots
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update weather snapshots" ON weather_snapshots
    FOR UPDATE USING (true);
CREATE POLICY "Users can delete weather snapshots" ON weather_snapshots
    FOR DELETE USING (true);

-- 6. Demand Predictions
ALTER TABLE demand_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view demand predictions" ON demand_predictions
    FOR SELECT USING (true);
CREATE POLICY "Users can insert demand predictions" ON demand_predictions
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update demand predictions" ON demand_predictions
    FOR UPDATE USING (true);
CREATE POLICY "Users can delete demand predictions" ON demand_predictions
    FOR DELETE USING (true);

-- 7. Alerts
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view alerts" ON alerts
    FOR SELECT USING (true);
CREATE POLICY "Users can insert alerts" ON alerts
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update alerts" ON alerts
    FOR UPDATE USING (true);
CREATE POLICY "Users can delete alerts" ON alerts
    FOR DELETE USING (true);

-- 8. Pricing Strategies
ALTER TABLE pricing_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view pricing strategies" ON pricing_strategies
    FOR SELECT USING (true);
CREATE POLICY "Users can insert pricing strategies" ON pricing_strategies
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update pricing strategies" ON pricing_strategies
    FOR UPDATE USING (true);
CREATE POLICY "Users can delete pricing strategies" ON pricing_strategies
    FOR DELETE USING (true);

-- 9. Suppliers
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view suppliers" ON suppliers
    FOR SELECT USING (true);
CREATE POLICY "Users can insert suppliers" ON suppliers
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update suppliers" ON suppliers
    FOR UPDATE USING (true);
CREATE POLICY "Users can delete suppliers" ON suppliers
    FOR DELETE USING (true);

-- 10. Purchase Orders
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view purchase orders" ON purchase_orders
    FOR SELECT USING (true);
CREATE POLICY "Users can insert purchase orders" ON purchase_orders
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update purchase orders" ON purchase_orders
    FOR UPDATE USING (true);
CREATE POLICY "Users can delete purchase orders" ON purchase_orders
    FOR DELETE USING (true);

-- 11. Storage Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars bucket
CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own avatar" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    ); 