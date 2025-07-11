'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

export function HomeClient() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold mb-6">
        AI powered Inventory Management System
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
        An AI-powered Inventory Management System for modern businesses.
      </p>

      {/* Show auth buttons only when not logged in */}
      {!loading && !user && (
        <div className="flex gap-4">
          <Link href="/login">
            <Button size="lg">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">Sign Up</Button>
          </Link>
        </div>
      )}

      {/* Show dashboard/profile buttons when logged in */}
      {!loading && user && (
        <div className="flex gap-4">
          <Link href="/dashboard">
            <Button size="lg">Go to Dashboard</Button>
          </Link>
          <Link href="/profile">
            <Button variant="outline" size="lg">View Profile</Button>
          </Link>
        </div>
      )}

      {/* Show loading state */}
      {loading && (
        <div className="flex gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Loading...</span>
        </div>
      )}



      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">Next.js 15</h3>
          <p className="text-sm text-muted-foreground">
            Latest version with App Router and Server Components
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">Supabase</h3>
          <p className="text-sm text-muted-foreground">
            Authentication, storage, and PostgreSQL database
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">Drizzle ORM</h3>
          <p className="text-sm text-muted-foreground">
            Type-safe database queries and migrations
          </p>
        </div>
      </div>
    </div>
  );
} 