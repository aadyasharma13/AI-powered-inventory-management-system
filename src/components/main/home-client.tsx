'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Zap,
  Loader2
} from 'lucide-react';

export function HomeClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/pos');
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