
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Bed, Calendar, DollarSign, Lock, TrendingUp } from 'lucide-react';
import { useRooms } from '@/hooks/useRooms';
import { useGuests } from '@/hooks/useGuests';
import { useSmartLocks } from '@/hooks/useSmartLocks';
import { usePayments } from '@/hooks/usePayments';
import { useHotel } from '@/hooks/useHotel';
import { RevenueChart } from '@/components/RevenueChart';
import { RoomStatusCard } from '@/components/RoomStatusCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const Index = () => {
  const { hotel } = useHotel();
  const { rooms, loading: roomsLoading } = useRooms();
  const { guests, loading: guestsLoading } = useGuests();
  const { smartLocks, loading: locksLoading } = useSmartLocks();
  const { payments, loading: paymentsLoading } = usePayments();

  // Calculate room statistics
  const roomStats = React.useMemo(() => {
    if (roomsLoading || !rooms) return null;
    
    const total = rooms.length;
    const available = rooms.filter(room => room.status === 'available').length;
    const occupied = rooms.filter(room => room.status === 'occupied').length;
    const maintenance = rooms.filter(room => room.status === 'maintenance').length;
    const cleaning = rooms.filter(room => room.status === 'cleaning').length;

    return { total, available, occupied, maintenance, cleaning };
  }, [rooms, roomsLoading]);

  // Calculate revenue
  const revenueStats = React.useMemo(() => {
    if (paymentsLoading || !payments) return { total: 0, thisMonth: 0 };
    
    const total = payments
      .filter(payment => payment.payment_status === 'completed')
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    
    const thisMonth = payments
      .filter(payment => {
        if (payment.payment_status !== 'completed' || !payment.paid_at) return false;
        const paymentDate = new Date(payment.paid_at);
        const now = new Date();
        return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    return { total, thisMonth };
  }, [payments, paymentsLoading]);

  // Calculate smart locks statistics
  const lockStats = React.useMemo(() => {
    if (locksLoading || !smartLocks) return { total: 0, online: 0, offline: 0 };
    
    const total = smartLocks.length;
    const online = smartLocks.filter(lock => {
      if (!lock.last_heartbeat) return false;
      const lastSeen = new Date(lock.last_heartbeat);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return lastSeen > fiveMinutesAgo;
    }).length;
    const offline = total - online;

    return { total, online, offline };
  }, [smartLocks, locksLoading]);

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Setting up your hotel...</h1>
          <p className="text-xl text-muted-foreground">Please wait while we initialize your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome to {hotel.name}</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {new Date().toLocaleDateString()}
        </Badge>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Rooms */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {roomsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{roomStats?.total || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {roomStats?.available || 0} available
            </p>
          </CardContent>
        </Card>

        {/* Current Guests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {guestsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{guests?.length || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {roomStats?.occupied || 0} rooms occupied
            </p>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">${revenueStats.thisMonth.toFixed(2)}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total: ${revenueStats.total.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {/* Smart Locks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Smart Locks</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {locksLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{lockStats.total}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {lockStats.online} online, {lockStats.offline} offline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Room Status Overview and Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Status */}
        <Card>
          <CardHeader>
            <CardTitle>Room Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {roomsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : roomStats ? (
              <>
                <RoomStatusCard 
                  status="Available" 
                  count={roomStats.available} 
                  percentage={(roomStats.available / roomStats.total) * 100}
                  color="bg-green-500"
                />
                <RoomStatusCard 
                  status="Occupied" 
                  count={roomStats.occupied} 
                  percentage={(roomStats.occupied / roomStats.total) * 100}
                  color="bg-blue-500"
                />
                <RoomStatusCard 
                  status="Maintenance" 
                  count={roomStats.maintenance} 
                  percentage={(roomStats.maintenance / roomStats.total) * 100}
                  color="bg-red-500"
                />
                <RoomStatusCard 
                  status="Cleaning" 
                  count={roomStats.cleaning} 
                  percentage={(roomStats.cleaning / roomStats.total) * 100}
                  color="bg-yellow-500"
                />
              </>
            ) : (
              <p className="text-center text-muted-foreground">No room data available</p>
            )}
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline">
              <Link to="/rooms">
                <Bed className="w-4 h-4 mr-2" />
                Manage Rooms
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/guests">
                <Users className="w-4 h-4 mr-2" />
                View Guests
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/smart-locks">
                <Lock className="w-4 h-4 mr-2" />
                Smart Locks
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
