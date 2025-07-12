'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import apiCache from '@/lib/api-cache';
import { SalesAnalyticsData } from '@/lib/types';
import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';

export function SalesAnalyticsClient() {
  const [data, setData] = useState<SalesAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await apiCache.get('/api/analytics/sales');
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
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
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
            <p>Error loading sales analytics: {error}</p>
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
            <p>No sales analytics data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>
            Monthly revenue trends and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Total Revenue</span>
                <span className="text-sm text-muted-foreground">
                  ${data.totalRevenue?.toLocaleString() ?? '0'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Total Orders</span>
                <span className="text-sm text-muted-foreground">
                  {data.totalOrders?.toLocaleString() ?? '0'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Revenue Growth</span>
                <span className={`font-medium ${data.revenueGrowth && data.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.revenueGrowth ? `${data.revenueGrowth > 0 ? '+' : ''}${data.revenueGrowth.toFixed(1)}%` : '0%'}
                </span>
              </div>
              <Progress value={Math.abs(data.revenueGrowth ?? 0)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>Best performing products by revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topProducts?.map((product, index) => (
              <div key={product.id} className="flex items-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-medium">{index + 1}</span>
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium leading-none">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ${product.revenue?.toLocaleString() ?? '0'} revenue
                  </p>
                </div>
                <Badge variant="secondary">{product.category}</Badge>
              </div>
            )) ?? (
              <div className="text-center text-muted-foreground py-4">
                <p>No product data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 