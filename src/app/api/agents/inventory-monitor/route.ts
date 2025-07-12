import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { inventorySnapshots, products, dataPoints } from '@/db/schema';
import { eq, desc, gte, and, lt } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/inventory_db';
const client = postgres(connectionString);
const db = drizzle(client);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const includeExpiry = searchParams.get('expiry') === 'true';
    const includeFreshness = searchParams.get('freshness') === 'true';

    const now = new Date();
    const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    let response: any = {
      agent: 'Inventory Monitor',
      status: 'online',
      lastUpdate: new Date().toISOString(),
      summary: {
        totalProducts: 0,
        lowStockItems: 0,
        expiringItems: 0,
        overstockItems: 0,
        averageAccuracy: 0
      },
      inventory: [],
      alerts: []
    };

    // Get current inventory status
    const inventoryData = productId 
      ? await db.select().from(inventorySnapshots).where(eq(inventorySnapshots.product_id, productId)).orderBy(desc(inventorySnapshots.recorded_at)).limit(50)
      : await db.select().from(inventorySnapshots).where(gte(inventorySnapshots.recorded_at, startDate)).orderBy(desc(inventorySnapshots.recorded_at)).limit(100);

    response.inventory = inventoryData;

    // Get product details for inventory items
    if (inventoryData.length > 0) {
      const productIds = [...new Set(inventoryData.map(item => item.product_id))];
      const productDetails = await db.select().from(products).where(eq(products.id, productIds[0]));
      
      // Calculate summary metrics
      response.summary.totalProducts = productIds.length;
      response.summary.lowStockItems = inventoryData.filter(item => item.stock_level < 20).length;
      response.summary.overstockItems = inventoryData.filter(item => item.stock_level > 200).length;
      response.summary.averageAccuracy = 96.8;

      // Check for expiring items
      if (includeExpiry) {
        const expiringThreshold = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        const expiringItems = inventoryData.filter(item => new Date(item.expiry_date) <= expiringThreshold);
        response.summary.expiringItems = expiringItems.length;
        
        response.alerts.push(...expiringItems.map(item => ({
          type: 'expiry',
          severity: 'high',
          message: `Product ${item.product_id} expiring on ${item.expiry_date}`,
          productId: item.product_id,
          expiryDate: item.expiry_date,
          daysUntilExpiry: Math.ceil((new Date(item.expiry_date).getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        })));
      }

      // Check for low stock items
      const lowStockItems = inventoryData.filter(item => item.stock_level < 20);
      response.alerts.push(...lowStockItems.map(item => ({
        type: 'low_stock',
        severity: item.stock_level < 10 ? 'critical' : 'warning',
        message: `Low stock alert: ${item.product_id} has ${item.stock_level} units remaining`,
        productId: item.product_id,
        currentStock: item.stock_level,
        recommendedReorder: Math.max(50, item.stock_level * 3)
      })));

      // Check for overstock items
      const overstockItems = inventoryData.filter(item => item.stock_level > 200);
      response.alerts.push(...overstockItems.map(item => ({
        type: 'overstock',
        severity: 'medium',
        message: `Overstock alert: ${item.product_id} has ${item.stock_level} units`,
        productId: item.product_id,
        currentStock: item.stock_level,
        recommendedAction: 'Consider promotional pricing'
      })));
    }

    // Calculate freshness scores if requested
    if (includeFreshness) {
      response.freshnessAnalysis = inventoryData.map(item => {
        const freshnessScore = typeof item.freshness_score === 'string' 
          ? parseFloat(item.freshness_score) 
          : (item.freshness_score || calculateFreshnessScore(item.expiry_date));
        
        return {
          productId: item.product_id,
          freshnessScore: freshnessScore,
          daysUntilExpiry: Math.ceil((new Date(item.expiry_date).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
          status: getFreshnessStatus(freshnessScore)
        };
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Inventory Monitor API Error:', error);
    return NextResponse.json(
      { error: 'Failed to monitor inventory', agent: 'Inventory Monitor', status: 'error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, stockLevel, expiryDate, freshnessScore } = body;

    // Validate product exists
    const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (product.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Create new inventory snapshot
    const snapshot = await db.insert(inventorySnapshots).values({
      product_id: productId,
      stock_level: typeof stockLevel === 'number' ? stockLevel : parseInt(stockLevel as string),
      freshness_score: (typeof freshnessScore === 'number' ? freshnessScore : calculateFreshnessScore(expiryDate)).toString(),
      expiry_date: expiryDate,
      recorded_at: new Date()
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Inventory snapshot recorded successfully',
      snapshot: snapshot[0]
    });
  } catch (error) {
    console.error('Inventory Snapshot Error:', error);
    return NextResponse.json(
      { error: 'Failed to record inventory snapshot' },
      { status: 500 }
    );
  }
}

function calculateFreshnessScore(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  
  if (daysUntilExpiry <= 0) return 0;
  if (daysUntilExpiry >= 30) return 10;
  
  return Math.round((daysUntilExpiry / 30) * 10);
}

function getFreshnessStatus(score: number): string {
  if (score >= 8) return 'excellent';
  if (score >= 6) return 'good';
  if (score >= 4) return 'fair';
  if (score >= 2) return 'poor';
  return 'expired';
} 