'use client'

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { SidebarProvider } from '@/contexts/sidebar-context';

interface PersistentDashboardLayoutProps {
  children: ReactNode;
}

export function PersistentDashboardLayout({ children }: PersistentDashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-64">
          <main className="flex-1">
            <div className="container mx-auto px-4 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 