'use client'

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  LayoutDashboard, 
  Bell, 
  BarChart3, 
  TrendingUp, 
  Truck, 
  Settings,
  Users,
  Package,
  Activity,
  Target,
  Zap,
  CloudRain,
  ShoppingCart,
  Calendar,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/contexts/auth-context';
import { useSidebar } from '@/contexts/sidebar-context';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Alerts',
    href: '/alerts',
    icon: Bell,
    badge: '3',
  },
  {
    title: 'Analytics',
    href: '/',
    icon: BarChart3,
    children: [
      {
        title: 'Sales Analytics',
        href: '/sales',
        icon: ShoppingCart,
      },
      {
        title: 'Inventory Analytics',
        href: '/inventory',
        icon: Package,
      },
      {
        title: 'Performance Metrics',
        href: '/performance',
        icon: Target,
      },
    ],
  },
  {
    title: 'Forecasting',
    href: '/',
    icon: TrendingUp,
    children: [
      {
        title: 'Demand Forecast',
        href: '/demand',
        icon: Activity,
      },
      {
        title: 'Weather Impact',
        href: '/weather',
        icon: CloudRain,
      },
      {
        title: 'Seasonal Trends',
        href: '/seasonal',
        icon: Calendar,
      },
    ],
  },
  {
    title: 'Suppliers',
    href: '/suppliers',
    icon: Truck,
  },
  {
    title: 'Settings',
    href: '/profile',
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { expandedItems, toggleExpanded, setExpandedItems } = useSidebar();

  // Auto-expand parent menu items when child route is active
  useEffect(() => {
    const newExpandedItems: string[] = [];
    
    sidebarItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => pathname === child.href);
        if (hasActiveChild && !expandedItems.includes(item.title)) {
          newExpandedItems.push(item.title);
        }
      }
    });

    if (newExpandedItems.length > 0) {
      setExpandedItems([...expandedItems, ...newExpandedItems]);
    }
  }, [pathname, expandedItems, setExpandedItems]);

  const isActive = (href: string) => pathname === href;
  const isChildActive = (children: SidebarItem[]) => 
    children.some(child => pathname === child.href);

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.title);
    const hasActiveChild = item.children && isChildActive(item.children);
    const isItemActive = isActive(item.href) || hasActiveChild;

    return (
      <div key={item.title}>
        <div className="relative">
          {item.children ? (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-10 px-3",
                level > 0 && "ml-4",
                isItemActive && "bg-accent text-accent-foreground"
              )}
              onClick={() => toggleExpanded(item.title)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span className="flex-1 text-left">{item.title}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <Link href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-10 px-3",
                  level > 0 && "ml-4",
                  isItemActive && "bg-accent text-accent-foreground"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span className="flex-1 text-left">{item.title}</span>
                {item.badge && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Button>
            </Link>
          )}
        </div>
        
        {item.children && isExpanded && (
          <div className="mt-1">
            {item.children.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("flex h-full", className)}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 lg:bg-background lg:border-r">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Team ASAP</span>
            </Link>
          </div>
          
          <ScrollArea className="flex-1 px-3">
            <nav className="space-y-1">
              {sidebarItems.map(item => renderSidebarItem(item))}
            </nav>
          </ScrollArea>
          
          <div className="flex-shrink-0 p-4 border-t">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.email || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-screen">
            <div className="flex items-center flex-shrink-0 px-4 py-6 border-b">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Team ASAP</span>
              </Link>
            </div>
            
            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="space-y-1">
                {sidebarItems.map(item => renderSidebarItem(item))}
              </nav>
            </ScrollArea>
            
            <div className="flex-shrink-0 p-4 border-t">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.email || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => signOut()}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 