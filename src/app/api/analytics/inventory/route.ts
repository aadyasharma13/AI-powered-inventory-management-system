import { NextRequest, NextResponse } from 'next/server';
import { InventoryAnalyticsData } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock inventory analytics data
    const inventoryData: InventoryAnalyticsData = {
      totalItems: 1250,
      lowStockItems: 45,
      outOfStockItems: 12,
      turnoverRate: 85.5,
      topProducts: [
        {
          id: '1',
          name: 'Organic Bananas',
          stockLevel: 150,
          turnover: 92.3
        },
        {
          id: '2',
          name: 'Fresh Milk',
          stockLevel: 89,
          turnover: 88.7
        },
        {
          id: '3',
          name: 'Whole Grain Bread',
          stockLevel: 67,
          turnover: 85.2
        },
        {
          id: '4',
          name: 'Free Range Eggs',
          stockLevel: 45,
          turnover: 82.1
        },
        {
          id: '5',
          name: 'Organic Spinach',
          stockLevel: 23,
          turnover: 78.9
        }
      ]
    };

    return NextResponse.json(inventoryData);
  } catch (error) {
    console.error('Error fetching inventory analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory analytics data' },
      { status: 500 }
    );
  }
} 