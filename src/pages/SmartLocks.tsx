import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, KeyRound, Battery, Wifi, AlertTriangle, CheckCircle, Lock, Unlock } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SmartLock {
  id: string;
  lock_id: string;
  status: string;
  battery_level: number;
  signal_strength: number;
  last_heartbeat: string;
  error_message: string | null;
  room: {
    room_number: string;
    room_type: string;
  };
}

interface LockStats {
  totalLocks: number;
  onlineLocks: number;
  lowBattery: number;
  offlineError: number;
}

export const SmartLocks = () => {
  const [locks, setLocks] = useState<SmartLock[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [batteryFilter, setBatteryFilter] = useState('all');
  const [stats, setStats] = useState<LockStats>({
    totalLocks: 0,
    onlineLocks: 0,
    lowBattery: 0,
    offlineError: 0
  });

  const { execute: fetchLocks, loading: fetchLoading } = useApi();
  const { execute: updateLockStatus, loading: updateLoading } = useApi();
  const { toast } = useToast();

  useEffect(() => {
    loadLocks();
    // Set up real-time updates
    const interval = setInterval(loadLocks, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadLocks = async () => {
    const result = await fetchLocks(async () => {
      const { data, error } = await supabase
        .from('smart_locks')
        .select(`
          *,
          room!inner(room_number, room_type)
        `)
        .order('room.room_number');
      
      if (error) throw error;
      return data;
    });

    if (result) {
      setLocks(result);
      calculateStats(result);
    }
  };

  const calculateStats = (locksData: SmartLock[]) => {
    const totalLocks = locksData.length;
    const onlineLocks = locksData.filter(lock => 
      lock.status !== 'offline' && lock.status !== 'error'
    ).length;
    const lowBattery = locksData.filter(lock => 
      lock.battery_level <= 20
    ).length;
    const offlineError = locksData.filter(lock => 
      lock.status === 'offline' || lock.status === 'error'
    ).length;

    setStats({
      totalLocks,
      onlineLocks,
      lowBattery,
      offlineError
    });
  };

  const handleLockAction = async (lockId: string, action: 'lock' | 'unlock') => {
    try {
      await updateLockStatus(async () => {
        const { error } = await supabase
          .from('smart_locks')
          .update({ 
            status: action === 'lock' ? 'locked' : 'unlocked',
            last_heartbeat: new Date().toISOString()
          })
          .eq('id', lockId);
        
        if (error) throw error;
      });

      toast({
        title: "Success",
        description: `Smart lock ${action}ed successfully`,
      });
      
      loadLocks(); // Refresh the data
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${action} smart lock: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return 'text-green-600';
    if (battery > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSignalIcon = (strength: number) => {
    if (strength >= 80) return <Wifi className="w-4 h-4 text-green-600" />;
    if (strength >= 50) return <Wifi className="w-4 h-4 text-blue-600" />;
    return <Wifi className="w-4 h-4 text-red-600" />;
  };

  const getSignalText = (strength: number) => {
    if (strength >= 80) return 'excellent';
    if (strength >= 50) return 'good';
    return 'poor';
  };

  const filteredLocks = locks.filter(lock => {
    const matchesSearch = lock.room?.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lock.lock_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lock.status === statusFilter;
    
    const matchesBattery = batteryFilter === 'all' ||
                          (batteryFilter === 'high' && lock.battery_level > 50) ||
                          (batteryFilter === 'medium' && lock.battery_level >= 20 && lock.battery_level <= 50) ||
                          (batteryFilter === 'low' && lock.battery_level < 20);
    
    return matchesSearch && matchesStatus && matchesBattery;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Smart Lock Status</h1>
        <p className="text-muted-foreground mt-1">Monitor and control smart lock devices across all rooms</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Smart Locks</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalLocks}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Online Locks</p>
                <p className="text-2xl font-bold text-foreground">{stats.onlineLocks}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Low Battery</p>
                <p className="text-2xl font-bold text-foreground">{stats.lowBattery}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Battery className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Offline/Error</p>
                <p className="text-2xl font-bold text-foreground">{stats.offlineError}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by room number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
              <SelectItem value="unlocked">Unlocked</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={batteryFilter} onValueChange={setBatteryFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Battery" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="high">High (50%+)</SelectItem>
              <SelectItem value="medium">Medium (20-50%)</SelectItem>
              <SelectItem value="low">Low (20% or less)</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Smart Lock Cards Grid */}
      {fetchLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocks.map((lock) => (
            <Card key={lock.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Room: {lock.room?.room_number}</CardTitle>
                  <Badge className={lock.status === 'locked' ? 'bg-green-100 text-green-800' : 
                                   lock.status === 'unlocked' ? 'bg-red-100 text-red-800' :
                                   'bg-gray-100 text-gray-800'}>
                    {lock.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Battery Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Battery:</span>
                  <div className="flex items-center gap-2">
                    <Battery className={`w-4 h-4 ${getBatteryColor(lock.battery_level)}`} />
                    <span className={`font-medium ${getBatteryColor(lock.battery_level)}`}>
                      {lock.battery_level}%
                    </span>
                  </div>
                </div>

                {/* Signal Strength */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Signal:</span>
                  <div className="flex items-center gap-2">
                    {getSignalIcon(lock.signal_strength)}
                    <span className="text-sm capitalize">{getSignalText(lock.signal_strength)}</span>
                  </div>
                </div>

                {/* Last Heartbeat */}
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Last Heartbeat:</span>
                  <p className="text-xs text-muted-foreground">
                    {new Date(lock.last_heartbeat).toLocaleString()}
                  </p>
                </div>

                {/* Error Status */}
                {lock.error_message && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">{lock.error_message}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant={lock.status === 'locked' ? 'outline' : 'default'}
                    className="flex-1"
                    onClick={() => handleLockAction(lock.id, 'lock')}
                    disabled={updateLoading || lock.status === 'offline' || lock.status === 'error'}
                  >
                    <Lock className="w-3 h-3 mr-1" />
                    Lock
                  </Button>
                  <Button 
                    size="sm" 
                    variant={lock.status === 'unlocked' ? 'outline' : 'default'}
                    className="flex-1"
                    onClick={() => handleLockAction(lock.id, 'unlock')}
                    disabled={updateLoading || lock.status === 'offline' || lock.status === 'error'}
                  >
                    <Unlock className="w-3 h-3 mr-1" />
                    Unlock
                  </Button>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  View Access Log
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};