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
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  Calendar, 
  Target,
  RefreshCw,
  Loader2,
  CloudRain,
  Thermometer,
  Clock,
  Eye,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { DemandForecast, WeatherForecast, SeasonalTrend } from '@/lib/types';
import apiCache from '@/lib/api-cache';

export function ForecastingClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('demand');
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Forecasting data
  const [demandForecasts, setDemandForecasts] = useState<DemandForecast[]>([]);
  const [weatherForecasts, setWeatherForecasts] = useState<WeatherForecast[]>([]);
  const [seasonalTrends, setSeasonalTrends] = useState<SeasonalTrend[]>([]);
  const [modelAccuracy, setModelAccuracy] = useState(0.94);
  const [modelStats, setModelStats] = useState({
    activeModels: 0,
    predictionHorizon: 0,
    dataPoints: 0
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch forecasting data
  const fetchForecastingData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch demand forecaster data
      const demandForecasterResponse = await apiCache.get('/api/agents/demand-forecaster', {
        ttl: 5 * 60 * 1000, // 5 minutes cache
        cacheKey: `forecasting-demand-${timeRange}`
      });

      if (demandForecasterResponse.status === 200) {
        const data = demandForecasterResponse.data;
        setDemandForecasts(data.forecasts || []);
        setModelAccuracy(data.modelAccuracy || 0.94);
        setModelStats({
          activeModels: data.activeModels || 0,
          predictionHorizon: data.predictionHorizon || 30,
          dataPoints: data.dataPoints || 0
        });
      }

      // Fetch weather forecasts
      const weatherResponse = await apiCache.get('/api/forecasting/weather', {
        ttl: 10 * 60 * 1000, // 10 minutes cache
        cacheKey: `forecasting-weather-${timeRange}`
      });

      if (weatherResponse.status === 200) {
        setWeatherForecasts(weatherResponse.data || []);
      }

      // Fetch seasonal trends
      const seasonalResponse = await apiCache.get('/api/forecasting/seasonal', {
        ttl: 60 * 60 * 1000, // 1 hour cache
        cacheKey: 'forecasting-seasonal'
      });

      if (seasonalResponse.status === 200) {
        setSeasonalTrends(seasonalResponse.data || []);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching forecasting data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, timeRange]);

  // Initial data fetch
  useEffect(() => {
    fetchForecastingData();
  }, [fetchForecastingData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchForecastingData, 300000);
    return () => clearInterval(interval);
  }, [fetchForecastingData]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 0.7) return 'text-red-600';
    if (impact >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'rainy':
      case 'rain':
        return <CloudRain className="w-4 h-4" style={{ color: 'var(--color-blue-600)' }} />;
      case 'hot':
      case 'sunny':
        return <Thermometer className="w-4 h-4" style={{ color: 'var(--color-orange-600)' }} />;
      case 'cold':
      case 'snow':
        return <Thermometer className="w-4 h-4" style={{ color: 'var(--color-blue-400)' }} />;
      default:
        return <Activity className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading forecasting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight ml-10 -mt-3 md:ml-0 md:-mt-0">Forecasting</h1>
          <p className="text-muted-foreground">
            AI-powered demand predictions and trend analysis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={fetchForecastingData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <span className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Model Performance */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
            <Target className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(modelAccuracy * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <BarChart3 className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelStats.activeModels}</div>
            <p className="text-xs text-muted-foreground">
              ML models running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prediction Horizon</CardTitle>
            <Calendar className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelStats.predictionHorizon} days</div>
            <p className="text-xs text-muted-foreground">
              Forecast period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelStats.dataPoints > 1000000 ? `${(modelStats.dataPoints / 1000000).toFixed(1)}M` : modelStats.dataPoints > 1000 ? `${(modelStats.dataPoints / 1000).toFixed(1)}K` : modelStats.dataPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Historical data
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demand">Demand Forecast</TabsTrigger>
          <TabsTrigger value="weather">Weather Impact</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Trends</TabsTrigger>
        </TabsList>

        {/* Demand Forecast Tab */}
        <TabsContent value="demand" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Demand Predictions</CardTitle>
              <CardDescription>AI-powered demand forecasting for inventory optimization</CardDescription>
            </CardHeader>
            <CardContent>
              {demandForecasts.length > 0 ? (
                <div className="space-y-4">
                  {demandForecasts.slice(0, 10).map((forecast, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-medium">{forecast.product_name}</div>
                          <div className="text-sm text-muted-foreground">
                            Current: {forecast.current_demand} • Predicted: {forecast.predicted_demand}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={getConfidenceColor(forecast.confidence)}>
                          {(forecast.confidence * 100).toFixed(1)}% confidence
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {forecast.forecast_date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No demand forecasts available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weather Impact Tab */}
        <TabsContent value="weather" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weather Impact Analysis</CardTitle>
              <CardDescription>Weather forecasts and their impact on demand</CardDescription>
            </CardHeader>
            <CardContent>
              {weatherForecasts.length > 0 ? (
                <div className="space-y-4">
                  {weatherForecasts.slice(0, 10).map((forecast, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getWeatherIcon(forecast.condition)}
                        <div>
                          <div className="font-medium">{forecast.date}</div>
                          <div className="text-sm text-muted-foreground">
                            {forecast.temperature}°C • {forecast.humidity}% humidity
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${getImpactColor(forecast.impact_score)}`}>
                          Impact: {(forecast.impact_score * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {forecast.affected_products.length} products affected
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No weather forecasts available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seasonal Trends Tab */}
        <TabsContent value="seasonal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Trends</CardTitle>
              <CardDescription>Monthly demand patterns and seasonal adjustments</CardDescription>
            </CardHeader>
            <CardContent>
              {seasonalTrends.length > 0 ? (
                <div className="space-y-4">
                  {seasonalTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{trend.month}</div>
                        <div className="text-sm text-muted-foreground">
                          Demand multiplier: {trend.demand_multiplier}x
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Top products: {trend.top_products.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {trend.recommendations.length} recommendations
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No seasonal trends available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 