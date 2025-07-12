import { NextRequest, NextResponse } from 'next/server';
import { PerformanceAnalyticsData } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock performance analytics data
    const performanceData: PerformanceAnalyticsData = {
      systemUptime: 99.8,
      responseTime: 245,
      errorRate: 0.15,
      activeUsers: 1250,
      metrics: [
        {
          name: 'API Response Time',
          value: 245,
          unit: 'ms',
          trend: 'down'
        },
        {
          name: 'Database Queries',
          value: 12500,
          unit: '/min',
          trend: 'up'
        },
        {
          name: 'Cache Hit Rate',
          value: 87.5,
          unit: '%',
          trend: 'up'
        },
        {
          name: 'Memory Usage',
          value: 68.2,
          unit: '%',
          trend: 'stable'
        },
        {
          name: 'CPU Load',
          value: 45.8,
          unit: '%',
          trend: 'down'
        }
      ]
    };

    return NextResponse.json(performanceData);
  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance analytics data' },
      { status: 500 }
    );
  }
} 