'use client'

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Login error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h2 className="text-2xl font-bold mb-4">Login Error</h2>
      <p className="text-muted-foreground mb-6">
        Something went wrong while loading the login page.
      </p>
      <div className="space-x-4">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => window.location.href = '/'}>
          Go home
        </Button>
      </div>
    </div>
  );
} 