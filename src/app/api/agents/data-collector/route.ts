import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { dataPoints, weatherSnapshots, sales } from '@/db/schema';
import { eq, desc, gte } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/inventory_db';
const client = postgres(connectionString);
const db = drizzle(client);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    const productId = searchParams.get('productId');
    const dataType = searchParams.get('type') || 'all';

    const now = new Date();
    let startTime: Date;

    switch (timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    let response: any = {
      agent: 'Data Collector',
      status: 'online',
      lastUpdate: new Date().toISOString(),
      dataQuality: {
        completeness: 98.5,
        accuracy: 97.2,
        timeliness: 99.1
      },
      sources: {
        sales: 0,
        weather: 0,
        inventory: 0,
        iot: 0
      }
    };

    // Get data points
    if (dataType === 'all' || dataType === 'inventory') {
      const dataPointsQuery = productId 
        ? await db.select().from(dataPoints).where(eq(dataPoints.product_id, productId)).orderBy(desc(dataPoints.timestamp)).limit(100)
        : await db.select().from(dataPoints).where(gte(dataPoints.timestamp, startTime)).orderBy(desc(dataPoints.timestamp)).limit(100);
      
      response.sources.inventory = dataPointsQuery.length;
      response.inventoryData = dataPointsQuery;
    }

    // Get weather data
    if (dataType === 'all' || dataType === 'weather') {
      const weatherData = await db.select().from(weatherSnapshots).where(gte(weatherSnapshots.recorded_at, startTime)).orderBy(desc(weatherSnapshots.recorded_at)).limit(50);
      response.sources.weather = weatherData.length;
      response.weatherData = weatherData;
    }

    // Get sales data
    if (dataType === 'all' || dataType === 'sales') {
      const salesData = productId 
        ? await db.select().from(sales).where(eq(sales.product_id, productId)).orderBy(desc(sales.sale_time)).limit(100)
        : await db.select().from(sales).where(gte(sales.sale_time, startTime)).orderBy(desc(sales.sale_time)).limit(100);
      
      response.sources.sales = salesData.length;
      response.salesData = salesData;
    }

    // Simulate IoT data
    if (dataType === 'all' || dataType === 'iot') {
      response.sources.iot = 25;
      response.iotData = {
        temperature_sensors: Array.from({ length: 10 }, (_, i) => ({
          sensor_id: `temp_${i + 1}`,
          location: `warehouse_zone_${i + 1}`,
          temperature: 18 + Math.random() * 8,
          humidity: 45 + Math.random() * 20,
          timestamp: new Date().toISOString()
        })),
        rfid_readers: Array.from({ length: 15 }, (_, i) => ({
          reader_id: `rfid_${i + 1}`,
          location: `shelf_${i + 1}`,
          products_scanned: Math.floor(Math.random() * 50) + 10,
          last_scan: new Date().toISOString()
        }))
      };
    }

    // Calculate data quality metrics
    const totalDataPoints = response.sources.sales + response.sources.inventory + response.sources.weather + response.sources.iot;
    response.totalDataPoints = totalDataPoints;
    response.dataQuality.overall = (response.dataQuality.completeness + response.dataQuality.accuracy + response.dataQuality.timeliness) / 3;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Data Collector API Error:', error);
    return NextResponse.json(
      { error: 'Failed to collect data', agent: 'Data Collector', status: 'error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dataType, data } = body;

    // Simulate real-time data ingestion
    const timestamp = new Date();
    
    let result;
    switch (dataType) {
      case 'sales':
        result = await db.insert(sales).values({
          ...data,
          sale_time: timestamp
        }).returning();
        break;
      case 'weather':
        result = await db.insert(weatherSnapshots).values({
          ...data,
          recorded_at: timestamp
        }).returning();
        break;
      case 'inventory':
        result = await db.insert(dataPoints).values({
          ...data,
          timestamp: timestamp
        }).returning();
        break;
      default:
        throw new Error('Invalid data type');
    }

    return NextResponse.json({
      success: true,
      message: 'Data ingested successfully',
      timestamp: timestamp.toISOString(),
      data: result[0]
    });
  } catch (error) {
    console.error('Data Ingestion Error:', error);
    return NextResponse.json(
      { error: 'Failed to ingest data' },
      { status: 500 }
    );
  }
} 