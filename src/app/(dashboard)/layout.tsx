import { ReactNode } from 'react';
import { PersistentDashboardLayout } from '@/components/persistent-dashboard-layout';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <PersistentDashboardLayout>{children}</PersistentDashboardLayout>;
} 