
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Bed, 
  CreditCard, 
  BarChart3, 
  Settings,
  Calendar,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHotel } from '@/hooks/useHotel';

export const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Rooms', href: '/rooms', icon: Bed },
  { name: 'Guests', href: '/guests', icon: Users },
  { name: 'Bookings', href: '/calendar', icon: Calendar },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Smart Locks', href: '/smart-locks', icon: Lock },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();
  const { hotel } = useHotel();

  return (
    <div className="hidden md:flex w-64 bg-background border-r border-border h-full flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground">
          {hotel?.name || 'Hotel Manager'}
        </h1>
        {hotel?.name && (
          <p className="text-sm text-muted-foreground mt-1">Management Dashboard</p>
        )}
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
