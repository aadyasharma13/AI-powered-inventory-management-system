'use client'

import { useState } from 'react';
import { useCache } from '@/contexts/cache-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Zap, 
  Trash2, 
  RefreshCw, 
  TrendingUp, 
  Clock,
  HardDrive,
  Activity
} from 'lucide-react';

export function CacheManager() {
  const { stats, performance, clearCache, optimizeCache, refreshStats, isInitialized } = useCache();
  const [isClearing, setIsClearing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearCache();
    } finally {
      setIsClearing(false);
    }
  };

  const handleOptimizeCache = () => {
    setIsOptimizing(true);
    try {
      optimizeCache();
    } finally {
      setTimeout(() => setIsOptimizing(false), 1000);
    }
  };

  const hitRate = stats.hits + stats.misses > 0 
    ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1)
    : '0.0';

  const memoryUsagePercent = (stats.size / 1000) * 100; // Assuming max size is 1000

  if (!isInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Cache Manager</span>
          </CardTitle>
          <CardDescription>
            Cache system is initializing...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading cache statistics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cache Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Cache Statistics</span>
          </CardTitle>
          <CardDescription>
            Real-time cache performance and usage metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Hit Rate */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-green-600)' }} />
                <span className="text-sm font-medium">Hit Rate</span>
              </div>
              <div className="text-2xl font-bold">{hitRate}%</div>
              <div className="text-xs text-muted-foreground">
                {stats.hits} hits / {stats.misses} misses
              </div>
            </div>

            {/* Cache Size */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-4 w-4" style={{ color: 'var(--color-blue-600)' }} />
                <span className="text-sm font-medium">Cache Size</span>
              </div>
              <div className="text-2xl font-bold">{stats.size}</div>
              <div className="text-xs text-muted-foreground">
                {memoryUsagePercent.toFixed(1)}% of max capacity
              </div>
              <Progress value={memoryUsagePercent} className="h-2" />
            </div>

            {/* Response Time */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Avg Response</span>
              </div>
              <div className="text-2xl font-bold">
                {performance.averageResponseTime.toFixed(0)}ms
              </div>
              <div className="text-xs text-muted-foreground">
                Cached data access time
              </div>
            </div>

            {/* Last Cleanup */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Last Cleanup</span>
              </div>
              <div className="text-2xl font-bold">
                {Math.floor((Date.now() - stats.lastCleanup) / 1000)}s
              </div>
              <div className="text-xs text-muted-foreground">
                Seconds ago
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cache Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Performance Metrics</span>
          </CardTitle>
          <CardDescription>
            Detailed cache performance analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Memory Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory Usage</span>
                <Badge variant="outline">{performance.memoryUsage} entries</Badge>
              </div>
              <Progress value={(performance.memoryUsage / 1000) * 100} className="h-3" />
              <div className="text-xs text-muted-foreground">
                {performance.memoryUsage} of 1000 maximum cache entries
              </div>
            </div>

            {/* Hit Rate Chart */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cache Hit Rate</span>
                <Badge variant={parseFloat(hitRate) > 80 ? "default" : "secondary"}>
                  {hitRate}%
                </Badge>
              </div>
              <Progress value={parseFloat(hitRate)} className="h-3" />
              <div className="text-xs text-muted-foreground">
                {parseFloat(hitRate) > 80 ? "Excellent" : parseFloat(hitRate) > 60 ? "Good" : "Needs optimization"}
              </div>
            </div>
          </div>

          {/* Last Optimization */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Optimization</span>
              <span className="text-sm text-muted-foreground">
                {new Date(performance.lastOptimization).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cache Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Cache Management</span>
          </CardTitle>
          <CardDescription>
            Manage cache performance and storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleOptimizeCache}
              disabled={isOptimizing}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isOptimizing ? 'animate-spin' : ''}`} />
              <span>{isOptimizing ? 'Optimizing...' : 'Optimize Cache'}</span>
            </Button>

            <Button
              onClick={refreshStats}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Activity className="h-4 w-4" />
              <span>Refresh Stats</span>
            </Button>

            <Button
              onClick={handleClearCache}
              disabled={isClearing || stats.size === 0}
              variant="destructive"
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>{isClearing ? 'Clearing...' : 'Clear All Cache'}</span>
            </Button>
          </div>

          {/* Cache Status */}
          <div className="mt-4 flex items-center space-x-2">
            <Badge variant="outline" style={{ 
              backgroundColor: 'var(--color-green-50)', 
              color: 'var(--color-green-700)' 
            }}>
              <Database className="h-3 w-3 mr-1" />
              Cache Active
            </Badge>
            <span className="text-sm text-muted-foreground">
              {stats.size} entries cached • {hitRate}% hit rate
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 