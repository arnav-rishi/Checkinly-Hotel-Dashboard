
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, KeyRound, Battery, Wifi, AlertTriangle, CheckCircle, Lock, Unlock } from 'lucide-react';

export const SmartLocks = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const smartLockData = [
    {
      room: '18',
      status: 'Unlocked',
      battery: 67,
      lastHeartbeat: '7/11/2025, 10:04:26 PM',
      error: "Can't detect",
      signal: 'good'
    },
    {
      room: '19',
      status: 'Locked',
      battery: 100,
      lastHeartbeat: '7/11/2025, 10:04:40 PM',
      error: "Can't detect lock",
      signal: 'excellent'
    },
    {
      room: '5',
      status: 'Unlocked',
      battery: 23,
      lastHeartbeat: '7/11/2025, 10:04:49 PM',
      error: "Can't detect",
      signal: 'poor'
    },
    {
      room: '12',
      status: 'Locked',
      battery: 89,
      lastHeartbeat: '7/11/2025, 10:03:15 PM',
      error: null,
      signal: 'good'
    },
    {
      room: '24',
      status: 'Unlocked',
      battery: 45,
      lastHeartbeat: '7/11/2025, 10:02:30 PM',
      error: "Low battery warning",
      signal: 'excellent'
    },
    {
      room: '33',
      status: 'Locked',
      battery: 92,
      lastHeartbeat: '7/11/2025, 10:01:45 PM',
      error: null,
      signal: 'good'
    }
  ];

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return 'text-green-600';
    if (battery > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'excellent': return <Wifi className="w-4 h-4 text-green-600" />;
      case 'good': return <Wifi className="w-4 h-4 text-blue-600" />;
      case 'poor': return <Wifi className="w-4 h-4 text-red-600" />;
      default: return <Wifi className="w-4 h-4 text-gray-400" />;
    }
  };

  const stats = [
    { title: 'Total Smart Locks', value: '91', icon: KeyRound, color: 'blue' },
    { title: 'Online Locks', value: '87', icon: CheckCircle, color: 'green' },
    { title: 'Low Battery', value: '8', icon: Battery, color: 'yellow' },
    { title: 'Offline/Error', value: '4', icon: AlertTriangle, color: 'red' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Smart Lock Status</h1>
        <p className="text-gray-600 mt-1">Monitor and control smart lock devices across all rooms</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by room number..."
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
              <SelectItem value="locked">Locked</SelectItem>
              <SelectItem value="unlocked">Unlocked</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          
          <Select>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Battery" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="high">High (>50%)</SelectItem>
              <SelectItem value="medium">Medium (20-50%)</SelectItem>
              <SelectItem value="low">Low (<20%)</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Smart Lock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {smartLockData.map((lock) => (
          <Card key={lock.room} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Room: {lock.room}</CardTitle>
                <Badge className={lock.status === 'Locked' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {lock.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Battery Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Battery:</span>
                <div className="flex items-center gap-2">
                  <Battery className={`w-4 h-4 ${getBatteryColor(lock.battery)}`} />
                  <span className={`font-medium ${getBatteryColor(lock.battery)}`}>{lock.battery}%</span>
                </div>
              </div>

              {/* Signal Strength */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Signal:</span>
                <div className="flex items-center gap-2">
                  {getSignalIcon(lock.signal)}
                  <span className="text-sm capitalize">{lock.signal}</span>
                </div>
              </div>

              {/* Last Heartbeat */}
              <div className="space-y-1">
                <span className="text-sm text-gray-600">Last Heartbeat:</span>
                <p className="text-xs text-gray-500">{lock.lastHeartbeat}</p>
              </div>

              {/* Error Status */}
              {lock.error && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">Error: {lock.error}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant={lock.status === 'Locked' ? 'outline' : 'default'}
                  className="flex-1"
                >
                  <Lock className="w-3 h-3 mr-1" />
                  Lock
                </Button>
                <Button 
                  size="sm" 
                  variant={lock.status === 'Unlocked' ? 'outline' : 'default'}
                  className="flex-1"
                >
                  <Unlock className="w-3 h-3 mr-1" />
                  Unlock
                </Button>
                <Button size="sm" variant="outline">
                  View Access Events
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
