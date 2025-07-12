
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Building2, 
  Bed, 
  Users, 
  CreditCard, 
  Shield, 
  Bell,
  Settings 
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/', icon: BarChart3 },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Hotels', href: '/hotels', icon: Building2 },
  { name: 'Rooms', href: '/rooms', icon: Bed },
  { name: 'Guests', href: '/guests', icon: Users },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Access Control', href: '/access-control', icon: Shield },
  { name: 'Subscriptions', href: '/subscriptions', icon: Bell },
  { name: 'Security', href: '/security', icon: Shield },
];

export const Sidebar = () => {
  return (
    <div className="w-64 bg-white border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-foreground">HotelOS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Settings */}
      <div className="p-4">
        <NavLink
          to="/settings"
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </NavLink>
      </div>
    </div>
  );
};
