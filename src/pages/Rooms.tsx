
import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoomCard } from '@/components/RoomCard';
import { RoomStatusCard } from '@/components/RoomStatusCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const Rooms = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const roomStatuses = [
    { status: 'Occupied', count: 45, percentage: 48.5, color: 'bg-green-500' },
    { status: 'Available', count: 23, percentage: 25.1, color: 'bg-blue-500' },
    { status: 'Maintenance', count: 8, percentage: 8.8, color: 'bg-yellow-500' },
    { status: 'Cleaning', count: 12, percentage: 13.2, color: 'bg-orange-500' },
    { status: 'Out Of Order', count: 3, percentage: 3.3, color: 'bg-red-500' },
  ];

  const rooms = [
    {
      number: '101',
      floor: '1',
      type: 'Deluxe Room',
      status: 'Occupied',
      guest: 'John Smith',
      guestId: 'G-1001',
      statusColor: 'bg-blue-600',
      actions: ['View Details', 'Check Out']
    },
    {
      number: '102',
      floor: '1',
      type: 'Twin Bed Room',
      status: 'Available',
      statusColor: 'bg-green-600',
      actions: ['View Details', 'Book Room']
    },
    {
      number: '103',
      floor: '1',
      type: 'Suite Room',
      guest: 'Emma Johnson',
      status: 'Occupied',
      statusColor: 'bg-blue-600',
      actions: ['View Details']
    },
    {
      number: '201',
      floor: '2',
      type: 'Deluxe Room',
      status: 'Cleaning',
      statusColor: 'bg-orange-600',
      actions: ['View Details']
    },
    {
      number: '202',
      floor: '2',
      type: 'Twin Bed Room',
      status: 'Maintenance',
      statusColor: 'bg-yellow-600',
      actions: ['View Details']
    },
    {
      number: '203',
      floor: '2',
      type: 'Suite Room',
      status: 'Occupied',
      statusColor: 'bg-blue-600',
      actions: ['View Details']
    },
    {
      number: '301',
      floor: '3',
      type: 'Deluxe Room',
      status: 'Available',
      statusColor: 'bg-green-600',
      actions: ['View Details', 'Book Room']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Room Status Summary */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Room Status</h2>
          <span className="text-sm text-gray-500">91 Total Rooms</span>
        </div>
        
        <div className="space-y-3 mb-8">
          {roomStatuses.map((status) => (
            <RoomStatusCard key={status.status} {...status} />
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by room number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Room Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Room Types</SelectItem>
              <SelectItem value="deluxe">Deluxe Room</SelectItem>
              <SelectItem value="suite">Suite Room</SelectItem>
              <SelectItem value="twin">Twin Bed Room</SelectItem>
            </SelectContent>
          </Select>
          
          <Select>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Floors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Floors</SelectItem>
              <SelectItem value="1">Floor 1</SelectItem>
              <SelectItem value="2">Floor 2</SelectItem>
              <SelectItem value="3">Floor 3</SelectItem>
            </SelectContent>
          </Select>
          
          <Select>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <RoomCard key={room.number} {...room} />
        ))}
      </div>
    </div>
  );
};
