import { NextRequest, NextResponse } from 'next/server';
import { DemandForecastData } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock demand forecast data
    const demandData: DemandForecastData = {
      predictedDemand: 12500,
      confidenceLevel: 87.5,
      trendDirection: 'up',
      seasonalFactor: 1.15,
      forecasts: [
        {
          date: '2024-01-15',
          demand: 12500,
          confidence: 87.5
        },
        {
          date: '2024-01-16',
          demand: 12800,
          confidence: 85.2
        },
        {
          date: '2024-01-17',
          demand: 13200,
          confidence: 82.8
        },
        {
          date: '2024-01-18',
          demand: 12900,
          confidence: 80.1
        },
        {
          date: '2024-01-19',
          demand: 13500,
          confidence: 77.3
        }
      ]
    };

    return NextResponse.json(demandData);
  } catch (error) {
    console.error('Error fetching demand forecast:', error);
    return NextResponse.json(
      { error: 'Failed to fetch demand forecast data' },
      { status: 500 }
    );
  }
} 