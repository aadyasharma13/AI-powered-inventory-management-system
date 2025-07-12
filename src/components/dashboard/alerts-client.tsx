'use client'

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Filter, 
  RefreshCw, 
  Loader2,
  Bell,
  XCircle,
  Info
} from 'lucide-react';
import { Alert, AlertStats } from '@/lib/types';
import apiCache from '@/lib/api-cache';

export function AlertsClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Alerts data
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats>({
    total: 0,
    critical: 0,
    warning: 0,
    info: 0,
    resolved: 0,
    unresolved: 0,
    byType: {},
    byStore: {}
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch alerts data
  const fetchAlertsData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch alert manager data
      const alertManagerResponse = await apiCache.get('/api/agents/alert-manager', {
        ttl: 30 * 1000, // 30 seconds cache
        cacheKey: 'alerts-manager'
      });

      if (alertManagerResponse.status === 200) {
        const data = alertManagerResponse.data;
        setAlerts(data.alerts || []);
        setStats(data.stats || {
          total: 0,
          critical: 0,
          warning: 0,
          info: 0,
          resolved: 0,
          unresolved: 0,
          byType: {},
          byStore: {}
        });
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching alerts data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial data fetch
  useEffect(() => {
    fetchAlertsData();
  }, [fetchAlertsData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchAlertsData, 30000);
    return () => clearInterval(interval);
  }, [fetchAlertsData]);

  // Filter alerts based on active tab and severity
  const filteredAlerts = alerts.filter(alert => {
    if (activeTab === 'resolved' && !alert.resolved) return false;
    if (activeTab === 'unresolved' && alert.resolved) return false;
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-red-600)' }} />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" style={{ color: 'var(--color-yellow-600)' }} />;
      case 'info':
        return <Info className="w-4 h-4" style={{ color: 'var(--color-blue-600)' }} />;
      default:
        return <Bell className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} />;
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const response = await apiCache.patch(`/api/alerts/${alertId}/resolve`, {
        resolved: true
      }, {
        ttl: 0, // No cache for mutations
        invalidateOnSuccess: true
      });

      if (response.status === 200) {
        // Update local state
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true } : alert
        ));
        
        // Refresh data to update stats
        fetchAlertsData();
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight ml-10 -mt-3 md:ml-0 md:-mt-0">Alerts</h1>
          <p className="text-muted-foreground">
            Monitor and manage system alerts and notifications
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={fetchAlertsData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <span className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4" style={{ color: 'var(--color-red-600)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-red-600)' }}>{stats.critical}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warning</CardTitle>
            <AlertCircle className="h-4 w-4" style={{ color: 'var(--color-yellow-600)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-yellow-600)' }}>{stats.warning}</div>
            <p className="text-xs text-muted-foreground">
              Monitor closely
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4" style={{ color: 'var(--color-green-600)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-green-600)' }}>{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">
              Successfully handled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Bell className="h-4 w-4" style={{ color: 'var(--color-muted-foreground)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All alerts
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger className='text-muted-foreground data-[state=active]:text-foreground' value="all">All Alerts</TabsTrigger>
          <TabsTrigger className='text-muted-foreground data-[state=active]:text-foreground' value="unresolved">Unresolved</TabsTrigger>
          <TabsTrigger className='text-muted-foreground data-[state=active]:text-foreground' value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Severity Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filter by severity:</span>
            <div className="flex space-x-2">
              {['all', 'critical', 'warning', 'info'].map((severity) => (
                <Button
                  key={severity}
                  variant={severityFilter === severity ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSeverityFilter(severity)}
                >
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Alerts List */}
          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
              <CardDescription>
                {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAlerts.length > 0 ? (
                <div className="space-y-4">
                  {filteredAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getSeverityIcon(alert.severity)}
                        <div>
                          <div className="font-medium">{alert.message}</div>
                          <div className="text-sm text-muted-foreground">
                            {alert.product_id && `Product: ${alert.product_id} • `}
                            {new Date(alert.triggered_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        {!alert.resolved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Resolve
                          </Button>
                        )}
                        {alert.resolved && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Resolved
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No alerts found matching the current filters
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 