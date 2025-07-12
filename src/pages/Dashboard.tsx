
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoomStatusCard } from '@/components/RoomStatusCard';

export const Dashboard = () => {
  const roomStatuses = [
    { status: 'Occupied', count: 45, percentage: 48.5, color: 'bg-green-500' },
    { status: 'Available', count: 23, percentage: 25.1, color: 'bg-blue-500' },
    { status: 'Maintenance', count: 8, percentage: 8.8, color: 'bg-yellow-500' },
    { status: 'Cleaning', count: 12, percentage: 13.2, color: 'bg-orange-500' },
    { status: 'Out Of Order', count: 3, percentage: 3.3, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hotel Management Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening at your properties.</p>
      </div>

      {/* Room Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>Room Management</CardTitle>
          <p className="text-sm text-gray-600">Manage and monitor all rooms across your properties</p>
        </CardHeader>
      </Card>

      {/* Room Status */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Room Status</h2>
          <span className="text-sm text-gray-500">91 Total Rooms</span>
        </div>
        
        <div className="space-y-3">
          {roomStatuses.map((status) => (
            <RoomStatusCard key={status.status} {...status} />
          ))}
        </div>
      </div>
    </div>
  );
};
