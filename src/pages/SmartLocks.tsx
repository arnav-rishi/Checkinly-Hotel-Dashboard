
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeyRound, Battery, Wifi, Clock, Lock, Unlock, Loader2, Zap, Activity } from 'lucide-react';
import { useSmartLocks } from '@/hooks/useSmartLocks';
import { AddSmartLockModal } from '@/components/AddSmartLockModal';

export const SmartLocks = () => {
  const { smartLocks, loading, updating, updateLockStatus } = useSmartLocks();

  const getBatteryColor = (level?: number) => {
    if (!level) return 'bg-gray-400';
    if (level > 50) return 'bg-green-500';
    if (level > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSignalStrength = (strength?: number) => {
    if (!strength) return 'Poor';
    if (strength > 70) return 'Strong';
    if (strength > 40) return 'Medium';
    return 'Weak';
  };

  const getSignalIcon = (strength?: number) => {
    if (!strength || strength < 40) return 'text-red-500';
    if (strength < 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  const isOnline = (lastPing?: string) => {
    if (!lastPing) return false;
    const lastSeen = new Date(lastPing);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastSeen > fiveMinutesAgo;
  };

  const handleToggleLock = async (lockId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'locked' ? 'unlocked' : 'locked';
    try {
      await updateLockStatus(lockId, newStatus as 'locked' | 'unlocked');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Smart Locks</h1>
          <p className="text-muted-foreground mt-1">Monitor and control room smart locks</p>
        </div>
        <AddSmartLockModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {smartLocks.map((lock: any) => (
          <Card key={lock.id} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                Room {lock.rooms?.room_number || 'N/A'}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={isOnline(lock.last_ping) ? 'default' : 'secondary'}>
                  <Activity className="w-3 h-3 mr-1" />
                  {isOnline(lock.last_ping) ? 'Online' : 'Offline'}
                </Badge>
                <KeyRound className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lock Info */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Lock ID</span>
                <span className="text-sm font-medium">{lock.lock_id}</span>
              </div>

              {/* Lock Type */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <Badge variant="outline">
                  <Zap className="w-3 h-3 mr-1" />
                  {lock.type || 'NFC'}
                </Badge>
              </div>

              {/* Lock Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={lock.status === 'locked' ? 'default' : 'secondary'}>
                  {lock.status === 'locked' ? (
                    <Lock className="w-3 h-3 mr-1" />
                  ) : (
                    <Unlock className="w-3 h-3 mr-1" />
                  )}
                  {lock.status}
                </Badge>
              </div>

              {/* Battery Level */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Battery className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Battery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getBatteryColor(lock.battery_level)}`}
                      style={{ width: `${lock.battery_level || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{lock.battery_level || 0}%</span>
                </div>
              </div>

              {/* Signal Strength */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wifi className={`w-4 h-4 ${getSignalIcon(lock.signal_strength)}`} />
                  <span className="text-sm text-muted-foreground">Signal</span>
                </div>
                <span className="text-sm font-medium">
                  {getSignalStrength(lock.signal_strength)}
                </span>
              </div>

              {/* Last Heartbeat */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Last seen</span>
                </div>
                <span className="text-sm font-medium">
                  {lock.last_heartbeat 
                    ? new Date(lock.last_heartbeat).toLocaleTimeString()
                    : 'Never'
                  }
                </span>
              </div>

              {/* Last Ping */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Last ping</span>
                </div>
                <span className="text-sm font-medium">
                  {lock.last_ping 
                    ? new Date(lock.last_ping).toLocaleTimeString()
                    : 'Never'
                  }
                </span>
              </div>

              {/* Toggle Button */}
              <Button
                variant="outline"
                onClick={() => handleToggleLock(lock.id, lock.status)}
                disabled={updating || !isOnline(lock.last_ping)}
                className="w-full"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : lock.status === 'locked' ? (
                  <Unlock className="w-4 h-4 mr-2" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                {lock.status === 'locked' ? 'Unlock' : 'Lock'}
              </Button>

              {/* Error Message */}
              {lock.error_message && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  {lock.error_message}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {smartLocks.length === 0 && (
        <div className="text-center py-12">
          <KeyRound className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-foreground">No smart locks</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by adding your first smart lock to the system.
          </p>
          <div className="mt-4">
            <AddSmartLockModal />
          </div>
        </div>
      )}
    </div>
  );
};
