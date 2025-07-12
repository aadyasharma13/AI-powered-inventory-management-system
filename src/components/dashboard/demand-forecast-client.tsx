'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import apiCache from '@/lib/api-cache';
import { DemandForecastData } from '@/lib/types';
import { TrendingUp, Target, Calendar, BarChart3 } from 'lucide-react';

export function DemandForecastClient() {
  const [data, setData] = useState<DemandForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiCache.get('/api/forecasting/demand');
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
            <CardTitle>Demand Forecast</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Forecast Details</CardTitle>
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
            <p>Error loading demand forecast: {error}</p>
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
            <p>No demand forecast data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Demand Forecast</CardTitle>
          <CardDescription>
            AI-powered demand predictions and trend analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Predicted Demand</span>
                <span className="text-sm text-muted-foreground">
                  {data.predictedDemand?.toLocaleString() ?? '0'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Trend Direction</span>
                <span className={`text-sm font-medium ${getTrendColor(data.trendDirection ?? 'stable')}`}>
                  {data.trendDirection?.toUpperCase() ?? 'STABLE'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Confidence Level</span>
                <span className={`font-medium ${getConfidenceColor(data.confidenceLevel ?? 0)}`}>
                  {data.confidenceLevel ? `${data.confidenceLevel.toFixed(1)}%` : '0%'}
                </span>
              </div>
              <Progress value={data.confidenceLevel ?? 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Seasonal Factor</span>
                <span className="font-medium text-blue-600">
                  {data.seasonalFactor ? `${data.seasonalFactor.toFixed(2)}x` : '1.00x'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Forecast Details</CardTitle>
          <CardDescription>Detailed forecast breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.forecasts?.map((forecast, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium leading-none">{forecast.date}</p>
                  <p className="text-xs text-muted-foreground">
                    Demand: {forecast.demand.toLocaleString()} | Confidence: {forecast.confidence.toFixed(1)}%
                  </p>
                </div>
                <Badge variant={forecast.confidence >= 80 ? 'default' : forecast.confidence >= 60 ? 'secondary' : 'destructive'}>
                  {forecast.confidence.toFixed(0)}%
                </Badge>
              </div>
            )) ?? (
              <div className="text-center text-muted-foreground py-4">
                <p>No forecast data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 