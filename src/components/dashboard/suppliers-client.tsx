'use client'

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Truck, 
  Clock, 
  Star, 
  RefreshCw, 
  Loader2,
  Activity,
  CheckCircle,
  Filter,
  Plus
} from 'lucide-react';
import { ExtendedSupplier, ExtendedPurchaseOrder } from '@/lib/types';
import apiCache from '@/lib/api-cache';

export function SuppliersClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('suppliers');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Suppliers data
  const [suppliers, setSuppliers] = useState<ExtendedSupplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<ExtendedPurchaseOrder[]>([]);
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    activeSuppliers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    averageLeadTime: 0
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch suppliers data
  const fetchSuppliersData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch supplier agent data
      const supplierAgentResponse = await apiCache.get('/api/agents/supplier-agent', {
        ttl: 60 * 10000, // 1 hour cache
        cacheKey: 'suppliers-agent'
      });

      if (supplierAgentResponse.status === 200) {
        const data = supplierAgentResponse.data;
        setSuppliers(data.suppliers || []);
        setPurchaseOrders(data.purchaseOrders || []);
        setStats(data.stats || {
          totalSuppliers: 0,
          activeSuppliers: 0,
          totalOrders: 0,
          pendingOrders: 0,
          averageLeadTime: 0
        });
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching suppliers data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial data fetch
  useEffect(() => {
    fetchSuppliersData();
  }, [fetchSuppliersData]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(fetchSuppliersData, 120000);
    return () => clearInterval(interval);
  }, [fetchSuppliersData]);

  // Filter suppliers based on status
  const filteredSuppliers = suppliers.filter(supplier => {
    if (statusFilter !== 'all' && supplier.status !== statusFilter) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 0.9) return 'bg-green-100 text-green-800 border-green-200';
    if (performance >= 0.7) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (performance >= 0.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const handleCreateOrder = async (supplierId: string) => {
    try {
      const response = await apiCache.post('/api/suppliers/orders', {
        supplier_id: supplierId,
        auto_generated: true
      }, {
        ttl: 0, // No cache for mutations
        invalidateOnSuccess: true
      });

      if (response.status === 200) {
        // Refresh data to show new order
        fetchSuppliersData();
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight ml-10 -mt-3 md:ml-0 md:-mt-0">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage supplier relationships and purchase orders
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={fetchSuppliersData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <span className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Supplier Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Package className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              All suppliers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4" style={{ color: 'var(--color-green-600)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Truck className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4" style={{ color: 'var(--color-yellow-600)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting delivery
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Lead Time</CardTitle>
            <Activity className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageLeadTime.toFixed(1)}d</div>
            <p className="text-xs text-muted-foreground">
              Days to delivery
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger className='text-muted-foreground data-[state=active]:text-foreground' value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger className='text-muted-foreground data-[state=active]:text-foreground' value="orders">Purchase Orders</TabsTrigger>
        </TabsList>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filter by status:</span>
            <div className="flex space-x-2">
              {['all', 'active', 'inactive', 'suspended'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Suppliers List */}
          <Card>
            <CardHeader>
              <CardTitle>Supplier Directory</CardTitle>
              <CardDescription>
                {filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredSuppliers.length > 0 ? (
                <div className="space-y-4">
                  {filteredSuppliers.map((supplier) => (
                    <div key={supplier.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-medium">{supplier.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {supplier.location} • {supplier.contact_email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3" style={{ color: 'var(--color-yellow-600)' }} />
                            <span className={`text-sm font-medium ${getRatingColor(supplier.rating ?? 0)}`}>
                              {(supplier.rating ?? 0).toFixed(1)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {supplier.orders?.total ?? 0} orders
                          </div>
                        </div>
                        <Badge variant="outline" className={getStatusColor(supplier.status)}>
                          {supplier.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateOrder(supplier.id)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Order
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No suppliers found matching the current filters
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>Recent and pending purchase orders</CardDescription>
            </CardHeader>
            <CardContent>
              {purchaseOrders.length > 0 ? (
                <div className="space-y-4">
                  {purchaseOrders.slice(0, 10).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-medium">{order.product_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.supplier_name} • Qty: {order.order_quantity}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={getStatusColor(order.order_status)}>
                          {order.order_status}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {new Date(order.ordered_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No purchase orders available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 