import { NextRequest, NextResponse } from 'next/server';
import { SalesAnalyticsData } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock sales analytics data
    const salesData: SalesAnalyticsData = {
      totalRevenue: 1250000,
      totalOrders: 8500,
      revenueGrowth: 12.5,
      topProducts: [
        {
          id: '1',
          name: 'Organic Bananas',
          category: 'Fruits',
          revenue: 125000
        },
        {
          id: '2',
          name: 'Fresh Milk',
          category: 'Dairy',
          revenue: 98000
        },
        {
          id: '3',
          name: 'Whole Grain Bread',
          category: 'Bakery',
          revenue: 75000
        },
        {
          id: '4',
          name: 'Free Range Eggs',
          category: 'Dairy',
          revenue: 68000
        },
        {
          id: '5',
          name: 'Organic Spinach',
          category: 'Vegetables',
          revenue: 52000
        }
      ]
    };

    return NextResponse.json(salesData);
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales analytics data' },
      { status: 500 }
    );
  }
} 