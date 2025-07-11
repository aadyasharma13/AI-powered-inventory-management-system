'use client'

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export function DashboardClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show dashboard if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Manage your inventory here.
        </p>
      </div>

      <div className="space-y-6">
        {/* Dashboard content goes here */}
        <p className="text-lg">Hello, {user.email ?? 'User'}</p>
        <p className="text-sm text-muted-foreground">
          This is your dashboard where you can manage your tasks and view analytics.
        </p>
      </div>
    </div>
  );
} 