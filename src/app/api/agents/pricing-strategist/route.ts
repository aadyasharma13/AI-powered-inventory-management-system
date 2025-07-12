import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pricingStrategies, products, sales, inventorySnapshots } from '@/db/schema';
import { eq, desc, gte, and } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/inventory_db';
const client = postgres(connectionString);
const db = drizzle(client);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const active = searchParams.get('active') === 'true';

    let response: any = {
      agent: 'Pricing Strategist',
      status: 'online',
      lastUpdate: new Date().toISOString(),
      summary: {
        totalStrategies: 0,
        activeStrategies: 0,
        totalRevenueImpact: 0,
        averageDiscount: 0
      },
      strategies: [],
      recommendations: []
    };

    // Get pricing strategies
    const strategiesQuery = productId 
      ? await db.select().from(pricingStrategies).where(eq(pricingStrategies.product_id, productId)).orderBy(desc(pricingStrategies.effective_from))
      : await db.select().from(pricingStrategies).orderBy(desc(pricingStrategies.effective_from)).limit(50);

    response.strategies = strategiesQuery;

    // Calculate summary metrics
    response.summary.totalStrategies = strategiesQuery.length;
    response.summary.activeStrategies = strategiesQuery.filter(s => new Date(s.effective_from) <= new Date()).length;
    
    const totalDiscount = strategiesQuery.reduce((sum, s) => sum + (parseFloat(s.discount_percentage || '0')), 0);
    response.summary.averageDiscount = strategiesQuery.length > 0 ? totalDiscount / strategiesQuery.length : 0;

    // Generate pricing recommendations
    if (productId) {
      response.recommendations = await generatePricingRecommendations(productId);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Pricing Strategist API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get pricing strategies', agent: 'Pricing Strategist', status: 'error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, basePrice, discountPercentage, triggerReason, effectiveFrom } = body;

    // Validate product exists
    const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (product.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const finalPrice = basePrice * (1 - (discountPercentage / 100));

    // Create new pricing strategy
    const strategy = await db.insert(pricingStrategies).values({
      product_id: productId,
      effective_from: effectiveFrom ? new Date(effectiveFrom) : new Date(),
      base_price: basePrice.toString(),
      discount_percentage: discountPercentage.toString(),
      final_price: finalPrice.toString(),
      trigger_reason: triggerReason || 'manual_adjustment'
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Pricing strategy created successfully',
      strategy: strategy[0]
    });
  } catch (error) {
    console.error('Pricing Strategy Creation Error:', error);
    return NextResponse.json(
      { error: 'Failed to create pricing strategy' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = 'optimize' } = body;

    if (action === 'optimize') {
      const optimizations = await optimizePricing();
      
      return NextResponse.json({
        success: true,
        message: 'Pricing optimization completed',
        optimizations: optimizations.length,
        strategies: optimizations
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Pricing Optimization Error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize pricing' },
      { status: 500 }
    );
  }
}

async function generatePricingRecommendations(productId: string) {
  const recommendations = [];
  const now = new Date();

  // Get recent sales data
  const recentSales = await db.select().from(sales)
    .where(and(
      eq(sales.product_id, productId),
      gte(sales.sale_time, new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
    ))
    .orderBy(desc(sales.sale_time));

  // Get current inventory
  const currentInventory = await db.select().from(inventorySnapshots)
    .where(eq(inventorySnapshots.product_id, productId))
    .orderBy(desc(inventorySnapshots.recorded_at))
    .limit(1);

  if (recentSales.length > 0 && currentInventory.length > 0) {
    const avgPrice = recentSales.reduce((sum, sale) => sum + parseFloat(sale.price), 0) / recentSales.length;
    const currentStock = currentInventory[0].stock_level;
    const salesVelocity = recentSales.length / 30; // sales per day

    // Low stock - increase price
    if (currentStock < 20 && salesVelocity > 2) {
      recommendations.push({
        type: 'price_increase',
        reason: 'Low stock with high demand',
        suggestedIncrease: 15,
        confidence: 0.85,
        impact: 'positive'
      });
    }

    // High stock - decrease price
    if (currentStock > 100 && salesVelocity < 1) {
      recommendations.push({
        type: 'price_decrease',
        reason: 'High stock with low demand',
        suggestedDecrease: 20,
        confidence: 0.78,
        impact: 'positive'
      });
    }

    // Seasonal pricing
    const month = now.getMonth();
    if (month >= 5 && month <= 8) { // Summer months
      recommendations.push({
        type: 'seasonal_adjustment',
        reason: 'Summer season - increased demand for certain products',
        suggestedAdjustment: 10,
        confidence: 0.72,
        impact: 'informational'
      });
    }

    // Competitor price matching
    recommendations.push({
      type: 'market_analysis',
      reason: 'Market price analysis',
      suggestedAction: 'Monitor competitor prices',
      confidence: 0.68,
      impact: 'informational'
    });
  }

  return recommendations;
}

async function optimizePricing() {
  const optimizations = [];
  const now = new Date();

  // Get all products with recent sales
  const productsWithSales = await db.select().from(products).limit(20);

  for (const product of productsWithSales) {
    const recentSales = await db.select().from(sales)
      .where(and(
        eq(sales.product_id, product.id),
        gte(sales.sale_time, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
      ))
      .orderBy(desc(sales.sale_time));

    const currentInventory = await db.select().from(inventorySnapshots)
      .where(eq(inventorySnapshots.product_id, product.id))
      .orderBy(desc(inventorySnapshots.recorded_at))
      .limit(1);

    if (recentSales.length > 0 && currentInventory.length > 0) {
      const avgPrice = recentSales.reduce((sum, sale) => sum + parseFloat(sale.price), 0) / recentSales.length;
      const currentStock = currentInventory[0].stock_level;
      const salesVelocity = recentSales.length / 7;

      let optimization = null;

      // Expiring soon - aggressive discount
      const daysUntilExpiry = Math.ceil((new Date(currentInventory[0].expiry_date).getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      if (daysUntilExpiry <= 3 && currentStock > 10) {
        optimization = {
          product_id: product.id,
          effective_from: new Date(),
          base_price: avgPrice.toString(),
          discount_percentage: '40',
          final_price: (avgPrice * 0.6).toString(),
          trigger_reason: 'expiry_clearance'
        };
      }
      // Low stock with high demand - price increase
      else if (currentStock < 15 && salesVelocity > 1.5) {
        optimization = {
          product_id: product.id,
          effective_from: new Date(),
          base_price: avgPrice.toString(),
          discount_percentage: '-10',
          final_price: (avgPrice * 1.1).toString(),
          trigger_reason: 'demand_optimization'
        };
      }
      // High stock with low demand - price decrease
      else if (currentStock > 80 && salesVelocity < 0.5) {
        optimization = {
          product_id: product.id,
          effective_from: new Date(),
          base_price: avgPrice.toString(),
          discount_percentage: '25',
          final_price: (avgPrice * 0.75).toString(),
          trigger_reason: 'stock_clearance'
        };
      }

      if (optimization) {
        const strategy = await db.insert(pricingStrategies).values(optimization).returning();
        optimizations.push(strategy[0]);
      }
    }
  }

  return optimizations;
} 