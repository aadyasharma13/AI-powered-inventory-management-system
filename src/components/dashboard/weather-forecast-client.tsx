'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import apiCache from '@/lib/api-cache';
import { WeatherForecastData } from '@/lib/types';
import { CloudRain, Thermometer, Wind, AlertTriangle } from 'lucide-react';

export function WeatherForecastClient() {
  const [data, setData] = useState<WeatherForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiCache.get('/api/forecasting/weather');
        if (response.error) {
          throw new Error(response.error);
        }
        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weather Impact</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Weather Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p>Error loading weather forecast: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>No weather forecast data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getImpactColor = (impact: number) => {
    if (impact >= 7) return 'text-red-600';
    if (impact >= 4) return 'text-orange-600';
    return 'text-green-600';
  };

  const getImpactLevel = (impact: number) => {
    if (impact >= 7) return 'High';
    if (impact >= 4) return 'Medium';
    return 'Low';
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'rain':
        return '🌧️';
      case 'sunny':
        return '☀️';
      case 'cloudy':
        return '☁️';
      case 'snow':
        return '❄️';
      default:
        return '🌤️';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Weather Impact</CardTitle>
          <CardDescription>
            Weather conditions and their impact on inventory demand
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Temperature</span>
                <span className="text-sm text-muted-foreground">
                  {data.temperature ? `${data.temperature}°C` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CloudRain className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Precipitation</span>
                <span className="text-sm text-muted-foreground">
                  {data.precipitation ? `${data.precipitation}mm` : '0mm'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Wind className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Wind Speed</span>
                <span className="text-sm text-muted-foreground">
                  {data.windSpeed ? `${data.windSpeed} km/h` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Impact Score</span>
                <span className={`text-sm font-medium ${getImpactColor(data.impactScore ?? 0)}`}>
                  {data.impactScore ? `${data.impactScore.toFixed(1)}/10` : '0/10'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Impact Level</span>
                <span className={`font-medium ${getImpactColor(data.impactScore ?? 0)}`}>
                  {getImpactLevel(data.impactScore ?? 0)}
                </span>
              </div>
              <Progress value={(data.impactScore ?? 0) * 10} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Weather Forecast</CardTitle>
          <CardDescription>Upcoming weather conditions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.forecast?.map((weather, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm">{getWeatherIcon(weather.condition)}</span>
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium leading-none">{weather.date}</p>
                  <p className="text-xs text-muted-foreground">
                    {weather.temperature}°C | {weather.condition}
                  </p>
                </div>
                <Badge variant={weather.impact >= 7 ? 'destructive' : weather.impact >= 4 ? 'secondary' : 'default'}>
                  Impact: {weather.impact.toFixed(1)}
                </Badge>
              </div>
            )) ?? (
              <div className="text-center text-muted-foreground py-4">
                <p>No weather forecast data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 