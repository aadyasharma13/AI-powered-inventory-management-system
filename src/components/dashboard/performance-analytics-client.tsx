'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import apiCache from '@/lib/api-cache';
import { PerformanceAnalyticsData } from '@/lib/types';
import { Activity, Clock, AlertCircle, Users } from 'lucide-react';

export function PerformanceAnalyticsClient() {
  const [data, setData] = useState<PerformanceAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiCache.get('/api/analytics/performance');
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
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
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
            <p>Error loading performance analytics: {error}</p>
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
            <p>No performance analytics data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (value: number, threshold: number) => {
    return value >= threshold ? 'text-green-600' : value >= threshold * 0.8 ? 'text-orange-600' : 'text-red-600';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            System performance, response times, and error rates
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">System Uptime</span>
                <span className={`text-sm font-medium ${getStatusColor(data.systemUptime ?? 0, 99)}`}>
                  {data.systemUptime ? `${data.systemUptime.toFixed(2)}%` : '0%'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Response Time</span>
                <span className={`text-sm font-medium ${getStatusColor(1000 - (data.responseTime ?? 0), 800)}`}>
                  {data.responseTime ? `${data.responseTime}ms` : '0ms'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Error Rate</span>
                <span className={`font-medium ${getStatusColor(100 - (data.errorRate ?? 0), 95)}`}>
                  {data.errorRate ? `${data.errorRate.toFixed(2)}%` : '0%'}
                </span>
              </div>
              <Progress value={100 - (data.errorRate ?? 0)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Real-time performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.metrics?.map((metric, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm">{getTrendIcon(metric.trend)}</span>
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium leading-none">{metric.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {metric.value} {metric.unit}
                  </p>
                </div>
                <Badge variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'}>
                  {metric.trend}
                </Badge>
              </div>
            )) ?? (
              <div className="text-center text-muted-foreground py-4">
                <p>No metrics data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 