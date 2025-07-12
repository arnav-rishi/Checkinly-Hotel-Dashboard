
import React, { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GuestCard } from '@/components/GuestCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const Guests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const guests = [
    {
      name: 'Sarah Johnson',
      guestId: '#H001',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      room: '305A',
      dates: '2024-01-15 - 2024-01-18',
      status: 'Checked In',
      statusColor: 'bg-green-100 text-green-800',
      verified: true
    },
    {
      name: 'Michael Chen',
      guestId: '#H002',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 987-6543',
      room: '210B',
      dates: '2024-01-16 - 2024-01-20',
      status: 'Reserved',
      statusColor: 'bg-blue-100 text-blue-800',
      verified: false
    },
    {
      name: 'David Rodriguez',
      guestId: '#H003',
      email: 'david.rodriguez@email.com',
      phone: '+1 (555) 456-7890',
      room: '118C',
      dates: '2024-01-10 - 2024-01-15',
      status: 'Checked Out',
      statusColor: 'bg-gray-100 text-gray-800',
      verified: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hotel Management Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening at your properties.</p>
        </div>
      </div>

      {/* Guest Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Guest Management</h2>
          <p className="text-gray-600">Manage guest information, check-ins, and reservations</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Guest
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search guests by name, email, or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <Select>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="checked-in">Checked In</SelectItem>
              <SelectItem value="checked-out">Checked Out</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Guest Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guests.map((guest) => (
          <GuestCard key={guest.guestId} {...guest} />
        ))}
      </div>
    </div>
  );
};
