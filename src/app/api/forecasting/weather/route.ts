import { NextRequest, NextResponse } from 'next/server';
import { WeatherForecastData } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock weather forecast data
    const weatherData: WeatherForecastData = {
      temperature: 22.5,
      precipitation: 5.2,
      windSpeed: 12.8,
      impactScore: 6.8,
      forecast: [
        {
          date: '2024-01-15',
          temperature: 22.5,
          condition: 'Partly Cloudy',
          impact: 6.8
        },
        {
          date: '2024-01-16',
          temperature: 18.2,
          condition: 'Rain',
          impact: 8.2
        },
        {
          date: '2024-01-17',
          temperature: 25.8,
          condition: 'Sunny',
          impact: 4.5
        },
        {
          date: '2024-01-18',
          temperature: 20.1,
          condition: 'Cloudy',
          impact: 5.9
        },
        {
          date: '2024-01-19',
          temperature: 23.4,
          condition: 'Partly Cloudy',
          impact: 6.1
        }
      ]
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather forecast data' },
      { status: 500 }
    );
  }
} 