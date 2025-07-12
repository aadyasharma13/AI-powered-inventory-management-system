'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import apiCache from '@/lib/api-cache';
import { SeasonalForecastData } from '@/lib/types';
import { Calendar, TrendingUp, Leaf, Sun, Snowflake } from 'lucide-react';

export function SeasonalForecastClient() {
  const [data, setData] = useState<SeasonalForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiCache.get('/api/forecasting/seasonal');
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
            <CardTitle>Seasonal Trends</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Seasonal Data</CardTitle>
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
            <p>Error loading seasonal forecast: {error}</p>
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
            <p>No seasonal forecast data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSeasonIcon = (season: string) => {
    switch (season.toLowerCase()) {
      case 'spring':
        return <Leaf className="h-4 w-4 text-green-600" />;
      case 'summer':
        return <Sun className="h-4 w-4 text-yellow-600" />;
      case 'fall':
        return <Leaf className="h-4 w-4 text-orange-600" />;
      case 'winter':
        return <Snowflake className="h-4 w-4 text-blue-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: number) => {
    if (trend >= 1.2) return 'text-green-600';
    if (trend >= 0.8) return 'text-blue-600';
    return 'text-red-600';
  };

  const getTrendLabel = (trend: number) => {
    if (trend >= 1.2) return 'High Demand';
    if (trend >= 0.8) return 'Normal';
    return 'Low Demand';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Seasonal Trends</CardTitle>
          <CardDescription>
            Seasonal demand patterns and trend analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Leaf className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Spring Trend</span>
                <span className={`text-sm font-medium ${getTrendColor(data.springTrend ?? 1)}`}>
                  {(data.springTrend ?? 1).toFixed(2)}x
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Summer Trend</span>
                <span className={`text-sm font-medium ${getTrendColor(data.summerTrend ?? 1)}`}>
                  {(data.summerTrend ?? 1).toFixed(2)}x
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Leaf className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Fall Trend</span>
                <span className={`text-sm font-medium ${getTrendColor(data.fallTrend ?? 1)}`}>
                  {(data.fallTrend ?? 1).toFixed(2)}x
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Snowflake className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Winter Trend</span>
                <span className={`text-sm font-medium ${getTrendColor(data.winterTrend ?? 1)}`}>
                  {(data.winterTrend ?? 1).toFixed(2)}x
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Current Season Performance</span>
                <span className="font-medium text-blue-600">
                  {getCurrentSeasonTrend(data)}
                </span>
              </div>
              <Progress value={getCurrentSeasonProgress(data)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Seasonal Data</CardTitle>
          <CardDescription>Detailed seasonal breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.seasonalData?.map((season, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  {getSeasonIcon(season.season)}
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium leading-none">{season.season}</p>
                  <p className="text-xs text-muted-foreground">
                    Trend: {season.trend.toFixed(2)}x | {season.topProducts.length} top products
                  </p>
                </div>
                <Badge variant={season.trend >= 1.2 ? 'default' : season.trend >= 0.8 ? 'secondary' : 'destructive'}>
                  {getTrendLabel(season.trend)}
                </Badge>
              </div>
            )) ?? (
              <div className="text-center text-muted-foreground py-4">
                <p>No seasonal data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getCurrentSeasonTrend(data: SeasonalForecastData): string {
  const now = new Date();
  const month = now.getMonth();
  
  let currentTrend = 1;
  if (month >= 2 && month <= 4) currentTrend = data.springTrend ?? 1;
  else if (month >= 5 && month <= 7) currentTrend = data.summerTrend ?? 1;
  else if (month >= 8 && month <= 10) currentTrend = data.fallTrend ?? 1;
  else currentTrend = data.winterTrend ?? 1;
  
  return `${currentTrend.toFixed(2)}x`;
}

function getCurrentSeasonProgress(data: SeasonalForecastData): number {
  const now = new Date();
  const month = now.getMonth();
  
  let currentTrend = 1;
  if (month >= 2 && month <= 4) currentTrend = data.springTrend ?? 1;
  else if (month >= 5 && month <= 7) currentTrend = data.summerTrend ?? 1;
  else if (month >= 8 && month <= 10) currentTrend = data.fallTrend ?? 1;
  else currentTrend = data.winterTrend ?? 1;
  
  return Math.min(currentTrend * 50, 100);
} 