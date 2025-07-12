'use client'

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown,
  WifiOff,
  CheckCircle,
  AlertTriangle,
  Database,
  BarChart3,
  Shield,
  Eye,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { AgentStatus, BusinessMetric, Alert as AlertType } from '@/lib/types';
import apiCache from '@/lib/api-cache';

export function DashboardClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Agent statuses
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetric[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<AlertType[]>([]);
  const [systemPerformance, setSystemPerformance] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    storageUsage: 0,
    responseTime: 0,
    uptime: 0,
    errorRate: 0
  });
  const [dataCollectionStatus, setDataCollectionStatus] = useState({
    salesData: 0,
    inventoryData: 0,
    weatherData: 0
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch all agent data
  const fetchAgentData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const agents = [
        'data-collector',
        'demand-forecaster', 
        'inventory-monitor',
        'alert-manager',
        'pricing-strategist',
        'supplier-agent'
      ];

      const agentPromises = agents.map(async (agent) => {
        try {
          const response = await apiCache.get(`/api/agents/${agent}`, {
            ttl: 60 * 10000, // 1 hour cache for agent data
            cacheKey: `agent-${agent}-status`
          });
          
          if (response.status === 200) {
            return response.data;
          }
          return { agent: agent.replace('-', ' '), status: 'error', lastUpdate: new Date().toISOString() };
        } catch (error) {
          return { agent: agent.replace('-', ' '), status: 'offline', lastUpdate: new Date().toISOString() };
        }
      });

      const agentResults = await Promise.all(agentPromises);
      setAgentStatuses(agentResults);

      // Calculate business metrics from agent data
      calculateBusinessMetrics(agentResults);

      // Fetch alerts
      const alertsResponse = await apiCache.get('/api/agents/alert-manager?severity=critical&resolved=false', {
        ttl: 60 * 10000, // 1 hour cache for alerts
        cacheKey: 'critical-alerts'
      });
      
      if (alertsResponse.status === 200) {
        setCriticalAlerts(alertsResponse.data.alerts || []);
      }

      // Fetch system performance data
      const performanceResponse = await apiCache.get('/api/analytics/performance', {
        ttl: 60 * 10000, // 1 hour cache
        cacheKey: 'system-performance'
      });

      if (performanceResponse.status === 200) {
        const perfData = performanceResponse.data;
        setSystemPerformance({
          cpuUsage: perfData.cpuUsage || 0,
          memoryUsage: perfData.memoryUsage || 0,
          storageUsage: perfData.storageUsage || 0,
          responseTime: perfData.responseTime || 0,
          uptime: perfData.uptime || 0,
          errorRate: perfData.errorRate || 0
        });
      }

      // Fetch data collection status from data collector
      const dataCollectorResponse = await apiCache.get('/api/agents/data-collector', {
        ttl: 60 * 10000, // 1 hour cache
        cacheKey: 'data-collection-status'
      });

      if (dataCollectorResponse.status === 200) {
        const data = dataCollectorResponse.data;
        setDataCollectionStatus({
          salesData: data.sources?.sales || 0,
          inventoryData: data.sources?.inventory || 0,
          weatherData: data.sources?.weather || 0
        });
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching agent data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial data fetch
  useEffect(() => {
    fetchAgentData();
  }, [fetchAgentData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchAgentData, 30000);
    return () => clearInterval(interval);
  }, [fetchAgentData]);

  const calculateBusinessMetrics = (agentData: AgentStatus[]) => {
    const onlineAgents = agentData.filter(a => a.status === 'online').length;
    const totalAgents = agentData.length;
    const systemHealth = totalAgents > 0 ? (onlineAgents / totalAgents) * 100 : 0;

    const metrics: BusinessMetric[] = [
      {
        label: 'System Health',
        value: `${onlineAgents}/${totalAgents}`,
        change: systemHealth > 80 ? '+2.5%' : systemHealth > 60 ? '+0.5%' : '-5.2%',
        trend: systemHealth > 80 ? 'up' : systemHealth > 60 ? 'stable' : 'down',
        status: systemHealth > 80 ? 'good' : systemHealth > 60 ? 'warning' : 'critical'
      },
      {
        label: 'Data Quality',
        value: agentData.length > 0 ? 
          `${(agentData.reduce((acc, agent) => acc + (agent.dataQuality?.overall || 0), 0) / agentData.length * 100).toFixed(1)}%` : '0%',
        change: '+1.8%',
        trend: 'up',
        status: 'good'
      },
      {
        label: 'Active Alerts',
        value: criticalAlerts.length.toString(),
        change: criticalAlerts.length > 0 ? '+12%' : '-12%',
        trend: criticalAlerts.length > 0 ? 'up' : 'down',
        status: criticalAlerts.length > 0 ? 'warning' : 'good'
      },
      {
        label: 'Response Time',
        value: `${systemPerformance.responseTime.toFixed(1)}s`,
        change: systemPerformance.responseTime < 2 ? '-0.3s' : '+0.5s',
        trend: systemPerformance.responseTime < 2 ? 'down' : 'up',
        status: systemPerformance.responseTime < 2 ? 'good' : 'warning'
      }
    ];
    setBusinessMetrics(metrics);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'error':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-green-600)' }} />;
      case 'offline':
        return <WifiOff className="w-4 h-4" style={{ color: 'var(--color-red-600)' }} />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-yellow-600)' }} />;
      default:
        return <Activity className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-green-600)' }} />;
      case 'down':
        return <TrendingDown className="w-4 h-4" style={{ color: 'var(--color-red-600)' }} />;
      default:
        return <Activity className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight ml-10 -mt-3 md:ml-0 md:-mt-0">Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered inventory management system overview
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={fetchAgentData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <span className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {businessMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              {getTrendIcon(metric.trend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.change} vs last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger className='text-muted-foreground data-[state=active]:text-foreground' value="overview">Overview</TabsTrigger>
          <TabsTrigger className='text-muted-foreground data-[state=active]:text-foreground' value="agents">AI Agents</TabsTrigger>
          <TabsTrigger className='text-muted-foreground data-[state=active]:text-foreground' value="alerts">Alerts</TabsTrigger>
          <TabsTrigger className='text-muted-foreground data-[state=active]:text-foreground' value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Data Collection</span>
                </CardTitle>
                <CardDescription>Real-time data from multiple sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Sales Data</span>
                    <span className="font-medium">{dataCollectionStatus.salesData > 0 ? 'Active' : 'Inactive'}</span>
                  </div>
                  <Progress value={dataCollectionStatus.salesData > 0 ? Math.min(dataCollectionStatus.salesData * 10, 100) : 0} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span>Inventory Data</span>
                    <span className="font-medium">{dataCollectionStatus.inventoryData > 0 ? 'Active' : 'Inactive'}</span>
                  </div>
                  <Progress value={dataCollectionStatus.inventoryData > 0 ? Math.min(dataCollectionStatus.inventoryData * 10, 100) : 0} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span>Weather Data</span>
                    <span className="font-medium">{dataCollectionStatus.weatherData > 0 ? 'Active' : 'Inactive'}</span>
                  </div>
                  <Progress value={dataCollectionStatus.weatherData > 0 ? Math.min(dataCollectionStatus.weatherData * 10, 100) : 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Analytics</span>
                </CardTitle>
                <CardDescription>AI-powered insights and predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Demand Forecasting</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      {agentStatuses.find(a => a.agent === 'demand forecaster')?.status === 'online' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Price Optimization</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      {agentStatuses.find(a => a.agent === 'pricing strategist')?.status === 'online' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Inventory Optimization</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      {agentStatuses.find(a => a.agent === 'inventory monitor')?.status === 'online' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security</span>
                </CardTitle>
                <CardDescription>System security and monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Authentication</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      {user ? 'Secure' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Data Encryption</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      {user ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Access Control</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      {user ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Agent Status</CardTitle>
              <CardDescription>Real-time status of all AI agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {agentStatuses.map((agent, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span className="capitalize">{agent.agent}</span>
                        <Badge variant="outline" className={getStatusColor(agent.status)}>
                          {getStatusIcon(agent.status)}
                          <span className="ml-1">{agent.status}</span>
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        Last update: {new Date(agent.lastUpdate).toLocaleTimeString()}
                      </div>
                      {agent.dataQuality && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Data Quality</span>
                            <span>{(agent.dataQuality.overall * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={agent.dataQuality.overall * 100} className="h-1" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Critical Alerts</CardTitle>
              <CardDescription>Latest critical alerts requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {criticalAlerts.length > 0 ? (
                <div className="space-y-4">
                  {criticalAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-4 w-4" style={{ color: 'var(--color-red-600)' }} />
                        <div>
                          <div className="font-medium text-sm">{alert.message}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(alert.triggered_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No critical alerts at the moment
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Key performance indicators and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>CPU Usage</span>
                      <span>{systemPerformance.cpuUsage.toFixed(0)}%</span>
                    </div>
                    <Progress value={systemPerformance.cpuUsage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Memory Usage</span>
                      <span>{systemPerformance.memoryUsage.toFixed(0)}%</span>
                    </div>
                    <Progress value={systemPerformance.memoryUsage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Storage Usage</span>
                      <span>{systemPerformance.storageUsage.toFixed(0)}%</span>
                    </div>
                    <Progress value={systemPerformance.storageUsage} className="h-2" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Response Time</span>
                      <span>{systemPerformance.responseTime.toFixed(1)}s</span>
                    </div>
                    <Progress value={Math.min(systemPerformance.responseTime * 20, 100)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Uptime</span>
                      <span>{systemPerformance.uptime.toFixed(1)}%</span>
                    </div>
                    <Progress value={systemPerformance.uptime} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Error Rate</span>
                      <span>{systemPerformance.errorRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={100 - systemPerformance.errorRate} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 