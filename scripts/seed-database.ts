import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { 
  products, 
  dataPoints, 
  sales, 
  inventorySnapshots, 
  weatherSnapshots, 
  demandPredictions, 
  alerts, 
  pricingStrategies, 
  suppliers, 
  purchaseOrders,
  profiles 
} from '../src/db/schema';

// Load environment variables
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/inventory_db';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    // Read CSV data
    const csvPath = path.join(process.cwd(), 'public', 'dataset.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvData.split('\n').slice(1); // Skip header

    console.log(`📊 Processing ${lines.length} data points...`);

    // Extract unique products from CSV
    const productMap = new Map();
    const uniqueProducts = new Set<string>();

    lines.forEach(line => {
      if (line.trim()) {
        const [timestamp, productId, productName, quantitySold, stockLevel, price, expiryDate, weather] = line.split(',');
        uniqueProducts.add(`${productId},${productName}`);
      }
    });

    // Insert products
    console.log('📦 Inserting products...');
    const productInserts = Array.from(uniqueProducts).map((product: string) => {
      const [id, name] = product.split(',');
      return {
        id: id.trim(),
        name: name.trim(),
        category: getCategory(name.trim()),
        unit: getUnit(name.trim()),
        shelf_life_days: getShelfLife(name.trim())
      };
    });

    await db.insert(products).values(productInserts);
    console.log(`✅ Inserted ${productInserts.length} products`);

    // Insert data points
    console.log('📈 Inserting data points...');
    const dataPointInserts = lines.slice(0, 1000).map(line => {
      if (line.trim()) {
        const [timestamp, productId, productName, quantitySold, stockLevel, price, expiryDate, weather] = line.split(',');
        return {
          product_id: productId.trim(),
          product_name: productName.trim(),
          timestamp: new Date(timestamp.trim()),
          quantity_sold: parseInt(quantitySold.trim()),
          stock_level: parseInt(stockLevel.trim()),
          price: price.trim(),
          expiry_date: expiryDate.trim(),
          weather: weather.trim()
        };
      }
      return null;
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    await db.insert(dataPoints).values(dataPointInserts);
    console.log(`✅ Inserted ${dataPointInserts.length} data points`);

    // Insert sales data
    console.log('💰 Inserting sales data...');
    const salesInserts = lines.slice(0, 500).map(line => {
      if (line.trim()) {
        const [timestamp, productId, productName, quantitySold, stockLevel, price, expiryDate, weather] = line.split(',');
        return {
          product_id: productId.trim(),
          quantity_sold: parseInt(quantitySold.trim()),
          sale_time: new Date(timestamp.trim()),
          price: price.trim(),
          channel: getRandomChannel()
        };
      }
      return null;
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    await db.insert(sales).values(salesInserts);
    console.log(`✅ Inserted ${salesInserts.length} sales records`);

    // Insert inventory snapshots
    console.log('📦 Inserting inventory snapshots...');
    const inventoryInserts = lines.slice(0, 200).map(line => {
      if (line.trim()) {
        const [timestamp, productId, productName, quantitySold, stockLevel, price, expiryDate, weather] = line.split(',');
        return {
          product_id: productId.trim(),
          stock_level: parseInt(stockLevel.trim()),
          freshness_score: (Math.random() * 10).toFixed(2),
          expiry_date: expiryDate.trim(),
          recorded_at: new Date(timestamp.trim())
        };
      }
      return null;
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    await db.insert(inventorySnapshots).values(inventoryInserts);
    console.log(`✅ Inserted ${inventoryInserts.length} inventory snapshots`);

    // Insert weather snapshots
    console.log('🌤️ Inserting weather data...');
    const weatherInserts = lines.slice(0, 100).map(line => {
      if (line.trim()) {
        const [timestamp, productId, productName, quantitySold, stockLevel, price, expiryDate, weather] = line.split(',');
        return {
          location: getRandomLocation(),
          temperature: (20 + Math.random() * 30).toFixed(2),
          humidity: (30 + Math.random() * 50).toFixed(2),
          condition: weather.trim(),
          recorded_at: new Date(timestamp.trim())
        };
      }
      return null;
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    await db.insert(weatherSnapshots).values(weatherInserts);
    console.log(`✅ Inserted ${weatherInserts.length} weather snapshots`);

    // Insert demand predictions
    console.log('🔮 Inserting demand predictions...');
    const demandInserts = productInserts.slice(0, 20).map(product => ({
      product_id: product.id,
      forecast_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      predicted_demand: Math.floor(Math.random() * 100) + 10,
      confidence: (0.7 + Math.random() * 0.3).toFixed(2),
      model_version: 'v2.1.3',
      generated_at: new Date()
    }));

    await db.insert(demandPredictions).values(demandInserts);
    console.log(`✅ Inserted ${demandInserts.length} demand predictions`);

    // Insert alerts
    console.log('🚨 Inserting alerts...');
    const alertTypes = ['low_stock', 'near_expiry', 'overstock', 'demand_spike'];
    const severities = ['info', 'warning', 'critical'];
    
    const alertInserts = productInserts.slice(0, 15).map(product => ({
      product_id: product.id,
      alert_type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      message: `Alert for ${product.name}: ${alertTypes[Math.floor(Math.random() * alertTypes.length)]}`,
      severity: severities[Math.floor(Math.random() * severities.length)],
      triggered_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      resolved: Math.random() > 0.5
    }));

    await db.insert(alerts).values(alertInserts);
    console.log(`✅ Inserted ${alertInserts.length} alerts`);

    // Insert pricing strategies
    console.log('💲 Inserting pricing strategies...');
    const pricingInserts = productInserts.slice(0, 10).map(product => {
      const basePrice = 50 + Math.random() * 200;
      const discount = Math.random() * 0.3;
      return {
        product_id: product.id,
        effective_from: new Date(),
        base_price: basePrice.toFixed(2),
        discount_percentage: discount.toFixed(2),
        final_price: (basePrice * (1 - discount)).toFixed(2),
        trigger_reason: 'demand_optimization'
      };
    });

    await db.insert(pricingStrategies).values(pricingInserts);
    console.log(`✅ Inserted ${pricingInserts.length} pricing strategies`);

    // Insert suppliers
    console.log('🏭 Inserting suppliers...');
    const supplierNames = [
      'Fresh Foods Co.', 'Quality Meats Ltd.', 'Dairy Delights', 'Organic Produce Inc.',
      'Bakery Supplies Co.', 'Beverage Distributors', 'Spice Traders Ltd.', 'Frozen Foods Corp.'
    ];

    const supplierInserts = supplierNames.map((name, index) => ({
      name,
      contact_email: `contact@${name.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      contact_phone: `+1-555-${String(index + 100).padStart(3, '0')}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      preferred_products: getPreferredProducts(index)
    }));

    const insertedSuppliers = await db.insert(suppliers).values(supplierInserts).returning();
    console.log(`✅ Inserted ${insertedSuppliers.length} suppliers`);

    // Insert purchase orders
    console.log('📋 Inserting purchase orders...');
    const orderStatuses = ['pending', 'shipped', 'received'];
    const purchaseOrderInserts = productInserts.slice(0, 8).map(product => ({
      product_id: product.id,
      supplier_id: insertedSuppliers[Math.floor(Math.random() * insertedSuppliers.length)].id,
      order_quantity: Math.floor(Math.random() * 100) + 50,
      order_status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
      ordered_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      expected_delivery: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000),
      auto_generated: Math.random() > 0.3
    }));

    await db.insert(purchaseOrders).values(purchaseOrderInserts);
    console.log(`✅ Inserted ${purchaseOrderInserts.length} purchase orders`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Products: ${productInserts.length}`);
    console.log(`   - Data Points: ${dataPointInserts.length}`);
    console.log(`   - Sales: ${salesInserts.length}`);
    console.log(`   - Inventory Snapshots: ${inventoryInserts.length}`);
    console.log(`   - Weather Data: ${weatherInserts.length}`);
    console.log(`   - Demand Predictions: ${demandInserts.length}`);
    console.log(`   - Alerts: ${alertInserts.length}`);
    console.log(`   - Pricing Strategies: ${pricingInserts.length}`);
    console.log(`   - Suppliers: ${insertedSuppliers.length}`);
    console.log(`   - Purchase Orders: ${purchaseOrderInserts.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Helper functions
function getCategory(productName: string): string {
  const categories = {
    'Milk': 'Dairy',
    'Bread': 'Bakery',
    'Eggs': 'Dairy',
    'Chicken': 'Meat',
    'Fish': 'Seafood',
    'Rice': 'Grains',
    'Dal': 'Pulses',
    'Onions': 'Vegetables',
    'Tomatoes': 'Vegetables',
    'Potatoes': 'Vegetables',
    'Bananas': 'Fruits',
    'Apples': 'Fruits',
    'Mango': 'Fruits',
    'Watermelon': 'Fruits',
    'Cream': 'Dairy',
    'Butter': 'Dairy',
    'Oil': 'Cooking',
    'Sugar': 'Pantry',
    'Tea': 'Beverages',
    'Coke': 'Beverages',
    'Soda': 'Beverages',
    'Lassi': 'Beverages',
    'Biscuits': 'Snacks',
    'Chips': 'Snacks',
    'Samosa': 'Snacks',
    'Vada': 'Snacks',
    'Pav': 'Bakery',
    'Bread Roll': 'Bakery',
    'Coriander': 'Spices',
    'Jeera': 'Spices',
    'Turmeric': 'Spices',
    'Chutney': 'Condiments',
    'Pickle': 'Condiments',
    'Tomato Puree': 'Canned',
    'Peas': 'Vegetables',
    'Carrot': 'Vegetables',
    'Cucumber': 'Vegetables',
    'Cabbage': 'Vegetables',
    'Spinach': 'Vegetables',
    'Green Tea': 'Beverages',
    'Ice Cream': 'Dairy',
    'Gulab Jamun': 'Desserts',
    'Rasgulla': 'Desserts',
    'Chikki': 'Snacks',
    'Farsan': 'Snacks',
    'Dates': 'Fruits'
  };
  return categories[productName as keyof typeof categories] || 'Other';
}

function getUnit(productName: string): string {
  const units = {
    'Milk': 'L',
    'Bread': 'pack',
    'Eggs': 'dozen',
    'Chicken': 'kg',
    'Fish': 'kg',
    'Rice': 'kg',
    'Dal': 'kg',
    'Onions': 'kg',
    'Tomatoes': 'kg',
    'Potatoes': 'kg',
    'Bananas': 'dozen',
    'Apples': 'kg',
    'Mango': 'kg',
    'Watermelon': 'piece',
    'Cream': 'ml',
    'Butter': 'pack',
    'Oil': 'L',
    'Sugar': 'kg',
    'Tea': 'pack',
    'Coke': 'bottle',
    'Soda': 'can',
    'Lassi': 'bottle',
    'Biscuits': 'pack',
    'Chips': 'pack',
    'Samosa': 'piece',
    'Vada': 'piece',
    'Pav': 'pack',
    'Bread Roll': 'piece',
    'Coriander': 'bunch',
    'Jeera': 'pack',
    'Turmeric': 'pack',
    'Chutney': 'bottle',
    'Pickle': 'bottle',
    'Tomato Puree': 'can',
    'Peas': 'kg',
    'Carrot': 'kg',
    'Cucumber': 'kg',
    'Cabbage': 'kg',
    'Spinach': 'bunch',
    'Green Tea': 'pack',
    'Ice Cream': 'tub',
    'Gulab Jamun': 'pack',
    'Rasgulla': 'pack',
    'Chikki': 'pack',
    'Farsan': 'pack',
    'Dates': 'kg'
  };
  return units[productName as keyof typeof units] || 'unit';
}

function getShelfLife(productName: string): number {
  const shelfLife = {
    'Milk': 7,
    'Bread': 7,
    'Eggs': 21,
    'Chicken': 3,
    'Fish': 2,
    'Rice': 365,
    'Dal': 365,
    'Onions': 30,
    'Tomatoes': 7,
    'Potatoes': 30,
    'Bananas': 7,
    'Apples': 30,
    'Mango': 7,
    'Watermelon': 14,
    'Cream': 14,
    'Butter': 30,
    'Oil': 365,
    'Sugar': 730,
    'Tea': 365,
    'Coke': 365,
    'Soda': 365,
    'Lassi': 7,
    'Biscuits': 90,
    'Chips': 180,
    'Samosa': 3,
    'Vada': 2,
    'Pav': 3,
    'Bread Roll': 3,
    'Coriander': 7,
    'Jeera': 365,
    'Turmeric': 365,
    'Chutney': 90,
    'Pickle': 365,
    'Tomato Puree': 365,
    'Peas': 7,
    'Carrot': 14,
    'Cucumber': 7,
    'Cabbage': 14,
    'Spinach': 5,
    'Green Tea': 365,
    'Ice Cream': 90,
    'Gulab Jamun': 7,
    'Rasgulla': 7,
    'Chikki': 90,
    'Farsan': 60,
    'Dates': 180
  };
  return shelfLife[productName as keyof typeof shelfLife] || 30;
}

function getRandomChannel(): string {
  const channels = ['store', 'online', 'mobile', 'delivery'];
  return channels[Math.floor(Math.random() * channels.length)];
}

function getRandomLocation(): string {
  const locations = ['Austin, TX', 'Dallas, TX', 'Houston, TX', 'San Antonio, TX', 'Fort Worth, TX'];
  return locations[Math.floor(Math.random() * locations.length)];
}

function getPreferredProducts(supplierIndex: number): string {
  const productCategories = [
    'Dairy products, Fresh produce',
    'Meat products, Seafood',
    'Bakery items, Dairy',
    'Organic vegetables, Fruits',
    'Grains, Pulses, Spices',
    'Beverages, Snacks',
    'Canned goods, Condiments',
    'Frozen foods, Desserts'
  ];
  return productCategories[supplierIndex] || 'General supplies';
}

// Run the seeding
seedDatabase().catch(console.error); 