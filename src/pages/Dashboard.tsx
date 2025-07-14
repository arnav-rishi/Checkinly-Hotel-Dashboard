import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoomStatusCard } from '@/components/RoomStatusCard';
import { RevenueChart } from '@/components/RevenueChart';
import { useApi } from '@/hooks/useApi';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Users, CreditCard, KeyRound, TrendingUp, BarChart3 } from 'lucide-react';

interface RoomStatus {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

interface DashboardStats {
  totalRooms: number;
  totalGuests: number;
  totalRevenue: number;
  occupancyRate: number;
}

export const Dashboard = () => {
  const [roomStatuses, setRoomStatuses] = useState<RoomStatus[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    totalGuests: 0,
    totalRevenue: 0,
    occupancyRate: 0
  });
  
  const { execute: fetchRooms, loading: roomsLoading } = useApi();
  const { execute: fetchBookings, loading: bookingsLoading } = useApi();
  const { execute: fetchPayments, loading: paymentsLoading } = useApi();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch rooms data
      const roomsResult = await fetchRooms(async () => {
        const { data, error } = await supabase
          .from('rooms')
          .select('*');
        if (error) throw error;
        return data;
      });

      // Fetch bookings data
      const bookingsResult = await fetchBookings(async () => {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, guests(*)')
          .eq('status', 'checked_in');
        if (error) throw error;
        return data;
      });

      // Fetch payments data
      const paymentsResult = await fetchPayments(async () => {
        const { data, error } = await supabase
          .from('payments')
          .select('amount')
          .eq('payment_status', 'completed');
        if (error) throw error;
        return data;
      });

      if (roomsResult && bookingsResult && paymentsResult) {
        // Calculate room statuses
        const statusCounts = roomsResult.reduce((acc: any, room: any) => {
          acc[room.status] = (acc[room.status] || 0) + 1;
          return acc;
        }, {});

        const totalRooms = roomsResult.length;
        const roomStatusData: RoomStatus[] = [
          { 
            status: 'Available', 
            count: statusCounts.available || 0, 
            percentage: ((statusCounts.available || 0) / totalRooms) * 100,
            color: 'bg-green-500' 
          },
          { 
            status: 'Occupied', 
            count: statusCounts.occupied || 0, 
            percentage: ((statusCounts.occupied || 0) / totalRooms) * 100,
            color: 'bg-blue-500' 
          },
          { 
            status: 'Maintenance', 
            count: statusCounts.maintenance || 0, 
            percentage: ((statusCounts.maintenance || 0) / totalRooms) * 100,
            color: 'bg-yellow-500' 
          },
          { 
            status: 'Cleaning', 
            count: statusCounts.cleaning || 0, 
            percentage: ((statusCounts.cleaning || 0) / totalRooms) * 100,
            color: 'bg-orange-500' 
          },
        ];

        setRoomStatuses(roomStatusData);

        // Calculate dashboard stats
        const totalRevenue = paymentsResult.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0);
        const occupancyRate = totalRooms > 0 ? ((statusCounts.occupied || 0) / totalRooms) * 100 : 0;

        setStats({
          totalRooms,
          totalGuests: bookingsResult.length,
          totalRevenue,
          occupancyRate
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const isLoading = roomsLoading || bookingsLoading || paymentsLoading;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Hotel Management Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening at your properties.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Rooms</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalRooms}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Active Guests</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalGuests}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Occupancy Rate</p>
                <p className="text-2xl font-bold text-foreground">{stats.occupancyRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Revenue Trends (Last 7 Days)
          </CardTitle>
          <p className="text-sm text-muted-foreground">Daily revenue from completed payments</p>
        </CardHeader>
        <CardContent>
          <RevenueChart />
        </CardContent>
      </Card>

      {/* Room Status */}
      <Card>
        <CardHeader>
          <CardTitle>Room Status Overview</CardTitle>
          <p className="text-sm text-muted-foreground">Current status of all rooms in your hotel</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {roomStatuses.map((status) => (
                <RoomStatusCard key={status.status} {...status} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
