'use client'

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Dashboard Error</h2>
        <p className="text-muted-foreground mb-6">
          Something went wrong while loading the dashboard.
        </p>
        <div className="space-x-4">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
} 