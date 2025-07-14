import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dataPoints } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const all = await db.select().from(dataPoints);
    const now = new Date();
    // Aggregations
    const totalSales = all.reduce((sum, d) => sum + d.quantity_sold, 0);
    const totalProducts = new Set(all.map(d => d.product_id)).size;
    const productSalesMap: Record<string, number> = {};
    const productStockMap: Record<string, number> = {};
    const weatherStats: Record<string, number> = {};
    let mostSoldProduct = '';
    let mostStockProduct = '';
    let maxSales = 0;
    let maxStock = 0;
    let expiringSoon = 0;
    all.forEach(d => {
      productSalesMap[d.product_name] = (productSalesMap[d.product_name] || 0) + d.quantity_sold;
      productStockMap[d.product_name] = (productStockMap[d.product_name] || 0) + d.stock_level;
      weatherStats[d.weather] = (weatherStats[d.weather] || 0) + 1;
      // Expiring in next 7 days
      if (new Date(d.expiry_date) < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        expiringSoon++;
      }
    });
    for (const [product, sales] of Object.entries(productSalesMap)) {
      if (sales > maxSales) {
        maxSales = sales;
        mostSoldProduct = product;
      }
    }
    for (const [product, stock] of Object.entries(productStockMap)) {
      if (stock > maxStock) {
        maxStock = stock;
        mostStockProduct = product;
      }
    }
    // Time series
    const salesByWeek: { week: string; sales: number }[] = [];
    const salesByMonth: { month: string; sales: number }[] = [];
    const salesByYear: { year: string; sales: number }[] = [];
    const weekMap: Record<string, number> = {};
    const monthMap: Record<string, number> = {};
    const yearMap: Record<string, number> = {};
    all.forEach(d => {
      const date = new Date(d.timestamp);
      const year = date.getFullYear();
      const month = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const week = `${year}-W${Math.ceil((date.getDate() + 6 - date.getDay()) / 7)}`;
      weekMap[week] = (weekMap[week] || 0) + d.quantity_sold;
      monthMap[month] = (monthMap[month] || 0) + d.quantity_sold;
      yearMap[year] = (yearMap[year] || 0) + d.quantity_sold;
    });
    for (const week in weekMap) salesByWeek.push({ week, sales: weekMap[week] });
    for (const month in monthMap) salesByMonth.push({ month, sales: monthMap[month] });
    for (const year in yearMap) salesByYear.push({ year, sales: yearMap[year] });
    // Product sales/stock arrays
    const productSales = Object.entries(productSalesMap).map(([product, sales]) => ({ product, sales }));
    const productStock = Object.entries(productStockMap).map(([product, stock]) => ({ product, stock }));
    return NextResponse.json({
      totalSales,
      totalProducts,
      mostSoldProduct,
      mostStockProduct,
      expiringSoon,
      weatherStats,
      salesByWeek,
      salesByMonth,
      salesByYear,
      productSales,
      productStock,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 