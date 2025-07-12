'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import apiCache from '@/lib/api-cache';
import { InventoryAnalyticsData } from '@/lib/types';
import { Package, AlertTriangle, TrendingDown, BarChart3 } from 'lucide-react';

export function InventoryAnalyticsClient() {
  const [data, setData] = useState<InventoryAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiCache.get('/api/analytics/inventory');
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
            <CardTitle>Inventory Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Stock Levels</CardTitle>
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
            <p>Error loading inventory analytics: {error}</p>
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
            <p>No inventory analytics data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Inventory Overview</CardTitle>
          <CardDescription>
            Stock levels, turnover rates, and inventory health metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Total Items</span>
                <span className="text-sm text-muted-foreground">
                  {data.totalItems?.toLocaleString() ?? '0'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Low Stock</span>
                <span className="text-sm text-muted-foreground">
                  {data.lowStockItems?.toLocaleString() ?? '0'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Turnover Rate</span>
                <span className="font-medium text-blue-600">
                  {data.turnoverRate ? `${data.turnoverRate.toFixed(1)}%` : '0%'}
                </span>
              </div>
              <Progress value={data.turnoverRate ?? 0} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
          <CardDescription>Current inventory status by product</CardDescription>
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
                    Stock: {product.stockLevel?.toLocaleString() ?? '0'} | Turnover: {product.turnover?.toFixed(1) ?? '0'}%
                  </p>
                </div>
                <Badge variant={product.stockLevel && product.stockLevel < 10 ? "destructive" : "secondary"}>
                  {product.stockLevel && product.stockLevel < 10 ? 'Low' : 'OK'}
                </Badge>
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