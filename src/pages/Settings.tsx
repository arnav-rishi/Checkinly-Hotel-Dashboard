
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/hooks/useSettings';
import { SettingsActions } from '@/components/SettingsActions';
import { 
  Building2, 
  Users, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Save,
  RefreshCw,
  Loader2
} from 'lucide-react';

export const Settings = () => {
  const { saving, saveHotelSettings, saveNotificationSettings, loadHotelSettings, loadNotificationSettings } = useSettings();
  
  const [notifications, setNotifications] = useState({
    checkIns: true,
    payments: true,
    maintenance: false,
    security: true,
    lowBattery: true
  });

  const [hotelInfo, setHotelInfo] = useState({
    name: 'Grand Plaza Hotel',
    address: '123 Main Street, City, State 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@grandplaza.com',
    timezone: 'UTC-5 (Eastern)'
  });

  useEffect(() => {
    // Load settings on component mount
    setHotelInfo(loadHotelSettings());
    setNotifications(loadNotificationSettings());
  }, []);

  const handleSaveAllSettings = async () => {
    const hotelSaved = await saveHotelSettings(hotelInfo);
    const notificationsSaved = await saveNotificationSettings(notifications);
    
    if (hotelSaved && notificationsSaved) {
      // Additional success feedback is already handled in the hook
    }
  };

  const handleResetSettings = () => {
    const defaultNotifications = {
      checkIns: true,
      payments: true,
      maintenance: false,
      security: true,
      lowBattery: true
    };
    
    const defaultHotelInfo = {
      name: 'Grand Plaza Hotel',
      address: '123 Main Street, City, State 12345',
      phone: '+1 (555) 123-4567',
      email: 'info@grandplaza.com',
      timezone: 'UTC-5 (Eastern)'
    };

    setNotifications(defaultNotifications);
    setHotelInfo(defaultHotelInfo);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your hotel management system preferences</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button onClick={handleSaveAllSettings} disabled={saving} className="flex items-center gap-2">
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
        <Button variant="outline" onClick={handleResetSettings} disabled={saving} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Reset to Defaults
        </Button>
      </div>

      {/* Settings Actions Component - includes hotel settings and demo data */}
      <SettingsActions />

      {/* Notifications Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Check-in Notifications</p>
                <p className="text-sm text-muted-foreground">Get notified when guests check in</p>
              </div>
              <Switch 
                checked={notifications.checkIns}
                onCheckedChange={(checked) => setNotifications({...notifications, checkIns: checked})}
                disabled={saving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payment Alerts</p>
                <p className="text-sm text-muted-foreground">Receive payment confirmations</p>
              </div>
              <Switch 
                checked={notifications.payments}
                onCheckedChange={(checked) => setNotifications({...notifications, payments: checked})}
                disabled={saving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Maintenance Requests</p>
                <p className="text-sm text-muted-foreground">Maintenance issue notifications</p>
              </div>
              <Switch 
                checked={notifications.maintenance}
                onCheckedChange={(checked) => setNotifications({...notifications, maintenance: checked})}
                disabled={saving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Security Alerts</p>
                <p className="text-sm text-muted-foreground">Security-related notifications</p>
              </div>
              <Switch 
                checked={notifications.security}
                onCheckedChange={(checked) => setNotifications({...notifications, security: checked})}
                disabled={saving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Low Battery Warnings</p>
                <p className="text-sm text-muted-foreground">Smart lock battery alerts</p>
              </div>
              <Switch 
                checked={notifications.lowBattery}
                onCheckedChange={(checked) => setNotifications({...notifications, lowBattery: checked})}
                disabled={saving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">Default User Role</p>
              </div>
              <Select defaultValue="Staff" disabled={saving}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">Two-Factor Authentication</p>
              </div>
              <Switch defaultChecked disabled={saving} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">Audit Logging</p>
              </div>
              <Switch defaultChecked disabled={saving} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">Data Encryption</p>
              </div>
              <Switch defaultChecked disabled={saving} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
