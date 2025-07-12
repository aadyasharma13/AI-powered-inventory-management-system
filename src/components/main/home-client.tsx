'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Zap, 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Database, 
  Bell,
  Loader2,
  Package
} from 'lucide-react';

export function HomeClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGetStarted = () => {
    setIsLoading(true);
    router.push('/register');
  };

  const handleLearnMore = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center space-y-6">
            <Badge variant="outline" className="inline-flex items-center space-x-2 px-4 py-2">
              <Zap className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
              <span>AI-Powered Inventory Management</span>
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Intelligent Inventory
              <span className="block" style={{ color: 'var(--color-primary)' }}>
                Management System
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Leverage artificial intelligence to optimize inventory levels, predict demand, 
              and automate supply chain operations across your entire retail network.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                disabled={isLoading}
                className="text-lg px-8 py-3"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-5 w-5 mr-2" />
                )}
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleLearnMore}
                className="text-lg px-8 py-3"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our intelligent agents work together to provide comprehensive inventory management solutions
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Database className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
                </div>
                <CardTitle>Data Collection Agent</CardTitle>
                <CardDescription>
                  Automatically gathers real-time data from multiple sources including POS systems, 
                  weather APIs, and IoT sensors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Data Sources</span>
                    <span className="font-medium">15+</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Update Frequency</span>
                    <span className="font-medium">Real-time</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Accuracy</span>
                    <span className="font-medium">99.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
                </div>
                <CardTitle>Demand Forecaster</CardTitle>
                <CardDescription>
                  Uses machine learning to predict future demand patterns based on historical data, 
                  seasonal trends, and external factors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Prediction Horizon</span>
                    <span className="font-medium">30 days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Accuracy</span>
                    <span className="font-medium">94.5%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Models</span>
                    <span className="font-medium">5+</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
                </div>
                <CardTitle>Inventory Monitor</CardTitle>
                <CardDescription>
                  Continuously monitors stock levels and automatically triggers alerts 
                  when inventory falls below optimal thresholds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Monitoring</span>
                    <span className="font-medium">24/7</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Response Time</span>
                    <span className="font-medium">&lt;1s</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Coverage</span>
                    <span className="font-medium">100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
                </div>
                <CardTitle>Alert Manager</CardTitle>
                <CardDescription>
                  Intelligent alert system that prioritizes notifications and provides 
                  actionable insights for inventory issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Alert Types</span>
                    <span className="font-medium">8+</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>False Positives</span>
                    <span className="font-medium">&lt;2%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Response Rate</span>
                    <span className="font-medium">99.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
                </div>
                <CardTitle>Pricing Strategist</CardTitle>
                <CardDescription>
                  Dynamic pricing optimization that adjusts product prices based on 
                  demand, competition, and inventory levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Price Updates</span>
                    <span className="font-medium">Daily</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Revenue Impact</span>
                    <span className="font-medium">+12%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Products</span>
                    <span className="font-medium">10K+</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Package className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
                </div>
                <CardTitle>Supplier Agent</CardTitle>
                <CardDescription>
                  Automated supplier communication and order management with 
                  intelligent reorder point optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Suppliers</span>
                    <span className="font-medium">500+</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Order Accuracy</span>
                    <span className="font-medium">99.7%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Lead Time</span>
                    <span className="font-medium">-30%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                4,700+
              </div>
              <p className="text-muted-foreground">Stores Managed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                10M+
              </div>
              <p className="text-muted-foreground">Products Tracked</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                99.9%
              </div>
              <p className="text-muted-foreground">System Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                $2.4B
              </div>
              <p className="text-muted-foreground">Revenue Optimized</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Transform Your Inventory Management?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of retailers who have already optimized their operations 
            with our AI-powered inventory management system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              disabled={isLoading}
              className="text-lg px-8 py-3"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <ArrowRight className="h-5 w-5 mr-2" />
              )}
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleLearnMore}
              className="text-lg px-8 py-3"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 