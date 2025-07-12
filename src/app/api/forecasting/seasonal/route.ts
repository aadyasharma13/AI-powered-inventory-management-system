import { NextRequest, NextResponse } from 'next/server';
import { SeasonalForecastData } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock seasonal forecast data
    const seasonalData: SeasonalForecastData = {
      springTrend: 1.25,
      summerTrend: 1.45,
      fallTrend: 1.15,
      winterTrend: 0.85,
      seasonalData: [
        {
          season: 'Spring',
          trend: 1.25,
          topProducts: ['Fresh Herbs', 'Spring Vegetables', 'Light Dairy']
        },
        {
          season: 'Summer',
          trend: 1.45,
          topProducts: ['Fresh Fruits', 'Cold Beverages', 'Ice Cream']
        },
        {
          season: 'Fall',
          trend: 1.15,
          topProducts: ['Root Vegetables', 'Warm Beverages', 'Baking Items']
        },
        {
          season: 'Winter',
          trend: 0.85,
          topProducts: ['Comfort Foods', 'Hot Beverages', 'Preserved Items']
        }
      ]
    };

    return NextResponse.json(seasonalData);
  } catch (error) {
    console.error('Error fetching seasonal forecast:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seasonal forecast data' },
      { status: 500 }
    );
  }
} 